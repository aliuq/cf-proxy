import { Router, compose } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'
import * as Proxy from './middleware/proxy'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init({
    disablePaths: ['/login', '/join', '/session', '/auth', '/signup'],
  }),
  Proxy.create,
)

API.add('GET', '*', (req, context) => {
  const prefix = context.bindings.PREFIX ? `-${context.bindings.PREFIX}` : ''
  const domainMaps = {
    [`hub${prefix}.${context.domain}`]: 'github.com',
    [`assets${prefix}.${context.domain}`]: 'github.githubassets.com',
    [`raw${prefix}.${context.domain}`]: 'raw.githubusercontent.com',
    [`download${prefix}.${context.domain}`]: 'codeload.github.com',
    [`object${prefix}.${context.domain}`]: 'objects.githubusercontent.com',
    [`media${prefix}.${context.domain}`]: 'media.githubusercontent.com',
    [`avatars${prefix}.${context.domain}`]: 'avatars.githubusercontent.com',
    [`gist${prefix}.${context.domain}`]: 'gist.github.com',
  }
  const reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map(arr => arr.reverse()))

  const url: URL = new URL(req.url)
  if (url.host in domainMaps) {
    url.host = domainMaps[url.host]
    if (url.port !== '80' && url.port !== '443')
      url.port = url.protocol === 'https:' ? '443' : '80'

    return context.$proxy.run(url, req, {
      updateLocation(location) {
        const locUrl = new URL(location)
        if (locUrl.host in reverseDomainMaps) {
          locUrl.host = reverseDomainMaps[locUrl.host]
          return locUrl.toString()
        }
        return location
      },
      async updatePostResponse(response, newHeaders) {
        if (newHeaders.get('content-type')?.includes('text/html')) {
          const body = await response.text()
          const regAll = new RegExp(Object.keys(reverseDomainMaps)
            .map((r: string) => `(https?://${r})`)
            .join('|'), 'g')

          const newBody = body
            // Replace all hostname to proxy domain
            .replace(regAll, (match) => {
              return match.replace(/^(https?:\/\/)(.*?)$/g, (m, p1, p2) => {
                return reverseDomainMaps[p2] ? `${p1}${reverseDomainMaps[p2]}` : m
              })
            })
            // Avoid integrity error
            .replace(/integrity=\".*?\"/g, '')

          newHeaders.set('content-length', newBody.length.toString())
          return new Response(newBody, { status: response.status, headers: newHeaders })
        }
      },
    })
  }

  return reply(404, 'Not Found')
})

export default start(API.run)
