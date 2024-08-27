import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'; // https://github.com/fi3ework/vite-plugin-checker
import path from 'node:path'
import { createRequire } from 'node:module';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const require = createRequire(import.meta.url);
const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: cMapsDir,
          dest: '',
        },
      ],
    }),
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
