import fs from 'fs'

/** Pick properties from an object.
 *
 * @param {Object} obj
 * @param {string[]} keys
 * @returns {Object}
 */
export function pick(obj: Record<string, any>, keys: string[] | string): Record<string, any> {
  const result: Record<string, any> = {}
  if (typeof keys === 'string')
    keys = [keys]

  keys.forEach((key) => {
    result[key] = obj[key]
  })
  return result
}

export function omit(obj: Record<string, any>, keys: string[] | string): Record<string, any> {
  const result: Record<string, any> = {}
  if (typeof keys === 'string')
    keys = [keys]

  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key))
      result[key] = obj[key]
  })
  return result
}

export interface WriteFileOptions {
  encoding?: BufferEncoding | null
  mode?: number | string
  flag?: string
}

export function recursiveWriteFile(filePath: string, data: string | Buffer, options?: WriteFileOptions) {
  // Split the file path into its individual parts
  const parts = filePath.split('/')

  // Remove the file name from the end of the path
  const fileName = parts.pop()

  // Recursively create each directory in the path
  let currentPath = ''
  for (const part of parts) {
    currentPath += `${part}/`
    try {
      fs.mkdirSync(currentPath)
    }
    catch (error: any) {
      // Ignore the error if the directory already exists
      if (error.code !== 'EEXIST')
        throw error
    }
  }

  // Write the file to the final directory
  fs.writeFileSync(`${currentPath}${fileName}`, data, options)
}

/** Compare two version numbers in the format of semver.
 *
 * @param {string} version1 - The first version to compare.
 * @param {string} version2 - The second version to compare.
 * @returns {number} Returns 1 if version1 is greater than version2, -1 if version1 is less than version2, and 0 if they are equal.
 */
export function compareVersions(version1: string, version2: string): number {
  const versionRegex = /^[vV]?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  const match1 = version1.match(versionRegex)
  const match2 = version2.match(versionRegex)

  if (!match1 || !match2)
    throw new Error('Invalid version format')

  const [major1, minor1, patch1] = [match1[1], match1[2], match1[3]].map(Number)
  const [major2, minor2, patch2] = [match2[1], match2[2], match2[3]].map(Number)

  if (major1 > major2)
    return 1

  else if (major1 < major2)
    return -1

  else if (minor1 > minor2)
    return 1

  else if (minor1 < minor2)
    return -1

  else if (patch1 > patch2)
    return 1

  else if (patch1 < patch2)
    return -1

  else
    return 0
}

/** Get all workers */
export function getAllWorkers(workersRoot: string) {
  const workers = fs.readdirSync(workersRoot).filter((file) => {
    const p = `${workersRoot}/${file}`
    return fs.statSync(p).isDirectory()
      && fs.existsSync(`${p}/package.json`)
  })
  return workers
}

/** 渲染模板
 *
 * @param template 模板字符串
 * @param data 渲染数据
 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  const pattern = /{{\s*(\w+)\s*}}/g

  return template.replace(pattern, (_, key) => {
    return data[key] !== undefined ? String(data[key]) : ''
  })
}
