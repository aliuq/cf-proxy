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

  const subdomains = ['hub', 'assets', 'raw', 'download', 'object', 'media', 'avatars', 'gist']

  return {
    name: 'github',
    main: isPublish && process.env.CF_LOADER ? `${outName}.mjs` : entry,
    compatibility_date: '2023-03-01',
    vars,
    dev: { ip: 'localhost', port, local_protocol: 'https' },
    env: {
      // For local development, Do not pulish the enviroment to cloudflare.
      localhost: {
        vars: { ...vars, PREFIX: 'local' },
      },
      preview: {
        vars: { ...vars, PREFIX: 'pre' },
        routes: domain.prod
          ? subdomains.map((s) => {
            return {
              pattern: `${s}-pre.${domain.prod}`,
              zone_name: domain.prod,
              custom_domain: true,
            }
          })
          : undefined,
      },
      production: {
        vars,
        routes: domain.prod
          ? subdomains.map((s) => {
            return {
              pattern: `${s}.${domain.prod}`,
              zone_name: domain.prod,
              custom_domain: true,
            }
          })
          : undefined,
      },
    },
    outDir: isPublish ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
