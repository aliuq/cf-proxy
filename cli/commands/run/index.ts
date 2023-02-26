import type { Argv, CommandModule } from 'yargs'
import { pick } from '@cli/utils'
import { RunHandler } from './util'
import type { RunOptions } from './options'
import { options } from './options'

const RunCommand: CommandModule<{}, RunOptions> = {
  command: 'run [name] [command] [params]',
  describe: 'Run a Cloudflare Workers project',
  aliases: ['start'],
  builder: (yargs) => {
    Object.entries(options).forEach(([key, value]) => {
      value.inquirer && yargs.positional(key, pick(value, ['type', 'describe']))
    })
    return yargs.options(options) as Argv<RunOptions>
  },
  handler: async (argv: RunOptions) => {
    const handler = new RunHandler(argv, options)
    await handler.start()
    // const newOptions = resolveOptions(argv, options)
    // argv = await inquirer(newOptions, argv)
    // console.log('argv', argv)
    // await checkRequired()
    // const workers = getAllWorkers()
    // console.log('workers', workers)
  },
}

export default RunCommand
