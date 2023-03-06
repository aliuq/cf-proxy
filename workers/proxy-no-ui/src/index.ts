import type { Method } from 'worktop'
import { Router, compose } from 'worktop'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'
import * as Proxy from './middleware/proxy'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init(),
  Proxy.create,
)

// 常见的 HTTP 类型，参考：https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods
const methods: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

methods.forEach((method: Method) => {
  API.add(method, '/*', async (req, context) => {
    const newUrl = context.url.href
      .replace(context.url.origin, '')
      .substring(1)
      .replace(/^(https?:)\/+/g, '$1//')

    return context.$proxy.run(newUrl, req)
  })
})

export default start(API.run)
