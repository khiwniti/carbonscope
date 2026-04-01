# PNPM Installation Optimization Suggestions

## Current Installation Time
- ~1 minute 34 seconds for 2364 packages
- Lockfile resolution: skipped (up to date)
- Actual installation: ~1m34s

## Immediate Optimizations Applied
1. Cleared corrupted pnpm store (`~/.pnpm-store`)
2. Used `--prefer-frozen-lockfile` to skip resolution when lockfile is valid
3. Removed progress bar overhead (would normally use `--no-progress` but pnpm v10 handles this differently)

## Additional Optimization Strategies

### 1. Registry Configuration
Consider using a faster npm registry mirror:
```bash
# Set registry to a faster mirror (example: China mirror)
pnpm config set registry https://registry.npmmirror.com

# Or use npm official registry (usually fastest globally)
pnpm config set registry https://registry.npmjs.org/
```

### 2. Network Concurrency
Increase download concurrency:
```bash
# Increase network concurrency (default is usually 8-16)
pnpm config set network-concurrency 32
```

### 3. Store Location Optimization
Ensure pnpm store is on fast storage:
- Current location: `/teamspace/studios/this_studio/.pnpm-store/v10`
- Consider moving to tmpfs or SSD if currently on slower storage

### 4. Dependency Hoisting Review
Review `.npmrc` settings:
- Current settings aggressively hoist many packages
- This can sometimes cause issues but generally improves installation speed
- Monitor for peer dependency warnings

### 5. CI/Optimized Installation Scripts
For CI systems, consider:
```bash
# Skip integrity verification for faster installs (only in trusted CI)
pnpm install --prefer-frozen-lockfile --ignore-scripts

# Or use frozen lockfile exclusively
pnpm install --frozen-lockfile
```

### 6. Package-Specific Optimizations
Some packages in this project that may benefit from special handling:
- `sharp` (image processing) - often benefits from pre-built binaries
- `canvas` - similar to sharp
- `electron` - large binary downloads
- `@swc/core` - Rust-based tool that may compile from source

Consider setting environment variables for these:
```bash
# For sharp
export SHARP_IGNORE_GLOBAL_LIBVIPS=1
export SHARP_DISABLE_AVIF2=1

# For canvas
export CANVAS_FORCE_BUILD=1  # Only if needed
```

### 7. Regular Maintenance
- Periodically run `pnpm store prune` to clean unused packages
- Update pnpm regularly for performance improvements
- Keep lockfile updated with `pnpm update --latest`

## Verification After Optimization
To verify improvements:
```bash
# Time the installation
time pnpm install --prefer-frozen-lockfile

# Compare with baseline (~94 seconds)
```

## Notes on Current Performance
The current installation time of ~94 seconds for 2364 packages is actually reasonable:
- ~25 packages/second installation rate
- Many packages are Node.js native modules requiring compilation/download
- Network and disk I/O are likely the limiting factors

Focus optimization efforts on:
1. Network configuration (registry, concurrency)
2. Storage speed (store location)
3. CI-specific flags if applicable