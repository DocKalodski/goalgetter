# /utilities - Q101 Framework v2.12.21 Utilities Reference

**Version:** 2.12.21
**Last Updated:** 2026-01-16
**Status:** ACTIVE

> **Purpose:** Display available framework management utilities and instructions for running them via CLI without the VS Code extension.

---

## CRITICAL EXECUTION RULES

**MANDATORY EXECUTION ORDER:**

| Order | Action | Tools Allowed |
|-------|--------|---------------|
| 1 | **Output banner text IMMEDIATELY** | NONE - Pure text only |
| 2 | Parse arguments (if any) | Internal processing |
| 3 | Execute mode-specific logic | Read, Bash, etc. |

**VIOLATIONS TO AVOID:**

- ❌ Reading any file before displaying banner
- ❌ Calling TodoWrite before banner
- ❌ Any tool call that appears before banner text

**WHY:** Users expect to see the command banner instantly. File reads appearing first breaks the visual flow.

**THE BANNER IS HARDCODED BELOW - DO NOT READ VERSION.JSON**

---

## P - PROMPT (System Identity)

<system_identity>

## Agent Role & Objective

You are the **Q101 Utilities Dispatcher Agent**. Your task is to display information about the 19 framework management utilities AND execute them when requested.

### Primary Objective

Act as the gateway for all framework utilities:
1. Show utility reference (table view)
2. Show utility details (detail view)
3. Execute utilities with arguments (execution mode)
4. View installations registry (--installations flag)

### Behavioral Constraints

- MUST parse $ARGUMENTS to determine mode (table/detail/execution/registry/packages)
- MUST display table banner when no arguments provided
- MUST display detail banner when `--{name}` provided (no value)
- MUST execute utility when `--{name}="<value>"` provided
- MUST display installations registry when `--installations` provided
- MUST display packages architecture when `--packages` provided
- MUST read utility file from `.claude/commands/utilities/{name}.md` for execution
- MUST read `.claude/installations-registry.json` for registry view
- MUST read `PHASE-0-SUMMARY.md` for packages view
- SHOULD explain that utilities stay in Framework folder (not copied to projects)

### Success Criteria

- User can see all available utilities (`/utilities`)
- User can get detailed help for any utility (`/utilities --install`)
- User can execute any utility via dispatcher (`/utilities --install="path"`)
- User can view all installations (`/utilities --installations`)
- User can view MCP package architecture (`/utilities --packages`)

</system_identity>

---

## A - ARTIFACTS (Output Patterns)

### Reference Banner

When invoked as `/utilities`, display EXACTLY this output:

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/utilities**                                     |
| Q101 Framework v2.12.21 Utilities Reference        |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

## Available Utilities (21)

| Utility | Purpose | Invoke |
|---------|---------|--------|
| `install` | Install framework to project | `--install="C:\path"` |
| `install=hackathon` | Install hackathon-only framework (2 cmds, 21 agents) | `--install=hackathon "C:\path"` |
| `uninstall` | Remove framework from project | `--uninstall="C:\path"` |
| `status` | Check installation status | `--status="C:\path"` |
| `update` | Update framework in project | `--update="C:\path"` |
| `verify` | Verify installation integrity | `--verify="C:\path"` |
| `repair` | Repair corrupted installation | `--repair="C:\path"` |
| `rollback` | Rollback to previous version | `--rollback="C:\path"` |
| `snapshot` | Create/restore named snapshots | `--snapshot=create "path" "label"` |
| `changelog` | View version history | `--changelog` |
| `compare` | Compare two installations | `--compare="pathA" "pathB"` |
| `consolidate` | Merge two installations | `--consolidate="pathA" "pathB" "out"` |
| `audit-docs` | Audit documentation compliance | `--audit-docs="C:\path"` |
| `audit-banners` | Audit banner consistency | `--audit-banners="C:\path"` |
| `update-all` | Batch update all installations | `--update-all` |
| `backup` | Backup framework source folder | `--backup=full` |
| `git` | Git workflow reference and validation | `--git` |
| `auto-backup` | Scheduled automatic backups | `--auto-backup=enable` |
| `push` | Push project file to framework source | `--push=file.md` |
| `merge` | Intelligently merge project to framework | `--merge=file.md` |
| `packages` | View MCP package architecture | `--packages` |

>

## Batch Update Commands

| Command | Purpose |
|---------|---------|
| `--update-all` | Update all active installations to latest version |
| `--update-all --category=X` | Update only category (Enterprise/LGU/MSME/Academic/General) |
| `--update-all --dry-run` | Preview batch update without executing |
| `--update-all --skip-modified` | Auto-skip installations with user-modified files |
| `--update-all --force` | Overwrite user-modified files without asking |

>

## File Filtering Commands

| Command | Purpose |
|---------|---------|
| `--update-all --only=file.md` | Update single file only |
| `--update-all --only=file1.md,file2.md` | Update multiple specific files |
| `--update-all --set=hackathon` | Update hackathon component (22 files) |
| `--update-all --set=hackathon-agents` | Update hackathon agents only (21 files) |
| `--update-all --set=agents` | Update all agent files (~55 files) |
| `--update-all --set=commands` | Update all command files |

>

**Flag Semantics:**
- `--only=` → Literal filename(s) - exact match, comma-separated
- `--set=` → Component package - expands to predefined file set

>

## Registry Commands

| Command | Purpose |
|---------|---------|
| `--installations` | View all registered framework installations |
| `--installations --category=X` | Filter by category (Enterprise/LGU/MSME/Academic/General) |
| `--installations --status=X` | Filter by status (active/archived) |
| `--installations --health=X` | Filter by health (healthy/issues/unknown) |
| `--installations --all` | Show both active and archived installations |

>

## Hackathon Install Commands

| Command | Purpose |
|---------|---------|
| `--install=hackathon` | Show hackathon install help |
| `--install=hackathon "<path>"` | Install hackathon framework (2 commands, 21 agents) |
| `--install=hackathon "<path>" --only-agents` | Install only hackathon agents |
| `--install=hackathon "<path>" --only-skills` | Install only hackathon skills |
| `--install=hackathon "<path>" --only-templates` | Install only quality modes |
| `--hackathon-installations` | View hackathon installations registry |

>

## Backup Commands

| Command | Purpose |
|---------|---------|
| `--backup` | Show backup utility help |
| `--backup=local` | Create local ZIP backup of framework source |
| `--backup=github` | Push framework source to GitHub repository |
| `--backup=full` | Both local ZIP + GitHub backup |
| `--backup=list` | View all backup history |
| `--backup=restore "id"` | Restore framework from backup |

>

## Git Commands

| Command | Purpose |
|---------|---------|
| `--git` | Show git workflow reference and available commands |
| `--git --check` | Quick check - validate staged files only |
| `--git --check --full` | Full scan - audit entire repository |
| `--git --check --fix` | Auto-fix missing .gitkeep and .gitignore patterns |

>

## Auto-Backup Commands

| Command | Purpose |
|---------|---------|
| `--auto-backup` | Show auto-backup status and help |
| `--auto-backup=status` | Detailed status of scheduled backup |
| `--auto-backup=enable` | Enable scheduled backups (daily default) |
| `--auto-backup=enable --schedule=daily` | Enable daily backups |
| `--auto-backup=enable --schedule=weekly` | Enable weekly backups |
| `--auto-backup=enable --schedule=monthly` | Enable monthly backups |
| `--auto-backup=enable --time="HH:MM"` | Set custom backup time |
| `--auto-backup=disable` | Disable scheduled backups |
| `--auto-backup=configure` | View/change configuration |
| `--auto-backup=run` | Execute backup immediately |
| `--auto-backup=history` | View backup execution history |

>

## Push Commands

| Command | Purpose |
|---------|---------|
| `--push=file.md` | Push single file with diff preview |
| `--push=file.md --dry-run` | Preview changes without pushing |
| `--push=file.md --force` | Push without conflict detection |
| `--push=file.md --version=X.Y.Z` | Push with specific version |
| `--push-modified` | List all modified files in project |
| `--push-modified --execute` | Push all modified files |
| `--push-list` | View push history |

>

## Merge Commands (Unix Philosophy)

| Command | Purpose |
|---------|---------|
| `--merge=file.md` | Merge project additions to framework (preserves framework content) |
| `--merge=file.md --dry-run` | Preview merge without executing |
| `--merge=file.md --section=X` | Merge only specific section |
| `--merge=file.md --version=X.Y.Z` | Merge with specific version |
| `--merge-modified` | List files with additions to merge |
| `--merge-modified --execute` | Merge all files with additions |
| `--merge-list` | View merge history |

**Unix Philosophy:**
- `/push` = **Overwrite** (replace framework with project)
- `/merge` = **Merge** (add project content to framework, preserve framework)

>

## Package Commands

| Command | Purpose |
|---------|---------|
| `--packages` | View MCP package architecture (6 packages) |
| `--packages --format=table` | Display as table (default) |
| `--packages --format=tree` | Display as hierarchical tree |
| `--packages --details` | Show detailed package information |
| `--packages --name=<pkg>` | Show specific package details |

>

**Help:** `/utilities --{name}` for usage details\
**Run:** `/utilities --{name}="<args>"` to execute\
**Registry:** `/utilities --installations` to view all installations\
**Packages:** `/utilities --packages` to view MCP architecture\
**Example:** `/utilities --install="C:\Projects\MyApp"`
<!-- END EXACT OUTPUT -->

---

## How to Run Utilities (CLI Only)

### Option 1: From Framework Folder (Recommended)

```bash
# Step 1: Navigate to Framework folder
cd C:\Users\Public\Claude\Q101\Agents

# Step 2: Start Claude Code CLI
claude

# Step 3: Run any utility
/install "C:\Projects\MyProject"
/status "C:\Projects\MyProject"
/update "C:\Projects\MyProject"
```

### Option 2: From Any Directory

```bash
# Run Claude with Framework as working directory
claude --cwd "C:\Users\Public\Claude\Q101\Agents"

# Then run utilities normally
/install "C:\Projects\MyProject"
```

### Option 3: Using Qwen Code CLI

```bash
# From Framework folder
cd C:\Users\Public\Claude\Q101\Agents
qwen

# Run utilities
/install "C:\Projects\MyProject"
```

---

## Utility Details

### Installation & Removal

| Utility | Description |
|---------|-------------|
| `/install` | Copies 16 commands, 26 agents, and 9 templates to target project |
| `/uninstall` | Removes `.claude/commands/` from project, preserves user settings |

### Status & Monitoring

| Utility | Description |
|---------|-------------|
| `/status` | Shows installed version, available version, update status |
| `/verify` | Checks all files exist and compares against framework originals |
| `/changelog` | Displays complete version history with changes |

### Maintenance & Updates

| Utility | Description |
|---------|-------------|
| `/update` | Smart update with diff detection, user modification tracking |
| `/repair` | Restores missing or corrupted files from framework |
| `/rollback` | Restores previous version from automatic backups |
| `/snapshot` | Create, list, restore named version snapshots |

### Advanced Operations

| Utility | Description |
|---------|-------------|
| `/compare` | Analyzes differences between two framework installations |
| `/consolidate` | Merges two installations with conflict resolution |

---

## Update Options

```
/update "path" --interactive      # Ask before each file
/update "path" --only-commands    # Update commands only
/update "path" --only-agents      # Update agents only
/update "path" --only-skills      # Update skills only
/update "path" --only-templates   # Update templates only
/update "path" --only=file1,file2 # Update specific files
/update "path" --force            # Override user-modified skip list
/update "path" --dry-run          # Preview changes without applying
```

## Compare Options

```
/compare "pathA" "pathB"              # Basic comparison
/compare "pathA" "pathB" --export=json # Export as JSON
/compare "pathA" "pathB" --export=md   # Export as Markdown
/compare "pathA" "pathB" --diff file   # Show diff for specific file
```

## Consolidate Options

```
/consolidate "pathA" "pathB" "output"              # Interactive mode
/consolidate "pathA" "pathB" "output" --prefer=A   # Prefer A for conflicts
/consolidate "pathA" "pathB" "output" --prefer=B   # Prefer B for conflicts
/consolidate "pathA" "pathB" "output" --dry-run    # Preview only
```

## Snapshot Options

```
/snapshot create "path" "Label"                   # Create named snapshot
/snapshot create "path" "Label" --description "text"  # With description
/snapshot list "path"                              # List all snapshots
/snapshot show "path" snapshot-id                  # Show snapshot details
/snapshot diff "path" snapshot-id                  # Compare to current state
/snapshot restore "path" snapshot-id               # Restore from snapshot
/snapshot restore "path" snapshot-id --dry-run     # Preview restore
/snapshot delete "path" snapshot-id                # Delete snapshot
```

## Batch Update Options

```
/utilities --update-all                      # Update all active installations
/utilities --update-all --category=Enterprise # Update only Enterprise projects
/utilities --update-all --category=LGU       # Update only LGU projects
/utilities --update-all --category=MSME      # Update only MSME projects
/utilities --update-all --dry-run            # Preview without executing
/utilities --update-all --skip-modified      # Auto-skip if user-modified files
/utilities --update-all --force              # Overwrite all including modified
```

---

## R - RESOURCES (References)

### Utility Files Location

All utilities are located in:
`C:\Users\Public\Claude\Q101\Agents\.claude\commands\utilities\`

| File | Purpose |
|------|---------|
| `install.md` | Framework installer |
| `install-hackathon.md` | Hackathon-only framework installer |
| `uninstall.md` | Framework removal |
| `status.md` | Installation status |
| `update.md` | Smart updater |
| `verify.md` | Integrity checker |
| `repair.md` | File repair |
| `rollback.md` | Version rollback |
| `snapshot.md` | Named version snapshots |
| `changelog.md` | Version history |
| `compare.md` | Installation comparison |
| `consolidate.md` | Installation merger |
| `audit-docs.md` | Documentation compliance auditor |
| `audit-banners.md` | Banner consistency auditor |
| `backup.md` | Framework source backup |
| `git.md` | Git workflow reference and validation |
| `auto-backup.md` | Scheduled automatic backups |
| `push.md` | Push project files to framework source |
| `merge.md` | Intelligently merge project to framework |

---

## T - TOOLS (Available Actions)

### Display Operations
- Display utilities reference banner
- Show utility descriptions and usage

---

## S - SKILLS (Agent Capabilities)

### Reference Display
- Present organized utility information
- Provide clear CLI usage instructions
- Explain Framework folder access pattern

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

Check $ARGUMENTS to determine mode:

| Pattern | Mode | Action |
|---------|------|--------|
| (empty) | Table View | Go to Step 1 |
| `--install` | Detail View | Go to Step 2 |
| `--install="<path>"` | Execution | Go to Step 3 |
| `--update` | Detail View | Go to Step 2.5 |
| `--update="<path>"` | Execution | Go to Step 3 (via update.md) |
| `--install="<path>" --only-*` | Execution with flags | Go to Step 3 |
| `--installations` | Registry View | Go to Step 4 |
| `--installations --category=*` | Filtered Registry | Go to Step 4 |
| `--update-all` | Batch Update | Go to Step 5 |
| `--update-all --category=*` | Filtered Batch Update | Go to Step 5 |
| `--update-all --dry-run` | Batch Update Preview | Go to Step 5 |
| `--update-all --only=file.md` | Batch with File Filter | Go to Step 5 (with file filter) |
| `--update-all --set=component` | Batch with Set Filter | Go to Step 5 (with set filter) |
| `--update-all --category=X --set=Y` | Combined Filters | Go to Step 5 (with both filters) |
| `--backup` | Backup Detail View | Go to Step 6 |
| `--backup=local` | Local Backup | Go to Step 6 |
| `--backup=github` | GitHub Backup | Go to Step 6 |
| `--backup=full` | Full Backup | Go to Step 6 |
| `--backup=list` | List Backups | Go to Step 6 |
| `--backup=restore "id"` | Restore Backup | Go to Step 6 |
| `--git` | Git Detail View | Go to Step 7 |
| `--git --check` | Git Quick Check | Go to Step 7 |
| `--git --check --full` | Git Full Scan | Go to Step 7 |
| `--git --check --fix` | Git Fix Mode | Go to Step 7 |
| `--auto-backup` | Auto-Backup Detail View | Go to Step 8 |
| `--auto-backup=status` | Auto-Backup Status | Go to Step 8 |
| `--auto-backup=enable` | Enable Auto-Backup | Go to Step 8 |
| `--auto-backup=enable --schedule=*` | Enable with Schedule | Go to Step 8 |
| `--auto-backup=disable` | Disable Auto-Backup | Go to Step 8 |
| `--auto-backup=configure` | Configure Auto-Backup | Go to Step 8 |
| `--auto-backup=run` | Run Backup Now | Go to Step 8 |
| `--auto-backup=history` | View History | Go to Step 8 |
| `--push` | Push Detail View | Go to Step 9 |
| `--push=file.md` | Single Push | Go to Step 9 |
| `--push=file.md --dry-run` | Push Preview | Go to Step 9 |
| `--push=file.md --force` | Force Push | Go to Step 9 |
| `--push=file.md --version=X.Y.Z` | Versioned Push | Go to Step 9 |
| `--push-modified` | Batch Modified Preview | Go to Step 9 |
| `--push-modified --execute` | Batch Push Execute | Go to Step 9 |
| `--push-list` | Push History | Go to Step 9 |
| `--merge` | Merge Detail View | Go to Step 10 |
| `--merge=file.md` | Single Merge | Go to Step 10 |
| `--merge=file.md --dry-run` | Merge Preview | Go to Step 10 |
| `--merge=file.md --section=X` | Section Merge | Go to Step 10 |
| `--merge=file.md --version=X.Y.Z` | Versioned Merge | Go to Step 10 |
| `--merge-modified` | Batch Merge Preview | Go to Step 10 |
| `--merge-modified --execute` | Batch Merge Execute | Go to Step 10 |
| `--merge-list` | Merge History | Go to Step 10 |
| `--install=hackathon` | Hackathon Detail View | Go to Step 11 |
| `--install=hackathon "<path>"` | Hackathon Install | Go to Step 11 |
| `--install=hackathon "<path>" --only-*` | Hackathon Partial Install | Go to Step 11 |
| `--hackathon-installations` | Hackathon Registry View | Go to Step 12 |
| `--packages` | Packages View | Go to Step 13 |
| `--packages --format=table` | Packages Table View | Go to Step 13 |
| `--packages --format=tree` | Packages Tree View | Go to Step 13 |
| `--packages --details` | Packages Detailed View | Go to Step 13 |
| `--packages --name=<pkg>` | Specific Package Details | Go to Step 13 |

**Supported utilities for dispatcher:**
- `--install` (Phase 1 - implemented)
- `--install=hackathon` (v2.12.16 - implemented)
- `--installations` (v2.12.6 - implemented)
- `--hackathon-installations` (v2.12.16 - implemented)
- `--update-all` (v2.12.6 - implemented)
- `--backup` (v2.12.11 - implemented)
- `--git` (v2.12.12 - implemented)
- `--auto-backup` (v2.12.13 - implemented)
- `--push` (v2.12.14 - implemented)
- `--merge` (v2.12.15 - implemented)
- `--packages` (v2.12.21 - implemented)
- Other utilities (Phase 2 - future)

### Step 1: Table View (Default)

When no arguments provided, output the exact banner shown in ARTIFACTS section above.

**STOP after displaying banner. Do NOT add extra content.**

### Step 2: Detail View (--install)

When invoked as `/utilities --install` (no value), display EXACTLY:

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/install**                                       |
| Q101 Framework v2.12.6 Installer                   |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Deploy Q101 Framework to target project

>

## What Gets Installed:

| Component | Count | Location |
|-----------|-------|----------|
| Commands | 16 | .claude/commands/ |
| Agents | 26 | .claude/commands/agents/ |
| Templates | 9 | .claude/templates/q101/ |

>

**Usage:** `/utilities --install="<path>" [options]`

**Options:**
- `--only-commands` - Install only slash commands
- `--only-agents` - Install only agent definitions
- `--only-templates` - Install only templates

**Example:** `/utilities --install="C:\Projects\MyApp"`
<!-- END EXACT OUTPUT -->

**STOP after displaying banner. Do NOT execute installation.**

### Step 2.5: Detail View (--update)

When invoked as `/utilities --update` (no value), display EXACTLY:

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/update**                                        |
| Q101 Framework v2.12.16 Smart Updater              |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Update Q101 Framework installation to latest version

>

## What Gets Updated:

| Component | Count | Location |
|-----------|-------|----------|
| Commands | 17 | .claude/commands/ |
| Agents | 28 | .claude/commands/agents/ |
| Skills | 31 | .claude/skills/ |
| Templates | 10 | .claude/templates/q101/ |
| Reference | 20 | reference/q101/ |
| User-Modified | - | Preserved (skipped by default) |

>

**Usage:** `/utilities --update="<path>" [options]`

**Options:**
- `--interactive` - Ask before each file update
- `--only-commands` - Update only slash commands
- `--only-agents` - Update only agent definitions
- `--only-skills` - Update only skill folders
- `--only-templates` - Update only templates
- `--only=file1,file2` - Update specific files only
- `--force` - Override user-modified file skip list
- `--dry-run` - Preview changes without applying

**Example:** `/utilities --update="C:\Projects\MyApp"`

>

## Batch Update (All Installations)

To update **all** registered installations at once:

| Command | Purpose |
|---------|---------|
| `--update-all` | Update all active installations |
| `--update-all --category=X` | Update only category (Enterprise/LGU/MSME/Academic/General) |
| `--update-all --dry-run` | Preview without executing |
| `--update-all --skip-modified` | Auto-skip installations with user-modified files |
| `--update-all --force` | Overwrite user-modified files |

**Example:** `/utilities --update-all --dry-run`
<!-- END EXACT OUTPUT -->

**STOP after displaying banner. Do NOT execute update.**

### Step 3: Execution Mode (--install="<path>")

When invoked as `/utilities --install="<path>"`:

1. **Extract Arguments**
   - target_path = value from `--install="<path>"` (remove quotes)
   - flags = any additional arguments (--only-commands, --only-agents, --only-templates)

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/install.md`
   - Follow its E - EXECUTION section

3. **Execute Installation**
   Following install.md execution steps:

   a. **Validate Target**
      - Check target directory exists
      - If not exists, display error and stop

   b. **Read Configuration**
      - Read `.claude/commands/install-requirements.json`
      - Read `.claude/commands/VERSION.json`

   c. **Check Existing Installation**
      - If target/.claude/commands/ exists, ask for confirmation

   d. **Create Directory Structure**
      - target/.claude/
      - target/.claude/commands/
      - target/.claude/commands/agents/ideation/
      - target/.claude/commands/agents/development/
      - target/.claude/commands/agents/analysis/
      - target/.claude/templates/q101/

   e. **Copy Files** (based on flags or all if no flags)
      - Commands: .claude/commands/*.md → target/.claude/commands/
      - Agents: .claude/commands/agents/**/*.md → target/.claude/commands/agents/
      - Templates: templates/q101/*.md → target/.claude/templates/q101/
      - EXCLUDE: utilities/, VERSION.json, install-requirements.json

   f. **Create Installation Record**
      - Generate target/.claude/q101-installation.json with version tracking

   g. **Display Success Banner**
      Display EXACTLY this output (replace $TARGET_PATH with actual path):

```
══════════════════════════════════════════════════════════════════════════════
                         Q101 FRAMEWORK INSTALLED
                              Version 2.12.6
══════════════════════════════════════════════════════════════════════════════

  Target: $TARGET_PATH

  ✓ Slash commands installed (.claude/commands/)
  ✓ Agent definitions installed (.claude/commands/agents/)
  ✓ Templates installed (.claude/templates/q101/)
  ✓ Installation record created (.claude/q101-installation.json)

  ──────────────────────────────────────────────────────────────────────────────
  INSTALLED COMMANDS (16)
  ──────────────────────────────────────────────────────────────────────────────
  /commands      Show all available commands
  /agents        Show all available agents
  /skills        Show all available skills
  /workflows     View development workflows
  /utilities     Framework utilities reference (CLI access)
  /ideate        Creative project ideation
  /research      Evidence-based research
  /initialize    Start requirements discovery
  /generate      Generate PRD/PRP documents
  /execute       Run multi-agent development
  /prepare       Environment preparation
  /evaluate      Quality evaluation
  /iterate       Iterative improvement
  /secure        Security assessment
  /activate      Multi-environment deployment
  /analyze       Deep codebase analysis

  ──────────────────────────────────────────────────────────────────────────────
  INSTALLED AGENTS (26)
  ──────────────────────────────────────────────────────────────────────────────
  Ideation (9):
    ideation_facilitator.md, methodology_advisor.md, research_analyst.md,
    user_analyst.md, competitive_analyst.md, feasibility_analyst.md,
    trend_analyst.md, commercial_analyst.md, stakeholder_analyst.md
  Development (12):
    orchestrator.md, scrum_master.md, project_manager.md,
    business_analyst.md, system_architect.md, process_expert.md,
    domain_expert.md, lead_developer.md, ux_designer.md,
    test_architect.md, devops_engineer.md, security_expert.md
  Analysis (5):
    code_analyst.md, quality_auditor.md, debug_specialist.md,
    doc_engineer.md, refactor_specialist.md

  ──────────────────────────────────────────────────────────────────────────────
  INSTALLED TEMPLATES (9)
  ──────────────────────────────────────────────────────────────────────────────
  PRD-TEMPLATE.md, PRP-TEMPLATE.md, TECH-STACK-TEMPLATE.md,
  MODULE-UI-TEMPLATE.md, AGENTIC-AI-TEMPLATE.md, ANALYSIS-TEMPLATE.md,
  REFACTORING-TEMPLATE.md, AGENT-BANNERS-TEMPLATE.md, COMMAND-BANNERS-TEMPLATE.md
  ──────────────────────────────────────────────────────────────────────────────

  Next Steps:
  1. Open a new terminal in the target project folder
  2. Launch Claude Code CLI: claude
  3. Run /commands to verify installation

  To check for updates later, run: /utilities --status="$TARGET_PATH"

══════════════════════════════════════════════════════════════════════════════
```

**IMPORTANT: Output EXACTLY what is shown in the ARTIFACTS section above for table/detail views. Do NOT add any extra content, headers, horizontal lines, or "Related:" sections.**

### Step 4: Installations Registry View (--installations)

When invoked as `/utilities --installations` or with filters:

1. **Parse Filter Arguments**
   - `--category=X` - Filter by category (Enterprise, LGU, MSME, Academic, General)
   - `--status=X` - Filter by status (active, archived)
   - `--health=X` - Filter by health (healthy, issues, unknown, path_missing)
   - `--all` - Show both active and archived installations

2. **Read Central Registry**
   - Read `.claude/installations-registry.json` from Framework folder
   - If file not found, create default v2.0 structure

3. **Validate Paths**
   - For each installation, check if path still exists
   - If path missing, mark health.status = "path_missing"
   - Update registry with path validation results

4. **Apply Filters**
   - Filter installations[] based on arguments
   - If `--all`, include archivedInstallations[] as well
   - Default: show only active installations

5. **Display Registry Banner**

Display EXACTLY this format (with actual data from registry):

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/utilities --installations**                     |
| Q101 Framework v2.12.6 Installations Registry      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Registry:** v{registryVersion} | **Framework:** v{frameworkVersion}\
**Total:** {activeCount} active, {archivedCount} archived

>

## Active Installations ({activeCount})

| # | ID | Category | Version | Health | Last Verified |
|---|-----|----------|---------|--------|---------------|
| 1 | E1-HRIS | Enterprise | 2.12.4 | unknown | (never) |
| 2 | E2-CRM | Enterprise | 2.12.4 | unknown | (never) |
| ... | ... | ... | ... | ... | ... |

>

## By Category

| Category | Count |
|----------|-------|
| Enterprise | {count} |
| LGU | {count} |
| MSME | {count} |
| Academic | {count} |
| Community | {count} |
| General | {count} |

>

## By Health

| Status | Count |
|--------|-------|
| Healthy | {count} |
| Issues | {count} |
| Unknown | {count} |
| Path Missing | {count} |

>

**Filter:** `--category=X` `--status=X` `--health=X`\
**All:** `--all` to include archived installations\
**Example:** `/utilities --installations --category=Enterprise`
<!-- END EXACT OUTPUT -->

**Health Status Indicators:**

| Status | Meaning |
|--------|---------|
| `healthy` | All files present, up to date |
| `issues` | Missing/modified files detected by /verify |
| `unknown` | Never verified (default for new installations) |
| `⚠ missing` | Installation path no longer exists |

**Filter Examples:**
```
/utilities --installations                      # All active installations
/utilities --installations --category=Enterprise # Only Enterprise projects
/utilities --installations --status=archived    # Only archived (uninstalled)
/utilities --installations --health=issues      # Only installations with issues
/utilities --installations --all                # Both active and archived
```

### Step 5: Batch Update Mode (--update-all)

When invoked as `/utilities --update-all` or with filters:

1. **Parse Batch Arguments**
   - `--category=X` - Filter by category (Enterprise, LGU, MSME, Academic, General)
   - `--dry-run` - Preview only, do not execute updates
   - `--skip-modified` - Auto-skip installations with user-modified files
   - `--force` - Overwrite user-modified files without asking
   - `--only=file.md` - Update only specified file(s) (literal filename, comma-separated)
   - `--set=component` - Update component package (expands to file set)

1.5. **Resolve File Filter (if --only or --set present)**

If `--only=` or `--set=` flags are present:

**A. Parse Filter Type**
- If `--only=VALUE` → Mode: LITERAL_FILES
- If `--set=VALUE` → Mode: COMPONENT_SET
- If both provided → Error: "Cannot use --only and --set together. Choose one."

**B. Resolve to File List**

**Mode: LITERAL_FILES** (`--only=`)
1. Check if VALUE contains comma
   - If yes: Split by comma, trim whitespace
   - If no: Single filename
2. For each filename:
   - Validate filename format (alphanumeric, dash, underscore, .md extension)
   - Store in fileFilter[] array
3. Result: Array of literal filenames

**Mode: COMPONENT_SET** (`--set=`)
1. Read `.claude/commands/utilities/component-definitions.json`
2. Look up VALUE in components object
3. If found:
   - If component has `files` array → Use array directly
   - If component has `pattern` → Expand pattern to file list using Glob
   - Store in fileFilter[] array
4. If not found:
   - Display error: "Unknown component set: VALUE"
   - List available sets from component-definitions.json
   - STOP execution
5. Result: Array of resolved filenames from component

**C. Display Filter Summary**

```
═══════════════════════════════════════════════════════════════════════════
                     FILE FILTER ACTIVE
═══════════════════════════════════════════════════════════════════════════

  Filter Type: [LITERAL_FILES | COMPONENT_SET]
  Filter Value: [VALUE]
  Resolved Files: [X files]

  Files to Update:
  • file1.md
  • file2.md
  • ...

═══════════════════════════════════════════════════════════════════════════
```

**D. Store Filter Context**

```javascript
filterContext = {
  mode: "LITERAL_FILES" | "COMPONENT_SET",
  value: originalValue,
  files: resolvedFileArray,
  fileCount: resolvedFileArray.length
}
```

2. **Read Central Registry**
   - Read `.claude/installations-registry.json` from Framework folder
   - Read `.claude/commands/VERSION.json` for current framework version
   - If registry not found, display error

3. **Filter and Validate Installations**

**A. Installation Filters** (filter which installations to update)
   - If `--category=X`: Filter installations by category
   - Default: Active installations only
   - Validate each installation path exists
   - Check which installations need updates (installed version < framework version)

**B. File Filters** (filter which files to update per installation)
   - If `--only=` or `--set=`: Use fileFilter[] from Step 1.5
   - Otherwise: Update ALL files (default behavior)

**C. Build Update List**
   - filteredInstallations = installations matching category filters
   - filesToUpdate = files matching file filters (or all if no filter)
   - Result: (filteredInstallations × filesToUpdate) matrix

4. **Build Update Manifest Per Installation**
   For each installation needing update:

   **A. Read Installation Manifest**
   - Read target/.claude/q101-installation.json
   - Get currently installed file versions

   **B. Apply File Filter (if active)**

   If fileFilter[] exists from Step 1.5:
   1. Filter files to ONLY those in fileFilter[] array
   2. For each file in fileFilter[]:
      - Check if file exists in installation
      - If exists: Compare version with framework
      - If version differs: Add to update manifest
      - If version same: Skip (already current)
      - If not exists: Skip (file not in this installation)
   3. Build filtered update manifest

   Example:
   ```
   File Filter: ["hackathon.md", "problem_agent.md", "make_agent.md"]
   Installation has: hackathon.md (v1.0.0), problem_agent.md (v1.0.1)
   Framework has: hackathon.md (v1.0.2), problem_agent.md (v1.0.1), make_agent.md (v1.0.0)

   Update Manifest:
     • hackathon.md: 1.0.0 → 1.0.2 (outdated)
     • problem_agent.md: 1.0.1 → 1.0.1 (current, skip)
     • make_agent.md: NOT IN INSTALLATION (skip)

   Result: 1 file to update
   ```

   Otherwise (no filter):
   - Compare ALL files with framework VERSION.json
   - Categorize files: New, Updated, Unchanged

   **C. Check User Modifications**
   - Check userModified list for user-customized files
   - Count modified files per installation

5. **Display Batch Preview Banner**

```
══════════════════════════════════════════════════════════════════════════════
                      Q101 FRAMEWORK BATCH UPDATE PREVIEW
══════════════════════════════════════════════════════════════════════════════

  From Version: 2.12.4
  To Version:   2.12.6
  File Filter:  [ACTIVE] --set=hackathon (22 files)    ← SHOWN IF FILTER ACTIVE

  ──────────────────────────────────────────────────────────────────────────────
  INSTALLATIONS TO UPDATE (9)
  ──────────────────────────────────────────────────────────────────────────────

  #   ID                   Category    Current   Files to Update
  ─────────────────────────────────────────────────────────────────────────────
  1   E1-HRIS              Enterprise  2.12.4    22/22 files
  2   E2-CRM               Enterprise  2.12.4    18/22 files (4 missing)
  3   E3-IMS               Enterprise  2.12.4    22/22 files
  4   L1-Barangay-App      LGU         2.12.4    22/22 files
  5   L2-Citizen-Portal    LGU         2.12.4    22/22 files
  6   L3-RHU-System        LGU         2.12.4    22/22 files
  7   M1-Store-Assistant   MSME        2.12.4    22/22 files
  8   M2-Canteen-App       MSME        2.12.4    22/22 files
  9   M3-Negosyo-Advisor   MSME        2.12.4    22/22 files

  ──────────────────────────────────────────────────────────────────────────────
  UPDATE SUMMARY
  ──────────────────────────────────────────────────────────────────────────────

  Files in filter: 22 (hackathon component)                    ← SHOWN IF FILTER ACTIVE
  Files changed from 2.12.4 → 2.12.6:
    + New files:     X
    ↑ Updated files: Y
    = Unchanged:     Z

  Per installation: ~X files will be updated (filtered to hackathon component)

══════════════════════════════════════════════════════════════════════════════
```

**Note:** The "File Filter" line and modified column header ("Files to Update") only appear when `--only` or `--set` flags are used. Without filters, the banner shows the original format.

6. **Handle --dry-run**
   - If `--dry-run` flag is set, STOP here after displaying preview
   - Display message: "Dry run complete. No changes made."

7. **Confirm Batch Update**
   - Ask: "Proceed with batch update of X installations? [Y/n]"
   - If user declines, abort with cancellation message

8. **Execute Updates Per Installation**

For each installation:

a. **Check for User-Modified Files**
   - If installation has files in userModified list:
     - If `--skip-modified`: Skip this installation, continue to next
     - If `--force`: Proceed with update (overwrite modified files)
     - Otherwise: Ask user: "E1-HRIS has X modified files. Update anyway? [Y/n/skip-all]"
       - Y = Update this installation
       - n = Skip this installation
       - skip-all = Skip all remaining installations with modified files

b. **Copy Updated Files**
   - Copy only new and updated files (not unchanged)
   - Do NOT copy utilities/ folder or VERSION.json
   - Track success/failure per installation

c. **Update Installation Record**
   - Update target/.claude/q101-installation.json:
     - frameworkVersion: new version
     - updatedAt: now
     - files/agents: updated versions

d. **Track Result**
   - Record: updated, skipped (user-modified), or failed

9. **Update Central Registry**
   - For each updated installation:
     - Update frameworkVersion
     - Update updatedAt timestamp
     - Add history entry: { action: "batch-update", fromVersion, toVersion, timestamp }
   - Recalculate summary counts
   - Write registry back to Framework folder

10. **Display Batch Completion Banner**

```
══════════════════════════════════════════════════════════════════════════════
                      Q101 FRAMEWORK BATCH UPDATE COMPLETE
══════════════════════════════════════════════════════════════════════════════

  ✓ 9 installations updated to v2.12.6
  ✗ 0 installations failed
  ○ 0 installations skipped (user-modified)

  ──────────────────────────────────────────────────────────────────────────────
  UPDATED INSTALLATIONS
  ──────────────────────────────────────────────────────────────────────────────

  #   ID                   Category    Previous  Current   Files Updated
  ─────────────────────────────────────────────────────────────────────────────
  1   E1-HRIS              Enterprise  2.12.4    2.12.6    X files
  2   E2-CRM               Enterprise  2.12.4    2.12.6    X files
  3   E3-IMS               Enterprise  2.12.4    2.12.6    X files
  4   L1-Barangay-App      LGU         2.12.4    2.12.6    X files
  5   L2-Citizen-Portal    LGU         2.12.4    2.12.6    X files
  6   L3-RHU-System        LGU         2.12.4    2.12.6    X files
  7   M1-Store-Assistant   MSME        2.12.4    2.12.6    X files
  8   M2-Canteen-App       MSME        2.12.4    2.12.6    X files
  9   M3-Negosyo-Advisor   MSME        2.12.4    2.12.6    X files

  ──────────────────────────────────────────────────────────────────────────────

  Run /utilities --installations to view updated registry

══════════════════════════════════════════════════════════════════════════════
```

**Batch Update Examples:**
```
/utilities --update-all                      # Update all active installations
/utilities --update-all --category=Enterprise # Update only Enterprise projects
/utilities --update-all --dry-run            # Preview without executing
/utilities --update-all --skip-modified      # Auto-skip if user-modified files exist
/utilities --update-all --force              # Overwrite all files including modified
```

### Step 6: Backup Mode (--backup)

When invoked with backup arguments:

1. **Parse Backup Arguments**
   - Mode = value from `--backup=<mode>` (local/github/full/list/restore)
   - Additional args (--destination, --repo, --dry-run)

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/backup.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Mode | Action |
|------|--------|
| (no value) | Display backup help banner |
| `=local` | Create local ZIP backup |
| `=github` | Push to GitHub repository |
| `=full` | Both local + GitHub |
| `=list` | Show backup history |
| `=restore "id"` | Restore from backup |

**Backup Examples:**
```
/utilities --backup                          # Show backup help
/utilities --backup=local                    # Create local ZIP backup
/utilities --backup=github                   # Push to GitHub
/utilities --backup=full                     # Both local + GitHub
/utilities --backup=list                     # View backup history
/utilities --backup=restore "backup-id"      # Restore from backup
```

### Step 7: Git Mode (--git)

When invoked with git arguments:

1. **Parse Git Arguments**
   - Mode = presence of `--check` flag
   - Sub-flags = `--full`, `--fix`

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/git.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Arguments | Action |
|-----------|--------|
| `--git` | Display git workflow reference (Mode 1) |
| `--git --check` | Run quick check (Mode 2) |
| `--git --check --full` | Run full repository scan (Mode 2) |
| `--git --check --fix` | Run auto-fix mode (Mode 2) |

**Git Examples:**
```
/utilities --git                          # Show git workflow reference
/utilities --git --check                  # Quick check - staged files only
/utilities --git --check --full           # Full scan - all files
/utilities --git --check --fix            # Auto-fix .gitkeep and .gitignore
```

### Step 8: Auto-Backup Mode (--auto-backup)

When invoked with auto-backup arguments:

1. **Parse Auto-Backup Arguments**
   - Mode = value from `--auto-backup=<mode>` (status/enable/disable/configure/run/history)
   - Sub-flags = --schedule, --time, --day, --limit

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/auto-backup.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Mode | Action |
|------|--------|
| (no value) | Display auto-backup help and current status |
| `=status` | Show detailed status of scheduled task |
| `=enable` | Enable scheduled backups with options |
| `=disable` | Disable scheduled backups |
| `=configure` | View or change configuration |
| `=run` | Execute immediate backup |
| `=history` | View execution history |

**Auto-Backup Examples:**
```
/utilities --auto-backup                             # Show status and help
/utilities --auto-backup=status                      # Detailed task status
/utilities --auto-backup=enable                      # Enable daily at midnight
/utilities --auto-backup=enable --schedule=daily     # Enable daily backups
/utilities --auto-backup=enable --schedule=weekly    # Enable weekly backups
/utilities --auto-backup=enable --schedule=monthly   # Enable monthly backups
/utilities --auto-backup=enable --time="23:00"       # Daily at 11 PM
/utilities --auto-backup=disable                     # Disable backups
/utilities --auto-backup=run                         # Run backup now
/utilities --auto-backup=history                     # View history
/utilities --auto-backup=history --limit=5           # Last 5 runs
```

### Step 9: Push Mode (--push)

When invoked with push arguments:

1. **Parse Push Arguments**
   - File = value from `--push=<file>` (filename or path)
   - Flags = --dry-run, --force, --version, --no-backup, --full-diff

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/push.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Arguments | Action |
|-----------|--------|
| `--push` | Display push help banner (Mode 1) |
| `--push=file.md` | Single file push (Mode 2) |
| `--push=file.md --dry-run` | Preview without pushing |
| `--push=file.md --force` | Push without conflict detection |
| `--push=file.md --version=X.Y.Z` | Push with specific version |
| `--push-modified` | List modified files (Mode 3) |
| `--push-modified --execute` | Push all modified files (Mode 4) |
| `--push-list` | View push history (Mode 5) |

**Push Examples:**
```
/utilities --push                              # Show push help
/utilities --push=ideate.md                    # Push single file
/utilities --push=ideate.md --dry-run          # Preview changes
/utilities --push=ideate.md --force            # Skip conflict check
/utilities --push=ideate.md --version=2.13.0   # Specific version
/utilities --push-modified                     # List all modified files
/utilities --push-modified --execute           # Push all modified
/utilities --push-list                         # View push history
```

### Step 10: Merge Mode (--merge)

When invoked with merge arguments:

1. **Parse Merge Arguments**
   - File = value from `--merge=<file>` (filename or path)
   - Flags = --dry-run, --section, --version, --no-backup, --verbose

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/merge.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Arguments | Action |
|-----------|--------|
| `--merge` | Display merge help banner (Mode 1) |
| `--merge=file.md` | Single file merge (Mode 2) |
| `--merge=file.md --dry-run` | Preview without merging |
| `--merge=file.md --section=X` | Merge only specific section |
| `--merge=file.md --version=X.Y.Z` | Merge with specific version |
| `--merge-modified` | List files with additions (Mode 3) |
| `--merge-modified --execute` | Merge all files with additions (Mode 4) |
| `--merge-list` | View merge history (Mode 5) |

**Unix Philosophy:**
- `/push` = **Overwrite** (project replaces framework)
- `/merge` = **Intelligent Merge** (project additions enrich framework)

Use `/merge` when:
- Project has ADDITIONS not in framework
- Framework file is larger/richer than project
- You want to preserve ALL framework content

Use `/push` when:
- Project should REPLACE framework file
- Framework file is outdated
- You intentionally want to discard framework content

**Merge Examples:**
```
/utilities --merge                              # Show merge help
/utilities --merge=CLAUDE.md                    # Merge single file
/utilities --merge=CLAUDE.md --dry-run          # Preview merge plan
/utilities --merge=CLAUDE.md --section="## Agents" # Merge specific section
/utilities --merge=CLAUDE.md --version=2.13.0   # Specific version
/utilities --merge-modified                     # List files with additions
/utilities --merge-modified --execute           # Merge all files
/utilities --merge-list                         # View merge history
```

---

## File Filtering Examples

**Single File Update:**
```
/utilities --update-all --only=hackathon.md
→ Updates only hackathon.md across all installations (1 file per installation)
```

**Multiple Files Update:**
```
/utilities --update-all --only=hackathon.md,orchestrator.md
→ Updates 2 specific files across all installations
```

**Component Set Update:**
```
/utilities --update-all --set=hackathon
→ Updates hackathon component (22 files: command + 21 agents)
```

**Category Set Update:**
```
/utilities --update-all --set=hackathon-agents
→ Updates only hackathon agents (21 files)
```

**Combined Filters:**
```
/utilities --update-all --category=LGU --set=hackathon
→ Updates hackathon component in LGU installations only
```

**Available Component Sets:**

| Set Name | Description | File Count |
|----------|-------------|------------|
| `hackathon` | Hackathon command + agents | 22 files |
| `hackathon-agents` | Hackathon agents only | 21 files |
| `agents` | All agent files | ~55 files |
| `commands` | All command files | ~20 files |
| `ideation-agents` | Ideation workflow agents | 9 files |
| `development-agents` | Development workflow agents | 17 files |
| `analysis-agents` | Analysis workflow agents | 7 files |
| `framework-agents` | Framework support agents | 1 file |
| `skills` | All skill folders | 31 folders |
| `templates` | All template files | 10 files |
| `reference` | All reference docs | 20 files |

**Note:** To see all available sets, read [component-definitions.json](.claude/commands/utilities/component-definitions.json)

---

### Step 11: Hackathon Install Mode (--install=hackathon)

When invoked with hackathon install arguments:

1. **Parse Hackathon Arguments**
   - Mode = presence of path argument after `--install=hackathon`
   - Flags = --only-agents, --only-skills, --only-templates

2. **Read Utility Definition**
   - Read `.claude/commands/utilities/install-hackathon.md`
   - Follow its E - EXECUTION section

3. **Execute Based on Mode**

| Arguments | Action |
|-----------|--------|
| `--install=hackathon` | Display hackathon install help banner (Detail View) |
| `--install=hackathon "<path>"` | Execute hackathon installation |
| `--install=hackathon "<path>" --only-agents` | Install only hackathon agents |
| `--install=hackathon "<path>" --only-skills` | Install only hackathon skills |
| `--install=hackathon "<path>" --only-templates` | Install only quality mode templates |

**Hackathon Detail View Banner:**

When invoked as `/utilities --install=hackathon` (no path), display:

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/install=hackathon**                             |
| Q101 Hackathon Framework v1.1.0 Installer          |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Purpose:** Deploy hackathon-only components to target project

>

## What Gets Installed:

| Component | Count | Location |
|-----------|-------|----------|
| Commands | 2 | .claude/commands/hackathon.md, hackatest.md |
| Agents | 21 | .claude/commands/agents/hackathon/ |
| Skills | 10 | .claude/skills/ |
| Templates | 3 | .claude/templates/hackathon/quality-modes/ |

>

**Workflow Integration:**
After building with `/hackathon`, test with `/hackatest`:
- `/hackathon --then=hackatest` (auto-chaining)
- `/hackatest --engine=playwright` (fast testing)
- `/hackatest --engine=computer-use` (visual AI testing)

>

**Usage:** `/utilities --install=hackathon "<path>" [options]`

**Options:**
- `--only-agents` - Install only hackathon agents (21 files)
- `--only-skills` - Install only hackathon-useful skills (10 folders)
- `--only-templates` - Install only quality mode templates (3 files)

**Example:** `/utilities --install=hackathon "C:\Projects\MyHackathon"`
<!-- END EXACT OUTPUT -->

**Hackathon Install Examples:**
```
/utilities --install=hackathon                              # Show hackathon install help
/utilities --install=hackathon "C:\Projects\MyHackathon"    # Full hackathon install
/utilities --install=hackathon "C:\Projects\MyHackathon" --only-agents    # Agents only
/utilities --install=hackathon "C:\Projects\MyHackathon" --only-skills    # Skills only
/utilities --install=hackathon "C:\Projects\MyHackathon" --only-templates # Templates only
```

### Step 12: Hackathon Registry View (--hackathon-installations)

When invoked as `/utilities --hackathon-installations`:

1. **Read Hackathon Registry**
   - Read `.claude/hackathon-installations-registry.json` from Framework folder
   - If file not found, display message: "No hackathon installations found."

2. **Validate Paths**
   - For each installation, check if path still exists
   - If path missing, mark health.status = "path_missing"
   - Update registry with path validation results

3. **Display Hackathon Registry Banner**

Display EXACTLY this format (with actual data from registry):

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/utilities --hackathon-installations**           |
| Q101 Hackathon Framework Installations Registry    |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Registry:** v{registryVersion} | **Hackathon:** v{hackathonVersion}\
**Total:** {activeCount} active, {archivedCount} archived

>

## Hackathon Installations ({activeCount})

| # | ID | Version | Health | Last Verified |
|---|-----|---------|--------|---------------|
| 1 | hackathon-MyProject | 1.0.0 | unknown | (never) |
| ... | ... | ... | ... | ... |

>

## By Health

| Status | Count |
|--------|-------|
| Healthy | {count} |
| Issues | {count} |
| Unknown | {count} |
| Path Missing | {count} |

>

**Registry Location:** `.claude/hackathon-installations-registry.json`\
**Note:** Hackathon installations are tracked separately from full Q101 installations.
<!-- END EXACT OUTPUT -->

**Hackathon Registry Examples:**
```
/utilities --hackathon-installations              # View all hackathon installations
```

---

### Step 13: Packages Mode (--packages)

When invoked as `/utilities --packages`:

1. **Read Package Summary**
   - Read `C:\Users\Public\Claude\Q101\Packages\PHASE-0-SUMMARY.md`
   - Extract package table data (files, commands, agents, status)
   - Extract last update date from each package's README.md or package.json

2. **Parse Optional Flags**
   - `--format=table` (default) - Display as table
   - `--format=tree` - Display as hierarchical tree
   - `--details` - Show detailed package information
   - `--name=<package>` - Show specific package details

3. **Display Packages Banner**

Display EXACTLY this format (with actual data):

<!-- BEGIN EXACT OUTPUT -->

| ================================================== |
|:--------------------------------------------------:|
| **/utilities --packages**                          |
| Q101 MCP Package Architecture                      |
|                                                    |
| By EMIL V. CAPINO                                  |
| ================================================== |

>

**Framework Version:** 2.12.21\
**Total Packages:** 6 (reduced from 7 via bundling)\
**Total Files:** 76 files across 19 commands and 55 agents\
**Phase 0 Status:** ✅ ALL PACKAGES EXTRACTED & ANALYZED

>

## MCP Package Architecture

| # | Package | Files | Cmds | Agents | Version | Status | Updated |
|---|---------|-------|------|--------|---------|--------|---------|
| 1 | **q101-hackathon-mcp** | 22 | 1 | 21 | 2.12.20 | ✅ VALIDATED | 2026-01-10 |
| 2 | **q101-discovery-mcp** | 3 | 3 | 0 | 2.12.21 | ✅ UPDATED | 2026-01-16 |
| 3 | **q101-ideation-mcp** | 12 | 3 | 9 | 2.12.20 | ✅ EXTRACTED | 2026-01-11 |
| 4 | **q101-development-mcp** | 25 | 8 | 17 | 2.12.20 | ✅ BUNDLED | 2026-01-12 |
| 5 | **q101-analysis-mcp** | 8 | 1 | 7 | 2.12.20 | ✅ EXTRACTED | 2026-01-13 |
| 6 | **q101-core-mcp** | 6 | 5 | 1 | 2.12.20 | ✅ EXTRACTED | 2026-01-15 |

>

## Package Priorities

| Priority | Package | Scope |
|----------|---------|-------|
| **P0 (First)** | hackathon | Rapid MVP building with PRIME methodology |
| **P1 (High)** | discovery | Browse Anthropic examples for project kickstart |
| **P1 (High)** | ideation | Creative brainstorming and research |
| **P1 (High)** | development | Full development-to-production lifecycle |
| **P2 (Medium)** | analysis | Deep codebase analysis with 7 agents |
| **P3 (Low)** | core | Framework reference and @agentQ wisdom |

>

## Deployment Notes

- **Bundling Decision:** Deployment package merged into Development (hard dependency on @security_expert)
- **Total Reduction:** 7 planned packages → 6 final packages
- **Phase 0 Complete:** All standalone packages extracted and validated
- **Next Phase:** 0.5 - Security infrastructure (API keys, licensing, metering)

>

**Details:** `/utilities --packages --name=<package>` for package details\
**Tree View:** `/utilities --packages --format=tree` for hierarchical view\
**Location:** `C:\Users\Public\Claude\Q101\Packages\`\
**Summary:** `PHASE-0-SUMMARY.md` for complete Phase 0 report
<!-- END EXACT OUTPUT -->

4. **Package Detail View (--name=<package>)**

When `--name=<package>` flag is provided:

1. Validate package name against known packages
2. Read package README.md from `C:\Users\Public\Claude\Q101\Packages\q101-<name>-standalone\README.md`
3. Extract:
   - Commands list with descriptions
   - Agents list with roles
   - Dependencies (external, Q101 commands, Q101 agents)
   - Testing status
   - MCP deployment strategy
4. Display detailed package information

**Example Detail Output:**

```
╔════════════════════════════════════════════════════════════════════════════════════╗
║                    PACKAGE DETAILS: q101-hackathon-mcp                            ║
╚════════════════════════════════════════════════════════════════════════════════════╝

Package: @q101/hackathon-standalone
Version: 2.12.20
Files: 22 (1 command + 21 agents)
Status: ✅ FULLY VALIDATED (runtime testing complete)

Commands (1):
  • /hackathon - Rapid MVP building with PRIME methodology
    Modes: lightning (2h), standard (4h), polish (8h)
    Phases: Problem → Requirements → Instruct → Make → Evaluate

Agents (21):
  PRIME Core (5):
    • @problem_agent - Problem validation and research
    • @requirements_agent - Feature generation and prioritization
    • @instruct_agent - Context building and code patterns
    • @make_agent - Code generation and TDD
    • @evaluate_agent - Testing and quality verification

  Ideate Phase (3):
    • @mvp_scoper, @feature_prioritizer, @research_agent

  Design Phase (4):
    • @wireframe_generator, @ui_styler, @theme_builder, @responsive_designer

  Build Phase (5):
    • @frontend_generator, @backend_generator, @api_integrator,
      @test_orchestrator, @deployment_validator

  Document Phase (4):
    • @readme_writer, @architecture_documenter, @demo_scripter, @presentation_builder

Dependencies:
  • External: NONE
  • Q101 Commands: NONE
  • Q101 Agents: NONE
  • Skills: brainstorming, frontend-design, docx, pptx
  → FULLY INDEPENDENT

MCP Deployment:
  Server: q101-hackathon.vercel.app
  Priority: P0 (First deployment)
  NPM: @q101/hackathon-mcp

Pilot Testing:
  Location: C:\Users\Public\Claude\Q101\Labs\Lab-hackathon-pilot
  Status: ✅ VALIDATED - Full PRIME workflow tested successfully

Next Steps:
  1. Phase 0.5: Security infrastructure (API keys, metering)
  2. Phase 1: MCP server development with Execution-Only Pattern
  3. Phase 2: Vercel deployment and production testing
```

5. **Tree View (--format=tree)**

When `--format=tree` flag is provided, display hierarchical view:

```
Q101 Framework MCP Architecture (v2.12.21)
│
├─ P0 - First Deployment
│  └─ q101-hackathon-mcp (22 files)
│     ├─ Commands (1): /hackathon
│     └─ Agents (21): PRIME + Ideate + Design + Build + Document
│
├─ P1 - High Priority
│  ├─ q101-discovery-mcp (3 files)
│  │  ├─ Commands (3): /discover, /cookbooks, /quickstarts
│  │  └─ Agents (0): Pure utility commands
│  │
│  ├─ q101-ideation-mcp (12 files)
│  │  ├─ Commands (3): /ideate, /research, /knowledge
│  │  └─ Agents (9): Ideation specialists
│  │
│  └─ q101-development-mcp (25 files) [BUNDLED with Deployment]
│     ├─ Commands (8): /initialize, /generate, /execute, /prepare,
│     │                /evaluate, /iterate, /secure, /activate
│     └─ Agents (17): Development + Security + DevOps + Autonomous
│
├─ P2 - Medium Priority
│  └─ q101-analysis-mcp (8 files)
│     ├─ Commands (1): /analyze
│     └─ Agents (7): Analysis specialists
│
└─ P3 - Low Priority
   └─ q101-core-mcp (6 files)
      ├─ Commands (5): /commands, /agents, /workflows, /skills, /utilities
      └─ Agents (1): @agentQ (Framework Philosopher)

Total: 76 files across 6 packages
```

**Package Mode Examples:**
```
/utilities --packages                          # View all packages (table)
/utilities --packages --format=tree            # View as hierarchical tree
/utilities --packages --details                # Show detailed info for all
/utilities --packages --name=hackathon         # Show hackathon package details
```
