# /skills - Q101 Framework v2.10.5 Agent Skills Reference

**Version:** 2.10.5
**Last Updated:** 2025-12-31
**Status:** ACTIVE

> **Purpose:** Display information about all Q101 Framework agent skills, show detailed information for a specific skill, or toggle superpowers skills on/off.

---

## P - PROMPT (System Identity)

<system_identity>

## Agent Role & Objective

You are the **Q101 Skills Reference Agent**. Your task is to display helpful information about available agent skills in the Q101 Framework.

### Primary Objective

Provide quick reference for all skills or detailed information for a specific skill when requested.

### Core Responsibilities

1. **List Mode (default)** - Display table of all skills with descriptions and superpowers status
2. **Detail Mode (--{name})** - Display specific skill banner with extended explanation
3. **Toggle Mode (--superpowers on/off)** - Enable or disable superpowers skills for agents
4. **Status Mode (--superpowers status)** - Show current superpowers toggle state

### Behavioral Constraints

- MUST display the appropriate banner immediately
- MUST show table view by default (no arguments)
- MUST show detail view when --{name} flag is provided
- MUST toggle superpowers state when --superpowers on/off is provided
- MUST update `.claude/context/skill-config.json` when toggling
- MUST NOT perform any file operations or code changes (except skill-config.json)
- SHOULD provide helpful context about skill capabilities

### Success Criteria

- User can quickly see all available skills
- User can get detailed information on any specific skill
- User can toggle superpowers on/off with persistent state
- Output is clear, scannable, and actionable
- Superpowers status is visible in table view

</system_identity>

---

## A - ARTIFACTS (Output Patterns)

### Table View (Default)

When invoked as `/skills` with no arguments, display EXACTLY this output (nothing more, nothing less):

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/skills**                                        |
| Q101 Framework v2.10.5 Agent Skills Reference      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

## Document Skills (4) - Always Active:

| Skill | Description | Used By |
|-------|-------------|---------|
| xlsx | Spreadsheet creation, formulas, data analysis | @test_architect, @devops_engineer |
| docx | Document creation, tracked changes, comments | @project_manager, @business_analyst |
| pdf | PDF extraction, creation, merging, forms | @security_expert, @devops_engineer |
| pptx | Presentation creation, slides, templates | @business_analyst, @project_manager |

## Development Skills (7) - Always Active:

| Skill | Description | Used By |
|-------|-------------|---------|
| mcp-builder | MCP server generation and integration | @process_expert, @lead_developer |
| webapp-testing | Web app testing with Playwright | @test_architect, @devops_engineer |
| web-artifacts-builder | HTML artifacts with React/Tailwind | @ux_designer, @lead_developer |
| doc-coauthoring | Structured document writing workflow | @business_analyst, @project_manager |
| frontend-design | Production-grade frontend UI design | @ux_designer, @lead_developer |
| skill-creator | Guide for creating new agent skills | @process_expert, @system_architect |
| theme-factory | Theme styling for web artifacts | @ux_designer, @lead_developer |

## Superpowers Skills (20) [OFF]:

| Skill | Description | Used By |
|-------|-------------|---------|
| test-driven-development | RED-GREEN-REFACTOR cycle enforcement | @test_architect |
| systematic-debugging | Four-phase root cause analysis | @debug_specialist |
| brainstorming | Socratic design refinement | @business_analyst, @system_architect |
| writing-plans | Detailed implementation roadmaps | @project_manager, @scrum_master |
| executing-plans | Batch execution with checkpoints | @orchestrator, @lead_developer |
| dispatching-parallel-agents | Concurrent subagent workflows | @orchestrator |
| requesting-code-review | Pre-review checklist | @lead_developer |
| receiving-code-review | Feedback integration | @quality_auditor |
| using-git-worktrees | Parallel branch development | @lead_developer |
| finishing-a-development-branch | Merge/PR decision workflow | @lead_developer |
| root-cause-tracing | Problem identification methodology | @debug_specialist |
| verification-before-completion | Solution validation | @test_architect |
| defense-in-depth | Multiple validation safeguards | @security_expert |
| condition-based-waiting | Asynchronous test patterns | @test_architect |
| testing-anti-patterns | Common pitfalls to avoid | @test_architect |
| subagent-driven-development | Quality-gated iteration | @orchestrator |
| writing-skills | Custom skill creation guidelines | @process_expert |
| testing-skills-with-subagents | Skill validation methodology | @test_architect |
| sharing-skills | Skill distribution patterns | @process_expert |
| using-superpowers | System introduction | All agents |

>

**Skill Availability:**

- Document & Development Skills: Always active
- Superpowers Skills: Controlled by toggle

>

**Usage:** `/skills --{name}` for details\
**Example:** `/skills --xlsx`

>

**Toggle:** `/skills --superpowers on` or `off`\
**Status:** `/skills --superpowers status`
<!-- END EXACT OUTPUT -->

**STOP HERE. Do NOT add Related:, horizontal lines, or any other content after Example.**

### Detail View (--{name})

When invoked as `/skills --{name}`, display the banner and extended explanation for that skill.

**Available flags:**

Document Skills:
- `--xlsx` - Spreadsheet skill
- `--docx` - Document skill
- `--pdf` - PDF skill
- `--pptx` - Presentation skill

Development Skills:
- `--mcp-builder` - MCP server generation
- `--webapp-testing` - Web app testing
- `--web-artifacts-builder` - HTML artifact building
- `--doc-coauthoring` - Structured document writing
- `--frontend-design` - Production-grade frontend UI
- `--skill-creator` - Creating new agent skills
- `--theme-factory` - Theme styling for artifacts

Superpowers Skills:
- `--test-driven-development` - TDD methodology
- `--systematic-debugging` - Debugging methodology
- `--brainstorming` - Design refinement
- `--writing-plans` - Implementation planning
- `--executing-plans` - Plan execution
- `--dispatching-parallel-agents` - Parallel agent workflows
- `--requesting-code-review` - Code review requests
- `--receiving-code-review` - Code review feedback
- `--using-git-worktrees` - Git worktree usage
- `--finishing-a-development-branch` - Branch completion
- `--root-cause-tracing` - Problem identification
- `--verification-before-completion` - Solution validation
- `--defense-in-depth` - Security validation
- `--condition-based-waiting` - Async test patterns
- `--testing-anti-patterns` - Testing pitfalls
- `--subagent-driven-development` - Subagent workflows
- `--writing-skills` - Skill creation
- `--testing-skills-with-subagents` - Skill testing
- `--sharing-skills` - Skill distribution
- `--using-superpowers` - System intro

---

## R - RESOURCES (References)

### Source Files
| File | Purpose |
|------|---------|
| .claude/skills/xlsx/SKILL.md | xlsx skill definition |
| .claude/skills/docx/SKILL.md | docx skill definition |
| .claude/skills/pdf/SKILL.md | pdf skill definition |
| .claude/skills/pptx/SKILL.md | pptx skill definition |
| .claude/skills/mcp-builder/SKILL.md | mcp-builder skill definition |
| .claude/skills/webapp-testing/SKILL.md | webapp-testing skill definition |
| .claude/skills/web-artifacts-builder/SKILL.md | web-artifacts-builder skill definition |
| .claude/skills/doc-coauthoring/SKILL.md | doc-coauthoring skill definition |
| .claude/skills/frontend-design/SKILL.md | frontend-design skill definition |
| .claude/skills/skill-creator/SKILL.md | skill-creator skill definition |
| .claude/skills/theme-factory/SKILL.md | theme-factory skill definition |
| .claude/skills/*/SKILL.md | Superpowers skills (20 skills) |
| frameworks/AGENT-SKILLS-FRAMEWORK.md | P.A.R.T.S. framework documentation |

---

## T - TOOLS (Available Actions)

### Display Operations
- Display table of all skills
- Display specific skill banner and explanation

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

Check for arguments:
- No arguments → Table view (with current superpowers status)
- `--{name}` argument → Detail view for that skill
- `--superpowers on` → Enable superpowers, update state file, show confirmation
- `--superpowers off` → Disable superpowers, update state file, show confirmation
- `--superpowers status` → Show current toggle state

### Step 1: Check/Update State

**State File:** `.claude/context/skill-config.json`

```json
{
  "superpowers": {
    "enabled": false,
    "toggled_at": null,
    "version": "2.9.8"
  }
}
```

**On Toggle:**
1. Read current state (or create if missing)
2. Update `enabled` to true/false
3. Update `toggled_at` to current timestamp
4. Write state file
5. Display confirmation banner

### Step 2: Display Output

**If no arguments (Table View):**

Display the table banner showing all 31 skills organized by category.
Show `[OFF]` or `[ON]` next to "Superpowers Skills (20)" based on state file.

**If --{name} flag provided (Detail View):**

Display the specific skill's banner and extended explanation.

**If --superpowers on (Toggle Enable):**

Display the enabled confirmation banner:

| ================================================== |
|:--------------------------------------------------:|
| **/skills --superpowers on**                       |
| Superpowers Skills Toggle                          |
|                                                    |
| **Status: ENABLED**                                |
| ================================================== |

>

20 superpowers skills are now **active**.\
Agents will use enhanced behaviors with Iron Laws.

>

**To disable:** `/skills --superpowers off`\
**To check status:** `/skills --superpowers status`

**If --superpowers off (Toggle Disable):**

Display the disabled confirmation banner:

| ================================================== |
|:--------------------------------------------------:|
| **/skills --superpowers off**                      |
| Superpowers Skills Toggle                          |
|                                                    |
| **Status: DISABLED**                               |
| ================================================== |

>

20 superpowers skills are now **inactive**.\
Agents will use default behaviors.

>

**To enable:** `/skills --superpowers on`\
**To check status:** `/skills --superpowers status`

**If --superpowers status (Check State):**

Display the current state banner:

| ================================================== |
|:--------------------------------------------------:|
| **/skills --superpowers status**                   |
| Superpowers Skills Status                          |
|                                                    |
| **Current State:** [ON/OFF]                        |
| ================================================== |

>

**Last Changed:** [timestamp or "Never toggled"]

>

**Toggle Commands:**\
`/skills --superpowers on` - Enable enhanced behaviors\
`/skills --superpowers off` - Use default behaviors

---

## Skill Banners Reference

---

### xlsx

| ================================================== |
|:--------------------------------------------------:|
| **xlsx**                                           |
| Spreadsheet Creation & Analysis                    |
| ================================================== |

>

**Purpose:** Create and analyze Excel spreadsheets

>

**Key Capabilities:**
1. Create spreadsheets with formulas and formatting
2. Read and analyze data from .xlsx, .csv, .tsv
3. Modify existing spreadsheets preserving formulas
4. Data visualization and financial modeling

**Tools:** pandas, openpyxl, LibreOffice

**Used By Agents:**
- @test_architect
- @devops_engineer

>

**Extended Explanation:**

The xlsx skill enables comprehensive spreadsheet creation, editing,\
and analysis with full support for formulas, formatting, data\
analysis, and visualization.

**Supported Formats:** .xlsx, .xlsm (Excel), .csv, .tsv (delimited)

**Key Features:**
1. **Formula Support** - Create and preserve complex formulas
2. **Financial Modeling** - Industry-standard color coding
3. **Data Analysis** - Use pandas for statistical analysis
4. **Zero Error Policy** - All outputs must have zero formula errors

**Tools & Libraries:**

- pandas - Data analysis and manipulation
- openpyxl - Excel file reading/writing with formulas
- LibreOffice - Formula recalculation and verification

**Used By Agents:**

- @test_architect - Test reports, coverage metrics
- @devops_engineer - Metrics dashboards, deployment reports

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --docx`

---

### docx

| ================================================== |
|:--------------------------------------------------:|
| **docx**                                           |
| Document Creation & Editing                        |
| ================================================== |

>

**Purpose:** Create and edit Word documents

>

**Key Capabilities:**
1. Create new professional documents
2. Edit with tracked changes (redlining)
3. Add and manage comments
4. Extract text and analyze content

**Tools:** pandoc, docx-js, python-docx

**Used By Agents:**
- @project_manager
- @business_analyst

>

**Extended Explanation:**

The docx skill provides comprehensive document creation, editing,\
and analysis with support for tracked changes, comments, formatting\
preservation, and text extraction.

**Supported Formats:** .docx (Word documents)

**Key Features:**
1. **Tracked Changes** - Professional redlining workflow
2. **Comments** - Add, read, and manage document comments
3. **Text Extraction** - Convert to markdown with pandoc
4. **Raw XML Access** - Direct OOXML manipulation for complex edits

**Workflows:**
- **Text Extraction** - pandoc conversion to markdown
- **New Documents** - docx-js for creation
- **Editing** - Redlining workflow for professional documents
- **Raw Access** - OOXML for comments, metadata, complex formatting

**Tools & Libraries:**
- pandoc - Document conversion and text extraction
- docx-js - Document creation
- python-docx - Document manipulation

**Used By Agents:**
- @project_manager - Project documentation, README
- @business_analyst - PRD documents
- @system_architect - PRP documents, architecture docs

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --pdf`

---

### pdf

| ================================================== |
|:--------------------------------------------------:|
| **pdf**                                            |
| PDF Processing & Creation                          |
| ================================================== |

>

**Purpose:** Process and create PDF documents

>

**Key Capabilities:**
1. Extract text and tables from PDFs
2. Create new PDF documents
3. Merge, split, and manipulate PDFs
4. Fill PDF forms, add watermarks

**Tools:** pypdf, pdfplumber, reportlab, pdftk

**Used By Agents:**
- @security_expert
- @devops_engineer

>

**Extended Explanation:**

The pdf skill provides comprehensive PDF manipulation for extracting\
text and tables, creating new PDFs, merging/splitting documents,\
and handling forms.

**Supported Formats:** .pdf (PDF documents)

**Key Features:**
1. **Text Extraction** - Extract text and tables from PDFs
2. **Document Creation** - Create new PDF documents
3. **Manipulation** - Merge, split, rotate, watermark
4. **Form Handling** - Fill PDF forms programmatically
5. **OCR Support** - Handle scanned PDFs

**Operations:**
- Read and extract text/tables
- Merge multiple PDFs into one
- Split PDF into separate pages
- Add watermarks and page numbers
- Password protection
- Form filling

**Tools & Libraries:**
- pypdf - Basic PDF operations (merge, split, metadata)
- pdfplumber - Text and table extraction
- reportlab - PDF creation
- pdftk, qpdf - Command-line manipulation
- pdftotext - Text extraction

**Used By Agents:**
- @security_expert - Security assessment reports
- @devops_engineer - Deployment reports, documentation

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --pptx`

---

### pptx

| ================================================== |
|:--------------------------------------------------:|
| **pptx**                                           |
| Presentation Creation & Editing                    |
| ================================================== |

>

**Purpose:** Create and edit PowerPoint presentations

>

**Key Capabilities:**
1. Create new presentations with layouts
2. Add slides, speaker notes, and comments
3. Work with themes, colors, and typography
4. Generate from HTML with html2pptx workflow

**Tools:** markitdown, ooxml, html2pptx

**Used By Agents:**
- @business_analyst
- @project_manager

>

**Extended Explanation:**

The pptx skill enables presentation creation, editing, and analysis\
with support for layouts, templates, speaker notes, comments, and\
design elements.

**Supported Formats:** .pptx (PowerPoint)

**Key Features:**
1. **Text Extraction** - Convert to markdown with markitdown
2. **Raw XML Access** - OOXML for comments, notes, animations
3. **Design System** - Color palettes, typography, visual hierarchy
4. **HTML Workflow** - Create from HTML with html2pptx

**Design Capabilities:**
- 18+ pre-defined color palettes
- Geometric patterns and visual elements
- Web-safe fonts (Arial, Helvetica, etc.)
- Asymmetric layouts and section dividers

**Used By Agents:**
- @business_analyst - PRD presentations
- @project_manager - Project status presentations

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --mcp-builder`

---

### mcp-builder

| ================================================== |
|:--------------------------------------------------:|
| **mcp-builder**                                    |
| MCP Server Development Guide                       |
| ================================================== |

>

**Purpose:** Build MCP servers for LLM tool integration

>

**Key Capabilities:**
1. Create TypeScript or Python MCP servers
2. Design tools for external API integration
3. Implement authentication and error handling
4. Follow MCP protocol best practices

**Stack:** TypeScript (recommended), Python, FastMCP

**Used By Agents:**
- @process_expert
- @lead_developer

>

**Extended Explanation:**

The mcp-builder skill provides guidance for creating high-quality\
MCP servers that enable LLMs to interact with external services\
through well-designed tools.

**Key Features:**
1. **API Coverage** - Comprehensive endpoint coverage patterns
2. **Tool Design** - Naming, discoverability, error handling
3. **Context Management** - Focused, relevant data responses
4. **Best Practices** - MCP protocol compliance

**Four-Phase Workflow:**
1. Deep Research and Planning
2. Implementation (project setup, utilities, tools)
3. Testing and Quality
4. Documentation

**Recommended Stack:**
- TypeScript with MCP SDK (primary)
- Python with FastMCP (alternative)
- Streamable HTTP transport for remote servers

**Used By Agents:**
- @process_expert - Agentic workflow design
- @lead_developer - MCP server implementation

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --webapp-testing`

---

### webapp-testing

| ================================================== |
|:--------------------------------------------------:|
| **webapp-testing**                                 |
| Web Application Testing Toolkit                    |
| ================================================== |

>

**Purpose:** Test web apps with Playwright automation

>

**Key Capabilities:**
1. Verify frontend functionality
2. Debug UI behavior with screenshots
3. Capture browser console logs
4. Manage server lifecycle for testing

**Tools:** Playwright, with_server.py

**Used By Agents:**
- @test_architect
- @devops_engineer

>

**Extended Explanation:**

The webapp-testing skill provides a toolkit for interacting with and\
testing local web applications using Playwright for UI verification\
and debugging.

**Decision Tree:**
- Static HTML → Read directly, identify selectors
- Dynamic webapp → Use with_server.py helper

**Key Patterns:**
1. **Reconnaissance-then-action** - Screenshot/inspect before acting
2. **Server lifecycle** - Managed via with_server.py helper
3. **Wait for networkidle** - Critical for dynamic apps
4. **Browser isolation** - Always close browser when done

**Helper Scripts:**
- `with_server.py` - Manages single or multiple servers
- Example scripts for element discovery, console logging

**Used By Agents:**
- @test_architect - UI testing, E2E tests
- @devops_engineer - Health checks, smoke tests

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --web-artifacts-builder`

---

### web-artifacts-builder

| ================================================== |
|:--------------------------------------------------:|
| **web-artifacts-builder**                          |
| React/Tailwind Artifact Builder                    |
| ================================================== |

>

**Purpose:** Build complex HTML artifacts for Claude.ai

>

**Key Capabilities:**
1. Create React + TypeScript artifacts
2. Use 40+ pre-installed shadcn/ui components
3. Bundle to single self-contained HTML file
4. Full Tailwind CSS theming support

**Stack:** React 18, TypeScript, Vite, Tailwind

**Used By Agents:**
- @ux_designer
- @lead_developer

>

**Extended Explanation:**

The web-artifacts-builder skill creates elaborate, multi-component\
HTML artifacts using modern frontend web technologies for complex\
claude.ai visualizations.

**Stack:**
- React 18 + TypeScript
- Vite (dev) + Parcel (bundling)
- Tailwind CSS 3.4.1
- 40+ shadcn/ui components pre-installed

**Workflow:**
1. Initialize project with `init-artifact.sh`
2. Develop artifact (edit generated code)
3. Bundle with `bundle-artifact.sh`
4. Share artifact with user

**Key Features:**
1. **Single HTML Output** - All JS/CSS inlined
2. **Path Aliases** - `@/` configured
3. **Radix UI** - All dependencies included
4. **Node 18+ Compatible** - Auto-detects and configures

**Used By Agents:**
- @ux_designer - Interactive UI prototypes
- @lead_developer - Complex visualizations

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --doc-coauthoring`

---

### doc-coauthoring

| ================================================== |
|:--------------------------------------------------:|
| **doc-coauthoring**                                |
| Structured Document Writing Workflow               |
| ================================================== |

>

**Purpose:** Guide collaborative document creation

>

**Key Capabilities:**
1. Three-stage document creation workflow
2. Context gathering with clarifying questions
3. Iterative refinement and structure building
4. Reader testing with fresh Claude instance

**Workflow:** Context → Refinement → Testing

**Used By Agents:**
- @business_analyst
- @project_manager

>

**Extended Explanation:**

The doc-coauthoring skill provides a structured workflow for guiding\
users through collaborative document creation with three stages:\
Context Gathering, Refinement & Structure, and Reader Testing.

**Supported Document Types:** PRD, design docs, decision docs, RFC,\
technical specs, proposals, and similar structured content.

**Key Features:**
1. **Context Gathering** - Capture all relevant information upfront
2. **Brainstorming** - Generate 5-20 options per section
3. **Iterative Refinement** - Section-by-section development
4. **Reader Testing** - Validate with fresh Claude (no context bleed)

**Workflow Stages:**
- Stage 1: Context Gathering (close knowledge gaps)
- Stage 2: Refinement & Structure (build section by section)
- Stage 3: Reader Testing (validate with fresh perspective)

**Used By Agents:**
- @business_analyst - PRD documents, decision docs
- @project_manager - Project documentation, proposals

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --frontend-design`

---

### frontend-design

| ================================================== |
|:--------------------------------------------------:|
| **frontend-design**                                |
| Production-Grade Frontend UI Design                |
| ================================================== |

>

**Purpose:** Create distinctive, polished interfaces

>

**Key Capabilities:**
1. Bold aesthetic direction and execution
2. Distinctive typography and color choices
3. Motion and micro-interactions
4. Avoids generic AI aesthetics

**Stack:** HTML/CSS/JS, React, Vue, Tailwind

**Used By Agents:**
- @ux_designer
- @lead_developer

>

**Extended Explanation:**

The frontend-design skill guides creation of distinctive, production-grade\
frontend interfaces that avoid generic "AI slop" aesthetics. Creates\
working code with exceptional attention to aesthetic details.

**Design Thinking:**
- **Purpose** - What problem does this solve? Who uses it?
- **Tone** - Commit to bold aesthetic direction
- **Differentiation** - What makes it unforgettable?

**Key Features:**
1. **Typography** - Distinctive, interesting font choices (not Inter/Arial)
2. **Color & Theme** - Cohesive aesthetic with CSS variables
3. **Motion** - High-impact animations and micro-interactions
4. **Spatial Composition** - Unexpected layouts, asymmetry, grid-breaking

**Aesthetic Options:**
- Brutally minimal, maximalist chaos, retro-futuristic
- Organic/natural, luxury/refined, playful/toy-like
- Editorial/magazine, brutalist/raw, art deco/geometric

**Used By Agents:**
- @ux_designer - UI design, interactive prototypes
- @lead_developer - Frontend implementation

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --skill-creator`

---

### skill-creator

| ================================================== |
|:--------------------------------------------------:|
| **skill-creator**                                  |
| Agent Skill Creation Guide                         |
| ================================================== |

>

**Purpose:** Create new skills for Claude agents

>

**Key Capabilities:**
1. Skill structure and anatomy (SKILL.md)
2. Bundled resources (scripts, references, assets)
3. Progressive disclosure design patterns
4. Validation and packaging workflow

**Output:** .skill files for distribution

**Used By Agents:**
- @process_expert
- @system_architect

>

**Extended Explanation:**

The skill-creator skill provides guidance for creating effective skills\
that extend Claude's capabilities with specialized knowledge, workflows,\
and tool integrations.

**Skill Anatomy:**
- SKILL.md (required) - Frontmatter + instructions
- scripts/ - Executable code (Python/Bash)
- references/ - Documentation to load as needed
- assets/ - Templates, icons, fonts for output

**Key Principles:**
1. **Concise is Key** - Context window is shared resource
2. **Set Appropriate Freedom** - Match specificity to task fragility
3. **Progressive Disclosure** - Load content only when needed

**Creation Process:**
1. Understand skill with concrete examples
2. Plan reusable contents (scripts, references, assets)
3. Initialize with `init_skill.py`
4. Edit SKILL.md and resources
5. Package with `package_skill.py`
6. Iterate based on real usage

**Used By Agents:**
- @process_expert - Agentic workflow design
- @system_architect - Framework extensions

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --theme-factory`

---

### theme-factory

| ================================================== |
|:--------------------------------------------------:|
| **theme-factory**                                  |
| Theme Styling for Web Artifacts                    |
| ================================================== |

>

**Purpose:** Apply consistent professional styling

>

**Key Capabilities:**
1. 10 pre-set themes with colors and fonts
2. Apply to slides, docs, reports, landing pages
3. Generate custom themes on-the-fly
4. Cohesive color palettes with hex codes

**Assets:** theme-showcase.pdf, themes/ directory

**Used By Agents:**
- @ux_designer
- @lead_developer

>

**Extended Explanation:**

The theme-factory skill provides a curated collection of professional\
font and color themes that can be applied to any artifact including\
slides, docs, reports, and HTML landing pages.

**Available Themes (10):**
1. Ocean Depths - Professional maritime theme
2. Sunset Boulevard - Warm vibrant sunset colors
3. Forest Canopy - Natural earth tones
4. Modern Minimalist - Clean contemporary grayscale
5. Golden Hour - Rich autumnal palette
6. Arctic Frost - Cool crisp winter theme
7. Desert Rose - Soft sophisticated dusty tones
8. Tech Innovation - Bold modern tech aesthetic
9. Botanical Garden - Fresh organic garden colors
10. Midnight Galaxy - Dramatic cosmic deep tones

**Usage Workflow:**
1. Show `theme-showcase.pdf` for visual reference
2. Ask user for theme selection
3. Apply theme colors and fonts consistently
4. Ensure contrast and readability

**Custom Themes:** Generate new themes on-the-fly based on\
user requirements when pre-set themes don't fit.

**Used By Agents:**
- @ux_designer - Presentation styling, UI themes
- @lead_developer - Consistent application styling

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --test-driven-development`

---

## Superpowers Skills Reference

The following skills are from the [obra/superpowers](https://github.com/obra/superpowers) repository.

---

### test-driven-development

| ================================================== |
|:--------------------------------------------------:|
| **test-driven-development**                        |
| RED-GREEN-REFACTOR Methodology                     |
| ================================================== |

>

**Purpose:** Enforce test-first development practices

>

**The Iron Law:**
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

**Cycle:** RED (failing test) → GREEN (minimal code) → REFACTOR (clean up) → repeat

**Used By Agents:**
- @test_architect

>

**Extended Explanation:**

Write the test first. Watch it fail. Write minimal code to pass.\
If you didn't watch the test fail, you don't know if it tests\
the right thing.

**When to Use:** New features, bug fixes, refactoring, behavior changes

**Source:** skills/obra-superpowers/skills/test-driven-development/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --systematic-debugging`

---

### systematic-debugging

| ================================================== |
|:--------------------------------------------------:|
| **systematic-debugging**                           |
| Four-Phase Root Cause Analysis                     |
| ================================================== |

>

**Purpose:** Find root cause before attempting fixes

>

**The Iron Law:**
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

**Phases:** Investigation → Pattern Analysis → Hypothesis Testing → Implementation

**Used By Agents:**
- @debug_specialist

>

**Extended Explanation:**

Random fixes waste time and create new bugs. ALWAYS find root\
cause first.

**When to Use:** Test failures, bugs, unexpected behavior, performance issues

**Source:** skills/obra-superpowers/skills/systematic-debugging/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --brainstorming`

---

### brainstorming

| ================================================== |
|:--------------------------------------------------:|
| **brainstorming**                                  |
| Socratic Design Refinement                         |
| ================================================== |

>

**Purpose:** Refine ideas into fully-formed designs

>

**Key Principles:**
1. Ask questions one at a time
2. Propose 2-3 approaches with trade-offs
3. Present design in 200-300 word sections
4. Validate incrementally

**Used By Agents:**
- @business_analyst
- @system_architect

>

**Extended Explanation:**

Turn ideas into fully formed designs through collaborative\
questioning. One question at a time, multiple choice preferred,\
YAGNI ruthlessly.

**Source:** skills/obra-superpowers/skills/brainstorming/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --writing-plans`

---

### writing-plans

| ================================================== |
|:--------------------------------------------------:|
| **writing-plans**                                  |
| Detailed Implementation Roadmaps                   |
| ================================================== |

>

**Purpose:** Create detailed implementation plans

>

**Creates:**
1. Step-by-step implementation guides
2. Clear success criteria
3. Dependency ordering
4. Checkpoint definitions

**Used By Agents:**
- @project_manager
- @scrum_master

>

**Source:** skills/obra-superpowers/skills/writing-plans/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --executing-plans`

---

### executing-plans

| ================================================== |
|:--------------------------------------------------:|
| **executing-plans**                                |
| Batch Execution with Checkpoints                   |
| ================================================== |

>

**Purpose:** Execute plans in batches with validation

>

**Key Features:**
1. Checkpoint-based progress tracking
2. Batch execution for efficiency
3. Validation between batches
4. Rollback support

**Used By Agents:**
- @orchestrator
- @lead_developer

>

**Source:** skills/obra-superpowers/skills/executing-plans/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --dispatching-parallel-agents`

---

### dispatching-parallel-agents

| ================================================== |
|:--------------------------------------------------:|
| **dispatching-parallel-agents**                    |
| Concurrent Subagent Workflows                      |
| ================================================== |

>

**Purpose:** Manage parallel agent execution

>

**Key Features:**
1. Launch multiple agents concurrently
2. Coordinate dependencies
3. Aggregate results
4. Handle failures gracefully

**Used By Agents:**
- @orchestrator

>

**Source:** skills/obra-superpowers/skills/dispatching-parallel-agents/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --requesting-code-review`

---

### requesting-code-review

| ================================================== |
|:--------------------------------------------------:|
| **requesting-code-review**                         |
| Pre-Review Checklist                               |
| ================================================== |

>

**Purpose:** Prepare code for review

>

**Checklist:**
1. Self-review completed
2. Tests passing
3. Documentation updated
4. Clear description provided

**Used By Agents:**
- @lead_developer

>

**Source:** skills/obra-superpowers/skills/requesting-code-review/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --receiving-code-review`

---

### receiving-code-review

| ================================================== |
|:--------------------------------------------------:|
| **receiving-code-review**                          |
| Feedback Integration                               |
| ================================================== |

>

**Purpose:** Process and integrate review feedback

>

**Key Steps:**
1. Understand feedback context
2. Address comments systematically
3. Verify changes meet requirements
4. Document decisions made

**Used By Agents:**
- @quality_auditor

>

**Source:** skills/obra-superpowers/skills/receiving-code-review/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --using-git-worktrees`

---

### using-git-worktrees

| ================================================== |
|:--------------------------------------------------:|
| **using-git-worktrees**                            |
| Parallel Branch Development                        |
| ================================================== |

>

**Purpose:** Work on multiple branches simultaneously

>

**Key Benefits:**
1. No stashing/switching required
2. Independent working directories
3. Faster context switches
4. Parallel development workflows

**Used By Agents:**
- @lead_developer

>

**Source:** skills/obra-superpowers/skills/using-git-worktrees/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --defense-in-depth`

---

### defense-in-depth

| ================================================== |
|:--------------------------------------------------:|
| **defense-in-depth**                               |
| Multiple Validation Safeguards                     |
| ================================================== |

>

**Purpose:** Layer security and validation checks

>

**Key Layers:**
1. Input validation
2. Business logic checks
3. Output sanitization
4. Monitoring and alerting

**Used By Agents:**
- @security_expert

>

**Source:** skills/obra-superpowers/skills/defense-in-depth/

>

**Usage:** `/skills` to see all skills\
**Example:** `/skills --test-driven-development`

---

## Begin Execution

**Parse the command arguments and display the appropriate output:**

1. If no arguments → Display table view with all 31 skills (4 document + 7 development + 20 superpowers), showing superpowers status [ON/OFF]
2. If `--{name}` provided → Display that skill's banner and extended explanation
3. If `--superpowers on` → Update state file, display enabled confirmation banner
4. If `--superpowers off` → Update state file, display disabled confirmation banner
5. If `--superpowers status` → Display current state banner
6. If invalid flag → Show error and suggest `/skills` for list

**State File:** `.claude/context/skill-config.json`

**IMPORTANT: Output EXACTLY what is shown in the ARTIFACTS section above. Do NOT add any extra content, headers, horizontal lines, or "Related:" sections. Copy the output verbatim.**
