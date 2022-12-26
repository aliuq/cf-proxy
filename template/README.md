# Worker: {{ name }}

## 文件结构

1. `src`：源文件目录
2. `wrangler.toml`：wrangler 配置文件
3. `wrangler.config.ts`：生成 `wrangler.toml` 的配置文件
4. `types.d.ts`：TypeScript 类型声明文件
5. `package.json`：npm 配置文件
6. `README.md`：项目说明文档
7. `build.config.ts`：unbuild 构建配置文件

### `wrangler.config.ts`

动态生成 `wrangler.toml` 的配置文件，可以在 `wrangler.config.ts` 中配置，详细配置参考 [wrangler 文档](https://developers.cloudflare.com/workers/wrangler/configuration)
注意不可继承的参数有：`define`、`vars`、`durable_objects`、`kv_namespaces`、`r2_buckets`、`services`，意思是如果配置有多个环境，在顶级配置了 vars 参数，那么在子环境中如果没有配置的话，它不会继承顶级的这个参数，而是会忽略掉。

#### Options

`unbuild`: `boolean` 是否使用 [unbuild](https://github.com/unjs/unbuild) 构建，默认为 `false`，仅在执行 `publish` 命令时生效
