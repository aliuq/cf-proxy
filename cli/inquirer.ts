import type { Answers, DistinctQuestion, QuestionCollection } from 'inquirer'
import inquirerPrompt from 'inquirer-autocomplete-prompt'
import _inquirer from 'inquirer'
import type { Options } from 'yargs'
import fuzzy from 'fuzzy'

export type CommandOption<T extends Answers = Answers> = Options & {
  inquirer?: DistinctQuestion<T> | boolean
  only?: string | string[]
}

export type CommandOptions<T extends string | {} = string> = Record<T extends string ? T : keyof T, CommandOption>

_inquirer.registerPrompt('autocomplete', inquirerPrompt)

// 将 yargs 和 inquirer 结合起来
export const inquirer = async (options: CommandOptions, argv: any) => {
  // Placeholder
  const questions: QuestionCollection = Object.entries(options)
    .map(([key, value]) => generateQuestion(key, value, argv))

  const answers = await _inquirer.prompt(questions)

  for (const key of Object.keys(answers)) {
    argv[key] = answers[key]
    if (options[key].alias)
      argv[options[key].alias as string] = answers[key]
  }

  return argv
}

function search(choices: any, input = '') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = fuzzy.filter(input, choices).map(el => el.original)
      resolve(results)
    }, Math.random() * 470 + 30)
  })
}

function generateQuestion(name: string, option: CommandOption, argv: any) {
  const t = option.type
  const type = option.choices ? 'list' : t === 'string' ? 'input' : t === 'boolean' ? 'confirm' : 'input'
  const inquirerOption = typeof option?.inquirer === 'boolean' ? {} : (option?.inquirer || {})

  const mergeObj = Object.assign({}, {
    type,
    name,
    message: option.describe,
    default: option.default,
    choices: option.choices,
    validate: (input: any) => option.coerce ? !!option.coerce?.(input) : true,
    filter: (input: any) => option.coerce ? option.coerce?.(input) : input,
    when: () => option.inquirer && !argv[name],
    source: (_: any, input: string) => search(option.choices?.map((c: any) => typeof c === 'string' ? c : c?.value), input),
  }, inquirerOption)

  return Object.keys(mergeObj).reduce((acc, key: string) => {
    if ((<any>mergeObj)[key] !== undefined)
      acc[key] = (<any>mergeObj)[key]
    return acc
  }, {} as Record<string, any>)
}
