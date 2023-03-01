import path from 'path'
import fs from 'fs'
import * as execa from 'execa'

// 遍历templateRoot目录下的所有文件，如果是文件夹，递归遍历，如果是文件，渲染模板，渲染模板时，使用answers作为模板数据，渲染后的文件，保存到destRoot目录下
export function renderTemplate(templateRoot: string, destRoot: string, answers: Object) {
  if (!fs.existsSync(templateRoot))
    throw new Error(`template root: ${templateRoot} not exist`)

  if (!fs.existsSync(destRoot))
    fs.mkdirSync(destRoot)

  // read all file names in templateRoot
  const files = fs.readdirSync(templateRoot)

  files.forEach((fileName) => {
    const templatePath = path.resolve(templateRoot, fileName)
    const destPath = path.resolve(destRoot, fileName)
    // judge if file is folder
    const isDir = fs.statSync(templatePath).isDirectory()
    if (isDir) {
      // clone recursively
      renderTemplate(templatePath, destPath, answers)
    }
    else {
      // read template file
      const templateContent: string = fs.readFileSync(templatePath, 'utf-8')
      const content = render(templateContent, answers)
      // write to dest file
      fs.writeFileSync(destPath, content, 'utf-8')
    }
  })
}

interface ParseArgs {
  maps?: Record<string, any>
  start?: number
  serialize?: (value: any, key: string) => any
}

export function parseArgs<T extends {}>(options: ParseArgs): T {
  const {
    maps = {},
    start = 2,
    serialize = (value: any, _key: string) => value,
  } = options
  const args = process.argv.slice(start)
  const result: Pick<T, any> = {}

  const isMatchKey = (key: string) => key.match(/^--(.+)/)
  const isMatchShortKey = (key: string) => key.match(/^-([a-zA-Z])/)
  const validKey = (key: string) => isMatchKey(key) || isMatchShortKey(key)
  const getRealKey = (key: string, maps: Record<string, any> = {}) => {
    if (isMatchKey(key))
      return key.replace(/^--/, '')
    if (isMatchShortKey(key))
      return maps[key.replace(/^-/, '')]
  }

  for (let i = 0; i < args.length; i++) {
    if (!validKey(args[i]))
      continue

    const _key = getRealKey(args[i], maps)
    const nextKey = args[i + 1]
    if (_key) {
      // no-xxx
      if (_key.match(/^(no-)[a-zA-Z]/) && (!nextKey || validKey(nextKey))) {
        result[_key.substring(3)] = false
        continue
      }
      result[_key] = nextKey && !validKey(nextKey) ? serialize(nextKey, _key) : true
    }
  }

  return result
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 从字符串中提取出命令，执行命令，返回命令的输出
export async function execString(str: string, cwd?: string) {
  const matches = str.match(/^\$\((.*?)\)$/)
  if (matches) {
    const { stdout, stderr } = await execa.execaCommand(matches[1], cwd ? { cwd } : {})
    if (stderr)
      throw new Error(stderr)
    return stdout
  }
  return str
}

/** 渲染模板
 *
 * @param template 模板字符串
 * @param data 渲染数据
 */
export function render(template: string, data: Record<string, any>): string {
  const pattern = /{{\s*(\w+)\s*}}/g

  return template.replace(pattern, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : ''
  })
}
