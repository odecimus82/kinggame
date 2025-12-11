import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置 base 为 relative path ('./')
  // 这解决了 GitHub Pages 部署在子路径 (https://user.github.io/repo/) 时找不到资源的问题
  base: './', 
})