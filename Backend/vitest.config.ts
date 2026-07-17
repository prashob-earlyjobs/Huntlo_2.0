import path from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';

function resolveJsToTs(): Plugin {
  return {
    name: 'resolve-js-to-ts',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith('.js') || source.includes('node_modules')) {
        return null;
      }

      const tsSource = source.replace(/\.js$/, '.ts');
      const resolution = await this.resolve(tsSource, importer, { skipSelf: true });
      return resolution?.id ?? null;
    },
  };
}

export default defineConfig({
  plugins: [resolveJsToTs()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.ts', '.js', '.json'],
  },
});
