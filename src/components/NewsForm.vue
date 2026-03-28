<template>
  <form @submit.prevent="handleSubmit" class="news-form">
    <div class="form-group">
      <label>标题 *</label>
      <input v-model="form.title" type="text" required placeholder="新闻标题" />
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>来源</label>
        <input v-model="form.source" type="text" placeholder="科技日报" />
      </div>
      
      <div class="form-group">
        <label>分类</label>
        <select v-model="form.category">
          <option value="ai">AI</option>
          <option value="hardware">硬件</option>
          <option value="software">软件</option>
          <option value="internet">互联网</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label>摘要</label>
      <textarea v-model="form.excerpt" rows="3" placeholder="新闻摘要"></textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>链接</label>
        <input v-model="form.url" type="url" placeholder="https://..." />
      </div>
      
      <div class="form-group">
        <label>时间</label>
        <input v-model="form.time" type="text" placeholder="刚刚" />
      </div>
    </div>
    
    <div class="form-group">
      <label>标签（逗号分隔）</label>
      <input v-model="form.tagsInput" type="text" placeholder="AI, 科技" />
    </div>
    
    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="cancel-btn">取消</button>
      <button type="submit" class="submit-btn">保存</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  news: Object
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  id: null,
  title: '',
  source: '科技日报',
  category: 'ai',
  excerpt: '',
  url: '#',
  time: '刚刚',
  tags: [],
  tagsInput: ''
})

watch(() => props.news, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      tagsInput: newVal.tags ? newVal.tags.join(', ') : ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  const news = {
    ...form.value,
    tags: form.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
  }
  emit('save', news)
}
</script>

<style scoped>
.news-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
}

.submit-btn {
  padding: 0.6rem 1.25rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}
</style>
