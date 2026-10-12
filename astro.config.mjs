import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { existsSync } from 'node:fs';

if (existsSync('.env')) process.loadEnvFile('.env');

const demo = process.argv.includes('demo');
const site = process.env.SITE_URL;
if (site && !/^https?:\/\//.test(site)) throw new Error('SITE_URL 必须是完整的 http(s) 地址。');

export default defineConfig({
  site,
  output: 'static',
  outDir: demo ? './dist-demo' : './dist',
  trailingSlash: 'always',
  prerenderConflictBehavior: 'error',
  integrations: [mdx()],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
