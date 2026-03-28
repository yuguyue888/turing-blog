<template>
  <div class="login">
    <div class="login-card">
      <div class="login-header">
        <span class="login-icon">🔐</span>
        <h1>管理员登录</h1>
        <p>登录后可管理博客内容</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        
        <button type="submit" class="login-btn">登录</button>
      </form>
      
      <div class="login-footer">
        <p>提示：默认账号 admin / admin123</p>
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')

const handleLogin = () => {
  // 简单的本地验证
  if (username.value === 'admin' && password.value === 'admin123') {
    // 存储登录状态
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', username.value)
    
    // 跳转到管理页面
    router.push('/admin')
  } else {
    errorMsg.value = '用户名或密码错误'
  }
}
</script>

<style scoped>
.login {
  min-height: calc(100vh - 164px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}

.login-btn {
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.login-footer p {
  margin-bottom: 0.5rem;
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
}
</style>
