---
name: triage
description: PR and issue triage for this repo. Use to assess which open PRs are ready to merge, rank open PRs and issues by priority, spot blockers (failing checks, conflicts, missing conventions), match Dependabot alerts to pending PRs, and recommend a merge order and whether to cut a release.
---

# Triage

The deliverable is a **triage report**: which PRs are ready to merge, in what order, what blocks the rest, and how open issues rank against each other. Triage decides and recommends; acting on it is a separate step the user approves.

## Ground Rules

- A triage run doesn't merge, close, reopen, or push. Merges follow the `devops` skill after the user approves them; code fixes go to `implementer` or are done directly.
- Mutations allowed **only when the user explicitly asks**: applying/removing labels and posting triage comments. Create missing priority labels idempotently (`gh label create ... || true`).
- Always pin the repo: `gh ... -R pablocolaiacovo/dzts-website`. This checkout has a stale `upstream` remote (`Euge-Saravia/proyectodzts-inmobiliaria`); never read from or mutate it.
- Ground every claim in `gh` output you actually ran. Never guess a check's status or a PR's mergeability — query it.
- If you can't access something (e.g. Dependabot alerts return 403 for missing scopes), say exactly what was inaccessible instead of working around it silently.

## Repo Context You Triage Against

- **Branch flow**: feature PRs (`feat/*`, Dependabot branches) target `dev` and are **squashed**. The release PR `dev → main` carries the `release` label and is merged with a **merge commit** — if you find a release PR, flag its merge method; never treat it as a normal PR.
- **Checks**: `ci` (lint + unit + typecheck + studio build) must pass on every PR. `e2e` only triggers when `apps/frontend/**`, the root `pnpm-lock.yaml` / `pnpm-workspace.yaml`, or its workflow file changes — a missing e2e run on a docs-only, studio-only, or Actions-only PR is **expected, not a blocker**; verify against the changed paths before flagging. CodeQL is informational, not required. Vercel preview checks are auxiliary.
- **Conventions**: significant feature/infra PRs should include a spec in `docs/specs/YYYY-MM-DD-<slug>.md` — its absence on a significant PR is a (soft) blocker worth flagging. Small fixes and routine dependency bumps are exempt.
- **Dependabot PRs**: arrive weekly against `dev`, grouped (`next-ecosystem`, `react`, `sanity`, `eslint`, `bootstrap`) plus individual ungrouped ones. Green CI + green e2e (when triggered) = ready. A `@playwright/test` bump is self-syncing with the e2e container — no extra scrutiny needed.
- **Unreleased work**: `dev` ahead of `main` means shipped-to-dev but not in production. Part of triage is reporting the release backlog (`git log --first-parent --oneline origin/main..origin/dev`) and recommending when a release PR is warranted.

## Priority Framework

Rank using these tiers (1 = highest). Within a tier, prefer smaller/older/unblocking items first.

1. **Security**: PRs fixing vulnerabilities (check `gh api repos/pablocolaiacovo/dzts-website/dependabot/alerts --jq` for open alerts and match them to dependency PRs), CodeQL findings, exposed secrets.
2. **Production breakage**: bugs affecting the live site, failed deploys, broken CI on `dev`/`main`.
3. **Unblocking**: PRs or issues that other open work depends on (including a pending `dev → main` release when the backlog is large or contains security fixes).
4. **Dependency hygiene**: routine Dependabot bumps — cheap to merge, get stale and conflict-prone if left open; batch-recommend them in one pass.
5. **Features and improvements**: rank by user impact on the site (property browsing > content management > internal tooling).
6. **Chores/docs**: lowest, but flag any that are trivially green and mergeable — zero-cost wins.

Priorities you cannot resolve from the repo (business urgency, content-owner needs) are **not yours to invent** — mark them "needs owner input" rather than guessing.

## Merge-Readiness Checklist (per PR)

A PR is **ready** only if all of these hold; otherwise list exactly which failed:

1. Targets the right base (`dev` for features/deps; `main` only for the labeled release PR).
2. Required checks green — `gh pr checks <n>`; distinguish *failed* from *not triggered by path filter*.
3. `MERGEABLE` per `gh pr view <n> --json mergeable,mergeStateStatus` (no conflicts).
4. Not a draft; no requested changes in reviews.
5. Convention compliance: spec file for significant changes; sensible squash title (it becomes the changelog line in the auto-generated release notes).

## Data Gathering

```bash
gh pr list -R pablocolaiacovo/dzts-website --state open --json number,title,baseRefName,headRefName,isDraft,mergeable,author,labels,createdAt,files
gh pr checks <n> -R pablocolaiacovo/dzts-website
gh issue list -R pablocolaiacovo/dzts-website --state open --json number,title,labels,createdAt,body
gh api repos/pablocolaiacovo/dzts-website/dependabot/alerts --jq '[.[] | select(.state=="open")] | group_by(.security_advisory.severity) | map({severity: .[0].security_advisory.severity, count: length})'
git fetch origin && git log --first-parent --oneline origin/main..origin/dev
```

## Report Format

1. **TL;DR** — one paragraph: what to merge now, what's blocked, whether to cut a release.
2. **Ready to merge** — ordered list (the recommended merge order), each with a one-line justification.
3. **Blocked** — per PR: the specific failing checklist items and which agent/person should resolve each.
4. **Issues ranked** — priority tier per issue with a one-line reason; "needs owner input" where business context is missing.
5. **Release recommendation** — size/content of the `dev → main` backlog and whether it warrants a release now.

Label scheme (when asked to apply labels): `priority: high` (`B60205`), `priority: medium` (`FBCA04`), `priority: low` (`C2E0C6`).

## Report, don't resolve

Put in the report rather than acting on: a PR that needs code or pipeline changes to become mergeable (say what change); two items whose relative priority hinges on business context the repo doesn't have; repo state that contradicts the conventions above (e.g. an unlabeled PR targeting `main`).
