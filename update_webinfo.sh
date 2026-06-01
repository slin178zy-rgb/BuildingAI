#!/bin/bash
echo "=== 查看当前 webinfo 配置 ==="
docker exec buildingai-postgres psql -U postgres -d buildingai << 'EOF'
SELECT key, value FROM dict WHERE "group" = 'webinfo';
EOF

echo ""
echo "=== 更新网站名称为 remiopen.com ==="
docker exec buildingai-postgres psql -U postgres -d buildingai << 'EOF'
INSERT INTO dict ("group", key, value, description, sort, is_enabled)
VALUES ('webinfo', 'name', 'remiopen.com', '网站名称', 1, true)
ON CONFLICT ("group", key) DO UPDATE SET value = EXCLUDED.value;
EOF

echo ""
echo "=== 更新后 ==="
docker exec buildingai-postgres psql -U postgres -d buildingai << 'EOF'
SELECT key, value FROM dict WHERE "group" = 'webinfo';
EOF
