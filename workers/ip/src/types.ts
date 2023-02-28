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
  // Environment
  bindings: {
    /** Current short commit hash of package.json */
    GIT_HASH: string
    /** Current version of package.json */
    VERSION: string
  }
}

export type Handler<C extends worktop.Context = Context, P = worktop.Params> = worktop.Handler<C, P>
