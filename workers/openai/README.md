# Worker: openai

通过 API Key 实现 OpenAI 的 ChatGPT 机器人聊天

示例地址：[https://chat.llll.host](https://chat.llll.host)

## 环境变量

+ `__DOMAIN__`: 主域名，用于配置路由、触发器等
+ `OPENAI_API_KEY`: OpenAI API Key

默认参数配置:

```ts
const params: CreateCompletionRequest = {
  model: 'text-davinci-003',
  prompt: Prompt,
  temperature: 0.9,
  max_tokens: 150,
  top_p: 1,
  frequency_penalty: 0.0,
  presence_penalty: 0.6,
  stop: [' Human:', ' AI:'],
}
```
