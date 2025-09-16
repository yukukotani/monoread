import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', "./src/cli.ts"],
  format: ['esm'],
  target: 'node22',
  outDir: './dist',
  clean: true,
  dts: true,
  sourcemap: true,
  minify: true,
})
