# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Generate Prisma client, push schema, start dev server
pnpm build        # Generate Prisma client, run migrations, build Next.js
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier
pnpm db:push      # Push schema changes to DB (no migration history)
pnpm db:seed      # Seed the database
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Prisma + PostgreSQL (Neon) + Tailwind CSS v4 + ExcelJS

### Data flow

`app/page.tsx` (server) fetches the order via server actions in `util/queries.tsx`, then passes the data to `PageShell` (client). `PageShell` manages all client-side state: active tab (Overview / Downloaded), the export banner, and the export job list. It renders `Header` (which contains `ExportButton`) and either `DashboardView` or `DownloadedTab`.

### Background job queue

`util/export-jobs.ts` implements a fire-and-forget background job system:
- `createExportJob(orderId, orderName)` creates a DB record and immediately returns, then calls `processExportJob()` without awaiting (fire-and-forget). The background function waits a random 1–3 minutes (simulating large data export), generates the Excel file, and stores the bytes in the `ExportJob.fileData` column.
- A FIFO cap of 10 completed jobs is enforced: when a new job completes, the oldest complete jobs beyond 9 are deleted.
- `getExportJobs()` returns the 10 most recent jobs (metadata only, no file bytes).
- `PageShell` polls `getExportJobs` every 5 seconds while any job is pending.
- Completed files are served via `GET /api/export-jobs/[id]/download`.

### Excel generation

Two separate implementations exist intentionally:
- `util/excel-generator.ts` — server-side, used by background jobs, returns a `Buffer`.
- `components/ui/ExportButton.tsx` (original client-side code now replaced) — the export button now delegates to the background job system instead.

### Styling conventions

Global component classes are defined in `app/globals.css`:
- `.wrapper` — `container mx-auto max-w-7xl px-20 py-4`
- `.card` — `overflow-hidden rounded-lg border border-neutral-300 shadow-xs`
- `.primary-btn` — dark (neutral-800) background, white text
- `.secondary-btn` — light gray background

Tables inside `.card` follow the pattern in `components/LineItemsChart.tsx`: `bg-neutral-100 uppercase` thead, `divide-y divide-neutral-100 bg-white` tbody.

### Key files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Server entry point — fetches data, renders PageShell |
| `components/PageShell.tsx` | Client wrapper — tabs, banner state, export polling |
| `components/DashboardView.tsx` | Overview tab — discount simulation, stats, line items |
| `components/DownloadedTab.tsx` | Downloaded tab — job list table |
| `components/ui/ExportBanner.tsx` | Slide-in notification banner |
| `util/export-jobs.ts` | Server actions for job queue |
| `util/excel-generator.ts` | Server-side Excel generation (ExcelJS) |
| `util/queries.tsx` | All other server actions (CRUD for orders/line items) |
| `util/formatters.tsx` | Date/currency/percentage formatters |
| `prisma/schema.prisma` | DB schema (User, Order, Product, LineItem, ExportJob) |
