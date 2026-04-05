import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.tallasseetv.com',
  output: 'server',
  adapter: vercel(),
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    domains: ['localhost', 'tallasseetv.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
