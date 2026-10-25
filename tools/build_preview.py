"""Builds preview.html: one self-contained file (data, logos, CSS, JS inlined) for hosted preview.
Usage: python3 tools/build_preview.py [--local]   (--local inlines vendor/leaflet.js instead of the CDN tag)"""
import json, os, re, sys, base64
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(f"{R}/{p}").read()
data = json.load(open(f"{R}/data/leagues.json"))
logos = {}
for k, l in data["leagues"].items():
    for n in [k] + [t["id"] for t in l["teams"]]:
        logos[f"{k}/{n}"] = "data:image/svg+xml;base64," + base64.b64encode(open(f"{R}/logos/{k}/{n}.svg","rb").read()).decode()
dump = lambda o: json.dumps(o, separators=(",", ":"))
body = re.search(r"<body>(.*?)<script src", rd("index.html"), re.S).group(1)
css = re.sub(r"url\(images/[^)]*\)", "none", rd("vendor/leaflet.css")) + "\n" + rd("style.css")
css += "\n#league-chip{top:calc(16px + env(safe-area-inset-top,0px))}#reset-view{bottom:calc(28px + env(safe-area-inset-bottom,0px))}@media(max-width:768px){#reset-view{top:calc(16px + env(safe-area-inset-top,0px))}#league-chip{bottom:calc(16px + env(safe-area-inset-bottom,0px))}}"
lib = f"<script>{rd('vendor/leaflet.js')}</script>" if "--local" in sys.argv else '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>'
html = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>FANVERSE · Sports Map</title>
<style>{css}</style></head>
<body>{body}
{lib}
<script>window.FV={{data:{dump(data)},logos:{dump(logos)},regions:{rd('data/regions.geojson')},world:{rd('data/world.geojson')}}};</script>
<script>
{rd('script.js')}
</script>
</body></html>"""
open(f"{R}/preview.html", "w").write(html)
print("preview.html", round(len(html) / 1024), "KB")
