# providers — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `code-analysis.md` (providers note), `commands`/extension analysis.

## Q1 🔴 `package.json` view wiring not determinable from this folder

**Observation.** This folder defines the provider classes and their view ids (`gatomia.views.*`, `gatomia.hooksPanel`), but the contribution points — `package.json` `views` / `viewsContainers` and which views are actually contributed vs. dormant — live outside the folder.

**Question.** Which views/containers are contributed in `package.json`, and which providers are registered in `extension.ts`? (Needed to know which surfaces ship vs. are dead.)

**Resolution path.** Confirm during the `commands`/extension analysis (the extension entry wires providers + commands).

## Q2 🟡 Scaffold/demo views

`simple-view-provider.ts`, `interactive-view-provider.ts`, and `overview-provider.ts` look like scaffolding/demo views. Are any still registered, or are they dead code to remove?

## Q3 🟡 Welcome post-install re-probe scope

The 5 s post-install re-probe (`POST_INSTALL_REPROBE_DELAY_MS`) appears tied to the install-terminal flow, not every clipboard copy. Confirm the exact trigger with `panels/welcome-screen-panel`.

---

> The provider behaviors (chat binding, spec tree, hooks panel, welcome) are 🟢 and faithful. Only the **contribution wiring** (Q1) and **dormant scaffolds** (Q2) need confirmation from `package.json`/`extension.ts`.
