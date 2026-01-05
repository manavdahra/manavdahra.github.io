import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        manualChunks: {
          'three-core': ['three'],
          'three-extras': ['three/examples/jsm/renderers/CSS2DRenderer', 'three/examples/jsm/libs/stats.module'],
          'physics': ['cannon-es', 'cannon-es-debugger']
        }
      }
    }
  },
  server: {
    open: true
  }
});
