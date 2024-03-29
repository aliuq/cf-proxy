import { OpenAIApi, Configuration } from 'openai';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

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

const ChatHtml = "<!DOCTYPE html>\n<html class=\"dark\">\n<head>\n  <meta charSet=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, user-scalable=no\" />\n  <meta name=\"next-head-count\" content=\"3\" />\n  <!-- <script src=\"https://unpkg.com/vue@3/dist/vue.global.js\"></script> -->\n  <script src=\"https://cdn.tailwindcss.com\"></script>\n  <!-- <link rel=\"stylesheet\" href=\"/tailwindcss.css\"> -->\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/markdown-it/13.0.1/markdown-it.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- prism -->\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- Prism.js theme -->\n  <link href=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css\" rel=\"stylesheet\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n  <!-- autoloader -->\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- toolbar -->\n  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.css\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/toolbar/prism-toolbar.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- linenumber -->\n  <link href=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css\" rel=\"stylesheet\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- copy-to-clipboard -->\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <!-- inline-color -->\n  <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/inline-color/prism-inline-color.min.css\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />\n  <script src=\"https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/inline-color/prism-inline-color.min.js\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>\n  <style>\n    pre[class*=\"language-\"] {\n      width: 100%;\n    }\n    code[class*=\"language-\"],\n    pre[class*=\"language-\"] {\n      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace !important;\n    }\n    .code-toolbar {\n      width: 100%;\n    }\n\n    .animate-three-dot::after {\n      content: '.';\n      animation: three-dot 1.5s infinite;\n      bottom: 1em;\n      line-height: 0;\n      left: -0.5em;\n      position: absolute;\n    }\n    @keyframes three-dot {\n      0% {\n        content: '.';\n      }\n      33% {\n        content: '..';\n      }\n      66% {\n        content: '...';\n      }\n    }\n\n    .dark .dark\\:bg-vert-dark-gradient {\n      background-image: linear-gradient(rgba(44, 48, 50, 0), rgb(44, 48, 50) 58.85%);\n    }\n  </style>\n</head>\n\n<body class=\"line-numbers prose\" data-prismjs-copy-timeout=\"500\">\n  <div id=\"app\" class=\"bg-gray-800 w-screen h-screen\">\n    <main class=\"relative w-full h-full transition-all overflow-hidden flex flex-col\">\n      <!-- 聊天记录 -->\n      <div class=\"flex-1 overflow-hidden\">\n        <div class=\"records w-full h-full overflow-y-auto flex flex-1 flex-col justify-start mb-3\">\n          <template v-for=\"(l, i) in records\" v-if=\"records.length\">\n            <!-- 问 -->\n            <div class=\"w-full border-b border-gray-900/50 text-gray-100 group bg-gray-800\" :data-r=\"i\" v-if=\"l.type === 'ask'\">\n              <div class=\"text-base gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 pr-2 md:py-6 flex lg:px-0\">\n                <div class=\"w-[30px] flex flex-col relative items-end\">\n                  <div class=\"relative flex\">\n                    <img src=\"https://s.gravatar.com/avatar/819e732c48170dac0b479ce5f8ffc8be?s=480&d=retro&w=64&q=75\"\n                      class=\"block p-0 m-0 b-0\">\n                  </div>\n                </div>\n                <div class=\"relative lg:w-[calc(100% - 15px)] w-full flex flex-col\">\n                  <div class=\"min-h-[20px] whitespace-pre-wrap flex flex-col items-start gap-4\" v-html=\"l.text\"></div>\n                </div>\n              </div>\n            </div>\n            <!-- 答 -->\n            <div class=\"w-full border-b border-gray-900/50 text-gray-100 group bg-[#444654]\" :data-r=\"i\" v-if=\"l.type === 'answer'\">\n              <div class=\"text-base gap-6 m-auto md:max-w-2xl lg:max-w-2xl xl:max-w-3xl p-4 pr-2 md:py-6 flex lg:px-0\">\n                <div class=\"w-[30px] flex flex-col relative items-end\">\n                  <div class=\"relative h-[30px] w-[30px] p-1 rounded-sm text-white flex items-center justify-center\"\n                    style=\"background-color: rgb(16, 163, 127); --darkreader-inline-bgcolor:#0d8266;\"\n                    data-darkreader-inline-bgcolor=\"\">\n                    <svg width=\"41\" height=\"41\" viewBox=\"0 0 41 41\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" stroke-width=\"1.5\" class=\"w-6 h-6\">\n                      <path\n                        d=\"M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z\" fill=\"currentColor\" data-darkreader-inline-fill=\"\" style=\"--darkreader-inline-fill:currentColor;\">\n                      </path>\n                    </svg>\n                    <span v-if=\"l.failed\" class=\"absolute select-none w-4 h-4 rounded-full text-[10px] flex justify-center items-center right-0 top-[20px] -mr-2 border border-white bg-red-500 text-red-800\">!</span>\n                  </div>\n                </div>\n                <div class=\"relative lg:w-[calc(100%-15px)] w-full flex flex-col\">\n                  <div class=\"min-h-[20px] whitespace-pre-wrap flex flex-col items-start gap-4\">\n                    <div v-if=\"!l.failed\" class=\"request-:r0:-0 markdown prose dark:prose-invert break-words dark w-full\" v-html=\"l.text\"></div>\n                    <div v-else class=\"request-:r0:-0 markdown text-red-500 prose dark:prose-invert break-words dark\" v-html=\"l.text\"></div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </template>\n          <!-- 占位符控制高度 -->\n          <div class=\"w-full h-48 flex-shrink-0\"></div>\n        </div>\n      </div>\n      \n      <div class=\"absolute bottom-0 left-0 w-full border-transparent dark:bg-vert-dark-gradient\">\n        <form class=\"flex flex-row stretch gap-3 mx-2 lg:mx-auto pt-2 lg:pt-6 lg:max-w-3xl last:mb-2 md:last:mb-6\">\n          <div class=\"relative flex-1 h-full flex flex-col\">\n            <!-- 输入框 -->\n            <div\n              class=\"flex flex-col w-full py-2 pl-3 md:py-3 md:pl-4 relative border border-gray-900/50 text-white bg-gray-700 rounded-md shadow-[0_0_15px_rgba(0,0,0,0.10)]\">\n              <textarea tabindex=\"0\" :style=\"textareaStyle\" rows=\"1\" placeholder=\"\" class=\"w-full resize-none outline-0 p-0 pr-7 m-0 border-0 bg-transparent transition-[height]\" v-model=\"keywords\" @keydown.enter=\"getGPT\" @input=\"handleTyping\"></textarea>\n              <button class=\"absolute p-1 rounded-md text-gray-500 bottom-1.5 right-1 md:bottom-2.5 md:right-2 hover:text-gray-400 hover:bg-gray-900 disabled:hover:bg-transparent disabled:bottom-1\" :disabled=\"isLoading\" @click.prevent=\"getGPT\">\n                <template v-if=\"!isLoading\">\n                  <svg stroke=\"currentColor\" fill=\"currentColor\" stroke-width=\"0\" viewBox=\"0 0 20 20\" class=\"w-4 h-4 rotate-90\" height=\"1em\" width=\"1em\" xmlns=\"http://www.w3.org/2000/svg\">\n                    <path d=\"M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z\"></path>\n                  </svg>\n                </template>\n                <template v-else>\n                  <span class=\"text-2xl animate-three-dot\"></span>\n                </template>\n              </button>\n            </div>\n          </div>\n        </form>\n        <!-- 底部提示 -->\n        <div class=\"text-xs text-black/50 dark:text-white/50 pt-3 pb-3 px-3 md:pt-3 md:pb-6 md:px-4 text-center\">\n          <p>\n            Powerd by Cloudflare Workers. ChatGPT 是一个基于<a\n              class=\"text-gray-300 hover:underline\" href=\"https://openai.com/blog/openai-api/\">OpenAI API</a>的聊天机器人, 如果条件允许, 请前往<a class=\"text-gray-300 hover:underline\" href=\"https://chat.openai.com/chat\">OpenAI</a>官网体验更好的服务.\n          </p>\n          <p class=\"pt-1\">声明: UI 仿照官方, 数据通过 API key 进行请求, 如果遇到 Bug 等问题, 请访问 cf-proxy 查看源码</p>\n        </div>\n      </div>\n    </main>\n  </div>\n  <script type=\"module\">\n    import { createApp, nextTick } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'\n    import debounce from 'https://unpkg.com/lodash-es@4.17.21/debounce.js'\n\n    Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/'\n    const md = window.markdownit()\n\n    // const { createApp } = Vue\n    createApp({\n      data() {\n        return {\n          keywords: '',\n          textareaStyle: {},\n          records: [],\n          isLoading: false,\n        }\n      },\n      methods: {\n        handleTyping: debounce(function () {\n          const textarea = document.querySelector('form textarea')\n          if (!textarea) {\n            this.textareaStyle = {}\n            return\n          }\n          // 为了计算高度，先把高度设为 auto\n          textarea.style.height = 'auto'\n          this.textareaStyle = {\n            height: `${textarea.scrollHeight}px`,\n            maxHeight: '200px',\n            overflowY: textarea.scrollHeight > 200 ? undefined : 'hidden',\n          }\n        }, 50),\n        async getGPT(event) {\n          if (event.shiftKey)\n            return\n          event.preventDefault()\n          if (!this.keywords.trim() || this.isLoading)\n            return\n          this.isLoading = true\n          this.records.push({ type: 'ask', text: this.keywords })\n          this.records.push({ type: 'answer', text: '', loading: true })\n          const text = this.keywords\n          this.keywords = ''\n          this.textareaStyle = {}\n          const records = document.querySelector('.records')\n          await new Promise(resolve => setTimeout(resolve, 50))\n          records.scrollTo({ top: records.scrollHeight, behavior: 'smooth' })\n          const res = await fetch(`/api?${new URLSearchParams({ q: text })}`)\n          const data = await res.json()\n          const last = this.records[this.records.length - 1]\n          delete last.loading\n          last.failed = data.code !== 0\n          last.text = data.code ? (md.render(data.text) || res.statusText) : md.render(data.text)\n\n          await nextTick()\n          const elements = document.querySelectorAll(`[data-r=\"${this.records.length - 1}\"] pre code`)\n          elements.length && elements.forEach((element) => {\n            Prism.highlightElement(element)\n            Prism.hooks.run('complete', { element, code: element.innerText })\n          })\n          records.scrollTo({ top: records.scrollHeight, behavior: 'smooth' })\n          this.isLoading = false\n        },\n      },\n    }).mount('#app')\n  </script>\n</body>\n\n</html>\n";

const config = {
  conversation: {
    // https://beta.openai.com/examples/default-qa
    qa: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ["\n"]
    },
    // https://beta.openai.com/examples/default-factual-answering
    factualAnswering: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    },
    // https://beta.openai.com/examples/default-js-helper
    jsHelp: {
      model: "code-davinci-002",
      prompt: "",
      temperature: 0,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      stop: ["You:"]
    },
    // https://beta.openai.com/examples/default-ml-ai-tutor
    aiLangModelTutor: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0.3,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      stop: ["You:"]
    },
    /** https://beta.openai.com/examples/default-chat */
    chat: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"]
    },
    // https://beta.openai.com/examples/default-friend-chat
    friendChat: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0.5,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      stop: ["You:"]
    },
    // https://beta.openai.com/examples/default-marv-sarcastic-chat
    marvSarcasticChat: {
      model: "text-davinci-003",
      prompt: "",
      temperature: 0.5,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0
    }
  }
};

const index = {
  async fetch(request, env, _ctx) {
    const needCancel = await needCancelRequest(request);
    if (needCancel)
      return needCancel;
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt")
      return replyText("User-agent: *\nDisallow: /", env);
    const { domain } = getDomainAndSubdomain(request);
    if (url.host === domain) {
      if (url.pathname === "/chat" || url.pathname === "/fchat") {
        const newUrl = new URL(url.toString());
        newUrl.host = url.pathname === "/chat" ? `chat.${domain}` : `fchat.${domain}`;
        newUrl.pathname = "/";
        return Response.redirect(newUrl.toString(), 301);
      }
    }
    if (url.pathname === "/")
      return replyHtml(ChatHtml, env);
    else if (url.pathname === "/api")
      return await handlerApi(url, env);
    return await replyUnsupport({ url: decodeURIComponent(url.toString()) }, env);
  }
};
async function handlerApi(url, env) {
  const prompt = url.searchParams.get("q");
  if (!prompt)
    return replyText("Missing query parameter: q", env);
  const openai = await initOpenAI(env);
  try {
    const moderation = await checkModeration(openai, prompt);
    if (moderation)
      return replyJson({ code: -1, text: moderation }, env);
    const params = Object.assign({}, config.conversation.chat, { prompt, user: "aliuq" });
    const { data } = await openai.createCompletion(params);
    return replyJson({ code: 0, text: data.choices[0].text }, env);
  } catch (error) {
    console.log(error.response?.data?.error?.message);
    const status = error.response?.status || 500;
    return replyText("", env, { status });
  }
}
async function initOpenAI(env) {
  return new OpenAIApi(new Configuration({
    apiKey: env.OPENAI_API_KEY,
    baseOptions: { adapter: fetchAdapter }
  }));
}
async function checkModeration(openai, input) {
  try {
    const { data } = await openai.createModeration({ model: "text-moderation-latest", input });
    const { flagged, categories } = data.results[0];
    if (flagged) {
      const maps = {
        "hate": "\u8868\u8FBE\u3001\u717D\u52A8\u6216\u4FC3\u8FDB\u57FA\u4E8E\u79CD\u65CF\u3001\u6027\u522B\u3001\u6C11\u65CF\u3001\u5B97\u6559\u3001\u56FD\u7C4D\u3001\u6027\u53D6\u5411\u3001\u6B8B\u75BE\u72B6\u51B5\u6216\u79CD\u59D3\u7684\u4EC7\u6068\u7684\u5185\u5BB9",
        "hate/threatening": "\u8FD8\u5305\u62EC\u5BF9\u76EE\u6807\u7FA4\u4F53\u7684\u66B4\u529B\u6216\u4E25\u91CD\u4F24\u5BB3\u7684\u4EC7\u6068\u6027\u5185\u5BB9",
        "self-harm": "\u5021\u5BFC\u3001\u9F13\u52B1\u6216\u63CF\u8FF0\u81EA\u6211\u4F24\u5BB3\u884C\u4E3A\u7684\u5185\u5BB9\uFF0C\u5982\u81EA\u6740\u3001\u5207\u5272\u548C\u996E\u98DF\u7D0A\u4E71",
        "sexual": "\u65E8\u5728\u5F15\u8D77\u6027\u5174\u594B\u7684\u5185\u5BB9\uFF0C\u5982\u5BF9\u6027\u6D3B\u52A8\u7684\u63CF\u8FF0\uFF0C\u6216\u4FC3\u8FDB\u6027\u670D\u52A1\u7684\u5185\u5BB9\uFF08\u4E0D\u5305\u62EC\u6027\u6559\u80B2\u548C\u5065\u5EB7\uFF09",
        "sexual/minors": "\u5305\u62EC\u672A\u6EE118\u5C81\u7684\u4EBA\u7684\u6027\u5185\u5BB9",
        "violence": "\u5BA3\u626C\u6216\u7F8E\u5316\u66B4\u529B\u6216\u8D5E\u7F8E\u4ED6\u4EBA\u7684\u75DB\u82E6\u6216\u7F9E\u8FB1\u7684\u5185\u5BB9",
        "violence/graphic": "\u63CF\u7ED8\u6B7B\u4EA1\u3001\u66B4\u529B\u6216\u4E25\u91CD\u8EAB\u4F53\u4F24\u5BB3\u7684\u66B4\u529B\u5185\u5BB9\uFF0C\u5176\u753B\u9762\u611F\u6781\u5F3A"
      };
      const text = [];
      Object.keys(categories).forEach((key) => {
        if (!categories[key])
          text.push(maps[key]);
      });
      const mdtext = [
        "# \u8FDD\u53CD\u5185\u5BB9\u7B56\u7565",
        "",
        text.map((item, index) => `${index + 1} ${item}`).join("\n")
      ].join("\n");
      return mdtext;
    }
    return "";
  } catch (error) {
    return error.response?.data?.error?.message || error.message || "";
  }
}

export { index as default };
