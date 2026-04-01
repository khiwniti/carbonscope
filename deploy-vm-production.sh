#!/bin/bash
set -e

# =============================================================================
# SUNA Production VM Deployment
# =============================================================================
# Deploys all services (Frontend, Backend, Redis, GraphDB) on a single Azure VM
# with Docker Compose for better scalability and cost efficiency
# =============================================================================

RESOURCE_GROUP="carbon-bim-rg"
LOCATION="southeastasia"
VM_NAME="suna-production-vm"
VM_SIZE="Standard_D4s_v3"  # 4 vCPUs, 16GB RAM - adjust as needed
VM_IMAGE="Ubuntu2204"
ADMIN_USERNAME="azureuser"

# Disk configuration
OS_DISK_SIZE=128  # GB
DATA_DISK_SIZE=256  # GB for GraphDB and Redis data

echo "🚀 SUNA Production VM Deployment"
echo "=================================="
echo ""
echo "Configuration:"
echo "  VM Name: ${VM_NAME}"
echo "  VM Size: ${VM_SIZE}"
echo "  Location: ${LOCATION}"
echo "  OS Disk: ${OS_DISK_SIZE} GB"
echo "  Data Disk: ${DATA_DISK_SIZE} GB"
echo ""

# Check if SSH key exists
SSH_KEY_PATH="$HOME/.ssh/id_rsa.pub"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH public key not found at ${SSH_KEY_PATH}"
    echo "Generate one with: ssh-keygen -t rsa -b 4096"
    exit 1
fi

# Create VM
echo "1️⃣  Creating Azure VM..."
az vm create \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --location ${LOCATION} \
  --size ${VM_SIZE} \
  --image ${VM_IMAGE} \
  --admin-username ${ADMIN_USERNAME} \
  --ssh-key-values @${SSH_KEY_PATH} \
  --public-ip-sku Standard \
  --os-disk-size-gb ${OS_DISK_SIZE} \
  --storage-sku Premium_LRS \
  --nic-delete-option Delete \
  --os-disk-delete-option Delete \
  --data-disk-delete-option Delete

# Get VM IP
VM_IP=$(az vm show \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --show-details \
  --query publicIps -o tsv)

echo "✅ VM created with IP: ${VM_IP}"
echo ""

# Create and attach data disk for persistent storage
echo "2️⃣  Creating data disk for GraphDB and Redis..."
az vm disk attach \
  --resource-group ${RESOURCE_GROUP} \
  --vm-name ${VM_NAME} \
  --name ${VM_NAME}-data \
  --new \
  --size-gb ${DATA_DISK_SIZE} \
  --sku Premium_LRS

echo "✅ Data disk attached"
echo ""

# Open ports
echo "3️⃣  Configuring firewall (NSG rules)..."
az vm open-port \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --port 80 \
  --priority 1000

az vm open-port \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --port 443 \
  --priority 1001

az vm open-port \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --port 3000 \
  --priority 1002

az vm open-port \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --port 8000 \
  --priority 1003

echo "✅ Ports opened: 80, 443, 3000, 8000"
echo ""

# Install Docker and dependencies
echo "4️⃣  Installing Docker and dependencies on VM..."
az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'EOF'
#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker azureuser

# Install Docker Compose V2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Setup data disk
DATA_DISK="/dev/sdc"
if [ -b "$DATA_DISK" ]; then
    # Format if not already formatted
    if ! blkid $DATA_DISK; then
        mkfs.ext4 $DATA_DISK
    fi

    # Mount data disk
    mkdir -p /mnt/data
    mount $DATA_DISK /mnt/data

    # Add to fstab for persistence
    UUID=$(blkid -s UUID -o value $DATA_DISK)
    echo "UUID=${UUID} /mnt/data ext4 defaults,nofail 0 2" >> /etc/fstab

    # Create directories for services
    mkdir -p /mnt/data/redis
    mkdir -p /mnt/data/graphdb/home
    mkdir -p /mnt/data/graphdb/work
    mkdir -p /mnt/data/logs

    chown -R azureuser:azureuser /mnt/data
fi

# Install additional tools
apt-get install -y git curl wget unzip jq

echo "✅ Docker and dependencies installed successfully"
EOF
)

echo "✅ Docker installed"
echo ""

# Save VM connection info
cat > vm-connection-info.txt << EOF
# SUNA Production VM Connection Info
# ===================================

VM Name: ${VM_NAME}
VM IP: ${VM_IP}
SSH User: ${ADMIN_USERNAME}

# SSH Connection
ssh ${ADMIN_USERNAME}@${VM_IP}

# Copy files to VM
scp -r ./suna ${ADMIN_USERNAME}@${VM_IP}:~/
scp ./docker-compose.production.yml ${ADMIN_USERNAME}@${VM_IP}:~/suna/

# VM Management
# View VM status
az vm show --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --show-details

# Stop VM
az vm stop --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}

# Start VM
az vm start --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}

# Restart VM
az vm restart --resource-group ${RESOURCE_GROUP} --name ${VM_NAME}

# Delete VM
az vm delete --resource-group ${RESOURCE_GROUP} --name ${VM_NAME} --yes

# Get VM sizes for scaling
az vm list-sizes --location ${LOCATION} --output table
EOF

echo ""
echo "✅ VM Deployment Complete!"
echo ""
echo "📋 VM Information:"
echo "   Name: ${VM_NAME}"
echo "   IP: ${VM_IP}"
echo "   SSH: ssh ${ADMIN_USERNAME}@${VM_IP}"
echo ""
echo "📝 Connection info saved to: vm-connection-info.txt"
echo ""
echo "🎯 Next steps:"
echo "   1. Run: ./setup-vm-docker-compose.sh ${VM_IP}"
echo "   2. This will:"
echo "      - Copy your code to the VM"
echo "      - Configure environment variables"
echo "      - Start all services with Docker Compose"
echo ""
echo "💡 Or manually:"
echo "   ssh ${ADMIN_USERNAME}@${VM_IP}"
echo "   # Then follow DEPLOYMENT_GUIDE.md on the VM"
