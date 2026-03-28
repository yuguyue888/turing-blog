<template>
  <form @submit.prevent="handleSubmit" class="tool-form">
    <div class="form-group">
      <label>名称 *</label>
      <input v-model="form.name" type="text" required placeholder="工具名称" />
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>图标</label>
        <input v-model="form.icon" type="text" placeholder="🤖" />
      </div>
      
      <div class="form-group">
        <label>分类 *</label>
        <select v-model="form.category" required>
          <option value="">选择分类</option>
          <option value="chat">对话模型</option>
          <option value="image">图像生成</option>
          <option value="code">编程助手</option>
          <option value="writing">写作工具</option>
          <option value="audio">音频处理</option>
          <option value="video">视频工具</option>
          <option value="research">研究工具</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label>描述</label>
      <textarea v-model="form.description" rows="3" placeholder="工具简介"></textarea>
    </div>
    
    <div class="form-group">
      <label>链接</label>
      <input v-model="form.url" type="url" placeholder="https://..." />
    </div>
    
    <div class="form-group">
      <label>标签（逗号分隔）</label>
      <input v-model="form.tagsInput" type="text" placeholder="AI, 免费, 开源" />
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
  tool: Object
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  id: null,
  name: '',
  icon: '🛠️',
  category: '',
  description: '',
  url: '#',
  tags: [],
  tagsInput: ''
})

watch(() => props.tool, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      tagsInput: newVal.tags ? newVal.tags.join(', ') : ''
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  const tool = {
    ...form.value,
    tags: form.value.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
  }
  emit('save', tool)
}
</script>

<style scoped>
.tool-form {
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
