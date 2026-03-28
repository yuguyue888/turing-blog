<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">
          <span class="logo-icon">🧠</span>
          <span class="logo-text">图灵花园</span>
        </router-link>
        
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/news" class="nav-link">📰 科技日报</router-link>
          <router-link to="/navigation" class="nav-link">🧭 AI导航</router-link>
          <router-link to="/about" class="nav-link">关于</router-link>
          <router-link v-if="isLoggedIn" to="/admin" class="nav-link">⚙️ 管理</router-link>
        </div>
        
        <div class="nav-actions">
          <button 
            class="theme-toggle" 
            @click="toggleTheme"
            :title="followSystem ? '当前跟随系统' : (isDark ? '切换到浅色模式' : '切换到深色模式')"
          >
            {{ isDark ? '☀️' : '🌙' }}
          </button>
          <button 
            class="system-toggle" 
            @click="toggleFollowSystem"
            :title="followSystem ? '关闭跟随系统' : '开启跟随系统'"
            :class="{ active: followSystem }"
          >
            {{ followSystem ? '🔗' : '💫' }}
          </button>
          <router-link v-if="!isLoggedIn" to="/login" class="login-link">登录</router-link>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>© 2026 图灵花园 - Powered by Vue + Vite</p>
      <p class="footer-links">
        <router-link to="/">首页</router-link>
        <span>·</span>
        <router-link to="/news">科技日报</router-link>
        <span>·</span>
        <router-link to="/navigation">AI导航</router-link>
        <span>·</span>
        <router-link to="/about">关于</router-link>
        <span v-if="isLoggedIn">·</span>
        <router-link v-if="isLoggedIn" to="/admin">管理后台</router-link>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { trackPageView } from './utils/analytics.js'

const isDark = ref(true)
const isLoggedIn = ref(false)
const followSystem = ref(false)
const route = useRoute()

// 检测系统主题
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 应用主题
const applyTheme = (dark) => {
  isDark.value = dark
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  
  // 保存用户偏好（如果不跟随系统）
  if (!followSystem.value) {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
}

// 切换主题
const toggleTheme = () => {
  followSystem.value = false
  localStorage.setItem('followSystem', 'false')
  applyTheme(!isDark.value)
}

// 切换是否跟随系统
const toggleFollowSystem = () => {
  followSystem.value = !followSystem.value
  localStorage.setItem('followSystem', followSystem.value)
  
  if (followSystem.value) {
    // 如果开启跟随系统，立即应用系统主题
    applyTheme(getSystemTheme())
  } else {
    // 如果关闭，恢复用户上次的选择
    const savedTheme = localStorage.getItem('theme')
    applyTheme(savedTheme === 'dark')
  }
}

// 系统主题变化监听器
const handleSystemThemeChange = (e) => {
  if (followSystem.value) {
    applyTheme(e.matches)
  }
}

// 检查登录状态
const checkLogin = () => {
  isLoggedIn.value = !!localStorage.getItem('isLoggedIn')
}

onMounted(() => {
  // 加载用户偏好
  const savedFollowSystem = localStorage.getItem('followSystem')
  const savedTheme = localStorage.getItem('theme')
  
  if (savedFollowSystem === 'true') {
    // 跟随系统
    followSystem.value = true
    applyTheme(getSystemTheme())
  } else if (savedTheme) {
    // 使用保存的主题
    followSystem.value = false
    applyTheme(savedTheme === 'dark')
  } else {
    // 首次访问，默认跟随系统
    followSystem.value = true
    applyTheme(getSystemTheme())
  }
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  checkLogin()
  window.addEventListener('storage', checkLogin)
  
  // 记录首次访问
  trackPageView(route.path, document.title)
})

// 监听路由变化，记录页面访问
watch(() => route.path, (newPath) => {
  trackPageView(newPath, document.title)
})

onUnmounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.removeEventListener('change', handleSystemThemeChange)
  window.removeEventListener('storage', checkLogin)
})
</script>

<style>
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --card-bg: #ffffff;
  --primary-color: #667eea;
  --tag-bg: #f1f5f9;
  --tag-color: #475569;
  --code-bg: #f8fafc;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --card-bg: #1e293b;
  --primary-color: #818cf8;
  --tag-bg: #334155;
  --tag-color: #cbd5e1;
  --code-bg: #1e293b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  transition: background 0.3s, color 0.3s;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s;
  padding: 0.25rem 0;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--primary-color);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-toggle,
.system-toggle {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.theme-toggle:hover,
.system-toggle:hover {
  background: var(--tag-bg);
  transform: translateY(-1px);
}

.system-toggle.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.login-link {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.main-content {
  flex: 1;
}

.footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.footer-links {
  margin-top: 0.75rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-links span {
  margin: 0 0.5rem;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
  
  .logo-text {
    display: none;
  }
}
</style>
