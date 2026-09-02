import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@5ss/contracts': fileURLToPath(new URL('../packages/contracts/src/index.ts', import.meta.url)),
    },

  },
  server: {
    host: true, // Cho phép điện thoại / máy khác cùng mạng Wi-Fi/Hotspot truy cập
    port: 5173,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              // Keep the tightly-coupled Three/R3F graph in one stable vendor chunk.
              // Splitting it by maxSize can break circular initialization at runtime.
              name: 'three-vendor',
              test: /node_modules[\\/](three|@react-three|postprocessing|three-stdlib|@pmndrs)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
