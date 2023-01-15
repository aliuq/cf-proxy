# cf-proxy

管理发布多个 cloudflare workers 的仓库

## 使用方法

要求：

+ [pnpm](https://pnpm.io/zh/installation)
+ nodejs >= 16.13.0

```bash
# clone this repo
git clone https://github.com/aliuq/cf-proxy.git
```

### 命令 `new`

创建新的 worker

```bash
pnpm run new [worker name]
```

options:

+ `--name/-n`：worker 名称
+ `--date/-d`: `yyyy-mm-dd` 格式的日期，用于确定使用哪个版本的 Workers 运行时，默认为当前日期
+ `--dest/-o`: worker 生成目录，默认为 `./workers`

### 命令 `exec`

管理 worker

```bash
pnpm run exec [worker name] [command] [params] [args]
```

options:

+ `--config/-c`: 配置文件路径
+ `--env/-e`: 环境变量文件路径
+ `--help/-h`: 帮助信息
+ `--version/-v`: 版本信息
+ `--params`：固定参数
+ `--workers-root`: worker 生成目录，默认为 `./workers`
+ `--unbuild`: 使用 unbuild 编译 worker，默认为 `true`
+ `--push`: 是否推送到 github，默认为 `false`
+ `--[Name]`: 额外的 wrangler 命令参数

## License

[MIT](/LICENSE)
