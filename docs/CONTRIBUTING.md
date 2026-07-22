# Contributing to Syndic.us

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| State | TanStack React Query |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase) |
| Edge Functions | Deno (TypeScript) |
| AI | Lovable AI Gateway |
| Auth | Lovable Cloud Auth |

---

## Project Structure

```
src/
├── App.tsx              # Route definitions
├── main.tsx             # Entry point
├── index.css            # Design tokens & global styles
├── components/
│   ├── ui/              # shadcn/ui primitives (DO NOT EDIT)
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Auth forms
│   └── *.tsx            # Feature components
├── hooks/               # Custom React hooks
├── pages/               # Route page components
├── integrations/
│   └── supabase/
│       ├── client.ts    # AUTO-GENERATED — DO NOT EDIT
│       └── types.ts     # AUTO-GENERATED — DO NOT EDIT
├── config/              # App configuration
├── lib/                 # Utility functions
└── assets/              # Static assets

supabase/
├── config.toml          # AUTO-GENERATED — DO NOT EDIT
├── functions/           # Edge functions (auto-deployed)
│   └── <function-name>/
│       └── index.ts
└── migrations/          # READ-ONLY — managed by migration tool

docs/                    # Project documentation
```

---

## Key Conventions

### Code Style
- Use TypeScript strict mode
- Use semantic Tailwind tokens (`bg-primary`, `text-foreground`) — never raw colors
- Small, focused components (< 300 lines)
- Custom hooks for data fetching logic
- Use React Query for all server state

### Database Changes
- Always use the migration tool — never edit migration files directly
- Add RLS policies for every new table
- Use `has_role()` for role-based policies
- Never reference `auth.users` directly — use `profiles` table
- Use separate fetches instead of implicit joins (PostgREST compatibility)

### Edge Functions
- Use `LOVABLE_API_KEY` for AI Gateway calls
- Always include CORS headers
- Validate inputs before processing
- Use `createClient` with service role key for admin operations

### Auto-Generated Files (DO NOT EDIT)
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

---

## Common Patterns

### Fetching data with RLS-safe separate queries
```typescript
// ❌ Don't use implicit joins
const { data } = await supabase
  .from('syndic8_group_members')
  .select('*, coach_profiles(*)');

// ✅ Use separate fetches
const { data: members } = await supabase
  .from('syndic8_group_members')
  .select('*')
  .eq('group_id', groupId);

const coachIds = members.map(m => m.coach_id);
const { data: coaches } = await supabase
  .from('coach_profiles')
  .select('*')
  .in('id', coachIds);
```

### AI Gateway call pattern
```typescript
const response = await fetch(
  "https://ai.gateway.lovable.dev/v1/chat/completions",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...userMessages,
      ],
    }),
  }
);
```

---

## Roles & Permissions Quick Reference

| Action | Admin | Coach | Subscriber | Guest |
|--------|-------|-------|-----------|-------|
| View coach directory | ✅ | ✅ | ✅ | ✅ |
| Chat with PersonaBot | ✅ | ✅ | ✅ | ✅ (limited) |
| Create Syndic8 group | ❌ | ❌ | ✅ | ❌ |
| Manage coaches | ✅ | ❌ | ❌ | ❌ |
| Edit own coach profile | ✅ | ✅ | ❌ | ❌ |
| View all conversations | ✅ | ❌ | ❌ | ❌ |
| Manage webhooks | ✅ | ❌ | ❌ | ❌ |
