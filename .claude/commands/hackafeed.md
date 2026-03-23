# /hackafeed - Q101 Iterative Improvement Command

**Version:** 2.12.28
**Last Updated:** 2026-01-31
**Status:** ACTIVE

> **Purpose:** Iterative improvement for /hackathon MVPs based on /hackatest results. Runs the F.E.E.D.B.A.C.K. loop until quality targets are met - invoke and walk away!

---

## Changelog (v2.12.28)

- **NEW:** F.E.E.D.B.A.C.K. framework (Find, Examine, Engineer, Develop, Build, Assert, Commit, Kick)
- **NEW:** 8-phase iterative improvement loop
- **NEW:** Automatic PROVE → FEEDBACK cycling until quality target met
- **NEW:** Agent routing matrix for specialized fixes
- **NEW:** Quality certificate generation on completion
- **NEW:** Regression detection to catch new bugs
- **NEW:** Root cause clustering for efficient pattern fixing
- **NEW:** Full chain support: `/hackathon --then=hackatest --then=hackafeed`
- **DOCS:** FEEDBACK-HACKAFEED-FRAMEWORK.md methodology guide

---

## CRITICAL EXECUTION RULES

### Rule 1: BANNER FIRST

**When this command is invoked, your VERY FIRST OUTPUT must be the banner text.**

**BEFORE outputting the banner, you MUST NOT:**
- Read any file (test-results.json, VERSION.json, etc.)
- Call TodoWrite
- Call any tool

**The ONLY acceptable first action is:** Output the appropriate banner text based on arguments.

### Rule 2: AUTONOMOUS EXECUTION (MANDATORY)

**When `/hackafeed` is invoked (with or without arguments), it MUST run to completion without user prompts.**

**Default Behavior (bare `/hackafeed`):**
- Quality target: 95%
- Max cycles: 5
- Auto-detect PROVE results from latest report
- Auto-resolve all blocking prompts

**YOU MUST NOT:**
- Ask "Continue to next cycle? [Y/n]"
- Ask "Select quality target [1/2/3]"
- Ask "Retry this fix? [Y/n]"
- Ask "Skip issue? [Y/n]"
- Stop and wait for user input

**Auto-Resolution Table:**

| Prompt Type | Auto-Resolution |
|-------------|-----------------|
| No test results | ERROR - require PROVE first |
| All tests pass | Skip to KICK with SUCCESS |
| Fix fails 3x | Mark MANUAL_REVIEW, continue |
| Build fails | Parse errors, attempt auto-fix, retry once |
| No progress 2 cycles | EXIT with STALLED |
| Max cycles reached | EXIT with warning |

**Mental Model:** `/hackafeed` runs like a CI/CD fix loop - invoke and walk away.

### Rule 3: PROVE INTEGRATION

**FEEDBACK requires PROVE results to operate:**

```
/hackatest  →  test-results.json  →  /hackafeed
   (PROVE)         (output)          (FEEDBACK)
```

**If no PROVE results found, display error and exit.**

---

## A - ARTIFACTS (Output Patterns)

### Banner (Default - Autonomous Mode)

When invoked as `/hackafeed` with no arguments (autonomous mode):

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackafeed**                                     |
| Q101 Framework v2.12.28 Iterative Improvement      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Autonomous | **Target:** 95% | **Max Cycles:** 5

>

## F.E.E.D.B.A.C.K. Loop:

| Phase | Action | Purpose |
|-------|--------|---------|
| **F** | Find | Parse test results, prioritize issues |
| **E** | Examine | Root cause analysis, pattern detection |
| **E** | Engineer | Design fix specifications |
| **D** | Develop | Implement fixes with agent routing |
| **B** | Build | Rebuild, verify compilation |
| **A** | Assert | Re-run targeted tests |
| **C** | Commit | Git checkpoint, update state |
| **K** | Kick | Decide: loop again or exit |

>

**PROVE Integration:** Seamlessly chains from `/hackatest --then=hackafeed`

>

**Starting improvement loop...**
<!-- END EXACT OUTPUT -->

### Banner (Single Cycle)

When invoked as `/hackafeed --once`:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackafeed --once**                              |
| Q101 Framework v2.12.28 Single Fix Cycle           |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Single Cycle | **No auto-loop after this cycle**

>

**Starting single improvement cycle...**
<!-- END EXACT OUTPUT -->

### Banner (Silent/Chained)

When invoked with `--silent` flag (from `/hackatest --then=hackafeed`):

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackafeed --silent**                            |
| Q101 Framework v2.12.28 Chained Improvement        |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Mode:** Silent | **Chained from:** /hackatest

>

**Starting chained improvement...**
<!-- END EXACT OUTPUT -->

---

## R - RESOURCES (Context & Inputs)

### Required Inputs

| Input | Source | Description |
|-------|--------|-------------|
| test-results.json | PROVE output | Test failures and observations |
| report.html | PROVE output | Visual evidence |
| .hackathon-context.json | PRIME/PROVE | Session state |
| PRP.md | PRIME | Acceptance criteria |

### Optional Inputs

| Input | Source | Description |
|-------|--------|-------------|
| --results=PATH | User | Explicit results path |
| --target=N | User | Quality target (default: 95) |
| --max-cycles=N | User | Max iterations (default: 5) |
| --once | User | Single cycle, no loop |
| --phase=X | User | Resume from specific phase |

### Auto-Detection Priority

```
1. --results flag (explicit path)
2. .hackathon-context.json.phases.prove.outputs.report_path
3. Scan .claude/reports/hackatest/ for latest
4. ERROR if none found
```

---

## T - TOOLS (Agent Assignments)

### Phase-to-Agent Mapping

| Phase | Agent | Mode |
|-------|-------|------|
| F - Find | @evaluate_agent | find |
| E - Examine | @evaluate_agent | analysis |
| E - Engineer | @instruct_agent | fix-instruction |
| D - Develop | Multiple (routed) | standard |
| B - Build | @devops_engineer | standard |
| A - Assert | @evaluate_agent | targeted |
| C - Commit | Orchestrator | git |
| K - Kick | Orchestrator | decision |

### Develop Phase Routing

| Fix Category | Primary Agent | Escalation |
|--------------|---------------|------------|
| UI/Layout | @ux_designer | @lead_developer |
| API/Backend | @lead_developer | @system_architect |
| Tests | @test_architect | @lead_developer |
| Performance | @performance_engineer | @system_architect |
| Visual | @ux_designer | @frontend_generator |
| Accessibility | @accessibility_auditor | @ux_designer |

---

## S - SKILLS (Execution Steps)

### STEP 0: Parse Arguments & Display Banner

**Parse command arguments:**
- `--results=PATH` - Explicit results path
- `--target=N` - Quality target percentage (default: 95)
- `--max-cycles=N` - Maximum cycles (default: 5)
- `--once` - Run single cycle only
- `--phase=X` - Resume from specific phase
- `--silent` - Minimal output (for chaining)
- `--help` - Show usage

**Display appropriate banner based on arguments.**

---

### STEP 1: Load PROVE Results (F - FIND)

**1.1 Locate test results:**
```
Priority:
1. --results flag
2. Context: phases.prove.outputs.report_path
3. Latest: .claude/reports/hackatest/*/test-results.json
4. ERROR if not found
```

**1.2 Parse results:**
- Read test-results.json
- Extract failures (pass: false)
- Extract observations (warnings, visual diffs)
- Count issues by severity

**1.3 Prioritize issues:**
| Severity | Criteria |
|----------|----------|
| CRITICAL | Core functionality blocked |
| HIGH | Major feature broken |
| MEDIUM | Minor issue, workaround exists |
| LOW | Cosmetic, enhancement |

**1.4 Output:**
- `feedback-issues.json` with prioritized queue
- Issue summary displayed

**If all tests pass:** Skip to STEP 8 (K - KICK) with SUCCESS.

---

### STEP 2: Root Cause Analysis (E - EXAMINE)

**2.1 For each issue (priority order):**
- Identify affected component/file
- Determine expected vs actual behavior
- Classify: bug vs missing feature vs design flaw

**2.2 Cross-reference with PRP:**
- Check if issue is in scope
- Validate acceptance criteria

**2.3 Classify complexity:**
| Complexity | Criteria |
|------------|----------|
| TRIVIAL | Single line fix |
| SIMPLE | Single file change |
| COMPLEX | Multi-file, architecture |

**2.4 Detect patterns:**
- Find issues with shared root cause
- Cluster for efficient fixing

**2.5 Output:**
- `feedback-analysis.json` with root causes
- Pattern report displayed

---

### STEP 3: Design Fixes (E - ENGINEER)

**3.1 For each issue/cluster:**
- Design fix approach
- Identify files to modify
- Specify changes required
- Note tests needing updates

**3.2 Prioritize fixes:**
- Calculate: severity × (1 / effort)
- Order by priority score

**3.3 Determine execution order:**
- Resolve dependencies
- Cluster fixes by file

**3.4 Create backlog:**
- Defer low-priority enhancements
- Log deferred items

**3.5 Output:**
- `feedback-fixes.json` with specifications
- Fix plan displayed

---

### STEP 4: Implement Fixes (D - DEVELOP)

**4.1 For each fix in order:**

**4.1.1 Route to agent:**
| Category | Agent |
|----------|-------|
| UI/Layout | @ux_designer |
| API/Backend | @lead_developer |
| Tests | @test_architect |
| Performance | @performance_engineer |

**4.1.2 Apply fix:**
- Use single-write pattern
- Capture before/after

**4.1.3 Handle errors:**
```
IF fix fails:
    attempts++
    IF attempts < 3:
        Retry with error context
    ELSE:
        Mark MANUAL_REVIEW
        Continue to next fix
```

**4.2 Update tests:**
- Modify affected tests
- Create new tests if needed

**4.3 Output:**
- `feedback-changes.json` with modifications
- Fix progress displayed

---

### STEP 5: Rebuild Application (B - BUILD)

**5.1 Run build:**
```bash
npm run build  # or equivalent
```

**5.2 Verify compilation:**
- Check for new errors
- Run type checks
- Run linting

**5.3 Auto-resolve issues:**
| Issue | Resolution |
|-------|------------|
| Type errors | Attempt auto-fix, else revert |
| Lint errors | Run with --fix |
| Build timeout | Increase timeout, retry |

**5.4 Start server (if needed):**
- Auto-find available port
- Update context with URL

**5.5 Output:**
- Build status
- Error log (if any)

---

### STEP 6: Re-run Tests (A - ASSERT)

**6.1 Identify affected tests:**
- Map changes to test files
- Calculate targeted scope

**6.2 Run targeted tests:**
- Execute only affected scenarios
- Capture results

**6.3 Compare results:**
- Calculate fix success rate
- Detect regressions (new failures)

**6.4 Update issue queue:**
- Remove fixed issues
- Add regressions

**6.5 Output:**
- Success rate percentage
- Regression report
- Updated issue count

---

### STEP 7: Git Checkpoint (C - COMMIT)

**7.1 Stage changes:**
```bash
git add -A
```

**7.2 Create commit:**
```
feedback: cycle #{n} - fixed {x}/{y} issues [session-id]

Issues Fixed:
- [CRITICAL] {issue-1}
- [HIGH] {issue-2}

Remaining: {n} issues
Success Rate: {x}%

Co-Authored-By: Claude <noreply@anthropic.com>
```

**7.3 Update context:**
- Add cycle to phases.feedback.cycles
- Update statistics

**7.4 Generate report:**
- Create feedback-report.md
- Include cycle summary

---

### STEP 8: Decision Gate (K - KICK)

**8.1 Evaluate exit criteria:**

| Criterion | Check |
|-----------|-------|
| All tests pass | remaining_issues == 0 |
| Quality target | success_rate >= target |
| Max cycles | cycle_count >= max_cycles |
| No progress | 0 fixes in 2 cycles |

**8.2 Make decision:**

```
IF all tests pass:
    decision = EXIT
    reason = "ALL_TESTS_PASS"
    Generate quality certificate
ELSE IF quality target met:
    decision = EXIT
    reason = "QUALITY_TARGET_MET"
    Generate quality certificate
ELSE IF max cycles reached:
    decision = EXIT
    reason = "MAX_CYCLES_REACHED"
    Log warning
ELSE IF no progress (2 cycles):
    decision = EXIT
    reason = "NO_PROGRESS"
    Log warning, recommend manual review
ELSE:
    decision = CONTINUE
    Trigger PROVE → FEEDBACK loop
```

**8.3 If CONTINUE:**
- Log "Triggering PROVE re-validation..."
- Execute `/hackatest --silent`
- Return to STEP 1 with new results

**8.4 If EXIT:**
- Display final summary
- Generate quality certificate (if passing)
- Update registry
- Return control to user

---

## Quality Certificate

When all tests pass or quality target met, generate:

```
══════════════════════════════════════════════════════════════════════════════
                          QUALITY CERTIFICATE
══════════════════════════════════════════════════════════════════════════════

  Project: {project_name}
  Session: {session_id}

  ──────────────────────────────────────────────────────────────────────────────
  TRILOGY SUMMARY
  ──────────────────────────────────────────────────────────────────────────────

  PRIME (Build):    ✓ {n} features implemented
  PROVE (Validate): ✓ {n}/{m} scenarios passing
  FEEDBACK (Fix):   ✓ {n} issues resolved in {c} cycles

  ──────────────────────────────────────────────────────────────────────────────
  QUALITY METRICS
  ──────────────────────────────────────────────────────────────────────────────

  Test Pass Rate: {n}%
  Issues Fixed:   {n}
  Regressions:    {n}
  Total Cycles:   {n}

  ──────────────────────────────────────────────────────────────────────────────

  Certified: {timestamp}

══════════════════════════════════════════════════════════════════════════════
```

---

## Usage Examples

### Basic Usage

```bash
# Default: Parse latest PROVE results, fix until 95% quality
/hackafeed

# Specify results location
/hackafeed --results=.claude/reports/hackatest/2026-01-31-143052/

# Set quality target
/hackafeed --target=100

# Set max cycles
/hackafeed --max-cycles=3

# Run single cycle only
/hackafeed --once

# Resume from specific phase
/hackafeed --phase=develop
```

### Chaining

```bash
# Chain from hackatest
/hackatest --then=hackafeed

# Full trilogy chain
/hackathon --problem="Task manager" --then=hackatest --then=hackafeed

# Silent chained execution
/hackafeed --silent
```

---

## Context Schema

### Feedback Phase State

```json
{
  "phases": {
    "feedback": {
      "status": "in_progress",
      "started_at": "ISO8601",
      "cycles": [
        {
          "cycle_number": 1,
          "started_at": "ISO8601",
          "completed_at": "ISO8601",
          "input_issues": 12,
          "fixed_issues": 8,
          "remaining_issues": 4,
          "regressions": 0,
          "success_rate": 66.7,
          "phases_completed": ["F", "E", "E", "D", "B", "A", "C", "K"],
          "git_commit": "abc123",
          "decision": "CONTINUE"
        }
      ],
      "statistics": {
        "total_cycles": 2,
        "total_issues_found": 12,
        "total_issues_fixed": 12,
        "total_regressions": 0,
        "overall_success_rate": 100,
        "exit_reason": "ALL_TESTS_PASS"
      }
    }
  }
}
```

---

## Exit Codes

| Code | Reason | Description |
|------|--------|-------------|
| 0 | SUCCESS | All tests pass or target met |
| 1 | MAX_CYCLES | Limit reached, issues remain |
| 2 | NO_PROGRESS | Stalled, manual review needed |
| 3 | TIMEOUT | Time limit exceeded |
| 4 | ERROR | No PROVE results found |

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `/hackathon` | PRIME - builds the MVP |
| `/hackatest` | PROVE - validates the MVP |
| `/hackafeed` | FEEDBACK - improves the MVP |
| `/iterate` | Alternative improvement (manual) |

---

## Framework Reference

See `frameworks/q101/FEEDBACK-HACKAFEED-FRAMEWORK.md` for complete methodology documentation.

---

> **"Build with PRIME. Prove with PROVE. Perfect with FEEDBACK."**

*Q101 Agentic Coding Framework v2.12.28*
