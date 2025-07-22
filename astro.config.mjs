import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  build: {
    assets: 'assets',
  },
  vite: {
    ssr: {
      external: ['@libsql/client'],
    },
  },
}); 