import { reply } from 'worktop/response'
import type { Context, Handler } from '../types'
import { getDomainAndSubdomain } from '../util'

export interface InitOptions {
  robots?: Context['robots']
  robotsOoverride?: boolean
  disablePaths?: Context['disablePaths']
  disablePathsOoverride?: boolean
}

export const init = (options: InitOptions = {}): Handler => {
  const {
    robots = [],
    robotsOoverride = false,
    disablePaths = [],
    disablePathsOoverride = false,
  } = options
  return async function (req, context) {
    context.url ||= new URL(req.url)

    // Set internal environment variables
    context.defer(async (res) => {
      res.headers.set('X-hash', context.bindings.GIT_HASH)
      res.headers.set('X-version', context.bindings.VERSION)
    })

    // Generate disallow robots.txt
    if (context.url.pathname === '/robots.txt') {
      context.robots = robotsOoverride ? robots : ['User-agent: *', 'Disallow: /', ...robots]
      return reply(200, context.robots.join('\n'))
    }

    // Disable paths
    context.disablePaths = disablePathsOoverride ? disablePaths : ['/favicon.', '/sw.js', ...disablePaths]
    const match = context.disablePaths.some((path: string | RegExp) => context.url.pathname.match(path))
    if (match)
      return reply(204)

    // Set domain and subdomain
    const { domain, subdomain } = getDomainAndSubdomain(req)
    context.domain = domain
    context.subdomain = subdomain
  }
}
