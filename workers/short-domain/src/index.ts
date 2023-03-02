import { Router, compose } from 'worktop'
import { reply } from 'worktop/response'
import { start } from 'worktop/cfw'
import type { Context } from './types'
import * as Middleware from './middleware'
import * as Auth from './middleware/auth'
import NewUI from './new.html'
import ManageUI from './manage.html'
import { Short } from './routes/api'
import * as Model from './model'
import { renderTemplate } from './util'

const API = new Router<Context>()

API.prepare = compose(
  Middleware.init(),
  Auth.load,
)

API.add('GET', '/', (_req, context) => {
  return reply(200, renderTemplate(NewUI, context.bindings), {
    'Content-Type': 'text/html;charset=utf-8',
    'Set-Cookie': `auth=${context.isLogin}; path=/;`,
  })
})

API.add('GET', '/admin', async (req, context) => {
  const tmp = await compose(Auth.identify)(req, context)
  if (tmp instanceof Response)
    return tmp

  return reply(200, ManageUI, {
    'Content-Type': 'text/html;charset=utf-8',
  })
})

/**
 * /:id
 */
API.add('GET', '/:id', async (req, context) => {
  context.$ids = context.$ids || new Model.Ids(context.bindings.SHORTURLS)
  const data = await context.$ids.get(context.params.id)
  if (!data)
    return reply(404, 'Not Found')

  return reply(302, '', { Location: data.source })
})

API.mount('/api/', Short)

export default start(API.run)
