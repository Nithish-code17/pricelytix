# Contributing to Pricelytix

Thank you for helping improve Pricelytix. Keep contributions focused, explain the user impact, and avoid mixing unrelated changes in one pull request.

## Local setup

Prerequisites:

- Node.js 20 or newer
- npm
- Git

Clone the repository, install dependencies, and configure a local SQLite database:

```bash
git clone https://github.com/Nithish-code17/pricelytix.git
cd pricelytix
cp .env.example .env # if an example file is added in the future
npm install
```

Until an environment example is available, create `.env` and set at minimum:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-local-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Optional AI, SMTP, and cron variables are documented in `README.md`. Never commit `.env` files or credentials.

Prepare the database and run the app:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Branches

Start from an up-to-date `main` branch and create a short, descriptive branch:

```bash
git switch main
git pull --ff-only
git switch -c fix/manual-refresh-authorization
```

Use prefixes such as `fix/`, `feature/`, `docs/`, or `chore/`. Keep a branch limited to one coherent change.

## Commits

- Write imperative, meaningful subjects, such as `Protect manual refresh by user`.
- Keep commits small enough to review independently.
- Do not include generated output, local databases, secrets, or unrelated formatting.
- Explain non-obvious decisions in the commit body.

## Testing

Run the checks relevant to your change:

```bash
npm run lint
npm run build
```

For database changes, run `npx prisma validate` and include a migration. Exercise affected flows manually, such as signup, login, product tracking, price refresh, notifications, and authorization failures. The email and live scraping scripts require external credentials or network access and should only be run when relevant.

## Pull requests

Before opening a pull request:

- Rebase or merge the latest `main` as appropriate.
- Review the complete diff and remove debugging output or accidental files.
- Run the applicable checks and record their exact results.
- Update documentation when behavior or configuration changes.
- Add screenshots for visible UI changes.

In the pull request, describe what changed, why it is needed, how it was validated, and any remaining limitations. Link related issues and call out migrations, new environment variables, or security-sensitive behavior. Be responsive to review feedback and do not mark unresolved checks as complete.
