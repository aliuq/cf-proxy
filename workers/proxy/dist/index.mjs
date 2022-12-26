const HomeHtml = "<!DOCTYPE html>\n  <html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>cf-proxy</title>\n  </head>\n  <body>\n    <div style=\"position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #181818; color: #ccc;\">\n      <div style=\"position: fixed; left: 50%; top: 150px; transform: translate3D(-50%, 0, 0)\">\n        <h2 style=\"color: #ccc; font-size: 32px; margin-bottom: 0; line-height: 1.6\">文件代理加速 by Cloudflare Workers</h2>\n        <p style=\"padding-bottom: 15px; margin-top: 0; font-size: 14px; color: #999;\">\n          每日有使用次数限制，建议通过 cloudflare workers 部署自己的代理加速服务, 部署教程请参考\n          <a style=\"color: #999;\" target=\"_blank\" href=\"https://github.com/aliuq/cf-proxy\">readme</a>\n        </p>\n        <form\n          action=\"{{url}}\"\n          method=\"get\" target=\"_blank\"\n          style=\"display: flex; align-items: center;\"\n          onsubmit=\"window.open('{{url}}/' + this.elements.url.value, '_blank'); return false;\"\n        >\n          <input\n            type=\"url\"\n            name=\"url\"\n            style=\"height: 48px; width: 600px; border: 1px solid #999; outline: none; padding: 0 10px; background-color: #181818; color: #ccc;\"\n            placeholder=\"Input URL to download\"\n          >\n          <button\n            type=\"submit\"\n            style=\"height: 48px; width: 80px; border: 1px solid #999; background: #fff; outline: none; cursor: pointer; font-size: 20px; background-color: #181818; color: #ccc;\"\n          >Go</button>\n        </form>\n        <p style=\"font-size: 14px; color: #999\">\n          Usage:\n          {{url}}/<strong>&lt;file_path&gt;</strong>\n      </p>\n      </div>\n      <div style=\"position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #999; font-size: 14px;\">\n        <p>Copyright @ aliuq. All Rights Reserved. <span style=\"color: #555;user-select: none;\"> [{{hash}}]</span></p>\n      </div>\n    </div>\n  </body>\n</html>\n";

const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return new Response("", { status: 204 });
    const url = new URL(request.url);
    const { domain, subdomain } = getDomainAndSubdomain(request);
    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /", { status: 200 });
    if (url.host === `dl.${domain}`) {
      if (url.pathname === "/") {
        return new Response(renderTemplate(HomeHtml, {
          url: url.origin,
          hash: env.GIT_HASH
        }), {
          status: 200,
          headers: { "content-type": "text/html;charset=utf-8" }
        });
      } else {
        const sourceUrl = url.href.replace(url.origin, "").substring(1).replace(/^(https?:)\/+/g, "$1//");
        try {
          const newSourceUrl = new URL(sourceUrl);
          const newRequest = getNewRequest(newSourceUrl, request);
          return proxy(newSourceUrl, newRequest);
        } catch (e) {
          return new Response(`${sourceUrl} is invalid url`, { status: 400 });
        }
      }
    }
    return new Response(`Unsupported domain ${subdomain ? `${subdomain}.` : ""}${domain}`, {
      status: 200,
      headers: { "content-type": "text/plain;charset=utf-8", "git-hash": env.GIT_HASH }
    });
  }
};
function getDomainAndSubdomain(request) {
  const url = new URL(request.url);
  const hostArr = url.host.split(".");
  let subdomain = "";
  let domain = "";
  if (hostArr.length > 2) {
    subdomain = hostArr[0];
    domain = hostArr.slice(1).join(".");
  } else if (hostArr.length === 2) {
    subdomain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[0] : "";
    domain = hostArr[1].match(/^localhost(:\d+)?$/) ? hostArr[1] : hostArr.join(".");
  } else {
    domain = hostArr.join(".");
  }
  return { domain, subdomain };
}
async function needCancelRequest(request, matches = []) {
  const url = new URL(request.url);
  matches = matches.length ? matches : [
    "/favicon.",
    "/sw.js"
  ];
  return matches.some((match) => url.pathname.includes(match));
}
function getNewRequest(url, request) {
  const headers = new Headers(request.headers);
  headers.set("reason", "mirror of China");
  const newRequestInit = { redirect: "manual", headers };
  return new Request(url.toString(), new Request(request, newRequestInit));
}
async function proxy(url, request) {
  try {
    const res = await fetch(url.toString(), request);
    const headers = res.headers;
    const newHeaders = new Headers(headers);
    const status = res.status;
    newHeaders.set("access-control-expose-headers", "*");
    newHeaders.set("access-control-allow-origin", "*");
    newHeaders.delete("content-security-policy");
    newHeaders.delete("content-security-policy-report-only");
    newHeaders.delete("clear-site-data");
    return new Response(res.body, { status, headers: newHeaders });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
function renderTemplate(content, data) {
  return content.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
    return data[key] || "";
  });
}

export { index as default };
