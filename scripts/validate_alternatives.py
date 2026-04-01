#!/usr/bin/env python3
"""CLI tool for alternative recommendation validation.

Generates material alternative recommendations for domain expert review and validation.
Produces a JSON file with recommendations for consultant evaluation.

Usage:
    python scripts/validate_alternatives.py --materials 20 --output recommendations.json
    python scripts/validate_alternatives.py --help
"""

import asyncio
import argparse
import json
import sys
from decimal import Decimal
from pathlib import Path
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def get_test_materials(num_materials: int) -> List[Dict[str, Any]]:
    """Generate test material dataset for recommendation validation.

    Creates a diverse set of materials across different categories,
    building types, and quantity ranges to ensure thorough validation.

    Args:
        num_materials: Number of test materials to generate

    Returns:
        List of material dictionaries with id, quantity, building_type
    """
    # Material database with realistic quantities and contexts
    material_templates = [
        # Concrete materials
        {"id": "tgo:concrete_c30", "quantity_range": (50, 500), "unit": "m3", "category": "concrete"},
        {"id": "tgo:concrete_c40", "quantity_range": (30, 300), "unit": "m3", "category": "concrete"},
        {"id": "tgo:concrete_foundation", "quantity_range": (100, 800), "unit": "m3", "category": "concrete"},

        # Steel materials
        {"id": "tgo:steel_rebar", "quantity_range": (10, 100), "unit": "ton", "category": "steel"},
        {"id": "tgo:steel_structural", "quantity_range": (5, 50), "unit": "ton", "category": "steel"},
        {"id": "tgo:steel_sheet", "quantity_range": (2, 20), "unit": "ton", "category": "steel"},

        # Aluminum materials
        {"id": "tgo:aluminum_window_frame", "quantity_range": (100, 1000), "unit": "kg", "category": "aluminum"},
        {"id": "tgo:aluminum_curtain_wall", "quantity_range": (500, 3000), "unit": "kg", "category": "aluminum"},
        {"id": "tgo:aluminum_cladding", "quantity_range": (200, 2000), "unit": "kg", "category": "aluminum"},

        # Glass materials
        {"id": "tgo:glass_tempered", "quantity_range": (100, 800), "unit": "m2", "category": "glass"},
        {"id": "tgo:glass_laminated", "quantity_range": (50, 500), "unit": "m2", "category": "glass"},
        {"id": "tgo:glass_low_e", "quantity_range": (80, 600), "unit": "m2", "category": "glass"},

        # Wood materials
        {"id": "tgo:wood_structural_timber", "quantity_range": (20, 150), "unit": "m3", "category": "wood"},
        {"id": "tgo:wood_plywood", "quantity_range": (50, 400), "unit": "m2", "category": "wood"},
        {"id": "tgo:wood_hardwood_flooring", "quantity_range": (100, 800), "unit": "m2", "category": "wood"},

        # Brick materials
        {"id": "tgo:brick_clay", "quantity_range": (10000, 80000), "unit": "unit", "category": "brick"},
        {"id": "tgo:brick_concrete_block", "quantity_range": (5000, 50000), "unit": "unit", "category": "brick"},

        # Insulation materials
        {"id": "tgo:insulation_fiberglass", "quantity_range": (200, 1500), "unit": "m2", "category": "insulation"},
        {"id": "tgo:insulation_mineral_wool", "quantity_range": (150, 1200), "unit": "m2", "category": "insulation"},
        {"id": "tgo:insulation_foam", "quantity_range": (100, 800), "unit": "m3", "category": "insulation"},
    ]

    building_types = ["residential", "commercial", "industrial", "mixed_use"]

    materials = []
    for i in range(num_materials):
        template = material_templates[i % len(material_templates)]
        building_type = building_types[i % len(building_types)]

        # Generate quantity within range
        min_qty, max_qty = template["quantity_range"]
        quantity = min_qty + (max_qty - min_qty) * (i / num_materials)

        materials.append({
            "id": template["id"],
            "quantity": str(Decimal(str(quantity)).quantize(Decimal("0.1"))),
            "unit": template["unit"],
            "category": template["category"],
            "building_type": building_type,
        })

    return materials


async def generate_recommendations_mock(materials: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate mock recommendations for materials.

    This is a placeholder that generates mock data. In production, this would
    call the actual AlternativeRecommendationEngine.

    Args:
        materials: List of material specifications

    Returns:
        List of recommendation objects for validation
    """
    recommendations = []

    # Mock alternative database
    alternative_mappings = {
        "concrete": [
            {"id": "tgo:concrete_recycled", "name": "Recycled Aggregate Concrete", "carbon_reduction": 25.0},
            {"id": "tgo:concrete_fly_ash", "name": "Fly Ash Concrete", "carbon_reduction": 30.0},
            {"id": "tgo:concrete_ggbs", "name": "GGBS Concrete", "carbon_reduction": 35.0},
        ],
        "steel": [
            {"id": "tgo:steel_recycled", "name": "Recycled Steel", "carbon_reduction": 40.0},
            {"id": "tgo:steel_optimized", "name": "Optimized Steel Design", "carbon_reduction": 15.0},
        ],
        "aluminum": [
            {"id": "tgo:aluminum_recycled", "name": "Recycled Aluminum", "carbon_reduction": 50.0},
            {"id": "tgo:aluminum_low_carbon", "name": "Low-Carbon Aluminum", "carbon_reduction": 30.0},
        ],
        "glass": [
            {"id": "tgo:glass_recycled", "name": "Recycled Glass", "carbon_reduction": 20.0},
        ],
        "wood": [
            {"id": "tgo:wood_certified_fsc", "name": "FSC Certified Wood", "carbon_reduction": 10.0},
            {"id": "tgo:wood_bamboo", "name": "Bamboo", "carbon_reduction": 15.0},
        ],
        "brick": [
            {"id": "tgo:brick_recycled", "name": "Recycled Brick", "carbon_reduction": 25.0},
        ],
        "insulation": [
            {"id": "tgo:insulation_cellulose", "name": "Cellulose Insulation", "carbon_reduction": 35.0},
            {"id": "tgo:insulation_hemp", "name": "Hemp Insulation", "carbon_reduction": 40.0},
        ],
    }

    for material in materials:
        category = material["category"]
        quantity = Decimal(material["quantity"])

        # Get alternatives for this category
        alternatives_data = alternative_mappings.get(category, [])

        # Calculate mock emission factors
        base_emission_factor = Decimal("200.0")  # Mock baseline
        base_carbon = base_emission_factor * quantity

        alternatives = []
        for alt in alternatives_data:
            reduction_pct = Decimal(str(alt["carbon_reduction"]))
            alt_emission_factor = base_emission_factor * (Decimal("100") - reduction_pct) / Decimal("100")
            carbon_reduction = base_carbon * reduction_pct / Decimal("100")

            alternatives.append({
                "material_id": alt["id"],
                "name": alt["name"],
                "emission_factor": float(alt_emission_factor),
                "carbon_reduction_kgco2e": float(carbon_reduction),
                "carbon_reduction_percentage": float(reduction_pct),
                "cost_impact_percentage": float(reduction_pct * Decimal("0.5")),  # Mock cost impact
                "availability": "high" if reduction_pct < 30 else "medium",
                "confidence": 0.85,
                "ranking_score": float(reduction_pct) / 100.0,
            })

        # Sort by ranking score
        alternatives.sort(key=lambda x: x["ranking_score"], reverse=True)

        recommendations.append({
            "original_material_id": material["id"],
            "original_material_category": category,
            "quantity": material["quantity"],
            "unit": material["unit"],
            "building_type": material["building_type"],
            "base_emission_factor": float(base_emission_factor),
            "base_carbon_kgco2e": float(base_carbon),
            "alternatives": alternatives[:5],  # Top 5 alternatives
        })

    return recommendations


async def validate_alternatives(
    num_materials: int = 20,
    output_file: str = "recommendations.json"
) -> bool:
    """Generate material recommendations for consultant validation.

    Args:
        num_materials: Number of materials to generate recommendations for
        output_file: Output JSON file path

    Returns:
        True if generation succeeded, False otherwise
    """
    print(f"Material Alternative Recommendation Validation")
    print(f"=" * 60)
    print(f"Generating recommendations for {num_materials} materials...")
    print()

    # Generate test materials
    materials = get_test_materials(num_materials)

    print(f"Test materials generated:")
    print(f"  Total: {len(materials)}")

    # Count by category
    categories = {}
    for m in materials:
        cat = m["category"]
        categories[cat] = categories.get(cat, 0) + 1

    print(f"  Categories:")
    for cat, count in sorted(categories.items()):
        print(f"    {cat}: {count}")
    print()

    # Generate recommendations (using mock for now)
    print(f"Generating alternative recommendations...")
    try:
        recommendations = await generate_recommendations_mock(materials)
    except Exception as e:
        print(f"ERROR: Failed to generate recommendations: {e}")
        return False

    print(f"Recommendations generated: {len(recommendations)}")
    print()

    # Calculate statistics
    total_alternatives = sum(len(r["alternatives"]) for r in recommendations)
    avg_alternatives = total_alternatives / len(recommendations) if recommendations else 0

    print(f"Statistics:")
    print(f"  Total materials: {len(recommendations)}")
    print(f"  Total alternatives: {total_alternatives}")
    print(f"  Avg alternatives per material: {avg_alternatives:.1f}")
    print()

    # Write to output file
    output_path = Path(output_file)
    try:
        with output_path.open("w", encoding="utf-8") as f:
            json.dump(recommendations, f, indent=2, ensure_ascii=False)

        print(f"✅ Recommendations saved to: {output_file}")
        print()
    except Exception as e:
        print(f"ERROR: Failed to write output file: {e}")
        return False

    # Print validation instructions
    print("=" * 60)
    print("NEXT STEPS: Consultant Validation")
    print("=" * 60)
    print()
    print("1. Share recommendations.json with consultant panel (3-5 experts)")
    print()
    print("2. For each recommendation, consultants evaluate:")
    print("   • Carbon impact accuracy: Is emission factor reduction realistic?")
    print("   • Cost feasibility: Is cost impact reasonable for Thai construction?")
    print("   • Availability: Is material available in Thailand?")
    print("   • Category match: Is alternative in correct material category?")
    print()
    print("3. Rating scale:")
    print("   • Useful (3-4): Correct, feasible, realistic")
    print("   • Not useful (1-2): Wrong category, infeasible, unrealistic")
    print()
    print("4. Calculate 'useful' percentage: (recommendations rated ≥3) / total")
    print()
    print("5. Acceptance criteria: ≥80% rated as 'useful' (≥16 out of 20)")
    print()
    print("6. If below 80%:")
    print("   • Document feedback on what made recommendations not useful")
    print("   • Iterate on algorithm weights or SPARQL query filters")
    print("   • Re-run validation with updated recommendations")
    print()
    print("=" * 60)

    return True


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Validate material alternative recommendations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate 20 recommendations (default)
  python scripts/validate_alternatives.py

  # Generate more recommendations for thorough validation
  python scripts/validate_alternatives.py --materials 30

  # Specify custom output file
  python scripts/validate_alternatives.py --output my_recommendations.json

  # Quick test with fewer materials
  python scripts/validate_alternatives.py --materials 5 --output test.json
        """
    )

    parser.add_argument(
        "--materials",
        type=int,
        default=20,
        help="Number of materials to generate recommendations for (default: 20)"
    )

    parser.add_argument(
        "--output",
        type=str,
        default="recommendations.json",
        help="Output JSON file path (default: recommendations.json)"
    )

    args = parser.parse_args()

    # Validate arguments
    if args.materials < 1:
        print("ERROR: --materials must be at least 1")
        sys.exit(1)

    # Run validation
    try:
        success = asyncio.run(validate_alternatives(args.materials, args.output))
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nGeneration interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\nERROR: Generation failed with exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
