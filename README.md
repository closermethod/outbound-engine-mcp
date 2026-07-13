# Outbound Engine MCP

**The cold-outreach method layer for AI agents. One engine, any target: brand deals, UGC, newsletter sponsorships, jobs, podcasts.**

Built from the method behind The Outbound Engine.

> **Disclaimer.** Outputs are structured outreach-method frameworks based on documented practice. Results vary by niche, proof quality, and consistency. Not legal advice. Follow platform rules and outreach law for your channel and region.

---

## Why This Exists

Every AI agent that drafts cold outreach today has the same failure mode: it writes long, polite, generic pitches that ask a stranger for the biggest possible thing on the first touch. Those messages don't get replies, and outreach that doesn't get replies doesn't get deals.

This MCP encodes one rule and enforces it with tools:

> **A cold pitch is not trying to close a deal. It is trying to get a reply. The deal closes in the follow-up.**

It does NOT send messages and does NOT scrape prospects. It is the method layer: give it a draft, a target type, or a reply — get back structure, violations, and the next move.

## 7 Tools

| Tool | What it returns |
|---|---|
| `structure_cold_pitch` | HOOK / BRIDGE / SOFT ASK structure + the 4 swap variables (who to pitch, signal to research, proof to lead with, soft-ask object) per target type |
| `audit_cold_message` | PASS/FAIL audit of a draft: money in a cold message, identity-first opener, generic hook, hard ask, length over ~90 words, multiple asks — with a rewrite recipe |
| `build_followup_ladder` | The 5-step ladder (Day 3 / 7 / 12 / 18 / 25) — where 80% of deals actually close. The Day 25 break-up alone pulls ~30% of replies |
| `handle_reply` | The next move for any reply type: price question, interested, not now, no budget, exposure offer, spec request, pay-on-performance, ghosted |
| `build_pricing_menu` | The 3-option menu (Starter / Most Popular / Full) + the two scoping questions to ask first. Drop scope, never price |
| `detect_red_flags` | Scans a reply or brief for walk-away signals: exposure-pay, spec work, pay-on-performance, budget mismatch, scope creep |
| `get_full_pack` | The complete engine as one payload — drop it into a Claude Project system prompt |

## Sample Use

```typescript
// Agent drafted a cold DM for a brand deal. Before sending:
mcp.call("audit_cold_message", {
  message: "Hi, I'm a UGC creator with 50k followers! I love your brand. My rate is $500/video...",
  target_type: "brand_deal"
});
// Returns: FAIL — no_money_in_cold_message, no_identity_first_opener,
// specific_hook_required + a 3-move rewrite recipe.

// Prospect replied asking "what do you charge?"
mcp.call("handle_reply", { reply_type: "price_question" });
// Returns: don't send one number — two scoping questions first, then the 3-option menu.
```

## Target Types

`brand_deal` · `ugc` · `newsletter_sponsorship` · `job` · `podcast` · `client_work`

Same engine, four swapped variables per target. That's the whole trick.

## The Full System

This MCP is the free method layer. The full Outbound Engine product adds per-target research packs, an onboarding intake that builds your proof inventory, and the daily operating system — at [elisabethhitz.com](https://elisabethhitz.com).

## Built By

[Elisabeth Hitz](https://www.linkedin.com/in/elisabethhitz) — 10+ years of B2B enterprise sales experience across ad-tech, SaaS, media, and global hiring. Now building MCP servers for the AI agent ecosystem.

License: MIT
