You are building a high-fidelity frontend prototype for:

GREeNDEAL COMPLIANCE

Product & Packaging Compliance Platform

==================================================
1. PRODUCT
==================================================

Product name:

Greendeal Compliance

Positioning:

Greendeal Compliance helps manufacturers collect, verify, trace, and use product-level compliance data from suppliers to assess packaging compliance and generate auditable compliance documentation.

Core product promise:

"Maintain product compliance data once. Reuse it across customers, packaging items, and compliance assessments."

The platform connects:

- Suppliers
- Manufacturers
- Compliance teams

Example:

Supplier X provides PET bottles.
Supplier Y provides labels.
Supplier Z provides caps.

Each supplier maintains reusable compliance profiles for their products.

A manufacturer such as Coca-Cola creates:

Coca-Cola 500ml

containing:

- PET Bottle 500ml → Supplier X
- Coca-Cola Label 500ml → Supplier Y
- PP Cap 28mm → Supplier Z

The manufacturer selectively requests specific information from suppliers.

The supplier reviews exactly what is being requested and approves access.

The manufacturer then uses approved supplier data to perform a simplified PPWR assessment and generate a conformance document.

==================================================
2. PROTOTYPE OBJECTIVE
==================================================

This is a high-fidelity product prototype.

The prototype should demonstrate the complete Greendeal Compliance workflow:

Supplier
    ↓
Create / maintain product compliance profile
    ↓
Publish product data and evidence
    ↓
Manufacturer creates packaging item
    ↓
Manufacturer selects supplier products
    ↓
Manufacturer requests specific data
    ↓
Supplier reviews request
    ↓
Supplier approves selected data
    ↓
Manufacturer receives authorized data
    ↓
Packaging data completeness
    ↓
PPWR assessment
    ↓
Calculation + provenance
    ↓
Conformance document
    ↓
Supplier data version changes
    ↓
Impact analysis / reassessment

The prototype should make this workflow extremely clear.

==================================================
3. TECHNOLOGY
==================================================

Use:

- Next.js
- React
- TypeScript
- App Router
- Modern component-based architecture

This is a FRONTEND PROTOTYPE.

DO NOT build a real backend.

DO NOT build:

- Spring Boot
- NestJS backend
- PostgreSQL
- Real authentication
- Real object storage
- Real job queue
- Production compliance engine
- Production PPWR regulatory rules engine

Use mock/in-memory data.

Create a clean mock data/service layer so that the frontend can later connect to:

Next.js
    |
    | REST API
    v
Java Spring Boot
    |
    +-- PostgreSQL
    +-- Object Storage
    +-- Job Queue
    +-- Compliance Engine
    +-- Document Generation

The prototype must be structured so replacing mock services with REST API calls later is straightforward.

==================================================
4. BRANDING & VISUAL IDENTITY
==================================================

Application name:

Greendeal Compliance

Use this name throughout the application.

Application subtitle:

Product & Packaging Compliance Platform

The UI should feel like a modern enterprise B2B SaaS compliance product.

Brand characteristics:

- Professional
- Trustworthy
- Modern
- Environmental
- Data-driven
- Audit-focused
- Enterprise-ready

Avoid making the product look like a generic sustainability dashboard.

The core experience is:

Supplier Data
+
Controlled Data Sharing
+
Packaging Composition
+
Compliance Assessment
+
Evidence & Provenance

The Greendeal Compliance logo/name should appear in the application shell.

==================================================
5. CORE DOMAIN MODEL
==================================================

The prototype must model:

Organization
- Manufacturer
- Supplier

Supplier Product
- Owned and maintained by a supplier
- Represents a product that the supplier sells/provides
- Contains reusable compliance data

Product Version
- Versioned snapshot of supplier product data
- Required for provenance and auditability

Production Batch / Lot
- Batch-specific information
- Distinct from permanent product-level attributes

Packaging Item
- Owned by manufacturer
- Represents a finished packaging configuration

Packaging Component
- A component of a Packaging Item
- References a Supplier Product

Data Request
- Manufacturer requests specific data from a supplier

Data Approval
- Supplier approves/rejects requested access

Evidence
- Documents/certificates supporting specific data attributes

Compliance Assessment
- Assessment of a Packaging Item

Compliance Calculation
- Shows how assessment values were calculated

Compliance Finding
- PASS / WARNING / FAIL / MISSING

Compliance Document
- Generated representation of the assessment

==================================================
6. SUPPLIER PRODUCT COMPLIANCE PROFILE
==================================================

A supplier product must support the following information.

------------------------------------------
SECTION 1 — PRODUCT & SUPPLIER IDENTIFICATION
------------------------------------------

Fields:

- Product Name
- Supplier SKU
- GTIN / EAN
- Production Batch / Lot Number
- Country of Origin

Important:

Product-level fields and batch-level fields must be conceptually separated.

Example:

Product:
PET Bottle 500ml

SKU:
PET-500

GTIN:
04012345678901

Batch:
B2026-0814

The prototype can simplify implementation, but the data model should distinguish Product Version from Production Batch.

------------------------------------------
SECTION 2 — PHYSICAL & STRUCTURAL PROPERTIES
------------------------------------------

Fields:

- Material Family
- Specific Material Composition
- Component Net Weight
- Dimensions
- Thickness
- Packaging Function Type

Example:

Material Family:
Plastic

Specific Material:
PET

Net Weight:
18.2g

Dimensions:
65mm × 65mm × 210mm

Thickness:
0.35mm

Packaging Function:
Primary Packaging

------------------------------------------
SECTION 3 — CIRCULARITY & PPWR METRICS
------------------------------------------

Fields:

- Total Recycled Content Percentage
- Post-Consumer Recycled (PCR) Yield
- Pre-Consumer / Industrial Recycled Yield
- Design-for-Recycling (DfR) Grade
- Reusability Status

Example:

Total Recycled Content:
35%

PCR:
30%

Pre-Consumer:
5%

DfR:
A

Reusability:
Not reusable

------------------------------------------
SECTION 4 — CHEMICAL SAFETY & SUBSTANCE RESTRICTIONS
------------------------------------------

Fields:

- Heavy Metal PPM Concentration
- Intentionally Added PFAS Flag
- REACH SVHC Declaration Status
- ECHA SCIP Registration Code
- RoHS Directive Compliance Status

Use appropriate controls.

Examples:

PFAS:
No intentionally added PFAS

REACH SVHC:
Compliant / Declaration Available

RoHS:
Compliant

SCIP:
SCIP-XXXX-XXXX

------------------------------------------
SECTION 5 — SPECIALIZED DOMAIN METRICS
------------------------------------------

Fields:

- Food Contact Material (FCM) Approval Status
- Overall Migration Limit (OML) Test Score
- Sterilization Method Compatibility Profile

These fields may be:

NOT APPLICABLE
NOT PROVIDED
PROVIDED
EXPIRED
PENDING VERIFICATION
VERIFIED

Do not represent everything simply as null.

Example:

Food Contact:
Not Applicable

is different from:

Food Contact:
Required information missing

------------------------------------------
SECTION 6 — EVIDENCE, GOVERNANCE & LIFESPAN
------------------------------------------

Fields:

- Supporting Document PDF Attachments
- Issuing Laboratory Authority Name
- Document Issue Date
- Data Validity Expiration Date
- Data / Schema Version Identifier

Evidence is a first-class object.

An Evidence record should conceptually contain:

- Document name
- Evidence type
- Issuing authority
- Issue date
- Expiration date
- Status
- Supported data attributes
- Product version

Example:

Recycled Content Certificate.pdf

Evidence type:
Recycled Content

Issued by:
Example Laboratory GmbH

Issue date:
2026-05-12

Valid until:
2027-05-12

Supports:
- Total Recycled Content
- PCR Content

==================================================
7. SAMPLE ORGANIZATIONS
==================================================

Manufacturer:

Coca-Cola

Supplier:

PET Solutions GmbH

Supplier:

LabelTech GmbH

Supplier:

PolyCap GmbH

==================================================
8. SAMPLE SUPPLIER PRODUCTS
==================================================

PRODUCT 1

Name:
PET Bottle 500ml

Supplier:
PET Solutions GmbH

SKU:
PET-500

GTIN:
04012345678901

Country:
Germany

Material Family:
Plastic

Material:
PET

Weight:
18.2g

Dimensions:
65mm × 65mm × 210mm

Thickness:
0.35mm

Packaging Function:
Primary Packaging

Total Recycled Content:
35%

PCR:
30%

Pre-Consumer:
5%

DfR:
A

Reusability:
Not reusable

PFAS:
No intentionally added PFAS

REACH:
Compliant

RoHS:
Compliant

FCM:
Approved

Evidence:

Recycled Content Certificate.pdf
Material Certificate.pdf
Technical Data Sheet.pdf


PRODUCT 2

Name:
Coca-Cola Label 500ml

Supplier:
LabelTech GmbH

SKU:
LABEL-500

Material:
Paper

Weight:
0.8g

Recycled Content:
0%

Recyclability:
Recyclable

Evidence:

Material Certificate.pdf
Technical Data Sheet.pdf


PRODUCT 3

Name:
PP Cap 28mm

Supplier:
PolyCap GmbH

SKU:
CAP-28

Material:
PP

Weight:
2.1g

Recycled Content:
10%

PCR:
10%

DfR:
A

Recyclability:
Recyclable

Evidence:

Material Certificate.pdf
Recycled Content Certificate.pdf

==================================================
9. MANUFACTURER PACKAGING ITEM
==================================================

Manufacturer:

Coca-Cola

Packaging Item:

Coca-Cola 500ml

SKU:

COKE-500

Market:

Germany

Packaging type:

Bottle

Components:

1. PET Bottle 500ml
   Supplier: PET Solutions GmbH

2. Coca-Cola Label 500ml
   Supplier: LabelTech GmbH

3. PP Cap 28mm
   Supplier: PolyCap GmbH

==================================================
10. UX / DESIGN PRINCIPLES
==================================================

The product should feel like a professional enterprise compliance platform.

Prioritize:

- Trust
- Clarity
- Data provenance
- Auditability
- Minimal manual work
- Clear ownership
- Clear data-sharing permissions
- Clear compliance status

Avoid:

- Consumer-app aesthetics
- Excessive animation
- Decorative dashboards
- Unnecessary charts
- Generic filler content

Use clear status indicators:

✓ Complete
⚠ Missing
⏳ Pending
✕ Failed
🔒 Not authorized
✓ Approved
○ Not applicable
⌛ Expired

==================================================
11. STAGE 0 — APPLICATION FOUNDATION
==================================================

Build the Greendeal Compliance application shell first.

Requirements:

- Next.js App Router
- TypeScript
- Responsive design
- Greendeal Compliance branding
- Sidebar navigation
- Header
- Role switcher
- Reusable cards
- Buttons
- Tables
- Badges
- Dialogs
- Forms
- Toasts
- Empty states
- Loading states
- Error states

Role switcher:

Supplier
Manufacturer

This is only a prototype role switcher.

Do not implement real authentication.

Supplier navigation:

Dashboard
Products
Data Requests
Evidence

Manufacturer navigation:

Dashboard
Packaging Items
Data Requests
Assessments
Documents

Dashboard should clearly identify:

Greendeal Compliance

Product & Packaging Compliance Platform

After Stage 0:

STOP.

Report:
- What was implemented
- Routes created
- Components created
- Mock data created
- What remains

Do not continue to Stage 1 automatically.

==================================================
12. STAGE 1 — SUPPLIER PRODUCT PROFILE
==================================================

Build the supplier experience.

Persona:

PET Solutions GmbH

Create:

Supplier Dashboard

Show:

- Product count
- Complete products
- Incomplete products
- Pending requests
- Expiring evidence
- Recently updated products

Create Product List.

Columns:

Product
SKU
Material
Weight
Recycled Content
Completeness
Version
Status
Last Updated

Create Product flow.

Use a multi-step wizard.

STEP 1:
Identification

STEP 2:
Physical & Structural

STEP 3:
Circularity & PPWR

STEP 4:
Chemical Safety

STEP 5:
Specialized Domain

STEP 6:
Evidence & Governance

STEP 7:
Review & Publish

Review screen must show all major sections.

Show Data Completeness.

Allow:

Save Draft
Publish Product

After Stage 1:

STOP and report.

==================================================
13. STAGE 2 — PRODUCT DETAILS, VERSIONING & EVIDENCE
==================================================

Create a high-quality Product Details page.

Example:

PET Bottle 500ml

Show:

Status:
Published

Version:
1.0

Data completeness:
95%

Last updated:
...

Sections:

Identification
Physical Properties
Circularity & PPWR
Chemical Safety
Specialized Domain
Evidence

Evidence must be a first-class UI element.

For each evidence item show:

Document
Type
Issuer
Issue Date
Expiration
Status
Supported Attributes

Create Version History.

Example:

Version 1.0
35% recycled content

Version 1.1
35% recycled content
Updated evidence

Version 2.0
40% recycled content

User must be able to inspect what changed between versions.

After Stage 2:

STOP and report.

==================================================
14. STAGE 3 — MANUFACTURER EXPERIENCE
==================================================

Switch to:

Manufacturer:
Coca-Cola

Build:

Manufacturer Dashboard

Show:

- Packaging items
- Data completeness
- Pending supplier requests
- Assessments
- Compliance status
- Supplier data changes

Build Packaging Item List.

Build Create Packaging Item.

Fields:

Product Name
SKU
Market
Packaging Type

Build Packaging Item Details.

Example:

Coca-Cola 500ml

Packaging Components:

Bottle
PET Bottle 500ml
PET Solutions GmbH

Label
Coca-Cola Label 500ml
LabelTech GmbH

Cap
PP Cap 28mm
PolyCap GmbH

For each component show:

Supplier
Supplier Product
Product Version
Data Availability
Authorization Status
Evidence Availability

Allow:

View Data
View Evidence
Request Data
Replace Product

After Stage 3:

STOP and report.

==================================================
15. STAGE 4 — SELECTIVE DATA REQUEST
==================================================

This is a critical Greendeal Compliance workflow.

The manufacturer must NOT simply request:

"Share your product."

Instead, the manufacturer selects exactly what information is required.

Example:

Coca-Cola 500ml

Component:
PET Bottle 500ml

Supplier:
PET Solutions GmbH

REQUEST INFORMATION:

IDENTIFICATION
☐ GTIN
☐ Country of Origin

PHYSICAL
☑ Material Composition
☑ Net Weight
☑ Dimensions
☑ Thickness

CIRCULARITY
☑ Total Recycled Content
☑ PCR
☑ Pre-Consumer Recycled Content
☑ DfR Grade

CHEMICAL
☐ Heavy Metals
☑ PFAS
☑ REACH
☐ SCIP
☐ RoHS

SPECIALIZED
☐ FCM
☐ OML
☐ Sterilization

EVIDENCE
☑ Recycled Content Certificate
☑ Material Certificate

Purpose:

"PPWR assessment for Coca-Cola 500ml."

Create request summary before submission.

Manufacturer must see exactly what they are requesting.

After Stage 4:

STOP and report.

==================================================
16. STAGE 5 — SUPPLIER APPROVAL
==================================================

Switch to:

Supplier:
PET Solutions GmbH

Build Data Requests inbox.

Show:

Requesting Organization
Product
Packaging Item
Requested Attributes
Purpose
Request Date
Status

Open request.

Supplier sees:

Requested by:
Coca-Cola

Packaging:
Coca-Cola 500ml

Product:
PET Bottle 500ml

Purpose:
PPWR assessment

Data requested:

✓ Material
✓ Weight
✓ Recycled Content
✓ PCR
✓ DfR
✓ PFAS
✓ REACH
✓ Evidence

Clearly show:

"This approval will allow Coca-Cola to access only the selected information."

Buttons:

[Reject]
[Approve]

After approval:

✓ Approved

"Selected product data is now available to Coca-Cola."

IMPORTANT:

The supplier remains the owner of the source data.

The manufacturer receives authorized access.

The manufacturer does not become the owner of the supplier's source data.

After Stage 5:

STOP and report.

==================================================
17. STAGE 6 — PACKAGING DATA COMPLETENESS
==================================================

Switch back to:

Coca-Cola

Open:

Coca-Cola 500ml

Create readiness view.

Show:

Data completeness:

████████████████████ 100%

Components:

✓ PET Bottle
✓ Label
✓ Cap

For each component show:

Data status
Authorization status
Product Version
Evidence status

If complete:

"Ready for assessment"

[Run PPWR Assessment]

If incomplete:

"Assessment cannot be completed."

Show exactly what is missing.

Example:

Label
Supplier:
LabelTech GmbH

Missing:
- Recycled Content
- Evidence

Button:

[Request Missing Data]

After Stage 6:

STOP and report.

==================================================
18. STAGE 7 — SIMPLIFIED PPWR ASSESSMENT
==================================================

This is a PROTOTYPE assessment.

Do NOT attempt to implement actual legal PPWR rules.

The purpose is to demonstrate the user experience and architecture.

When user clicks:

Run PPWR Assessment

show simulated processing:

Preparing assessment...
Validating supplier data...
Checking data validity...
Checking evidence...
Calculating material composition...
Calculating recycled content...
Evaluating compliance...
Finalizing assessment...

Then show:

Greendeal Compliance
PPWR Compliance Assessment

Coca-Cola 500ml

Status:

✓ COMPLIANT

Assessment sections:

Material Composition
PASS

Recycled Content
PASS

Recyclability
PASS

Chemical Safety
PASS

Required Evidence
PASS

Data Completeness
PASS

Assessment ID:

PPWR-2026-000182

Create Assessment History.

After Stage 7:

STOP and report.

==================================================
19. STAGE 8 — CALCULATIONS & PROVENANCE
==================================================

This is one of the most important stages.

Do NOT just display:

"Compliant."

The user must understand WHY.

Create calculation details.

Example:

Recycled Content

PET Bottle:
18.2g × 35%
= 6.37g

PP Cap:
2.1g × 10%
= 0.21g

Label:
0.8g × 0%
= 0g

Total recycled material:
6.58g

Total applicable material:
20.3g

Calculated recycled content:
32.4%

Show each component contributing to the result.

Then show provenance.

For every important value show:

Value
Source Product
Supplier
Product Version
Evidence

Example:

35%

Source:
PET Bottle 500ml

Supplier:
PET Solutions GmbH

Version:
1.0

Evidence:
Recycled Content Certificate.pdf

Navigation must support:

Assessment
→ Calculation
→ Packaging Component
→ Supplier Product
→ Product Version
→ Evidence

This is fundamental to the Greendeal Compliance value proposition.

After Stage 8:

STOP and report.

==================================================
20. STAGE 9 — DOCUMENT CREATION
==================================================

Create:

[Generate PPWR Conformance Document]

Simulate:

Preparing document...
Collecting assessment results...
Collecting source data...
Building document...
Document ready.

Document preview:

GREeNDEAL COMPLIANCE

PPWR Conformance Assessment

Manufacturer:
Coca-Cola

Packaging Item:
Coca-Cola 500ml

Assessment ID:
PPWR-2026-000182

Assessment Status:
COMPLIANT

Packaging Components:

PET Bottle
PET Solutions GmbH
18.2g
Product Version 1.0

Label
LabelTech GmbH
0.8g
Product Version 1.0

Cap
PolyCap GmbH
2.1g
Product Version 1.0

Compliance Results:

Material Composition
PASS

Recycled Content
PASS

Recyclability
PASS

Chemical Safety
PASS

Evidence
PASS

Include:

[Download Document]

A real document backend is NOT required.

A mocked PDF/document preview is sufficient.

After Stage 9:

STOP and report.

==================================================
21. STAGE 10 — VERSION CHANGE & IMPACT ANALYSIS
==================================================

Demonstrate the lifecycle scenario.

Supplier changes:

PET Bottle 500ml

Recycled content:

35% → 40%

Create:

Product Version 2.0

Show:

Version 1.0
35%

Version 2.0
40%

Then show Coca-Cola:

"Supplier product data changed."

Affected Packaging Items:

Coca-Cola 500ml

Show:

Previous assessment:
32.4%

Potential new assessment:
36.8%

Button:

[Review Impact]

Show:

Changed Attribute:
Recycled Content

Old:
35%

New:
40%

Affected Assessments:
1

Affected Packaging Items:
1

Allow:

[Recalculate Assessment]

This demonstrates:

Product Versioning
Data Provenance
Impact Analysis
Assessment Recalculation

After Stage 10:

STOP and report.

==================================================
22. MOCK DATA ARCHITECTURE
==================================================

Do NOT scatter hardcoded objects throughout React components.

Create centralized types and mock data.

Types:

Organization
SupplierProduct
ProductVersion
ProductionBatch
MaterialComposition
EnvironmentalData
ChemicalSafetyData
SpecializedDomainData
Evidence
DataRequest
DataApproval
PackagingItem
PackagingComponent
ComplianceAssessment
ComplianceCalculation
ComplianceFinding
ComplianceDocument

Services:

mockProductService
mockPackagingService
mockRequestService
mockAssessmentService
mockDocumentService

UI must not care whether data comes from mock data or future REST APIs.

==================================================
23. DATA OWNERSHIP
==================================================

This is a fundamental Greendeal Compliance rule.

SUPPLIER OWNS:

Supplier Product
Product Versions
Evidence
Source Compliance Data

MANUFACTURER OWNS:

Packaging Item
Packaging Components
Compliance Assessments
Assessment Documents

Manufacturer does NOT duplicate ownership of supplier source data.

Instead:

Packaging Component
    ↓
references Supplier Product
    ↓
references Product Version
    ↓
authorized data access
    ↓
used by Compliance Assessment

Make this relationship visible in the UI.

==================================================
24. DATA ACCESS / APPROVAL
==================================================

A Data Request must specify:

Requesting Organization
Supplier Organization
Supplier Product
Packaging Item
Requested Attributes
Purpose
Request Date
Status

Approval must be scoped to requested attributes.

Example:

Approved:

Material
Weight
Recycled Content
PCR
Evidence

Not approved:

GTIN
Country of Origin
Chemical data

Manufacturer sees only approved attributes.

This demonstrates:

"Selective data sharing."

==================================================
25. DATA STATUS MODEL
==================================================

Individual data fields:

NOT_APPLICABLE
NOT_PROVIDED
PROVIDED
EXPIRED
PENDING_VERIFICATION
VERIFIED

Requests:

DRAFT
PENDING
APPROVED
REJECTED
EXPIRED

Assessments:

DRAFT
PROCESSING
COMPLETE
FAILED
REQUIRES_REVIEW

Compliance findings:

PASS
WARNING
FAIL
MISSING
NOT_APPLICABLE

==================================================
26. FINAL DEMO SCRIPT
==================================================

The completed Greendeal Compliance prototype must support:

1. Switch to Supplier.

2. Open PET Solutions GmbH.

3. Open PET Bottle 500ml.

4. Show the full supplier compliance profile:

Identification
Physical
Circularity
Chemical
Specialized
Evidence

5. Show Product Version 1.0.

6. Show supporting evidence and validity dates.

7. Switch to Manufacturer.

8. Open Coca-Cola.

9. Open Coca-Cola 500ml.

10. Show packaging components:

Bottle
Label
Cap

11. Select a component.

12. Request specific data attributes.

13. Show request purpose.

14. Submit request.

15. Switch to Supplier.

16. Open Data Requests.

17. Open Coca-Cola request.

18. Show exact requested fields.

19. Approve request.

20. Switch to Coca-Cola.

21. Show authorized data now available.

22. Show packaging completeness.

23. Run assessment.

24. Show:

COMPLIANT

25. Open calculation.

26. Show exactly how recycled content was calculated.

27. Click the calculation source.

28. Navigate:

Supplier Product
→ Product Version
→ Evidence

29. Generate PPWR Conformance Document.

30. Preview document.

31. Simulate supplier changing recycled content:

35% → 40%.

32. Create Product Version 2.0.

33. Show Coca-Cola notification.

34. Show affected packaging item.

35. Show assessment impact.

36. Recalculate.

==================================================
27. DEVELOPMENT RULES
==================================================

Build incrementally.

Start with STAGE 0 only.

After Stage 0:

- Run the application
- Verify TypeScript
- Verify navigation
- Verify no obvious console errors
- Verify responsive layout
- Report implementation
- STOP

Do not continue automatically.

For every subsequent stage:

- Preserve previous functionality
- Avoid unnecessary refactoring
- Keep mock data consistent
- Keep terminology consistent
- Keep Greendeal Compliance branding consistent
- Keep UI polished
- Verify application works before stopping

The final result should be a coherent, clickable prototype demonstrating:

Supplier Data
→ Controlled Data Sharing
→ Packaging Composition
→ Compliance Assessment
→ Evidence & Provenance
→ Conformance Document
→ Version Change
→ Impact Analysis

The prototype should feel like a real enterprise product called:

GREeNDEAL COMPLIANCE

Product & Packaging Compliance Platform

Start now with STAGE 0.