/**
 * Transport-agnostic MCP JSON-RPC dispatcher for Kairos.
 *
 * MCP messages are plain JSON-RPC 2.0. By dispatching them in one pure function
 * we get a server that runs identically over Streamable HTTP (Cloudflare
 * Workers) and stdio (Claude Desktop / Cursor) — one codebase, many frontends.
 *
 * Stateless by design: every request is self-contained, so the Worker scales
 * horizontally with no session affinity (see Architecture notes in README).
 */

import {
  FRAMEWORKS,
  FRAMEWORK_BY_ID,
  FRAMEWORK_IDS,
  selectFramework,
} from "./frameworks.js";

export const PROTOCOL_VERSION = "2025-06-18";
export const SERVER_INFO = { name: "kairos", version: "1.0.0" } as const;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const LIBRARY_URI = "framework://library";
const frameworkUri = (id: string) => `framework://${id}`;

function ok(id: JsonRpcRequest["id"], result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function err(
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
  data?: unknown,
): JsonRpcResponse {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message, data } };
}

/** Render `apply_*` tool output: framework name, rationale, and framed prompt. */
function toolResult(
  frameworkId: string,
  framedPrompt: string,
  rationale?: string,
) {
  const fw = FRAMEWORK_BY_ID[frameworkId];
  const structured = {
    framework_used: fw.id,
    framework_name: fw.name,
    ...(rationale ? { rationale } : {}),
    framed_prompt: framedPrompt,
  };
  return {
    content: [{ type: "text", text: framedPrompt }],
    structuredContent: structured,
  };
}

const TOOLS = [
  {
    name: "apply_framework",
    description:
      "Wrap a raw query in a specific thinking/persuasion framework and return the framed prompt. Use when you already know which lens you want.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The raw user query to reframe." },
        framework: {
          type: "string",
          enum: FRAMEWORK_IDS,
          description: "Which framework lens to apply.",
        },
      },
      required: ["query", "framework"],
    },
  },
  {
    name: "apply_best_framework",
    description:
      "Analyze a raw query, select the optimal thinking/persuasion framework, and return { framework_used, rationale, framed_prompt }. Use when you want Kairos to pick the lens for you.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The raw user query to reframe." },
      },
      required: ["query"],
    },
  },
];

/**
 * Dispatch a single JSON-RPC message.
 *
 * Returns a JsonRpcResponse for requests (those with an `id`), or `null` for
 * notifications (no `id`), which by spec receive no response body.
 */
export function dispatch(msg: JsonRpcRequest): JsonRpcResponse | null {
  const { method, id, params } = msg;
  const isNotification = id === undefined;

  switch (method) {
    case "initialize":
      return ok(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {}, prompts: {}, resources: {} },
        serverInfo: SERVER_INFO,
        instructions:
          "Kairos reframes raw queries through thinking and persuasion frameworks. " +
          "Call apply_best_framework to let Kairos pick the optimal lens, or apply_framework to choose one yourself.",
      });

    case "notifications/initialized":
    case "notifications/cancelled":
      return null; // notifications: no response

    case "ping":
      return ok(id, {});

    // --- Tools ---
    case "tools/list":
      return ok(id, { tools: TOOLS });

    case "tools/call": {
      const name = params?.name;
      const args = params?.arguments ?? {};

      if (name === "apply_framework") {
        const { query, framework } = args;
        if (typeof query !== "string" || !query.trim()) {
          return err(id, -32602, "Invalid params: 'query' must be a non-empty string.");
        }
        const fw = FRAMEWORK_BY_ID[framework];
        if (!fw) {
          return err(
            id,
            -32602,
            `Unknown framework '${framework}'. Valid ids: ${FRAMEWORK_IDS.join(", ")}.`,
          );
        }
        return ok(id, toolResult(fw.id, fw.wrap(query)));
      }

      if (name === "apply_best_framework") {
        const { query } = args;
        if (typeof query !== "string" || !query.trim()) {
          return err(id, -32602, "Invalid params: 'query' must be a non-empty string.");
        }
        const { framework, rationale } = selectFramework(query);
        return ok(id, toolResult(framework.id, framework.wrap(query), rationale));
      }

      return err(id, -32602, `Unknown tool '${name}'.`);
    }

    // --- Prompts (one entry per framework) ---
    case "prompts/list":
      return ok(id, {
        prompts: FRAMEWORKS.map((f) => ({
          name: f.id,
          title: f.name,
          description: f.description,
          arguments: [
            { name: "query", description: "The raw query to reframe.", required: true },
          ],
        })),
      });

    case "prompts/get": {
      const name = params?.name;
      const fw = FRAMEWORK_BY_ID[name];
      if (!fw) {
        return err(id, -32602, `Unknown prompt '${name}'.`);
      }
      const query = params?.arguments?.query;
      if (typeof query !== "string" || !query.trim()) {
        return err(id, -32602, "Invalid params: 'query' argument is required.");
      }
      return ok(id, {
        description: `${fw.name}: ${fw.description}`,
        messages: [
          {
            role: "user",
            content: { type: "text", text: fw.wrap(query) },
          },
        ],
      });
    }

    // --- Resources (browseable framework library) ---
    case "resources/list":
      return ok(id, {
        resources: [
          {
            uri: LIBRARY_URI,
            name: "Framework Library",
            description: "Full catalogue of Kairos frameworks with descriptions and categories.",
            mimeType: "application/json",
          },
          ...FRAMEWORKS.map((f) => ({
            uri: frameworkUri(f.id),
            name: f.name,
            description: f.description,
            mimeType: "application/json",
          })),
        ],
      });

    case "resources/read": {
      const uri: string = params?.uri ?? "";
      if (uri === LIBRARY_URI) {
        const library = FRAMEWORKS.map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          description: f.description,
        }));
        return ok(id, {
          contents: [
            { uri, mimeType: "application/json", text: JSON.stringify(library, null, 2) },
          ],
        });
      }
      const prefix = "framework://";
      if (uri.startsWith(prefix)) {
        const fw = FRAMEWORK_BY_ID[uri.slice(prefix.length)];
        if (fw) {
          const body = {
            id: fw.id,
            name: fw.name,
            category: fw.category,
            description: fw.description,
            signals: fw.signals,
            example: fw.wrap("How can I improve my presentation skills?"),
          };
          return ok(id, {
            contents: [
              { uri, mimeType: "application/json", text: JSON.stringify(body, null, 2) },
            ],
          });
        }
      }
      return err(id, -32602, `Unknown resource '${uri}'.`);
    }

    default:
      if (isNotification) return null;
      return err(id, -32601, `Method not found: ${method}`);
  }
}
