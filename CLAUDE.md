## ═══════════════════════════════════════════
## GOALGETTER PROJECT — LOCKED INSTRUCTIONS
## These rules override all defaults. Always.
## ═══════════════════════════════════════════

### 1. AI Model — ALWAYS Haiku

Every Anthropic API call in this codebase MUST use `claude-haiku-4-5-20251001`.
- Never suggest or switch to Sonnet or Opus in application code
- This applies to: summaries, chat, analysis, weekly reports, assessments — everything
- When writing new AI features, default to Haiku without asking

### 2. Agent Dispatch — USE ALL AGENTS FIRST

Before writing any non-trivial code yourself, dispatch to the local agent fleet:

| Task | Agent |
|------|-------|
| New components, features, server actions | **Builder** (port 50001) |
| Research, analysis, comparisons, documentation | **Researcher** (port 50002) |
| Docker, shell, infrastructure, monitoring | **Operator** (port 50003) |

- Dispatch multiple agents **in parallel** for independent tasks
- Only write code yourself when: agent output scores < 50%, task needs >8K context, or multi-file coordination is required
- Always review and fix agent output before writing to disk (named exports, theme colors, error handling)

### 3. Trigger Words — INSTANT AUTONOMOUS MODE

When the user says **"right"** or **"auto"** (anywhere in their message):
- Activate full autonomous execution immediately — no confirmation, no clarifying questions
- Deep dive think first (explore approaches, consider edge cases, pick the most elegant solution)
- Dispatch to all relevant agents in parallel
- Execute everything end-to-end and report when done
- Use Haiku for all AI calls, named exports, theme-aware colors, proper error handling

These words mean: *"I trust you, just do it."*

### 4. Innovation Thinking — DEEP DIVE BEFORE CODE

For any new feature, improvement, or architectural decision:
- **Think deeply first** — explore multiple approaches, consider edge cases, evaluate trade-offs
- Ask: "What's the most elegant solution?" before reaching for the obvious one
- Consider the coaching methodology context (GROW, SMARTER, LEAP 99) in every AI feature
- Propose the innovative angle, not just the functional one
- Only then dispatch to agents or write code

---

## Q101 Agentic Framework

This project uses the Q101 Agentic Coding Framework for AI-assisted development.

### CRITICAL: Q101 Commands Are NOT Skills (Read This First)

**NEVER use the Skill tool for Q101 slash commands**, even if they appear in `<available_skills>`. Claude Code auto-discovers commands and lists them as "managed" skills, but they must be invoked by reading the command file directly.

**Commands to NEVER invoke via Skill tool:**
- discover, hackathon, ideate, research, initialize, generate, execute, autonomous
- prepare, evaluate, iterate, secure, activate
- analyze, commands, agents, workflows, skills, utilities

**Correct:** `Read .claude/commands/{name}.md`
**Wrong:** `Skill({name})`

### Framework Version

**Canonical Version Source:** `.claude/commands/VERSION.json`

When asked for the current framework version, always read this file for the authoritative version number. Do not rely on version numbers in other files as they may be outdated.

Current version can be retrieved with: `Read .claude/commands/VERSION.json` and check the `"version"` field.

### Available Commands

#### Discovery Workflow Commands
| Command | Description |
|---------|-------------|
| `/discover` | Browse Anthropic examples (delegates to /cookbooks or /quickstarts) |
| `/cookbooks` | Browse Anthropic Cookbook examples (87+ recipes) |
| `/quickstarts` | Browse Anthropic Quickstarts (5 production examples) |

#### Prototyping Workflow Commands
| Command | Description |
|---------|-------------|
| `/hackathon` | Rapid MVP building — autonomous or phase-by-phase (lightning/standard/polish modes) |
| `/hackatest` | Automated QA testing with dual engines (Playwright + Computer Use) |
| `/hackafeed` | Iterative improvement based on test results (F.E.E.D.B.A.C.K. loop) |

#### Ideation Workflow Commands
| Command | Description |
|---------|-------------|
| `/ideate` | Guided brainstorming for project ideas with auto-enabled superpowers |
| `/research` | Evidence-based research with citations, sources, and confidence scoring |
| `/knowledge` | Content generation with continuous learning (S.C.O.P.E. framework) |

#### Development Workflow Commands
| Command | Description |
|---------|-------------|
| `/initialize` | Research input artifacts and clarify requirements before PRD/PRP generation |
| `/generate` | Generate PRD.md and PRP.md documents from project context |
| `/execute` | Build application using multi-agent orchestration (requires PRD.md & PRP.md) |
| `/autonomous` | Long-running autonomous coding sessions with feature-by-feature checkpointing |
| `/prepare` | Prepare application environment (install deps, configure .env) |
| `/evaluate` | Evaluate application quality (health checks, API tests, test suites) |
| `/iterate` | Fix issues from evaluation and add new features iteratively |
| `/secure` | Security assessment and remediation (required for production) |
| `/activate` | Multi-environment deployment (development/staging/production) |

#### Analysis Workflow Commands
| Command | Description |
|---------|-------------|
| `/analyze` | Deep codebase analysis with 5 specialized agents (standalone, no PRD/PRP required) |

#### Help & Reference Commands
| Command | Description |
|---------|-------------|
| `/commands` | Show table of all commands, or `--{name}` for detailed banner |
| `/agents` | Show table of all agents, or `--{name}` for detailed banner |
| `/workflows` | Show table of all workflows, or `--{name}` for detailed diagram |
| `/skills` | Show table of all agent skills, or `--{name}` for details |
| `/utilities` | Show framework utilities reference |
| `/banners` | Banner showcase for testing and experimentation |
| `/Q101` | Guided framework tour |
| `/agentQ` | Access @agentQ wisdom modes (12 content generation modes) |

#### Utility Commands (v2.12.28)
| Command | Description |
|---------|-------------|
| `/utilities --install` | Deploy Q101 Framework to target project |
| `/utilities --update` | Update single installation to latest version |
| `/utilities --update-all` | Batch update all registered installations |
| `/utilities --verify` | Verify installation integrity |
| `/utilities --repair` | Restore missing or corrupted files |
| `/utilities --rollback` | Restore previous framework version |
| `/utilities --snapshot` | Create named version snapshots |
| `/utilities --backup` | Backup framework source (local/GitHub/full) |
| `/utilities --auto-backup` | Schedule automatic backups |
| `/utilities --push` | Push project file changes to framework source |
| `/utilities --merge` | Intelligent file merging |
| `/utilities --git` | Git workflow standards and validation |
| `/utilities --compare` | Compare two framework installations |
| `/utilities --consolidate` | Merge framework installations |
| `/utilities --installations` | View all registered installations |
| `/utilities --status` | Check installation status |
| `/utilities --changelog` | View version history |
| `/utilities --audit-docs` | Documentation compliance audit |
| `/utilities --audit-banners` | Banner consistency audit |

### Framework Agents

The framework includes **55 specialized AI agents** organized into five groups:

#### Ideation Agents (9) - Brainstorm Project Ideas
- **@ideation_facilitator** - Guide creative ideation through structured brainstorming
- **@research_analyst** - Evidence-based research with citations and confidence scoring
- **@methodology_advisor** - Brainstorming methodology selection and guidance
- **@user_analyst** - User research, persona development, and empathy mapping
- **@competitive_analyst** - Market landscape and competitive intelligence analysis
- **@feasibility_analyst** - Technical and market viability assessment
- **@trend_analyst** - Opportunity discovery and trend scouting
- **@commercial_analyst** - Value proposition and monetization strategy
- **@stakeholder_analyst** - Stakeholder mapping and alignment strategy

#### Development Agents (17) - Build New Applications
- **@orchestrator** - Master controller coordinating workflow
- **@scrum_master** - Sprint planning and agile process
- **@project_manager** - Task breakdown and tracking
- **@business_analyst** - PRD and user stories
- **@system_architect** - Architecture and PRP design
- **@process_expert** - Agentic process architecture design
- **@domain_expert** - PRP compliance and domain validation
- **@lead_developer** - Code implementation
- **@ux_designer** - UI/UX specifications
- **@test_architect** - Testing and QA
- **@devops_engineer** - Environment setup and evaluation
- **@security_expert** - Security vulnerability fixes
- **@autonomous_initializer** - Initialize autonomous coding sessions with feature lists
- **@autonomous_coder** - Feature-by-feature autonomous coding with verification
- **@performance_engineer** - Performance profiling and optimization
- **@data_architect** - Database design and data modeling
- **@integration_specialist** - Third-party API integrations

#### Analysis Agents (7) - Analyze Existing Code
- **@code_analyst** - Architecture analysis, complexity metrics, code smells
- **@quality_auditor** - Standards compliance, best practices, SOLID principles
- **@debug_specialist** - Bug detection, security vulnerabilities, edge cases
- **@doc_engineer** - Documentation gaps, README generation, type coverage
- **@refactor_specialist** - Refactoring planning, scope determination, behavior preservation
- **@accessibility_auditor** - WCAG compliance and accessibility testing
- **@technical_writer** - API docs, developer guides, and ADRs

#### Hackathon Agents (21) - Rapid MVP Building
- **@problem_agent** - Problem validation and research (PRIME)
- **@requirements_agent** - Feature generation and prioritization (PRIME)
- **@instruct_agent** - Context building and code patterns (PRIME)
- **@make_agent** - Code generation and TDD (PRIME)
- **@evaluate_agent** - Testing and quality verification (PRIME)
- Plus 16 sub-agents for design, build, document, and ideate phases

#### Framework Agents (1) - Framework Wisdom
- **@agentQ** - Framework Philosopher & Wisdom Custodian

### Framework Summary

| Framework | Used By | Components |
|-----------|---------|------------|
| **P.A.R.T.** | PRPs, Context | Prompt, Artifacts, Resources, Tools |
| **AGENT P.A.R.T.S.** | 55 Agents | Prompt, Artifacts, Resources, Tools, Skills |
| **S.C.O.P.E.** | Knowledge Workflow | Scope, Collect, Orchestrate, Produce, Export |
| **P.R.I.M.E.** | Hackathon | Problem, Requirements, Instruct, Make, Evaluate |
| **P.R.O.V.E.** | Hackatest | Prepare, Recognize, Observe, Verify, Export |
| **F.E.E.D.B.A.C.K.** | Hackafeed | Find, Examine, Engineer, Develop, Build, Assert, Commit, Kick |
| **UTILITY C.H.E.C.K.** | 19 Utilities | Context, Handling, Execution, Capabilities, Kickoff |
| **G.R.O.W.** | Coaching/Mentoring | Goal, Reality, Options, Way Forward |
| **S.C.A.M.P.E.R.** | Innovation | Substitute, Combine, Adapt, Modify, Put, Eliminate, Reverse |
| **5 Whys** | Root Cause Analysis | Why? (x5) to find root cause |
| **Unix Philosophy** | Command Design | Do one thing well, compose, simple |
| **TDD** | Testing | Red-Green-Refactor cycle |

### Silent & Autonomous Operations (Mandatory Procedure)

#### Core Principle: "The Slash Command IS the Approval"

When a user invokes ANY Q101 Framework slash command (`/execute`, `/prepare`, `/evaluate`, `/ideate`, etc.), they are **explicitly approving ALL operations** that command will perform. No further permission prompts should be required.

#### Rule
ALL Q101 Framework commands MUST operate **silently and autonomously** without prompting users for ANY approvals - including file edits, file writes, bash commands, and skill invocations.

#### Why
Prompting users with approval dialogs disrupts workflow continuity. A single command like `/prepare` could trigger 10-50+ permission prompts for mkdir, npm install, pip install, etc. **Zero interruptions** is the goal.

#### Implementation

**IMPORTANT:** Permissions must be configured at the **user level** (`~/.claude/settings.json`), not just the project level. Project-level settings may not be honored in all contexts (especially VSCode extension).

**Required: User-level settings** at `~/.claude/settings.json`:
```json
{
  "permissions": {
    "allow": [
      "Bash",
      "Glob",
      "Grep",
      "Read",
      "Edit(.claude/**)",
      "Write(.claude/**)",
      "Edit(**/skill-config.json)",
      "Write(**/skill-config.json)",
      "Write(*.md)",
      "Write(*.json)",
      "Write(*.docx)",
      "Write(*.pdf)",
      "Write(*.pptx)",
      "Write(**/.claude/**)",
      "Skill(brainstorming)",
      "Skill(brainstorming:*)",
      "Skill(docx)",
      "Skill(docx:*)",
      "Skill(pdf)",
      "Skill(pdf:*)",
      "Skill(pptx)",
      "Skill(pptx:*)"
    ]
  }
}
```

**Tool Permissions Explained:**
| Permission | Purpose |
|------------|---------|
| `Bash` | All shell commands (Windows/PowerShell) |
| `Glob` | File pattern search across all paths (for `/utilities --update-all`) |
| `Grep` | Content search across all paths |
| `Read` | Read files outside current workspace |

#### Why `"Bash"` Instead of Specific Patterns

**IMPORTANT:** Individual Bash patterns like `Bash(mkdir:*)` use **prefix matching** which is fragile and unreliable for complex commands. For example:
- `Bash(if exist:*)` does NOT match `if exist "path" (echo YES) else (echo NO)`
- `Bash(cp -r:*)` may not match `cp -r "source" "dest"` due to quote handling

**Solution:** Use `"Bash"` (without any pattern) to allow ALL bash commands. This is the only reliable way to achieve silent execution for Q101 Framework slash commands.

#### Permission Path Format (Critical)

Claude Code uses **gitignore-style** path patterns:

| Pattern | Meaning |
|---------|---------|
| `.claude/**` | All files in .claude directory (recursive) |
| `**/file` | Match file in any directory |
| `*.md` | Any markdown file in working directory |
| `Skill(name)` | Invoke skill by exact name |
| `Skill(name:*)` | Invoke skill with any arguments |
| `//c:/path/file` | **Absolute path** (note double slash prefix) |
| `c:\path\file` | ❌ WRONG - treated as relative, not absolute |

**Key insight:** Windows absolute paths require `//` prefix and forward slashes.

#### Setup Checklist

1. Create `~/.claude/settings.json` with the permissions above
2. **Restart Claude Code** after any settings change (settings don't reload mid-session)
3. Test by running `/ideate` - ALL operations should happen without approval prompts

#### Commands/Agents Affected

| Command/Agent | Superpower | Toggle Behavior |
|---------------|------------|-----------------|
| `/ideate` | brainstorming | Enable at start, restore at end |
| `/ideate --advisor` | brainstorming | Enable before diagnostic, restore at end |
| `@methodology_advisor` | brainstorming | Enable silently before banner display |
| `@ideation_facilitator` | brainstorming | Receives enabled state from handoff |
| Future commands | As needed | Silent toggle |

#### Execution Protocol

**DO:**
- Use Edit/Write tools directly on `.claude/context/skill-config.json`
- Capture original state before modification
- Restore original state at session end
- Display brief status message (e.g., "✅ Brainstorming enabled")

**DO NOT:**
- Show file edit approval dialogs
- Use AskUserQuestion for skill toggles
- Interrupt user flow with permission prompts
- Require user confirmation for skill state changes

#### Developer Note
When creating new commands that need to toggle superpowers:
1. Use Edit/Write tools on `.claude/context/skill-config.json`
2. Permissions are already configured - no user approval needed
3. Always capture original state before modification
4. Always restore previous state when session completes
5. Add STEP 0.1 (Silent Skill Activation) before any user-visible output

### CRITICAL: /autonomous Command - True Silent Execution (MANDATORY)

#### The Absolute Rule: NEVER STOP, NEVER ASK

When `/autonomous` is invoked, you MUST implement ALL features in feature-list.json until `features_remaining == 0` **WITHOUT ANY USER INTERVENTION**.

**YOU MUST:**
- Implement features continuously in a loop (one per session)
- Continue automatically from one feature to the next
- Run until ALL features pass OR session limit reached (standard mode only)
- NEVER stop between features
- NEVER ask "Should I continue?"
- NEVER ask "Would you like me to pause?"
- NEVER prompt for ANY confirmation between sessions
- NEVER offer options like "Continue or pause?"
- NEVER end your response asking what the user wants to do next

**YOU MUST NOT:**
- Ask questions about proceeding
- Stop after completing a single feature
- Wait for user input between sessions
- Display messages like "What would you like to do next?"
- Return control to user until ALL features complete (or session limit in standard mode)

**The Loop Is Internal:** The @autonomous_coder agent loops internally. After completing a feature checkpoint, it **immediately** continues to the next feature by looping back to STEP 1 (Session Orientation). There is NO handoff, NO pause, NO questions.

**Valid Stopping Points (ONLY THESE):**
1. **All features complete** (`features_remaining == 0` in feature-list.json)
2. **Session limit reached** (standard mode only, default 20 sessions - NOT applicable in `--full` mode)
3. **Unrecoverable error** requiring human intervention

**Why This Matters:**
Users invoke `/autonomous` specifically because they want the system to implement ALL features without interruption. This is the entire purpose of autonomous mode. Stopping and asking questions defeats the purpose and frustrates users who expect true autonomous execution.

**Mental Model:**
Think of `/autonomous` like a compiler or build system. When you run `npm build`, it doesn't stop after each file and ask "Should I compile the next file?" It runs to completion. `/autonomous` works the same way - it runs to completion without interruption.

### Plan Execution Standard (Single-Write Pattern)

When executing an approved plan with multiple file edits:

1. **Single-Write Pattern**: Read file once → Apply all changes in memory → Write once
2. **Avoid Multiple Edits**: Do NOT use separate Edit calls for each change in the same file
3. **One Approval**: User approves the plan, then execution proceeds without per-edit prompts

#### Why
Multiple Edit calls trigger multiple approval prompts, disrupting workflow. The single-Write pattern consolidates all changes into one operation.

#### How
1. Read the entire target file with Read tool
2. Apply all planned changes to the content in memory
3. Write the complete modified content back with a single Write tool call

This pattern applies when a plan requires 3+ edits to the same file.

### Banner First Execution Standard (MANDATORY)

**CRITICAL RULE:** When executing ANY Q101 Framework slash command, the banner text MUST be the FIRST thing displayed. No exceptions.

#### Mandatory Execution Order

| Order | Action | Tools Allowed |
|-------|--------|---------------|
| 1 | **Output banner text** | NONE - Pure text only |
| 2 | TodoWrite (track phases) | TodoWrite |
| 3 | Read files (if needed) | Read |
| 4 | Execute command phases | All tools |

#### Prohibited Actions Before Banner

- ❌ Reading VERSION.json (version is HARDCODED in banner template)
- ❌ Reading skill-config.json or any other file
- ❌ Calling TodoWrite to track progress
- ❌ Any tool call that appears in user's output before banner

#### Why This Matters

Users expect to see the command banner immediately when invoking a slash command. Showing "Read VERSION.json" or "Update Todos" before the banner breaks the visual flow and creates confusion.

#### Version Handling

**DO NOT read VERSION.json to get the version number.** Each command file has the version HARDCODED in its banner template (e.g., "Q101 Framework v2.10.5"). This ensures the banner displays instantly without file reads.

#### Banner Formatting Rules

All banners MUST use proper spacing:
- **TWO blank lines** after the banner table (before Purpose/first section)
- **TWO blank lines** between major sections
- **ONE blank line** between related items (e.g., Input and Output)
- **NO `#` markers** - Use actual blank lines, not markdown heading characters

#### Enforcement

This rule applies to ALL 14 commands:
- Ideation: /ideate
- Development: /initialize, /generate, /execute, /prepare, /evaluate, /iterate, /secure, /activate
- Analysis: /analyze
- Reference: /commands, /agents, /skills, /workflows, /utilities

#### Correct Pattern Example

```
[User runs /ideate]
[Assistant outputs banner text - NO tool calls visible]
[Then calls TodoWrite]
[Then calls Read for skill-config.json]
[Then outputs status message]
```

#### Incorrect Pattern (VIOLATION)

```
[User runs /ideate]
• Read c:\...\VERSION.json          ← WRONG: File read before banner
• Read c:\...\skill-config.json     ← WRONG: File read before banner
[Then banner displays]              ← TOO LATE
```

### Slash Commands vs Skills (MANDATORY)

**CRITICAL RULE:** Q101 Framework slash commands are NOT skills. Do NOT use the Skill tool to invoke them.

#### Commands (Do NOT use Skill tool)

These are **commands** defined in `.claude/commands/` - invoke them by reading their content directly:

| Command | Type | Invoke With |
|---------|------|-------------|
| `/ideate` | Workflow | Read `.claude/commands/ideate.md` |
| `/research` | Workflow | Read `.claude/commands/research.md` |
| `/initialize` | Workflow | Read `.claude/commands/initialize.md` |
| `/generate` | Workflow | Read `.claude/commands/generate.md` |
| `/execute` | Workflow | Read `.claude/commands/execute.md` |
| `/autonomous` | Workflow | Read `.claude/commands/autonomous.md` |
| `/prepare` | Workflow | Read `.claude/commands/prepare.md` |
| `/evaluate` | Workflow | Read `.claude/commands/evaluate.md` |
| `/iterate` | Workflow | Read `.claude/commands/iterate.md` |
| `/secure` | Workflow | Read `.claude/commands/secure.md` |
| `/activate` | Workflow | Read `.claude/commands/activate.md` |
| `/analyze` | Workflow | Read `.claude/commands/analyze.md` |
| `/commands` | Reference | Read `.claude/commands/commands.md` |
| `/agents` | Reference | Read `.claude/commands/agents.md` |
| `/workflows` | Reference | Read `.claude/commands/workflows.md` |
| `/skills` | Reference | Read `.claude/commands/skills.md` |
| `/utilities` | Reference | Read `.claude/commands/utilities.md` |

#### Skills (Use Skill tool)

These are **skills** defined in `.claude/skills/` - invoke them using the Skill tool:

| Skill | Purpose |
|-------|---------|
| `brainstorming` | Creative ideation superpower |
| `docx` | Word document generation |
| `pdf` | PDF document generation |
| `pptx` | PowerPoint generation |
| `xlsx` | Excel spreadsheet generation |

#### Why This Distinction Matters

Even if a command name appears in the `available_skills` list (due to auto-discovery), you MUST NOT use the Skill tool for Q101 slash commands. The Skill tool will be rejected, causing an ugly error message before the banner.

**Correct:** Read the command file directly, then output the banner
**Wrong:** Use Skill tool → get rejection → then read file

### EXACT OUTPUT Marker Interpretation (MANDATORY)

**CRITICAL RULE:** When command files contain `<!-- RENDER EXACTLY: ... -->` followed by `<!-- BEGIN EXACT OUTPUT -->` and `<!-- END EXACT OUTPUT -->` markers:

1. **RENDER EXACTLY directive** - This is an INSTRUCTION to you, NOT content to output
2. **BEGIN/END EXACT OUTPUT markers** - These are delimiters, NOT content to output
3. **Content between markers** - This is what you output to the user

#### What to Output vs What to Exclude

| EXCLUDE (Never Output These) | INCLUDE (Output to User) |
|------------------------------|--------------------------|
| `<!-- RENDER EXACTLY: ... -->` | Content between BEGIN and END markers |
| `<!-- BEGIN EXACT OUTPUT -->` | (but skip the `...` placeholder line) |
| `<!-- END EXACT OUTPUT -->` | |
| `...` (ellipsis placeholder line after BEGIN) | |

#### The RENDER EXACTLY Directive

When you see `<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->`:
- This tells you HOW to render the content that follows
- Copy the content EXACTLY as written (preserve formatting)
- Preserve `\` at end of lines (creates line breaks)
- Preserve `>` blockquotes (creates spacing)
- **Do NOT output the directive itself** - it's an instruction TO you, not content FOR users

#### Example

**In command file:**
```
<!-- RENDER EXACTLY: Copy verbatim. Preserve \ line breaks and > blockquotes. -->
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
|:--------------------------------------------------:|
| **/agents**                                        |
...content...
**Example:** `/agents --lead_developer`
<!-- END EXACT OUTPUT -->
```

**Correct output (what user sees):**
```

| ================================================== |
|:--------------------------------------------------:|
| **/agents**                                        |
...content...
**Example:** `/agents --lead_developer`
```

**WRONG output (showing markers - NEVER do this):**
```
<!-- BEGIN EXACT OUTPUT -->
...

| ================================================== |
```

#### Why This Matters

The markers and directives are **template instructions** for Claude, not content for users. Displaying them breaks the professional appearance of command output.

#### Enforcement

This rule applies to ALL command files in `.claude/commands/` that use these markers (18 files total).

#### Rendering Behavior (MANDATORY)

When outputting content from EXACT OUTPUT blocks:

1. **COPY CHARACTER-FOR-CHARACTER** - Do not interpret, summarize, or reformat
2. **PRESERVE `\` LINE CONTINUATIONS** - These create soft line breaks in markdown (e.g., `**Usage:**\` keeps Usage and Example on separate lines)
3. **PRESERVE `>` BLOCKQUOTES** - Empty `>` lines create visual spacing between sections
4. **NO ADDITIONS** - Do not add Related:, ---, horizontal lines, or any content after the END marker
5. **NO REMOVALS** - Do not skip any lines, characters, or formatting

**Example Footer (COPY EXACTLY AS WRITTEN):**
```
**Usage:** `/workflows --{name}` for workflow diagram\
**Patterns:** `/workflows --{name} --patterns` for pattern table\
**Example:** `/workflows --research --patterns`
```

The `\` at the end of each line creates a soft line break, keeping each item on its own line.

### Agent Skills

Pre-built skills for document generation are in the `.claude/skills/` folder:
- `docx/` - Generate Word documents (PRD, PRP, status reports)
- `xlsx/` - Generate Excel spreadsheets (test reports, metrics)
- `pdf/` - Generate PDF documents (security reports, documentation)

Agents can invoke these skills to export deliverables in professional document formats.

### Quick Start

#### Brainstorming Project Ideas (Optional)
1. Run `/ideate` to start guided brainstorming session
2. Answer questions one at a time to explore problem space
3. Review generated approaches and select preferred direction
4. Use `idea-context.md` as input for `/initialize`

#### Rapid MVP Building (Hackathon Mode)
1. Run `/hackathon` to start rapid MVP development
2. Choose quality mode (lightning/standard/polish)
3. Framework guides you through PRIME phases
4. Run `/hackatest` for automated QA testing
5. Run `/hackafeed` for iterative improvement

#### Building New Applications
1. Add your reference files to `reference/`
2. Run `/initialize` to research artifacts and clarify requirements
3. Run `/generate` to create PRD.md and PRP.md
4. Review and refine the generated documents
5. Run `/execute` to build your application
6. Run `/prepare` to install dependencies and configure environment
7. Run `/evaluate` to test and validate your application
8. Run `/iterate` to fix issues and add features
9. Run `/secure` for security assessment (required for production)
10. Run `/activate` to deploy to production

#### Analyzing Existing Codebases
1. Run `/analyze` to perform deep codebase analysis
2. Review ANALYSIS-REPORT.md with findings and recommendations
3. Choose which fixes to apply (prompted by command)

### Windows Command Standards (MANDATORY)

**CRITICAL:** When `Platform: win32` appears in the system prompt, NEVER use Unix/Linux commands.

#### Platform Detection Rule

The system prompt includes environment info like `Platform: win32`. When you see this:
- Use Windows-native commands (cmd.exe or PowerShell)
- Use Windows path format: `C:\Users\...`
- NEVER use WSL paths: `/mnt/c/Users/...`
- NEVER use Unix commands: `ls`, `cat`, `grep`, `find`, `head`, `tail`

#### Tool Preference Hierarchy (ALWAYS FOLLOW)

For file operations, ALWAYS prefer Claude Code's native tools over bash:

| Operation | 1st Choice (PREFERRED) | 2nd Choice (if needed) | NEVER USE |
|-----------|----------------------|----------------------|-------------|
| Read file content | **Read tool** | `Get-Content` | `cat`, `head`, `tail` |
| Search by filename | **Glob tool** | `Get-ChildItem -Recurse` | `find`, `locate`, `ls` |
| Search file content | **Grep tool** | `Select-String` | `grep`, `rg` |
| Edit file | **Edit tool** | - | `sed`, `awk` |
| Write file | **Write tool** | - | `echo >`, `cat <<EOF` |
| List directory | `dir` | `Get-ChildItem` | `ls`, `ls -la` |
| Check path exists | `Test-Path` | `if exist` | `[ -f file ]`, `[ -d dir ]` |

#### Command Translation Table

| Task | DO NOT USE (Unix) | USE INSTEAD (Windows) |
|------|---------------------|-------------------------|
| List files | `ls`, `ls -la` | `dir` or `Get-ChildItem` |
| List with details | `ls -la` | `dir` or `Get-ChildItem -Force` |
| Read file | `cat file` | **Read tool** or `Get-Content file` |
| First N lines | `head -20 file` | **Read tool with limit** or `Get-Content -First 20` |
| Last N lines | `tail -20 file` | `Get-Content -Tail 20` |
| Search files | `find . -name "*.ts"` | **Glob tool** with pattern `**/*.ts` |
| Search content | `grep pattern file` | **Grep tool** |
| Copy files | `cp src dest` | `Copy-Item src dest` |
| Copy recursive | `cp -r src dest` | `Copy-Item -Recurse src dest` |
| Move files | `mv src dest` | `Move-Item src dest` |
| Delete file | `rm file` | `Remove-Item file` or `del file` |
| Delete recursive | `rm -rf folder` | `Remove-Item -Recurse -Force folder` |
| Create directory | `mkdir -p path` | `New-Item -ItemType Directory -Force path` |
| Environment var | `echo $PATH` | `$env:PATH` or `echo %PATH%` |
| Null redirect | `> /dev/null` | `> NUL` or `\| Out-Null` |
| Check file exists | `[ -f file ]` | `Test-Path file` |
| Check dir exists | `[ -d dir ]` | `Test-Path dir -PathType Container` |

#### Path Format Rules

| Context | Correct Format | Example |
|---------|---------------|---------|
| Windows commands | Backslash | `C:\Users\Public\Claude` |
| PowerShell | Either works | `C:\Users\...` or `C:/Users/...` |
| Glob patterns | Forward slash | `**/*.ts` |
| Read/Write/Edit tools | Either works | `C:\path\file` or `C:/path/file` |

**FORBIDDEN - Never Use:**

| Wrong | Correct |
|----------|-----------|
| `/mnt/c/Users/...` | `C:\Users\...` |
| `/mnt/d/Projects/...` | `D:\Projects\...` |
| `~/Documents` | `$env:USERPROFILE\Documents` |
| `/dev/null` | `NUL` |
| `/tmp/` | `$env:TEMP\` |

#### Quick Decision Tree

```
Need to read a file?
  → Use Read tool (NOT cat, NOT head, NOT tail)

Need to find files by name pattern?
  → Use Glob tool (NOT find, NOT ls, NOT locate)

Need to search file contents?
  → Use Grep tool (NOT grep, NOT rg)

Need to list directory contents?
  → Use: dir "C:\path" (NOT ls, NOT ls -la)

Need to check if path exists?
  → Use: Test-Path "C:\path" (NOT [ -f file ])
```

### Git Workflow Standards (MANDATORY)

**Authoritative Guide:** [Q101-GIT-WORKFLOW-GUIDE.md](documents/Q101-GIT-WORKFLOW-GUIDE.md)

| Rule | Requirement |
|------|-------------|
| **Secrets** | NEVER commit `.env`, `settings.local.json`, API keys |
| **Commit Prefixes** | `Add:`, `Fix:`, `Refactor:`, `Docs:`, `Chore:` |
| **Branches** | `main` stable, `feature/<name>` for non-trivial work |
| **Structure** | Use `.gitkeep` for required empty directories |

**Validation:** Run `/utilities --git --check` before commits.

**Definition of Done:** Fresh clone preserves structure and contains NO secrets.

#### Commit Message Format

All commits MUST use one of these prefixes:

| Prefix | Usage |
|--------|-------|
| `Add:` | New feature or file |
| `Fix:` | Bug fix |
| `Refactor:` | Code restructuring |
| `Docs:` | Documentation changes |
| `Chore:` | Maintenance tasks |

#### Secret Detection Patterns

NEVER commit files matching these patterns:

| Pattern | Description |
|---------|-------------|
| `.env`, `.env.*` | Environment files |
| `settings.local.json` | Local settings overrides |
| `credentials.json`, `secrets.json` | Credential files |
| `*.key`, `*.pem`, `*.p12` | Private keys, certificates |

#### Mandatory Workflow Checklist

| Phase | Actions |
|-------|---------|
| **Start** | `git status` → confirm branch → feature branch if non-trivial |
| **During** | Update `.gitignore` → add `.gitkeep` → prefer `.example` files |
| **Before Commit** | `git diff` → no secrets → atomic commits → correct prefix |
| **End** | `git status` clean → summarize commits |
