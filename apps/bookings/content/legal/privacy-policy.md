# CruxGroup — Privacy Policy

**Effective date:** [INSERT DATE]  
**Last updated:** [INSERT DATE]

This Privacy Policy (“**Policy**”) describes how **CruxGroup** (“**we**,” “**us**,” “**our**”) collects, uses, stores, shares, and protects personal data when you use:

- the **customer-facing Bookings application** (“**Bookings App**,” B2C); and/or  
- the **Partner operating system / dashboard** (“**Partner OS**,” B2B),

together with related websites, APIs, communications, and support channels (collectively, the “**Platform**”).

We act as a **Data Fiduciary** under the **Digital Personal Data Protection Act, 2023** (“**DPDP Act**”) in respect of personal data processed through the Platform, and we also align our practices with applicable requirements under the **Information Technology Act, 2000** (“**IT Act**”) and the rules issued thereunder, including the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011** (“**SPDI Rules**”), **where they continue to apply** to categories of information they cover, alongside the DPDP framework.

**This Policy is not legal advice.** It should be reviewed by qualified Indian counsel before publication, especially regarding cross-border processing, consent flows, and sector-specific obligations.

---

## 1. Scope and who this Policy applies to

1.1 **Data Principals.** This Policy applies to:

- **Customers** who browse, register, book, pay for, or receive services relating to equipment rentals through the Bookings App; and  
- **Partners** (equipment owners/operators and their authorized staff) who register for, access, or use the Partner OS.

1.2 **Not covered.** Information that is aggregated or de-identified such that it cannot reasonably identify you is treated as non-personal data and is outside the scope of this Policy.

---

## 2. Categories of personal data we collect

We collect personal data **fairly**, for **specified purposes**, and to the extent **necessary** for those purposes. Categories include:

| Category | Examples | Primary contexts |
|----------|----------|------------------|
| **Identity & contact** | Name, phone number, email (if provided), company / trade name, GSTIN or billing details | Bookings App, Partner OS |
| **Authentication data** | Phone number used for OTP, OTP session metadata, **hashed 4-digit PIN** (for quick login on your devices; stored in non-readable form), device/session identifiers | Bookings App, Partner OS (phone-first flows) |
| **KYC & payout (Partners)** | PAN, Aadhaar reference / document images as permitted, bank account details, IFSC, cancelled cheque images, incorporation/partnership proofs where collected | Partner OS Trust Center |
| **Booking & operations** | Job descriptions, schedules, equipment types, site instructions, status updates | Bookings App, Partner OS |
| **Location data** | Precise coordinates from map pins, fleet yard locations, live job tracking where enabled | Bookings App, Partner OS |
| **Payment data** | Transaction references, amounts, payment method type; **card/bank credentials are handled by payment gateways**, not stored by us in full | Bookings App, Partner OS |
| **Communications** | Messages sent via in-app channels, WhatsApp template metadata, SMS delivery logs, support tickets | Platform |
| **Technical & usage** | IP address, device type, app version, logs, cookies or similar technologies where used | Platform |

---

## 3. Phone-first authentication and general PII

3.1 **Phone numbers and OTP.** The Bookings App and Partner flows may use **phone-first authentication** using one-time passwords (“**OTP**”) sent by SMS and/or WhatsApp. We process your **phone number**, **name** (where you provide it), and **company or business details** (for Partners) to create and secure your account, prevent fraud, and meet audit requirements.

3.2 **Why we need it.** Processing is necessary to **perform the contract** with you (providing access and bookings), to **comply with law** (including telecom verification norms where applicable), and, where required, based on **your consent** presented at collection (e.g., marketing preferences if separately obtained).

3.3 **Accuracy.** You should keep your profile information accurate. Inaccurate site addresses or contact details can affect safety, dispatch, and billing.

---

## 4. Sensitive KYC data (Partners) — collection, storage, verification, and access

4.1 **What we collect.** For **Partners** only, we may collect **know-your-business / know-your-customer** documentation and related data, which may include:

- **PAN** (number and document image);  
- **Aadhaar** (number and/or masked document image, **only as permitted by applicable law and internal policy**);  
- **Bank account number, IFSC**, and **cancelled cheque** or bank proof images;  
- other statutory or risk documents (e.g., GST registration, trade license) as requested in the Trust Center.

4.2 **Purpose.** We use this information to **verify identity**, **prevent fraud**, **meet payment and tax compliance**, **support dispute resolution**, and **manage marketplace integrity** (including visibility and eligibility rules described in our Partner terms).

4.3 **Storage and encryption.** KYC documents and images are stored in **encrypted cloud object storage** using **Vercel Blob** (or equivalent infrastructure we configure). Data is transmitted using **HTTPS/TLS**. We implement **access controls**, **least-privilege** permissions, and **organizational measures** designed to prevent unauthorized access.

4.4 **Access restrictions.** Access to raw KYC documents and full verification payloads is **strictly limited** to **authorized Super Admins** (or similarly designated, role-bound platform administrators) for **verification, audit, legal, and security** purposes. Partner-facing staff accounts **do not** receive blanket access to other partners’ KYC files. Automated systems may process **hashed or redacted** forms of identifiers where feasible for operations.

4.5 **Verification partners.** We may use **third-party verification APIs or document intelligence services** to validate authenticity or extract structured fields. Those providers act as **processors** or independent verifiers under contract and must use data only for instructed purposes.

4.6 **No Aadhaar sharing for commercial marketing.** We do not use Aadhaar or KYC data for unsolicited marketing. Any use of Aadhaar-based processes follows **UIDAI / applicable norms** where relevant.

---

## 5. Geolocation data

5.1 **Partners — fleet and operations.** We may collect **precise GPS coordinates** or map-derived coordinates when Partners set **fleet yard locations**, **depot pins**, **service area boundaries**, or similar operational locations in the Partner OS. **Purposes** include validating service coverage, routing, dispatch planning, and displaying accurate availability to Customers.

5.2 **Customers — job sites.** We may collect **precise coordinates** when Customers drop a **job site pin** or confirm an address on a map in the Bookings App. **Purposes** include distance-based pricing, dispatch routing, safety and access planning, fraud prevention, and **live job tracking** where the product displays movement or arrival estimates.

5.3 **Operators / field execution.** Where the product supports **live job tracking**, location may be collected from the device used by an **Operator** or field user associated with a Partner during an active job window. Collection is limited to **operational necessity** and disclosed in-app where required.

5.4 **Controls.** Where the underlying platform requires **OS-level location permission**, we request permission in line with platform guidelines. You may withdraw location permission through device settings; **withdrawing permission may limit** features such as map-based booking or tracking.

5.5 **Retention.** Location history tied to bookings may be retained for **dispute resolution, safety investigations, and legal compliance** for the periods described in Section 10.

---

## 6. Purposes and lawful bases for processing (summary)

We process personal data for purposes including: account creation and authentication; booking creation, matching, fulfillment, and customer support; payments and settlements; fraud prevention and security; compliance with tax and regulatory obligations; product improvement and analytics using **aggregated or de-identified** data where possible; and communications you expect as part of the service.

Depending on the processing activity, we rely on **your consent** (where required under the DPDP Act), **voluntary provision** of data for specified purposes, **compliance with law**, or **legitimate uses** recognized under the DPDP Act and rules, as interpreted by competent guidance and counsel.

---

## 7. Third-party sharing and processors

7.1 **Partner ↔ Customer fulfillment.** To perform a booking, we share **Customer** information with the **specific Partner** (and their authorized Operators/staff) who is assigned or accepts the job. This typically includes **name, phone number, job site address/coordinates**, booking parameters, and operational messages. Partners must use this information **only** for fulfillment and support, not for unrelated marketing, subject to their own legal obligations.

7.2 **Partner data to verification and payments.** We share **Partner** data with:

- **Identity / document verification APIs** for KYC validation; and  
- **Payment gateways and banking partners** (including **Razorpay** or successors) for collecting Customer payments, Partner payouts, refunds, and chargebacks.

These recipients process data under **contractual safeguards** and their own privacy notices for payment processing.

7.3 **WhatsApp and SMS (AISensy).** We use **third-party messaging APIs** (including **AISensy** or comparable providers) to route **transactional and operational** WhatsApp messages (e.g., OTP, booking updates, dispatch notices) and related **SMS**. The provider receives **phone numbers** and **message content / template parameters** necessary for delivery.

7.4 **Cloud, email, and analytics.** We use reputable **hosting, logging, email, and productivity** providers. Subprocessors may be located **inside or outside India** as described in Section 12.

7.5 **Legal and safety requests.** We may disclose information if required by **law, court order, or governmental authority**, or where necessary to protect **life, health, or safety**, or the **integrity of the Platform**.

---

## 8. Cookies and similar technologies

We may use cookies, local storage, or SDKs for **session management**, **security**, **preferences**, and **analytics**. Where non-essential cookies are used, we will seek **appropriate consent** as required by law and product configuration.

---

## 9. Security practices

We implement **technical and organizational measures** appropriate to the nature of processing, including encryption in transit, access control, logging, vulnerability management, and staff training. No method of transmission or storage is completely secure; we encourage you to use strong device security and report suspected incidents to **[INSERT SECURITY EMAIL]**.

---

## 10. Data retention and deletion

10.1 **General retention.** We retain personal data **only as long as necessary** for the purposes in this Policy, including resolving disputes, enforcing agreements, and meeting legal, regulatory, tax, and accounting requirements.

10.2 **KYC and invoicing / tax records.** **KYC documents**, **identity fields**, **bank proofs**, and **invoicing / transaction records** (including GST-related data) may need to be **retained for extended periods** under:

- the **Income Tax Act, 1961** and **Central Goods and Services Tax Act, 2017** (and rules) for **accounting, audit, and tax assessment** timelines;  
- **prevention of money-laundering** and know-your-customer norms where applicable;  
- **evidence preservation** for legal claims or regulatory investigations.

During these periods, **erasure requests may be only partially fulfilled** (e.g., we may delete marketing profiles but retain statutory records in **restricted archives**).

10.3 **Deletion requests.** You may request **erasure or restriction** of your personal data by contacting us at **[INSERT PRIVACY / DPO EMAIL]**. We will respond within timelines prescribed under the **DPDP Act** (once fully effective and rules specify periods) and applicable law. We may **verify your identity** before acting on requests.

10.4 **Withdrawal of consent.** Where processing is consent-based, you may **withdraw consent**; this may **limit or terminate** your ability to use certain features (e.g., OTP login, WhatsApp updates, or Partner payouts).

10.5 **Inactive accounts.** We may delete or anonymize inactive account data after internal retention windows, **subject to legal holds**.

---

## 11. Your rights (DPDP-aligned)

Subject to applicable law and verifiable identity, you may have the right to:

- **access** a summary of personal data we hold about you;  
- **seek correction** of inaccurate or incomplete data;  
- **request erasure** where retention is no longer necessary (subject to Section 10);  
- **grievance redressal** through our Grievance Officer (Section 14);  
- **nominate** another individual to exercise rights on your behalf in case of death or incapacity, as prescribed under the DPDP Act.

Some rights may be **limited** where they conflict with **legal obligations** or **defense of legal claims**.

---

## 12. Cross-border transfers

Certain processors (e.g., cloud, messaging, or payment infrastructure) may be **located outside India** or may access data from outside India. Where such transfers occur, we take steps required under the **DPDP Act** and rules, which may include **standard contractual safeguards**, **government-approved jurisdictions**, or **other lawful mechanisms** as notified. **[INSERT COUNSEL-REVIEWED DESCRIPTION OF TRANSFERS AND BASIS.]**

---

## 13. Children’s privacy

The Platform is **not directed to children** under 18 (or the age of majority in your state). We do not knowingly collect personal data from children. If you believe we have collected such data, contact us and we will take appropriate steps to delete it, subject to law.

---

## 14. Grievance officer and contact

**Data Fiduciary / Legal entity:** **[INSERT REGISTERED LEGAL NAME, CIN/LLPIN, ADDRESS — HYDERABAD, TELANGANA]**  

**Privacy / data protection queries:** **[INSERT EMAIL]**  

**Grievance Officer** (as required under the **IT Act** rules and for DPDP-related grievances, details to be updated per statute):  
**Name:** **[INSERT]**  
**Email:** **[INSERT]**  
**Phone:** **[INSERT]**  
**Office hours / response SLA:** **[INSERT]**

---

## 15. Changes to this Policy

We may update this Policy to reflect legal, technical, or business changes. We will post the revised Policy with a new “Last updated” date and, where required by law, provide **additional notice** or obtain **fresh consent**.

---

## 16. Governing law

This Policy is governed by the **laws of India**. Subject to applicable consumer protections, courts at **Hyderabad, Telangana** may have jurisdiction over disputes arising from this Policy, alongside remedies available under the DPDP Act.
