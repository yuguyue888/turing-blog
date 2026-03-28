<template>
  <div class="navigation">
    <nav class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="separator">/</span>
      <span>AI 导航</span>
    </nav>

    <header class="page-header">
      <h1>🧭 AI 工具导航</h1>
      <p class="subtitle">精选 AI 工具与资源，助力效率提升</p>
    </header>

    <section class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索工具..." 
        class="search-input"
      />
    </section>

    <section class="categories">
      <button 
        v-for="cat in categories" 
        :key="cat.key"
        :class="['cat-btn', { active: activeCategory === cat.key }]"
        @click="activeCategory = cat.key"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </section>

    <p v-if="filteredTools.length === 0" class="no-tools">暂无工具</p>

    <section class="tools-grid">
      <a 
        v-for="tool in filteredTools" 
        :key="tool.id"
        :href="tool.url" 
        target="_blank" 
        rel="noopener"
        class="tool-card"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <div class="tool-info">
          <h3 class="tool-name">{{ tool.name }}</h3>
          <p class="tool-desc">{{ tool.description }}</p>
          <div class="tool-tags">
            <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="tool-arrow">→</div>
      </a>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTools } from '../data/store.js'

const searchQuery = ref('')
const activeCategory = ref('all')
const tools = ref([])

const categories = [
  { key: 'all', label: '全部', icon: '🌟' },
  { key: 'chat', label: '对话模型', icon: '💬' },
  { key: 'image', label: '图像生成', icon: '🎨' },
  { key: 'code', label: '编程助手', icon: '💻' },
  { key: 'writing', label: '写作工具', icon: '✍️' },
  { key: 'audio', label: '音频处理', icon: '🎵' },
  { key: 'video', label: '视频工具', icon: '🎬' },
  { key: 'research', label: '研究工具', icon: '🔬' }
]

onMounted(() => {
  tools.value = getTools()
})

const filteredTools = computed(() => {
  let result = tools.value
  
  if (activeCategory.value !== 'all') {
    result = result.filter(t => t.category === activeCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return result
})
</script>

<style scoped>
.navigation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.breadcrumb {
  margin-bottom: 2rem;
  font-size: 0.875rem;
}

.breadcrumb a {
  color: var(--primary-color);
  text-decoration: none;
}

.separator {
  margin: 0 0.5rem;
  color: var(--text-secondary);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
}

.search-section {
  max-width: 500px;
  margin: 0 auto 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.categories {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.cat-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.cat-btn:hover,
.cat-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.no-tools {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.tool-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.tool-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tool-tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.15rem 0.5rem;
  background: var(--tag-bg);
  border-radius: 10px;
  font-size: 0.65rem;
  color: var(--tag-color);
}

.tool-arrow {
  color: var(--text-secondary);
  font-size: 1.25rem;
  transition: transform 0.2s;
}

.tool-card:hover .tool-arrow {
  transform: translateX(4px);
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .tool-card {
    padding: 1rem;
  }
  
  .tool-icon {
    font-size: 2rem;
  }
}
</style>
