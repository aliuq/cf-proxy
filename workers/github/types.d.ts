interface ENV {
  GIT_HASH: string
}

interface INTERNAL_ENV {
  DOMAIN?: string
}

interface Options {
  unbuild?: boolean
  env: INTERNAL_ENV
}
