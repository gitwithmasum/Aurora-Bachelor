<div align="center">

![Aurora Bachelor — House Management OS](./Assets/Aurora%20House%20Management%20Dashboard.png)

# AURORA BACHELOR
### MEAL & HOUSE MANAGEMENT OS

**A local-first command center for shared bachelor living.**

[![GitHub](https://img.shields.io/badge/Source-GitHub-181717?logo=github)](https://github.com/gitwithmasum/Aurora-Bachelor)
[![Vercel](https://img.shields.io/badge/Live-Vercel-000000?logo=vercel)](https://aurora-bachelor-masumtheinvincible.vercel.app)
![HTML](https://img.shields.io/badge/HTML-5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/Experience-Installable%20PWA-7454ED)

**[Launch Aurora Bachelor](https://aurora-bachelor-masumtheinvincible.vercel.app)** · **[Repository](https://github.com/gitwithmasum/Aurora-Bachelor)** · **[Product specification](./Assets/Aurora%20Bachelor%20Product%20Specification.pdf)**

</div>

---

## 01 / Mission

Aurora Bachelor is a responsive **meal and household management application** for people sharing a bachelor house or mess. It connects daily meal tracking, meal costs, household bills, contributions and end-of-month settlement into one interface.

> **Two accounts. One household. Clear balances.**
> Meal accounting and house accounting are tracked separately, then brought together for settlement.

The project is built with HTML, CSS and vanilla JavaScript. It uses browser-local data, provides Supabase-based household features and supports a service-worker-powered installable experience. Cloud functionality depends on having a functioning configured backend and an authenticated household.

## 02 / Command Center Modules

| Module | Purpose |
|:--|:--|
| **Dashboard** | At-a-glance monthly household overview and key figures |
| **Weekly Planner** | 7-day task planning, assignments, priorities and status |
| **Daily Meals / Meal Matrix** | Record members' daily meals and track meal totals |
| **Members** | Maintain the list of people sharing the household |
| **Expenses** | Track meal-related or other recorded spending |
| **Payments** | Record member contributions and payments |
| **House Bills** | Manage rent and shared utility or service bills |
| **Monthly Report** | Review monthly totals and household accounting |
| **Settlement** | Calculate members' balances from meal and house accounts |
| **Activity** | Review recorded household activity |
| **Version History** | View version-related information in the interface |
| **Settings** | Manage household preferences, personalization and available data controls |

### Meal accounting

The meal workflow maintains daily meal counts and meal expenses. A monthly meal rate can be derived from the relevant expense and meal totals. Per-member meal amounts contribute to monthly accounting.

### House accounting

Rent and shared bills, such as electricity, gas, water and internet, are accounted for alongside recorded payments. These figures contribute to household balances.

### Settlement

```text
                    AURORA BACHELOR
                          │
                 HOUSEHOLD DATA
                          │
              ┌───────────┴───────────┐
              │                       │
         MEAL ACCOUNT            HOUSE ACCOUNT
       Daily meal matrix        Rent and utilities
       Meal expenses            Shared house bills
       Member contributions     House payments
              │                       │
              └───────────┬───────────┘
                          │
                   SETTLEMENT
                          │
                MEMBER BALANCES
```

**Important:** Always review bill-sharing assumptions, recorded payments and settlement totals before using the calculated balances for real financial decisions.

## 03 / Accounts, Household Access & Cloud

The codebase includes Google/Supabase authentication integrations, household membership checks and role-aware functionality.

| Role | General access model |
|:--|:--|
| **Owner** | Highest level of household administration |
| **Admin** | Household management access, subject to the application's permissions |
| **Member** | Member-facing access; cloud write operations may be restricted |

The implementation includes Supabase RPC calls for household data retrieval and saving, revision-aware writes, local safety backups and realtime subscriptions. The cloud engine performs initial household loading, supports updates when data is saved and can respond to remote changes.

**Cloud sync is not the same as a guaranteed backup.** Verify backend availability, account permissions, successful saves and exported backups before clearing local storage or changing devices.

### Data flow

```text
Google / Supabase Auth
          │
  Household Membership
          │
      Role Checks
          │
 Browser Data Store ←→ Household Cloud Data
          │                  │
    Local Backup      Revision-aware Save
          │                  │
          └────────┬─────────┘
                   │
             Responsive UI
```

## 04 / Personalization

Aurora Bachelor includes device-level appearance preferences and a collection of visual themes. Examples in the current code include:

- Aurora and Midnight
- White & Gold; Copper & Cocoa
- Sea Olive; Mirage Sky; Bay Olivine
- Arctic Teal; Slate Serenity; Plum & Orchid
- Pink & Purple Waves; Ocean Neon Waves
- Violet Neon Stripes; Sky Blue & White Waves
- Neon Circuit Blue
- Afad's Special; Aurora's Special; Thor's Special

Theme availability and exact labels are defined in `script.js` and `themes.css`. Appearance preferences on one device do not necessarily propagate to others.

## 05 / Installable & Responsive Experience

- Desktop and mobile layouts
- PWA manifest and standalone display mode
- Service worker for static assets and app updates
- Home-screen installation where supported by the browser
- Locally stored app data and backup/export capabilities

**PWA cache version in the inspected source:** `aurora-bachelor-v49`. This value describes the checked revision, not a guaranteed application release number.

## 06 / Stack

| Layer | Technology |
|:--|:--|
| UI | HTML5, CSS3, vanilla JavaScript |
| Fonts / visual design | Orbitron and Aurora-inspired design tokens |
| Data | Local browser storage; Supabase integrations |
| Auth / permissions | Supabase Auth, Google sign-in flows, household roles |
| Cloud | Supabase RPC operations and realtime channel |
| Reports / export dependencies | jsPDF, AutoTable, SheetJS / XLSX libraries referenced in the app |
| Installation / caching | `manifest.json`, `sw.js` |
| Hosting | Static hosting; Vercel deployment is linked above |

This is primarily a **static web frontend**, not a Node-based application with a required dependency installation step for basic local viewing.

## 07 / Getting Started

### Option A — Run locally

```bash
git clone https://github.com/gitwithmasum/Aurora-Bachelor.git
cd Aurora-Bachelor
```

Open `index.html` in a modern browser for a basic preview. For service-worker functionality and more realistic testing, serve the folder from `localhost` instead:

```bash
python -m http.server 5500
```

Visit `http://localhost:5500`.

### Option B — Use the hosted app

Open **[Aurora Bachelor on Vercel](https://aurora-bachelor-masumtheinvincible.vercel.app)**.

### Backend prerequisites

Cloud-enabled operations require a working Supabase project, compatible database tables/functions/policies, an authorized household and correctly configured authentication/redirects. The repository contains related SQL and an invitation email edge function, but it is **not a complete one-command production backend installer**. Do not expose Supabase service-role keys or other secrets in frontend code or public commits.

## 08 / Repository Map

```text
Aurora-Bachelor/
├── index.html                   # Application shell / navigation
├── style_v3.css                 # Main interface styling
├── themes.css                   # Personalization and theme styles
├── script.js                    # Core UI, accounting and cloud behaviour
├── manifest.json                # PWA manifest
├── sw.js                        # Service worker and cache
├── Assets/
│   ├── Aurora House Management Dashboard.png
│   ├── icons/
│   └── themes/
├── database/                    # Related SQL scripts and tests
├── supabase/functions/
│   └── send-house-invite/       # Invitation email function
├── tests/                       # JavaScript regression checks
└── README.md
```

## 09 / Tests & Quality Checks

The repository currently includes Node-compatible test scripts for themes, cloud-status behaviour, installation/onboarding, invitation flow, invitation email and member updates.

From the repository root, run individual checks with Node.js, for example:

```bash
node tests/themes.cjs
node tests/cloud-status.cjs
node tests/install-onboarding.cjs
node tests/invitation-flow.cjs
node tests/invitation-email.cjs
node tests/member-update.cjs
```

These are **available commands**, not a claim that every test is currently passing. A full release check should also cover sign-in, member permissions, accounting, mobile layout, cloud saves, PWA update flow and browser console errors.

## 10 / Data Safety & Permissions

1. Export or preserve a backup before clearing site data, resetting the app or changing account configuration.
2. Verify the active household and selected month before editing financial data.
3. Keep authentication tokens, access credentials and service-role keys private.
4. Test role restrictions with separate Owner, Admin and Member accounts.
5. Verify cloud connectivity and that edits appear correctly on authorized devices.
6. Review settlement figures before acting on them.

No publicly hosted demo data shown in screenshots should be treated as a real user's household accounts.

## 11 / Deployment

The app can be hosted as static files. The current project uses a GitHub repository and a linked Vercel production project.

- **Source:** [gitwithmasum/Aurora-Bachelor](https://github.com/gitwithmasum/Aurora-Bachelor)
- **Vercel app:** [aurora-bachelor-masumtheinvincible.vercel.app](https://aurora-bachelor-masumtheinvincible.vercel.app)
- **Deployments:** [Vercel project dashboard](https://vercel.com/masumtheinvincible/aurora-bachelor)

After a deploy, verify that the new frontend and cached assets load on desktop and installed PWA clients. GitHub Pages and Vercel have independent deployment states; one succeeding does not prove the other succeeded.

## 12 / Project Documents & Maintenance

- [Product Specification (PDF)](./Assets/Aurora%20Bachelor%20Product%20Specification.pdf)
- [Application icons](./Assets/icons/)
- [Theme assets](./Assets/themes/)
- [Database resources](./database/)
- [Supabase invitation function](./supabase/functions/send-house-invite/)
- [Regression checks](./tests/)

The README describes capabilities found in the repository at review time. Refer to source code and deployment logs for the definitive implementation and operational state.

---

<div align="center">

**AURORA BACHELOR · HOUSE MANAGEMENT OS**

*Daily meals. Shared expenses. House bills. Clearer settlements.*

**Built for organized shared living.**

</div>


## Weekly Planner — Phase 1

Saturday-to-Friday task board with week navigation, task create/edit/delete, status, category, priority and assignment to active household members. Uses the existing `weeklyPlanner.tasks` household JSON store and standard local/cloud save pathway. This planner does not change meal counts or accounting. Bazaar Planner has been added in Phase 2. Weekly Meal Planner and Duty Rotation remain planned.


## Bazaar Planner — Phase 2

Weekly Planner includes shopping plans with scheduled date, assigned house member, budget, notes, item list, quantities, units, estimated prices, purchased checkboxes and optional actual unit prices. Shopping records are saved in `weeklyPlanner.bazaars` alongside existing household data. Bazaar plans are not automatically posted to meal expenses or house bills; this avoids altering financial records without explicit confirmation.


## Weekly Meal Planner — Phase 3

Weekly Planner includes a seven-day Saturday–Friday day/night meal schedule. Each meal and optional estimated daily cost can be edited, with weekly overview, next/previous week navigation, copyable menu, and a copy-previous-week action. Weekly menus use `weeklyPlanner.mealMenus` inside the existing household data store; the app saves changes through its normal local/cloud persistence. Empty weeks display example dishes until edited; no actual meal counts, expense entries or settlement values are changed. Read-only household members can view plans but cannot edit. Bazaar Planner and the weekly task board remain separate.


## Weekly Planner v1.5 — Reliability & Mobile

Mobile and narrow-screen layouts have improved focus visibility, touch sizing, horizontal task-board scrolling, budget/checklist responsiveness and reduced-motion behaviour. The task renderer now refreshes all four planner modules after edits rather than leaving sibling modules hidden. `tests/weekly-planner.cjs` contains Node regression checks for module registration, JavaScript syntax, PWA precache, duty rotation order, manual overrides and data separation. Run locally with `node tests/weekly-planner.cjs`. These source tests do **not** substitute for Android/PWA interaction checks or authenticated multi-device Supabase persistence tests. Service-worker cache version: `aurora-bachelor-v53`.
