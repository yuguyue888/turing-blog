# 🧠 图灵花园 - Turing Blog

一个基于 Vue 3 + Vite 构建的现代化技术博客系统。

![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen)
![Vite](https://img.shields.io/badge/Vite-8.x-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 快速开始

### 下载

**推荐使用 v1.0.3 源代码包**

```bash
# Linux
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.3/turing-blog-linux-x64.tar.gz

# Windows (在浏览器下载)
# https://github.com/yuguyue888/turing-blog/releases/download/v1.0.3/turing-blog-windows-x64.tar.gz
```

### 安装

```bash
# 1. 解压
tar -xzf turing-blog-linux-x64.tar.gz

# 2. 运行
node server.js

# 3. 访问
# http://localhost:5173
```

### Docker 部署

```bash
# 1. 下载镜像
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/turing-blog-backend-node20.tar
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/turing-blog-frontend.tar
wget https://github.com/yuguyue888/turing-blog/releases/download/v1.0.2/docker-compose.yml

# 2. 加载并启动
docker load -i turing-blog-backend-node20.tar
docker load -i turing-blog-frontend.tar
docker compose up -d

# 3. 查看日志
docker compose logs -f
```

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🎨 **深色模式** | 自动/手动切换，跟随系统 |
| 📰 **科技日报** | 14个新闻源自动抓取 + AI摘要 |
| 🧭 **AI 导航** | 70+ AI 工具分类展示 |
| 📝 **文章系统** | Markdown 导入，所见即所得编辑 |
| 📊 **访问统计** | PV/UV 统计，7天趋势图 |
| 🐳 **Docker 部署** | 一键容器化部署 |

---

## 📦 版本说明

| 版本 | 类型 | 大小 | Node.js | 状态 |
|------|------|------|---------|------|
| **v1.0.3** | **源代码包** | **18 MB** | **24** | ✅ **推荐** |
| v1.0.2 | Docker 镜像 | 306 MB | 20 | ✅ 可用 |
| v1.0.0 | 源代码包 | 32 MB | 18 | ❌ 已弃用 |

---

## ⚙️ 常用命令

### 源代码部署

```bash
node server.js         # 启动服务器
npm install            # 安装依赖（如果需要）
npm run dev           # 开发模式
```

### Docker 部署

```bash
docker compose up -d     # 启动
docker compose down      # 停止
docker compose logs -f   # 查看日志
docker compose restart   # 重启
```

### 故障排查

```bash
# 端口被占用
netstat -tlnp | grep -E '3001|5173'
kill -9 <PID>

# Node.js 版本错误
# 升级到 Node.js 20+
# https://nodejs.org/
```

---

## 🔧 配置

### 系统要求

- **Node.js**: 20+ (推荐 22+ 或 24+)
- **内存**: 最低 512MB
- **磁盘**: 最低 100MB

### 环境变量 (可选)

```bash
# .env 文件
VITE_API_KEY=your-api-key
```

### 后台登录

```
用户名: admin
密码: admin123
⚠️ 生产环境请立即修改密码
```

---

## 🐛 常见问题

### Q: 启动报错 `File is not defined`?

A: 升级到 Node.js 20+ 或使用 **v1.0.3** 版本

### Q: 端口被占用?

A: `netstat -tlnp | grep 5173` 查看占用进程，`kill -9 <PID>` 杀掉

### Q: Docker 容器启动失败?

A: 检查镜像是否正确加载：`docker images | grep turing-blog`

---

## 📝 更新日志

### v1.0.3 (2026-03-29)
- ✅ 使用 Node.js 24 构建
- ✅ 修复 `ReferenceError: File is not defined`
- ✅ 优化体积：18 MB（比之前小 44%）
- ✅ 包含完整依赖，无需 npm install

### v1.0.2 (2026-03-29)
- ✅ 升级到 Node.js 20
- ✅ 修复 undici 兼容性问题
- ✅ 添加 docker-compose.yml

---

## 📄 许可证

[MIT License](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- **GitHub**: https://github.com/yuguyue888/turing-blog
- **问题反馈**: https://github.com/yuguyue888/turing-blog/issues

---

**⭐ 如果这个项目对你有帮助，欢迎 Star 支持！**