# FANVERSE

An interactive sports map. Pick a league and the map flies to its region, drops a crest on every home stadium, and (for Indian leagues) colours each team's home state.

**Leagues:** IPL, PKL, ISL, HIL (India) · BBL (Australia) · SA20 (South Africa) · ILT20 (UAE) · CPL (Caribbean). Each team's home state, province, emirate or nation is coloured.

## Run locally
The app loads JSON with `fetch`, so it must be served over HTTP (not opened via `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000   (deep link to a league: http://localhost:8000/#bbl)
```
Leaflet is vendored in `vendor/`. Themes (Dark, Light, Classic, Forest, Neon, Ocean) are vector and work offline; an extra **Street** theme uses live tiles and needs internet.

## Project layout
| Path | Purpose |
|---|---|
| `data/leagues.json` | Single source of truth: leagues, teams, stadium coordinates, colours, region views |
| `data/regions.geojson` | State, province, emirate and nation boundaries for every league |
| `data/world.geojson` | World outline used by the vector map themes |
| `logos/<league>/<team>.svg` | Generated crest per team, plus `<league>/<league>.svg` badges |
| `tools/build_assets.py` | Regenerates the JSON and logos (`pip install shapely`) |
| `tools/build_preview.py` | Builds a single-file `preview.html` (no server needed) |

## Editing teams
Edit the `L` table in `tools/build_assets.py`, then run `python3 tools/build_assets.py`. Stadium coordinates are approximate; verify before publishing.

## Logos
The crests are original placeholder designs (team colours and initials), **not** official marks. To use official logos, drop your licensed `<team>.svg`/`.png` into `logos/<league>/` using the same file names (and update the extension in `script.js`'s `logo()` helper if you use PNG).

## Features
Shared-stadium teams fan out so none is hidden · clickable team list · state popups list every team · remembers your theme and league · `#league` deep links · keyboard accessible · reduced-motion friendly · responsive layout.

## Deploy
Push to GitHub and enable **Settings → Pages → Deploy from a branch → main / (root)**. All paths are relative, so it works under `https://<user>.github.io/<repo>/`.
