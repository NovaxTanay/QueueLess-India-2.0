import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, '../../Backend'),
    },
  },
  server: {
    fs: {
      allow: [
        // Allow serving files from Backend folder
        path.resolve(__dirname, '../../Backend'),
        // Default project root
        path.resolve(__dirname),
      ],
    },
  },
})
