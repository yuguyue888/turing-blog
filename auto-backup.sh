#!/bin/bash
# 自动备份脚本 - 每次修改前自动执行

BACKUP_DIR="/root/.openclaw/workspace/turing-blog/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="auto-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# 创建备份目录
mkdir -p "${BACKUP_PATH}"

# 备份源代码
tar -czf "${BACKUP_PATH}/src.tar.gz" src/

# 记录备份信息
cat > "${BACKUP_PATH}/info.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "date": "$(date '+%Y-%m-%d %H:%M:%S')",
  "reason": "${1:-手动备份}",
  "backup_type": "auto"
}
