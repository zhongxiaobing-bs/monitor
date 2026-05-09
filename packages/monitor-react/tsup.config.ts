import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: '../../tsconfig.build.json',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  noExternal: [
    '@company/monitor-core',
    '@company/monitor-types',
    '@company/monitor-shared',
    '@company/monitor-transport',
    '@company/monitor-plugin-error',
    '@company/monitor-plugin-network',
    '@company/monitor-plugin-blank-screen'
  ]
})
