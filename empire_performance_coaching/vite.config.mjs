import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          supabase: ["@supabase/supabase-js", "@supabase/auth-ui-react"],
          charts: ["recharts", "d3"],
          ui: ["framer-motion", "lucide-react", "class-variance-authority", "clsx"],
        }
      }
    }
  },
  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Empire Performance Coaching',
        short_name: 'EPC',
        theme_color: '#0E0E10',
        background_color: '#0E0E10',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/assets/logo-mark.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/assets/logo-mark.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'build/**', 'tests/**']
  },
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});