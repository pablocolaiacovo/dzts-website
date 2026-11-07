# Agent roster: 3 agents + 3 skills

## Goal

Keep a subagent only where it pays for its cold start: a cheaper model on a large job, an isolated context for bulky output, or an independent view. Everything else moves to the main agent, either directly or as a skill it follows.

## Decisions

| Was | Now | Why |
|---|---|---|
| `quick-fix` agent (Haiku) | Main agent, directly | A one-call edit costs more to delegate (cold start, re-reading the file) than to make; its rules duplicated `CLAUDE.md`. |
| `ui-developer` agent (Opus) | Main agent, with the Impeccable skill + `apps/frontend/DESIGN.md` / `PRODUCT.md` | Same model as main, and the propose → user picks → implement loop happens with the user anyway. Its brand section had already drifted (old palette, dark mode). |
| `devops` agent (Sonnet) | `.claude/skills/devops/` | Mostly procedure and gotchas. Its core jobs end in merges the user should approve in the main conversation. |
| `triage` agent (Opus) | `.claude/skills/triage/` | Same model as main; its report is discussed and acted on right after, so one context is better. |
| `implementer` agent | Kept, cut to role + working rules | Cheaper model and isolation pay off on multi-file work; the convention list now lives only in `CLAUDE.md` (the duplicate is how its dark-mode rule went stale). |
| `reviewer`, `seo-auditor` agents | Kept | Independent judgment (reviewer) and bulky curl/Lighthouse output on a cheaper model (auditor). Fix routing now points at the main agent. |

## Implementation

- `git mv` of `devops.md` / `triage.md` to `.claude/skills/<name>/SKILL.md`, with agent framing ("you are…", "escalate to the orchestrator") rewritten as procedures, and an explicit user go-ahead before every merge.
- `quick-fix.md` and `ui-developer.md` deleted.
- New `.claude/skills/verify/` holds the done-checks (commands, static-export/schema/selector diff checks, build + e2e, visual check, paperwork) that were copied across `implementer`, `reviewer`, and `CLAUDE.md`. Subagents read the file by path, so they get it whether or not they load project skills. Its last section (main agent only) runs `ponytail:ponytail-review` — or, when the plugin isn't available, a review by the main agent with the same criteria and format — and has two fresh `general-purpose` delegates judge each finding independently: both confirm → accepted, both reject → dropped, split → the user decides.
- `CLAUDE.md` "Model Delegation" replaced by "Agents and Skills".
- Earlier specs (`2026-08-19-triage-agent.md`, `2026-09-09-ui-developer-agent.md`) are left as history.
