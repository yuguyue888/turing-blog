<template>
  <div class="news-source-manager">
    <div class="manager-header">
      <h2>📡 新闻源管理</h2>
      <p class="subtitle">管理新闻抓取源，支持RSS和网站源</p>
    </div>

    <!-- 添加新闻源表单 -->
    <div class="add-source-form">
      <h3>➕ 添加新闻源</h3>
      <form @submit.prevent="addSource">
        <div class="form-row">
          <div class="form-group">
            <label>源名称 *</label>
            <input v-model="newSource.name" type="text" required placeholder="例如: TechCrunch">
          </div>

          <div class="form-group">
            <label>源URL *</label>
            <input v-model="newSource.url" type="url" required placeholder="https://...">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>源类型 *</label>
            <select v-model="newSource.type" required>
              <option value="rss">RSS订阅源</option>
              <option value="website">网站源</option>
            </select>
          </div>

          <div class="form-group">
            <label>分类</label>
            <select v-model="newSource.category">
              <option value="tech">科技</option>
              <option value="ai">人工智能</option>
              <option value="dev">开发</option>
              <option value="business">商业</option>
              <option value="opensource">开源</option>
            </select>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" v-model="newSource.isEnglish">
              英文源（自动翻译）
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">✅ 添加源</button>
          <button type="button" @click="resetForm" class="reset-btn">🔄 重置</button>
        </div>
      </form>
    </div>

    <!-- 统计信息 -->
    <div v-if="!loading" class="stats">
      <div class="stat-item">
        <div class="stat-value">{{ sources.length }}</div>
        <div class="stat-label">总计</div>
      </div>
      <div class="stat-item">
        <div class="stat-value enabled">{{ enabledCount }}</div>
        <div class="stat-label">启用</div>
      </div>
      <div class="stat-item">
        <div class="stat-value disabled">{{ disabledCount }}</div>
        <div class="stat-label">禁用</div>
      </div>
    </div>

    <!-- 源列表 -->
    <div v-if="loading" class="loading">
      <p>⏳ 正在加载新闻源状态...</p>
    </div>

    <div v-else class="sources-list">
      <div v-if="sources.length === 0" class="empty-state">
        <p>暂无新闻源</p>
      </div>

      <div v-else class="sources-grid">
        <div
          v-for="source in sources"
          :key="source.key"
          :class="['source-card', { disabled: !source.enabled }]"
        >
          <div class="source-header">
            <div class="source-info">
              <span class="source-icon">{{ source.icon }}</span>
              <div>
                <h4>
                  {{ source.name }}
                  <span v-if="source.isDefault" class="default-badge">⭐ 内置</span>
                  <span v-if="source.isEnglish" class="english-badge">🌐 英文源</span>
                </h4>
                <span class="source-category">
                  {{ getCategoryLabel(source.category) }}
                  <span v-if="source.type" class="type-badge">{{ source.type.toUpperCase() }}</span>
                </span>
              </div>
            </div>
            <div class="source-actions">
              <button @click="deleteSource(source.key)" class="delete-btn" title="删除源">🗑️</button>
              <label class="toggle">
                <input
                  type="checkbox"
                  :checked="source.enabled"
                  @change="toggleSource(source.key, $event.target.checked)"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="source-url">{{ source.url }}</div>

          <div class="source-status">
            <div v-if="source.enabled" class="status-info">
              <span class="status-label">状态:</span>
              <span class="status-value good">✅ 正常</span>
            </div>
            <div v-else class="status-info">
              <span class="status-label">状态:</span>
              <span class="status-value bad">❌ 已禁用</span>
            </div>

            <div v-if="source.failures > 0" class="failures">
              <span class="status-label">失败次数:</span>
              <span class="status-value warning">{{ source.failures }}/3</span>
            </div>
          </div>

          <div v-if="!source.enabled && source.failures >= 3" class="disabled-reason">
            <p>⚠️ 该源已被自动禁用（连续失败3次）</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="testAllSources" class="test-btn" :disabled="testing">
        {{ testing ? '测试中...' : '🔍 测试所有源' }}
      </button>
      <button @click="resetAllSources" class="reset-btn">
        🔄 重置所有源
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const testing = ref(false)
const sources = ref([])

const newSource = ref({
  name: '',
  url: '',
  type: 'rss',
  category: 'tech',
  isEnglish: false
})

const enabledCount = computed(() => sources.value.filter(s => s.enabled).length)
const disabledCount = computed(() => sources.value.filter(s => !s.enabled).length)

const getCategoryLabel = (category) => {
  const labels = {
    'tech': '科技',
    'ai': '人工智能',
    'dev': '开发',
    'business': '商业',
    'opensource': '开源'
  }
  return labels[category] || category
}

const fetchSources = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3001/api/news-sources', {
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success) {
      sources.value = Object.entries(data.sources).map(([key, source]) => ({
        key,
        ...source
      }))
    }
  } catch (error) {
    console.error('获取新闻源失败:', error)
  } finally {
    loading.value = false
  }
}

const addSource = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/news-sources/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      },
      body: JSON.stringify(newSource.value)
    })

    const data = await response.json()
    if (data.success) {
      alert('✅ 新闻源添加成功！')
      resetForm()
      await fetchSources()
    } else {
      alert('❌ 添加失败: ' + data.message)
    }
  } catch (error) {
    console.error('添加新闻源失败:', error)
    alert('❌ 添加失败: ' + error.message)
  }
}

const deleteSource = async (key) => {
  if (!confirm('确定要删除这个新闻源吗？')) return

  try {
    const response = await fetch(`http://localhost:3001/api/news-sources/${key}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })

    const data = await response.json()
    if (data.success) {
      alert('✅ 删除成功！')
      await fetchSources()
    }
  } catch (error) {
    console.error('删除失败:', error)
    alert('❌ 删除失败')
  }
}

const toggleSource = async (key, enabled) => {
  try {
    await fetch(`http://localhost:3001/api/news-sources/${key}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      },
      body: JSON.stringify({ enabled })
    })
    await fetchSources()
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

const testAllSources = async () => {
  testing.value = true
  try {
    const response = await fetch('http://localhost:3001/api/news-sources/test', {
      method: 'POST',
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success) {
      alert(`✅ 测试完成！成功: ${data.valid}, 失败: ${data.invalid}`)
      await fetchSources()
    }
  } catch (error) {
    console.error('测试失败:', error)
    alert('❌ 测试失败')
  } finally {
    testing.value = false
  }
}

const resetAllSources = async () => {
  if (!confirm('确定要重置所有新闻源吗？')) return

  try {
    const response = await fetch('http://localhost:3001/api/news-sources/reset', {
      method: 'POST',
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success) {
      alert('✅ 重置成功！')
      await fetchSources()
    }
  } catch (error) {
    console.error('重置失败:', error)
    alert('❌ 重置失败')
  }
}

const resetForm = () => {
  newSource.value = {
    name: '',
    url: '',
    type: 'rss',
    category: 'tech',
    isEnglish: false
  }
}

onMounted(() => {
  fetchSources()
})
</script>

<style scoped>
.news-source-manager {
  padding: 0;
}

.manager-header {
  margin-bottom: 2rem;
}

.manager-header h2 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 添加源表单 */
.add-source-form {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.add-source-form h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.checkbox-group {
  justify-content: center;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.submit-btn, .reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}

.submit-btn {
  background: var(--primary-color);
  color: white;
}

.reset-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* 统计卡片 */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-value.enabled {
  color: #10b981;
}

.stat-value.disabled {
  color: #ef4444;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* 源列表 */
.loading, .empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.source-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s;
}

.source-card.disabled {
  opacity: 0.6;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.source-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.source-icon {
  font-size: 1.5rem;
}

.source-info h4 {
  margin: 0;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.default-badge, .english-badge, .type-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-weight: normal;
}

.default-badge {
  background: #fbbf24;
  color: #78350f;
}

.english-badge {
  background: #60a5fa;
  color: white;
}

.type-badge {
  background: var(--tag-bg);
  color: var(--tag-color);
}

.source-category {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  gap: 0.5rem;
}

.source-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.source-url {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  word-break: break-all;
}

.source-status {
  font-size: 0.8rem;
}

.status-info, .failures {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.status-label {
  color: var(--text-secondary);
}

.status-value.good {
  color: #10b981;
}

.status-value.bad {
  color: #ef4444;
}

.status-value.warning {
  color: #f59e0b;
}

.disabled-reason {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 0.8rem;
}

.disabled-reason p {
  margin: 0;
}

/* Toggle开关 */
.toggle {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 20px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(16px);
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.test-btn, .actions .reset-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
}

.test-btn {
  background: var(--primary-color);
  color: white;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actions .reset-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .sources-grid {
    grid-template-columns: 1fr;
  }
}
</style>
