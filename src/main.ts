#!/usr/bin/env node
/**
 * Outbound Engine MCP Server v1.0
 * By Elisabeth Hitz — the cold-outreach method behind The Outbound Engine.
 *
 * One engine, any target: brand deals, UGC, newsletter sponsorships, jobs, podcasts.
 * 6 tools for AI agents (and humans) to STRUCTURE, AUDIT, and SEQUENCE cold outreach.
 *
 * The core rule: a cold pitch is not trying to close a deal. It is trying to get a
 * reply. The deal closes in the follow-up. Every tool in this server enforces that.
 *
 * This MCP does NOT send messages and does NOT scrape prospects. It is the method
 * layer: give it a draft, a target type, or a reply — get back structure, violations,
 * and the next move.
 *
 * DISCLAIMER: Outputs are structured outreach-method frameworks based on documented
 * practice. Results vary by niche, proof quality, and consistency. Not legal advice.
 * Respect platform rules and applicable outreach law in your jurisdiction.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// =====================================================
// SERVER METADATA
// =====================================================
const MCP_META = {
  server: "outbound-engine-mcp",
  version: "1.0.0",
  last_verified: "2026-Q3",
  author: "Elisabeth Hitz",
  homepage: "https://elisabethhitz.com",
  github: "https://github.com/closermethod/outbound-engine-mcp",
  method_note: "This is the free method layer of The Outbound Engine. The full product adds per-target research packs, an onboarding intake, and a daily operating system.",
  jurisdiction_caveat: "Structured outreach-method frameworks, not legal advice. Follow platform terms and outreach law (CAN-SPAM, GDPR, CASL, PECR) for your channel and region."
} as const;

// =====================================================
// THE ENGINE — CORE RULES
// =====================================================
const CORE_RULES = {
  one_rule: "A cold pitch is not trying to close a deal. It is trying to get a reply. The deal closes in the follow-up.",
  formula: {
    hook: "1-2 sentences. Make it about them. Reference one specific, real thing you found by looking — a detail only someone who actually looked would know. Never 'I love your brand.'",
    bridge: "1-2 sentences. Connect what you do to their specific need. Lead with a proof point (a result, a number, a name). Never open with 'I'm a [role]' — nobody cares what you are, they care what you can do for them.",
    soft_ask: "1 sentence. Ask for a conversation or permission to send something small. Never money. Never a rate. Never 'will you hire me.' The ask is: 'want me to send over [2-3 concepts / angles / a short version]?'"
  },
  length_rule: "Short is a signal of confidence. Long cold messages scream desperation. Target: under ~90 words total.",
  research_rule: "You cannot HOOK without a signal. Find ONE specific true thing (recent launch, post, raise, hire, publish). Write it in five words — that becomes line one. No signal, no pitch: skip the target."
};

// =====================================================
// TARGET PACKS — the 4 variables that swap per target
// =====================================================
const TARGET_PACKS: Record<string, any> = {
  brand_deal: {
    who_to_pitch: "Partnerships or marketing lead — not the generic brand inbox",
    signal_to_research: "Are they running creator/paid social ads right now? Recent creator collabs, product launches, seasonal campaigns.",
    proof_to_lead_with: "A past video's hook rate, CTR, or a named brand result",
    soft_ask_object: "2-3 content concepts tailored to their current campaign",
    common_mistakes: ["Pitching a brand that has never paid creators", "Leading with follower count instead of performance metrics", "Attaching a rate card to the first message"]
  },
  ugc: {
    who_to_pitch: "UGC/creative strategist, growth or performance marketing lead",
    signal_to_research: "Active UGC-style ads in their ad library, job posts for creative strategists, recent DTC launch",
    proof_to_lead_with: "Ad performance stats (thumbstop, CTR) or portfolio pieces in their niche",
    soft_ask_object: "2-3 hook concepts for their current ad angle",
    common_mistakes: ["Sending a generic portfolio link with no tailoring", "Calling yourself a 'UGC creator' in line one", "Asking for a brief before showing an idea"]
  },
  newsletter_sponsorship: {
    who_to_pitch: "The operator/founder of the newsletter (sponsoring) or the sponsor's growth lead (selling placements)",
    signal_to_research: "Their current sponsors, send frequency, what categories they have and have not run",
    proof_to_lead_with: "Audience quality stats: open rate, click rate, niche density — not raw subscriber count",
    soft_ask_object: "A one-line placement idea or a sample ad slot mockup",
    common_mistakes: ["Leading with list size instead of engagement", "Quoting CPM in the first message", "Pitching a sponsor whose product mismatches the audience"]
  },
  job: {
    who_to_pitch: "Hiring manager or founder — never careers@",
    signal_to_research: "A recent raise, launch, team expansion, or the role posting itself",
    proof_to_lead_with: "A result you drove at a past company, quantified",
    soft_ask_object: "A 30-day plan for the role (not a resume)",
    common_mistakes: ["Applying through the portal AND cold-pitching with the same generic text", "Attaching a resume to the first message", "Asking about salary in the first touch"]
  },
  podcast: {
    who_to_pitch: "The host directly, or the producer for larger shows",
    signal_to_research: "Recent episode topics, gaps in their guest lineup, a take of theirs you can build on",
    proof_to_lead_with: "A specific story or contrarian angle their audience has not heard, plus social proof you can deliver",
    soft_ask_object: "2-3 episode angles with a one-line description each",
    common_mistakes: ["'I'd love to be on your podcast' with no angle", "Pitching topics they covered last month", "Leading with your bio instead of their audience's benefit"]
  },
  client_work: {
    who_to_pitch: "Founder or the functional lead who owns the problem you solve",
    signal_to_research: "A visible gap you can name (slow site, no email flow, weak content cadence) or a growth event that creates the need",
    proof_to_lead_with: "A named result for a similar business",
    soft_ask_object: "A short teardown or 2-3 specific ideas for their situation",
    common_mistakes: ["Pitching a service they cannot see the need for", "Proposal and pricing in message one", "Vague 'I help businesses grow' bridges"]
  }
};

// =====================================================
// FOLLOW-UP LADDER
// =====================================================
const FOLLOWUP_LADDER = [
  { step: 1, day: 3, move: "Bump + a slightly new angle", template_shape: "In case this got buried — happy to send [soft-ask object] if next week's better.", rule: "Never just say 'bumping this' with nothing added." },
  { step: 2, day: 7, move: "Give value, no ask", template_shape: "Share a relevant trend, result, or idea with zero ask attached.", rule: "This message must be useful even if they never reply." },
  { step: 3, day: 12, move: "New proof", template_shape: "Just wrapped [similar target] with [result] — thought it was relevant.", rule: "Proof must be new since the first message, or at least new to them." },
  { step: 4, day: 18, move: "Soft close", template_shape: "I have room for one more [engagement type] this month — want me to send a proposal?", rule: "First time scarcity appears. Only true scarcity." },
  { step: 5, day: 25, move: "The break-up", template_shape: "I'll stop following up after this. If timing ever changes, I'd love to connect.", rule: "Send it exactly once and mean it. The break-up gets ~30% of all replies — people respond to finality." }
];

// =====================================================
// REPLY PLAYBOOK
// =====================================================
const REPLY_PLAYBOOK: Record<string, any> = {
  price_question: {
    meaning: "Buying signal. They are qualifying you.",
    next_move: "Do NOT send one number. Ask two scoping questions first (scope + timeline or usage), then send a 3-option menu.",
    reply_shape: "Happy to share — quick two questions so I quote the right thing: [scope question]? [timeline/usage question]?",
    trap_to_avoid: "Answering with a single rate. One number is a yes/no decision; three options is a which-one decision."
  },
  interested: {
    meaning: "The reply you were engineering for. The deal starts now.",
    next_move: "Deliver the soft-ask object fast (within 24h) and at high quality. Then propose the smallest next step.",
    reply_shape: "Send the 2-3 concepts/angles/plan you offered, then: 'If any of these land, want me to develop [one] further?'",
    trap_to_avoid: "Jumping to a contract or a long call. Keep momentum in small steps."
  },
  not_now: {
    meaning: "Timing objection, not a no. These convert on re-approach.",
    next_move: "Ask permission to follow up at a named time, then actually do it.",
    reply_shape: "Totally get it. Mind if I check back in [their stated window / 6 weeks]? I'll bring something specific.",
    trap_to_avoid: "Treating 'not now' as rejection and disappearing."
  },
  no_budget: {
    meaning: "Either true (walk soon) or a soft brush-off (qualify once).",
    next_move: "Qualify once: ask when budget cycles open or what they DO have budget for. If truly zero, exit gracefully and calendar the follow-up.",
    reply_shape: "Understood. When does [next quarter/campaign] budget open up? Happy to be first in line.",
    trap_to_avoid: "Discounting to fit a budget that was never real. Drop scope, not price — and only when a real number exists."
  },
  exposure_offer: {
    meaning: "RED FLAG. 'We don't pay but we'll send product / exposure / a tag.'",
    next_move: "Decline politely unless the product/audience value is genuinely strategic for you. This is a walk-away signal in the method.",
    reply_shape: "I keep paid and gifted separate — if a paid budget opens up I'd love to talk. Meanwhile, good luck with [campaign].",
    trap_to_avoid: "Doing paid-quality work for exposure and anchoring yourself at zero."
  },
  spec_request: {
    meaning: "RED FLAG. 'Can you do a free test first?' Paid-quality work on spec anchors you at zero.",
    next_move: "Offer a paid pilot instead: smallest real scope at real (not discounted) unit price.",
    reply_shape: "I don't do spec work, but I do run paid pilots: [smallest deliverable] at [pilot scope]. If it performs, we scale.",
    trap_to_avoid: "One free piece 'to show quality.' Your proof points are the quality demonstration."
  },
  pay_on_performance: {
    meaning: "RED FLAG. 'We'll pay after it performs.' You do not control distribution or their funnel — you don't control performance.",
    next_move: "Counter with base + bonus if you want the deal, otherwise walk.",
    reply_shape: "I work base + performance bonus, not pure performance — I don't control your funnel. Base covers the work; upside we share.",
    trap_to_avoid: "Pure rev-share/CPA deals where you carry all the risk."
  },
  ghosted_after_interest: {
    meaning: "Normal. Interest decays; it rarely reverses to hostility.",
    next_move: "Re-enter the ladder at the value-give step (day 7 move), not the bump. New value re-opens doors a bump cannot.",
    reply_shape: "Saw [new relevant thing] and thought of your [campaign/role/show] — [one-line idea]. Still happy to send [object] whenever useful.",
    trap_to_avoid: "'Just checking in' messages. Every re-touch must add something."
  }
};

// =====================================================
// PRICING — THE 3-OPTION MENU
// =====================================================
const PRICING_MENU = {
  rule: "Never send one number. Ask two scoping questions first, then send three tiers.",
  structure: {
    option_a: "Starter — low anchor. Real value, minimal scope. Exists so B has a floor.",
    option_b: "Most Popular — the one you want them to take. Price it at your real target. ~60% pick this.",
    option_c: "Full — high anchor. Everything plus premium extras. Exists so B looks reasonable."
  },
  negotiation_rule: "Always drop scope, not price. 'That's over budget' is answered by removing a deliverable, never by discounting the same deliverable.",
  scoping_questions_by_target: {
    brand_deal: ["How many pieces and which platforms?", "Organic only, or paid usage rights too — and for how long?"],
    ugc: ["How many concepts/variations per month?", "Usage: organic, paid, or whitelisted — and duration?"],
    newsletter_sponsorship: ["Main placement or secondary?", "Single send or a multi-send package?"],
    client_work: ["What does 'done' look like in 90 days?", "Who else touches this internally?"],
    podcast: ["(Pricing rarely applies — skip menu, confirm logistics)", ""],
    job: ["(Use salary-band research, not a 3-option menu)", ""]
  }
};

// =====================================================
// RED FLAGS
// =====================================================
const RED_FLAGS = [
  { flag: "exposure_pay", patterns: ["exposure", "we'll tag you", "send you product", "gifted collab", "in exchange for product"], meaning: "'We don't pay but...' — walk away unless strategically exceptional." },
  { flag: "spec_work", patterns: ["free test", "on spec", "trial piece", "sample first", "unpaid trial"], meaning: "Paid-quality work for free anchors you at zero. Offer a paid pilot instead." },
  { flag: "pay_on_performance", patterns: ["pay after it performs", "rev share only", "commission only", "performance based only", "if it converts"], meaning: "You don't control their funnel. Base + bonus or walk." },
  { flag: "budget_mismatch", patterns: ["budget is $50", "our budget is small but", "can you do it cheaper", "student budget"], meaning: "A budget that doesn't match the ask. Drop scope to fit, never price." },
  { flag: "scope_creep_probe", patterns: ["just one more", "quick extra", "while you're at it", "small addition"], meaning: "Pre-contract scope creep predicts post-contract scope creep. Re-scope in writing." }
];

// =====================================================
// AUDIT RULES (for audit_cold_message)
// =====================================================
const MONEY_PATTERNS = [/\$\s?\d/, /€\s?\d/, /£\s?\d/, /\bmy rate\b/i, /\bi charge\b/i, /\brate card\b/i, /\bper post\b/i, /\bper video\b/i, /\bpricing\b/i, /\bcpm\b/i];
const IDENTITY_OPENERS = [/^i'?m an? /i, /^my name is /i, /^i am an? /i, /^(hi|hey|hello)[,!]?\s+(there[,!]?\s+)?(i'?m|i am|my name is)\s/i];
const WEAK_HOOKS = [/i love your (brand|content|work|page|channel)/i, /\bbig fan\b/i, /long[- ]time (fan|follower)/i, /i've been following you/i];
const HARD_ASKS = [/\bwill you hire\b/i, /\bcan you hire\b/i, /\bsign a contract\b/i, /\bbook a (30|45|60)[- ]min/i, /\bjump on a call this week\b/i];

function auditMessage(message: string, targetType?: string) {
  const violations: any[] = [];
  const warnings: any[] = [];
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const firstSentence = (message.trim().split(/(?<=[.!?])\s/)[0] || "").toLowerCase();

  for (const p of MONEY_PATTERNS) {
    if (p.test(message)) {
      violations.push({ rule: "no_money_in_cold_message", severity: "FAIL", detail: `Matched ${p}. The second you ask for money or name a rate in a cold message, you lose. Money enters only after they ask — and then as a 3-option menu.` });
      break;
    }
  }
  for (const p of IDENTITY_OPENERS) {
    if (p.test(message.trim())) {
      violations.push({ rule: "no_identity_first_opener", severity: "FAIL", detail: "Message opens with who you are. Nobody cares what you are; they care what you can do for them. Open with THEM (the hook), bridge with proof." });
      break;
    }
  }
  for (const p of WEAK_HOOKS) {
    if (p.test(message)) {
      violations.push({ rule: "specific_hook_required", severity: "FAIL", detail: "Generic flattery detected ('love your brand' / 'big fan'). The hook must reference one specific, real thing only someone who actually looked would know." });
      break;
    }
  }
  for (const p of HARD_ASKS) {
    if (p.test(message)) {
      violations.push({ rule: "soft_ask_only", severity: "FAIL", detail: "Hard ask detected. Cold messages ask for a conversation or permission to send something small — never a hire, a contract, or a long meeting." });
      break;
    }
  }
  if (words > 120) violations.push({ rule: "length", severity: "FAIL", detail: `${words} words. Long cold messages scream desperation. Cut to under ~90 words: 1-2 sentence hook, 1-2 sentence bridge, 1 sentence soft ask.` });
  else if (words > 90) warnings.push({ rule: "length", severity: "WARN", detail: `${words} words — over the ~90-word confidence line. Tighten.` });

  const questionMarks = (message.match(/\?/g) || []).length;
  if (questionMarks > 1) warnings.push({ rule: "single_ask", severity: "WARN", detail: `${questionMarks} questions found. One message, one ask. Multiple asks split attention and lower reply rates.` });
  if (questionMarks === 0) warnings.push({ rule: "missing_soft_ask", severity: "WARN", detail: "No question found. The message should end with a soft ask ('want me to send over [2-3 concepts]?')." });

  if (firstSentence.includes(" i ") || firstSentence.startsWith("i ")) {
    warnings.push({ rule: "hook_about_them", severity: "WARN", detail: "First sentence centers on you. The hook is about THEM — a specific detail you found by looking." });
  }

  const attachmentHints = /\b(attached|resume attached|see attached|portfolio attached)\b/i;
  if (attachmentHints.test(message)) warnings.push({ rule: "no_first_touch_attachments", severity: "WARN", detail: "First-touch attachments read as mass outreach and hurt deliverability. Offer to send the object instead — that IS the soft ask." });

  const verdict = violations.length === 0 ? (warnings.length === 0 ? "PASS" : "PASS_WITH_WARNINGS") : "FAIL";
  return {
    verdict,
    word_count: words,
    violations,
    warnings,
    target_pack_reminder: targetType && TARGET_PACKS[targetType] ? { soft_ask_object: TARGET_PACKS[targetType].soft_ask_object, proof_to_lead_with: TARGET_PACKS[targetType].proof_to_lead_with } : undefined,
    rewrite_recipe: verdict === "FAIL" ? "Rebuild in 3 moves: HOOK (one specific true thing about them, 1-2 sentences) → BRIDGE (your proof point tied to their need, 1-2 sentences) → SOFT ASK (permission to send something small, 1 sentence)." : undefined
  };
}

function detectRedFlags(text: string) {
  const lower = text.toLowerCase();
  const hits = RED_FLAGS.filter(rf => rf.patterns.some(p => lower.includes(p)));
  return {
    red_flags_found: hits.map(h => ({ flag: h.flag, meaning: h.meaning })),
    verdict: hits.length === 0 ? "CLEAN — no walk-away signals detected. Still verify budget matches ask." : hits.length >= 2 ? "WALK — multiple walk-away signals." : "CAUTION — one walk-away signal. Counter once (see reply playbook), then walk if unchanged.",
    reminder: "No reply after all 5 follow-ups is also a red flag: not a fit right now, move on."
  };
}

// =====================================================
// MCP SERVER
// =====================================================
const server = new Server({ name: "outbound-engine-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "structure_cold_pitch",
      description: "Get the HOOK / BRIDGE / SOFT ASK structure plus the 4 swap variables (who to pitch, signal to research, proof to lead with, soft-ask object) for a target type. Target types: brand_deal, ugc, newsletter_sponsorship, job, podcast, client_work.",
      inputSchema: {
        type: "object",
        properties: {
          target_type: { type: "string", enum: Object.keys(TARGET_PACKS) },
          signal_found: { type: "string", description: "Optional: the one specific true thing you found about this target (5 words). If omitted, the response reminds you: no signal, no pitch." }
        },
        required: ["target_type"]
      }
    },
    {
      name: "audit_cold_message",
      description: "Audit a drafted cold message against the engine rules: no money/rates, no identity-first opener, specific hook required, soft ask only, under ~90 words, one ask. Returns PASS/FAIL with named violations and a rewrite recipe.",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string", description: "The full draft cold message text" },
          target_type: { type: "string", enum: Object.keys(TARGET_PACKS), description: "Optional target type for pack-specific reminders" }
        },
        required: ["message"]
      }
    },
    {
      name: "build_followup_ladder",
      description: "Returns the 5-step follow-up ladder (Day 3 bump, Day 7 value-give, Day 12 new proof, Day 18 soft close, Day 25 break-up) with the move and rule for each rung. 80% of deals close in follow-up; the break-up alone pulls ~30% of replies.",
      inputSchema: {
        type: "object",
        properties: {
          target_type: { type: "string", enum: Object.keys(TARGET_PACKS), description: "Optional: contextualizes the soft-ask object in each rung" }
        }
      }
    },
    {
      name: "handle_reply",
      description: "Given the type of reply received, returns what it means, the next move, the reply shape, and the trap to avoid. Reply types: price_question, interested, not_now, no_budget, exposure_offer, spec_request, pay_on_performance, ghosted_after_interest.",
      inputSchema: {
        type: "object",
        properties: { reply_type: { type: "string", enum: Object.keys(REPLY_PLAYBOOK) } },
        required: ["reply_type"]
      }
    },
    {
      name: "build_pricing_menu",
      description: "Returns the 3-option menu structure (Starter / Most Popular / Full), the two scoping questions to ask FIRST for the target type, and the drop-scope-not-price negotiation rule. Use only after the prospect asks about price — never in a cold message.",
      inputSchema: {
        type: "object",
        properties: { target_type: { type: "string", enum: Object.keys(TARGET_PACKS) } },
        required: ["target_type"]
      }
    },
    {
      name: "detect_red_flags",
      description: "Scan a prospect's reply or brief for walk-away signals: exposure-pay, spec-work requests, pay-on-performance, budget mismatch, scope-creep probes. Returns flags found and a CLEAN/CAUTION/WALK verdict.",
      inputSchema: {
        type: "object",
        properties: { text: { type: "string", description: "The prospect's reply or brief text" } },
        required: ["text"]
      }
    },
    {
      name: "get_full_pack",
      description: "Returns the complete engine: core rules, all target packs, follow-up ladder, reply playbook, pricing menu, red flags. Useful for full agent context (e.g. a Claude Project system prompt).",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args as any;
  const wrap = (obj: any) => ({ content: [{ type: "text" as const, text: JSON.stringify({ ...obj, _meta: MCP_META }, null, 2) }] });

  if (name === "structure_cold_pitch") {
    const pack = TARGET_PACKS[a.target_type];
    if (!pack) return wrap({ error: "Unknown target_type. See enum." });
    return wrap({
      target_type: a.target_type,
      one_rule: CORE_RULES.one_rule,
      formula: CORE_RULES.formula,
      length_rule: CORE_RULES.length_rule,
      swap_variables: pack,
      signal_status: a.signal_found
        ? { signal: a.signal_found, instruction: "Compress this to five words. That becomes line one of the hook." }
        : { warning: "No signal provided. " + CORE_RULES.research_rule }
    });
  }

  if (name === "audit_cold_message") {
    if (!a.message || typeof a.message !== "string") return wrap({ error: "Provide the draft message text as 'message'." });
    return wrap(auditMessage(a.message, a.target_type));
  }

  if (name === "build_followup_ladder") {
    const pack = a.target_type ? TARGET_PACKS[a.target_type] : undefined;
    return wrap({
      why: "One pitch and quitting leaves almost half your replies on the table. Each rung adds value; none just say 'bumping this.'",
      ladder: FOLLOWUP_LADDER,
      soft_ask_object: pack ? pack.soft_ask_object : "your target pack's soft-ask object",
      exit_rule: "No reply after all 5: not a fit right now. Move on — that is method, not failure."
    });
  }

  if (name === "handle_reply") {
    const play = REPLY_PLAYBOOK[a.reply_type];
    if (!play) return wrap({ error: "Unknown reply_type. See enum." });
    return wrap({ reply_type: a.reply_type, ...play });
  }

  if (name === "build_pricing_menu") {
    const questions = (PRICING_MENU.scoping_questions_by_target as any)[a.target_type];
    if (!questions) return wrap({ error: "Unknown target_type. See enum." });
    return wrap({
      target_type: a.target_type,
      rule: PRICING_MENU.rule,
      step_1_scoping_questions: questions.filter((q: string) => q),
      step_2_menu_structure: PRICING_MENU.structure,
      anchoring_note: "Most people pick B (~60%). A gives B a floor; C makes B look reasonable.",
      negotiation_rule: PRICING_MENU.negotiation_rule
    });
  }

  if (name === "detect_red_flags") {
    if (!a.text || typeof a.text !== "string") return wrap({ error: "Provide the reply/brief text as 'text'." });
    return wrap(detectRedFlags(a.text));
  }

  if (name === "get_full_pack") {
    return wrap({
      pack: "Outbound Engine MCP — Complete Method v1.0",
      author: "Elisabeth Hitz",
      modules: {
        core_rules: CORE_RULES,
        target_packs: TARGET_PACKS,
        followup_ladder: FOLLOWUP_LADDER,
        reply_playbook: REPLY_PLAYBOOK,
        pricing_menu: PRICING_MENU,
        red_flags: RED_FLAGS.map(r => ({ flag: r.flag, meaning: r.meaning }))
      }
    });
  }

  return wrap({ error: "Unknown tool" });
});

const transport = new StdioServerTransport();
await server.connect(transport);
