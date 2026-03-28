import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { initAnalytics } from './utils/analytics.js'

const app = createApp(App)
app.use(router)

// 初始化访问统计
initAnalytics()

app.mount('#app')

// 注册 Service Worker（仅生产环境）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        if (import.meta.env.DEV) {
          console.log('✅ Service Worker 注册成功:', registration.scope)
        }
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新版本可用
              if (import.meta.env.DEV) {
                console.log('🔄 新版本可用，刷新页面以更新')
              }
            }
          })
        })
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.log('❌ Service Worker 注册失败:', error)
        }
      })
  })
}
