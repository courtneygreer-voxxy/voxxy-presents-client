import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    allowedHosts: [
      'www.voxxypresents.com',
      'voxxypresents.com',
      'voxxy-presents-client-staging.onrender.com',
      'staging-voxxy-presents.onrender.com',
      'dev-voxxy-presents.onrender.com',
      'localhost'
    ]
  }
})