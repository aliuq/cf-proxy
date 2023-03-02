import { reply } from 'worktop/response'
import type { Handler } from '../types'

export const load: Handler = async function (req, context) {
  const auth = req.headers.get('Authorization')
  context.isLogin = false
  if (auth) {
    const str = atob(auth.split(' ')[1])
    const [username, password] = str.split(':')
    context.isLogin = username === context.bindings.ADMIN_USERNAME
     && password === context.bindings.ADMIN_PASSWORD
  }
}

export const identify: Handler = async function (req, context) {
  if (context.isLogin)
    return
  return reply(401, 'Unauthorized', {
    'WWW-Authenticate': 'Basic realm="Restricted", charset="UTF-8"',
  })
}
