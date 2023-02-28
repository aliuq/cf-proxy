import { Router, compose } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init(),
)

API.add('GET', '/', (req, _context) => {
  return reply(200, req.headers.get('cf-connecting-ip'))
})

// Module Worker
export default start(API.run)

