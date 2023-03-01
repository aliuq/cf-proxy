import { Router, compose } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'
import * as Proxy from './middleware/proxy'
import HomeHtml from './home.html'
import { renderTemplate } from './util'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init(),
  Proxy.create,
)

API.add('GET', '/', (req, context) => {
  const url = new URL(req.url)
  return reply(200,
    renderTemplate(HomeHtml, {
      url: url.origin,
      version: context.bindings.VERSION,
    }),
    { 'content-type': 'text/html;charset=utf-8' },
  )
})

API.add('GET', '/*', async (req, context) => {
  const newUrl = context.url.href
    .replace(context.url.origin, '')
    .substring(1)
    .replace(/^(https?:)\/+/g, '$1//')

  return context.$proxy.run(newUrl, req)
})

export default start(API.run)
