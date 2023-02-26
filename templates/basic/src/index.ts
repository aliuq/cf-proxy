// @ts-expect-error it is a template
import { needCancelRequest, replyText, replyUnsupport } from '../../utils'

export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return needCancel

    const url = new URL(request.url)
    if (url.pathname === '/robots.txt')
      return replyText('User-agent: *\nDisallow: /', env)

    // TODO: Do something

    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env)
  },
}
