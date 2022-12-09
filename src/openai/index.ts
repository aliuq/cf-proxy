import { Configuration, OpenAIApi } from 'openai'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import ChatHtml from './chat.html'

export interface Env {
  DOMAIN: string
  OPENAI_API_KEY: string
  OPENAI_COOKIE: string
}

const CHAT_BASE_URL = 'https://chat.openai.com'
let domainMaps: Record<string, string> = {}
let reverseDomainMaps: Record<string, string> = {}
let chatData: Record<string, any> = {}
const uas = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
]

export async function routeChatApi(url: URL, env: Env) {
  const prompt = url.searchParams.get('q')
  if (!prompt)
    return new Response('q is required', { status: 400 })

  const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
    baseOptions: {
      adapter: fetchAdapter,
    },
  })
  const openai = new OpenAIApi(configuration)

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.9,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })

    return new Response(response.data.choices[0].text, {
      status: 200,
      headers: { 'content-type': 'text/plain;charset=utf-8' },
    })
  }
  catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}

export async function routeChat() {
  return new Response(ChatHtml, {
    status: 200,
    headers: { 'content-type': 'text/html;charset=utf-8' },
  })
}

export async function routeFChat(url: URL, request: Request, env: Env) {
  // URL 映射表
  domainMaps = {
    '/fchat': '/',
    '/fchat/chat': '/chat',
    '/fchat/session': '/api/auth/session',
    '/fchat/conversation': '/backend-api/conversation',
    '/fchat/moderations': '/backend-api/moderations',
    '/fchat/models': '/backend-api/models',
  }
  reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map(arr => arr.reverse()))
  const newUrl = new URL(CHAT_BASE_URL)

  Object.keys(domainMaps).forEach((key: string) => {
    if (url.pathname.startsWith(key))
      newUrl.pathname = url.pathname.replace(new RegExp(`^${key}/?`, 'g'), domainMaps[key])
  })

  if (newUrl.port !== '80' && newUrl.port !== '443')
    newUrl.port = newUrl.protocol === 'https:' ? '443' : '80'

  const newRequest = await getNewRequest(newUrl, request, env)
  return proxyFChat(newUrl, newRequest, env, url)
}

async function getNewRequest(url: URL, request: Request, env: Env) {
  const headers = new Headers(request.headers)
  headers.set('cookie', `__Secure-next-auth.session-token=${env.OPENAI_COOKIE}`)
  headers.set('referer', 'https://chat.openai.com/chat')
  headers.set('origin', url.origin)
  headers.set('user-agent', uas[0])
  headers.set('host', CHAT_BASE_URL)
  const newRequestInit: RequestInit = { redirect: 'manual', headers }
  return new Request(url.toString(), new Request(request, newRequestInit))
}

async function proxyFChat(url: URL, request: Request, env: Env, oldUrl: URL) {
  try {
    // 判断是否需要权限验证
    if (url.pathname.startsWith('/backend-api')) {
      if (!chatData.accessToken) {
        request.headers.set('cache-control', 'no-cache')
        request.headers.delete('authorization')
        const accessUrl = new URL('/api/auth/session', CHAT_BASE_URL)
        await getAccessToken(accessUrl, request)
      }
      request.headers.set('authorization', `Bearer ${chatData.accessToken}`)
    }

    const res = await fetch(url.toString(), request)
    const headers = res.headers
    const newHeaders = new Headers(headers)
    const status = res.status

    // 处理重定向
    if (newHeaders.has('location')) {
      const loc = newHeaders.get('location')
      if (loc) {
        if (reverseDomainMaps[loc])
          newHeaders.set('location', reverseDomainMaps[loc])
      }
    }

    newHeaders.set('access-control-allow-origin', '*')

    if (res.headers.get('content-type')?.indexOf('text/html') !== -1) {
      const body = await res.text()
      const newBody = body
        // href=""
        .replace(/href=\"\/(.*?)\"/g, 'href="/fchat/$1"')
        // src=""
        .replace(/src=\"\/(.*?)\"/g, 'src="/fchat/$1"')
      return new Response(newBody, { status, headers: newHeaders })
    }
    else if (res.headers.get('content-type')?.indexOf('application/javascript') !== -1) {
      if (res.url?.indexOf('_next/static/chunks') !== -1) {
        const body = await res.text()
        const cUrl = new URL(oldUrl)
        cUrl.pathname = 'fchat/backend-api'
        const newBody = body.replace(/https:\/\/chat\.openai\.com\/backend-api/g, cUrl.toString())
        return new Response(newBody, { status, headers: newHeaders })
      }
    }

    return new Response(res.body, { status, headers: newHeaders })
  }
  catch (error: any) {
    return new Response(error.message, { status: 500 })
  }
}

async function getAccessToken(url: URL, request: Request) {
  if (!chatData.accessToken) {
    const res = await fetch(url.toString(), request)
    chatData = await res.json()
  }
  return chatData
}
