---
name: verify
description: Checks to run before calling a change done or opening a PR in this monorepo - lint, typecheck, unit tests, studio build, static-export and schema/selector diff checks, build + e2e, visual check of UI changes, spec/docs paperwork, and a ponytail-review quality review whose findings two clean delegates validate. Use after implementing any code change, and whenever asked to verify, test, or check that a change works.
---

# Verify

Run the checks that apply to the change, cheapest first, and report each one as passed, failed (with the relevant output excerpt), or not run (with the reason). "Done" means checked, not assumed. Fix failures at the root cause; never loosen a test to make it pass.

Sections 1–5 check that the change works; section 6 checks that it is right and no bigger than it needs to be. The `reviewer` agent still does the PR review after the PR is open, and SEO/Lighthouse measurement is `seo-auditor`'s.

Section 6 runs only in the main agent: it needs the ability to start subagents (and uses the ponytail plugin when it's installed). Subagents following this file run a subset and say the rest was left to the main agent: `implementer` runs sections 1–5, `reviewer` runs sections 1–3.

## 1. Static checks (every code change)

From the repo root:

```bash
pnpm --filter dzts-website lint
pnpm --filter dzts-website exec tsc --noEmit
pnpm --filter dzts-website test
pnpm --filter dzts-studio exec sanity build   # only when apps/studio/ changed
```

The filter names are the `package.json` `name`s; `--filter frontend` matches nothing and passes silently. The studio uses `exec sanity build` to skip the `prebuild` typegen, which needs a live Sanity connection.

## 2. Diff checks

Against the base branch (`dev` unless the work targets something else):

```bash
git fetch origin dev                              # so origin/dev isn't stale
git diff --name-only origin/dev...HEAD            # plus `git status --short` for uncommitted work
git diff origin/dev...HEAD -- apps/frontend/src | grep -E '^\+.*(cookies\(|headers\(|revalidate|"use server"|NextResponse)'
git diff --name-only origin/dev...HEAD | grep -E 'apps/frontend/src/(app/(.*/)?route\.(ts|js)|(middleware|proxy)\.(ts|js))$'
```

Then confirm, for what the diff touches:

- **Static export**: no API routes, middleware/proxy (Next 16's name for middleware), server actions, or runtime-only APIs (the greps above should print nothing); every new dynamic route segment exports `generateStaticParams()`.
- **Schema**: a change under `apps/studio/schemaTypes/` ships the regenerated `apps/frontend/src/sanity/types.ts` (run `pnpm --filter dzts-studio typegen`, never hand-edit it).
- **Test selectors**: any ID, class, or aria label from the `CLAUDE.md` "Key Selectors Used by Tests" table that changed is updated in `apps/frontend/e2e/`.
- **Conventions that have bitten before**: no `prefers-color-scheme` color CSS, no hardcoded site domains or fallback URLs, only one `priority` image per page, colors from `variables.css` tokens.

## 3. Build + e2e (frontend changes)

```bash
cd apps/frontend && pnpm build && pnpm test:e2e
```

This needs real Sanity credentials in `apps/frontend/.env.local`. Without them the build fails with `Dataset not found` — that is an environment gap, not a bug: report e2e as not run and note that CI's `e2e.yml` runs it against the Preview environment.

## 4. Visual check (UI changes)

After a successful build, serve it with `pnpm --filter dzts-website start` (port 3000) and open the affected pages in the browser at 375px and desktop width; check the layout, the states the change touches, and the console for errors. `serve` ignores `.htaccess`, so Cache-Control, security headers, redirects, and the 404 status can only be checked on production — don't report them from the local server.

## 5. Paperwork

- A significant feature or infra change has its `docs/specs/YYYY-MM-DD-<slug>.md` in the same PR.
- `CLAUDE.md` or README text the change contradicts is updated.

## 6. Quality review + council (main agent only)

0. **Check the plugin.** Before reviewing, check whether `ponytail:ponytail-review` is listed among this session's available skills, and say in the report which path step 1 took. Installing or enabling the plugin is the user's call — mention it when it's missing, don't do it.
1. **Review** the same change range used in section 2 (the branch against `dev`, plus uncommitted work):
   - **Plugin available:** invoke `ponytail:ponytail-review` and keep its numbered findings exactly as written.
   - **Plugin missing:** do the review yourself. Read the diff, then the code it touches (callers of every changed function, the functions it calls, the tests). Look, in this order, for bugs (wrong result, crash, missed edge case, a broken caller), risks (security holes, data loss), problems at the site's real load, risky new logic with no test, real slowness, and code that shouldn't exist or should be smaller (dead code, an existing helper not reused, an abstraction with one use). Every finding needs a concrete case — "this input or situation leads to this wrong result" — or it isn't a finding; no style taste. Number the findings, each with its `path:line`, the problem, the case, and the smallest fix, grouped as Must fix / Should fix / Nice to have, and end with a `Verdict:` line.

   If the review finds nothing (`Looks good. Ship.`), record that and skip the council.
2. **Council.** Start two delegates in parallel with the Agent tool, `subagent_type: "general-purpose"`, fresh context (never a fork), each with the same brief and neither seeing the other's answer. The brief contains only:
   - the repo path and the change range (the `git diff` command to run);
   - the numbered findings, verbatim;
   - the task: "For each finding, read the code it cites and its callers, and answer CONFIRMED or REJECTED with one or two sentences: the concrete input or situation that shows it is real, or the code that shows it isn't. Also say whether the proposed fix is the smallest one that works. Read only — don't edit files, run builds, change git state, or touch GitHub. `CLAUDE.md` describes the project's conventions."

   Leave out your own opinion of the findings, the review's verdict line, and why the change was made, so the delegates judge the code and not the argument.
3. **Tally** each finding:
   - both CONFIRMED → **accepted**;
   - both REJECTED → **dropped** (list it in one line with the reason, so it isn't raised again);
   - split → **disputed**: show both reasons; the user decides.

   If a delegate fails or returns no verdict for a finding, that finding is disputed, not accepted.

Section 6 proposes; it doesn't fix. Accepted findings are fixed like any other change (directly, or by `implementer`), and the fix goes through this skill again from section 1.

## Report

A short list: each check above that applied, with passed / failed + excerpt / not run + why. For section 6, which review ran (plugin or main-agent fallback), the accepted, disputed, and dropped findings with the council's reasons, and the review's `Verdict:` recomputed from the accepted findings, which keep their original numbers. Disputed findings are listed as pending the user's decision, and while any are pending the verdict can't be `Ship.` End with what wasn't verified.
