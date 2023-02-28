import { Router, compose } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init(),
)

API.add('GET', '/', (_req, _context) => {
  return reply(200, 'ok')
})

export default start(API.run)
