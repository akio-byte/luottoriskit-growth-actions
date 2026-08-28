# Luottoriskit.fi Growth Actions

A working internal dashboard prototype that turns recurring SEO and reporting findings into owned, measurable growth actions. It is designed for a growth, SEO, product, or analytics owner who needs to see what deserves action, what is blocked, when the next decision is due, and what the team learned.

## Core functionality

- Four realistic mock actions with stable IDs, owners, priorities, evidence, hypotheses, baselines, targets, measures, and decision dates
- Selectable action queue and detailed experiment workspace
- Full action lifecycle plus clearly flagged `BLOCKED`, `STALE`, and `ESCALATED` exception states
- Status changes that immediately update the dashboard summary and activity log
- Result and learning notes retained in the browser
- Attention, active, and learned queue views
- Responsive dark internal-tool interface

## Technology

React, TypeScript, Vite, and Lucide icons. There is no backend. Prototype changes are stored in browser local storage and can be reset from the header.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Data and non-goals

All content and metrics are realistic mock data. The prototype uses no private or proprietary Valuatum data.

Authentication, a database, real analytics integrations, email automation, an AI assistant, and production workflow orchestration are intentionally out of scope.

## Build evidence

The main instruction was the provided **VALUATUM TASK 1 — 60 MINUTE BUILD** brief. A real backend, authentication, and shared persistence were considered and intentionally rejected because they would consume the limited build window without improving the demonstration of the core action-lifecycle hypothesis.

## With two additional hours

- Add structured experiment-result fields and a compact learning archive
- Add status and priority filters with shareable URL state
- Improve decision-date handling with relative overdue indicators
- Add focused component tests and accessibility checks
- Prepare deployment metadata and a private review build

The actual recruitment-task elapsed time is intentionally not recorded here.
