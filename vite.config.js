import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import handlebars from 'vite-plugin-handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
    }),
  ],
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blogs: resolve(__dirname, 'blogs/index.html'),
        snakeGameBlog: resolve(__dirname, 'blogs/snake-game.html'),
        style: resolve(__dirname, 'public/style.css')
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
    open: true,
    fs: {
      allow: ['..']
    }
  },
  preview: {
    outDir: 'docs'
  }
});
