# 🧠 图灵花园 - Turing Blog

基于 Vue 3 + Vite 的现代化技术博客系统

![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/Vite-8.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 核心功能

- 🎨 **深色模式** - 自动跟随系统
- 📰 **科技日报** - 14个新闻源自动抓取
- 🧭 **AI导航** - 70+ AI工具分类
- 📝 **文章系统** - Markdown 导入，所见即所得编辑
- 📊 **访问统计** - PV/UV 统计，7天趋势
- 🔒 **API认证** - 安全的接口保护

---

## 📦 快速开始

### ⚡ 源代码包（推荐）

**下载**: [v1.0.3](https://github.com/yuguyue888/turing-blog/releases/tag/v1.0.3)

#### Linux

```bash
# 1. 下载
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.3/turing-blog-linux-x64.tar.gz

# 2. 解压
tar -xzf turing-blog-linux-x64.tar.gz

# 3. 运行
node server.js

# 4. 访问
# http://localhost:5173
```

#### Windows

1. 下载 `turing-blog-windows-x64.tar.gz`
2. 使用 7-Zip 解压
3. 双击 `start-server.bat`
4. 浏览器访问 http://localhost:5173

**✅ 特点**: 包含完整依赖，无需 `npm install`，解压即用

---

### 🐳 Docker 部署

**下载**: [v1.0.2 Docker 镜像](https://github.com/yuguyue888/turing-blog/releases/tag/v1.0.2)

```bash
# 1. 下载镜像和配置
mkdir -p /volume3/docker/turing-blog && cd /volume3/docker/turing-blog
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/turing-blog-backend-node20.tar
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/turing-blog-frontend.tar
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/docker-compose.yml

# 2. 加载镜像
docker load -i turing-blog-backend-node20.tar
docker load -i turing-blog-frontend.tar

# 3. 启动服务
docker compose up -d
```

---

## 📋 系统要求

| 项目 | 要求 |
|------|------|
| **Node.js** | 20+ (推荐 22+ 或 24+) |
| **内存** | 最低 512MB |
| **磁盘** | 最低 100MB |
| **端口** | 5173 (前端), 3001 (后端) |

---

## 🔧 配置

### 后台登录

```
用户名: admin
密码: admin123
```

⚠️ **生产环境请立即修改密码**

### 环境变量（可选）

创建 `.env` 文件：

```env
VITE_API_KEY=your-api-key
```

---

## 📝 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/articles` | 文章列表 |
| POST | `/api/articles` | 创建文章 |
| PUT | `/api/articles/:id` | 更新文章 |
| DELETE | `/api/articles/:id` | 删除文章 |
| GET | `/api/tools` | AI工具列表 |
| GET | `/api/news` | 新闻列表 |

完整 API 文档见: http://localhost:3001/api

---

## 🎯 版本对比

| 版本 | 类型 | Node.js | 大小 | 状态 |
|------|------|---------|------|------|
| **v1.0.3** | 源代码包 | 24 | 18 MB | ✅ **推荐** |
| v1.0.2 | Docker 镜像 | 20 | 306 MB | ✅ 可用 |
| v1.0.0 | 源代码包 | 18 | 32 MB | ❌ 已弃用 |

---

## 📁 项目结构

```
turing-blog/
├── server.js          # 后端服务
├── src/              # 前端源码
│   ├── views/        # 页面组件
│   ├── components/   # UI组件
│   └── router/       # 路由配置
├── data/             # 数据存储
├── public/           # 静态资源
└── docker-compose.yml
```

---

## 🔒 安全建议

- ✅ 修改默认密码
- ✅ 配置防火墙（仅开放必要端口）
- ✅ 生产环境使用 HTTPS
- ✅ 定期备份 `data/` 目录

---

## 🐛 故障排查

### 端口被占用

```bash
# 检查端口
netstat -tlnp | grep -E '3001|5173'

# 杀掉进程
kill -9 <PID>
```

### Node.js 版本错误

```
错误: ReferenceError: File is not defined
原因: Node.js 版本过低
解决: 升级到 Node.js 20+
```

---

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📮 联系方式

- **GitHub**: https://github.com/yuguyue888/turing-blog
- **问题反馈**: https://github.com/yuguyue888/turing-blog/issues

---

**⭐ 如果这个项目对你有帮助，欢迎 Star 支持！**
