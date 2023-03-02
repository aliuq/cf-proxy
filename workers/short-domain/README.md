# Worker: short-domain

短网址服务, 示例地址：[https://s.llll.host](https://s.llll.host)

## kv:namespace

创建短域名的 kv 命名空间，方便本地开发，修改下面的 `SHORTURLS` 为你的命名空间名称

```bash
wrangler kv:namespace create "SHORTURLS"
# 开发环境需搭配 --preview 参数
wrangler kv:namespace create "SHORTURLS" --preview
```

## 使用

```bash
# 开发
pnpm cf run short-domain dev --env localhost
# 部署
pnpm cf run short-domain publish --env production
```

## 环境变量

在 `.env` 文件中进行编辑，用于编译配置的环境变量以 `__` 开头和结尾，例如 `__DOMAIN__`，这样是为了区分和 `wrangler` 的环境变量

| 环境变量 | 说明 |
| :--- | :--- |
| `ADMIN_USERNAME` | 用户名 |
| `ADMIN_PASSWORD` | 密码 |
| `__DOMAIN__` | 域名，用于配置路由 |
| `__KV_BINDING__` | 短域名 kv 命名空间名称，比如 `SHORTURLS` |
| `__KV_NAMESPACE_ID__` | 短域名 kv 命名空间 ID |
| `__KV_PREVIEW_ID__` | 短域名 kv 命名空间预览 ID，用于本地开发 |
