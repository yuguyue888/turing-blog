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

## 📥 安装包下载

### ⚠️ 重要说明
**请通过 GitHub Releases 下载安装包，不要直接从仓库下载！**

### 下载地址
**https://github.com/yuguyue888/turing-blog/releases**

---

### Windows 用户
1. **访问 Releases**: https://github.com/yuguyue888/turing-blog/releases
2. **下载**: `turing-blog-windows-x64.tar.gz`
3. **解压**: 使用 7-Zip 或 WinRAR
4. **运行**: 双击 `start-server.bat`
5. **访问**: http://localhost:5173

### Linux 用户
1. **访问 Releases**: https://github.com/yuguyue888/turing-blog/releases
2. **下载并解压**:
   ```bash
   # 从 Releases 页面下载 tar.gz 文件
   tar -xzf turing-blog-linux-x64.tar.gz
   cd turing-blog
   
   # 启动
   chmod +x start-server.sh
   ./start-server.sh
   ```
3. **访问**: http://localhost:5173

### macOS 用户
1. **访问 Releases**: https://github.com/yuguyue888/turing-blog/releases
2. **下载**: 选择对应版本
   - Intel Mac: `turing-blog-darwin-x64.tar.gz`
   - Apple Silicon (M1/M2/M3): `turing-blog-darwin-arm64.tar.gz`
3. **解压并运行**:
   ```bash
   tar -xzf turing-blog-darwin-*.tar.gz
   cd turing-blog
   chmod +x start-server.sh
   ./start-server.sh
   ```
4. **访问**: http://localhost:5173

---

## 🚀 快速开始

### 环境要求
- Node.js >= 20.19.0 (推荐 22.x)
- npm >= 10.0.0
- 内存: 最低 512MB，推荐 1GB+
- 磁盘: 最低 100MB 可用空间

### 方式1：源码安装（开发者）

#### 安装依赖
```bash
npm install
```

#### 开发模式
```bash
npm run dev
```
访问: http://localhost:5173

#### 生产构建
```bash
npm run build
npm run preview
```

### 方式2：Docker 部署（推荐生产环境）

#### 安装 Docker
- **Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**:
  ```bash
  # Ubuntu/Debian
  curl -fsSL https://get.docker.com | sh
  
  # CentOS/RHEL
  yum install docker-ce docker-ce-cli containerd.io
  systemctl start docker
  ```
- **macOS**: [Docker Desktop](https://www.docker.com/products/docker-desktop)

#### 运行容器
```bash
# 克隆项目
git clone https://github.com/yuguyue888/turing-blog.git
cd turing-blog

# 一键启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

访问: http://localhost:5173

### 方式3：直接下载安装包（普通用户）

详见上方 **📥 安装包下载** 章节

---

## 💻 详细部署指南

### Windows 部署

#### 系统要求
- 操作系统: Windows 10/11 (64位)
- 内存: 最低 512MB
- 磁盘: 最低 100MB
- 浏览器: Chrome/Edge/Firefox 最新版

#### 方式1：安装包部署
1. 下载 `turing-blog-windows-x64.zip`
2. 解压到 `C:\turing-blog\`
3. 双击 `start-server.bat`
4. 浏览器访问 http://localhost:5173

#### 方式2：源码部署
```powershell
# 安装 Node.js (如果没有)
# 下载: https://nodejs.org/
# 选择 LTS 版本 (22.x)

# 克隆项目
git clone https://github.com/yuguyue888/turing-blog.git
cd turing-blog

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm run preview
```

#### 防火墙配置
```powershell
# 开放端口 5173 和 3001
New-NetFirewallRule -DisplayName "Turing Blog" -Direction Inbound -LocalPort 5173,3001 -Protocol TCP -Action Allow
```

---

### Linux 部署

#### 系统要求
- 操作系统: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 内存: 最低 512MB
- 磁盘: 最低 100MB
- 架构: x86_64 (AMD64)

#### 方式1：安装包部署
```bash
# 1. 下载
wget https://github.com/yuguyue888/turing-blog/releases/latest/download/turing-blog-linux-x64.tar.gz

# 2. 解压
tar -xzf turing-blog-linux-x64.tar.gz
cd turing-blog

# 3. 赋予执行权限
chmod +x start-server.sh

# 4. 启动服务
./start-server.sh

# 5. 后台运行（可选）
nohup ./start-server.sh > turing-blog.log 2>&1 &
```

#### 方式2：源码部署
```bash
# 安装 Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 克隆项目
git clone https://github.com/yuguyue888/turing-blog.git
cd turing-blog

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或构建生产版本
npm run build
npm run preview
```

#### 系统服务（systemd）
```bash
# 创建服务文件
sudo nano /etc/systemd/system/turing-blog.service
```

内容：
```ini
[Unit]
Description=Turing Blog Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/turing-blog
ExecStart=/usr/bin/node /opt/turing-blog/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable turing-blog
sudo systemctl start turing-blog
sudo systemctl status turing-blog
```

#### 防火墙配置
```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 5173/tcp
sudo ufw allow 3001/tcp
sudo ufw reload

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

---

### macOS 部署

#### 系统要求
- 操作系统: macOS 11 Big Sur+
- 架构: Intel (x86_64) 或 Apple Silicon (arm64)
- 内存: 最低 512MB

#### 方式1：安装包部署
```bash
# Intel Mac
wget https://github.com/yuguyue888/turing-blog/releases/latest/download/turing-blog-darwin-x64.tar.gz

# Apple Silicon (M1/M2/M3)
wget https://github.com/yuguyue888/turing-blog/releases/latest/download/turing-blog-darwin-arm64.tar.gz

# 解压并运行
tar -xzf turing-blog-darwin-*.tar.gz
cd turing-blog
chmod +x start-server.sh
./start-server.sh
```

#### 方式2：源码部署
```bash
# 安装 Homebrew (如果没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node@22

# 克隆并运行
git clone https://github.com/yuguyue888/turing-blog.git
cd turing-blog
npm install
npm run dev
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
