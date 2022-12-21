import type { CreateCompletionRequest } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import { getDomainAndSubdomain, needCancelRequest, replyText, replyUnsupport } from '../../utils'
import ChatHtml from './chat.html'

export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return needCancel

    const url = new URL(request.url)

    if (url.pathname === '/robots.txt')
      return replyText('User-agent: *\nDisallow: /', env)

    const { domain } = getDomainAndSubdomain(request)

    if (url.host === domain) {
      if (url.pathname === '/chat' || url.pathname === '/fchat') {
        const newUrl = new URL(url.toString())
        newUrl.host = url.pathname === '/chat' ? `chat.${domain}` : `fchat.${domain}`
        newUrl.pathname = '/'
        return Response.redirect(newUrl.toString(), 301)
      }
    }

    if (url.pathname === '/')
      return new Response(ChatHtml, { status: 200, headers: { 'content-type': 'text/html;charset=utf-8' } })
    else if (url.pathname === '/api')
      return await handlerApi(url, env)

    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env)
  },
}

async function handlerApi(url: URL, env: ENV) {
  const prompt = url.searchParams.get('q')
  if (!prompt)
    return replyText('Missing query parameter: q', env)

  const configuration = new Configuration({
    apiKey: env.OPENAI_API_KEY,
    baseOptions: {
      adapter: fetchAdapter,
    },
  })
  const openai = new OpenAIApi(configuration)

  try {
    const params: CreateCompletionRequest = {
      model: 'text-davinci-003',
      prompt,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [' Human:', ' AI:'],
    }
    const response = await openai.createCompletion(params)
    return replyText(response.data.choices[0].text as string, env)
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error.response?.data?.error?.message)
    const status = error.response?.status || 500
    return replyText('', env, { status })
  }
}

// Errors JSON Array
// [
//   {
//     "code": 401,
//     "msg": "Incorrect API key provided: sk-qJ9nq***************************************z1RR. You can find your API key at https://beta.openai.com."
//   },
//   {
//     "code": 429,
//     "msg": "Your access was terminated due to violation of our policies, please check your email for more information. If you believe this is in error and would like to appeal, please contact support@openai.com."
//  },
//   {
//     "code": 429,
//     "msg": "You exceeded your current quota, please check your plan and billing details."
//   }
// ]
