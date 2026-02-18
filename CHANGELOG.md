# Changelog

## [0.3.3] - 2026-02-18

### Fixed

#### 🐛 Tutorial Button Crash (High Priority — Resolved)
- **Error:** `Cannot read properties of null (reading 'style')` at `TutorialSystem.start`
- **Root Cause:** `updateTooltip()` and `positionTooltip()` accessed DOM elements before they were initialised
- **Fix:** Added null-guards and a `_ensureElements()` helper in `src/ui/tutorial.js` that guarantees all required DOM elements exist before any property access
- **Impact:** Tutorial button no longer crashes the game when clicked

### Performance

#### ⚡ Production Calculator — Research Multiplier Cache
- **Problem:** `recalculateProduction()` ran ~10× per second and iterated over all `completedResearch` entries on every call (O(n) per tick)
- **Fix:** Introduced a lazy-loaded `_cachedResearchMultiplier` in `GameState` and a `getResearchMultiplier(gameState)` helper in `src/core/production-calculator.js`
  - Cache is computed once and reused until invalidated
  - Cache is invalidated (set to `null`) in two places:
    - `GameState.performResearch()` — when new research is completed
    - `GameState.performDeployment()` — after the full state reset
- **Result:** Research multiplier lookup is now O(1) per tick instead of O(n)
- **Files changed:** `src/core/production-calculator.js`, `src/modules/game-state.js`
- **Note:** With 40+ research items planned for v1.0.0 this fix prevents a measurable slowdown in the late-game production loop

---

## [0.3.2] - 2026-02-12

### Added

#### 🧪 Test Infrastructure & CI/CD
- **GitHub Actions CI/CD Pipeline**
  - Automated testing on every push to main branch
  - Tests run on Node.js v18.x, v20.x, and v22.x
  - Vitest test runner with coverage support
  - Automatic build verification
- **Test Suite (26 Tests)**
  - `tests/basic.test.js`: 4 sanity check tests
  - `tests/core/resource-manager.test.js`: 11 tests for ResourceManager
  - `tests/core/production-calculator.test.js`: 11 tests for production calculation
- **Test Setup Files**
  - `tests/setup.js`: localStorage mock for Node.js environment
  - `vitest.config.js`: Test runner configuration

### Fixed

#### GitHub Actions & Dependencies
- **Critical**: Fixed npm dependency installation in CI/CD
  - Changed workflow from `npm ci` to `npm install`
  - Removed corrupted `package-lock.json` with invalid SHA512 checksums
  - npm now auto-generates correct lock file with valid integrity hashes
  - Resolved `EINTEGRITY` errors for vitest packages
- **Test Dependencies**: Added missing gameState properties for tests

### Changed

#### Test Cleanup
- Removed broken/incomplete test files
- Replaced with working, comprehensive test suites

### Known Issues

#### ❌ Tutorial Button Crash (High Priority)
**Error:** Cannot read properties of null (reading 'style') at TutorialSystem.start
**Status:** Not fixed  
**Impact:** Tutorial button crashes game when clicked  
**Workaround:** Avoid clicking Tutorial button  
**Fix Required:** Add null-check before accessing `.style` property

**Root Game Functionality:** ✅ All other features work correctly without errors
