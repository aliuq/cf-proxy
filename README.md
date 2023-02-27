# cf-proxy

管理发布 cloudflare workers

## 要求

- [pnpm](https://pnpm.io/zh/installation)
- nodejs >= 16.13.0
- wrangler >= 2.0.0

## 使用方法

```bash
git clone https://github.com/aliuq/cf-proxy.git
cd cf-proxy
pnpm i
```

查看帮助

```bash
pnpm cf -h
pnpm cf new -h
pnpm cf run -h
```

### 创建 - new

```bash
cf new [name] [destination]

Create a new Cloudflare Workers project

Positionals:
  name, n         Name of the worker                                    [string]
  destination, o  Destination of the worker        [string] [default: "workers"]
  template, t     Template of the worker             [string] [default: "basic"]

Options:
      --version  Show version number                                   [boolean]
  -d, --date     Date of compatibility_date     [string] [default: "2023-02-27"]
  -w, --cwd      Current templates directory     [string] [default: "templates"]
  -h, --help     Show help                                             [boolean]
```

### 管理 - run

```bash
cf run [name] [command] [params]

Run a Cloudflare Workers project

Positionals:
  name, n     Name of the worker                                        [string]
  command, c  Command to run                                            [string]
  env, e      Environment to use for operations and .env files          [string]

Options:
      --version  Show version number                                   [boolean]
  -p, --params   Parameters to pass to the command                      [string]
  -w, --cwd      Workers directory path            [string] [default: "workers"]
  -f, --config   Path to the wrangler.toml file                         [string]
  -r, --release  Release the worker to Github after running the command[boolean]
      --loader   Loader to build for the worker       [string] [default: "tsup"]
  -h, --help     Show help                                             [boolean]
```

## License

[MIT](/LICENSE)
