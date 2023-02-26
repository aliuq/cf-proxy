/* eslint-disable no-unused-expressions */
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { name } from '../package.json'
import { bold, gray, red } from './colors'
import newCommand from './commands/new'
import runCommand from './commands/run'

yargs(hideBin(process.argv))
  .scriptName('cf')
  .command(newCommand)
  .command(runCommand)
  .strictCommands()
  .alias('h', 'help')
  .showHelpOnFail(false)
  .fail((msg) => {
    if (msg) {
      console.error(`\n${red(msg)}\n`)
      process.exit(1)
    }
    else {
      console.error(`\n${gray(`[${name}]`)} ${bold(red('An internal error occurred.'))}`)
    }
  })
  .argv

