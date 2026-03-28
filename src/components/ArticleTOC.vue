<template>
  <div class="article-toc" :class="{ hidden: !showToc }">
    <div class="toc-header">
      <h3>📖 目录</h3>
      <button @click="toggleToc" class="toggle-btn">
        {{ showToc ? '◀' : '▶' }}
      </button>
    </div>
    
    <div class="toc-content" v-if="showToc && headings.length > 0">
      <ul class="toc-list">
        <li 
          v-for="(heading, index) in headings" 
          :key="index"
          :class="['toc-item', `level-${heading.level}`, { active: activeIndex === index }]"
          @click="scrollToHeading(heading)"
        >
          <span class="toc-number" v-if="showNumbers">{{ index + 1 }}.</span>
          <span class="toc-text">{{ heading.text }}</span>
        </li>
      </ul>
    </div>
    
    <div class="toc-empty" v-if="showToc && headings.length === 0">
      <p>暂无目录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  showNumbers: {
    type: Boolean,
    default: false
  }
})

const headings = ref([])
const activeIndex = ref(-1)
const showToc = ref(true)

// 解析文章标题
const parseHeadings = () => {
  if (!props.content) return []
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = props.content
  
  const headingElements = tempDiv.querySelectorAll('h2, h3, h4')
  
  headings.value = Array.from(headingElements).map((el, index) => {
    const level = parseInt(el.tagName.charAt(1))
    const text = el.textContent.trim()
    
    // 为每个标题添加 id
    const id = `heading-${index}`
    el.id = id
    
    return {
      id,
      level,
      text,
      element: el
    }
  })
  
  // 将修改后的 HTML 更新回文章
  const articleBody = document.querySelector('.article-body')
  if (articleBody) {
    articleBody.innerHTML = tempDiv.innerHTML
  }
}

// 滚动到指定标题
const scrollToHeading = (heading) => {
  const element = document.getElementById(heading.id)
  if (element) {
    const offset = 80 // 顶部导航栏高度
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    
    // 更新活跃索引
    const index = headings.value.findIndex(h => h.id === heading.id)
    activeIndex.value = index
  }
}

// 监听滚动，高亮当前标题
const handleScroll = () => {
  const scrollPosition = window.scrollY + 100 // 偏移量
  
  let current = -1
  headings.value.forEach((heading, index) => {
    const element = document.getElementById(heading.id)
    if (element) {
      const rect = element.getBoundingClientRect()
      const offsetTop = rect.top + window.pageYOffset
      
      if (scrollPosition >= offsetTop) {
        current = index
      }
    }
  })
  
  activeIndex.value = current
}

// 切换目录显示
const toggleToc = () => {
  showToc.value = !showToc.value
}

onMounted(() => {
  nextTick(() => {
    parseHeadings()
    window.addEventListener('scroll', handleScroll)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-toc {
  position: fixed;
  right: 20px;
  top: 100px;
  width: 280px;
  max-height: calc(100vh - 120px);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 90;
  transition: all 0.3s ease;
  overflow: hidden;
}

.article-toc.hidden {
  width: 50px;
  max-height: 50px;
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.toc-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--tag-bg);
  color: var(--primary-color);
}

.toc-content {
  padding: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.toc-content::-webkit-scrollbar {
  width: 4px;
}

.toc-content::-webkit-scrollbar-track {
  background: transparent;
}

.toc-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.toc-item:hover {
  background: var(--tag-bg);
  color: var(--primary-color);
}

.toc-item.active {
  background: var(--primary-color);
  color: white;
  font-weight: 500;
}

.toc-item.level-2 {
  padding-left: 0.75rem;
}

.toc-item.level-3 {
  padding-left: 1.5rem;
  font-size: 0.85rem;
}

.toc-item.level-4 {
  padding-left: 2.25rem;
  font-size: 0.8rem;
}

.toc-number {
  flex-shrink: 0;
  font-weight: 500;
}

.toc-text {
  flex: 1;
  word-break: break-word;
}

.toc-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 移动端隐藏目录 */
@media (max-width: 1400px) {
  .article-toc {
    display: none;
  }
}
</style>
