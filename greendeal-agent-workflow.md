# Working with the Greendeal Compliance Spec in opencode / Cline

## 1. Where the big prompt goes

Don't paste the whole spec as your first chat message and hit enter. Split it:

**`AGENTS.md`** (repo root) — the *durable* parts of the spec that apply to every future prompt:
- Product name, positioning, domain model (sections 1, 5–9)
- Branding/UX principles (section 4, 10)
- Data ownership rules (section 23–24)
- Data status model (section 25)
- Mock data architecture rules (section 22)
- Development rules (section 27)

This file is read automatically by opencode (and Cline) on every session, so you never have to re-paste domain rules — the agent just knows them.

**Your first chat prompt** — only Stage 0, plus a pointer:
> "Read AGENTS.md for full context. Implement Stage 0 (application foundation) as described there. Stop after Stage 0 and report what was built."

**Each subsequent stage** — its own short prompt (see §3), *not* the full original spec again.

Keep the original spec doc (`SPEC.md` or similar) in the repo too, un-summarized, as the source of truth `AGENTS.md` is distilled from — useful for you and for later Spring Boot work.

## 2. AGENTS.md template

```markdown
# AGENTS.md — Greendeal Compliance (Frontend Prototype)

## Product
Greendeal Compliance — Product & Packaging Compliance Platform.
Positioning: "Maintain product compliance data once. Reuse it across
customers, packaging items, and compliance assessments."

## Current phase
Frontend-only prototype. NO backend. Use mock/in-memory services only.
Future: Next.js -> REST -> Java Spring Boot (not built yet — see
"Future backend contract" below).

## Tech stack
- Next.js App Router, React, TypeScript
- No real auth, no real DB, no real object storage
- Mock service layer only (see /lib/services)

## Domain model
[Paste section 5 entity list + short definitions]

## Data ownership rules (never violate)
- Supplier owns: Supplier Product, Product Versions, Evidence, source data
- Manufacturer owns: Packaging Item, Components, Assessments, Documents
- Manufacturer NEVER duplicates supplier source data — always references
  Supplier Product -> Product Version -> authorized data

## Data status model
Field status: NOT_APPLICABLE | NOT_PROVIDED | PROVIDED | EXPIRED |
  PENDING_VERIFICATION | VERIFIED
Request status: DRAFT | PENDING | APPROVED | REJECTED | EXPIRED
Assessment status: DRAFT | PROCESSING | COMPLETE | FAILED | REQUIRES_REVIEW
Finding: PASS | WARNING | FAIL | MISSING | NOT_APPLICABLE

## Mock data architecture rules
- Centralize types in /lib/types, mock data in /lib/mock-data
- All data access goes through /lib/services/mock*Service.ts
- Components must NEVER import mock data directly — only via services
- Services must be structured so swapping mock -> real REST call later
  means editing ONLY the service file, not any component

## UX principles
- Enterprise B2B, professional, audit-focused — not a consumer app
- No decorative charts/animation, no filler content
- Status icons: ✓ Complete, ⚠ Missing, ⏳ Pending, ✕ Failed,
  🔒 Not authorized, ○ Not applicable, ⌛ Expired

## Working rules
- Build ONE stage at a time. Stop after each stage and report:
  what was implemented, routes/components created, mock data added,
  what remains.
- Do NOT proceed to the next stage automatically.
- Preserve all previously built functionality — no silent refactors
  of earlier stages unless the current prompt asks for it.
- Keep terminology and branding consistent with this file.

## Future backend contract (for later Spring Boot work — not active yet)
Next.js -> REST API -> Java Spring Boot -> PostgreSQL / Object Storage /
Job Queue / Compliance Engine / Document Generation.
Service layer signatures in /lib/services should map 1:1 to future
REST endpoints (see §5 below for how to prep this).
```

Keep this file **under ~150 lines**. If it grows past that, split into
`AGENTS.md` (rules + working conventions) and `DOMAIN.md` (full field-level
spec), and reference `DOMAIN.md` from `AGENTS.md`.

## 3. PR-sized prompting — stage by stage

Your spec already stages things well (0–10), but some stages (1, 8, 9) are
still too big for one clean PR. Split further:

| Spec stage | Suggested PR-sized prompts |
|---|---|
| Stage 0 | 1 prompt (shell, nav, role switcher) — it's already scoped right |
| Stage 1 | **Split into 2**: (a) Supplier dashboard + product list, (b) Create Product wizard steps 1–7 |
| Stage 2 | 1 prompt (Product Details + Version History) — maybe split evidence UI into its own prompt if it's fiddly |
| Stage 3 | 1 prompt |
| Stage 4 | 1 prompt (this one's naturally small and well-scoped) |
| Stage 5 | 1 prompt |
| Stage 6 | 1 prompt |
| Stage 7 | 1 prompt |
| Stage 8 | **Split into 2**: (a) Calculation breakdown UI, (b) Provenance drill-down navigation |
| Stage 9 | 1 prompt |
| Stage 10 | **Split into 2**: (a) Version change + notification, (b) Impact analysis + recalculate |

**Prompt template for each stage**, once AGENTS.md exists:

```
Read AGENTS.md. We are on Stage <N>: <name>.

[Paste ONLY that stage's section from the spec — e.g. section 12 for
Stage 1a]

Build this on top of the existing app. Do not modify Stage 0–<N-1>
functionality except where necessary to wire this in.

When done: run the app, check for TypeScript/console errors, confirm
responsive layout, then report what was built and stop.
```

This keeps every prompt small, keeps the agent's context focused, and
keeps your diffs reviewable — which is the actual point of PR-sizing:
you want to read and approve each chunk, not rubber-stamp a 2,000-line
agent dump.

## 4. Why this matters for cost too

Since you're on pay-per-token (Sonnet 5 via opencode), staged prompts also
save money — an agent given the entire 27-section spec at once will burn
tokens re-reading and cross-referencing sections it doesn't need yet for
Stage 0. AGENTS.md solves this because it's loaded once as durable context;
your per-stage prompts stay short.

## 5. Prepping for the future Spring Boot handoff

Even though you're not building the backend yet, a few habits now save
real pain later:

- **Service layer = future API contract.** Each `mock*Service.ts` function
  signature (params in, shape out) should look like what a REST call
  would need — e.g. `getSupplierProducts(supplierId: string): Promise<SupplierProduct[]>`
  not a synchronous function reading a local array directly in a component.
  Async signatures now = no rewiring later, just swap the implementation.
- **Types = future DTOs.** Keep your TypeScript interfaces (`SupplierProduct`,
  `ComplianceAssessment`, etc.) clean and close to what a Java DTO would
  look like (flat-ish, explicit status enums, ISO date strings) — you'll
  hand these to your Spring team as the de facto API spec.
- **Add a stub `API_CONTRACT.md`** as you go, logging each service method
  and its intended REST shape (`GET /api/supplier-products/:id`, etc.) —
  costs a couple minutes per stage, saves a full spec-writing pass later.
- When the real backend is ready, your **second AGENTS.md** (for the
  Spring repo, opened in IntelliJ) should cross-reference this same
  domain model and status enums verbatim, so both agents — frontend in
  VS Code, backend in IntelliJ — share identical vocabulary and don't
  drift into inconsistent naming.
