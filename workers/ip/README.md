# Worker: ip

获取公网 IP 地址

示例地址：[https://ip.llll.host](https://ip.llll.host)

## 使用

```bash
# 开发
pnpm cf run ip dev --env localhost
# 部署
pnpm cf run ip publish --env production
```

## 环境变量

在 `.env` 文件中进行编辑，用于编译配置的环境变量以 `__` 开头和结尾，例如 `__DOMAIN__`，这样是为了区分和 `wrangler` 的环境变量

| 环境变量 | 说明 |
| :--- | :--- |
| `__DOMAIN__` | 域名，用于配置路由 |
