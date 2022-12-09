import { Configuration, OpenAIApi } from 'openai'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import ChatHtml from './chat.html'

export interface Env {
  OPENAI_API_KEY: string
}

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
