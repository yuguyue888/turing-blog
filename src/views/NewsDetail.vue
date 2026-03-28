<template>
  <div class="news-detail">
    <nav class="breadcrumb">
      <router-link to="/news">科技日报</router-link>
      <span class="separator">/</span>
      <span>新闻详情</span>
    </nav>

    <div v-if="loading" class="loading">
      <p>⏳ 正在加载新闻内容...</p>
    </div>

    <article v-else-if="news" class="article">
      <header class="article-header">
        <div class="meta">
          <span class="source">{{ news.icon }} {{ news.source }}</span>
          <span class="time">{{ formatTime(news.time) }}</span>
        </div>
        <h1>{{ news.title }}</h1>
        <div class="tags">
          <span v-for="tag in news.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>

      <!-- AI 摘要 -->
      <section v-if="aiSummary" class="ai-summary">
        <h3>🤖 AI 智能摘要</h3>
        <p>{{ aiSummary }}</p>
      </section>

      <section v-else-if="loadingSummary" class="ai-summary loading-summary">
        <h3>🤖 AI 智能摘要</h3>
        <p>⏳ 正在生成摘要...</p>
      </section>

      <!-- 新闻内容 -->
      <section class="article-content">
        <div v-if="news.content && news.content.length > 100" v-html="news.content" class="content"></div>
        <div v-else-if="fetchingContent" class="content-loading">
          <p>⏳ 正在抓取完整内容，请稍候...</p>
        </div>
        <div v-else class="content-fallback">
          <p class="excerpt">{{ news.excerpt || news.summary || '暂无详细内容' }}</p>
          <div class="actions">
            <a :href="news.url" target="_blank" class="read-original-btn">
              📖 查看原文
            </a>
            <button @click="fetchFullContent" class="fetch-btn">
              🔄 重新抓取内容
            </button>
          </div>
        </div>
      </section>

      <footer class="article-footer">
        <button @click="goBack" class="back-btn">← 返回列表</button>
        <div class="footer-actions">
          <a :href="news.url" target="_blank" class="original-link">
            查看原文 ↗
          </a>
        </div>
      </footer>
    </article>

    <div v-else class="error">
      <p>❌ 新闻加载失败</p>
      <button @click="goBack" class="back-btn">返回列表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const news = ref(null)
const loading = ref(true)
const fetchingContent = ref(false)
const aiSummary = ref('')
const loadingSummary = ref(false)

// 获取新闻详情
const fetchNewsDetail = async () => {
  loading.value = true
  const newsId = route.params.id
  
  try {
    // 从缓存中获取新闻基本信息
    const cached = localStorage.getItem('currentNews')
    if (cached) {
      news.value = JSON.parse(cached)
      
      // 如果没有完整内容，尝试抓取
      if (!news.value.content || news.value.content.length < 100) {
        await fetchFullContent()
      }
      
      // 生成AI摘要
      if (news.value.content && news.value.content.length > 100) {
        generateAISummary()
      }
    } else {
      // 从API获取
      const response = await fetch('http://localhost:3001/api/news', {
        headers: {
          'X-API-Key': 'sk-turing-blog-default-key-2026'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          news.value = data.data.find(item => item.id === newsId)
          
          if (news.value) {
            // 抓取完整内容
            if (!news.value.content || news.value.content.length < 100) {
              await fetchFullContent()
            }
            
            // 生成AI摘要
            if (news.value.content && news.value.content.length > 100) {
              generateAISummary()
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('获取新闻详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 抓取完整内容
const fetchFullContent = async () => {
  if (!news.value || !news.value.url) return
  
  fetchingContent.value = true
  
  try {
    const response = await fetch('http://localhost:3001/api/news-fetcher/fetch-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      },
      body: JSON.stringify({
        url: news.value.url
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        news.value.content = data.data.content
        
        // 更新缓存
        localStorage.setItem('currentNews', JSON.stringify(news.value))
        
        // 生成AI摘要
        if (news.value.content && news.value.content.length > 100) {
          generateAISummary()
        }
      }
    }
  } catch (error) {
    console.error('抓取内容失败:', error)
  } finally {
    fetchingContent.value = false
  }
}

// 生成AI摘要
const generateAISummary = async () => {
  loadingSummary.value = true
  
  try {
    // 调用AI摘要API
    const response = await fetch('http://localhost:3001/api/ai/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      },
      body: JSON.stringify({
        title: news.value.title,
        content: news.value.content
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.summary) {
        aiSummary.value = data.summary
      }
    }
  } catch (error) {
    console.error('AI摘要生成失败:', error)
    // Fallback: 使用现有摘要
    aiSummary.value = news.value.excerpt || news.value.summary || ''
  } finally {
    loadingSummary.value = false
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// 返回列表
const goBack = () => {
  router.push('/news')
}

onMounted(() => {
  fetchNewsDetail()
})
</script>

<style scoped>
.news-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.breadcrumb {
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: var(--text-secondary);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--primary-color);
}

.separator {
  margin: 0 0.5rem;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.article {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.article-header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.source {
  color: var(--primary-color);
  font-weight: 500;
}

.time {
  color: var(--text-secondary);
}

.article-header h1 {
  font-size: 1.75rem;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.ai-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 1.5rem;
  border-left: 4px solid #3b82f6;
  margin: 0;
}

.ai-summary h3 {
  color: #1e40af;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.ai-summary p {
  color: #1e3a8a;
  line-height: 1.8;
  font-size: 0.95rem;
}

.loading-summary {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.article-content {
  padding: 2rem;
}

.content {
  line-height: 1.8;
  color: var(--text-primary);
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.content :deep(p) {
  margin-bottom: 1rem;
}

.content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.content :deep(a:hover) {
  text-decoration: underline;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.content :deep(code) {
  background: var(--bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
}

.content :deep(pre) {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.content-loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.content-fallback {
  text-align: center;
  padding: 2rem;
}

.excerpt {
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.read-original-btn,
.fetch-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  font-size: 0.95rem;
}

.read-original-btn {
  background: var(--primary-color);
  color: white;
  border: none;
}

.read-original-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.fetch-btn {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.fetch-btn:hover {
  background: var(--primary-color);
  color: white;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.back-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: var(--card-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.footer-actions {
  display: flex;
  gap: 1rem;
}

.original-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
}

.original-link:hover {
  text-decoration: underline;
}

.error {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .news-detail {
    padding: 1rem;
  }
  
  .article-header h1 {
    font-size: 1.5rem;
  }
  
  .article-content {
    padding: 1.5rem;
  }
  
  .article-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
