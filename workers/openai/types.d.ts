interface ENV {
  GIT_HASH: string
  VERSION: string
  OPENAI_API_KEY: string
}

interface INTERNAL_ENV {
  DOMAIN?: string
}

interface Options {
  unbuild?: boolean
  env: INTERNAL_ENV
}
