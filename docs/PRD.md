# Syndic.us — Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** 2026-03-08  
**Product Owner:** Mike  
**Status:** Active Development

---

## 1. Executive Summary

**Syndic.us** is an AI-powered coaching syndication platform that enables expert coaches to create **PersonaBots** (digital twins) of themselves, which subscribers can interact with 24/7. The platform's flagship feature, **Syndic8**, assembles councils of up to 8 AI expert coaches to deliberate on complex questions, providing multi-perspective synthesized answers.

### Vision
*Democratize access to world-class coaching by creating AI-powered digital twins that scale expertise infinitely.*

### Mission
Connect subscribers with AI representations of expert coaches through 1:1 PersonaBot chats and multi-expert council deliberations (Syndic8).

---

## 2. Target Users

### 2.1 Coaches (Supply Side)
- **Who:** Life coaches, business coaches, relationship coaches, health coaches, thought leaders
- **Pain:** Limited by time — can only serve a finite number of clients
- **Value Prop:** Create a digital twin that serves unlimited subscribers, earning passive revenue

### 2.2 Subscribers (Demand Side)
- **Who:** Individuals seeking coaching guidance across life, business, health, relationships
- **Pain:** Coaching is expensive ($100-500/hr), availability is limited
- **Value Prop:** 24/7 access to AI-powered coaching from multiple experts at a fraction of the cost

### 2.3 Admin (Internal)
- **Who:** Platform operators
- **Need:** Coach onboarding, quality control, analytics, webhook management, content moderation

---

## 3. Core Features

### 3.1 PersonaBot System (Pillar 1)
Digital twins of expert coaches powered by AI.

| Feature | Status | Description |
|---------|--------|-------------|
| Coach Profile Creation | ✅ Live | Coaches set up profiles with bio, expertise, specialization |
| AI Profile Assistant | ✅ Live | AI helps coaches craft their PersonaBot profile |
| Knowledge Base | ✅ Live | Coaches upload content to train their PersonaBot |
| 1:1 Chat with PersonaBot | ✅ Live | Subscribers chat directly with a coach's AI twin |
| Guest Chat (Pre-auth) | ✅ Live | Try before you buy — limited free messages |
| Voice Notes | ✅ Live | Voice-to-text input for chat |
| Prompt Templates | ✅ Live | Pre-built conversation starters |

### 3.2 Syndic8 — Council of Experts (Pillar 2)
Multi-expert deliberation system.

| Feature | Status | Description |
|---------|--------|-------------|
| Syndic8 Group Creation | ✅ Live | Subscribers create councils of coaches |
| Council Templates | ✅ Live | Balanced, Complimentary, Adversarial modes |
| Council Chat (Private) | ✅ Live | Authenticated council deliberation |
| Council Chat (Public) | ✅ Live | Public councils for non-logged-in users |
| Expert Reasoning Toggle | ✅ Live | Show/hide individual expert perspectives |
| Council Settings | ✅ Live | Template, dissent, synthesis style config |
| Public Syndic8 Directory | ✅ Live | Browse and try featured councils |
| Coach Approval System | ✅ Live | Coaches approve participation in public councils |
| Syndic8 Eval System | ✅ Live | Admin quality testing harness |

### 3.3 Journey Co-Pilot (Pillar 3) — *Planned*
Primary orchestrator for personalized coaching journeys.

| Feature | Status | Description |
|---------|--------|-------------|
| Journey Orchestrator | 🔮 Planned | Adaptive coaching path management |
| Goal Setting & Tracking | 🔮 Planned | Track progress across coaching areas |
| Cross-Coach Insights | 🔮 Planned | Synthesize learnings across PersonaBots |

### 3.4 Memory & Continuity Engine (Pillar 4) — *Planned*
Persistent context across sessions.

| Feature | Status | Description |
|---------|--------|-------------|
| Thread Memory | 🔮 Planned | Message history & summaries |
| User Memory | 🔮 Planned | Stable profile & preferences |
| Workspace Knowledge | 🔮 Planned | Shared docs, KB, embeddings |

---

## 4. User Roles & Permissions

### Roles (stored in `user_roles` table)
| Role | Access |
|------|--------|
| `admin` | Full platform management, coach CRUD, analytics, webhooks |
| `coach` | Own profile, knowledge base, conversations, templates, subscribers |
| `subscriber` | Chat with coaches, create Syndic8 groups, manage subscriptions |
| Guest (unauthenticated) | Browse directory, limited chat, view public Syndic8s |

### Subscription Tiers (Subscribers)
| Tier | Price | Messages/Day | Max Coaches |
|------|-------|-------------|-------------|
| Free | $0 | 5 | 3 |
| Plus | $7/mo | 50 | 5 |
| Prime | $27/mo | Unlimited | 17 |

---

## 5. Syndic8 Council Protocol

### Deliberation Stages
1. **Stage 0 — Clarify** (optional): Assess question ambiguity
2. **Stage 1 — Parallel Drafts**: Each expert produces answer, assumptions, uncertainties
3. **Stage 2 — Cross-Review**: Experts critique 1-3 other drafts on correctness, completeness, risks
4. **Stage 3 — Synthesis (Chair)**: Merge best parts, resolve conflicts, produce final answer
5. **Stage 4 — Verifier** (optional): Check contradictions, unsafe advice

### Council Templates
| Template | Behavior |
|----------|----------|
| **Balanced** | Equal representation across complementary domains |
| **Complimentary** | Experts whose skills amplify each other |
| **Adversarial** | Constructive challenge and stress-testing |

### Synthesis Styles
- **Consensus** — unified recommendation
- **Options** — present alternatives with tradeoffs
- **Debate** — structured disagreement then decision

---

## 6. Technical Architecture

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **UI:** shadcn/ui + Tailwind CSS + Framer Motion
- **State:** TanStack React Query
- **Routing:** React Router v6

### Backend (Lovable Cloud)
- **Database:** PostgreSQL (via Lovable Cloud)
- **Auth:** Built-in authentication with email verification
- **Edge Functions:** Deno-based serverless functions
- **AI Gateway:** Lovable AI Gateway (multi-model)
- **Storage:** File storage for knowledge base assets

### AI Models Used
| Function | Model |
|----------|-------|
| Coach PersonaBot Chat | `google/gemini-2.5-flash` |
| Syndic8 Council | `google/gemini-2.5-flash` |
| Support Chat | `google/gemini-2.5-flash` |
| Profile Generation | `google/gemini-2.5-flash` |
| Voice Transcription | `google/gemini-2.5-flash` |

### Key Edge Functions
| Function | Purpose |
|----------|---------|
| `persona-chat` | 1:1 PersonaBot conversations |
| `syndic8-council` | Multi-expert council deliberation |
| `support-chat` | Platform support chatbot |
| `generate-coach-profile` | AI-assisted profile creation |
| `transcribe-voice` | Voice note transcription |
| `create-checkout` / `customer-portal` | Stripe billing |
| `coach-webhook` / `send-coach-webhook` | External integrations |
| `syndic8-eval` | Council quality evaluation |

---

## 7. Data Model (Key Tables)

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, email, avatar, tier) |
| `user_roles` | Role assignments (admin, coach, subscriber) |
| `coach_profiles` | Coach-specific data (bio, expertise, slug) |
| `knowledge_base` | Coach training content |
| `subscriptions` | Coach-subscriber relationships |
| `conversations` / `chat_messages` | 1:1 chat history |
| `syndic8_groups` | Council configurations |
| `syndic8_group_members` | Council membership |
| `syndic8_group_settings` | Council preferences |
| `syndic8_sessions` / `syndic8_messages` | Council chat history |
| `coach_sessions` | Session tracking & analytics |
| `daily_message_usage` | Rate limiting |
| `prompt_templates` | Reusable conversation starters |
| `outbound_webhooks` / `webhook_logs` | External integrations |
| `syndic8_eval_cases` / `syndic8_eval_results` | Quality evaluation |

---

## 8. Security Model

- **Row-Level Security (RLS)** on all tables
- **Role-based access** via `has_role()` security definer function
- **Email verification** required for signup (no auto-confirm)
- **API key authentication** for external integrations
- **Webhook secret keys** for outbound webhook signing
- **No client-side role storage** — all role checks server-side

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Coach signups | 100 in first 3 months |
| Subscriber signups | 1,000 in first 3 months |
| Messages/day | 5,000+ |
| Syndic8 sessions/week | 500+ |
| Coach satisfaction | 4.5+ rating |
| Subscriber retention (30-day) | 60%+ |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| AI hallucination | Coach knowledge base grounding, verifier stage |
| Low coach adoption | Streamlined onboarding, AI profile assistant |
| Quality variance | Syndic8 eval system, admin oversight |
| Scaling costs | Tiered usage limits, model selection optimization |
| Data privacy | RLS policies, no PII in logs, encrypted storage |
