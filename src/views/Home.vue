<template>
  <div class="home">
    <header class="hero">
      <h1>图灵的技术花园</h1>
      <p class="subtitle">探索技术的无限可能</p>
    </header>

    <section class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索文章..." 
        class="search-input"
      />
    </section>

    <section class="categories">
      <button 
        v-for="cat in categoryList" 
        :key="cat.name"
        :class="['category-btn', { active: selectedCategory === cat.name }]"
        @click="selectedCategory = selectedCategory === cat.name ? 'all' : cat.name"
      >
        {{ cat.name }} ({{ cat.count }})
      </button>
    </section>

    <section class="articles">
      <p v-if="filteredArticles.length === 0" class="no-articles">暂无文章</p>
      <article 
        v-for="article in filteredArticles" 
        :key="article.id" 
        class="article-card" 
        @click="goToArticle(article.id)"
      >
        <div class="article-meta">
          <span class="category">{{ article.category }}</span>
          <span class="date">{{ article.date }}</span>
          <span class="reading-time">{{ article.readingTime || 10 }} 分钟阅读</span>
        </div>
        <h2>{{ article.title }}</h2>
        <p class="excerpt">{{ article.excerpt }}</p>
        <div class="tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getArticles, getCategories } from '../data/store.js'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('all')
const articles = ref([])
const categoryList = ref([])

onMounted(() => {
  articles.value = getArticles()
  categoryList.value = getCategories()
})

const filteredArticles = computed(() => {
  let result = articles.value
  
  if (selectedCategory.value !== 'all') {
    result = result.filter(a => a.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.excerpt.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query))
    )
  }
  
  return result
})

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  border-bottom: 1px solid var(--border-color);
}

.hero h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.search-section {
  margin: 2rem 0;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.2s;
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
}

.category-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.category-btn:hover,
.category-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.articles {
  margin-top: 1rem;
}

.no-articles {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem;
}

.article-card {
  padding: 1.5rem;
  border-radius: 12px;
  background: var(--card-bg);
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.category {
  color: var(--primary-color);
  font-weight: 500;
}

.date,
.reading-time {
  color: var(--text-secondary);
}

.article-card h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.excerpt {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--tag-bg);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--tag-color);
}
</style>
