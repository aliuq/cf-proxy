// 这里处理 wrangler 的配置文件
//
import path from 'path'
import * as execa from 'execa'
import getPort, { portNumbers } from 'get-port'
import type { BuildEntry } from 'unbuild'
import pkg from './package.json'

async function wranglerConfig({ unbuild: useUnbuild, env }: Options = { unbuild: false, env: {} }) {
  const port = await getPort({ port: portNumbers(8787, 8887) })

  const { default: buildConfig } = await import('./build.config')
  const outDir = buildConfig.outDir || 'dist'

  /**
   * @example
   * entries: ['src/worker'] => nameFull: 'src/worker'; outName: 'worker'
   * entries: [{ input: 'src/worker' }] => nameFull: 'src/worker'; outName: 'worker'
   *
   * main: isDev ? `src/worker.ts` : `worker.mjs`
   *
   */
  const entrie = (<(string | BuildEntry)[]>buildConfig.entries)[0]
  const nameFull = typeof entrie === 'string' ? entrie : entrie.input
  const outName = path.basename(nameFull)

  const vars = {
    GIT_HASH: execa.execaCommandSync('git rev-parse --short HEAD').stdout,
    VERSION: `v${pkg.version}`,
  }

  return {
    name: 'openai',
    main: useUnbuild ? `${outName}.mjs` : `${nameFull}.ts`,
    compatibility_date: new Date().toISOString().split('T')[0],
    /** If set to `true`, the worker will not be bundled. so the output file
     *  must be a single file and no import module. if exists, will throw error.
     *
     *  such as: `import axios from 'axios'`,
     */
    // no_bundle: undefined,
    vars: {
      mode: 'default',
      ...vars,
    },
    dev: {
      ip: 'localhost',
      local_protocol: 'https',
      port,
    },
    env: {
      // For local development, Do not pulish the enviroment to cloudflare.
      localhost: {
        vars: {
          mode: 'localhost',
          ...vars,
        },
        routes: env.DOMAIN
          ? [
            { pattern: `chat.localhost:${port}`, zone_name: `localhost:${port}`, custom_domain: true },
            { pattern: `localhost:${port}`, zone_name: `localhost:${port}`, custom_domain: true },
          ]
          : undefined,
      },
      production: {
        vars: {
          mode: 'production',
          ...vars,
        },
        routes: env.DOMAIN
          ? [
            { pattern: `chat.${env.DOMAIN}`, zone_name: env.DOMAIN, custom_domain: true },
            { pattern: `${env.DOMAIN}`, zone_name: env.DOMAIN, custom_domain: true },
          ]
          : undefined,
      },
    },
    outDir: useUnbuild ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
