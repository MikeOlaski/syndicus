# Syndic.us — Planning Document

**Last Updated:** 2026-03-08

---

## Current State Assessment

### What's Built ✅
- Full authentication system (signup, login, email verification, password reset)
- Three-role system: Admin, Coach, Subscriber
- Coach onboarding pipeline (admin_setup → claimed → onboarding → active)
- PersonaBot 1:1 chat (authenticated + guest)
- Syndic8 council system (create groups, add members, council chat)
- Public Syndic8 directory + public council chat
- Coach directory with slug-based URLs (e.g., `/tony-robbins`)
- Subscription tiers (Free, Plus, Prime) with daily message limits
- Admin dashboard (coaches, subscribers, webhooks, templates, eval)
- Coach dashboard (profile, twin, conversations, subscribers, templates)
- Subscriber dashboard (coaches, Syndic8s, profile, chat)
- External API system for third-party integrations
- Outbound webhook system
- Support chat bubble
- Voice note transcription
- AI-assisted coach profile generation
- Syndic8 evaluation/testing harness

### What's In Progress 🔧
- Syndic8 council chat stability (join/schema issues recently fixed)
- Coach approval system for public Syndic8 groups
- Public Syndic8 chat experience refinement

### What's Planned 🔮
- Journey Co-Pilot (Pillar 3)
- Memory & Continuity Engine (Pillar 4)
- RAG with embeddings for knowledge base
- Stripe payment integration completion
- Mobile-optimized experience
- Coach analytics dashboard
- Subscriber progress tracking

---

## Development Phases

### Phase 1 — Foundation ✅ (Complete)
- [x] Auth system with role-based access
- [x] Coach profile CRUD
- [x] Subscriber onboarding
- [x] 1:1 PersonaBot chat
- [x] Basic admin tools
- [x] Coach directory

### Phase 2 — Syndic8 MVP ✅ (Complete)
- [x] Syndic8 group creation & management
- [x] Council templates (balanced, complimentary, adversarial)
- [x] Council chat with synthesis
- [x] Expert reasoning toggle
- [x] Public Syndic8 groups
- [x] Coach approval for public groups
- [x] Syndic8 evaluation system

### Phase 3 — Growth & Polish 🔧 (Current)
- [ ] Stabilize Syndic8 chat (schema/join fixes)
- [ ] Improve public Syndic8 experience
- [ ] Coach analytics & engagement metrics
- [ ] Subscriber usage analytics
- [ ] Stripe checkout & billing flows
- [ ] SEO optimization for coach profiles
- [ ] Featured Syndic8 curation
- [ ] Mobile UX improvements
- [ ] Onboarding flow optimization

### Phase 4 — Memory & Continuity 🔮 (Next)
- [ ] Thread memory (conversation summaries)
- [ ] User memory (stable profile/preferences)
- [ ] Cross-session context persistence
- [ ] Workspace knowledge (shared docs/embeddings)
- [ ] RAG pipeline for knowledge base

### Phase 5 — Journey Co-Pilot 🔮 (Future)
- [ ] Journey orchestrator
- [ ] Goal setting & tracking
- [ ] Cross-coach insight synthesis
- [ ] Adaptive coaching pathways
- [ ] Progress reports

### Phase 6 — Scale & Ecosystem 🔮 (Future)
- [ ] Coach marketplace
- [ ] API for third-party integration
- [ ] White-label offering
- [ ] Coach certification program
- [ ] Community features

---

## Architecture Decisions

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12 | Use Lovable Cloud (Supabase) for backend | Integrated, no external account needed |
| 2025-12 | Slug-based coach URLs at root level | SEO-friendly (e.g., `/tony-robbins`) |
| 2025-12 | Separate `user_roles` table | Prevents privilege escalation |
| 2026-01 | Use Lovable AI Gateway | No API key management needed |
| 2026-01 | Gemini 2.5 Flash as default model | Best speed/quality/cost tradeoff |
| 2026-02 | Separate fetches instead of joins | Avoids PostgREST schema cache errors |
| 2026-02 | Council protocol with staged pipeline | Reliable, testable, debuggable |
| 2026-03 | Public Syndic8 with coach approval | Quality control + coach consent |

### Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Large page components (Syndic8Chat 369 lines) | Medium | Refactor into smaller components |
| Schema cache errors with joins | High | Moved to separate fetches — monitor |
| Missing error boundaries | Medium | Add React error boundaries |
| No automated tests | Medium | Add Vitest unit/integration tests |
| Hardcoded pricing in support chat | Low | Move to config/database |
| Coach profiles RLS complexity | Medium | 6 overlapping SELECT policies |

---

## Key Metrics to Track

### Product Health
- Daily active users (by role)
- Messages sent per day (1:1 vs Syndic8)
- Syndic8 sessions per week
- Average session length
- Coach activation rate (setup → active)

### Business Health  
- Subscriber conversion (free → paid)
- Monthly recurring revenue
- Coach retention
- Subscriber retention (30/60/90 day)
- Cost per AI message

### Quality
- Syndic8 eval pass rate
- Average coach rating
- Support ticket volume
- Error rate in edge functions
