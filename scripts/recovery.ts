import fs from 'fs'
import path from 'path'
import fg from 'fast-glob'

// TODO: 完善

;(async () => {
  // const existDotHistory = fs.existsSync('.history')
  const fileMaps = await getFileMaps()
  recovery(fileMaps)
})()

async function getFileMaps() {
  const dateReg = /^.*?(_\d{14})\..*?$/
  const files = fg.sync('cli/**/*', { onlyFiles: true, cwd: '.history' })
  const fileMaps: Record<string, string> = {}

  for (const file of files) {
    const match = file.match(dateReg)
    if (match) {
      const date = match[1]
      const realName = file.replace(date, '')
      if (!fileMaps[realName]) {
        fileMaps[realName] = file
      }
      else {
        const prevDate = fileMaps[realName].match(dateReg)![1] as string
        if (prevDate < date)
          fileMaps[realName] = file
      }
    }
  }

  return fileMaps
}

async function recovery(fileMaps: Record<string, string>) {
  Object.entries(fileMaps).forEach(([name, file]) => {
    const dir = path.dirname(name)
    if (!fs.existsSync(dir))
      fs.mkdirSync(dir, { recursive: true })

    fs.copyFileSync(path.resolve('.history', file), name)
  })
}
