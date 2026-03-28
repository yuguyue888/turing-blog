#!/bin/bash
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="auto-backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

mkdir -p "${BACKUP_PATH}"
tar -czf "${BACKUP_PATH}/src.tar.gz" src/

echo "timestamp: ${TIMESTAMP}" > "${BACKUP_PATH}/info.txt"
echo "date: $(date '+%Y-%m-%d %H:%M:%S')" >> "${BACKUP_PATH}/info.txt"
echo "reason: $1" >> "${BACKUP_PATH}/info.txt"

echo "✅ 备份完成: ${BACKUP_NAME}"
