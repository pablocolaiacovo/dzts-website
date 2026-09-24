# SEO Auditor Agent

- **Date**: 2026-09-24
- **PR**: _TBD_
- **Status**: Implemented
- **Owner**: main agent (architect tier)

## Goal

Two full SEO audits were run by the main Opus agent in September 2026 (09-03 baseline, 09-23 content-gap follow-up), each following the same procedure: crawl checks, Lighthouse runs, structured-data validation, and a growing pending-items list carried from one audit to the next. That procedure is repeatable and doesn't need architecture-level judgment to execute — it needs a dedicated agent that runs the same checklist consistently, tracks progress against the prior audit, and reports findings with evidence. Move the measurement work off the main agent and onto a new `seo-auditor` subagent.

## Decisions

### Model: Sonnet

The work is checklist-driven measurement: run commands, compare against thresholds and conventions, cite evidence. It doesn't require the judgment calls `reviewer` or `triage` make (Opus). Content-strategy decisions (new page types, competitor gaps, keyword targeting) stay with the Opus main agent — the auditor only surfaces them briefly as "Opportunities" and escalates.

### Read-and-report only, same pattern as triage/reviewer

The auditor never edits repo files, Sanity content, or GitHub. It produces a report; the orchestrator routes each fix to the agent or person that owns that surface (implementer, quick-fix, ui-developer, devops, or the user for content/Search Console/GA4/business directories).

### Baseline-first

Every audit brief includes the previous audit's pending list. The agent reports each prior item as fixed / still open / regressed, with evidence, before listing new findings — this is what makes repeat audits useful instead of restarting from zero each time and re-surfacing already-known issues.

### Local Lighthouse instead of the PageSpeed Insights API

The keyless PageSpeed Insights API hit its daily quota during the September audits. The agent runs `npx lighthouse@12` locally against production URLs (desktop preset and mobile form-factor) for home, `/propiedades/`, and one property detail page instead.

### Distinct scope vs. `reviewer`

`reviewer` judges a PR diff before merge (lint, tests, typecheck on the changed code). `seo-auditor` measures the deployed site (or a full local static build) as users and crawlers see it. A regression the reviewer misses shows up in the next audit; the auditor never reviews diffs.

### Evidence required per finding

Same discipline as `reviewer`: a finding with no URL/command output/Lighthouse metric/HTML snippet behind it is dropped or listed as an open question, not reported as fact.

## Implementation

- **`.claude/agents/seo-auditor.md`** — the agent definition: ground rules (never edit code/content/GitHub, evidence required, baseline-first, distinguish code vs. content vs. off-site issues, no hardcoded domains, scope boundary with `reviewer`), data-gathering commands (production `curl` checks, local Lighthouse runs, local build inspection for unreleased changes), the full audit checklist (crawl/index, on-page, structured data, social, performance, caching/headers, accessibility, local SEO, content quality signals), a three-tier priority scale, a routing table for who applies each fix, the report format (summary, baseline follow-up, new findings, opportunities, commands run, couldn't check), and escalation triggers.
- **`CLAUDE.md`** — added the SEO Auditor row to the Model Delegation table (after Reviewer) and a "Delegate to `seo-auditor` (Sonnet) when" section (after the reviewer section, before "Keep on Opus"), stating the read-only boundary and the distinction from `reviewer`.

## Operational notes

- The orchestrator must pass the previous audit's pending/baseline list in the task brief — the agent has no memory of prior audits on its own and can't rediscover which items were already flagged.
- Search Console, Ahrefs, and GA4 configuration data live behind logins/connectors this agent may not have access to; it reports these as "couldn't check" rather than guessing at their state.
- Running a local build to audit unreleased changes requires real Sanity credentials in `apps/frontend/.env.local` (the static export fetches content at build time) — not available in every environment the agent runs in.
