import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// GitHub Pages 站点在子路径 /web/ 下 → 默认 base: '/web/'
// Cloudflare Pages 站点在根路径 → 构建时传 VITE_BASE=/ 覆盖
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: env.VITE_BASE ?? '/web/',
    plugins: [react()],
  }
})