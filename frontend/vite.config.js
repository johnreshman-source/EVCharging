import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // All source files live under src/assets/ — '@' maps there
      '@': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/assets/components'),
      '@pages':      path.resolve(__dirname, './src/assets/pages'),
      '@services':   path.resolve(__dirname, './src/assets/services'),
      '@utils':      path.resolve(__dirname, './src/assets/utils'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to the Flask backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
