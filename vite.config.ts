import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Examination-system-test/', // 加上這個讓 GitHub Pages 能夠正確載入 CSS/JS 資源
})

