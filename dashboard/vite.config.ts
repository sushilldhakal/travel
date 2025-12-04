import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'; // https://github.com/fi3ework/vite-plugin-checker
import path from 'node:path'
import { createRequire } from 'node:module';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite'

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));
// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: '',
        },
      ],
    }),
    tailwindcss(),
    checker({ typescript: false }), react()],
  assetsInclude: ['**/*.pdf'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['ts-big-decimal']
  }
})
