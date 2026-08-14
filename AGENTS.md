# AGENTS.md — Greendeal Compliance (Frontend Prototype)

This file is read by the coding agent every session. Keep it accurate.
Full field-level domain spec lives in `DOMAIN.md`. Future REST contract
lives in `API_CONTRACT.md`. Do not duplicate their content here.

---

## 1. Product

**Name:** Greendeal Compliance
**Subtitle:** Product & Packaging Compliance Platform

**Positioning:** Greendeal Compliance helps manufacturers collect, verify,
trace, and use product-level compliance data from suppliers to assess
packaging compliance and generate auditable compliance documentation.

**Core promise:** "Maintain product compliance data once. Reuse it across
customers, packaging items, and compliance assessments."

**Connects:** Suppliers, Manufacturers, Compliance teams.

**End-to-end workflow this app demonstrates:**
Supplier maintains product data → publishes → Manufacturer creates
packaging item → selects supplier products → requests specific data →
Supplier approves selected data → Manufacturer gets authorized access →
packaging completeness check → PPWR assessment → calculation +
provenance → conformance document → supplier data version change →
impact analysis / reassessment.

---

## 2. Current phase — READ THIS FIRST

This is a **frontend-only prototype**. There is no real backend yet.

- Use Next.js (App Router), React, TypeScript only.
- Do **NOT** build Spring Boot, NestJS, PostgreSQL, real auth, real object
  storage, a real job queue, a real compliance engine, or a real PPWR
  regulatory rules engine.
- Use mock/in-memory data exclusively, behind a service layer (see §5).
- The eventual production architecture is:
  `Next.js → REST API → Java Spring Boot → PostgreSQL / Object Storage /
  Job Queue / Compliance Engine / Document Generation`
  — see `API_CONTRACT.md` for how today's mock services map to that.

---

## 3. Working rules (follow strictly)

- **Build one stage at a time**, exactly as scoped in the prompt you're
  given. Do not pre-build later stages "while you're at it."
- **Stop after each stage** and report: what was implemented, routes
  created, components created, mock data added, and what remains. Wait
  for the next prompt before continuing.
- **Preserve prior functionality.** Don't refactor earlier stages unless
  the current prompt explicitly asks for it.
- **Keep mock data consistent** across stages — reuse the same sample
  organizations/products defined in `DOMAIN.md` §Sample Data, don't
  invent parallel data sets.
- **Keep terminology consistent** with `DOMAIN.md`. Don't rename entities
  or fields ad hoc.
- **Keep Greendeal Compliance branding consistent** (see §4).
- After each stage: run the app, verify TypeScript compiles clean,
  verify no console errors, verify responsive layout, then report and
  stop.

---

## 4. Branding & UX principles

The UI is a **modern enterprise B2B SaaS compliance product** — not a
generic sustainability dashboard, not a consumer app.

Brand feel: Professional, Trustworthy, Modern, Environmental,
Data-driven, Audit-focused, Enterprise-ready.

Core experience pillars: Supplier Data + Controlled Data Sharing +
Packaging Composition + Compliance Assessment + Evidence & Provenance.

**Do:**
- Prioritize trust, clarity, data provenance, auditability
- Clear ownership and clear data-sharing permissions
- Clear compliance status at every level

**Avoid:**
- Consumer-app aesthetics, excessive animation
- Decorative dashboards, unnecessary charts, generic filler content

**Status icons (use consistently, do not invent alternatives):**

| Icon | Meaning |
|---|---|
| ✓ | Complete / Approved |
| ⚠ | Missing |
| ⏳ | Pending |
| ✕ | Failed |
| 🔒 | Not authorized |
| ○ | Not applicable |
| ⌛ | Expired |

The Greendeal Compliance logo/name must appear in the app shell at all
times.

---

## 5. Mock data architecture (mandatory structure)

Do **not** scatter hardcoded objects inside React components.

```
/lib
  /types           → all TypeScript interfaces (see DOMAIN.md for the list)
  /mock-data        → static mock data files, one per entity family
  /services
    mockProductService.ts
    mockPackagingService.ts
    mockRequestService.ts
    mockAssessmentService.ts
    mockDocumentService.ts
```

Rules:
- Components **never** import `/mock-data` directly. They only call
  functions in `/services`.
- Every service function is **async** (`Promise<T>`), even though it
  currently just returns local data — this is what makes swapping in
  real REST calls later a one-file change. See `API_CONTRACT.md` for the
  target endpoint each function maps to.
- Service function signatures should look like a real API call: typed
  params in, typed DTO-shaped data out. No passing whole mock arrays
  into components "just this once."

---

## 6. Data ownership rules (never violate in UI or data model)

- **Supplier owns:** Supplier Product, Product Versions, Evidence,
  source compliance data.
- **Manufacturer owns:** Packaging Item, Packaging Components,
  Compliance Assessments, Assessment/Conformance Documents.
- Manufacturer **never duplicates** supplier source data. The
  relationship is always:

  `Packaging Component → references Supplier Product → references
  Product Version → (authorized data access) → used by Compliance
  Assessment`

- Make this reference chain visible in the UI wherever supplier data is
  shown inside a manufacturer screen (e.g. "Source: PET Bottle 500ml v1.0,
  PET Solutions GmbH").

---

## 7. Data access / approval model

- A **Data Request** always specifies: requesting org, supplier org,
  supplier product, packaging item, requested attributes (field-level,
  not "share everything"), purpose, request date, status.
- Approval is **scoped to requested attributes only** — a supplier can
  approve a subset of what was requested.
- The manufacturer only ever sees attributes that were explicitly
  approved. Anything not approved must render as 🔒 Not authorized, not
  simply be hidden or blank.

---

## 8. Data status model (use these exact enum values)

```
Field status:        NOT_APPLICABLE | NOT_PROVIDED | PROVIDED | EXPIRED
                      | PENDING_VERIFICATION | VERIFIED
Data Request status:  DRAFT | PENDING | APPROVED | REJECTED | EXPIRED
Assessment status:    DRAFT | PROCESSING | COMPLETE | FAILED
                      | REQUIRES_REVIEW
Compliance finding:   PASS | WARNING | FAIL | MISSING | NOT_APPLICABLE
```

Never collapse these into a generic boolean or a single "status: string"
without the enum — the distinctions (e.g. NOT_APPLICABLE vs
NOT_PROVIDED) are a core product requirement, not incidental detail.

---

## 9. Roles (prototype only — no real auth)

A role switcher toggles between:
- **Supplier** nav: Dashboard, Products, Data Requests, Evidence
- **Manufacturer** nav: Dashboard, Packaging Items, Data Requests,
  Assessments, Documents

Do not implement real authentication, sessions, or user accounts.

---

## 10. Reference docs

- `DOMAIN.md` — full entity/field-level domain model + sample data
- `API_CONTRACT.md` — mock service → future REST endpoint mapping,
  updated as each stage is built
- `SPEC.md` — original full product spec (source of truth these files
  were distilled from)
