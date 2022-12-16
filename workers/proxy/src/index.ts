import HomeHtml from './home.html'

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
    if (url.host === `dl.${domain}`) {
      if (url.pathname === '/') {
        return new Response(renderTemplate(HomeHtml, {
          url: url.origin,
          hash: env.GIT_HASH,
        }), {
          status: 200,
          headers: { 'content-type': 'text/html;charset=utf-8' },
        })
      }
      else {
        const sourceUrl = url.href.replace(url.origin, '').substring(1).replace(/^(https?:)\/+/g, '$1//')
        try {
          const newSourceUrl = new URL(sourceUrl)
          const newRequest = getNewRequest(newSourceUrl, request)
          return proxy(newSourceUrl, newRequest)
        }
        catch (e) {
          return new Response(`${sourceUrl} is invalid url`, { status: 400 })
        }
      }
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
    ]
  return matches.some(match => url.pathname.includes(match))
}

/** 生成新的请求
 */
function getNewRequest(url: URL, request: Request) {
  const headers = new Headers(request.headers)
  headers.set('reason', 'mirror of China')
  const newRequestInit: RequestInit = { redirect: 'manual', headers }
  return new Request(url.toString(), new Request(request, newRequestInit))
}

/** 代理转发
 */
async function proxy(url: URL, request: Request) {
  try {
    const res = await fetch(url.toString(), request)
    const headers = res.headers
    const newHeaders = new Headers(headers)
    const status = res.status
    newHeaders.set('access-control-expose-headers', '*')
    newHeaders.set('access-control-allow-origin', '*')
    // Remove CSP
    newHeaders.delete('content-security-policy')
    newHeaders.delete('content-security-policy-report-only')
    newHeaders.delete('clear-site-data')
    return new Response(res.body, { status, headers: newHeaders })
  }
  catch (e: any) {
    return new Response(e.message, { status: 500 })
  }
}

/** 渲染模板
 */
function renderTemplate(content: string, data: Record<string, any>) {
  return content.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
    return data[key] || ''
  })
}
