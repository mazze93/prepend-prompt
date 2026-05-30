/**
 * Kairos — remote MCP server over Streamable HTTP on Cloudflare Workers.
 *
 * Stateless: each POST carries a complete JSON-RPC message and gets a complete
 * JSON-RPC response. No session store, no Durable Objects — horizontally
 * scalable on the Workers free tier.
 *
 * Endpoint: POST /mcp   (also accepts POST / for convenience)
 */

import { dispatch, JsonRpcRequest, SERVER_INFO } from "./dispatch.js";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Session-Id, MCP-Protocol-Version",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Lightweight landing / health page.
    if (request.method === "GET" && url.pathname === "/") {
      return json({
        server: SERVER_INFO,
        transport: "streamable-http",
        endpoint: "/mcp",
        docs: "https://github.com/mazze93/prepend-prompt#readme",
      });
    }

    const isMcpPath = url.pathname === "/mcp" || url.pathname === "/";

    if (request.method === "GET" && isMcpPath) {
      // Stateless mode: no server-initiated SSE stream to open.
      return json(
        { jsonrpc: "2.0", id: null, error: { code: -32000, message: "Method Not Allowed: this stateless server only accepts POST." } },
        405,
      );
    }

    if (request.method !== "POST" || !isMcpPath) {
      return json({ error: "Not found" }, 404);
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return json(
        { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
        400,
      );
    }

    // The spec permits a single message; handle arrays defensively too.
    if (Array.isArray(payload)) {
      const responses = payload
        .map((m) => dispatch(m as JsonRpcRequest))
        .filter((r): r is NonNullable<typeof r> => r !== null);
      return responses.length === 0 ? new Response(null, { status: 202, headers: CORS_HEADERS }) : json(responses);
    }

    const response = dispatch(payload as JsonRpcRequest);
    if (response === null) {
      // Notification: acknowledge with 202 and no body.
      return new Response(null, { status: 202, headers: CORS_HEADERS });
    }
    return json(response);
  },
};
