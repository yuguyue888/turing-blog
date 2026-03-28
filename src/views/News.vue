<template>
  <div class="news">
    <nav class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="separator">/</span>
      <span>科技日报</span>
    </nav>

    <header class="page-header">
      <div v-if="bannerConfig.type === 'image'" class="banner-image">
        <img :src="bannerConfig.imageUrl" :alt="bannerConfig.alt" />
      </div>
      <div v-else class="banner-text">
        <h1>{{ bannerConfig.title || '📰 科技日报' }}</h1>
        <p class="subtitle">{{ bannerConfig.subtitle || '每日科技资讯，掌握前沿动态' }}</p>
      </div>
      <button @click="fetchLatestNews" class="refresh-btn" :disabled="loading">
        {{ loading ? '加载中...' : '🔄 刷新' }}
      </button>
    </header>

    <section class="news-tabs">
      <button 
        v-for="cat in categories" 
        :key="cat.key"
        :class="['tab-btn', { active: activeTab === cat.key }]"
        @click="activeTab = cat.key"
      >
        {{ cat.icon }} {{ cat.label }} ({{ getCategoryCount(cat.key) }})
      </button>
    </section>

    <p v-if="loading" class="loading-text">⏳ 正在加载最新新闻...</p>
    <p v-else-if="filteredNews.length === 0" class="no-news">暂无新闻</p>

    <section v-else class="news-list">
      <article 
        v-for="item in filteredNews" 
        :key="item.id" 
        class="news-card"
        @click="viewNews(item)"
      >
        <div class="news-meta">
          <span class="source">{{ item.icon }} {{ item.source }}</span>
          <span class="time">{{ formatTime(item.time) }}</span>
        </div>
        <h3 class="news-title">{{ item.title }}</h3>
        <p class="news-excerpt">{{ item.excerpt || item.summary || '点击查看详情...' }}</p>
        <div class="news-tags">
          <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('all')
const newsList = ref([])
const loading = ref(false)
const bannerConfig = ref({
  type: 'text', // 'text' or 'image'
  title: '📰 科技日报',
  subtitle: '每日科技资讯，掌握前沿动态',
  imageUrl: '',
  alt: '科技日报'
})

onMounted(() => {
  loadBannerConfig()
})

const loadBannerConfig = () => {
  const stored = localStorage.getItem('newsBannerConfig')
  if (stored) {
    bannerConfig.value = JSON.parse(stored)
  }
}

const categories = [
  { key: 'all', label: '全部', icon: '📰' },
  { key: 'tech', label: '技术', icon: '💻' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'dev', label: '开发', icon: '👨‍💻' },
  { key: 'hardware', label: '硬件', icon: '🔧' },
  { key: 'business', label: '商业', icon: '💼' },
  { key: 'opensource', label: '开源', icon: '🛠️' }
]

const filteredNews = computed(() => {
  if (activeTab.value === 'all') {
    return newsList.value
  }
  return newsList.value.filter(item => item.category === activeTab.value)
})

const getCategoryCount = (category) => {
  if (category === 'all') {
    return newsList.value.length
  }
  return newsList.value.filter(item => item.category === category).length
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前'
  } else if (diff < 86400000) {
    return Math.floor(diff / 3600000) + '小时前'
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const fetchLatestNews = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/news', {
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success && Array.isArray(data.data)) {
      newsList.value = data.data
    }
  } catch (error) {
    console.error('获取新闻失败:', error)
  } finally {
    loading.value = false
  }
}

const viewNews = (item) => {
  localStorage.setItem('currentNews', JSON.stringify(item))
  router.push(`/news/${item.id}`)
}

onMounted(() => {
  fetchLatestNews()
})
</script>

<style scoped>
.news {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.breadcrumb {
  margin-bottom: 1.5rem;
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.news-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.tab-btn:hover,
.tab-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.loading-text,
.no-news {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.news-list {
  display: grid;
  gap: 1.5rem;
}

.news-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.news-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.news-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.source {
  color: var(--primary-color);
  font-weight: 500;
}

.time {
  color: var(--text-secondary);
}

.news-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  color: var(--text-primary);
}

.news-excerpt {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.news-tags {
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

@media (max-width: 768px) {
  .news {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
