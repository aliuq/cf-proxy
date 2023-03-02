import type * as worktop from 'worktop'
import type { KV } from 'worktop/cfw.kv'
import type * as Model from './model'

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
    SHORTURLS: KV.Namespace
    ADMIN_USERNAME: string
    ADMIN_PASSWORD: string
  }
  isLogin?: boolean

  $ids: Model.Ids
  $md5s: Model.Md5s
}

export interface ShortUrl {
  /** 随机字符串，默认6位，拥有管理权限可随意定义 */
  id: string
  /** 源 URL 的 md5 值，源 URL 对应的是 source 字段 */
  md5: string
  /** 源 URL */
  source: string
}

export type Handler<C extends worktop.Context = Context, P = worktop.Params> = worktop.Handler<C, P>
