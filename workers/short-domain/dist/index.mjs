// ../../node_modules/.pnpm/regexparam@2.0.1/node_modules/regexparam/dist/index.mjs
function parse(str, loose) {
  if (str instanceof RegExp)
    return { keys: false, pattern: str };
  var c2, o5, tmp, ext, keys = [], pattern = "", arr = str.split("/");
  arr[0] || arr.shift();
  while (tmp = arr.shift()) {
    c2 = tmp[0];
    if (c2 === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c2 === ":") {
      o5 = tmp.indexOf("?", 1);
      ext = tmp.indexOf(".", 1);
      keys.push(tmp.substring(1, !!~o5 ? o5 : !!~ext ? ext : tmp.length));
      pattern += !!~o5 && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
      if (!!~ext)
        pattern += (!!~o5 ? "?" : "") + "\\" + tmp.substring(ext);
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
var n = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
function f(e5) {
  let r4 = 0, a6 = "", f4 = new Uint8Array(e5);
  for (; r4 < f4.length; r4++)
    a6 += n[f4[r4]];
  return a6;
}
var c = new TextEncoder();
var d = (e5) => c.encode(e5);
var o = new TextDecoder("utf-8");

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/utils/index.mjs
function f2(n4) {
  return n4 ? c.encode(n4).byteLength : 0;
}
async function i(t3) {
  let n4 = t3.headers.get("content-type");
  if (t3.body && n4)
    return ~n4.indexOf("application/json") ? t3.json() : ~n4.indexOf("multipart/form-data") || ~n4.indexOf("application/x-www-form-urlencoded") ? t3.formData().then(u) : ~n4.indexOf("text/") ? t3.text() : t3.arrayBuffer();
}
function u(t3) {
  let n4, r4, e5, o5 = {};
  for ([n4, r4] of t3)
    o5[n4] = void 0 === (e5 = o5[n4]) ? r4 : [].concat(e5, r4);
  return o5;
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/response/index.mjs
var t = "content-type";
var s = "content-length";
var a2 = { 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 406: "Not Acceptable", 409: "Conflict", 410: "Gone", 411: "Length Required", 413: "Payload Too Large", 422: "Unprocessable Entity", 426: "Upgrade Required", 428: "Precondition Required", 429: "Too Many Requests", 500: "Internal Server Error", 501: "Not Implemented", 502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout" };
function n2(a6, n4, r4) {
  let o5 = {};
  for (let e5 in r4)
    o5[e5.toLowerCase()] = r4[e5];
  let d3 = o5[t], i5 = typeof n4;
  return null == n4 ? n4 = "" : "object" === i5 ? (n4 = JSON.stringify(n4), d3 = d3 || "application/json;charset=utf-8") : "string" !== i5 && (n4 = String(n4)), o5[t] = d3 || "text/plain", o5[s] = o5[s] || String(n4.byteLength || f2(n4)), new Response(n4, { status: a6, headers: o5 });
}
var r2 = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function o2(e5, t3) {
  let a6 = r2.has(e5.status);
  if (!t3 && !a6)
    return e5;
  let n4 = new Response(null, e5);
  return a6 && n4.headers.delete(s), 205 === e5.status && n4.headers.set(s, "0"), n4;
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/router/index.mjs
function n3(...e5) {
  return async function(r4, t3) {
    let n4, a6;
    for (n4 of e5)
      if (a6 = await n4(r4, t3))
        return a6;
  };
}
function a3() {
  let n4, a6, s3 = {};
  return n4 = { add(r4, t3, n5) {
    let a7 = s3[r4];
    if (void 0 === a7 && (a7 = s3[r4] = { __d: /* @__PURE__ */ new Map(), __s: {} }), t3 instanceof RegExp)
      a7.__d.set(t3, { keys: [], handler: n5 });
    else if (/[:|*]/.test(t3)) {
      let { keys: r5, pattern: s4 } = parse(t3);
      a7.__d.set(s4, { keys: r5, handler: n5 });
    } else
      a7.__s[t3] = { keys: [], handler: n5 };
  }, mount(e5, r4) {
    a6 = a6 || {}, a6[e5] = r4.run;
  }, onerror(e5, r4) {
    let { error: n5, status: a7 = 500 } = r4, s4 = n5 && n5.message || a2[a7];
    return new Response(s4 || String(a7), { status: a7 });
  }, async run(e5, t3) {
    try {
      var o5, i5 = [];
      (t3 = t3 || {}).url = new URL(e5.url), t3.defer = (e6) => {
        i5.push(e6);
      }, t3.bindings = t3.bindings || {};
      var u3 = n4.prepare && await n4.prepare(e5, t3);
      if (u3 && u3 instanceof Response)
        return u3;
      let f4, l2 = t3.url.pathname, p = l2 + "/";
      if (a6 && l2.length > 1) {
        for (f4 in a6)
          if (p.startsWith(f4))
            return t3.url.pathname = l2.substring(f4.length) || "/", u3 = await a6[f4](new Request(t3.url.href, e5), t3);
      }
      if (f4 = function(e6, r4, t4) {
        let n5, a7, s4, o6, i6, u4 = {};
        if (a7 = e6[r4]) {
          if (n5 = a7.__s[t4])
            return { params: u4, handler: n5.handler };
          for ([s4, o6] of a7.__d)
            if (i6 = s4.exec(t4), null !== i6) {
              if (void 0 !== i6.groups)
                for (n5 in i6.groups)
                  u4[n5] = i6.groups[n5];
              else if (o6.keys.length > 0)
                for (n5 = 0; n5 < o6.keys.length; )
                  u4[o6.keys[n5++]] = i6[n5];
              return { params: u4, handler: o6.handler };
            }
        }
      }(s3, e5.method, l2), !f4)
        return t3.status = 404, u3 = await n4.onerror(e5, t3);
      t3.params = f4.params, u3 = await f4.handler(e5, t3);
    } catch (r4) {
      t3.status = 500, t3.error = r4, u3 = await n4.onerror(e5, t3);
    } finally {
      for (u3 = new Response(u3 ? u3.body : "OK", u3); o5 = i5.pop(); )
        await o5(u3);
      return o2(u3, "HEAD" === e5.method);
    }
  } };
}

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/cfw/index.mjs
function i2(t3) {
  return { fetch: (n4, i5, s3) => t3(n4, { bindings: i5, waitUntil: s3.waitUntil.bind(s3), passThroughOnException: s3.passThroughOnException.bind(s3) }) };
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
var ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
function randomString(len) {
  let str = "";
  let num = len || 6;
  const arr = crypto.getRandomValues(new Uint8Array(num));
  while (num--)
    str += ALPHANUM[arr[num] & 61];
  return str;
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
    const url = new URL(req.url);
    context.defer(async (res) => {
      res.headers.set("X-hash", context.bindings.GIT_HASH);
      res.headers.set("X-version", context.bindings.VERSION);
    });
    if (url.pathname === "/robots.txt") {
      context.robots = robotsOoverride ? robots : ["User-agent: *", "Disallow: /", ...robots];
      return n2(200, context.robots.join("\n"));
    }
    context.disablePaths = disablePathsOoverride ? disablePaths : ["/favicon.", "/sw.js", ...disablePaths];
    const match = context.disablePaths.some((path) => url.pathname.match(path));
    if (match)
      return n2(204);
    const { domain, subdomain } = getDomainAndSubdomain(req);
    context.domain = domain;
    context.subdomain = subdomain;
  };
};

// src/middleware/auth.ts
var load = async function(req, context) {
  const auth = req.headers.get("Authorization");
  context.isLogin = false;
  if (auth) {
    const str = atob(auth.split(" ")[1]);
    const [username, password] = str.split(":");
    context.isLogin = username === context.bindings.ADMIN_USERNAME && password === context.bindings.ADMIN_PASSWORD;
  }
};
var identify = async function(req, context) {
  if (context.isLogin)
    return;
  return n2(401, "Unauthorized", {
    "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"'
  });
};

// src/new.html
var new_default = `<html>

<head>
  <title>\u6DFB\u52A0\u77ED\u7F51\u5740</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
  <!-- Vue -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <!-- ElementPlus -->
  <link rel="stylesheet" href="https://unpkg.com/element-plus@2.2.28/dist/index.css">
  <link rel="stylesheet" href="https://unpkg.com/element-plus@2.2.28/theme-chalk/dark/css-vars.css">
  <script src="https://unpkg.com/element-plus@2.2.28/dist/index.full.min.js"></script>
  <!-- Vueuse -->
  <script src="https://unpkg.com/@vueuse/shared@9.10.0"></script>
  <script src="https://unpkg.com/@vueuse/core@9.10.0"></script>
  <style>
    [v-cloak] { display: none; }
    [un-cloak] { display: none; }
  </style>
</head>

<body>
  <div id="app" v-cloak un-cloak>
    <div class="absolute top-4 right-4 flex justify-center">
      <el-icon v-if="isAuth" class="cursor-pointer mr-4" size="32" opacity="75 hover:100" i-carbon-user-admin @click="onJump('/admin')"></el-icon>
      <el-icon class="cursor-pointer mr-4" size="32" opacity="75 hover:100" i="carbon-sun dark:carbon-moon" @click="toggleDark()"></el-icon>
      <a class="cursor-pointer text-8" opacity="75 hover:100" i="carbon-logo-github" href="https://github.com/aliuq/cf-proxy/tree/master/workers/short-domain" target="_blank"></a>
    </div>

    <main class="mx-auto md:max-w-800px md:my-50px">
      <div class="h-60px mb-4">
        <h2 class="text-2xl font-bold text-$el-text-color-primary">
          \u6DFB\u52A0\u77ED\u7F51\u5740
          <i class="text-lg select-none font-400 text-gray-300/50 ml-2px not-italic">{{ VERSION }}</i>
        </h2>
        <p class="text-sm text-$el-text-color-secondary flex-center justify-start">\u6DFB\u52A0\u6210\u529F\u6216\u8005url\u5DF2\u7ECF\u5B58\u5728\u5C06\u4F1A\u81EA\u52A8\u5C06\u77ED\u7F51\u5740\u590D\u5236\u5230\u526A\u8D34\u677F</p>
      </div>

      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" size="large" label-position="top" label-width="120px" status-icon>
        <el-form-item label="ID" prop="id" v-if="isAuth">
          <el-input v-model="ruleForm.id" resize="none" autocomplete="on" placeholder="\u652F\u6301\u81EA\u5B9A\u4E49ID, \u5982: https://example.com/abc \u4E2D\u7684 abc" class="break-all"></el-input>
        </el-form-item>
        <el-form-item label="URL" prop="url">
          <el-input v-model="ruleForm.url" type="textarea" :autosize="{ minRows: 3, maxRows: 20 }" resize="none" autocomplete="on" placeholder="\u8F93\u5165URL, https://www.example.com" class="break-all"></el-input>
        </el-form-item>
        <el-form-item>
          <div class="w-full flex justify-end">
            <el-button type="primary" :loading="isLoading" @click="submitForm(ruleFormRef)">\u6DFB\u52A0</el-button>
          </div>
        </el-form-item>

        <el-descriptions v-if="data.id && data.source" title="\u6DFB\u52A0\u7ED3\u679C" :column="1" border class="mt-4" >
          <el-descriptions-item label="\u77ED\u7F51\u5740" class-name="break-all" label-class-name="w-20 select-none">
            <el-button type="success" link class="!whitespace-normal !text-left !leading-6" @click="onCopy(data.id)">/{{ data.id }}</el-button>
          </el-descriptions-item>
          <el-descriptions-item label="\u539F\u7F51\u5740" class-name="break-all" label-class-name="w-20 select-none">
            <el-button type="success" link class="!whitespace-normal !text-left !leading-6" @click="onJump(data.source)">{{ data.source }}</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </main>

    
    <script type="module" setup>
      // UnoCSS
      import init from 'https://esm.sh/@unocss/runtime@0.48.3'
      import presetUno from 'https://esm.sh/@unocss/preset-uno@0.48.3'
      import presetAttributify from 'https://esm.sh/@unocss/preset-attributify@0.48.3'
      import presetMini from 'https://esm.sh/@unocss/preset-mini@0.48.3'
      import presetIcons from 'https://esm.sh/@unocss/preset-icons@0.48.3/browser'
      import { presetScrollbar } from 'https://esm.sh/unocss-preset-scrollbar@0.2.1'

      init({
        defaults: {
          presets: [
            presetUno(),
            presetAttributify(),
            presetMini(),
            presetIcons({ cdn: 'https://esm.sh/' }),
            presetScrollbar(),
          ],
          rules: [],
          shortcuts: [{ 'flex-center': 'flex justify-center items-center' }],
        },
      })

      const { useDark, useToggle } = window.VueUse
      const { createApp, ref, computed, reactive } = window.Vue
      const ElementPlus = window.ElementPlus.default
      const { ElMessage } = window.ElementPlus

      const app = createApp({
        setup() {
          const request = async (url, options) => {
            const res = await fetch(url, Object.assign({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            }, options))
            const data = await res.json()
            if (data.error) {
              ElMessage.error({ message: data.error })
              return
            }
            return data
          }

          const isDark = useDark()
          const toggleDark = useToggle(isDark)

          const cookies = reactive(document.cookie.split(';').reduce((acc, cur) => {
            const [key, value] = cur.split('=')
            acc[key.trim()] = value === 'true' ? true : value === 'false' ? false : value
            return acc
          }, {}))
          const isAuth = computed(() => !!cookies.auth)

          const isLoading = ref(false)
          const data = ref({})

          const onCopy = async (text, showTips = true) => {
            if (navigator?.clipboard) {
              await navigator.clipboard.writeText(new URL(text, location))
            }
            else {
              const el = document.createElement('textarea')
              el.value = text
              document.body.appendChild(el)
              el.select()
              document.execCommand('copy')
              document.body.removeChild(el)
            }
            if (showTips)
              ElMessage.success({ message: '\u590D\u5236\u6210\u529F' })
          }
          const onJump = (url) => {
            window.open(url, '_blank')
          }

          const ruleFormRef = ref()
          const ruleForm = reactive({ url: '', id: '' })
          const validateUrl = (rule, value, callback) => {
            if (!value)
              callback(new Error('\u8BF7\u8F93\u5165URL'))
      
            if (!value.match(/^https?:\\/\\//))
              callback(new Error('\u8BF7\u8F93\u5165\u6B63\u786E\u7684URL'))
      
            callback()
          }
          const validateId = (rule, value, callback) => {
            if (value && !value.match(/^[a-zA-Z0-9]+[a-zA-Z0-9_-]*?$/))
              callback(new Error('\u8BF7\u8F93\u5165\u6B63\u786E\u7684ID, \u4EE5\u5B57\u6BCD\u3001\u6570\u5B57\u5F00\u5934\uFF0C\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u548C\u4E2D\u5212\u7EBF'))
            callback()
          }
          const rules = reactive({
            url: [{ validator: validateUrl, trigger: 'change' }],
            id: [{ validator: validateId, trigger: 'change' }],
          })
          const submitForm = (formEl) => {
            if (!formEl)
              return
            formEl.validate(async (valid) => {
              if (!valid)
                return false

              isLoading.value = true
              const url = encodeURIComponent(decodeURIComponent(ruleForm.url))
              const res = await request('/api/new', { body: JSON.stringify({ url, id: ruleForm.id }) }).catch((err) => {
                isLoading.value = false
                ElMessage.error({ message: err.message })
              })
              isLoading.value = false
              if (res.code !== 0)
                ElMessage.error({ message: res.message })
              else
                ElMessage.success({ message: '\u6DFB\u52A0\u6210\u529F' })

              if (res.data) {
                ruleForm.url = ''
                formEl.resetFields()
                data.value = res.data
                await onCopy(res.data.id, false)
              }
            })
          }
      
          return { isDark, toggleDark, isAuth, isLoading, ruleFormRef, ruleForm, rules, submitForm, data, onCopy, onJump }
        },
      })
      app.use(ElementPlus)
      app.mount('#app')
    </script>
</body>

</html>
`;

// src/manage.html
var manage_default = `<html>

<head>
  <title>Short Domain Manage</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
  <!-- Reset Css -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css">
  <!-- Vue -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <!-- VueVirtualScroller -->
  <link rel="stylesheet" href="https://unpkg.com/vue-virtual-scroller/dist/vue-virtual-scroller.css"/>
  <script src="https://unpkg.com/vue-virtual-scroller@2.0.0-beta.7/dist/vue-virtual-scroller.min.js"></script>
  <!-- ElementPlus -->
  <link rel="stylesheet" href="https://unpkg.com/element-plus@2.2.28/dist/index.css">
  <link rel="stylesheet" href="https://unpkg.com/element-plus@2.2.28/theme-chalk/dark/css-vars.css">
  <script src="https://unpkg.com/element-plus@2.2.28/dist/index.full.min.js"></script>
  <!-- Vueuse -->
  <script src="https://unpkg.com/@vueuse/shared@9.10.0"></script>
  <script src="https://unpkg.com/@vueuse/core@9.10.0"></script>
  <style>
    [v-cloak] { display: none; }
    [un-cloak] { display: none; }
  </style>
</head>

<body>
  <div id="app" v-cloak un-cloak class="w-screen h-screen overflow-hidden">
    <div class="absolute top-4 right-4 flex items-center">
      <el-icon class="cursor-pointer mr-4" size="32" opacity="75 hover:100" i-carbon-add-alt @click="actions.jump({ source: '/' })"></el-icon>
      <el-icon class="cursor-pointer" size="32" opacity="75 hover:100" i="carbon-sun dark:carbon-moon" @click="toggleDark()"></el-icon>
    </div>

    <main class="mx-auto md:max-w-1200px md:my-50px">
      <div class="h-60px flex items-center justify-between">
        <h2 class="text-2xl font-bold text-$el-text-primary">\u6240\u6709\u77ED\u7F51\u5740({{ list.length }})</h2>
        <el-input v-model="filter" class="!w-2/5" placeholder="\u8F93\u5165\u77ED\u7F51\u5740\u6216\u6E90\u5730\u5740" @keydown.enter.prevent="onFilter">
          <template #append>
            <el-button class="!rounded-l-0" hover="!border-$el-color-primary !text-$el-color-primary" @click="onFilter">\u641C\u7D22</el-button>
          </template>
        </el-input>
      </div>

      <div class="w-full text-sm shadow-sm table-border" bg="white dark:dark" text="dark-200 dark:light-200">
        <div class="flex items-center select-none font-semibold text-base" bg="light-300 dark:dark-300">
          <span class="w-20 table-th justify-center px-0">\u5E8F\u53F7</span>
          <span class="flex-1 table-th max-w-300px">\u77ED\u7F51\u5740</span>
          <span class="flex-1 table-th">\u6E90\u7F51\u5740</span>
          <span class="flex-1 table-th max-w-240px">\u64CD\u4F5C</span>
        </div>
        <template v-if="list.length">
          <dynamic-scroller
            :items="list"
            :min-item-size="54"
            class="h-[calc(100vh-208px)] w-full !overflow-overlay"
            scrollbar="~ rounded"
            scrollbar-track-color="transparent hover:black-/10 dark:hover:white-/10"
            scrollbar-thumb-color="black-/25 dark:white-/20 hover:black-/40 hover:dark:white-/30"
            v-slot="{ item, index, active }"
          >
            <dynamic-scroller-item
              class="flex transition-all table-border border-0 border-b box-border hover:bg-light-300 dark:hover:bg-dark-300"
              :item="item"
              :data-index="index"
              :active="active"
              :size-dependencies="[item.id,item.source]"
            >
              <div class="w-20 table-td justify-center text-base px-0 select-none">{{ index + 1 }}</div>
              <div class="flex-1 table-td max-w-300px" :title="item.id">{{ item.id }}</div>
              <div class="flex-1 table-td overflow-hidden break-all" :title="item.source">
                <a :href="item.source" target="_blank">{{ item.source }}</a>
              </div>
              <div class="w-240px flex-shrink-0 table-td">
                <el-button-group size="small">
                  <el-popconfirm title="\u786E\u5B9A\u5220\u9664\u5417?" confirm-button-text="\u786E\u8BA4" cancel-button-text="\u53D6\u6D88" @confirm="actions.delete(item, index)">
                    <template #reference>
                      <el-button type="danger"> <template #icon><el-icon i="material-symbols-delete-outline"></el-icon></template>\u5220\u9664</el-button>
                    </template>
                  </el-popconfirm>
                  <el-button type="primary" @click="actions.copy(item)"> <template #icon><el-icon i="carbon-copy"></el-icon></template>\u590D\u5236</el-button>
                  <el-button type="success" @click="actions.jump(item)"> <template #icon><el-icon i="carbon-launch"></el-icon></template>\u8BBF\u95EE</el-button>
                </el-button-group>
              </div>
            </dynamic-scroller-item>
          </dynamic-scroller>
        </template>
        <template v-else>
          <div class="text-center text-xl py-4 text-slate-400">
            <el-empty description="\u6682\u65E0\u6570\u636E" />
          </div>
        </template>
      </div>
    </main>
  </div>
    
  <script type="module">
    // UnoCSS
    import init from 'https://esm.sh/@unocss/runtime@0.48.3'
    import presetUno from 'https://esm.sh/@unocss/preset-uno@0.48.3'
    import presetAttributify from 'https://esm.sh/@unocss/preset-attributify@0.48.3'
    import presetMini from 'https://esm.sh/@unocss/preset-mini@0.48.3'
    import presetIcons from 'https://esm.sh/@unocss/preset-icons@0.48.3/browser'
    import { presetScrollbar } from 'https://esm.sh/unocss-preset-scrollbar@0.2.1'

    init({
      defaults: {
        presets: [
          presetUno(),
          presetAttributify(),
          presetMini(),
          presetIcons({ cdn: 'https://esm.sh/' }),
          presetScrollbar(),
        ],
        rules: [],
        shortcuts: [{
          'table-border': 'border border-solid border-light-600 dark:border-dark-200',
          'table-th': 'table-border border-0 siblings:border-l p-4 flex items-center ',
          'table-td': 'table-border p-4 border-0 siblings:border-l flex items-center text-sm flex-shrink-0',
        }],
      },
    })

    const { useDark, useToggle } = window.VueUse
    const { createApp, ref, onMounted } = window.Vue
    const VueVirtualScroller = window.VueVirtualScroller.default
    const ElementPlus = window.ElementPlus.default
    const { ElMessage } = window.ElementPlus

    const app = createApp({
      setup() {
        const request = async (url, options) => {
          const res = await fetch(url, Object.assign({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }, options))
          const data = await res.json()
          if (data.error) {
            ElMessage.error({ message: data.error })
            return
          }
          return data
        }

        const chunkArray = (arr, chunkSize) => {
          return arr.reduce((chunks, el, i) => {
            if (i % chunkSize === 0)
              chunks.push([el])
            else
              chunks[chunks.length - 1].push(el)

            return chunks
          }, [])
        }

        const isDark = useDark()
        const toggleDark = useToggle(isDark)

        const listKeys = ref([])
        const sourceList = []
        const list = ref([])
        const getList = async () => {
          const res = await request('/api/list')
          listKeys.value = res.data

          const chunked = chunkArray(listKeys.value, 500)
          for await (const chunk of chunked) {
            const res = await request('/api/list/detail', { body: JSON.stringify({ ids: chunk }) })
            sourceList.push(...Object.assign([], res.data))
            list.value.push(...res.data)
          }
        }

        const filter = ref('')
        const onFilter = async () => {
          list.value = sourceList.filter(item => item.source.includes(filter.value) || item.id.includes(filter.value))
        }
    
        const actions = {
          async delete(row, index) {
            const data = await request('/api/delete', { body: JSON.stringify({ id: row.id }) })
            if (data) {
              const sourceIndex = sourceList.findIndex(item => item.id === row.id)
              sourceList.splice(sourceIndex, 1)
              list.value.splice(index, 1)
              ElMessage.success({ message: '\u5220\u9664\u6210\u529F' })
              if (list.value.length === 0) {
                filter.value = ''
                onFilter()
              }
            }
          },
          copy: (row) => {
            navigator.clipboard.writeText(new URL(row.id, location))
            ElMessage.success({ message: '\u590D\u5236\u6210\u529F' })
          },
          jump: (row) => {
            window.open(row.source, '_blank')
          },
        }

        onMounted(() => {
          getList()
        })

        return { list, isDark, toggleDark, filter, onFilter, actions }
      },
    })
    app.use(VueVirtualScroller)
    app.use(ElementPlus)
    app.mount('#app')
  </script>
</body>

</html>
`;

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/crypto/index.mjs
function e3(e5, r4) {
  return crypto.subtle.digest(e5, d(r4)).then(f);
}
var r3 = e3.bind(0, "MD5");
var s2 = e3.bind(0, "SHA-1");
var a4 = e3.bind(0, "SHA-256");
var i3 = e3.bind(0, "SHA-384");
var u2 = e3.bind(0, "SHA-512");
function o3(n4, e5, r4) {
  return crypto.subtle.importKey("raw", d(e5), n4, false, r4);
}
function b(n4, e5, r4) {
  return crypto.subtle.sign(n4, e5, d(r4));
}
function y(t3, n4, e5) {
  return o3({ name: "HMAC", hash: t3 }, n4, ["sign"]).then((t4) => b("HMAC", t4, e5));
}
var d2 = y.bind(0, "SHA-256");
var l = y.bind(0, "SHA-384");
var S = y.bind(0, "SHA-512");

// ../../node_modules/.pnpm/worktop@0.8.0-next.14/node_modules/worktop/cfw.kv/index.mjs
var t2 = Object.defineProperty;
var e4 = (e5, i5, a6) => (((e6, i6, a7) => {
  i6 in e6 ? t2(e6, i6, { enumerable: true, configurable: true, writable: true, value: a7 }) : e6[i6] = a7;
})(e5, "symbol" != typeof i5 ? i5 + "" : i5, a6), a6);
function i4(t3) {
  return "string" == typeof t3 || t3 instanceof ArrayBuffer || t3 instanceof ReadableStream ? t3 : JSON.stringify(t3);
}
var a5 = (t3) => `cache://${encodeURIComponent(t3)}`;
async function* o4(t3, e5) {
  let { prefix: i5, limit: a6, cursor: n4, metadata: r4 } = e5 || {};
  for (; ; ) {
    let e6 = await t3.list({ prefix: i5, limit: a6, cursor: n4 });
    if (n4 = e6.cursor, yield { done: e6.list_complete, keys: r4 ? e6.keys : e6.keys.map((t4) => t4.name) }, e6.list_complete)
      return;
  }
}
function f3(t3, e5) {
  return !t3 || e5.startsWith(t3 + "~") ? e5 : t3 + "~" + e5;
}
var h = class {
  constructor(t3) {
    e4(this, "ns"), e4(this, "cache"), e4(this, "prefix", ""), e4(this, "ttl", 0), this.cache = new class {
      get(t4) {
        let e5 = a5(t4);
        return caches.default.match(e5);
      }
      put(t4, e5, n4) {
        if (!n4)
          return Promise.resolve(true);
        let r4 = { "cache-control": `public,max-age=${n4}` }, s3 = null == e5 ? null : i4(e5), l2 = new Response(s3, { headers: r4 }), o5 = a5(t4);
        return caches.default.put(o5, l2).then(() => true, () => false);
      }
      delete(t4) {
        let e5 = a5(t4);
        return caches.default.delete(e5);
      }
    }(), this.ns = t3;
  }
  async list(t3) {
    t3 = t3 || {};
    let { limit: e5, prefix: i5 = "" } = t3;
    this.prefix && (t3.prefix = f3(this.prefix, i5)), e5 && (t3.limit = Math.min(1e3, e5));
    let a6 = o4(this.ns, { ...t3, metadata: false }), n4 = [];
    for await (let t4 of a6) {
      for (let i6 = 0, a7 = this.prefix.length; i6 < t4.keys.length; i6++)
        if (n4.push(t4.keys[i6].substring(a7)), e5 && n4.length === e5)
          return n4;
      if (t4.done)
        break;
    }
    return n4;
  }
  async get(t3) {
    t3 = f3(this.prefix, t3);
    let e5, i5 = this.ttl && await this.cache.get(t3);
    return i5 ? e5 = await i5.json() : (e5 = await this.ns.get(t3, "json"), this.ttl && await this.cache.put(t3, e5, this.ttl)), this.onread && await this.onread(t3, e5), e5;
  }
  async put(t3, e5) {
    t3 = f3(this.prefix, t3);
    let a6 = i4(e5), n4 = await this.ns.put(t3, a6).then(() => true, () => false);
    if (n4 && this.ttl) {
      let i5 = null == e5 ? null : a6;
      n4 = await this.cache.put(t3, i5, this.ttl);
    }
    return n4 && this.onwrite && await this.onwrite(t3, e5), n4;
  }
  async delete(t3) {
    t3 = f3(this.prefix, t3);
    let e5 = "function" == typeof this.ondelete, i5 = e5 && await this.ns.get(t3, "json"), a6 = await this.ns.delete(t3).then(() => true, () => false);
    return a6 && this.ttl && (a6 = await this.cache.delete(t3)), a6 && e5 && await this.ondelete(t3, i5), a6;
  }
};

// src/model.ts
var Ids = class extends h {
  prefix = "id";
  async onwrite(key, value) {
    if (!value)
      return;
    const md5Key = `md5~${value.md5}`;
    await this.ns.put(md5Key, JSON.stringify(value));
  }
  async ondelete(key, value) {
    if (!value)
      return;
    const md5Key = `md5~${value.md5}`;
    await this.ns.delete(md5Key);
  }
};
var Md5s = class extends h {
  prefix = "md5";
};

// src/routes/api.ts
var Short = new a3();
Short.prepare = (req, context) => {
  context.$ids = context.$ids || new Ids(context.bindings.SHORTURLS);
  context.$md5s = context.$md5s || new Md5s(context.bindings.SHORTURLS);
};
Short.add("POST", "/new", async (req, context) => {
  try {
    const params = await i(req);
    if (!params?.url)
      return n2(400, "Bad Request");
    const url = new URL(decodeURIComponent(params.url.toString()));
    const md5 = await r3(url.toString());
    const exist = await context.$md5s.get(md5);
    if (exist) {
      return n2(200, { data: exist, msg: "Already exists", code: 0 });
    } else {
      let id = randomString();
      if (context.isLogin && params.id)
        id = params.id;
      const data = { id, md5, source: url.toString() };
      await context.$ids.put(id, data);
      return n2(200, { data, msg: "OK", code: 0 });
    }
  } catch (err) {
    return n2(400, `Failed: ${err.message}`);
  }
});
Short.add("POST", "/list", async (req, context) => {
  try {
    if (!context.isLogin)
      return n2(401, "Unauthorized");
    const list = (await context.$ids.list()).map((l2) => l2.slice(1));
    return n2(200, { data: list, msg: "OK", code: 0 });
  } catch (err) {
    return n2(400, `Failed: ${err.message}`);
  }
});
Short.add("POST", "/list/detail", async (req, context) => {
  try {
    if (!context.isLogin)
      return n2(401, "Unauthorized");
    const params = await i(req);
    if (!params?.ids)
      return n2(400, "Bad Request");
    const list = await Promise.all(params.ids.map((id) => context.$ids.get(id)));
    return n2(200, { data: list, msg: "OK", code: 0 });
  } catch (err) {
    return n2(400, `Failed: ${err.message}`);
  }
});
Short.add("POST", "/delete", async (req, context) => {
  try {
    if (!context.isLogin)
      return n2(401, "Unauthorized");
    const params = await i(req);
    if (!params?.id)
      return n2(400, "Bad Request");
    await context.$ids.delete(params.id);
    return n2(200, { data: null, msg: "OK", code: 0 });
  } catch (err) {
    return n2(400, `Failed: ${err.message}`);
  }
});

// src/index.ts
var API = new a3();
API.prepare = n3(
  init(),
  load
);
API.add("GET", "/", (_req, context) => {
  return n2(200, renderTemplate(new_default, context.bindings), {
    "Content-Type": "text/html;charset=utf-8",
    "Set-Cookie": `auth=${context.isLogin}; path=/;`
  });
});
API.add("GET", "/admin", async (req, context) => {
  const tmp = await n3(identify)(req, context);
  if (tmp instanceof Response)
    return tmp;
  return n2(200, manage_default, {
    "Content-Type": "text/html;charset=utf-8"
  });
});
API.add("GET", "/:id", async (req, context) => {
  context.$ids = context.$ids || new Ids(context.bindings.SHORTURLS);
  const data = await context.$ids.get(context.params.id);
  if (!data)
    return n2(404, "Not Found");
  return n2(302, "", { Location: data.source });
});
API.mount("/api/", Short);
var src_default = i2(API.run);
export {
  src_default as default
};
//# sourceMappingURL=index.mjs.map