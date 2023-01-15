async function replyText(text, env, init = {}) {
  return new Response(text, deepMerge({
    status: 200,
    headers: { "content-type": "text/plain;charset=UTF-8", "version": env.VERSION }
  }, init));
}
async function replyUnsupport(options, env, init = {}) {
  return new Response(renderTemplate("Unsupported url {{ url }}", options), deepMerge({
    status: 200,
    headers: { "content-type": "text/plain;charset=UTF-8", "version": env.VERSION }
  }, init));
}
function getDomainAndSubdomain(request) {
  const url = new URL(request.url);
  const hostArr = url.host.split(".");
  let subdomain = "";
  let domain = "";
  if (url.hostname.endsWith("localhost")) {
    subdomain = hostArr.length === 1 ? "" : hostArr[0];
    domain = hostArr.length === 1 ? hostArr[0] : hostArr.slice(1).join(".");
  } else {
    subdomain = hostArr.length > 2 ? hostArr[0] : "";
    domain = hostArr.length > 2 ? hostArr.slice(1).join(".") : hostArr.join(".");
  }
  return { domain, subdomain };
}
async function needCancelRequest(request, matches = []) {
  const url = new URL(request.url);
  matches = matches.length ? matches : [
    "/favicon.",
    "/sw.js"
  ];
  const isCancel = matches.some((match) => url.pathname.includes(match));
  if (isCancel)
    return replyText("", {}, { status: 204 });
}
function renderTemplate(content, data) {
  return content.replace(/\{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
    return data[key] || "";
  });
}
function deepMerge(target, ...sources) {
  for (const source of sources) {
    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (isObject(source[key])) {
          if (!target[key]) {
            target[key] = {};
          }
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return needCancel;
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt")
      return replyText("User-agent: *\nDisallow: /", env);
    const { subdomain } = getDomainAndSubdomain(request);
    if (subdomain === "ip" && url.pathname === "/")
      return replyText(request.headers.get("cf-connecting-ip"), env);
    return replyUnsupport(request, env);
  }
};

export { index as default };
