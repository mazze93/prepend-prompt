/**
 * Kairos framework library.
 *
 * A "framework" is a thinking/persuasion lens that wraps a raw user query in a
 * structured prompt. Each entry is pure data + a `wrap()` function so the whole
 * registry is trivially testable and runs unchanged on Cloudflare Workers,
 * Node, or any other JS runtime.
 *
 * Kairos (καιρός): the opportune moment — the right lens, applied at the right
 * time, turns an ordinary question into a sharp one.
 */

export interface Framework {
  /** Stable id used in tool args, prompt names, and resource URIs. */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Grouping for browsing (e.g. "Persuasion", "Reasoning", "Ideation"). */
  category: string;
  /** One-line description shown in listings. */
  description: string;
  /**
   * Signal words / intents that hint this lens fits a query. Used by the
   * `apply_best_framework` selector. Lowercase.
   */
  signals: string[];
  /** Wrap a raw query in this framework's structured template. */
  wrap: (query: string) => string;
}

const q = (query: string) => query.trim();

export const FRAMEWORKS: Framework[] = [
  // --- Cialdini's six principles of influence (ported from Prepend Prompt) ---
  {
    id: "reciprocity",
    name: "Reciprocity",
    category: "Persuasion (Cialdini)",
    description: "Frame the request around mutual value exchange and giving first.",
    signals: ["persuade", "ask", "favor", "negotiate", "convince", "request", "buy-in"],
    wrap: (query) =>
      `Context: I value your expertise and want to build a genuine exchange of insight.\n` +
      `Request: In the spirit of reciprocity, ${q(query)} I'll share back what I learn so the value flows both ways.\n` +
      `Instruction: Lead with what you can offer me, then frame the ask so the other party feels the exchange is fair.`,
  },
  {
    id: "commitment",
    name: "Commitment & Consistency",
    category: "Persuasion (Cialdini)",
    description: "Anchor on prior commitments so the next step feels consistent.",
    signals: ["habit", "follow through", "consistency", "commit", "stick", "goal", "discipline"],
    wrap: (query) =>
      `Context: I've already taken small steps toward this and want to stay consistent with that direction.\n` +
      `Request: ${q(query)}\n` +
      `Instruction: Connect the answer to commitments I've likely already made, and frame each step as a natural continuation of who I've shown I am.`,
  },
  {
    id: "social-proof",
    name: "Social Proof",
    category: "Persuasion (Cialdini)",
    description: "Leverage consensus and what comparable others successfully do.",
    signals: ["popular", "everyone", "others", "trend", "common", "proven", "best practice", "what do people"],
    wrap: (query) =>
      `Context: Many people in a similar situation have already solved this.\n` +
      `Request: ${q(query)}\n` +
      `Instruction: Ground the answer in what comparable, credible others actually do, and surface the consensus pattern before the edge cases.`,
  },
  {
    id: "authority",
    name: "Authority",
    category: "Persuasion (Cialdini)",
    description: "Establish expertise and cite credible, authoritative sources.",
    signals: ["expert", "research", "evidence", "credible", "authoritative", "study", "cite", "scientific"],
    wrap: (query) =>
      `Context: Drawing on established research and recognized expertise in this domain.\n` +
      `Request: ${q(query)}\n` +
      `Instruction: Answer as a domain expert. Cite authoritative sources or principles, and distinguish settled consensus from your own inference.`,
  },
  {
    id: "liking",
    name: "Liking",
    category: "Persuasion (Cialdini)",
    description: "Build rapport, find common ground, and frame warmly.",
    signals: ["relationship", "rapport", "connect", "friendly", "team", "collaborate", "win over"],
    wrap: (query) =>
      `Context: I want to approach this warmly and find genuine common ground.\n` +
      `Request: ${q(query)}\n` +
      `Instruction: Frame the answer around shared goals and authentic rapport. Highlight similarities and sincere compliments before any ask.`,
  },
  {
    id: "scarcity",
    name: "Scarcity",
    category: "Persuasion (Cialdini)",
    description: "Emphasize what is rare, time-bound, or uniquely at stake.",
    signals: ["urgent", "limited", "deadline", "rare", "now", "miss out", "exclusive", "opportunity"],
    wrap: (query) =>
      `Context: This involves something genuinely limited — in time, availability, or opportunity.\n` +
      `Request: ${q(query)}\n` +
      `Instruction: Make the real stakes of inaction and the unique window concrete and honest. Avoid manufactured urgency; emphasize what is actually at risk of being lost.`,
  },

  // --- Reasoning lenses ---
  {
    id: "first-principles",
    name: "First Principles",
    category: "Reasoning",
    description: "Strip a problem to fundamental truths and rebuild from scratch.",
    signals: ["why", "fundamental", "from scratch", "rethink", "assumption", "physics", "ground up", "root"],
    wrap: (query) =>
      `Apply first-principles reasoning to the following.\n\n` +
      `Query: ${q(query)}\n\n` +
      `1. List the assumptions baked into how this is usually framed.\n` +
      `2. Reduce to the fundamental truths that are undeniably so.\n` +
      `3. Reason up from only those fundamentals to a fresh answer, ignoring convention.`,
  },
  {
    id: "socratic",
    name: "Socratic Method",
    category: "Reasoning",
    description: "Interrogate the question with probing questions before answering.",
    signals: ["understand", "clarify", "learn", "think through", "examine", "question", "explore", "deepen"],
    wrap: (query) =>
      `Use the Socratic method on the following.\n\n` +
      `Query: ${q(query)}\n\n` +
      `Before answering, pose the 3-5 sharpest questions that expose hidden assumptions, definitions, and evidence. ` +
      `Then work through those questions to reach a reasoned answer.`,
  },
  {
    id: "inversion",
    name: "Inversion",
    category: "Reasoning",
    description: "Solve forward by first asking how to guarantee failure.",
    signals: ["avoid", "fail", "risk", "what could go wrong", "prevent", "mistake", "pitfall"],
    wrap: (query) =>
      `Apply inversion to the following.\n\n` +
      `Query: ${q(query)}\n\n` +
      `First answer the inverse: what would reliably cause this to fail or go badly? ` +
      `Enumerate those failure modes, then invert each into a concrete thing to do or avoid.`,
  },
  {
    id: "second-order",
    name: "Second-Order Thinking",
    category: "Reasoning",
    description: "Trace consequences beyond the immediate, asking 'and then what?'",
    signals: ["consequence", "long term", "impact", "downstream", "trade-off", "side effect", "then what"],
    wrap: (query) =>
      `Apply second-order thinking to the following.\n\n` +
      `Query: ${q(query)}\n\n` +
      `For each plausible answer, trace consequences across three horizons — immediate, then the reactions to that, then the system-level effects. ` +
      `Ask "and then what?" at each step and weigh the trade-offs that only appear later.`,
  },
  {
    id: "pre-mortem",
    name: "Pre-Mortem",
    category: "Reasoning",
    description: "Imagine the plan already failed, then work backward to causes.",
    signals: ["plan", "launch", "project", "decision", "strategy", "before we", "de-risk"],
    wrap: (query) =>
      `Run a pre-mortem on the following.\n\n` +
      `Query: ${q(query)}\n\n` +
      `Assume it's months from now and this has clearly failed. Narrate the most likely story of how it went wrong, ` +
      `identify the root causes, and recommend the safeguards to put in place today.`,
  },

  // --- Ideation lenses ---
  {
    id: "scamper",
    name: "SCAMPER",
    category: "Ideation",
    description: "Generate options via Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse.",
    signals: ["idea", "brainstorm", "improve", "innovate", "creative", "redesign", "alternative", "feature"],
    wrap: (query) =>
      `Apply the SCAMPER framework to the following.\n\n` +
      `Subject: ${q(query)}\n\n` +
      `Generate concrete ideas under each lens:\n` +
      `- Substitute: what part could be swapped?\n` +
      `- Combine: what could be merged?\n` +
      `- Adapt: what could be borrowed from elsewhere?\n` +
      `- Modify/Magnify: what could be scaled or reshaped?\n` +
      `- Put to other use: where else could this apply?\n` +
      `- Eliminate: what could be removed?\n` +
      `- Reverse: what could be inverted or reordered?`,
  },
  {
    id: "steelman",
    name: "Steelman",
    category: "Reasoning",
    description: "Construct the strongest possible version of opposing views before judging.",
    signals: ["debate", "argue", "opposing", "disagree", "counter", "both sides", "objection", "critique"],
    wrap: (query) =>
      `Steelman the following before reaching a conclusion.\n\n` +
      `Query: ${q(query)}\n\n` +
      `Build the strongest, most charitable version of each opposing position — stronger than its own advocates usually state it. ` +
      `Only after both steelmen are on the table, weigh them and give your reasoned view.`,
  },
];

/** Map of id -> framework for O(1) lookup. */
export const FRAMEWORK_BY_ID: Record<string, Framework> = Object.fromEntries(
  FRAMEWORKS.map((f) => [f.id, f]),
);

/** All valid framework ids. */
export const FRAMEWORK_IDS = FRAMEWORKS.map((f) => f.id);

export interface SelectionResult {
  framework: Framework;
  /** Why this lens was chosen — useful for transparency in tool output. */
  rationale: string;
  /** All scored candidates, highest first (for debugging / tie inspection). */
  scores: { id: string; score: number }[];
}

/**
 * Select the optimal framework for a raw query.
 *
 * This is Kairos's differentiator: framework-selection-as-a-tool. The heuristic
 * scores each lens by how many of its signal phrases appear in the query, with
 * a light bias toward reasoning lenses for open-ended "how/why/should"
 * questions. It is intentionally simple, transparent, and dependency-free; an
 * MCP host with a model can always call `apply_framework` directly to override.
 */
export function selectFramework(rawQuery: string): SelectionResult {
  const query = rawQuery.toLowerCase();

  const scores = FRAMEWORKS.map((f) => {
    let score = 0;
    for (const signal of f.signals) {
      if (query.includes(signal)) score += 2;
    }
    return { id: f.id, score };
  }).sort((a, b) => b.score - a.score);

  let chosen = FRAMEWORK_BY_ID[scores[0].id];
  let rationale: string;

  if (scores[0].score === 0) {
    // No signal matched. Fall back by question shape.
    if (/\bwhy\b/.test(query)) {
      chosen = FRAMEWORK_BY_ID["first-principles"];
      rationale = `No strong signal matched; "${chosen.name}" chosen as the default lens for open "why" questions.`;
    } else if (/\bshould\b|\bvs\.?\b|\bor\b/.test(query)) {
      chosen = FRAMEWORK_BY_ID["steelman"];
      rationale = `No strong signal matched; "${chosen.name}" chosen for a decision/comparison-shaped question.`;
    } else {
      chosen = FRAMEWORK_BY_ID["socratic"];
      rationale = `No strong signal matched; "${chosen.name}" chosen as the safe default to clarify intent first.`;
    }
  } else {
    const matched = chosen.signals.filter((s) => query.includes(s));
    rationale = `"${chosen.name}" matched on: ${matched.join(", ")}.`;
  }

  return { framework: chosen, rationale, scores };
}
