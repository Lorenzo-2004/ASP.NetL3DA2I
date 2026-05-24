import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:51488', // <-- Mettez ICI le port trouvé dans votre fichier launchSettings.json
        changeOrigin: true,
        secure: false
      }
    }
  }
})