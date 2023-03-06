// ../../node_modules/.pnpm/regexparam@2.0.1/node_modules/regexparam/dist/index.mjs
function parse(str, loose) {
  if (str instanceof RegExp)
    return { keys: false, pattern: str };
  var c2, o3, tmp, ext, keys = [], pattern = "", arr = str.split("/");
  arr[0] || arr.shift();
  while (tmp = arr.shift()) {
    c2 = tmp[0];
    if (c2 === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c2 === ":") {
      o3 = tmp.indexOf("?", 1);
      ext = tmp.indexOf(".", 1);
      keys.push(tmp.substring(1, !!~o3 ? o3 : !!~ext ? ext : tmp.length));
      pattern += !!~o3 && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
      if (!!~ext)
        pattern += (!!~o3 ? "?" : "") + "\\" + tmp.substring(ext);
    } else {
      pattern += "/" + tmp;
    }
  }
  return {
    keys,
    pattern: new RegExp("^" + pattern + (loose ? "(?=$|/)" : "/?$"), "i")
  };
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/buffer/index.mjs
var c = new TextEncoder();
var o = new TextDecoder("utf-8");

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/utils/index.mjs
function f(n3) {
  return n3 ? c.encode(n3).byteLength : 0;
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/response/index.mjs
var t = "content-type";
var s = "content-length";
var a2 = { 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 406: "Not Acceptable", 409: "Conflict", 410: "Gone", 411: "Length Required", 413: "Payload Too Large", 422: "Unprocessable Entity", 426: "Upgrade Required", 428: "Precondition Required", 429: "Too Many Requests", 500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" };
function n(a4, n3, r3) {
  let o3 = {};
  for (let e3 in r3)
    o3[e3.toLowerCase()] = r3[e3];
  let d = o3[t], i2 = typeof n3;
  return null == n3 ? n3 = "" : "object" === i2 ? (n3 = JSON.stringify(n3), d = d || "application/json;charset=utf-8") : "string" !== i2 && (n3 = String(n3)), o3[t] = d || "text/plain", o3[s] = o3[s] || String(n3.byteLength || f(n3)), new Response(n3, { status: a4, headers: o3 });
}
var r2 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function o2(e3, t2) {
  let a4 = r2.has(e3.status);
  if (!t2 && !a4)
    return e3;
  let n3 = new Response(null, e3);
  return a4 && n3.headers.delete(s), 205 === e3.status && n3.headers.set(s, "0"), n3;
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/router/index.mjs
function n2(...e3) {
  return async function(r3, t2) {
    let n3, a4;
    for (n3 of e3)
      if (a4 = await n3(r3, t2))
        return a4;
  };
}
function a3() {
  let n3, a4, s2 = {};
  return n3 = { add(r3, t2, n4) {
    let a5 = s2[r3];
    if (void 0 === a5 && (a5 = s2[r3] = { __d: /* @__PURE__ */ new Map(), __s: {} }), t2 instanceof RegExp)
      a5.__d.set(t2, { keys: [], handler: n4 });
    else if (/[:|*]/.test(t2)) {
      let { keys: r4, pattern: s3 } = parse(t2);
      a5.__d.set(s3, { keys: r4, handler: n4 });
    } else
      a5.__s[t2] = { keys: [], handler: n4 };
  }, mount(e3, r3) {
    a4 = a4 || {}, a4[e3] = r3.run;
  }, onerror(e3, r3) {
    let { error: n4, status: a5 = 500 } = r3, s3 = n4 && n4.message || a2[a5];
    return new Response(s3 || String(a5), { status: a5 });
  }, async run(e3, t2) {
    try {
      var o3, i2 = [];
      (t2 = t2 || {}).url = new URL(e3.url), t2.defer = (e4) => {
        i2.push(e4);
      }, t2.bindings = t2.bindings || {};
      var u = n3.prepare && await n3.prepare(e3, t2);
      if (u && u instanceof Response)
        return u;
      let f2, l = t2.url.pathname, p = l + "/";
      if (a4 && l.length > 1) {
        for (f2 in a4)
          if (p.startsWith(f2))
            return t2.url.pathname = l.substring(f2.length) || "/", u = await a4[f2](new Request(t2.url.href, e3), t2);
      }
      if (f2 = function(e4, r3, t3) {
        let n4, a5, s3, o4, i3, u2 = {};
        if (a5 = e4[r3]) {
          if (n4 = a5.__s[t3])
            return { params: u2, handler: n4.handler };
          for ([s3, o4] of a5.__d)
            if (i3 = s3.exec(t3), null !== i3) {
              if (void 0 !== i3.groups)
                for (n4 in i3.groups)
                  u2[n4] = i3.groups[n4];
              else if (o4.keys.length > 0)
                for (n4 = 0; n4 < o4.keys.length; )
                  u2[o4.keys[n4++]] = i3[n4];
              return { params: u2, handler: o4.handler };
            }
        }
      }(s2, e3.method, l), !f2)
        return t2.status = 404, u = await n3.onerror(e3, t2);
      t2.params = f2.params, u = await f2.handler(e3, t2);
    } catch (r3) {
      t2.status = 500, t2.error = r3, u = await n3.onerror(e3, t2);
    } finally {
      for (u = new Response(u ? u.body : "OK", u); o3 = i2.pop(); )
        await o3(u);
      return o2(u, "HEAD" === e3.method);
    }
  } };
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/cfw/index.mjs
function i(t2) {
  return { fetch: (n3, i2, s2) => t2(n3, { bindings: i2, waitUntil: s2.waitUntil.bind(s2), passThroughOnException: s2.passThroughOnException.bind(s2) }) };
}

// src/util.ts
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
function renderTemplate(template, data) {
  const pattern = /{{\s*(\w+)\s*}}/g;
  return template.replace(pattern, (_, key) => {
    return data[key] !== void 0 ? String(data[key]) : "";
  });
}
function maybePromise(value) {
  return value instanceof Promise ? value : Promise.resolve(value);
}

// src/middleware/index.ts
var init = (options = {}) => {
  const {
    robots = [],
    robotsOoverride = false,
    disablePaths = [],
    disablePathsOoverride = false
  } = options;
  return async function(req, context) {
    context.url ||= new URL(req.url);
    context.defer(async (res) => {
      context.bindings.GIT_HASH && res.headers.set("X-hash", context.bindings.GIT_HASH);
      context.bindings.VERSION && res.headers.set("X-version", context.bindings.VERSION);
    });
    if (context.url.pathname === "/robots.txt") {
      context.robots = robotsOoverride ? robots : ["User-agent: *", "Disallow: /", ...robots];
      return n(200, context.robots.join("\n"));
    }
    context.disablePaths = disablePathsOoverride ? disablePaths : ["/favicon.", "/sw.js", ...disablePaths];
    const match = context.disablePaths.some((path) => context.url.pathname.match(path));
    if (match)
      return n(204);
    const { domain, subdomain } = getDomainAndSubdomain(req);
    context.domain = domain;
    context.subdomain = subdomain;
  };
};

// src/middleware/proxy.ts
var create = (_req, context) => {
  context.$proxy = {
    genNewHeaders: (sourceHeaders, options = {}) => {
      const { headers = {}, override = false } = options;
      const defaultHeadersObject = {
        reason: "mirror of China"
      };
      if (sourceHeaders instanceof Request) {
        const request = sourceHeaders;
        sourceHeaders = new Headers(request.headers);
        const url = new URL(request.url);
        defaultHeadersObject.referer = url.origin;
        defaultHeadersObject.origin = url.origin;
        defaultHeadersObject.host = url.host;
      } else if (sourceHeaders instanceof Response) {
        const response = sourceHeaders;
        sourceHeaders = new Headers(response.headers);
        defaultHeadersObject["access-control-expose-headers"] = "*";
        defaultHeadersObject["access-control-allow-origin"] = "*";
        if (!options.override) {
          sourceHeaders.delete("content-security-policy");
          sourceHeaders.delete("content-security-policy-report-only");
          sourceHeaders.delete("clear-site-data");
        }
      } else {
        sourceHeaders = new Headers(sourceHeaders);
      }
      const headersObject = override ? headers : Object.assign({}, defaultHeadersObject, headers);
      const targetHeaders = new Headers(sourceHeaders);
      for (const [key, value] of Object.entries(headersObject))
        targetHeaders.set(key, String(value));
      return targetHeaders;
    },
    genNewRequest: (sourceRequest, url, options = {}) => {
      const newHeaders = context.$proxy.genNewHeaders(sourceRequest, {
        override: options.overrideHeaders,
        headers: options.headers
      });
      const defaultRequestInit = {
        redirect: "manual",
        headers: newHeaders
      };
      url = url instanceof URL ? url.toString() : url;
      const requestInit = options.overrideRequestInit ? options.requestInit || {} : { ...defaultRequestInit, ...options.requestInit || {} };
      return new Request(
        url,
        new Request(sourceRequest, requestInit)
      );
    },
    run: async (newURL, sourceRequest, options = {}) => {
      try {
        newURL = newURL instanceof URL ? newURL : new URL(newURL);
        const newRequest = context.$proxy.genNewRequest(sourceRequest, newURL, options);
        const res = await fetch(newURL.toString(), newRequest);
        const resHeadersObject = {};
        if (res.headers.has("location")) {
          const location = res.headers.get("location");
          if (location && options.updateLocation)
            resHeadersObject.location = await maybePromise(options.updateLocation(location));
          else
            resHeadersObject.location = `${context.url.origin}/${location}`;
        }
        let newHeaders = context.$proxy.genNewHeaders(res, {
          headers: Object.assign({}, res.headers, resHeadersObject, options.headers || {}),
          override: options.overrideHeaders
        });
        if (options.updatePostHeaders)
          newHeaders = await maybePromise(options.updatePostHeaders(newHeaders, res.headers));
        if (options.updatePostResponse) {
          const tmp = await maybePromise(options.updatePostResponse(res, newHeaders));
          if (tmp instanceof Response)
            return tmp;
        }
        return new Response(res.body, { status: res.status, headers: newHeaders });
      } catch (error) {
        console.log(error);
        return n(500, error.message);
      }
    }
  };
};

// src/home.html
var home_default = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>cf-proxy</title>
  </head>
  <body>
    <div style="position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: #181818; color: #ccc;">
      <div style="position: fixed; left: 50%; top: 150px; transform: translate3D(-50%, 0, 0)">
        <h2 style="color: #ccc; font-size: 32px; margin-bottom: 0; line-height: 1.6">\u6587\u4EF6\u4EE3\u7406\u52A0\u901F by Cloudflare Workers</h2>
        <p style="padding-bottom: 15px; margin-top: 0; font-size: 14px; color: #999;">
          \u6BCF\u65E5\u6709\u4F7F\u7528\u6B21\u6570\u9650\u5236\uFF0C\u5EFA\u8BAE\u901A\u8FC7 cloudflare workers \u90E8\u7F72\u81EA\u5DF1\u7684\u4EE3\u7406\u52A0\u901F\u670D\u52A1, \u90E8\u7F72\u6559\u7A0B\u8BF7\u53C2\u8003
          <a style="color: #999;" target="_blank" href="https://github.com/aliuq/cf-proxy/tree/master/workers/proxy">readme</a>
        </p>
        <form
          action="{{url}}"
          method="get" target="_blank"
          style="display: flex; align-items: center;"
          onsubmit="window.open('{{url}}/' + this.elements.url.value, '_blank'); return false;"
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
          {{url}}/<strong>&lt;file_path&gt;</strong>
      </p>
      </div>
      <div style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: #999; font-size: 14px;">
        <p>Copyright @ aliuq. All Rights Reserved. <span style="color: #555;user-select: none;"> {{version}}</span></p>
      </div>
    </div>
  </body>
</html>
`;

// src/index.ts
var API = new a3();
API.prepare = n2(
  init(),
  create
);
var methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
methods.forEach((method) => {
  API.add(method, "/", (req, context) => {
    const url = new URL(req.url);
    return n(
      200,
      renderTemplate(home_default, {
        url: url.origin,
        version: context.bindings.VERSION
      }),
      { "content-type": "text/html;charset=utf-8" }
    );
  });
  API.add(method, "/*", async (req, context) => {
    const newUrl = context.url.href.replace(context.url.origin, "").substring(1).replace(/^(https?:)\/+/g, "$1//");
    return context.$proxy.run(newUrl, req);
  });
});
var src_default = i(API.run);
export {
  src_default as default
};
//# sourceMappingURL=index.mjs.map