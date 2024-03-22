import { defineConfig, passthroughImageService } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  image: {
    service: passthroughImageService()
  },
  site: 'http://localhost:4321/',
  integrations: [mdx(), sitemap(), tailwind(), icon()],
  output: "server",
  adapter: cloudflare()
});