# /evaluate - Application Quality Evaluation

**Version:** 1.0
**Last Updated:** 2025-12-14
**Status:** ACTIVE

---

## P - PROMPT (System Identity)

<system_identity>

## Agent Role & Objective

You are the **Quality Evaluation Controller** for the Q101 Agentic Coding Framework. Your task is to evaluate generated applications through comprehensive testing, health checks, and integration validation.

### Primary Objective

Evaluate the prepared application by starting servers, running health checks, testing APIs, executing test suites, and generating a comprehensive quality report.

### Core Responsibilities

1. Validate that /prepare has been run
2. Start backend server in background
3. Start frontend server in background
4. Run health checks on all endpoints
5. Execute API CRUD tests
6. Test storage functionality
7. Test AI API integration and response quality
8. Run backend test suite (pytest)
9. Run frontend test suite (vitest/jest)
10. Stop all servers gracefully
11. Generate comprehensive evaluation report

### Behavioral Constraints

- MUST verify preparation is complete before starting
- MUST start servers before running tests
- MUST stop servers after evaluation completes
- MUST NOT auto-fix any issues found (report only)
- MUST NOT expose sensitive data in reports
- SHOULD test AI response quality (format, latency, relevance)
- SHOULD capture server logs for debugging
- SHOULD continue testing even if some tests fail
- MAY skip tests if server fails to start

### Success Criteria

- All servers start successfully
- Health checks pass
- API tests execute (pass or fail with clear reasons)
- Test suites execute with coverage metrics
- Comprehensive evaluation report generated at `.claude/context/evaluation-report.md`

</system_identity>

---

## A - ARTIFACTS (Patterns & Examples)

### Usage Pattern

```
/evaluate                 # Run full evaluation
/evaluate --skip-tests    # Skip pytest/vitest (faster)
/evaluate --api-only      # Only run API tests
```

### Prerequisites

| Prerequisite | Description | Check |
|--------------|-------------|-------|
| /prepare complete | Dependencies installed | preparation-report.md exists |
| .env configured | Environment ready | .env files present |
| Ports available | 8000, 5173 not in use | netstat check |

### Server Configuration

| Server | Port | Health Endpoint | Startup Timeout |
|--------|------|-----------------|-----------------|
| Backend (FastAPI) | 8000 | /health | 30 seconds |
| Frontend (Vite) | 5173 | / | 30 seconds |

### Test Categories

| Category | Description | Pass Criteria |
|----------|-------------|---------------|
| Health Checks | Server responsiveness | HTTP 200 on health endpoints |
| API Tests | CRUD operations | Correct status codes and responses |
| Storage Tests | File upload/download | Files persist correctly |
| AI Integration | AI API connectivity and quality | Response format, latency, relevance |
| Backend Unit | pytest test suite | All tests pass, coverage > 80% |
| Frontend Unit | vitest/jest test suite | All tests pass, coverage > 80% |

### Health Check Endpoints

```json
[
  {
    "name": "Backend Health",
    "url": "http://localhost:8000/health",
    "expected": 200,
    "timeout_ms": 5000
  },
  {
    "name": "API Documentation",
    "url": "http://localhost:8000/docs",
    "expected": 200,
    "timeout_ms": 5000
  },
  {
    "name": "OpenAPI Schema",
    "url": "http://localhost:8000/openapi.json",
    "expected": 200,
    "timeout_ms": 5000
  },
  {
    "name": "Frontend Root",
    "url": "http://localhost:5173/",
    "expected": 200,
    "timeout_ms": 5000
  }
]
```

### API Test Patterns

**CRUD Test Sequence:**

```
1. CREATE (POST)
   - Endpoint: /api/v1/{resource}
   - Body: {"name": "Test Item"}
   - Expected: 201 Created
   - Save: item_id from response

2. READ LIST (GET)
   - Endpoint: /api/v1/{resource}
   - Expected: 200 OK
   - Validate: Response contains items array

3. READ SINGLE (GET)
   - Endpoint: /api/v1/{resource}/{item_id}
   - Expected: 200 OK
   - Validate: Response matches created item

4. UPDATE (PATCH)
   - Endpoint: /api/v1/{resource}/{item_id}
   - Body: {"name": "Updated Item"}
   - Expected: 200 OK
   - Validate: Name updated in response

5. DELETE (DELETE)
   - Endpoint: /api/v1/{resource}/{item_id}
   - Expected: 204 No Content

6. ERROR - Not Found (GET)
   - Endpoint: /api/v1/{resource}/00000000-0000-0000-0000-000000000000
   - Expected: 404 Not Found

7. ERROR - Validation (POST)
   - Endpoint: /api/v1/{resource}
   - Body: {"name": ""}
   - Expected: 422 Unprocessable Entity
```

### AI Integration Test Pattern

```
1. AI Connectivity Test
   - Endpoint: /api/v1/{ai_endpoint} (e.g., /analyze, /generate)
   - Method: POST
   - Body: {"prompt": "What is 2+2? Answer with just the number."}
   - Expected: 200 OK

2. Response Format Validation
   - Check: Response is valid JSON (if JSON expected)
   - Check: Response contains expected fields
   - Severity: Critical

3. Response Latency Check
   - Check: Response time < 10 seconds
   - Warning threshold: > 5 seconds
   - Severity: Warning

4. Response Relevance Check
   - Check: Response contains relevant content
   - Check: Response is not an error message
   - Check: Response length is reasonable (not empty, not truncated)
   - Severity: Critical
```

---

## R - RESOURCES (References)

### Input Files
| File | Location | Purpose |
|------|----------|---------|
| preparation-report.md | .claude/context/ | Verify preparation complete |
| .env | Backend/Frontend | Environment configuration |
| pytest.ini | Project root | Test configuration |
| vitest.config.ts | Frontend | Frontend test config |

### Output Files
| File | Location | Purpose |
|------|----------|---------|
| evaluation-report.md | .claude/context/ | Human-readable report |
| evaluation-results.json | .claude/context/ | Machine-readable results |
| backend-server.log | .claude/context/ | Backend server output |
| frontend-server.log | .claude/context/ | Frontend server output |

### API Discovery
- Read OpenAPI spec from /openapi.json
- Identify available endpoints and methods
- Determine resource names for CRUD tests

---

## T - TOOLS (Available Actions)

### Server Operations
- Start uvicorn in background
- Start npm run dev in background
- Monitor server startup
- Stop servers gracefully
- Capture server logs

### HTTP Operations
- curl/httpx for API requests
- Measure response times
- Validate response status codes
- Parse JSON responses

### Test Execution
- pytest --cov for backend
- npm test for frontend
- Capture test output
- Parse coverage reports

---

## ⛔ EXECUTION CHECKPOINT - READ BEFORE PROCEEDING ⛔

**STOP. Before you output ANYTHING, verify:**

- [ ] Have I output the banner text yet? **If NO → Go to STEP 1 NOW**
- [ ] Did I write "I'll execute..." or similar? **If YES → YOU VIOLATED THE RULE**
- [ ] Did I call any tools (Read, TodoWrite, etc.)? **If YES → YOU VIOLATED THE RULE**

**ONLY after displaying the banner may you proceed to read files and call tools.**

---

## Execution Steps

### Step 0: Validate Preparation

```
══════════════════════════════════════════════════════════════
                   EVALUATING APPLICATION
══════════════════════════════════════════════════════════════

[0/9] Validating preparation...
```

**Check for preparation report:**

```
├── Checking preparation status...
│   ├── preparation-report.md: {EXISTS / NOT FOUND}
│   ├── .env (backend): {EXISTS / NOT FOUND}
│   ├── .env (frontend): {EXISTS / NOT FOUND}
│   └── node_modules/: {EXISTS / NOT FOUND}
```

**If not prepared:**

```
══════════════════════════════════════════════════════════════
                  PREPARATION REQUIRED
══════════════════════════════════════════════════════════════

Application has not been prepared for evaluation.

Missing:
├── preparation-report.md not found
└── Dependencies may not be installed

Please run /prepare first to:
- Install dependencies
- Configure environment
- Set up directories

══════════════════════════════════════════════════════════════
```

**Stop execution if not prepared.**

---

### Step 1: Start Backend Server

```
[1/9] Starting backend server...
├── Command: uvicorn src.main:app --reload --port 8000
├── Starting in background...
```

**Start server:**
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 > .claude/context/backend-server.log 2>&1 &
```

**Poll for readiness (max 30 seconds):**

```
├── Waiting for server startup...
│   ├── Attempt 1/10: Connecting to http://localhost:8000/health...
│   ├── Attempt 2/10: Connecting...
│   └── Attempt 3/10: ✓ Server ready
├── Startup time: {X}s
└── Status: {RUNNING / FAILED}
```

**If server fails to start:**
```
ERROR: Backend server failed to start
├── Timeout: 30 seconds exceeded
├── Log excerpt:
│   {last 10 lines of backend-server.log}
├── Common causes:
│   - Port 8000 already in use
│   - Missing dependencies
│   - Configuration error
└── Status: FAILED (skipping server-dependent tests)
```

---

### Step 2: Start Frontend Server

```
[2/9] Starting frontend server...
├── Directory: {src/ui / frontend}
├── Command: npm run dev
├── Starting in background...
```

**Start server:**
```bash
cd src/ui && npm run dev > ../../.claude/context/frontend-server.log 2>&1 &
```

**Poll for readiness:**

```
├── Waiting for server startup...
│   ├── Attempt 1/10: Connecting to http://localhost:5173/...
│   └── Attempt 2/10: ✓ Server ready
├── Startup time: {X}s
└── Status: {RUNNING / FAILED / SKIPPED}
```

---

### Step 3: Run Health Checks

```
[3/9] Running health checks...
```

**Execute health checks:**

```
├── Backend Health:
│   ├── URL: http://localhost:8000/health
│   ├── Status: {200 OK / ERROR}
│   ├── Time: {X}ms
│   └── Result: {✓ PASS / ✗ FAIL}
├── API Documentation:
│   ├── URL: http://localhost:8000/docs
│   ├── Status: {200 OK / ERROR}
│   ├── Time: {X}ms
│   └── Result: {✓ PASS / ✗ FAIL}
├── OpenAPI Schema:
│   ├── URL: http://localhost:8000/openapi.json
│   ├── Status: {200 OK / ERROR}
│   ├── Time: {X}ms
│   └── Result: {✓ PASS / ✗ FAIL}
├── Frontend Root:
│   ├── URL: http://localhost:5173/
│   ├── Status: {200 OK / ERROR}
│   ├── Time: {X}ms
│   └── Result: {✓ PASS / ✗ FAIL}
└── Summary: {4/4 PASSED / X/4 PASSED}
```

---

### Step 4: Run API Tests

```
[4/9] Running API tests...
├── Discovering API endpoints from /openapi.json...
```

**Discover endpoints:**
```
├── Endpoints found:
│   ├── POST /api/v1/{resource}
│   ├── GET /api/v1/{resource}
│   ├── GET /api/v1/{resource}/{id}
│   ├── PATCH /api/v1/{resource}/{id}
│   └── DELETE /api/v1/{resource}/{id}
```

**Execute CRUD tests:**

```
├── Testing CRUD operations on {resource}:
│   ├── CREATE (POST /api/v1/{resource}):
│   │   ├── Status: {201 Created / ERROR}
│   │   ├── Time: {X}ms
│   │   ├── Response: {"id": "...", "name": "Test Item"}
│   │   └── Result: {✓ PASS / ✗ FAIL}
│   ├── READ LIST (GET /api/v1/{resource}):
│   │   ├── Status: {200 OK / ERROR}
│   │   ├── Time: {X}ms
│   │   ├── Items count: {X}
│   │   └── Result: {✓ PASS / ✗ FAIL}
│   ├── READ SINGLE (GET /api/v1/{resource}/{id}):
│   │   ├── Status: {200 OK / ERROR}
│   │   ├── Time: {X}ms
│   │   └── Result: {✓ PASS / ✗ FAIL}
│   ├── UPDATE (PATCH /api/v1/{resource}/{id}):
│   │   ├── Status: {200 OK / ERROR}
│   │   ├── Time: {X}ms
│   │   └── Result: {✓ PASS / ✗ FAIL}
│   └── DELETE (DELETE /api/v1/{resource}/{id}):
│       ├── Status: {204 No Content / ERROR}
│       ├── Time: {X}ms
│       └── Result: {✓ PASS / ✗ FAIL}
├── Testing error handling:
│   ├── NOT FOUND (GET /api/v1/{resource}/invalid-id):
│   │   ├── Status: {404 Not Found / UNEXPECTED}
│   │   └── Result: {✓ PASS / ✗ FAIL}
│   └── VALIDATION ERROR (POST /api/v1/{resource} with invalid data):
│       ├── Status: {422 Unprocessable Entity / UNEXPECTED}
│       └── Result: {✓ PASS / ✗ FAIL}
└── Summary: {7/7 PASSED / X/7 PASSED}
```

---

### Step 5: Run Storage Tests

```
[5/9] Running storage tests...
```

**Test file operations:**

```
├── Upload Directory:
│   ├── Path: storage/uploads/
│   ├── Writable: {✓ YES / ✗ NO}
│   └── Result: {✓ PASS / ✗ FAIL}
├── File Upload Test:
│   ├── Endpoint: /api/v1/files/upload (if exists)
│   ├── Status: {201 / SKIPPED if no endpoint}
│   └── Result: {✓ PASS / ✗ FAIL / SKIPPED}
├── File Retrieval Test:
│   ├── Endpoint: /api/v1/files/{id}
│   ├── Status: {200 / SKIPPED}
│   └── Result: {✓ PASS / ✗ FAIL / SKIPPED}
├── Export Directory:
│   ├── Path: storage/exports/
│   ├── Writable: {✓ YES / ✗ NO}
│   └── Result: {✓ PASS / ✗ FAIL}
└── Summary: {X/X PASSED}
```

---

### Step 6: Run Integration Tests

```
[6/9] Running integration tests...
```

**Test AI API integration:**

```
├── AI API Integration:
│   ├── Endpoint: /api/v1/{ai_endpoint}
│   ├── Test prompt: "What is 2+2? Answer with just the number."
│   ├── Connectivity:
│   │   ├── Status: {200 OK / ERROR}
│   │   └── Result: {✓ CONNECTED / ✗ FAILED}
│   ├── Response Quality:
│   │   ├── Format Valid: {✓ Valid JSON / ✗ Invalid}
│   │   ├── Latency: {X}ms {✓ OK / ⚠ SLOW / ✗ TIMEOUT}
│   │   ├── Content Relevant: {✓ YES / ✗ NO}
│   │   └── Response Length: {X} chars {✓ OK / ⚠ SHORT / ✗ EMPTY}
│   └── Overall: {✓ PASS / ⚠ WARNINGS / ✗ FAIL}
├── Database Operations:
│   ├── Write test: {✓ PASS / ✗ FAIL}
│   ├── Read test: {✓ PASS / ✗ FAIL}
│   └── Delete test: {✓ PASS / ✗ FAIL}
└── Summary: {X/X PASSED}
```

**If AI endpoint not found:**
```
├── AI API Integration:
│   └── Status: SKIPPED (no AI endpoint detected)
```

---

### Step 7: Run Test Suites

```
[7/9] Running test suites...
```

**Run backend tests (pytest):**

```
├── Backend Tests (pytest):
│   ├── Command: pytest --cov=src --cov-report=term-missing -v
│   ├── Running...
```

**Capture and parse output:**

```
│   ├── Results:
│   │   ├── Total tests: {X}
│   │   ├── Passed: {X}
│   │   ├── Failed: {X}
│   │   ├── Skipped: {X}
│   │   └── Duration: {X}s
│   ├── Coverage:
│   │   ├── Overall: {X}%
│   │   ├── src/api/: {X}%
│   │   ├── src/services/: {X}%
│   │   └── src/models/: {X}%
│   └── Status: {✓ ALL PASSED / ✗ {X} FAILED}
```

**Run frontend tests (vitest/jest):**

```
├── Frontend Tests (vitest):
│   ├── Command: npm test -- --coverage
│   ├── Running...
│   ├── Results:
│   │   ├── Total tests: {X}
│   │   ├── Passed: {X}
│   │   ├── Failed: {X}
│   │   └── Duration: {X}s
│   ├── Coverage:
│   │   ├── Statements: {X}%
│   │   ├── Branches: {X}%
│   │   ├── Functions: {X}%
│   │   └── Lines: {X}%
│   └── Status: {✓ ALL PASSED / ✗ {X} FAILED}
└── Summary: {PASS / FAIL}
```

**If tests fail, capture failure details:**
```
│   ├── Failed Tests:
│   │   ├── test_api/test_jobs.py::test_create_job_validation
│   │   │   └── AssertionError: Expected 422, got 400
│   │   └── test_services/test_job_service.py::test_update_job
│   │       └── AttributeError: 'NoneType' has no attribute 'id'
```

---

### Step 8: Stop Servers

```
[8/9] Stopping servers...
```

**Stop all servers gracefully:**

```
├── Backend server (port 8000):
│   ├── PID: {pid}
│   └── Status: {STOPPED / NOT RUNNING}
├── Frontend server (port 5173):
│   ├── PID: {pid}
│   └── Status: {STOPPED / NOT RUNNING}
└── All servers stopped
```

---

### Step 9: Generate Evaluation Report

**Write `.claude/context/evaluation-report.md`:**

```markdown
# Evaluation Report

Generated: {timestamp}

## Executive Summary

| Category | Tests | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Health Checks | {n} | {p} | {f} | {%} |
| API Tests | {n} | {p} | {f} | {%} |
| Storage Tests | {n} | {p} | {f} | {%} |
| AI Integration | {n} | {p} | {f} | {%} |
| Backend Unit | {n} | {p} | {f} | {%} |
| Frontend Unit | {n} | {p} | {f} | {%} |
| **Total** | **{N}** | **{P}** | **{F}** | **{%}** |

## Overall Status: {PASSED / PASSED WITH WARNINGS / FAILED}

## Test Results by Category

### Health Checks

| Check | Endpoint | Status | Time |
|-------|----------|--------|------|
| Backend Health | /health | {✓/✗} | {ms} |
| API Docs | /docs | {✓/✗} | {ms} |
| OpenAPI | /openapi.json | {✓/✗} | {ms} |
| Frontend | / | {✓/✗} | {ms} |

### API Tests

| Test | Method | Endpoint | Expected | Actual | Status |
|------|--------|----------|----------|--------|--------|
| Create | POST | /api/v1/{resource} | 201 | {code} | {✓/✗} |
| List | GET | /api/v1/{resource} | 200 | {code} | {✓/✗} |
| Get | GET | /api/v1/{resource}/{id} | 200 | {code} | {✓/✗} |
| Update | PATCH | /api/v1/{resource}/{id} | 200 | {code} | {✓/✗} |
| Delete | DELETE | /api/v1/{resource}/{id} | 204 | {code} | {✓/✗} |
| Not Found | GET | /api/v1/{resource}/invalid | 404 | {code} | {✓/✗} |
| Validation | POST | /api/v1/{resource} | 422 | {code} | {✓/✗} |

### AI Integration Tests

| Test | Status | Latency | Details |
|------|--------|---------|---------|
| Connectivity | {✓/✗} | {ms} | {details} |
| Response Format | {✓/✗} | - | {Valid JSON / Invalid} |
| Response Latency | {✓/✗} | {ms} | {< 10s / Too slow} |
| Response Relevance | {✓/✗} | - | {Relevant / Irrelevant} |

### Backend Test Suite (pytest)

```
{pytest output summary}
```

**Coverage:** {X}%

| Module | Coverage |
|--------|----------|
| src/api/ | {X}% |
| src/services/ | {X}% |
| src/models/ | {X}% |

### Frontend Test Suite (vitest)

```
{vitest output summary}
```

**Coverage:** {X}% statements, {X}% branches

## Issues Found

{For each issue:}

### Issue {N}: {Title}

- **Severity:** {Critical / High / Medium / Low}
- **Category:** {Health Check / API / Storage / Integration / Unit Test}
- **Location:** {endpoint / file / test name}
- **Expected:** {expected behavior}
- **Actual:** {actual behavior}
- **Recommendation:** {how to fix}

## Recommendations

1. {High priority items}
2. {Medium priority items}
3. {Low priority items}

## Server Logs

<details>
<summary>Backend Server Output</summary>

```
{relevant backend log excerpts}
```

</details>

<details>
<summary>Frontend Server Output</summary>

```
{relevant frontend log excerpts}
```

</details>

## Next Steps

{If PASSED:}
- Application is ready for deployment
- Review any warnings before production

{If PASSED WITH WARNINGS:}
- Address the warnings listed above
- Re-run /evaluate to verify fixes

{If FAILED:}
- Fix the critical issues identified above
- Re-run /evaluate after fixes

---

*Generated by Q101 Agentic Framework /evaluate command*
```

**Write `.claude/context/evaluation-results.json`:**

```json
{
  "timestamp": "{ISO8601}",
  "status": "{passed|passed_with_warnings|failed}",
  "summary": {
    "total_tests": {N},
    "passed": {P},
    "failed": {F},
    "pass_rate": {%}
  },
  "categories": {
    "health_checks": {
      "total": {n},
      "passed": {p},
      "failed": {f},
      "results": [...]
    },
    "api_tests": {...},
    "storage_tests": {...},
    "ai_integration": {...},
    "backend_unit": {...},
    "frontend_unit": {...}
  },
  "issues": [
    {
      "id": 1,
      "severity": "{critical|high|medium|low}",
      "category": "{category}",
      "title": "{title}",
      "location": "{location}",
      "expected": "{expected}",
      "actual": "{actual}",
      "recommendation": "{recommendation}"
    }
  ],
  "coverage": {
    "backend": {X},
    "frontend": {X}
  }
}
```

---

### Step 10: Display Final Status

```
══════════════════════════════════════════════════════════════
                  EVALUATION COMPLETE
══════════════════════════════════════════════════════════════

Results Summary:
├── Health Checks: {X}/{X} passed
├── API Tests: {X}/{X} passed
├── Storage Tests: {X}/{X} passed
├── AI Integration: {X}/{X} passed
├── Backend Unit Tests: {X}/{X} passed ({X}% coverage)
├── Frontend Unit Tests: {X}/{X} passed ({X}% coverage)
├── Total: {P}/{N} passed ({X}% pass rate)
└── Issues Found: {X}

Overall Status: {✓ PASSED / ⚠ PASSED WITH WARNINGS / ✗ FAILED}

{If issues found:}
Issues:
├── [{severity}] {issue_1_title}
├── [{severity}] {issue_2_title}
└── [{severity}] {issue_3_title}

Reports Generated:
├── .claude/context/evaluation-report.md (detailed report)
└── .claude/context/evaluation-results.json (machine-readable)

{If PASSED:}
Next Steps:
  ✓ Application is ready for deployment

{If PASSED WITH WARNINGS:}
Next Steps:
  1. Review warnings in evaluation-report.md
  2. Address issues if needed
  3. Consider re-running /evaluate

{If FAILED:}
Next Steps:
  1. Review evaluation-report.md for details
  2. Fix the issues identified
  3. Re-run /evaluate

══════════════════════════════════════════════════════════════
```

---

## Error Handling

### Preparation Not Complete
```
If preparation-report.md not found:
→ Display clear message pointing to /prepare
→ Stop execution completely
```

### Server Start Failed
```
If backend server fails to start:
1. Capture error from log file
2. Display common causes
3. Skip server-dependent tests
4. Continue with file-based tests if possible
5. Note in report as critical issue
```

### Test Suite Not Available
```
If pytest/vitest not available:
1. Note as warning
2. Skip that test category
3. Continue with other tests
4. Include in report as skipped
```

### AI Endpoint Not Found
```
If no AI endpoint detected:
1. Skip AI integration tests
2. Note as informational (not error)
3. Continue with other tests
```

---

## Integration

### Workflow Position

```
/generate → /execute → /prepare → /evaluate → [Deploy]
                                      ↑
                                   YOU ARE HERE
```

### Prerequisites
- /prepare must have been run
- preparation-report.md exists
- Dependencies installed
- .env configured

### Outputs
- evaluation-report.md - Human readable report
- evaluation-results.json - Machine readable for CI/CD
- Server logs for debugging

---

## Begin Execution

**CRITICAL EXECUTION RULES:**
1. **Banner text MUST be the FIRST output** - NO tool calls before banner display
2. **NO file reads before banner** - Do NOT read VERSION.json or any config files before displaying banner
3. **NO TodoWrite before banner** - Task tracking happens AFTER banner display
4. **Version is HARDCODED** - Use "v2.10.5" as shown in template (do not read from VERSION.json)

**Output the following text EXACTLY as your first action (pure text, no tools):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/evaluate**                                      |
| Q101 Framework v2.10.5 Quality Evaluation          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Evaluate application quality and readiness

>

## Tasks:

| Task | Description |
|------|-------------|
| Health | Run health checks on API endpoints |
| Tests | Execute test suites with coverage |
| Report | Generate evaluation report |

>

**Input:** Prepared application environment\
**Output:** `evaluation-report.md`

>

**Usage:** `/evaluate`\
**Example:** `/evaluate`
<!-- END EXACT OUTPUT -->

**FORMATTING RULES:**

- Use `>` (empty blockquote) for visible gaps between sections
- Use `\` (backslash) for soft line breaks between related items (Input/Output, Usage/Example)
- Do NOT use code blocks - use `<!-- BEGIN/END EXACT OUTPUT -->` markers

**MANDATORY EXECUTION ORDER:**

| Order | Action | Tools Allowed |
|-------|--------|---------------|
| 1 | **Output banner text** | NONE - Pure text only |
| 2 | TodoWrite (track phases) | TodoWrite |
| 3 | Execute steps | All tools |

**VIOLATIONS TO AVOID:**

- ❌ Reading VERSION.json before banner (version is hardcoded)
- ❌ Calling TodoWrite before banner
- ❌ Any tool call appearing in output before banner text

**Then use TodoWrite to track progress through steps.**

1. Validate preparation complete
2. Start backend server
3. Start frontend server
4. Run health checks
5. Run API tests
6. Run storage tests
7. Run integration tests (including AI quality)
8. Run test suites (pytest, vitest)
9. Stop servers
10. Generate evaluation report
11. Display final status

Use the TodoWrite tool to track your progress through the steps.

$ARGUMENTS
