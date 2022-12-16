import fs from 'fs'
import path from 'path'
import os from 'os'
import inquirer from 'inquirer'
import toml from '@iarna/toml'
import * as execa from 'execa'
import dotenv from 'dotenv'
import { cyan, gray, green, lightCyan, magenta, red, yellow } from 'kolorist'
import fse from 'fs-extra'
import ora from 'ora'
import semver from 'semver'
import { execString, parseArgs } from './utils'

//
// === Check required wrangler and node version
//
await checkRequired()

//
// === Parse args and options
//
const { worker, command, params, workersRoot, unbuild, ...flags } = parseCliOptions()
/** All options */
const answers = { worker, command, workersRoot, unbuild, params, flags }

// help and version command will not run any worker
answers.flags.help && printtHelp()
answers.flags.version && await printVersion()

// Get all available workers
const workers = getAllWorkers(answers.workersRoot)
if (!answers.worker || !workers.includes(answers.worker)) {
  console.log(yellow(`\n** Worker name (${answers.worker}) is invalid. **\n`))
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'worker',
    message: 'Select a worker to run:',
    choices: workers,
  }])
  answers.worker = answer.worker
}

/** See more at `wrangler -h`
 */
const commands = [
  // { value: 'docs', name: 'docs [command]      📚 Open wrangler\'s docs in your browser' },
  // { value: 'init', name: 'init [name]         📥 Create a wrangler.toml configuration file' },
  { value: 'dev', name: 'dev [script]        👂 Start a local server for developing your worker' },
  { value: 'publish', name: 'publish [script]    🆙 Publish your Worker to Cloudflare.' },
  { value: 'delete', name: 'delete [script]     🗑  Delete your Worker from Cloudflare.' },
  // { value: 'tail', name: 'tail [worker]       🦚 Starts a log tailing session for a published Worker.' },
  // { value: 'secret', name: 'secret              🤫 Generate a secret that can be referenced in a Worker' },
  { value: 'secret:bulk', name: 'secret:bulk <json>  🗄️  Bulk upload secrets for a Worker' },
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
if (!answers.command || !commands.map(c => c.value).includes(answers.command)) {
  console.log(yellow(`\n** Command (${answers.command}) is invalid. **\n`))
  const answer = await inquirer.prompt([{
    type: 'list',
    pageSize: 25,
    name: 'command',
    message: 'Select a command to run:',
    choices: commands,
  }])
  answers.command = answer.command
}

//
// === Related paths and read configurations.
//
/** Path to project */
const root = process.cwd()
/** Path to worker directory */
const workerRoot = path.resolve(root, answers.workersRoot, answers.worker)
/** Path to `.dev.vars` */
const devVarsPath = path.resolve(workerRoot, '.dev.vars')
/** Path to `wrangler.toml`, only used in dev mode */
const wranglerTomlDevPath = path.resolve(workerRoot, 'wrangler.toml')
/** Path to `wrangler.config.ts`, for generate dynamic configuration */
const wranglerConfigPath = path.resolve(workerRoot, 'wrangler.config.ts')
/** Path to `.env` */
const envPath = path.resolve(workerRoot, '.env')
/** Path to `package.json` */
const packagePath = path.resolve(workerRoot, 'package.json')

console.log(`
${lightCyan('Related paths:')}
                                                              
${magenta('root:')}               ${cyan(root)}
${magenta('workerRoot:')}         ${cyan(workerRoot)}
${magenta('wrangler.toml:')}      ${cyan(wranglerTomlDevPath)}
${magenta('wrangler.config.ts:')} ${cyan(wranglerConfigPath)}
${magenta('package.json:')}       ${cyan(packagePath)}
${magenta('.dev.vars:')}          ${cyan(devVarsPath)}
${magenta('.env:')}               ${cyan(envPath)}
`)

// Read configurations
const envConfig = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath, 'utf-8')) : {}
const { wranglerConfig } = await import(wranglerConfigPath)

//
// === Run command
console.info(cyan(`Running ${green(answers.command)} in worker ${green(answers.worker)}...`))
if (answers.command === 'dev') {
  // Get the environment variables
  const envVars = Object.keys(envConfig).length > 0 ? await parseEnvConfig(envConfig, workerRoot) : {}
  const envVarsInternal: Record<string, string> = {}
  Object.keys(envVars).forEach((key: string) => {
    if (key.startsWith('__') && key.endsWith('__')) {
      envVarsInternal[key.replace(/__(.*?)__/, '$1')] = envVars[key]
      delete envVars[key]
    }
  })

  // Parsing the worker configuration
  const wranglerConfigParsed = await wranglerConfig({ env: envVarsInternal })
  console.debug('Read the parsed `wrangler.config.ts` configuration:', gray(JSON.stringify({ 'wrangler.toml': wranglerConfigParsed })))

  // Select environment
  await selectEnv(wranglerConfigParsed, answers)

  // Parse the `wrangler.toml` path, based on `workerRoot`
  const wranglerTomlPath = wranglerTomlDevPath
  console.debug('Parsing the `wrangler.toml` path:', cyan(wranglerTomlPath))

  // Store the parsed worker configuration in `wrangler.toml`
  await fse.writeFile(wranglerTomlPath, toml.stringify(wranglerConfigParsed || {}))
  console.debug('Write to `wrangler.toml` file successfully:', cyan(wranglerTomlPath))

  // Store `key:value` from `.env` into `.dev.vars`, overwriting the original content
  if (Object.keys(envVars).length > 0) {
    const envVarsStr = Object.keys(envVars).map((key: string) => `${key}=${envVars[key]}`)
    await fse.outputFile(devVarsPath, envVarsStr.join(os.EOL))
    console.info('Write to `.dev.vars` file successfully:', cyan(devVarsPath))
  }

  // Run command
  answers.flags.local = typeof answers.flags.local === 'undefined' ? true : answers.flags.local
  await runCommand(answers, workerRoot)
}
else if (answers.command === 'publish') {
  // Confirm publish
  await checkConfirm()

  if (answers.unbuild) {
  // Unbuild package
    console.debug(`${gray(`Execution command(${answers.command}):`)} ${green('unbuild')}\n`)
    await execa.execaCommand('unbuild', { cwd: workerRoot, stdio: 'inherit' })
  }

  // Get the environment variables
  const envVars = Object.keys(envConfig).length > 0 ? await parseEnvConfig(envConfig, workerRoot) : {}
  const envVarsInternal: Record<string, string> = {}
  Object.keys(envVars).forEach((key: string) => {
    if (key.startsWith('__') && key.endsWith('__')) {
      envVarsInternal[key.replace(/__(.*?)__/, '$1')] = envVars[key]
      delete envVars[key]
    }
  })

  // Parsing the worker configuration
  const wranglerConfigParsed = await wranglerConfig({ unbuild: answers.unbuild, env: envVarsInternal })
  console.debug('Read the parsed `wrangler.config.ts` configuration:', gray(JSON.stringify({ 'wrangler.toml': wranglerConfigParsed })))

  // Select environment
  await selectEnv(wranglerConfigParsed, answers)

  // Parse the `wrangler.toml` path, based on `workerRoot`
  let wranglerTomlPath = wranglerTomlDevPath
  let tomlName = 'wrangler.toml'
  if (answers.unbuild) {
  // Set `outDir` path
    const outDir = path.resolve(workerRoot, wranglerConfigParsed.outDir)
    tomlName = `${answers.worker}.wrangler.toml`
    wranglerTomlPath = path.resolve(outDir, tomlName)
    delete wranglerConfigParsed.outDir
  }
  console.debug(`Parsing the \`${tomlName}\` path:`, cyan(wranglerTomlPath))

  // Store the parsed worker configuration in `wrangler.toml`
  await fse.writeFile(wranglerTomlPath, toml.stringify(wranglerConfigParsed || {}))
  console.debug(`Write to \`${tomlName}\` file successfully:`, cyan(wranglerTomlPath))

  // Run command
  await runCommand(answers, workerRoot)

  // Secrets
  if (Object.keys(envVars).length > 0) {
    const tmpEnvPath = path.resolve(workerRoot, '.tmp.env.json')
    await fse.outputJson(tmpEnvPath, envVars)
    console.debug('Write to `.tmp.env.json` file successfully:', cyan(tmpEnvPath))
    const secretAnswers = Object.assign({}, answers, { command: 'secret:bulk', params: tmpEnvPath })
    await runCommand(secretAnswers, workerRoot)
    await fse.unlink(tmpEnvPath)
    console.debug('Delete `.tmp.env.json` file successfully:', cyan(tmpEnvPath))
  }
}
else if (answers.command === 'delete') {
  // Confirm delete
  await checkConfirm()
  // Parsing the worker configuration
  const wranglerConfigParsed = await wranglerConfig()
  console.debug('Read the parsed `wrangler.config.ts` configuration:', gray(JSON.stringify({ 'wrangler.toml': wranglerConfigParsed })))
  // Select environment
  await selectEnv(wranglerConfigParsed, answers)
  // Run command
  await runCommand(answers, workerRoot)
}
else if (answers.command === 'secret:bulk') {
  // Confirm secrets
  await checkConfirm()

  // Get the environment variables
  const envVars = Object.keys(envConfig).length > 0 ? await parseEnvConfig(envConfig, workerRoot) : {}
  Object.keys(envVars).forEach((key: string) => {
    if (key.startsWith('__') && key.endsWith('__'))
      delete envVars[key]
  })

  if (!Object.keys(envVars).length) {
    console.error(red(`No secrets found in \`${envPath}\` file`))
    process.exit(0)
  }

  // Parsing the worker configuration
  const wranglerConfigParsed = await wranglerConfig()
  console.debug('Read the parsed `wrangler.config.ts` configuration:', gray(JSON.stringify({ 'wrangler.toml': wranglerConfigParsed })))
  // Select environment
  await selectEnv(wranglerConfigParsed, answers)

  const tmpEnvPath = path.resolve(workerRoot, '.tmp.env.json')
  await fse.outputJson(tmpEnvPath, envVars)
  console.debug('Write to `.tmp.env.json` file successfully:', cyan(tmpEnvPath))

  answers.params = tmpEnvPath
  await runCommand(answers, workerRoot)

  await fse.unlink(tmpEnvPath)
  console.debug('Delete `.tmp.env.json` file successfully:', cyan(tmpEnvPath))
}

//
//
// ====================== Functions ======================
//
//

/** Confirmation operation before executing the next step, exit the process if `false`
 */
async function checkConfirm() {
  console.log()
  const answer = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure to continue?',
    default: false,
  })
  if (!answer.confirm) {
    console.info(yellow('Exit the process...'))
    process.exit(0)
  }
}

/** Check required wrangler and node version, exit the process if not passed
 */
async function checkRequired() {
  console.log(cyan('Checking required...\n'))
  // Check Node version >= v16.13.0, exit if false
  const spinner = ora('Checking Node version...').start()
  const MIN_NODE_VERSION = '16.13.0'
  if (!semver.satisfies(process.version, `>=${MIN_NODE_VERSION}`)) {
    spinner.text = red(`Node version must >= ${MIN_NODE_VERSION}, current is ${process.version}`)
    spinner.fail()
    process.exit(0)
  }
  else {
    spinner.text = green(`Node version: ${process.version}`)
    spinner.succeed()
  }

  // Check wrangler version
  const spinner2 = ora('Checking wrangler library...').start()
  try {
    const { stdout } = await execa.execaCommand('wrangler -v')
    spinner2.text = green(`Wrangler version: v${stdout}`)
    spinner2.succeed()
  }
  catch (error) {
    spinner2.text = red('Wrangler not found, please install it first.')
    spinner2.fail()
    // TODO: Install wrangler
    process.exit(0)
  }
}

/** Parsed `process.argv` to object */
function parseCliOptions() {
  /** Slice number process.argv from */
  let start = 4
  let worker = process.argv[2]
  if (!worker || !worker.match(/^[a-zA-Z]/)) {
    start = 3
    worker = ''
  }
  let command = process.argv[3]
  if (!command || !command.match(/^[a-zA-Z]/)) {
    start = 2
    command = ''
  }

  const args = parseArgs<Args>({
    maps: {
      c: 'config',
      e: 'env',
      h: 'help',
      v: 'version',
    },
    start,
  })
  return {
    worker,
    command,
    params: args.params ?? '',
    workersRoot: args.workersRoot ?? 'workers',
    unbuild: args.unbuild ?? true,
    /** Options, from `wrangler -h`  */
    ...args,
  } as Required<Args>
}

/** Get all available workers in `workersRoot` path.
 *
 * If a worker directory contains `wrangler.toml` and `package.json` files, it will be returned.
 *
 * Ensure `wrangler.toml` name same as directory name.
 * @param workersRoot Path to workers directory
 */
function getAllWorkers(workersRoot: string) {
  const workers = fs.readdirSync(workersRoot).filter((name) => {
    const stat = fs.statSync
    return stat(`${workersRoot}/${name}`).isDirectory()
    && fs.existsSync(`${workersRoot}/${name}/wrangler.toml`)
     && fs.existsSync(`${workersRoot}/${name}/package.json`)
  })
  return workers
}

function printtHelp() {
  console.log(`
Usage: pnpm run exec [WorkerName] [Command] <Params> [Args]

Options:
  --config, -c    Path to .toml configuration file
  --env, -e       Environment to use for operations and .env files
  --help, -h      Show help
  --version, -v   Show version number
  --worker        Worker name
  --command       Command name
  --params        Positionals parameters
  --workersRoot   Workers root directory
  --unbuild       Use Unbuild to build worker
  `)
  process.exit(0)
}

async function printVersion() {
  const { stdout } = await execa.execaCommand('wrangler -v')
  console.log(`wrangler v${stdout}`)
  process.exit(0)
}

/** Select a enviroment */
async function selectEnv(wranglerConfigParsed: Record<string, any>, answers: Record<string, any>) {
  const envs = Object.keys(wranglerConfigParsed.env || {})
  if (envs.length > 0)
    console.log(cyan(`\nFound ${envs.length} enviroments in \`wrangler.config.ts\`: ${envs.join(', ')}\n`))

  const env = answers.flags.env
  if (env)
    console.log(cyan(`Default enviroment: ${green(env)}`))

  if (envs.length > 0 && (typeof env === 'undefined' || (env && !envs.includes(env)))) {
    const answer = await inquirer.prompt({
      type: 'list',
      name: 'env',
      message: 'Select a enviroment',
      choices: [{ name: 'Empty', value: '' }, ...envs],
    })
    console.log(cyan(`Default enviroment: ${green(answer.env)}`))
    answers.flags.env = answer.env
  }
}

/** Parse `.env` file content to object
 */
async function parseEnvConfig(envConfig: Record<string, any>, cwd: string) {
  if (envConfig && Object.keys(envConfig).length > 0) {
    const envVars: Record<string, any> = {}
    for (const key of Object.keys(envConfig)) {
      const value = envConfig[key]
      envVars[key] = typeof value === 'string' ? await execString(value, cwd) : value
    }
    console.info('Read the parsed `.env` configuration:', gray(JSON.stringify({ envKeys: Object.keys(envVars) })))
    return envVars
  }
  return {}
}

/** Run `wrangler` command */
async function runCommand(answers: Record<string, any>, cwd: string) {
  // Splice command
  const commandArr = ['wrangler', answers.command]
  if (typeof answers.params === 'string' && answers.params)
    commandArr.push(answers.params)

  Object.keys(answers.flags).forEach((key) => {
    if (answers.flags[key]) {
      commandArr.push(`--${key}`)
      commandArr.push(answers.flags[key])
    }
  })

  // Run command
  console.info(`Execution command(${green(answers.command)}): ${green(commandArr.join(' '))}\n`)
  await execa.execaCommand(commandArr.join(' '), { cwd, stdio: 'inherit' })
}

//
// ================ Types ================
//
interface Args {
  [key: string]: any
  /** Path to .toml configuration file */
  config?: string
  /** Environment to use for operations and .env files */
  env?: string
  /** Print help text */
  help?: boolean
  /** Print version info */
  version?: boolean
  /** Worker name, ensure the worker root path */
  worker?: string
  /** Command name, from `wrangler -h` */
  command?: string
  /** Command params, from `wrangler -h` */
  params?: string
  /** Path to workers directory */
  workersRoot?: string
  /** Use unbuild bundle package, only support publish */
  unbuild?: boolean
}
