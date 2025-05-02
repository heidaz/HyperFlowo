import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore - no types available for this module
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost', 
    },
  },
})
