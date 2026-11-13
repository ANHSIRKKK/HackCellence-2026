# Booking.com · Smart Holiday Planner & Booking Platform
### Hackathon Problem 1 Solution (MERN Stack Architecture)

An end-to-end holiday package planning and booking web application built for the **Hackathon Problem 1**. Designed with the familiar visual layout of **Booking.com**, the platform takes complex multi-party travel constraints and instantly synthesizes complete, validated holiday itineraries with flights, hotels, airport transfers, intercity transfers, and attractions.

---

## 🚀 Quick Start (Instant Run)

### 1. Start Backend & Full Platform (Port 5001)
```bash
npm start
```
*(Or `node backend/server.js`)*

Open your browser at:
👉 **`http://localhost:5001`**

### 2. Optional: React / Vite Frontend Dev Server (Port 3000)
```bash
cd frontend && npm run dev
```

---

## 🏛️ System Architecture

The system strictly adheres to the rule that **the backend holds all business logic** while the frontend communicates exclusively through REST API endpoints. All optimization and recommendation algorithms are **100% deterministic rule-based (Zero AI / LLM APIs)** per hackathon specifications.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend (React + Booking.com UI)                    │
│  - 5 Streamlined Core Tabs: Stays, Flights, Flight+Hotel, Attractions, │
│    and Sacred Tirth Yatra (Adults / Parents Pilgrimage)                │
│  - Sticky Live Itinerary Preview & Budget Progress Meter               │
│  - Senior Tirth Yatra Customization Suite (Helipad, Puja, Diet, Sevak) │
│  - Component Swap Modals with Real-Time Price Deltas                   │
│  - 10-Digit Numeric Reservation Pass & 1-Click JSON Export             │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ REST API (JSON)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Backend (Node.js REST Service)                        │
│  - Catalog Indexer: In-memory graphs from data/catalog (56 attractions)│
│  - Planner Engine: Combinatorial Constraint Solver (M1–M8, G1–G4)      │
│  - Room Fit Math: Strict room capacity formulas & night availability   │
│  - Transport Buffers: Mandatory 60m arrival, 180m dep safety windows   │
│  - Validator & Swapper: Real-time price deltas (+₹X / -₹Y)             │
│  - Document Storage: Persistent reservations & inventory locks         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 5 Core Multi-Page Views

| View | Feature & Functionality |
|---|---|
| **🛏️ Stays** | Verified accommodations catalog with real photography, room-capacity formulas (`2 adults + 1 child`), star ratings, and signature yellow search box. |
| **✈️ Flights** | Dedicated flight comparison search with roundtrip/one-way options, dashed trajectory maps, airline emblems (Nippon Sky, AirVeda, Sandline), and **[Select Flight]** CTA. |
| **🏨 Flight + Hotel** | Flagship Holiday Package Builder with **Cheapest** (₹1,64,472), **Fastest** (₹2,10,500), and **Best Rated** (₹2,89,000) tiers, component cards with buffer validation, and sticky **LIVE ITINERARY PREVIEW**. |
| **🎡 Attractions** | 56 real catalog experiences with real photos (`images/attractions/`), city/category filter pills, and working **[+ Add to Package]** buttons that dynamically recalculate the live package. |
| **⛩️ Tirth Yatra** | Sacred India pilgrimage packages designed for parents/seniors (Char Dham, Kashi Vishwanath, Ayodhya, Tirupati Balaji, Vaishno Devi, Dwarka) with full elder-care customization (Helipad, Wheelchair, Sattvic/Jain meals, Gotra Puja). |

---

## ⚙️ Senior Tirth Yatra Customization Suite
As highlighted in the brief, children often book holidays for their senior parents. The platform includes a dedicated **Customization Suite**:
- **Elder Care Trust Matrix**: 24/7 Oxygen & Paramedic, Zero-Trek & Wheelchair buggy, Pure Sattvic/Jain dining, 4-Star ground-floor senior stays.
- **Interactive Day-Wise Schedule**: Complete day-by-day itineraries and verified reviews right on each card.
- **Dynamic Price Customizer**: Real-time recalculator for traveler counts, helicopter upgrades (+₹24,000/adult), 5-star palace tiers (+₹14,000), special Gotra Sankalp Puja (+₹2,500), and 24/7 personal sevaks (+₹4,500).
- **10-Digit Reservation**: Instant lock saved directly to persistent storage with printable receipt.

---

## 📂 Project Structure

```
HackCellence-2026/
├── backend/
│   ├── server.js          # REST API & static file server (JSX/MIME aware)
│   ├── catalog.js         # Catalog loader and fast in-memory indexing
│   ├── planner.js         # Combinatorial constraint solver & package builder
│   ├── validator.js       # Revalidator and swap options generator with deltas
│   ├── storage.js         # Persistent JSON document store & inventory locks
│   └── sqlite_db.js       # Enterprise SQLite 3 database adapter & queries
├── frontend/
│   ├── index.html         # Booking.com styled application entry point
│   ├── package.json       # React 18/19, Lucide-React & Vite config
│   ├── vite.config.js     # Vite configuration with API proxying
│   └── src/
│       ├── main.jsx       # React DOM root entry point
│       ├── App.jsx        # Core state container (useState, useEffect)
│       ├── api.js         # Centralized backend REST API client
│       ├── index.css      # Full Booking.com CSS design system
│       └── components/    # Modular React components (Navbar, Stays, Flights, etc.)
├── images/
│   ├── attractions/       # 56 verified catalog attraction photographs
│   └── hotels/            # Real hotel room & luxury property imagery
└── data/
    ├── catalog/           # Read-only catalog JSON files (destinations, flights, etc.)
    ├── reservations.json  # Persistent reservation database (survives restarts)
    └── trip_format_example.json
```

---

## 🏙️ City Selection & Routing Rule (Section 4 Compliance)
Per problem statement rules, the planner enforces:
- **Duration**: Trips must be 3 to 10 nights strictly between 1 April and 20 April 2027.
- **Minimum Stay**: Each city must have at least **2 consecutive nights** (`min_nights_per_city: 2`).
- **No Repeats**: Each city appears exactly once in the itinerary (no zig-zag revisits).
- **Intercity Links**: Transitions between cities strictly use official links defined in `destinations.json` (e.g. Bullet Train Shinkansen between Tokyo and Kyoto) scheduled on the check-out day within service operating hours.
- **Airport Assignment**: Outbound flight lands at an airport serving the first city; return flight departs from an airport serving the last city (e.g. BLR ➔ NRT/HND for Tokyo, and KIX ➔ BLR for Kyoto/Osaka).

---

## ✅ Feature Checklist (What We Finished)

| Category | ID | Feature | Status | Details |
|---|---|---|---|---|
| **Must-Have** | **M1** | Request Form | ✅ 100% | 7 mandatory fields, validated against `destinations.json` |
| | **M2** | Build One Package | ✅ 100% | Constraint solver builds complete package or explains exact bottleneck |
| | **M3** | Travel Rules Respected | ✅ 100% | All Section 4 rules strictly enforced (buffers, room fit, service hours) |
| | **M4** | Day-by-Day Plan | ✅ 100% | Chronological timeline (flight ➔ cab ➔ stay ➔ attractions ➔ return) |
| | **M5** | Total & Budget | ✅ 100% | Live price sum in INR, savings meter, Section 6 JSON export |
| | **M6** | Change the Package | ✅ 100% | Live swaps for hotels, flights & attractions with recalculated deltas |
| | **M7** | 10-Digit Reservation | ✅ 100% | Persistent unique 10-digit code surviving server restarts |
| | **M8** | Budget Too Small | ✅ 100% | Explains shortfall, displays cheapest valid price & 3 suggestions |
| **Good-to-Have** | **G1** | Buffer Warnings | ✅ 100% | Checks $<60$m arrival buffer, $<180$m departure buffer, attraction overlaps |
| | **G2** | Price Delta Badges | ✅ 100% | Shows `+₹X` / `-₹Y` differences on all swap options |
| | **G3** | Change Cities | ✅ 100% | 1-click alternative multi-city route selector pills |
| | **G4** | Three Packages | ✅ 100% | **Cheapest**, **Fastest Transit**, and **Best Rated Stays** tiers |
| **Stretch** | **S1** | Multi-City Route Optimizer | ✅ 100% | Constraint solver ordering optimal airport-to-hotel transit legs |
| | **S2** | Live Inventory Decrement | ✅ 100% | Decrements seats & rooms, refuses overbooked reservations |
| | **S3** | Senior Tirth Yatra Suite | ✅ 100% | Dedicated elder-care pilgrimage customizer (Helipad, Sattvic, Sevak) |
| **Enterprise** | **DB** | SQLite 3 Database | ✅ 100% | `data/holiday.db` relational schema, SQL console & `npm run db:inspect` |

---

## ⚠️ Known Limitations
1. **Catalog Date Window**: Flights and hotel room availability exist strictly between **1 April 2027 and 20 April 2027**.
2. **Aircraft Seat Capacity**: Aircraft in the catalog dataset carry maximum **9 seats** (`seats_left <= 9`). Parties greater than 9 cannot fly on a single flight.
3. **Read-Only Data**: Mock catalog files in `data/catalog/` are treated as immutable read-only assets per hackathon guidelines.

---

## 🛡️ Hackathon Constraints Compliance
- **Zero AI / LLM APIs**: All filtering, ranking, and optimization use deterministic algorithms.
- **60-Minute Buffers**: Strict transfer cushion validation between flight landing and hotel check-in.
- **Child & Family Capacity**: Mathematical room verification ensuring party size strictly adheres to hotel room limits.
- **Persistent Inventory Locking**: Confirmed bookings create unique 10-digit codes that hold seats and rooms.
