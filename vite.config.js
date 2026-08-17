import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Cryptfolio — Portfolio Tracker',
        short_name: 'Cryptfolio',
        description: 'Acompanha o teu portfólio de criptomoedas em tempo real.',
        lang: 'pt',
        theme_color: '#0d1117',
        background_color: '#010409',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Por omissão o service worker só faz cache do "app shell" (JS/CSS/HTML gerados
      // pelo build) — os pedidos à CoinGecko continuam sempre a ir à rede; a única
      // cache de preços é a de 1 minuto já feita no código da app via localStorage.
    }),
  ],
})
