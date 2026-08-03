import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Fase 1 testa apenas lógica pura — sem DOM, sem jsdom.
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
