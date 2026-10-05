#!/usr/bin/env node
// Emails family on game day for Panathinaikos water polo games found on Google Calendar.
// Zero dependencies (Node 18+). See README.md for setup.
//
// Usage:
//   node send-game-day-email.mjs                 # send today's (Pacific date) game emails
//   node send-game-day-email.mjs --dry-run       # print instead of sending
//   node send-game-day-email.mjs --date 2026-10-14 --dry-run
//   node send-game-day-email.mjs --events-file sample.json --date 2026-10-14 --dry-run  (offline test)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = process.env.GAME_EMAIL_CONFIG || join(HERE, "config.json");
const STATE_PATH = join(HERE, "sent-state.json");

const TEAM = "Panathinaikos";
const DISPLAY_TZ = "America/Los_Angeles";

// Title prefix -> competition. Anything else (e.g. "EL:" EuroLeague basketball) is ignored.
export const COMPETITIONS = {
  "WPL:": {
    name: "Greek Water Polo League",
    watchLabel: "Watch live on KOE TV (YouTube → Live)",
    watchUrl: "https://www.youtube.com/@koetv/streams",
  },
  "CL:": {
    name: "European Aquatics Champions League",
    watchLabel: "Watch live on European Aquatics TV",
    watchUrl: "https://www.euroaquaticstv.com/en/home",
  },
};

// Calendar events start 45 min before the listed game time (arrival buffer).
const DEFAULT_GAME_OFFSET_MIN = 45;

// ---------- pure helpers (exported for testing) ----------

export function parseGame(event, offsetMin = DEFAULT_GAME_OFFSET_MIN) {
  const title = (event.summary || "").trim();
  if (!title.toLowerCase().includes(TEAM.toLowerCase())) return null;
  if (event.status === "cancelled") return null;

  const prefix = Object.keys(COMPETITIONS).find((p) => title.startsWith(p));
  if (!prefix) return null;
  if (!event.start?.dateTime) return null; // skip all-day events

  let matchup = title.slice(prefix.length).trim();
  const venueMatch = matchup.match(/\((H|A)\)\s*$/i);
  const homeAway = venueMatch ? (venueMatch[1].toUpperCase() === "H" ? "Home" : "Away") : null;
  matchup = matchup.replace(/\((H|A)\)\s*$/i, "").trim();

  const sides = matchup.split(/\s+vs\.?\s+/i).map((s) => s.trim());
  const opponent =
    sides.find((s) => !s.toLowerCase().includes(TEAM.toLowerCase())) || matchup;

  const gameTime = new Date(new Date(event.start.dateTime).getTime() + offsetMin * 60_000);
  const calEnd = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  const gameEnd = calEnd && calEnd > gameTime ? calEnd : new Date(gameTime.getTime() + 90 * 60_000);

  return {
    id: event.id,
    title,
    competition: COMPETITIONS[prefix],
    opponent,
    homeAway,
    location: event.location || "",
    gameTime,
    gameEnd,
  };
}

// UTC basic format used by Google Calendar links and iCalendar: 20261014T183000Z
function utcStamp(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventTitle(game) {
  return `🤽 Panathinaikos vs ${game.opponent}`;
}

function eventDetails(game) {
  return `${game.competition.name}\n${game.competition.watchLabel}: ${game.competition.watchUrl}`;
}

export function googleCalendarLink(game) {
  return "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(game),
    dates: `${utcStamp(game.gameTime)}/${utcStamp(game.gameEnd)}`,
    details: eventDetails(game),
    location: game.location,
  });
}

function icsEscape(text) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
}

// .ics attachment for Apple Calendar / Outlook users
export function buildIcs(game) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//waterpolo-availability//game-day-email//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${game.id}@game-day-email`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(game.gameTime)}`,
    `DTEND:${utcStamp(game.gameEnd)}`,
    `SUMMARY:${icsEscape(eventTitle(game))}`,
    `DESCRIPTION:${icsEscape(eventDetails(game))}`,
    `LOCATION:${icsEscape(game.location)}`,
    `URL:${game.competition.watchUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].map(foldIcsLine).join("\r\n");
}

// RFC 5545: lines longer than 75 octets continue on the next line with a leading space
function foldIcsLine(line) {
  const chars = [...line];
  const out = [];
  let cur = "";
  for (const ch of chars) {
    if (Buffer.byteLength(cur + ch) > (out.length ? 74 : 75)) { out.push(cur); cur = ""; }
    cur += ch;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function pacificDate(date) {
  // YYYY-MM-DD in Pacific time
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DISPLAY_TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function formatPacific(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TZ, weekday: "long", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: DISPLAY_TZ, hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(date);
}

export function buildEmail(game) {
  const subject = `🤽 Panathinaikos vs ${game.opponent} today at ${formatTime(game.gameTime)}`;
  const lines = [
    `Game day! Panathinaikos plays ${game.opponent} today.`,
    "",
    `Opponent:    ${game.opponent}`,
    `Time:        ${formatPacific(game.gameTime)}`,
    `Competition: ${game.competition.name}`,
  ];
  if (game.homeAway) lines.push(`Venue:       ${game.homeAway}${game.location ? ` (${game.location})` : ""}`);
  lines.push(
    "", `${game.competition.watchLabel}:`, game.competition.watchUrl,
    "", "Add to Google Calendar:", googleCalendarLink(game),
    "(Apple/Outlook: open the attached game.ics)",
    "", "Go PAO! 💚",
  );
  return { subject, body: lines.join("\n"), ics: buildIcs(game) };
}

// ---------- Google APIs ----------

async function getAccessToken(cfg) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: cfg.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`OAuth token refresh failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function fetchEvents(token, calendarId) {
  const now = Date.now();
  const params = new URLSearchParams({
    q: TEAM,
    singleEvents: "true",
    orderBy: "startTime",
    timeMin: new Date(now - 36 * 3600_000).toISOString(),
    timeMax: new Date(now + 48 * 3600_000).toISOString(),
    maxResults: "50",
  });
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(`Calendar fetch failed: ${JSON.stringify(json)}`);
  return json.items || [];
}

function encodeHeader(text) {
  return /[^\x20-\x7e]/.test(text) ? `=?UTF-8?B?${Buffer.from(text).toString("base64")}?=` : text;
}

export function buildMime({ from, to, subject, body, ics }) {
  const boundary = `gameday-${Date.now().toString(36)}`;
  return [
    `From: ${from}`,
    `To: ${from}`,
    `Bcc: ${to.join(", ")}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(body).toString("base64"),
    `--${boundary}`,
    'Content-Type: text/calendar; charset="UTF-8"; method=PUBLISH; name="game.ics"',
    'Content-Disposition: attachment; filename="game.ics"',
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(ics).toString("base64"),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

async function sendEmail(token, email) {
  const mime = buildMime(email);
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: Buffer.from(mime).toString("base64url") }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gmail send failed: ${JSON.stringify(json)}`);
  return json.id;
}

// ---------- main ----------

function parseArgs(argv) {
  const args = { dryRun: false, date: null, eventsFile: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--date") args.date = argv[++i];
    else if (argv[i] === "--events-file") args.eventsFile = argv[++i];
  }
  return args;
}

function loadState() {
  if (!existsSync(STATE_PATH)) return {};
  try { return JSON.parse(readFileSync(STATE_PATH, "utf8")); } catch { return {}; }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const today = args.date || pacificDate(new Date());

  let cfg = {};
  if (existsSync(CONFIG_PATH)) cfg = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  else if (!args.eventsFile) throw new Error(`Missing config: ${CONFIG_PATH} (copy config.example.json)`);

  let token = null;
  let events;
  if (args.eventsFile) {
    const raw = JSON.parse(readFileSync(args.eventsFile, "utf8"));
    events = Array.isArray(raw) ? raw : raw.items || raw.events || [];
  } else {
    token = await getAccessToken(cfg);
    events = await fetchEvents(token, cfg.calendarId || "primary");
  }

  const offset = cfg.gameStartOffsetMinutes ?? DEFAULT_GAME_OFFSET_MIN;
  const games = events
    .map((e) => parseGame(e, offset))
    .filter((g) => g && pacificDate(g.gameTime) === today);

  const state = loadState();
  console.log(`[${new Date().toISOString()}] ${today} (Pacific): ${games.length} game(s)`);

  for (const game of games) {
    const key = `${game.id}:${today}`;
    if (state[key] && !args.dryRun) {
      console.log(`  already sent: ${game.title}`);
      continue;
    }
    const email = buildEmail(game);
    if (args.dryRun) {
      console.log(`\n--- DRY RUN → ${(cfg.recipients || []).join(", ") || "(no recipients)"}`);
      console.log(`Subject: ${email.subject}\n\n${email.body}\n---`);
      continue;
    }
    if (!cfg.recipients?.length) throw new Error("config.recipients is empty");
    const id = await sendEmail(token, { from: cfg.from, to: cfg.recipients, ...email });
    state[key] = { sentAt: new Date().toISOString(), messageId: id, title: game.title };
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
    console.log(`  sent: ${game.title} (${id})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
