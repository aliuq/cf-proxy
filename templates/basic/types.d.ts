interface ENV {
  GIT_HASH: string
  VERSION: string
}

interface INTERNAL_ENV {
  DOMAIN?: string
}

interface Options {
  env: INTERNAL_ENV
  cwd: string
  pkg: Record<string, any>
  execs: (str: string) => string
}
