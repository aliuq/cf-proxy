const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return new Response("", { status: 204 });
    const url = new URL(request.url);
    const { subdomain } = getDomainAndSubdomain(request);
    if (url.pathname === "/robots.txt")
      return new Response("User-agent: *\nDisallow: /", { status: 200 });
    if (subdomain === "ip" && url.pathname === "/") {
      return new Response(request.headers.get("cf-connecting-ip"), {
        status: 200,
        headers: { "content-type": "text/plain;charset=utf-8", "git-hash": env.GIT_HASH }
      });
    }
    return new Response(`Unsupported request url: ${decodeURIComponent(request.url)}`, {
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

export { index as default };
