interface ENV {
  GIT_HASH: string
  VERSION: string
  SHORTURLS: KVNamespace
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
}

// Only for build configuration
interface INTERNAL_ENV {
  DOMAIN?: string
  KV_BINDING?: string
  KV_NAMESPACE_ID?: string
  KV_PREVIEW_ID?: string
}

interface Options {
  unbuild?: boolean
  env: INTERNAL_ENV
}
