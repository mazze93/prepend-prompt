import { describe, it, expect } from "vitest";
import { dispatch, PROTOCOL_VERSION } from "../src/dispatch";

const call = (method: string, params?: any, id: number | string = 1) =>
  dispatch({ jsonrpc: "2.0", id, method, params });

describe("MCP dispatcher", () => {
  it("initialize advertises tools, prompts, and resources", () => {
    const res = call("initialize") as any;
    expect(res.result.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(res.result.capabilities).toHaveProperty("tools");
    expect(res.result.capabilities).toHaveProperty("prompts");
    expect(res.result.capabilities).toHaveProperty("resources");
    expect(res.result.serverInfo.name).toBe("kairos");
  });

  it("treats notifications/initialized as a notification (no response)", () => {
    expect(dispatch({ jsonrpc: "2.0", method: "notifications/initialized" })).toBeNull();
  });

  it("lists both tools", () => {
    const res = call("tools/list") as any;
    const names = res.result.tools.map((t: any) => t.name);
    expect(names).toEqual(["apply_framework", "apply_best_framework"]);
  });

  it("apply_framework returns the framed prompt and structured content", () => {
    const res = call("tools/call", {
      name: "apply_framework",
      arguments: { query: "How do I learn faster?", framework: "socratic" },
    }) as any;
    expect(res.result.structuredContent.framework_used).toBe("socratic");
    expect(res.result.content[0].text).toContain("learn faster");
  });

  it("apply_framework rejects an unknown framework", () => {
    const res = call("tools/call", {
      name: "apply_framework",
      arguments: { query: "x", framework: "nope" },
    }) as any;
    expect(res.error.code).toBe(-32602);
  });

  it("apply_framework rejects an empty query", () => {
    const res = call("tools/call", {
      name: "apply_framework",
      arguments: { query: "   ", framework: "authority" },
    }) as any;
    expect(res.error.code).toBe(-32602);
  });

  it("apply_best_framework selects a lens and reports rationale", () => {
    const res = call("tools/call", {
      name: "apply_best_framework",
      arguments: { query: "brainstorm new product ideas" },
    }) as any;
    expect(res.result.structuredContent.framework_used).toBe("scamper");
    expect(res.result.structuredContent.rationale).toBeTruthy();
    expect(res.result.structuredContent.framed_prompt).toContain("product ideas");
  });

  it("lists one prompt per framework", () => {
    const res = call("prompts/list") as any;
    expect(res.result.prompts.length).toBeGreaterThanOrEqual(9);
    expect(res.result.prompts[0]).toHaveProperty("arguments");
  });

  it("prompts/get returns a user message with the framed text", () => {
    const res = call("prompts/get", {
      name: "scarcity",
      arguments: { query: "should I act now" },
    }) as any;
    expect(res.result.messages[0].role).toBe("user");
    expect(res.result.messages[0].content.text).toContain("act now");
  });

  it("lists the library resource plus one per framework", () => {
    const res = call("resources/list") as any;
    const uris = res.result.resources.map((r: any) => r.uri);
    expect(uris).toContain("framework://library");
    expect(uris).toContain("framework://first-principles");
  });

  it("reads the framework library as JSON", () => {
    const res = call("resources/read", { uri: "framework://library" }) as any;
    const parsed = JSON.parse(res.result.contents[0].text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty("id");
    expect(parsed[0]).toHaveProperty("category");
  });

  it("reads an individual framework resource with an example", () => {
    const res = call("resources/read", { uri: "framework://inversion" }) as any;
    const parsed = JSON.parse(res.result.contents[0].text);
    expect(parsed.id).toBe("inversion");
    expect(parsed.example).toBeTruthy();
  });

  it("returns method-not-found for unknown methods", () => {
    const res = call("does/not/exist") as any;
    expect(res.error.code).toBe(-32601);
  });
});
