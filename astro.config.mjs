import { defineConfig } from 'astro/config'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
export default defineConfig({
  site: 'https://veryth.ink/rc-zulip-emoji-feed',

  experimental: {
    contentLayer: true,
  },

  integrations: [tailwind()],
})
