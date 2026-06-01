#!/bin/bash
docker exec buildingai-postgres psql -U postgres -d buildingai << 'EOF'
SELECT key, value FROM dict WHERE "group" = 'webinfo';
EOF
