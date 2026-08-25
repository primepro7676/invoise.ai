# PrimePro × Fuelo — Tax Invoice & Billing System

A professional, fully editable web-based Tax Invoice Generator and Admin Dashboard for
**PrimePro Technologies AI LLC** and **Fuelo Technologies OPC Pvt Ltd**.

Built with Next.js 16, React, TypeScript, Tailwind CSS, Prisma, Auth.js, and React-PDF —
generating a print-ready, 2-page A4 tax invoice in the PrimePro/Fuelo **green & white** brand theme.

---

## 1. Quick Start (runs locally with zero external services)

```bash
npm install
npm run db:push     # creates the local SQLite database (dev.db)
npm run db:seed     # seeds admin login, 5 default services, packages, terms
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/login`.

**Default admin login** (from `.env` → change before going live):
```
Email:    admin@primepro.ai
Password: Admin@123
```

> The very first `npm install` runs `prisma generate`, which downloads a small database
> engine binary from Prisma's CDN. This requires normal internet access (this is standard
> for every Prisma project and works out of the box on your machine, Vercel, etc.).

---

## 2. What's included

| Area | Details |
|---|---|
| **Admin Dashboard** | Dashboard, Create Invoice, Invoices, Customers, Services, Packages & Pricing, Terms & Conditions, Company Settings |
| **Auth** | Auth.js (NextAuth) credentials login, admin-only, protected by middleware |
| **Invoice PDF** | `@react-pdf/renderer`, exactly 2 A4 pages, green/white theme, matches your reference layout (PrimePro + Fuelo header, TAX INVOICE, Bill To, services table, GST, totals, amount in words, QR + signature, dynamic Page 2 terms) |
| **Services** | 5 default categories pre-seeded (Website Development, Application Development, WhatsApp API, Lead Generation, Business Automation) with packages, custom pricing, and per-category Terms & Conditions — all editable from the dashboard |
| **GST** | Default 18%, ON/OFF toggle per invoice, editable % |
| **Customers** | Add/edit/search, invoice history per customer |
| **File uploads** | PrimePro logo, Fuelo logo, payment QR, authorized signature — stored locally by default, swappable to Cloudinary or S3 (see §5) |
| **Validation** | React Hook Form + Zod on every form |

---

## 3. Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React icons
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite by default (zero setup) → swap to PostgreSQL (Neon/Supabase) in one step, see §4
- **Auth:** Auth.js (NextAuth) with a credentials provider against the `Admin` table (bcrypt-hashed passwords)
- **PDF:** `@react-pdf/renderer`
- **Forms:** React Hook Form + Zod

---

## 4. Switching the database to PostgreSQL (Neon / Supabase)

The app ships on SQLite so it runs instantly with no external accounts. To use Postgres:

1. Open `prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
   to:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. In `.env`, set `DATABASE_URL` to your Neon/Supabase connection string, e.g.:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```
3. Run:
   ```bash
   npm run db:push
   npm run db:seed
   ```

All field types used in `schema.prisma` are Postgres-compatible, so no other changes are needed.

---

## 5. Switching file storage to Cloudinary or S3

Logos, the payment QR code, and the signature are stored locally in `/public/uploads` by
default (works immediately, no config). To use Cloudinary or S3-compatible storage instead,
set in `.env`:

```
STORAGE_PROVIDER="cloudinary"   # or "s3"

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

No code changes are needed — `src/lib/storage.ts` reads `STORAGE_PROVIDER` and routes uploads
accordingly. (The S3 path is stubbed with clear instructions to add `@aws-sdk/client-s3` if you
choose that route — see the comments in `src/lib/storage.ts`.)

---

## 6. Editing invoice content from the dashboard

Everything shown on the PDF is editable without touching code:

- **Company Settings** → PrimePro & Fuelo names, addresses, EIN/CIN/GSTIN, phone, email,
  logos, payment QR, authorized signature, default GST %, footer note
- **Services** → add/edit/delete service categories
- **Packages & Pricing** → add/edit/delete packages and prices per category, including
  "Custom Price" packages where the admin types the price on each invoice
- **Terms & Conditions** → per-service clauses (only terms for services actually on the
  invoice are combined onto Page 2) plus a General Terms block always included

---

## 7. Invoice workflow

```
Create Invoice → Bill To (existing or new customer) → Add Services (category → package
→ price auto-fills, editable) → GST 18% (toggle/edit) → Payment details → Generate Invoice
→ Preview PDF → Download PDF
```

The invoice number auto-suggests the next sequential `INV-YYYY-0001` number (editable).
Totals (Subtotal, Discount, Taxable Amount, GST, Grand Total, Balance Due, Amount in Words)
compute live as you fill the form, and the exact same numbers are used to render the PDF —
so the preview and the generated PDF always match.

---

## 8. Deployment

- **App:** deploy to [Vercel](https://vercel.com) — connect the repo, set the environment
  variables from `.env.example`, and deploy.
- **Database:** [Neon](https://neon.tech) or [Supabase](https://supabase.com) Postgres
  (see §4). Run `npm run db:push && npm run db:seed` once against the production database
  (e.g. via a local shell with `DATABASE_URL` pointed at production, or a one-off Vercel
  deploy hook).
- **File storage:** Cloudinary or S3 in production (local `/public/uploads` does **not**
  persist on Vercel's serverless filesystem) — see §5.

---

## 9. Project structure

```
src/
  app/
    login/                     # admin login page
    dashboard/                 # protected dashboard (layout checks session)
      page.tsx                 # overview + stats
      invoices/new/            # Create Invoice form
      invoices/[id]/           # invoice detail + PDF actions
      customers/                # customers list + detail
      services/                 # service category CRUD
      packages/                 # package/pricing CRUD
      terms/                    # terms & conditions editor
      settings/                 # company settings + uploads
    api/
      auth/[...nextauth]/      # Auth.js route
      invoices/                # invoice CRUD + /pdf (React-PDF render) + /next-number
      services/, packages/, customers/, settings/, terms/, upload/
  components/
    ui/                        # shadcn-style Button/Input/Card/Select primitives
    dashboard/                 # Sidebar, Topbar
    invoice/                   # InvoiceForm, invoice actions/filters
    customers/, services/, settings/
  lib/
    prisma.ts                  # Prisma client singleton
    auth.ts                    # NextAuth config
    calculations.ts            # GST math, number-to-words, formatting
    storage.ts                 # local/Cloudinary/S3 upload abstraction
    validation.ts               # all Zod schemas
    pdf/InvoiceDocument.tsx     # the 2-page React-PDF invoice template
prisma/
  schema.prisma                # full data model
  seed.ts                      # admin + 5 services + packages + terms
```

---

## 10. Notes

- Change `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` and `NEXTAUTH_SECRET` in `.env` before
  any real deployment.
- To add more admins later, insert rows into the `Admin` table (bcrypt-hash the password) —
  a simple admin-management UI can be added on top of the existing `Admin` model if needed.
- The invoice PDF always renders exactly 2 pages: Page 1 is the invoice itself, Page 2 is
  the dynamically composed Terms & Conditions for the services on that invoice.
