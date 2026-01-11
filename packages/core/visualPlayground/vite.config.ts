import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {
            // Solo compila archivos en carpetas de componentes/páginas
            sources: (filename: string) => {
              return filename.includes('/components/') || 
                     filename.includes('/pages/') ||
                     filename.includes('/examples/')
            },
          }]
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@root': path.resolve(__dirname, '../'),
    },
  },
})
