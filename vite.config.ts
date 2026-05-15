import { playwright } from '@vitest/browser-playwright';
import { analyzer, unstableRolldownAdapter } from 'vite-bundle-analyzer';
import { defineConfig } from 'vitest/config';

process.chdir(import.meta.dirname);

export default defineConfig({
  plugins: [
    unstableRolldownAdapter(
      analyzer({
        analyzerMode: 'static',
        fileName: `${import.meta.dirname}/out/stats.html`,
        defaultSizes: 'gzip',
      }),
    ),
  ],
  build: {
    target: 'es2023',
    minify: true,
    sourcemap: true,
    lib: {
      formats: ['es'],
      entry: ['src/index.ts'],
    },
    rolldownOptions: {
      treeshake: true,
      output: {
        preserveModules: true,
      },
    },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        launchOptions: {
          channel: 'chromium',
        },
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
