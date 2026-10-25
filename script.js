'use strict';
(async function () {
  const $ = (s) => document.querySelector(s);
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
                  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

  const FV = window.FV; // set by the single-file preview build
  const data = FV ? FV.data : await fetch('data/leagues.json').then(r => r.json());
  const { leagues, regions } = data;

  // ---- Map & basemaps ------------------------------------------------------
  const map = L.map('map', { minZoom: 3, maxBounds: [[-85, -200], [85, 200]], maxBoundsViscosity: 1, zoomControl: false })
    .setView(regions.india.center, regions.india.zoom);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  const tile = (url, attribution, extra = {}) => L.tileLayer(url, { attribution, maxZoom: 19, ...extra });
  // Vector basemaps: no tile server, works offline. Each palette = [background, land, border, graticule].
  const world = FV ? FV.world : await fetch('data/world.geojson').then(r => r.json());
  const PALETTES = {
    dark:    ['radial-gradient(ellipse at 50% 30%,#14233f,#05080f 75%)', '#1c2740', '#3d4e72', '#8fa3cc'],
    light:   ['linear-gradient(180deg,#dbeefa,#b9dcf0)', '#f8f6f0', '#cbc5b4', '#6f9ab4'],
    classic: ['radial-gradient(ellipse at 50% 40%,#ead9b6,#c9b48a 85%)', '#f4e9cd', '#8a6a3a', '#8a6a3a'],
    forest:  ['radial-gradient(ellipse at 50% 35%,#103329,#05120d 80%)', '#1e5a3b', '#52b57b', '#8fe0b0'],
    neon:    ['radial-gradient(ellipse at 50% 30%,#1a0c3a,#04010c 80%)', '#0d0b22', '#22e1ff', '#c06bff'],
    ocean:   ['linear-gradient(180deg,#0b5a93,#04284a)', '#e4d9b9', '#b3a574', '#9ccbec']
  };
  const grid = () => { const l = []; for (let x = -180; x <= 180; x += 10) l.push([[-85, x], [85, x]]); for (let y = -80; y <= 80; y += 10) l.push([[y, -180], [y, 180]]); return l; };
  const themes = {};                                  // built lazily: the world layer is large
  const getTheme = (k) => themes[k] ||= (k === 'osm'
    ? L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' })
    : (([bg, land, edge, line]) => {
        const g = L.featureGroup([
          L.geoJSON(world, { interactive: false, style: { fillColor: land, fillOpacity: 1, color: edge, weight: .8, opacity: .9 } }),
          L.polyline(grid(), { color: line, weight: .6, opacity: .2, dashArray: '2 7', interactive: false })]);
        g.on('add', () => { map.getContainer().style.background = bg; });
        return g; })(PALETTES[k]));
  const validTheme = (k) => PALETTES[k] || (k === 'osm' && !FV);
  if (!FV) $('#theme-options').insertAdjacentHTML('beforeend', '<button data-theme="osm">Street</button>');  // real tiles when online
  let theme = validTheme(store.get('fv-theme')) ? store.get('fv-theme') : 'dark';
  getTheme(theme).addTo(map);

  // ---- State ---------------------------------------------------------------
  const stateLayer = L.layerGroup().addTo(map);
  const markerLayer = L.layerGroup().addTo(map);
  let activeKey = null, markers = [], selected = null, statesGeo = null;
  const toast = (msg) => { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); };
  const logo = (k, id) => (FV ? FV.logos[k + '/' + id] : `logos/${k}/${id}.svg`);
  const isMobile = () => innerWidth <= 768;
  // Selection is a CSS class (no icon swap), so clicks animate smoothly instead of re-rendering the marker.
  const teamIcon = (team) => L.divIcon({ className: 'team-marker', html: `<img src="${logo(activeKey, team.id)}" alt="">`, iconSize: [40, 44], iconAnchor: [20, 22] });

  // Detail card: replaces popups, so the map never auto-pans under a bubble.
  function showCard(ts, heading) {
    const c = $('#card'), one = ts.length === 1 && !heading, t = ts[0], lg = leagues[activeKey];
    c.style.setProperty('--team', t.color);
    c.innerHTML = '<button class="x" aria-label="Close">&times;</button>' + (one
      ? `<div class="card-head"><img src="${logo(activeKey, t.id)}" alt=""><div><h3>${t.name}</h3><span>${lg.name}</span></div></div>
         <dl><dt>Home ground</dt><dd>${t.stadium}</dd>${t.state ? `<dt>Region</dt><dd>${t.state}</dd>` : ''}</dl>`
      : `<h3>${heading}</h3><span>${ts.length} teams</span>` + ts.map(x => `<button class="row" data-id="${x.id}"><img src="${logo(activeKey, x.id)}" alt=""><b>${x.name}</b><small>${x.stadium}</small></button>`).join(''));
    c.hidden = false; document.body.classList.add('card-open');
  }
  const hideCard = () => { $('#card').hidden = true; document.body.classList.remove('card-open'); };
  const padding = () => isMobile() ? { paddingTopLeft: [40, 70], paddingBottomRight: [40, 270] } : { paddingTopLeft: [350, 70], paddingBottomRight: [70, 70] };
  // Centre the team in the space left free by the card.
  function flyToTeam(team, z = 11) {
    const off = isMobile() ? [0, Math.round(innerHeight * .16)] : [-165, 0];
    map.flyTo(map.unproject(map.project(team.coords, z).add(off), z), z, { duration: 1 });
  }

  // Markers that would overlap on screen (same city or stadium) are fanned apart, with a leader line to the true spot.
  const leaders = L.layerGroup().addTo(map);
  function layoutMarkers() {
    const z = map.getZoom(), P = markers.map(m => map.project(m.team.coords, z)), cl = [];
    markers.forEach((m, i) => {                      // cluster by pixel distance
      const hit = cl.find(c => c.some(k => P[k].distanceTo(P[i]) < 46));
      hit ? hit.push(i) : cl.push([i]);
    });
    leaders.clearLayers();
    cl.forEach(c => {
      if (c.length === 1) return markers[c[0]].setLatLng(markers[c[0]].team.coords);
      const mid = c.reduce((a, k) => a.add(P[k]), L.point(0, 0)).divideBy(c.length), r = c.length === 2 ? 30 : Math.max(44, c.length * 16);
      c.sort((a, b) => P[a].x - P[b].x).forEach((k, n) => {
        const a = c.length === 2 ? (n ? 0 : Math.PI) : (2 * Math.PI * n) / c.length - Math.PI / 2;
        markers[k].setLatLng(map.unproject(mid.add([Math.cos(a) * r, Math.sin(a) * r]), z));
        L.polyline([markers[k].team.coords, markers[k].getLatLng()], { color: '#fff', weight: 1.5, opacity: .7, dashArray: '3 4', interactive: false }).addTo(leaders);
        L.circleMarker(markers[k].team.coords, { radius: 3, color: '#fff', weight: 1, fillColor: markers[k].team.color, fillOpacity: 1, interactive: false }).addTo(leaders);
      });
    });
  }

  function select(team) {
    markers.forEach(m => m._icon && m._icon.classList.toggle('selected', m.team === team));
    selected = team; team ? showCard([team]) : hideCard();
  }
  function focusTeam(team) { select(team); flyToTeam(team, 11); $('#edge-panel').classList.remove('open'); }

  function addMarkers(lg) {
    markerLayer.clearLayers(); markers = []; selected = null;
    lg.teams.forEach(team => {
      const m = L.marker(team.coords, { icon: teamIcon(team), riseOnHover: true }).addTo(markerLayer);
      m.team = team; m.bindTooltip(team.name, { direction: 'top', offset: [0, -24] });
      m._icon.setAttribute('aria-label', team.name);
      m.on('click', () => { select(team); flyToTeam(team, Math.max(map.getZoom(), 10)); });
      markers.push(m);
    });
    layoutMarkers();
  }

  // ---- Region overlays ----------------------------------------------------------
  function addStates(lg) {
    const byState = {};
    lg.teams.forEach(t => (byState[t.state] ||= []).push(t));
    L.geoJSON({ type: 'FeatureCollection', features: statesGeo.features.filter(f => f.properties.region === lg.region) }, {
      style: f => { const ts = byState[f.properties.st_nm];
        return ts ? { color: '#fff', weight: 1, opacity: .5, fillColor: ts[0].color, fillOpacity: .6, bubblingMouseEvents: false } : { fillOpacity: 0, weight: 0, interactive: false }; },
      onEachFeature: (f, layer) => {
        const ts = byState[f.properties.st_nm]; if (!ts) return;
        layer.bindTooltip(`<b>${f.properties.st_nm}</b><br>${ts.map(t => t.name).join('<br>')}`, { sticky: true });
        layer.on({
          mouseover: e => e.target.setStyle({ weight: 2.5, opacity: 1, fillOpacity: .78 }),
          mouseout: e => e.target.setStyle({ weight: 1, opacity: .5, fillOpacity: .6 }),
          click: () => {
            if (ts.length === 1) { select(ts[0]); flyToTeam(ts[0], 9); }
            else { select(null); showCard(ts, f.properties.st_nm); map.flyToBounds(L.latLngBounds(ts.map(t => t.coords)), { maxZoom: 9, duration: 1, ...padding() }); }
          }
        });
      }
    }).addTo(stateLayer);
  }
  function addHalos(lg) {                            // tiny island nations stay visible at low zoom
    const r = regions[lg.region].halo; if (!r) return;
    lg.teams.forEach(t => L.circle(t.coords, { radius: r, color: t.color, fillColor: t.color, weight: 1, opacity: .5, fillOpacity: .2, interactive: false }).addTo(stateLayer));
  }

  // ---- League switching ------------------------------------------------------------
  function splash(key) {
    const s = $('#league-splash');
    $('#splash-logo').src = logo(key, key);
    s.classList.remove('show'); void s.offsetWidth; s.classList.add('show');
    clearTimeout(splash.t); splash.t = setTimeout(() => s.classList.remove('show'), 1800);
  }
  function setActive(container, el) { container.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === el)); }

  async function loadLeague(key, { animate = true } = {}) {
    const lg = leagues[key]; if (!lg) return;
    activeKey = key; store.set('fv-league', key); try { history.replaceState(null, '', '#' + key); } catch {}
    if (animate) splash(key);
    const v = regions[lg.region];
    hideCard(); stopTour(); document.documentElement.style.setProperty('--accent', lg.color); map.flyTo(v.center, v.zoom, { duration: 1.4 });
    stateLayer.clearLayers();
    addMarkers(lg);
    try { statesGeo ||= FV ? FV.regions : await fetch('data/regions.geojson').then(r => r.json()); if (activeKey === key) { addStates(lg); addHalos(lg); } }
    catch { toast('Could not load region boundaries.'); }

    $('#chip-logo').src = logo(key, key); $('#chip-name').textContent = lg.name;
    $('#chip-count').textContent = `${lg.sport} · ${lg.teams.length} teams`;
    setActive($('#league-options'), $(`#league-options [data-league="${key}"]`));
    $('#team-list').innerHTML = lg.teams.map((t, i) =>
      `<li><button data-i="${i}"><img src="${logo(key, t.id)}" alt="">${t.name}</button></li>`).join('');
  }

  // ---- UI wiring -----------------------------------------------------------------
  $('#league-options').innerHTML = Object.entries(leagues).map(([k, l]) =>
    `<button data-league="${k}"><img src="${logo(k, k)}" alt="">${l.short}</button>`).join('');
  $('#league-options').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { loadLeague(b.dataset.league); $('#edge-panel').classList.remove('open'); $('#panel-toggle').setAttribute('aria-expanded', 'false'); } });
  $('#team-list').addEventListener('click', e => { const b = e.target.closest('button'); if (b) focusTeam(leagues[activeKey].teams[+b.dataset.i]); });
  $('#theme-options').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !validTheme(b.dataset.theme)) return;
    map.removeLayer(getTheme(theme)); theme = b.dataset.theme; getTheme(theme).addTo(map).bringToBack();
    store.set('fv-theme', theme); setActive($('#theme-options'), b);
  });
  const panel = $('#edge-panel');
  $('#panel-toggle').addEventListener('click', () => { const o = panel.classList.toggle('open'); $('#panel-toggle').setAttribute('aria-expanded', o); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
  $('#reset-view').addEventListener('click', () => {
    const v = regions[leagues[activeKey].region]; select(null); stopTour();
    map.flyTo(v.center, v.zoom, { duration: 1.2 }); panel.classList.remove('open');
  });
  // Guided tour: flies team to team for demos; any manual map interaction stops it.
  let tour = null;
  function stopTour() { clearInterval(tour); tour = null; $('#tour').textContent = 'Play tour'; }
  function startTour() {
    let i = 0; const ts = leagues[activeKey].teams;
    const step = () => { const t = ts[i++ % ts.length]; select(t); flyToTeam(t, 10); };
    step(); tour = setInterval(step, 5000); $('#tour').textContent = 'Stop tour'; panel.classList.remove('open');
  }
  $('#tour').addEventListener('click', () => (tour ? stopTour() : startTour()));
  ['pointerdown', 'wheel'].forEach(ev => map.getContainer().addEventListener(ev, () => tour && stopTour(), { passive: true }));
  $('#card').addEventListener('click', e => {
    if (e.target.closest('.x')) return select(null);
    const r = e.target.closest('.row'); if (r) { const t = leagues[activeKey].teams.find(x => x.id === r.dataset.id); select(t); flyToTeam(t, 10); }
  });
  map.on('click', () => select(null));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') select(null); });
  map.on('zoomend', layoutMarkers);
  map.on('tileerror', () => { if (!tileErrorShown) { tileErrorShown = true; toast('Map tiles failed to load. Check your connection.'); } });
  let tileErrorShown = false;
  setActive($('#theme-options'), $(`#theme-options [data-theme="${theme}"]`));

  const start = location.hash.slice(1);
  await loadLeague(leagues[start] ? start : leagues[store.get('fv-league')] ? store.get('fv-league') : 'ipl', { animate: false });
  window.__fanverse = { map, leagues, get markers() { return markers; }, loadLeague };
})();
