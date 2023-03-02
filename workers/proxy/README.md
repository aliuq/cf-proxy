# Worker: proxy

常规代理请求，仅转发单个文件有效，网站批量代理，需要根据这个模板进行更具体的替换

示例地址：[https://dl.llll.host](https://dl.llll.host)

## 使用

```bash
# 开发
pnpm cf run proxy dev --env localhost
# 部署
pnpm cf run proxy publish --env production
```

## 环境变量

在 `.env` 文件中进行编辑，用于编译配置的环境变量以 `__` 开头和结尾，例如 `__DOMAIN__`，这样是为了区分和 `wrangler` 的环境变量

| 环境变量 | 说明 |
| :--- | :--- |
| `__DOMAIN__` | 域名，用于配置路由 |
