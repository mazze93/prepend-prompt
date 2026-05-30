#!/usr/bin/env node
/**
 * Kairos — local MCP server over stdio for Claude Desktop, Cursor, and any
 * stdio-based MCP host. Shares the exact same dispatcher as the Worker.
 *
 * Reads newline-delimited JSON-RPC messages from stdin, writes responses to
 * stdout. Notifications produce no output, per the MCP spec.
 */

import { createInterface } from "node:readline";
import { dispatch, JsonRpcRequest } from "./dispatch.js";

const rl = createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg: JsonRpcRequest;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    process.stdout.write(
      JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n",
    );
    return;
  }

  const response = dispatch(msg);
  if (response !== null) {
    process.stdout.write(JSON.stringify(response) + "\n");
  }
});
