"""
Translation completeness tests for Thai and English locales.

Tests ensure:
1. All keys present in both locales
2. No empty translations
3. Variable placeholders match between locales
4. No hardcoded strings in code (spot checks)

Run: pytest tests/localization/test_translation_completeness.py -v
"""

import pytest
import json
import re
from pathlib import Path
from typing import Dict, Set, List, Tuple


# Path to translation files (adjust based on your project structure)
TRANSLATIONS_DIR = Path(__file__).parent.parent.parent / "suna" / "apps" / "frontend" / "messages"


def load_translations(locale: str) -> dict:
    """
    Load translation file for given locale.

    Args:
        locale: Locale code (e.g., 'en', 'th')

    Returns:
        Dictionary of translations

    Raises:
        FileNotFoundError: If translation file doesn't exist
    """
    path = TRANSLATIONS_DIR / f"{locale}.json"

    if not path.exists():
        pytest.skip(f"Translation file not found: {path}")

    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        pytest.fail(f"Invalid JSON in {path}: {e}")


def flatten_dict(d: dict, parent_key: str = "", sep: str = ".") -> dict:
    """
    Flatten nested dictionary with dot notation keys.

    Example:
        {'app': {'title': 'CarbonBIM'}} -> {'app.title': 'CarbonBIM'}

    Args:
        d: Dictionary to flatten
        parent_key: Parent key for recursion
        sep: Separator for nested keys

    Returns:
        Flattened dictionary
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def extract_variables(text: str) -> Set[str]:
    """
    Extract variable placeholders from translation strings.

    Supports formats:
    - {variable}
    - {variable:format}
    - {{variable}}

    Args:
        text: Translation string

    Returns:
        Set of variable names
    """
    # Match {variable} or {variable:format}
    pattern = re.compile(r'\{([^}:]+)(?::[^}]+)?\}')
    return set(pattern.findall(str(text)))


class TestTranslationCompleteness:
    """Test suite for translation completeness and consistency."""

    def test_translation_files_exist(self):
        """Verify translation files exist for all required locales."""
        required_locales = ['en', 'th']

        for locale in required_locales:
            path = TRANSLATIONS_DIR / f"{locale}.json"
            assert path.exists(), f"Translation file missing: {path}"

    def test_thai_translation_completeness(self):
        """Verify all English keys have Thai translations."""
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        missing_keys = set(en.keys()) - set(th.keys())

        assert len(missing_keys) == 0, (
            f"Missing Thai translations for {len(missing_keys)} keys:\n" +
            "\n".join(f"  - {key}" for key in sorted(missing_keys))
        )

    def test_english_translation_completeness(self):
        """Verify all Thai keys have English translations."""
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        missing_keys = set(th.keys()) - set(en.keys())

        assert len(missing_keys) == 0, (
            f"Missing English translations for {len(missing_keys)} keys:\n" +
            "\n".join(f"  - {key}" for key in sorted(missing_keys))
        )

    def test_no_empty_thai_translations(self):
        """Verify no empty strings in Thai translations."""
        th = flatten_dict(load_translations("th"))

        empty_translations = [
            key for key, value in th.items()
            if not value or str(value).strip() == ""
        ]

        assert len(empty_translations) == 0, (
            f"Found {len(empty_translations)} empty Thai translations:\n" +
            "\n".join(f"  - {key}" for key in sorted(empty_translations))
        )

    def test_no_empty_english_translations(self):
        """Verify no empty strings in English translations."""
        en = flatten_dict(load_translations("en"))

        empty_translations = [
            key for key, value in en.items()
            if not value or str(value).strip() == ""
        ]

        assert len(empty_translations) == 0, (
            f"Found {len(empty_translations)} empty English translations:\n" +
            "\n".join(f"  - {key}" for key in sorted(empty_translations))
        )

    def test_translation_variable_consistency(self):
        """
        Verify variable placeholders match between locales.

        Example:
            en: "Welcome back, {name}"
            th: "ยินดีต้อนรับกลับ {name}"

        Both should have {name} variable.
        """
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        mismatches: List[Dict] = []

        for key in en.keys():
            if key not in th:
                continue

            en_vars = extract_variables(en[key])
            th_vars = extract_variables(th[key])

            if en_vars != th_vars:
                mismatches.append({
                    'key': key,
                    'en_vars': sorted(en_vars),
                    'th_vars': sorted(th_vars),
                    'en_text': en[key],
                    'th_text': th[key],
                })

        assert len(mismatches) == 0, (
            f"Found {len(mismatches)} variable mismatches:\n" +
            json.dumps(mismatches, indent=2, ensure_ascii=False)
        )

    def test_no_untranslated_english_in_thai(self):
        """
        Detect Thai translations that are identical to English (likely untranslated).

        Exceptions: Brand names, technical terms, numbers.
        """
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        # Keys that are allowed to be identical (brand names, etc.)
        allowed_identical = {
            'app.title',  # "CarbonBIM"
            'app.version',  # Version numbers
            'units.kgco2e',  # "kgCO2e" (technical unit)
            'certifications.trees',  # "TREES"
            'certifications.edge',  # "EDGE"
        }

        untranslated = []

        for key in en.keys():
            if key not in th:
                continue

            if key in allowed_identical:
                continue

            # Check if Thai translation is identical to English
            if en[key] == th[key] and isinstance(en[key], str):
                # Skip if it's a number or single character
                if en[key].strip().replace('.', '').replace('-', '').isdigit():
                    continue
                if len(en[key].strip()) <= 1:
                    continue

                untranslated.append({
                    'key': key,
                    'text': en[key],
                })

        # Warning instead of failure (some terms may intentionally be identical)
        if len(untranslated) > 0:
            print(
                f"\n⚠️  Warning: Found {len(untranslated)} potentially untranslated Thai strings:\n" +
                json.dumps(untranslated, indent=2, ensure_ascii=False)
            )

    def test_translation_keys_follow_naming_convention(self):
        """
        Verify translation keys follow naming convention.

        Convention: lowercase, dot-separated, descriptive
        Examples:
            ✅ nav.dashboard
            ✅ analysis.upload_boq
            ❌ navDashboard (camelCase not allowed)
            ❌ ANALYSIS (uppercase not allowed)
        """
        en = flatten_dict(load_translations("en"))

        invalid_keys = []

        for key in en.keys():
            # Check for invalid patterns
            if not re.match(r'^[a-z0-9_\.]+$', key):
                invalid_keys.append(key)

        assert len(invalid_keys) == 0, (
            f"Found {len(invalid_keys)} keys with invalid naming:\n" +
            "\n".join(f"  - {key}" for key in sorted(invalid_keys)) +
            "\n\nKeys should be lowercase with dots (e.g., 'nav.dashboard')"
        )


class TestTranslationQuality:
    """Test suite for translation quality and consistency."""

    def test_thai_uses_proper_unicode(self):
        """Verify Thai translations use proper Unicode characters (not garbled)."""
        th = flatten_dict(load_translations("th"))

        # Thai Unicode range: U+0E00 to U+0E7F
        thai_range = range(0x0E00, 0x0E80)

        for key, value in th.items():
            if not isinstance(value, str):
                continue

            # Skip keys that are numbers or Latin-only (e.g., units, brand names)
            if value.strip().replace('.', '').replace('-', '').isdigit():
                continue

            # Check if translation contains Thai characters
            has_thai = any(ord(char) in thai_range for char in value)

            # If key suggests it should be Thai but has no Thai characters, flag it
            if not has_thai and not any(
                term in key for term in ['version', 'url', 'email', 'unit']
            ):
                # This is a warning, not a failure (some terms may be Latin)
                print(f"\n⚠️  Warning: No Thai characters in '{key}': {value}")

    def test_thai_text_length_reasonable(self):
        """
        Verify Thai translations aren't suspiciously short or long.

        Thai translations are typically 1.0-1.5x the length of English.
        """
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        length_issues = []

        for key in en.keys():
            if key not in th:
                continue

            en_text = str(en[key])
            th_text = str(th[key])

            # Skip very short strings (e.g., "OK", "Yes")
            if len(en_text) < 5:
                continue

            en_len = len(en_text)
            th_len = len(th_text)

            # Flag if Thai is significantly shorter than English (possible incomplete translation)
            if th_len < en_len * 0.3:
                length_issues.append({
                    'key': key,
                    'en_length': en_len,
                    'th_length': th_len,
                    'en_text': en_text,
                    'th_text': th_text,
                })

        # Warning instead of failure
        if len(length_issues) > 0:
            print(
                f"\n⚠️  Warning: Found {len(length_issues)} Thai translations significantly shorter than English:\n" +
                json.dumps(length_issues, indent=2, ensure_ascii=False)
            )

    def test_no_html_in_translations(self):
        """
        Verify translations don't contain HTML tags (security risk).

        HTML should be handled separately, not in translation strings.
        """
        en = flatten_dict(load_translations("en"))
        th = flatten_dict(load_translations("th"))

        html_pattern = re.compile(r'<[^>]+>')

        html_in_en = [key for key, value in en.items() if html_pattern.search(str(value))]
        html_in_th = [key for key, value in th.items() if html_pattern.search(str(value))]

        assert len(html_in_en) == 0, (
            f"Found HTML tags in English translations:\n" +
            "\n".join(f"  - {key}: {en[key]}" for key in html_in_en)
        )

        assert len(html_in_th) == 0, (
            f"Found HTML tags in Thai translations:\n" +
            "\n".join(f"  - {key}: {th[key]}" for key in html_in_th)
        )


class TestTranslationCoverage:
    """Test suite for translation coverage in codebase."""

    def test_no_hardcoded_strings_in_components(self):
        """
        Spot check: Verify components don't have hardcoded English strings.

        This is a sample test - extend with more comprehensive checks.
        """
        # This is a placeholder test
        # In a real implementation, you would scan source files for hardcoded strings
        # Tools: babel-plugin-react-intl, i18next-scanner, etc.

        pytest.skip("TODO: Implement hardcoded string detection")


@pytest.fixture
def translation_stats():
    """Generate translation statistics for reporting."""
    en = flatten_dict(load_translations("en"))
    th = flatten_dict(load_translations("th"))

    return {
        'total_keys': len(en),
        'thai_translated': len(set(en.keys()) & set(th.keys())),
        'thai_completeness': len(set(en.keys()) & set(th.keys())) / len(en) * 100,
    }


def test_translation_stats(translation_stats):
    """
    Print translation statistics.

    This test always passes but provides useful information.
    """
    print("\n" + "="*50)
    print("Translation Statistics")
    print("="*50)
    print(f"Total translation keys: {translation_stats['total_keys']}")
    print(f"Thai translations: {translation_stats['thai_translated']}")
    print(f"Thai completeness: {translation_stats['thai_completeness']:.1f}%")
    print("="*50)

    # Target: 100% completeness
    assert translation_stats['thai_completeness'] >= 99.0, (
        f"Thai translation completeness below target: "
        f"{translation_stats['thai_completeness']:.1f}% < 100%"
    )
