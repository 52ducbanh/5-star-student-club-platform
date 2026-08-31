import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
              name: 'three-core',
              test: /node_modules[\\/]three[\\/]/,
              maxSize: 420 * 1024,
            },
            {
              name: 'three-react',
              test: /node_modules[\\/](@react-three|postprocessing|three-stdlib|@pmndrs)[\\/]/,
              maxSize: 420 * 1024,
            },
          ],
        },
      },
    },
  },
})
