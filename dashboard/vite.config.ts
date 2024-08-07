import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'; // https://github.com/fi3ework/vite-plugin-checker
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    checker({ typescript: false }), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['ts-big-decimal']
  }
})
