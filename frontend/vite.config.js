import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    ...(mode === 'development'
      ? {
          https: {
            key: fs.readFileSync(
              path.resolve(__dirname, '../backend/certs/server.key')
            ),
            cert: fs.readFileSync(
              path.resolve(__dirname, '../backend/certs/server.crt')
            ),
          },
        }
      : {}),
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/v1': {
        target:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:3447'
            : 'http://library_api:3447',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
}))
