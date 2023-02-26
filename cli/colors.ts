import { inspect } from 'node:util'

type ColorNames = [
  'reset', 'bold', 'dim',
  'italic', 'underline', 'blink',
  'inverse', 'hidden', 'strikethrough',
  'doubleunderline', 'black', 'red',
  'green', 'yellow', 'blue',
  'magenta', 'cyan', 'white',
  'bgBlack', 'bgRed', 'bgGreen',
  'bgYellow', 'bgBlue', 'bgMagenta',
  'bgCyan', 'bgWhite', 'framed',
  'overlined', 'gray', 'redBright',
  'greenBright', 'yellowBright', 'blueBright',
  'magentaBright', 'cyanBright', 'whiteBright',
  'bgGray', 'bgRedBright', 'bgGreenBright',
  'bgYellowBright', 'bgBlueBright', 'bgMagentaBright',
  'bgCyanBright', 'bgWhiteBright',
]

type ColorFunction = (str: string) => string
type ColorKeys = ColorNames[number]
type ColorMap = Record<ColorKeys, ColorFunction>

/**
 * Same as [kolorist](https://github.com/marvinhagemeister/kolorist/blob/main/src/index.ts)
 */
function generateFunc(): ColorMap {
  const funcKeys = Object.keys(inspect.colors) as ColorNames
  const functions = {} as ColorMap

  for (const key of funcKeys) {
    const colorCode = inspect.colors[key]
    if (colorCode)
      functions[key] = (str: string) => `\x1B[${colorCode[0]}m${str}\x1B[${colorCode[1]}m`
  }

  return functions
}

const colors: ColorMap = generateFunc()

export default colors

// Export all function from `colors`
export const {
  reset, bold, dim,
  italic, underline, blink,
  inverse, hidden, strikethrough,
  doubleunderline, black, red,
  green, yellow, blue,
  magenta, cyan, white,
  bgBlack, bgRed, bgGreen,
  bgYellow, bgBlue, bgMagenta,
  bgCyan, bgWhite, framed,
  overlined, gray, redBright,
  greenBright, yellowBright, blueBright,
  magentaBright, cyanBright, whiteBright,
  bgGray, bgRedBright, bgGreenBright,
  bgYellowBright, bgBlueBright, bgMagentaBright,
  bgCyanBright, bgWhiteBright,
} = colors
