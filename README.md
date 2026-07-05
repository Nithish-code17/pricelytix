<div align="center">

# 🛒 Pricelytix
### AI-Powered Price Tracking Agent

**Track product prices. Analyze trends. Get smart alerts. Let AI tell you when to buy.**

<img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" />
<img src="https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=for-the-badge&logo=postgresql" />
<img src="https://img.shields.io/badge/AI-Powered-06B6D4?style=for-the-badge" />
<img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel" />
<img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=for-the-badge" />

<br/>

<img src="https://img.shields.io/badge/Status-Active-22c55e?style=flat-square" />
<img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-f43f5e?style=flat-square" />
<img src="https://img.shields.io/badge/PRs-Welcome-38bdf8?style=flat-square" />

</div>

---

### 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Product Tracking Workflow](#-product-tracking-workflow)
- [AI Assistant Workflow](#-ai-assistant-workflow)
- [Authentication Flow](#-authentication-flow)
- [Email Alert Flow](#-email-alert-flow)
- [Price Fetching Strategy](#-price-fetching-strategy)
- [Database Models](#-database-models)
- [API Routes](#-important-api-routes)
- [Prompt Engineering](#-prompt-engineering)
- [AI Fallback Mode](#-ai-fallback-mode)
- [Security Features](#-security-features)
- [Local Setup](#-local-setup)
- [Deployment](#-production-deployment)
- [Testing Checklist](#-testing-checklist)
- [Limitations](#️-limitations)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 📌 Project Overview

**Pricelytix** is an **AI-powered full-stack SaaS price tracking platform** that helps users monitor e-commerce product prices, store price history, receive notifications when prices reach their target, and get intelligent AI-based shopping recommendations.

Users can create an account, add product URLs, set target prices, refresh prices, view price history charts, receive in-app notifications, and get email alerts when the product price becomes less than or equal to the target price.

The project also includes an **AI Shopping Assistant** that can understand natural language shopping queries, extract product URLs and target prices, detect user intent, and provide buy/wait recommendations.

<div align="center">

| 🔐 Auth | 📦 Tracking | 🤖 AI | 📧 Alerts | 🌑 UI |
|:---:|:---:|:---:|:---:|:---:|
| JWT + bcrypt | Amazon & Flipkart | LLM + Fallback | Email + In-App | Dark SaaS |

</div>

---

## 🎯 Problem Statement

Online product prices change frequently across platforms like Amazon and Flipkart. A product may be expensive today and become cheaper during a sale or discount period. Users usually need to manually visit product pages again and again to check whether the price has dropped.

This creates several problems:

- Users may miss important price drops.
- Users waste time checking the same product repeatedly.
- Users do not have a simple way to track price history.
- Users may not know whether to buy now or wait.
- Users need personalized alerts when a product reaches their expected price.

**Pricelytix solves this problem by automating product price tracking, storing price history, creating alerts, sending email notifications, and providing AI-powered shopping insights.**

---

## ✨ Key Features

### 🔐 Authentication

- User signup
- User login
- Secure logout
- Password hashing using bcryptjs
- JWT-based session handling
- HTTP-only cookie authentication
- Protected dashboard and private routes

### 👤 User Data Isolation

Each user has their own tracked products.

- User A cannot view User B's products.
- User A cannot edit User B's target price.
- User A cannot delete User B's tracker.
- User A cannot dismiss User B's notifications.

This makes Pricelytix a true multi-user SaaS application.

### 📦 Product Tracking

- Add product URL
- Set target price
- Detect store automatically
- Track product current price
- Preserve old price if scraping fails
- User-specific tracker creation
- Safe handling for unsupported or blocked stores

### 📊 Price History

- Stores historical price records
- Shows price trend chart
- Displays lowest recorded price
- Displays highest recorded price
- Shows last checked time
- Helps users understand price movement

### 🔔 In-App Notifications

A notification is created when:

```txt
currentPrice <= targetPrice
```

Features:

- Unread notification count
- Product-level alert banners
- Dismiss / mark notification as read
- Duplicate notification prevention
- Alert message when target price is reached

### 📧 Email Alerts

- Sends email when target price is reached
- Uses Nodemailer with SMTP
- Sends alert to tracker owner's email
- Uses fallback email if needed
- Handles SMTP failures safely
- Prevents duplicate email alerts
- Does not break price refresh if email fails

### 🤖 AI Shopping Assistant

The AI Assistant can understand natural language requests such as:

```
Track this laptop if it drops below 55000:
https://www.flipkart.com/example-product
```

It extracts:

- Intent
- Product URL
- Target price
- Summary
- Recommendation
- Next action

Example AI output:

```json
{
  "intent": "TRACK_PRODUCT",
  "productUrl": "https://www.flipkart.com/example-product",
  "targetPrice": 55000,
  "summary": "The user wants to track this product until it drops below ₹55,000.",
  "recommendation": "Track this product and wait for a price drop.",
  "nextAction": "Add this product to your tracker."
}
```

### 🧠 AI Price Insights

Pricelytix provides AI-style recommendations such as:

- BUY NOW
- WAIT
- WATCH CLOSELY
- WAIT AND REFRESH LATER

These insights are shown on:

- Dashboard (portfolio-level insight)
- Product details page (product-level insight)
- AI Assistant page

The app supports a real OpenAI-compatible API mode and also includes a fallback rule-based AI mode for demo reliability.

### ⏱ Scheduled Refresh

- Refresh one product manually
- Refresh all products manually
- Local scheduled refresh script
- Vercel Cron support
- Secure cron endpoint using `CRON_SECRET`
- Preserves last known price when scraping fails

### 🌑 Enterprise Dark SaaS UI

- Premium black and charcoal dashboard
- Sidebar navigation
- Responsive, compact product list cards
- Dark input fields and form controls
- Professional login/signup pages
- Modern SaaS-style dashboard layout
- Clean typography using the Inter font

---

## 🧩 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Local Database | SQLite |
| Production Database | PostgreSQL |
| Production DB Provider | Neon |
| Authentication | bcryptjs, JWT, HTTP-only cookies |
| Email | Nodemailer, Gmail SMTP |
| AI Layer | OpenAI-compatible API + fallback AI |
| Web Scraping | Cheerio, Playwright |
| Charts | Recharts |
| Deployment | Vercel |
| Version Control | GitHub |

---

## 🏗 System Architecture

```mermaid
flowchart LR
    U["👤 User"] --> FE["🖥️ Next.js Frontend<br/>React + Tailwind"]
    FE --> API["⚙️ Next.js API Routes"]

    subgraph Core["Application Core"]
        API --> BL["🧩 Business Logic Layer"]
        BL --> ORM["🗂️ Prisma ORM"]
        ORM --> DB[("💾 Database<br/>SQLite / PostgreSQL")]
    end

    subgraph Scraping["Price Fetching"]
        API --> PF["🔍 Price Fetcher"]
        PF --> STORE["🛍️ Amazon / Flipkart"]
    end

    subgraph AI["AI Layer"]
        API --> AIE["🤖 AI Assistant Engine"]
        AIE --> LLM["🧠 LLM API"]
        AIE --> FALL["📏 Rule-Based Fallback"]
    end

    subgraph Notify["Notification Layer"]
        API --> NE["🔔 Notification Engine"]
        NE --> MAIL["📧 Nodemailer SMTP"]
        MAIL --> INBOX["📥 User Email Inbox"]
    end

    style U fill:#0f172a,stroke:#38bdf8,color:#fff
    style FE fill:#1e293b,stroke:#38bdf8,color:#fff
    style API fill:#1e293b,stroke:#38bdf8,color:#fff
    style DB fill:#0f172a,stroke:#22d3ee,color:#fff
    style INBOX fill:#0f172a,stroke:#22d3ee,color:#fff
```

---

## 🔁 Product Tracking Workflow

```mermaid
flowchart TD
    A(["🔑 User Logs In"]) --> B["🔗 Add Product URL"]
    B --> C["🎯 Enter Target Price"]
    C --> D{"🏬 Detect Store"}
    D -->|Amazon| E["💰 Fetch Current Price"]
    D -->|Flipkart| E
    E --> F["💾 Save Product"]
    F --> G["📌 Create Tracker"]
    G --> H["📊 Show in Dashboard"]
    H --> I["🔄 Refresh Price"]
    I --> J["📈 Save Price History"]
    J --> K{"Current Price ≤ Target Price?"}
    K -- ✅ Yes --> L["🔔 Create Notification"]
    L --> M["📧 Send Email Alert"]
    K -- ❌ No --> N["👀 Continue Monitoring"]
    N -.->|next scheduled run| I

    classDef start fill:#0f172a,stroke:#22c55e,color:#fff
    classDef action fill:#1e293b,stroke:#38bdf8,color:#fff
    classDef decision fill:#1e293b,stroke:#facc15,color:#fff
    classDef alert fill:#0f172a,stroke:#f43f5e,color:#fff
    class A start
    class B,C,E,F,G,H,I,J,N action
    class D,K decision
    class L,M alert
```

---

## 🤖 AI Assistant Workflow

```mermaid
flowchart TD
    A(["💬 User Sends Message"]) --> B["📝 Parse Natural Language Input"]
    B --> C{"🔑 AI API Key Configured?"}
    C -- Yes --> D["🧠 Call LLM API"]
    C -- No --> E["📏 Rule-Based Fallback Engine"]
    D --> F["📦 Structured JSON Response"]
    E --> F
    F --> G{"🎯 Detected Intent"}
    G -->|TRACK_PRODUCT| H["➕ Extract URL + Target Price"]
    G -->|PRICE_ADVICE| I["📊 Generate Buy / Wait Recommendation"]
    G -->|GENERAL_HELP| J["💡 Return Guidance Message"]
    H --> K["✅ Suggest: Add to Tracker"]
    I --> K
    J --> K

    classDef start fill:#0f172a,stroke:#22c55e,color:#fff
    classDef action fill:#1e293b,stroke:#38bdf8,color:#fff
    classDef decision fill:#1e293b,stroke:#facc15,color:#fff
    classDef result fill:#0f172a,stroke:#a855f7,color:#fff
    class A start
    class B,D,E,F,H,I,J action
    class C,G decision
    class K result
```

---

## 🔐 Authentication Flow

```mermaid
flowchart TD
    A(["🧾 User Submits Login Form"]) --> B["⚙️ /api/auth/login"]
    B --> C{"✅ Credentials Valid?"}
    C -- No --> D["❌ Return 401 Unauthorized"]
    C -- Yes --> E["🔒 Compare Password (bcryptjs)"]
    E --> F["🪪 Generate JWT"]
    F --> G["🍪 Set HTTP-only Cookie"]
    G --> H["📊 Redirect to Dashboard"]
    H --> I["🛡️ Middleware Verifies Cookie on Every Request"]
    I --> J{"Valid Session?"}
    J -- Yes --> K["✅ Allow Access to Protected Route"]
    J -- No --> L["🔁 Redirect to Login"]

    classDef start fill:#0f172a,stroke:#22c55e,color:#fff
    classDef action fill:#1e293b,stroke:#38bdf8,color:#fff
    classDef decision fill:#1e293b,stroke:#facc15,color:#fff
    classDef fail fill:#0f172a,stroke:#f43f5e,color:#fff
    class A start
    class B,E,F,G,H,I,K action
    class C,J decision
    class D,L fail
```

---

## 📧 Email Alert Flow

```mermaid
flowchart TD
    A(["🔄 Price Refresh Job Runs"]) --> B{"Current Price ≤ Target Price?"}
    B -- No --> C["👀 Continue Monitoring"]
    B -- Yes --> D["🔔 Create In-App Notification"]
    D --> E{"📬 Duplicate Alert Already Sent?"}
    E -- Yes --> C
    E -- No --> F["✉️ Build Email via Nodemailer"]
    F --> G{"🔐 SMTP Connection OK?"}
    G -- No --> H["⚠️ Log Failure Safely<br/>(Price Refresh Continues)"]
    G -- Yes --> I["📤 Send Email to Tracker Owner"]
    I --> J["📥 User Email Inbox"]

    classDef start fill:#0f172a,stroke:#22c55e,color:#fff
    classDef action fill:#1e293b,stroke:#38bdf8,color:#fff
    classDef decision fill:#1e293b,stroke:#facc15,color:#fff
    classDef fail fill:#0f172a,stroke:#f43f5e,color:#fff
    classDef success fill:#0f172a,stroke:#22d3ee,color:#fff
    class A start
    class C,D,F,I action
    class B,E,G decision
    class H fail
    class J success
```

---

## 🛒 Price Fetching Strategy

**Amazon** — Price extraction uses Cheerio, which parses static HTML and extracts price from known selectors.

**Flipkart** — Uses Playwright because Flipkart pages are more dynamic. Flipkart also has strong anti-bot protection, so Pricelytix follows a safety-first approach:

- If a reliable price is found → save it
- If the price is blocked or unreliable → return null
- If null is returned → keep the last known price

This prevents wrong prices from triggering false alerts.

---

## 🗄 Database Models

Pricelytix uses five main database models.

**User** — Stores user account details.
- id, email, name, passwordHash, createdAt

**Product** — Stores product information.
- id, title, url, store, currentPrice, imageUrl, createdAt

**Tracker** — Connects a user to a product with a target price.
- id, userId, productId, targetPrice, isActive, createdAt

**PriceHistory** — Stores historical price values.
- id, productId, price, createdAt

**Notification** — Stores target price alerts.
- id, trackerId, productId, message, type, isRead, createdAt

### 🧾 Database Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ TRACKER : owns
    PRODUCT ||--o{ TRACKER : "is tracked by"
    PRODUCT ||--o{ PRICEHISTORY : has
    TRACKER ||--o{ NOTIFICATION : triggers
    PRODUCT ||--o{ NOTIFICATION : "relates to"

    USER {
        string id
        string email
        string name
        string passwordHash
        datetime createdAt
    }
    PRODUCT {
        string id
        string title
        string url
        string store
        float currentPrice
        string imageUrl
        datetime createdAt
    }
    TRACKER {
        string id
        string userId
        string productId
        float targetPrice
        boolean isActive
        datetime createdAt
    }
    PRICEHISTORY {
        string id
        string productId
        float price
        datetime createdAt
    }
    NOTIFICATION {
        string id
        string trackerId
        string productId
        string message
        string type
        boolean isRead
        datetime createdAt
    }
```

---

## 📡 Important API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/products` | Add product tracker |
| PATCH | `/api/products/[id]/refresh` | Refresh one product |
| DELETE | `/api/products/[id]` | Delete product |
| PATCH | `/api/trackers/[id]` | Edit target price |
| POST | `/api/refresh-all` | Refresh all products |
| PATCH | `/api/notifications/[id]/read` | Mark notification as read |
| POST | `/api/ai/assistant` | AI assistant response |

---

## 🧠 Prompt Engineering

The AI assistant uses structured prompt engineering to produce predictable output. Instead of allowing the AI to return free-form text, the system asks it to return a strict JSON structure.

Prompt style:

```
You are an AI shopping assistant for Pricelytix.
Analyze the user's shopping request.
Extract the intent, product URL, target price, summary, recommendation, and next action.
Return only valid JSON.
```

Expected response format:

```json
{
  "intent": "TRACK_PRODUCT",
  "productUrl": "https://www.amazon.in/example",
  "targetPrice": 50000,
  "summary": "The user wants to track this product until it drops below ₹50,000.",
  "recommendation": "Track this product and wait for the price drop.",
  "nextAction": "Add this product to the tracker."
}
```

This improves accuracy, consistency, predictability, frontend rendering, and overall user experience.

---

## 🧠 AI Fallback Mode

If no AI API key is configured, the system still works using fallback AI.

Fallback AI uses:

- URL regex detection
- Target price number extraction
- Intent keyword matching
- Rule-based recommendation generation

Supported intents:

- `TRACK_PRODUCT`
- `PRICE_ADVICE`
- `GENERAL_HELP`

This ensures the AI assistant works even without paid API access.

---

## 🛡 Security Features

- Passwords are hashed using bcryptjs
- JWT is stored in an HTTP-only cookie
- Protected routes using middleware
- User data isolation using `userId`
- API routes verify ownership before updates
- Secrets stored in `.env` and Vercel environment variables
- SMTP password and JWT secret are never exposed to the client
- AI API key is used only on the server side

---

## 📦 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Nithish-code17/pricelytix.git
cd pricelytix
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"

JWT_SECRET="your-local-secret-key"

SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
ALERT_EMAIL="your-alert-email@gmail.com"

AI_API_KEY=""
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL=""

CRON_SECRET="your-cron-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Useful Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build project |
| `npm run start` | Start production server |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run local migrations |
| `npm run refresh:all` | Refresh all product prices |
| `npm run test:email` | Test email alert system |
| `npm run test:flipkart` | Test Flipkart price fetching |

---

## 🚀 Production Deployment

The project is deployed using GitHub, Vercel, and Neon PostgreSQL.

### Production Environment Variables

Add these variables in Vercel:

```env
DATABASE_URL=""
JWT_SECRET=""
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
ALERT_EMAIL=""
CRON_SECRET=""
AI_API_KEY=""
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL=""
NEXT_PUBLIC_APP_URL=""
```

### Production Database

Local development uses SQLite, but production uses PostgreSQL. Production database provider: **Neon PostgreSQL**.

### Deployment Steps

1. Push code to GitHub.
2. Create a Neon PostgreSQL database.
3. Copy the Neon PostgreSQL connection string.
4. Import the GitHub repo into Vercel.
5. Add environment variables in Vercel.
6. Deploy the project.
7. Create database tables using Prisma.
8. Test signup, login, dashboard, and product tracking.

### 🚀 Deployment Flow

```mermaid
flowchart LR
    A["💻 Local Development"] --> B["📦 Push to GitHub"]
    B --> C["▲ Import into Vercel"]
    C --> D["🔑 Add Environment Variables"]
    D --> E["🐘 Connect Neon PostgreSQL"]
    E --> F["🏗️ Run Prisma Migrations"]
    F --> G["🚀 Deploy Build"]
    G --> H["🌐 Live Production App"]
    H --> I["⏱️ Vercel Cron Triggers Refresh"]
    I --> J["📧 Email Alerts Sent to Users"]

    classDef step fill:#1e293b,stroke:#38bdf8,color:#fff
    classDef live fill:#0f172a,stroke:#22c55e,color:#fff
    class A,B,C,D,E,F,G step
    class H,I,J live
```

---

## ✅ Testing Checklist

Before final demo, verify:

- [ ] Signup works
- [ ] Login works
- [ ] Logout works
- [ ] Dashboard loads
- [ ] Add product works
- [ ] Product refresh works
- [ ] Refresh all works
- [ ] Edit target price works
- [ ] Delete product works
- [ ] Notification appears
- [ ] Dismiss notification works
- [ ] Email test works
- [ ] AI assistant works
- [ ] AI fallback mode works
- [ ] Product details page loads
- [ ] Price history chart renders
- [ ] Protected routes redirect when logged out

---

## ⚠️ Limitations

- Flipkart may block scraping in production
- Amazon scraping may also be blocked occasionally
- Real AI mode requires an API key
- Email requires valid SMTP credentials
- Vercel Hobby cron has scheduling limits
- No mobile app yet
- No WhatsApp alerts yet

---

## 🔮 Future Enhancements

- WhatsApp alerts
- Chrome extension
- Product comparison
- Mobile app
- Admin dashboard
- AI price prediction
- Auto-buy assistant
- Better scraping API integration
- Subscription/payment system

---
