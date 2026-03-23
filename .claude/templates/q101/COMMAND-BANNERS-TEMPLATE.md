# Command Banners Template

This document contains the visual welcome banners and extended explanations for all Q101 Framework commands. Used by `/commands --{name}` for detailed command information.

---

## Command Banners

### /install

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                         /install                             ║
║           Q101 Agentic Framework v2.9.2 Installer            ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Deploy Q101 Framework to target project         ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Create directory structure in target                   ║
║     • Copy 43 framework files (commands, agents, templates)  ║
║     • Install 3 agent skills (docx, xlsx, pdf)               ║
║     • Update target CLAUDE.md with Q101 section              ║
║                                                              ║
║  ⏳ Starting installation...                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /install command deploys the complete Q101 Agentic Framework to any
Claude Code project. It creates the necessary directory structure and
copies all framework files.

**Prerequisites:**
- Target project path must be provided
- Target directory must exist or will be created

**What Gets Installed:**
- 12 slash commands (.claude/commands/)
- 17 agent definitions (.claude/commands/agents/)
- 8 document templates (templates/q101/)
- 2 framework methodologies (frameworks/q101/)
- 4 reference documents (reference/q101/)
- 3 agent skills (docx, xlsx, pdf)

**Output:**
- Complete framework installation
- Updated CLAUDE.md with Q101 section
- Installation verification report

**Next Steps:**
→ /initialize (start requirements discovery)
→ /analyze (analyze existing codebase)

---

### /initialize

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                       /initialize                            ║
║             Project Research & Requirements Discovery        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Research input artifacts and clarify            ║
║              requirements before PRD/PRP generation          ║
║                                                              ║
║  📋 Phases:                                                  ║
║     • Phase 1: Local Research - Scan available inputs        ║
║     • Phase 2: Clarify - Ask targeted questions              ║
║     • Phase 3: Web Research - Search for best practices      ║
║     • Phase 4: Validate - Confirm readiness for /generate    ║
║                                                              ║
║  📥 Input:  reference/, PDFs, screenshots, existing docs     ║
║  📤 Output: .claude/context/requirements-context.md          ║
║                                                              ║
║  ⏳ Starting research phase...                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /initialize command performs pre-flight research before generating
PRD and PRP documents. It analyzes available inputs and clarifies
requirements with the user.

**Prerequisites:**
- Q101 Framework installed
- Reference materials available (optional but recommended)

**Input Sources:**
- reference/screenshots/ - UI mockups, wireframes
- reference/samples/ - Example data files
- reference/guides/ - Documentation, specs
- Existing PRD.md/PRP.md (if updating)

**What It Does:**
1. Scans project for existing documentation
2. Analyzes reference materials (PDFs, images, docs)
3. Asks clarifying questions about requirements
4. Searches web for best practices and patterns
5. Generates requirements-context.md

**Output:**
- .claude/context/requirements-context.md
- Clarified requirements ready for /generate

**Next Steps:**
→ /generate (create PRD and PRP)

---

### /generate

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                        /generate                             ║
║              PRD & PRP Document Generator                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Generate PRD and PRP documents from context     ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Scan repository for project files and context          ║
║     • Present requirements summary for user approval         ║
║     • Generate PRD.md and PRP.md documents                   ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /generate command creates the foundational Product Requirements
Document (PRD) and Product Requirements Prompt (PRP) that guide the
multi-agent development process.

**Prerequisites:**
- Q101 Framework installed
- /initialize completed (recommended)
- Project context available

**Agents Involved:**
- @business_analyst - Creates PRD with user stories
- @system_architect - Creates PRP with technical specs

**Output:**
- PRD.md - Product Requirements Document
  - Project overview
  - User stories with acceptance criteria
  - Functional requirements
  - Non-functional requirements

- PRP.md - Product Requirements Prompt
  - Technical architecture
  - API specifications
  - Data models
  - Implementation guidelines

**Next Steps:**
→ /execute (build the application)

---

### /execute

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                         /execute                             ║
║              Multi-Agent Orchestration Engine                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Build your app using 12 specialized AI agents   ║
║                                                              ║
║  📋 Workflow:                                                ║
║     • Phase 1: Design (PRD → Architecture → UI specs)        ║
║     • Phase 2: Planning (Sprint planning → Task breakdown)   ║
║     • Phase 3: Implementation (Code → Tests → Validation)    ║
║     • Phase 4: Documentation (README → Changelog)            ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /execute command is the core orchestration engine of the Q101
Framework. It coordinates 12 specialized agents through a complete
Scrum/Agile development lifecycle.

**Prerequisites:**
- PRD.md must exist (run /generate first)
- PRP.md must exist (run /generate first)

**Agents Involved:**
@orchestrator, @scrum_master, @project_manager, @business_analyst,
@system_architect, @process_expert, @domain_expert, @lead_developer,
@ux_designer, @test_architect, @devops_engineer, @security_expert

**Phases:**
1. Design Phase - Architecture, UI specs, tech stack
2. Planning Phase - Sprint planning, task breakdown
3. Implementation Phase - Code generation, testing
4. Documentation Phase - README, CHANGELOG

**Output:**
- Complete application source code
- Test suites with coverage
- Documentation (README, CHANGELOG)
- Sprint completion reports

**Next Steps:**
→ /prepare (install dependencies)
→ /evaluate (run quality checks)

---

### /prepare

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                         /prepare                             ║
║                  Environment Preparation                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Prepare your development environment            ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Install backend dependencies (pip/poetry)              ║
║     • Install frontend dependencies (npm)                    ║
║     • Configure environment variables (.env)                 ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /prepare command sets up the development environment by installing
dependencies and configuring environment variables.

**Prerequisites:**
- Application code generated (run /execute first)
- Package managers available (pip, npm)

**Agent Involved:**
- @devops_engineer - Environment setup specialist

**What It Does:**
1. Detects project type (Python, Node.js, or both)
2. Installs backend dependencies (requirements.txt, pyproject.toml)
3. Installs frontend dependencies (package.json)
4. Creates .env file from .env.example
5. Validates environment configuration

**Output:**
- All dependencies installed
- .env file configured
- Environment ready for testing

**Next Steps:**
→ /evaluate (run quality checks)

---

### /evaluate

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                        /evaluate                             ║
║                    Quality Evaluation                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Evaluate application quality and readiness      ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Run health checks on API endpoints                     ║
║     • Execute test suites with coverage                      ║
║     • Generate evaluation report                             ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /evaluate command performs comprehensive quality assessment of the
generated application through testing and health checks.

**Prerequisites:**
- Application code exists
- Environment prepared (run /prepare first)

**Agent Involved:**
- @devops_engineer - Evaluation and testing

**What It Does:**
1. Starts application server (if needed)
2. Runs API health checks
3. Executes unit tests with coverage
4. Executes integration tests
5. Generates evaluation report

**Output:**
- evaluation-report.md - Human-readable report
- evaluation-results.json - Machine-readable results
- Test coverage metrics
- Health check results

**Next Steps:**
→ /iterate (fix issues found)
→ /secure (security assessment)
→ /activate (deploy if ready)

---

### /iterate

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                        /iterate                              ║
║                  Iterative Improvement                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Fix issues and add features iteratively         ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Analyze evaluation report for issues                   ║
║     • Route fixes to appropriate agents                      ║
║     • Implement requested features                           ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /iterate command enables incremental improvements to the application
by fixing issues from evaluation and adding new features.

**Prerequisites:**
- Evaluation report exists (run /evaluate first)
- OR: Use --refactor flag for refactoring mode

**Usage Modes:**
```bash
/iterate                      # Address all issues from evaluation
/iterate --issues 1,3,5       # Address specific issues only
/iterate --feature "Add X"    # Add new feature
/iterate --refactor           # Enter refactoring mode
/iterate --refactor "Split Y" # Specific refactoring request
```

**Agents Involved:**
- @lead_developer - Code fixes
- @test_architect - Test fixes
- @ux_designer - UI fixes
- @system_architect - Architecture fixes
- @refactor_specialist - Refactoring (v2.4.0)

**Output:**
- Fixed code
- iteration-report.md
- Updated tests (if needed)

**Next Steps:**
→ /evaluate (verify fixes)
→ /secure (security check)
→ /activate (deploy)

---

### /secure

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                         /secure                              ║
║                   Security Assessment                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Security assessment and vulnerability fixes     ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Scan code for security vulnerabilities                 ║
║     • Enforce bcrypt/JWT authentication                      ║
║     • Fix OWASP Top 10 issues                                ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /secure command performs comprehensive security assessment and
automatically remediates common vulnerabilities.

**Prerequisites:**
- Application code exists
- Recommended after /evaluate passes

**Agent Involved:**
- @security_expert - Security hardening specialist

**What It Does:**
1. Scans for OWASP Top 10 vulnerabilities
2. Checks authentication implementation
3. Enforces bcrypt for password hashing
4. Enforces JWT for token authentication
5. Fixes SQL injection risks
6. Fixes XSS vulnerabilities
7. Secures sensitive data handling

**Output:**
- security-report.md - Findings and fixes
- Remediated code
- Security recommendations

**Next Steps:**
→ /activate (deploy to production)

---

### /activate

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                        /activate                             ║
║                Multi-Environment Deployment                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Deploy to development/staging/production        ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Validate environment requirements                      ║
║     • Execute deployment procedures                          ║
║     • Verify deployment success                              ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /activate command handles multi-environment deployment with
environment-specific configurations and validation.

**Prerequisites:**
- Application tested and secured
- Target environment configured

**Usage:**
```bash
/activate development    # Deploy to dev environment
/activate staging        # Deploy to staging
/activate production     # Deploy to production (requires /secure)
```

**Agent Involved:**
- @devops_engineer - Deployment specialist

**What It Does:**
1. Validates environment requirements
2. Runs pre-deployment checks
3. Executes deployment procedures
4. Verifies deployment success
5. Generates deployment report

**Output:**
- deployment-report.md
- Deployed application
- Environment verification

---

### /analyze

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                        /analyze                              ║
║             Deep Codebase Analysis & Review                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: Analyze existing code for quality, bugs, and    ║
║              improvement opportunities                       ║
║                                                              ║
║  📋 Phases:                                                  ║
║     • Phase 1: Discovery - Map codebase structure            ║
║     • Phase 2: Analysis - Deep review by 5 agents            ║
║     • Phase 3: Synthesis - Prioritized findings              ║
║     • Phase 4: Decision - Choose what to fix                 ║
║     • Phase 5: Apply - Implement approved improvements       ║
║                                                              ║
║  📥 Input:  Any existing codebase                            ║
║  📤 Output: ANALYSIS-REPORT.md + optional fixes              ║
║                                                              ║
║  ⏳ Starting codebase discovery...                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The /analyze command performs deep analysis of any existing codebase
using 5 specialized analysis agents. Works standalone without
requiring PRD/PRP documents.

**Prerequisites:**
- Source code exists
- No PRD/PRP required

**Usage:**
```bash
/analyze                     # Full analysis
/analyze src/api/            # Analyze specific path
/analyze --scope=security    # Focus on security
/analyze --scope=docs        # Focus on documentation
/analyze --report-only       # Generate report only, no fixes
```

**Agents Involved:**
- @code_analyst - Architecture, complexity, code smells
- @quality_auditor - Standards, SOLID, best practices
- @debug_specialist - Bugs, security risks, edge cases
- @doc_engineer - Documentation gaps, type coverage
- @refactor_specialist - Refactoring opportunities

**Output:**
- ANALYSIS-REPORT.md - Comprehensive findings
- codebase-profile.json - Tech stack data
- analysis-findings.json - Machine-readable findings
- Optional: Applied fixes

**Next Steps:**
→ /iterate (fix issues)
→ /iterate --refactor (refactor code)
→ /secure (security fixes)

---

### /commands

**Banner (Markdown Table Format):**

| ================================================== |
|:--------------------------------------------------:|
| **/commands**                                      |
| Q101 Framework v2.9.2 Command Reference            |
|                                                    |
| By EMIL V. CAPINO                                  |
| **==================================================** |

**Extended Explanation:**

The /commands command displays a reference of all available Q101
Framework commands. Use --{name} to see detailed information about
a specific command.

**Usage:**
```bash
/commands                    # Show all commands table
/commands --execute          # Show /execute details
/commands --analyze          # Show /analyze details
```

---

### /agents

**Banner (Markdown Table Format):**

| ================================================== |
|:--------------------------------------------------:|
| **/agents**                                        |
| Q101 Framework v2.9.2 Agent Reference              |
|                                                    |
| By EMIL V. CAPINO                                  |
| **==================================================** |

**Extended Explanation:**

The /agents command displays a reference of all 17 Q101 Framework
agents. Use --{name} to see detailed information about a specific agent.

**Usage:**
```bash
/agents                      # Show all agents table
/agents --lead_developer     # Show @lead_developer details
/agents --code_analyst       # Show @code_analyst details
```

---

### /workflows

**Banner (Markdown Table Format):**

| ================================================== |
|:--------------------------------------------------:|
| **/workflows**                                     |
| Q101 Framework v2.9.2 Workflow Reference           |
|                                                    |
| By EMIL V. CAPINO                                  |
| **==================================================** |

**Extended Explanation:**

The /workflows command displays all supported Q101 Framework workflows,
including primary workflows and suggested hybrid combinations.
Use --{name} to see a detailed workflow diagram.

**Usage:**
```bash
/workflows                   # Show all workflows table
/workflows --development     # Show development workflow diagram
/workflows --refactoring     # Show refactoring workflow diagram
```

---

## Banner Design Guidelines

### Help Command Banner Template (Markdown Table Format)

For `/commands`, `/agents`, and `/workflows` help commands, use this markdown table format:

```markdown
| ================================================== |
|:--------------------------------------------------:|
| **/{command_name}**                                |
| Q101 Framework {Type} Reference                    |
|                                                    |
| By EMIL V. CAPINO                                  |
| **==================================================** |
```

Key elements:
- **Top row**: 50 `=` characters (rendered bold as table header)
- **Separator**: 50 `-` characters with center alignment `:`
- **Content rows**: Command name (bold), description, blank, author
- **Bottom row**: 50 `=` characters wrapped in `**` for bold
- **After table**: Continue directly with content (no spacer needed)

### Execution Command Banner Template (Code Block Format)

For execution commands like `/execute`, `/analyze`, etc., use the traditional code block format:

```
╔══════════════════════════════════════════════════════════════╗
║                        /{command_name}                       ║
║                  {Brief Description}                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Purpose: {One-line purpose statement}                    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • {Task 1}                                               ║
║     • {Task 2}                                               ║
║     • {Task 3}                                               ║
║                                                              ║
║  ⏳ Starting execution...                                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### Design Elements

| Element | Unicode | Purpose |
|---------|---------|---------|
| Top-left corner | ╔ (U+2554) | Box start |
| Top-right corner | ╗ (U+2557) | Box start |
| Bottom-left corner | ╚ (U+255A) | Box end |
| Bottom-right corner | ╝ (U+255D) | Box end |
| Vertical border | ║ (U+2551) | Left/right sides |
| Horizontal border | ═ (U+2550) | Top/bottom |
| Separator | ╠═══╣ | Section divider |
| Purpose | 🎯 | Primary objective |
| Tasks | 📋 | Work items |
| Input | 📥 | Data received |
| Output | 📤 | Deliverables |
| Status | ⏳ | Execution state |
| Info | 📖 | Extended explanation |
| Tip | 💡 | Usage hints |
| Bullets | • | List items |

### Usage Notes

1. **Runtime Banners**: Show full box banner
2. **Help Commands**: Show banner + extended explanation
3. **Width**: Fixed at 64 characters total (62 inner + 2 border)
4. **Centering**: Text centered within the 62-character inner space
5. **Box Style**: Fully enclosed with corners (╔ ╗ ╚ ╝) and sides (║)
