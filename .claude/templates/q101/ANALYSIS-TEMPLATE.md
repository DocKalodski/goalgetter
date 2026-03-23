# Codebase Analysis Report

**Generated:** {{timestamp}}
**Scope:** {{scope}}
**Codebase:** {{project_name}}
**Analysis Score:** {{score}}/100

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Issues | {{total_issues}} |
| Critical | {{critical_count}} |
| High | {{high_count}} |
| Warning | {{warn_count}} |
| Info | {{info_count}} |
| Auto-fixable | {{auto_fixable_count}} ({{auto_fixable_percent}}%) |

### Top Priority Items

1. **[{{priority_1_severity}}]** {{priority_1_title}} - `{{priority_1_location}}`
2. **[{{priority_2_severity}}]** {{priority_2_title}} - `{{priority_2_location}}`
3. **[{{priority_3_severity}}]** {{priority_3_title}} - `{{priority_3_location}}`

---

## Codebase Profile

### Tech Stack

| Category | Technologies |
|----------|--------------|
| Languages | {{languages}} |
| Frameworks | {{frameworks}} |
| Databases | {{databases}} |
| Tools | {{tools}} |

### Structure

| Metric | Value |
|--------|-------|
| Total Files | {{total_files}} |
| Total Lines | {{total_lines}} |
| Directories | {{directory_count}} |
| Source Files | {{source_files}} |
| Test Files | {{test_files}} |

### Dependencies

| Category | Count | Outdated | Vulnerable |
|----------|-------|----------|------------|
| Backend | {{backend_deps}} | {{backend_outdated}} | {{backend_vulnerable}} |
| Frontend | {{frontend_deps}} | {{frontend_outdated}} | {{frontend_vulnerable}} |

---

## Findings by Category

### Architecture ({{architecture_count}} issues)

*Analyzed by @code_analyst*

| ID | Severity | Issue | Location | Recommendation |
|----|----------|-------|----------|----------------|
{{#architecture_findings}}
| {{id}} | {{severity}} | {{title}} | `{{location}}` | {{recommendation}} |
{{/architecture_findings}}

#### Complexity Hotspots

| File | Cyclomatic Complexity | Lines | Status |
|------|----------------------|-------|--------|
{{#complexity_hotspots}}
| `{{file}}` | {{complexity}} | {{lines}} | {{status}} |
{{/complexity_hotspots}}

---

### Code Quality ({{quality_count}} issues)

*Analyzed by @quality_auditor*

| ID | Severity | Issue | Location | Standard |
|----|----------|-------|----------|----------|
{{#quality_findings}}
| {{id}} | {{severity}} | {{title}} | `{{location}}` | {{standard}} |
{{/quality_findings}}

#### Standards Compliance

| Standard | Violations | Auto-fixable |
|----------|------------|--------------|
{{#standards_summary}}
| {{standard}} | {{violations}} | {{auto_fixable}} |
{{/standards_summary}}

---

### Potential Bugs ({{bugs_count}} issues)

*Analyzed by @debug_specialist*

| ID | Severity | Issue | Location | Pattern |
|----|----------|-------|----------|---------|
{{#bug_findings}}
| {{id}} | {{severity}} | {{title}} | `{{location}}` | {{pattern}} |
{{/bug_findings}}

#### Security Vulnerabilities

| ID | Severity | Type | Location | Risk |
|----|----------|------|----------|------|
{{#security_findings}}
| {{id}} | {{severity}} | {{type}} | `{{location}}` | {{risk}} |
{{/security_findings}}

---

### Documentation ({{docs_count}} issues)

*Analyzed by @doc_engineer*

| ID | Severity | Issue | Location | Type |
|----|----------|-------|----------|------|
{{#doc_findings}}
| {{id}} | {{severity}} | {{title}} | `{{location}}` | {{type}} |
{{/doc_findings}}

#### Documentation Coverage

| Area | Files | Documented | Coverage |
|------|-------|------------|----------|
{{#doc_coverage}}
| {{area}} | {{files}} | {{documented}} | {{coverage}}% |
{{/doc_coverage}}

---

## Recommendations

### Immediate Actions (Critical/High)

{{#immediate_actions}}
1. **{{title}}** - {{description}}
   - Location: `{{location}}`
   - Effort: {{effort}}
   - Impact: {{impact}}

{{/immediate_actions}}

### Short-term Improvements (Warn)

{{#shortterm_actions}}
- {{title}} (`{{location}}`)
{{/shortterm_actions}}

### Long-term Considerations (Info)

{{#longterm_actions}}
- {{title}}
{{/longterm_actions}}

---

## Quick Wins

These are safe, high-impact improvements that can be applied automatically:

| # | Issue | Location | Fix Type |
|---|-------|----------|----------|
{{#quick_wins}}
| {{index}} | {{title}} | `{{location}}` | {{fix_type}} |
{{/quick_wins}}

**To apply quick wins:** Run `/analyze --fix` and select option [1] ALL

---

## Appendix

### File Complexity Ranking

Top 10 most complex files:

| Rank | File | Complexity | Lines | Functions |
|------|------|------------|-------|-----------|
{{#complexity_ranking}}
| {{rank}} | `{{file}}` | {{complexity}} | {{lines}} | {{functions}} |
{{/complexity_ranking}}

### Dependency Tree (Key Dependencies)

```
{{dependency_tree}}
```

### Analysis Metadata

| Field | Value |
|-------|-------|
| Analysis Duration | {{duration}} |
| Files Analyzed | {{files_analyzed}} |
| Lines Analyzed | {{lines_analyzed}} |
| Agents Used | @code_analyst, @quality_auditor, @debug_specialist, @doc_engineer |
| Framework Version | Q101 Agentic Framework v2.9.2 |

---

## Next Steps

1. Review critical and high severity issues first
2. Run `/analyze --fix` to apply auto-fixable issues
3. Address security vulnerabilities immediately
4. Plan refactoring for architectural issues
5. Schedule documentation improvements

---

*Generated by Q101 Agentic Framework /analyze command*
