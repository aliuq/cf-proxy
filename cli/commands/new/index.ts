/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import type { Argv, CommandModule } from 'yargs'
import { inquirer } from '@cli/inquirer'
import { bold, green, yellow } from '@cli/colors'
import { getAllWorkers, pick, renderTemplate } from '@cli/utils'
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
    const templates = getAllWorkers(argv.cwd)
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

