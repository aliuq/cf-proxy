import path from 'path'
import getPort, { portNumbers } from 'get-port'
import tsupConfig from './tsup.config'

async function wranglerConfig(options: WranglerConfigOptions<INTERNAL_ENV>): Promise<WranglerConfig> {
  const isDev = process.env.NODE_ENV === 'dev'
  const isPublish = process.env.CF_ENV === 'publish'

  const { pkg, execs } = options

  const port = isDev ? (await getPort({ port: portNumbers(8787, 8887) })) : 8787
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
    name: '{{ name }}',
    main: isPublish && process.env.CF_LOADER ? `${outName}.mjs` : entry,
    compatibility_date: '{{ date }}',
    vars,
    dev: { ip: 'localhost', port },
    env: {
      // For local development, Do not pulish the enviroment to cloudflare.
      localhost: {
        vars,
        // routes: [
        //   { pattern: `foo.localhost:${port}`, zone_name: `localhost:${port}`, custom_domain: true },
        // ],
      },
      production: {
        vars,
        // routes: env.DOMAIN
        //   ? [
        //     { pattern: `demo.${env.DOMAIN}`, zone_name: env.DOMAIN, custom_domain: true },
        //   ]
        //   : undefined,
      },
    },
    outDir: isPublish ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
