// 数据管理模块 - 统一管理所有博客数据

// 默认文章数据
const defaultArticles = [
  {
    id: 1,
    title: 'Linux 运维必备：20 个常用命令详解',
    excerpt: '掌握这 20 个 Linux 命令，让你在日常运维工作中如鱼得水，提升工作效率...',
    category: 'Linux运维',
    date: '2026-03-27',
    readingTime: 15,
    tags: ['Linux', '命令行', '运维'],
    content: `
      <h2>前言</h2>
      <p>作为运维工程师，熟练掌握 Linux 命令是必备技能。本文将介绍 20 个最常用的 Linux 命令。</p>
      
      <h3>1. top - 系统监控</h3>
      <pre><code>top  # 查看 CPU、内存使用情况</code></pre>
      
      <h3>2. df - 磁盘空间查看</h3>
      <pre><code>df -h  # 查看磁盘使用情况</code></pre>
      
      <h3>3. netstat - 网络连接查看</h3>
      <pre><code>netstat -tulpn  # 查看所有端口</code></pre>
    `
  },
  {
    id: 2,
    title: 'Docker 从入门到实战',
    excerpt: '从零开始学习 Docker，包括镜像管理、容器操作、网络配置...',
    category: 'Docker',
    date: '2026-03-25',
    readingTime: 20,
    tags: ['Docker', '容器', 'DevOps'],
    content: `
      <h2>Docker 简介</h2>
      <p>Docker 是一个开源的容器化平台，可以将应用程序及其依赖打包到容器中。</p>
      
      <h3>常用命令</h3>
      <pre><code>docker pull nginx  # 拉取镜像
docker run -d -p 80:80 nginx  # 运行容器
docker ps  # 查看容器</code></pre>
    `
  },
  {
    id: 3,
    title: 'Kubernetes 入门指南',
    excerpt: '深入理解 K8s 核心概念，掌握 Pod、Service、Deployment...',
    category: 'Kubernetes',
    date: '2026-03-20',
    readingTime: 25,
    tags: ['K8s', '云原生', '容器编排'],
    content: `
      <h2>Kubernetes 简介</h2>
      <p>Kubernetes 是 Google 开源的容器编排平台。</p>
      
      <h3>常用命令</h3>
      <pre><code>kubectl get pods  # 查看 Pod
kubectl get deployments  # 查看 Deployment</code></pre>
    `
  }
]

// 默认工具数据
const defaultTools = [
  { id: 1, name: 'ChatGPT', icon: '🤖', category: 'chat', description: 'OpenAI 的对话 AI', url: 'https://chat.openai.com', tags: ['对话', 'AI'] },
  { id: 2, name: 'Claude', icon: '🧠', category: 'chat', description: 'Anthropic 的 AI 助手', url: 'https://claude.ai', tags: ['对话', 'AI'] },
  { id: 3, name: 'Midjourney', icon: '🎨', category: 'image', description: 'AI 图像生成', url: 'https://midjourney.com', tags: ['图像', 'AI'] },
  { id: 4, name: 'GitHub Copilot', icon: '💻', category: 'code', description: 'AI 代码助手', url: 'https://github.com/features/copilot', tags: ['编程', 'AI'] },
  { id: 5, name: 'Notion AI', icon: '📝', category: 'writing', description: '笔记 AI 助手', url: 'https://notion.so', tags: ['写作', '笔记'] },
  { id: 6, name: 'ElevenLabs', icon: '🎤', category: 'audio', description: 'AI 语音合成', url: 'https://elevenlabs.io', tags: ['语音', 'AI'] },
  { id: 7, name: 'Runway', icon: '🎬', category: 'video', description: 'AI 视频生成', url: 'https://runwayml.com', tags: ['视频', 'AI'] },
  { id: 8, name: 'Perplexity', icon: '🔍', category: 'research', description: 'AI 搜索引擎', url: 'https://perplexity.ai', tags: ['搜索', '研究'] },
  { id: 9, name: '文心一言', icon: '🇨🇳', category: 'chat', description: '百度的中文大模型', url: 'https://yiyan.baidu.com', tags: ['对话', '中文'] },
  { id: 10, name: '通义千问', icon: '🔮', category: 'chat', description: '阿里的大语言模型', url: 'https://tongyi.aliyun.com', tags: ['对话', '中文'] }
]

// 默认新闻数据
const defaultNews = [
  { id: 1, title: 'OpenAI 发布 GPT-5，性能大幅提升', source: '科技日报', time: '2小时前', category: 'ai', excerpt: 'OpenAI 宣布推出 GPT-5 模型...', url: '#', tags: ['AI', 'GPT'] },
  { id: 2, title: '英伟达发布 H200 GPU', source: 'IT之家', time: '3小时前', category: 'hardware', excerpt: '英伟达推出新款 GPU...', url: '#', tags: ['GPU', 'NVIDIA'] },
  { id: 3, title: 'Docker Desktop 4.30 发布', source: '开源中国', time: '5小时前', category: 'software', excerpt: 'Docker 发布新版本...', url: '#', tags: ['Docker', '容器'] }
]

// 存储键名
const STORAGE_KEYS = {
  ARTICLES: 'blog_articles',
  TOOLS: 'blog_tools',
  NEWS: 'blog_news'
}

// 获取数据（如果不存在则初始化默认数据）
export function getArticles() {
  const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(defaultArticles))
  return defaultArticles
}

export function getTools() {
  const stored = localStorage.getItem(STORAGE_KEYS.TOOLS)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(defaultTools))
  return defaultTools
}

export function getNews() {
  const stored = localStorage.getItem(STORAGE_KEYS.NEWS)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(defaultNews))
  return defaultNews
}

// 保存数据
export function saveArticles(articles) {
  localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles))
}

export function saveTools(tools) {
  localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(tools))
}

export function saveNews(news) {
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news))
}

// 添加数据
export function addArticle(article) {
  const articles = getArticles()
  article.id = Date.now()
  article.readingTime = article.readingTime || 10
  articles.unshift(article)
  saveArticles(articles)
  return article
}

export function addTool(tool) {
  const tools = getTools()
  tool.id = Date.now()
  tools.unshift(tool)
  saveTools(tools)
  return tool
}

export function addNews(item) {
  const news = getNews()
  item.id = Date.now()
  news.unshift(item)
  saveNews(news)
  return item
}

// 更新数据
export function updateArticle(article) {
  const articles = getArticles()
  const index = articles.findIndex(a => a.id === article.id)
  if (index !== -1) {
    articles[index] = article
    saveArticles(articles)
    return true
  }
  return false
}

export function updateTool(tool) {
  const tools = getTools()
  const index = tools.findIndex(t => t.id === tool.id)
  if (index !== -1) {
    tools[index] = tool
    saveTools(tools)
    return true
  }
  return false
}

export function updateNews(item) {
  const news = getNews()
  const index = news.findIndex(n => n.id === item.id)
  if (index !== -1) {
    news[index] = item
    saveNews(news)
    return true
  }
  return false
}

// 删除数据
export function deleteArticle(id) {
  const articles = getArticles()
  const filtered = articles.filter(a => a.id !== id)
  saveArticles(filtered)
  return filtered
}

export function deleteTool(id) {
  const tools = getTools()
  const filtered = tools.filter(t => t.id !== id)
  saveTools(filtered)
  return filtered
}

export function deleteNews(id) {
  const news = getNews()
  const filtered = news.filter(n => n.id !== id)
  saveNews(filtered)
  return filtered
}

// 获取分类统计
export function getCategories() {
  const articles = getArticles()
  const categoryMap = {}
  
  articles.forEach(article => {
    if (!categoryMap[article.category]) {
      categoryMap[article.category] = 0
    }
    categoryMap[article.category]++
  })
  
  return Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count,
    description: getCategoryDescription(name)
  }))
}

function getCategoryDescription(name) {
  const descriptions = {
    'Linux运维': 'Linux 系统管理与性能优化',
    'Docker': '容器化技术与 Docker 实践',
    'Kubernetes': '云原生与容器编排',
    '云原生': '云原生技术栈',
    '其他': '其他技术文章'
  }
  return descriptions[name] || '技术文章'
}
