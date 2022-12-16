// Create a new worker by template
import path from 'path'
import type { QuestionCollection } from 'inquirer'
import inquirer from 'inquirer'
import { parseArgs, renderTemplate } from './utils'

interface Args {
  name: boolean
  date: string
  dest: string
}

const args = parseArgs<Args>({
  maps: {
    n: 'name',
    d: 'date',
    o: 'dest',
  },
})

// worker 名称
const workerName = process.argv[2] || args.name
// worker 根目录
const workersRoot = 'workers'

const questions: QuestionCollection = [
  {
    type: 'input',
    name: 'name',
    message: 'Worker name:',
    validate: (input: string) => {
      if (!input)
        return 'Worker name is required'
      if (!/^[a-z0-9-]+$/.test(input))
        return 'Worker name must be lowercase letters, numbers, and dashes'
      return true
    },
    default: args.name,
    when: () => !workerName,
  },
  {
    type: 'input',
    name: 'date',
    message: 'Date:',
    default: args.date || new Date().toISOString().split('T')[0],
  },
  {
    type: 'input',
    name: 'dest',
    message: 'Destination:',
    default: args.dest || workersRoot,
  },
]
const answers = await inquirer.prompt(questions)
answers.name = answers.name || workerName

const root = process.cwd()
const templateRoot = path.resolve(root, 'template')
const destRoot = path.resolve(root, answers.dest, answers.name)
renderTemplate(templateRoot, destRoot, answers)

