import { defineConfig } from 'vite'
import path from "path" // 1. 引入 Node.js 的 path 模块
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 2. 在这里配置路径别名
      "@": path.resolve(__dirname, "./src"),
    },
  },
})