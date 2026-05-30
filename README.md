# Kairos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Kairos** (καιρός) — *the opportune moment.* The right lens, applied at the right time, turns an ordinary question into a sharp one.

Kairos is a **Model Context Protocol (MCP) server** that reframes raw queries through proven thinking and persuasion frameworks — Cialdini's principles of influence, SCAMPER, First Principles, the Socratic method, and more. It exposes each framework as an MCP prompt, ships two tools for applying them, and publishes a browseable framework library as MCP resources.

Its differentiator is **framework-selection-as-a-tool**: `apply_best_framework` analyzes a query's intent and picks the optimal lens *before* framing it.

> Kairos began life as *Prepend Prompt*, an iOS Shortcut that wrapped queries in Cialdini templates. It has since grown into a protocol-native MCP server so the same lenses work in Claude Desktop, Cursor, and any MCP host — with the Shortcut as one thin client among many.

## Table of Contents

- [Why an MCP server](#why-an-mcp-server)
- [Architecture](#architecture)
- [Frameworks](#frameworks)
- [Tools](#tools)
- [Prompts & Resources](#prompts--resources)
- [Quick Start](#quick-start)
- [Deploy to Cloudflare Workers](#deploy-to-cloudflare-workers)
- [Use with Claude Desktop / Cursor (stdio)](#use-with-claude-desktop--cursor-stdio)
- [iOS Shortcut (thin client)](#ios-shortcut-thin-client)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

## Why an MCP server

|                 | Browser Extension / Shortcut | MCP Server (Kairos)                         |
| --------------- | ---------------------------- | ------------------------------------------- |
| Delivery layer  | DOM injection (fragile)      | Protocol-native (stable)                    |
| Model awareness | Zero — it just sees a string | Sees tools + can self-select the lens       |
| Client support  | One UI only                  | Claude Desktop, Cursor, any MCP host        |
| Composability   | None                         | Chains with web search, file context, etc.  |
| Maintenance     | Breaks on UI changes         | Protocol-versioned                          |

## Architecture

```
Kairos MCP Server (TypeScript)
├── prompts/      ← one entry per framework (Cialdini, SCAMPER, First Principles, Socratic, …)
├── tools/
│   ├── apply_framework(query, framework)   ← explicit invocation
│   └── apply_best_framework(query)         ← Kairos selects the optimal lens
└── resources/
    └── framework://library                 ← browseable list + descriptions
```

The protocol logic lives in a single **transport-agnostic dispatcher** (`src/dispatch.ts`) — MCP messages are plain JSON-RPC 2.0, so the same code serves two frontends:

- **`src/worker.ts`** — a remote server over **Streamable HTTP on Cloudflare Workers**. Stateless: every request is self-contained, so it scales horizontally on the free tier with no session store or Durable Objects.
- **`src/stdio.ts`** — a local stdio server for Claude Desktop, Cursor, and other stdio MCP hosts.

The framework engine (`src/frameworks.ts`) is pure data + `wrap()` functions, making the whole library trivially testable and portable.

## Frameworks

| Category               | Frameworks |
| ---------------------- | ---------- |
| Persuasion (Cialdini)  | Reciprocity · Commitment & Consistency · Social Proof · Authority · Liking · Scarcity |
| Reasoning              | First Principles · Socratic Method · Inversion · Second-Order Thinking · Pre-Mortem · Steelman |
| Ideation               | SCAMPER |

Browse the live catalogue any time via the `framework://library` resource.

## Tools

### `apply_framework(query, framework)`
Wrap a query in a specific lens. Returns the framed prompt as text plus structured content `{ framework_used, framework_name, framed_prompt }`.

### `apply_best_framework(query)`
Kairos analyzes the query and selects the optimal lens, returning `{ framework_used, framework_name, rationale, framed_prompt }`. The selector scores each framework by intent signals in the query, with sensible fallbacks (open *why* → First Principles, decisions → Steelman, otherwise Socratic). A host with a model can always override by calling `apply_framework` directly.

**Example**

```jsonc
// apply_best_framework({ query: "How do I convince my team to adopt this proven approach everyone is using?" })
{
  "framework_used": "social-proof",
  "framework_name": "Social Proof",
  "rationale": "\"Social Proof\" matched on: everyone, proven.",
  "framed_prompt": "Context: Many people in a similar situation have already solved this.\nRequest: How do I convince my team to adopt this proven approach everyone is using?\nInstruction: Ground the answer in what comparable, credible others actually do, …"
}
```

## Prompts & Resources

- **Prompts** — every framework is registered as an MCP prompt (`prompts/list`, `prompts/get`) taking a single `query` argument, so hosts can surface them as slash-commands.
- **Resources** — `framework://library` returns the full catalogue as JSON; each `framework://<id>` returns that lens's metadata, signals, and a worked example.

## Quick Start

```bash
npm install
npm test          # 22 tests across the engine and dispatcher
npm run build     # compile TypeScript to dist/
```

Smoke-test the stdio server:

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"apply_best_framework","arguments":{"query":"brainstorm new product ideas"}}}' \
  | node dist/stdio.js
```

## Deploy to Cloudflare Workers

```bash
npm run dev       # wrangler dev — local Streamable HTTP at http://localhost:8787/mcp
npm run deploy    # wrangler deploy — publish the remote MCP server
```

Point any Streamable-HTTP MCP client at `https://<your-worker>.workers.dev/mcp`. A `GET /` returns a small health/landing payload.

## Use with Claude Desktop / Cursor (stdio)

After `npm run build`, add to your MCP host config (Claude Desktop's `claude_desktop_config.json` shown):

```jsonc
{
  "mcpServers": {
    "kairos": {
      "command": "node",
      "args": ["/absolute/path/to/kairos/dist/stdio.js"]
    }
  }
}
```

## iOS Shortcut (thin client)

The original Prepend Prompt Shortcut lives on as a thin client: instead of embedding templates, it sends the user's query to the deployed Worker's `apply_best_framework` tool and pastes back `framed_prompt`. One codebase, multiple frontends.

A minimal Shortcut:
1. **Ask for Input** → text (the query).
2. **Get Contents of URL** → `POST https://<your-worker>.workers.dev/mcp`, header `Content-Type: application/json`, body:
   `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"apply_best_framework","arguments":{"query":"[Provided Input]"}}}`
3. **Get Dictionary Value** → `result.structuredContent.framed_prompt`.
4. Hand the framed prompt to your AI client of choice.

## Development

| Command            | Purpose                              |
| ------------------ | ------------------------------------ |
| `npm test`         | Run the Vitest suite                 |
| `npm run typecheck`| Type-check without emitting          |
| `npm run build`    | Compile to `dist/`                   |
| `npm run dev`      | Local Worker via Wrangler            |
| `npm run deploy`   | Deploy the Worker                    |

**Adding a framework:** append one entry to `FRAMEWORKS` in `src/frameworks.ts` (id, name, category, description, `signals`, `wrap`). It automatically appears as a prompt, a resource, an `apply_framework` option, and an `apply_best_framework` candidate — no other wiring needed.

## Contributing

Contributions welcome — new frameworks, sharper selection signals, better templates, and docs. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

## References

- Cialdini, R. B. (2006). *Influence: The Psychology of Persuasion*. Harper Business.
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) · [Streamable HTTP transport](https://modelcontextprotocol.io/specification)

---

**Note**: Kairos is designed for ethical use — to think more clearly and communicate more effectively. Persuasion frameworks are tools for honest, mutually beneficial communication, not manipulation.
