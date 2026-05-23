# Prompt OS — Setup Guide

## 1. Install dependencies

```bash
cd prompt-os
npm install
```

## 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Settings → API**

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app runs fully with the placeholder AI (no API key required).
To use real AI, add:
```
OPENAI_API_KEY=sk-...
# then swap the provider in lib/ai/index.ts
```

## 4. Enable Supabase Auth providers (optional)

In your Supabase dashboard → **Authentication → Providers**:
- Enable Google OAuth (add redirect URL: `http://localhost:3000/api/auth/callback`)
- Enable GitHub OAuth

## 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Stripe setup (optional)

1. Create products in Stripe Dashboard matching the tiers in `lib/stripe.ts`
2. Add price IDs to `.env.local`
3. Implement checkout route in `app/api/stripe/checkout/route.ts`

## Project structure

```
prompt-os/
├── app/
│   ├── (auth)/          — Login, Signup pages
│   ├── (app)/           — Protected app shell + all app pages
│   │   ├── dashboard/
│   │   ├── builder/
│   │   ├── enhancer/
│   │   ├── vault/
│   │   └── settings/
│   ├── api/             — Score, enhance, auth callback routes
│   ├── pricing/         — Public pricing page
│   └── page.tsx         — Landing page
├── components/          — All UI components
│   └── ui/              — Primitives (Button, Input, Badge, Card)
├── hooks/               — use-prompts, use-auth, use-score
├── lib/
│   ├── ai/              — AI service abstraction + placeholder
│   ├── supabase/        — Client, server, middleware helpers
│   └── stripe.ts        — Pricing config
├── types/index.ts       — All TypeScript types
└── supabase/
    └── migrations/      — Database schema SQL
```
