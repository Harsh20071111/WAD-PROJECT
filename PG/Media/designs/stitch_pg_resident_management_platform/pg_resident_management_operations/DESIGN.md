---
name: PG & Resident Management Operations
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#005683'
  on-tertiary: '#ffffff'
  tertiary-container: '#006fa8'
  on-tertiary-container: '#dbecff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  numeric-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is tailored for institutional and multi-property Indian rental accommodations (paying guest facilities, co-living spaces, and managed student residences in hubs like Bengaluru, Ahmedabad, Pune, and Kota). 

The visual identity rejects generic SaaS tropes (no ethereal purple gradients, floating glassy cards, or exaggerated 3D illustrations) in favor of **pragmatic, high-utility operational craft**. The interface prioritizes high information density, structural legibility under diverse lighting environments (from sunlit front desks to dim warden offices), and immediate status recognition across tenants, rooms, rent cycles, and maintenance tickets.

The emotional tone balances hospitality warmth with operational rigour: dependable, transparent, organized, and distinctly grounded in Indian urban rental realities.

## Colors

The palette establishes visual authority using a deep teal core paired with warm functional accents and rigorous slate neutrals.

- **Primary (`#0F766E` / Deep Teal):** Communicates institutional trust, hygiene, and calm efficiency. Used for primary calls-to-action, active navigational states, and verified property badges.
- **Secondary (`#F59E0B` / Warm Amber):** Represents attention-demanding but non-critical operational states: pending rent collection, food mess updates, and gate passes awaiting warden confirmation.
- **Tertiary (`#0284C7` / Sky Blue):** Reserved for active operational tasks: tickets assigned to technicians, in-progress laundry cycles, and room inspection schedules.
- **Neutrals (Slate Tiers):**
  - Canvas Background: `#F8FAFC` (`slate-50`)
  - Elevated Container / Card Background: `#FFFFFF`
  - Subtle Borders & Dividers: `#E2E8F0` (`slate-200`)
  - Secondary Text & Metadata: `#64748B` (`slate-500`)
  - Primary Text & Data Headings: `#0F172A` (`slate-900`)

### Operational Status Mapping
Status tokens are strictly functional and semantic:
- **Paid / Cleared / Resolved:** Emerald (`#059669`)
- **Pending / Due Today / On Hold:** Amber (`#D97706`)
- **Overdue / Defaulter / Escalated:** Rose (`#E11D48`)
- **Assigned / In Progress:** Sky (`#0284C7`)
- **Draft / Inactive / Closed:** Slate (`#64748B`)

## Typography

Typography balances character and utilitarian discipline:

1. **Headlines (`Plus Jakarta Sans`):** Warm geometric construction with open letterforms, preventing managerial dashboards from feeling cold or overly bureaucratic.
2. **Body & Controls (`Inter`):** Neutral, robust grotesque typeface chosen for dense multi-field inputs, compact tables, and mobile screen clarity.
3. **Tabular Numerics Rule:** All currency amounts (`₹12,500/mo`, `₹4,000 Deposit`), room designations (`Room 204-B`), meter units (`42.8 kWh`), and phone numbers (`+91 98765 43210`) must strictly activate OpenType `tnum` (tabular figures) and `cv02` / `cv03` features to guarantee vertical column alignment across property registers.

## Layout & Spacing

This system implements an intentional, structured 12-column layout grid on desktop with predictable structural zones:

- **Desktop (1280px+):** 12 columns, 16px (`1rem`) gutters, 24px (`1.5rem`) canvas margin. Left-rail vertical navigation is pinned at a fixed 260px; the central operational workspace takes up dynamic remainder with a maximum content width of 1440px.
- **Tablet / Large Mobile (768px - 1024px):** 8 columns, 16px gutters, 16px margin. Navigation moves to a collapsible rail or docked bottom sheet for quick resident lookups.
- **Mobile Handheld (<768px):** 4 columns, 12px gutters, 16px margins. Primary views stack into single-column operational streams (e.g., room allocation cards, payment logs, one-tap WhatsApp receipt triggers).

Spacing tokens govern density inside dense multi-bed layouts:
- `space-xs` (4px): Metric pill padding, badge internal gaps.
- `space-sm` (8px): Form input padding, button internal gaps, table row vertical cell spacing.
- `space-md` (16px): Card internal padding, form row spacing.
- `space-lg` (24px): Inter-card stacking, operational section breaks.
- `space-xl` (32px): Primary dashboard segment transitions.

## Elevation & Depth

This system avoids heavy shadows, blurred depth masks, and glassmorphic translucent fills. Depth is achieved via **low-contrast outlines and structural surface contrast**:

1. **Base Tier (Ground):** `#F8FAFC` (`slate-50`). Page background for all dashboards, tables, and inspection views.
2. **Surface Tier (Cards & Containers):** Pure `#FFFFFF` resting directly on the slate canvas, defined by a crisp `1px solid #E2E8F0` border.
3. **Elevated Overlays (Dropdowns, Room Switchers, Date Pickers):** Pure `#FFFFFF` with a single functional, tight ambient shadow: `box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`.
4. **Interactive Focus Tier:** Form elements and focusable list cards trigger a clean `0 0 0 2px #0F766E` offset ring without soft blurred halos.

## Shapes

The interface utilizes a disciplined geometry balancing friendly hospitality with enterprise structure:

- **Base Radius (8px / `0.5rem`):** Applied uniformly to inputs, action buttons, filter tags, dropdown menus, and data badges.
- **Container Radius (12px / `0.75rem`):** Applied to content cards, resident ledger panels, and room layout blocks.
- **Special Components:** 
  - Bed occupancy indicators (`Available`, `Occupied`, `Notice Period`) maintain a fully rounded 9999px pill profile for instant spatial recognition.
  - Avatar indicators for residents use full circles (9999px) with simple 2-letter Indian naming convention fallbacks (e.g., `AK`, `PM`).

## Components

### Buttons
- **Primary:** Deep Teal background (`#0F766E`), white text (`#FFFFFF`), 8px border radius, 8px 16px padding. Hover: `#115E59`. Active: `#134E4A`.
- **Secondary / Action:** White background, 1px border `#CBD5E1`, text `#0F172A`. Hover: `#F1F5F9`.
- **Critical / Overdue Notice:** Rose tint background (`#FFF1F2`), border `#FECDD3`, text `#BE123C`. Used for eviction notices and payment defaulter actions.

### Input Fields & Search
- Background: `#FFFFFF`, border: `1px solid #CBD5E1`, border-radius: 8px, text: `#0F172A`, placeholder: `#94A3B8`.
- Focus state: Border color transitions to `#0F766E` with an outer non-blurred 2px focus ring (`#0F766E15`).
- Currency Prefix: Affix fixed non-editable `₹` adornment to the left in `#64748B` with `tabular-nums`.

### Status Badges & Chips
- Designed with subtle light tints and high-contrast text:
  - **Rent Paid:** Bg `#ECFDF5`, text `#047857`, border `1px solid #A7F3D0`.
  - **Payment Overdue / Defaulter:** Bg `#FFF1F2`, text `#BE123C`, border `1px solid #FECDD3`.
  - **Pending Verification (KYC/Aadhaar):** Bg `#FFFBEB`, text `#B45309`, border `1px solid #FDE68A`.
  - **Work Order Assigned:** Bg `#F0F9FF`, text `#0369A1`, border `1px solid #BAE6FD`.

### Room Grid Cards (Context-Specific)
- Clean card matrix showing Room number (`Room 201`), sharing tier (`Double Sharing - AC`), bed occupancy dots (`Bed A: Occupied`, `Bed B: Vacant`), and electricity meter reading.
- Visual state: 1px slate-200 border, 12px roundedness, 16px inner padding.

### Resident Ledger Row & Checkbox
- Checkbox: 16px x 16px, 4px corner radius, `#0F766E` checked fill with crisp white checkmark.
- Table Row: 44px min-height, border-bottom `1px solid #F1F5F9`. Hover row background `#F8FAFC`. All payment numbers formatted as `₹14,500.00` aligned right in tabular digits.