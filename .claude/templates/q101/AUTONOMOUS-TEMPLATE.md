# AUTONOMOUS-TEMPLATE.md

**Version:** 2.12.12
**Last Updated:** 2026-01-10
**Purpose:** Template for autonomous coding session artifacts

---

## Feature List Template (feature-list.json)

```json
{
  "spec_version": "1.0",
  "app_name": "{APPLICATION_NAME}",
  "created": "{ISO8601_TIMESTAMP}",
  "source": "{PRD.md|PRP.md|idea-context.md|manual}",
  "features": [
    {
      "id": "F001",
      "name": "{FEATURE_NAME}",
      "category": "{CATEGORY}",
      "priority": 1,
      "passes": false,
      "verification": {
        "type": "{e2e|unit|integration|manual}",
        "description": "{VERIFICATION_CRITERIA}"
      },
      "implemented_at": null,
      "session_number": null
    }
  ]
}
```

### Field Definitions

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `spec_version` | string | No | Template version |
| `app_name` | string | No | Application name |
| `created` | ISO8601 | No | Creation timestamp |
| `source` | string | No | Context source |
| `features` | array | Append only | Feature list |

### Feature Fields

| Field | Type | Mutable | Description |
|-------|------|---------|-------------|
| `id` | string | **No** | Unique ID (F001, F002...) |
| `name` | string | **No** | Feature description |
| `category` | string | **No** | Feature category |
| `priority` | integer | **No** | Priority (1 = highest) |
| `passes` | boolean | **Yes** | Verification status |
| `verification.type` | string | **No** | Test type |
| `verification.description` | string | **No** | Criteria |
| `implemented_at` | ISO8601 | **Yes** | Completion timestamp |
| `session_number` | integer | **Yes** | Session that completed |

---

## Session State Template (session-state.json)

```json
{
  "session_id": "auto-{YEAR}-{SEQUENCE}",
  "project_path": "{ABSOLUTE_PATH}",
  "mode": "{standard|full}",
  "status": "{running|paused|completed|failed}",
  "created": "{ISO8601_TIMESTAMP}",
  "limits": {
    "max_sessions": 20,
    "max_iterations": 50
  },
  "progress": {
    "current_session": 1,
    "current_feature": null,
    "feature_progress_percent": 0,
    "checkpoint_commit": null,
    "last_activity": "{ISO8601_TIMESTAMP}"
  },
  "stats": {
    "total_features": 0,
    "features_complete": 0,
    "features_failing": 0,
    "features_remaining": 0,
    "elapsed_time_minutes": 0
  },
  "source_context": {
    "from_ideate": null,
    "from_research": [],
    "from_initialize": false,
    "from_generate": false
  }
}
```

### Mode Values

| Mode | max_sessions | max_iterations | Description |
|------|--------------|----------------|-------------|
| `standard` | 20 | 50 | Default with limits |
| `full` | null | null | No limits |

### Status Values

| Status | Description |
|--------|-------------|
| `running` | Session currently active |
| `paused` | Paused by user or limit |
| `completed` | All features done |
| `failed` | Unrecoverable error |

---

## Progress Log Template (progress.txt)

```
═══════════════════════════════════════════════════════════════════
AUTONOMOUS CODING SESSION - {APP_NAME}
═══════════════════════════════════════════════════════════════════

Session 1 ({DATE} {TIME}) - INITIALIZER
──────────────────────────────────────────
✓ Analyzed context sources
✓ Detected tech stack: {TECH_STACK}
✓ Generated feature-list.json ({N} features)
✓ Created {init.ps1|init.sh}
✓ Initialized git repository
✓ Baseline commit: {COMMIT_HASH}

───────────────────────────────────────
Progress: 0/{N} features (0%)
Next: Session 2 - Feature F001
───────────────────────────────────────

Session 2 ({DATE} {TIME}) - CODING
──────────────────────────────────────────
Feature: F001 - {FEATURE_NAME}
✓ {Implementation step 1}
✓ {Implementation step 2}
✓ Added tests ({N} passing)
✓ {Verification type} verification passed
✓ Commit: {COMMIT_HASH}

Time: {MINUTES} minutes
───────────────────────────────────────
Progress: 1/{N} features ({PERCENT}%)
Next: Session 3 - Feature F002
───────────────────────────────────────

[Additional sessions continue...]

═══════════════════════════════════════
COMPLETION SUMMARY
═══════════════════════════════════════
Total Features:  {N}
Total Sessions:  {N}
Total Time:      {MINUTES} minutes
Final Commit:    {COMMIT_HASH}
═══════════════════════════════════════
```

---

## Autonomous Registry Template (autonomous-registry.json)

```json
{
  "registry_version": "1.0",
  "framework_version": "2.12.12",
  "current_session": null,
  "sessions": [
    {
      "session_id": "auto-{YEAR}-{SEQUENCE}",
      "project_path": "{ABSOLUTE_PATH}",
      "project_name": "{PROJECT_NAME}",
      "created": "{ISO8601_TIMESTAMP}",
      "status": "{running|paused|completed|failed}",
      "mode": "{standard|full}",
      "total_sessions": 0,
      "current_session_number": 0,
      "source_context": {
        "from_ideate": null,
        "from_research": [],
        "from_initialize": false,
        "from_generate": false,
        "from_analyze": null
      },
      "features": {
        "total": 0,
        "passing": 0,
        "failing": 0,
        "pending": 0
      },
      "last_checkpoint": null,
      "git_commit": null,
      "elapsed_time_minutes": 0,
      "completed_at": null
    }
  ]
}
```

---

## Init Script Template (Windows - init.ps1)

```powershell
# Q101 Autonomous - Environment Init
# Project: {APP_NAME}
# Generated: {TIMESTAMP}
# Framework: Q101 v2.12.12

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "  Q101 Autonomous - Environment Initialization"
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..."
{PREREQUISITE_CHECKS}

# Install dependencies
Write-Host "Installing dependencies..."
{DEPENDENCY_INSTALLATION}

# Setup database (if applicable)
{DATABASE_SETUP}

# Build project
Write-Host "Building project..."
{BUILD_COMMANDS}

# Start dev server (background)
Write-Host "Starting development server..."
{SERVER_START}

# Verify setup
Write-Host ""
Write-Host "Verifying environment..."
{VERIFICATION_COMMANDS}

Write-Host ""
Write-Host "✓ Environment ready for autonomous development"
Write-Host ""
```

### Node.js Example (init.ps1)

```powershell
# Q101 Autonomous - Environment Init
# Project: MyApp
# Generated: 2026-01-10T10:00:00Z
# Framework: Q101 v2.12.12

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host "  Q101 Autonomous - Environment Initialization"
Write-Host "═══════════════════════════════════════════════════════════════"
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found. Please install Node.js 18+."
    exit 1
}
Write-Host "  ✓ Node.js $(node --version)"

# Install dependencies
Write-Host "Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "  ✓ Dependencies installed"

# Setup database (if Prisma)
if (Test-Path "prisma/schema.prisma") {
    Write-Host "Setting up database..."
    npx prisma generate
    npx prisma db push
    Write-Host "  ✓ Database ready"
}

# Build project
Write-Host "Building project..."
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }
Write-Host "  ✓ Build successful"

# Start dev server (background)
Write-Host "Starting development server..."
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"
Start-Sleep -Seconds 5

# Verify setup
Write-Host ""
Write-Host "Verifying environment..."
$response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
if ($response.StatusCode -eq 200) {
    Write-Host "  ✓ Dev server responding"
} else {
    Write-Warning "Dev server may not be ready yet"
}

Write-Host ""
Write-Host "✓ Environment ready for autonomous development"
Write-Host ""
```

---

## Init Script Template (Unix - init.sh)

```bash
#!/bin/bash
# Q101 Autonomous - Environment Init
# Project: {APP_NAME}
# Generated: {TIMESTAMP}
# Framework: Q101 v2.12.12

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Q101 Autonomous - Environment Initialization"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
{PREREQUISITE_CHECKS}

# Install dependencies
echo "Installing dependencies..."
{DEPENDENCY_INSTALLATION}

# Setup database (if applicable)
{DATABASE_SETUP}

# Build project
echo "Building project..."
{BUILD_COMMANDS}

# Start dev server (background)
echo "Starting development server..."
{SERVER_START}

# Verify setup
echo ""
echo "Verifying environment..."
{VERIFICATION_COMMANDS}

echo ""
echo "✓ Environment ready for autonomous development"
echo ""
```

### Python Example (init.sh)

```bash
#!/bin/bash
# Q101 Autonomous - Environment Init
# Project: MyApp
# Generated: 2026-01-10T10:00:00Z
# Framework: Q101 v2.12.12

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Q101 Autonomous - Environment Initialization"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 not found"
    exit 1
fi
echo "  ✓ Python $(python3 --version)"

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
echo "  ✓ Virtual environment activated"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt
echo "  ✓ Dependencies installed"

# Setup database (if Alembic)
if [ -f "alembic.ini" ]; then
    echo "Setting up database..."
    alembic upgrade head
    echo "  ✓ Database ready"
fi

# Start dev server (background)
echo "Starting development server..."
uvicorn main:app --reload &
sleep 5

# Verify setup
echo ""
echo "Verifying environment..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "  ✓ Dev server responding"
else
    echo "  ⚠ Dev server may not be ready yet"
fi

echo ""
echo "✓ Environment ready for autonomous development"
echo ""
```

---

## Feature Categories Reference

| Category | Description | Examples |
|----------|-------------|----------|
| `setup` | Project infrastructure | Config, folder structure, CI/CD |
| `authentication` | User identity | Login, registration, MFA |
| `authorization` | Access control | Roles, permissions, policies |
| `data` | Data layer | Models, schemas, migrations |
| `api` | Backend endpoints | REST/GraphQL, validation |
| `ui` | Frontend interface | Components, pages, layouts |
| `integration` | External services | Payment, email, analytics |
| `testing` | Quality assurance | Test suites, fixtures |
| `documentation` | Project docs | README, API docs, guides |
| `deployment` | Release | Build, deploy, monitoring |

---

## Verification Types Reference

| Type | Description | Tools |
|------|-------------|-------|
| `unit` | Isolated function testing | Jest, Pytest, Go test |
| `integration` | Component interaction | Supertest, TestClient |
| `e2e` | Full user flow | Playwright, Puppeteer, Cypress |
| `manual` | Human verification | Visual inspection |
| `api` | Endpoint testing | curl, httpie, Postman |

---

## Git Commit Message Template

```
{type}({feature_id}): {short_description}

{detailed_description}

Verified: {verification_result}
Session: {session_number} of {session_id}
```

### Commit Types

| Type | Description |
|------|-------------|
| `feat` | New feature implementation |
| `fix` | Bug fix |
| `refactor` | Code restructuring |
| `test` | Test additions |
| `docs` | Documentation |
| `chore` | Maintenance |

### Example

```
feat(F005): Implement dashboard with user statistics

- Created Dashboard component with stats display
- Added UserStatsService for data aggregation
- Implemented ActivityFeed component
- Added 12 unit tests, 3 integration tests

Verified: All tests passing, E2E verified
Session: 5 of auto-2026-001
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.12.12 | 2026-01-10 | Initial release |
