"""Builds data/regions.geojson: India states + Australian states, South African provinces, UAE emirates, Caribbean nations.
Needs Natural Earth admin-1 (https://github.com/nvkelso/natural-earth-vector, ne_10m_admin_1_states_provinces.geojson) and a
named world file; paths below are the ones used when this was generated."""
import json, os
from shapely.geometry import shape, mapping
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NE, WORLD = "/tmp/ne_admin1.geojson", "/tmp/world_named.json"
feats = []
def add(region, name, geom, tol):
    g = shape(geom).buffer(0).simplify(tol, preserve_topology=True)
    feats.append({"type":"Feature","properties":{"region":region,"st_nm":name},"geometry":mapping(g)})
for f in json.load(open(f"{R}/data/india-states.geojson"))["features"]:
    feats.append({"type":"Feature","properties":{"region":"india","st_nm":f["properties"]["st_nm"]},"geometry":f["geometry"]})
RM = {"Australia":("australia",.02),"South Africa":("south-africa",.015),"United Arab Emirates":("uae",.004)}
for f in json.load(open(NE))["features"]:
    p = f["properties"]
    if p.get("admin") in RM and p["name"] not in ("Neutral Zone","Macquarie Island","Lord Howe Island","Jervis Bay Territory"):
        r, t = RM[p["admin"]]; add(r, {"Dubay":"Dubai"}.get(p["name"], p["name"]), f["geometry"], t)
for f in json.load(open(WORLD))["features"]:
    n = f["properties"]["name"]
    if n in ("Barbados","Guyana","Jamaica","St. Kitts and Nevis","Saint Lucia","Trinidad and Tobago","Antigua and Barb."): add("caribbean", {"Antigua and Barb.":"Antigua and Barbuda"}.get(n,n), f["geometry"], .003)
rnd = lambda c: [round(c[0],3),round(c[1],3)] if not isinstance(c[0],(list,tuple)) else [rnd(x) for x in c]
for f in feats: f["geometry"]["coordinates"] = rnd(f["geometry"]["coordinates"])
json.dump({"type":"FeatureCollection","features":feats},open(f"{R}/data/regions.geojson","w"),separators=(",",":"))
print(len(feats),"regions", os.path.getsize(f"{R}/data/regions.geojson")//1024,"KB")
