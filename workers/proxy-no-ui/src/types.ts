import type * as worktop from 'worktop'

export interface Context extends worktop.Context {
  /** Site robots rules */
  robots?: string[]
  /** Disable routes */
  disablePaths?: (string | RegExp)[]
  /** @example `foo.bar.com` => `foo` */
  subdomain?: string
  /** @example `foo.bar.com` => `bar.com` */
  domain?: string
  /** Source URL */
  url: URL
  // Environment
  bindings: {
    /** Current short commit hash of package.json */
    GIT_HASH: string
    /** Current version of package.json */
    VERSION: string
  }
  $proxy: {
    /** Need proxy rul address */
    url?: URL
    genNewHeaders: (sourceRequest: Headers | Request | Response, options?: GenNewHeadersOptions) => Headers
    genNewRequest: (sourceRequest: Request, url: URL | string, options?: GenNewRequestOptions) => Request
    run: (newURL: URL | string, sourceRequest: Request, options?: RunOptions) => Promise<Response>
  }
}

export interface GenNewHeadersOptions {
  /** Extra headers object */
  headers?: Record<string, string>
  /** Override default headers */
  override?: boolean
}

export interface GenNewRequestOptions {
  /** Extra headers object */
  headers?: GenNewHeadersOptions['headers']
  /** Override default headers */
  overrideHeaders?: GenNewHeadersOptions['override']
  /** Extra RequestInit object */
  requestInit?: RequestInit
  /** Override default RequestInit and default headers */
  overrideRequestInit?: boolean
}

export type MaybePromise = <T>(value: T | Promise<T>) => Promise<T>

export interface RunOptions extends GenNewRequestOptions {
  updateLocation?: (location: string) => string | Promise<string>
  updatePostHeaders?: (headers: Headers, sourceHeaders: Headers) => Headers | Promise<Headers>
  updatePostResponse?: (response: Response, newHeaders: Headers) => Response | Promise<Response | undefined | void>
}

export type Handler<C extends worktop.Context = Context, P = worktop.Params> = worktop.Handler<C, P>
