#!/usr/bin/env python3
"""
Database seeding script for SUNA BIM Platform
Creates sample data for development and testing
"""

import asyncio
from decimal import Decimal
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

async def seed_materials():
    """Seed sample materials for testing."""
    print("🌱 Seeding materials...")

    materials = [
        {
            "id": "MAT001",
            "name": "Portland Cement (Type I)",
            "category": "Cement",
            "emission_factor": Decimal("0.820"),
            "unit": "kg",
            "thai_name": "ปูนซีเมนต์ปอร์ตแลนด์ ชนิด 1"
        },
        {
            "id": "MAT002",
            "name": "Ready-Mix Concrete C25",
            "category": "Concrete",
            "emission_factor": Decimal("0.150"),
            "unit": "m³",
            "thai_name": "คอนกรีตผสมเสร็จ C25"
        },
        {
            "id": "MAT003",
            "name": "Steel Rebar (Grade 60)",
            "category": "Steel",
            "emission_factor": Decimal("2.500"),
            "unit": "kg",
            "thai_name": "เหล็กเส้นกลม เกรด 60"
        },
        {
            "id": "MAT004",
            "name": "Ceramic Floor Tiles",
            "category": "Finishes",
            "emission_factor": Decimal("0.035"),
            "unit": "m²",
            "thai_name": "กระเบื้องเซรามิค"
        },
        {
            "id": "MAT005",
            "name": "Aluminum Window Frame",
            "category": "Aluminum",
            "emission_factor": Decimal("8.200"),
            "unit": "kg",
            "thai_name": "กรอบหน้าต่างอะลูมิเนียม"
        }
    ]

    print(f"  ✓ Created {len(materials)} sample materials")
    return materials

async def seed_projects():
    """Seed sample projects for testing."""
    print("🌱 Seeding projects...")

    projects = [
        {
            "id": "PROJ001",
            "name": "Bangkok Residential Tower",
            "type": "Residential",
            "location": "Bangkok, Thailand",
            "floor_area": 12000,  # m²
            "status": "Planning",
            "thai_name": "อาคารที่พักอาศัย กรุงเทพฯ"
        },
        {
            "id": "PROJ002",
            "name": "Chiang Mai Office Complex",
            "type": "Commercial",
            "location": "Chiang Mai, Thailand",
            "floor_area": 8500,  # m²
            "status": "Design",
            "thai_name": "อาคารสำนักงาน เชียงใหม่"
        }
    ]

    print(f"  ✓ Created {len(projects)} sample projects")
    return projects

async def seed_boq_data():
    """Seed sample Bill of Quantities for testing."""
    print("🌱 Seeding BOQ data...")

    boq_entries = [
        {
            "project_id": "PROJ001",
            "material_id": "MAT001",
            "quantity": Decimal("50000"),
            "unit": "kg",
            "description": "Portland Cement for foundation"
        },
        {
            "project_id": "PROJ001",
            "material_id": "MAT002",
            "quantity": Decimal("800"),
            "unit": "m³",
            "description": "Ready-mix concrete"
        },
        {
            "project_id": "PROJ001",
            "material_id": "MAT003",
            "quantity": Decimal("120000"),
            "unit": "kg",
            "description": "Steel reinforcement"
        },
        {
            "project_id": "PROJ001",
            "material_id": "MAT004",
            "quantity": Decimal("3000"),
            "unit": "m²",
            "description": "Floor tiles"
        },
        {
            "project_id": "PROJ001",
            "material_id": "MAT005",
            "quantity": Decimal("2500"),
            "unit": "kg",
            "description": "Window frames"
        }
    ]

    print(f"  ✓ Created {len(boq_entries)} BOQ entries")
    return boq_entries

async def seed_users():
    """Seed sample users for testing."""
    print("🌱 Seeding users...")

    users = [
        {
            "email": "admin@carbonbim.com",
            "name": "Admin User",
            "role": "admin",
            "organization": "CarbonBIM"
        },
        {
            "email": "engineer@example.com",
            "name": "Construction Engineer",
            "role": "engineer",
            "organization": "Example Construction Co."
        },
        {
            "email": "consultant@example.com",
            "name": "Sustainability Consultant",
            "role": "consultant",
            "organization": "Green Building Consultants"
        }
    ]

    print(f"  ✓ Created {len(users)} test users")
    print("  ⚠ Default password: 'password123' (change in production!)")
    return users

async def calculate_sample_carbon():
    """Calculate and display sample carbon footprint."""
    print("\n📊 Sample Carbon Calculation:")

    materials = await seed_materials()
    boq = await seed_boq_data()

    total_carbon = Decimal("0")
    carbon_by_category = {}

    for entry in boq:
        material = next(m for m in materials if m["id"] == entry["material_id"])
        carbon = entry["quantity"] * material["emission_factor"]
        total_carbon += carbon

        category = material["category"]
        carbon_by_category[category] = carbon_by_category.get(category, Decimal("0")) + carbon

        print(f"  {material['name']}: {carbon:,.2f} kgCO2e")

    print(f"\n  Total Carbon Footprint: {total_carbon:,.2f} kgCO2e")
    print(f"  Per m² (12,000 m²): {(total_carbon / 12000):,.2f} kgCO2e/m²")

    print("\n  By Category:")
    for category, carbon in sorted(carbon_by_category.items(), key=lambda x: x[1], reverse=True):
        percentage = (carbon / total_carbon) * 100
        print(f"    {category}: {carbon:,.2f} kgCO2e ({percentage:.1f}%)")

async def main():
    """Main seeding function."""
    print("🚀 SUNA BIM Database Seeding")
    print("=" * 50)

    try:
        # Seed all data
        await seed_materials()
        await seed_projects()
        await seed_boq_data()
        await seed_users()

        # Calculate sample carbon
        await calculate_sample_carbon()

        print("\n" + "=" * 50)
        print("✅ Database seeding complete!")
        print("\nYou can now:")
        print("  1. Run 'make dev' to start the application")
        print("  2. Log in with: engineer@example.com / password123")
        print("  3. View sample project: Bangkok Residential Tower")

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
