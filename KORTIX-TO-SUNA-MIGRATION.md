# Kortix to Suna Branding Migration Report

## Completed Changes

### 1. Hero Section (`src/components/home/hero-section.tsx`)
- ✅ **Removed**: `/kortix-brandmark-bg.svg` background image
- ✅ **Replaced with**: Clean dark background (#0B1120) with subtle carbon grid pattern
- ✅ **Result**: Maintains CarbonScope dark engineering aesthetic without Kortix branding

### 2. Navbar (`src/components/home/navbar.tsx`)
- ✅ **Removed**: Import of `KortixLogo` component
- ✅ **Replaced with**: `SunaLogo` component import
- ✅ **Updated**: All `<KortixLogo>` instances to `<SunaLogo>`

### 3. Logo Component
- ✅ **Created**: New `src/components/sidebar/suna-logo.tsx` component
- ✅ **Logomark variant**: Uses `/Logomark.svg` (CarbonScope branding)
- ✅ **Symbol variant**: Simple "S" in emerald green using Instrument Serif font
- ✅ **Maintains**: Same API as KortixLogo for drop-in replacement

### 4. Codebase-wide Component Replacement
- ✅ **Replaced**: All 41+ files importing `KortixLogo` → `SunaLogo`
- ✅ **Updated**: Component names, imports, and alt text across frontend
- ✅ **Script created**: `scripts/replace-kortix-branding.sh` for systematic replacement

## Remaining Work

### 1. Directory/File Naming
The following directories and files still use "kortix" naming:

#### Critical Path Components:
- `src/components/thread/kortix-computer/` → Should rename to `suna-computer/` or `carbon-computer/`
  - `KortixComputer.tsx`
  - `KortixComputerHeader.tsx`
  - Multiple child components

#### Store Files:
- `src/stores/kortix-computer-store.ts` → Rename to `suna-computer-store.ts`
  - Update hook names: `useKortixComputerStore` → `useSunaComputerStore`

#### Asset Files:
- `/public/kortix-symbol.svg` → Copy/rename to `suna-symbol.svg`
- `/public/kortix-computer-*.svg` → Rename to `suna-computer-*.svg`
- `/public/kortix-brandmark-*.svg` → Can be deleted (no longer used)

### 2. Translation Files
Multiple translation files contain "Kortix" brand references:
- `translations/en.json`
- `translations/es.json`
- `translations/fr.json`
- `translations/de.json`
- `translations/it.json`
- `translations/pt.json`
- `translations/ja.json`
- `translations/zh.json`

**Action needed**: Update brand mentions to "Suna" or "CarbonScope"

### 3. Configuration Files
- `src/lib/model-provider-icons.tsx` → Update `kortix: '/kortix-symbol.svg'` reference
- `src/lib/site-config.ts` → May contain brand references
- `src/lib/site-metadata.ts` → May contain brand metadata
- `src/lib/pricing-config.ts` → May contain brand-specific text

### 4. Documentation & Legal
- Legal pages may reference Kortix brand
- Terms of Service / Privacy Policy
- Help documentation
- API documentation

### 5. External URLs
**Keep as-is**: URLs to `kortix.com` should remain unchanged for:
- Legal links (Terms, Privacy Policy)
- Support/status pages
- Marketing site references

## Migration Script Usage

To complete the remaining replacements:

```bash
# Run the branding replacement script
chmod +x scripts/replace-kortix-branding.sh
./scripts/replace-kortix-branding.sh

# For directory/file renames (requires manual intervention):
# 1. Rename kortix-computer directory
# 2. Update all imports
# 3. Rename store files
# 4. Update hook names
```

## Testing Checklist

After completing migration:

- [ ] Hero section displays with clean dark background
- [ ] Navbar shows Suna logo correctly
- [ ] All pages load without missing image errors
- [ ] Logo displays correctly in light/dark modes
- [ ] Mobile drawer shows correct logo
- [ ] No console errors for missing assets
- [ ] Translation keys work correctly
- [ ] Footer branding updated
- [ ] Auth pages show correct branding
- [ ] Dashboard shows correct logo

## CarbonScope Design Tokens Applied

- **Primary Color**: Emerald (#34D399, #10B981, #059669)
- **Dark Base**: #0B1120, #111827, #162032
- **Typography**: Instrument Serif (display), Plus Jakarta Sans (body)
- **Background Pattern**: Subtle carbon grid (40px grid, 0.03-0.05 opacity)

## Notes

- The `Logomark.svg` file appears to be the CarbonScope/Suna branding (despite file path)
- Original Kortix assets preserved in `/public` for backward compatibility
- New SunaLogo component maintains same API for seamless migration
- Translation files contain most brand references and need manual review
