# Ramchandra and Sons Jewellers - Luxury Mobile Application (Kasganj)

A cross-platform mobile application and interactive mobile preview built for **Ramchandra and Sons Jewellers (Kasganj, Uttar Pradesh)** featuring a luxury jewellery brand aesthetic with ivory/cream background tones, elegant serif typography, clean cards, subtle warm gold accents, and live bullion rate streaming.

---

## 🌟 Key Features & Architecture

### 1. Rates Screen (Live Market & Bullion Ticker)
- **Header Bar**:
  - Monogram insignia (`RSJ`) & brand title: *Ramchandra and Sons Jewellers · Kasganj*.
  - Live status indicator (pulsing emerald green circle).
  - Settings shortcut icon.
- **Live Rate Cards**:
  - `Gold 999` (e.g. ₹1,50,713 with directional trend arrow & delta).
  - `Silver Bank` (e.g. ₹2,16,281 in soft green container badge).
  - `Kasganj Mohar` (e.g. ₹2,14,118 in soft green container badge).
  - `Silver Coin 10gm` (e.g. ₹2,215 with delta).
- **Bid / Ask Spread Table**:
  - Real-time columns: **Source**, **Bid**, **Ask**.
  - Tracked commodities: *Silver*, *Gold*, *Gold ($)*, *Silver ($)*, and *INR*.
  - Distinct soft red (`#FCEAE9`) and soft green (`#EAF6ED`) pill indicators.
- **Store Disclaimer**:
  - *"Indicative rates only. Confirm at store. We don’t sell bullion."*
- **Real-Time Engine**:
  - WebSocket and periodic REST polling simulation updating rates and spreads dynamically.

### 2. Gallery & Product Showcase
- **Category Hub View**:
  - Large luxury cards with curved image cutouts for **Gold**, **Silver**, **Diamond**, and **Bridal Heritage**.
  - Direct call-to-action buttons (*"Explore Gold ›"*, *"Explore Silver ›"*).
- **Product Detail Screen**:
  - High-resolution hero image carousel with multi-angle thumbnail navigation.
  - **"TAP TO ZOOM"** lightbox modal with high-res inspection and dark backdrop.
  - Breadcrumb index (*"Item 1 of 231"*) & Category label (*"NECKLACES"*).
  - Elegant serif title & descriptive narrative.
  - **Item Specifications 2-Column Grid**:
    - Reference Code / SKU (`RSJ-NK-033`)
    - Category & Gender (`Necklaces / Female`)
    - Collection & Details
    - Gold Purity (`14K`, `18K`, `22K`, `24K`, `925 Silver`)
    - Gross Weight & Net Gold Weight
    - Diamond Weight & Coloured-Stone Weight
    - Live Showroom Availability Tag
  - **Sticky Action Bar**:
    - **"Ask on WhatsApp"** button: Opens WhatsApp with pre-filled SKU, product title, purity, and weight details.
    - **Call Store** button: Direct dialer link.
  - **"YOU MAY ALSO LIKE"** horizontal recommendation carousel.

### 3. Settings & Store Info Screen
- **Brand Insignia & Heritage Header**: *“Crafted with care · Main Market, Kasganj”*.
- **VIP Customer Account Banner**: *“Sign in to Ramchandra & Sons / View your personalised rates”*.
- **Touch-Friendly Quick Actions Grid**:
  - **Call Store** (`05744-245980`)
  - **WhatsApp** (Customer support chat)
  - **Directions** (Google Maps deep-link to Main Market, Near Ghanta Ghar, Kasganj showroom)
  - **Instagram Profiles** (`@ramchandra_sons`, `@rsj_heritage`)
- **Notifications Toggle**:
  - Push alerts for new stock arrivals and rate changes.
- **Store & Legal Info**:
  - Showroom address: *Main Market, Near Ghanta Ghar, Kasganj, Uttar Pradesh 207123*.
  - Website link, rate disclaimer modal, privacy policy, and version.

### 4. Admin / CMS Portal
- Easily accessible via top bar or settings:
  - **Live Rates Adjuster**: Modify Gold 999, Silver Bank, Kasganj Mohar, Silver Coin, and spread margins with instant app-wide broadcast.
  - **Jewellery Publishing**: Add new jewellery designs, multiple image URLs, purity levels, weights, and descriptions without redeploying.

---

## 🧮 Hybrid Rate Calculation Engine (Phase 1)

Located in [`src/engine/HybridRateCalculationEngine.ts`](file:///c:/Users/ayush/OneDrive/Desktop/gold%20and%20silver%20app/src/engine/HybridRateCalculationEngine.ts):

- **Final Gold 999**:  
  $$\text{Final Gold 999} = \text{base\_gold\_inr} + \text{gold\_999\_offset}$$
- **Final Silver Bank**:  
  $$\text{Final Silver Bank} = \text{base\_silver\_inr} + \text{silver\_bank\_offset}$$
- **Kasganj Mohar**:  
  $$\text{Kasganj Mohar} = \text{Final Gold 999} - \text{local\_mohar\_offset}$$
- **Silver Coin 10gm**:  
  $$\text{Silver Coin 10gm} = \text{Round}\left(\frac{\text{Final Silver Bank}}{100}\right) + \text{silver\_coin\_10g\_margin}$$
- **Bid / Ask Spread**:
  - Calculated around base price using configured `bid_ask_spread`.
- **Directional Trend**:
  - Compares current tick with previous cached price to determine `up`, `down`, or `unchanged` along with absolute delta.
- **Manual Overrides**:
  - Supports admin manual overrides (`is_manual_override`, `override_gold_rate`, `override_silver_rate`).

---

## 🗄️ Database Schema & Tables Setup

- **Supabase / PostgreSQL Migration**: [`supabase/migrations/20261016_initial_phase1_schema.sql`](file:///c:/Users/ayush/OneDrive/Desktop/gold%20and%20silver%20app/supabase/migrations/20261016_initial_phase1_schema.sql)
  - `market_base_rates` (ingested spot feeds: gold_usd, silver_usd, gold_inr_base, silver_inr_base, usd_inr, updated_at)
  - `rate_configurations` (offsets: gold_999_offset, silver_bank_offset, local_mohar_offset, silver_coin_10g_margin, bid_ask_spread, overrides)
  - `live_bullion_rates` (realtime publication target with triggers)
  - `live_spread_rates` (realtime spread items)
  - `jewellery_products` (catalog items with SKU, purity, gross/net weight, stone weight, images, availability)
  - Automated trigger `compute_and_sync_live_rates()` for zero-lag database computation.
- **Firebase Firestore Security Rules**: [`firebase/firestore.rules`](file:///c:/Users/ayush/OneDrive/Desktop/gold%20and%20silver%20app/firebase/firestore.rules)

---

## 🚀 Running the Project

### Immediate Mobile Web Preview (Running Now)
The app is currently running live on local port **5050**:
- URL: **`http://localhost:5050`**
- Features the iPhone 16 Pro luxury mockup frame, live WebSocket ticker, gallery, lightbox, and Admin CMS configured for **Kasganj**.

### React Native / Expo Mobile App
The complete React Native project is located in [`rsj_mobile/App.tsx`](file:///c:/Users/ayush/OneDrive/Desktop/gold%20and%20silver%20app/rsj_mobile/App.tsx).

To run on an Android or iOS device with Expo Go:
```bash
cd rsj_mobile
npm start
```
Then scan the QR code using the **Expo Go** app on your phone.
