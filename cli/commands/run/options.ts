import path from 'path'
import fs from 'node:fs'
import type { CommandOptions } from '@cli/inquirer'

export interface RunOptions {
  name: string
  command: string
  params?: string
  cwd: string
  env: string
  config?: string
  release?: boolean
  loader?: string | false
  dryRun?: boolean
  [x: string]: any
}

export const internalKeys = ['name', 'command', 'params', 'cwd', 'release', 'loader']

export const options: CommandOptions<RunOptions> = {
  name: {
    string: true,
    type: 'string',
    alias: 'n',
    describe: 'Name of the worker',
    inquirer: {
      type: 'autocomplete',
    } as any,
  },
  command: {
    string: true,
    type: 'string',
    alias: 'c',
    describe: 'Command to run',
    inquirer: true,
  },
  params: {
    string: true,
    type: 'string',
    alias: 'p',
    describe: 'Parameters to pass to the command',
  },
  cwd: {
    string: true,
    type: 'string',
    alias: 'w',
    describe: 'Workers directory path',
    default: path.resolve(process.cwd(), 'workers'),
    coerce: (value: string) => {
      const isAbsolute = path.isAbsolute(value)
      value = isAbsolute ? value : path.resolve(process.cwd(), value)
      if (!fs.existsSync(value))
        throw new Error(`Destination "${value}" does not exist`)

      return value
    },
  },
  env: {
    string: true,
    type: 'string',
    alias: 'e',
    describe: 'Environment to use for operations and .env files',
    inquirer: true,
  },
  config: {
    string: true,
    type: 'string',
    alias: 'f',
    describe: 'Path to the wrangler.toml file',
  },
  release: {
    boolean: true,
    type: 'boolean',
    alias: 'r',
    describe: 'Release the worker to Github after running the command',
  },
  loader: {
    string: true,
    boolean: true,
    type: 'string',
    default: 'tsup',
    describe: 'Loader to build for the worker',
  },
  dryRun: {
    boolean: true,
    type: 'boolean',
    default: false,
    describe: 'Dry run the command',
  },
}
