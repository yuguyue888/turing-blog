# 🧠 图灵花园 - Turing Blog

一个基于 Vue 3 + Vite 构建的现代化技术博客系统，支持深色模式、PWA、访问统计等功能。

![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/Vite-8.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ 特性

### 核心功能
- 🎨 **深色模式** - 自动/手动切换，跟随系统设置
- 📰 **科技日报** - 自动抓取14个新闻源，AI摘要
- 🧭 **AI导航** - 70+ AI工具分类展示
- 📝 **文章系统** - Markdown导入，所见即所得编辑
- 🔗 **友情链接** - 后台可视化管理
- 📊 **访问统计** - 本地PV/UV统计，7天趋势图
- 📧 **邮件通知** - SMTP配置，错误提醒

### 技术特性
- ⚡ **Vite 构建** - 极速热更新，按需编译
- 📦 **组件化** - Vue 3 Composition API
- 🎭 **响应式设计** - 移动端友好
- 🚀 **PWA 支持** - 离线访问，添加到桌面
- 🐳 **Docker 部署** - 一键容器化部署
- 🔒 **API 认证** - 安全的接口保护

## 🚀 快速开始

### 环境要求
- Node.js >= 20.19.0
- npm >= 10.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问: http://localhost:5173

### 生产构建
```bash
npm run build
npm run preview
```

## 📦 Docker 部署

### 使用 Docker Compose（推荐）
```bash
docker-compose up -d
```

### 手动构建
```bash
# 构建镜像
docker build -f Dockerfile.frontend -t turing-blog-frontend .
docker build -f Dockerfile.backend -t turing-blog-backend .

# 运行容器
docker-compose up -d
```

访问: http://localhost:5173

## 📁 项目结构

```
turing-blog/
├── src/
│   ├── components/      # 组件
│   ├── views/          # 页面
│   ├── utils/          # 工具函数
│   ├── data/           # 数据存储
│   ├── router/         # 路由配置
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/             # 静态资源
│   ├── manifest.json   # PWA 配置
│   ├── sw.js          # Service Worker
│   └── offline.html   # 离线页面
├── server.js          # 后端服务器
├── docker-compose.yml # Docker 编排
└── package.json       # 项目配置
```

## 🎯 功能模块

### 1. 首页
- 网站介绍
- 最新文章
- 快速导航

### 2. 科技日报
- 自动抓取14个新闻源
- 完整内容展示
- 分类筛选
- AI 摘要（可选）

### 3. AI 导航
- 70+ AI 工具
- 分类展示
- 搜索功能
- 快速跳转

### 4. 文章系统
- Markdown 导入
- 所见即所得编辑
- 目录导航
- 深色模式适配

### 5. 后台管理
- 文章管理
- AI 工具管理
- 新闻源配置
- 友情链接
- 访问统计

## 🔧 配置说明

### 环境变量
创建 `.env` 文件：
```env
VITE_API_KEY=your-api-key
VITE_BAIDU_ANALYTICS_ID=your-baidu-id
VITE_GA_MEASUREMENT_ID=your-ga-id
```

### 后台登录
```
用户名: admin
密码: admin123
```
⚠️ **生产环境请立即修改默认密码**

## 📊 访问统计

### 本地统计
- PV/UV 统计
- 最近50条访问记录
- 7天趋势图
- 数据存储在 localStorage

### 第三方统计（可选）
- 百度统计
- Google Analytics

## 🎨 主题定制

### 深色模式
- 自动跟随系统
- 手动切换
- localStorage 持久化

### 自定义样式
修改 `src/style.css` 中的 CSS 变量。

## 🐳 Docker 支持

### 镜像信息
- **前端**: Nginx + Vue 构建 (25MB 压缩后)
- **后端**: Node.js Alpine (63MB 压缩后)

### 端口
- 前端: 5173
- 后端: 3001

### 数据持久化
```yaml
volumes:
  - ./data:/app/data
```

## 📝 API 文档

### 文章 API
```
GET    /api/articles       # 获取文章列表
POST   /api/articles       # 创建文章
PUT    /api/articles/:id   # 更新文章
DELETE /api/articles/:id   # 删除文章
```

### 工具 API
```
GET    /api/tools          # 获取工具列表
POST   /api/tools          # 添加工具
PUT    /api/tools/:id      # 更新工具
DELETE /api/tools/:id      # 删除工具
```

### 新闻 API
```
GET    /api/news           # 获取新闻列表
POST   /api/news/fetch     # 抓取新闻
```

## 🔒 安全建议

1. **修改默认密码** - 首次部署后立即修改
2. **配置防火墙** - 仅开放必要端口
3. **HTTPS** - 生产环境使用 HTTPS
4. **API Key** - 使用强密钥
5. **定期备份** - 备份 data 目录

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 项目地址: https://github.com/your-username/turing-blog
- 问题反馈: https://github.com/your-username/turing-blog/issues

---

**⭐ 如果这个项目对你有帮助，欢迎 Star 支持！**
