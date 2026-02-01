const map = L.map('map', {
  minZoom: 4, 
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  maxBoundsViscosity: 1.0
}).setView([20.5937, 78.9629], 5);

// Tile themes & initial setup
const themes = {
  dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }),
  light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' }),
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }),
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles © Esri' })
};
themes.dark.addTo(map);
let currentTheme = themes.dark;
let activeLeague = 'ipl'; 

// Centers and zooms for different regions
const regionViews = {
    india: { center: [20.5937, 78.9629], zoom: 5 },
    australia: { center: [-25.2744, 133.7751], zoom: 5 },
    'south-africa': { center: [-29.0, 24.0], zoom: 6 },
    uae: { center: [24.0, 54.0], zoom: 8 },
    caribbean: { center: [12.0, -68.0], zoom: 6 }
};

// Icon helper
function teamIcon(file, size) {
  return L.icon({
    iconUrl: `logos/${activeLeague}/${file}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
}

// League datasets
const leagues = {
  ipl: {
    region: 'india',
    teams: [
        { name:"CSK", stadium:"M.A. Chidambaram Stadium", coords:[13.0636,80.2785], logo:"csk.png", state:"Tamil Nadu", color:"yellow" },
        { name:"MI", stadium:"Wankhede Stadium", coords:[18.9388,72.8258], logo:"mi.png", state:"Maharashtra", color:"blue" },
        { name:"RCB", stadium:"M. Chinnaswamy Stadium", coords:[12.9788,77.5963], logo:"rcb.png", state:"Karnataka", color:"red" },
        { name:"KKR", stadium:"Eden Gardens", coords:[22.5626,88.3639], logo:"kkr.png", state:"West Bengal", color:"purple" },
        { name:"DC", stadium:"Arun Jaitley Stadium", coords:[28.6377,77.2432], logo:"dc.png", state:"Delhi", color:"darkblue" },
        { name:"SRH", stadium:"Rajiv Gandhi Intl. Stadium", coords:[17.4065,78.5505], logo:"srh.png", state:"Telangana", color:"orange" },
        { name:"RR", stadium:"Sawai Mansingh Stadium", coords:[26.9124,75.8080], logo:"rr.png", state:"Rajasthan", color:"deeppink" },
        { name:"PBKS", stadium:"IS Bindra Stadium", coords:[30.7056,76.7340], logo:"pbks.png", state:"Punjab", color:"crimson" },
        { name:"GT", stadium:"Narendra Modi Stadium", coords:[23.0794,72.6167], logo:"gt.png", state:"Gujarat", color:"teal" },
        { name:"LSG", stadium:"Ekana Stadium", coords:[26.8467,80.9462], logo:"lsg.png", state:"Uttar Pradesh", color:"palegreen" }
    ]
  },
  pkl: {
      region: 'india',
      teams: [
        { name:"Patna Pirates", stadium:"Patliputra Sports Complex", coords:[25.6110,85.1440], logo:"patna.png", state:"Bihar", color:"green" },
        { name:"Bengaluru Bulls", stadium:"Kanteerava Indoor Stadium", coords:[12.9716,77.5946], logo:"bulls.png", state:"Karnataka", color:"red" },
        { name:"Dabang Delhi KC", stadium:"Thyagaraj Indoor Stadium", coords:[28.5721,77.2432], logo:"delhi.png", state:"Delhi", color:"red" },
        { name:"Jaipur Pink Panthers", stadium:"SMS Indoor Stadium", coords:[26.9124,75.7873], logo:"jaipur.png", state:"Rajasthan", color:"deeppink" },
        { name:"U Mumba", stadium:"NSCI Dome", coords:[18.9388,72.8258], logo:"umumba.png", state:"Maharashtra", color:"orange" },
        { name:"Telugu Titans", stadium:"Gachibowli Indoor Stadium", coords:[17.4400,78.3489], logo:"titans.png", state:"Telangana", color:"yellow" },
        { name:"Bengal Warriors", stadium:"Netaji Indoor Stadium", coords:[22.5626,88.3639], logo:"bengal.png", state:"West Bengal", color:"lightskyblue" },
        { name:"Puneri Paltan", stadium:"Balewadi Stadium", coords:[18.6715,73.7700], logo:"puneri.png", state:"Maharashtra", color:"orange" },
        { name:"Tamil Thalaivas", stadium:"SDAT Indoor Stadium", coords:[13.0636,80.2785], logo:"thalaivas.png", state:"Tamil Nadu", color:"yellow" },
        { name:"UP Yoddhas", stadium:"Babu Banarasi Das Indoor Stadium", coords:[26.8467,80.9462], logo:"upyoddha.png", state:"Uttar Pradesh", color:"blue" },
        { name:"Haryana Steelers", stadium:"Motilal Nehru School of Sports", coords:[29.2000,76.6000], logo:"steelers.png", state:"Haryana", color:"steelblue" },
        { name:"Gujarat Giants", stadium:"EKA Arena", coords:[23.0225,72.5714], logo:"giants.png", state:"Gujarat", color:"brown" }
    ]
  },
  isl: {
      region: 'india',
      teams: [
        { name:"Bengaluru FC", stadium:"Sree Kanteerava Stadium", coords:[12.9716,77.5946], logo:"bfc.png", state:"Karnataka", color:"blue" },
        { name:"Chennaiyin FC", stadium:"Jawaharlal Nehru Stadium", coords:[13.0636,80.2785], logo:"cfc.png", state:"Tamil Nadu", color:"navy" },
        { name:"East Bengal FC", stadium:"Salt Lake Stadium", coords:[22.5726,88.3639], logo:"ebfc.png", state:"West Bengal", color:"red" },
        { name:"FC Goa", stadium:"Jawaharlal Nehru Stadium", coords:[15.4909,73.8278], logo:"fcg.png", state:"Goa", color:"darkorange" },
        { name:"Hyderabad FC", stadium:"GMC Balayogi Stadium", coords:[17.4065,78.5505], logo:"hfc.png", state:"Telangana", color:"yellow" },
        { name:"Jamshedpur FC", stadium:"JRD Tata Sports Complex", coords:[22.8000,86.2000], logo:"jfc.png", state:"Jharkhand", color:"maroon" },
        { name:"Kerala Blasters FC", stadium:"Jawaharlal Nehru Stadium", coords:[9.9496,76.2590], logo:"kbfc.png", state:"Kerala", color:"yellow" },
        { name:"Mohun Bagan SG", stadium:"Salt Lake Stadium", coords:[22.5726,88.3639], logo:"mbsg.png", state:"West Bengal", color:"green" },
        { name:"Mumbai City FC", stadium:"Mumbai Football Arena", coords:[19.0760,72.8777], logo:"mcfc.png", state:"Maharashtra", color:"skyblue" },
        { name:"NorthEast United FC", stadium:"Indira Gandhi Athletic Stadium", coords:[25.5788,91.8933], logo:"neufc.png", state:"Assam", color:"red" },
        { name:"Odisha FC", stadium:"Kalinga Stadium", coords:[20.2961,85.8245], logo:"ofc.png", state:"Odisha", color:"purple" },
        { name:"Punjab FC", stadium:"Jawaharlal Nehru Stadium", coords:[30.7333,76.7794], logo:"pfc.png", state:"Punjab", color:"crimson" }
    ]
  },
  bbl: {
      region: 'australia',
      teams: [
        { name: "Adelaide Strikers", stadium: "Adelaide Oval", coords: [-34.9165, 138.5999], logo: "rcb.png", state: "South Australia", color: "#00BFFF" },
        { name: "Brisbane Heat", stadium: "The Gabba", coords: [-27.4860, 153.0377], logo: "rcb.png", state: "Queensland", color: "#00CED1" },
        { name: "Hobart Hurricanes", stadium: "Blundstone Arena", coords: [-42.8753, 147.3499], logo: "rcb.png", state: "Tasmania", color: "#8A2BE2" },
        { name: "Melbourne Renegades", stadium: "Marvel Stadium", coords: [-37.81, 144.94], logo: "rcb.png", state: "Victoria", color: "#DC143C" },
        { name: "Melbourne Stars", stadium: "MCG", coords: [-37.83, 142.99], logo: "rcb.png", state: "Victoria", color: "#32CD32" },
        { name: "Perth Scorchers", stadium: "Optus Stadium", coords: [-31.9511, 115.8891], logo: "rcb.png", state: "Western Australia", color: "#FF8C00" },
        { name: "Sydney Sixers", stadium: "SCG", coords: [-31.89, 151.22], logo: "rcb.png", state: "New South Wales", color: "#FF69B4" },
        { name: "Sydney Thunder", stadium: "Sydney Showground Stadium", coords: [-33.84, 151.06], logo: "rcb.png", state: "New South Wales", color: "#00FF00" }
    ]
  },
   sa20: {
    region: 'south-africa',
    teams: [
        { name: "Durban's Super Giants", stadium: "Kingsmead", coords: [-29.8587, 31.0253], logo: "rcb.png", color: "#008751" },
        { name: "Joburg Super Kings", stadium: "Wanderers Stadium", coords: [-26.55, 28.05], logo: "rcb.png", color: "#FDB913" },
        { name: "MI Cape Town", stadium: "Newlands", coords: [-33.9712, 18.4651], logo: "rcb.png", color: "#00AEEF" },
        { name: "Paarl Royals", stadium: "Boland Park", coords: [-31.7381, 18.9682], logo: "rcb.png", color: "#EC008C" },
        { name: "Pretoria Capitals", stadium: "Centurion Park", coords: [-24.85, 28.20], logo: "rcb.png", color: "#0078C9" },
        { name: "Sunrisers Eastern Cape", stadium: "St George's Park", coords: [-33.9613, 25.6109], logo: "rcb.png", color: "#FF7F00" }
    ]
  },
  ilt20: {
    region: 'uae',
    teams: [
        { name: "Abu Dhabi Knight Riders", stadium: "Sheikh Zayed Cricket Stadium", coords: [24.4347, 54.6236], logo: "rcb.png", color: "#5A287D" },
        { name: "Desert Vipers", stadium: "Dubai International Stadium", coords: [25.0426, 55.7156], logo: "rcb.png", color: "#E53935" },
        { name: "Dubai Capitals", stadium: "Dubai International Stadium", coords: [25.0526, 55.2056], logo: "rcb.png", color: "#0078C9" },
        { name: "Gulf Giants", stadium: "Dubai International Stadium", coords: [24.0326, 55.2256], logo: "rcb.png", color: "#FF8C00" },
        { name: "MI Emirates", stadium: "Sheikh Zayed Cricket Stadium", coords: [23.4447, 53.6136], logo: "rcb.png", color: "#00AEEF" },
        { name: "Sharjah Warriors", stadium: "Sharjah Cricket Stadium", coords: [25.3375, 55.4058], logo: "rcb.png", color: "#FDB913" }
    ]
  },
  cpl: {
      region: 'caribbean',
      teams: [
        { name: "Barbados Royals", stadium: "Kensington Oval", coords: [13.1075, -59.6200], logo: "rcb.png", color: "#EC008C" },
        { name: "Guyana Amazon Warriors", stadium: "Providence Stadium", coords: [6.7628, -58.1722], logo: "rcb.png", color: "#008751" },
        { name: "Jamaica Tallawahs", stadium: "Sabina Park", coords: [17.9733, -76.7867], logo: "rcb.png", color: "#FDB913" },
        { name: "St Kitts & Nevis Patriots", stadium: "Warner Park", coords: [17.2942, -62.7236], logo: "rcb.png", color: "#E53935" },
        { name: "Saint Lucia Kings", stadium: "Daren Sammy Cricket Ground", coords: [13.9841, -60.9704], logo: "rcb.png", color: "#0078C9" },
        { name: "Trinbago Knight Riders", stadium: "Queen's Park Oval", coords: [10.6653, -61.5218], logo: "rcb.png", color: "#5A287D" }
    ]
  }
};

// Layers & data cache
const stateLayer = L.layerGroup().addTo(map);
const markerLayer = L.layerGroup().addTo(map);
let activeMarkers = {};
const geoJsonDataCache = {};

function addTeamMarkers(teams) {
  markerLayer.clearLayers();
  activeMarkers = {};
  teams.forEach(team => {
    const marker = L.marker(team.coords, { icon: teamIcon(team.logo, 35) });
    marker.addTo(markerLayer);
    activeMarkers[team.name] = marker;
  });
}

function addStateLayer(teams, geojsonData, stateKey) {
  stateLayer.clearLayers();

  const teamsByState = {};
  teams.forEach(team => {
    if (!teamsByState[team.state]) teamsByState[team.state] = [];
    teamsByState[team.state].push(team);
  });

  const geoJsonLayer = L.geoJSON(geojsonData, {
    style: feature => {
      const stateName = feature.properties[stateKey];
      if (teamsByState[stateName]) {
        return {
          color: "#555",
          weight: 1.5,
          fillColor: teamsByState[stateName][0].color,
          fillOpacity: 0.7
        };
      } else {
        return { fillOpacity: 0, weight: 0 };
      }
    },
    onEachFeature: (feature, layer) => {
      const stateName = feature.properties[stateKey];
      if (teamsByState[stateName]) {
        layer.on({
          mouseover: (e) => e.target.setStyle({ weight: 2.5 }),
          mouseout: (e) => geoJsonLayer.resetStyle(e.target),
          click: () => {
            const team = teamsByState[stateName][0];
            map.flyTo(team.coords, 9, { animate: true, duration: 1.5 }); // Zoom closer for states

            Object.values(activeMarkers).forEach(m => m.setIcon(teamIcon(m.options.icon.options.iconUrl.split('/').pop(), 35)));
            const bigMarker = activeMarkers[team.name];
            if (bigMarker) {
              bigMarker.setIcon(teamIcon(team.logo, 60));
            }
          }
        });
      }
    }
  }).addTo(stateLayer);
}

function fetchAndLoadGeoJson(leagueData) {
    const region = leagueData.region;
    const geoJsonFile = `${region}.geojson`;
    const stateKey = region === 'india' ? 'st_nm' : 'STATE_NAME'; // Different keys for state names

    if (geoJsonDataCache[geoJsonFile]) {
        addStateLayer(leagueData.teams, geoJsonDataCache[geoJsonFile], stateKey);
    } else {
        fetch(geoJsonFile)
            .then(res => res.json())
            .then(data => {
                geoJsonDataCache[geoJsonFile] = data;
                addStateLayer(leagueData.teams, data, stateKey);
            });
    }
}

function showLeagueLogo(leagueKey) {
  const overlay = document.getElementById('league-logo-overlay');
  const logoImg = document.getElementById('league-logo-img');

  logoImg.src = `logos/${leagueKey}/${leagueKey}.png`;
  overlay.classList.add('show');

  setTimeout(() => {
    overlay.classList.remove('show');
  }, 1500);
}

function loadLeague(leagueKey) {
  showLeagueLogo(leagueKey);
  activeLeague = leagueKey;
  const leagueData = leagues[leagueKey];
  const region = leagueData.region;
  const view = regionViews[region];
  map.flyTo(view.center, view.zoom, { animate: true, duration: 1.5 });
  addTeamMarkers(leagueData.teams);
  stateLayer.clearLayers();

  let radius = 80000; // Default radius
  if (activeLeague === 'ilt20') {
    radius = 18000; // Smaller radius for ILT20
  }

  if (['bbl', 'sa20', 'ilt20', 'cpl'].includes(activeLeague)) {
    leagueData.teams.forEach(team => {
        const circle = L.circle(team.coords, {
            radius: radius,
            fillColor: team.color,
            color: team.color,
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.3
        }).addTo(stateLayer);
        circle.bindPopup(`<b>${team.name}</b><br>${team.stadium}`);
    });
  } else {
    fetchAndLoadGeoJson(leagueData);
  }
}

function setActiveButton(button) {
    const parent = button.parentElement;
    parent.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Initial Load
fetch('india.geojson')
    .then(res => res.json())
    .then(data => {
        geoJsonDataCache['india.geojson'] = data;
        loadLeague("ipl"); // Load default league
        setActiveButton(document.querySelector('.league-options button[data-league="ipl"]'));
        setActiveButton(document.querySelector('.theme-options button[data-theme="dark"]'));
    });

document.querySelector('.panel-tab').addEventListener('click', () => {
    document.getElementById('edge-panel').classList.toggle('open');
});

document.querySelectorAll(".league-options button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const league = e.currentTarget.getAttribute("data-league");
    if (league) loadLeague(league);
    setActiveButton(e.currentTarget);
  });
});

document.querySelectorAll(".theme-options button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const theme = e.currentTarget.getAttribute('data-theme');
    if (theme) {
      map.removeLayer(currentTheme);
      currentTheme = themes[theme];
      currentTheme.addTo(map);
      setActiveButton(e.currentTarget);
    }
  });
});

document.getElementById('reset-view').addEventListener('click', () => {
    const currentLeagueData = leagues[activeLeague];
    const region = currentLeagueData.region;
    const view = regionViews[region];
    map.flyTo(view.center, view.zoom, { animate: true, duration: 1.5 });
    loadLeague(activeLeague);
    document.getElementById('edge-panel').classList.remove('open');
});

document.querySelector('.panel-content').addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        document.getElementById('edge-panel').classList.remove('open');
    }
});
