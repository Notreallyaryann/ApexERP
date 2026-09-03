# ApexERP — Mini ERP + CRM Operations Portal

> **Full-Stack Enterprise Case Study** built for Wholesale & Distribution operations. Featuring clean feature-modular architecture, Supabase Auth, PostgreSQL (Prisma ORM), Redis caching, AWS S3 product image storage, atomic stock-decrementing Sales Challans, and PDF generation.

---

## 🚀 Live Demo & Test Credentials

### Demo Accounts for All 4 Roles
| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@erp.com` | `Password123!` | Full System Access, User Roles, Master Catalog |
| **Sales** | `sales@erp.com` | `Password123!` | Customer CRM, Follow-up Notes, Create & Confirm Challans |
| **Warehouse** | `warehouse@erp.com` | `Password123!` | Stock Inventory Log, Manual IN/OUT Adjustments, Product Catalog |
| **Accounts** | `accounts@erp.com` | `Password123!` | View Invoices, Download Tax Invoices & Delivery Challan PDFs |

> 💡 *Tip: The frontend includes a **1-Click Quick Role Switcher** in the navigation bar and login screen to easily evaluate all role permission boundaries during review.*

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph TD
    Client["Frontend (React + Vite + Modern Tailwind v4)"]
    SupabaseAuth["Supabase Auth (Identity & Token Issuer)"]
    FastifyAPI["Backend (Node.js + Fastify - JavaScript ES Modules)"]
    Redis["Redis (Cache & Rate Limiting)"]
    Postgres[("PostgreSQL Database (Prisma ORM)")]
    S3["AWS S3 (Product Media Storage)"]
    PDFGen["PDF Engine (PDFKit Challans & Invoices)"]

    Client -->|Auth Login / Session| SupabaseAuth
    Client -->|Bearer JWT + REST APIs| FastifyAPI
    FastifyAPI -->|Validate Tokens & Roles| SupabaseAuth
    FastifyAPI -->|Cache Queries & Invalidation| Redis
    FastifyAPI -->|ACID Transactions & CRUD| Postgres
    FastifyAPI -->|Upload / Stream Media| S3
    FastifyAPI -->|Stream Invoices / Challans| PDFGen
```

### Technology Highlights:
- **Backend**: **Node.js (Modern JavaScript ES Modules)** + **Fastify** (Feature-modular architecture, zero compilation overhead, JSON schema validation, Swagger UI).
- **Authentication**: **Supabase Auth** + server-side JWT verification & local role synchronization (`ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`) with Fastify preHandler role guards.
- **Database & ORM**: **PostgreSQL** with **Prisma ORM** for ACID transactions, relational models, and comprehensive database seeding.
- **Caching**: **Redis** (`ioredis`) for high-speed dashboard KPI caching with automatic cache invalidation on inventory mutations.
- **File Storage**: **AWS S3** integration (`@aws-sdk/client-s3`) with fallback local image storage.
- **PDF Engine**: **PDFKit** for generating branded Delivery Challans and GST Tax Invoices.
- **Frontend**: **React (Vite + Modern TailwindCSS v4 + JSX)** with Lucide icons, responsive dark operations theme, dynamic search/filters, and role-based route guards.

---

## 📂 Feature-Wise Folder Structure

```
ApexERP/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (User, Customer, Note, Product, Movement, Challan)
│   │   └── seed.js                    # Comprehensive seed script for 4 roles, inventory & CRM leads
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # Environment configuration
│   │   │   ├── prisma.js              # Prisma Client singleton
│   │   │   ├── redis.js               # Redis client & memory fallback wrapper
│   │   │   ├── supabase.js            # Supabase JS Client
│   │   │   └── s3.js                  # AWS S3 uploader
│   │   ├── plugins/
│   │   │   ├── auth.plugin.js         # Supabase & JWT Bearer token authentication
│   │   │   ├── role.plugin.js         # Role-based authorization guard
│   │   │   └── errorHandler.js        # Global error & Prisma exception filter
│   │   ├── modules/
│   │   │   ├── auth/                  # Login, Supabase Sync, User Role Assignment
│   │   │   ├── customers/             # Customer CRM, Filters, Follow-up Timeline
│   │   │   ├── products/              # Product Catalog, Low Stock Alerts, S3 Images
│   │   │   ├── inventory/             # Stock Movement Audit Log, Manual IN/OUT Adjustments
│   │   │   ├── challans/              # Sales Challans, Atomic Stock Deduction Transaction
│   │   │   ├── invoices/              # Tax Invoices & Delivery Challan PDF Streaming
│   │   │   ├── dashboard/             # Aggregated Operations KPIs (Redis Cached)
│   │   │   └── upload/                # Multipart S3 Upload endpoint
│   │   ├── utils/
│   │   │   ├── apiResponse.js         # Uniform JSON responses
│   │   │   ├── challanNumber.js       # Sequential Challan ID generator (CH-YYYYMM-XXXX)
│   │   │   └── pdfGenerator.js        # PDFKit document generator
│   │   ├── app.js                     # Fastify application setup & plugins
│   │   └── server.js                  # Server entrypoint
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/                       # Axios client & feature endpoints
│   │   ├── components/                # Layout, Sidebar, Navbar, StatCards, Modals, Badges
│   │   ├── context/                   # AuthContext (Supabase + local session + Role Switcher)
│   │   ├── pages/                     # Dashboard, Customers, Products, Inventory, Challans, Invoices
│   │   ├── App.jsx                    # React Router with role guards
│   │   ├── index.css                  # Modern Tailwind v4 styling
│   │   └── main.jsx
│   ├── .env.example
│   ├── vite.config.js                 # @tailwindcss/vite integration
│   ├── Dockerfile
│   └── package.json
│
├── postman-collection/
│   └── Mini_ERP_CRM_Postman_Collection.json   # Ready-to-import Postman collection (v2.1)
├── docker-compose.yml
└── README.md
```

---

## 🔑 Core Modules & Business Logic

### 1. Sales Challan Atomic Inventory Reduction
When a Sales Challan is confirmed:
1. Executes within a **Prisma ACID Database Transaction** (`$transaction`).
2. Checks current stock for all line items against available inventory.
3. If ANY product lacks stock, aborts transaction immediately and returns HTTP 400 (`INSUFFICIENT_STOCK`).
4. Reduces `product.currentStock` atomically for each item.
5. Writes an immutable `StockMovement` audit record (`movementType: OUT`, `reason: "Sales Challan <number> confirmation"`).
6. Stores **immutable product snapshot line items** (`productName`, `productSku`, `unitPrice`, `quantity`, `totalPrice`) inside `challan_items`.
7. Auto-invalidates the Redis dashboard metrics cache.

### 2. Customer CRM & Follow-Up Timeline
- Categorize clients as **Distributor, Wholesale, Retail**.
- Manage CRM lifecycle statuses: **Lead, Active, Inactive**.
- Follow-up timeline records discussion notes, scheduled dates, and lead conversions.

### 3. Product & Inventory Management
- Low stock visual indicators when `currentStock <= minStockAlert`.
- Manual Stock Adjustments (`IN` / `OUT`) with mandatory reasons for audits.
- S3 image upload with preview and fallback support.

### 4. PDF Invoice & Delivery Challan Generation
- Direct streaming from backend with PDFKit.
- Includes company header, customer details, itemized table, 18% GST calculation, terms, and signature boxes.

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or managed e.g., Supabase, Neon)
- Redis (Optional; automatically degrades to in-memory cache if not running)

### 1. Clone & Configure Environment Variables
```bash
# Backend configuration
cd server
cp .env.example .env

# Frontend configuration
cd ../client
cp .env.example .env
```

#### Backend `.env` Parameters:
```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_erp_crm?schema=public"

# Supabase Auth
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# JWT Secret
JWT_SECRET="mini-erp-crm-super-secret-jwt-key-2026"

# Redis
REDIS_URL="redis://localhost:6379"

# AWS S3 (Optional - uses mock/base64 fallback if omitted)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### 2. Database Migration & Seeding
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 3. Start Backend Server
```bash
cd server
npm run dev
# Server running at: http://localhost:5000
# Swagger API Docs at: http://localhost:5000/docs
```

### 4. Start Frontend Application
```bash
cd client
npm install
npm run dev
# Frontend portal running at: http://localhost:5173
```

---

## 🐳 Docker Deployment (1-Click Launch)

Run the entire stack (PostgreSQL, Redis, Fastify Backend, React Frontend) in containers:
```bash
docker-compose up --build
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **Swagger Docs**: `http://localhost:5000/docs`

---

## 📬 Postman Collection

Import `postman-collection/Mini_ERP_CRM_Postman_Collection.json` directly into Postman.
- Configured with `{{baseUrl}}` and automated JWT `{{authToken}}` token extraction on login.
- Covers all endpoints across Auth, Customers, Products, Inventory, Challans, and Invoices.

---

## ☁️ Production Cloud Deployment Guide

| Component | Recommended Free / Low-Cost Platforms | Instructions |
| :--- | :--- | :--- |
| **Frontend** | Vercel / Netlify / Cloudflare Pages | Connect GitHub repo, set root directory to `client`, build command `npm run build`, output `dist`. Add `VITE_API_BASE_URL`. |
| **Backend** | Render / Railway / Fly.io | Set root directory to `server`, start command `node src/server.js`. Add environment variables from `.env.example`. |
| **Database** | Supabase / Neon / Render Postgres | Create PostgreSQL database, copy connection URI to `DATABASE_URL` in backend env. |
| **Redis** | Upstash Redis | Create free Redis database, copy connection URI to `REDIS_URL`. |
| **Storage** | AWS S3 / Supabase Storage | Create S3 bucket, configure IAM credentials and bucket name. |
