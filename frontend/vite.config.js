import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // SSL configuration for HTTPS in development
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../backend/certs/server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../backend/certs/server.crt'))
    },
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    proxy: {
      '/v1': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://localhost:3443'
          : 'https://localhost:3443', // Backend with HTTPS
        changeOrigin: true,
        secure: false, // Allow self-signed certificates in development
        ws: true // WebSocket support if needed
      }
    }
  }
})
