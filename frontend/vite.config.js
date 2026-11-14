import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function geojsonPlugin() {
  return {
    name: 'geojson-loader',
    transform(code, id) {
      if (id.endsWith('.geojson')) {
        return {
          code: `export default ${code};`,
          map: null,
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    geojsonPlugin(),
    react(),
    tailwindcss(),
  ],
})
