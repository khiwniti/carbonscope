# GraphDB Setup Guide

**Version:** 1.0.0
**Date:** 2026-03-23
**GraphDB Version:** Free 10.7.0
**Target Audience:** Developers new to the BKS cBIM AI Platform

## Overview

This guide provides step-by-step instructions for setting up GraphDB as the knowledge graph backend for the BKS cBIM AI Platform. GraphDB stores and manages:

- **TGO (Thailand Greenhouse Gas Management Organization)** construction material emission factors
- **EDGE (Excellence in Design for Greater Efficiencies)** certification criteria
- **TREES (Thai's Rating of Energy and Environmental Sustainability)** certification criteria

**Estimated Setup Time:** 30 minutes

**Prerequisites:**
- Docker and Docker Compose installed
- 2GB+ RAM available
- 10GB+ disk space
- Basic familiarity with terminal/command line

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation](#installation)
3. [Repository Configuration](#repository-configuration)
4. [RDFLib Integration](#rdflib-integration)
5. [SPARQL Query Examples](#sparql-query-examples)
6. [Performance Best Practices](#performance-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    BKS Backend (FastAPI)                    │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  GraphDB Client │────────▶│  SPARQL Queries  │           │
│  │   (RDFLib 7.6)  │         │     Library      │           │
│  └────────────────┘         └──────────────────┘           │
│          │                                                   │
└──────────┼───────────────────────────────────────────────────┘
           │
           │ HTTP/SPARQL
           ▼
┌─────────────────────────────────────────────────────────────┐
│              GraphDB Free 10.7.0 (Docker)                    │
│                                                              │
│  Repository: carbonbim-thailand                              │
│  Inference: RDFS enabled                                     │
│  Endpoint: http://localhost:7200                             │
│                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐         │
│  │ TGO Data   │  │ EDGE V3     │  │ TREES NC 1.1 │         │
│  │ (Named     │  │ (Named      │  │ (Named       │         │
│  │  Graph)    │  │  Graph)     │  │  Graph)      │         │
│  └────────────┘  └─────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies

- **GraphDB Free 10.7.0:** RDF triple store with RDFS reasoning
- **RDFLib 7.6.0+:** Python library for RDF graph manipulation
- **SPARQLWrapper 2.0.0+:** Python library for SPARQL endpoint communication
- **Docker:** Containerized deployment

---

## Installation

### Step 1: Deploy GraphDB via Docker

GraphDB is already configured in the BKS backend's `docker-compose.yml`. To deploy:

```bash
# Navigate to backend directory
cd backend

# Start GraphDB service
docker-compose up -d graphdb

# Verify GraphDB is running
docker-compose ps graphdb
```

**Expected Output:**
```
NAME            IMAGE                        STATUS
suna-graphdb    ontotext/graphdb:10.7.0      Up 2 minutes (healthy)
```

### Step 2: Wait for GraphDB to Initialize

GraphDB takes 30-60 seconds to fully start:

```bash
# Check GraphDB health
docker-compose logs -f graphdb

# Wait for this message:
# "Started GraphDB 10.7.0 in 34567 ms"
```

Or test the endpoint directly:

```bash
# Should return HTTP 200
curl -f http://localhost:7200/rest/monitor/infrastructure
```

### Step 3: Verify Web UI Access

Open your browser and navigate to:

**URL:** http://localhost:7200

You should see the GraphDB Workbench interface.

### Docker Configuration Details

The GraphDB service is configured in `backend/docker-compose.yml`:

```yaml
graphdb:
  image: ontotext/graphdb:10.7.0
  platform: linux/amd64
  container_name: suna-graphdb
  ports:
    - "127.0.0.1:7200:7200"
  volumes:
    - graphdb_data:/opt/graphdb/home      # Persistent data
    - graphdb_work:/opt/graphdb/work      # Working directory
  environment:
    GDB_JAVA_OPTS: >-
      -Xmx2g                               # Max heap: 2GB
      -Xms2g                               # Min heap: 2GB
      -Ddefault.min.distinct.threshold=100000000
  restart: unless-stopped
  networks:
    - app-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:7200/rest/monitor/infrastructure"]
    interval: 30s
    timeout: 10s
    retries: 5
    start_period: 60s
```

**Important Notes:**
- GraphDB binds to `127.0.0.1:7200` (localhost only) for security
- 2GB heap size is minimum required for production workloads
- Data persists in Docker volumes (`graphdb_data`, `graphdb_work`)
- Health check ensures GraphDB is ready before dependent services start

---

## Repository Configuration

### Step 1: Create the Repository

The repository stores all RDF triples and manages RDFS inference. Create it using the provided setup script:

```bash
# From backend directory
python scripts/setup_graphdb_repository.py
```

**Setup Script Actions:**
1. Checks GraphDB availability
2. Creates `carbonbim-thailand` repository
3. Enables RDFS inference
4. Tests SPARQL endpoint
5. Inserts sample data to verify inference

**Expected Output:**
```
======================================================================
GraphDB Repository Setup - CarbonBIM Thailand
======================================================================
Checking GraphDB availability at http://localhost:7200...
GraphDB is ready!

Creating repository 'carbonbim-thailand'...
✓ Repository 'carbonbim-thailand' created successfully!

Testing SPARQL endpoint...
✓ SPARQL query successful!
  Query returned 0 results
  Variables: ['s', 'p', 'o']

Testing SPARQL UPDATE with sample data...
✓ Sample data inserted successfully!
  Verified 1 material(s) in repository
  - Concrete: 350.5 kgCO2e

======================================================================
✓ GraphDB Repository Setup Complete!
======================================================================
```

### Step 2: Verify Repository Configuration

Check the repository settings via the REST API:

```bash
curl http://localhost:7200/rest/repositories/carbonbim-thailand | jq '.'
```

**Key Configuration Properties:**
- **Repository ID:** `carbonbim-thailand`
- **Type:** GraphDB Free (Sail Repository)
- **Ruleset:** `rdfs` (RDFS inference enabled)
- **Base URL:** `http://carbonbim.thailand/`
- **Context Index:** Enabled (for named graph support)
- **Entity Index Size:** 10,000,000 entities
- **Query Timeout:** 60 seconds

### Repository Features

#### 1. RDFS Inference

Automatic reasoning over RDF Schema semantics:

**Example: Subclass Inference**
```turtle
# Explicit data
ex:Material rdfs:subClassOf ex:BuildingComponent .
ex:Concrete a ex:Material .

# Inferred triple (automatic)
ex:Concrete a ex:BuildingComponent .
```

**Example: Subproperty Inference**
```turtle
# Explicit data
ex:concreteEmissionFactor rdfs:subPropertyOf ex:emissionFactor .
ex:Material1 ex:concreteEmissionFactor "350.5" .

# Inferred triple (automatic)
ex:Material1 ex:emissionFactor "350.5" .
```

#### 2. Named Graph Support

Organize data by version using named graphs:

```turtle
# TGO Data - Version 2024
GRAPH <http://carbonbim.thailand/tgo/2024> {
  ex:Concrete ex:emissionFactor "350.5"^^xsd:decimal .
  ex:Steel ex:emissionFactor "1850.0"^^xsd:decimal .
}

# EDGE V3 Criteria
GRAPH <http://carbonbim.thailand/edge/v3> {
  ex:ResidentialBuilding ex:maxEnergyIntensity "120"^^xsd:decimal .
}

# TREES NC 1.1 Criteria
GRAPH <http://carbonbim.thailand/trees/nc-1.1> {
  ex:EnergyEfficiency ex:requiredPoints "15"^^xsd:integer .
}
```

#### 3. Query Optimization

- **Predicate List Index:** Enabled for efficient property path queries
- **Literal Index:** Enabled for fast string filtering
- **Cache Select Nodes:** Enabled for query plan caching
- **Query Timeout:** 60 seconds (prevents runaway queries)

---

## RDFLib Integration

### Installation

RDFLib dependencies are already included in `backend/pyproject.toml`:

```toml
dependencies = [
    "rdflib>=7.6.0",       # RDF graph manipulation
    "SPARQLWrapper>=2.0.0" # SPARQL endpoint communication
]
```

To install manually:

```bash
cd backend
pip install rdflib>=7.6.0 SPARQLWrapper>=2.0.0
```

### GraphDB Client Usage

The BKS platform provides a high-level GraphDB client in `backend/core/knowledge_graph/graphdb_client.py`.

#### Basic Example

```python
from rdflib import Graph, Namespace, URIRef, Literal
from rdflib.namespace import RDF, RDFS, XSD
from core.knowledge_graph import GraphDBClient

# Initialize client
client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")

# Test connection
client.test_connection()  # Returns True if successful

# Create RDF graph
g = Graph()
ns = Namespace("http://tgo.or.th/materials/")

# Add triples
material = ns.concrete_c30
g.add((material, RDF.type, ns.Material))
g.add((material, RDFS.label, Literal("Concrete C30", lang="en")))
g.add((material, RDFS.label, Literal("คอนกรีต C30", lang="th")))
g.add((material, ns.hasEmissionFactor, Literal(445.6, datatype=XSD.decimal)))
g.add((material, ns.hasUnit, Literal("kgCO2e/m³")))

# Insert into GraphDB
client.insert_triples(g)
print("✓ Triples inserted successfully!")

# Query back
query = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?material ?label ?ef ?unit
WHERE {
    ?material a ?type ;
              rdfs:label ?label ;
              ?efProp ?ef ;
              ?unitProp ?unit .
    FILTER(lang(?label) = "en")
}
"""

results = client.query(query)

# Process results
for binding in results['results']['bindings']:
    print(f"Material: {binding['label']['value']}")
    print(f"Emission Factor: {binding['ef']['value']} {binding['unit']['value']}")
```

#### Named Graphs Example

```python
from core.knowledge_graph import GraphDBClient
from rdflib import Graph, Namespace, Literal, URIRef
from rdflib.namespace import RDF, RDFS, XSD

client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")

# Create graph with TGO materials
g = Graph()
tgo = Namespace("http://tgo.or.th/")

# Add material data
concrete = tgo['materials/concrete-c30']
g.add((concrete, RDF.type, tgo.Material))
g.add((concrete, tgo.hasEmissionFactor, Literal(445.6, datatype=XSD.decimal)))
g.add((concrete, tgo.category, Literal("Concrete")))

# Insert into named graph for versioning
named_graph = "http://tgo.or.th/versions/2024"
client.insert_triples(g, named_graph=named_graph)

# Query from named graph
query = f"""
SELECT ?material ?ef
FROM <{named_graph}>
WHERE {{
    ?material a <http://tgo.or.th/Material> ;
              <http://tgo.or.th/hasEmissionFactor> ?ef .
}}
"""

results = client.query(query)
print(f"Found {len(results['results']['bindings'])} materials in version 2024")
```

#### Error Handling

```python
from core.knowledge_graph import GraphDBClient, GraphDBError

try:
    client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")
    client.test_connection()

    results = client.query("SELECT * WHERE { ?s ?p ?o } LIMIT 10")
    print(f"Query returned {len(results['results']['bindings'])} results")

except GraphDBError as e:
    print(f"GraphDB error: {e}")
    # Handle error (e.g., retry, use cached data, log error)
```

### GraphDB Client API Reference

**File:** `backend/core/knowledge_graph/graphdb_client.py`

#### `GraphDBClient(endpoint_url, username=None, password=None, timeout=30)`

Initialize the GraphDB client.

**Parameters:**
- `endpoint_url` (str): Full URL to GraphDB repository (e.g., `http://localhost:7200/repositories/carbonbim-thailand`)
- `username` (str, optional): Username for authentication
- `password` (str, optional): Password for authentication
- `timeout` (int, optional): Request timeout in seconds (default: 30)

#### `insert_triples(graph, named_graph=None, format="turtle")`

Insert RDF triples into GraphDB.

**Parameters:**
- `graph` (rdflib.Graph): RDFLib Graph containing triples
- `named_graph` (str, optional): Named graph URI for versioning
- `format` (str): Serialization format (turtle, xml, n3, nt, jsonld)

**Returns:** `True` on success

**Raises:** `GraphDBError` on failure

#### `query(query_string, return_format="json")`

Execute a SPARQL SELECT/ASK/CONSTRUCT/DESCRIBE query.

**Parameters:**
- `query_string` (str): SPARQL query
- `return_format` (str): Result format (json, xml, turtle, n3, rdf)

**Returns:** Query results (dict for JSON, string for others)

**Raises:** `GraphDBError` on failure

#### `update(update_string)`

Execute a SPARQL UPDATE operation.

**Parameters:**
- `update_string` (str): SPARQL UPDATE (INSERT, DELETE, etc.)

**Returns:** `True` on success

**Raises:** `GraphDBError` on failure

#### `test_connection()`

Test the connection to GraphDB.

**Returns:** `True` if connection successful

**Raises:** `GraphDBError` on failure

#### `get_triple_count(named_graph=None)`

Get the count of triples in repository or named graph.

**Parameters:**
- `named_graph` (str, optional): Named graph URI

**Returns:** Number of triples (int)

**Raises:** `GraphDBError` on failure

#### `clear_repository(named_graph=None)`

Clear all triples from repository or named graph.

**⚠ WARNING:** This operation is destructive and cannot be undone.

**Parameters:**
- `named_graph` (str, optional): Named graph URI to clear

**Returns:** `True` on success

**Raises:** `GraphDBError` on failure

---

## SPARQL Query Examples

The BKS platform provides a high-level SPARQL query library in `backend/core/knowledge_graph/sparql_queries.py`.

**Full Documentation:** See [SPARQL_QUERIES_GUIDE.md](../backend/core/knowledge_graph/SPARQL_QUERIES_GUIDE.md)

### Import Query Functions

```python
from core.knowledge_graph import (
    GraphDBClient,
    get_emission_factor,
    search_materials,
    list_materials_by_category,
    get_all_categories,
    find_stale_materials,
)

# Initialize client
client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")
```

### 1. Get Material Emission Factor

Retrieve emission factor for a specific material by URI:

```python
# Basic lookup
result = get_emission_factor(client, "http://tgo.or.th/materials/concrete-c30")

print(f"Material: {result['label_en']} ({result['label_th']})")
print(f"Emission Factor: {result['emission_factor']} {result['unit']}")
print(f"Category: {result['category']}")
print(f"Effective Date: {result['effective_date']}")

# Output:
# Material: Ready-mixed Concrete C30 (คอนกรีตผสมเสร็จ C30)
# Emission Factor: 445.6 kgCO2e/m³
# Category: Concrete
# Effective Date: 2026-01-01
```

**With Metadata:**
```python
result = get_emission_factor(
    client,
    "http://tgo.or.th/materials/concrete-c30",
    include_metadata=True
)

print(f"Data Quality: {result['metadata']['data_quality']}")
print(f"Uncertainty: ±{result['metadata']['uncertainty'] * 100}%")
print(f"Source: {result['metadata']['source_document']}")

# Output:
# Data Quality: Verified
# Uncertainty: ±10.0%
# Source: https://thaicarbonlabel.tgo.or.th/...
```

### 2. Search Materials

Full-text search across material names (supports Thai and English):

```python
# Search for concrete materials
results = search_materials(client, "concrete", limit=10)

for material in results:
    print(f"{material['label']}: {material['emission_factor']} {material['unit']}")

# Output:
# Ready-mixed Concrete C30: 445.6 kgCO2e/m³
# Ready-mixed Concrete C25: 410.2 kgCO2e/m³
# Precast Concrete: 380.5 kgCO2e/m³
# ...
```

**Search in Thai:**
```python
results = search_materials(client, "คอนกรีต", language="th", limit=5)
```

**Search with Category Filter:**
```python
steel_rebars = search_materials(
    client,
    "rebar",
    category_filter="Steel",
    limit=10
)
```

### 3. List Materials by Category

Get all materials in a specific category:

```python
# List all concrete materials
concretes = list_materials_by_category(client, "Concrete")

print(f"Found {len(concretes)} concrete materials:")
for material in concretes[:5]:  # Show first 5
    print(f"  - {material['label']}: {material['emission_factor']}")

# Output:
# Found 200 concrete materials:
#   - Concrete C15: 380.2 kgCO2e/m³
#   - Concrete C20: 410.5 kgCO2e/m³
#   - Concrete C25: 430.8 kgCO2e/m³
#   - Concrete C30: 445.6 kgCO2e/m³
#   - Concrete C40: 485.3 kgCO2e/m³
```

**Sort by Emission Factor:**
```python
# Get lowest carbon concrete options
low_carbon = list_materials_by_category(
    client,
    "Concrete",
    sort_by="emission_factor",
    limit=10
)

print("Top 10 lowest carbon concrete options:")
for i, material in enumerate(low_carbon, 1):
    print(f"{i}. {material['label']}: {material['emission_factor']}")
```

### 4. Get All Categories

Retrieve available material categories with counts:

```python
categories = get_all_categories(client)

print("Available material categories:")
for cat in categories:
    print(f"  {cat['category']}: {cat['count']} materials")

# Output:
# Available material categories:
#   Concrete: 200 materials
#   Steel: 100 materials
#   Glass: 75 materials
#   Wood: 50 materials
#   Aluminum: 25 materials
#   ...
```

### 5. Find Stale Materials

Detect materials with outdated emission factors:

```python
# Find materials older than 6 months
stale = find_stale_materials(client, threshold_months=6)

if stale:
    print(f"WARNING: {len(stale)} materials have outdated emission factors")
    for material in stale[:5]:  # Show first 5
        print(f"  - {material['label']} ({material['age_days']} days old)")

# Output:
# WARNING: 15 materials have outdated emission factors
#   - Concrete C20 (273 days old)
#   - Steel Rebar Grade 40 (198 days old)
#   - ...
```

### Raw SPARQL Query Examples

For advanced use cases, you can write raw SPARQL queries:

#### Count Triples in Repository

```python
query = "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
results = client.query(query)

count = results['results']['bindings'][0]['count']['value']
print(f"Total triples: {count}")
```

#### Query with FILTER

```python
query = """
PREFIX tgo: <http://tgo.or.th/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?material ?label ?ef
WHERE {
    ?material a tgo:Material ;
              rdfs:label ?label ;
              tgo:hasEmissionFactor ?ef .
    FILTER(?ef > 500)  # Materials with high emission factors
    FILTER(lang(?label) = "en")
}
ORDER BY DESC(?ef)
LIMIT 20
"""

results = client.query(query)
```

#### Aggregation Query

```python
query = """
PREFIX tgo: <http://tgo.or.th/>

SELECT ?category (AVG(?ef) as ?avg_ef) (COUNT(?material) as ?count)
WHERE {
    ?material a tgo:Material ;
              tgo:category ?category ;
              tgo:hasEmissionFactor ?ef .
}
GROUP BY ?category
ORDER BY DESC(?avg_ef)
"""

results = client.query(query)

for binding in results['results']['bindings']:
    print(f"{binding['category']['value']}: "
          f"avg {binding['avg_ef']['value']} kgCO2e/unit "
          f"({binding['count']['value']} materials)")
```

---

## Performance Best Practices

**Validated Performance:** All metrics tested with 500 materials (realistic production scale)

**Full Analysis:** See [PERFORMANCE_ANALYSIS.md](../backend/core/knowledge_graph/PERFORMANCE_ANALYSIS.md)

### Performance Targets (99th Percentile)

| Query Type | Target | Actual (500 materials) | Status |
|------------|--------|------------------------|--------|
| Exact Match Lookup | <50ms | 18.8ms | ✅ 2.7x faster |
| Category Query | <200ms | 42.4ms | ✅ 4.7x faster |
| Full-text Search | <500ms | 51.8ms | ✅ 9.7x faster |
| Cold Cache Query | <200ms | 8.6ms | ✅ 23.3x faster |

**Key Findings:**
- GraphDB Free 10.7.0 exceeds all performance targets by 2.7x - 23.3x
- Performance improves as dataset grows (excellent index optimization)
- RDFS inference overhead is minimal (<15%)
- No external caching layer needed (Redis/Memcached)

### Optimization Guidelines

#### 1. Use Query Limits

```python
# Good: Limit results for UI display
results = search_materials(client, "concrete", limit=20)

# Avoid: Fetching all results when only showing first 20
results = search_materials(client, "concrete")[:20]  # Fetches everything first
```

#### 2. Filter by Category

```python
# Faster: Search within specific category
concrete_results = search_materials(
    client,
    "C30",
    category_filter="Concrete"  # Narrows search space
)

# Slower: Search all categories
all_results = search_materials(client, "C30")
```

#### 3. Use Decimal Type for Calculations

```python
from decimal import Decimal

result = get_emission_factor(client, material_id)

# Correct: Use Decimal for precision
total_emissions = result['emission_factor'] * Decimal('100.5')

# Wrong: Float loses precision
# total_emissions = float(result['emission_factor']) * 100.5
```

#### 4. Cache Frequently Accessed Data

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_categories(client_url):
    """Cache category list to reduce GraphDB queries."""
    client = GraphDBClient(client_url)
    return get_all_categories(client)

# Categories rarely change, so cache is safe
categories = get_cached_categories("http://localhost:7200/repositories/carbonbim-thailand")
```

#### 5. Batch Queries When Possible

Instead of multiple individual queries:

```python
# Avoid: N separate queries
for material_id in material_ids:
    result = get_emission_factor(client, material_id)
    # Process result...
```

Use a single SPARQL query with VALUES clause:

```python
# Better: Single batched query
material_uris = " ".join([f"<{uri}>" for uri in material_ids])

query = f"""
PREFIX tgo: <http://tgo.or.th/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?material ?label ?ef ?unit
WHERE {{
    VALUES ?material {{ {material_uris} }}
    ?material rdfs:label ?label ;
              tgo:hasEmissionFactor ?ef ;
              tgo:hasUnit ?unit .
    FILTER(lang(?label) = "en")
}}
"""

results = client.query(query)
# Process all results at once
```

### Scalability Projections

Current performance supports:

- **Dataset Size:** 500-10,000 materials
- **Concurrent Users:** 100+ simultaneous queries
- **Daily Query Volume:** 10M+ queries/day
- **API Response Time SLA:** 99th percentile <100ms

**Projected Performance at Scale:**

| Dataset Size | P99 Exact Match | P99 Category | P99 Search |
|--------------|-----------------|--------------|------------|
| 1,000 materials | <30ms | <60ms | <75ms |
| 5,000 materials | <45ms | <90ms | <110ms |
| 10,000 materials | <60ms | <120ms | <150ms |

**Conclusion:** Current configuration is production-ready for 500-10,000 materials without optimization.

---

## Troubleshooting

### GraphDB Container Won't Start

**Symptoms:**
- `docker-compose up -d graphdb` fails
- Container exits immediately
- Health check fails

**Solutions:**

1. **Check Docker Resources:**
   ```bash
   # Ensure Docker has 2GB+ RAM allocated
   docker stats

   # Check Docker Desktop settings (Mac/Windows)
   # Docker Desktop → Preferences → Resources → Memory: 4GB minimum
   ```

2. **Check Port Conflicts:**
   ```bash
   # Ensure port 7200 is not in use
   lsof -i :7200  # Mac/Linux
   netstat -ano | findstr :7200  # Windows

   # If in use, stop conflicting process or change port in docker-compose.yml
   ```

3. **Check Disk Space:**
   ```bash
   # Ensure 10GB+ available
   df -h

   # Clean up old Docker volumes if needed
   docker volume prune
   ```

4. **View Container Logs:**
   ```bash
   docker-compose logs graphdb

   # Look for errors like:
   # - "OutOfMemoryError" → Increase heap size
   # - "Permission denied" → Check volume permissions
   # - "Address already in use" → Port conflict
   ```

### Repository Not Found

**Symptoms:**
- `GraphDBError: Repository 'carbonbim-thailand' not found`
- SPARQL queries fail with 404

**Solutions:**

1. **Verify Repository Exists:**
   ```bash
   curl http://localhost:7200/rest/repositories | jq '.'

   # Should list 'carbonbim-thailand' in results
   ```

2. **Recreate Repository:**
   ```bash
   cd backend
   python scripts/setup_graphdb_repository.py
   ```

3. **Manual Creation via Web UI:**
   - Navigate to http://localhost:7200
   - Click "Setup" → "Repositories" → "Create new repository"
   - Use settings from `setup_graphdb_repository.py`

### RDFS Inference Not Working

**Symptoms:**
- Inferred triples not returned in queries
- Subclass queries return empty results

**Solutions:**

1. **Check Ruleset Configuration:**
   ```bash
   curl http://localhost:7200/rest/repositories/carbonbim-thailand | jq '.params[] | select(.name == "ruleset")'

   # Should return: {"name": "ruleset", "value": "rdfs"}
   ```

2. **Verify Inference is Enabled:**
   ```python
   from core.knowledge_graph import GraphDBClient

   client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")

   # Insert test data
   update = """
   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
   PREFIX ex: <http://example.org/>

   INSERT DATA {
       ex:Material rdfs:subClassOf ex:BuildingComponent .
       ex:Concrete a ex:Material .
   }
   """
   client.update(update)

   # Query inferred triple
   query = """
   PREFIX ex: <http://example.org/>
   SELECT ?type WHERE { ex:Concrete a ?type }
   """
   results = client.query(query)

   # Should return both ex:Material AND ex:BuildingComponent
   types = [b['type']['value'] for b in results['results']['bindings']]
   assert 'http://example.org/Material' in types
   assert 'http://example.org/BuildingComponent' in types  # Inferred!
   ```

3. **If Still Not Working:** Recreate repository with correct ruleset

### Connection Refused / Timeout

**Symptoms:**
- `requests.exceptions.ConnectionError: Connection refused`
- `GraphDBError: Timeout connecting to GraphDB`

**Solutions:**

1. **Wait for GraphDB Startup:**
   ```bash
   # GraphDB takes 30-60 seconds to start
   docker-compose logs -f graphdb | grep "Started GraphDB"

   # Or use health check
   docker-compose ps graphdb
   # Wait for "(healthy)" status
   ```

2. **Check GraphDB is Running:**
   ```bash
   docker-compose ps graphdb

   # Should show "Up" status
   # If "Exited", check logs: docker-compose logs graphdb
   ```

3. **Test Direct Connection:**
   ```bash
   # Should return HTTP 200
   curl -v http://localhost:7200/rest/monitor/infrastructure

   # If fails, GraphDB is not running properly
   ```

### Out of Memory Errors

**Symptoms:**
- `java.lang.OutOfMemoryError` in logs
- GraphDB crashes under load
- Slow query performance

**Solutions:**

1. **Increase Heap Size:**

   Edit `backend/docker-compose.yml`:
   ```yaml
   graphdb:
     environment:
       GDB_JAVA_OPTS: >-
         -Xmx4g     # Increase from 2g to 4g
         -Xms4g
   ```

   Then restart:
   ```bash
   docker-compose down graphdb
   docker-compose up -d graphdb
   ```

2. **Monitor Memory Usage:**
   ```bash
   # Check GraphDB memory
   docker stats suna-graphdb

   # Check JVM heap usage via GraphDB UI
   # http://localhost:7200 → System → Resources
   ```

3. **For Large Datasets (>10,000 materials):**
   - Increase heap to 8GB+
   - Enable query result pagination
   - Consider GraphDB Standard (commercial) for better memory management

### Slow Query Performance

**Symptoms:**
- Queries take >1 second
- Timeouts on complex queries

**Solutions:**

1. **Check Dataset Size:**
   ```python
   from core.knowledge_graph import GraphDBClient

   client = GraphDBClient("http://localhost:7200/repositories/carbonbim-thailand")
   count = client.get_triple_count()
   print(f"Total triples: {count}")

   # <10,000 triples: Should be fast (<100ms)
   # >100,000 triples: May need optimization
   ```

2. **Analyze Query Plan:**

   Use GraphDB Workbench:
   - Navigate to http://localhost:7200/sparql
   - Select `carbonbim-thailand` repository
   - Click "Explain" instead of "Run" to see query plan
   - Look for full table scans or missing indexes

3. **Optimize Query:**

   **Bad:**
   ```sparql
   SELECT ?s ?p ?o
   WHERE {
       ?s ?p ?o .
       FILTER(CONTAINS(?o, "concrete"))  # Scans all triples
   }
   ```

   **Good:**
   ```sparql
   SELECT ?s ?label ?ef
   WHERE {
       ?s a tgo:Material ;        # Filter by type first
          rdfs:label ?label ;
          tgo:hasEmissionFactor ?ef .
       FILTER(CONTAINS(?label, "concrete"))  # Then filter labels
   }
   ```

4. **Use Appropriate Indexes:**

   GraphDB automatically indexes:
   - Subject-Predicate-Object (SPO)
   - Predicate-Object-Subject (POS)
   - Object-Subject-Predicate (OSP)

   Structure queries to use these indexes effectively.

### Data Not Persisting After Restart

**Symptoms:**
- GraphDB restarts with empty repository
- Previously inserted data is gone

**Solutions:**

1. **Check Docker Volumes:**
   ```bash
   docker volume ls | grep graphdb

   # Should show:
   # backend_graphdb_data
   # backend_graphdb_work
   ```

2. **Verify Volume Mounts:**
   ```bash
   docker inspect suna-graphdb | jq '.[0].Mounts'

   # Should show volumes mounted to:
   # - /opt/graphdb/home
   # - /opt/graphdb/work
   ```

3. **If Volumes Missing:** Recreate with correct configuration:
   ```bash
   docker-compose down
   docker-compose up -d graphdb
   cd backend
   python scripts/setup_graphdb_repository.py
   ```

---

## Production Deployment

### Security Considerations

#### 1. Enable Authentication

GraphDB Free supports basic authentication. Configure in `docker-compose.yml`:

```yaml
graphdb:
  environment:
    GDB_JAVA_OPTS: >-
      -Xmx4g
      -Xms4g
      -Dgraphdb.auth.enabled=true
```

Create admin user via GraphDB Workbench:
- Navigate to http://localhost:7200
- Setup → Users and Access → Create user
- Set username/password
- Grant repository access

Update client code:

```python
client = GraphDBClient(
    "http://localhost:7200/repositories/carbonbim-thailand",
    username="admin",
    password="your-secure-password"
)
```

#### 2. Network Security

**Development:** Bind to localhost only (already configured)
```yaml
ports:
  - "127.0.0.1:7200:7200"  # Only accessible from host machine
```

**Production:** Use internal Docker network
```yaml
# Remove port mapping - only accessible within Docker network
# ports:
#   - "127.0.0.1:7200:7200"

# Access via service name from other containers
# http://graphdb:7200/repositories/carbonbim-thailand
```

#### 3. HTTPS/TLS

For production, place GraphDB behind a reverse proxy (nginx, Traefik):

```nginx
server {
    listen 443 ssl;
    server_name graphdb.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://graphdb:7200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backup Strategy

#### 1. Docker Volume Backup

```bash
# Stop GraphDB
docker-compose stop graphdb

# Backup volumes
docker run --rm \
  -v backend_graphdb_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/graphdb_data_$(date +%Y%m%d).tar.gz /data

docker run --rm \
  -v backend_graphdb_work:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/graphdb_work_$(date +%Y%m%d).tar.gz /data

# Restart GraphDB
docker-compose start graphdb
```

#### 2. Repository Export (RDF Format)

```bash
# Export entire repository to TriG format
curl -G http://localhost:7200/repositories/carbonbim-thailand/statements \
  -H "Accept: application/x-trig" \
  > backups/carbonbim-thailand_$(date +%Y%m%d).trig

# Compressed export
curl -G http://localhost:7200/repositories/carbonbim-thailand/statements \
  -H "Accept: application/x-trig" \
  | gzip > backups/carbonbim-thailand_$(date +%Y%m%d).trig.gz
```

#### 3. Automated Backup (cron job)

```bash
# Create backup script: backup_graphdb.sh
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Export repository
curl -G http://localhost:7200/repositories/carbonbim-thailand/statements \
  -H "Accept: application/x-trig" \
  | gzip > "$BACKUP_DIR/carbonbim_$DATE.trig.gz"

# Keep only last 30 days
find "$BACKUP_DIR" -name "carbonbim_*.trig.gz" -mtime +30 -delete

# Add to crontab
# crontab -e
# 0 2 * * * /path/to/backup_graphdb.sh  # Daily at 2am
```

### Restore Procedure

#### 1. Restore from Volume Backup

```bash
# Stop GraphDB
docker-compose stop graphdb

# Restore volumes
docker run --rm \
  -v backend_graphdb_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/graphdb_data_20260323.tar.gz -C /

# Restart GraphDB
docker-compose start graphdb
```

#### 2. Restore from RDF Export

```bash
# Clear existing data (optional)
curl -X DELETE http://localhost:7200/repositories/carbonbim-thailand/statements

# Import backup
curl -X POST http://localhost:7200/repositories/carbonbim-thailand/statements \
  -H "Content-Type: application/x-trig" \
  --data-binary @backups/carbonbim-thailand_20260323.trig
```

### Monitoring

#### 1. Health Checks

```bash
# Check GraphDB infrastructure
curl http://localhost:7200/rest/monitor/infrastructure

# Check repository statistics
curl http://localhost:7200/rest/monitor/repository/carbonbim-thailand
```

#### 2. Metrics to Track

- **Query Response Time:** P50, P95, P99
- **Query Volume:** Queries per minute
- **Memory Usage:** JVM heap usage
- **Disk Usage:** Repository size growth
- **Error Rate:** Failed queries / total queries

#### 3. Logging

GraphDB logs are available via Docker:

```bash
# View logs
docker-compose logs -f graphdb

# Export logs for analysis
docker-compose logs graphdb > graphdb_$(date +%Y%m%d).log
```

Configure log level in `docker-compose.yml`:

```yaml
graphdb:
  environment:
    GDB_JAVA_OPTS: >-
      -Xmx4g
      -Xms4g
      -Dlog4j.logger.com.ontotext.trree=DEBUG  # Debug logging
```

### High Availability

For production deployments requiring high availability:

1. **GraphDB Cluster:** Requires GraphDB Enterprise (commercial)
2. **Load Balancing:** Multiple read-only replicas behind load balancer
3. **Failover:** Automated failover with health checks
4. **Backup Replicas:** Hot standby instances with continuous replication

**Note:** GraphDB Free does not support clustering. For HA, consider upgrading to GraphDB Standard or Enterprise.

---

## Next Steps

After completing the GraphDB setup:

1. **Load TGO Emission Factors**
   - Design TGO RDF ontology schema
   - Obtain TGO data (API, web scraping, or manual entry)
   - Load data into named graph `<http://tgo.or.th/versions/YYYY>`

2. **Load EDGE/TREES Certification Criteria**
   - Design EDGE V3 RDF schema → `<http://carbonbim.thailand/edge/v3>`
   - Design TREES NC 1.1 RDF schema → `<http://carbonbim.thailand/trees/nc-1.1>`

3. **Integrate with BKS Backend**
   - Use SPARQL query library for material lookups
   - Implement carbon calculation workflows
   - Add GraphDB health checks to `/v1/health` endpoint

4. **Performance Testing**
   - Run performance tests with realistic data volumes
   - Validate <500ms query targets
   - Optimize slow queries

5. **Production Hardening**
   - Enable authentication
   - Set up automated backups
   - Configure monitoring and alerting
   - Document disaster recovery procedures

---

## Additional Resources

### Documentation

- **GraphDB Client:** [backend/core/knowledge_graph/README.md](../backend/core/knowledge_graph/README.md)
- **SPARQL Query Library:** [backend/core/knowledge_graph/SPARQL_QUERIES_GUIDE.md](../backend/core/knowledge_graph/SPARQL_QUERIES_GUIDE.md)
- **Performance Analysis:** [backend/core/knowledge_graph/PERFORMANCE_ANALYSIS.md](../backend/core/knowledge_graph/PERFORMANCE_ANALYSIS.md)
- **Repository Setup:** [backend/scripts/graphdb_setup_README.md](../backend/scripts/graphdb_setup_README.md)

### Official Documentation

- [GraphDB Documentation](https://graphdb.ontotext.com/documentation/10.7/)
- [RDFLib Documentation](https://rdflib.readthedocs.io/)
- [SPARQL 1.1 Query Language](https://www.w3.org/TR/sparql11-query/)
- [SPARQL 1.1 Update](https://www.w3.org/TR/sparql11-update/)
- [RDF Schema (RDFS)](https://www.w3.org/TR/rdf-schema/)
- [RDF4J REST API](https://rdf4j.org/documentation/reference/rest-api/)

### Example Code

- **Basic Usage:** [backend/core/knowledge_graph/example_usage.py](../backend/core/knowledge_graph/example_usage.py)
- **SPARQL Queries:** [backend/core/knowledge_graph/example_usage_sparql.py](../backend/core/knowledge_graph/example_usage_sparql.py)
- **Performance Tests:** [backend/core/knowledge_graph/graphdb_performance_tests.py](../backend/core/knowledge_graph/graphdb_performance_tests.py)
- **TGO Proof of Concept:** [backend/core/knowledge_graph/tgo_poc.py](../backend/core/knowledge_graph/tgo_poc.py)

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [SPARQL_QUERIES_GUIDE.md](../backend/core/knowledge_graph/SPARQL_QUERIES_GUIDE.md)
3. Consult the [GraphDB Documentation](https://graphdb.ontotext.com/documentation/10.7/)
4. Contact the BKS cBIM AI Platform development team

---

**Document Version:** 1.0.0
**Last Updated:** 2026-03-23
**Maintainer:** BKS cBIM AI Platform Team
