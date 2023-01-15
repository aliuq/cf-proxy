/**
 * 返回配置对象
 * 参考官方示例 https://beta.openai.com/examples/
 */

export default {
  conversation: {
    // https://beta.openai.com/examples/default-qa
    qa: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ['\n'],
    },
    // https://beta.openai.com/examples/default-factual-answering
    factualAnswering: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    },
    // https://beta.openai.com/examples/default-js-helper
    jsHelp: {
      model: 'code-davinci-002',
      prompt: '',
      temperature: 0,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ['You:'],
    },
    // https://beta.openai.com/examples/default-ml-ai-tutor
    aiLangModelTutor: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0.3,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ['You:'],
    },
    /** https://beta.openai.com/examples/default-chat */
    chat: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [' Human:', ' AI:'],
    },
    // https://beta.openai.com/examples/default-friend-chat
    friendChat: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0.5,
      max_tokens: 60,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
      stop: ['You:'],
    },
    // https://beta.openai.com/examples/default-marv-sarcastic-chat
    marvSarcasticChat: {
      model: 'text-davinci-003',
      prompt: '',
      temperature: 0.5,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0.0,
    },
  },
}
