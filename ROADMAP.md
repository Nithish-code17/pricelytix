# Pricelytix Roadmap

This roadmap communicates direction rather than a delivery guarantee. Priorities may change based on reliability, security, and user feedback.

## Completed

- Account signup, login, logout, and HTTP-only JWT sessions
- User-specific product trackers and target prices
- Amazon and Flipkart price fetching with safe failure handling
- Manual single-product and bulk price refresh
- Scheduled refresh through a secret-protected Vercel cron route
- Price history storage, charts, and high/low summaries
- In-app target-price notifications and email alerts
- AI shopping assistant with an API-backed mode and rule-based fallback
- SQLite local development and PostgreSQL production support
- Responsive dashboard, product detail, authentication, and assistant views

## Current priorities

- Improve automated tests for authentication, tenant isolation, and API validation
- Reduce lint debt and strengthen TypeScript types in scraper and chart code
- Improve scraper observability, accuracy, and resilience to storefront changes
- Document environment configuration and deployment verification more clearly
- Review dependency advisories and adopt safe, compatible updates

## Planned

### Near term

- Product comparison across supported stores
- Configurable notification preferences and alert frequency
- More reliable duplicate-alert and price-history controls
- Expanded store support through maintainable provider adapters
- CI checks for lint, build, Prisma validation, and automated tests

### Longer term

- Browser extension and mobile-friendly product capture
- Mobile application
- WhatsApp or additional notification channels
- AI-assisted price forecasting based on sufficient history
- Administrative health and job-monitoring dashboard
- Subscription and billing support

High-risk automation such as automatic purchasing would require a separate security, consent, and reliability design before implementation.
