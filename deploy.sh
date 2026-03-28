#!/bin/bash

# 图灵花园 - Docker 一键部署脚本

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  图灵花园 - Docker 部署"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down 2>/dev/null

# 构建镜像
echo ""
echo "📦 构建 Docker 镜像..."
docker-compose build

# 启动服务
echo ""
echo "🚀 启动服务..."
docker-compose up -d

# 等待启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查状态
echo ""
echo "📊 服务状态:"
docker-compose ps

# 健康检查
echo ""
echo "🏥 健康检查..."
sleep 3

if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ 前端服务正常"
else
    echo "⚠️  前端服务启动中..."
fi

if curl -s http://localhost:3001/api > /dev/null; then
    echo "✅ 后端服务正常"
else
    echo "⚠️  后端服务启动中..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 访问地址:"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:3001/api"
echo ""
echo "📊 管理命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
