# Deployment

> **22 November 2026 domain migration (Pi live):** `shanmukhan.com` is retired. SparkCards is now live at **`https://sparkcards.lahari.org`** (`200`, valid Let's Encrypt cert, `sparkcards.shanmukhan.com.conf` disabled and its cert deleted). The docroot `/var/www/sparkcards` is unchanged. Historical `sparkcards.shanmukhan.com` references below reflect the prior setup.

SparkCards is deployed as a static site on a Raspberry Pi (`lipi@192.168.1.13`), served by Apache, reachable at **https://sparkcards.shanmukhan.com**. There is no backend/server process for the app itself — Apache just serves the built `dist/` files.

> **Update (2026-09-03, later same day):** SparkCards moved off `shanmukhan.com`'s root to its own subdomain, **`sparkcards.shanmukhan.com`** — `shanmukhan.com`'s root now serves a multi-product landing page (source: `rpi-setup/scripts/site-content/shanmukhan/index.html`) that links out to every product, this one included. Vhost creation is now `rpi-setup/scripts/configure-sparkcards.sh`'s job (was `configure-shanmukhan-vhost.sh`); config file is `/etc/apache2/sites-available/sparkcards.shanmukhan.com.conf`, its own Let's Encrypt cert (not shared with `shanmukhan.com`'s). The document root itself is unchanged (`/var/www/sparkcards`), and this subdomain needs its own DNS A record at the registrar (a `shanmukhan.com` A record doesn't cover subdomains — see `rpi-setup/docs/02-dns-and-domain.md`). See `rpi-setup/docs/14-app-deployment.md` for the full current shape.

> **Update (2026-09-03):** the Pi was wiped and reimaged (Ubuntu → Raspberry Pi OS) — see `rpi-monitor/docs/PI_INVESTIGATION.md`. The document root moved to **`/var/www/sparkcards`** (was `/var/www/html/sparkcards`), matching the convention used by `rpi-setup`'s `configure-shanmukhan-vhost.sh` (superseded by `configure-sparkcards.sh` later the same day — see the update above), which now owns creating this vhost (see `~/Developer/repo/rpi-setup/scripts/`) instead of the manually-maintained `deploy-sparkcards.sh` described below — that script no longer exists on the fresh Pi and hasn't been recreated; a one-off `rsync` + manual `sudo rsync`/`chown` was used instead for this rebuild's initial deploy. **Live again as of this rebuild**: `curl -I https://shanmukhan.com/` and `https://www.shanmukhan.com/` both `200` (this was before the subdomain move above). Two real bugs hit and fixed along the way, not just "content missing": (1) `npm run build` failed on a genuinely dead `BAND_ORDER` const in `src/store/gameStore.ts` — removed after confirming zero references anywhere in the repo; (2) `configure-shanmukhan-vhost.sh`'s template was missing `ServerAlias www.shanmukhan.com`, so `www.shanmukhan.com` served the *wrong* certificate (fell through to a different vhost's) until fixed — see `rpi-monitor/docs/PI_INVESTIGATION.md`'s "Full site inventory" entry for the full writeup. The "Full app deploy"/"Content-only refresh" steps below still describe the *previous* box's `deploy-sparkcards.sh`-based process and haven't been re-verified against the new one yet — recreating that script (rsync + chown against `/var/www/sparkcards`, no vhost-writing since that's `configure-sparkcards.sh`'s job now) is the next step if ongoing content updates are needed.

## Infrastructure overview

| Piece | Value |
|---|---|
| Host | Raspberry Pi, `lipi@192.168.1.13` (LAN), SSH key auth already set up |
| Web server | Apache2 |
| Document root for this app | `/var/www/sparkcards` (unchanged since the 2026-09-03 rebuild — was `/var/www/html/sparkcards` before that) |
| Vhost config | `/etc/apache2/sites-available/sparkcards.shanmukhan.com.conf`, written by `rpi-setup/scripts/configure-sparkcards.sh` (single combined `:80`/`:443` file, not a separate certbot-managed `-le-ssl.conf`) |
| Domain | `sparkcards.shanmukhan.com`, DNS on GoDaddy (its own A record, subdomain of `shanmukhan.com`), → the Pi's public IP |
| TLS | Let's Encrypt via `certbot --apache`, auto-renews via certbot's systemd timer |
| Other sites on this Pi | `shanmukhan.com` (now the products landing page + `rpi-monitor`, proxied under `/monitor/`), `ellieeats.in`, `vaultzero.in`, `nirvana.shanmukhan.com`, `nexalink.shanmukhan.com` — separate, unrelated vhosts. Deployment steps below never touch any of them. |

The Pi has **no NOPASSWD sudo** for the `lipi` user, so every step that needs root (moving files into `/var/www`, editing Apache config, reloading Apache) has to be run interactively on the Pi with `sudo`, by you — it can't be scripted end-to-end from this machine over a plain SSH command.

## Two kinds of deploy

There are two very different operations, and mixing them up wastes time:

1. **Full app deploy** — the JS/CSS bundle changed (new component, new game logic, a `git pull` of real code changes). Needs a rebuild and copying the whole `dist/` folder into place.
2. **Content-only refresh** — you only added/edited cards in `src/data/*.ts`. Thanks to the runtime content-refresh mechanism (see below), this only requires pushing one JSON file — no rebuild of the app bundle, no Apache reload needed.

### Full app deploy

Run from your local machine (in the `sparkcards` repo):

```bash
npm run build                 # also regenerates public/cards.json — see below
rsync -az dist/ lipi@192.168.1.13:/home/lipi/sparkcards-dist/
```

Then on the Pi (needs your sudo password, so this step is manual):

```bash
ssh lipi@192.168.1.13
sudo bash /home/lipi/deploy-sparkcards.sh
```

`deploy-sparkcards.sh` (previously at `/home/lipi/deploy-sparkcards.sh` on the old box — **does not exist on the fresh Pi as of the 2026-09-03 rebuild**, needs recreating) did the parts that need root:
- `rsync`s `/home/lipi/sparkcards-dist/` into `/var/www/sparkcards/` (with `--delete`, so removed files get cleaned up too)
- `chown -R www-data:www-data` on the document root

Vhost creation itself is no longer this script's job — `rpi-setup/scripts/configure-sparkcards.sh` owns that now (see the updated "First-time setup reference" below). A recreated `deploy-sparkcards.sh` should just do the rsync + chown against `/var/www/sparkcards/`.

It's idempotent — safe to re-run every time you do a full deploy.

### Content-only refresh (adding/editing cards)

This is the common case for ongoing content work — see [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) for how the runtime refresh actually works under the hood. The short version:

```bash
# after editing src/data/<subject>.ts
./scripts/deploy-cards.sh
```

This one script:
1. Runs `npm run generate:cards` to rebuild `public/cards.json` from the current `.ts` card files (with validation — it throws if any card is missing a field, has the wrong number of choices, or an out-of-range `answerIndex`).
2. `scp`s just that file to the Pi.
3. `sudo cp`s it into `/var/www/sparkcards/cards.json` and fixes ownership.

No `npm run build`, no Apache reload, no touching the JS bundle. Players get the new cards the next time they load the page (see "How the auto-refresh works" below for exactly when).

`scripts/deploy-cards.sh` does still shell out to `sudo` on the Pi for the final `cp`/`chown`, so it will prompt for your password interactively — it's meant to be run by you from a terminal, not unattended.

## How the auto-refresh actually works

This is the mechanism that makes "update content monthly without redeploying the app" possible. Three pieces:

1. **`public/cards.json`** — generated by `scripts/generate-cards-json.mjs` from the `ALL_CARDS` data in `src/data/*.ts`. Vite copies anything in `public/` verbatim into `dist/`, so it ends up served at `https://sparkcards.shanmukhan.com/cards.json`, same-origin, no extra Apache config needed.
2. **`src/data/cards.ts`** exports `ALL_CARDS` as a genuinely mutable array (not reassigned, mutated via `.length = 0; .push(...)`), plus a `replaceAllCards()` helper. Every other module (`session.ts`, `CollectionScreen.tsx`, etc.) imports this same array reference, so swapping its contents updates the whole app without needing those modules to re-fetch anything themselves.
3. **`src/data/remoteContent.ts`**'s `refreshCardsFromRemote()` runs once, in a `useEffect` in `App.tsx`, on every app load:
   - Fetches `/cards.json` with a 4-second timeout (`cache: 'no-store'`, so it never serves a stale browser-cached copy).
   - Validates every card in the response (correct `subject`/`band`/`rarity` enum values, exactly 4 choices, `answerIndex` in range, all required string fields present) and requires at least 20 valid cards — a near-empty or malformed file is rejected rather than replacing the whole card pool with garbage.
   - On success: replaces `ALL_CARDS` with the fetched cards, and caches them to `localStorage` (`sparkcards:cached-cards:v1`).
   - On failure (Pi unreachable, request timed out, bad JSON): falls back to the last cached successful fetch in `localStorage`, if any; otherwise the bundled cards already in `ALL_CARDS` from the build are used as-is.
   - Either way, the app never blocks on this — it renders immediately with bundled content, then swaps in fresher content once the fetch resolves (a state bump in `App.tsx` triggers the re-render).

**Practical effect:** the app is offline-first (works with zero network the moment it's loaded, using whatever content shipped in the last build), but online it self-updates from `cards.json` on every load — so a monthly `./scripts/deploy-cards.sh` reaches every returning player without them reinstalling or you rebuilding anything.

**When a full deploy is required instead:** adding a *new subject* (needs a code change to `SUBJECT_INFO` in `src/data/types.ts` — the JSON alone can't invent a new subject's label/emoji/color), or any change to game logic/UI. Pure question/answer/explanation edits to existing subjects only need the content-only refresh.

## First-time setup reference

**Current method (2026-09-03, subdomain move onward):** `~/Developer/repo/rpi-setup/scripts/configure-sparkcards.sh` (run via that repo's `deploy-to-pi.sh`, app name `SparkCards`) creates `/etc/apache2/sites-available/sparkcards.shanmukhan.com.conf` — `DocumentRoot /var/www/sparkcards`, its own vhost/cert, no `/monitor/` proxy (that stays on `shanmukhan.com`'s own vhost, `configure-shanmukhan-vhost.sh`, which now serves the products landing page instead of SparkCards). It does **not** obtain the cert or deploy `dist/` content — those are still separate steps below.

Earlier method (2026-09-03 rebuild, before the subdomain move — superseded by the script above, kept for what's still relevant): `configure-shanmukhan-vhost.sh` created `/etc/apache2/sites-available/shanmukhan.conf` with `DocumentRoot /var/www/sparkcards` directly at `shanmukhan.com`'s root, plus the `/monitor/` proxy on the same vhost. That vhost now serves the products landing page instead — SparkCards' vhost is `sparkcards.shanmukhan.com.conf` as described above.

Historical steps (previous, Ubuntu-based box — superseded by the scripts above, kept for what's still relevant):

1. ~~Create `/etc/apache2/sites-available/sparkcards.shanmukhan.com.conf` by hand~~ — now `configure-sparkcards.sh`'s job.
2. ~~`a2ensite sparkcards.shanmukhan.com.conf && systemctl reload apache2`~~ — same.
3. GoDaddy DNS: a dedicated `A` record for `sparkcards.shanmukhan.com` pointing at the Pi's public IP (port-forwarded to the Pi on 80/443 by the router) — **still applicable**, needed as of the 2026-09-03 subdomain move (a `shanmukhan.com` A record does not cover subdomains; see `rpi-setup/docs/02-dns-and-domain.md`). Watch out for **GoDaddy "Domain Forwarding"** or other connected products silently adding extra, locked `A` records that round-robin traffic elsewhere — remove those first if DNS resolves inconsistently.
4. `sudo apt-get install -y python3-certbot-apache` (the base `certbot` package does **not** include the Apache plugin — `sudo certbot --apache` fails with "the requested apache plugin does not appear to be installed" until this is installed separately) — **still applicable**, already satisfied on the Pi from setting up the other domains.
5. `sudo certbot --apache -d sparkcards.shanmukhan.com` — obtains the cert and rewrites the Apache config to redirect HTTP → HTTPS automatically. Renewal is handled by certbot's own systemd timer; nothing further to do. **Still applicable, not yet run for this subdomain** — do this after `configure-sparkcards.sh` has created the `:80` vhost (needed for the HTTP-01 challenge), before expecting HTTPS to work.
