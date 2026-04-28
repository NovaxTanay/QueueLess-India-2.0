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
  build: {
    rollupOptions: {
      external: (id) => id.includes('/Backend/pages/') || id.includes('/Backend/components/'),
    }
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, '../../Backend'),
        path.resolve(__dirname),
      ],
    },
  },
})
