# cf-proxy

通过 Cloudflare Workers 代理 GitHub 的请求来实现 Github 无法访问的问题，支持文件代理加速下载

> **Note**  
> 无法保证 hub.llll.host 持续可用，建议自行部署

cloudflare 免费版每天有 10 万次免费请求，并且有每分钟1000次请求的限制，如果不够用，可升级到 $5 的高级版本，每月可用 1000 万次请求（超出部分 $0.5/百万次请求）

如果发现 [hub.llll.host](https://hub.llll.host) 不能访问或访问过慢，请进行私有化部署，如果只是几个人使用，完全足够

请尽量减少对仓库页面的访问，以减少 assets.llll.host 的负担，一个页面随随便便就有50+请求，省着点用🤣，建议通过以下方式对单个文件进行访问或者clone

请尽量避免使用代理进入 GitHub 的时候进行登录

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

# 文件代理加速
# https://dl.llll.host/<file_path>
https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
# 替换如下
https://dl.llll.host/https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
```

详细代理列表如下：

| Proxy | Hostname |
|:---------|:---------|
| hub.llll.host | github.com |
| raw.llll.host | raw.githubusercontent.com |
| assets.llll.host | github.githubassets.com |
| download.llll.host | codeload.github.com |
| object.llll.host | objects.githubusercontent.com |
| media.llll.host | media.githubusercontent.com |
| gist.llll.host | gist.github.com |

## 部署

> **Warning**  
> 由于只有一个 Cloudflare 账号，所以没有使用多余账号进行测试

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

## Github 私有仓库

> ℹ️ 重要提示  
> cf-proxy 不会保存任何数据，仅作代理转发，但由于使用次数限制，建议进行私有化部署

私有仓库操作与公开仓库使用方式一致，仅多了一步登录授权，需输入用户名和 Github Token

[创建 personal access token](https://github.com/settings/tokens/new)

```bash
# clone a private repo
git clone https://github.com/<Your Name>/<Private Project>.git
# 替换如下
git clone https://hub.llll.host/<Your Name>/<Private Project>.git

# 按照提示，输入用户名和刚刚创建的 token
```

使用 git 缓存凭据，避免每次都需要输入用户名和 token

缓存在内存中

```bash
# 缓存 15 分钟
git config --global credential.helper cache
# 缓存 1 小时
git config --global credential.helper 'cache --timeout=3600'

# 接着执行 clone 操作，输入用户名和 token，在缓存时限内不需要再次输入
```

缓存在磁盘中

```bash
git config --global credential.helper store

# 接着执行 clone 操作，输入用户名和 token，此后不需要再次输入

# 查看凭据位置
cat ~/.git-credentials
```

## 开发

wrangler 要求 node 版本 >= v16.7.0

```bash
# 安装 cloudflare worker 开发工具 wrangler
npm install wrangler -g
# cloudflare 登录授权
wrangler login
# 查看登录信息
wrangler whoami

# clone
git clone https://github.com/aliuq/cf-proxy.git
# 进入项目目录
cd cf-proxy
# 安装依赖，依赖仅做类型提示
npm install
# 开发 等同于 wrangler dev
npm run dev
# 发布 等同于 wrangler publish
npm run deploy
```

## 其他代理项目

+ [FastGit](https://doc.fastgit.org/zh-cn/)
+ [gh-proxy](https://github.com/hunshcn/gh-proxy)

## License

[MIT](/LICENSE)
