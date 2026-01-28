const map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

function teamIcon(file) {
  return L.icon({
    iconUrl: `logos/${file}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
}

const activeTeams = [
  { name:"CSK", stadium:"M.A. Chidambaram", coords:[13.0636,80.2785], logo:"csk.png", state:"Tamil Nadu", color:"yellow" },
  { name:"MI", stadium:"Wankhede", coords:[18.9388,72.8258], logo:"mi.png", state:"Maharashtra", color:"blue" },
  { name:"RCB", stadium:"Chinnaswamy", coords:[12.9788,77.5963], logo:"rcb.png", state:"Karnataka", color:"red" },
  { name:"KKR", stadium:"Eden Gardens", coords:[22.5626,88.3639], logo:"kkr.png", state:"West Bengal", color:"purple" },
  { name:"DC", stadium:"Arun Jaitley", coords:[28.6377,77.2432], logo:"dc.png", state:"Delhi", color:"darkblue" },
  { name:"SRH", stadium:"Rajiv Gandhi Intl.", coords:[17.4065,78.5505], logo:"srh.png", state:"Telangana", color:"orange" },
  { name:"RR", stadium:"Sawai Mansingh", coords:[26.9124,75.8080], logo:"rr.png", state:"Rajasthan", color:"pink" },
  { name:"PBKS", stadium:"IS Bindra", coords:[30.7056,76.7340], logo:"pbks.png", state:"Punjab", color:"crimson" },
  { name:"GT", stadium:"Narendra Modi Stadium", coords:[23.0794,72.6167], logo:"gt.png", state:"Gujarat", color:"teal" },
  { name:"LSG", stadium:"Ekana Stadium", coords:[26.8467,80.9462], logo:"lsg.png", state:"Uttar Pradesh", color:"green" }
];

const defunctTeams = [
  { name:"Kochi Tuskers Kerala", stadium:"Jawaharlal Nehru Stadium", coords:[9.9496,76.2590], logo:"ktk.png", state:"Kerala", color:"violet" },
  { name:"Pune Warriors India", stadium:"Subrata Roy Sahara Stadium", coords:[18.6715,73.7700], logo:"pwi.png", state:"Maharashtra", color:"brown" },
  { name:"Deccan Chargers", stadium:"Rajiv Gandhi Intl.", coords:[17.4065,78.5505], logo:"dc_old.png", state:"Telangana", color:"gray" },
  { name:"Rising Pune Supergiant", stadium:"MCA Stadium", coords:[18.6500,73.7700], logo:"rps.png", state:"Maharashtra", color:"pink" },
  { name:"Gujarat Lions", stadium:"Sardar Patel Stadium", coords:[23.0794,72.6167], logo:"gl.png", state:"Gujarat", color:"orange" }
];

const activeLayer = L.layerGroup();
const defunctLayer = L.layerGroup();
const stateLayer = L.layerGroup();

function addTeamMarkers(teams, layer) {
  teams.forEach(team => {
    const marker = L.marker(team.coords, { icon: teamIcon(team.logo) })
      .bindPopup(`<b>${team.name}</b><br>${team.stadium}`);
    marker.on('click', () => {
      map.flyTo(team.coords, 8, { animate:true, duration:1.5 });
    });
    marker.addTo(layer);
  });
}

function addStateColors(teams, layer, geojsonData) {
  teams.forEach(team => {
    L.geoJSON(geojsonData, {
      filter: f => f.properties.st_nm === team.state,
      style: {
        color: team.color,
        weight: 2,
        fillColor: team.color,
        fillOpacity: 0.4
      }
    }).addTo(layer);
  });
}

fetch('india.geojson')
  .then(res => res.json())
  .then(data => {
    addStateColors(activeTeams, stateLayer, data);
    addStateColors(defunctTeams, defunctLayer, data);
  });

addTeamMarkers(activeTeams, activeLayer);
addTeamMarkers(defunctTeams, defunctLayer);

activeLayer.addTo(map);
stateLayer.addTo(map);
defunctLayer.addTo(map);

document.getElementById('activeToggle').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(activeLayer);
  else map.removeLayer(activeLayer);
});
document.getElementById('defunctToggle').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(defunctLayer);
  else map.removeLayer(defunctLayer);
});
