import { describe, it, expect } from "vitest";
import {
  FRAMEWORKS,
  FRAMEWORK_IDS,
  FRAMEWORK_BY_ID,
  selectFramework,
} from "../src/frameworks";

describe("framework library", () => {
  it("includes the six Cialdini principles plus reasoning/ideation lenses", () => {
    for (const id of [
      "reciprocity",
      "commitment",
      "social-proof",
      "authority",
      "liking",
      "scarcity",
      "scamper",
      "first-principles",
      "socratic",
    ]) {
      expect(FRAMEWORK_IDS).toContain(id);
    }
  });

  it("every framework has unique id, non-empty fields, and a working wrap()", () => {
    const seen = new Set<string>();
    for (const f of FRAMEWORKS) {
      expect(seen.has(f.id)).toBe(false);
      seen.add(f.id);
      expect(f.name).toBeTruthy();
      expect(f.category).toBeTruthy();
      expect(f.description).toBeTruthy();
      expect(f.signals.length).toBeGreaterThan(0);
      const wrapped = f.wrap("How do I improve my writing?");
      expect(wrapped).toContain("improve my writing");
      expect(wrapped.length).toBeGreaterThan(f.description.length);
    }
  });

  it("wrap() trims surrounding whitespace from the query", () => {
    const out = FRAMEWORK_BY_ID["authority"].wrap("   negotiate my salary   ");
    expect(out).toContain("negotiate my salary");
    expect(out).not.toContain("   negotiate");
  });
});

describe("selectFramework", () => {
  it("picks authority for evidence-seeking queries", () => {
    expect(selectFramework("What does the research evidence say?").framework.id).toBe(
      "authority",
    );
  });

  it("picks scamper for ideation queries", () => {
    expect(selectFramework("brainstorm creative ideas to improve this feature").framework.id).toBe(
      "scamper",
    );
  });

  it("picks scarcity for urgency queries", () => {
    expect(selectFramework("there is an urgent limited deadline").framework.id).toBe("scarcity");
  });

  it("falls back to first-principles for open 'why' questions with no signal", () => {
    expect(selectFramework("why?").framework.id).toBe("first-principles");
  });

  it("falls back to steelman for decision-shaped questions", () => {
    expect(selectFramework("React vs Vue").framework.id).toBe("steelman");
  });

  it("always returns a rationale and a sorted score list", () => {
    const r = selectFramework("how do experts cite credible research");
    expect(r.rationale).toBeTruthy();
    expect(r.scores[0].score).toBeGreaterThanOrEqual(r.scores[1].score);
  });
});
