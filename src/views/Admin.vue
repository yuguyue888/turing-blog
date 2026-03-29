<template>
  <div class="admin">
    <div class="admin-header">
      <h1>⚙️ 管理后台</h1>
      <div class="admin-actions">
        <router-link to="/api-management" class="api-btn">🔌 API 管理</router-link>
        <span class="welcome">欢迎，{{ username }}</span>
        <button @click="logout" class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="admin-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.icon }} {{ tab.label }} ({{ getCount(tab.key) }})
      </button>
    </div>

    <!-- 友情链接管理 -->
    <section v-if="activeTab === 'links'" class="manage-section">
      <div class="section-header">
        <h2>友情链接管理</h2>
        <button @click="showAddLink" class="add-btn">+ 添加友链</button>
      </div>

      <p v-if="friendLinks.length === 0" class="no-items">暂无友情链接</p>
      <div v-else class="items-list">
        <div v-for="(link, index) in friendLinks" :key="link.id" class="item-card">
          <div class="item-drag">⋮⋮</div>
          <div class="item-icon">{{ link.icon }}</div>
          <div class="item-content">
            <h3>{{ link.name }}</h3>
            <p>{{ link.description }}</p>
            <a :href="link.url" target="_blank" class="link-url">{{ link.url }}</a>
          </div>
          <div class="item-actions">
            <button @click="editLink(link)" class="action-btn edit">编辑</button>
            <button @click="deleteLink(link.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 页面横幅管理 -->
    <section v-if="activeTab === 'banner'" class="manage-section">
      <div class="section-header">
        <h2>🎨 页面横幅管理</h2>
      </div>

      <div class="banner-config">
        <div class="form-group">
          <label>横幅类型</label>
          <select v-model="bannerConfig.type">
            <option value="text">文字横幅</option>
            <option value="image">图片横幅</option>
          </select>
        </div>

        <div v-if="bannerConfig.type === 'text'" class="text-config">
          <div class="form-group">
            <label>标题</label>
            <input v-model="bannerConfig.title" type="text" placeholder="📰 科技日报">
          </div>
          <div class="form-group">
            <label>副标题</label>
            <input v-model="bannerConfig.subtitle" type="text" placeholder="每日科技资讯，掌握前沿动态">
          </div>
        </div>

        <div v-else class="image-config">
          <div class="form-group">
            <label>图片URL</label>
            <input v-model="bannerConfig.imageUrl" type="url" placeholder="https://example.com/banner.jpg">
          </div>
          <div class="form-group">
            <label>图片描述（Alt）</label>
            <input v-model="bannerConfig.alt" type="text" placeholder="科技日报">
          </div>
          <div v-if="bannerConfig.imageUrl" class="preview">
            <label>预览</label>
            <img :src="bannerConfig.imageUrl" :alt="bannerConfig.alt" />
          </div>
        </div>

        <div class="form-actions">
          <button @click="saveBannerConfig" class="save-btn">💾 保存配置</button>
          <button @click="resetBannerConfig" class="cancel-btn">🔄 重置默认</button>
        </div>

        <div class="preview-section">
          <h3>预览效果</h3>
          <div class="banner-preview">
            <div v-if="bannerConfig.type === 'image'" class="preview-image">
              <img :src="bannerConfig.imageUrl" :alt="bannerConfig.alt" />
            </div>
            <div v-else class="preview-text">
              <h1>{{ bannerConfig.title }}</h1>
              <p>{{ bannerConfig.subtitle }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 邮件通知管理 -->
    <section v-if="activeTab === 'email'" class="manage-section">
      <div class="section-header">
        <h2>📧 邮件通知配置</h2>
      </div>

      <div class="email-config">
        <div class="config-section">
          <h3>基础设置</h3>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="emailConfig.enabled" />
              启用邮件通知
            </label>
          </div>
        </div>

        <div v-if="emailConfig.enabled" class="smtp-config">
          <h3>SMTP 配置</h3>
          
          <div class="form-group">
            <label>SMTP 服务器</label>
            <input v-model="emailConfig.smtp.host" type="text" placeholder="smtp.gmail.com">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>端口</label>
              <input v-model.number="emailConfig.smtp.port" type="number" placeholder="587">
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="emailConfig.smtp.secure" />
                使用 SSL/TLS
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>用户名</label>
            <input v-model="emailConfig.smtp.user" type="text" placeholder="your-email@gmail.com">
          </div>

          <div class="form-group">
            <label>密码</label>
            <input v-model="emailConfig.smtp.password" type="password" placeholder="应用专用密码">
          </div>

          <div class="form-group">
            <label>发件人</label>
            <input v-model="emailConfig.from" type="email" placeholder="noreply@example.com">
          </div>

          <div class="form-group">
            <label>收件人</label>
            <input v-model="emailConfig.to" type="email" placeholder="your-email@example.com">
          </div>
        </div>

        <div v-if="emailConfig.enabled" class="notification-config">
          <h3>通知类型</h3>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="emailConfig.notifications.systemErrors" />
              系统错误通知
            </label>
            <p class="help-text">当系统出现错误时发送邮件通知</p>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="emailConfig.notifications.newsSourceFailures" />
              新闻源失败通知
            </label>
            <p class="help-text">当新闻源连续失败3次时发送邮件通知</p>
          </div>
        </div>

        <div class="form-actions">
          <button @click="saveEmailConfig" class="save-btn">💾 保存配置</button>
          <button @click="testEmail" class="test-btn" :disabled="!emailConfig.enabled">🧪 发送测试邮件</button>
        </div>

        <div class="help-section">
          <h3>配置帮助</h3>
          <details>
            <summary>Gmail 配置说明</summary>
            <ul>
              <li>SMTP 服务器: smtp.gmail.com</li>
              <li>端口: 587</li>
              <li>使用 SSL/TLS: 否（使用 STARTTLS）</li>
              <li>用户名: 你的 Gmail 地址</li>
              <li>密码: <a href="https://support.google.com/accounts/answer/185833" target="_blank">应用专用密码</a></li>
            </ul>
          </details>

          <details>
            <summary>QQ 邮箱配置说明</summary>
            <ul>
              <li>SMTP 服务器: smtp.qq.com</li>
              <li>端口: 587</li>
              <li>使用 SSL/TLS: 是</li>
              <li>用户名: 你的 QQ 邮箱</li>
              <li>密码: <a href="https://service.mail.qq.com/detail/0/52" target="_blank">授权码</a></li>
            </ul>
          </details>

          <details>
            <summary>163 邮箱配置说明</summary>
            <ul>
              <li>SMTP 服务器: smtp.163.com</li>
              <li>端口: 465</li>
              <li>使用 SSL/TLS: 是</li>
              <li>用户名: 你的 163 邮箱</li>
              <li>密码: <a href="https://help.mail.163.com/faqDetail.do?code=d7a5dc8471cd0bd948e9fd81caa9521a" target="_blank">授权密码</a></li>
            </ul>
          </details>
        </div>
      </div>
    </section>

    <!-- 访问统计 -->
    <section v-if="activeTab === 'analytics'" class="manage-section">
      <AnalyticsDashboard />
    </section>

    <!-- 新闻源管理 -->
    <section v-if="activeTab === 'sources'" class="manage-section">
      <NewsSourceManager />
    </section>

    <!-- 文章管理 -->
    <section v-if="activeTab === 'articles'" class="manage-section">
      <div class="section-header">
        <h2>文章管理</h2>
        <div class="header-actions">
          <router-link to="/editor" class="add-btn">+ 写文章</router-link>
          <label class="import-btn">
            📥 导入MD
            <input 
              type="file" 
              accept=".md,.markdown"
              @change="importMarkdown"
              style="display: none"
            >
          </label>
        </div>
      </div>

      <p v-if="articles.length === 0" class="no-items">暂无文章</p>
      <div class="items-list">
        <div v-for="(article, index) in articles" :key="article.id" class="item-card">
          <div class="item-drag">⋮⋮</div>
          <div class="item-content">
            <h3>{{ article.title }}</h3>
            <p>{{ article.category }} · {{ article.date }}</p>
          </div>
          <div class="item-actions">
            <router-link :to="`/editor/${article.id}`" class="action-btn edit">编辑</router-link>
            <button @click="deleteArticle(article.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具管理 -->
    <section v-if="activeTab === 'tools'" class="manage-section">
      <div class="section-header">
        <h2>AI 工具管理</h2>
        <button @click="showAddTool" class="add-btn">+ 添加工具</button>
      </div>

      <p v-if="tools.length === 0" class="no-items">暂无工具</p>
      <div class="items-list">
        <div v-for="(tool, index) in tools" :key="tool.id" class="item-card">
          <div class="item-drag">⋮⋮</div>
          <div class="item-icon">{{ tool.icon }}</div>
          <div class="item-content">
            <h3>{{ tool.name }}</h3>
            <p>{{ getCategoryLabel(tool.category) }} · {{ tool.tags?.join(', ') }}</p>
          </div>
          <div class="item-actions">
            <button @click="editTool(tool)" class="action-btn edit">编辑</button>
            <button @click="deleteTool(tool.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 新闻管理 -->
    <section v-if="activeTab === 'news'" class="manage-section">
      <div class="section-header">
        <h2>科技日报管理</h2>
        <button @click="showAddNews" class="add-btn">+ 添加新闻</button>
      </div>

      <p v-if="newsList.length === 0" class="no-items">暂无新闻</p>
      <div class="items-list">
        <div v-for="(item, index) in newsList" :key="item.id" class="item-card">
          <div class="item-drag">⋮⋮</div>
          <div class="item-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.source }} · {{ item.time }}</p>
          </div>
          <div class="item-actions">
            <button @click="editNews(item)" class="action-btn edit">编辑</button>
            <button @click="deleteNews(item.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button @click="closeModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <ArticleForm 
            v-if="modalType === 'article'"
            :article="currentItem"
            @save="saveArticle"
            @cancel="closeModal"
          />
          <ToolForm 
            v-if="modalType === 'tool'"
            :tool="currentItem"
            @save="saveTool"
            @cancel="closeModal"
          />
          <NewsForm 
            v-if="modalType === 'news'"
            :news="currentItem"
            @save="saveNews"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NewsSourceManager from '../components/NewsSourceManager.vue'
import { useRouter } from 'vue-router'
import ArticleForm from '../components/ArticleForm.vue'
import ToolForm from '../components/ToolForm.vue'
import NewsForm from '../components/NewsForm.vue'
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue'
import { 
  getArticles, addArticle, updateArticle, deleteArticle as removeArticle,
  getTools, addTool, updateTool, deleteTool as removeTool,
  getNews, addNews, updateNews, deleteNews as removeNews
} from '../data/store.js'

const router = useRouter()
const username = ref('')
const activeTab = ref('articles')
const showModal = ref(false)
const modalType = ref('')
const modalTitle = ref('')
const currentItem = ref(null)

const articles = ref([])
const tools = ref([])
const newsList = ref([])
const friendLinks = ref([])
const bannerConfig = ref({
  type: 'text',
  title: '📰 科技日报',
  subtitle: '每日科技资讯，掌握前沿动态',
  imageUrl: '',
  alt: '科技日报'
})
const emailConfig = ref({
  enabled: false,
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: ''
  },
  from: '',
  to: '',
  notifications: {
    systemErrors: true,
    newsSourceFailures: true
  }
})

const tabs = [
  { key: 'articles', label: '文章', icon: '📝' },
  { key: 'tools', label: 'AI工具', icon: '🧭' },
  { key: 'news', label: '科技日报', icon: '📰' },
  { key: 'sources', label: '新闻源', icon: '📡' },
  { key: 'links', label: '友情链接', icon: '🤝' },
  { key: 'banner', label: '页面横幅', icon: '🎨' },
  { key: 'email', label: '邮件通知', icon: '📧' }
]

const toolCategories = [
  { key: 'chat', label: '对话模型' },
  { key: 'image', label: '图像生成' },
  { key: 'code', label: '编程助手' },
  { key: 'writing', label: '写作工具' },
  { key: 'audio', label: '音频处理' },
  { key: 'video', label: '视频工具' },
  { key: 'research', label: '研究工具' }
]

const getCategoryLabel = (key) => {
  const cat = toolCategories.find(c => c.key === key)
  return cat ? cat.label : key
}

const getCount = (type) => {
  if (type === 'articles') return articles.value.length
  if (type === 'tools') return tools.value.length
  if (type === 'news') return newsList.value.length
  if (type === 'sources') return '-' // 新闻源数量在组件内管理
  if (type === 'links') return friendLinks.value.length
  if (type === 'banner') return '-'
  if (type === 'email') return emailConfig.value.enabled ? '✅' : '❌'
  return 0
}

// 检查登录状态
onMounted(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  if (!isLoggedIn) {
    router.push('/login')
    return
  }
  
  username.value = localStorage.getItem('username') || 'Admin'
  loadData()
})

const loadData = () => {
  articles.value = getArticles()
  tools.value = getTools()
  newsList.value = getNews()
  loadFriendLinks()
  loadBannerConfig()
  loadEmailConfig()
}

// 邮件配置
const loadEmailConfig = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/email-config', {
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success) {
      emailConfig.value = data.config
    }
  } catch (error) {
    console.error('加载邮件配置失败:', error)
  }
}

const saveEmailConfig = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/email-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      },
      body: JSON.stringify(emailConfig.value)
    })
    const data = await response.json()
    if (data.success) {
      alert('✅ 邮件配置已保存！')
    } else {
      alert('❌ 保存失败: ' + data.error)
    }
  } catch (error) {
    alert('❌ 保存失败: ' + error.message)
  }
}

const testEmail = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/email-config/test', {
      method: 'POST',
      headers: {
        'X-API-Key': 'sk-turing-blog-default-key-2026'
      }
    })
    const data = await response.json()
    if (data.success) {
      alert('✅ 测试邮件已发送，请检查收件箱！')
    } else {
      alert('❌ 发送失败: ' + data.message)
    }
  } catch (error) {
    alert('❌ 发送失败: ' + error.message)
  }
}

// 横幅配置
const loadBannerConfig = () => {
  const stored = localStorage.getItem('newsBannerConfig')
  if (stored) {
    bannerConfig.value = JSON.parse(stored)
  }
}

const saveBannerConfig = () => {
  localStorage.setItem('newsBannerConfig', JSON.stringify(bannerConfig.value))
  alert('✅ 横幅配置已保存！')
}

const resetBannerConfig = () => {
  if (confirm('确定要重置为默认配置吗？')) {
    bannerConfig.value = {
      type: 'text',
      title: '📰 科技日报',
      subtitle: '每日科技资讯，掌握前沿动态',
      imageUrl: '',
      alt: '科技日报'
    }
    localStorage.setItem('newsBannerConfig', JSON.stringify(bannerConfig.value))
    alert('✅ 已重置为默认配置！')
  }
}

// 文章操作
const showAddArticle = () => {
  modalType.value = 'article'
  modalTitle.value = '添加文章'
  currentItem.value = null
  showModal.value = true
}

const editArticle = (article) => {
  modalType.value = 'article'
  modalTitle.value = '编辑文章'
  currentItem.value = { ...article }
  showModal.value = true
}

const deleteArticle = (id) => {
  if (confirm('确定要删除这篇文章吗？')) {
    articles.value = removeArticle(id)
  }
}

const saveArticle = (article) => {
  if (article.id) {
    updateArticle(article)
  } else {
    addArticle(article)
  }
  articles.value = getArticles()
  closeModal()
}

// 工具操作
const showAddTool = () => {
  modalType.value = 'tool'
  modalTitle.value = '添加工具'
  currentItem.value = null
  showModal.value = true
}

const editTool = (tool) => {
  modalType.value = 'tool'
  modalTitle.value = '编辑工具'
  currentItem.value = { ...tool }
  showModal.value = true
}

const deleteTool = (id) => {
  if (confirm('确定要删除这个工具吗？')) {
    tools.value = removeTool(id)
  }
}

const saveTool = (tool) => {
  if (tool.id) {
    updateTool(tool)
  } else {
    addTool(tool)
  }
  tools.value = getTools()
  closeModal()
}

// 新闻操作
const showAddNews = () => {
  modalType.value = 'news'
  modalTitle.value = '添加新闻'
  currentItem.value = null
  showModal.value = true
}

const editNews = (item) => {
  modalType.value = 'news'
  modalTitle.value = '编辑新闻'
  currentItem.value = { ...item }
  showModal.value = true
}

const deleteNews = (id) => {
  if (confirm('确定要删除这条新闻吗？')) {
    newsList.value = removeNews(id)
  }
}

const saveNews = (item) => {
  if (item.id) {
    updateNews(item)
  } else {
    addNews(item)
  }
  newsList.value = getNews()
  closeModal()
}

// 友链操作
const showAddLink = () => {
  modalType.value = 'link'
  modalTitle.value = '添加友链'
  currentItem.value = null
  showModal.value = true
}

const editLink = (link) => {
  modalType.value = 'link'
  modalTitle.value = '编辑友链'
  currentItem.value = { ...link }
  showModal.value = true
}

const deleteLink = (id) => {
  if (confirm('确定要删除这个友链吗？')) {
    friendLinks.value = friendLinks.value.filter(l => l.id !== id)
    saveFriendLinks()
  }
}

const saveLink = (link) => {
  if (link.id) {
    const index = friendLinks.value.findIndex(l => l.id === link.id)
    if (index !== -1) {
      friendLinks.value[index] = link
    }
  } else {
    link.id = Date.now().toString()
    friendLinks.value.push(link)
  }
  saveFriendLinks()
  closeModal()
}

const saveFriendLinks = () => {
  localStorage.setItem('friendLinks', JSON.stringify(friendLinks.value))
}

const loadFriendLinks = () => {
  const stored = localStorage.getItem('friendLinks')
  if (stored) {
    friendLinks.value = JSON.parse(stored)
  } else {
    // 默认友链
    friendLinks.value = [
      { id: '1', name: 'GitHub', icon: '🐙', url: 'https://github.com', description: '全球最大的代码托管平台' },
      { id: '2', name: 'Stack Overflow', icon: '📚', url: 'https://stackoverflow.com', description: '程序员问答社区' },
      { id: '3', name: 'InfoQ', icon: '📰', url: 'https://www.infoq.cn', description: '技术资讯与知识平台' },
      { id: '4', name: '掘金', icon: '💎', url: 'https://juejin.cn', description: '开发者技术社区' },
      { id: '5', name: 'SegmentFault', icon: '💭', url: 'https://segmentfault.com', description: '技术问答与交流' },
      { id: '6', name: 'CSDN', icon: '💻', url: 'https://www.csdn.net', description: '专业开发者社区' },
      { id: '7', name: '开源中国', icon: '🌟', url: 'https://www.oschina.net', description: '开源技术社区' },
      { id: '8', name: 'MDN Web Docs', icon: '📖', url: 'https://developer.mozilla.org', description: 'Web 开发文档' },
      { id: '9', name: 'Vue.js', icon: '💚', url: 'https://vuejs.org', description: '渐进式 JavaScript 框架' },
      { id: '10', name: 'React', icon: '⚛️', url: 'https://react.dev', description: '用于构建用户界面的 JavaScript 库' },
      { id: '11', name: 'TypeScript', icon: '🔷', url: 'https://www.typescriptlang.org', description: 'JavaScript 的超集' },
      { id: '12', name: 'Node.js', icon: '💚', url: 'https://nodejs.org', description: 'JavaScript 运行时环境' }
    ]
    saveFriendLinks()
  }
}

const closeModal = () => {
  showModal.value = false
  currentItem.value = null
}

// 导入 Markdown 文件
const importMarkdown = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const content = await file.text()
    const parsed = parseMarkdown(content)
    
    // 自动填充表单
    const article = {
      id: Date.now().toString(),
      title: parsed.title || file.name.replace(/\.md$/, ''),
      content: parsed.html,
      excerpt: parsed.excerpt,
      category: 'tech',
      tags: parsed.tags,
      date: new Date().toLocaleDateString('zh-CN'),
      readingTime: Math.max(1, Math.ceil(parsed.text.length / 400)),
      views: 0
    }

    // 添加到文章列表
    addArticle(article)
    articles.value = getArticles()
    
    alert(`✅ 成功导入文章：${article.title}`)
  } catch (error) {
    console.error('导入失败:', error)
    alert('❌ 导入失败: ' + error.message)
  }

  // 清空文件输入
  event.target.value = ''
}

// 解析 Markdown
const parseMarkdown = (md) => {
  const lines = md.split('\n')
  let title = ''
  let text = ''
  let tags = []
  let startIndex = 0

  // 提取标题（第一个 # 标题）
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) {
      title = line.substring(2).trim()
      startIndex = i + 1
      break
    }
  }

  // 提取标签（如果有）
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('tags:') || line.startsWith('Tags:')) {
      const tagLine = line.substring(5).trim()
      tags = tagLine.split(',').map(t => t.trim()).filter(t => t)
      startIndex = i + 1
      break
    }
    if (line && !line.startsWith('#')) {
      startIndex = i
      break
    }
  }

  // 获取正文
  const content = lines.slice(startIndex).join('\n')
  text = content.replace(/[#*`>\-\[\]]/g, '').trim()

  // 转换 Markdown 到 HTML
  let html = content
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // 链接和图片
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // 引用
    .replace(/^>\s*(.*)$/gim, '<blockquote>$1</blockquote>')
    // 列表
    .replace(/^\*\s*(.*)$/gim, '<li>$1</li>')
    .replace(/^-{3,}$/gim, '<hr />')
    // 段落
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />')

  // 包装段落
  html = '<p>' + html + '</p>'
  
  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/gim, '')

  // 生成摘要
  const excerpt = text.length > 200 ? text.substring(0, 200) + '...' : text

  return { title, html, text, excerpt, tags }
}

const logout = () => {
  localStorage.removeItem('isLoggedIn')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.admin {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.admin-header h1 {
  font-size: 1.5rem;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.api-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.api-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
}

.logout-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.admin-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.875rem;
}

.tab-btn:hover,
.tab-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.manage-section {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.1rem;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: none;
  display: inline-block;
}

.add-btn:hover {
  opacity: 0.9;
}

.no-items {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.item-drag {
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: grab;
}

.item-icon {
  font-size: 1.5rem;
}

.item-content {
  flex: 1;
}

.item-content h3 {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.item-content p {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 0.75rem;
}

.action-btn.edit {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.action-btn.delete {
  color: #ef4444;
  border-color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 1rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 60px);
  overflow-y: auto;
}
</style>
