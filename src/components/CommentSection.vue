<template>
  <div class="comment-section">
    <h3>💬 评论区 ({{ comments.length }})</h3>

    <!-- 评论表单 -->
    <div class="comment-form">
      <input
        v-model="newComment.author"
        type="text"
        placeholder="你的昵称"
        class="author-input"
      >
      <textarea
        v-model="newComment.content"
        placeholder="写下你的评论..."
        class="content-input"
        rows="3"
      ></textarea>
      <button @click="submitComment" class="submit-btn" :disabled="!newComment.content.trim()">
        发表评论
      </button>
    </div>

    <!-- 评论列表 -->
    <div v-if="comments.length === 0" class="empty-comments">
      暂无评论，快来抢沙发吧！
    </div>

    <div v-else class="comments-list">
      <div
        v-for="comment in sortedComments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar">
          {{ comment.author.charAt(0).toUpperCase() }}
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
          </div>
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <button @click="likeComment(comment.id)" class="action-btn">
              👍 {{ comment.likes || 0 }}
            </button>
            <button @click="replyTo(comment)" class="action-btn">
              回复
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const comments = ref([])
const newComment = ref({
  author: '',
  content: ''
})

const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const loadComments = () => {
  const stored = localStorage.getItem(`comments_${props.articleId}`)
  if (stored) {
    comments.value = JSON.parse(stored)
  }
}

const saveComments = () => {
  localStorage.setItem(`comments_${props.articleId}`, JSON.stringify(comments.value))
}

const submitComment = () => {
  if (!newComment.value.content.trim()) return

  const comment = {
    id: Date.now().toString(),
    author: newComment.value.author.trim() || '匿名用户',
    content: newComment.value.content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0
  }

  comments.value.push(comment)
  saveComments()

  newComment.value.content = ''
  alert('✅ 评论发表成功！')
}

const likeComment = (id) => {
  const comment = comments.value.find(c => c.id === id)
  if (comment) {
    comment.likes = (comment.likes || 0) + 1
    saveComments()
  }
}

const replyTo = (comment) => {
  newComment.value.content = `@${comment.author} `
  newComment.value.author = newComment.value.author || '匿名用户'
  document.querySelector('.content-input').focus()
}

const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

h3 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.comment-form {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.author-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.content-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-comments {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-item {
  display: flex;
  gap: 1rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.comment-body {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-author {
  font-weight: 600;
}

.comment-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.comment-content {
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.comment-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>
