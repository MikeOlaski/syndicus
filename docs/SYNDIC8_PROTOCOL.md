# Syndic8 Council Protocol

**Last Updated:** 2026-03-08

---

## Overview

Syndic8 is a "Council of Experts" system where a user's question is processed by multiple AI expert coaches in parallel, cross-reviewed, and synthesized into a unified response. Inspired by Karpathy's "LLM Council" concept, adapted to PersonaBot expert personas.

---

## Council Workflow

### Stage 0 — Clarify (Optional)
- Orchestrator assesses if question is ambiguous
- If unclear, asks one clarifying question or proceeds with stated assumptions
- **Current status:** Not yet implemented

### Stage 1 — Parallel Drafts
Each expert produces:
```json
{
  "answer_markdown": "...",
  "assumptions": ["..."],
  "risks": ["..."],
  "missing_info": ["..."],
  "suggested_tools": ["..."]
}
```
- Experts do NOT see each other's drafts
- Each expert uses their PersonaBot persona (bio, expertise, specialization, personality)

### Stage 2 — Cross-Review
Each expert reviews 1-3 other drafts:
```json
{
  "target_expert_id": "...",
  "score": 8,
  "critiques": ["..."],
  "improvements": ["..."]
}
```
- **Current status:** Partially implemented in eval system

### Stage 3 — Synthesis (Chair)
Chair merges best parts, resolves conflicts:
```json
{
  "final_answer_markdown": "...",
  "confidence": 0.85,
  "dissent_summary": "...",
  "next_steps": ["..."]
}
```
- Chair uses all expert drafts + critiques
- Produces unified answer with optional dissent highlights

### Stage 4 — Verifier (Optional)
Skeptic agent checks:
- Internal contradictions
- Unsafe advice
- Missing constraints
- **Current status:** Not yet implemented

---

## Council Templates

### Balanced
- Equal representation across complementary domains
- Default template for new councils
- Best for: general questions, exploration

### Complimentary
- Experts whose skills amplify each other
- Produces synergistic, building-on-each-other responses
- Best for: creative projects, strategy development

### Adversarial
- Constructive challenge and stress-testing
- Forces dissent and counterarguments
- Best for: decision validation, risk assessment

---

## Progressive Disclosure (UX Levels)

### Level 0 — Default
User chats with Coach as usual. Orchestrator may silently consult 2-3 experts for hard questions. User sees single answer.

### Level 1 — Suggestion *(current implementation)*
When question is complex, UI suggests "Want a Syndic8 Council response?" One-click activation.

### Level 2 — Presets *(planned)*
Pre-configured council bundles:
- "Startup Execution Council"
- "Health & Habit Council"  
- "Marketing Growth Council"
- "Relationships Council"

### Level 3 — Custom Council *(current implementation)*
User picks experts individually (up to 8). Toggles: Fast/Thorough, Show reasoning, Ask clarifying questions.

### Level 4 — Advanced Controls *(planned)*
- Rubric emphasis sliders
- Tool permissions per expert
- Memory scope per run
- Synthesis style selection
- "Dissent required" toggle

---

## Data Model

### Tables
- `syndic8_groups` — Council definition (name, owner, public/private)
- `syndic8_group_members` — Expert membership (coach_id, approval status)
- `syndic8_group_settings` — Council config (template, reasoning, dissent, style)
- `syndic8_sessions` — Chat session per group per user
- `syndic8_messages` — Individual messages with stage metadata

### Message Roles
| Role | Stage | Description |
|------|-------|-------------|
| `user` | — | User's question |
| `assistant` | `synthesis` | Final synthesized answer |
| `expert` | `draft` | Individual expert draft |
| `expert` | `critique` | Expert review of another draft |

### Settings Fields
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `council_template` | text | `balanced` | Template mode |
| `show_expert_reasoning` | boolean | `false` | Show individual expert cards |
| `require_dissent` | boolean | `false` | Force at least 1 contrarian |
| `synthesis_style` | text | `consensus` | How to merge (consensus/options/debate) |

---

## Implementation Notes

### Current Architecture
- Single edge function (`syndic8-council`) handles full pipeline
- Parallel expert calls via `Promise.all`
- Separate data fetches (no joins) to avoid PostgREST schema cache errors
- Chair synthesis as final AI call with all expert outputs
- Streaming not yet implemented for council responses

### Known Limitations
- No Stage 2 (Cross-Review) in live chat — only in eval
- No Stage 4 (Verifier) implemented
- No memory persistence between sessions
- Max 8 experts per council
- No real-time streaming of expert drafts

### Future Improvements
- Stream individual expert drafts as they complete
- Add cross-review stage to live chat
- Implement verifier for high-stakes topics
- Graph-based orchestration (Router → Experts → Critique → Synthesis → Verify)
- Replayable traces for debugging
- Cost/latency tracking per council session
