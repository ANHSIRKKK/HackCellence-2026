# Build My Holiday — Problem 1 (Holiday Package)

An end-to-end holiday package planning and booking web application built for the **Hackathon Problem 1**. Designed with the familiar, high-conversion visual design of **Booking.com**, the platform takes complex multi-party travel constraints and instantly synthesizes complete, validated holiday itineraries with flights, hotels, airport transfers, intercity transfers, and attractions.

---

## 🚀 How to Run in 1 Command

No package downloads, virtual environments, or database setups are required. The entire backend and frontend run using native Node.js (v18+).

```bash
npm start
```
*(Or alternatively: `node backend/server.js`)*

Open your browser at:
👉 **`http://localhost:5001`**

---

## 🏛️ Architecture Overview

The system strictly adheres to the rule that **the backend holds all business logic** while the frontend communicates exclusively through REST API endpoints.

```
┌────────────────────────────────────────────────────────┐
│             Frontend (Booking.com Themed UI)           │
│  - Iconic Booking.com Yellow Search Box & Nav Header   │
│  - Quick-Request Smart Search (Feature S1)             │
│  - Persona Selectors (Spiritual/Tirth, Kids, Luxury)   │
│  - 3 Package Comparison Cards (Cheapest, Fastest, Best)│
│  - Day-by-Day Interactive Itinerary Timeline (M4)      │
│  - Live Swap Modals with Real-Time Price Deltas (M6)   │
│  - 10-Digit Reservation Pass & 1-Click JSON Export     │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JSON)
┌───────────────────────────▼────────────────────────────┐
│                  Backend (Pure Node.js)                │
│  - Catalog Indexer: In-memory graphs from data/catalog │
│  - Planner Engine: Combinatorial Constraint Solver     │
│  - Room Fit Math: k room capacity & night availability │
│  - Transport Buffers: 60m arrival, 180m dep validation│
│  - Attraction Scheduler: Non-overlapping opening hours │
│  - Validator & Swapper: Recomputes deltas & warnings   │
│  - NLP Parser: Deterministic regex/grammar (Zero-AI)   │
│  - Document Storage: Persistent reservations & locks   │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Features Implemented

### Must-Have Features (100% Complete)
* **M1 — Request Form**: Full input validation for departure cities (`BLR`, `DEL`, `BOM`, `MAA`), destination countries (`Japan`, `UAE`), dates (1–20 April 2027), nights (3–10), and party sizes (adults, children, ages).
* **M2 — Build One Package**: Automatically selects the optimal city plan and builds a complete package conforming to all travel rules. Provides clear bottleneck explanations if no package is possible.
* **M3 — Rules Respected**: Strictly enforces airport serving rules, transfer buffer windows, room fit capacity math, and attraction opening times.
* **M4 — Day-by-Day Plan**: Chronological visual timeline grouped by day, displaying flights, airport transfers, hotel check-ins, and attractions with times and durations.
* **M5 — Total and Budget**: Live itemized cost breakdown (Flights, Hotels, Transfers, Attractions) with budget comparison meter and 1-click **Download JSON Export** adhering to `trip_format_example.json`.
* **M6 — Change the Package**: Interactive modals allowing users to swap hotels, flights, or add/remove attractions. Revalidates the entire package and updates totals immediately.
* **M7 — Confirm and Reservation Summary**: Generates a unique **10-digit reservation number** (e.g. `9279894003`), locks inventory, and persists to disk. Retrievable across page reloads and backend restarts.
* **M8 — Budget Too Small**: When budget is insufficient, the system detects the shortfall, surfaces the cheapest valid package, and provides actionable suggestions.

### Good-to-Have Features (100% Complete)
* **G1 — Cascade Conflict Detection**: Detects and warns about schedule conflicts when flight arrival or departure times cut into transfer buffers or attractions.
* **G2 — Price Difference Display**: Swap options display real-time price delta badges (`+₹X` in red, `-₹Y` in green, or `Same Price`).
* **G3 — Change Cities**: Automatically evaluates all multi-city combinations (e.g. `Tokyo (2N) → Kyoto (4N)` vs `Tokyo (6N)`).
* **G4 — Three Packages**: Instantly presents **Cheapest** (lowest total price), **Fastest** (least flight + intercity transit time), and **Best Rated** (highest night-weighted average hotel stars within budget).

### Stretch Features (100% Complete)
* **S1 — Quick Request**: Rule-based natural language parser extracting cities, countries, dates, travelers, and budgets from plain English without calling an external AI/LLM.
* **S2 — Inventory Decrementing**: Confirmed reservations create inventory locks that decrement available seats and rooms, preventing overbooking.

---

## 🎯 Special Curation: Adult, Spiritual & Family Features

* **Spiritual / Tirth Yatra Mode**: Curates sacred pilgrimage sites in Japan (Kiyomizu-dera, Kinkaku-ji, Fushimi Inari Taisha, Meiji Jingu) and UAE (Sheikh Zayed Grand Mosque), paired with accessible senior-friendly ground transport.
* **Kids & Family Highlights**: Tags child-friendly attractions (Tokyo Disneyland, Universal Studios, Kaiyukan Aquarium, Toy Museum) and prioritizes family rooms.
* **Room Fit Explainer**: Visually illustrates the mathematical condition where party fits in a single Family Room vs. two Twin Rooms ($adults \ge k$).

---

## 📂 Project Structure

```
.
├── backend/
│   ├── server.js          # Native HTTP REST API & static file server
│   ├── catalog.js         # Catalog loader and fast in-memory indexing
│   ├── planner.js         # Combinatorial constraint solver & package builder
│   ├── validator.js       # Revalidator and swap options generator with deltas
│   ├── storage.js         # Persistent JSON document store & inventory locks
│   └── nlp.js             # Rule-based natural language parser (Zero-LLM)
├── frontend/
│   └── index.html         # Booking.com styled Single-Page Application
├── data/
│   ├── catalog/           # Read-only catalog JSON files (destinations, flights, etc.)
│   ├── reservations.json  # Persistent reservation database (survives restarts)
│   └── trip_format_example.json
├── package.json           # Root package script ("npm start")
└── README.md
```

