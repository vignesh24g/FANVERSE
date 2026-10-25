"""Generates data/leagues.json, original SVG team crests, league badges and data/india-states.geojson."""
import json, os, colorsys
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# team: id, name, short, stadium, lat, lng, state, colour
L = {
 "ipl": ("Indian Premier League","IPL","india","#1E5BFF","cricket",[
  ("csk","Chennai Super Kings","CSK","M.A. Chidambaram Stadium",13.0628,80.2793,"Tamil Nadu","#F9CD05"),
  ("mi","Mumbai Indians","MI","Wankhede Stadium",18.9389,72.8258,"Maharashtra","#0B5FB4"),
  ("rcb","Royal Challengers Bengaluru","RCB","M. Chinnaswamy Stadium",12.9788,77.5996,"Karnataka","#D1202F"),
  ("kkr","Kolkata Knight Riders","KKR","Eden Gardens",22.5645,88.3433,"West Bengal","#5B2A86"),
  ("dc","Delhi Capitals","DC","Arun Jaitley Stadium",28.6377,77.2432,"Delhi","#17479E"),
  ("srh","Sunrisers Hyderabad","SRH","Rajiv Gandhi Intl. Stadium",17.4065,78.5505,"Telangana","#F26522"),
  ("rr","Rajasthan Royals","RR","Sawai Mansingh Stadium",26.8940,75.8040,"Rajasthan","#E4328C"),
  ("pbks","Punjab Kings","PBKS","IS Bindra Stadium, Mohali",30.6910,76.7370,"Punjab","#C8102E"),
  ("gt","Gujarat Titans","GT","Narendra Modi Stadium",23.0917,72.5970,"Gujarat","#1C2C5B"),
  ("lsg","Lucknow Super Giants","LSG","BRSABV Ekana Stadium",26.8100,81.0200,"Uttar Pradesh","#00A8A8")]),
 "pkl": ("Pro Kabaddi League","PKL","india","#F26A1B","kabaddi",[
  ("patna","Patna Pirates","PAT","Patliputra Sports Complex",25.6110,85.1440,"Bihar","#0E9F6E"),
  ("bulls","Bengaluru Bulls","BLR","Kanteerava Indoor Stadium",12.9699,77.5950,"Karnataka","#E03C31"),
  ("delhi","Dabang Delhi K.C.","DEL","Thyagaraj Sports Complex",28.5810,77.2360,"Delhi","#D7263D"),
  ("jaipur","Jaipur Pink Panthers","JPP","SMS Indoor Stadium",26.8940,75.8040,"Rajasthan","#E4328C"),
  ("umumba","U Mumba","UMU","NSCI Dome, Worli",19.0100,72.8190,"Maharashtra","#F58220"),
  ("titans","Telugu Titans","TT","Gachibowli Indoor Stadium",17.4400,78.3489,"Telangana","#F2B705"),
  ("bengal","Bengal Warriors","BEN","Netaji Indoor Stadium",22.5530,88.3430,"West Bengal","#3FA7E0"),
  ("puneri","Puneri Paltan","PUN","Balewadi Sports Complex",18.5750,73.7160,"Maharashtra","#E8731A"),
  ("thalaivas","Tamil Thalaivas","TAM","Jawaharlal Nehru Indoor Stadium",13.0830,80.2680,"Tamil Nadu","#E6B800"),
  ("upyoddha","UP Yoddhas","UPY","Babu Banarasi Das Indoor Stadium",26.8467,80.9462,"Uttar Pradesh","#1F4FA3"),
  ("steelers","Haryana Steelers","HAR","Tau Devi Lal Stadium, Panchkula",30.6942,76.8606,"Haryana","#2F6EA5"),
  ("giants","Gujarat Giants","GUJ","EKA Arena, Ahmedabad",23.0225,72.5714,"Gujarat","#C2571A")]),
 "isl": ("Indian Super League","ISL","india","#7B2FF7","football",[
  ("bfc","Bengaluru FC","BFC","Sree Kanteerava Stadium",12.9699,77.5950,"Karnataka","#1D4ED8"),
  ("cfc","Chennaiyin FC","CFC","Jawaharlal Nehru Stadium, Chennai",13.0600,80.2730,"Tamil Nadu","#1B2A6B"),
  ("cbfc","Churchill Brothers FC","CBF","Margao, Goa (home city)",15.2993,73.9580,"Goa","#991B1B"),
  ("ebfc","East Bengal FC","EBF","Salt Lake Stadium",22.5726,88.4096,"West Bengal","#D62828"),
  ("fcg","FC Goa","FCG","Fatorda Stadium",15.2870,73.9590,"Goa","#F77F00"),
  ("ikfc","Inter Kashi FC","IKF","Varanasi (home city)",25.3176,82.9739,"Uttar Pradesh","#0EA5E9"),
  ("kbfc","Kerala Blasters FC","KBF","Jawaharlal Nehru Stadium, Kochi",9.9970,76.3010,"Kerala","#F4C20D"),
  ("mbsg","Mohun Bagan Super Giant","MBSG","Salt Lake Stadium",22.5726,88.4096,"West Bengal","#1E7B4F"),
  ("mcfc","Mumbai City FC","MCFC","Mumbai Football Arena",19.1360,72.8290,"Maharashtra","#62B5E5"),
  ("neufc","NorthEast United FC","NEU","Indira Gandhi Athletic Stadium",26.1050,91.7380,"Assam","#E63946"),
  ("ofc","Odisha FC","OFC","Kalinga Stadium",20.2961,85.8245,"Odisha","#7A1FA2"),
  ("pfc","Punjab FC","PFC","Jawaharlal Nehru Stadium, Delhi",28.5826,77.2340,"Delhi","#C1121F"),
  ("scd","Sporting Club Delhi","SCD","Delhi (home city)",28.6139,77.2090,"Delhi","#16A34A")]),
 "hil": ("Hockey India League","HIL","india","#10B981","hockey",[
  ("dragons","Tamil Nadu Dragons","TND","Mayor Radhakrishnan Hockey Stadium, Chennai",13.0688,80.2630,"Tamil Nadu","#0EA5A4"),
  ("toofans","Hyderabad Toofans","HYT","Hyderabad (home city)",17.3850,78.4867,"Telangana","#2563EB"),
  ("soorma","Soorma Hockey Club","SHC","Jalandhar (home city)",31.3260,75.5762,"Punjab","#F59E0B"),
  ("tigers","Shrachi Bengal Tigers","SBT","Kolkata (home city)",22.5726,88.3639,"West Bengal","#F97316"),
  ("lancers","Kalinga Lancers","KAL","Kalinga Stadium, Bhubaneswar",20.2961,85.8245,"Odisha","#B91C1C"),
  ("royals","Ranchi Royals","RAN","Jaipal Singh Stadium, Ranchi",23.3441,85.3096,"Jharkhand","#DB2777"),
  ("pipers","SG Pipers","SGP","Major Dhyan Chand National Stadium, Delhi",28.6115,77.2370,"Delhi","#7C3AED")]),
 "bbl": ("Big Bash League","BBL","australia","#00B2A9","cricket",[
  ("strikers","Adelaide Strikers","ADS","Adelaide Oval",-34.9156,138.5961,"South Australia","#0A6CCB"),
  ("heat","Brisbane Heat","BRH","The Gabba",-27.4858,153.0381,"Queensland","#00A6A6"),
  ("hurricanes","Hobart Hurricanes","HOH","Bellerive Oval",-42.8794,147.3736,"Tasmania","#7B3FE4"),
  ("renegades","Melbourne Renegades","MLR","Marvel Stadium",-37.8165,144.9475,"Victoria","#D7263D"),
  ("stars","Melbourne Stars","MLS","Melbourne Cricket Ground",-37.8200,144.9834,"Victoria","#2EBD59"),
  ("scorchers","Perth Scorchers","PRS","Optus Stadium",-31.9512,115.8890,"Western Australia","#F7941D"),
  ("sixers","Sydney Sixers","SYS","Sydney Cricket Ground",-33.8914,151.2247,"New South Wales","#E83E8C"),
  ("thunder","Sydney Thunder","SYT","Sydney Showground Stadium",-33.8442,151.0675,"New South Wales","#9BE31B")]),
 "sa20": ("SA20","SA20","south-africa","#E0A100","cricket",[
  ("dsg","Durban's Super Giants","DSG","Kingsmead, Durban",-29.8506,31.0309,"","#0B8F5B"),
  ("jsk","Joburg Super Kings","JSK","The Wanderers, Johannesburg",-26.1317,28.0600,"","#F7B500"),
  ("mict","MI Cape Town","MICT","Newlands, Cape Town",-33.9712,18.4651,"","#1E88E5"),
  ("par","Paarl Royals","PRL","Boland Park, Paarl",-33.7360,18.9644,"","#E4328C"),
  ("pc","Pretoria Capitals","PTC","SuperSport Park, Centurion",-25.8610,28.1710,"","#0A66C2"),
  ("sec","Sunrisers Eastern Cape","SEC","St George's Park, Gqeberha",-33.9360,25.5990,"","#F57C00")]),
 "ilt20": ("International League T20","ILT20","uae","#14B8A6","cricket",[
  ("adkr","Abu Dhabi Knight Riders","ADKR","Sheikh Zayed Stadium, Abu Dhabi",24.3951,54.5272,"","#5B2A86"),
  ("dv","Desert Vipers","DV","Dubai International Stadium",25.0457,55.2178,"","#E53935"),
  ("dc","Dubai Capitals","DUC","Dubai International Stadium",25.0457,55.2178,"","#1565C0"),
  ("gg","Gulf Giants","GG","Sharjah Cricket Stadium",25.3306,55.4150,"","#FB8C00"),
  ("mie","MI Emirates","MIE","Sheikh Zayed Stadium, Abu Dhabi",24.3951,54.5272,"","#00A3E0"),
  ("sw","Sharjah Warriors","SHW","Sharjah Cricket Stadium",25.3306,55.4150,"","#F2B400")]),
 "cpl": ("Caribbean Premier League","CPL","caribbean","#E11D48","cricket",[
  ("abf","Antigua & Barbuda Falcons","ABF","Sir Vivian Richards Stadium, Antigua",17.0769,-61.7878,"Antigua and Barbuda","#F97316"),
  ("br","Barbados Tridents","BAR","Kensington Oval, Bridgetown",13.1000,-59.6086,"Barbados","#E4328C"),
  ("gaw","Guyana Amazon Warriors","GAW","Providence Stadium",6.7706,-58.2022,"Guyana","#0B8F5B"),
  ("jk","Jamaica Kingsmen","JAM","Sabina Park, Kingston",17.9786,-76.7822,"Jamaica","#F2B400"),
  ("skn","St Kitts & Nevis Patriots","SKN","Warner Park, Basseterre",17.3086,-62.7400,"St. Kitts and Nevis","#D62828"),
  ("slk","Saint Lucia Kings","SLK","Daren Sammy Ground, Gros Islet",14.0187,-60.9494,"Saint Lucia","#1565C0"),
  ("tkr","Trinbago Knight Riders","TKR","Queen's Park Oval, Port of Spain",10.6638,-61.5183,"Trinidad and Tobago","#5B2A86")])}
REGIONS = {"india":{"center":[22.8,80.5],"zoom":5},"australia":{"center":[-28.5,134.5],"zoom":4},
 "south-africa":{"center":[-29.0,24.5],"zoom":6},"uae":{"center":[24.8,54.8],"zoom":8},"caribbean":{"center":[14.5,-67.0],"zoom":5,"halo":55000}}
def ink(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return "#111827" if 0.2126*r+0.7152*g+0.0722*b>0.55 else "#FFFFFF"
def shade(h,f):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    hh,l,s=colorsys.rgb_to_hls(r,g,b); r,g,b=colorsys.hls_to_rgb(hh,max(0,min(1,l*f)),s)
    return "#%02X%02X%02X"%(round(r*255),round(g*255),round(b*255))
def crest(short,c):
    t=ink(c); fs=34 if len(short)<=2 else 28 if len(short)==3 else 22
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 112" role="img" aria-label="{short}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{shade(c,1.15)}"/><stop offset="1" stop-color="{shade(c,0.78)}"/></linearGradient></defs><path d="M50 4 90 16v46c0 22-18 38-40 46C28 100 10 84 10 62V16z" fill="url(#g)" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M50 12 82 21v41c0 17-14 30-32 37" fill="none" stroke="{t}" stroke-opacity=".25" stroke-width="2"/><text x="50" y="62" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="{fs}" fill="{t}">{short}</text></svg>'''
def badge(short,c):
    t=ink(c); fs=30 if len(short)<=3 else 24
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="{short}"><circle cx="60" cy="60" r="56" fill="{c}" stroke="#fff" stroke-width="5"/><circle cx="60" cy="60" r="44" fill="none" stroke="{t}" stroke-opacity=".35" stroke-width="2"/><text x="60" y="70" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="{fs}" fill="{t}">{short}</text></svg>'''
STATE_FIX={("sa20","dsg"):"KwaZulu-Natal",("sa20","jsk"):"Gauteng",("sa20","mict"):"Western Cape",("sa20","par"):"Western Cape",("sa20","pc"):"Gauteng",("sa20","sec"):"Eastern Cape",
 ("ilt20","adkr"):"Abu Dhabi",("ilt20","mie"):"Abu Dhabi",("ilt20","dv"):"Dubai",("ilt20","dc"):"Dubai",("ilt20","gg"):"Sharjah",("ilt20","sw"):"Sharjah"}
out={"regions":REGIONS,"leagues":{}}
for k,(name,short,reg,col,sport,teams) in L.items():
    os.makedirs(f"{R}/logos/{k}",exist_ok=True)
    open(f"{R}/logos/{k}/{k}.svg","w").write(badge(short,col))
    out["leagues"][k]={"name":name,"short":short,"region":reg,"color":col,"sport":sport,"teams":[]}
    for i,n,s,st,la,lo,state,c in teams:
        open(f"{R}/logos/{k}/{i}.svg","w").write(crest(s,c))
        state=STATE_FIX.get((k,i),state)
        out["leagues"][k]["teams"].append(dict(id=i,name=n,short=s,stadium=st,coords=[la,lo],state=state,color=c))
json.dump(out,open(f"{R}/data/leagues.json","w"),indent=1)
# state-level map: dissolve districts
src=json.load(open(f"{R}/../../../mnt/user-data/uploads/india.geojson")) if False else json.load(open("/mnt/user-data/uploads/india.geojson"))
by={}
for f in src["features"]:
    g=shape(f["geometry"]).buffer(0); by.setdefault(f["properties"]["st_nm"],[]).append(g)
feats=[{"type":"Feature","properties":{"st_nm":s},"geometry":mapping(unary_union(g).simplify(0.01,preserve_topology=True))} for s,g in sorted(by.items())]
json.dump({"type":"FeatureCollection","features":feats},open(f"{R}/data/india-states.geojson","w"),separators=(",",":"))
print("ok",sum(len(v[5]) for v in L.values()),"teams;",len(feats),"states")
