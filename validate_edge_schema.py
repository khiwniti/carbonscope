#!/usr/bin/env python3
"""
Validate EDGE V3 RDF Schema

Tests:
1. Schema parses without errors (Turtle syntax)
2. Example data parses and validates
3. All critical fixes are present (C1-C3, I1-I3, M7)
"""

import sys
from rdflib import Graph, Namespace, RDF, RDFS, OWL, XSD
from rdflib.namespace import FOAF

# Define namespaces
EDGE = Namespace("http://edgebuildings.com/ontology#")
TGO = Namespace("http://tgo.or.th/ontology#")

def test_schema_parsing():
    """Test 1: Schema parses without errors"""
    print("Test 1: Parsing EDGE V3 schema...")
    g = Graph()
    try:
        g.parse("/teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna/backend/knowledge_graph/schemas/edge-v3.ttl", format="turtle")
        print(f"✓ Schema parsed successfully ({len(g)} triples)")
        return g
    except Exception as e:
        print(f"✗ FAILED: {e}")
        sys.exit(1)

def test_example_parsing(schema_graph):
    """Test 2: Example data parses and validates"""
    print("\nTest 2: Parsing EDGE V3 example data...")
    g = Graph()

    # Add schema to graph for validation
    for triple in schema_graph:
        g.add(triple)

    try:
        g.parse("/teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna/backend/knowledge_graph/schemas/edge-v3-example.ttl", format="turtle")
        print(f"✓ Example data parsed successfully ({len(g)} triples total)")
        return g
    except Exception as e:
        print(f"✗ FAILED: {e}")
        sys.exit(1)

def test_critical_fixes(g):
    """Test 3: Verify all critical fixes are present"""
    print("\nTest 3: Verifying critical fixes...")

    # C1: Properties should use owl:ObjectProperty or owl:DatatypeProperty
    print("\n  C1: Checking property type declarations...")
    object_props = list(g.subjects(RDF.type, OWL.ObjectProperty))
    datatype_props = list(g.subjects(RDF.type, OWL.DatatypeProperty))

    expected_object_props = [
        EDGE.hasCertification,
        EDGE.hasBuildingType,
        EDGE.hasCarbonAssessment,
        EDGE.hasCarbonBaseline,
        EDGE.hasMaterialUsage,
        EDGE.usesConstructionMaterial,
        EDGE.assessedBy,
        EDGE.verifiedBy,
    ]

    expected_datatype_props = [
        EDGE.projectName,
        EDGE.projectID,
        EDGE.projectLocation,
        EDGE.grossFloorArea,
        EDGE.numberOfFloors,
        EDGE.baselineEmissions,
        EDGE.projectEmissions,
        EDGE.carbonSavings,
        EDGE.carbonSavingsPercentage,
        EDGE.materialQuantity,
        EDGE.materialEmissions,
    ]

    missing_obj = [p for p in expected_object_props if p not in object_props]
    missing_dt = [p for p in expected_datatype_props if p not in datatype_props]

    if missing_obj:
        print(f"  ✗ Missing ObjectProperty declarations: {missing_obj}")
        return False
    if missing_dt:
        print(f"  ✗ Missing DatatypeProperty declarations: {missing_dt}")
        return False

    print(f"  ✓ Found {len(object_props)} ObjectProperties, {len(datatype_props)} DatatypeProperties")

    # C2: Check for inverse properties
    print("\n  C2: Checking inverse property declarations...")
    inverse_props = list(g.subject_objects(OWL.inverseOf))

    if len(inverse_props) < 2:
        print(f"  ✗ Expected at least 2 inverse property declarations, found {len(inverse_props)}")
        return False

    print(f"  ✓ Found {len(inverse_props)} inverse property declarations")

    # C3: Check for well-known instances
    print("\n  C3: Checking well-known certification rule instances...")
    named_individuals = list(g.subjects(RDF.type, OWL.NamedIndividual))

    if EDGE.EDGECertifiedRule not in named_individuals:
        print("  ✗ Missing EDGECertifiedRule named individual")
        return False
    if EDGE.EDGEAdvancedRule not in named_individuals:
        print("  ✗ Missing EDGEAdvancedRule named individual")
        return False

    print(f"  ✓ Found {len(named_individuals)} well-known instances")

    return True

def test_important_fixes(g):
    """Test 4: Verify important fixes are present"""
    print("\nTest 4: Verifying important fixes...")

    # I1: Check for specific XSD datatypes (not rdfs:Literal)
    print("\n  I1: Checking for specific XSD datatype ranges...")

    string_props = list(g.subjects(RDFS.range, XSD.string))
    decimal_props = list(g.subjects(RDFS.range, XSD.decimal))

    if len(string_props) < 3:
        print(f"  ✗ Expected at least 3 xsd:string properties, found {len(string_props)}")
        return False
    if len(decimal_props) < 5:
        print(f"  ✗ Expected at least 5 xsd:decimal properties, found {len(decimal_props)}")
        return False

    print(f"  ✓ Found {len(string_props)} xsd:string and {len(decimal_props)} xsd:decimal properties")

    # I2: Check for cardinality constraints
    print("\n  I2: Checking cardinality constraints...")
    restrictions = list(g.subjects(RDF.type, OWL.Restriction))

    if len(restrictions) < 10:
        print(f"  ✗ Expected at least 10 cardinality restrictions, found {len(restrictions)}")
        return False

    print(f"  ✓ Found {len(restrictions)} cardinality constraints")

    # I3: Check for functional properties
    print("\n  I3: Checking functional property declarations...")
    functional_props = list(g.subjects(RDF.type, OWL.FunctionalProperty))

    if EDGE.projectID not in functional_props:
        print("  ✗ projectID should be functional")
        return False
    if EDGE.projectName not in functional_props:
        print("  ✗ projectName should be functional")
        return False

    print(f"  ✓ Found {len(functional_props)} functional properties")

    return True

def test_material_totals(g):
    """Test 5: Verify material totals are correct (M7 fix)"""
    print("\nTest 5: Verifying material totals...")

    # Query for carbon assessment totals
    from rdflib import Literal
    EX = Namespace("http://example.com/projects#")

    assessment_uri = EX.GreenCondoBKK_CarbonAssessment

    baseline_emissions = g.value(assessment_uri, EDGE.baselineEmissions)
    project_emissions = g.value(assessment_uri, EDGE.projectEmissions)
    carbon_savings = g.value(assessment_uri, EDGE.carbonSavings)
    savings_percentage = g.value(assessment_uri, EDGE.carbonSavingsPercentage)

    if not baseline_emissions:
        print("  ✗ Missing baseline emissions")
        return False
    if not project_emissions:
        print("  ✗ Missing project emissions")
        return False

    # Calculate material totals from example
    baseline_total = 0
    project_total = 0

    from rdflib.namespace import Namespace as NS
    EDGE_NS = Namespace("http://edgebuildings.com/ontology#")

    for usage in g.subjects(RDF.type, EDGE.BaselineMaterialUsage):
        emissions = g.value(usage, EDGE.materialEmissions)
        if emissions:
            baseline_total += float(emissions)

    for usage in g.subjects(RDF.type, EDGE.ProjectMaterialUsage):
        emissions = g.value(usage, EDGE.materialEmissions)
        if emissions:
            project_total += float(emissions)

    print(f"  Baseline materials sum: {baseline_total:,.0f} kgCO2e")
    print(f"  Baseline assessment: {float(baseline_emissions):,.0f} kgCO2e")
    print(f"  Project materials sum: {project_total:,.0f} kgCO2e")
    print(f"  Project assessment: {float(project_emissions):,.0f} kgCO2e")

    # Check if totals match (allow small rounding differences)
    baseline_diff = abs(baseline_total - float(baseline_emissions))
    project_diff = abs(project_total - float(project_emissions))

    if baseline_diff > 1:
        print(f"  ✗ Baseline totals mismatch by {baseline_diff:,.0f} kgCO2e")
        return False
    if project_diff > 1:
        print(f"  ✗ Project totals mismatch by {project_diff:,.0f} kgCO2e")
        return False

    print(f"  ✓ Material totals match assessment ({float(savings_percentage):.1f}% savings)")

    return True

def main():
    print("=" * 60)
    print("EDGE V3 RDF Schema Validation")
    print("=" * 60)

    # Test 1: Parse schema
    schema_graph = test_schema_parsing()

    # Test 2: Parse example
    full_graph = test_example_parsing(schema_graph)

    # Test 3: Critical fixes
    if not test_critical_fixes(full_graph):
        print("\n✗ CRITICAL FIXES FAILED")
        sys.exit(1)

    # Test 4: Important fixes
    if not test_important_fixes(full_graph):
        print("\n✗ IMPORTANT FIXES FAILED")
        sys.exit(1)

    # Test 5: Material totals
    if not test_material_totals(full_graph):
        print("\n✗ MATERIAL TOTALS CHECK FAILED")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED")
    print("=" * 60)
    print(f"\nTotal triples: {len(full_graph)}")
    print("Schema is valid and all fixes are verified.")

    return 0

if __name__ == "__main__":
    sys.exit(main())
