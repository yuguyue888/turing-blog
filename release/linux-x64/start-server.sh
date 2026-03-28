#!/bin/bash
# 图灵花园 - Linux 启动脚本

echo "🚀 启动图灵花园..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 20+"
    echo "Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "CentOS/RHEL: curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash - && sudo yum install -y nodejs"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install --production
fi

# 启动服务
echo "✅ 启动服务器..."
nohup node server.js > turing-blog.log 2>&1 &

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 服务已启动！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 访问地址: http://localhost:5173"
echo "📊 后台管理: http://localhost:5173/#/admin"
echo "📝 日志文件: turing-blog.log"
echo ""
echo "停止服务: kill \$(cat turing-blog.pid)"
echo "查看日志: tail -f turing-blog.log"
echo ""
