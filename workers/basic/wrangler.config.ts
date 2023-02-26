import path from 'path'
import * as execa from 'execa'
import getPort, { portNumbers } from 'get-port'
import pkg from './package.json'

async function wranglerConfig({ env: _env }: Options = { env: {} }): Promise<WranglerConfig> {
  const port = await getPort({ port: portNumbers(8787, 8887) })
  const isPublish = process.env.CF_ENV === 'publish'

  let outDir = ''
  const tsupConfig = (await import('./tsup.config')).default as any
  outDir = tsupConfig?.outDir || 'dist'

  /**
   * @example
   * entries: ['src/index.ts'] => nameFull: 'src/index'; outName: 'index'
   * entries: { input: 'src/index.ts' } => nameFull: 'src/index'; outName: 'index'
   *
   * main: isPublish ? `worker.mjs` : `src/worker.ts`
   *
   */
  const entry = Array.isArray(tsupConfig.entry)
    ? tsupConfig.entry[0]
    : tsupConfig.entry[Object.keys(tsupConfig.entry)[0]]
  const outName = path.basename(entry, path.extname(entry))

  const vars = {
    GIT_HASH: execa.execaCommandSync('git rev-parse --short HEAD:package.json').stdout,
    VERSION: `v${pkg.version}`,
  }

  return {
    name: 'basic',
    main: isPublish && process.env.CF_LOADER ? `${outName}.mjs` : entry,
    compatibility_date: '2023-02-26',
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
