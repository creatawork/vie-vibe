#!/bin/bash
set -e
cd /e/VIE
git add deploy .github
TREE=$(git write-tree)
PARENT=$(git rev-parse HEAD)
NEW=$(git commit-tree "$TREE" -p "$PARENT" -m "feat(deploy): app/mysql 容器、/api 反代与 CI 双 job 发布")
git reset --hard "$NEW"
echo "Committed: $NEW"
git log -1 --format="%B"
