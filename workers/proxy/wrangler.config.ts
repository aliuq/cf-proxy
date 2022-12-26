// 这里处理 wrangler 的配置文件
//
import path from 'path'
import * as execa from 'execa'
import getPort, { portNumbers } from 'get-port'
import type { BuildEntry } from 'unbuild'

async function wranglerConfig({ unbuild: useUnbuild, env }: Options = { unbuild: false, env: {} }) {
  const port = await getPort({ port: portNumbers(8787, 8887) })

  const { default: buildConfig } = await import('./build.config')
  const outDir = buildConfig.outDir || 'dist'

  const entrie = (<(string | BuildEntry)[]>buildConfig.entries)[0]
  const nameFull = typeof entrie === 'string' ? entrie : entrie.input
  const outName = path.basename(nameFull)

  const gitHash = execa.execaCommandSync('git rev-parse --short HEAD').stdout

  return {
    name: 'proxy',
    main: useUnbuild ? `${outName}.mjs` : `${nameFull}.ts`,
    compatibility_date: new Date().toISOString().split('T')[0],
    no_bundle: useUnbuild ? true : undefined,
    vars: {
      GIT_HASH: gitHash,
    },
    dev: {
      ip: 'localhost',
      // local_protocol: 'https',
      port,
    },
    env: {
      // For local development, Do not pulish the enviroment to cloudflare.
      localhost: {
        vars: {
          mode: 'localhost',
          GIT_HASH: gitHash,
        },
        routes: [
          { pattern: `dl.localhost:${port}`, zone_name: `localhost:${port}`, custom_domain: true },
        ],
      },
      production: {
        vars: {
          mode: 'production',
          GIT_HASH: gitHash,
        },
        routes: env.DOMAIN
          ? [
            { pattern: `dl.${env.DOMAIN}`, zone_name: env.DOMAIN, custom_domain: true },
          ]
          : undefined,
      },
    },
    outDir: useUnbuild ? outDir : undefined,
  }
}

export default wranglerConfig
export { wranglerConfig }
