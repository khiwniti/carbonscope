#!/bin/bash
# =============================================================================
# Initialize GraphDB Repository via Azure CLI
# =============================================================================

RESOURCE_GROUP="DSC-TEAM"
VM_NAME="coder-vm"

echo "📊 Initializing GraphDB repository..."
echo ""

az vm run-command invoke \
  --resource-group ${RESOURCE_GROUP} \
  --name ${VM_NAME} \
  --command-id RunShellScript \
  --scripts @<(cat << 'INITGRAPHDB'
#!/bin/bash

# Create carbonbim-thailand repository
curl -X POST http://localhost:7200/rest/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "id": "carbonbim-thailand",
    "title": "SUNA Carbon BIM Thailand",
    "ruleset": "rdfsplus-optimized",
    "params": {
      "defaultNS": {
        "value": "http://carbonbim.ai/ontology/"
      }
    }
  }'

echo ""
echo "Verifying repository..."
curl http://localhost:7200/rest/repositories

INITGRAPHDB
) --query "value[0].message" -o tsv

echo ""
echo "✅ GraphDB initialized!"
echo ""
echo "🌐 Access GraphDB Workbench at:"
echo "   http://20.55.21.69:7200"
echo ""
