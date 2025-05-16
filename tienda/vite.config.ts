import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    logLevel: 'silent' // Ignora errores en la build
  },
  build: {
    minify: false,  // Evita que minificación cause errores
    sourcemap: false // Desactiva sourcemaps si están generando warnings
  },
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true, // 🔹 Habilitar WebSockets
        changeOrigin: true,
      },
    },
  },
})
