#!/bin/bash
# 云服务器阶段二部署脚本
# 在服务器上执行：bash server-setup.sh

set -e

echo "=== 阶段二：SpringBoot 统计 API + MySQL 部署 ==="
echo ""

# 1. 拉取最新代码
echo "[1/6] 拉取最新代码..."
cd /opt/vie/app
git pull origin main

# 2. 检查 .env 是否存在
echo "[2/6] 检查环境变量..."
cd /opt/vie/app/deploy
if [ ! -f .env ]; then
    echo "错误：.env 文件不存在，请先创建"
    echo "参考 .env.example 创建："
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# 3. 生成随机密码（如果还没设置）
echo "[3/6] 检查密码配置..."
if grep -q "改为强随机串" .env; then
    echo "生成随机密码..."
    MYSQL_PASS=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    STATS_KEY=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
    IP_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)

    sed -i "s/MYSQL_PASSWORD=.*/MYSQL_PASSWORD=$MYSQL_PASS/" .env
    sed -i "s/STATS_KEY=.*/STATS_KEY=$STATS_KEY/" .env
    sed -i "s/IP_SECRET=.*/IP_SECRET=$IP_SECRET/" .env

    echo "已生成随机密码并写入 .env"
    echo ""
    echo "=== 重要：请记录以下密码 ==="
    echo "STATS_KEY（统计页口令）: $STATS_KEY"
    echo ""
else
    echo "密码已配置"
fi

# 4. 检查 GitHub Actions 是否已上传 server.jar
echo "[4/6] 检查 server.jar..."
if [ ! -f server.jar ]; then
    echo "server.jar 不存在，等待 GitHub Actions 上传..."
    echo "请确保最近 push 已触发 Actions，或手动上传："
    echo "  scp server/target/server.jar user@server:/opt/vie/app/deploy/"
    echo ""
    echo "按 Enter 继续（假设 jar 已上传），或 Ctrl+C 取消..."
    read -r
fi

# 5. 启动服务
echo "[5/6] 启动 Docker 服务..."
docker compose up -d

# 6. 验证
echo "[6/6] 验证服务..."
sleep 5

echo ""
echo "=== 服务状态 ==="
docker compose ps

echo ""
echo "=== 测试接口 ==="
echo "测试 /api/track:"
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost/api/track \
    -H 'Content-Type: application/json' \
    -d '{"path":"/test","referrer":""}' || echo "  (如果显示 000，可能是 Caddy 还没准备好，等 30 秒再试)"

echo ""
echo ""
echo "测试 /api/stats/summary（需要 STATS_KEY）:"
echo "  curl 'http://localhost/api/stats/summary?key=你的STATS_KEY'"

echo ""
echo "=== 部署完成 ==="
echo "网站: https://$(grep DOMAIN .env | cut -d= -f2)"
echo "统计页: https://$(grep DOMAIN .env | cut -d= -f2)/stats-view"
