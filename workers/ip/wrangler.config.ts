import path from 'path'
import getPort, { portNumbers } from 'get-port'
import tsupConfig from './tsup.config'

async function wranglerConfig(options: WranglerConfigOptions<INTERNAL_ENV>): Promise<WranglerConfig> {
  const isDev = process.env.CF_CMD === 'dev'
  const isPublish = process.env.CF_CMD === 'publish'

  const { env, pkg, execs } = options

  const port = isDev ? (await getPort({ port: portNumbers(8787, 8887) })) : 8787
  const domain = {
    local: `localhost:${port}`,
    prod: env.DOMAIN,
  }
  const tsup = tsupConfig as any
  const outDir = tsup?.outDir || 'dist'

  /**
   * @example
   * entries: ['src/index.ts'] => nameFull: 'src/index'; outName: 'index'
   * entries: { input: 'src/index.ts' } => nameFull: 'src/index'; outName: 'index'
   *
   * main: isPublish ? `worker.mjs` : `src/worker.ts`
   *
   */
  const entry = Array.isArray(tsup.entry) ? tsup.entry[0] : tsup.entry[Object.keys(tsup.entry)[0]]
  const outName = path.basename(entry, path.extname(entry))

  const vars = {
    GIT_HASH: execs('git --no-pager log -1 --format=%h -- package.json'),
    VERSION: `v${pkg.version}`,
  }

  return {
    name: 'ip',
    main: (isPublish && !!process.env.CF_LOADER) ? `${outName}.mjs` : entry,
    compatibility_date: '2023-02-27',
    vars,
    dev: { ip: 'localhost', port },
    env: {
      // For local development, Do not pulish the enviroment to cloudflare.
      localhost: {
        vars,
        route: { pattern: `ip.${domain.local}`, zone_name: domain.local, custom_domain: true },
      },
      preview: {
        vars,
        route: domain.prod
          ? { pattern: `ip-preview.${domain.prod}`, zone_name: domain.prod, custom_domain: true }
          : undefined,
      },
      production: {
        vars,
        route: domain.prod
          ? { pattern: `ip.${domain.prod}`, zone_name: domain.prod, custom_domain: true }
          : undefined,
      },
    },
    outDir: isPublish ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
