import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor estável: muda com upgrade de dependência, não com código de
          // app. Separado para que editar um componente não invalide o cache
          // dele no navegador do visitante.
          vendor: ['react', 'react-dom', 'motion'],
        },
      },
    },
  },
  test: {
    // Fase 1 testa apenas lógica pura — sem DOM, sem jsdom.
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
