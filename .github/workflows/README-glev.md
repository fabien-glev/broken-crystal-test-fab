# Glev Continuous — customer setup

This repo ships a `glev-continuous.yml` workflow that runs Glev's Continuous-in-CI
analysis on every push and PR.

## What it does

On each push:

1. **Checks out** the full history (needed for `--baseline-commit` delta scanning).
2. **Installs OpenGrep** (small, single binary).
3. **Calls** `$GLEV_API_URL/ci/continuous-v0.sh` — Glev's hosted scanner-driver.
   That script:
   - Runs OpenGrep with `--baseline-commit` to find **only** problems introduced by
     this change.
   - Runs OpenGrep on the changed files (no baseline) to also find **already-known**
     problems sitting next to your edits — these are surfaced in the report so you
     can fix them while you're in the file, but they don't fail the build.
   - POSTs both finding sets to Glev. Glev runs scoring + exploitability +
     remediation generation, returns an enriched payload.
   - Writes `glev-continuous-summary.md` + `glev-continuous-response.json` and
     exits with `0` (clean) or `1` (exploitable / undefined alerts present).
   - **Posts a `Glev Security Scan` GitHub Check Run** using the workflow's
     `GITHUB_TOKEN` — adds inline annotations on the PR diff (one per
     EXPLOITABLE / UNDEFINED alert) and a Markdown summary.
4. **Uploads** the two artifacts so you can inspect them from the run page.

## Required workflow permission

The job declares (already in `glev-continuous.yml`):

```yaml
permissions:
  contents: read
  checks: write
```

Without `checks: write`, GitHub returns 403 when the hosted script tries to
create the Check Run — the script logs a non-fatal warning and the workflow
still exits with the right code.

## Required secrets

Set these in **Settings → Secrets and variables → Actions** of this repo:

| Secret | Source | Example |
|---|---|---|
| `GLEV_API_URL` | Glev rep | `https://app.glev.ai/functions` |
| `GLEV_TOKEN` | **Glev API key** — issued from the Glev UI: **Settings → API keys → New API key**. Long-lived, revocable from the same page. | `glev_xxxxxx…` |
| `GLEV_WORKSPACE_REF` | Glev rep — workspace UUID | `c1f2a3…` |
| `GLEV_REPO_CONFIG_REF` | Glev rep — repository_configuration UUID | `8b7c6d…` |

> **Issuing the API key.** Log into Glev as the user that should "own" the
> CI runs (recommended: a dedicated `ci-bot@yourcompany` account, not a
> human's personal account). Settings → API keys → New. The key is shown
> **once** — copy it immediately into the GitHub repo secret. If lost,
> revoke the old one and issue a new one.

> **Note.** The hosted CI script auto-detects whether `GLEV_TOKEN` is an
> API key or a Keycloak JWT (used during local dev). Either works.

## Reading the result

After a workflow run, click on the **Glev Security Scan** check. The artifacts tab
contains:

- **`glev-continuous-summary.md`** — one-page Markdown with the alerts table and
  the "Already-known issues nearby" section. Open it directly to read.
- **`glev-continuous-response.json`** — the full structured response with
  annotations, exit code, and counts. Useful for piping into other tools.

A failing check means at least one alert is **EXPLOITABLE** or **UNDEFINED**. Fix
the code (or override locally — your call) and push again.

## Upgrading the runner

The actual scanner + posting logic lives at `$GLEV_API_URL/ci/continuous-v0.sh`.
To pick up improvements (bug fixes, new scanners, better rendering), nothing to do —
the script is fetched fresh on each run.

To opt into a future major version (`continuous-v1.sh`, etc.) Glev publishes, bump
the URL in `glev-continuous.yml`. Inside a major version, breaking changes are
forbidden.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `GLEV_API_URL is required` | Secret not set | Add it in repo settings |
| HTTP 401 from Glev | `GLEV_TOKEN` revoked or wrong | Re-issue from Settings → API keys |
| HTTP 404 from Glev | `WORKSPACE_REF` or `REPO_CONFIG_REF` wrong | Double-check from the Glev app |
| Empty `nearby_debt` | The PR-opener's account lacks read permission on Security Debt | Ask your security team to grant read access |
| `merge-base` warning | `actions/checkout` ran with `fetch-depth: 1` | Keep `fetch-depth: 0` (already set) |
