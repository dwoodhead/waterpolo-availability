# Training Availability

RSVP page for water polo training sessions, live at
[oclub-practice.vercel.app](https://oclub-practice.vercel.app). Players mark whether
they're coming to each session, and each session shows progress toward its goalie and
field-player targets.

- **Sessions** are defined in [`lib/sessions.ts`](lib/sessions.ts): edit the `sessions`
  array to add, change or remove them. Past sessions (Pacific time) drop off automatically.
- **RSVPs** are saved to Supabase by the `upsertRsvp` server action in
  [`app/actions.ts`](app/actions.ts).
- **Env:** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
  (never committed).

```bash
npm install && npm run dev
```

Pushing to `main` deploys to production on Vercel (project `oclub-practice-app`).
This repo is public, so never commit secrets or players' personal details.
