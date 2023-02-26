import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  minify: false,
  external: [],
  outExtension({ format }) {
    return {
      js: format === 'esm'
        ? '.mjs'
        : '.js',
    }
  },
})
