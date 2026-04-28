import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, '../../Backend'),
    },
  },
  server: {
    port: 5176,
    fs: {
      allow: [
        path.resolve(__dirname, '../../Backend'),
        path.resolve(__dirname),
      ],
    },
  },
})
