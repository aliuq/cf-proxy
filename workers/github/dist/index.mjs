let domainMaps = {};
let reverseDomainMaps = {};
const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return new Response("", { status: 204 });
    const url = new URL(request.url);
    const { domain, subdomain } = getDomainAndSubdomain(request);
    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /", { status: 200 });
    domainMaps = {
      [`hub.${domain}`]: "github.com",
      [`assets.${domain}`]: "github.githubassets.com",
      [`raw.${domain}`]: "raw.githubusercontent.com",
      [`download.${domain}`]: "codeload.github.com",
      [`object.${domain}`]: "objects.githubusercontent.com",
      [`media.${domain}`]: "media.githubusercontent.com",
      [`avatars.${domain}`]: "avatars.githubusercontent.com",
      [`gist.${domain}`]: "gist.github.com"
    };
    reverseDomainMaps = Object.fromEntries(Object.entries(domainMaps).map((arr) => arr.reverse()));
    if (url.host in domainMaps) {
      url.host = domainMaps[url.host];
      if (url.port !== "80" && url.port !== "443")
        url.port = url.protocol === "https:" ? "443" : "80";
      const newRequest = getNewRequest(url, request);
      return proxy(url, newRequest);
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
async function proxy(url, request, env) {
  try {
    const res = await fetch(url.toString(), request);
    const headers = res.headers;
    const newHeaders = new Headers(headers);
    const status = res.status;
    if (newHeaders.has("location")) {
      const loc = newHeaders.get("location");
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
    return new Response(e.message, { status: 500 });
  }
}

export { index as default };
