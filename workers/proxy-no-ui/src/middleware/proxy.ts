import { reply } from 'worktop/response'
import type { GenNewHeadersOptions, GenNewRequestOptions, Handler, RunOptions } from '../types'
import { maybePromise } from '../util'

export const create: Handler = (_req, context) => {
  context.$proxy = {
    genNewHeaders: (sourceHeaders: Headers | Request | Response, options: GenNewHeadersOptions = {}): Headers => {
      const { headers = {}, override = false } = options

      const defaultHeadersObject: Record<string, string> = {
        reason: 'mirror of China',
      }

      if (sourceHeaders instanceof Request) {
        const request = sourceHeaders
        sourceHeaders = new Headers(request.headers)

        const url = new URL(request.url)
        defaultHeadersObject.referer = url.origin
        defaultHeadersObject.origin = url.origin
        defaultHeadersObject.host = url.host
      }
      else if (sourceHeaders instanceof Response) {
        const response = sourceHeaders
        sourceHeaders = new Headers(response.headers)

        defaultHeadersObject['access-control-expose-headers'] = '*'
        defaultHeadersObject['access-control-allow-origin'] = '*'

        if (!options.override) {
          sourceHeaders.delete('content-security-policy')
          sourceHeaders.delete('content-security-policy-report-only')
          sourceHeaders.delete('clear-site-data')
        }
      }
      else {
        sourceHeaders = new Headers(sourceHeaders)
      }

      const headersObject = override ? headers : Object.assign({}, defaultHeadersObject, headers)

      const targetHeaders = new Headers(sourceHeaders)

      for (const [key, value] of Object.entries(headersObject))
        targetHeaders.set(key, String(value))

      return targetHeaders
    },
    genNewRequest: (sourceRequest: Request, url: URL | string, options: GenNewRequestOptions = {}) => {
      const newHeaders = context.$proxy.genNewHeaders(sourceRequest, {
        override: options.overrideHeaders,
        headers: options.headers,
      })

      const defaultRequestInit: RequestInit = {
        redirect: 'manual',
        headers: newHeaders,
      }

      url = url instanceof URL ? url.toString() : url

      const requestInit: RequestInit = options.overrideRequestInit
        ? (options.requestInit || {})
        : { ...defaultRequestInit, ...(options.requestInit || {}) }

      return new Request(
        url,
        new Request(sourceRequest, requestInit) as RequestInit,
      )
    },
    run: async (newURL, sourceRequest, options: RunOptions = {}) => {
      try {
        newURL = newURL instanceof URL ? newURL : new URL(newURL)
        const newRequest = context.$proxy.genNewRequest(sourceRequest, newURL, options)
        const res = await fetch(newURL.toString(), newRequest as RequestInit)
        const resHeadersObject: Record<string, string> = {}

        if (res.headers.has('location')) {
          const location = res.headers.get('location')
          if (location && options.updateLocation)
            resHeadersObject.location = await maybePromise(options.updateLocation(location))
          else
            resHeadersObject.location = `${context.url.origin}/${location}`
        }

        let newHeaders = context.$proxy.genNewHeaders(res, {
          headers: Object.assign({}, res.headers, resHeadersObject, options.headers || {}),
          override: options.overrideHeaders,
        })

        if (options.updatePostHeaders)
          newHeaders = await maybePromise(options.updatePostHeaders(newHeaders, res.headers))

        if (options.updatePostResponse) {
          const tmp = await maybePromise(options.updatePostResponse(res, newHeaders))
          if (tmp instanceof Response)
            return tmp
        }

        return new Response(res.body, { status: res.status, headers: newHeaders })
      }
      catch (error: any) {
        // eslint-disable-next-line no-console
        console.log(error)
        return reply(500, error.message)
      }
    },
  }
}
