import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5000 },
  preview: { host: true, port: 5000 },
})
