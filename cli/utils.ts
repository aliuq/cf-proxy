import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'
import { bold, red } from './colors'

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

/** render template file
 *
 * @param {string} templateRoot template root path
 * @param {string} destRoot destination root path
 * @param {Object} answers answers
 */
export function renderTemplate(templateRoot: string, destRoot: string, answers: Object) {
  try {
    if (!fs.existsSync(templateRoot))
      throw new Error(`template root: ${bold(templateRoot)} not exist`)

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
        const content = handlebars.compile(templateContent)(answers)

        // write to dest file
        fs.writeFileSync(destPath, content, 'utf-8')
      }
    })
  }
  catch (error: any) {
    // eslint-disable-next-line no-console
    console.log(red(error.message))
    process.exit(0)
  }
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
      && fs.existsSync(`${p}/wrangler.toml`)
  })
  return workers
}
