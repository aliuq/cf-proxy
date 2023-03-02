import { Router } from 'worktop'
import { reply } from 'worktop/response'
import { body } from 'worktop/utils'
import { MD5 } from 'worktop/crypto'
import type { Context, ShortUrl } from '../types'
import * as Model from '../model'
import { randomString } from '../util'

export const Short = new Router<Context>()

Short.prepare = (req, context) => {
  context.$ids = context.$ids || new Model.Ids(context.bindings.SHORTURLS)
  context.$md5s = context.$md5s || new Model.Md5s(context.bindings.SHORTURLS)
}

/**
 * /api/new
 */
Short.add('POST', '/new', async (req, context) => {
  try {
    const params = await body<{ url: string; id?: ShortUrl['id'] }>(req)
    if (!params?.url)
      return reply(400, 'Bad Request')

    const url = new URL(decodeURIComponent(params.url.toString()))
    const md5 = await MD5(url.toString())
    const exist = await context.$md5s.get(md5)
    if (exist) {
      return reply(200, { data: exist, msg: 'Already exists', code: 0 })
    }
    else {
      let id: ShortUrl['id'] = randomString()
      if (context.isLogin && params.id)
        id = params.id

      const data = { id, md5, source: url.toString() }
      await context.$ids.put(id, data)
      return reply(200, { data, msg: 'OK', code: 0 })
    }
  }
  catch (err: any) {
    return reply(400, `Failed: ${err.message}`)
  }
})

// 创建随机数据
// Short.add('POST', '/random', async (req, context) => {
//   try {
//     const len = 1000
//     for await (const n of Array.from({ length: len }).map((_, i) => i + 1)) {
//       const id = randomString(6)
//       const url = `https://twitter.com/${n}`
//       const md5 = await MD5(url)
//       const data = { id, md5, source: url }
//       await context.$ids.put(id, data)
//     }
//     return reply(200, { data: null, msg: 'OK', code: 0 })
//   }
//   catch (err: any) {
//     return reply(400, `Bad Request: ${err.message}`)
//   }
// })

/**
 * /api/list
 */
Short.add('POST', '/list', async (req, context) => {
  try {
    if (!context.isLogin)
      return reply(401, 'Unauthorized')

    const list = (await context.$ids.list()).map(l => l.slice(1))
    return reply(200, { data: list, msg: 'OK', code: 0 })
  }
  catch (err: any) {
    return reply(400, `Failed: ${err.message}`)
  }
})

/**
 * /api/list/detail
 */
Short.add('POST', '/list/detail', async (req, context) => {
  try {
    if (!context.isLogin)
      return reply(401, 'Unauthorized')

    const params = await body<{ ids: ShortUrl['id'][] }>(req)
    if (!params?.ids)
      return reply(400, 'Bad Request')

    const list = await Promise.all(params.ids.map(id => context.$ids.get(id)))
    return reply(200, { data: list, msg: 'OK', code: 0 })
  }
  catch (err: any) {
    return reply(400, `Failed: ${err.message}`)
  }
})

/**
 * /api/delete
 */
Short.add('POST', '/delete', async (req, context) => {
  try {
    if (!context.isLogin)
      return reply(401, 'Unauthorized')

    const params = await body<{ id: ShortUrl['id'] }>(req)
    if (!params?.id)
      return reply(400, 'Bad Request')

    await context.$ids.delete(params.id)
    return reply(200, { data: null, msg: 'OK', code: 0 })
  }
  catch (err: any) {
    return reply(400, `Failed: ${err.message}`)
  }
})

