# Leads Web App

## Getting Started

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment**

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set a strong `JWT_SECRET` (generate one with `openssl rand -hex 32`).

**3. Push the database schema**

```bash
pnpm db:push
```

**4. Seed the database**

Inserts 50 sample leads and an admin user (`admin@tryalma.ai` / `alma1234`).

```bash
pnpm db:seed
```

**5. Start the dev server**

```bash
pnpm run dev
```

- The app is available at [http://localhost:3000](http://localhost:3000).  
- The internal dashboard is at [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — log in with the seeded admin credentials.


