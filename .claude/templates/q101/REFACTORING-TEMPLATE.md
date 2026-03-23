# Refactoring Plan & Log Template

## Overview

This template provides the standard format for refactoring plans created by @refactor_specialist and the log of completed refactoring sessions.

---

# REFACTORING-LOG.md

Use this format to document completed refactoring sessions:

```markdown
# Refactoring Log

## Session: {DATE}

### Refactoring #{N}: {Title}

**Request:** {Original user request or ANALYSIS-REPORT.md reference}

**Scope:** {MICRO | MESO | MACRO}
**Risk Level:** {LOW | MEDIUM | HIGH}
**Executing Agent(s):** {Agent names}

#### Before State
- **File(s):** {file paths}
- **Lines:** {count}
- **Complexity:** {metrics}
- **Issues:** {code smells, problems}

#### After State
- **File(s):** {file paths}
- **Lines:** {count}
- **Complexity:** {metrics}
- **Improvements:** {what was fixed}

#### Behavior Verification
| API/Function | Before Signature | After Signature | Status |
|--------------|------------------|-----------------|--------|
| {name} | {signature} | {signature} | ✓ Unchanged |

#### Changes Made
1. {Step 1 description}
2. {Step 2 description}
3. {Step 3 description}

#### Test Results
- **Before:** {pass/fail count}
- **After:** {pass/fail count}
- **New Tests Added:** {count}

#### Metrics
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Lines of Code | {n} | {n} | {+/-n} |
| Cyclomatic Complexity | {n} | {n} | {-n%} |
| Files | {n} | {n} | {+/-n} |

---
```

---

# REFACTORING-PLAN.md

Use this format for active refactoring plans (stored in `.claude/context/`):

```markdown
# Refactoring Plan: {Title}

**Created:** {DATE}
**Status:** PENDING | IN_PROGRESS | COMPLETED | CANCELLED
**Requested By:** User | ANALYSIS-REPORT.md (REF-{ID})

---

## Scope Determination

### Request Analysis
{Description of what the user wants to refactor}

### Impact Assessment
| Metric | Value |
|--------|-------|
| Files Affected | {n} |
| Functions Changed | {n} |
| External APIs | {n affected} |
| Test Coverage | {n%} |

### Scope Recommendation

```
┌────────────────────────────────────────────────────────┐
│ RECOMMENDATION: {MICRO | MESO | MACRO}                 │
│                                                        │
│ {Detailed justification}                               │
│                                                        │
│ External Behavior Change: {NONE | VERIFIED_SAFE}       │
│ Risk Level: {LOW | MEDIUM | HIGH}                      │
│                                                        │
│ Executing Agent(s): {agent names}                      │
└────────────────────────────────────────────────────────┘
```

---

## Behavior Preservation Checklist

### External APIs
| Endpoint/Function | Current Signature | Post-Refactor | Status |
|-------------------|-------------------|---------------|--------|
| {name} | {signature} | {signature} | ✓ Unchanged |

### Side Effects
| Operation | Current | Post-Refactor | Status |
|-----------|---------|---------------|--------|
| {effect} | {behavior} | {behavior} | ✓ Same |

### Return Types
| Function | Current | Post-Refactor | Status |
|----------|---------|---------------|--------|
| {name} | {type} | {type} | ✓ Unchanged |

### VERDICT
**External Behavior Change:** NONE
**Safe to Proceed:** YES

---

## Step-by-Step Plan

### Prerequisites
- [ ] All existing tests pass
- [ ] Test coverage meets minimum threshold ({n%})
- [ ] No uncommitted changes in working directory

### Step 1: {Action Title}
**Location:** {file:line}
**Action:** {Detailed description}
**Verification:** {How to verify this step}
**Rollback:** {How to undo if needed}

### Step 2: {Action Title}
**Location:** {file:line}
**Action:** {Detailed description}
**Verification:** {How to verify this step}
**Rollback:** {How to undo if needed}

### Step 3: {Action Title}
**Location:** {file:line}
**Action:** {Detailed description}
**Verification:** {How to verify this step}
**Rollback:** {How to undo if needed}

---

## Risk Assessment

### Risk Factors
| Factor | Assessment | Mitigation |
|--------|------------|------------|
| Test Coverage | {LOW/MED/HIGH risk} | {Action if needed} |
| Dependency Count | {LOW/MED/HIGH risk} | {Action if needed} |
| External API Impact | {LOW/MED/HIGH risk} | {Action if needed} |
| Reversibility | {LOW/MED/HIGH risk} | {Action if needed} |

### Overall Risk: {LOW | MEDIUM | HIGH}

### Recommended Precautions
1. {Precaution 1}
2. {Precaution 2}
3. {Precaution 3}

---

## Test Requirements

### Before Starting
- [ ] Run full test suite
- [ ] Document baseline metrics

### During Refactoring
- [ ] Verify after each step
- [ ] Run affected tests

### After Completion
- [ ] Run full test suite
- [ ] Verify no regressions
- [ ] Update REFACTORING-LOG.md

---

## Approval

**User Approval Required:** YES

| Option | Action |
|--------|--------|
| **Approve** | Proceed with refactoring |
| **Modify** | Request changes to plan |
| **Cancel** | Abort refactoring |

---

## Execution Handoff

Upon approval, hand off to executing agent:

```json
{
  "from": "@refactor_specialist",
  "to": "{executing_agent}",
  "type": "refactoring_execution",
  "payload": {
    "plan_id": "{id}",
    "scope": "{MICRO|MESO|MACRO}",
    "steps": [...],
    "behavior_checklist": [...],
    "risk_level": "{LOW|MEDIUM|HIGH}",
    "test_requirements": [...]
  }
}
```
```

---

# Scope Reference Guide

## MICRO (Single File)

**Characteristics:**
- 1 file affected
- Internal changes only
- No API signature changes
- Low risk

**Examples:**
- Extract method
- Rename variable/function
- Simplify conditionals
- Remove dead code
- Extract constant

**Executing Agent:** @lead_developer

---

## MESO (Multiple Files)

**Characteristics:**
- 2-10 files affected
- May create new files
- No external API changes
- Medium risk

**Examples:**
- Extract class/module
- Merge duplicate code
- Apply DRY across files
- Move function to appropriate module
- Create shared utility

**Executing Agents:**
- Primary: @lead_developer
- Secondary: @system_architect (for module design)

---

## MACRO (Architecture)

**Characteristics:**
- 10+ files affected
- Structural changes
- May affect build/config
- Higher risk

**Examples:**
- Reorganize folder structure
- Resolve circular dependencies
- Split monolith into modules
- Apply design pattern
- Migrate to new architecture

**Executing Agents:**
- Primary: @system_architect
- Secondary: @lead_developer

---

# Code Smell Reference

## Micro-Level Smells

| Smell | Detection | Threshold | Auto-Fix |
|-------|-----------|-----------|----------|
| Long Method | Line count | >50 lines | No |
| Deep Nesting | Nesting depth | >3 levels | No |
| Dead Code | Unused detection | Any | Yes |
| Magic Numbers | Literal detection | Any numeric | Semi |
| Long Parameter List | Parameter count | >4 params | No |

## Meso-Level Smells

| Smell | Detection | Threshold | Auto-Fix |
|-------|-----------|-----------|----------|
| God Class | Size + methods | >500 lines, >20 methods | No |
| Feature Envy | Cross-class access | Excessive other-class calls | No |
| Duplicate Code | Similarity analysis | >80% similarity | No |
| Shotgun Surgery | Change impact | >5 files per change | No |

## Macro-Level Smells

| Smell | Detection | Threshold | Auto-Fix |
|-------|-----------|-----------|----------|
| Circular Dependency | Import analysis | Any cycle | No |
| Layer Violation | Architecture rules | Any violation | No |
| Monolith File | Size + coupling | >1000 lines | No |
| Missing Abstraction | Pattern detection | Repeated patterns | No |
