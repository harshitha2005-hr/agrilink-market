# AgriLink: Strengthening Market Linkages & Price Discovery for Farmers

A full-fledged, real-time web application connecting agricultural producers directly with wholesale stores, food businesses, and retail merchants across India.

---

## 🚀 How to Run the App (1-Click)

### Option 1: Double-click the Launcher
Simply double-click:
```
Run-AgriLink.bat
```
This automatically starts the backend server and opens `http://localhost:5000` in your default browser!

### Option 2: Command Line
From the project folder:
```bash
# Start fullstack server (serves frontend + backend)
npm start
```
Then open `http://localhost:5000` in your browser.

---

## 🌟 Key Features

### 1. Dual-Role Authentication with Phone Persistence
- Single unified landing page with **Continue as Farmer** and **Continue as Buyer**.
- Identification by **Phone Number** and **Name**.
- **Data Persistence**: Entering the same phone number immediately restores all listings, sold history, orders, and revenue without resetting to zero.
- Quick 1-click demo accounts included:
  - **Farmer**: Ramesh Patel (`9876543210`)
  - **Buyer**: Priya Sharma (`9123456780`)

### 2. Pan-India Regional Language Support & Voice Assist
- Complete native translation across 8 languages:
  - **English**
  - **Kannada (ಕನ್ನಡ)**
  - **Telugu (తెలుగు)**
  - **Tamil (தமிழ்)**
  - **Hindi (हिन्दी)**
  - **Malayalam (മലയാളം)**
  - **Bengali (বাংলা)**
  - **Assamese (অসমীয়া)**
- Built-in **Text-to-Speech Voice Assistance** reads out Mandi rates, AI quality grades, and notifications aloud.

### 3. AI Crop Visual Quality Inspection
- Evaluates harvest photos in real-time.
- Outputs:
  - AI Commercial Grade (`Grade A+`, `Grade A`, `Grade B`, `Grade C`)
  - Freshness Index (%)
  - Defect / Blemish Rate (%)
  - Fair Market Mandi Benchmark Price Range
  - Official Inspection Certificate (`AGRI-AI-QC-XXXXXX`)

### 4. Best Marketplace (AI Nearby Buyer Matchmaking)
- Automatically displays all available crops for the farmer.
- Clicking any crop discovers nearby registered stores looking for that harvest.
- **⭐ Highlighted AI Best Recommendation**: Prominently highlights the buyer offering the highest profit and nearest delivery distance.
- Direct **"Sell to Store"** button for instant deal execution.

### 5. Live Multi-Party Negotiation
- Buyer quotes their desired **Quantity** and **Offer Price per kg**.
- Farmer receives instant live notification with 3 actionable buttons:
  - **"Sell / Accept"**
  - **"Reject"**
  - **"Keep on Wait"**
- When the farmer accepts, the buyer unlocks the **"Buy Now"** button.
- On purchase confirmation, stock is updated, celebration confetti triggers, and the farmer is notified to proceed with packaging and transport!

### 6. Packaging & Transport Tracking
- 4-stage tracking workflow for every completed deal:
  1. *Order Confirmed & Paid*
  2. *Farmer Packaging (Bagging & Grading)*
  3. *Dispatched to Mandi / Vehicle En-Route*
  4. *Delivered to Buyer Mandi*

### 7. Real-Time APMC Mandi Benchmark Ticker
- Live price ticker across major agricultural markets (Nashik, Lasalgaon, Mandya, Agra, Guntur, Khanna, etc.).

---

## 🛠️ Tech Stack & Directory Structure

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, Server-Sent Events (SSE) for live two-way push notifications.
- **Database**: Persistent JSON storage in `server/data/store.json`.
- **PWA**: Installable as a desktop app via Web App Manifest (`manifest.json`).

```
agrilink-market/
├── Run-AgriLink.bat        # 1-click Windows launcher
├── package.json            # Scripts & server dependencies
├── server/
│   ├── server.js           # Express API & static client server
│   ├── db.js               # Persistent JSON database manager
│   ├── aiQualityEngine.js  # Computer vision quality grading engine
│   └── data/
│       └── store.json      # Saved farmers, buyers, crops & orders
├── client/
│   ├── src/
│   │   ├── App.jsx         # Main app & SSE event listener
│   │   ├── translations.js # 8 regional Indian languages
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── MandiTicker.jsx
│   │   │   ├── farmer/     # AddCrop, BestMarketplace, Available, SoldOut
│   │   │   └── buyer/      # MarketCatalog, BuyerQuotes, BuyerPurchases
│   └── dist/               # Production build served by Express
└── test/
    └── api_test.js         # Automated end-to-end test suite
```
