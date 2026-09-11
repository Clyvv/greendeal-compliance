# DEMO_SCRIPT_EXTENDED.md — Supply-Chain Adoption Scenarios Demo Script

Companion to the original Final Demo Script (the core native
Supplier ↔ Manufacturer flow). This script covers that same native
flow plus three additional real-world scenarios: a manufacturer whose
supplier isn't on Greendeal yet, a supplier receiving a request from
outside Greendeal, and a manufacturer who already has supplier data on
hand from another source.

Steps 1–14 are a condensed walkthrough of the core native flow; the
rest cover the additional scenarios. Calculation drill-down, PPWR
conformance document generation, and supplier version-change impact
analysis are not covered here — this script stops at what the
prototype currently supports.

Suitable for demoing to a stakeholder who has seen the original core
demo but not these additional scenarios.

---

## Part 1 — Both parties use Greendeal

1. Land on the app — you're on the **Supplier** dashboard by default.
2. Open **Products** → **PET Bottle 500ml**.
3. Show the full compliance profile tabs: Identification, Physical
   Properties, Circularity & PPWR, Chemical Safety, Specialized
   Domain, Evidence — note the **provenance badge** on every tab
   ("Source: PET Solutions GmbH · Supplier-Maintained ✓ Verified") —
   even the supplier's own data visibly states who's vouching for it.
4. Open the **Evidence** tab — show supporting documents and their
   validity dates.
5. Switch to **Manufacturer** → **Packaging Items** → **Coca-Cola
   500ml**.
6. Show the three packaging components (Bottle, Label, Cap) — each
   card's "Source: …" line + provenance badge shows the same
   reference chain (Component → Supplier Product → Version →
   Supplier).
7. Click **Add Component** → **Find Greendeal Supplier Product** —
   search and select any published product, give it a role, and add
   it.
8. On the new component's card, click **Request Data**.
9. Select specific field sections (not "everything") + a purpose,
   review the summary, and submit.
10. Switch to **Supplier** → **Data Requests** — the new request
    appears with an **Origin** badge reading **"Greendeal Manufacturer
    Request"**.
11. Open it. Note the live **"Approve Request"** breakdown: check/
    uncheck a field and watch the "will be shared" / "will NOT be
    shared" lists update instantly. Also note the **coverage** badges
    next to each field ("Available ✓" / "Missing") — a quick check of
    what the supplier already has on file.
12. Click **Approve & Share**.
13. Switch to **Manufacturer** → the packaging item — the component
    now shows **Authorized**, and the **Data Readiness** panel shows a
    full per-field checklist, all ✓.
14. Click **Run PPWR Assessment** (only enabled once every native
    component is fully authorized) → view the results: Overall
    Status, per-section findings.

---

## Part 2 — Manufacturer uses Greendeal; supplier does not

15. On the same packaging item, click **Add Component** again, and
    this time choose **Add External Supplier Product**.
16. Fill in what's known: Supplier Company Name, Contact Name, Email,
    Country, Product Name, Material Family, Known Weight — everything
    a manufacturer would realistically know about a supplier who
    isn't on Greendeal yet.
17. Submit — the new component card clearly reads **"External
    Supplier Product"**, shows **Source: Manufacturer Provided ·
    Manufacturer-Provided ⏳ Unverified**, and **"No registered
    supplier"** instead of a normal authorization pill (it never
    claims a supplier exists to authorize anything).
18. Note the banner: *"This product is not currently maintained by
    the supplier in Greendeal."* Enter an email and click **Invite
    Supplier** — a simulated confirmation toast appears ("Invitation
    sent to …"). Nothing further happens — this is a lightweight
    invite, not a full onboarding flow.
19. Back on the packaging item, note the **Data Readiness** panel now
    shows this component as **⚠ Unverified** with its own per-field
    breakdown ("⚠ Material Family — Manufacturer Provided", "✕
    Circularity & Chemical Safety data Missing — not available from
    this source") — and the overall % has dropped to reflect it
    honestly. The "Run PPWR Assessment" button is still available,
    gated on the native components alone.
20. Run the assessment again — the results page now shows an amber
    **"This assessment includes unverified, manufacturer-provided
    data"** banner naming the component, its provenance badge, and a
    **"View Component →"** link back to its card. Every section notes
    it includes an unverified component.

---

## Part 3 — Supplier uses Greendeal; request originates outside it

21. Switch to **Supplier** → **Request Links**. Copy the **Supplier
    Link** (`/request/pet-solutions`) and a **Product Link** for PET
    Bottle 500ml.
22. Open the supplier link in a fresh/incognito tab — note there is
    **no app shell, no role switcher, no login** — just "Greendeal
    Compliance / Request Compliance Information" branding, the
    supplier's name, and a list of their published products.
23. Click a product — you land on the product-specific request page
    with the product preselected.
24. Fill in **Your Details** (Company Name, Requester Name, Business
    Email, Country, optional Reference Number), then select specific
    fields under **Requested Information** (grouped exactly like the
    internal flow) plus **Purpose**. Selection is field-level here
    too — never all-or-nothing.
25. Click **Submit Request** — a confirmation appears: *"Request
    Submitted — Your request has been sent to [Supplier], … Reference:
    REQ-XXXX"*. Nothing about the supplier's actual compliance data is
    ever shown on this page or returned by the submission.
26. Switch back to **Supplier** → **Data Requests** — the new request
    appears with an **Origin** badge reading **"External Customer
    Request"**, and the requester's company name (not a Greendeal
    org) instead.
27. Open it — note the **Requester Details** card (contact name,
    email, country, their own reference number), the coverage
    comparison, and the same live "Approve Request" share/don't-share
    breakdown as Part 1. Approve it (or reject it) exactly like a
    native request.
28. Confirm the post-approval banner correctly names the external
    requester ("… now available to [Company Name]") — never
    "undefined", never crashes.

---

## Part 4 — Manufacturer already has supplier data

*(Largely demonstrated already in Part 2 — this section calls out the
three specific places the rule is enforced.)*

29. Point back to the External Supplier Product component card from
    Part 2 — Source: Manufacturer Provided, ⏳ Unverified, "No
    registered supplier". Never rendered as if it were authorized
    supplier data.
30. Point back to the **Data Readiness** panel — the unverified
    component visibly pulls the overall % down and is labeled
    distinctly from both "Complete" and "Not Requested".
31. Point back to the **Assessment Results** page — the unverified-data
    banner and per-section notes make clear which findings may be
    incomplete because of it.

---

## What this script deliberately does not cover

- Calculation drill-down, PPWR conformance document generation, and
  supplier version-change impact analysis — not built yet.
- A full external-supplier "claim/onboarding" flow (a real Supplier
  account picking up and taking ownership of an externally-entered
  product) — intentionally out of scope for this prototype; only the
  invite step is simulated.
- A dedicated calculation view with a full Assessment → Calculation →
  Component → Supplier Product → Version → Evidence navigation chain —
  not built; the assessment results page's "View Component" link is a
  deliberately scoped-down stand-in.
