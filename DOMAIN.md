# DOMAIN.md — Greendeal Compliance Domain Model

Field-level reference for all entities. `AGENTS.md` links here — don't
duplicate this content there. Update this file if a stage prompt changes
or extends the model; it must stay the single source of truth for types.

---

## 1. Entity overview

```
Organization (Manufacturer | Supplier)

Supplier Product
  └─ Product Version (versioned snapshot, for provenance/audit)
       └─ Production Batch / Lot (batch-specific, separate from product-level attrs)
       └─ Evidence (documents/certs supporting specific attributes)

Packaging Item (owned by Manufacturer)
  └─ Packaging Component (references a Supplier Product + Version)

Data Request (Manufacturer → Supplier, field-level)
  └─ Data Approval (Supplier response, scoped to approved fields)

Compliance Assessment (of a Packaging Item)
  └─ Compliance Calculation (shows the math)
  └─ Compliance Finding (PASS/WARNING/FAIL/MISSING per section)
  └─ Compliance Document (generated conformance doc)
```

Key rule: **Product-level fields and batch-level fields are conceptually
separate.** E.g. Material Family belongs to the product; Batch/Lot Number
belongs to a specific Production Batch.

---

## 2. Supplier Product Compliance Profile — full field list

### Section 1 — Product & Supplier Identification
| Field | Notes |
|---|---|
| Product Name | |
| Supplier SKU | |
| GTIN / EAN | |
| Production Batch / Lot Number | belongs to Production Batch, not Product |
| Country of Origin | |

### Section 2 — Physical & Structural Properties
| Field | Notes |
|---|---|
| Material Family | e.g. Plastic |
| Specific Material Composition | e.g. PET |
| Component Net Weight | grams |
| Dimensions | e.g. 65mm × 65mm × 210mm |
| Thickness | mm |
| Packaging Function Type | e.g. Primary Packaging |

### Section 3 — Circularity & PPWR Metrics
| Field | Notes |
|---|---|
| Total Recycled Content % | |
| Post-Consumer Recycled (PCR) Yield | |
| Pre-Consumer / Industrial Recycled Yield | |
| Design-for-Recycling (DfR) Grade | e.g. A |
| Reusability Status | e.g. Not reusable |

### Section 4 — Chemical Safety & Substance Restrictions
| Field | Notes |
|---|---|
| Heavy Metal PPM Concentration | |
| Intentionally Added PFAS Flag | |
| REACH SVHC Declaration Status | |
| ECHA SCIP Registration Code | |
| RoHS Directive Compliance Status | |

### Section 5 — Specialized Domain Metrics
| Field | Notes |
|---|---|
| Food Contact Material (FCM) Approval Status | |
| Overall Migration Limit (OML) Test Score | |
| Sterilization Method Compatibility Profile | |

Status values for these fields (do not default to null/boolean):
`NOT_APPLICABLE | NOT_PROVIDED | PROVIDED | EXPIRED |
PENDING_VERIFICATION | VERIFIED`. "Not applicable" and "required info
missing" are meaningfully different states — always render distinctly.

### Section 6 — Evidence, Governance & Lifespan
| Field | Notes |
|---|---|
| Supporting Document PDF Attachments | |
| Issuing Laboratory Authority Name | |
| Document Issue Date | |
| Data Validity Expiration Date | |
| Data / Schema Version Identifier | |

**Evidence** is a first-class object, not a file attachment field:
```
Evidence {
  documentName: string
  evidenceType: string          // e.g. "Recycled Content"
  issuingAuthority: string
  issueDate: string             // ISO date
  expirationDate: string        // ISO date
  status: EvidenceStatus
  supportedAttributes: string[] // e.g. ["Total Recycled Content", "PCR Content"]
  productVersion: string        // which Product Version this evidence supports
}
```

---

## 3. TypeScript types to create in `/lib/types`

```ts
type Organization = {
  id: string
  name: string
  type: 'MANUFACTURER' | 'SUPPLIER'
  country?: string
}

type FieldStatus =
  | 'NOT_APPLICABLE' | 'NOT_PROVIDED' | 'PROVIDED' | 'EXPIRED'
  | 'PENDING_VERIFICATION' | 'VERIFIED'

type SupplierProduct = {
  id: string
  supplierId: string
  name: string
  sku: string
  gtin?: string
  countryOfOrigin?: string
  currentVersionId: string
  status: 'DRAFT' | 'PUBLISHED'
  completenessPercent: number
  lastUpdated: string
}

type ProductVersion = {
  id: string
  productId: string
  versionLabel: string          // e.g. "1.0", "2.0"
  createdAt: string
  changeSummary?: string
  physical: PhysicalProperties
  circularity: CircularityMetrics
  chemicalSafety: ChemicalSafetyData
  specializedDomain: SpecializedDomainData
  evidenceIds: string[]
}

type ProductionBatch = {
  id: string
  productVersionId: string
  lotNumber: string
}

type PhysicalProperties = {
  materialFamily: string
  specificMaterial: string
  netWeightGrams: number
  dimensions: string
  thicknessMm: number
  packagingFunction: string
}

type CircularityMetrics = {
  totalRecycledContentPercent: number
  pcrYieldPercent: number
  preConsumerYieldPercent: number
  dfrGrade: string
  reusabilityStatus: string
}

type ChemicalSafetyData = {
  heavyMetalPpm?: number
  pfasStatus: FieldStatus
  pfasIntentionallyAdded: boolean | null
  reachSvhcStatus: FieldStatus
  scipCode?: string
  rohsStatus: FieldStatus
}

type SpecializedDomainData = {
  fcmStatus: FieldStatus
  omlTestScore?: string
  sterilizationProfile?: string
}

type EvidenceStatus = 'VALID' | 'EXPIRED' | 'PENDING_VERIFICATION'

type Evidence = {
  id: string
  productVersionId: string
  documentName: string
  evidenceType: string
  issuingAuthority: string
  issueDate: string
  expirationDate: string
  status: EvidenceStatus
  supportedAttributes: string[]
}

type PackagingItem = {
  id: string
  manufacturerId: string
  name: string
  sku: string
  market: string
  packagingType: string
  componentIds: string[]
  createdAt: string
}

type PackagingComponent = {
  id: string
  packagingItemId: string
  role: string                  // e.g. "Bottle", "Label", "Cap"
  supplierProductId: string
  productVersionId: string
  authorizationStatus: 'NOT_REQUESTED' | 'PENDING' | 'AUTHORIZED' | 'REJECTED'
  dataAvailability: 'COMPLETE' | 'PARTIAL' | 'MISSING'
}

type DataRequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

type DataRequest = {
  id: string
  requestingOrgId: string
  supplierOrgId: string
  supplierProductId: string
  packagingItemId: string
  requestedAttributes: string[]  // flat list of field keys, grouped by section in UI
  purpose: string
  requestDate: string
  status: DataRequestStatus
}

type DataApproval = {
  id: string
  dataRequestId: string
  approvedAttributes: string[]   // subset of requestedAttributes
  decidedAt: string
  decidedBy?: string
}

type AssessmentStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETE' | 'FAILED' | 'REQUIRES_REVIEW'
type Finding = 'PASS' | 'WARNING' | 'FAIL' | 'MISSING' | 'NOT_APPLICABLE'

type ComplianceAssessment = {
  id: string                    // e.g. "PPWR-2026-000182"
  packagingItemId: string
  status: AssessmentStatus
  overallResult: 'COMPLIANT' | 'NON_COMPLIANT' | 'INCOMPLETE'
  findings: Record<string, Finding>  // section name -> Finding
  createdAt: string
}

type ComplianceCalculation = {
  id: string
  assessmentId: string
  metric: string                 // e.g. "Recycled Content"
  componentBreakdown: {
    componentId: string
    productVersionId: string
    contributionValue: number
    contributionLabel: string    // e.g. "18.2g × 35% = 6.37g"
  }[]
  resultValue: number
  resultLabel: string
}

type ComplianceDocument = {
  id: string
  assessmentId: string
  generatedAt: string
  status: 'READY' | 'GENERATING'
}
```

---

## 4. Sample organizations

| Org | Type |
|---|---|
| Coca-Cola | Manufacturer |
| PET Solutions GmbH | Supplier |
| LabelTech GmbH | Supplier |
| PolyCap GmbH | Supplier |

---

## 5. Sample supplier products (seed data)

**PET Bottle 500ml** — Supplier: PET Solutions GmbH
- SKU: PET-500, GTIN: 04012345678901, Country: Germany
- Material: Plastic / PET, Weight: 18.2g, Dimensions: 65×65×210mm, Thickness: 0.35mm
- Function: Primary Packaging
- Recycled Content: 35% total (30% PCR, 5% pre-consumer), DfR: A, Reusability: Not reusable
- PFAS: No intentionally added PFAS · REACH: Compliant · RoHS: Compliant · FCM: Approved
- Evidence: Recycled Content Certificate.pdf, Material Certificate.pdf, Technical Data Sheet.pdf

**Coca-Cola Label 500ml** — Supplier: LabelTech GmbH
- SKU: LABEL-500, Material: Paper, Weight: 0.8g
- Recycled Content: 0%, Recyclability: Recyclable
- Evidence: Material Certificate.pdf, Technical Data Sheet.pdf

**PP Cap 28mm** — Supplier: PolyCap GmbH
- SKU: CAP-28, Material: PP, Weight: 2.1g
- Recycled Content: 10% (10% PCR), DfR: A, Recyclability: Recyclable
- Evidence: Material Certificate.pdf, Recycled Content Certificate.pdf

## 6. Sample packaging item

**Coca-Cola 500ml** — Manufacturer: Coca-Cola
- SKU: COKE-500, Market: Germany, Type: Bottle
- Components: PET Bottle 500ml (PET Solutions GmbH), Coca-Cola Label 500ml
  (LabelTech GmbH), PP Cap 28mm (PolyCap GmbH)

## 7. Reference calculation (for Stage 8 — worked example)

```
PET Bottle:  18.2g × 35% = 6.37g
PP Cap:       2.1g × 10% = 0.21g
Label:        0.8g ×  0% = 0g

Total recycled material:   6.58g
Total applicable material: 20.3g (sum of all three component weights)
Calculated recycled content: 32.4%
```

Version 2.0 scenario (Stage 10): PET Bottle recycled content 35% → 40%
recalculates to ~36.8% overall.

## 8a. Post-Stage-7 extension — new domain concepts

### New entities

```
ExternalSupplierProduct   — manufacturer-created stand-in for a supplier
                             product not yet registered in Greendeal
DataProvenance            — attached to any significant data value,
                             tracks where it came from and how trustworthy
                             it is
RequestItem /
  RequestedAttribute      — a single field-level line item within a
                             DataRequest (formalizes what was previously
                             just a string array on DataRequest)
RequestResponse           — a supplier's structured response to a
                             request (supersedes ad hoc "approval" for
                             the external/public-link scenarios, though
                             the existing DataApproval flow from Stage 5
                             still applies for the native scenario)
```

### DataRequest — new fields

`DataRequest` (DOMAIN.md §3) gains an `origin` field:

```ts
type RequestOrigin = 'GREENDEAL' | 'PUBLIC_REQUEST_LINK' | 'EXTERNAL'
```

- `GREENDEAL` — the original Stage 4 flow (manufacturer requests from
  within the app, both parties are Greendeal users)
- `PUBLIC_REQUEST_LINK` — submitted via a supplier's public request page
  by an unauthenticated external requester
- `EXTERNAL` — reserved for future use (e.g. email-parsed requests);
  not implemented in this prototype, but the enum value should exist

### ExternalSupplierProduct

```ts
type DataSourceType =
  | 'SUPPLIER_MAINTAINED' | 'SUPPLIER_APPROVED'
  | 'MANUFACTURER_PROVIDED' | 'IMPORTED' | 'EXTERNAL_REQUEST_RESPONSE'

type VerificationStatus =
  | 'VERIFIED' | 'SUPPLIER_APPROVED' | 'UNVERIFIED' | 'EXPIRED'

type ExternalSupplierProduct = {
  id: string
  createdByManufacturerId: string
  hasSupplier: boolean                // false = "Use Existing Manufacturer-
                                       // Provided Data" path: no supplier
                                       // entity exists at all, manufacturer
                                       // is the sole/permanent data source
  supplierCompanyName?: string        // omitted entirely when hasSupplier is false
  supplierContactName?: string
  supplierEmail?: string              // required if hasSupplier is true
                                       // (needed for the response-link flow)
  supplierCountry?: string
  productName: string
  supplierSku?: string
  gtin?: string
  knownMaterialFamily?: string
  knownMaterialComposition?: string
  knownWeightGrams?: number
  sourceType: DataSourceType          // typically MANUFACTURER_PROVIDED or IMPORTED
  verificationStatus: VerificationStatus  // typically UNVERIFIED; if
                                       // hasSupplier is false, this stays
                                       // UNVERIFIED permanently — there is
                                       // no supplier who can ever approve it
  claimedBySupplierId?: string        // set if a real Supplier later "claims" this
                                       // (only ever applies when hasSupplier was true)
}
```

### DataProvenance

Attach this to any significant data value the manufacturer sees
(component fields, calculation inputs, assessment inputs):

```ts
type DataProvenance = {
  sourceType: DataSourceType
  sourceName: string             // e.g. "PET Solutions GmbH" or "Manufacturer Provided"
  verificationStatus: VerificationStatus
  productVersionId?: string      // if traceable to a real Product Version
  evidenceIds?: string[]
  validUntil?: string            // ISO date, if applicable
}
```

### Public Request Link (conceptual — no dedicated persisted entity
needed beyond a slug on the Supplier/Product)

```
/request/{supplierSlug}                 — supplier-level public request page
/request/{supplierSlug}/{productId}     — product-specific public request page
```

A submission through this page creates a `DataRequest` with
`origin: 'PUBLIC_REQUEST_LINK'` and a `requester` object (company name,
contact name, email, country, optional reference number) instead of a
`requestingOrgId` referencing a real Greendeal Organization, since the
requester may not be a registered org.

### RequestResponse (for external/public-link scenarios)

```ts
type RequestResponse = {
  requestId: string
  suppliedAttributes: Record<string, unknown>  // field key -> value
  evidenceIds: string[]
  approvedAttributes: string[]   // subset actually approved to share
  status: 'DRAFT' | 'SUBMITTED'
  submittedBy?: string
  submittedAt?: string
}
```

---

## 8. Assessment ID format

`PPWR-<year>-<6-digit sequence>` — e.g. `PPWR-2026-000182`.
