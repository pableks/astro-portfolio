import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    define: {
      'import.meta.env.YOUTUBE_API_KEY': JSON.stringify(process.env.YOUTUBE_API_KEY),
    },
  },
});