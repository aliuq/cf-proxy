async function replyText(text, env, init = {}) {
  return new Response(text, deepMerge({
    status: 200,
    headers: { "content-type": "text/plain;charset=UTF-8", "version": env.VERSION }
  }, init));
}
async function replyHtml(html, env, init = {}) {
  return new Response(html, deepMerge({
    status: 200,
    headers: { "content-type": "text/html;charset=UTF-8", "version": env.VERSION }
  }, init));
}
async function replyUnsupport(options, env, init = {}) {
  return new Response(renderTemplate("Unsupported url {{ url }}", options), deepMerge({
    status: 200,
    headers: { "content-type": "text/plain;charset=UTF-8", "version": env.VERSION }
  }, init));
}
async function replyJson(json, env, init = {}) {
  return new Response(JSON.stringify(json), deepMerge({
    status: 200,
    headers: { "content-type": "application/json;charset=UTF-8", "version": env.VERSION }
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

const NewUI = "<html>\n\n<head>\n  <title>添加短网址</title>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, user-scalable=no\" />\n  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css\">\n  <!-- Vue -->\n  <script src=\"https://unpkg.com/vue@3/dist/vue.global.prod.js\"></script>\n  <!-- ElementPlus -->\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/element-plus@2.2.28/dist/index.css\">\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/element-plus@2.2.28/theme-chalk/dark/css-vars.css\">\n  <script src=\"https://unpkg.com/element-plus@2.2.28/dist/index.full.min.js\"></script>\n  <!-- Vueuse -->\n  <script src=\"https://unpkg.com/@vueuse/shared@9.10.0\"></script>\n  <script src=\"https://unpkg.com/@vueuse/core@9.10.0\"></script>\n  <style>\n    [v-cloak] { display: none; }\n    [un-cloak] { display: none; }\n  </style>\n</head>\n\n<body>\n  <div id=\"app\" v-cloak un-cloak>\n    <div class=\"absolute top-4 right-4 flex justify-center\">\n      <el-icon v-if=\"isAuth\" class=\"cursor-pointer mr-4\" size=\"32\" opacity=\"75 hover:100\" i-carbon-user-admin @click=\"onJump('/admin')\"></el-icon>\n      <el-icon class=\"cursor-pointer\" size=\"32\" opacity=\"75 hover:100\" i=\"carbon-sun dark:carbon-moon\" @click=\"toggleDark()\"></el-icon>\n    </div>\n\n    <main class=\"mx-auto md:max-w-800px md:my-50px\">\n      <div class=\"h-60px mb-4\">\n        <h2 class=\"text-2xl font-bold text-$el-text-color-primary\">添加短网址</h2>\n        <p class=\"text-sm text-$el-text-color-secondary flex-center justify-start\">添加成功或者url已经存在将会自动将短网址复制到剪贴板</p>\n      </div>\n\n      <el-form ref=\"ruleFormRef\" :model=\"ruleForm\" :rules=\"rules\" size=\"large\" label-position=\"top\" label-width=\"120px\" status-icon>\n        <el-form-item label=\"ID\" prop=\"id\" v-if=\"isAuth\">\n          <el-input v-model=\"ruleForm.id\" resize=\"none\" autocomplete=\"on\" placeholder=\"支持自定义ID, 如: https://short.domain/abc\" class=\"break-all\"></el-input>\n        </el-form-item>\n        <el-form-item label=\"URL\" prop=\"url\">\n          <el-input v-model=\"ruleForm.url\" type=\"textarea\" :autosize=\"{ minRows: 3, maxRows: 20 }\" resize=\"none\" autocomplete=\"on\" placeholder=\"输入URL, https://www.baidu.com\" class=\"break-all\"></el-input>\n        </el-form-item>\n        <el-form-item>\n          <div class=\"w-full flex justify-end\">\n            <el-button type=\"primary\" :loading=\"isLoading\" @click=\"submitForm(ruleFormRef)\">添加</el-button>\n          </div>\n        </el-form-item>\n\n        <el-descriptions v-if=\"data.short && data.source\" title=\"添加结果\" :column=\"1\" border class=\"mt-4\" >\n          <el-descriptions-item label=\"短网址\" class-name=\"break-all\" label-class-name=\"w-20 select-none\">\n            <el-button type=\"success\" link class=\"!whitespace-normal !text-left !leading-6\" @click=\"onCopy(data.short)\">{{ data.short }}</el-button>\n          </el-descriptions-item>\n          <el-descriptions-item label=\"原网址\" class-name=\"break-all\" label-class-name=\"w-20 select-none\">\n            <el-button type=\"success\" link class=\"!whitespace-normal !text-left !leading-6\" @click=\"onJump(data.source)\">{{ data.source }}</el-button>\n          </el-descriptions-item>\n        </el-descriptions>\n      </el-form>\n    </main>\n\n    \n    <script type=\"module\" setup>\n      // UnoCSS\n      import init from 'https://esm.sh/@unocss/runtime@0.48.3'\n      import presetUno from 'https://esm.sh/@unocss/preset-uno@0.48.3'\n      import presetAttributify from 'https://esm.sh/@unocss/preset-attributify@0.48.3'\n      import presetMini from 'https://esm.sh/@unocss/preset-mini@0.48.3'\n      import presetIcons from 'https://esm.sh/@unocss/preset-icons@0.48.3/browser'\n      import { presetScrollbar } from 'https://esm.sh/unocss-preset-scrollbar@0.2.1'\n\n      init({\n        defaults: {\n          presets: [\n            presetUno(),\n            presetAttributify(),\n            presetMini(),\n            presetIcons({ cdn: 'https://esm.sh/' }),\n            presetScrollbar(),\n          ],\n          rules: [],\n          shortcuts: [{ 'flex-center': 'flex justify-center items-center' }],\n        },\n      })\n\n      const { useDark, useToggle } = window.VueUse\n      const { createApp, ref, computed, reactive } = window.Vue\n      const ElementPlus = window.ElementPlus.default\n      const { ElMessage } = window.ElementPlus\n\n      const app = createApp({\n        setup() {\n          const request = async (url, options) => {\n            const res = await fetch(url, Object.assign({\n              method: 'POST',\n              headers: { 'Content-Type': 'application/json' },\n            }, options))\n            const data = await res.json()\n            if (data.error) {\n              ElMessage.error({ message: data.error })\n              return\n            }\n            return data\n          }\n\n          const isDark = useDark()\n          const toggleDark = useToggle(isDark)\n\n          const cookies = reactive(document.cookie.split(';').reduce((acc, cur) => {\n            const [key, value] = cur.split('=')\n            acc[key.trim()] = value === 'true' ? true : value === 'false' ? false : value\n            return acc\n          }, {}))\n          const isAuth = computed(() => !!cookies.auth)\n\n          const isLoading = ref(false)\n          const data = ref({})\n\n          const onCopy = async (text, showTips = true) => {\n            if (navigator?.clipboard) {\n              await navigator.clipboard.writeText(text)\n            }\n            else {\n              const el = document.createElement('textarea')\n              el.value = text\n              document.body.appendChild(el)\n              el.select()\n              document.execCommand('copy')\n              document.body.removeChild(el)\n            }\n            if (showTips)\n              ElMessage.success({ message: '复制成功' })\n          }\n          const onJump = (url) => {\n            window.open(url, '_blank')\n          }\n\n          const ruleFormRef = ref()\n          const ruleForm = reactive({ url: '', id: '' })\n          const validateUrl = (rule, value, callback) => {\n            if (!value)\n              callback(new Error('请输入URL'))\n      \n            if (!value.match(/^https?:\\/\\//))\n              callback(new Error('请输入正确的URL'))\n      \n            callback()\n          }\n          const validateId = (rule, value, callback) => {\n            if (value && !value.match(/^[a-zA-Z0-9]+[a-zA-Z0-9_-]*?$/))\n              callback(new Error('请输入正确的ID, 以字母、数字开头，包含字母、数字、下划线和中划线'))\n            callback()\n          }\n          const rules = reactive({\n            url: [{ validator: validateUrl, trigger: 'change' }],\n            id: [{ validator: validateId, trigger: 'change' }],\n          })\n          const submitForm = (formEl) => {\n            if (!formEl)\n              return\n            formEl.validate(async (valid) => {\n              if (!valid)\n                return false\n\n              isLoading.value = true\n              const url = encodeURIComponent(decodeURIComponent(ruleForm.url))\n              const res = await request('/api/new', { body: JSON.stringify({ url, id: ruleForm.id }) }).catch((err) => {\n                isLoading.value = false\n                ElMessage.error({ message: err.message })\n              })\n              isLoading.value = false\n              if (res.code !== 0)\n                ElMessage.error({ message: res.message })\n              else\n                ElMessage.success({ message: '添加成功' })\n\n              if (res.data) {\n                ruleForm.url = ''\n                formEl.resetFields()\n                data.value = res.data\n                await onCopy(res.data.short, false)\n              }\n            })\n          }\n      \n          return { isDark, toggleDark, isAuth, isLoading, ruleFormRef, ruleForm, rules, submitForm, data, onCopy, onJump }\n        },\n      })\n      app.use(ElementPlus)\n      app.mount('#app')\n    </script>\n</body>\n\n</html>\n";

const ManageUI = "<html>\n\n<head>\n  <title>Short Domain Manage</title>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, user-scalable=no\" />\n  <!-- Reset Css -->\n  <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css\">\n  <!-- Vue -->\n  <script src=\"https://unpkg.com/vue@3/dist/vue.global.prod.js\"></script>\n  <!-- VueVirtualScroller -->\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/vue-virtual-scroller/dist/vue-virtual-scroller.css\"/>\n  <script src=\"https://unpkg.com/vue-virtual-scroller@2.0.0-beta.7/dist/vue-virtual-scroller.min.js\"></script>\n  <!-- ElementPlus -->\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/element-plus@2.2.28/dist/index.css\">\n  <link rel=\"stylesheet\" href=\"https://unpkg.com/element-plus@2.2.28/theme-chalk/dark/css-vars.css\">\n  <script src=\"https://unpkg.com/element-plus@2.2.28/dist/index.full.min.js\"></script>\n  <!-- Vueuse -->\n  <script src=\"https://unpkg.com/@vueuse/shared@9.10.0\"></script>\n  <script src=\"https://unpkg.com/@vueuse/core@9.10.0\"></script>\n  <style>\n    [v-cloak] { display: none; }\n    [un-cloak] { display: none; }\n  </style>\n</head>\n\n<body>\n  <div id=\"app\" v-cloak un-cloak class=\"w-screen h-screen overflow-hidden\">\n    <div class=\"absolute top-4 right-4 flex items-center\">\n      <el-icon class=\"cursor-pointer mr-4\" size=\"32\" opacity=\"75 hover:100\" i-carbon-add-alt @click=\"actions.jump({ source: '/' })\"></el-icon>\n      <el-icon class=\"cursor-pointer\" size=\"32\" opacity=\"75 hover:100\" i=\"carbon-sun dark:carbon-moon\" @click=\"toggleDark()\"></el-icon>\n    </div>\n\n    <main class=\"mx-auto md:max-w-1200px md:my-50px\">\n      <div class=\"h-60px flex items-center justify-between\">\n        <h2 class=\"text-2xl font-bold text-$el-text-primary\">所有短网址({{ list.length }})</h2>\n        <el-input v-model=\"filter\" class=\"!w-2/5\" placeholder=\"输入短网址或源地址\" @keydown.enter.prevent=\"onFilter\">\n          <template #append>\n            <el-button class=\"!rounded-l-0\" hover=\"!border-$el-color-primary !text-$el-color-primary\" @click=\"onFilter\">搜索</el-button>\n          </template>\n        </el-input>\n      </div>\n\n      <div class=\"w-full text-sm shadow-sm table-border\" bg=\"white dark:dark\" text=\"dark-200 dark:light-200\">\n        <div class=\"flex items-center select-none font-semibold text-base\" bg=\"light-300 dark:dark-300\">\n          <span class=\"w-20 table-th justify-center px-0\">序号</span>\n          <span class=\"flex-1 table-th max-w-300px\">短网址</span>\n          <span class=\"flex-1 table-th\">源网址</span>\n          <span class=\"flex-1 table-th max-w-240px\">操作</span>\n        </div>\n        <template v-if=\"list.length\">\n          <dynamic-scroller\n            :items=\"list\"\n            :min-item-size=\"54\"\n            class=\"h-[calc(100vh-208px)] w-full !overflow-overlay\"\n            scrollbar=\"~ rounded\"\n            scrollbar-track-color=\"transparent hover:black-/10 dark:hover:white-/10\"\n            scrollbar-thumb-color=\"black-/25 dark:white-/20 hover:black-/40 hover:dark:white-/30\"\n            v-slot=\"{ item, index, active }\"\n          >\n            <dynamic-scroller-item\n              class=\"flex transition-all table-border border-0 border-b box-border hover:bg-light-300 dark:hover:bg-dark-300\"\n              :item=\"item\"\n              :data-index=\"index\"\n              :active=\"active\"\n              :size-dependencies=\"[item.short,item.source]\"\n            >\n              <div class=\"w-20 table-td justify-center text-base px-0 select-none\">{{ index + 1 }}</div>\n              <div class=\"flex-1 table-td max-w-300px\" :title=\"item.short\">{{ item.short }}</div>\n              <div class=\"flex-1 table-td overflow-hidden break-all\" :title=\"item.source\">{{ item.source }}</div>\n              <div class=\"w-240px flex-shrink-0 table-td\">\n                <el-button-group size=\"small\">\n                  <el-popconfirm title=\"确定删除吗?\" confirm-button-text=\"确认\" cancel-button-text=\"取消\" @confirm=\"actions.delete(item, index)\">\n                    <template #reference>\n                      <el-button type=\"danger\"> <template #icon><el-icon i=\"material-symbols-delete-outline\"></el-icon></template>删除</el-button>\n                    </template>\n                  </el-popconfirm>\n                  <el-button type=\"primary\" @click=\"actions.copy(item)\"> <template #icon><el-icon i=\"carbon-copy\"></el-icon></template>复制</el-button>\n                  <el-button type=\"success\" @click=\"actions.jump(item)\"> <template #icon><el-icon i=\"carbon-launch\"></el-icon></template>访问</el-button>\n                </el-button-group>\n              </div>\n            </dynamic-scroller-item>\n          </dynamic-scroller>\n        </template>\n        <template v-else>\n          <div class=\"text-center text-xl py-4 text-slate-400\">\n            <el-empty description=\"暂无数据\" />\n          </div>\n        </template>\n      </div>\n    </main>\n  </div>\n    \n  <script type=\"module\">\n    // UnoCSS\n    import init from 'https://esm.sh/@unocss/runtime@0.48.3'\n    import presetUno from 'https://esm.sh/@unocss/preset-uno@0.48.3'\n    import presetAttributify from 'https://esm.sh/@unocss/preset-attributify@0.48.3'\n    import presetMini from 'https://esm.sh/@unocss/preset-mini@0.48.3'\n    import presetIcons from 'https://esm.sh/@unocss/preset-icons@0.48.3/browser'\n    import { presetScrollbar } from 'https://esm.sh/unocss-preset-scrollbar@0.2.1'\n\n    init({\n      defaults: {\n        presets: [\n          presetUno(),\n          presetAttributify(),\n          presetMini(),\n          presetIcons({ cdn: 'https://esm.sh/' }),\n          presetScrollbar(),\n        ],\n        rules: [],\n        shortcuts: [{\n          'table-border': 'border border-solid border-light-600 dark:border-dark-200',\n          'table-th': 'table-border border-0 siblings:border-l p-4 flex items-center ',\n          'table-td': 'table-border p-4 border-0 siblings:border-l flex items-center text-sm flex-shrink-0',\n        }],\n      },\n    })\n\n    const { useDark, useToggle } = window.VueUse\n    const { createApp, ref, onMounted } = window.Vue\n    const VueVirtualScroller = window.VueVirtualScroller.default\n    const ElementPlus = window.ElementPlus.default\n    const { ElMessage } = window.ElementPlus\n\n    const app = createApp({\n      setup() {\n        const request = async (url, options) => {\n          const res = await fetch(url, Object.assign({\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n          }, options))\n          const data = await res.json()\n          if (data.error) {\n            ElMessage.error({ message: data.error })\n            return\n          }\n          return data\n        }\n    \n        const isDark = useDark()\n        const toggleDark = useToggle(isDark)\n\n        const sourceList = []\n        const list = ref([])\n        const fetchAllDomains = async (cursor = '') => {\n          const res = await request('/api/list', { body: JSON.stringify({ cursor }) })\n          sourceList.push(...Object.assign([], res.data))\n          list.value.push(...res.data)\n          if (res.cursor)\n            await fetchAllDomains(res.cursor)\n        }\n\n        const filter = ref('')\n        const onFilter = async () => {\n          list.value = sourceList.filter(item => item.source.includes(filter.value) || item.short.includes(filter.value))\n        }\n    \n        const actions = {\n          async delete(row, index) {\n            const data = await request('/api/delete', { body: JSON.stringify({ url: row.source }) })\n            if (data) {\n              const sourceIndex = sourceList.findIndex(item => item.short === row.short)\n              sourceList.splice(sourceIndex, 1)\n              list.value.splice(index, 1)\n              ElMessage.success({ message: data.message })\n              if (list.value.length === 0) {\n                filter.value = ''\n                onFilter()\n              }\n            }\n          },\n          copy: (row) => {\n            navigator.clipboard.writeText(row.short)\n            ElMessage.success({ message: '复制成功' })\n          },\n          jump: (row) => {\n            window.open(row.source, '_blank')\n          },\n        }\n\n        onMounted(() => fetchAllDomains())\n\n        return { list, isDark, toggleDark, filter, onFilter, actions }\n      },\n    })\n    app.use(VueVirtualScroller)\n    app.use(ElementPlus)\n    app.mount('#app')\n  </script>\n</body>\n\n</html>\n";

const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return needCancel;
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt")
      return replyText("User-agent: *\nDisallow: /", env);
    const { domain } = getDomainAndSubdomain(request);
    const pathnameArr = url.pathname.slice(1).split("/");
    if (pathnameArr.length === 1) {
      const maps = {
        "": () => {
          const isLogin = !!checkAuthorization(request, env, false);
          return replyHtml(NewUI, env, { headers: { "Set-Cookie": `auth=${isLogin}; path=/;` } });
        },
        "admin": async () => {
          const valid = checkAuthorization(request, env);
          if (valid && typeof valid !== "boolean")
            return valid;
          return replyHtml(ManageUI, env);
        }
      };
      const handler = maps[pathnameArr[0]];
      if (handler)
        return await handler();
      else
        return await handlerRedirect(pathnameArr[0], env);
    } else if (pathnameArr.length === 2 && pathnameArr[0] === "api") {
      const apiMaps = {
        list: handlerApiList,
        new: handlerApiNew,
        delete: handlerApiDelete
      };
      const handler = apiMaps[pathnameArr[1]];
      if (handler)
        return await handler(request, env, domain);
      else
        return replyJson({ code: -1, message: `api [/api/${pathnameArr[1]}] not found` }, env);
    }
    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env);
  }
};
function randomString(length) {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
async function handlerApiList(request, env, domain) {
  const valid = checkAuthorization(request, env);
  if (valid && typeof valid !== "boolean")
    return valid;
  if (request.method !== "POST")
    return replyJson({ error: `method [${request.method}] not allowed` }, env);
  const body = await request.json();
  const cursor = body.cursor;
  const list = await env.SHORTURLS.list({ prefix: "md5:", limit: 500, cursor });
  const result = await Promise.all(list.keys.map(async (key) => {
    const value = await env.SHORTURLS.get(key.name);
    const decodeValue = value ? decodeURIComponent(value) : "";
    const [id, url] = decodeValue.split("|||");
    return {
      id,
      short: getShortUrl(request, id, domain),
      source: url
    };
  }));
  return replyJson({ data: result, cursor: list.list_complete ? "" : list.cursor }, env);
}
async function handlerApiNew(request, env, domain) {
  try {
    if (request.method !== "POST")
      return replyJson({ error: `method [${request.method}] not allowed` }, env);
    const body = await request.json();
    const url = body.url ? decodeURIComponent(body.url) : "";
    if (!url)
      return replyJson({ error: "\u7F3A\u5C11 url \u53C2\u6570" }, env);
    const newUrl = new URL(url);
    const decodeUrl = decodeURIComponent(newUrl.toString());
    const md5 = await getMD5(decodeUrl);
    const exist = await env.SHORTURLS.get(`md5:${md5}`);
    if (!exist) {
      const isAuth = !!checkAuthorization(request, env, false);
      const short = isAuth && body.id ? body.id : randomString(6);
      await env.SHORTURLS.put(`md5:${md5}`, `${short}|||${decodeUrl}`);
      await handlerIdMd5Maps(env, short, md5);
      const shortUrl = getShortUrl(request, short, domain);
      return replyJson({ code: 0, data: { short: shortUrl, source: decodeUrl } }, env);
    } else {
      const [short] = exist.split("|||");
      const shortUrl = getShortUrl(request, short, domain);
      return replyJson({ code: -1, message: "url \u5DF2\u7ECF\u5B58\u5728", data: { short: shortUrl, source: decodeUrl } }, env);
    }
  } catch (e) {
    return replyJson({ code: -1, message: e.message }, env);
  }
}
async function handlerApiDelete(request, env) {
  const valid = checkAuthorization(request, env);
  if (valid && typeof valid !== "boolean")
    return valid;
  if (request.method !== "POST")
    return replyJson({ error: `method [${request.method}] not allowed` }, env);
  const body = await request.json();
  const url = body.url ? decodeURIComponent(body.url) : "";
  if (!url)
    return replyJson({ error: "\u7F3A\u5C11 url \u53C2\u6570" }, env);
  const md5 = await getMD5(url);
  const exist = await env.SHORTURLS.get(`md5:${md5}`);
  if (!exist)
    return replyJson({ error: `[${url}] not found` }, env);
  await env.SHORTURLS.delete(`md5:${md5}`);
  const [id] = exist.split("|||");
  await handlerIdMd5Maps(env, id);
  return replyJson({ message: "\u5220\u9664\u6210\u529F" }, env);
}
async function handlerIdMd5Maps(env, id, md5) {
  const idMd5MapsStr = await env.SHORTURLS.get("id_md5_maps");
  const idMd5Maps = idMd5MapsStr ? JSON.parse(idMd5MapsStr) : {};
  if (id && md5) {
    idMd5Maps[id] = md5;
  } else if (id && !md5) {
    if (!Object.keys(idMd5Maps).length)
      return;
    delete idMd5Maps[id];
  } else if (!id && !md5) {
    return idMd5Maps;
  }
  await env.SHORTURLS.put("id_md5_maps", JSON.stringify(idMd5Maps));
}
async function handlerRedirect(id, env) {
  const idMd5Maps = await handlerIdMd5Maps(env) || {};
  const md5 = idMd5Maps[id];
  if (!md5)
    return replyJson({ error: `[${id}] not found` }, env);
  const exist = await env.SHORTURLS.get(`md5:${md5}`);
  if (exist) {
    const url = exist.split("|||")[1];
    return Response.redirect(decodeURIComponent(url), 301);
  } else {
    return replyJson({ error: `[${id}] not found` }, env);
  }
}
function checkAuthorization(request, env, need401 = true) {
  const authorization = request.headers.get("Authorization");
  if (!authorization && need401) {
    return new Response(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"'
      }
    });
  } else if (authorization) {
    const str = atob(authorization.split(" ")[1]);
    const [username, password] = str.split(":");
    const isValid = username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD;
    if (!isValid && need401) {
      return new Response(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"'
        }
      });
    } else {
      return isValid;
    }
  }
  return false;
}
async function getMD5(url) {
  return crypto.subtle.digest("MD5", new TextEncoder().encode(url)).then((hash) => {
    return hex(hash);
  });
}
function hex(buffer) {
  const hexCodes = [];
  const view = new DataView(buffer);
  for (let i = 0; i < view.byteLength; i += 4) {
    const value = view.getUint32(i);
    const stringValue = value.toString(16);
    const padding = "00000000";
    const paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }
  return hexCodes.join("");
}
function getShortUrl(request, id, domain) {
  const url = new URL(request.url);
  const protocol = url.protocol === "https:" ? "https" : "http";
  return `${protocol}://s.${domain}/${id}`;
}

export { index as default };
