/**
 * Description: Short domain worker
 * Routes:
 *  - `/new?url=URL`: 创建新的短网址
 *  - `/all`: 获取所有短网址
 *  - `/{short}`: 重定向到原始域名
 */

import { getDomainAndSubdomain, needCancelRequest, replyHtml, replyJson, replyText, replyUnsupport } from '../../utils'
import NewUI from './new.html'
import ManageUI from './manage.html'

export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return needCancel

    const url = new URL(request.url)
    if (url.pathname === '/robots.txt')
      return replyText('User-agent: *\nDisallow: /', env)

    const { domain } = getDomainAndSubdomain(request)

    const pathnameArr = url.pathname.slice(1).split('/')
    if (pathnameArr.length === 1) {
      const maps: Record<string, Function> = {
        '': () => {
          const isLogin = !!checkAuthorization(request, env, false)
          return replyHtml(NewUI, env, { headers: { 'Set-Cookie': `auth=${isLogin}; path=/;` } })
        },
        'admin': async () => {
          const valid = checkAuthorization(request, env)
          if (valid && typeof valid !== 'boolean')
            return valid
          return replyHtml(ManageUI, env)
        },
      }
      const handler = maps[pathnameArr[0]]
      if (handler)
        return await handler()
      else
        return await handlerRedirect(pathnameArr[0], env)
    }
    else if (pathnameArr.length === 2 && pathnameArr[0] === 'api') {
      const apiMaps: Record<string, Function> = {
        list: handlerApiList,
        new: handlerApiNew,
        delete: handlerApiDelete,
      }
      const handler = apiMaps[pathnameArr[1]]
      if (handler)
        return await handler(request, env, domain)
      else
        return replyJson({ code: -1, message: `api [/api/${pathnameArr[1]}] not found` }, env)
    }

    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env)
  },
}

/** 生成随机字符串 */
function randomString(length: number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

/** 获取列表 */
async function handlerApiList(request: Request, env: ENV, domain: string) {
  const valid = checkAuthorization(request, env)
  if (valid && typeof valid !== 'boolean')
    return valid
  if (request.method !== 'POST')
    return replyJson({ error: `method [${request.method}] not allowed` }, env)

  const body: Record<string, string> = await request.json()
  const cursor = body.cursor

  const list = await env.SHORTURLS.list({ prefix: 'md5:', limit: 500, cursor })
  const result = await Promise.all(list.keys.map(async (key) => {
    const value = await env.SHORTURLS.get(key.name)
    const decodeValue = value ? decodeURIComponent(value) : ''
    const [id, url] = decodeValue.split('|||')
    return {
      id,
      short: getShortUrl(request, id, domain),
      source: url,
    }
  }))

  return replyJson({ data: result, cursor: list.list_complete ? '' : list.cursor }, env)
}

/** 添加短网址 */
async function handlerApiNew(request: Request, env: ENV, domain: string) {
  try {
    if (request.method !== 'POST')
      return replyJson({ error: `method [${request.method}] not allowed` }, env)

    const body: Record<string, string> = await request.json()
    const url = body.url ? decodeURIComponent(body.url) : ''
    if (!url)
      return replyJson({ error: '缺少 url 参数' }, env)

    const newUrl = new URL(url)
    const decodeUrl = decodeURIComponent(newUrl.toString())
    const md5 = await getMD5(decodeUrl)

    const exist = await env.SHORTURLS.get(`md5:${md5}`)
    if (!exist) {
      const isAuth = !!checkAuthorization(request, env, false)
      const short = isAuth && body.id ? body.id : randomString(6)
      await env.SHORTURLS.put(`md5:${md5}`, `${short}|||${decodeUrl}`)
      await handlerIdMd5Maps(env, short, md5)
      const shortUrl = getShortUrl(request, short, domain)
      return replyJson({ code: 0, data: { short: shortUrl, source: decodeUrl } }, env)
    }
    else {
      const [short] = exist.split('|||')
      const shortUrl = getShortUrl(request, short, domain)
      return replyJson({ code: -1, message: 'url 已经存在', data: { short: shortUrl, source: decodeUrl } }, env)
    }
  }
  catch (e: any) {
    return replyJson({ code: -1, message: e.message }, env)
  }
}

/** 删除短网址 */
async function handlerApiDelete(request: Request, env: ENV) {
  const valid = checkAuthorization(request, env)
  if (valid && typeof valid !== 'boolean')
    return valid
  if (request.method !== 'POST')
    return replyJson({ error: `method [${request.method}] not allowed` }, env)

  const body: Record<string, string> = await request.json()
  const url = body.url ? decodeURIComponent(body.url) : ''
  if (!url)
    return replyJson({ error: '缺少 url 参数' }, env)

  const md5 = await getMD5(url)
  const exist = await env.SHORTURLS.get(`md5:${md5}`)
  if (!exist)
    return replyJson({ error: `[${url}] not found` }, env)

  await env.SHORTURLS.delete(`md5:${md5}`)

  const [id] = exist.split('|||')
  await handlerIdMd5Maps(env, id)

  return replyJson({ message: '删除成功' }, env)
}

/** 处理 ID 和 MD5 的映射关系
 *
 * + KV 的 key 为 `id_md5_maps`, value 为 JSON 字符串, `{ id: md5 }`
 * + 当 id 和 md5 都存在时，添加映射关系
 * + 当 id 存在，md5 不存在时，删除映射关系
 * + 当 id 和 md5 都不存在时，返回映射关系
 */
async function handlerIdMd5Maps(env: ENV, id?: string, md5?: string) {
  const idMd5MapsStr = await env.SHORTURLS.get('id_md5_maps')
  const idMd5Maps = idMd5MapsStr ? JSON.parse(idMd5MapsStr) : {}
  if (id && md5) {
    idMd5Maps[id] = md5
  }
  else if (id && !md5) {
    if (!Object.keys(idMd5Maps).length)
      return
    delete idMd5Maps[id]
  }
  else if (!id && !md5) {
    return idMd5Maps
  }

  await env.SHORTURLS.put('id_md5_maps', JSON.stringify(idMd5Maps))
}

/** 处理短网址重定向 */
async function handlerRedirect(id: string, env: ENV) {
  const idMd5Maps = await handlerIdMd5Maps(env) || {}
  const md5 = idMd5Maps[id]
  if (!md5)
    return replyJson({ error: `[${id}] not found` }, env)

  const exist = await env.SHORTURLS.get(`md5:${md5}`)
  if (exist) {
    const url = exist.split('|||')[1]
    return Response.redirect(decodeURIComponent(url), 301)
  }
  else {
    return replyJson({ error: `[${id}] not found` }, env)
  }
}

/** 校验 Authorization，未通过则跳转到登录页面 */
function checkAuthorization(request: Request, env: ENV, need401 = true) {
  const authorization = request.headers.get('Authorization')
  if (!authorization && need401) {
    return new Response(null, {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"',
      },
    })
  }
  else if (authorization) {
    const str = atob(authorization.split(' ')[1])
    const [username, password] = str.split(':')
    const isValid = username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD
    if (!isValid && need401) {
      return new Response(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"',
        },
      })
    }
    else {
      return isValid
    }
  }
  return false
}

/** 计算 URL 的 MD5 值 */
async function getMD5(url: string) {
  return crypto.subtle.digest('MD5', new TextEncoder().encode(url)).then((hash) => {
    return hex(hash)
  })
}

function hex(buffer: ArrayBuffer) {
  const hexCodes = []
  const view = new DataView(buffer)
  for (let i = 0; i < view.byteLength; i += 4) {
    // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
    const value = view.getUint32(i)
    // toString(16) will give the hex representation of the number without padding
    const stringValue = value.toString(16)
    // We use concatenation and slice for padding
    const padding = '00000000'
    const paddedValue = (padding + stringValue).slice(-padding.length)
    hexCodes.push(paddedValue)
  }

  // Join all the hex strings into one
  return hexCodes.join('')
}

function getShortUrl(request: Request, id: string, domain: string) {
  const url = new URL(request.url)
  const protocol = url.protocol === 'https:' ? 'https' : 'http'
  return `${protocol}://s.${domain}/${id}`
}
