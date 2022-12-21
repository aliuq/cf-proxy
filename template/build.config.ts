import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: true,
  // If met some error, you can set failOnWarn to false to ignore it.
  // failOnWarn: false,
  // Incompatible with `rollup.esbuild.minify`, an error will occur
  declaration: true,
  externals: [],
  rollup: {
    esbuild: {
      // See `declaration`
      // minify: true,
    },
  },
})
