#!/bin/bash
echo "=== 验证数据库配置 ==="
docker exec buildingai-postgres psql -U postgres -d buildingai << 'EOF'
SELECT key, value FROM dict WHERE "group" = 'webinfo';
EOF

echo ""
echo "=== 重启后端服务 ==="
cd /opt/buildingai && docker compose up -d --no-deps nodejs

echo ""
echo "=== 等待服务重启 ==="
sleep 10

echo ""
echo "=== 检查服务状态 ==="
docker exec buildingai-nodejs pm2 list
