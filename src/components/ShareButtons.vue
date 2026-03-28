<template>
  <div class="share-section">
    <h4>📤 分享文章</h4>
    <div class="share-buttons">
      <button @click="shareToWeibo" class="share-btn weibo" title="微博">
        📢 微博
      </button>
      <button @click="copyLink" class="share-btn copy" title="复制链接">
        🔗 复制链接
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
})

const shareToWeibo = () => {
  const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(props.url)}&title=${encodeURIComponent(props.title)}`
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url)
    alert('✅ 链接已复制到剪贴板！')
  } catch {
    // Fallback
    const input = document.createElement('input')
    input.value = props.url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    alert('✅ 链接已复制到剪贴板！')
  }
}
</script>

<style scoped>
.share-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.share-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.share-btn.weibo {
  background: #e6162d;
  color: white;
}

.share-btn.copy {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.share-btn:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}
</style>
