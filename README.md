# Leads Form & Dashboard

**Disclaimer**: This project is a collaboration with Claude Sonnet 4.6, where I contribute the main architectural decisions, and it helps me scaffold the templates and locate the correct resources in the libraries' documentation. **This README is written by me.**

> I also recorded a demo video [here](https://drive.google.com/file/d/1STic0kYHW1C2jcNq8oekITljBqcc5tks/view?usp=sharing).

## System Design Overview

![](./docs/Screenshot%202026-02-28%20at%2000.49.18.png)

- **UI** (shadcn/ui + Tailwind CSS v4): all components are built on unstyled Radix UI primitives styled with Tailwind utility classes via shadcn/ui. The current component surface are minimal and easy to theme.

- **API** (tRPC v11 + TanStack Query + Server-Sent Events): the internal dashboard communicates with the server exclusively through type-safe tRPC procedures, and TanStack Query handles caching and background refetching. I've implemented a real-time data updates that are pushed over a persistent SSE connection (`GET /api/sse`). The pub/sub layer that powers SSE is abstracted behind a `PubSubService` interface: the current implementation uses an in-process Node `EventEmitter` (suitable for a single server), but it can be swapped for any other broker simply like RabbitMQ by providing a new driver and changing the singleton export, with very few changes to the rest of the codebase.

- **Validation** (`zod` + React Hook Form): all request payloads, form values, and API response shapes share the same Zod schemas defined in `lib/types.ts`. `@hookform/resolvers/zod` wires those schemas directly into React Hook Form, so the same rules enforce both client-side UX feedback and server-side input validation without duplication.

- **Database** (SQLite w/ WAL + Drizzle ORM): SQLite with WAL mode is used for a minimal local development and prototyping because all we need is just a single file. Because Drizzle is a relational ORM with first-class support for PostgreSQL, the schema and all queries can be migrated to a containerised Postgres instance with minimal changes, thus it will be a natural upgrade path when the app needs multi-writer concurrency when needed.

- **File storage** (`StorageService` abstraction): resume/file uploads are handled through a `StorageService` interface. The default implementation writes files to `public/uploads/` and serves them as Next.js static assets. The interface exposes `save`, `delete`, and `publicUrl` methods, so later it will be straightforward to drop in an external driver (such as AWS S3) for production without touching upload or retrieval logic elsewhere.

- **Auth** (JWT (HS256) + `httpOnly` cookies.): user credentials are verified with `bcryptjs`, and sessions are issued as short-lived JWTs signed with a server-side secret via `jose`. Tokens are stored in an `httpOnly`, `SameSite=lax` cookie, this keeps them inaccessible to JavaScript and helps with mitigating XSS-based session theft. The tRPC `protectedProcedure` middleware validates the cookie on every protected request.

- **State management** (none): no dedicated state management library is used. The root layout wraps the app in `TRPCProvider` (tRPC + TanStack Query), which covers the only real cross-cutting concern, which is server data fetching and caching. Auth state lives entirely server-side: the JWT cookie is read and verified in tRPC's `createContext`. Everything else is handled with localised component state or prop passing. Given that the project surface is a single public form and an internal data view, introducing a library like Zustand or Redux would be unnecessary overhead.

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

**5. (Optional) Browse the database with Drizzle Studio**

```bash
pnpm db:studio
```

Opens a local web UI at `https://local.drizzle.studio` where you can inspect and edit the `leads` and `users` tables directly.

**6. Start the dev server**

```bash
pnpm run dev
```

- The app is available at [http://localhost:3000](http://localhost:3000).  
- The internal dashboard is at [http://localhost:3000/dashboard](http://localhost:3000/dashboard): log in with the seeded admin credentials.

## Potential Improvements & Product Thoughts

- **JSON Forms (configuration-driven lead form)**
    - The requirements mention using [JsonForms](https://jsonforms.io/) to render the lead form from a JSON schema config. This is a worthwhile direction, I think it made sense since it decouples form structure from presentation and makes adding/removing fields a config change rather than a code change. Then on a second thought, adopting it would require non-trivial refactoring across the Zod validation schemas, the database schema, and the shadcn/UI-based field styling, so it was not taken into consideration here.
- **i18n (internationalisation)**
    - Because the product is immigration-focused, the public-facing lead form is a natural candidate for multi-language support. Visitors may be more comfortable submitting personal details in their native language. A library such as `next-intl` could be layered in with relatively low friction given the App Router setup.
- **Mobile responsiveness on the dashboard**
    - The dashboard is intentionally desktop-only. Reviewing and managing a dense data table on a small screen is a poor experience, so no responsive breakpoints were added there. The public lead form, however, is fully responsive. On the desktop dashboard, we could also implement summary stats at the top (e.g. total pending vs. reached-out counts) that would give users a quick snapshot.
- **Rate limiting**
    - The public lead-submission endpoint and the upload route are currently unprotected against abuse. We can consider adding rate limiting per IP address (and optionally per email/name) to prevent spam submissions and resume-upload flooding.
- **Form UX**
    - In my opinion, presenting all form fields at once can feel overwhelming. I like Typeform a lot, the one question (or logical group of questions) per screen style could reduce cognitive load and likely improve completion rates.

