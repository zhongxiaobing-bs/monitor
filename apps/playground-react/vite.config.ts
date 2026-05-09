import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@company/monitor': path.resolve(__dirname, '../../packages/monitor/src'),
      '@company/monitor-core': path.resolve(__dirname, '../../packages/monitor-core/src'),
      '@company/monitor-types': path.resolve(__dirname, '../../packages/monitor-types/src'),
      '@company/monitor-shared': path.resolve(__dirname, '../../packages/monitor-shared/src'),
      '@company/monitor-transport': path.resolve(__dirname, '../../packages/monitor-transport/src'),
      '@company/monitor-plugin-error': path.resolve(__dirname, '../../packages/monitor-plugin-error/src'),
      '@company/monitor-plugin-network': path.resolve(__dirname, '../../packages/monitor-plugin-network/src'),
      '@company/monitor-plugin-blank-screen': path.resolve(__dirname, '../../packages/monitor-plugin-blank-screen/src'),
      '@company/monitor-react': path.resolve(__dirname, '../../packages/monitor-react/src'),
      '@company/monitor-vue': path.resolve(__dirname, '../../packages/monitor-vue/src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
