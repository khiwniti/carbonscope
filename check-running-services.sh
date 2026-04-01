#!/bin/bash
set -e

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "🔍 Checking ALL Running Services on VM"
echo "======================================="
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'CHECKALL'

echo "=== All Running Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "=== Port 3000 Listeners ==="
netstat -tulpn 2>/dev/null | grep :3000 || ss -tulpn | grep :3000

echo ""
echo "=== Port 80/443 Listeners ==="
netstat -tulpn 2>/dev/null | grep -E ':(80|443)' || ss -tulpn | grep -E ':(80|443)'

echo ""
echo "=== Nginx/Caddy/Traefik Check ==="
docker ps | grep -E 'nginx|caddy|traefik' || echo "No reverse proxy containers found"
systemctl status nginx 2>&1 | head -5 || echo "Nginx service not found"
systemctl status caddy 2>&1 | head -5 || echo "Caddy service not found"

echo ""
echo "=== Check for Multiple Docker Compose Projects ==="
find / -name "docker-compose*.yml" -type f 2>/dev/null | head -20

CHECKALL
) --query "value[0].message" -o tsv
