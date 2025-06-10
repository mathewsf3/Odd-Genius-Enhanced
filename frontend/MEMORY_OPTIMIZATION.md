# Memory Optimization for Odd Genius

This document outlines the memory optimizations that have been implemented to solve memory issues in the Odd Genius development environment and how to handle AllSportsAPI integration.

## AllSportsAPI Integration

The application now includes a dedicated H2H service with mock data fallback when the API is unavailable (e.g., expired API key).

To update the API key:

1. Open the file `src/config/api-config.ts`
2. Replace the `API_KEY` value with your new key
3. Set `USE_MOCK_DATA_FALLBACK` to `false` if you want API calls to fail when the key is invalid instead of using mock data

You can test API connectivity using the browser console:

```javascript
// Open the special match page and run:
window.testH2HApi("your-new-api-key", "93", "4973");
```

## Memory-Optimized Scripts

We've created three different development server startup options to meet different development needs:

1. **Standard Development Mode**: `npm start`

   - Allocates 8GB of memory
   - Full source maps and debugging capabilities
   - Best for development machines with plenty of RAM

2. **Low Memory Mode**: `npm run start:lowmem`

   - Allocates 4GB of memory
   - Reduced source map generation
   - Good balance of performance and debugging

3. **Minimal Memory Mode**: `npm run start:minmem`
   - Allocates only 2GB of memory
   - Disables source maps and other memory-intensive features
   - Best for machines with limited resources

## Environment Optimizations

The following environment variables have been set in `.env` to reduce memory usage:

```
GENERATE_SOURCEMAP=false      # Disables source map generation
DISABLE_ESLINT_PLUGIN=true    # Disables ESLint during development
TSC_COMPILE_ON_ERROR=true     # Continues compilation even with TypeScript errors
FAST_REFRESH=false            # Disables React Fast Refresh to save memory
INLINE_RUNTIME_CHUNK=false    # Prevents inlining runtime chunk
IMAGE_INLINE_SIZE_LIMIT=0     # Prevents images from being inlined as data URIs
MINIMIZE_IN_DEVELOPMENT=true  # Enables minimization even in development
REACT_EDITOR=none             # Disables opening an editor for React errors
BROWSER=none                  # Prevents opening the browser automatically
```

## Webpack Optimizations

The `craco.config.js` file has been updated with the following optimizations:

1. **Development Mode**:

   - Disabled module concatenation
   - Disabled chunk splitting
   - Disabled runtime chunk
   - Disabled source maps
   - Reduced parallelism
   - Optimized caching

2. **Production Mode**:
   - Enhanced tree-shaking
   - Improved chunk splitting
   - Optimized vendors bundle

## Browser Optimizations

A memory optimization script (`public/memory-optimization.js`) has been added that:

1. Disables React DevTools in production mode
2. Periodically cleans up memory
3. Provides a `window.cleanMemory()` function that can be called from the console

## Component Optimizations

1. **SpecialMatch.tsx**:

   - Added timeout for API requests
   - Limited number of matches processed from API to 10
   - Optimized data transformation

2. **CustomHeadToHeadTab.tsx**:
   - Limited displayed matches to 8
   - Optimized result property handling to reduce memory usage

## Usage

To run the application with minimal memory usage:

```bash
# PowerShell
./optimize-memory.ps1 run

# OR
npm run start:minmem
```

## Troubleshooting Memory Issues

If you encounter memory issues:

1. Try running with minimal memory: `npm run start:minmem`
2. Open browser dev tools and run `window.cleanMemory()`
3. Use the optimize-memory.ps1 script to clear caches

For persistent memory issues, try clearing the node_modules/.cache folder:

```powershell
Remove-Item -Path "node_modules/.cache" -Recurse -Force
```
