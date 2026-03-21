import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import strip from '@rollup/plugin-strip';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    isProd &&
      strip({
        include: ['**/*.ts', '**/*.tsx'],
        functions: ['console.log', 'console.warn', 'console.error', 'console.debug'],
        debugger: true
      })
  ],
  esbuild: {
    logLevel: 'silent'
  },
  build: {
    minify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          vendor: ['axios', 'socket.io-client']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
