import type * as worktop from 'worktop'

export interface Context extends worktop.Context {
  bindings: {
    FALLBACK: string
  }
}

export type Handler<C extends worktop.Context = Context, P = worktop.Params> = worktop.Handler<C, P>
