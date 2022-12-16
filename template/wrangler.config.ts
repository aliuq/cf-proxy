// 这里处理 wrangler 的配置文件
//
import path from 'path'
import * as execa from 'execa'
import getPort, { portNumbers } from 'get-port'
import type { BuildEntry } from 'unbuild'

interface INTERNAL_ENV {
  DOMAIN?: string
}

interface Options {
  unbuild?: boolean
  env: INTERNAL_ENV
}

async function wranglerConfig({ unbuild: useUnbuild, env: _env }: Options = { unbuild: false, env: {} }) {
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

  const gitHash = execa.execaCommandSync('git rev-parse --short HEAD').stdout

  return {
    name: '{{ name }}',
    main: useUnbuild ? `${outName}.mjs` : `${nameFull}.ts`,
    compatibility_date: new Date().toISOString().split('T')[0],
    no_bundle: useUnbuild ? true : undefined,
    vars: {
      GIT_HASH: gitHash,
    },
    dev: {
      ip: 'localhost',
      port,
    },
    env: {
      // staging: {
      //   vars: {
      //     mode: 'staging',
      //     GIT_HASH: gitHash,
      //   },
      // },
      production: {
        vars: {
          mode: 'production',
          GIT_HASH: gitHash,
        },
        // routes: env.DOMAIN
        //   ? [
        //     { pattern: `demo.${env.DOMAIN}`, zone_name: env.DOMAIN, custom_domain: true },
        //   ]
        //   : undefined,
      },
    },
    outDir: useUnbuild ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
