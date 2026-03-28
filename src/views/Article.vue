<template>
  <div class="article">
    <nav class="breadcrumb">
      <router-link to="/">首页</router-link>
      <span class="separator">/</span>
      <router-link v-if="article" :to="`/category/${article.category}`">{{ article.category }}</router-link>
      <span class="separator">/</span>
      <span>文章</span>
    </nav>

    <article class="content" v-if="article">
      <header class="article-header">
        <span class="category">{{ article.category }}</span>
        <h1>{{ article.title }}</h1>
        <div class="meta">
          <span class="date">{{ article.date }}</span>
          <span class="reading-time">{{ article.readingTime || 10 }} 分钟阅读</span>
        </div>
      </header>

      <div class="article-body" v-html="article.content"></div>

      <footer class="article-footer">
        <div class="tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        
        <div class="nav-links" v-if="prevArticle || nextArticle">
          <button v-if="prevArticle" @click="goToArticle(prevArticle.id)" class="nav-btn">
            ← {{ prevArticle.title }}
          </button>
          <span v-else></span>
          <button v-if="nextArticle" @click="goToArticle(nextArticle.id)" class="nav-btn">
            {{ nextArticle.title }} →
          </button>
        </div>
      </footer>

      <!-- 分享按钮 -->
      <ShareButtons
        v-if="article"
        :title="article.title"
        :url="currentUrl"
      />

      <!-- 评论区 -->
      <CommentSection
        v-if="article"
        :article-id="article.id"
      />
    </article>

    <!-- 文章目录 -->
    <ArticleTOC 
      v-if="article"
      :content="article.content"
    />

    <div v-else class="not-found">
      <p>文章不存在</p>
      <router-link to="/">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticles } from '../data/store.js'
import CommentSection from '../components/CommentSection.vue'
import ShareButtons from '../components/ShareButtons.vue'
import ArticleTOC from '../components/ArticleTOC.vue'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const allArticles = ref([])

const currentIndex = computed(() => {
  return allArticles.value.findIndex(a => a.id === article.value?.id)
})

const prevArticle = computed(() => {
  const idx = currentIndex.value
  return idx > 0 ? allArticles.value[idx - 1] : null
})

const nextArticle = computed(() => {
  const idx = currentIndex.value
  return idx < allArticles.value.length - 1 ? allArticles.value[idx + 1] : null
})

const loadArticle = () => {
  const id = parseInt(route.params.id)
  article.value = allArticles.value.find(a => a.id === id) || null
}

const goToArticle = (id) => {
  router.push(`/article/${id}`)
}

onMounted(() => {
  allArticles.value = getArticles()
  loadArticle()
})

watch(() => route.params.id, loadArticle)
</script>

<style scoped>
.article {
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

.breadcrumb a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 0.5rem;
  color: var(--text-secondary);
}

.article-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.category {
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 500;
}

.article-header h1 {
  font-size: 2rem;
  margin: 0.5rem 0;
  line-height: 1.3;
}

.meta {
  display: flex;
  gap: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.article-body {
  line-height: 1.8;
  color: var(--text-primary);
}

.article-body h2 {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--text-primary);
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
}

.article-body h3 {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
}

.article-body p {
  margin-bottom: 1rem;
}

.article-body ul,
.article-body ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.article-body li {
  margin-bottom: 0.5rem;
}

.article-body pre {
  background: var(--code-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.article-body code {
  font-family: 'Fira Code', 'SF Mono', Monaco, Consolas, monospace;
  font-size: 0.875rem;
}

.article-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--tag-bg);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--tag-color);
}

.nav-links {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  padding: 0.75rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s;
  max-width: 45%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.not-found {
  text-align: center;
  padding: 4rem 0;
}

.not-found p {
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.not-found a {
  color: var(--primary-color);
}
</style>
