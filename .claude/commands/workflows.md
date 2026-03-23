# /workflows - Q101 Framework v2.12.20 Workflow Reference

**Version:** 2.12.20
**Last Updated:** 2026-01-15
**Status:** ACTIVE

> **Purpose:** Display information about Q101 Framework workflows, workflow patterns, and how commands work together.

---

## ⚠️ CRITICAL EXECUTION RULE - BANNER FIRST

**When this command is invoked, your VERY FIRST OUTPUT must be the banner text.**

**BEFORE outputting the banner, you MUST NOT:**
- ❌ Read VERSION.json
- ❌ Read any file whatsoever
- ❌ Call TodoWrite
- ❌ Call any tool

**The ONLY acceptable first action is:** Output the appropriate banner text based on arguments.

**THEN after the banner is displayed:** You may call TodoWrite to track progress (optional).

---

## P - PROMPT (System Identity)

<system_identity>

## Agent Role & Objective

You are the **Q101 Workflow Reference Agent**. Your task is to display helpful information about available workflows and workflow patterns in the Q101 Framework.

### Primary Objective

Provide quick reference for all workflows, or detailed information for a specific workflow when requested, including workflow patterns that show different execution paths.

### Core Responsibilities

1. **List Mode (default)** - Display table of all workflows with descriptions
2. **Detail Mode (--{name})** - Display specific workflow diagram with extended explanation
3. **Patterns Mode (--{name} --patterns)** - Display workflow pattern table for a specific workflow

### Behavioral Constraints

- **MUST output banner text FIRST before ANY tool calls** (no Read, Write, TodoWrite before banner)
- MUST display the appropriate banner immediately
- MUST show table view by default (no arguments)
- MUST show detail view when --{name} flag is provided
- MUST show patterns table when --{name} --patterns flags are provided
- MUST NOT perform any file operations or code changes
- SHOULD provide helpful context about when to use each workflow and pattern

### Success Criteria

- User can quickly see all available workflows
- User can get detailed information on any specific workflow
- User can view workflow patterns for execution variations
- Output is clear, scannable, and actionable

</system_identity>

---

## A - ARTIFACTS (Output Patterns)

### Table View (Default)

When invoked as `/workflows` with no arguments:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/workflows**                                     |
| Q101 Framework v2.12.20 Workflow Reference          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

## Primary Workflows (10):

| Workflow | Command | Patterns | Description |
|----------|---------|----------|-------------|
| --research | /research | 4 | Evidence-based research with citations and confidence scoring |
| --ideation | /ideate | 8 | Creative brainstorming with pre/post analysis options |
| --development | /initialize → /activate | 4 | Full 8-stage application build lifecycle |
| --autonomous | /autonomous | 3 | Long-running autonomous coding with checkpointing |
| --analysis | /analyze | 4 | Deep codebase analysis with 5 specialized agents |
| --refactoring | /iterate --refactor | 2 | Safe code improvement with behavior preservation |
| --git | /utilities --git | 3 | Git hygiene validation and branch management |
| --discovery | /discover | 3 | Browse Anthropic examples to kickstart projects |
| --prototyping | /hackathon | 3 | Rapid MVP building with hackathon methodologies |
| --knowledge | /knowledge | 4 | Content generation with continuous learning (S.C.O.P.E.) |

>

## Cross-Workflow Patterns (14):

| Pattern | Flow | Best For |
|---------|------|----------|
| --idea-to-dev | /ideate → /initialize → /execute | New project from scratch |
| --idea-to-autonomous | /ideate → /generate → /autonomous | Autonomous build from idea |
| --research-to-idea | /research → /ideate --topic={id} | Evidence-informed brainstorming |
| --idea-to-research | /ideate → /research --idea={id} | Validate ideas with evidence |
| --dev-to-analysis | /execute → /analyze → /iterate | Post-build optimization |
| --autonomous-to-evaluate | /autonomous → /prepare → /evaluate | Post-autonomous QA |
| --security-audit | /analyze → /secure | Security-focused remediation |
| --quality-gate | /evaluate → /analyze → /iterate | Quality assurance cycle |
| --discovery-to-dev | /discover → /initialize → /execute | Start project from discovered example |
| --discovery-to-hackathon | /discover → /hackathon | Rapid build using discovered patterns |
| --idea-to-hackathon | /ideate → /hackathon | Quick MVP from brainstormed idea |
| --research-to-knowledge | /research → /knowledge --teach | Evidence to teaching material |
| --analysis-to-knowledge | /analyze → /knowledge --publish | Findings to whitepaper |
| --idea-to-knowledge | /ideate → /knowledge --share | Approach to tutorial |

>

**Usage:** `/workflows --{name}` for workflow diagram\
**Patterns:** `/workflows --{name} --patterns` for pattern table\
**Example:** `/workflows --research --patterns`
<!-- END EXACT OUTPUT -->

**STOP HERE. Do NOT add Related:, horizontal lines, or any other content after Example.**

### All Patterns View (--patterns)

When invoked as `/workflows --patterns` (without workflow name), display comprehensive pattern reference:

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **All Workflow Patterns**                          |
| Q101 Framework v2.12.20                             |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

## Research Patterns (4):

| Pattern | Flag | Description |
|---------|------|-------------|
| Standard | (default) | Balanced 5-8 query general research |
| Brief | `--brief` | Quick 3-5 query executive summary |
| Deep | `--deep` | Comprehensive 10-15 query analysis |
| Scan | `--scan` | Market/competitor signal detection |

>

## Ideation Patterns (8):

| Pattern | Flag | Description |
|---------|------|-------------|
| Quick Start | (default) | Fast ideation without analysts |
| User-First | `--user-research` | @user_analyst pre-ideation analysis |
| Competitive | `--competitive` | @competitive_analyst market analysis |
| Stakeholder | `--stakeholder` | @stakeholder_analyst power mapping |
| Trend | `--trend-analysis` | @trend_analyst opportunity scouting |
| Feasibility | `--feasibility` | @feasibility_analyst post-ideation validation |
| Business | `--business-model` | @commercial_analyst monetization strategy |
| Comprehensive | `--full-analysis` | All 6 analysts full pipeline |

>

## Development Patterns (4):

| Pattern | Flag | Description |
|---------|------|-------------|
| Standard | (default) | Full 8-stage lifecycle for production apps |
| Demo | `--demo` | Quick POC with only /initialize, /generate, /execute |
| Fast-Track | `--fast-track` | Skip /secure and /activate for MVPs |
| Security-First | `--security-first` | Run /secure early for compliance |

>

## Analysis Patterns (4):

| Pattern | Flag | Description |
|---------|------|-------------|
| Full | (default) | All 5 agents comprehensive analysis |
| Security | `--scope=security` | @debug_specialist vulnerability focus |
| Docs | `--scope=docs` | @doc_engineer documentation gaps |
| Quality | `--scope=quality` | @quality_auditor standards compliance |

>

## Refactoring Patterns (2):

| Pattern | Flag | Description |
|---------|------|-------------|
| Standard | (default) | Full refactoring with architecture changes |
| Behavior-Preserving | `--preserve` | Minimal changes, strict preservation |

>

## Autonomous Patterns (3):

| Pattern | Flag | Description |
|---------|------|-------------|
| Standard | (default) | 20-session limit with automatic checkpointing |
| Full | `--full` | Unlimited sessions until all features complete |
| Verify-Only | `--verify-only` | Run verification without implementation |

>

## Git Patterns (3):

| Pattern | Flag | Description |
|---------|------|-------------|
| Quick Check | (default) | Validate staged files before commit |
| Full Scan | `--full` | Comprehensive repository audit |
| Fix Mode | `--fix` | Auto-repair .gitkeep and .gitignore gaps |

>

## Discovery Patterns (3):

| Pattern | Flag | Description |
|---------|------|-------------|
| Browse | (default) | List available examples in table format |
| Detail | `--show=<name>` | View specific example with README and structure |
| Clone | `--clone=<name>` | Copy example to current project folder |

>

## Prototyping Patterns (3):

| Pattern | Flag | Description |
|---------|------|-------------|
| Lightning | `--quality=lightning` | 4-8hr sprint, minimal deliverables |
| Standard | `--quality=standard` | 24-48hr hackathon, balanced deliverables |
| Polish | `--quality=polish` | 3-7 day extended, full deliverables |

>

## Knowledge Patterns (4):

| Pattern | Flag | Description |
|---------|------|-------------|
| Teach | `--teach` | Educational content (training, tutorials, reference) |
| Publish | `--publish` | Publication content (book, whitepaper, catalog) |
| Share | `--share` | Community content (social, quotes, stories) |
| Comprehensive | `--comprehensive` | Full catalog across all 13 @agentQ modes |

>

## Cross-Workflow Patterns (14):

| Pattern | Flag | Flow | Best For |
|---------|------|------|----------|
| Idea-to-Dev | `--idea-to-dev` | /ideate → /initialize → /execute | New project from scratch |
| Idea-to-Autonomous | `--idea-to-autonomous` | /ideate → /generate → /autonomous | Autonomous build from idea |
| Research-to-Idea | `--research-to-idea` | /research → /ideate --topic={id} | Evidence-informed brainstorming |
| Idea-to-Research | `--idea-to-research` | /ideate → /research --idea={id} | Validate ideas with evidence |
| Dev-to-Analysis | `--dev-to-analysis` | /execute → /analyze → /iterate | Post-build optimization |
| Autonomous-to-Evaluate | `--autonomous-to-evaluate` | /autonomous → /prepare → /evaluate | Post-autonomous QA |
| Security-Audit | `--security-audit` | /analyze → /secure | Security-focused remediation |
| Quality-Gate | `--quality-gate` | /evaluate → /analyze → /iterate | Quality assurance cycle |
| Discovery-to-Dev | `--discovery-to-dev` | /discover → /initialize → /execute | Start project from discovered example |
| Discovery-to-Hackathon | `--discovery-to-hackathon` | /discover → /hackathon | Rapid build using discovered patterns |
| Idea-to-Hackathon | `--idea-to-hackathon` | /ideate → /hackathon | Quick MVP from brainstormed idea |
| Research-to-Knowledge | `--research-to-knowledge` | /research → /knowledge --teach | Evidence to teaching material |
| Analysis-to-Knowledge | `--analysis-to-knowledge` | /analyze → /knowledge --publish | Findings to whitepaper |
| Idea-to-Knowledge | `--idea-to-knowledge` | /ideate → /knowledge --share | Approach to tutorial |

>

**Total:** 48 patterns (34 primary + 14 cross-workflow)

>

**Details:** `/workflows --{workflow} --patterns` for extended explanations\
**Example:** `/workflows --research --patterns`
<!-- END EXACT OUTPUT -->

### Detail View (--{name})

When invoked as `/workflows --{name}`, display the workflow diagram and extended explanation.

**Available flags:**

Primary Workflows:
- `--research` - Evidence-based research workflow
- `--ideation` - Creative brainstorming workflow
- `--development` - Full application build lifecycle
- `--autonomous` - Long-running autonomous coding
- `--analysis` - Codebase analysis workflow
- `--refactoring` - Code refactoring workflow
- `--git` - Git hygiene and branch management
- `--discovery` - Browse Anthropic examples to kickstart projects
- `--prototyping` - Rapid MVP building with hackathon methodologies
- `--knowledge` - Content generation with continuous learning (NEW in v2.12.20)

Cross-Workflow Patterns:
- `--idea-to-dev` - Complete ideation to app pipeline
- `--idea-to-autonomous` - Ideation to autonomous build
- `--research-to-idea` - Research-First Ideation workflow
- `--idea-to-research` - Idea-First Research workflow
- `--dev-to-analysis` - Post-development analysis
- `--autonomous-to-evaluate` - Post-autonomous QA
- `--security-audit` - Security-focused audit
- `--quality-gate` - Quality assurance cycle
- `--discovery-to-dev` - Start project from discovered example (NEW in v2.12.16)
- `--discovery-to-hackathon` - Rapid build using discovered patterns (NEW in v2.12.16)
- `--idea-to-hackathon` - Quick MVP from brainstormed idea (NEW in v2.12.16)

### Patterns View (--{name} --patterns)

When invoked as `/workflows --{name} --patterns`, display the workflow's pattern table.

---

## R - RESOURCES (References)

### Related Commands
| Command | Purpose |
|---------|---------|
| /commands | Show all available commands |
| /agents | Show all available agents |
| /skills | Show all agent skills |

### Related Documentation
| Document | Purpose |
|----------|---------|
| FRAMEWORK-WORKFLOWS-GUIDE.md | Comprehensive workflow documentation |
| IDEATION-PIPELINE-GUIDE.md | Ideation workflow pipelines |
| COMMAND-GUIDE.md | Complete command reference |

---

## T - TOOLS (Available Actions)

### Display Operations
- Display table of all workflows
- Display specific workflow diagram and explanation
- Display workflow pattern tables

---

## ⛔ EXECUTION CHECKPOINT - READ BEFORE PROCEEDING ⛔

**STOP. Before you output ANYTHING, verify:**

- [ ] Have I output the banner text yet? **If NO → Go to STEP 1 NOW**
- [ ] Did I write "I'll execute..." or similar? **If YES → YOU VIOLATED THE RULE**
- [ ] Did I call any tools (Read, TodoWrite, etc.)? **If YES → YOU VIOLATED THE RULE**

**ONLY after displaying the banner may you proceed to read files and call tools.**

---

## Execution Steps

**⚠️ CRITICAL - READ BEFORE EXECUTING:**

The banner MUST be displayed as the ABSOLUTE FIRST OUTPUT before ANY tool calls. This means:
- **NO Read tool calls** before the banner
- **NO Write tool calls** before the banner
- **NO TodoWrite calls** before the banner
- **NO Glob/Grep calls** before the banner

The correct execution pattern is:
1. Output the banner text (pure markdown, no tools)
2. THEN call TodoWrite to track progress (optional)

### Step 0: Parse Arguments

Check for workflow name flag and patterns flag:
- No arguments → Table view
- `--patterns` alone → All Patterns quick reference view
- `--{name}` argument → Detail view for that workflow
- `--{name} --patterns` arguments → Patterns table for that workflow (with extended explanations)

### Step 1: Display Output

**If no arguments (Table View):**

Display the table banner showing all workflows with pattern counts.

**If `--patterns` alone (All Patterns View):**

Display comprehensive reference of all 27 patterns with names, flags, and one-line descriptions.

**If --{name} flag provided (Detail View):**

Display the specific workflow's diagram and extended explanation.

**If --{name} --patterns flags provided (Patterns View):**

Display the workflow's pattern table with extended explanations (Purpose, When to Use, What It Does, Best For).

---

**MANDATORY EXECUTION ORDER - STRICT COMPLIANCE REQUIRED:**

| Order | Action | Tools Allowed |
|-------|--------|---------------|
| 1 | **Output banner text** | NONE - Pure text only |
| 2 | TodoWrite (track progress) | TodoWrite (optional) |

**COMMON VIOLATION TO AVOID:**

The most common mistake is calling `TodoWrite` BEFORE displaying the banner. This causes "Update Todos" to appear in the user's output before they see the banner. THIS IS WRONG.

**CORRECT PATTERN:**
```
[User runs /workflows --development]
[Assistant outputs Development Workflow banner - NO tool calls visible]
[Then calls TodoWrite - optional]
```

**INCORRECT PATTERN (VIOLATION):**
```
[User runs /workflows --development]
• TodoWrite                        ← WRONG! Tool call before banner
[Then banner displays]             ← TOO LATE
```

---

## Workflow Diagrams Reference

### Primary Workflows

---

#### --research

**Banner:**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Research Workflow**                              |
| Q101 Framework v2.12.16 Evidence-Based Research     |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Gather evidence with citations and confidence scoring

>

## Workflow Diagram:

```
┌──────────────┐
│  /research   │ → Start evidence-based research
│              │   (invokes @research_analyst)
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 1: SCOPE                       │
│  └── Define research questions       │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 2: SEARCH                      │
│  └── Execute WebSearch queries       │
│      Track sources with SRC-### IDs  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 3: VALIDATE                    │
│  └── Score source credibility        │
│      Cross-reference key claims      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 4: SYNTHESIZE                  │
│  └── Compile findings                │
│      Calculate confidence scores     │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ research-context.md                  │
│  ├── Executive summary               │
│  ├── Key findings with citations     │
│  └── Confidence scores (0.0-1.0)     │
└──────────────────────────────────────┘
```

>

**Patterns:** 4 (use `--patterns` to see)

**Agent:** `@research_analyst`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Research Workflow provides evidence-based research with proper citations, source tracking, and confidence scoring.

**When to Use:**

- Validating ideas with market research
- Exploring new technologies or markets
- Gathering evidence before development decisions
- Competitive landscape analysis

**Commands Involved:**
1. `/research "topic"` - Start research session with @research_analyst
2. `/research --brief "topic"` - Quick 3-5 query summary
3. `/research --deep "topic"` - Comprehensive 10-15 query analysis
4. `/research --scan "topic"` - Market/competitor signal detection

**Agent Involved:**

- @research_analyst - Conducts research with citations and confidence scoring

**Features:**

- Source credibility scoring algorithm
- SRC-### citation tracking
- Cross-reference validation
- Confidence scores (0.0-1.0)
- Four research patterns (Standard, Brief, Deep, Scan)

**Output:**

- .claude/context/research-context.md - Main findings document
- .claude/context/research/{id}-sources.json - Source metadata

**Cross-Command Integration:**

- `/research --idea={id}` - Extract context from ideation
- `/research --topic={id}` - Load previous research
- `/research --initialize` - Create project from research

---

**Research Workflow Patterns Table (--research --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Research Workflow Patterns**                     |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Queries | Duration | Best For |
|---------|------|---------|----------|----------|
| Standard | (default) | 5-8 | 10-15 min | General |
| Brief | `--brief` | 3-5 | 5-10 min | Quick summary |
| Deep | `--deep` | 10-15 | 20-30 min | Comprehensive |
| Scan | `--scan` | 8-12 | 15-20 min | Market signals |

>

## Extended Explanations:

### Standard Pattern (Default)

**Purpose:** Balanced research for general decision support and pre-development validation.

>

**When to Use:**
- Starting research on a new topic without time constraints
- Need comprehensive overview without deep analysis
- Supporting ideation or initialization phases
- General market or technology understanding

**What It Does:**
1. Executes 5-8 targeted search queries covering breadth of topic
2. Covers: overview, best practices, market size, trends, competitors, challenges, outlook
3. Validates sources with credibility scoring (0.0-1.0)
4. Synthesizes findings into actionable research-context.md

**Best For:** Most research needs, pre-development validation, general understanding

---

### Brief Pattern (`--brief`)

**Purpose:** Quick executive-level synthesis for rapid validation and decision checkpoints.

>

**When to Use:**
- Time pressure (less than 10 minutes available)
- Need key insights only, not comprehensive analysis
- Quick validation of an idea before deeper investment
- Go/no-go decision checkpoint

**What It Does:**
1. Executes 3-5 focused queries on key insights and recommendations
2. Prioritizes high-credibility sources only (>0.8 score)
3. Generates concise 3-5 key insights with citations
4. Provides 2-3 actionable recommendations

**Best For:** Quick validation, executive summaries, go/no-go decisions, time-constrained research

---

### Deep Pattern (`--deep`)

**Purpose:** Comprehensive exploratory research for critical decisions requiring thorough evidence.

>

**When to Use:**
- Critical decision requiring thorough evidence base
- Entering unfamiliar market or technology space
- Need case studies, research papers, and implementation examples
- Building business case or investment proposal

**What It Does:**
1. Executes 10-15 queries across all research dimensions
2. Includes: case studies, research papers, industry analysis, expert opinions
3. Deep-dives important sources using WebFetch for detailed content
4. Cross-references critical claims with 2+ sources
5. Provides ROI analysis and comparison reviews

**Best For:** Major investments, market entry, technology selection, comprehensive planning, investor pitches

---

### Scan Pattern (`--scan`)

**Purpose:** Market and competitive intelligence gathering for strategic awareness.

>

**When to Use:**
- Monitoring competitive landscape
- Identifying market trends and emerging signals
- Discovering new players and technologies
- Strategic planning and opportunity assessment

**What It Does:**
1. Executes 8-12 market-focused queries
2. Identifies: trends, competitors, market share, investments, disruptions
3. Categorizes signals by strength (Strong/Moderate/Weak)
4. Maps competitor positions and recent moves
5. Fact-checks industry claims with confidence scores

**Best For:** Competitive analysis, market monitoring, strategic planning, trend identification, opportunity discovery

>

**Cross-Command Integration:**

- `/research --idea={id}` - Extract context from ideation
- `/research --topic={id}` - Load previous research
- `/research --initialize` - Create project from research
<!-- END EXACT OUTPUT -->

---

#### --ideation

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Ideation Workflow**                              |
| Q101 Framework v2.12.16 Creative Brainstorming      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Brainstorm project ideas before development

>

## Workflow Diagram:

```
┌──────────────┐
│   /ideate    │ → Start guided brainstorming session
│              │   (auto-enables brainstorming superpower)
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ [Optional] Pre-Ideation Analysis     │
│  ├── @user_analyst (personas)        │
│  ├── @competitive_analyst (market)   │
│  ├── @stakeholder_analyst (power)    │
│  └── @trend_analyst (timing)         │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 1: UNDERSTAND                  │
│  └── Ask questions ONE at a time     │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 2: EXPLORE                     │
│  └── Generate 2-3 approaches         │
│      with pros/cons                  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Phase 3: PRESENT                     │
│  └── Create idea-context.md          │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ [Optional] Post-Ideation Validation  │
│  ├── @feasibility_analyst (viability)│
│  └── @commercial_analyst (business)  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ /initialize  │ → Continue to development (optional)
└──────────────┘
```

>

**Patterns:** 8 (use `--patterns` to see)

**Agent:** `@ideation_facilitator` + 6 optional analysts
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Ideation Workflow guides structured brainstorming for project ideas using Socratic questioning to expand and refine concepts. In v2.11.0+, optional pre-ideation analysis and post-ideation validation agents were added.

**When to Use:**
- Starting a new project from scratch
- Exploring ideas before committing to development
- Presenting concepts to stakeholders
- Building a portfolio of project ideas

**Commands Involved:**
1. `/ideate "topic"` - Run guided brainstorming session
2. `/ideate --expand` - Refine existing ideas further
3. `/ideate --export=pptx` - Export for presentations
4. `/ideate --user-research "topic"` - Include user analysis
5. `/ideate --competitive-analysis "topic"` - Include market analysis
6. `/ideate --full-analysis "topic"` - Run all 6 analysts

**Agents Involved:**
- @ideation_facilitator - Leads the session using brainstorming methodology
- @user_analyst - User personas and empathy mapping (optional)
- @competitive_analyst - Market landscape analysis (optional)
- @stakeholder_analyst - Power/interest mapping (optional)
- @trend_analyst - Opportunity and timing (optional)
- @feasibility_analyst - Technical viability (optional)
- @commercial_analyst - Business model (optional)

**Features:**
- Auto-enables brainstorming superpower for session
- Asks ONE question at a time (Socratic method)
- Generates 2-3 distinct approaches with trade-offs
- Session archiving for resume capability
- Export to DOCX/PDF/PPTX
- Optional pre-ideation analysis (4 agents)
- Optional post-ideation validation (2 agents)

**Output:**
- .claude/context/idea-context.md - Main deliverable
- .claude/context/idea-sessions/{id}.md - Session archive
- .claude/context/analysis/*.md - Analyst outputs (if enabled)
- Optional exports for stakeholder presentations

---

**Ideation Workflow Patterns Table (--ideation --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Ideation Workflow Patterns**                     |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Analysts | Duration | Best For |
|---------|------|----------|----------|----------|
| Quick Start | (default) | None | 15-30 min | Fast |
| User-First | `--user-research` | @user | 35-50 min | B2C |
| Competitive | `--competitive` | @competitive | 35-50 min | Market |
| Stakeholder | `--stakeholder` | @stakeholder | 30-45 min | Enterprise |
| Trend | `--trend-analysis` | @trend | 35-50 min | R&D |
| Feasibility | `--feasibility` | @feasibility | 30-45 min | Technical |
| Business | `--business-model` | @commercial | 35-50 min | Monetization |
| Comprehensive | `--full-analysis` | All 6 | 90-120 min | Full |

>

## Extended Explanations:

### Quick Start Pattern (Default)

**Purpose:** Rapid idea exploration without analysis overhead for fast iteration.

>

**When to Use:**
- Time-constrained brainstorming sessions
- Early-stage concept exploration
- Personal projects or experiments
- Domain knowledge already strong

**What It Does:**
1. Engages @ideation_facilitator directly (no pre-analysis)
2. Uses 3-phase methodology: Understand → Explore → Present
3. Asks questions ONE at a time (Socratic method)
4. Generates 2-3 approaches with detailed pros/cons
5. Creates idea-context.md for downstream handoff

**Best For:** Fast ideation, personal projects, prototypes, quick validation

---

### User-First Pattern (`--user-research`)

**Purpose:** Ground ideation in validated user needs through persona development.

>

**When to Use:**
- Building B2C products where UX is differentiator
- Need to validate target audience assumptions
- Building empathy for end users before designing
- User-centered design methodology

**What It Does:**
1. @user_analyst runs BEFORE @ideation_facilitator
2. Creates detailed user personas with goals and frustrations
3. Develops empathy maps (Think, Feel, Say, Do)
4. Maps user journeys and pain points
5. Hands off user context to inform ideation questions

**Best For:** B2C products, UX-critical applications, user-centered design, consumer apps

---

### Competitive Pattern (`--competitive`)

**Purpose:** Ideate with full awareness of market landscape and differentiation opportunities.

>

**When to Use:**
- Entering established market with existing competitors
- Need clear differentiation strategy
- Want to identify gaps competitors haven't filled
- Building competitive positioning from start

**What It Does:**
1. @competitive_analyst runs BEFORE @ideation_facilitator
2. Identifies direct and indirect competitors
3. Creates feature comparison matrices
4. Identifies market gaps and white spaces
5. Informs ideation with positioning opportunities

**Best For:** Market entry, competitive differentiation, feature planning, SaaS products

---

### Stakeholder Pattern (`--stakeholder`)

**Purpose:** Ensure alignment with key stakeholders before committing to direction.

>

**When to Use:**
- Enterprise or B2B products with multiple buyers
- Multiple decision makers or influencers involved
- Need organizational buy-in before proceeding
- Complex organizational dynamics to navigate

**What It Does:**
1. @stakeholder_analyst runs BEFORE @ideation_facilitator
2. Maps all stakeholder groups (users, buyers, influencers)
3. Creates power/interest grids for prioritization
4. Identifies conflicts and synergies between groups
5. Develops engagement strategies for each stakeholder

**Best For:** Enterprise products, B2B solutions, multi-party alignment, internal tools

---

### Trend Pattern (`--trend-analysis`)

**Purpose:** Capitalize on emerging opportunities by aligning with market momentum.

>

**When to Use:**
- R&D or innovation-focused projects
- Want to ride technology or market waves
- Need timing recommendations for launch
- Building future-forward products

**What It Does:**
1. @trend_analyst runs BEFORE @ideation_facilitator
2. Researches current market and technology trends
3. Assesses trend maturity (emerging, growing, mature, declining)
4. Connects trends to specific opportunities
5. Provides timing recommendations for market entry

**Best For:** Innovation projects, R&D, technology-forward products, startup ideas

---

### Feasibility Pattern (`--feasibility`)

**Purpose:** Validate technical viability early before over-investing in an approach.

>

**When to Use:**
- Complex technical requirements anticipated
- Resource constraints are significant factor
- High-risk technology choices being considered
- Need go/no-go recommendation with evidence

**What It Does:**
1. @ideation_facilitator runs FIRST (creates approaches)
2. @feasibility_analyst evaluates AFTER approaches defined
3. Assesses technical complexity of each approach
4. Estimates resource requirements (time, skills, cost)
5. Provides risk-scored recommendations per approach

**Best For:** Technical validation, resource-constrained projects, risk assessment, MVP scoping

---

### Business Pattern (`--business-model`)

**Purpose:** Validate commercial viability and develop monetization strategy.

>

**When to Use:**
- Building revenue-generating products
- Need monetization strategy before development
- Want pricing recommendations with rationale
- Preparing for investor or stakeholder presentations

**What It Does:**
1. @ideation_facilitator runs FIRST (creates approaches)
2. @commercial_analyst evaluates AFTER approaches defined
3. Develops value proposition canvas for each approach
4. Explores revenue model options (SaaS, marketplace, etc.)
5. Projects revenue potential with assumptions

**Best For:** Startup ideas, monetization planning, investor pitches, business case development

---

### Comprehensive Pattern (`--full-analysis`)

**Purpose:** Maximum rigor for high-stakes decisions requiring all perspectives.

>

**When to Use:**
- Major investment decisions requiring full due diligence
- Product strategy pivots with significant impact
- Need all perspectives considered before committing
- High-stakes ideation with no room for blind spots

**What It Does:**
1. PRE-IDEATION: @user, @competitive, @stakeholder, @trend analysts run
2. IDEATION: @ideation_facilitator receives all analyst context
3. POST-IDEATION: @feasibility, @commercial analysts evaluate
4. All 6 analyst outputs inform final idea-context.md
5. Comprehensive documentation for downstream teams

**Best For:** Strategic planning, major investments, comprehensive due diligence, funded projects

>

**Pattern Categories:**
- **PRE-IDEATION:** User-First, Competitive, Stakeholder, Trend
- **POST-IDEATION:** Feasibility, Business
- **COMBINED:** Comprehensive (all 6 analysts)
<!-- END EXACT OUTPUT -->

---

#### --development

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Development Workflow**                           |
| Q101 Framework v2.12.16 Full Build Lifecycle        |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Build a complete application from scratch

>

## Workflow Diagram:

```
┌──────────────┐
│ /initialize  │ → Research & requirements discovery
└──────┬───────┘
       ↓
┌──────────────┐
│  /generate   │ → Create PRD.md & PRP.md
└──────┬───────┘
       ↓
┌──────────────┐
│  /execute    │ → Multi-agent development (12 agents)
└──────┬───────┘
       ↓
┌──────────────┐
│  /prepare    │ → Install dependencies, configure .env
└──────┬───────┘
       ↓
┌──────────────┐     ┌──────────────┐
│  /evaluate   │────►│  /iterate    │ Fix issues (loop)
└──────┬───────┘     └──────────────┘
       ↓
┌──────────────┐
│   /secure    │ → Security assessment & fixes
└──────┬───────┘
       ↓
┌──────────────┐
│  /activate   │ → Deploy to environment
└──────────────┘
```

>

**Patterns:** 3 (use `--patterns` to see)

**Agents:** 12 development agents coordinated by `@orchestrator`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Development Workflow is the complete application build lifecycle, taking you from initial requirements to deployed application.

**When to Use:**
- Starting a new project from scratch
- Building from requirements documents
- Full Scrum/Agile development cycle

**Commands in Order:**
1. `/initialize` - Research input artifacts, clarify requirements
2. `/generate` - Create PRD.md and PRP.md documents
3. `/execute` - Build application with 12 specialized agents
4. `/prepare` - Install dependencies, configure environment
5. `/evaluate` - Run tests, health checks, quality validation
6. `/iterate` - Fix any issues found (repeat until passing)
7. `/secure` - Security assessment and fixes
8. `/activate` - Deploy to target environment

**Agents Involved:**
- All 12 development agents participate
- @orchestrator coordinates the entire workflow

**Output:**
- Complete application source code
- Test suites with coverage
- Documentation (README, CHANGELOG)
- Deployed and running application

**Time Investment:**
- Small project: 1-2 hours
- Medium project: 2-4 hours
- Large project: 4-8 hours

---

**Development Workflow Patterns Table (--development --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Development Workflow Patterns**                  |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Stages | Skipped | Duration | Best For |
|---------|--------|---------|----------|----------|
| Standard | All 8 | None | Full | Production apps |
| Demo | 3 | /prepare, /evaluate, /iterate, /secure, /activate | Quick | POCs |
| Fast-Track | 6 | /secure, /activate | Short | MVPs |
| Security-First | 8 | None | Full+ | Compliance |

>

## Extended Explanations:

### Standard Pattern (Default)

**Purpose:** Complete 8-stage development lifecycle for production-ready applications.

>

**When to Use:**
- Building applications intended for production deployment
- Need full quality assurance and security validation
- Following complete Scrum/Agile development cycle
- Professional or commercial projects

**What It Does:**
1. /initialize → Research artifacts and clarify requirements
2. /generate → Create PRD.md and PRP.md documents
3. /execute → Build with 12 specialized agents
4. /prepare → Install dependencies, configure environment
5. /evaluate → Run tests, health checks, quality validation
6. /iterate → Fix issues (loop until passing)
7. /secure → Security assessment and vulnerability fixes
8. /activate → Deploy to target environment

**Best For:** Production applications, commercial products, professional projects, full delivery

---

### Demo Pattern

**Purpose:** Minimal development for proof-of-concept demonstrations without environment setup or quality gates.

>

**When to Use:**
- Building quick proof-of-concept to demonstrate feasibility
- Internal demonstrations or stakeholder presentations
- Exploring technical approach before committing to full development
- Rapid prototyping where runtime validation is manual

**What It Does:**
1. /initialize → Quick requirements gathering
2. /generate → Create PRD.md and PRP.md
3. /execute → Build with 12 agents
4. SKIPPED: /prepare (no dependency installation)
5. SKIPPED: /evaluate (no automated testing)
6. SKIPPED: /iterate (no issue fixing loop)
7. SKIPPED: /secure (no security audit)
8. SKIPPED: /activate (no deployment)

**Best For:** POCs, quick demos, feasibility studies, technical exploration

---

### Fast-Track Pattern

**Purpose:** Rapid development for prototypes and MVPs without security/deployment overhead.

>

**When to Use:**
- Building proof-of-concept or prototype
- MVP for validation before full investment
- Internal tools not requiring security hardening
- Time-constrained demonstrations

**What It Does:**
1. /initialize → Quick requirements gathering
2. /generate → Create PRD.md and PRP.md
3. /execute → Build with 12 agents
4. /prepare → Install dependencies
5. /evaluate → Run tests and health checks
6. /iterate → Fix critical issues only
7. SKIPPED: /secure (no security audit)
8. SKIPPED: /activate (no deployment)

**Best For:** MVPs, prototypes, proof-of-concepts, demos, internal tools, hackathons

---

### Security-First Pattern

**Purpose:** Prioritize security for compliance-sensitive or high-risk applications.

>

**When to Use:**
- Applications handling sensitive data (PII, financial, health)
- Compliance requirements (SOC2, HIPAA, PCI-DSS)
- Security-critical infrastructure or APIs
- High-value target applications

**What It Does:**
1. /initialize → Requirements with security focus
2. /generate → PRD/PRP with security requirements section
3. /execute → Build with @security_expert engaged throughout
4. /secure → Run EARLY (after /execute, before /prepare)
5. /prepare → Configure secure environment
6. /evaluate → Include security tests in evaluation
7. /iterate → Address security findings first
8. /activate → Secure deployment with verification

**Best For:** Compliance-bound projects, financial apps, healthcare apps, security infrastructure

>

**Pattern Details:**
- **Standard:** Full 8-stage lifecycle for production apps
- **Demo:** Only /initialize, /generate, /execute for POCs
- **Fast-Track:** Skip /secure and /activate for prototypes
- **Security-First:** Run /secure early after /execute
<!-- END EXACT OUTPUT -->

---

#### --autonomous

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Autonomous Workflow**                            |
| Q101 Framework v2.12.16 Long-Running Development   |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Build applications feature-by-feature with automatic checkpointing

>

## Workflow Diagram:

```
┌──────────────┐
│ /autonomous  │ → Start autonomous coding session
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Session 1: INITIALIZER               │
│  ├── Analyze context (PRD/PRP/idea)  │
│  ├── Generate feature-list.json      │
│  ├── Create init.ps1/init.sh         │
│  └── Git baseline commit             │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Session 2-N: CODING                  │
│  ├── Run init script                 │
│  ├── Regression check                │
│  ├── Implement ONE feature           │
│  ├── Verify (unit/e2e)               │
│  └── Git checkpoint commit           │
└──────┬───────────────────────────────┘
       ↓ (repeat until all features pass)
┌──────────────────────────────────────┐
│ COMPLETION                           │
│  ├── All features verified           │
│  ├── Final documentation             │
│  └── Recommend /prepare → /evaluate  │
└──────────────────────────────────────┘
```

>

**Patterns:** 3 (use `--patterns` to see)

**Agents:** `@autonomous_initializer` + `@autonomous_coder`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Autonomous Workflow enables long-running development sessions that build applications feature-by-feature with automatic checkpointing and session recovery.

**When to Use:**

- Building applications with known scope and clear features
- Overnight or unattended development sessions
- When minimal user interaction is preferred
- Projects with PRD/PRP or idea-context already defined

**Commands Involved:**
1. `/autonomous` - Start new or resume existing session
2. `/autonomous --full` - Run unlimited sessions until completion
3. `/autonomous --resume` - Resume paused session
4. `/autonomous --status` - View current progress

**Agents Involved:**

- @autonomous_initializer - Session 1: Creates feature list, init script, git baseline
- @autonomous_coder - Sessions 2+: Implements one feature per session with verification

**Key Differentiators from /execute:**

| Aspect | /execute | /autonomous |
|--------|----------|-------------|
| Agents | 12 development agents | 2 agent modes |
| Checkpoints | Design phase approval | Every feature |
| Session Model | Single continuous | Multiple bounded |
| Memory | In-context (handoff_queue) | External state files |
| Recovery | Manual restart | Automatic resume |

**Output:**

- feature-list.json (feature specifications)
- session-state.json (progress tracking)
- progress.txt (human-readable log)
- Git commits per feature

**Time Investment:**

- Small project (10 features): 1-2 hours
- Medium project (30 features): 3-5 hours
- Large project (50+ features): 5-10+ hours

---

**Autonomous Workflow Patterns Table (--autonomous --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Autonomous Workflow Patterns**                   |
| Q101 Framework v2.12.16                            |
| ================================================== |

>

| Pattern | Flag | Sessions | Best For |
|---------|------|----------|----------|
| Standard | (default) | Max 20 | Controlled builds |
| Full | `--full` | Unlimited | Overnight builds |
| Verify-Only | `--verify-only` | N/A | Validation only |

>

## Extended Explanations:

### Standard Pattern (Default)

**Purpose:** Bounded autonomous development with 20-session safety limit.

>

**When to Use:**
- Testing autonomous mode on new projects
- Controlled development with cost awareness
- Projects where you want periodic check-ins

**What It Does:**
1. Session 1: @autonomous_initializer creates feature-list.json
2. Sessions 2-20: @autonomous_coder implements one feature each
3. Checkpoint after every feature (git commit + state update)
4. Warning at session 15 (5 sessions remaining)
5. Pause at session 20, ask to continue

**Best For:** Testing autonomous mode, cost-conscious development, controlled builds

---

### Full Pattern (`--full`)

**Purpose:** Unlimited autonomous development until all features complete.

>

**When to Use:**
- Known-scope projects with defined features
- Overnight or unattended development sessions
- Production builds with confidence in feature list
- Maximum automation with minimal interaction

**What It Does:**
1. Session 1: @autonomous_initializer creates feature-list.json
2. Sessions 2-N: @autonomous_coder implements features continuously
3. No session limit - runs until all features pass
4. Checkpoint after every feature for recovery
5. Interruptible with Ctrl+C or `/autonomous --pause`
6. Resumable with `/autonomous --resume`

**Best For:** Overnight builds, known-scope projects, maximum automation

---

### Verify-Only Pattern (`--verify-only`)

**Purpose:** Run verification on existing features without implementing new ones.

>

**When to Use:**
- After manual code changes that might affect features
- Regression testing after external modifications
- Validating feature-list.json accuracy
- Quality gates before deployment

**What It Does:**
1. Loads feature-list.json
2. Runs verification for all features marked as passing
3. Reports any regressions found
4. Does NOT implement any new features
5. Updates passes=false for any failing features

**Best For:** Regression testing, quality validation, pre-deployment checks

>

**Pattern Details:**
- **Standard:** 20-session limit with warnings
- **Full:** Unlimited sessions until completion
- **Verify-Only:** Run verification without implementation

>

**Cost Warning:** `--full` mode can consume significant API tokens for large projects. Monitor progress with `/autonomous --status`.
<!-- END EXACT OUTPUT -->

---

#### --analysis

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Analysis Workflow**                              |
| Q101 Framework v2.12.16 Deep Codebase Analysis      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Analyze existing code for quality

>

## Workflow Diagram:

```
┌──────────────┐
│   /analyze   │ → Deep codebase analysis (5 agents)
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│         ANALYSIS-REPORT.md           │
│  ├── Architecture Analysis           │
│  ├── Quality Issues                  │
│  ├── Bug Detection                   │
│  ├── Documentation Gaps              │
│  └── Refactoring Opportunities       │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ User Review  │ → Choose what to fix
└──────┬───────┘
       ↓
┌──────────────┐
│ Apply Fixes  │ → Implement approved improvements
└──────────────┘
```

>

**Patterns:** 4 (use `--patterns` to see)

**Agents:** 5 analysis agents
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Analysis Workflow performs deep analysis on any existing codebase, identifying issues and improvement opportunities.

**When to Use:**
- Reviewing inherited or legacy code
- Quality audit before major changes
- Understanding unfamiliar codebase
- Technical debt assessment

**Commands Involved:**
1. `/analyze` - Run all 5 analysis agents in parallel
2. `/analyze --scope=security` - Security-focused analysis
3. `/analyze --scope=docs` - Documentation-focused analysis
4. `/analyze --scope=quality` - Quality-focused analysis
5. Review ANALYSIS-REPORT.md
6. Choose fixes to apply (or skip)

**Agents Involved:**
- @code_analyst - Architecture, complexity, code smells
- @quality_auditor - Standards, best practices
- @debug_specialist - Bugs, security vulnerabilities
- @doc_engineer - Documentation gaps
- @refactor_specialist - Refactoring opportunities

**Output:**
- ANALYSIS-REPORT.md with all findings
- codebase-profile.json
- Optional: Applied fixes

**Standalone Capability:**
- Works on ANY existing codebase
- No PRD/PRP required
- Can run immediately after /install

---

**Analysis Workflow Patterns Table (--analysis --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Analysis Workflow Patterns**                     |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Focus Agents | Duration | Best For |
|---------|------|--------------|----------|----------|
| Full | (default) | All 5 | 30-45 min | Complete |
| Security | `--scope=security` | @debug | 15-25 min | Audit |
| Docs | `--scope=docs` | @doc_engineer | 15-25 min | Gaps |
| Quality | `--scope=quality` | @quality | 15-25 min | Code |

>

## Extended Explanations:

### Full Pattern (Default)

**Purpose:** Comprehensive codebase analysis using all 5 specialized agents in parallel.

>

**When to Use:**
- First analysis of inherited or legacy codebase
- Complete quality audit before major changes
- Technical debt assessment across all dimensions
- Understanding unfamiliar codebase thoroughly

**What It Does:**
1. @code_analyst → Architecture, complexity metrics, code smells
2. @quality_auditor → Standards compliance, SOLID principles, best practices
3. @debug_specialist → Bug patterns, security vulnerabilities, edge cases
4. @doc_engineer → Documentation gaps, README completeness, type coverage
5. @refactor_specialist → Refactoring opportunities, scope recommendations
6. Synthesizes all findings into prioritized ANALYSIS-REPORT.md

**Best For:** Initial codebase assessment, complete audits, technical debt evaluation, due diligence

---

### Security Pattern (`--scope=security`)

**Purpose:** Focused security vulnerability analysis and OWASP Top 10 assessment.

>

**When to Use:**
- Pre-production security review
- After security incident or breach
- Compliance audit preparation
- Reviewing code handling sensitive data

**What It Does:**
1. @debug_specialist focuses exclusively on security
2. Scans for OWASP Top 10 vulnerabilities
3. Checks for hardcoded secrets and credentials
4. Reviews authentication and authorization patterns
5. Validates input sanitization and output encoding
6. Identifies injection risks (SQL, XSS, command)

**Best For:** Security audits, compliance preparation, incident response, sensitive code review

---

### Docs Pattern (`--scope=docs`)

**Purpose:** Documentation coverage analysis and gap identification.

>

**When to Use:**
- Preparing codebase for open-source release
- Onboarding new team members
- API documentation audit
- Type coverage assessment

**What It Does:**
1. @doc_engineer focuses exclusively on documentation
2. Inventories existing documentation (README, API docs, inline)
3. Identifies undocumented functions and classes
4. Assesses docstring coverage percentage
5. Checks type annotation completeness
6. Reviews README for completeness and accuracy

**Best For:** Open-source prep, onboarding improvement, API documentation, type coverage

---

### Quality Pattern (`--scope=quality`)

**Purpose:** Code quality standards and best practices assessment.

>

**When to Use:**
- Code review preparation
- Enforcing team standards
- SOLID principles validation
- Technical debt quantification

**What It Does:**
1. @quality_auditor focuses exclusively on code quality
2. Checks coding standards compliance
3. Validates SOLID principles adherence
4. Reviews error handling patterns
5. Assesses logging and observability
6. Verifies naming conventions consistency

**Best For:** Code review prep, standards enforcement, SOLID validation, quality scoring

>

**Pattern Details:**
- **Full:** All 5 agents for comprehensive analysis
- **Security:** Focused on vulnerabilities and OWASP Top 10
- **Docs:** Documentation gaps, README, type coverage
- **Quality:** Code standards, best practices, SOLID

>

## OWASP Top 10

OWASP (Open Web Application Security Project) maintains a list of the 10 most critical web application security risks:

| # | Vulnerability | Description |
|---|---------------|-------------|
| 1 | Broken Access Control | Users acting outside intended permissions |
| 2 | Cryptographic Failures | Weak encryption, exposed sensitive data |
| 3 | Injection | SQL, NoSQL, OS, LDAP injection attacks |
| 4 | Insecure Design | Missing security controls in architecture |
| 5 | Security Misconfiguration | Default configs, open cloud storage, verbose errors |
| 6 | Vulnerable Components | Outdated libraries with known vulnerabilities |
| 7 | Authentication Failures | Broken login, session management, credential stuffing |
| 8 | Data Integrity Failures | Unverified updates, insecure CI/CD pipelines |
| 9 | Logging Failures | Missing audit logs, unmonitored breaches |
| 10 | SSRF | Server-Side Request Forgery attacks |

>

## SOLID Principles

SOLID is an acronym for 5 object-oriented design principles:

| Letter | Principle | Meaning |
|--------|-----------|---------|
| **S** | Single Responsibility | A class should have only one reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subtypes must be substitutable for their base types |
| **I** | Interface Segregation | Many specific interfaces > one general-purpose interface |
| **D** | Dependency Inversion | Depend on abstractions, not concrete implementations |
<!-- END EXACT OUTPUT -->

---

#### --refactoring

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Refactoring Workflow**                           |
| Q101 Framework v2.12.16 Safe Code Improvement       |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Improve code structure without changing behavior

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ /analyze (optional, if no report)    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /iterate --refactor                  │
│  └── Detects ANALYSIS-REPORT.md      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ @refactor_specialist                 │
│  ├── Analyzes request                │
│  ├── Recommends scope (micro/meso/   │
│  │   macro)                          │
│  ├── Creates refactoring plan        │
│  └── Verifies behavior preservation  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ User Approve │ → Approve/modify/cancel plan
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Execute Refactoring                  │
│  ├── @lead_developer (micro/meso)    │
│  └── @system_architect (meso/macro)  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ REFACTORING-LOG.md                   │
│  └── Changes documented              │
└──────────────────────────────────────┘
```

>

**Patterns:** 2 (use `--patterns` to see)

**Agent:** `@refactor_specialist`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Refactoring Workflow safely improves code structure while preserving external behavior.

**When to Use:**
- After /analyze identifies opportunities
- Proactive code improvement
- Before adding new features to messy code
- Technical debt reduction

**Commands Involved:**
1. `/analyze` (optional - provides opportunities)
2. `/iterate --refactor` - Triggers refactoring flow
3. `/iterate --refactor "description"` - Specific request

**Scope Levels:**
- **Micro** - Single file, low risk (e.g., extract method)
- **Meso** - Multiple files, medium risk (e.g., split class)
- **Macro** - Architecture level, higher risk (e.g., restructure)

**Safety Guarantees:**
- External API/behavior unchanged
- Step-by-step verification
- Rollback documented
- User approval required

**Output:**
- Refactored code
- REFACTORING-LOG.md
- Behavior preservation verification

---

**Refactoring Workflow Patterns Table (--refactoring --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Refactoring Workflow Patterns**                  |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Approach | Duration | Best For |
|---------|------|----------|----------|----------|
| Standard | (default) | Full | 45-60 min | Major work |
| Behavior-Preserving | `--preserve` | Minimal | 30-45 min | Safe |

>

## Extended Explanations:

### Standard Pattern (Default)

**Purpose:** Full refactoring with architecture changes and comprehensive restructuring.

>

**When to Use:**
- Major code reorganization needed
- Architecture improvements identified by /analyze
- Technical debt reduction initiative
- Preparing codebase for new features

**What It Does:**
1. @refactor_specialist analyzes request and determines scope
2. Recommends scope level: micro (1 file), meso (2-10 files), or macro (10+ files)
3. Creates detailed step-by-step refactoring plan
4. @lead_developer executes micro/meso scope changes
5. @system_architect involved for meso/macro scope
6. Verifies behavior preservation at each step
7. Documents all changes in REFACTORING-LOG.md

**Best For:** Major refactoring, architecture improvements, technical debt reduction, code modernization

---

### Behavior-Preserving Pattern (`--preserve`)

**Purpose:** Minimal, safe refactoring with strict external behavior preservation guarantee.

>

**When to Use:**
- Code is in production with no test coverage
- Cannot risk any behavior changes
- Small, targeted improvements only
- Preparing code for safer later refactoring

**What It Does:**
1. @refactor_specialist applies strict preservation rules
2. Only allows refactorings with no external API changes
3. Focuses on: rename, extract method, inline, move within file
4. Avoids: changing signatures, moving between files, restructuring
5. Extra verification of unchanged behavior before/after
6. Smaller steps with verification between each

**Best For:** Production code, legacy systems, untested code, safe incremental improvement

>

**Pattern Details:**
- **Standard:** Full refactoring with architecture changes
- **Behavior-Preserving:** Minimal changes, strict behavior preservation

>

**Scope Levels:**
- **Micro:** Single file, low risk (extract method)
- **Meso:** Multiple files, medium risk (split class)
- **Macro:** Architecture level, higher risk (restructure)
<!-- END EXACT OUTPUT -->

---

#### --git

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Git Workflow**                                   |
| Q101 Framework v2.12.16 Repository Hygiene          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Maintain clean, secure, reproducible repositories

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ TASK START                           │
│  └── git status (verify clean)       │
│      git checkout -b feature/<name>  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ DURING WORK                          │
│  ├── Update .gitignore as needed     │
│  ├── Never stage secrets (.env, keys)│
│  └── Add .gitkeep to empty dirs      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ BEFORE COMMIT                        │
│  ├── /utilities --git --check        │
│  ├── git diff (review staged)        │
│  └── Atomic commit: Add:/Fix:/Docs:  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ TASK END                             │
│  ├── git status (verify clean)       │
│  └── Provide commit summary          │
└──────────────────────────────────────┘
```

>

**Patterns:** 3 (use `--patterns` to see)

**Utility:** `/utilities --git --check`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Git Workflow provides standardized practices for maintaining clean, secure, and reproducible repositories. It integrates with the Q101 Framework to ensure all projects follow consistent git hygiene.

**When to Use:**

- Starting any development task (run git status)
- Before committing changes (run /utilities --git --check)
- When creating new features (use feature branches)
- When organizing project structure (use .gitkeep)

**Commands Involved:**
1. `/utilities --git` - Show git workflow reference and available commands
2. `/utilities --git --check` - Validate git hygiene before commits
3. `/utilities --git --check --full` - Full repository audit
4. `/utilities --git --check --fix` - Auto-fix missing .gitkeep and .gitignore gaps

**Key Principles:**

- Git tracks intentional source artifacts, not runtime state
- Never commit secrets (.env, API keys, credentials)
- Use atomic commits with standard prefixes (Add:, Fix:, Refactor:, Docs:, Chore:)
- Use feature branches for non-trivial work
- Preserve directory structure with .gitkeep files

**Reference:**

- `documents/Q101-GIT-WORKFLOW-GUIDE.md` - Complete authoritative guide

---

**Git Workflow Patterns Table (--git --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Git Workflow Patterns**                          |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Scope | Best For |
|---------|------|-------|----------|
| Quick Check | (default) | Staged files | Pre-commit validation |
| Full Scan | `--full` | All files | Repository audit |
| Fix Mode | `--fix` | Auto-repair | Add .gitkeep, update .gitignore |

>

## Extended Explanations:

### Quick Check Pattern (Default)

**Purpose:** Validate staged files before commit to catch issues early.

>

**When to Use:**
- Before every commit
- After staging files with `git add`
- Quick validation without full scan overhead

**What It Does:**
1. Scans staged files for secrets (.env, API keys, credentials)
2. Checks if .gitignore has standard Q101 patterns
3. Verifies required .gitkeep files exist
4. Warns if on main branch for non-trivial changes

**Best For:** Pre-commit validation, quick checks, daily workflow

---

### Full Scan Pattern (`--full`)

**Purpose:** Comprehensive repository audit for thorough hygiene review.

>

**When to Use:**
- Periodic repository audits
- Before major releases or deployments
- When inheriting or reviewing a codebase
- After cloning a new repository

**What It Does:**
1. Scans ALL files (not just staged) for secrets
2. Audits entire .gitignore for completeness
3. Checks all required directories have .gitkeep
4. Reviews recent commit messages for format compliance
5. Reports on branch hygiene and stale branches

**Best For:** Repository audits, release prep, codebase reviews, onboarding

---

### Fix Mode Pattern (`--fix`)

**Purpose:** Automatically repair common git hygiene issues.

>

**When to Use:**
- After identifying issues with Quick Check or Full Scan
- Setting up new projects to meet Q101 standards
- Bulk-fixing repositories to comply with standards

**What It Does:**
1. Creates missing .gitkeep files in required directories
2. Adds missing patterns to .gitignore
3. Reports what was fixed and what requires manual attention
4. Does NOT auto-fix secrets (requires manual removal)

**Best For:** New project setup, bulk compliance fixes, automation

>

**Reference:**
- `documents/Q101-GIT-WORKFLOW-GUIDE.md` - Complete authoritative guide
<!-- END EXACT OUTPUT -->

---

### Cross-Workflow Patterns

---

#### --idea-to-dev

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Idea-to-Development Pattern**                    |
| Q101 Framework v2.12.16 Complete Build Pipeline     |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Full pipeline from brainstorming to deployed app

>

## Workflow Diagram:

```
┌──────────────┐
│   /ideate    │ → Brainstorm project ideas
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ idea-context.md                      │
│  ├── Problem statement               │
│  ├── Target users                    │
│  ├── Recommended approach            │
│  └── Key features                    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ /initialize  │ → Research + enrich with web research
└──────┬───────┘
       ↓
┌──────────────┐
│  /generate   │ → Create PRD.md & PRP.md
└──────┬───────┘
       ↓
┌──────────────┐
│  /execute    │ → Build application with 12 agents
└──────┬───────┘
       ↓
┌──────────────┐
│   ...rest    │ → /prepare → /evaluate → /secure → /activate
└──────────────┘
```

>

**Connects:** Ideation → Development workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Complete pipeline from initial brainstorming through deployed application. The idea-context.md serves as input to /initialize, providing structured requirements that are enriched with web research.

**When to Use:**
- Starting completely from scratch with just an idea
- Need structured brainstorming before committing
- Want to explore multiple approaches before development

**Benefits:**
- Structured idea exploration before development
- Clear handoff between ideation and development
- Full development workflow follows

---

#### --research-to-idea

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Research-to-Ideation Pattern**                   |
| Q101 Framework v2.12.16 Evidence-Guided Ideation    |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Let research findings guide ideation

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ /research "market/technology topic"  │
│  └── Gather evidence first           │
│      (creates topic ID: res-2026-001)│
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ research-context.md                  │
│  ├── Market insights                 │
│  ├── Technology landscape            │
│  └── Opportunity gaps                │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /ideate --topic=res-2026-001         │
│  ├── Research context loaded         │
│  ├── UNDERSTAND: informed questions  │
│  ├── EXPLORE: evidence-cited options │
│  └── PRESENT: research-linked idea   │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ idea-context.md                      │
│  └── Includes research references    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ /initialize  │ → Evidence-backed requirements
└──────────────┘
```

>

**Connects:** Research → Ideation → Development workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Research-to-Ideation pattern uses evidence to inform and guide creative brainstorming.

**When to Use:**
- Exploring unknown markets or technologies
- When evidence should shape ideas (not validate them)
- Technology evaluation before concept design
- Market-driven product development

**Commands in Order:**
1. `/research "topic"` - Gather evidence first
2. `/ideate --topic={id}` - Ideate informed by findings
3. `/ideate --initialize` - Create project
4. `/initialize` - Begin development

**Benefits:**
- Ideas grounded in evidence from the start
- Research guides creative exploration
- No wasted ideation on invalid directions
- Market/technical reality informs approaches

---

#### --idea-to-research

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Idea-to-Research Pattern**                       |
| Q101 Framework v2.12.16 Idea Validation             |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Validate brainstormed ideas with evidence

>

## Workflow Diagram:

```
┌──────────────┐
│   /ideate    │ → Create idea with full context
│              │   (generates session ID: a7f3d821)
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ /research --idea=a7f3d821            │
│  ├── Extract: topic, problem, users  │
│  ├── Generate targeted queries       │
│  ├── Validate assumptions            │
│  └── Track lineage: source_idea_id   │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ research-context.md                  │
│  ├── Evidence for/against idea       │
│  ├── Market validation               │
│  └── Technical feasibility           │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /ideate --initialize=a7f3d821        │
│  └── Copies both idea + research     │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ /initialize  │ → Development with evidence
└──────────────┘
```

>

**Connects:** Ideation → Research → Development workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Idea-to-Research pattern validates brainstormed ideas with evidence before committing to development.

**When to Use:**
- After creating an idea that needs market validation
- When assumptions need evidence backing
- Before major development investments
- For data-driven decision making

**Commands in Order:**
1. `/ideate "topic"` - Create initial idea
2. `/research --idea={id}` - Research extracts full idea context
3. `/ideate --initialize={id}` - Create project with research
4. `/initialize` - Begin requirements discovery with evidence

**Benefits:**
- Evidence-backed development decisions
- Validates assumptions before coding
- Full context transfer between commands
- Bidirectional lineage tracking

---

#### --dev-to-analysis

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Development-to-Analysis Pattern**                |
| Q101 Framework v2.12.16 Quality Review              |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Identify improvements after initial development

>

## Workflow Diagram:

```
┌──────────────┐
│  /execute    │ → Build application
└──────┬───────┘
       ↓
┌──────────────┐
│  /prepare    │ → Install dependencies
└──────┬───────┘
       ↓
┌──────────────┐
│  /analyze    │ → Deep analysis of generated code
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Review ANALYSIS-REPORT.md            │
│  └── Identify technical debt early   │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│  /iterate    │ → Fix identified issues
└──────────────┘
```

>

**Connects:** Development → Analysis → Improvement workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Run analysis immediately after /execute to catch any issues in the generated code before proceeding to evaluation.

**When to Use:**
- Quality-conscious development
- Before sharing code for review
- When generated code seems complex

**Benefits:**
- Catches issues early
- Identifies refactoring opportunities
- Improves code before testing

---

#### --security-audit

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Security Audit Pattern**                         |
| Q101 Framework v2.12.16 Security Assessment         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Comprehensive security review and remediation

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ /analyze --scope=security            │
│  └── @debug_specialist focuses on    │
│      security vulnerabilities        │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Review Security Findings             │
│  ├── OWASP Top 10                    │
│  ├── Hardcoded secrets               │
│  ├── Authentication issues           │
│  └── Input validation                │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│   /secure    │ → Full security assessment & fixes
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ SECURITY-REPORT.md                   │
│  └── Remediation complete            │
└──────────────────────────────────────┘
```

>

**Connects:** Analysis → Security → Remediation workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Focused security workflow combining analysis and remediation.

**When to Use:**
- Pre-production security review
- After security incident
- Compliance audits
- Inherited codebase review

**Benefits:**
- Comprehensive security coverage
- Two-phase review (analyze + secure)
- Full remediation with verification

---

#### --quality-gate

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Quality Gate Pattern**                           |
| Q101 Framework v2.12.16 Full QA Cycle               |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Comprehensive quality verification

>

## Workflow Diagram:

```
┌──────────────┐
│  /evaluate   │ → Run tests, health checks
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Pass?                                │
│  ├── Yes → Continue                  │
│  └── No → /iterate (fix issues)      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│  /analyze    │ → Deep code analysis
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ Quality Score Acceptable?            │
│  ├── Yes → Continue                  │
│  └── No → /iterate (improve code)    │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│  /evaluate   │ → Final verification
└──────────────┘
```

>

**Connects:** Evaluation → Analysis → Iteration cycles
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Full quality assurance cycle combining evaluation and analysis.

**When to Use:**
- Pre-release quality gate
- Milestone verification
- Quality improvement initiatives
- CI/CD pipeline gates

**Benefits:**
- Comprehensive quality coverage
- Both runtime and static analysis
- Clear pass/fail criteria
- Iterative improvement loop

---

#### --discovery-to-dev

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Discovery-to-Development Pattern**               |
| Q101 Framework v2.12.16 Example-Based Development   |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Start project from discovered Anthropic example

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ /discover --cookbooks|--quickstarts  │
│  └── Browse available examples       │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /discover --clone=<example-name>     │
│  └── Copy example to project folder  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────┐
│ /initialize  │ → Research & requirements from example
└──────┬───────┘
       ↓
┌──────────────┐
│  /generate   │ → Create PRD.md & PRP.md
└──────┬───────┘
       ↓
┌──────────────┐
│  /execute    │ → Build application with 12 agents
└──────┬───────┘
       ↓
┌──────────────┐
│   ...rest    │ → /prepare → /evaluate → /secure → /activate
└──────────────┘
```

>

**Connects:** Discovery → Development workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Start a new project using code examples from Anthropic's cookbook or quickstarts repositories as a foundation.

**When to Use:**
- Want to learn from proven Anthropic patterns
- Starting a project similar to an existing example
- Rapid project scaffolding with best practices
- Building on top of official Anthropic code

**Benefits:**
- Proven code patterns from Anthropic
- Faster project initialization
- Best practices baked in from start
- Learning opportunity while building

---

#### --discovery-to-hackathon

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Discovery-to-Hackathon Pattern**                 |
| Q101 Framework v2.12.16 Rapid Example Build         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Rapid MVP build using discovered patterns

>

## Workflow Diagram:

```
┌──────────────────────────────────────┐
│ /discover --cookbooks|--quickstarts  │
│  └── Browse available examples       │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /discover --clone=<example-name>     │
│  └── Copy example to project folder  │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ /hackathon --quality=lightning       │
│  ├── Phase 1: Ideate (30 min)        │
│  ├── Phase 2: Design (1 hr)          │
│  ├── Phase 3: Build (4-6 hr)         │
│  └── Phase 4: Demo (30 min)          │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ DELIVERABLES                         │
│  ├── Working MVP                     │
│  └── README + basic docs             │
└──────────────────────────────────────┘
```

>

**Connects:** Discovery → Prototyping workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Combine example discovery with rapid hackathon-style development for fast MVPs.

**When to Use:**
- Weekend coding sprints
- Rapid prototyping for validation
- Building on existing patterns quickly
- Time-boxed development sessions

**Benefits:**
- Start from proven code patterns
- Time-boxed development phases
- Fast path to working MVP
- Structured hackathon methodology

---

#### --idea-to-hackathon

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Idea-to-Hackathon Pattern**                      |
| Q101 Framework v2.12.16 Quick MVP from Idea         |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Build quick MVP from brainstormed idea

>

## Workflow Diagram:

```
┌──────────────┐
│   /ideate    │ → Quick brainstorming session
│              │   (generates idea-context.md)
└──────┬───────┘
       ↓
┌──────────────────────────────────────┐
│ /hackathon --idea=<id>               │
│  └── Load idea context automatically │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Quality Mode Selection               │
│  ├── Lightning (4-8hr)               │
│  ├── Standard (24-48hr)              │
│  └── Polish (3-7 day)                │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ Hackathon Phases                     │
│  ├── IDEATE: Validate concept        │
│  ├── DESIGN: Generate PRD            │
│  ├── BUILD: Implement features       │
│  └── DEMO: Documentation + demo      │
└──────┬───────────────────────────────┘
       ↓
┌──────────────────────────────────────┐
│ DELIVERABLES                         │
│  └── Working MVP + docs              │
└──────────────────────────────────────┘
```

>

**Connects:** Ideation → Prototyping workflows
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

Transform a brainstormed idea directly into a working MVP using hackathon methodology.

**When to Use:**
- Validating ideas with working code
- Weekend sprint after ideation session
- Quick proof-of-concept development
- Time-constrained MVP building

**Benefits:**
- Direct path from idea to code
- Structured time-boxed development
- Quality modes for different timeframes
- Built-in documentation phases

---

### New Primary Workflows (v2.12.16)

---

#### --discovery

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Discovery Workflow**                             |
| Q101 Framework v2.12.16 Example Browser             |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Browse Anthropic examples to kickstart projects

>

## Workflow Diagram:

```
┌─────────────────────────────────────┐
│ /discover --cookbooks|--quickstarts │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Display Table of Examples           │
│  ├── Name                           │
│  ├── Category                       │
│  ├── Description                    │
│  └── Tags                           │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ User Action                         │
│  ├── --show=<name> → View details   │
│  └── --clone=<name> → Copy to project│
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ Post-Clone Workflow                 │
│  ├── --then=initialize → /initialize│
│  ├── --then=ideate → /ideate        │
│  └── --then=research → /research    │
└─────────────────────────────────────┘
```

>

**Patterns:** 3 (use `--patterns` to see)

**Command:** `/discover`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Discovery Workflow enables users to browse available code examples from Anthropic repositories to kickstart their projects.

**When to Use:**
- Starting a new project and want proven patterns
- Learning Anthropic best practices
- Looking for inspiration from official examples
- Rapid scaffolding with working code

**Commands Involved:**
1. `/discover --cookbooks` - Browse claude-code-cookbook examples
2. `/discover --quickstarts` - Browse quickstarts examples
3. `/discover --show=<name>` - View example details and README
4. `/discover --clone=<name>` - Copy example to project folder
5. `/discover --clone=<name> --then=initialize` - Clone and kickstart workflow

**Content Sources:**

| Flag | Repository | Local Path |
|------|------------|------------|
| `--cookbooks` | anthropics/claude-code-cookbook | Labs/claude-cook-books |
| `--quickstarts` | anthropics/quickstarts | Labs/claude-quick-starts |

**Output:**
- Table of available examples (list mode)
- Example details with README (show mode)
- Cloned example files (clone mode)
- discovery-registry.json tracking

---

**Discovery Workflow Patterns Table (--discovery --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Discovery Workflow Patterns**                    |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Description | Best For |
|---------|------|-------------|----------|
| Browse | (default) | List available examples in table | Exploration |
| Detail | `--show=<name>` | View example README and structure | Learning |
| Clone | `--clone=<name>` | Copy example to project folder | Starting |

>

## Extended Explanations:

### Browse Pattern (Default)

**Purpose:** Explore available examples from Anthropic repositories.

>

**When to Use:**
- First time exploring what's available
- Looking for inspiration for new projects
- Browsing by category or tag

**What It Does:**
1. Scans configured example repositories (cookbooks/quickstarts)
2. Displays table with Name, Category, Description, Tags
3. Supports filtering by --category flag
4. Shows example count per category

**Best For:** Exploration, inspiration, discovery

---

### Detail Pattern (`--show=<name>`)

**Purpose:** View detailed information about a specific example.

>

**When to Use:**
- Want to understand an example before cloning
- Reviewing README and file structure
- Assessing example complexity and requirements

**What It Does:**
1. Displays example README.md content
2. Shows file/folder structure tree
3. Lists dependencies and requirements
4. Shows related examples if available

**Best For:** Learning, evaluation, assessment

---

### Clone Pattern (`--clone=<name>`)

**Purpose:** Copy example code to current project folder.

>

**When to Use:**
- Ready to start building from an example
- Want to use example as project foundation
- Combining with --then flag for workflow chaining

**What It Does:**
1. Copies example files to current project folder
2. Preserves directory structure
3. Updates discovery-registry.json
4. Optionally chains to next command (--then flag)

**Best For:** Project initialization, scaffolding, getting started

>

**Post-Clone Options:**
- `--then=initialize` → Start /initialize workflow
- `--then=ideate` → Brainstorm modifications
- `--then=research` → Research similar solutions
<!-- END EXACT OUTPUT -->

---

#### --prototyping

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Prototyping Workflow**                           |
| Q101 Framework v2.12.16 Rapid MVP Building          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Rapid MVP building with hackathon methodologies

>

## Workflow Diagram:

```
┌────────────────────────────────────────┐
│ /hackathon [--quality=X] [--idea=Y]    │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ Quality Selection (if not specified)   │
│  ├── Lightning (4-8hr)                 │
│  ├── Standard (24-48hr)                │
│  └── Polish (3-7 day)                  │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ Phase 1: IDEATE                        │
│  └── Quick brainstorm or load --idea   │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ Phase 2: DESIGN                        │
│  ├── Generate minimal PRD              │
│  └── Generate minimal PRP (if needed)  │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ Phase 3: BUILD                         │
│  └── /autonomous --full OR /execute    │
│      (based on quality mode)           │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ Phase 4+: TEST/DOCUMENT/DEPLOY         │
│  └── Quality-appropriate phases        │
└──────────────┬─────────────────────────┘
               ↓
┌────────────────────────────────────────┐
│ DELIVERABLES                           │
│  ├── Code (all modes)                  │
│  ├── README (all modes)                │
│  ├── Docs (standard+)                  │
│  ├── Demo (standard+)                  │
│  └── Deployment (polish only)          │
└────────────────────────────────────────┘
```

>

**Patterns:** 3 (use `--patterns` to see)

**Command:** `/hackathon`
<!-- END EXACT OUTPUT -->

**Extended Explanation:**

The Prototyping Workflow enables rapid MVP building using proven hackathon methodologies with time-boxed development phases.

**When to Use:**
- Weekend coding sprints
- Hackathon competitions
- Quick validation of ideas
- Time-constrained MVP development

**Commands Involved:**
1. `/hackathon` - Interactive quality mode selection
2. `/hackathon --quality=lightning` - 4-8hr sprint mode
3. `/hackathon --quality=standard` - 24-48hr hackathon mode
4. `/hackathon --quality=polish` - 3-7 day extended mode
5. `/hackathon --idea=<id>` - Build from existing idea
6. `/hackathon --status` - View current progress
7. `/hackathon --resume` - Resume paused session

**Quality Modes:**

| Mode | Duration | Phases | Deliverables |
|------|----------|--------|--------------|
| Lightning | 4-8hr | 4 | Code + README |
| Standard | 24-48hr | 6 | Code + Docs + Demo |
| Polish | 3-7 day | 8 | Full + Deployment |

**Output:**
- Working MVP code
- README documentation
- hackathon-registry.json tracking
- Quality-appropriate deliverables

---

**Prototyping Workflow Patterns Table (--prototyping --patterns):**

<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **Prototyping Workflow Patterns**                  |
| Q101 Framework v2.12.16                             |
| ================================================== |

>

| Pattern | Flag | Phases | Duration | Best For |
|---------|------|--------|----------|----------|
| Lightning | `--quality=lightning` | 4 | 4-8hr | Weekend sprints |
| Standard | `--quality=standard` | 6 | 24-48hr | Hackathons |
| Polish | `--quality=polish` | 8 | 3-7 day | Extended MVPs |

>

## Extended Explanations:

### Lightning Pattern (`--quality=lightning`)

**Purpose:** Rapid 4-8hr sprint for quick proof-of-concept.

>

**When to Use:**
- Weekend coding sprint
- Quick feasibility validation
- POC before major investment
- Single-day hackathon

**What It Does:**
1. Phase 1: IDEATE (30 min) → Quick concept validation
2. Phase 2: DESIGN (1 hr) → Minimal PRD, no PRP
3. Phase 3: BUILD (4-6 hr) → Core features only
4. Phase 4: DEMO (30 min) → README + basic docs

**Best For:** POCs, weekend sprints, quick validation, single-day builds

---

### Standard Pattern (`--quality=standard`)

**Purpose:** Balanced 24-48hr hackathon with full documentation.

>

**When to Use:**
- Hackathon competitions
- Multi-day coding session
- MVP with proper documentation
- Balanced scope and quality

**What It Does:**
1. Phase 1: IDEATE (1 hr) → Full brainstorming
2. Phase 2: DESIGN (2 hr) → PRD + minimal PRP
3. Phase 3: BUILD (12-18 hr) → Core + secondary features
4. Phase 4: TEST (2-4 hr) → Basic validation
5. Phase 5: DOCUMENT (2 hr) → README + API docs
6. Phase 6: DEMO (1 hr) → Presentation prep

**Best For:** Hackathons, competition projects, MVPs with docs

---

### Polish Pattern (`--quality=polish`)

**Purpose:** Extended 3-7 day build with full deliverable package.

>

**When to Use:**
- Extended hackathon events
- Production-quality MVP
- Investor demo preparation
- Full-featured prototype

**What It Does:**
1. Phase 1: RESEARCH (4 hr) → Market/tech research
2. Phase 2: IDEATE (4 hr) → Full brainstorming with analysts
3. Phase 3: DESIGN (8 hr) → Complete PRD + PRP
4. Phase 4: BUILD (24-48 hr) → Full feature set
5. Phase 5: TEST (8 hr) → Comprehensive testing
6. Phase 6: DOCUMENT (4 hr) → Full documentation
7. Phase 7: DEPLOY (4 hr) → Production deployment
8. Phase 8: DEMO (4 hr) → Pitch deck + demo video

**Best For:** Extended hackathons, investor demos, production MVPs, funded projects

>

**Phase Comparison:**

| Phase | Lightning | Standard | Polish |
|-------|-----------|----------|--------|
| Research | - | - | 4 hr |
| Ideate | 30 min | 1 hr | 4 hr |
| Design | 1 hr | 2 hr | 8 hr |
| Build | 4-6 hr | 12-18 hr | 24-48 hr |
| Test | - | 2-4 hr | 8 hr |
| Document | 30 min | 2 hr | 4 hr |
| Deploy | - | - | 4 hr |
| Demo | - | 1 hr | 4 hr |
<!-- END EXACT OUTPUT -->

---

#### Detail View: `--knowledge` Workflow

When invoked as `/workflows --knowledge`:

<!-- BEGIN EXACT OUTPUT -->
...

╔══════════════════════════════════════════════════════════════╗
║                    KNOWLEDGE WORKFLOW                        ║
║               Q101 Framework v2.12.20                         ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🎯 PURPOSE                                                  ║
║  Content generation with continuous learning via S.C.O.P.E.  ║
║                                                              ║
║  📋 COMMAND                                                  ║
║  /knowledge [pattern] [topic] [options]                      ║
║                                                              ║
║  📥 INPUT                                                    ║
║  • Topic or framework name                                   ║
║  • Optional: --idea={id}, --topic={id}, --analysis={id}     ║
║                                                              ║
║  📤 OUTPUT                                                   ║
║  • knowledge/{topic}/ with generated content                 ║
║  • knowledge-registry.json entry                             ║
║  • Sharing suggestions                                       ║
║                                                              ║
║  ⏳ DURATION                                                 ║
║  • --teach: 15-30 min                                        ║
║  • --publish: 30-60 min                                      ║
║  • --share: 10-20 min                                        ║
║  • --comprehensive: 1-2 hr                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

>

**Workflow Diagram:**

```
     ┌─────────────────────────────────────────┐
     │                                         │
     ▼                                         │
  SCOPE ──► COLLECT ──► ORCHESTRATE ──► PRODUCE ──► EXPORT
     ▲                                              │
     │                                              │
     └──────────── FEEDBACK LOOP ◄─────────────────┘
                   (Learn & Improve)


SCOPE:
  ├─ Define topic boundaries
  ├─ Identify target audience
  ├─ Set objectives
  └─ Review prior sessions (from registry)

COLLECT:
  ├─ Load existing context (idea/research/analysis)
  ├─ Gather framework docs
  ├─ Import community feedback
  └─ Identify knowledge gaps

ORCHESTRATE:
  ├─ Select pattern (--teach, --publish, --share, --comprehensive)
  ├─ Chain @agentQ modes
  ├─ Configure handoffs
  └─ Set quality gates

PRODUCE:
  ├─ Execute mode sequence
  ├─ Apply Q101 standards
  ├─ Embed philosophy
  └─ Create teachable moments

EXPORT:
  ├─ Package outputs (md/pdf/docx)
  ├─ Update knowledge-registry.json
  ├─ Generate sharing guide
  └─ Enable feedback collection → feeds back to SCOPE
```

>

**Primary Agent:** @agentQ (Framework Philosopher & Wisdom Custodian)

>

**When to Use:**
- Create training materials for Q101 frameworks
- Generate publication-ready whitepapers or book chapters
- Build social media content for community engagement
- Document lessons learned from projects
- Transform research findings into tutorials
- Convert analysis reports into technical documentation

>

**Best For:**
- Educational content creation
- Knowledge base building
- Community engagement
- Technical documentation
- Authority-building content
- Content marketing

>

**Philosophy:**

"Knowledge shared is knowledge multiplied. Every lesson taught creates a teacher. Every insight shared sparks new ideas. This is continuous learning - where EXPORT becomes someone else's SCOPE."

>

**Cross-Workflow Integrations:**
- `/research → /knowledge --teach` (Evidence to tutorial)
- `/analyze → /knowledge --publish` (Findings to whitepaper)
- `/ideate → /knowledge --share` (Approach to case study)
<!-- END EXACT OUTPUT -->

---

#### Pattern View: `--knowledge --patterns`

When invoked as `/workflows --knowledge --patterns`:

<!-- BEGIN EXACT OUTPUT -->
...

╔══════════════════════════════════════════════════════════════╗
║               KNOWLEDGE WORKFLOW PATTERNS                     ║
║               Q101 Framework v2.12.20                         ║
╚══════════════════════════════════════════════════════════════╝

>

## Knowledge Patterns (4):

| Pattern | Flag | Description | Modes | Duration |
|---------|------|-------------|-------|----------|
| Teach | `--teach` | Educational content | training, howto, help | 15-30 min |
| Publish | `--publish` | Publication content | book, whitepaper, index | 30-60 min |
| Share | `--share` | Community content | post, quotes, about | 10-20 min |
| Comprehensive | `--comprehensive` | Full catalog | All 13 @agentQ modes | 1-2 hr |

>

### Teach Pattern (`--teach`)

**Purpose:** Create training materials, workshops, and tutorials.

>

**When to Use:**
- Onboarding new developers
- Internal training programs
- Community workshops
- Technical skill-building

**What It Does:**
1. Mode 1: --training (workshop materials)
2. Mode 2: --howto (step-by-step tutorials)
3. Mode 3: --help (reference documentation)

**Best For:** Educational content for learners at all levels

---

### Publish Pattern (`--publish`)

**Purpose:** Create publication-ready books, whitepapers, technical content.

>

**When to Use:**
- Technical books
- Academic papers
- Enterprise documentation
- Authority-building content

**What It Does:**
1. Mode 1: --book (publication chapters)
2. Mode 2: --whitepaper (technical whitepapers)
3. Mode 3: --index (framework catalogs)

**Best For:** Professional publication and thought leadership

---

### Share Pattern (`--share`)

**Purpose:** Create social media content, blog posts, community engagement.

>

**When to Use:**
- Social media marketing
- Community building
- Brand awareness
- Developer relations

**What It Does:**
1. Mode 1: --post (social media threads)
2. Mode 2: --quotes (shareable wisdom)
3. Mode 3: --about (origin/success stories)

**Best For:** Community engagement and growth

---

### Comprehensive Pattern (`--comprehensive`)

**Purpose:** Generate complete knowledge catalog across all 13 @agentQ modes.

>

**When to Use:**
- Framework documentation
- Product launches
- Knowledge base creation
- Archive generation

**What It Does:**
All 13 @agentQ modes executed in sequence:
1. --assistant (Q&A)
2. --book (chapters)
3. --training (workshops)
4. --index (catalogs)
5. --compare (comparisons)
6. --quotes (wisdom)
7. --post (social)
8. --whitepaper (technical)
9. --howto (tutorials)
10. --philosophy (deep dives)
11. --help (reference)
12. --about (origin stories)
13. --framework (methodology docs)

**Best For:** Complete content library generation
<!-- END EXACT OUTPUT -->

---

## Begin Execution

**Parse the command arguments and display the appropriate output:**

1. If no arguments → Display table view with 10 primary workflows + 14 cross-workflow patterns
2. If `--patterns` alone → Display all patterns quick reference (48 patterns with names, flags, descriptions)
3. If `--{name}` provided → Display that workflow's diagram and extended explanation
4. If `--{name} --patterns` provided → Display that workflow's pattern table with extended explanations
5. If invalid flag → Show error and suggest `/workflows` for list
