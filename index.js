// src/index.ts
var domainMaps = {};
var reverseDomainMaps = {};
var src_default = {
  async fetch(request, env, ctx) {
    if (!env.DOMAIN) {
      return new Response(
        "DOMAIN is not defined, Please sepecify DOMAIN in your worker config",
        { status: 500 }
      );
    }
    domainMaps = {
      [`hub.${env.DOMAIN}`]: "github.com",
      [`assets.${env.DOMAIN}`]: "github.githubassets.com",
      [`raw.${env.DOMAIN}`]: "raw.githubusercontent.com",
      [`download.${env.DOMAIN}`]: "codeload.github.com",
      [`object.${env.DOMAIN}`]: "objects.githubusercontent.com",
      [`media.${env.DOMAIN}`]: "media.githubusercontent.com",
      [`gist.${env.DOMAIN}`]: "gist.github.com"
    };
    reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map((arr) => arr.reverse()));
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /", { status: 200 });
    }
    if (url.pathname === "/favicon.ico" || url.pathname === "/favicon.png" || url.pathname === "/sw.js") {
      return new Response("", { status: 200 });
    }
    if (url.host in domainMaps) {
      url.host = domainMaps[url.host];
      if (url.port !== "80" && url.port !== "443") {
        url.port = url.protocol === "https:" ? "443" : "80";
      }
      const newRequest = getNewRequest(url, request);
      return proxyGithub(url, newRequest);
    } else if (url.host === `dl.${env.DOMAIN}`) {
      if (url.pathname === "/") {
        return new Response(`
					<div style="position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #181818; color: #ccc;">
						<div style="position: fixed; left: 50%; top: 150px; transform: translate3D(-50%, 0, 0)">
							<h2 style="color: #ccc; font-size: 32px; margin-bottom: 0; line-height: 1.6">\u6587\u4EF6\u4EE3\u7406\u52A0\u901F by Cloudflare Workers</h2>
							<p style="padding-bottom: 15px; margin-top: 0; font-size: 14px; color: #999;">
								\u6BCF\u65E5\u6709\u4F7F\u7528\u6B21\u6570\u9650\u5236\uFF0C\u5EFA\u8BAE\u901A\u8FC7 cloudflare workers \u90E8\u7F72\u81EA\u5DF1\u7684\u4EE3\u7406\u52A0\u901F\u670D\u52A1, \u90E8\u7F72\u6559\u7A0B\u8BF7\u53C2\u8003
								<a style="color: #999;" target="_blank" href="https://github.com/aliuq/proxy-github">readme</a>
							</p>
							<form
								action="https://dl.${env.DOMAIN}"
								method="get" target="_blank"
								style="display: flex; align-items: center;"
								onsubmit="window.open('https://dl.${env.DOMAIN}/' + this.elements.url.value, '_blank'); return false;"
							>
								<input
									type="url"
									name="url"
									style="height: 48px; width: 600px; border: 1px solid #999; outline: none; padding: 0 10px; background-color: #181818; color: #ccc;"
									placeholder="Input URL to download"
								>
								<button
									type="submit"
									style="height: 48px; width: 80px; border: 1px solid #999; background: #fff; outline: none; cursor: pointer; font-size: 20px; background-color: #181818; color: #ccc;"
								>Go</button>
							</form>
							<p style="font-size: 14px; color: #999">
								Usage:
								https://dl.${env.DOMAIN}/<strong>&lt;file_path&gt;</strong>
							</p>
						</div>
						<div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #999; font-size: 14px;">
							<p>Copyright @ aliuq. All Rights Reserved.</p>
						</div>
					</div>
				`, { status: 200, headers: { "content-type": "text/html;charset=utf-8" } });
      }
      const sourceUrl = url.href.replace(url.origin, "").substring(1).replace(/^(https?:)\/+/g, "$1//");
      try {
        const newSourceUrl = new URL(sourceUrl);
        const newRequest = getNewRequest(newSourceUrl, request);
        return proxy(newSourceUrl, newRequest);
      } catch (e) {
        return new Response(`${sourceUrl} is invalid url`, { status: 400 });
      }
    }
    return new Response(`Unsupported host ${url.host}`, { status: 200 });
  }
};
function getNewRequest(url, request) {
  const headers = new Headers(request.headers);
  headers.set("reason", "mirror of China");
  const newRequestInit = { redirect: "manual", headers };
  return new Request(url.toString(), new Request(request, newRequestInit));
}
async function proxyGithub(url, request) {
  try {
    const res = await fetch(url.toString(), request);
    const headers = res.headers;
    const newHeaders = new Headers(headers);
    const status = res.status;
    if (newHeaders.has("location")) {
      let loc = newHeaders.get("location");
      if (loc) {
        try {
          const locUrl = new URL(loc);
          if (locUrl.host in reverseDomainMaps) {
            locUrl.host = reverseDomainMaps[locUrl.host];
            newHeaders.set("location", locUrl.toString());
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    newHeaders.set("access-control-expose-headers", "*");
    newHeaders.set("access-control-allow-origin", "*");
    newHeaders.delete("content-security-policy");
    newHeaders.delete("content-security-policy-report-only");
    newHeaders.delete("clear-site-data");
    if (res.headers.get("content-type")?.indexOf("text/html") !== -1) {
      const body = await res.text();
      const regAll = new RegExp(Object.keys(reverseDomainMaps).map((r) => `(https?://${r})`).join("|"), "g");
      const newBody = body.replace(regAll, (match) => {
        return match.replace(/^(https?:\/\/)(.*?)$/g, (m, p1, p2) => {
          return reverseDomainMaps[p2] ? `${p1}${reverseDomainMaps[p2]}` : m;
        });
      }).replace(/integrity=\".*?\"/g, "");
      return new Response(newBody, { status, headers: newHeaders });
    }
    return new Response(res.body, { status, headers: newHeaders });
  } catch (e) {
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
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
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
