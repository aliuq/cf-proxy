# cf-proxy

管理发布多个 cloudflare workers 的仓库

## 使用方法

要求：

+ [pnpm](https://pnpm.io/zh/installation)
+ nodejs >= 16.13.0

```bash
# clone this repo
git clone https://github.com/aliuq/cf-proxy.git
# 创建新的 worker
pnpm run new <worker name>
# 管理 worker
pnpm run exec <worker name>
```

## License

[MIT](/LICENSE)
