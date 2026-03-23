# /hackatest - Q101 Automated QA Testing Command

**Version:** 2.12.27
**Last Updated:** 2026-01-22
**Status:** ACTIVE

> **Purpose:** Dual-mode automated testing for /hackathon MVPs (Playwright + Computer Use). Run autonomously with auto-dependency installation - invoke and walk away!

---

## Changelog (v2.12.27)

- **NEW:** Autonomous execution mode - bare `/hackatest` defaults to `--engine=both`
- **NEW:** Auto-dependency installation (Playwright, Chromium, Docker check)
- **NEW:** Auto-target detection (scans localhost:3000-3010)
- **NEW:** Auto-resolution for all blocking prompts (dependencies, target, PRP, errors)
- **NEW:** CRITICAL EXECUTION RULES section (matches /hackathon pattern)
- **NEW:** EXECUTION CHECKPOINT section
- **NEW:** STEP 0.5 Auto-Install Dependencies
- **ENHANCED:** Banner format aligned with /hackathon.md (seamless UX)
- **DOCS:** Added Auto-Resolution Logic section

---

## CRITICAL EXECUTION RULES

### Rule 1: BANNER FIRST

**When this command is invoked, your VERY FIRST OUTPUT must be the banner text.**

**BEFORE outputting the banner, you MUST NOT:**
- Read any file (VERSION.json, PRP.md, etc.)
- Call TodoWrite
- Call any tool

**The ONLY acceptable first action is:** Output the appropriate banner text based on arguments.

### Rule 2: AUTONOMOUS EXECUTION (MANDATORY)

**When `/hackatest` is invoked (with or without arguments), it MUST run to completion without user prompts.**

**Default Behavior (bare `/hackatest`):**
- Engine: `both` (run Playwright AND Computer Use)
- Auto-detect target URL (localhost:3000-3010)
- Auto-install dependencies if missing
- Auto-resolve all blocking prompts

**YOU MUST NOT:**
- Ask "Install Playwright? [Y/n]"
- Ask "Select engine [1/2/3]"
- Ask "Enter target URL:"
- Ask "Continue anyway? [Y/n]"
- Stop and wait for user input

**Auto-Resolution Table:**

| Prompt Type | Auto-Resolution |
|-------------|-----------------|
| Playwright missing | Auto-install: `npm install playwright && npx playwright install chromium` |
| Docker missing | Skip Computer Use, run Playwright only, log warning |
| Target URL | Auto-detect running server (scan localhost:3000-3010) |
| PRP not found | Use `--source=explore` (AI-inferred) |
| Test failure | Log and continue, include in report |
| Browser not installed | Auto-install: `npx playwright install chromium --with-deps` |

**Mental Model:** `/hackatest` runs like a CI/CD test suite - invoke and walk away.

### Rule 3: DEPENDENCY AUTO-INSTALL

**Before any test execution, verify and install dependencies:**

```bash
# Step 1: Check if Playwright is installed
npm list playwright 2>$null || npm install playwright

# Step 2: Check if browser is installed
npx playwright install chromium --with-deps

# Step 3: Verify Computer Use prerequisites (if --engine=computer-use or --engine=both)
docker info 2>$null || echo "⚠️ Docker not available, skipping Computer Use"
```

---

## A - ARTIFACTS (Output Patterns)

### Banner (Default - Autonomous Mode)

When invoked as `/hackatest` with no arguments (autonomous mode):

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackatest**                                     |
| Q101 Framework v2.12.27 Automated QA Testing       |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Autonomous | **Default Engine:** Both (Playwright + Computer Use)

>

## Autonomous Execution:

| Step | Action | Auto-Resolution |
|------|--------|-----------------|
| 1. INSTALL | Install dependencies | Auto-install Playwright if missing |
| 2. DETECT | Find target URL | Scan localhost:3000-3010 |
| 3. DISCOVER | Find test scenarios | Auto-use explore if PRP missing |
| 4. EXECUTE | Run both engines | Playwright first, then Computer Use |
| 5. REPORT | Generate HTML report | Self-contained with embedded assets |

>

**PRIME Integration:** Seamlessly chains from `/hackathon --then=hackatest`

>

**Starting autonomous testing...**
<!-- END EXACT OUTPUT -->

### Banner (Playwright Only)

When invoked as `/hackatest --engine=playwright`:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackatest --engine=playwright**                 |
| Q101 Framework v2.12.27 Fast Browser Testing       |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Playwright Only | **Speed:** Fast (~30s for 10 tests)

>

**Target:** `{target_url}`\
**Source:** `{source_mode}`\
**Browser:** `{browser}`\
**Viewport:** `{viewport}`

>

**Starting Playwright tests...**
<!-- END EXACT OUTPUT -->

### Banner (Computer Use Only)

When invoked as `/hackatest --engine=computer-use`:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackatest --engine=computer-use**               |
| Q101 Framework v2.12.27 Visual AI Testing          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Computer Use (Visual AI) | **Speed:** ~2-5min for 10 tests

>

**Target:** `{target_url}`\
**Source:** `{source_mode}`\
**Video Quality:** `{video_quality}`

>

**Launching Docker container for visual testing...**
<!-- END EXACT OUTPUT -->

### Banner (Silent/Chained Mode)

When invoked with `--silent` flag (typically via `/hackathon --then=hackatest`):

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackatest --silent**                            |
| Q101 Framework v2.12.27 Chained QA Testing         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Silent (Chained from /hackathon) | **Engine:** Both

>

**Target:** `{target_url}` (from hackathon context)\
**Source:** PRP.md or explore\
**Prompts:** All auto-resolved

>

**Running chained tests autonomously...**
<!-- END EXACT OUTPUT -->

### Banner (Help View)

When invoked as `/hackatest --help`:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackatest --help**                              |
| Q101 Framework v2.12.27 Testing Command Help       |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Dual-mode automated testing for /hackathon MVPs (Playwright + Computer Use)

>

## Engine Selection:

| Flag | Description | Speed | Default |
|------|-------------|-------|---------|
| `--engine=both` | Run Playwright AND Computer Use | Medium | Yes |
| `--engine=playwright` | Fast programmatic browser testing | Fast (~30s) | |
| `--engine=computer-use` | Visual AI testing with Claude | Slow (~2-5min) | |

>

## Target Options:

| Flag | Description | Default |
|------|-------------|---------|
| `--target=<url>` | Explicit target URL | Auto-detect |
| `--port=<number>` | Port for localhost scanning | 3000-3010 |

>

## Test Discovery:

| Flag | Description | Default |
|------|-------------|---------|
| `--source=prp` | Parse PRP.md for test scenarios | Yes |
| `--source=plan` | Use test-plan.md template | |
| `--source=explore` | AI-inferred exploration | Fallback |
| `--prp` | Search expanded PRP locations | |
| `--prp=<path>` | Explicit PRP file path | |

>

## Execution Mode:

| Flag | Description | Default |
|------|-------------|---------|
| (no args) | Autonomous (auto-resolve all prompts) | Yes |
| `--silent` | Explicit silent mode for chaining | |
| `--interactive` | Prompt for confirmations | |

>

## Verification Layers:

| Flag | Description | Default |
|------|-------------|---------|
| `--verify=visual` | UI elements, layout, images | |
| `--verify=functional` | Clicks, navigation, forms | |
| `--verify=content` | Data correctness verification | |
| `--verify=all` | All verification layers | Yes |

>

## Browser Matrix:

| Flag | Description | Default |
|------|-------------|---------|
| `--browser=chromium` | Chromium browser | Yes |
| `--browser=firefox` | Firefox browser | |
| `--browser=webkit` | WebKit browser | |
| `--browser=all` | All browsers | |
| `--viewport=desktop` | 1024x768 viewport | Yes |
| `--viewport=tablet` | 768x1024 viewport | |
| `--viewport=mobile` | 375x812 viewport | |
| `--viewport=all` | All viewports | |
| `--parallel=<n>` | Concurrent test count | 1 |

>

## Video Quality (Computer Use):

| Flag | Description | Default |
|------|-------------|---------|
| `--video-quality=high` | CRF 18, ~15MB/min | |
| `--video-quality=medium` | CRF 28, ~5MB/min | Yes |
| `--video-quality=low` | CRF 35, ~2MB/min | |

>

## Artifact Capture:

| Flag | Description | Default |
|------|-------------|---------|
| `--screenshots=on` | Capture all actions | Yes |
| `--screenshots=only-on-failure` | Failures only | |
| `--video=on` | Record all tests | |
| `--video=retain-on-failure` | Keep failed only | Yes |
| `--trace=on` | Full trace capture | |
| `--trace=retain-on-failure` | Keep failed only | Yes |

>

## Visual Regression:

| Flag | Description | Default |
|------|-------------|---------|
| `--baseline=create` | Create new baselines | |
| `--baseline=compare` | Compare against baselines | Yes |
| `--baseline=update` | Update existing baselines | |
| `--tolerance=<percent>` | Diff tolerance percentage | 0.1% |

>

## Output Options:

| Flag | Description | Default |
|------|-------------|---------|
| `--report=summary` | Executive summary only | |
| `--report=detailed` | Full step-by-step report | |
| `--report=both` | Summary + detailed | Yes |
| `--output=<path>` | Report output directory | |

>

## Authentication:

| Flag | Description | Default |
|------|-------------|---------|
| `--auth=auto` | Smart detection | Yes |
| `--auth=credentials` | Use .env credentials | |
| `--auth=bypass` | Test mode bypass | |

>

## Auto-Resolution (Autonomous Mode):

| Situation | Resolution |
|-----------|------------|
| Playwright missing | `npm install playwright` |
| Browser missing | `npx playwright install chromium` |
| Docker missing | Skip Computer Use, use Playwright only |
| Target not found | Scan localhost:3000-3010 |
| PRP not found | Use `--source=explore` fallback |
| Test failure | Log and continue, include in report |

>

## Examples:

```
/hackatest                              # Both engines, autonomous
/hackatest --engine=playwright          # Fast testing only
/hackatest --target=http://localhost:3001  # Explicit target
/hackatest --baseline=create            # Create visual baselines
/hackatest --browser=all --viewport=all # Full browser matrix
```

>

**Related:** `/hackathon --help` | `/hackathon --then=hackatest`
<!-- END EXACT OUTPUT -->

---

## Command Overview

`/hackatest` provides two testing engines:

| Engine | Description | Best For |
|--------|-------------|----------|
| **Playwright** | Fast programmatic browser automation | Regression testing, CI/CD pipelines |
| **Computer Use** | Visual AI testing with Claude seeing the screen | Exploratory testing, complex UIs, visual verification |

### Key Features

- **Dual Engine Support**: Run Playwright (fast) AND Computer Use (visual AI) by default
- **Auto-Dependency Install**: Playwright and browsers installed automatically
- **Auto-Target Detection**: Finds running server on localhost:3000-3010
- **PRP-Driven Testing**: Auto-generate test scenarios from PRP.md
- **AI Exploration Fallback**: Claude discovers and tests features if no PRP
- **Video Evidence**: MP4 recordings of each test scenario (Computer Use mode)
- **Visual Regression**: Baseline comparison with diff visualization
- **Self-Contained Reports**: Single HTML file with embedded assets

---

## Usage

### Engine Selection

| Flag | Description | Default |
|------|-------------|---------|
| `--engine=both` | Run both engines and compare results | Yes (bare invocation) |
| `--engine=playwright` | Fast programmatic browser automation only | |
| `--engine=computer-use` | Visual AI testing with Claude only | |

### Target Options

| Flag | Description | Default |
|------|-------------|---------|
| `--target=<url>` | Target application URL | Auto-detect |
| `--port=<number>` | Port for localhost | Auto-scan 3000-3010 |

### Test Discovery

| Flag | Description | Default |
|------|-------------|---------|
| `--source=prp` | Parse PRP.md for test scenarios | Yes |
| `--source=plan` | Use test-plan.md template | |
| `--source=explore` | AI-inferred exploration | Fallback if PRP missing |
| `--prp` | Search project for PRP.md (expanded locations) | |
| `--prp=<path>` | Use explicit path to PRP.md file | |

### Execution Mode

| Flag | Description | Default |
|------|-------------|---------|
| (none) | Autonomous mode (auto-resolve all prompts) | Yes |
| `--silent` | Explicit silent mode (for chaining) | |
| `--interactive` | Prompt for confirmations | |

### Verification Layers

| Flag | Description | Default |
|------|-------------|---------|
| `--verify=visual` | UI elements, layout, images | |
| `--verify=functional` | Clicks, navigation, forms | |
| `--verify=content` | Data correctness | |
| `--verify=all` | All verification layers | Yes |

### Browser Matrix

| Flag | Description | Default |
|------|-------------|---------|
| `--browser=chromium` | Chromium browser | Yes |
| `--browser=firefox` | Firefox browser | |
| `--browser=webkit` | WebKit browser | |
| `--browser=all` | All browsers | |
| `--viewport=desktop` | 1024x768 viewport | Yes |
| `--viewport=tablet` | 768x1024 viewport | |
| `--viewport=mobile` | 375x812 viewport | |
| `--viewport=all` | All viewports | |
| `--parallel=<count>` | Concurrent tests | `1` |

### Video Quality (Computer Use Only)

| Flag | Description | Default |
|------|-------------|---------|
| `--video-quality=high` | CRF 18, ~15MB/min | |
| `--video-quality=medium` | CRF 28, ~5MB/min | Yes |
| `--video-quality=low` | CRF 35, ~2MB/min | |

### Authentication

| Flag | Description | Default |
|------|-------------|---------|
| `--auth=auto` | Smart detection | Yes |
| `--auth=credentials` | Use .env credentials | |
| `--auth=bypass` | Test mode bypass | |

### Visual Regression

| Flag | Description | Default |
|------|-------------|---------|
| `--baseline=create` | Create new baselines | |
| `--baseline=compare` | Compare against baselines | Yes |
| `--baseline=update` | Update baselines | |
| `--tolerance=<percent>` | Diff tolerance | `0.1%` |

### Artifact Capture (NEW - v2.12.27)

**Playwright Engine:**

| Flag | Description | Default |
|------|-------------|---------|
| `--screenshots=on` | Capture screenshots on every action | Yes |
| `--screenshots=only-on-failure` | Capture only when test fails | |
| `--video=on` | Record video for all tests (pass/fail) | |
| `--video=retain-on-failure` | Keep video only for failures | Yes |
| `--trace=on` | Full Playwright trace for all tests | |
| `--trace=retain-on-failure` | Keep trace only for failures | Yes |

**Computer Use Engine:**

| Artifact | Behavior | Notes |
|----------|----------|-------|
| Screenshots | Always captured (all tests) | Required for visual AI |
| Video | Always recorded (all tests) | Full session recording |

**Summary:** Playwright captures screenshots always, video/trace on failure. Computer Use captures everything always.

### Output Options

| Flag | Description | Default |
|------|-------------|---------|
| `--report=summary` | Executive summary only | |
| `--report=detailed` | Full step-by-step | |
| `--report=both` | Both views | Yes |
| `--output=<path>` | Report output directory | |

---

## Engine Comparison

| Feature | Playwright | Computer Use |
|---------|------------|--------------|
| **Speed** | Fast (~30s for 10 tests) | Slower (~2-5min for 10 tests) |
| **Visual Intelligence** | Selector-based | AI sees the screen |
| **Complex UIs** | Requires precise selectors | Handles dynamic UIs naturally |
| **Screenshots** | Yes (all tests) | Yes (all tests) |
| **Video Recording** | On failure (--video=on for all) | Yes (all tests) |
| **Traces** | On failure (--trace=on for all) | N/A |
| **Resource Usage** | Low (browser only) | Higher (Docker + API calls) |
| **CI/CD Ready** | Yes | Yes (needs Docker) |
| **Cost** | Free | Uses Claude API tokens |
| **Best For** | Regression, smoke tests | Exploratory, visual QA |

### When to Use Each Engine

**Use Both (`--engine=both` - DEFAULT):**
- Comprehensive testing coverage
- Comparing programmatic vs visual AI results
- Finding issues that one engine might miss

**Use Playwright (`--engine=playwright`):**
- Fast regression testing in CI/CD
- Testing well-defined user flows
- Running tests frequently during development
- When selectors are stable and predictable

**Use Computer Use (`--engine=computer-use`):**
- Visual verification (does it "look right"?)
- Testing complex, dynamic UIs
- Exploratory testing without predefined scenarios
- When you need AI judgment on UI quality
- Accessibility and usability assessment

---

## Examples

### Basic Usage (Autonomous)
```bash
# DEFAULT: Run both engines autonomously
/hackatest

# Auto-detects target, installs dependencies, runs both engines
# No prompts, no configuration needed!
```

### Engine-Specific
```bash
# Fast Playwright testing only
/hackatest --engine=playwright

# Visual AI testing only
/hackatest --engine=computer-use

# Explicit both (same as default)
/hackatest --engine=both
```

### Target Options
```bash
# Explicit target URL
/hackatest --target=http://localhost:3001

# Let it auto-detect (scans 3000-3010)
/hackatest
```

### PRP Location Options
```bash
# Default: search workspace root only
/hackatest

# Expanded search: check multiple standard locations
/hackatest --prp

# Explicit path: use specific PRP file
/hackatest --prp=C:\Projects\MyApp\docs\PRP.md
/hackatest --prp=.claude/plans/custom-prp.md
```

### Visual Regression
```bash
# Create baselines with both engines
/hackatest --baseline=create

# Compare with specific tolerance
/hackatest --baseline=compare --tolerance=0.5
```

### Browser Matrix
```bash
# Test all browsers with Playwright
/hackatest --browser=all --engine=playwright

# Test all viewports
/hackatest --viewport=all

# Full matrix
/hackatest --browser=all --viewport=all --parallel=3
```

### Integration with /hackathon
```bash
# Chain from hackathon (runs both engines)
/hackathon --then=hackatest

# Chain with specific engine
/hackathon --quality=polish --then="hackatest --engine=computer-use"
```

### Integration with /hackafeed (The Hackathon Trilogy)
```bash
# Chain to improvement loop
/hackatest --then=hackafeed

# Full trilogy: Build → Validate → Improve
/hackathon --then=hackatest --then=hackafeed

# With quality target
/hackatest --then="hackafeed --target=100"
```

---

## EXECUTION CHECKPOINT - READ BEFORE PROCEEDING

**STOP. Before you output ANYTHING, verify:**

- [ ] Have I output the banner text yet? **If NO -> Go to STEP 0 NOW**
- [ ] Did I write "I'll execute..." or similar? **If YES -> YOU VIOLATED THE RULE**
- [ ] Did I call any tools (Read, TodoWrite, etc.)? **If YES -> YOU VIOLATED THE RULE**

**ONLY after displaying the banner may you proceed to read files and call tools.**

---

## Execution Flow

### STEP 0: Parse Arguments & Display Banner

Check arguments to determine mode:

| Pattern | Banner | Engine Default |
|---------|--------|----------------|
| `--help` | Help banner | N/A (STOP after banner) |
| (no args) | Autonomous banner | both |
| `--engine=playwright` | Playwright banner | playwright |
| `--engine=computer-use` | Computer Use banner | computer-use |
| `--engine=both` | Autonomous banner | both |
| `--silent` | Silent/Chained banner | both |

**CRITICAL:** Output the appropriate banner IMMEDIATELY. No tool calls before this.

**If `--help` flag detected:** After displaying the Help banner, **STOP IMMEDIATELY**. Do not proceed to dependency installation, test execution, or any other steps.

### STEP 0.5: Auto-Install Dependencies

**Run IMMEDIATELY after banner, BEFORE any test discovery.**

**0.5.1 Check Playwright Installation:**

```powershell
# Check if playwright package exists
$playwrightInstalled = npm list playwright 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "📦 Installing Playwright..."
    npm install playwright
}
```

Display: `✅ Playwright package installed`

**0.5.2 Install Browser:**

```powershell
# Install Chromium browser with dependencies
Write-Host "🌐 Installing Chromium browser..."
npx playwright install chromium --with-deps
```

Display: `✅ Chromium browser installed`

**0.5.3 Check Docker (for Computer Use):**

```powershell
$dockerAvailable = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Docker not available - Computer Use engine will be skipped"
    $skipComputerUse = $true
} else {
    Write-Host "✅ Docker available for Computer Use"
}
```

**0.5.4 Display Dependencies Summary:**

```
──────────────────────────────────────────────────────────────────────────────
                         DEPENDENCIES CHECK
──────────────────────────────────────────────────────────────────────────────
  ✅ Playwright: Installed (v1.x.x)
  ✅ Chromium: Installed
  ⚠️ Docker: Not available (Computer Use skipped)
  ✅ Target: http://localhost:3000 (detected)
──────────────────────────────────────────────────────────────────────────────
```

### STEP 1: Auto-Detect Target URL

**Priority chain:**

| Priority | Source | Detection |
|----------|--------|-----------|
| 1 | `--target=<url>` | Explicit URL provided |
| 2 | `.hackathon-context.json` | Read `phases.launch.outputs.server_url` |
| 3 | Scan localhost | Check ports 3000-3010 for running server |
| 4 | **DEFAULT** | `http://localhost:3000` |

```powershell
# Scan ports 3000-3010 for running server
for ($port = 3000; $port -le 3010; $port++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $targetUrl = "http://localhost:$port"
            break
        }
    } catch {
        # Port not responding, try next
    }
}
```

Display: `🎯 Target detected: http://localhost:{port}`

### STEP 2: Discover Test Scenarios

**Priority chain:**

| Priority | Source | Detection |
|----------|--------|-----------|
| 1 | `--source=<mode>` | Explicit source provided |
| 2 | `--prp=<path>` | Explicit PRP path |
| 3 | PRP.md in standard locations | Search 4 locations |
| 4 | **DEFAULT** | `--source=explore` (AI-inferred) |

**PRP Search Locations:**
1. `./PRP.md`
2. `./.claude/plans/PRP.md`
3. `./.claude/context/PRP.md`
4. `./**/PRP.md` (first match)

Display: `📋 Test source: PRP.md (12 scenarios found)` or `📋 Test source: AI Exploration`

### STEP 3: Execute Playwright Tests

```
──────────────────────────────────────────────────────────────────────────────
                         PLAYWRIGHT TESTING
──────────────────────────────────────────────────────────────────────────────
```

1. **LAUNCH** - Start Playwright browser (Chromium)
2. **EXECUTE** - Run test scenarios programmatically
3. **CAPTURE** - Take screenshots at each step
4. **COMPARE** - Run visual regression against baselines
5. **COLLECT** - Gather results for combined report

Display progress:
```
  ✅ Scenario 1: User Login (1.2s)
  ✅ Scenario 2: Dashboard Navigation (0.8s)
  ⚠️ Scenario 3: Settings Update (FAIL - element not found)
  ✅ Scenario 4: Logout Flow (0.5s)
```

### STEP 4: Execute Computer Use Tests (if Docker available)

```
──────────────────────────────────────────────────────────────────────────────
                       COMPUTER USE TESTING
──────────────────────────────────────────────────────────────────────────────
```

1. **CONTAINER** - Launch Docker container with virtual display
2. **CONNECT** - Connect Claude to container via Computer Use API
3. **EXECUTE** - Claude visually interacts with the application
4. **RECORD** - Capture video of entire session
5. **ANALYZE** - Claude provides visual assessment
6. **COLLECT** - Gather results for combined report

Display progress:
```
  🐳 Docker container started
  🔗 Claude connected to virtual display
  👁️ Testing Scenario 1: User Login...
  📹 Recording session video...
```

### STEP 5: Generate Combined Report

```
──────────────────────────────────────────────────────────────────────────────
                         GENERATING REPORT
──────────────────────────────────────────────────────────────────────────────
```

Generate self-contained HTML report with:
- Executive summary (pass/fail counts per engine)
- Side-by-side engine comparison
- Screenshots from Playwright
- Video clips from Computer Use
- Visual regression diffs
- Detailed step-by-step logs

Output location: `.claude/reports/hackatest/{timestamp}/`

### STEP 6: Display Final Summary

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          HACKATEST COMPLETE                                   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  TARGET: http://localhost:3000                                                ║
║                                                                               ║
║  PLAYWRIGHT RESULTS:                                                          ║
║  ├── Scenarios: 12 total                                                      ║
║  ├── Passed: 11 (92%)                                                         ║
║  ├── Failed: 1                                                                ║
║  └── Duration: 8.3s                                                           ║
║                                                                               ║
║  COMPUTER USE RESULTS:                                                        ║
║  ├── Scenarios: 12 total                                                      ║
║  ├── Passed: 12 (100%)                                                        ║
║  ├── Visual Issues: 2 (minor)                                                 ║
║  └── Duration: 4m 12s                                                         ║
║                                                                               ║
║  COMPARISON:                                                                  ║
║  ├── Agreement: 11/12 scenarios (92%)                                         ║
║  └── Discrepancy: Scenario 3 (Playwright fail, Computer Use pass)             ║
║                                                                               ║
║  📊 Report: .claude/reports/hackatest/2026-01-22-143052/report.html           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Auto-Resolution Logic (Autonomous Mode)

In autonomous mode (default), all blocking prompts are automatically resolved:

### Dependency Installation

```
IF playwright not installed:
    → npm install playwright
    → npx playwright install chromium --with-deps
    ℹ️ Playwright installed automatically

IF docker not available AND engine includes computer-use:
    → log("⚠️ Docker not available, skipping Computer Use engine")
    → fallback to playwright-only
```

### Target URL Detection

**Priority chain:**

| Priority | Source | Detection |
|----------|--------|-----------|
| 1 | `--target=<url>` | Explicit URL provided |
| 2 | `.hackathon-context.json` | Read launch.server_url |
| 3 | Scan localhost | Check ports 3000-3010 for running server |
| 4 | **DEFAULT** | `http://localhost:3000` |

### Test Source Resolution

**Priority chain:**

| Priority | Source | Detection |
|----------|--------|-----------|
| 1 | `--source=<mode>` | Explicit source provided |
| 2 | `--prp=<path>` | Explicit PRP path |
| 3 | PRP.md in standard locations | Search 4 locations |
| 4 | **DEFAULT** | `--source=explore` (AI-inferred) |

### Error Handling

| Error | Auto-Resolution |
|-------|-----------------|
| Test failure | Log result, continue to next scenario |
| Browser crash | Restart browser, retry scenario once |
| Timeout | Increase timeout to 60s, retry once |
| Docker missing | Skip Computer Use, use Playwright only |
| API rate limit | Wait 30s, retry |
| Network error | Retry 3x with 2s backoff |

---

## Silent Mode (--silent)

When invoked with `--silent` flag (typically via `--then=hackatest` chaining from `/hackathon`):

**Behavior:**
- All auto-resolution from autonomous mode
- No console output except final summary
- Exit code reflects pass/fail status
- Perfect for CI/CD pipelines

**Example (chained from /hackathon):**
```bash
/hackatest --target=http://localhost:3000 --source=prp --verify=all --silent
```

**When to Use:**
- Chained from `/hackathon --then=hackatest`
- CI/CD pipeline integration
- Unattended testing scenarios

---

## Prerequisites

### Playwright Mode (Auto-Installed)
- **Node.js 18+** installed
- **Playwright** package (auto-installed if missing)
- **Chromium** browser (auto-installed if missing)

### Computer Use Mode
- **Docker Desktop** must be installed and running
- **ANTHROPIC_API_KEY** environment variable set
- Ports 5900 (VNC) and 6080 (noVNC) available

---

## Output Files

| File | Description | Engine |
|------|-------------|--------|
| `report.html` | Self-contained HTML report | Both |
| `test-results.json` | Machine-readable results | Both |
| `screenshots/*.png` | Screenshots per scenario (all tests) | Both |
| `videos/*.webm` | Video recording (on failure, or --video=on) | Playwright |
| `traces/*.zip` | Playwright trace files (on failure, or --trace=on) | Playwright |
| `session.mp4` | Full session recording (all tests) | Computer Use |
| `scenario-*.mp4` | Per-scenario video clips (all tests) | Computer Use |
| `scenario-*.gif` | GIF previews | Computer Use |

Output location: `.claude/reports/hackatest/{timestamp}/`

---

## Test Plan Template

Create `test-plan.md` in your project root:

```markdown
---
hackatest_version: 1.0
app_name: "My App"
target: "http://localhost:3000"
auth_strategy: auto
---

# Test Plan: My App

## Test Configuration

| Setting | Value |
|---------|-------|
| Browser | chromium |
| Viewports | desktop, mobile |
| Verify | all |
| Retry | 3 |

## Test Credentials (if needed)

| Field | Value |
|-------|-------|
| Username | test@example.com |
| Password | ${TEST_PASSWORD} |

---

## Test Scenarios

### Scenario 1: User Login

**Description:** Verify user can log in with valid credentials

**Preconditions:**
- User is on login page
- Valid test credentials exist

**Steps:**
1. Navigate to /login
2. Enter username in email field
3. Enter password in password field
4. Click "Sign In" button

**Expected Results:**
- Redirect to dashboard
- Welcome message displayed
- User avatar visible

---

### Scenario 2: Dashboard Navigation

**Description:** Verify dashboard elements

**Steps:**
1. Navigate to /dashboard
2. Verify navigation menu visible
3. Click "Settings" link
4. Verify settings page loads

**Expected Results:**
- Navigation works correctly
- Settings page displays
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude API key | Required (Computer Use) |
| `TARGET_URL` | Application URL | Auto-detect |
| `TEST_SOURCE` | Test discovery mode | prp |
| `TEST_ENGINE` | Default engine | both |
| `BROWSER` | Browser to use | chromium |
| `VIEWPORT` | Viewport preset | desktop |
| `VIDEO_QUALITY` | Recording quality | medium |
| `TOLERANCE` | Visual diff tolerance | 0.1 |
| `TEST_USERNAME` | Test account username | - |
| `TEST_PASSWORD` | Test account password | - |
| `PRP_PATH` | Custom PRP.md location | Auto-detect |

---

## Computer Use Docker Setup

The Computer Use engine uses Anthropic's official Docker image:

```bash
# Pull the image (done automatically)
docker pull ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest

# Manual run (for debugging)
docker run -d \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  -p 5900:5900 \
  -p 6080:6080 \
  -p 8501:8501 \
  ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest
```

### Container Ports

| Port | Service | Purpose |
|------|---------|---------|
| 5900 | VNC | Direct VNC connection |
| 6080 | noVNC | Web-based VNC viewer |
| 8501 | Streamlit | Control interface |

---

## Troubleshooting

### Playwright Mode

**Module not found**
Dependencies auto-install, but you can manually install:
```bash
npm install playwright
npx playwright install chromium --with-deps
```

**Timeout errors**
Increase timeout for slow pages:
```bash
/hackatest --timeout=30000
```

### Computer Use Mode

**Docker not found**
Computer Use will be skipped automatically. Install Docker Desktop to enable.

**Container fails to start**
Check that ports 5900 and 6080 are available:
```bash
netstat -an | findstr "5900 6080"
```

**API key not set**
Set ANTHROPIC_API_KEY in your environment or .env file.

**Connection refused to localhost**
The container cannot access host's localhost. Use host IP or:
```bash
--target=http://host.docker.internal:3000
```

### General

**No scenarios found**
If PRP.md is not found, hackatest automatically falls back to `--source=explore` (AI-inferred exploration).

**Target not detected**
If no server is found on ports 3000-3010, hackatest defaults to `http://localhost:3000`.

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `/hackathon` | Build MVPs that /hackatest tests |
| `/prepare` | Set up environment before testing |
| `/evaluate` | Comprehensive application evaluation |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.12.27 | 2026-01-22 | Autonomous mode, auto-dependency install, banner alignment |
| 2.12.26 | 2026-01-21 | Initial dual-engine release |

---

*Q101 Framework v2.12.27*
