<template>
  <div class="category">
    <nav class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="separator">/</span>
      <span>{{ categoryName }}</span>
    </nav>

    <header class="category-header">
      <h1>{{ categoryName }}</h1>
      <p class="description">{{ categoryInfo?.description }}</p>
      <p class="count">共 {{ filteredArticles.length }} 篇文章</p>
    </header>

    <section class="articles">
      <p v-if="filteredArticles.length === 0" class="no-articles">暂无文章</p>
      <article 
        v-for="article in filteredArticles" 
        :key="article.id" 
        class="article-card" 
        @click="goToArticle(article.id)"
      >
        <div class="article-meta">
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles, getCategories } from '../data/store.js'

const route = useRoute()
const router = useRouter()
const allArticles = ref([])
const categoryList = ref([])

const categoryName = computed(() => route.params.name || '全部')

const categoryInfo = computed(() => {
  return categoryList.value.find(c => c.name === categoryName.value)
})

const filteredArticles = computed(() => {
  return allArticles.value.filter(a => a.category === categoryName.value)
})

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  allArticles.value = getArticles()
  categoryList.value = getCategories()
})

watch(() => route.params.name, () => {
  // 重新加载数据
  allArticles.value = getArticles()
})
</script>

<style scoped>
.category {
  max-width: 800px;
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

.category-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.category-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--text-secondary);
}

.count {
  color: var(--text-secondary);
  font-size: 0.875rem;
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
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-color);
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.article-meta {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
}

.article-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.excerpt {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
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
