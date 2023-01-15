import type { CreateCompletionRequest, CreateModerationResponseResultsInnerCategories } from 'openai'
import { Configuration, OpenAIApi } from 'openai'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import { getDomainAndSubdomain, needCancelRequest, replyHtml, replyJson, replyText, replyUnsupport } from '../../utils'
import ChatHtml from './chat.html'
import config from './default.config'

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
      return replyHtml(ChatHtml, env)
    else if (url.pathname === '/api')
      return await handlerApi(url, env)

    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env)
  },
}

async function handlerApi(url: URL, env: ENV) {
  const prompt = url.searchParams.get('q')
  if (!prompt)
    return replyText('Missing query parameter: q', env)

  const openai = await initOpenAI(env)
  try {
    const moderation = await checkModeration(openai, prompt)
    if (moderation)
      return replyJson({ code: -1, text: moderation }, env)

    const params: CreateCompletionRequest = Object.assign({}, config.conversation.chat, { prompt, user: 'aliuq' })
    const { data } = await openai.createCompletion(params)
    return replyJson({ code: 0, text: data.choices[0].text }, env)
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(error.response?.data?.error?.message)
    const status = error.response?.status || 500
    return replyText('', env, { status })
  }
}

/** 初始化 OpenAI 实例 */
async function initOpenAI(env: ENV) {
  return new OpenAIApi(new Configuration({
    apiKey: env.OPENAI_API_KEY,
    baseOptions: { adapter: fetchAdapter },
  }))
}

/** 判断输入的文本是否违反了 OpenAI 的内容策略，防止被封号 */
async function checkModeration(openai: OpenAIApi, input: string) {
  try {
    const { data } = await openai.createModeration({ model: 'text-moderation-latest', input })
    const { flagged, categories } = data.results[0]
    // 违反内容策略
    if (flagged) {
      const maps: Record<Categories, string> = {
        'hate': '表达、煽动或促进基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓的仇恨的内容',
        'hate/threatening': '还包括对目标群体的暴力或严重伤害的仇恨性内容',
        'self-harm': '倡导、鼓励或描述自我伤害行为的内容，如自杀、切割和饮食紊乱',
        'sexual': '旨在引起性兴奋的内容，如对性活动的描述，或促进性服务的内容（不包括性教育和健康）',
        'sexual/minors': '包括未满18岁的人的性内容',
        'violence': '宣扬或美化暴力或赞美他人的痛苦或羞辱的内容',
        'violence/graphic': '描绘死亡、暴力或严重身体伤害的暴力内容，其画面感极强',
      }
      const text: string[] = []
      Object.keys(categories).forEach((key) => {
        if (!categories[key as Categories])
          text.push(maps[key as Categories])
      })

      const mdtext = [
        '# 违反内容策略',
        '',
        text.map((item: string, index: number) => `${index + 1} ${item}`).join('\n'),
      ].join('\n')

      return mdtext
    }

    return ''
  }
  catch (error: any) {
    return error.response?.data?.error?.message || error.message || ''
  }
}

type Categories = keyof CreateModerationResponseResultsInnerCategories
