# Worker: {{ name }}

## 使用

```bash
# 开发
pnpm run exec {{ name }} dev --env localhost
# 部署
pnpm run exec {{ name }} publish --env production
```

## 环境变量

在 `.env` 文件中进行编辑，用于编译配置的环境变量以 `__` 开头和结尾，例如 `__DOMAIN__`，这样是为了区分和 `wrangler` 的环境变量

| 环境变量 | 说明 |
| :--- | :--- |
| `__DOMAIN__` | 域名，用于配置路由 |
