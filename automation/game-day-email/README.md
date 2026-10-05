# Game-day family email

At 7:00 AM each day (Mac mini local time), this job checks Google Calendar for Panathinaikos
water polo games on that date (Pacific time) and emails the family from dwoodhead3@gmail.com.

- Matches events whose title starts with `WPL:` (Greek league) or `CL:` (Champions League) and contains "Panathinaikos". `EL:` (EuroLeague basketball) is ignored.
- Game time = calendar start + 45 min (the calendar holds a 45-minute buffer), shown in Pacific time.
- Watch links: WPL → KOE TV on YouTube (Live tab), CL → European Aquatics TV.
- Each email has an "Add to Google Calendar" link and a `game.ics` attachment for Apple Calendar or Outlook.
- Recipients go in Bcc. `sent-state.json` prevents duplicate sends.

## Setup on the Mac mini

1. **Google Cloud OAuth client** (one time, at console.cloud.google.com):
   - Create a project and enable the **Google Calendar API** and the **Gmail API**.
   - OAuth consent screen: External, add dwoodhead3@gmail.com as a test user, then **Publish app** (set it to "In production"). In "Testing" mode, refresh tokens expire after 7 days.
   - Credentials → Create OAuth client ID → **Desktop app**. Note the client ID and secret.
2. **Get a refresh token:**
   ```sh
   cd automation/game-day-email
   node get-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>
   ```
   Approve in the browser. Google will show an "unverified app" warning; continue anyway.
3. **Config:** `cp config.example.json config.json`, then fill in the recipients, client ID/secret and refresh token. (`config.json` is gitignored.)
4. **Test:**
   ```sh
   node send-game-day-email.mjs --date 2026-10-14 --dry-run
   ```
5. **Schedule:**
   ```sh
   sed -e "s|__REPO__|$(cd ../.. && pwd)|" -e "s|__NODE__|$(which node)|" \
     com.dwoodhead.gameday-email.plist > ~/Library/LaunchAgents/com.dwoodhead.gameday-email.plist
   launchctl load ~/Library/LaunchAgents/com.dwoodhead.gameday-email.plist
   ```
   Logs are written to `/tmp/gameday-email.log`. If the Mac is asleep at 7:00, launchd runs the job when it wakes.
