import type * as worktop from 'worktop'

export interface Context extends worktop.Context {
  bindings: {
    /** Current short commit hash of package.json */
    GIT_HASH: string
    /** Current version of package.json */
    VERSION: string
  }
}

export type Handler<C extends worktop.Context = Context, P = worktop.Params> = worktop.Handler<C, P>
