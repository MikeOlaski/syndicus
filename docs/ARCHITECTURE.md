# Syndic.us — Architecture Document

**Last Updated:** 2026-03-08

---

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │  Public   │ │Subscriber│ │  Admin   │            │
│  │  Pages    │ │Dashboard │ │Dashboard │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │             │            │                   │
│  ┌────┴─────────────┴────────────┴─────┐            │
│  │         Supabase Client SDK          │            │
│  └────────────────┬────────────────────┘            │
└───────────────────┼─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│PostgreSQL│ │  Edge     │ │  Auth    │
│  + RLS   │ │Functions  │ │  System  │
└──────────┘ └────┬─────┘ └──────────┘
                  │
                  ▼
          ┌──────────────┐
          │  Lovable AI  │
          │   Gateway    │
          └──────────────┘
```

---

## Frontend Architecture

### Route Structure

```
/ .......................... Landing page (public)
/auth ...................... Login / Signup
/coaches ................... Coach directory (public)
/directory ................. Full coach directory
/syndic8 ................... Syndic8 landing (public)
/syndic8-chat/:groupId ..... Public council chat
/:coachSlug ................ Coach profile (public)
/:coachSlug/chat ........... Chat with PersonaBot
/:coachSlug/chat/active .... Active chat session

/subscriber-dashboard/ ..... Subscriber home
  /coaches ................. My coaches
  /syndic8s ................ My Syndic8 councils
  /syndic8s/:groupId ....... Manage council
  /syndic8s/:groupId/chat .. Council chat
  /chat .................... Chat interface
  /profile ................. Profile settings

/coach-dashboard/ .......... Coach home
  /my-twin ................. PersonaBot config
  /conversations ........... View conversations
  /profile ................. Profile setup
  /subscribers ............. Subscriber management
  /templates ............... Prompt templates
  /chat .................... Test chat

/admin-dashboard/ .......... Admin home
  /coaches ................. Coach management
  /coaches/:coachId ........ Coach detail
  /subscribers ............. Subscriber management
  /conversations ........... All conversations
  /templates ............... Template management
  /webhooks ................ API key management
  /outbound-webhooks ....... Webhook management
  /syndic8-eval ............ Council evaluation
  /chat .................... Admin chat
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `DashboardLayout` | Role-gated layout wrapper |
| `Header` / `Footer` | Public page chrome |
| `ChatInterface` | 1:1 PersonaBot chat UI |
| `CouncilMessage` | Syndic8 message with expert reasoning |
| `CoachDirectory` | Coach browsing grid |
| `SupportChatBubble` | Floating support chat |
| `AppSidebar` | Dashboard navigation |

### State Management
- **Server state:** TanStack React Query (cache, refetch, optimistic updates)
- **Auth state:** Supabase auth listener → React context
- **UI state:** React useState/useReducer (local)
- **No global client state store** — React Query handles all server state

---

## Backend Architecture

### Edge Functions

```
supabase/functions/
├── persona-chat/          # 1:1 PersonaBot conversation
├── syndic8-council/       # Multi-expert council deliberation
├── support-chat/          # Platform support chatbot
├── agent-response/        # Generic agent response
├── expert-advisor/        # Expert advisor chat
├── generate-coach-profile/# AI profile generation
├── transcribe-voice/      # Voice → text
├── create-checkout/       # Stripe checkout session
├── customer-portal/       # Stripe customer portal
├── check-subscription/    # Verify subscription status
├── create-coach/          # Programmatic coach creation
├── import-coaches/        # Bulk coach import
├── coaches-api/           # External coach API
├── external-chat/         # External chat API
├── coach-webhook/         # Inbound webhook handler
├── send-coach-webhook/    # Outbound webhook dispatcher
├── assign-user-role/      # Role assignment
├── admin-update-password/ # Admin password reset
└── syndic8-eval/          # Council evaluation runner
```

### Syndic8 Council Flow

```
User Question
     │
     ▼
┌─────────────┐
│ Edge Fn:     │
│ syndic8-     │
│ council      │
│              │
│ 1. Fetch     │──→ syndic8_group_members
│    members   │──→ coach_profiles
│              │──→ profiles (via RPC)
│              │
│ 2. Build     │    For each expert:
│    prompts   │    - system prompt with persona
│              │    - role + specialization
│              │
│ 3. Parallel  │──→ Lovable AI Gateway
│    drafts    │    (N parallel calls)
│              │
│ 4. Synthesis │──→ Lovable AI Gateway
│    (Chair)   │    (1 synthesis call)
│              │
│ 5. Return    │
│    response  │
└──────┬──────┘
       │
       ▼
  Client renders
  CouncilMessage
  with expert cards
```

---

## Database Schema

### Entity Relationships

```
auth.users (managed by Lovable Cloud)
    │
    ├── profiles (1:1, public schema)
    │     └── subscriber_tier
    │
    ├── user_roles (1:N)
    │     └── role: admin | coach | subscriber
    │
    ├── coach_profiles (1:1 via user_id)
    │     ├── knowledge_base (1:N via coach_id → profile.id)
    │     ├── coach_sessions (1:N)
    │     └── subscriptions (1:N via coach_id → user_id)
    │
    ├── subscriptions (1:N via subscriber_id)
    │
    ├── syndic8_groups (1:N via owner_id)
    │     ├── syndic8_group_members (1:N)
    │     ├── syndic8_group_settings (1:1)
    │     ├── syndic8_sessions (1:N)
    │     │     └── syndic8_messages (1:N)
    │     └── syndic8_eval_results (1:N)
    │
    └── daily_message_usage (1:N)

conversations (1:N per coach)
    └── chat_messages (1:N)

prompt_templates (global)
outbound_webhooks (global)
webhook_logs (1:N per webhook)
external_api_keys (global)
waitlist (public insert)
admin_actions (audit log)
```

### Views
| View | Purpose |
|------|---------|
| `public_coach_directory` | Coach data without sensitive fields |
| `public_coach_profiles` | Basic profile info (name, avatar) |
| `public_syndic8_groups` | Public groups with member count & specializations |

### Key Functions
| Function | Purpose |
|----------|---------|
| `has_role(user_id, role)` | Security definer for RLS |
| `is_syndic8_group_owner(group_id, user_id)` | Ownership check |
| `is_syndic8_group_public(group_id)` | Public visibility check |
| `get_public_coach_profiles(coach_ids)` | Batch profile lookup |
| `get_subscription_limits(tier)` | Tier limit lookup |

---

## Security Architecture

### Authentication Flow
1. User signs up with email + password
2. Email verification required (no auto-confirm)
3. Role assigned via `assign-user-role` edge function
4. RLS policies enforce data access per role

### RLS Strategy
- **Restrictive policies** (PERMISSIVE = No) — all policies must pass
- **Security definer functions** avoid recursive RLS
- **Owner-based access** for user-generated content
- **Role-based access** for admin operations
- **Public access** only via dedicated views

### API Security
- External API keys stored in `external_api_keys` table
- Origin validation on API requests
- Webhook requests signed with secret keys
- Rate limiting via `daily_message_usage` table
