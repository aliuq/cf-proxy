import { getDomainAndSubdomain, needCancelRequest, replyText, replyUnsupport } from '../../utils'

export default {
  async fetch(request: Request, env: ENV, _ctx: ExecutionContext): Promise<Response> {
    const needCancel = await needCancelRequest(request)
    if (needCancel)
      return needCancel

    const url = new URL(request.url)

    if (url.pathname === '/robots.txt')
      return replyText('User-agent: *\nDisallow: /', env)

    const { subdomain } = getDomainAndSubdomain(request)
    if (subdomain === 'ip' && url.pathname === '/')
      return replyText(request.headers.get('cf-connecting-ip') as string, env)

    return replyUnsupport(request, env)
  },
}
