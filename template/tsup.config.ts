import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  external: [],
  outExtension({ format }) {
    return {
      js: format === 'esm'
        ? '.mjs'
        : format === 'cjs'
          ? '.cjs'
          : '.js',
    }
  },
})
