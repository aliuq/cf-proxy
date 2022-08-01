# proxy-github

通过 Cloudflare Workers 代理 GitHub 的请求来实现 Github 无法访问的问题

cloudflare 免费版每天有 10 万次免费请求，并且有每分钟1000次请求的限制，如果不够用，可升级到 $5 的高级版本，每月可用 1000 万次请求（超出部分 $0.5/百万次请求）

如果发现 [hub.llll.host](https://hub.llll.host) 不能访问或访问过慢，请进行私有部署，供自己使用。

请尽量减少对页面的访问，以减少 assets.llll.host 的负担，建议通过以下方式对单个文件进行访问或者clone

## 使用方法

```bash
# clone a repo
git clone https://github.com/aliuq/proxy-github.git
# 替换如下
git clone https://hub.llll.host/aliuq/proxy-github.git

# raw.githubusercontent.com
https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
# 替换如下
https://raw.llll.host/aliuq/proxy-github/master/README.md

# github.githubassets.com
https://github.githubassets.com/images/modules/site/social-cards/package-registry.png
# 替换如下
https://assets.llll.host/images/modules/site/social-cards/package-registry.png
```

详细代理列表如下：

| Proxy | Hostname |
|:---------|:---------|
| hub.my.domain | github.com |
| raw.my.domain | raw.githubusercontent.com |
| assets.my.domain | github.githubassets.com |
| download.my.domain | codeload.github.com |
| object.my.domain | objects.githubusercontent.com |
| media.my.domain | media.githubusercontent.com |
| gist.my.domain | gist.github.com |

## 部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/aliuq/proxy-github)

按照提示进行下一步操作

手动部署

```bash
git clone https://github.com/aliuq/proxy-github.git
cd proxy-github
npm install
npm install wrangler -g
```

使用 [wrangler](https://developers.cloudflare.com/workers/wrangler/) 进行开发和部署，先使用 `wrangler login` 进行 cf 登录授权，然后修改 `wrangler.toml` 下面的 `DOMAIN` 字段，指定用于代理的域名，然后运行 `npm run deploy` 进行发布

控制台操作

首先得有一个域名，并且在 cf 上添加为站点，在 `Workers` - `proxy-github` 下，选择`触发器`，将代理域名添加到`路由`和`自定义域`下，如果需要[增加代理](https://github.com/aliuq/proxy-github/blob/master/src/index.ts#L40)，同样需要添加到`路由`和`自定义域`下，`DOMAIN` 字段也可通过控制台 `Workers` - `proxy-github` - `设置` - `变量` - `环境变量` 进行设置，

![s1](https://img2.bilishare.com/img/2022/08/01/223559c7ae0.png/normal)

## 其他代理项目

+ [FastGit](https://doc.fastgit.org/zh-cn/)
+ [gh-proxy](https://github.com/hunshcn/gh-proxy)

## License

[MIT](/LICENSE)
