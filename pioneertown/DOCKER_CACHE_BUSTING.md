# Docker Cache Busting Guide

This project includes several mechanisms for cache busting in Docker builds to ensure fresh builds when needed.

## Available Cache Busting Methods

### 1. Build Arguments (Built-in)
The Dockerfile includes build arguments that automatically bust cache:
- `BUILDTIME`: Timestamp of the build
- `VERSION`: Version string (defaults to date-based)
- `CACHEBUST`: Numeric value that forces cache invalidation

### 2. Build Script with Options
Use the `build.sh` script for convenient cache busting:

```bash
# Normal build (uses cache)
./build.sh

# Force fresh build (no cache)
./build.sh --no-cache

# Use random cache bust value
./build.sh --cache-bust

# Clean existing containers/images first
./build.sh --clean

# Combine options
./build.sh --clean --cache-bust
```

### 3. Manual Docker Build with Cache Busting
You can manually build with cache busting:

```bash
# Build with current timestamp as cache buster
docker build \
  --build-arg CACHEBUST=$(date +%s) \
  --build-arg VERSION=$(date +%Y%m%d-%H%M%S) \
  --build-arg BUILDTIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  -t pioneertown:latest .

# Or use --no-cache flag
docker build --no-cache -t pioneertown:latest .
```

### 4. Forced Cache Invalidation Points
The Dockerfile includes strategic cache invalidation points:
- Before copying source code
- Before building the application
- With build metadata labels

## When to Use Cache Busting

### Use `--cache-bust` when:
- Configuration files have changed (postcss.config.js, tailwind.config.js, etc.)
- Dependencies have been updated
- You suspect cache-related issues

### Use `--no-cache` when:
- Dockerfile has been modified
- Base images need to be refreshed
- Complete rebuild is required
- Debugging cache-related issues

### Use `--clean` when:
- Starting completely fresh
- Disk space cleanup needed
- Testing deployment process

## Build Information
Each image includes build metadata accessible via:
```bash
docker inspect pioneertown:latest | grep -A 10 "Labels"
```

## Examples

```bash
# Development build
./build.sh

# Production build with fresh cache
./build.sh --cache-bust

# Complete rebuild for deployment
./build.sh --clean --no-cache

# Quick cache-busted build
./build.sh --cache-bust
```
