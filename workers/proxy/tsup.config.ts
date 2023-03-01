import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  minify: false,
  external: [],
  loader: {
    '.html': 'text',
  },
  sourcemap: true,
  outExtension({ format }) {
    return {
      js: format === 'esm'
        ? '.mjs'
        : '.js',
    }
  },
})
