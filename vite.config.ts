import { defineConfig } from 'vite'
import adapter from '@sveltejs/adapter-cloudflare'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
      },
      adapter: adapter(),
      typescript: {
        config: (config) => {
          config.include.push('../drizzle.config.ts')
        },
      },
    }),
    SvelteKitPWA({
      mode:
        process.env.NODE_ENV === 'production' ? 'production' : 'development',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
      registerType: 'prompt',
      includeAssets: ['pongstr-dark.svg', 'pongstr-light.svg', 'robots.txt'],
      manifest: {
        name: 'GrooveScribe Remix',
        short_name: 'Groovy',
        description: 'Browser-based drum groove editor and practice tool',
        theme_color: '#1a1520',
        background_color: '#1a1520',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/img/pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: '/img/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/img/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/img/maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: '/img/screenshot-desktop.png',
            sizes: '1092x746',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Groovy!',
          },
          {
            src: '/img/screenshot-mobile.png',
            sizes: '510x931',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Groovy!',
          },
        ],
      },
      kit: {
        spa: true,
        includeVersionFile: true,
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,webmanifest,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^\/groove\/audio\/.+\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'groove-audio',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^\/groove\/vendor\/.+\.js$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'groove-vendor' },
          },
        ],
      },
    }),
  ],
})
