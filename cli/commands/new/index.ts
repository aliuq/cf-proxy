/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import type { Argv, CommandModule } from 'yargs'
import { inquirer } from '@cli/inquirer'
import { bold, green, red, yellow } from '@cli/colors'
import { pick, recursiveWriteFile } from '@cli/utils'
import fg from 'fast-glob'
import handlebars from 'handlebars'
import type { NewOptions } from './options'
import { options } from './options'

const NewCommand: CommandModule<{}, NewOptions> = {
  command: 'new [name] [destination]',
  aliases: ['create', 'init'],
  describe: 'Create a new Cloudflare Workers project',
  builder: (yargs) => {
    Object.entries(options).forEach(([key, value]) => {
      value.inquirer && yargs.positional(key, pick(value, ['type', 'describe']))
    })
    return yargs.options(options) as Argv<NewOptions>
  },
  handler: async (argv: any) => {
    argv = await inquirer(pick(options, 'name'), argv)

    // Template
    const templates = getTemplates(argv.cwd)
    if (!templates.length) {
      console.log(yellow(`No template found in "${argv.cwd}", skipping...`))
      process.exit(0)
    }

    options.template.choices = templates

    if (argv.template && !templates.includes(argv.template)) {
      console.log(yellow(`Template "${bold(argv.template)}" does not exist in ${bold(argv.cwd)}\n`))
      argv.template = ''
    }

    argv = await inquirer(pick(options, 'template'), argv)

    if (!path.isAbsolute(argv.template))
      argv.template = path.resolve(argv.cwd, argv.template)

    const dest = path.resolve(argv.destination, argv.name)
    if (fs.existsSync(dest)) {
      console.log(yellow(`Destination "${dest}" already exists, skipping...`))
      process.exit(0)
    }

    renderTemplate(argv.template, dest, argv)
    console.log(`Created ${green(dest)}`)
  },
}

export default NewCommand

function getTemplates(templateRoot: string) {
  const templates = fs.readdirSync(templateRoot).filter((file) => {
    return fs.statSync(`${templateRoot}/${file}`).isDirectory() && !file.match(/^__(.*?)__$/)
  })
  return templates
}

function renderTemplate(templateRoot: string, destRoot: string, answers: Object) {
  try {
    if (!fs.existsSync(templateRoot))
      throw new Error(`template root: ${bold(templateRoot)} not exist`)

    const dirs = [templateRoot]
    // Check common configuration files
    const commonFilesRoot = path.resolve(path.dirname(templateRoot), '__COMMON__')
    fs.existsSync(commonFilesRoot) && dirs.push(commonFilesRoot)

    // read all file names in templateRoot
    const fileMaps = dirs.reduce((acc, dir) => {
      acc[dir] = fg.sync('**/*', { dot: true, onlyFiles: true, cwd: dir })
      return acc
    }, {} as Record<string, string[]>)

    Object.entries(fileMaps).forEach(([dir, files]) => {
      files.forEach((fileName) => {
        const filePath = path.resolve(dir, fileName)
        const destFilePath = path.resolve(destRoot, fileName)
        const templateContent: string = fs.readFileSync(filePath, 'utf-8')
        const content = handlebars.compile(templateContent)(answers)
        recursiveWriteFile(destFilePath, content, { encoding: 'utf-8' })
      })
    })
  }
  catch (error: any) {
    console.log(red(error.message))
    process.exit(0)
  }
}
