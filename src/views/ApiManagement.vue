<template>
  <div class="api-management">
    <div class="api-header">
      <div class="header-left">
        <h1>🔌 API 管理</h1>
        <p>通过 RESTful API 管理整个网站</p>
      </div>
      <div class="header-actions">
        <button @click="showCreateDialog = true" class="create-btn">+ 创建 API Key</button>
      </div>
    </div>

    <!-- API 状态卡片 -->
    <div class="status-cards">
      <div class="status-card">
        <div class="status-icon">🌐</div>
        <div class="status-info">
          <h3>API 服务器</h3>
          <p :class="{ online: serverOnline, offline: !serverOnline }">
            {{ serverOnline ? '在线' : '离线' }}
          </p>
        </div>
      </div>
      <div class="status-card">
        <div class="status-icon">🔑</div>
        <div class="status-info">
          <h3>API Keys</h3>
          <p>{{ apiKeys.length }} 个密钥</p>
        </div>
      </div>
      <div class="status-card">
        <div class="status-icon">📊</div>
        <div class="status-info">
          <h3>数据统计</h3>
          <p>{{ stats.articles }} 文章 / {{ stats.tools }} 工具 / {{ stats.news }} 新闻</p>
        </div>
      </div>
    </div>

    <!-- API 文档 -->
    <div class="api-docs">
      <h2>📖 API 文档</h2>
      
      <div class="doc-section">
        <h3>认证方式</h3>
        <div class="code-block">
          <code>Header: X-API-Key: your-api-key</code>
          <span class="or">或</span>
          <code>Query: ?apiKey=your-api-key</code>
        </div>
      </div>

      <div class="doc-section">
        <h3>API 端点</h3>
        <div class="endpoints">
          <div v-for="group in apiEndpoints" :key="group.name" class="endpoint-group">
            <h4>{{ group.icon }} {{ group.name }}</h4>
            <div v-for="endpoint in group.endpoints" :key="endpoint.method + endpoint.path" class="endpoint">
              <span :class="['method', endpoint.method.toLowerCase()]">{{ endpoint.method }}</span>
              <code>{{ endpoint.path }}</code>
              <span class="description">{{ endpoint.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="doc-section">
        <h3>示例请求</h3>
        <div class="example-tabs">
          <button 
            v-for="example in examples" 
            :key="example.name"
            :class="['tab-btn', { active: activeExample === example.name }]"
            @click="activeExample = example.name"
          >
            {{ example.name }}
          </button>
        </div>
        <div class="code-block">
          <pre>{{ getCurrentExample }}</pre>
        </div>
      </div>
    </div>

    <!-- API Keys 列表 -->
    <div class="api-keys-section">
      <h2>🔑 API Keys</h2>
      <div class="keys-list">
        <div v-for="key in apiKeys" :key="key.id" class="key-card">
          <div class="key-header">
            <h4>{{ key.name }}</h4>
            <span class="key-id">ID: {{ key.id }}</span>
          </div>
          <div class="key-value">
            <code>{{ key.key }}</code>
            <button @click="copyToClipboard(key.key)" class="copy-btn">复制</button>
          </div>
          <div class="key-meta">
            <span>创建于: {{ formatDate(key.createdAt) }}</span>
            <span v-if="key.lastUsed">最后使用: {{ formatDate(key.lastUsed) }}</span>
          </div>
          <div class="key-permissions">
            <span class="label">权限:</span>
            <span 
              v-for="perm in key.permissions" 
              :key="perm" 
              :class="['permission', perm.split(':')[1]]"
            >
              {{ perm }}
            </span>
          </div>
          <button @click="deleteKey(key.id)" class="delete-btn">删除</button>
        </div>
      </div>
    </div>

    <!-- 创建 API Key 对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <h3>创建新的 API Key</h3>
        
        <div class="form-group">
          <label>名称</label>
          <input v-model="newKey.name" type="text" placeholder="API Key 名称" />
        </div>

        <div class="form-group">
          <label>权限</label>
          <div class="permissions-grid">
            <label v-for="perm in availablePermissions" :key="perm" class="checkbox-label">
              <input type="checkbox" v-model="newKey.permissions" :value="perm" />
              <span>{{ perm }}</span>
            </label>
          </div>
        </div>

        <div class="dialog-actions">
          <button @click="showCreateDialog = false" class="cancel-btn">取消</button>
          <button @click="createKey" class="confirm-btn">创建</button>
        </div>
      </div>
    </div>

    <!-- 成功创建提示 -->
    <div v-if="showSuccessDialog" class="dialog-overlay" @click.self="showSuccessDialog = false">
      <div class="dialog success">
        <h3>✅ API Key 创建成功</h3>
        <p class="warning">⚠️ 请立即复制保存，此密钥只显示一次！</p>
        <div class="new-key-display">
          <code>{{ createdKey }}</code>
          <button @click="copyToClipboard(createdKey)" class="copy-btn">复制</button>
        </div>
        <div class="dialog-actions">
          <button @click="showSuccessDialog = false; createdKey = ''" class="confirm-btn">我已保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE = 'http://localhost:3001'

const serverOnline = ref(false)
const apiKeys = ref([])
const stats = ref({ articles: 0, tools: 0, news: 0 })
const showCreateDialog = ref(false)
const showSuccessDialog = ref(false)
const createdKey = ref('')
const activeExample = ref('创建文章')

const newKey = ref({
  name: '',
  permissions: ['articles:read', 'articles:write', 'tools:read', 'news:read']
})

const availablePermissions = [
  'articles:read',
  'articles:write',
  'tools:read',
  'tools:write',
  'news:read',
  'news:write'
]

const apiEndpoints = [
  {
    name: '文章管理',
    icon: '📝',
    endpoints: [
      { method: 'GET', path: '/api/articles', description: '获取所有文章' },
      { method: 'GET', path: '/api/articles/:id', description: '获取单篇文章' },
      { method: 'POST', path: '/api/articles', description: '创建文章' },
      { method: 'PUT', path: '/api/articles/:id', description: '更新文章' },
      { method: 'DELETE', path: '/api/articles/:id', description: '删除文章' },
      { method: 'POST', path: '/api/articles/batch', description: '批量创建文章' }
    ]
  },
  {
    name: '工具管理',
    icon: '🛠️',
    endpoints: [
      { method: 'GET', path: '/api/tools', description: '获取所有工具' },
      { method: 'POST', path: '/api/tools', description: '创建工具' },
      { method: 'PUT', path: '/api/tools/:id', description: '更新工具' },
      { method: 'DELETE', path: '/api/tools/:id', description: '删除工具' }
    ]
  },
  {
    name: '新闻管理',
    icon: '📰',
    endpoints: [
      { method: 'GET', path: '/api/news', description: '获取所有新闻' },
      { method: 'POST', path: '/api/news', description: '创建新闻' },
      { method: 'PUT', path: '/api/news/:id', description: '更新新闻' },
      { method: 'DELETE', path: '/api/news/:id', description: '删除新闻' }
    ]
  },
  {
    name: '统计信息',
    icon: '📊',
    endpoints: [
      { method: 'GET', path: '/api/stats', description: '获取统计数据' }
    ]
  }
]

const examples = [
  {
    name: '创建文章',
    code: `curl -X POST http://localhost:3001/api/articles \\
  -H "X-API-Key: sk-turing-blog-default-key-2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Docker 入门指南",
    "content": "<p>Docker 是一个开源的应用容器引擎...</p>",
    "category": "Docker",
    "tags": ["Docker", "容器", "DevOps"],
    "excerpt": "Docker 入门完整指南"
  }'`
  },
  {
    name: '批量创建文章',
    code: `curl -X POST http://localhost:3001/api/articles/batch \\
  -H "X-API-Key: sk-turing-blog-default-key-2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "articles": [
      {
        "title": "Kubernetes 基础",
        "content": "<p>K8s 内容...</p>",
        "category": "Kubernetes"
      },
      {
        "title": "Prometheus 监控",
        "content": "<p>Prometheus 内容...</p>",
        "category": "监控告警"
      }
    ]
  }'`
  },
  {
    name: '获取所有文章',
    code: `curl -X GET "http://localhost:3001/api/articles?apiKey=sk-turing-blog-default-key-2026"`
  },
  {
    name: 'Python 示例',
    code: `import requests

API_URL = "http://localhost:3001"
API_KEY = "sk-turing-blog-default-key-2026"

headers = {"X-API-Key": API_KEY}

# 创建文章
article = {
    "title": "自动化运维实践",
    "content": "<p>使用 Python 进行自动化运维...</p>",
    "category": "DevOps",
    "tags": ["Python", "自动化", "运维"]
}

response = requests.post(f"{API_URL}/api/articles", json=article, headers=headers)
print(response.json())`
  }
]

const getCurrentExample = computed(() => {
  const example = examples.find(e => e.name === activeExample.value)
  return example ? example.code : ''
})

const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`)
    serverOnline.value = response.ok
  } catch {
    serverOnline.value = false
  }
}

const loadApiKeys = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/api-keys`, {
      headers: { 'X-API-Key': 'sk-turing-blog-default-key-2026' }
    })
    const data = await response.json()
    if (data.success) {
      apiKeys.value = data.data
    }
  } catch (error) {
    console.error('Failed to load API keys:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/stats`, {
      headers: { 'X-API-Key': 'sk-turing-blog-default-key-2026' }
    })
    const data = await response.json()
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const createKey = async () => {
  if (!newKey.value.name) {
    alert('请输入 API Key 名称')
    return
  }
  if (newKey.value.permissions.length === 0) {
    alert('请至少选择一个权限')
    return
  }

  try {
    const response = await fetch(`${API_BASE}/api/api-keys`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newKey.value)
    })
    const data = await response.json()
    if (data.success) {
      createdKey.value = data.data.key
      showCreateDialog.value = false
      showSuccessDialog.value = true
      loadApiKeys()
      newKey.value = {
        name: '',
        permissions: ['articles:read', 'articles:write', 'tools:read', 'news:read']
      }
    }
  } catch (error) {
    alert('创建失败，请检查 API 服务器是否运行')
  }
}

const deleteKey = async (id) => {
  if (!confirm('确定要删除这个 API Key 吗？')) return

  try {
    const response = await fetch(`${API_BASE}/api/api-keys/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': 'sk-turing-blog-default-key-2026' }
    })
    const data = await response.json()
    if (data.success) {
      loadApiKeys()
    } else {
      alert(data.error)
    }
  } catch (error) {
    alert('删除失败')
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
  alert('已复制到剪贴板')
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (!isLoggedIn) {
    router.push('/login')
    return
  }
  
  checkServerStatus()
  loadApiKeys()
  loadStats()
  
  // 定时检查服务器状态
  setInterval(checkServerStatus, 30000)
})
</script>

<style scoped>
.api-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.header-left h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.header-left p {
  color: #6b7280;
  font-size: 0.9rem;
}

.create-btn {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 状态卡片 */
.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-icon {
  font-size: 2.5rem;
}

.status-info h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.status-info p {
  font-size: 1.25rem;
  font-weight: 600;
}

.status-info p.online {
  color: #10b981;
}

.status-info p.offline {
  color: #ef4444;
}

/* API 文档 */
.api-docs {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.api-docs h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.doc-section {
  margin-bottom: 2rem;
}

.doc-section h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #374151;
}

.code-block {
  background: #1f2937;
  color: #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.85rem;
  overflow-x: auto;
}

.code-block .or {
  display: block;
  color: #9ca3af;
  margin: 0.5rem 0;
  font-style: italic;
}

.endpoints {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.endpoint-group h4 {
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.endpoint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.method {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  min-width: 50px;
  text-align: center;
}

.method.get { background: #dbeafe; color: #1e40af; }
.method.post { background: #d1fae5; color: #065f46; }
.method.put { background: #fef3c7; color: #92400e; }
.method.delete { background: #fee2e2; color: #991b1b; }

.endpoint code {
  font-size: 0.85rem;
  color: #667eea;
}

.endpoint .description {
  color: #6b7280;
  font-size: 0.85rem;
  margin-left: auto;
}

.example-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e5e7eb;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* API Keys 列表 */
.api-keys-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.api-keys-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.keys-list {
  display: grid;
  gap: 1rem;
}

.key-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.key-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.key-header h4 {
  font-size: 1rem;
  color: #1f2937;
}

.key-id {
  font-size: 0.75rem;
  color: #9ca3af;
}

.key-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.key-value code {
  flex: 1;
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #667eea;
}

.copy-btn {
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: #667eea;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #667eea;
  color: white;
}

.key-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.key-permissions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.key-permissions .label {
  font-size: 0.85rem;
  color: #6b7280;
}

.permission {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.permission.read { background: #dbeafe; color: #1e40af; }
.permission.write { background: #d1fae5; color: #065f46; }

.delete-btn {
  padding: 0.35rem 0.75rem;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.dialog.success {
  border: 2px solid #10b981;
}

.dialog h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.dialog .warning {
  color: #f59e0b;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.new-key-display {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.new-key-display code {
  flex: 1;
  font-size: 0.85rem;
  color: #667eea;
  word-break: break-all;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.6rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
}

.confirm-btn {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

@media (max-width: 768px) {
  .api-management {
    padding: 1rem;
  }
  
  .api-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .endpoint {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .endpoint .description {
    margin-left: 0;
    margin-top: 0.25rem;
  }
  
  .permissions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
