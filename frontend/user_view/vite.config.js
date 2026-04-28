import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@backend': path.resolve(__dirname, '../../Backend'),
      // Force all firebase imports to resolve from user_view/node_modules
      'firebase/auth': path.resolve(__dirname, 'node_modules/firebase/auth'),
      'firebase/firestore': path.resolve(__dirname, 'node_modules/firebase/firestore'),
      'firebase/app': path.resolve(__dirname, 'node_modules/firebase/app'),
      'firebase/storage': path.resolve(__dirname, 'node_modules/firebase/storage'),
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
      'react': path.resolve(__dirname, 'node_modules/react'),
    },
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
