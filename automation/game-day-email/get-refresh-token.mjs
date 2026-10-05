#!/usr/bin/env node
// One-time helper: authorizes Calendar (read-only) + Gmail (send) and prints a refresh token.
// Usage: node get-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>

import { createServer } from "node:http";
import { exec } from "node:child_process";

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.error("Usage: node get-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>");
  process.exit(1);
}

const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}`;
const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
  });

const server = createServer(async (req, res) => {
  const code = new URL(req.url, REDIRECT).searchParams.get("code");
  if (!code) { res.end("No code"); return; }
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: REDIRECT, grant_type: "authorization_code",
    }),
  });
  const json = await tokenRes.json();
  res.end(json.refresh_token ? "Done — return to the terminal." : "Failed — see terminal.");
  if (json.refresh_token) console.log(`\nrefreshToken:\n${json.refresh_token}\n`);
  else console.error(json);
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Opening browser to authorize...\n${authUrl}\n`);
  exec(`open "${authUrl}"`);
});
