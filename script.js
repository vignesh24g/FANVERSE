const map = L.map('map').setView([20.5937, 78.9629], 5);

// Tile themes
const themes = {
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }),
  light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }),
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' })
};

// Default theme
themes.dark.addTo(map);
let currentTheme = themes.dark;

// Logo icon helper
function teamIcon(file) {
  return L.icon({
    iconUrl: `logos/${file}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
}

// League datasets (IPL, PKL, ISL) — already filled in earlier
// League datasets
const leagues = {
  ipl: [
    { name:"CSK", stadium:"M.A. Chidambaram Stadium", coords:[13.0636,80.2785], logo:"csk.png", state:"Tamil Nadu", color:"yellow" },
    { name:"MI", stadium:"Wankhede Stadium", coords:[18.9388,72.8258], logo:"mi.png", state:"Maharashtra", color:"blue" },
    { name:"RCB", stadium:"M. Chinnaswamy Stadium", coords:[12.9788,77.5963], logo:"rcb.png", state:"Karnataka", color:"red" },
    { name:"KKR", stadium:"Eden Gardens", coords:[22.5626,88.3639], logo:"kkr.png", state:"West Bengal", color:"purple" },
    { name:"DC", stadium:"Arun Jaitley Stadium", coords:[28.6377,77.2432], logo:"dc.png", state:"Delhi", color:"darkblue" },
    { name:"SRH", stadium:"Rajiv Gandhi Intl. Stadium", coords:[17.4065,78.5505], logo:"srh.png", state:"Telangana", color:"orange" },
    { name:"RR", stadium:"Sawai Mansingh Stadium", coords:[26.9124,75.8080], logo:"rr.png", state:"Rajasthan", color:"pink" },
    { name:"PBKS", stadium:"IS Bindra Stadium", coords:[30.7056,76.7340], logo:"pbks.png", state:"Punjab", color:"crimson" },
    { name:"GT", stadium:"Narendra Modi Stadium", coords:[23.0794,72.6167], logo:"gt.png", state:"Gujarat", color:"teal" },
    { name:"LSG", stadium:"Ekana Stadium", coords:[26.8467,80.9462], logo:"lsg.png", state:"Uttar Pradesh", color:"green" }
  ],
  pkl: [
    { name:"Patna Pirates", stadium:"Patliputra Sports Complex", coords:[25.6110,85.1440], logo:"patna.png", state:"Bihar", color:"green" },
    { name:"Bengaluru Bulls", stadium:"Kanteerava Indoor Stadium", coords:[12.9716,77.5946], logo:"bulls.png", state:"Karnataka", color:"red" },
    { name:"Dabang Delhi KC", stadium:"Thyagaraj Indoor Stadium", coords:[28.5721,77.2432], logo:"delhi.png", state:"Delhi", color:"blue" },
    { name:"Jaipur Pink Panthers", stadium:"SMS Indoor Stadium", coords:[26.9124,75.7873], logo:"jaipur.png", state:"Rajasthan", color:"pink" },
    { name:"U Mumba", stadium:"NSCI Dome", coords:[18.9388,72.8258], logo:"umumba.png", state:"Maharashtra", color:"orange" },
    { name:"Telugu Titans", stadium:"Gachibowli Indoor Stadium", coords:[17.4400,78.3489], logo:"titans.png", state:"Telangana", color:"yellow" },
    { name:"Bengal Warriors", stadium:"Netaji Indoor Stadium", coords:[22.5626,88.3639], logo:"bengal.png", state:"West Bengal", color:"blue" },
    { name:"Puneri Paltan", stadium:"Balewadi Stadium", coords:[18.6715,73.7700], logo:"puneri.png", state:"Maharashtra", color:"orange" },
    { name:"Tamil Thalaivas", stadium:"SDAT Indoor Stadium", coords:[13.0636,80.2785], logo:"thalaivas.png", state:"Tamil Nadu", color:"yellow" },
    { name:"UP Yoddhas", stadium:"Babu Banarasi Das Indoor Stadium", coords:[26.8467,80.9462], logo:"upyoddha.png", state:"Uttar Pradesh", color:"blue" },
    { name:"Haryana Steelers", stadium:"Motilal Nehru School of Sports", coords:[29.2000,76.6000], logo:"steelers.png", state:"Haryana", color:"steelblue" },
    { name:"Gujarat Giants", stadium:"EKA Arena", coords:[23.0225,72.5714], logo:"giants.png", state:"Gujarat", color:"brown" }
  ],
  isl: [
    { name:"Bengaluru FC", stadium:"Sree Kanteerava Stadium", coords:[12.9716,77.5946], logo:"bengaluru.png", state:"Karnataka", color:"blue" },
    { name:"Chennaiyin FC", stadium:"Jawaharlal Nehru Stadium", coords:[13.0636,80.2785], logo:"chennaiyin.png", state:"Tamil Nadu", color:"navy" },
    { name:"East Bengal FC", stadium:"Salt Lake Stadium", coords:[22.5726,88.3639], logo:"eastbengal.png", state:"West Bengal", color:"red" },
    { name:"FC Goa", stadium:"Jawaharlal Nehru Stadium", coords:[15.4909,73.8278], logo:"goa.png", state:"Goa", color:"orange" },
    { name:"Hyderabad FC", stadium:"GMC Balayogi Stadium", coords:[17.4065,78.5505], logo:"hyderabad.png", state:"Telangana", color:"yellow" },
    { name:"Jamshedpur FC", stadium:"JRD Tata Sports Complex", coords:[22.8000,86.2000], logo:"jamshedpur.png", state:"Jharkhand", color:"red" },
    { name:"Kerala Blasters FC", stadium:"Jawaharlal Nehru Stadium", coords:[9.9496,76.2590], logo:"kerala.png", state:"Kerala", color:"yellow" },
    { name:"Mohun Bagan SG", stadium:"Salt Lake Stadium", coords:[22.5726,88.3639], logo:"mohun.png", state:"West Bengal", color:"green" },
    { name:"Mumbai City FC", stadium:"Mumbai Football Arena", coords:[19.0760,72.8777], logo:"mumbai.png", state:"Maharashtra", color:"skyblue" },
    { name:"NorthEast United FC", stadium:"Indira Gandhi Athletic Stadium", coords:[25.5788,91.8933], logo:"northeast.png", state:"Assam", color:"maroon" },
    { name:"Odisha FC", stadium:"Kalinga Stadium", coords:[20.2961,85.8245], logo:"odisha.png", state:"Odisha", color:"purple" },
    { name:"Punjab FC", stadium:"Jawaharlal Nehru Stadium", coords:[30.7333,76.7794], logo:"punjab.png", state:"Punjab", color:"crimson" }
  ]
};


const activeLayer = L.layerGroup();
const stateLayer = L.layerGroup();
let indiaGeoJson = null;

// Add markers
function addTeamMarkers(teams, layer) {
  layer.clearLayers();
  teams.forEach(team => {
    const marker = L.marker(team.coords, { icon: teamIcon(team.logo) })
      .bindPopup(`<b>${team.name}</b><br>${team.stadium}`);

    marker.on('click', () => {
      map.flyTo(team.coords, 8, { animate:true, duration:1.5 });
      const iconEl = marker._icon;
      if (iconEl) {
        iconEl.classList.add('pulse');
        setTimeout(() => iconEl.classList.remove('pulse'), 400);
      }
      if (indiaGeoJson) flashState(team, indiaGeoJson);
    });

    marker.addTo(layer);
  });
}

// State coloring
function addStateColors(teams, layer, geojsonData) {
  layer.clearLayers();
  teams.forEach(team => {
    L.geoJSON(geojsonData, {
      filter: f => f.properties.st_nm === team.state,
      style: {
        color: "#333",
        weight: 1.5,
        fillColor: team.color || "#ccc",
        fillOpacity: 0.6,
        dashArray: "3"
      }
    }).addTo(layer);
  });
}

// Flash highlight on click
function flashState(team, geojsonData) {
  const layer = L.geoJSON(geojsonData, {
    filter: f => f.properties.st_nm === team.state,
    style: {
      color: team.color || "#999",
      fillColor: team.color || "#999",
      fillOpacity: 0.8
    }
  }).addTo(map);
  setTimeout(() => map.removeLayer(layer), 1500);
}

// Load GeoJSON
fetch('india.geojson')
  .then(res => res.json())
  .then(data => {
    indiaGeoJson = data;
    loadLeague("ipl"); // default load IPL
  });

// Load league data
function loadLeague(leagueKey) {
  activeLayer.clearLayers();
  stateLayer.clearLayers();
  const teams = leagues[leagueKey];
  addTeamMarkers(teams, activeLayer);
  if (indiaGeoJson) addStateColors(teams, stateLayer, indiaGeoJson);
  activeLayer.addTo(map);
  stateLayer.addTo(map);
}

// Burger menu toggle
document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("menuItems").classList.toggle("hidden");
});

// Menu item click
document.querySelectorAll("#menuItems button").forEach(btn => {
  btn.addEventListener("click", () => {
    const league = btn.getAttribute("data-league");
    const theme = btn.getAttribute("data-theme");

    if (league) {
      loadLeague(league);
    }
    if (theme) {
      map.removeLayer(currentTheme);
      currentTheme = themes[theme];
      currentTheme.addTo(map);
    }

    document.getElementById("menuItems").classList.add("hidden");
  });
});
