# KisanSetu — Smart Procurement & Queue Management Platform
## Product Vision & Strategy Document (SIH26032)

---

## 1. Executive Summary

**KisanSetu** (किसानसेतु) is a digital agricultural procurement management and queue scheduling platform designed specifically for the Indian agricultural ecosystem under **SIH Problem Statement SIH26032**. 

During harvesting seasons (Rabi & Kharif), government procurement centres (Mandi / Paddy Procurement Centres / Wheat Mandis) experience extreme congestion, unpredictable waiting times (often 12–48 hours), lack of schedule transparency, and manual queue bottlenecks. Farmers travel long distances without knowing if their crop will be weighed or accepted on the same day.

**KisanSetu solves this by establishing an end-to-end digital token and queue management bridge** between:
1. **Farmers** (Mobile-first, bilingual, low-bandwidth optimized queue tracking & slot booking).
2. **Procurement Centre Operators** (Live queue orchestration, counter calling, weighing & quality check logging).
3. **Government Admins & District Officers** (Real-time Mandi workload monitoring, congestion heatmaps, payment transparency).

---

## 2. Core Problem Statement Breakdown (SIH26032)

| Problem Dimension | Current Ground Reality | KisanSetu Solution |
|---|---|---|
| **Unpredictable Waiting Times** | Farmers wait outside mandis for up to 2 days without queue visibility. | **Real-Time Token & Estimated Wait Time (EWT)** calculated dynamically per counter. |
| **Procurement Congestion** | Unregulated arrival of thousands of farmers on peak harvest days. | **Smart Time-Slot Booking** with daily capacity limits per procurement centre. |
| **Lack of Transparency** | Opaque quality grading, manual token allocation, and delayed payments. | **Digital Audit Trail**: Live status from Gate Entry $\rightarrow$ Weighing $\rightarrow$ Quality $\rightarrow$ Payment. |
| **Literacy & Network Barriers** | Rural farmers often struggle with complex SaaS apps and weak 2G/3G connectivity. | **Ultra-accessible, bilingual (Hindi/English), offline-capable mobile PWA** with large touch targets. |

---

## 3. Product Mission & Design Philosophy

### Mission Statement
> *"To eliminate mandi queue uncertainty for every Indian farmer by providing a calm, transparent, and accessible digital procurement journey."*

### Key Design Pillars (Guided by Impeccable & UI/UX Pro Max)
1. **Calm Public-Service Ergonomics**: Designed like an authoritative, highly trustworthy Indian public utility (e.g., Passport Seva, CoWIN) rather than a noisy commercial SaaS.
2. **Mobile-First & High Contrast**: Large 48px+ touch targets, bold 18px+ readable typography, and high contrast ratios for outdoor sunlight visibility.
3. **Zero-Latency Offline Resilience**: Works under degraded 2G/3G network conditions; local token caching ensures offline token display.
4. **Deterministic Fairness**: Transparent FIFO queue logic with clear position tracking (`Token #A-104 | 3 Farmers Ahead`).

---

## 4. User Personas

### Persona 1: Ramesh Kumar (Smallholder Farmer)
* **Age**: 46 | **Location**: Sehore District, Madhya Pradesh | **Crop**: Wheat (Gehun)
* **Tech Literacy**: Moderate (Uses WhatsApp & YouTube; prefers Hindi voice/large UI).
* **Pain Point**: Spends ₹2,000 on tractor rental and waits overnight outside the mandi without knowing when his turn will come.
* **KisanSetu Goal**: Book a 10:00 AM slot, arrive 15 mins prior, track live queue on his phone, finish procurement by 1:00 PM.

### Persona 2: Suresh Patel (Mandir / Centre Operator)
* **Age**: 38 | **Role**: Senior Procurement In-Charge | **Location**: Karnal Grain Market, Haryana
* **Tech Literacy**: Tech-savvy; uses desktop/tablet for daily entry.
* **Pain Point**: Crowded gates, manual register entries, arguments over queue position, delay in sending quality inspection reports.
* **KisanSetu Goal**: One-click token calling, quick digital weight logger, seamless status handoff to quality inspectors.

### Persona 3: Dr. Anita Sharma (District Agricultural Collector / Admin)
* **Role**: District Magistrate & Agri Officer | **Location**: Punjab State Agricultural Board
* **Tech Literacy**: Expert analytics user.
* **Pain Point**: No real-time visibility into which mandis are bottlenecked or which payments are delayed.
* **KisanSetu Goal**: Live district map dashboard showing queue congestion, average wait times, and pending payment clearances.

---

## 5. Scope & Boundary Limits

### In Scope for KisanSetu
- Farmer Slot Booking & Token Generation.
- Real-time Queue Tracking (Position, Counter Status, EWT).
- Operator Workflow (Gate Check, Weighing, Quality Inspection, Payment Status Update).
- District & State Admin Analytics (Capacity Utilization, Bottleneck Heatmap).
- Bilingual Support (Hindi + English).

### Out of Scope for Phase 1
- Direct Payment Gateway Integration (Simulated payment status transitions).
- Automated AI Quality Grading (Planned for future ML expansion).
- Third-Party Transport Logistics Booking.
