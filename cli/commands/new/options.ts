import fs from 'fs'
import path from 'path'
import type { CommandOptions } from '@cli/inquirer'

export interface NewOptions {
  name: string
  date: string
  destination: string
  template: string
  cwd: string
}

export const options: CommandOptions<NewOptions> = {
  name: {
    string: true,
    type: 'string',
    alias: 'n',
    describe: 'Name of the worker',
    inquirer: true,
    coerce: (value: string) => {
      if (!value)
        throw new Error('Worker name is required')
      if (!/^[a-z0-9-]+$/.test(value))
        throw new Error('Worker name must be lowercase letters, numbers, and dashes')

      return value
    },
  },
  date: {
    string: true,
    type: 'string',
    alias: 'd',
    describe: 'Date of compatibility_date',
    coerce: (value: string) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error('Date must be in the format YYYY-MM-DD')

      return value
    },
    default: new Date().toISOString().split('T')[0],
  },
  destination: {
    string: true,
    type: 'string',
    alias: 'o',
    describe: 'Destination of the worker',
    default: path.resolve(process.cwd(), 'workers'),
    inquirer: true,
    coerce: (value: string) => {
      const isAbsolute = path.isAbsolute(value)
      value = isAbsolute ? value : path.resolve(process.cwd(), value)
      if (!fs.existsSync(value))
        throw new Error(`Destination "${value}" does not exist`)

      return value
    },
  },
  cwd: {
    string: true,
    type: 'string',
    alias: 'w',
    describe: 'Current templates directory',
    default: path.resolve(process.cwd(), 'templates'),
    coerce: (value: string) => {
      const isAbsolute = path.isAbsolute(value)
      value = isAbsolute ? value : path.resolve(process.cwd(), value)
      if (!fs.existsSync(value))
        throw new Error(`Current templates directory "${value}" does not exist`)

      return value
    },
  },
  template: {
    string: true,
    type: 'string',
    alias: 't',
    describe: 'Template of the worker',
    default: 'basic',
    inquirer: true,
  },
}
