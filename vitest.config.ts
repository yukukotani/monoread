import { defineConfig } from 'vitest/config'
import { powerAssert } from 'rollup-plugin-power-assert'

export default defineConfig({
  plugins: [
    powerAssert({
      include: ['**/*.test.ts', '**/*.test.js'],
      exclude: ['**/dist/**', '**/node_modules/**'],
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'coverage/', '**/*.test.ts'],
    },
  },
})