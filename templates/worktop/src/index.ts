import { Router } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'

const API = new Router<Context>()

API.add('GET', '/', (_req, _context) => {
  return reply(200, new Date().toISOString())
})

API.add('GET', '/greet/:name', (_req, context) => {
  return new Response(`Hello, ${context.params.name}!`)
})

// Module Worker
export default start(API.run)
