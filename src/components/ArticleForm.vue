<template>
  <form @submit.prevent="handleSubmit" class="article-form">
    <div class="form-group">
      <label>标题 *</label>
      <input v-model="form.title" type="text" required placeholder="请输入文章标题" />
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>分类 *</label>
        <select v-model="form.category" required>
          <option value="">选择分类</option>
          <option value="Linux运维">Linux运维</option>
          <option value="Docker">Docker</option>
          <option value="Kubernetes">Kubernetes</option>
          <option value="云原生">云原生</option>
          <option value="其他">其他</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>发布日期</label>
        <input v-model="form.date" type="date" />
      </div>
    </div>
    
    <div class="form-group">
      <label>摘要</label>
      <textarea v-model="form.excerpt" rows="3" placeholder="文章摘要"></textarea>
    </div>
    
    <div class="form-group">
      <label>内容</label>
      <textarea v-model="form.content" rows="10" placeholder="支持 HTML 格式"></textarea>
    </div>
    
    <div class="form-group">
      <label>标签（逗号分隔）</label>
      <input v-model="form.tagsInput" type="text" placeholder="Linux, Docker, 运维" />
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
  article: Object
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  id: null,
  title: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  excerpt: '',
  content: '',
  tags: [],
  tagsInput: '',
  readingTime: 10
})

watch(() => props.article, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      tagsInput: newVal.tags ? newVal.tags.join(', ') : ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  const article = {
    ...form.value,
    tags: form.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
  }
  emit('save', article)
}
</script>

<style scoped>
.article-form {
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

.form-group textarea {
  resize: vertical;
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
