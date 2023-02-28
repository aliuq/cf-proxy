/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'path'
import os from 'node:os'
import * as execa from 'execa'
import type { Options as ExecaOptions, SyncOptions as ExecaSyncOptions } from 'execa'
import ora from 'ora'
import inquirerPkg from 'inquirer'
import dotenv from 'dotenv'
import toml from '@iarna/toml'
import { bold, cyan, dim, green, red, yellow } from '@cli/colors'
import { compareVersions, getAllWorkers, omit, pick } from '@cli/utils'
import type { CommandOptions } from '@cli/inquirer'
import { inquirer } from '@cli/inquirer'
import type { RunOptions } from './options'
import { internalKeys } from './options'

export class RunHandler {
  _argv: RunOptions
  _options: CommandOptions<RunOptions>
  _path = {
    root: '',
    devVars: '',
    wranglerTomlDev: '',
    wranglerConfig: '',
    env: '',
    package: '',
    tsup: '',
    outDir: '',
  }

  _env: Record<string, string> = {}
  _envVars: Record<string, string> = {}
  _envVarsInternal: Record<string, string> = {}
  _pkg: Record<string, any> = {}

  _wranglerConfig: Function = () => {}
  _wranglerConfigParsed: WranglerConfig = {} as WranglerConfig

  constructor(argv: RunOptions, options: CommandOptions<RunOptions>) {
    this._argv = argv
    this._options = options
  }

  async start() {
    await checkRequired()
    await this.prepare()

    process.env.CF_CMD = this._argv.command
    process.env.CF_LOADER = this._argv.loader || ''

    if (this._argv.command.startsWith('pkg:')) {
      await this.exec(`pnpm run ${this._argv.command.slice(4)}`)
    }
    else {
      switch (this._argv.command) {
        case 'dev':
          await this.handlerDev()
          break
        case 'publish':
          await this.handlerPublish()
          break
        case 'delete':
          await this.handlerDelete()
          break
        case 'secret:bulk':
          await this.handlerSecretBulk()
          break
      }
    }
  }

  protected async prepare() {
    console.log(cyan('\n# Prepare Options...\n'))

    const spinner = ora('Get workers...').start()
    const workers = getAllWorkers(this._argv.cwd)
    if (!workers.length) {
      spinner.text = yellow(`No worker found in ${bold(this._argv.cwd)}\n`)
      spinner.fail()
      process.exit(0)
    }
    this._options.name.choices = workers
    spinner.text = green(`Found ${workers.length} workers: ${dim(workers.join(', '))}`)
    spinner.succeed()

    if (this._argv.name && !workers.includes(this._argv.name)) {
      console.log(yellow(`Worker "${bold(this._argv.name)}" does not exist in ${bold(this._argv.cwd)}\n`))
      this._argv.name = ''
    }

    this._argv = await inquirer(pick(this._options, 'name'), this._argv)

    const workerRoot = path.resolve(this._argv.cwd, this._argv.name)
    this._path = {
      root: workerRoot,
      devVars: path.resolve(workerRoot, '.dev.vars'),
      wranglerTomlDev: path.resolve(workerRoot, 'wrangler.toml'),
      wranglerConfig: path.resolve(workerRoot, 'wrangler.config.ts'),
      env: path.resolve(workerRoot, '.env'),
      package: path.resolve(workerRoot, 'package.json'),
      tsup: path.resolve(workerRoot, 'tsup.config.ts'),
      outDir: '',
    }

    const spinner2 = ora('Get commands...').start()
    const commands: any = getCommand()
    this._pkg = (await import(this._path.package)).default
    const scripts = this._pkg.scripts
    const scriptsCommands = Object.entries(scripts).map(([key, value]) => {
      return {
        name: logPretty(`pkg:${key}`, `🔵 ${green(value as string)}`),
        value: `pkg:${key}`,
      }
    })
    const commandKeys = commands.map((c: any) => c.value)
    this._options.command.choices = commands.concat(scriptsCommands.length
      ? [new inquirerPkg.Separator(), ...scriptsCommands]
      : [],
    )
    spinner2.text = green(`Found ${commands?.length} commands and ${scriptsCommands?.length} scripts`)
    spinner2.succeed()

    if (this._argv.command && !commandKeys.includes(this._argv.command)) {
      console.log(yellow(`Command "${bold(this._argv.command)}" does not exist`))
      this._argv.command = ''
    }

    this._argv = await inquirer(pick(this._options, 'command'), this._argv)

    if (fs.existsSync(this._path.env))
      this._env = dotenv.parse(fs.readFileSync(this._path.env, 'utf-8'))

    if (!fs.existsSync(this._path.wranglerConfig)) {
      console.log(red(`wrangler.config.ts does not exist in ${workerRoot}`))
      process.exit(0)
    }
    this._wranglerConfig = (await import(this._path.wranglerConfig)).wranglerConfig
  }

  protected async prepareEnv() {
    console.log(cyan('\n# Prepare Environment...\n'))

    const spinner = ora('Get envs...').start()
    await this.resolveEnv()
    const envVarsCount = Object.keys(this._envVars).length
    const envVarsInternalCount = Object.keys(this._envVarsInternal).length
    spinner.text = green(`Found ${envVarsCount} env vars and ${envVarsInternalCount} internal env vars`)
    spinner.succeed()

    const spinner2 = ora('Get wrangler config...').start()
    await this.parseWranglerConfig()
    spinner2.text = green('Parsed wrangler.config.ts success')

    const envs = Object.keys(this._wranglerConfigParsed.env)
    spinner2.text = green(`Found ${envs.length} environment modes in wrangler.config.ts: ${dim(envs.join(', '))}`)
    spinner2.succeed()

    if (this._argv.env && !envs.includes(this._argv.env)) {
      console.log(yellow(`Enviroment "${bold(this._argv.env)}" does not exist in \`wrangler.config.ts\`\n`))
      this._argv.env = ''
    }
    this._options.env.choices = [{ name: 'Empty', value: '' }, ...envs] as any
    this._argv = await inquirer(pick(this._options, ['env']), this._argv)
    // Set env
    process.env.CF_ENV = this._argv.env
  }

  protected async resolveEnv() {
    const envVars: Record<string, any> = {}
    const envVarsInternal: Record<string, string> = {}
    if (this._env && Object.keys(this._env).length) {
      for (const [key, value] of Object.entries(this._env)) {
        const newValue = typeof value === 'string' ? await this.execString(value) : value
        if (key.startsWith('__') && key.endsWith('__'))
          envVarsInternal[key.replace(/__(.*?)__/, '$1')] = newValue
        else
          envVars[key] = newValue
      }
    }

    this._envVars = envVars
    this._envVarsInternal = envVarsInternal
  }

  protected async confirm() {
    console.log()
    const answer = await inquirerPkg.prompt({
      type: 'confirm',
      name: 'continue',
      message: 'Continue?',
      default: true,
    })
    if (!answer.continue) {
      console.log(dim('Bye!'))
      process.exit(0)
    }
  }

  protected async handlerDev() {
    await this.prepareEnv()
    await this.writeWranglerToml()

    // Write env vars to .dev.vars
    if (Object.keys(this._envVars).length) {
      const envVarsStr = Object.entries(this._envVars).map(([key, value]) => `${key}=${value}`)
      fs.writeFileSync(this._path.devVars, envVarsStr.join(os.EOL))
    }

    // Set to run the preview of the Worker directly on your local machine
    if (!('local' in this._argv))
      this._argv.local = true

    // Run command `wrangler dev`
    await this.runWrangler()
  }

  protected async handlerPublish() {
    !this._argv.dryRun && await this.confirm()
    await this.prepareEnv()

    if (this._argv.loader) {
      console.log(cyan('\n# Build with tsup...\n'))

      // Check tsup configuration file
      if (!fs.existsSync(this._path.tsup)) {
        console.log(red(`tsup.config.ts does not exist in ${this._path.root}`))
        process.exit(0)
      }

      await this.exec('tsup')
    }

    // Bumpp version
    !this._argv.dryRun && await this.handlerRelease()
    // Write wrangler.toml
    await this.writeWranglerToml()
    // If not set `--dry-run` or set `--dry-run` and not set `--loader`
    // Run command `wrangler publish`
    if ((!this._argv.dryRun) || (this._argv.dryRun && !this._argv.loader)) {
      // Running in wrangler default `--dry-run`
      // Set a default value for `--outdir`
      if (this._argv.dryRun && !this._argv.loader && !this._argv.outdir)
        this._argv.outdir = this._path.outDir

      await this.runWrangler()
    }
    // Run command `wrangler secret:bulk`
    !this._argv.dryRun && await this.handlerSecretBulk()
  }

  protected async handlerDelete() {
    console.log(cyan('\n# Delete worker...\n'))

    await this.prepareEnv()
    await this.runWrangler()
  }

  protected async handlerSecretBulk() {
    console.log(cyan('\n# Publish secrets...\n'))

    if (this._argv.command === 'secret:bulk') {
      await this.confirm()
      await this.prepareEnv()
    }

    if (!Object.keys(this._envVars).length) {
      console.log(yellow('No secrets to publish'))
    }
    else {
      const tmpEnvPath = path.resolve(this._path.root, '.tmp.env.json')
      fs.writeFileSync(tmpEnvPath, JSON.stringify(this._envVars, null, 2))
      // Format
      await this.exec(`eslint --fix ${tmpEnvPath}`)
      await this.runWrangler({ command: 'secret:bulk', params: tmpEnvPath })
      fs.unlinkSync(tmpEnvPath)
    }
  }

  protected async handlerRelease() {
    if (this._argv.command === 'publish' && this._argv.release) {
      console.log(cyan('\n# Start release...\n'))

      const bumppStr = 'npx bumpp package.json --no-tag --no-commit --no-push'
      console.log(`${green(`> ${bumppStr}`)}\n`)
      await this.exec(bumppStr)

      console.log(`${green('> git add package.json')}\n`)
      await this.exec('git add package.json')

      if (this._argv.loader) {
        // Add dist to git
        console.log(`${green('> git add dist')}\n`)
        await this.exec('git add dist')
      }

      // Commit and push to github
      this._pkg = (await import(this._path.package)).default
      const commitStr = `git commit -m chore(${this._argv.name}):\\ release\\ v${this._pkg.version}`
      console.log(`${green(`> ${commitStr}`)}\n`)
      await this.exec(commitStr)

      console.log(`${green('> git push')}\n`)
      await this.exec('git push')

      // May be need to reexcute the dynamic secrets, e.g. `$(...)`
      await this.resolveEnv()
      await this.parseWranglerConfig()
    }
  }

  /** Write parsed wrangler config to wrangler.toml */
  protected async writeWranglerToml() {
    console.log(cyan('\n# Write wrangler.toml...\n'))

    const isPublish = this._argv.command === 'publish'
    let tomlPath = this._path.wranglerTomlDev
    // Check the out directory
    if (isPublish && this._wranglerConfigParsed.outDir) {
      const outDir = path.resolve(this._path.root, this._wranglerConfigParsed.outDir)
      if (!fs.existsSync(outDir)) {
        console.log(red(`\`outDir\` ${outDir} does not exist`))
        const answer = await inquirerPkg.prompt({
          type: 'confirm',
          name: 'create',
          message: `Create it now?${dim(` (${outDir})`)}`,
          default: false,
        })
        if (answer.create) {
          fs.mkdirSync(outDir, { recursive: true })
          console.log(green(`Create directory success: ${dim(outDir)}`))
        }
        else {
          process.exit(0)
        }
      }
      this._path.outDir = outDir
      // If not set `--loader`, will use the default wrangler.toml
      if (this._argv.loader) {
        const env = this._argv.env ? `.${this._argv.env}` : ''
        this._argv.config = path.resolve(this._path.outDir, `${this._argv.name}${env}.wrangler.toml`)
        tomlPath = this._argv.config
      }
    }

    const tomlWranglerConfig = toml.stringify(omit(this._wranglerConfigParsed, 'outDir'))
    fs.writeFileSync(tomlPath, tomlWranglerConfig)
    console.log(green(`Write wrangler.toml success: ${dim(tomlPath)}`))
  }

  protected async parseWranglerConfig() {
    const parsed = await this._wranglerConfig({
      env: this._envVarsInternal,
      pkg: this._pkg,
      execs: (str: string) => this.execs(str),
      cwd: this._path.root,
    })
    this._wranglerConfigParsed = deepRemoveUndefined(parsed)
  }

  protected async runWrangler(newArgv: any = {}) {
    console.log(cyan('\n# Run wrangler...\n'))
    const disableKeys = ['_', '$0', ...internalKeys]
    const argv = Object.assign({}, this._argv, newArgv)
    const commandArr = ['wrangler', argv.command]

    if (typeof argv.params === 'string' && argv.params)
      commandArr.push(argv.params)

    Object.entries(argv).forEach(([key, value]) => {
      if (!disableKeys.includes(key) && key.length !== 1 && !key.match(/[A-Z]/))
        commandArr.push(`--${key}`, value)
    })

    const commandStr = commandArr.join(' ')
    console.log(`${green(`> ${commandStr}`)}\n`)

    await this.exec(commandStr)
  }

  protected async exec(command: string, options: ExecaOptions = {}) {
    return await execa.execaCommand(command, Object.assign(
      {},
      { cwd: this._path.root, stdio: 'inherit' },
      options,
    ))
  }

  protected execSync(command: string, options: ExecaSyncOptions = {}) {
    return execa.execaCommandSync(command, Object.assign(
      {},
      { cwd: this._path.root, stdio: 'inherit' },
      options,
    ))
  }

  protected async execString(str: string) {
    const matches = str.match(/^\$\((.*?)\)$/)
    if (matches) {
      const { stdout, stderr } = await this.exec(matches[1], { stdio: 'pipe' })
      if (stderr) {
        console.log(red(stderr))
        process.exit(0)
      }
      return stdout
    }
    return str
  }

  protected execStringSync(str: string) {
    const matches = str.match(/^\$\((.*?)\)$/)
    if (matches) {
      const { stdout, stderr } = this.execSync(matches[1], { stdio: 'pipe' })
      if (stderr) {
        console.log(red(stderr))
        process.exit(0)
      }
      return stdout
    }
    return str
  }

  protected execs(str: string) {
    const { stdout, stderr } = this.execSync(str, { stdio: 'pipe' })
    if (stderr) {
      console.log(red(stderr))
      process.exit(0)
    }
    return stdout
  }
}

async function checkRequired() {
  console.log(cyan('# Checking required...\n'))

  // 1. Node version must be greater than v16.13.0
  const spinner = ora('Checking Node version...').start()
  const nodeMinVer = 'v16.13.0'
  if (compareVersions(process.version, nodeMinVer) === -1) {
    spinner.text = red(`Node version must >= ${nodeMinVer}, current is ${process.version}`)
    spinner.fail()
    process.exit(0)
  }
  else {
    spinner.text = green(`Node version: ${process.version}`)
    spinner.succeed()
  }

  // 2. Wrangler version must be greater than v2.10.0
  const spinner2 = ora('Checking Wrangler version...').start()
  const wranglerMinVer = 'v2.0.0'
  try {
    const { stdout: ver } = await execa.execaCommand('wrangler -v')
    if (compareVersions(ver, wranglerMinVer) === -1) {
      spinner2.text = red(`Wrangler version must >= ${wranglerMinVer}, current is ${ver}, please upgrade it first`)
      spinner2.fail()
      process.exit(0)
    }
    spinner2.text = green(`Wrangler version: v${ver}`)
    spinner2.succeed()
  }
  catch (error) {
    spinner2.text = red('Wrangler is not installed, please install it first')
    spinner2.fail()
    process.exit(0)
  }
}

function getCommand() {
  return [
    // { value: 'docs', name: 'docs [command]      📚 Open wrangler\'s docs in your browser' },
    // { value: 'init', name: 'init [name]         📥 Create a wrangler.toml configuration file' },
    { value: 'dev', name: logPretty('dev [script]', '👂 Start a local server for developing your worker') },
    { value: 'publish', name: logPretty('publish [script]', '🆙 Publish your Worker to Cloudflare.') },
    { value: 'delete', name: logPretty('delete [script]', '🗑️  Delete your Worker from Cloudflare.') },
    // { value: 'tail', name: 'tail [worker]       🦚 Starts a log tailing session for a published Worker.' },
    // { value: 'secret', name: 'secret              🤫 Generate a secret that can be referenced in a Worker' },
    { value: 'secret:bulk', name: logPretty('secret:bulk <json>', '🗄️  Bulk upload secrets for a Worker') },
    // { value: 'kv:namespace', name: 'kv:namespace        🗂️  Interact with your Workers KV Namespaces' },
    // { value: 'kv:key', name: 'kv:key              🔑 Individually manage Workers KV key-value pairs' },
    // { value: 'kv:bulk', name: 'kv:bulk             💪 Interact with multiple Workers KV key-value pairs at once' },
    // { value: 'pages', name: 'pages               ⚡️ Configure Cloudflare Pages' },
    // { value: 'queues', name: 'queues              🇶 Configure Workers Queues' },
    // { value: 'r2', name: 'r2                  📦 Interact with an R2 store' },
    // { value: 'dispatch-namespace', name: 'dispatch-namespace  📦 Interact with a dispatch namespace' },
    // { value: 'd1', name: 'd1                  🗄  Interact with a D1 database' },
    // { value: 'pubsub', name: 'pubsub              📮 Interact and manage Pub/Sub Brokers' },
    // { value: 'login', name: 'login               🔓 Login to Cloudflare' },
    // { value: 'logout', name: 'logout              🚪 Logout from Cloudflare' },
    // { value: 'whoami', name: 'whoami              🕵️  Retrieve your user info and test your auth config' },
    // { value: 'types', name: 'types               📝 Generate types from bindings & module rules in config' },
    // { value: 'deployments', name: 'deployments         🚢 Displays the 10 most recent deployments for a worker' },
  ]
}

function logPretty(title: string, message: string, width = 30) {
  const titleWidth = title.length
  const messageWidth = width - titleWidth - 1
  const output = `${title}${' '.repeat(messageWidth)} ${message}`
  return output
}

function deepRemoveUndefined<T = any>(obj: T): T {
  if (typeof obj !== 'object' || obj === null)
    return obj
  const newObj = Array.isArray(obj) ? [] as any[] : {} as Record<string, any>
  for (const key in obj) {
    if (obj[key] === undefined)
      continue
    newObj[key] = deepRemoveUndefined(obj[key])
  }
  return newObj as T
}

