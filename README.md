# GeoJoy Ventures Online Store

Online store for **GeoJoy Ventures**, a household and kitchen goods shop in Ghana. Customers browse, pay for their items with Mobile Money, and get their order delivered anywhere in Ghana. The owner runs everything from a simple admin panel, with no developer needed for day-to-day changes.

| | |
| --- | --- |
| Design | [Figma: Website – Desktop](https://www.figma.com/design/EJmBEzSZFHuiJtpVYsj7KB/Untitled) |
| Requirements | SRS v1.1, summarised in [`docs/decisions.md`](docs/decisions.md) |
| Build plan | [`docs/build-plan.md`](docs/build-plan.md): phases and the prompts to use with Claude Code |
| Rules for Claude Code | [`CLAUDE.md`](CLAUDE.md) |

## Tech stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **Supabase**: Postgres database, email + password sign-in, image storage
- **Paystack**: Mobile Money payments (MTN MoMo, Telecel Cash, AirtelTigo Money)
- **Resend**: order, delivery fee and password emails
- **Vercel**: hosting (free tier to start)

## Getting started

You need [Node.js 20.9 or newer](https://nodejs.org) and free accounts on Supabase, Paystack (test mode) and Resend.

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
cp .env.example .env.local      # then fill in your keys
npm run dev                     # open http://localhost:3000
```

### Set up the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `supabase/migrations/0001_initial_schema.sql`, and run it.
3. In **Authentication > Providers**, keep **Email** on.
4. In **Storage**, create a public bucket called `product-images`.
5. Sign up on the site with the owner's email, then make that account the owner in the SQL Editor:
   ```sql
   update profiles set role = 'owner'
   where id = (select id from auth.users where email = 'owner@example.com');
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the site locally |
| `npm run build` | Production build (run before every push) |
| `npm run lint` | Check code style |
| `npm run typecheck` | Check TypeScript types |

## Project structure

```
src/
  app/              pages and routes (App Router)
  components/       shared UI (Header, Footer, ProductCard, Button ...)
  lib/supabase/     database clients for browser and server
supabase/
  migrations/       database schema (SQL)
docs/               decisions, build plan, design notes
public/images/      static images (logo, placeholders)
```

## Branches

- `main`: always working; deployed to Vercel.
- Feature branches: `feature/<short-name>` (for example `feature/checkout`). Open a pull request into `main`.
