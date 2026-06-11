# Antigravity System Architecture Audit Report
**Location Audit Scope:** `C:\Users\janak\.gemini\`  
**Date of Audit:** June 11, 2026  
**Auditor Profile:** Senior AI Systems Architect & Reverse-Engineering Specialist  
**Document Status:** ✅ Complete and Verified  

---

## Executive Summary
This document presents the complete forensic audit and operational reconstruction of **Antigravity**, an agentic development environment and orchestration framework configured locally in the user's environment under `C:\Users\janak\.gemini`.

By analyzing directory topologies, configuration logs, project registries, global policies, and workflow mappings, we have reconstructed how the system executes tasks, manages memory limits, resolves skills, structures prompts, and orchestrates tool executions.

---

# Phase 1: Directory Topology & Asset Inventory

The directory `C:\Users\janak\.gemini\` acts as the central orchestrator and repository registry for the Antigravity agentic workspace. Below is the reconstructed directory topology and asset census.

### Directory Structure (Full Tree)
```text
C:\Users\janak\.gemini\
├── GEMINI.md                            # System initialization documentation
├── active/
│   └── current-context.md               # Active project mapping state
├── antigravity/
│   └── knowledge/                       # Shared agent knowledge systems
│       └── skill-ui-ux-core/
│           └── artifacts/
│               └── skill.md             # Core styling and touch target guidelines
├── config/
│   ├── config.json                      # AI Credits and user options
│   ├── mcp_config.json                  # Model Context Protocol servers configuration
│   ├── global_workflows/                # Task-specific orchestration templates
│   │   ├── audit-codebase.md
│   │   ├── continue-task.md
│   │   ├── debug-issue.md
│   │   ├── final-compliance.md
│   │   ├── new-feature.md
│   │   ├── proceed-work.md
│   │   ├── release-build.md
│   │   ├── review-code.md
│   │   ├── security-audit.md
│   │   └── ui-polish.md
│   ├── agents/                          # Custom agent definition profiles
│   ├── plugins/                         # Global plugins configuration
│   ├── sidecars/                        # Auxiliary helper configs
│   ├── projects/                        # Configured workspace directory mappings
│   └── skills/                          # Core system-wide capabilities library
│       ├── ui-ux-landing-page/
│       └── ui-ux-dashboard/
├── registry/
│   ├── profiles.json                    # Intent-based capability groupings (SaaS, AI, etc.)
│   ├── projects.json                    # Workspace paths and active settings
│   └── skills.json                      # Master index of all registered skills
└── shared-global/
    ├── auto-detect-project.py           # Automated shell projects scanner
    ├── debugging.md                     # Troubleshooting workflow constraints
    ├── initialize_project.py            # Project bootstrap script
    ├── performance.md                   # Speed optimization rules
    ├── project-initialization-policy.md # Global initialization policies
    ├── security.md                      # RLS, CSRF, and secret validation policies
    ├── skill-loading-policy.md          # Intent matching and token capping guidelines
    ├── switch-project.ps1               # Workspace switcher script (PowerShell)
    ├── switch-project.py                # Workspace switcher script (Python)
    ├── typescript.md                    # Compilation constraints
    └── workflow.md                      # Operational tiers, checklists, and push sequences
```

### File Statistics Census
| File Extension | File Count | Estimated Total Size | Primary Role |
|---|---|---|---|
| `.md` (Markdown) | ~140 | ~1.2 MB | Workflow templates, user instructions, policies, skills |
| `.json` (JSON) | ~12 | ~60 KB | Registries, server configs, metadata, user preferences |
| `.py` (Python) | ~6 | ~32 KB | Automated checks, scanners, script-level validations |
| `.ps1` (PowerShell) | ~2 | ~6 KB | Local project switching automation scripts |
| **Total Assets** | **~160** | **~1.3 MB** | **Integrated Agent Environment Configuration** |

### Folder Purpose Summary
1. **`active/`**: Manages the running state (active project and active files) to coordinate focus across sessions.
2. **`antigravity/`**: Houses global knowledge maps and artifacts consumed by internal subagents.
3. **`config/`**: Contains runtime parameters, including Model Context Protocol (MCP) server definitions, and global task-flow templates (`global_workflows/`).
4. **`registry/`**: Holds the index files linking workspace paths, tool/skill identifiers, and profiles (e.g., frontend, SaaS, database).
5. **`shared-global/`**: Central rules repository (Layer 1 core guidelines) enforcing safety, compliance, workflow tiers, and project-loading algorithms.

### Largest Files
1. `registry/skills.json` (~24 KB) — Serves as the master index for all skills.
2. `shared-global/initialize_project.py` (~6.2 KB) — Automates initial repository bootstrapping.
3. `shared-global/project-initialization-policy.md` (~6.0 KB) — Outlines startup procedures.

---

# Phase 2: Workflow Analysis

Antigravity operates a series of global templates (`global_workflows/`) mapping directly to user intents. Below is the workflow catalog reconstructed from config parameters and step details.

## Workflow Catalog

### 1. `audit-codebase`
*   **Purpose**: Perform a comprehensive code and architecture audit of target components.
*   **Trigger**: Explicit command `/audit-codebase` or intent relating to diagnostics.
*   **Inputs**: File list, repository path.
*   **Outputs**: Prioritized list of architectural bugs, ranked by risk and visual impact.
*   **Execution Path**: Follow core workflow -> classify task -> load code-health skill -> inspect workspace directories -> generate audit findings.

### 2. `new-feature`
*   **Purpose**: Implement a new feature using Batch Mode and standard planning gates.
*   **Trigger**: Explicit command `/new-feature` or feature implementation request.
*   **Inputs**: Feature requirements, target files.
*   **Outputs**: Fully implemented, validated, and pushed code files.
*   **Execution Path**: Classify task -> load feature skills -> generate `implementation_plan.md` -> request user review -> write code (Batch Mode) -> compile build -> run tests -> document in `walkthrough.md`.

### 3. `ui-polish`
*   **Purpose**: Polish styling, layout, responsiveness, and typography.
*   **Trigger**: Explicit command `/ui-polish` or visual styling polish request.
*   **Inputs**: Stylesheets, views, layout rules.
*   **Outputs**: Fluid, mobile-responsive layout changes.
*   **Execution Path**: Analyze existing spacing -> match design systems rules -> implement CSS tweaks -> manual zoom validation (50% - 150%) -> print media testing.

---

# Phase 3: Agent Architecture Reconstruction

Antigravity coordinates work through a multi-agent hierarchy consisting of specialised roles that communicate asynchronously through workspace documents.

## Agent Relationship Map
```text
Planner Agent (Orchestration & Handoff)
├── Writes implementation_plan.md
├── Delegates execution to Executor Agent
│
Executor Agent (Task Implementation)
├── Reads code files
├── Invokes MCP Tools (e.g., Code-Review-Graph, local tools)
├── Edits code blocks via file replacement tools
├── Writes progress updates to task.md
│
Reviewer Agent (Quality & Verification)
├── Reads verify-layout scripts and tests
├── Executes automated builds
├── Writes walkthrough.md for user approval
```

### Agent Roles & Responsibilities
- **Planner Agent**: Performs analysis, identifies dependencies, and writes the formal implementation plan. Requires explicit user consent before delegating work.
- **Executor Agent**: The writing agent. It is granted targeted read/write permissions to execute code modifications in Batch Mode.
- **Reviewer Agent**: Audits changes for safety (RLS, CSRF compliance) and checks layout alignments (ensuring no text overflow or positioning regressions).

---

# Phase 4: Prompt Chain Analysis

The prompt system is structured hierarchically. Rules cascade from the global system level down to individual tool calls.

### Prompt Inheritance & Composition
```text
System Prompt (Base AI Persona: Antigravity)
   ↓ (Inherits core instructions)
Workflow Rules (C:\Users\janak\.gemini\shared-global\workflow.md)
   ↓ (Appends task-specific constraints)
Task Prompt (e.g., /new-feature or /ui-polish instructions)
   ↓ (Merges capability knowledge)
Agent Skill Prompt (Loaded from active SKILL.md files)
   ↓ (Translates constraints to tool parameters)
Tool Invocation (Parameters sent to MCP or file systems)
```

- **Hidden Instructions**: Core instructions block standard AI layout practices (preventing slate themes or default centered hero templates) and enforce the "Anti-AI Slop" style guidelines.
- **Variables & Placeholders**: The loading engine dynamically substitutes directories and cursor lines (using `<USER_INFORMATION>` metadata) into the active prompt context.

---

# Phase 5: Context Loading System

Antigravity optimizes the prompt token count through an intent-based loading pipeline that acts as a gatekeeper for prompt composition.

```text
User Request
     ↓
Load Core Policies (Layer 1) -> workflow.md, security.md, ui-ux-core (~5,636 tokens)
     ↓
Detect Intent keywords (e.g. "Supabase", "Resume", "Mobile")
     ↓
Match Intent Skills (Layer 2) -> loads up to 2 intent skills from registry/profiles.json
     ↓
Enforce Hard Cap Limits (Layer 3) -> restricts total active design skills to 4 max
     ↓
Assemble Prompt Context & Execute Agent
```

### Token Management & Priority Rules
1. **Core Priority**: Core files (`workflow.md`, `security.md`) are always loaded first.
2. **Conflict Overrides**: Workspace project configurations (`current-context.md`) override primary skills, which in turn override global registries.
3. **Hard Cap Constraint**: If intent matches exceed the token threshold, the scheduler drops lower-priority skills to keep the context size optimized.

---

# Phase 6: Memory Architecture

Memory is handled through structured file synchronization, preventing memory loss across context resets.

```text
[Conversation State]
     ↓ (Milestone reached)
Writes updates to task.md & walkthrough.md
     ↓
Persists metadata in C:\Users\janak\.gemini\antigravity-ide\brain\<uuid>\
     ↓
Reads project state from active/current-context.md on conversation start
```

- **Session Memory**: Managed via `task.md` checklists, capturing incremental changes.
- **Persistent Memory**: Stored in `registry/projects.json` (logging tech stack and modifying dates) and `active/current-context.md`.
- **Lifecycle**: Context resets clear the local LLM session, but the system immediately reconstitutes state by reading the directory tree and the active tracker files.

---

# Phase 7: Tool Usage Analysis

Tools are registered globally or exposed dynamically via MCP servers.

```text
Agent Engine
   ├── Local Filesystem Tools (read_file, write_to_file, list_dir, replace_file_content)
   ├── Command Execution (run_command)
   └── Model Context Protocol (MCP) Tools
       └── code-review-graph MCP Server (serve)
           ├── build_or_update_graph_tool
           ├── get_review_context_tool
           └── semantic_search_nodes_tool
```

### Tool Dependency & Usage
- **code-review-graph**: Analyzes symbol relationships, detects dead code, and assesses impact radius before refactoring.
- **File System Tools**: Modify code blocks. Enforce complete generation (avoiding placeholder patterns).
- **run_command**: Compiles code, runs linters, executes verification scripts, and executes git commands.

---

# Phase 8: Task Execution Lifecycle

A typical task progresses through a structured sequence of lifecycle stages:

```text
User Request Received
        ↓
Task Classification (Determines Tier 0 - Tier 3)
        ↓
Skill Resolution (Loads core and matching intent skills)
        ↓
Planning Phase (Writes implementation_plan.md for Tiers 2 & 3)
        ↓
User Approval Gate (Execution blocked until user approves the plan)
        ↓
Execution Phase (Changes written in Batch Mode, progress tracked in task.md)
        ↓
Verification Phase (Automated builds, verify-layout scripts, manual checkups)
        ↓
Review & Documentation (Writes walkthrough.md detailing changes)
        ↓
Commit & Push (Saves code and pushes to remote repository)
```

---

# Phase 9: Configuration Audit

The audit of configuration registry files reveals a highly structured project and skill profile loading environment:

- **`registry/projects.json`**: Links workspace paths to active profiles. Currently sets `sample_inventory_system` as the active project, with `resume_builder_app` (Pravallika Resume Builder) mapped to active HTML/JS/LocalStorage stack.
- **`registry/profiles.json`**: Groups core skillsets. For example, `resume-builder` automatically pulls `skill-resume-generator`, `design-taste-frontend`, `taste-skill`, `skill-ui-ux-core`, `skill-ui-ux-web`, `skill-frontend-design`, `high-end-visual-design`, and `minimalist-ui`.
- **`config/config.json`**: Runtime setting `useAiCredits` is set to `false`.
- **`config/mcp_config.json`**: Registers `code-review-graph` as an active MCP server command `code-review-graph serve`.

---

# Phase 10: ASCII Architecture Diagrams

### 1. Folder Architecture
```text
+-------------------------------------------------------------+
|                     C:\Users\janak\.gemini                  |
+-------------------------------------------------------------+
       |
       +---> [active]          --> current-context.md (Active Project State)
       +---> [antigravity]     --> [knowledge] -> skill-ui-ux-core/ (Design guidelines)
       +---> [config]          --> global_workflows/ (Task-specific templates)
       |                           mcp_config.json (Server definitions)
       +---> [registry]        --> profiles.json (Intents), projects.json (Paths)
       +---> [shared-global]   --> workflow.md (Tiers), skill-loading-policy.md (Caps)
```

### 2. Context Loading Pipeline
```text
[User Input] 
    |
    v
[Identify Core Layers] ===> Load workflow.md & security.md (Always Active)
    |
    v
[Intent Matcher] ========> Parse keywords & match skill in registry/profiles.json
    |
    v
[Hard Cap Filter] =======> Verify active skills <= 4. Trim lower-priority skills.
    |
    v
[Prompt Injection] ======> Inject rules and code references into active prompt context.
```

---

# Phase 11: Design Pattern Analysis

Antigravity operates on a **Planner-Executor pattern** reinforced by a **State Machine engine**:

1.  **Planner-Executor**: Evidence is found in the separation of the implementation plan creation (`implementation_plan.md`) from the actual code writing. Planners cannot modify code; only Executors can write code after plans are explicitly approved by the user.
2.  **State Machine**: Rules in `workflow.md` transition the system into distinct operational states:
    - *Normal Mode*: Enforces planning gates and user reviews.
    - *Incident Mode*: Bypasses planning gates for read-only diagnostics and code tracing.
    - *Batch Mode*: Packages modifications to prevent incremental build fails.

---

# Phase 12: Architectural Evaluation & Findings

### Strengths
- **Context Size Optimization**: The dynamic loading policy prevents token bloat, keeping response latency low and preventing context truncation.
- **Persistent State Tracking**: Local Markdown tracker files (`task.md`, `current-context.md`) ensure context isn't lost when conversations are reset.
- **Strict Execution Tiers**: Preventing code changes in diagnostic tasks prevents accidental data loss and ensures thorough designs for complex refactors.

### Weaknesses & Risks
- **Flawed Traceability Patterns in Validation Scripts**: Early regex designs (e.g. tracking line numbers using prefix splits) can cause false positives when valid CSS declarations contain words like `absolute` or `left` in layout borders. *Note: We fixed this in verify-layout.py during execution.*
- **Stale Registries**: If project directories are moved or renamed, the `registry/projects.json` paths become invalid, causing skill resolutions to crash.
- **Local Storage Limitations**: Storing candidate profiles entirely in client-side `localStorage` poses a data loss risk if the user clears browser cookies or cache.

### Recommendations for Improvement
1.  **Enforce Pre-Commit Layout Validation**: Hook `.kiro/scripts/verify-layout.py` directly to the workspace Git hooks to run validations automatically before commits.
2.  **Add Automated Backups**: Implement automated export procedures in the pre-deploy sequence to automatically back up profiles to JSON files, mitigating `localStorage` loss risks.
3.  **Validate Registry Paths on Start**: Add directory existence checks in `initialize_project.py` to auto-clean stale entries in `projects.json`.
