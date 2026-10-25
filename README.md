# Planora AI — Your Celebration. Our Intelligence.

> **Production-Style GenAI Event Planning Web Application**  
> Powered by **Google Gemini 3.8 Flash SDK**, React 18, TypeScript, Tailwind CSS, Express, and Firebase architecture.

Planora AI transforms celebration planning from fragmented spreadsheets into an intelligent, contextual SaaS command center. Whether orchestrating a grand traditional Bengali wedding in Kolkata, a vibrant milestone birthday, or a community cultural festival, Planora AI solves real event-planning problems through deterministic financial precision, dynamic preparation countdowns, proactive budget rescue, and predictive what-if simulations.

---
## 🚀 Planora — AI-Powered Event Planning

<p align="center">
  <img src="screenshots/planora-preview.png" alt="Planora AI Event Planning Dashboard" width="100%">
</p>

## 🌟 Key Features

### 1. Multi-Step Event Creation Wizard
- **Step 1:** Celebration type selection (Wedding, Birthday, Community, Anniversary, Corporate, Custom).
- **Step 2:** Key parameters: date, location, guest count, duration, indoor/outdoor preferences, and budget (in Indian Rupees ₹).
- **Step 3:** Deep cultural & aesthetic preferences (regional rituals like Bengali Gaye Holud & Bor Jatri, themes, cuisines, accessibility).
- **Step 4:** Natural language dream celebration prompt with prompt chips.
- **Step 5:** Multi-phase progress indicator with instant structured plan review.

### 2. Intelligent Event Command Center
- **8 Core Real-Time Metric KPIs:**
  - Total Budget Cap
  - Estimated Spending (across 8 categories)
  - Actual Paid Disbursements
  - Remaining Safe Budget (with deficit warning)
  - Live Days Countdown
  - Completed Milestones (progress %)
  - Vendor Booking State (Booked vs Pending)
  - Overall Planning Progress %
- **Visual Analytics:** Interactive Recharts category distribution and spend comparisons.

### 3. AI Smart Budget Planner & AI Budget Rescue
- **Deterministic Math:** Category allocations, variances, cost-per-guest, and percentages are computed in application code to guarantee 100% financial accuracy.
- **Category Management:** Venue, Catering, Decoration, Photography, Entertainment, Styling, Favors, and Emergency Contingency Reserve.
- **AI Budget Rescue:** If projected spending exceeds available budget, AI detects the exact shortfall (e.g. ₹35,000) and proposes concrete trade-offs (e.g., rationalizing floral imports, optimizing appetizer counters) before you commit.
- **Itemized Disbursements:** Log payments, advances, receipt IDs, and UPI references.

### 4. Preparation Timeline & Event-Day Itinerary
- Chronological milestone timeline calculated realistically relative to your event date.
- Priority tagging (High, Medium, Low), category tags, due date reminders, and overdue warnings.
- **Event-Day Itinerary Tab:** Hour-by-hour operational breakdown from morning setup to farewell distribution.

### 5. Smart Vendor Management & AI Vetting Guide
- Full tracking: Vendor Name, Category, Contact Person, Phone, Email, Agreed Price, Payment Status, and Booking Stages (Researching, Shortlisted, Contacted, Negotiating, Booked, Completed).
- **AI Selection Criteria Guide:** Built-in cheat sheet with must-ask questions and red flags for Catering, Venue, Decor, and Photography.

### 6. Context-Aware Gemini AI Assistant
- Live chatbot connected to `@google/genai` backend.
- Context-aware of the active event's budget, spent amount, guest count, completed tasks, and booked vendors.
- Quick prompt chips for cultural cuisine suggestions, cost optimization, and timeline checks.

### 7. Signature "What-If" Event Simulator
- Experiment with guest count (20 to 1,000), total budget (₹10k to ₹25L), duration, and setting without modifying your saved plan.
- Side-by-side comparison of original vs proposed metrics, cost per guest shift, vendor impacts, and feasibility gauge (Feasible, Tight, Deficit).
- Apply or discard simulation with one click.

### 8. AI Event Risk Analyzer
- Monitors outdoor weather vulnerability, curfew adherence (e.g. Kolkata 10 PM sound norms), guest count inflation, and emergency reserve status.
- Highlights severity levels (Critical, High, Medium) with root causes, concrete mitigation steps, and deadlines.

### 9. Export Event Plan as PDF
- Generates a multi-page PDF document using `jspdf` and `jspdf-autotable`.
- Formatted tables for budgets, milestones, itineraries, vendor checklists, and risk safeguards.
- Formatted with Indian currency representations (`Rs. 5,00,000`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti, jsPDF, jspdf-autotable |
| **Backend** | Node.js, Express.js, TypeScript, `@google/genai` SDK, Zod, CORS, Dotenv |
| **AI Engine** | Google Gemini 3.8 Flash (`gemini-3.8-flash`) |
| **Database & Security** | Firebase Firestore Rules (`firestore.rules`), Firebase Hosting config (`firebase.json`), dual local persistence fallback |
| **Styling System** | Deep Indigo `#4F46E5`, Violet `#8B5CF6`, Emerald, Amber, Rose, plus dark & light mode |

---

## 🚀 Quick Start & Local Development

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Environment Configuration

The backend requires a Google Gemini API key:

In `server/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

*(A valid Google Gemini API key has been pre-configured in `server/.env`)*

### 2. Start Both Backend & Frontend

From the root directory, run:

```bash
# Start concurrently both backend (port 5000) and frontend (port 3000)
npm run dev
```

Alternatively, run them individually:

```bash
# Terminal 1: Backend Server (http://localhost:5000)
npm run dev:server

# Terminal 2: Frontend Vite Client (http://localhost:3000)
npm run dev:client
```

Open your browser at **`http://localhost:3000`**.

---

## 🧪 Testing Realistic Scenarios

Planora AI includes instant demo benchmarks accessible from the landing page, navbar, and Settings:

- **Scenario A (Bengali Wedding in Kolkata):** ₹5,00,000 budget, 200 guests, Rajbari Sholapith decor, authentic Bhetki Paturi & Kosha Mangsho banquet, Dhaki beats.
- **Scenario B (Milestone Birthday Party in Mumbai):** ₹20,000 budget, 30 guests, clubhouse venue, superhero magic show and games.
- **Scenario C (Community Cultural Festival):** Large scale festival planning with volunteer coordination, sound permits, and prasad catering.

You can also run the automated E2E API test suite:

```bash
node test-e2e.js
```

---

## 🔒 Security & Architecture Best Practices

- **Zero API Key Leakage:** The Gemini API key is strictly stored server-side in `server/.env` and accessed via the Express backend. Never exposed to the browser.
- **Deterministic Math:** Percentages, totals, and variances are computed in application code rather than relying on generative text for calculations.
- **Graceful Resilience:** If Gemini API experiences high demand (503) or network latency, the service includes a timeout wrapper with domain-expert fallbacks so the app never hangs or crashes.
- **Firestore Security Rules:** Private user collections with strict authentication matching are codified in `firestore.rules`.
