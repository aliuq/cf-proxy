import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  minify: false,
  external: [],
  sourcemap: true,
  keepNames: true,
  outExtension({ format }) {
    return {
      js: format === 'esm'
        ? '.mjs'
        : '.js',
    }
  },
})
