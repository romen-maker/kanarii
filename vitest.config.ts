import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['tests/e2e/**', 'dist/**', 'node_modules/**'],
  },
});
