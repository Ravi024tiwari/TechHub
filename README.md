# ⚡ TechHub — Enterprise Hardware & Electronics E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment%20Gateway-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)

**TechHub** is a production-grade, high-performance full-stack e-commerce web platform engineered for hardware, consumer electronics, and computing components. Built with a dual-architectural design system (Cyber Dark `#08090a` & Clean Bright `#f8fafc`), concurrency-safe stock reservation, customer-isolated state management, and an enterprise administrative pipeline.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features](#-key-features)
  - [Storefront & Customer Experience](#1-storefront--customer-experience)
  - [Cart & Concurrency-Safe Checkout](#2-cart--concurrency-safe-checkout)
  - [Order Confirmation & Receipts](#3-order-confirmation--receipts)
  - [Administrative Command Center](#4-administrative-command-center)
- [Git Branch Strategy & Architecture](#-git-branch-strategy--architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start & Local Setup](#-quick-start--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables (.env)](#-environment-variables-env)
- [Payment Gateway Testing (Razorpay & COD)](#-payment-gateway-testing-razorpay--cod)
- [API Architecture & Endpoints](#-api-architecture--endpoints)
- [Contribution & Pull Request Guidelines](#-contribution--pull-request-guidelines)
- [License](#-license)

---

## 🏛️ Architectural Overview

```
                                  [TechHub Architecture]
                                             │
      ┌──────────────────────────────────────┴──────────────────────────────────────┐
      ▼                                                                             ▼
[Frontend Portal (Vite + React 19)]                           [Backend API (Node.js + Express 5)]
  ├── TailwindCSS v4 Custom Tokens                              ├── JWT Dual-Token (Access/Refresh)
  ├── Zustand Stores (Auth, Cart, Wishlist)                     ├── ACID Transactions (MongoDB Atlas)
  ├── TanStack React Query Persist                              ├── Two-Phase Stock Reservation
  ├── Responsive Cyber/Bright Theme                             ├── HMAC-SHA256 Webhook & Gateway
  └── Print & PDF Invoice Engine                                └── Cloudinary Media Pipeline
```

---

## ✨ Key Features

### 1. Storefront & Customer Experience
* **Dynamic Catalog & Filtering**: Multi-facet filtering by category, brand, price slider, in-stock status, and customer ratings with zero UI stutter.
* **Product Details & Technical Specs**: High-definition image carousel with zoom, technical spec badges (RAM, Storage, Color), active deals, and verified reviews.
* **Customer-Isolated Wishlist**: Strictly partitioned by customer ID (`shop_wishlist_${userId}`). Zero cross-user data leakage with instant `0ms` optimistic heart toggles synced to MongoDB Atlas.
* **Flash Deals & Countdown Timers**: Live countdown vouchers and enrolled deal badges with stock quota progress bars.
* **Hardware Spec Comparison**: Side-by-side technical matrix comparing specifications of up to 4 hardware products (`/compare`).

### 2. Cart & Concurrency-Safe Checkout
* **10-Minute Two-Phase Stock Reservation**: Prevents inventory overselling during sales. Reserving an item atomically locks it in `reservedStock` with an auto-expiring timer.
* **Voucher & Coupon Engine**: Multi-tier discounts with minimum spend validation, expiry verification, and real-time coupon codes preview.
* **Dual Settlement Options**:
  * **Cash on Delivery (COD)**: Instant zero-advance order placement.
  * **Razorpay Instant Online Pay**: Card, UPI (`success@razorpay`), NetBanking with HMAC-SHA256 signature verification.

### 3. Order Confirmation & Receipts
* **Personalized Greeting**: Welcomes the customer by name (`"Thank You, Rohit! 🎉"`), sets clear fulfillment expectations, and confirms email dispatch.
* **Real-time 4-Column Bento Metrics**: Order Reference (1-click copy), dynamic 3–5 day delivery window, payment method/status, and itemized total.
* **4-Step Fulfillment Stepper**: Live visual milestone pipeline (`Placed` ➔ `Packaging & Testing` ➔ `Dispatched` ➔ `Delivered`).
* **Instant Receipts**: 1-click **Download Tax Invoice (PDF)** and `@media print` optimized paper receipt printing.

### 4. Administrative Command Center
* **Live Telemetry & Analytics**: Visual revenue charts, order volume tracking, and customer lifetime value stats.
* **Product Catalog CMS**: Create, update, toggle active states, manage multi-color stock variants, and upload images directly to Cloudinary.
* **Order Pipeline Management**: Bulk and individual order status updates (`PLACED` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` ➔ `CANCELLED`) with tracking number assignment.
* **Inventory & Restock Alerts**: Low-stock warnings and quick-stock adjustment modals.
* **Return & Refund Operations**: Approve or reject return requests, trigger programmatic refunds, and restock inventory atomically.
* **Taxonomy & Coupons**: Manage brands, categories, and promotional voucher campaigns.

---

## 🌿 Git Branch Strategy & Architecture

This repository follows a domain-driven branch architecture to keep features modular and enable parallel contributions:

| Branch Name | Primary Purpose / Focus Area |
| :--- | :--- |
| **`main`** | **Production Branch** — Authoritative, tested, and deployable code. |
| **`controller`** | Backend API business logic, controllers (`order`, `cart`, `wishlist`, `product`, `auth`). |
| **`model`** | Mongoose database schemas, compound indexing, and ACID transaction definitions. |
| **`middleware`** | Authentication guards (`verifyJWT`), role verification, rate limiting, and Multer upload configurations. |
| **`frontend`** | Unified storefront layout, routing, global theme providers, and UI primitives. |
| **`customer/frontend`** | Customer portal, order tracking, address book, wishlist, and customer coupon screens. |
| **`admin/frontend`** | Admin command center, inventory control, order pipelines, CMS, and customer management. |

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 19, Vite 6, React Router DOM 7
* **Styling**: TailwindCSS v4, Vanilla CSS Design Tokens, `@fontsource-variable/inter`
* **Icons & UI**: Lucide React, Base UI, Radix UI Dropdown
* **State Management**: Zustand 5 with user-scoped persistence
* **Data Fetching**: TanStack React Query v5 with offline persist client
* **Payments**: Razorpay Standard Checkout SDK

### Backend
* **Runtime**: Node.js v20+, Express.js 5
* **Database**: MongoDB Atlas via Mongoose 9
* **Authentication**: JSON Web Tokens (Access Token + HttpOnly Refresh Token), BCrypt.js
* **Security & Utility**: Helmet, CORS, Express Rate Limit, Morgan, PDFKit, Slugify, Zod
* **Media Storage**: Cloudinary v2 SDK

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) `>= 20.0.0`
* [Git](https://git-scm.com/) installed
* Active [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URL or local MongoDB
* Free [Razorpay](https://razorpay.com/) test account (optional for online payments)
* Free [Cloudinary](https://cloudinary.com/) account (for product image uploads)

### 1. Clone Repository
```bash
git clone https://github.com/Ravi024tiwari/TechHub.git
cd TechHub
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start development server with live reload
npm run dev
```
*Backend will boot at: `http://localhost:5000`*

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend will boot at: `http://localhost:5173`*

---

## 🔐 Environment Variables (.env)

Configure your `backend/.env` file with the following keys:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/TechHaven?retryWrites=true&w=majority

# JWT Authentication
JWT_ACCESS_SECRET=your_super_secure_access_token_secret_2026_dev
JWT_ACCESS_EXPIRES_IN=2h
JWT_REFRESH_SECRET=your_super_secure_refresh_token_secret_2026_dev
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Payment Gateway - Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

---

## 💳 Payment Gateway Testing (Razorpay & COD)

TechHub supports both **Cash on Delivery** and **Razorpay Instant Pay**:

### Test Mode Credentials (Zero Real Money Required)
1. Add any product to the cart and proceed to checkout.
2. Select **Instant Online Payment** and click **"Proceed to Payment Gateway"**.
3. Use the following test credentials in the Razorpay popup:

| Payment Option | Test Input | Action to Complete |
| :--- | :--- | :--- |
| **Card** | Number: `4111 1111 1111 1111`<br>Expiry: Any future date (`12/28`)<br>CVV: `123` | Click **Pay Now** ➔ On bank screen, click green **"Success"** button (or OTP `123456`). |
| **UPI** | Virtual ID: `success@razorpay` | Instantly approves test transaction. |
| **NetBanking** | Select any bank (SBI, HDFC, ICICI) | Click **"Success"** on mock banking page. |

---

## 📡 API Architecture & Endpoints

All API endpoints are versioned under `/api/v1`:

### Authentication & Users (`/api/v1/auth`, `/api/v1/users`)
* `POST /auth/register` — Register a new customer
* `POST /auth/login` — Customer/admin authentication & cookie dispatch
* `POST /auth/logout` — Invalidate refresh token & clear cookies
* `GET /users/profile` — Get authenticated user details & addresses
* `POST /users/address` — Add new shipping address

### Products & Taxonomy (`/api/v1/products`, `/api/v1/categories`, `/api/v1/brands`)
* `GET /products` — Paginated product catalog with filtering & search
* `GET /products/:slug` — Single product details with specs & reviews
* `GET /products/deals` — Active flash deals and limited-time discounts

### Cart & Two-Phase Checkout (`/api/v1/cart`, `/api/v1/orders/checkout`)
* `GET /cart` — Fetch customer cart with server-calculated totals
* `POST /cart/sync` — Synchronize local cart items with server
* `POST /orders/checkout/cod` — Place Cash on Delivery order
* `POST /orders/checkout/razorpay` — Initialize Razorpay order & 10-min stock hold
* `POST /orders/checkout/verify-payment` — Cryptographically verify payment & create order
* `POST /orders/checkout/cancel-reservation` — Release stock reservation hold

### Wishlist (`/api/v1/wishlist`)
* `GET /wishlist` — Fetch customer-isolated wishlist items
* `POST /wishlist/toggle/:productId` — Toggle product in/out of wishlist
* `DELETE /wishlist/clear` — Clear customer's wishlist

### Administrative Operations (`/api/v1/orders/admin`, `/api/v1/admin`)
* `GET /orders/admin/all` — Pipeline management with query filters
* `PATCH /orders/admin/:orderId/status` — Advance order lifecycle status
* `GET /admin/dashboard/stats` — Revenue metrics, order velocity & sales analytics

---

## 🤝 Contribution & Pull Request Guidelines

We follow a disciplined feature-branching model:

1. **Pick the Right Target Branch**:
   * Working on backend endpoints? Branch from and target **`controller`**.
   * Working on Mongoose schemas? Branch from and target **`model`**.
   * Working on customer portal screens? Branch from and target **`customer/frontend`**.
   * Working on admin dashboards? Branch from and target **`admin/frontend`**.
2. **Create Your Feature Branch**:
   ```bash
   git checkout <target-branch>
   git pull origin <target-branch>
   git checkout -b feature/your-feature-name
   ```
3. **Commit Cleanly**:
   ```bash
   git commit -m "feat(wishlist): isolate customer storage and add optimistic updates"
   ```
4. **Validate Production Build**:
   Ensure both backend and frontend compile with zero errors:
   ```bash
   # In frontend/
   npm run build
   ```
5. **Push and Open PR**:
   Push to your remote branch and open a Pull Request into the corresponding feature branch or `main`.

---

## 📄 License

This project is licensed under the **ISC License**. Created for high-performance hardware e-commerce deployments.
