This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Price Refresh System

Pricelytix includes a reusable, automatic scheduled price refresh system that can periodically scrape and update prices for all tracked products.

### Running a Manual Refresh

To trigger a refresh for all products manually from the command line:

```bash
npm run refresh:all
```

### Automation & Scheduling Options

You can automate this script to run periodically using scheduling tools:

#### 1. Linux/macOS Cron
Add a cron job to run the script at your desired interval. For example, to run every hour:
```bash
0 * * * * cd /path/to/project && npm run refresh:all
```

#### 2. Windows Task Scheduler
Create a Basic Task that runs a program/script:
- **Program/script**: `npm`
- **Arguments**: `run refresh:all`
- **Start in**: The absolute path of this project folder.
- **Trigger**: Run daily, hourly, or at startup.

#### 3. Vercel Cron / Cloud Schedulers
If deployed to a cloud provider like Vercel, you can configure a cron job to send a POST request to the API endpoint `/api/refresh-all` periodically.

## Email Notification System

Pricelytix supports automatic email notifications sent whenever a tracked product's price drops to or below your target price.

### Configuring SMTP Environment Variables

Add the following environment variables to your `.env` file:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
ALERT_EMAIL="recipient-email@gmail.com"
```

> **Note**: For Gmail, use an **App Password** generated from your Google Account settings (Security -> 2-Step Verification -> App Passwords). You can also use services like Mailtrap, Resend, or SendGrid.
>
> **Safe Fallback**: If any of the SMTP variables are missing, the system will log a warning and continue normal price tracking without crashing or stopping execution.

## AI-Powered Price Tracking Agent Features

Pricelytix is equipped with a comprehensive AI layer that provides natural language query processing, smart portfolio insights, and dynamic price advice.

### 1. AI Shopping Assistant (`/ai-assistant`)
Users can input natural language requests (e.g., *“Track this iPhone if it drops below 60000: <product-url>”*) to extract target tracking specifications.

### 2. AI Portfolio & Price Insights
- **Dashboard**: Features an **AI Portfolio Insight** card summarizing target met percentages and close-to-target trackers with next-step recommendations.
- **Product Details**: Displays an **AI Price Insight** card with purchase advice (BUY NOW, WATCH CLOSELY, or WAIT) and a parsing confidence rating.

### 3. AI Mode Configuration
Add the following optional variables to your `.env` file:

```env
AI_API_KEY="your-openai-api-key"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
```

> **Zero-Dependency Fallback**: If `AI_API_KEY` is not provided or the LLM call fails, the system automatically defaults to a regex/keyword-based parsing system. This ensures the shopping assistant works reliably during local developer presentations and offline testing.

## Vercel Production Deployment Guide

This project is configured to run on **SQLite** for local development and **PostgreSQL** (e.g. Neon/Supabase) in production on **Vercel**. 

### 1. Database Configuration Switching
Our automated `postinstall` setup detects the connection format from your `DATABASE_URL` during build:
- If a PostgreSQL connection string is found, it swaps `prisma/schema.prisma` with the PostgreSQL definition template before compiling the client.
- Otherwise, it retains the default local SQLite schema.

### 2. Environment Variables Checklist in Vercel
In **Vercel Project Settings → Environment Variables**, you must add:

| Variable | Description | Example / Required |
| --- | --- | --- |
| `DATABASE_URL` | Production PostgreSQL Connection URI | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key used for authenticating users | A secure 32-character string |
| `NEXT_PUBLIC_APP_URL` | Base canonical domain of your deployment | `https://your-app.vercel.app` |
| `SMTP_HOST` | SMTP server address | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password (App Password for Gmail) | `xxxx-xxxx-xxxx-xxxx` |
| `ALERT_EMAIL` | Fallback alert destination address | `recipient-email@domain.com` |
| `CRON_SECRET` | Security key for automated hourly refresh triggers | Secure random string (provided by Vercel) |
| `AI_API_KEY` | OpenAI or compatible API key (Optional) | `sk-...` |
| `AI_BASE_URL` | LLM gateway address (Optional) | `https://api.openai.com/v1` |
| `AI_MODEL` | LLM model model name (Optional) | `gpt-4o-mini` |

### 3. Steps to Deploy to Vercel

1. **Push code to GitHub**: Create a repository and push your local codebase.
2. **Provision PostgreSQL Database**:
   - Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
   - Copy the connection URI string.
3. **Link to Vercel**:
   - Create a new project in Vercel pointing to your GitHub repository.
   - Insert all the environment variables from the checklist above.
4. **Deploy**: Click Deploy. The `postinstall` command will automatically run the schema adapter and compile the Prisma client.
5. **Run Database Migrations**:
   - Install the Vercel CLI locally (`npm i -g vercel`) and login.
   - Run the production schema creation command from your terminal:
     ```bash
     npx prisma db push
     # Or (if using standard migrations):
     npx prisma migrate deploy
     ```
6. **Trigger Automated Scraper**:
   - The `/api/refresh-all` route is configured inside `vercel.json` as an hourly cron task.
   - Vercel automatically hits this path and passes the correct `CRON_SECRET` headers to trigger secure product updates.

### 4. E-Commerce Scraper Notes
- **Amazon**: Product detail scraping works depending on the server IP/proxy configurations.
- **Flipkart**: Flipkart may block browserless serverless IP ranges. If Flipkart requests fail, the app **safely skips database writes and retains the last-known product prices** to prevent data degradation.




