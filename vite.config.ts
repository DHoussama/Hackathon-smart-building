import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Safely replace API key, defaulting to empty string if undefined
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    server: {
      host: true,
      port: 5173
    }
  }
})