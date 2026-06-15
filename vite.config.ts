import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Use terser for minification to enable console.log stripping
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove all console.* calls in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Extra safety
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries (changes rarely, cache separately)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Radix UI components (large, cache separately)
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-popover',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
          ],

          // Form libraries (used in signup/login pages)
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],

          // Icons and UI utilities
          'ui-vendor': ['lucide-react', 'clsx', 'class-variance-authority'],
        },
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    allowedHosts: [
      'www.voxxypresents.com',
      'voxxypresents.com',
      'voxxy-presents-client-dev.onrender.com',
      'voxxy-presents-client-staging.onrender.com',
      'staging-voxxy-presents.onrender.com',
      'dev-voxxy-presents.onrender.com',
      'localhost',
    ],
  },
})
