import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: false,
        // Add hooks to better surface proxy errors in the dev console
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('[vite-proxy] proxy error:', err && err.message)
            try {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: 'Backend proxy error', detail: err?.message }))
              }
            } catch (e) {
              // ignore
            }
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (proxyRes && proxyRes.statusCode && proxyRes.statusCode >= 500) {
              console.warn('[vite-proxy] backend returned status', proxyRes.statusCode, req.url)
            }
          })
        }
      },
      // NOTE: kestra-api proxy intentionally removed. Kestra must only be accessed from the backend.
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})