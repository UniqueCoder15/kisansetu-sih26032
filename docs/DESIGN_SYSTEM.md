# KisanSetu — Design System & Visual Blueprint

---

## 1. Design System Principles

The KisanSetu design system is guided by **UI/UX Pro Max** and **Impeccable** design intelligence principles:
1. **Public Utility Trust**: Clean, authoritative, uncluttered aesthetic using a grounding Earth & Deep Forest palette.
2. **Mobile First & Low Literacy Ergonomics**: Minimum 48px touch targets, high contrast ratios (WCAG AAA compliant), 18px+ base body text for outdoor mobile readability.
3. **Strict Semantic Status Color System**: Every queue status has a dedicated, un-ambiguous color token across all roles.

---

## 2. Color Palette & Token System

### Core Brand Colors

```css
:root {
  /* Brand Earth & Forest Tokens */
  --color-brand-primary: #15803d;      /* Deep Forest Green (Trust & Agri) */
  --color-brand-primary-hover: #166534;
  --color-brand-secondary: #d97706;    /* Amber Gold (Harvest / Wheat) */
  --color-brand-accent: #0284c7;       /* Tech Cyan / Water Blue */
  
  /* Neutral Surfaces */
  --color-bg-app: #f8fafc;             /* Light Slate background */
  --color-bg-card: #ffffff;            /* White Card Surface */
  --color-border: #e2e8f0;             /* Subtle Neutral Border */
  --color-text-main: #0f172a;          /* Slate 900 High Contrast Text */
  --color-text-muted: #475569;         /* Slate 600 Body Text */
  --color-text-subtle: #64748b;        /* Slate 500 Captions */
}
```

### Semantic Status Colors (Mandatory Across Application)

Every status in the KisanSetu procurement queue uses a unified semantic color:

| Status Enum | Hex Code | Visual Style | Meaning / Context |
|---|---|---|---|
| `WAITING` | `#d97706` | Amber Gold Badge | Farmer registered in queue; awaiting call. |
| `CALLED` | `#2563eb` | Vibrant Blue Badge | Called to counter; proceed to gate/counter. |
| `ARRIVED` | `#0891b2` | Teal Badge | Gate check-in verified; vehicle inside mandi. |
| `WEIGHING` | `#8b5cf6` | Purple Badge | Gross & tare weight currently being logged. |
| `QUALITY_CHECK` | `#0284c7` | Cyan Badge | Moisture and grain quality testing under way. |
| `PROCUREMENT_COMPLETED` | `#16a34a` | Emerald Green Badge | Crop accepted; receipt generated. |
| `PAYMENT_PENDING` | `#ea580c` | Deep Orange Badge | Disbursement initiated; bank transfer pending. |
| `COMPLETED` | `#15803d` | Forest Green Badge | Full process finished; DBT payment credited. |
| `CANCELLED` | `#dc2626` | Deep Red Badge | Booking voided or crop rejected. |

---

## 3. Typography Scale

Clean, high-legibility sans-serif fonts tailored for bilingual English & Devanagari (Hindi) rendering.

- **Primary Font**: `Inter`, `Noto Sans Devanagari`, sans-serif.
- **Monospace Font**: `JetBrains Mono` (for Token IDs, Weighing slips, and UTR numbers).

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| **Display 1** | 36px / 2.25rem | 800 Bold | 1.2 | Live Token Number (e.g. `#KNL-104`) |
| **Heading 1** | 28px / 1.75rem | 700 Bold | 1.3 | Screen Titles, Main Section Headers |
| **Heading 2** | 22px / 1.375rem | 600 SemiBold | 1.35 | Card Titles, Step Headings |
| **Heading 3** | 18px / 1.125rem | 600 SemiBold | 1.4 | Subsection Titles, Table Headers |
| **Body Large** | 18px / 1.125rem | 400 Regular | 1.5 | Primary Farmer Mobile Text |
| **Body Base** | 16px / 1.0rem | 400 Regular | 1.5 | Standard Operator/Admin Text |
| **Caption** | 14px / 0.875rem | 500 Medium | 1.4 | Helper Labels, Timestamps |

---

## 4. Spacing, Radius & Elevation Tokens

```css
/* Radius System */
--radius-sm: 6px;    /* Badges & Input fields */
--radius-md: 12px;   /* Standard Cards & Modals */
--radius-lg: 20px;   /* Hero Cards & Mobile Banners */
--radius-full: 9999px; /* Pill Buttons & Status Indicators */

/* Elevation / Shadows */
--shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
--shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-glow-success: 0 0 20px -5px rgba(22, 163, 74, 0.4);
```

---

## 5. Key UI Component Specifications

### A. Primary Action Button (`.btn-primary`)
- **Min Height**: 52px (Mobile Touch Target).
- **Background**: `var(--color-brand-primary)` (`#15803d`).
- **Text**: White, 18px, 600 SemiBold.
- **States**: Hover (Darker Green `#166534`), Active (Scale 0.98), Disabled (Gray `#94a3b8`).

### B. Live Token Card Component
- High-contrast visual card featuring large token number, current status badge, estimated wait time, and counter location.
- Includes a live pulsing status ring when token is `CALLED`.

### C. Farmer Mobile Bottom Navigation Bar
- Fixed bottom position (`z-index: 50`).
- 5 items with 24px icons and 12px bold labels.
- Active tab highlighted with green background capsule (`bg-emerald-50 text-emerald-800`).

---

## 6. Motion & Micro-Interaction Guidelines (Motion First)

Motion is applied purposefully to reinforce state changes and queue progress without causing distraction.

| Motion Trigger | Motion Pattern | Purpose |
|---|---|---|
| **Queue Position Decrease** | Smooth numeric increment animation (`0.4s easeOut`) | Reassures farmer that queue is actively moving. |
| **Token Status Shift** | Background color transition + subtle pulse (`0.6s easeInOut`) | Instant feedback when status changes to `CALLED` or `ARRIVED`. |
| **Booking Confirmation** | Scale spring bounce (`scale: [0.9, 1.05, 1]`) | Clear visual reward upon successful slot reservation. |
| **Notification Banner Arrival** | Slide down from top (`y: [-100%, 0]`) | High-priority alert for gate/counter call. |

---

## 7. State Patterns (Empty, Loading, Error)

### Empty States
- **Farmer No Active Booking**: Clear illustration of a peaceful mandi, headline "No Active Booking", and large primary button "Book Procurement Slot".
- **Operator Empty Queue**: Icon indicating "All Farmers Processed for this Slot", friendly reassurance message.

### Loading States
- Skeleton loaders for queue cards and metric counters.
- Low-bandwidth friendly progress bars.

### Error States
- Explicit, friendly error messages in both Hindi & English (e.g. *"Unable to update queue due to poor connection. Your offline token remains valid."*).
