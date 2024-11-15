import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-icons'],
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 3001,        // Optional: Specify a port (default is 3000)
    // Optional: If you encounter issues with HTTPS
    // https: false,
  },
  build: {
    commonjsOptions: {
      include: [/react-icons/, /node_modules/],
    },
  },
})
