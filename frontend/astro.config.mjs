import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.tallasseetv.com',
  output: 'static',
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['localhost', 'tallasseetv.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
