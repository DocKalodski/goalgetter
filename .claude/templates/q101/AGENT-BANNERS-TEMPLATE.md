# Agent Banners Template

This document contains the visual welcome banners and extended explanations for all Q101 Framework agents. Used by `/agents --{name}` for detailed agent information.

**Note:** Command banners have been moved to `COMMAND-BANNERS-TEMPLATE.md` (v2.5.0)

---

## Development Agents (12)

### @orchestrator

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                       @orchestrator                          ║
║                      Master Controller                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Coordinate agents through development lifecycle ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Initialize project structure and context               ║
║     • Coordinate agent handoffs and workflow                 ║
║     • Monitor progress through all phases                    ║
║                                                              ║
║  📥 Input:  PRD.md, PRP.md                                   ║
║  📤 Output: Completed application                            ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @orchestrator is the central coordinator of the Q101 Framework,
managing the entire multi-agent development workflow from start to
completion.

**Role:** Master Controller Agent
**Phase:** All phases (continuous)

**Primary Responsibilities:**
1. Initialize project state and context
2. Coordinate agent handoffs between phases
3. Track progress and manage workflow
4. Handle errors and recovery
5. Generate completion reports

**Key Actions:**
- Parse PRD.md and PRP.md for requirements
- Invoke agents in correct sequence
- Validate outputs before handoffs
- Maintain project state in .claude/context/

**When Invoked:**
- Automatically by /execute command
- Runs throughout entire development lifecycle

---

### @scrum_master

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                       @scrum_master                          ║
║                      Sprint Planning                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Plan sprints and organize development work      ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Analyze feature complexity and dependencies            ║
║     • Define sprint scope and velocity                       ║
║     • Create sprint backlog with prioritization              ║
║                                                              ║
║  📥 Input:  PRP.md                                           ║
║  📤 Output: Sprint backlog                                   ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @scrum_master manages agile process, organizing work into sprints
and ensuring efficient development flow.

**Role:** Agile Process Management Agent
**Phase:** Planning Phase

**Primary Responsibilities:**
1. Analyze feature complexity
2. Identify dependencies between features
3. Define sprint scope based on velocity
4. Create prioritized sprint backlog
5. Balance workload across sprints

**Output Artifacts:**
- Sprint backlog with user stories
- Priority rankings
- Dependency matrix
- Velocity estimates

---

### @project_manager

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @project_manager                         ║
║                     Task Management                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Break down tasks and track progress             ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Break user stories into development tasks              ║
║     • Manage dependencies between tasks                      ║
║     • Generate progress reports and metrics                  ║
║                                                              ║
║  📥 Input:  Sprint backlog                                   ║
║  📤 Output: Task breakdown, Progress reports                 ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @project_manager handles task breakdown and progress tracking,
ensuring work is properly organized and monitored.

**Role:** Planning & Tracking Agent
**Phase:** Planning Phase, Implementation Phase

**Primary Responsibilities:**
1. Decompose user stories into tasks
2. Estimate task complexity
3. Identify task dependencies
4. Track implementation progress
5. Generate progress reports

**Output Artifacts:**
- Task breakdown structure
- Progress reports
- Metrics dashboards
- Blockers and risks

---

### @business_analyst

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @business_analyst                        ║
║                  Requirements & User Stories                 ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Translate business needs into requirements      ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Analyze project description for requirements           ║
║     • Create PRD.md following template                       ║
║     • Write user stories with acceptance criteria            ║
║                                                              ║
║  📥 Input:  Project context                                  ║
║  📤 Output: PRD.md, User stories                             ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @business_analyst translates business needs into formal requirements
and user stories that guide development.

**Role:** Requirements & User Stories Agent
**Phase:** Design Phase

**Primary Responsibilities:**
1. Gather and analyze requirements
2. Create Product Requirements Document (PRD)
3. Write user stories with acceptance criteria
4. Define functional requirements
5. Define non-functional requirements

**Output Artifacts:**
- PRD.md - Complete requirements document
- User stories with acceptance criteria
- Requirements matrix

---

### @system_architect

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                    @system_architect                         ║
║                   Architecture Design                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Design architecture and technical specifications║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Design system architecture and APIs                    ║
║     • Define data models and schemas                         ║
║     • Create PRP.md implementation guide                     ║
║                                                              ║
║  📥 Input:  PRD.md                                           ║
║  📤 Output: PRP.md, TECH-STACK.md                            ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @system_architect designs the technical architecture and creates
the Product Requirements Prompt (PRP) that guides implementation.

**Role:** System Architecture & Design Agent
**Phase:** Design Phase

**Primary Responsibilities:**
1. Design system architecture
2. Define API specifications
3. Design data models and schemas
4. Select technology stack
5. Create implementation guidelines

**Output Artifacts:**
- PRP.md - Technical implementation guide
- TECH-STACK.md - Technology decisions
- API specifications
- Data models

---

### @process_expert

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @process_expert                          ║
║                 Agentic Process Design                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Design agentic workflows and pipelines          ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Decompose workflows into agent tasks                   ║
║     • Design pipeline architectures                          ║
║     • Define handoff patterns and state management           ║
║                                                              ║
║  📥 Input:  PRP.md                                           ║
║  📤 Output: AGENTIC-GUIDE.md, Process specs                  ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @process_expert specializes in designing agentic AI workflows
and multi-agent coordination patterns.

**Role:** Agentic Process Architect Agent
**Phase:** Design Phase (for agentic applications)

**Primary Responsibilities:**
1. Analyze requirements for agentic patterns
2. Design agent workflows and pipelines
3. Define handoff protocols
4. Specify state management
5. Document coordination patterns

**Output Artifacts:**
- AGENTIC-GUIDE.md - Agentic design document
- Process flow diagrams
- Handoff specifications

**When Invoked:**
- Only for applications with agentic AI features

---

### @domain_expert

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                      @domain_expert                          ║
║                    Domain Validation                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Validate domain compliance and requirements     ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Assume PRP identity dynamically                        ║
║     • Validate code against domain constraints               ║
║     • Ensure PRP compliance throughout development           ║
║                                                              ║
║  📥 Input:  Code, PRP.md                                     ║
║  📤 Output: Validation report                                ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @domain_expert dynamically assumes the identity defined in PRP.md
to validate that implementation follows domain-specific requirements.

**Role:** Domain Knowledge Oracle Agent
**Phase:** Implementation Phase, Validation Phase

**Primary Responsibilities:**
1. Parse and internalize PRP.md identity
2. Validate code against domain rules
3. Ensure business logic compliance
4. Verify domain constraints
5. Report compliance issues

**Unique Capability:**
- Dynamic identity assumption from PRP.md
- Acts as the "voice" of the product requirements

---

### @lead_developer

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @lead_developer                          ║
║                   Code Implementation                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Implement features and write production code    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Implement backend API endpoints and services           ║
║     • Implement frontend components and pages                ║
║     • Follow PRP specifications and patterns                 ║
║                                                              ║
║  📥 Input:  Tasks, specs                                     ║
║  📤 Output: Source code                                      ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @lead_developer is the primary code implementation agent,
responsible for writing backend and frontend code.

**Role:** Implementation Agent
**Phase:** Implementation Phase

**Primary Responsibilities:**
1. Implement backend APIs and services
2. Implement frontend components
3. Follow PRP specifications
4. Apply coding standards
5. Write clean, maintainable code

**Output Artifacts:**
- Backend source code
- Frontend source code
- API implementations
- Service layers

**Also Used By:**
- /iterate (fix code issues)
- /iterate --refactor (execute refactoring)

---

### @ux_designer

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                       @ux_designer                           ║
║                   UI/UX Design Agent                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Design user interfaces and UI specifications    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Design page layouts and wireframes                     ║
║     • Specify custom components with states                  ║
║     • Document user flows and interactions                   ║
║                                                              ║
║  📥 Input:  PRD.md, PRP.md                                   ║
║  📤 Output: UI-SPECS.md                                      ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @ux_designer creates UI/UX specifications that guide frontend
implementation.

**Role:** UI/UX Design Agent
**Phase:** Design Phase

**Primary Responsibilities:**
1. Design page layouts
2. Create component specifications
3. Define component states
4. Document user flows
5. Specify interactions and animations

**Output Artifacts:**
- UI-SPECS.md - Complete UI specifications
- Page layouts
- Component definitions
- User flow diagrams

---

### @test_architect

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                      @test_architect                         ║
║                  Testing & QA Agent                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Ensure code quality through comprehensive tests ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Write unit tests for backend and frontend              ║
║     • Write integration tests for API endpoints              ║
║     • Validate acceptance criteria and coverage              ║
║                                                              ║
║  📥 Input:  Code, specs                                      ║
║  📤 Output: Test suites, coverage report                     ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @test_architect ensures code quality through comprehensive
testing strategies and test implementation.

**Role:** Testing & Quality Assurance Agent
**Phase:** Implementation Phase, Validation Phase

**Primary Responsibilities:**
1. Design test strategy
2. Write unit tests
3. Write integration tests
4. Validate acceptance criteria
5. Measure and improve coverage

**Output Artifacts:**
- Unit test suites
- Integration test suites
- Coverage reports
- Test documentation

---

### @devops_engineer

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @devops_engineer                         ║
║                Environment & Evaluation Agent                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Prepare environment and evaluate app quality    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Install dependencies (pip, npm)                        ║
║     • Configure environment variables                        ║
║     • Run health checks and API tests                        ║
║                                                              ║
║  📥 Input:  Code, config files                               ║
║  📤 Output: Evaluation report                                ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @devops_engineer handles environment setup, evaluation, and
deployment operations.

**Role:** Environment & Evaluation Agent
**Phase:** Preparation Phase, Evaluation Phase, Deployment Phase

**Primary Responsibilities:**
1. Install dependencies
2. Configure environment
3. Run health checks
4. Execute test suites
5. Generate evaluation reports
6. Handle deployments

**Output Artifacts:**
- evaluation-report.md
- evaluation-results.json
- deployment-report.md

**Commands Using This Agent:**
- /prepare
- /evaluate
- /activate

---

### @security_expert

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @security_expert                         ║
║                  Security Hardening Agent                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Fix security vulnerabilities and harden code    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Implement bcrypt password hashing                      ║
║     • Implement JWT token authentication                     ║
║     • Remediate OWASP Top 10 vulnerabilities                 ║
║                                                              ║
║  📥 Input:  Code, security scan                              ║
║  📤 Output: Secured code                                     ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @security_expert performs security assessment and automatically
remediates common vulnerabilities.

**Role:** Security Expert Agent
**Phase:** Security Phase

**Primary Responsibilities:**
1. Scan for OWASP Top 10 vulnerabilities
2. Implement bcrypt password hashing
3. Implement JWT authentication
4. Fix SQL injection risks
5. Fix XSS vulnerabilities
6. Secure sensitive data handling

**Output Artifacts:**
- security-report.md
- Remediated code
- Security recommendations

**Command Using This Agent:**
- /secure

---

## Analysis Agents (5)

### @code_analyst

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                      @code_analyst                           ║
║                   Lead Analysis Agent                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Analyze codebase architecture and code quality  ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Map codebase structure and dependencies                ║
║     • Calculate complexity metrics                           ║
║     • Detect code smells and anti-patterns                   ║
║     • Identify refactoring opportunities                     ║
║                                                              ║
║  📥 Input:  Source code files                                ║
║  📤 Output: Architecture analysis, refactoring opportunities ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @code_analyst is the lead analysis agent, performing deep
structural analysis of codebases.

**Role:** Lead Analysis Agent
**Phase:** Analysis Phase

**Primary Responsibilities:**
1. Map codebase structure
2. Analyze dependencies and coupling
3. Calculate complexity metrics
4. Detect code smells
5. Identify duplication
6. Detect refactoring opportunities

**Output Artifacts:**
- Architecture analysis
- Complexity metrics
- Code smell catalog
- Refactoring opportunities (REF-001, etc.)

**Command Using This Agent:**
- /analyze

---

### @quality_auditor

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                     @quality_auditor                         ║
║                   Quality Standards Agent                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Audit code against quality standards            ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Check coding standards compliance                      ║
║     • Validate SOLID principles adherence                    ║
║     • Assess DRY/KISS/YAGNI compliance                       ║
║     • Review error handling patterns                         ║
║                                                              ║
║  📥 Input:  Source code files                                ║
║  📤 Output: Quality audit report                             ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @quality_auditor audits code against established quality
standards and best practices.

**Role:** Quality Standards Agent
**Phase:** Analysis Phase

**Primary Responsibilities:**
1. Check coding standards
2. Validate SOLID principles
3. Assess DRY/KISS/YAGNI
4. Review error handling
5. Check logging practices
6. Evaluate maintainability

**Output Artifacts:**
- Quality audit report
- Standards violations
- Best practice recommendations

**Command Using This Agent:**
- /analyze

---

### @debug_specialist

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                    @debug_specialist                         ║
║                   Bug Detection Agent                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Detect potential bugs and security vulnerabilities ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Scan for bug patterns                                  ║
║     • Identify null reference risks                          ║
║     • Detect race conditions                                 ║
║     • Find security vulnerabilities                          ║
║                                                              ║
║  📥 Input:  Source code files                                ║
║  📤 Output: Bug detection report                             ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @debug_specialist hunts for potential bugs, edge cases, and
security vulnerabilities in code.

**Role:** Bug Detection Agent
**Phase:** Analysis Phase

**Primary Responsibilities:**
1. Detect bug patterns
2. Find null reference risks
3. Identify race conditions
4. Detect resource leaks
5. Find security vulnerabilities
6. Analyze edge cases

**Output Artifacts:**
- Bug detection report
- Security vulnerability list
- Edge case analysis

**Command Using This Agent:**
- /analyze
- /analyze --scope=security
- /analyze --scope=bugs

---

### @doc_engineer

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                      @doc_engineer                           ║
║                   Documentation Agent                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Analyze documentation coverage and quality      ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Inventory existing documentation                       ║
║     • Identify documentation gaps                            ║
║     • Assess docstring coverage                              ║
║     • Review type annotation coverage                        ║
║                                                              ║
║  📥 Input:  Source code files, existing docs                 ║
║  📤 Output: Documentation gap report                         ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @doc_engineer analyzes documentation coverage and identifies
gaps that need to be addressed.

**Role:** Documentation Agent
**Phase:** Analysis Phase

**Primary Responsibilities:**
1. Inventory existing docs
2. Identify documentation gaps
3. Assess README quality
4. Check docstring coverage
5. Review type annotations
6. Generate documentation recommendations

**Output Artifacts:**
- Documentation inventory
- Gap analysis report
- Coverage metrics
- README recommendations

**Command Using This Agent:**
- /analyze
- /analyze --scope=docs

---

### @refactor_specialist

**Banner:**
```
╔══════════════════════════════════════════════════════════════╗
║                   @refactor_specialist                       ║
║                   Refactoring Architect                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: Plan safe refactoring with behavior preservation║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • Analyze refactoring requests                           ║
║     • Determine scope (micro/meso/macro)                     ║
║     • Verify behavior preservation                           ║
║     • Create step-by-step refactoring plan                   ║
║                                                              ║
║  📥 Input:  Source code, ANALYSIS-REPORT.md (optional)       ║
║  📤 Output: Refactoring plan, scope recommendation           ║
║                                                              ║
║  ⏳ Executing...                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Extended Explanation:**

The @refactor_specialist (v2.4.0) is the refactoring architect,
responsible for planning safe refactoring operations.

**Role:** Refactoring Architect Agent
**Phase:** Refactoring Phase

**Primary Responsibilities:**
1. Analyze refactoring requests
2. Determine appropriate scope (micro/meso/macro)
3. Verify no external behavior changes
4. Create step-by-step refactoring plan
5. Assess risk level
6. Hand off to executing agents

**Scope Classification:**
- **Micro**: Single file, low risk → @lead_developer
- **Meso**: 2-10 files, medium risk → @lead_developer + @system_architect
- **Macro**: 10+ files, high risk → @system_architect + @lead_developer

**Output Artifacts:**
- Scope recommendation
- Refactoring plan
- Behavior preservation checklist
- Risk assessment

**Command Using This Agent:**
- /iterate --refactor

---

## Banner Design Guidelines

### Agent Banner Template
```
╔══════════════════════════════════════════════════════════════╗
║                      @{agent_name}                           ║
║                   {Agent Title/Role}                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 Mission: {One-line mission statement}                    ║
║                                                              ║
║  📋 Tasks:                                                   ║
║     • {Primary task 1}                                       ║
║     • {Primary task 2}                                       ║
║     • {Primary task 3}                                       ║
║                                                              ║
║  📥 Input:  {What this agent receives}                       ║
║  📤 Output: {What this agent produces}                       ║
║                                                              ║
║  ⏳ Executing...                                             ║
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
| Mission | 🎯 | Primary objective |
| Tasks | 📋 | Work items |
| Input | 📥 | Data received |
| Output | 📤 | Deliverables |
| Status | ⏳ | Execution state |
| Info | 📖 | Extended explanation |
| Bullets | • | List items |

### Usage Notes

1. **Runtime Banners**: Show full box banner
2. **Help Commands**: Show banner + extended explanation via `/agents --{name}`
3. **Width**: Fixed at 64 characters total (62 inner + 2 border)
4. **Centering**: Text centered within the 62-character inner space
5. **Box Style**: Fully enclosed with corners (╔ ╗ ╚ ╝) and sides (║)
