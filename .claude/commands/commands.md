# /commands - Q101 Framework v2.12.28 Command Reference

**Version:** 2.12.28
**Last Updated:** 2026-01-16
**Status:** ACTIVE

> **Purpose:** Display information about all Q101 Framework commands or show detailed information for a specific command.

---

## P - PROMPT (System Identity)

<system_identity>

## Agent Role & Objective

You are the **Q101 Command Reference Agent**. Your task is to display helpful information about available commands in the Q101 Framework.

### Primary Objective

Provide quick reference for all commands or detailed information for a specific command when requested.

### Core Responsibilities

1. **List Mode (default)** - Display table of all commands with one-line descriptions
2. **Detail Mode (--{name})** - Display specific command banner with extended explanation

### Behavioral Constraints

- MUST display the appropriate banner immediately
- MUST show table view by default (no arguments)
- MUST show detail view when --{name} flag is provided
- MUST NOT perform any file operations or code changes
- SHOULD provide helpful next-step suggestions

### Success Criteria

- User can quickly see all available commands
- User can get detailed information on any specific command
- Output is clear, scannable, and actionable

</system_identity>

---

## A - ARTIFACTS (Output Patterns)

### Table View (Default)

When invoked as `/commands` with no arguments, display EXACTLY this output (nothing more, nothing less):

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/commands**                                      |
| Q101 Framework v2.12.28 Command Reference          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

## Available Commands (21):

| Command | Description |
|---------|-------------|
| /install | Deploy Q101 Framework to target project |
| /discover | Browse Anthropic examples to kickstart projects |
| /cookbooks | Browse Anthropic Cookbook examples (87+ recipes) |
| /quickstarts | Browse Anthropic Quickstarts (5 production examples) |
| /ideate | Guided brainstorming for project ideas |
| /research | Evidence-based research with citations |
| /initialize | Research artifacts and clarify requirements |
| /generate | Generate PRD.md and PRP.md documents |
| /execute | Build application with 12 specialized agents |
| /autonomous | Long-running autonomous coding sessions |
| /prepare | Install dependencies and configure environment |
| /evaluate | Run tests, health checks, quality validation |
| /iterate | Fix issues, add features, perform refactoring |
| /secure | Security assessment and vulnerability remediation |
| /activate | Deploy to development/staging/production |
| /analyze | Deep codebase analysis with 5 analysis agents |
| /commands | Show this command reference (you are here) |
| /agents | Show agent reference |
| /workflows | Show workflow reference |
| /skills | Show agent skills reference |
| /utilities | Framework utilities (install, update, batch update, verify) |

>

## Hackathon Package (3):

| Command | Framework | Description |
|---------|-----------|-------------|
| /hackathon | P.R.I.M.E. | Build MVPs — autonomous or phase-by-phase |
| /hackatest | P.R.O.V.E. | Automated QA testing (Playwright + Computer Use) |
| /hackafeed | F.E.E.D.B.A.C.K. | Iterative improvement until quality targets met |

>

**Usage:** `/commands --{name}` for details\
**Example:** `/commands --execute`
<!-- END EXACT OUTPUT -->

**STOP HERE. Do NOT add Related:, horizontal lines, or any other content after Example.**

### Detail View (--{name})

When invoked as `/commands --{name}`, display the banner and extended explanation for that command.

**Available flags:**
- `--install` - Framework installer
- `--discover` - Anthropic example discovery
- `--cookbooks` - Anthropic Cookbook browser
- `--quickstarts` - Anthropic Quickstarts browser
- `--hackathon` - Rapid MVP building
- `--hackatest` - Automated QA testing
- `--hackafeed` - Iterative improvement loop
- `--ideate` - Creative project ideation
- `--research` - Evidence-based research
- `--initialize` - Requirements discovery
- `--generate` - PRD/PRP generator
- `--execute` - Multi-agent orchestration
- `--autonomous` - Long-running autonomous coding
- `--prepare` - Environment preparation
- `--evaluate` - Quality evaluation
- `--iterate` - Iterative improvement
- `--secure` - Security assessment
- `--activate` - Multi-environment deployment
- `--analyze` - Deep codebase analysis
- `--commands` - Command reference (this command)
- `--agents` - Agent reference
- `--workflows` - Workflow reference
- `--skills` - Agent skills reference
- `--utilities` - Framework utilities reference

---

## R - RESOURCES (References)

### Source Files
| File | Purpose |
|------|---------|
| templates/q101/COMMAND-BANNERS-TEMPLATE.md | Banner definitions and extended explanations |

---

## T - TOOLS (Available Actions)

### Display Operations
- Display table of all commands
- Display specific command banner and explanation

---

## ⛔ EXECUTION CHECKPOINT - READ BEFORE PROCEEDING ⛔

**STOP. Before you output ANYTHING, verify:**

- [ ] Have I output the banner text yet? **If NO → Go to STEP 1 NOW**
- [ ] Did I write "I'll execute..." or similar? **If YES → YOU VIOLATED THE RULE**
- [ ] Did I call any tools (Read, TodoWrite, etc.)? **If YES → YOU VIOLATED THE RULE**

**ONLY after displaying the banner may you proceed to read files and call tools.**

---

## Execution Steps

### Step 0: Parse Arguments

Check for command name flag:
- No arguments → Table view
- `--{name}` argument → Detail view for that command

### Step 1: Display Output

**If no arguments (Table View):**

Display the table banner showing all 12 commands with one-line descriptions.

**If --{name} flag provided (Detail View):**

Display the specific command's banner and extended explanation.

---

## Command Banners Reference

### /install

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/install**                                       |
| Q101 Framework v2.12.4 Framework Installer         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Deploy Q101 Framework to target project

>

## Installation Tasks:

| Task | Description |
|------|-------------|
| Structure | Create directory structure in target |
| Commands | Copy 16 slash command files (.claude/commands/) |
| Agents | Copy 26 agent definitions (.claude/commands/agents/) |
| Templates | Copy 9 document templates (.claude/templates/q101/) |
| Record | Create installation tracking file (.claude/q101-installation.json) |

>

**Input:** Target project path\
**Output:** Complete framework installation

>

**Usage:** `/install [target-path]`\
**Example:** `/install "C:\Projects\MyApp"`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /install command deploys the complete Q101 Agentic Framework to any
Claude Code project. It creates the necessary directory structure and
copies all framework files.

>

**Prerequisites:**

- Target project path must be provided
- Target directory must exist

>

**What Gets Installed:**

- 16 slash commands (.claude/commands/)
- 26 agent definitions (.claude/commands/agents/)
- 9 document templates (.claude/templates/q101/)

>

**Flags:**

- `--only-commands` - Install only slash command files
- `--only-agents` - Install only agent definitions
- `--only-templates` - Install only document templates

>

**Output:**

- Complete framework installation
- Installation record (.claude/q101-installation.json)
- Success banner with next steps

>

**Next Steps:**
1. /discover (browse Anthropic examples)
2. /ideate (brainstorm project ideas)
3. /initialize (start requirements discovery)
4. /analyze (analyze existing codebase)

---

### /discover

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/discover**                                      |
| Q101 Framework v2.12.16 Example Discovery          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Browse Anthropic examples to kickstart projects

>

## Discovery Sources:

| Source | Repository | Examples |
|--------|------------|----------|
| --cookbooks | anthropics/claude-code-cookbook | MCP, agents, tools |
| --quickstarts | anthropics/quickstarts | Getting started |

>

**Input:** Source flag (--cookbooks or --quickstarts)\
**Output:** Table of examples or cloned files

>

**Usage:** `/discover --cookbooks [--show=name] [--clone=name]`\
**Example:** `/discover --cookbooks --clone=mcp-server --then=initialize`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /discover command enables browsing available code examples from Anthropic
repositories (claude-code-cookbook and quickstarts) to kickstart new projects
with proven patterns and best practices.

>

**Prerequisites:**

- Source repositories cloned to Labs folder
- C:\Users\Public\Claude\Q101\Labs\claude-cook-books
- C:\Users\Public\Claude\Q101\Labs\claude-quick-starts

>

**How It Works:**

1. Scans specified source repository for examples
2. Displays table with Name, Category, Description, Tags
3. --show=name displays example README and structure
4. --clone=name copies example to current project
5. --then=command chains to next workflow

>

**Flags:**

- `--cookbooks` - Browse claude-code-cookbook examples
- `--quickstarts` - Browse quickstarts examples
- `--show=<name>` - View specific example details
- `--clone=<name>` - Copy example to project folder
- `--category=<cat>` - Filter by category
- `--then=<cmd>` - Chain to command after clone

>

**Output:**

- Table of examples (list mode)
- Example details with README (show mode)
- Cloned files (clone mode)
- discovery-registry.json tracking

>

**Next Steps:**

1. /initialize (start requirements discovery from example)
2. /ideate (brainstorm modifications to example)
3. /hackathon (rapid MVP build from example)

---

### /cookbooks

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/cookbooks**                                     |
| Q101 Framework v2.12.21 Anthropic Cookbooks        |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Discover and clone Anthropic Cookbook examples from GitHub

>

## Available Modes:

| Mode | Flag | Description |
|------|------|-------------|
| Browse | (default) | List categories with counts |
| Search | --search=keyword | Filter by keyword |
| Category | --category=name | Filter by category |
| Detail | --show=path | Show example metadata |
| Clone | --clone=path | Download to reference/cookbooks/ |

>

**Input:** Flags (--search, --show, --clone, --category)\
**Output:** Categories, search results, or cloned files

>

**Usage:** `/cookbooks [--search=<keyword>] [--clone=<path>]`\
**Example:** `/cookbooks --clone=multimodal/crop_tool.ipynb --then=ideate`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /cookbooks command enables browsing and cloning production-ready examples
from Anthropic's official anthropic-cookbook repository (87+ examples, 31k+ stars)
using Claude's native tools. No Python dependencies required.

>

**Data Source:**

- GitHub: https://github.com/anthropics/anthropic-cookbook
- Registry: registry.yaml (fetched via WebFetch)
- Cache: .claude/context/cookbooks-catalog.json (TTL: 1 hour)

>

**How It Works:**

1. Fetches catalog from GitHub registry.yaml
2. Caches catalog locally with 1-hour TTL
3. Displays categories or search results
4. --clone downloads files to reference/cookbooks/
5. --then chains to ideate/research/initialize

>

**Categories (13):**

- Agent Patterns, Claude Agent SDK, Evals
- Extended Thinking, Fine-Tuning, Integrations
- Multimodal, Observability, RAG & Retrieval
- Responses, Skills, Thinking, Tools

>

**Flags:**

- `--search=<keyword>` - Search by keyword
- `--category=<name>` - Filter by category
- `--show=<path>` - View example details
- `--clone=<path>` - Clone example to project
- `--then=<cmd>` - Chain to ideate/research/initialize
- `--refresh` - Force catalog refresh
- `--list` - List all examples

>

**Output:**

- Category table (browse mode)
- Search results (search mode)
- Example metadata (show mode)
- Cloned files (clone mode)

>

**Next Steps:**

1. /ideate (brainstorm adaptations from example)
2. /research (research related best practices)
3. /initialize (start requirements discovery)

---

### /hackathon

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/hackathon**                                     |
| Q101 Framework v2.12.28 Rapid MVP Builder          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Build MVPs — autonomous or phase-by-phase with PRIME methodology

>

## Quality Modes:

| Mode | Duration | Phases | Best For |
|------|----------|--------|----------|
| Lightning | 4-8hr | 4 | Weekend sprints, POCs |
| Standard | 24-48hr | 6 | Hackathon competitions |
| Polish | 3-7 day | 8 | Extended MVPs, demos |

>

**Input:** Quality mode (--quality=lightning|standard|polish)\
**Output:** Working MVP with quality-appropriate deliverables

>

**Usage:** `/hackathon --quality=standard [--idea=id]`\
**Example:** `/hackathon --quality=lightning`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /hackathon command enables rapid MVP building using proven hackathon
methodologies with time-boxed development phases and quality-appropriate
deliverables.

>

**Prerequisites:**

- Q101 Framework installed
- Optional: Idea from /ideate (--idea flag)
- Optional: Example from /discover (clone first)

>

**Quality Mode Phases:**

Lightning (4 phases, 4-8hr):
1. IDEATE (30 min) - Quick concept validation
2. DESIGN (1 hr) - Minimal PRD
3. BUILD (4-6 hr) - Core features via /execute
4. DEMO (30 min) - README + basic docs

Standard (6 phases, 24-48hr):
1. IDEATE (1 hr) - Full brainstorming
2. DESIGN (2 hr) - PRD + minimal PRP
3. BUILD (12-18 hr) - Core + secondary via /autonomous
4. TEST (2-4 hr) - Basic validation
5. DOCUMENT (2 hr) - README + API docs
6. DEMO (1 hr) - Presentation prep

Polish (8 phases, 3-7 days):
1. RESEARCH (4 hr) - Market/tech research
2. IDEATE (4 hr) - Full brainstorming with analysts
3. DESIGN (8 hr) - Complete PRD + PRP
4. BUILD (24-48 hr) - Full features via /autonomous --full
5. TEST (8 hr) - Comprehensive testing
6. DOCUMENT (4 hr) - Full documentation
7. DEPLOY (4 hr) - Production deployment
8. DEMO (4 hr) - Pitch deck + demo video

>

**Flags:**

- `--quality=lightning` - 4-8hr sprint mode
- `--quality=standard` - 24-48hr hackathon mode
- `--quality=polish` - 3-7 day extended mode
- `--idea=<id>` - Build from existing ideation
- `--from=<file>` - Build from idea file
- `--status` - View current progress
- `--resume` - Resume paused session
- `--ideate` - Run IDEATE phase only
- `--design` - Run DESIGN phase only
- `--build` - Run BUILD phase only
- `--test` - Run TEST phase only
- `--document` - Run DOCUMENT phase only
- `--present` - Run PRESENT phase only
- `--launch` - Run LAUNCH phase only
- `--then=hackatest` - Chain to testing
- `--then=hackatest --then=hackafeed` - Full Hackathon Trilogy

>

**Output:**

- Working MVP code
- README.md (all modes)
- Documentation (standard+)
- Demo materials (standard+)
- Deployment (polish only)
- hackathon-registry.json tracking

>

**Next Steps:**

1. /hackatest (validate MVP quality)
2. /hackafeed (fix issues from testing)
3. /prepare (install dependencies)

---

### /hackatest

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
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

**Purpose:** Dual-mode automated testing for /hackathon MVPs

>

## Test Engines:

| Engine | Speed | How It Tests |
|--------|-------|--------------|
| Playwright | Fast (~30s) | Programmatic browser automation |
| Computer Use | Thorough (~2-5 min) | Claude AI visually interacts |
| Both (default) | Combined | Comprehensive coverage |

>

**Input:** Running app + PRP.md or AI exploration\
**Output:** Self-contained HTML report with screenshots/video

>

**Usage:** `/hackatest [--engine=playwright|computer-use|both]`\
**Example:** `/hackatest --engine=playwright`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /hackatest command provides dual-mode automated testing for MVPs built
with /hackathon. It runs Playwright (fast programmatic) and Computer Use
(visual AI) testing engines to validate application quality.

>

**Prerequisites:**

- Node.js 18+ installed
- Docker Desktop (for Computer Use engine, optional)
- Running application to test

>

**How It Works:**
1. Auto-installs Playwright and Chromium if missing
2. Auto-detects target URL (scans localhost:3000-3010)
3. Discovers test scenarios from PRP.md or AI exploration
4. Runs selected engine(s) against application
5. Generates self-contained HTML report

>

**Flags:**

- `--engine=playwright` - Fast programmatic testing only
- `--engine=computer-use` - Visual AI testing only
- `--engine=both` - Both engines (default)
- `--target=<url>` - Explicit target URL
- `--source=prp|plan|explore` - Test discovery mode
- `--browser=chromium|firefox|webkit|all` - Browser selection
- `--viewport=desktop|tablet|mobile|all` - Viewport selection
- `--baseline=create|compare|update` - Visual regression
- `--silent` - Silent mode for chaining
- `--then=hackafeed` - Chain to improvement loop

>

**Output:**

- report.html (self-contained HTML report)
- test-results.json (machine-readable)
- screenshots/ (per-scenario captures)
- videos/ (session recordings)

>

**Next Steps:**

1. /hackafeed (fix issues found by testing)
2. /iterate (manual improvement alternative)
3. /evaluate (comprehensive quality evaluation)

---

### /hackafeed

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
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

**Purpose:** Iterative improvement for /hackathon MVPs based on /hackatest results

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

**Input:** test-results.json (from /hackatest)\
**Output:** Fixed code + quality certificate

>

**Usage:** `/hackafeed [--target=N] [--max-cycles=N] [--once]`\
**Example:** `/hackafeed --target=100`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /hackafeed command iteratively improves MVPs based on test results from
/hackatest. It runs the F.E.E.D.B.A.C.K. loop (Find, Examine, Engineer,
Develop, Build, Assert, Commit, Kick) until quality targets are met.

>

**Prerequisites:**

- /hackatest results available (test-results.json)
- Running application or buildable project

>

**How It Works:**
1. Parses test failures from /hackatest results
2. Analyzes root causes and clusters related issues
3. Designs and implements fixes with agent routing
4. Rebuilds and re-tests affected areas
5. Creates git checkpoint after each cycle
6. Loops until quality target met or max cycles reached

>

**Flags:**

- `--target=N` - Quality target percentage (default: 95)
- `--max-cycles=N` - Maximum improvement cycles (default: 5)
- `--once` - Run single cycle only
- `--results=PATH` - Explicit results path
- `--phase=X` - Resume from specific phase
- `--silent` - Silent mode for chaining

>

**Output:**

- Fixed source code with git commits
- feedback-report.md (cycle summaries)
- Quality certificate (when targets met)

>

**The Hackathon Trilogy:**

- /hackathon (P.R.I.M.E.) — Build the MVP
- /hackatest (P.R.O.V.E.) — Validate the MVP
- /hackafeed (F.E.E.D.B.A.C.K.) — Perfect the MVP

>

**Next Steps:**

1. /hackatest (re-validate after fixes)
2. /prepare (install dependencies)
3. /evaluate (comprehensive evaluation)

---

### /ideate

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/ideate**                                        |
| Q101 Framework v2.12.4 Creative Project Ideation   |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Guide structured brainstorming for project ideas before development begins

>

## Methodology (3 Phases):

| Phase | Description |
|-------|-------------|
| UNDERSTAND | Explore problem space with Socratic questions |
| EXPLORE | Generate 2-3 approaches with trade-offs |
| PRESENT | Document actionable idea context |

>

**Input:** Your creative ideas and feedback\
**Output:** `.claude/context/idea-context.md`

>

**Usage:** `/ideate [topic] [--expand] [--export=format]`\
**Example:** `/ideate "AI task manager" --export=pptx`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /ideate command guides structured brainstorming sessions for project ideas.
It uses the brainstorming superpower skill to help you explore and refine ideas
before committing to development.

>

**Prerequisites:**

- Q101 Framework installed
- No prior requirements (can start from scratch)

>

**How It Works:**
1. Auto-enables brainstorming superpower for the session
2. Asks questions ONE at a time (Socratic method)
3. Generates 2-3 distinct approaches with trade-offs
4. Documents everything in idea-context.md
5. Auto-restores superpower state after session

>

**Usage:**

- `/ideate` - Open exploration (no topic)
- `/ideate "AI task manager"` - Start with specific topic
- `/ideate --expand` - Expand existing idea-context.md
- `/ideate --export=pptx` - Export to PowerPoint presentation
- `/ideate --session=abc123` - Resume previous session

>

**Output:**

- .claude/context/idea-context.md - Main deliverable
- .claude/context/idea-sessions/{id}.md - Session archive
- idea-context.{docx|pdf|pptx} - Optional exports

>

**Hybrid Workflows:**

- Ideation → Development: `/ideate` → `/initialize` → `/generate` → `/execute`
- Iterative Ideation: `/ideate` → `/ideate --expand` → `/initialize`
- Presentation-First: `/ideate --export=pptx` → stakeholder review → `/initialize`

>

**Next Steps:**
1. /research (validate with evidence-based research)
2. /initialize (start development with idea-context.md)
3. /ideate --expand (refine ideas further)

---

### /research

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/research**                                      |
| Q101 Framework v2.12.4 Evidence-Based Research     |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Gather evidence with citations, sources, and confidence scoring for informed decisions

>

## Research Phases:

| Phase | Description |
|-------|-------------|
| DISCOVER | Explore sources and gather information |
| VALIDATE | Assess source credibility (0.0-1.0 score) |
| SYNTHESIZE | Compile findings with citations |
| REPORT | Generate structured research output |

>

**Input:** Research topic or idea-context.md\
**Output:** `.claude/context/research-context.md`

>

**Usage:** `/research "topic" [--brief|--deep|--scan]`\
**Example:** `/research "AI coding assistants" --deep`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /research command provides evidence-based research capabilities with
citation tracking, source validation, and confidence scoring. It bridges
creative ideation and structured development.

>

**Prerequisites:**

- Q101 Framework installed
- Topic from /ideate or direct input

>

**Research Modes:**

1. **Standard Mode (default)**
   `/research "topic"` - 5-8 queries, balanced depth

2. **Brief Mode (--brief)**
   `/research "topic" --brief` - 3-5 queries, executive summary

3. **Deep Mode (--deep)**
   `/research "topic" --deep` - 10-15 queries, comprehensive

4. **Scan Mode (--scan)**
   `/research "topic" --scan` - Market/trend signals

>

**What It Does:**
1. Executes web searches based on topic
2. Tracks sources with SRC-### IDs
3. Scores source credibility (0.0-1.0)
4. Cross-references critical claims
5. Generates research-context.md

>

**Output:**

- .claude/context/research-context.md - Main deliverable
- .claude/context/research-sources.json - Source data
- RESEARCH-REPORT.docx/pdf - Optional exports

>

**Agent Involved:**

- @research_analyst - Research and citation

>

**Next Steps:**
1. /initialize (use research findings in requirements)
2. /ideate --initialize (create project with research)

---

### /initialize

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/initialize**                                    |
| Q101 Framework v2.12.4 Requirements Discovery      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Research input artifacts and clarify requirements before PRD/PRP generation

>

## Discovery Phases:

| Phase | Description |
|-------|-------------|
| Local Research | Scan available inputs (PDFs, screenshots, docs) |
| Clarify | Ask targeted questions about requirements |
| Web Research | Search for best practices and patterns |
| Validate | Confirm readiness for /generate |

>

**Input:** reference/, PDFs, screenshots, existing docs\
**Output:** `.claude/context/requirements-context.md`

>

**Usage:** `/initialize`\
**Example:** `/initialize` (after placing reference materials)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /initialize command performs pre-flight research before generating
PRD and PRP documents. It analyzes available inputs and clarifies
requirements with the user.

>

**Prerequisites:**

- Q101 Framework installed
- Reference materials available (optional but recommended)

>

**Input Sources:**

- reference/screenshots/ - UI mockups, wireframes
- reference/samples/ - Example data files
- reference/guides/ - Documentation, specs
- Existing PRD.md/PRP.md (if updating)

>

**What It Does:**
1. Scans project for existing documentation
2. Analyzes reference materials (PDFs, images, docs)
3. Asks clarifying questions about requirements
4. Searches web for best practices and patterns
5. Generates requirements-context.md

>

**Output:**

- .claude/context/requirements-context.md
- Clarified requirements ready for /generate

>

**Next Steps:**
1. /generate (create PRD and PRP)

---

### /generate

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/generate**                                      |
| Q101 Framework v2.12.4 PRD & PRP Generator         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Generate PRD and PRP documents from project context

>

## Generation Tasks:

| Task | Description |
|------|-------------|
| Scan | Analyze repository for project files and context |
| Summarize | Present requirements summary for user approval |
| Generate PRD | Create Product Requirements Document |
| Generate PRP | Create Product Requirements Prompt |

>

**Input:** requirements-context.md (from /initialize)\
**Output:** `PRD.md` and `PRP.md`

>

**Usage:** `/generate`\
**Example:** `/generate` (after /initialize)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /generate command creates the foundational Product Requirements
Document (PRD) and Product Requirements Prompt (PRP) that guide the
multi-agent development process.

>

**Prerequisites:**

- Q101 Framework installed
- /initialize completed (recommended)
- Project context available

>

**Agents Involved:**

- @business_analyst - Creates PRD with user stories
- @system_architect - Creates PRP with technical specs

>

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

>

**Next Steps:**
1. /execute (build the application)

---

### /execute

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/execute**                                       |
| Q101 Framework v2.12.4 Multi-Agent Orchestration   |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Build application using 12 specialized AI agents

>

## Development Phases:

| Phase | Description |
|-------|-------------|
| Design | PRD → Architecture → UI specifications |
| Planning | Sprint planning → Task breakdown |
| Implementation | Code → Tests → Validation |
| Documentation | README → Changelog |

>

**Input:** PRD.md and PRP.md\
**Output:** Complete application with tests and docs

>

**Usage:** `/execute`\
**Example:** `/execute` (after /generate)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /execute command is the core orchestration engine of the Q101
Framework. It coordinates 12 specialized agents through a complete
Scrum/Agile development lifecycle.

>

**Prerequisites:**

- PRD.md must exist (run /generate first)
- PRP.md must exist (run /generate first)

>

**Agents Involved:**
@orchestrator, @scrum_master, @project_manager, @business_analyst,
@system_architect, @process_expert, @domain_expert, @lead_developer,
@ux_designer, @test_architect, @devops_engineer, @security_expert

>

**Output:**

- Complete application source code
- Test suites with coverage
- Documentation (README, CHANGELOG)
- Sprint completion reports

>

**Next Steps:**
1. /prepare (install dependencies)
2. /evaluate (run quality checks)

---

### /autonomous

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/autonomous**                                    |
| Q101 Framework v2.12.12 Autonomous Coding          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Execute long-running autonomous coding sessions with automatic checkpointing

>

## Modes:

| Mode | Description |
|------|-------------|
| Standard | 20-session limit (default) |
| Full | No limits (--full flag) |

>

**Input:** PRD.md, PRP.md, idea-context.md, or manual\
**Output:** Complete application with git history

>

**Usage:** `/autonomous [--full] [--resume] [--status]`\
**Example:** `/autonomous --full`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /autonomous command enables long-running autonomous coding sessions
using Anthropic's proven patterns for autonomous agents. It builds
applications feature-by-feature with automatic checkpointing and
session persistence.

>

**Two Development Paradigms:**

| Paradigm | Command | Best For |
|----------|---------|----------|
| Step-by-Step | /execute | Complex projects with oversight |
| Autonomous | /autonomous | Known-scope, rapid iteration |

>

**Prerequisites:**

- Context source: PRD.md + PRP.md, idea-context.md, or manual input
- Git installed (for checkpoint commits)

>

**Agents Involved:**

- @autonomous_initializer - Session 1: Create feature list, setup environment
- @autonomous_coder - Sessions 2+: Implement features one-by-one

>

**Key Flags:**

- `--full` - No limits (runs until all features complete)
- `--resume` - Resume paused session
- `--pause` / `--stop` - Pause current session
- `--status` - Show session progress
- `--features` - Show feature list

>

**How It Works:**

1. **Session 1 (Initializer):** Generate feature-list.json, init script, git baseline
2. **Sessions 2+ (Coding):** Implement ONE feature per session with verification
3. **Checkpointing:** Git commit after each feature
4. **Completion:** Generate docs, recommend /prepare or /evaluate

>

**Cost Warning:**

API tokens consumed continuously. Use --status to monitor.
Estimates: Small ($5-15), Medium ($15-50), Large ($50-150+)

>

**Output:**

- feature-list.json - Feature specifications
- session-state.json - Session progress
- progress.txt - Human-readable log
- Git commits - Checkpoint history

>

**Next Steps:**
1. /prepare (install dependencies after completion)
2. /evaluate (run quality checks)
3. /iterate (refine specific features)

---

### /prepare

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/prepare**                                       |
| Q101 Framework v2.12.4 Environment Preparation     |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Prepare application environment for running

>

## Tasks:

| Task | Description |
|------|-------------|
| Detect | Package managers (npm, pip, etc.) |
| Install | All project dependencies |
| Generate | `.env` from `.env.example` |
| Configure | Development environment settings |
| Verify | Installation completeness |

>

**Input:** `package.json`, `requirements.txt`, `.env.example`\
**Output:** Configured environment ready to run

>

**Usage:** `/prepare`\
**Example:** `/prepare` (after /execute)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /prepare command sets up the development environment after code
generation. It handles dependency installation and configuration.

>

**Prerequisites:**

- Application code generated (via /execute)
- Package definition files exist

>

**What It Does:**
1. Detects project type (Node.js, Python, etc.)
2. Installs dependencies (npm install, pip install, etc.)
3. Creates .env from .env.example with prompts for secrets
4. Configures database connections if needed
5. Verifies environment is ready

>

**Output:**

- All dependencies installed
- .env file configured
- Environment ready for /evaluate

>

**Next Steps:**
1. /evaluate (run tests and health checks)

---

### /evaluate

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/evaluate**                                      |
| Q101 Framework v2.12.4 Quality Evaluation          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Evaluate application quality through comprehensive testing

>

## Checks:

| Check | Description |
|-------|-------------|
| Health Check | Start app, verify endpoints |
| Test Suite | Run all unit/integration tests |
| Coverage | Measure code coverage percentage |
| Quality | Lint, type check, complexity analysis |

>

**Input:** Running application, test files\
**Output:** `EVALUATION-REPORT.md` with findings

>

**Usage:** `/evaluate`\
**Example:** `/evaluate` (after /prepare)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /evaluate command performs comprehensive quality checks on the
application. It runs tests, health checks, and generates a report.

>

**Prerequisites:**

- /prepare completed (dependencies installed)
- Application can be started

>

**What It Does:**
1. Starts the application
2. Verifies health endpoints respond
3. Runs test suites
4. Measures code coverage
5. Runs linting and type checking
6. Generates EVALUATION-REPORT.md

>

**Output:**

- EVALUATION-REPORT.md with all findings
- Pass/fail status for each check
- Specific issues to fix

>

**Next Steps:**
1. /iterate (fix any issues found)
2. /secure (if evaluation passes)

---

### /iterate

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/iterate**                                       |
| Q101 Framework v2.12.4 Iterative Improvement       |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Fix issues, add features, or refactor code

>

## Modes:

| Mode | Description |
|------|-------------|
| Fix Mode | Address issues from `EVALUATION-REPORT.md` |
| Feature Mode | Add new features to existing code |
| Refactor Mode | Improve code structure (`--refactor`) |

>

**Input:** `EVALUATION-REPORT.md`, user requests\
**Output:** Updated code, `ITERATION-LOG.md`

>

**Usage:** `/iterate [request] [--refactor]`\
**Example:** `/iterate "Add dark mode toggle"`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /iterate command handles all iterative improvements: fixing issues,
adding features, and refactoring code.

>

**Prerequisites:**

- Application code exists
- EVALUATION-REPORT.md (for fix mode)
- ANALYSIS-REPORT.md (for refactor mode, optional)

>

**Usage Modes:**

1. **Fix Mode (default)**
   `/iterate` - Fix issues from last evaluation

2. **Feature Mode**
   `/iterate "Add dark mode toggle"` - Add specific feature

3. **Refactor Mode**
   `/iterate --refactor` - Smart refactoring with ANALYSIS-REPORT.md detection
   `/iterate --refactor "Split app.py"` - Specific refactoring request

>

**Agents Involved:**

- @lead_developer - Code implementation
- @refactor_specialist - Refactoring planning (--refactor mode)
- @system_architect - Architecture changes (meso/macro scope)

>

**Output:**

- Updated source code
- ITERATION-LOG.md with changes
- REFACTORING-LOG.md (refactor mode)

>

**Next Steps:**
1. /evaluate (verify fixes)
2. /secure (if ready for security review)

---

### /secure

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/secure**                                        |
| Q101 Framework v2.12.4 Security Assessment         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Assess security and remediate vulnerabilities

>

## Tasks:

| Task | Description |
|------|-------------|
| Scan | Security vulnerabilities (OWASP Top 10) |
| Check | Authentication/authorization patterns |
| Verify | Secrets management and exposure |
| Enforce | Security best practices |
| Apply | Security fixes with approval |

>

**Input:** Application source code\
**Output:** `SECURITY-REPORT.md`, security fixes applied

>

**Usage:** `/secure`\
**Example:** `/secure` (after /evaluate passes)
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /secure command performs security assessment and applies fixes.
Required before production deployment.

>

**Prerequisites:**

- /evaluate passed (recommended)
- Application code ready for security review

>

**What It Does:**
1. Scans for common vulnerabilities (OWASP Top 10)
2. Checks authentication implementation
3. Verifies JWT/session security
4. Validates password hashing (enforces bcrypt)
5. Checks for hardcoded secrets
6. Reviews input validation
7. Applies security fixes with user approval

>

**Agent Involved:**

- @security_expert - Security assessment and fixes

>

**Output:**

- SECURITY-REPORT.md with findings
- Security vulnerabilities fixed
- Compliance checklist

>

**Next Steps:**
1. /activate (deploy to environment)

---

### /activate

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/activate**                                      |
| Q101 Framework v2.12.4 Multi-Environment Deploy    |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Deploy application to target environment

>

## Environments:

| Environment | Description |
|-------------|-------------|
| Development | Local development server |
| Staging | Pre-production testing |
| Production | Live deployment (requires /secure) |

>

## Tasks:

| Task | Description |
|------|-------------|
| Validate | Environment prerequisites |
| Configure | Deployment settings |
| Execute | Deployment scripts |
| Verify | Deployment health |

>

**Input:** Deployment configuration, environment target\
**Output:** Running application, deployment report

>

**Usage:** `/activate [environment]`\
**Example:** `/activate production`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /activate command deploys the application to the specified environment.

>

**Prerequisites:**

- /evaluate passed
- /secure passed (required for production)
- Deployment configuration ready

>

**Usage:**

- `/activate development` - Deploy to local dev server
- `/activate staging` - Deploy to staging environment
- `/activate production` - Deploy to production (requires /secure)

>

**Agent Involved:**

- @devops_engineer - Deployment configuration and execution

>

**Output:**

- Application deployed and running
- Deployment verification report
- Health check confirmation

>

**Next Steps:**
1. /analyze (post-deployment analysis)
2. Monitor application health

---

### /analyze

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/analyze**                                       |
| Q101 Framework v2.12.4 Deep Codebase Analysis      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Analyze code for quality and improvements

>

## Phases (5):

| Phase | Description |
|-------|-------------|
| Discovery | Map codebase & tech stack |
| Analysis | Review by 5 specialized agents |
| Synthesis | Prioritized findings |
| Decision | Choose what to fix |
| Apply | Implement approved improvements |

>

**Input:** Any existing codebase\
**Output:** `ANALYSIS-REPORT.md` + optional fixes

>

**Usage:** `/analyze [path] [--scope=type] [--fix]`\
**Example:** `/analyze src/ --scope=security`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /analyze command performs deep analysis of any existing codebase.
Works standalone without PRD/PRP requirements.

>

**Prerequisites:**

- Source code exists
- Q101 Framework installed

>

**Agents Involved:**

- @code_analyst - Architecture, complexity, code smells, refactoring opportunities
- @quality_auditor - Standards compliance, SOLID, best practices
- @debug_specialist - Bug patterns, security vulnerabilities, edge cases
- @doc_engineer - Documentation gaps, type coverage
- @refactor_specialist - Refactoring planning and scope determination

>

**Usage:**

- `/analyze` - Full codebase analysis
- `/analyze src/` - Analyze specific path
- `/analyze --scope=security` - Security-focused analysis
- `/analyze --scope=docs` - Documentation-focused analysis
- `/analyze --fix` - Auto-apply safe fixes

>

**Output:**

- ANALYSIS-REPORT.md with all findings
- Refactoring opportunities section
- Prioritized recommendations
- Optional: Applied fixes

>

**Next Steps:**
1. /iterate --refactor (act on refactoring opportunities)
2. /iterate (fix identified issues)

---

### /commands

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/commands**                                      |
| Q101 Framework v2.12.4 Command Reference           |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Display Q101 Framework command information

>

**Usage:** `/commands [--name]`\
**Example:** `/commands --execute`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /commands command provides quick reference for all Q101 Framework
commands. Use it to discover available commands or get detailed
information about specific commands.

>

**Usage:**

- `/commands` - Display table of all 14 commands
- `/commands --execute` - Show /execute banner and explanation
- `/commands --analyze` - Show /analyze banner and explanation

>

**Related Commands:**

→ /agents (show agent reference)
→ /workflows (show workflow reference)

---

### /agents

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/agents**                                        |
| Q101 Framework v2.12.4 Agent Reference             |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Display Q101 Framework agent information

>

**Usage:** `/agents [--name]`\
**Example:** `/agents --lead_developer`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /agents command provides quick reference for all 17 Q101 Framework
agents. Use it to discover available agents or get detailed
information about specific agents.

>

**Usage:**

- `/agents` - Display table of all 17 agents
- `/agents --lead_developer` - Show @lead_developer banner and explanation
- `/agents --code_analyst` - Show @code_analyst banner and explanation

>

**Related Commands:**

→ /commands (show command reference)
→ /workflows (show workflow reference)

---

### /workflows

**Banner:**

<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/workflows**                                     |
| Q101 Framework v2.12.4 Workflow Reference          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Display Q101 Framework workflow information

>

**Usage:** `/workflows [--name]`\
**Example:** `/workflows --development`
<!-- END EXACT OUTPUT -->

>

**Extended Explanation:**

The /workflows command provides quick reference for all Q101 Framework
workflows. Use it to understand how commands work together.

>

**Usage:**

- `/workflows` - Display table of all workflows
- `/workflows --development` - Show development workflow diagram
- `/workflows --refactoring` - Show refactoring workflow diagram

>

**Related Commands:**

→ /commands (show command reference)
→ /agents (show agent reference)

---

## Begin Execution

**Parse the command arguments and display the appropriate output:**

1. If no arguments → Display table view with all 24 commands
2. If `--{name}` provided → Display that command's banner and extended explanation
3. If invalid flag → Show error and suggest `/commands` for list

**IMPORTANT: Output EXACTLY what is shown in the ARTIFACTS section above. Do NOT add any extra content, headers, horizontal lines, or "Related:" sections. Copy the output verbatim.**
