"""
TGO Emission Factor Lookup — fallback data when GraphDB is unavailable.

These factors are sourced from TGO Carbon Footprint Product reports (2026).
Used for deterministic carbon calculations without a running GraphDB instance.

Units: kgCO2e per material unit
"""

from decimal import Decimal
from typing import Optional
import re

# Core TGO emission factors for common Thai construction materials
# Structure: { canonical_name: { ef: kgCO2e/unit, unit: string, aliases: [str] } }
TGO_FACTORS: dict[str, dict] = {
    # Concrete
    "concrete_c30": {
        "ef": Decimal("445.60"),
        "unit": "m³",
        "name_en": "Ready-mixed Concrete C30",
        "name_th": "คอนกรีตผสมเสร็จ C30",
        "aliases": ["concrete c30", "คอนกรีต c30", "คอนกรีตผสมเสร็จ c30", "rmc c30"],
    },
    "concrete_c25": {
        "ef": Decimal("370.00"),
        "unit": "m³",
        "name_en": "Ready-mixed Concrete C25",
        "name_th": "คอนกรีตผสมเสร็จ C25",
        "aliases": ["concrete c25", "คอนกรีต c25", "b25", "คอนกรีต b25"],
    },
    "concrete_c20": {
        "ef": Decimal("320.00"),
        "unit": "m³",
        "name_en": "Ready-mixed Concrete C20",
        "name_th": "คอนกรีตผสมเสร็จ C20",
        "aliases": ["concrete c20", "คอนกรีต c20", "b20"],
    },
    "concrete_lean": {
        "ef": Decimal("200.00"),
        "unit": "m³",
        "name_en": "Lean Concrete",
        "name_th": "คอนกรีตหยาบ",
        "aliases": ["lean concrete", "คอนกรีตหยาบ", "blinding concrete"],
    },
    # Steel
    "steel_rebar_sd40": {
        "ef": Decimal("2320.00"),
        "unit": "ton",
        "name_en": "Deformed Bar SD40",
        "name_th": "เหล็กข้ออ้อย SD40",
        "aliases": ["steel rebar", "deformed bar", "เหล็กข้ออ้อย", "เหล็กเส้น sd40", "rebar", "db"],
    },
    "steel_rebar_sd30": {
        "ef": Decimal("2180.00"),
        "unit": "ton",
        "name_en": "Deformed Bar SD30",
        "name_th": "เหล็กข้ออ้อย SD30",
        "aliases": ["sd30", "เหล็ก sd30"],
    },
    "steel_plate": {
        "ef": Decimal("2540.00"),
        "unit": "ton",
        "name_en": "Steel Plate",
        "name_th": "แผ่นเหล็ก",
        "aliases": ["steel plate", "แผ่นเหล็ก", "structural steel"],
    },
    "steel_section": {
        "ef": Decimal("2540.00"),
        "unit": "ton",
        "name_en": "Steel Section (H/I/C)",
        "name_th": "เหล็กรูปพรรณ",
        "aliases": ["h-beam", "i-beam", "steel section", "เหล็กรูปพรรณ", "เหล็ก h"],
    },
    # Cement
    "cement_opc": {
        "ef": Decimal("920.00"),
        "unit": "ton",
        "name_en": "Portland Cement Type I",
        "name_th": "ปูนซีเมนต์ปอร์ตแลนด์ ชนิด 1",
        "aliases": ["portland cement", "opc", "ปูนซีเมนต์", "cement type i", "ปูนซีเมนต์ปอร์ตแลนด์"],
    },
    # Masonry
    "brick_clay": {
        "ef": Decimal("245.00"),
        "unit": "ton",
        "name_en": "Clay Brick",
        "name_th": "อิฐมอญ",
        "aliases": ["clay brick", "อิฐมอญ", "อิฐ", "brick"],
    },
    "block_aac": {
        "ef": Decimal("510.00"),
        "unit": "ton",
        "name_en": "Autoclaved Aerated Concrete Block",
        "name_th": "บล็อก AAC",
        "aliases": ["aac block", "autoclaved aerated", "q-con", "ytong", "บล็อก aac", "q con", "บล็อกมวลเบา"],
    },
    "block_hollow": {
        "ef": Decimal("135.00"),
        "unit": "ton",
        "name_en": "Hollow Concrete Block",
        "name_th": "บล็อกคอนกรีตกลวง",
        "aliases": ["hollow block", "concrete block", "บล็อกกลวง", "บล็อกคอนกรีต"],
    },
    # Glass & Aluminum
    "glass_float": {
        "ef": Decimal("1020.00"),
        "unit": "ton",
        "name_en": "Float Glass",
        "name_th": "กระจกแบน",
        "aliases": ["float glass", "กระจก", "glass", "กระจกใส"],
    },
    "aluminum_profile": {
        "ef": Decimal("8900.00"),
        "unit": "ton",
        "name_en": "Aluminum Profile",
        "name_th": "อลูมิเนียมโปรไฟล์",
        "aliases": ["aluminum", "aluminium", "อลูมิเนียม"],
    },
    # Timber
    "timber_structural": {
        "ef": Decimal("-900.00"),  # Carbon sequestration (negative)
        "unit": "m³",
        "name_en": "Structural Timber (sequestration)",
        "name_th": "ไม้โครงสร้าง",
        "aliases": ["timber", "wood", "ไม้", "structural timber", "lumber"],
    },
    # Insulation
    "insulation_rockwool": {
        "ef": Decimal("2800.00"),
        "unit": "ton",
        "name_en": "Rockwool Insulation",
        "name_th": "ฉนวนร็อควูล",
        "aliases": ["rockwool", "rock wool", "mineral wool", "ฉนวนร็อควูล"],
    },
    # Waterproofing
    "waterproofing_membrane": {
        "ef": Decimal("4500.00"),
        "unit": "ton",
        "name_en": "Waterproofing Membrane",
        "name_th": "เมมเบรนกันซึม",
        "aliases": ["waterproofing", "membrane", "กันซึม", "เมมเบรน"],
    },
    # Tiles
    "ceramic_tile": {
        "ef": Decimal("900.00"),
        "unit": "ton",
        "ef_per_m2": Decimal("14.40"),   # 900 kgCO2e/ton × 0.016 ton/m² (8mm, ~20kg/m²)
        "name_en": "Ceramic Tile",
        "name_th": "กระเบื้องเซรามิก",
        "aliases": ["ceramic tile", "กระเบื้อง", "tile", "floor tile", "wall tile"],
    },
    "granite_tile": {
        "ef": Decimal("700.00"),
        "unit": "ton",
        "ef_per_m2": Decimal("18.90"),   # 700 kgCO2e/ton × 0.027 ton/m² (granite ~28kg/m²)
        "name_en": "Granite Tile",
        "name_th": "กระเบื้องหินแกรนิต",
        "aliases": ["granite", "หินแกรนิต", "granite tile"],
    },
    # Sand & Aggregate
    "sand": {
        "ef": Decimal("4.50"),
        "unit": "ton",
        "name_en": "Natural Sand",
        "name_th": "ทราย",
        "aliases": ["sand", "ทราย", "fine aggregate"],
    },
    "aggregate_coarse": {
        "ef": Decimal("5.20"),
        "unit": "ton",
        "name_en": "Coarse Aggregate / Crushed Stone",
        "name_th": "หินย่อย",
        "aliases": ["coarse aggregate", "crushed stone", "gravel", "หิน", "หินย่อย"],
    },
}

# Unit conversion factors to bring quantities to the factor's base unit
UNIT_CONVERSIONS: dict[str, dict[str, Decimal]] = {
    "m³": {"m3": Decimal("1"), "ม3": Decimal("1"), "ม³": Decimal("1"), "cubic meter": Decimal("1")},
    "ton": {
        "ton": Decimal("1"), "tonnes": Decimal("1"), "t": Decimal("1"),
        "kg": Decimal("0.001"), "กก": Decimal("0.001"), "กิโลกรัม": Decimal("0.001"),
        "ตัน": Decimal("1"),
    },
    "m²": {"m2": Decimal("1"), "ม2": Decimal("1"), "ม²": Decimal("1"), "sqm": Decimal("1")},
}


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def lookup_emission_factor(
    material_description: str,
    unit: str,
) -> Optional[dict]:
    """
    Look up TGO emission factor for a material description.

    Returns dict with keys: ef_kgco2e_per_unit, base_unit, name_en, name_th
    or None if no match found.
    """
    desc = _normalize(material_description)

    for key, data in TGO_FACTORS.items():
        for alias in data["aliases"]:
            if _normalize(alias) in desc or desc in _normalize(alias):
                return {
                    "material_id": key,
                    "ef_kgco2e_per_unit": data["ef"],
                    "base_unit": data["unit"],
                    "name_en": data["name_en"],
                    "name_th": data["name_th"],
                }

    return None


def calculate_material_carbon(
    description: str,
    quantity: Decimal,
    unit: str,
) -> Optional[dict]:
    """
    Calculate carbon for a single material.

    Returns dict with carbon_kgco2e, emission_factor, unit, matched_material
    or None if material not found in TGO lookup.
    """
    factor_data = lookup_emission_factor(description, unit)
    if not factor_data:
        return None

    material_key = factor_data["material_id"]
    data = TGO_FACTORS[material_key]
    base_unit = factor_data["base_unit"]
    ef = factor_data["ef_kgco2e_per_unit"]

    unit_norm = _normalize(unit)

    # Check if area-based unit and material has ef_per_m2
    area_units = {"m2", "ม2", "m²", "ม²", "sqm", "sq.m", "sq m"}
    if unit_norm in area_units and "ef_per_m2" in data:
        carbon = quantity * data["ef_per_m2"]
        return {
            "carbon_kgco2e": float(carbon),
            "emission_factor": float(data["ef_per_m2"]),
            "emission_factor_unit": "kgCO2e/m²",
            "quantity_converted": float(quantity),
            "base_unit": "m²",
            "matched_material_en": factor_data["name_en"],
            "matched_material_th": factor_data["name_th"],
            "material_id": factor_data["material_id"],
        }

    # Convert quantity to base unit
    conversion = None
    if base_unit in UNIT_CONVERSIONS:
        conversion = UNIT_CONVERSIONS[base_unit].get(unit_norm)

    if conversion is None:
        if _normalize(base_unit) == unit_norm:
            conversion = Decimal("1")
        else:
            return None

    converted_qty = quantity * conversion
    carbon = converted_qty * ef

    return {
        "carbon_kgco2e": float(carbon),
        "emission_factor": float(ef),
        "emission_factor_unit": f"kgCO2e/{base_unit}",
        "quantity_converted": float(converted_qty),
        "base_unit": base_unit,
        "matched_material_en": factor_data["name_en"],
        "matched_material_th": factor_data["name_th"],
        "material_id": factor_data["material_id"],
    }
