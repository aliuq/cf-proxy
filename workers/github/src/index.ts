/**
 * Proxy list, e.g. `my.domain`
 *
 * | Proxy | Hostname |
 * |:---------|:---------|
 * | hub.my.domain | github.com |
 * | raw.my.domain | raw.githubusercontent.com |
 * | assets.my.domain | github.githubassets.com |
 * | download.my.domain | codeload.github.com |
 * | object.my.domain | objects.githubusercontent.com |
 * | media.my.domain | media.githubusercontent.com |
 * | gist.my.domain | gist.github.com |
 */

let domainMaps: Record<string, string> = {}
let reverseDomainMaps: Record<string, string> = {}
export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return new Response('', { status: 204 })

    const url = new URL(request.url)
    const { domain, subdomain } = getDomainAndSubdomain(request)

    if (url.pathname === '/robots.txt')
      return new Response('User-agent: *\nDisallow: /', { status: 200 })

    // ============ 逻辑处理 ============
    //
    //
    domainMaps = {
      [`hub.${domain}`]: 'github.com',
      [`assets.${domain}`]: 'github.githubassets.com',
      [`raw.${domain}`]: 'raw.githubusercontent.com',
      [`download.${domain}`]: 'codeload.github.com',
      [`object.${domain}`]: 'objects.githubusercontent.com',
      [`media.${domain}`]: 'media.githubusercontent.com',
      [`avatars.${domain}`]: 'avatars.githubusercontent.com',
      [`gist.${domain}`]: 'gist.github.com',
    }
    reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map(arr => arr.reverse()))

    if (url.host in domainMaps) {
      url.host = domainMaps[url.host]
      if (url.port !== '80' && url.port !== '443')
        url.port = url.protocol === 'https:' ? '443' : '80'

      const newRequest = getNewRequest(url, request)
      return proxy(url, newRequest, env)
    }

    return new Response(`Unsupported domain ${subdomain ? `${subdomain}.` : ''}${domain}`, {
      status: 200,
      headers: { 'content-type': 'text/plain;charset=utf-8', 'git-hash': env.GIT_HASH },
    })
  },
}

/** Get domain and subdomain from request url
 */
function getDomainAndSubdomain(request: Request): { domain: string; subdomain: string } {
  const url = new URL(request.url)
  const hostArr = url.host.split('.')
  let subdomain = ''
  let domain = ''
  if (hostArr.length > 2) {
    subdomain = hostArr[0]
    domain = hostArr.slice(1).join('.')
  }
  else if (hostArr.length === 2) {
    subdomain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[0] : ''
    domain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[1] : hostArr.join('.')
  }
  else {
    domain = hostArr.join('.')
  }
  return { domain, subdomain }
}

/** 需要终止请求
 * @param request
 * @returns true: 需要终止请求
 */
async function needCancelRequest(request: Request, matches: string[] = []): Promise<boolean> {
  const url = new URL(request.url)
  matches = matches.length
    ? matches
    : [
      '/favicon.',
      '/sw.js',
      '/login',
      '/join',
      '/session',
      '/auth',
    ]
  return matches.some(match => url.pathname.includes(match))
}

/** 生成新的 request
 */
function getNewRequest(url: URL, request: Request) {
  const headers = new Headers(request.headers)
  headers.set('reason', 'mirror of China')
  const newRequestInit: RequestInit = { redirect: 'manual', headers }
  return new Request(url.toString(), new Request(request, newRequestInit))
}

/** 代理转发处理
 */
async function proxy(url: URL, request: Request, _env: ENV) {
  try {
    const res = await fetch(url.toString(), request)
    const headers = res.headers
    const newHeaders = new Headers(headers)
    const status = res.status

    if (newHeaders.has('location')) {
      const loc = newHeaders.get('location')
      if (loc) {
        try {
          const locUrl = new URL(loc)
          if (locUrl.host in reverseDomainMaps) {
            locUrl.host = reverseDomainMaps[locUrl.host]
            newHeaders.set('location', locUrl.toString())
          }
        }
        catch (e) {
          console.error(e)
        }
      }
    }

    newHeaders.set('access-control-expose-headers', '*')
    newHeaders.set('access-control-allow-origin', '*')

    newHeaders.delete('content-security-policy')
    newHeaders.delete('content-security-policy-report-only')
    newHeaders.delete('clear-site-data')

    if (res.headers.get('content-type')?.indexOf('text/html') !== -1) {
      const body = await res.text()
      const regAll = new RegExp(Object.keys(reverseDomainMaps).map((r: string) => `(https?://${r})`).join('|'), 'g')
      const newBody = body
      // Replace all hostname to proxy domain
        .replace(regAll, (match) => {
          return match.replace(/^(https?:\/\/)(.*?)$/g, (m, p1, p2) => {
            return reverseDomainMaps[p2] ? `${p1}${reverseDomainMaps[p2]}` : m
          })
        })
      // Avoid integrity error
        .replace(/integrity=\".*?\"/g, '')

      return new Response(newBody, { status, headers: newHeaders })
    }
    return new Response(res.body, { status, headers: newHeaders })
  }
  catch (e: any) {
    return new Response(e.message, { status: 500 })
  }
}
