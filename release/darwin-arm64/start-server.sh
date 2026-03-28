#!/bin/bash
# 图灵花园 - macOS 启动脚本

echo "🚀 启动图灵花园..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 20+"
    echo "使用 Homebrew 安装: brew install node@22"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install --production
fi

# 启动服务
echo "✅ 启动服务器..."
node server.js &

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 服务已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 访问地址: http://localhost:5173"
echo "📊 后台管理: http://localhost:5173/#/admin"
echo ""
