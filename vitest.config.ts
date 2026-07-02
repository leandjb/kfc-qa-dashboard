import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/sauce-demo/**/*.spec.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    pool: 'forks',
    reporters: [
      'default',
      ['json', { outputFile: 'reports/test-results.json' }],
    ],
    env: {
      NODE_ENV: 'test',
    },
  },
})
