@echo off
chcp 65001 >nul
echo 🚀 启动图灵花园...
echo.

REM 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js 20+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install --production
)

REM 启动服务
echo ✅ 启动服务器...
start /b node server.js

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ 服务已启动！
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🌐 访问地址: http://localhost:5173
echo 📊 后台管理: http://localhost:5173/#/admin
echo.
echo 按任意键打开浏览器...
pause >nul
start http://localhost:5173
