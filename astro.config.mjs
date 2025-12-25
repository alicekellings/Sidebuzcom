import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.sidebuz.com',
  output: 'static',  // Keep static for most pages
  adapter: vercel(), // Vercel adapter for serverless functions
  integrations: [mdx(), sitemap()],

  // Security headers for all pages
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
  },
});
