# Worker: github

通过 Cloudflare Workers 代理 GitHub 的请求来实现 Github 无法访问的问题，支持文件代理加速下载

> **Note**  
> 无法保证 `hub.llll.host` 持续可用，建议自行部署
> 为了防止被意外认定为网络欺诈，而导致域名被封，已屏蔽掉 login, session, join, auth 等接口，如果有需要，请自行部署，将这些接口放开

## 使用

```diff
# 克隆仓库
- git clone https://github.com/aliuq/proxy-github.git
+ git clone https://hub.llll.host/aliuq/proxy-github.git

# 代理 raw.githubusercontent.com
- https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
+ https://raw.llll.host/aliuq/proxy-github/master/README.md

# 代理 github.githubassets.com
- https://github.githubassets.com/images/modules/site/social-cards/package-registry.png
+ https://assets.llll.host/images/modules/site/social-cards/package-registry.png

# 文件代理加速(已单独部署，https://github.com/aliuq/cf-proxy/tree/master/workers/proxy)
# https://dl.llll.host/<file_path>
- https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
+ https://dl.llll.host/https://raw.githubusercontent.com/aliuq/proxy-github/master/README.md
```

详细代理列表如下：

| Proxy | Hostname |
|:---------|:---------|
| hub.llll.host | github.com |
| assets.llll.host | github.githubassets.com |
| raw.llll.host | raw.githubusercontent.com |
| download.llll.host | codeload.github.com |
| object.llll.host | objects.githubusercontent.com |
| media.llll.host | media.githubusercontent.com |
| avatars.llll.host | avatars.githubusercontent.com |
| gist.llll.host | gist.github.com |

## 关于使用限制

cloudflare 免费套餐每天有 10w 次免费请求，每分钟 1000 次请求的限制，如果不够用，可升级到付费套餐，每月可用 1000w 次请求（超出部分$0.5/百万次请求）

如果发现 [hub.llll.host](https://hub.llll.host) 不能访问或访问过慢，请进行独立部署，如果只是几个人使用，是完全足够的

尽量减少对仓库页面的访问，以减少代理的负担，一个页面随随便便就有 50+ 请求，尽量减少不必要的次数浪费

## Github 私有仓库

> **Note**  
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

```bash
# 开发
pnpm cf run github dev --env localhost
# 部署
pnpm cf run github publish --env production
```

## 部署

TODO

+ [手把手实现 Github 代理加速](https://www.bilishare.com/tech/2022/08/23/cf-proxy-github.html)

## 环境变量

在 `.env` 文件中进行编辑，用于编译配置的环境变量以 `__` 开头和结尾，例如 `__DOMAIN__`，这样是为了区分和 `wrangler` 的环境变量

| 环境变量 | 说明 |
| :--- | :--- |
| `__DOMAIN__` | 域名，用于配置路由 |

## Q&A

### 域名被封？

最新版已屏蔽掉导致意外被封的接口，如果还有遇到同样的情况，请将接口提交 issue，或者欢迎 pr

我两个域名都是被 [Netcraft](https://incident.netcraft.com) 认定为网络欺诈，申诉的地址可能因为域名后缀不同而不同，`.host` 域名的申诉地址为[Link](https://radix.website/report-abuse#unsuspensionsteps)

详细的 Gif 动图可以从[这里](https://github.com/aliuq/cf-proxy/pull/13)查看

#### 申诉模板

> **Note**  
> 模板浅陋，仅供参考，不保证一定能解封，修改 `example.com` 为你的域名，修改 `<Your Repo>` 为你的仓库地址

```txt
Hi,

Thank you for your reply, this address is one of the proxy GitHub requests

gist.example.com -> gist.github.com
https://gist.example.com/starred/

According to the proxy forwarding logic, the content of this address should be the same as the one shown below

https://gist.github.com/starred/

Because it doesn't have phishing content, it just does a layer of forwarding and doesn't store any data, it's deployed on top of cloudflare workers and the source code is stored on GitHub

https://github.com/<Your Repo>

The purpose of this URL is to allow users who do not have access to GitHub to be able to access the resources on GitHub normally, such as in China, I hope to review it again and look forward to your reply!

Thanks
```

## 其他代理项目

+ [FastGit](https://doc.fastgit.org/zh-cn/)
+ [gh-proxy](https://github.com/hunshcn/gh-proxy)
