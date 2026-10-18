/* Home — a tvOS-style launcher for any TV browser.
   No frameworks, no build step: everything here is plain DOM + CSS transforms
   so it stays fast on low-power TV chips. */
(() => {
  'use strict';

  const COLS = 5;
  const ROW_H = 276;
  const STORE_KEY = 'home.v1';
  const LONG_PRESS_MS = 550;

  // ---------------------------------------------------------------- Glyphs
  const G = {
    play: '<path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z"/>',
    music: '<path d="M19 3.5v11.2a3.3 3.3 0 1 1-1.8-2.9V7.3L9.8 8.9v7.8a3.3 3.3 0 1 1-1.8-2.9V6.3a1 1 0 0 1 .8-1L17.8 3.5a1 1 0 0 1 1.2 1z"/>',
    chat: '<path d="M5 3h15a1 1 0 0 1 1 1v10.2a1 1 0 0 1-.3.7l-4.4 4.4a1 1 0 0 1-.7.3H12l-3 3H7v-3H4a1 1 0 0 1-1-1V6.2zm5 4.5v5h2v-5zm5 0v5h2v-5z"/>',
    globe: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15.6 15.6 0 0 0-1.3-6 8 8 0 0 1 4.3 6zM12 4c.9 1.2 1.8 3.6 2 7h-4c.2-3.4 1.1-5.8 2-7zM9.4 5a15.6 15.6 0 0 0-1.3 6h-3a8 8 0 0 1 4.3-6zm-4.3 8h3a15.6 15.6 0 0 0 1.3 6 8 8 0 0 1-4.3-6zM12 20c-.9-1.2-1.8-3.6-2-7h4c-.2 3.4-1.1 5.8-2 7zm2.6-1a15.6 15.6 0 0 0 1.3-6h3a8 8 0 0 1-4.3 6z"/>',
    tv: '<path d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5.5l1.5 2H8l1.5-2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>',
    gear: '<path d="M13.8 2.5l.5 2.4c.6.2 1.2.5 1.7.9l2.3-.8 1.8 3.1-1.8 1.6a7.4 7.4 0 0 1 0 2l1.8 1.6-1.8 3.1-2.3-.8c-.5.4-1.1.7-1.7.9l-.5 2.4h-3.6l-.5-2.4c-.6-.2-1.2-.5-1.7-.9l-2.3.8-1.8-3.1 1.8-1.6a7.4 7.4 0 0 1 0-2L2.9 8.1l1.8-3.1 2.3.8c.5-.4 1.1-.7 1.7-.9l.5-2.4zM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z"/>',
    plus: '<path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/>',
    film: '<path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v2h2V6zm12 0v2h2V6zM5 10v4h2v-4zm12 0v4h2v-4zM5 16v2h2v-2zm12 0v2h2v-2zM9 6v12h6V6z"/>',
    star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>',
    game: '<path d="M7 6h10a5 5 0 0 1 4.9 6l-1 4.6a2.6 2.6 0 0 1-4.5 1.1L14.3 15H9.7l-2.1 2.7a2.6 2.6 0 0 1-4.5-1.1L2.1 12A5 5 0 0 1 7 6zm0 3v1.5H5.5v2H7V14h2v-1.5h1.5v-2H9V9zm9.5 0a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zm-2 2.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>',
    photo: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 14h16l-5-7-4 5-3-3.5zM8 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>',
    news: '<path d="M4 4h13a1 1 0 0 1 1 1v13a2 2 0 0 0 2 2H6a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1zm2 3v4h5V7zm7 0v2h3V7zm0 3v1h3v-1zM6 13v1.5h10V13zm0 3v1.5h10V16zm13-8h2v10a1 1 0 0 1-2 0z"/>',
    radio: '<path d="M4 8h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zm4 3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM14 12v1.5h5V12zm0 3v1.5h5V15zM7 3.5l11.5-1.3.2 1.8L9.6 5.1 9 8H7z"/>',
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${G[name] || G.globe}</svg>`;

  // ---------------------------------------------------------------- Palettes
  // Swatches for user-added apps (a = light corner, b = dark corner)
  const SWATCHES = [
    ['#5e5ce6', '#2c2a99'], ['#0a84ff', '#003f8a'], ['#30d158', '#0b6b2a'], ['#ff9f0a', '#a34a00'],
    ['#ff375f', '#8a0022'], ['#bf5af2', '#5a1a8a'], ['#64d2ff', '#0b5c7a'], ['#ffd60a', '#a07800'],
    ['#8e8e93', '#2c2c2e'], ['#2c2c2e', '#000000'],
  ];

  const WALLPAPERS = {
    auto:     null,
    aurora:   ['#03110f', '#0b5f55', '#30d1a0', '#6a3cc9'],
    midnight: ['#04040c', '#14164a', '#3a3fd1', '#7b2fbf'],
    sunset:   ['#120406', '#6d1530', '#ff7a45', '#c2337a'],
    ocean:    ['#020a14', '#08386b', '#1fa7ff', '#0fb5a8'],
    graphite: ['#060607', '#1d1d22', '#4a4a55', '#2c2c35'],
  };
  const WALL_NAMES = { auto: 'Follow App', aurora: 'Aurora', midnight: 'Midnight', sunset: 'Sunset', ocean: 'Ocean', graphite: 'Graphite' };

  // ---------------------------------------------------------------- Default apps
  const DEFAULT_APPS = [
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com/tv', a: '#ff3b30', b: '#a80c00', glyph: 'play', word: 'YouTube', kicker: 'Watch', tagline: 'Videos, Shorts and live streams from everyone you follow.' },
    { id: 'netflix', name: 'Netflix', url: 'https://www.netflix.com', a: '#1c1c1e', b: '#000000', word: 'NETFLIX', ink: '#e50914', wordClass: 'wide', hero: ['#0c0000', '#4a0004', '#e50914', '#7a0010'], kicker: 'Stream', tagline: 'Series, films and documentaries — pick up where you left off.' },
    { id: 'prime', name: 'Prime Video', url: 'https://www.primevideo.com', a: '#1fa7ff', b: '#0b3d91', word: 'prime video', wordClass: 'sm', kicker: 'Stream', tagline: 'Originals, movies and live sport.' },
    { id: 'disney', name: 'Disney+', url: 'https://www.disneyplus.com', a: '#1d4bb8', b: '#081236', word: 'Disney+', kicker: 'Stream', tagline: 'Disney, Pixar, Marvel, Star Wars and National Geographic.' },
    { id: 'appletv', name: 'Apple TV', url: 'https://tv.apple.com', a: '#3a3a3e', b: '#0b0b0d', glyph: 'tv', word: 'tv', hero: ['#050506', '#1d1d24', '#5b5b6a', '#2b3a5c'], kicker: 'Stream', tagline: 'Apple Originals — award-winning series and films.' },
    { id: 'max', name: 'Max', url: 'https://play.max.com', a: '#3d2bff', b: '#0a0a4a', word: 'max', kicker: 'Stream', tagline: 'HBO, blockbusters and binge-worthy series.' },
    { id: 'spotify', name: 'Spotify', url: 'https://open.spotify.com', a: '#1ed760', b: '#0a6b2d', glyph: 'music', word: 'Spotify', wordClass: 'sm', kicker: 'Listen', tagline: 'Music and podcasts for every moment.' },
    { id: 'twitch', name: 'Twitch', url: 'https://www.twitch.tv', a: '#9146ff', b: '#3d1690', glyph: 'chat', word: 'Twitch', wordClass: 'sm', kicker: 'Live', tagline: 'Live streams, gaming and creators.' },
    { id: 'ytmusic', name: 'YouTube Music', url: 'https://music.youtube.com', a: '#ff4e45', b: '#5c0a06', glyph: 'music', word: 'Music', wordClass: 'sm', kicker: 'Listen', tagline: 'Songs, albums, mixes and music videos.' },
    { id: 'plex', name: 'Plex', url: 'https://app.plex.tv', a: '#ffbf1f', b: '#b07600', word: 'plex', ink: '#1f1f1f', kicker: 'Library', tagline: 'Your personal media library, anywhere.' },
    { id: 'pluto', name: 'Pluto TV', url: 'https://pluto.tv', a: '#2b2b2b', b: '#0e0e0e', word: 'pluto tv', ink: '#fff200', wordClass: 'sm', hero: ['#0a0a00', '#3a3800', '#c8be00', '#6b5200'], kicker: 'Free TV', tagline: 'Hundreds of free live channels.' },
    { id: 'search', name: 'Search', url: 'https://www.google.com', a: '#4c8dff', b: '#1a3fa0', glyph: 'globe', word: 'Search', wordClass: 'sm', kicker: 'Web', tagline: 'Search the web from your TV.' },
    { id: 'settings', name: 'Settings', a: '#8e8e93', b: '#2c2c2e', glyph: 'gear', builtin: true, kicker: 'System', tagline: 'Wallpaper, clock, weather, screensaver and your apps.' },
  ];
  const ADD_TILE = { id: '__add', name: 'Add App', a: 'rgba(255,255,255,.14)', b: 'rgba(255,255,255,.06)', glyph: 'plus', builtin: true, kicker: 'Home', tagline: 'Pin any website or streaming service to your Home screen.' };

  const DEFAULT_SETTINGS = { wallpaper: 'auto', clock24: true, city: '', lat: null, lon: null, place: '', calm: false, lite: false, saver: 5 };

  // ---------------------------------------------------------------- Storage
  const store = {
    load() {
      try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch { return null; }
    },
    save() {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ custom: state.custom, order: state.order, settings: state.settings, edits: state.edits }));
      } catch { /* private mode / blocked storage — Home still works for this session */ }
    },
  };

  const saved = store.load() || {};
  const state = {
    custom: saved.custom || [],        // user-added apps
    edits: saved.edits || {},          // overrides for built-in app fields
    order: saved.order || DEFAULT_APPS.map(a => a.id),
    settings: Object.assign({}, DEFAULT_SETTINGS, saved.settings || {}),
    focus: 0,
    mode: 'home',          // home | menu | settings | form | move | saver
    lastDir: 'right',
  };

  function allApps() {
    const map = {};
    DEFAULT_APPS.forEach(a => { map[a.id] = Object.assign({}, a, state.edits[a.id] || {}); });
    state.custom.forEach(a => { map[a.id] = a; });
    return map;
  }
  let APPS = allApps();
  // drop ids that no longer exist, keep Settings reachable no matter what
  state.order = state.order.filter(id => APPS[id]);
  if (!state.order.includes('settings')) state.order.push('settings');

  const visible = () => state.order.map(id => APPS[id]).concat([ADD_TILE]);

  // ---------------------------------------------------------------- DOM refs
  const $ = (s) => document.querySelector(s);
  const stage = $('#stage'), grid = $('#grid');
  const layers = Array.from(document.querySelectorAll('.hero-layer'));
  const shelf = $('#shelf'), shelfTitle = $('#shelf-title'), shelfTag = $('#shelf-tagline'), shelfKicker = $('#shelf-kicker');
  let cells = [];

  // ---------------------------------------------------------------- Color helpers
  function hexToRgb(h) {
    const m = /^#?([\da-f]{6})$/i.exec(h || '');
    if (!m) return null;
    const n = parseInt(m[1], 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }
  const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  function mix(h, t, amt) {
    const a = hexToRgb(h), b = hexToRgb(t);
    if (!a || !b) return h;
    return rgbToHex(a[0] + (b[0] - a[0]) * amt, a[1] + (b[1] - a[1]) * amt, a[2] + (b[2] - a[2]) * amt);
  }
  function heroPalette(app) {
    if (app.hero) return app.hero;
    const a = hexToRgb(app.a) ? app.a : '#5e5ce6';
    const b = hexToRgb(app.b) ? app.b : '#2c2a99';
    return [mix(b, '#000000', .82), mix(b, '#000000', .25), a, mix(a, '#7b2fbf', .45)];
  }

  // ---------------------------------------------------------------- Rendering
  function markHTML(app) {
    const ink = app.ink ? ` style="color:${app.ink}"` : '';
    const glyph = app.glyph ? svg(app.glyph) : '';
    const word = app.word ? `<span class="word ${app.wordClass || ''}">${esc(app.word)}</span>` : '';
    if (!glyph && !word) return `<div class="mark"><span class="word">${esc(initials(app.name))}</span></div>`;
    return `<div class="mark"${ink}>${glyph}${word}</div>`;
  }
  const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function paintTile(el, app) {
    el.style.setProperty('--a', app.a);
    el.style.setProperty('--b', app.b);
  }

  function renderGrid() {
    APPS = allApps();
    const list = visible();
    grid.innerHTML = list.map((app, i) => `
      <div class="cell" data-i="${i}" role="gridcell" aria-label="${esc(app.name)}">
        <div class="tile"><div class="tile-face">${markHTML(app)}</div></div>
        <div class="label">${esc(app.name)}</div>
      </div>`).join('');
    cells = Array.from(grid.children);
    cells.forEach((c, i) => paintTile(c.querySelector('.tile'), list[i]));
    state.focus = Math.min(state.focus, list.length - 1);
    setFocus(state.focus, { force: true });
  }

  // ---------------------------------------------------------------- Focus & top shelf
  let heroTimer = 0, activeLayer = 0, lastHeroKey = '';

  function setFocus(i, opts = {}) {
    const list = visible();
    i = Math.max(0, Math.min(list.length - 1, i));
    const prev = cells[state.focus];
    if (prev && prev !== cells[i]) prev.classList.remove('focus');
    state.focus = i;
    const cell = cells[i];
    if (!cell) return;
    cell.classList.add('focus');
    aimHighlight(cell, state.lastDir);

    const row = Math.floor(i / COLS);
    const gridMode = row > 0;
    stage.classList.toggle('grid-mode', gridMode);
    grid.style.transform = gridMode ? `translate3d(0, ${-310 - row * ROW_H}px, 0)` : 'translate3d(0,0,0)';

    const app = list[i];
    if (opts.force || shelfTitle.dataset.id !== app.id) {
      shelfTitle.dataset.id = app.id;
      shelfKicker.textContent = app.kicker || 'App';
      shelfTitle.textContent = app.name;
      shelfTag.textContent = app.tagline || hostOf(app.url) || '';
      shelf.classList.remove('swap'); void shelf.offsetWidth; shelf.classList.add('swap');
    }
    // debounce the backdrop so fast scrolling doesn't thrash the GPU
    clearTimeout(heroTimer);
    heroTimer = setTimeout(() => setHero(app), opts.force ? 0 : 140);
  }

  function setHero(app) {
    const w = WALLPAPERS[state.settings.wallpaper];
    const pal = w || heroPalette(app);
    const key = pal.join();
    if (key === lastHeroKey) return;
    lastHeroKey = key;
    activeLayer ^= 1;
    const on = layers[activeLayer], off = layers[activeLayer ^ 1];
    ['--l1', '--l2', '--l3', '--l4'].forEach((v, k) => on.style.setProperty(v, pal[k]));
    on.classList.add('on');
    off.classList.remove('on');
  }

  function aimHighlight(cell, dir) {
    const face = cell.querySelector('.tile-face');
    const pos = { left: ['-75%', '-55%'], right: ['-25%', '-55%'], up: ['-50%', '-80%'], down: ['-50%', '-30%'] }[dir] || ['-40%', '-60%'];
    face.style.setProperty('--gx', pos[0]);
    face.style.setProperty('--gy', pos[1]);
    face.style.setProperty('--rx', '0deg');
    face.style.setProperty('--ry', '0deg');
  }

  function bump(dir) {
    const c = cells[state.focus];
    if (!c) return;
    const cls = 'bump-' + dir;
    c.classList.remove('bump-left', 'bump-right', 'bump-up', 'bump-down');
    void c.offsetWidth;
    c.classList.add(cls);
    setTimeout(() => c.classList.remove(cls), 400);
  }

  function moveFocus(dir) {
    const n = visible().length;
    const i = state.focus, col = i % COLS;
    let j = i;
    if (dir === 'left') j = col > 0 ? i - 1 : i;
    if (dir === 'right') j = col < COLS - 1 && i + 1 < n ? i + 1 : i;
    if (dir === 'up') j = i - COLS >= 0 ? i - COLS : i;
    if (dir === 'down') j = i + COLS < n ? i + COLS : (Math.floor(i / COLS) < Math.floor((n - 1) / COLS) ? n - 1 : i);
    state.lastDir = dir;
    if (j === i) return bump(dir);
    setFocus(j);
  }

  const hostOf = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };

  // ---------------------------------------------------------------- Launching
  function activate(i = state.focus) {
    const app = visible()[i];
    if (!app) return;
    const c = cells[i];
    c.classList.add('press');
    setTimeout(() => c.classList.remove('press'), 140);
    if (app.id === '__add') return openForm(null);
    if (app.id === 'settings') return openSettings();
    launch(app, c);
  }

  function launch(app, cell) {
    let url = app.url;
    try { url = new URL(url).href; } catch { return toast('That address doesn’t look right — edit the app to fix it.'); }
    const r = cell.querySelector('.tile').getBoundingClientRect();
    const fx = $('#launch');
    fx.style.transition = 'none';
    Object.assign(fx.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: 16 * scale + 'px', background: `linear-gradient(145deg, ${app.a}, ${app.b})` });
    void fx.offsetWidth;
    fx.style.transition = '';
    fx.classList.add('go');
    Object.assign(fx.style, { left: '0px', top: '0px', width: innerWidth + 'px', height: innerHeight + 'px', borderRadius: '0px' });
    setTimeout(() => { location.href = url; }, 380);
    // if navigation is blocked (popup rules, offline), fade back to Home
    setTimeout(resetLaunch, 4000);
  }
  function resetLaunch() { const fx = $('#launch'); fx.classList.remove('go'); fx.style.width = '0px'; }
  addEventListener('pageshow', resetLaunch);

  // ---------------------------------------------------------------- Generic list navigation for overlays
  function listNav(items, idx, onChange) {
    items.forEach((el, k) => el.classList.toggle('focus', k === idx));
    if (items[idx] && items[idx].scrollIntoView) items[idx].scrollIntoView({ block: 'nearest' });
    if (onChange) onChange(idx);
    return idx;
  }

  // ---------------------------------------------------------------- Context menu (Hold OK)
  let menuItems = [], menuIdx = 0;

  function openMenu(i = state.focus) {
    const app = visible()[i];
    if (!app || app.id === '__add') return openForm(null);
    const mt = $('#menu-icon');
    mt.innerHTML = markHTML(app); paintTile(mt, app);
    $('#menu-title').textContent = app.name;
    const opts = [{ t: 'Open', fn: () => { closeOverlay(); activate(i); } }, { t: 'Move', fn: () => { closeOverlay(); startMove(); } }];
    if (app.id !== 'settings') {
      opts.push({ t: 'Edit', fn: () => { closeOverlay(); openForm(app); } });
      opts.push({ t: 'Remove from Home', danger: true, fn: () => { closeOverlay(); removeApp(app); } });
    }
    opts.push({ t: 'Cancel', fn: closeOverlay });
    const box = $('#menu-items');
    box.innerHTML = opts.map(o => `<div class="item${o.danger ? ' danger' : ''}">${o.t}</div>`).join('');
    menuItems = Array.from(box.children);
    menuItems.forEach((el, k) => {
      el.onmouseenter = () => { menuIdx = listNav(menuItems, k); };
      el.onclick = () => opts[k].fn();
    });
    menuItems.opts = opts;
    menuIdx = listNav(menuItems, 0);
    show('#menu'); state.mode = 'menu';
  }

  function removeApp(app) {
    state.order = state.order.filter(id => id !== app.id);
    state.custom = state.custom.filter(a => a.id !== app.id);
    store.save(); renderGrid();
    toast(`${app.name} removed · add it back with + Add App`);
  }

  // ---------------------------------------------------------------- Move mode
  function startMove() {
    if (state.focus >= state.order.length) return;
    state.mode = 'move';
    grid.classList.add('editing');
    cells[state.focus].classList.add('moving');
    toast('Use the arrows to move · OK when done');
  }
  function moveTile(dir) {
    const i = state.focus, n = state.order.length, col = i % COLS;
    let j = i;
    if (dir === 'left' && col > 0) j = i - 1;
    if (dir === 'right' && col < COLS - 1 && i + 1 < n) j = i + 1;
    if (dir === 'up' && i - COLS >= 0) j = i - COLS;
    if (dir === 'down' && i + COLS < n) j = i + COLS;
    if (j === i) return bump(dir);
    const [id] = state.order.splice(i, 1);
    state.order.splice(j, 0, id);
    state.focus = j;
    renderGrid();
    grid.classList.add('editing');
    cells[j].classList.add('moving');
  }
  function endMove() {
    state.mode = 'home';
    grid.classList.remove('editing');
    cells.forEach(c => c.classList.remove('moving'));
    store.save();
  }

  // ---------------------------------------------------------------- Settings
  let setItems = [], setIdx = 0, setDefs = [];
  const SAVER_STEPS = [2, 5, 10, 20, 0];

  function settingsDefs() {
    const s = state.settings;
    const wallKeys = Object.keys(WALLPAPERS);
    const cycle = (arr, cur, d) => arr[(arr.indexOf(cur) + d + arr.length) % arr.length];
    return [
      { label: 'Wallpaper', val: () => WALL_NAMES[s.wallpaper], change: d => { s.wallpaper = cycle(wallKeys, s.wallpaper, d); lastHeroKey = ''; setHero(visible()[state.focus]); } },
      { label: 'Clock', val: () => s.clock24 ? '24-hour' : '12-hour', change: () => { s.clock24 = !s.clock24; tickClock(); } },
      { label: 'Weather', input: true, val: () => s.place || 'Off — OK to set city' },
      { label: 'Screensaver', val: () => s.saver ? `After ${s.saver} min` : 'Never', change: d => { s.saver = cycle(SAVER_STEPS, s.saver, d); armSaver(); } },
      { label: 'Motion', val: () => s.calm ? 'Reduced' : 'Full', change: () => { s.calm = !s.calm; applyBodyFlags(); } },
      { label: 'Glass Effects', val: () => s.lite ? 'Off (faster)' : 'On', change: () => { s.lite = !s.lite; applyBodyFlags(); } },
      { label: 'Start Screensaver', action: () => { closeOverlay(); startSaver(); } },
      { label: 'Add App…', action: () => { closeOverlay(); openForm(null); } },
      { label: 'Reset Home Screen', danger: true, action: (el) => {
        if (el.dataset.armed) {
          state.order = DEFAULT_APPS.map(a => a.id); state.custom = []; state.edits = {};
          store.save(); closeOverlay(); state.focus = 0; renderGrid(); toast('Home Screen reset');
        } else { el.dataset.armed = '1'; el.querySelector('.val').textContent = 'Press OK again'; }
      } },
    ];
  }

  function renderSettings() {
    setDefs = settingsDefs();
    const box = $('#settings-items');
    box.innerHTML = setDefs.map(d => `<div class="item${d.danger ? ' danger' : ''}"><span>${d.label}</span><span class="val">${d.val ? `<span class="arr">◀</span><span class="v">${esc(d.val())}</span><span class="arr">▶</span>` : ''}</span></div>`).join('');
    setItems = Array.from(box.children);
    setItems.forEach((el, k) => {
      el.onmouseenter = () => { setIdx = listNav(setItems, k); };
      el.onclick = () => settingsEnter();
    });
    setIdx = listNav(setItems, setIdx);
  }
  function refreshSettingVal(k) {
    const d = setDefs[k], v = setItems[k] && setItems[k].querySelector('.v');
    if (d && d.val && v) v.textContent = d.val();
  }

  function openSettings() { setIdx = 0; renderSettings(); show('#settings'); state.mode = 'settings'; }

  function settingsChange(d) {
    const def = setDefs[setIdx];
    if (def && def.change) { def.change(d); refreshSettingVal(setIdx); store.save(); }
  }
  function settingsEnter() {
    const def = setDefs[setIdx], el = setItems[setIdx];
    if (!def) return;
    if (def.action) return def.action(el);
    if (def.input) return editCity(el);
    if (def.change) settingsChange(1);
  }

  function editCity(el) {
    const v = el.querySelector('.val');
    v.innerHTML = `<input class="inline" value="${esc(state.settings.city)}" placeholder="City, e.g. Prishtina" style="background:transparent;border:0;outline:0;font:inherit;color:inherit;text-align:right;width:420px">`;
    const inp = v.querySelector('input');
    state.mode = 'settings-input';
    inp.focus();
    const done = async (commit) => {
      if (state.mode !== 'settings-input') return;
      state.mode = 'settings';
      const city = inp.value.trim();
      if (commit) await setCity(city);
      renderSettings();
    };
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(true); }
      else if (isBack(e)) { e.preventDefault(); e.stopPropagation(); done(false); }
      else e.stopPropagation();
    });
    inp.addEventListener('blur', () => done(true));
  }

  // ---------------------------------------------------------------- Add / edit form
  let formItems = [], formIdx = 0, formSwatch = 0, formEditing = null;

  function openForm(app) {
    formEditing = app;
    $('#form-title').textContent = app ? `Edit ${app.name}` : 'Add App';
    $('#f-name').value = app ? app.name : '';
    $('#f-url').value = app ? (app.url || '') : '';
    const sw = $('#f-colors');
    sw.innerHTML = SWATCHES.map(([a, b]) => `<div class="sw" style="--a:${a};--b:${b}"></div>`).join('');
    formSwatch = app ? Math.max(0, SWATCHES.findIndex(([a]) => a === app.a)) : Math.floor(Math.random() * 8);
    formItems = Array.from(document.querySelectorAll('#form .nav'));
    formItems.forEach((el, k) => {
      el.onmouseenter = () => { formIdx = listNav(formItems, k); };
      el.onclick = (e) => { formIdx = listNav(formItems, k); if (el.tagName === 'BUTTON') { e.preventDefault(); formEnter(); } };
    });
    Array.from(sw.children).forEach((el, k) => { el.onclick = () => { formSwatch = k; updateFormPreview(); }; });
    ['#f-name', '#f-url'].forEach(s => { $(s).oninput = updateFormPreview; });
    formIdx = listNav(formItems, 0);
    updateFormPreview();
    show('#form'); state.mode = 'form';
  }

  function formDraft() {
    const name = $('#f-name').value.trim();
    const [a, b] = SWATCHES[formSwatch];
    const base = formEditing && !formEditing.id.startsWith('c_') ? formEditing : {};
    return { name, a, b, glyph: base.glyph, word: base.glyph || base.word ? base.word : name, wordClass: name.length > 9 ? 'sm' : '', ink: base.ink };
  }
  function updateFormPreview() {
    const d = formDraft();
    const t = $('#form-tile');
    t.querySelector('.tile-face').innerHTML = markHTML(Object.assign({}, d, { name: d.name || 'App', word: d.word || '' }));
    paintTile(t, d);
    Array.from($('#f-colors').children).forEach((el, k) => el.classList.toggle('on', k === formSwatch));
  }

  function normalizeUrl(u) {
    u = u.trim();
    if (!u) return '';
    if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u;
    try { return new URL(u).href; } catch { return ''; }
  }

  function saveForm() {
    const d = formDraft();
    const url = normalizeUrl($('#f-url').value);
    if (!d.name) return toast('Give the app a name');
    if (!url) return toast('Enter a web address, e.g. netflix.com');
    if (formEditing) {
      const patch = { name: d.name, url, a: d.a, b: d.b, hero: null };
      if (formEditing.id.startsWith('c_')) {
        const c = state.custom.find(x => x.id === formEditing.id);
        Object.assign(c, patch, { word: d.name, wordClass: d.wordClass });
      } else {
        // keep the original brand look unless the color was changed
        if (d.a === formEditing.a) { delete patch.a; delete patch.b; delete patch.hero; }
        state.edits[formEditing.id] = Object.assign({}, state.edits[formEditing.id], patch);
      }
    } else {
      const id = 'c_' + Date.now().toString(36);
      state.custom.push({ id, name: d.name, url, a: d.a, b: d.b, word: d.name, wordClass: d.wordClass, kicker: 'Web App', tagline: hostOf(url) });
      const at = state.order.indexOf('settings');
      state.order.splice(at < 0 ? state.order.length : at, 0, id);
      state.focus = state.order.indexOf(id);
    }
    store.save(); closeOverlay(); renderGrid();
    toast(formEditing ? 'Saved' : `${d.name} added to Home`);
  }

  function formEnter() {
    const el = formItems[formIdx], k = el.dataset.k;
    if (k === 'name' || k === 'url') {
      const inp = el.querySelector('input');
      inp.focus();
      return;
    }
    if (k === 'save') return saveForm();
    if (k === 'cancel') return closeOverlay();
    if (k === 'color') { formSwatch = (formSwatch + 1) % SWATCHES.length; updateFormPreview(); }
  }

  // ---------------------------------------------------------------- Overlay helpers
  function show(sel) { document.querySelectorAll('.overlay').forEach(o => { o.hidden = true; }); $(sel).hidden = false; }
  function closeOverlay() {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    document.querySelectorAll('.overlay').forEach(o => { o.hidden = true; });
    state.mode = 'home';
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ---------------------------------------------------------------- Clock & weather
  function fmtTime(d) {
    let h = d.getHours(); const m = String(d.getMinutes()).padStart(2, '0');
    if (state.settings.clock24) return `${String(h).padStart(2, '0')}:${m}`;
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${h}:${m} ${ap}`;
  }
  let clockTimer = 0;
  function tickClock() {
    const d = new Date();
    $('#clock').textContent = fmtTime(d);
    $('#saver-time').textContent = fmtTime(d).replace(/ (AM|PM)/, '');
    $('#saver-date').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + (weatherText ? ` · ${weatherText}` : '');
    clearTimeout(clockTimer);
    clockTimer = setTimeout(tickClock, 60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 30);
  }

  const WX = {
    sun: '<circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></g>',
    cloud: '<path d="M7 19a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 19 9.5 4.8 4.8 0 0 1 18 19z"/>',
    part: '<circle cx="8" cy="8" r="3.4"/><path d="M9 20a4.4 4.4 0 0 1-.5-8.8 5.7 5.7 0 0 1 11 1.5A3.7 3.7 0 0 1 19 20z"/>',
    rain: '<path d="M7 15a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 19 5.5 4.8 4.8 0 0 1 18 15z"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g>',
    snow: '<path d="M7 14a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 19 4.5 4.8 4.8 0 0 1 18 14z"/><g fill="currentColor"><circle cx="8" cy="18" r="1.3"/><circle cx="12" cy="20" r="1.3"/><circle cx="16" cy="18" r="1.3"/></g>',
    storm: '<path d="M7 14a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 19 4.5 4.8 4.8 0 0 1 18 14z"/><path d="M13 13l-3 5h3l-2 5 5-7h-3l2-3z"/>',
    fog: '<g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></g>',
  };
  const wxKind = (c) => c === 0 ? 'sun' : c <= 2 ? 'part' : c === 3 ? 'cloud' : c <= 48 ? 'fog' : c <= 67 || (c >= 80 && c <= 82) ? 'rain' : c <= 86 ? 'snow' : 'storm';
  let weatherText = '', weatherTimer = 0;

  async function setCity(city) {
    const s = state.settings;
    s.city = city;
    if (!city) { s.lat = s.lon = null; s.place = ''; store.save(); renderWeather(null); return; }
    try {
      const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(city)}`);
      const j = await r.json();
      let g = j.results && j.results[0] && { lat: j.results[0].latitude, lon: j.results[0].longitude, place: j.results[0].name };
      if (!g) {
        // local spellings (e.g. "Prishtina") are often only known to OpenStreetMap
        const o = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`)).json();
        if (o[0]) g = { lat: +o[0].lat, lon: +o[0].lon, place: (o[0].name || o[0].display_name.split(',')[0]) };
      }
      if (!g) { toast(`Couldn’t find “${city}”`); return; }
      Object.assign(s, g);
      store.save(); loadWeather();
    } catch { toast('Weather is unavailable right now'); }
  }

  async function loadWeather() {
    const s = state.settings;
    clearTimeout(weatherTimer);
    if (s.lat == null) return renderWeather(null);
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${s.lat}&longitude=${s.lon}&current=temperature_2m,weather_code`);
      const j = await r.json();
      renderWeather({ t: Math.round(j.current.temperature_2m), code: j.current.weather_code });
    } catch { /* keep the last reading */ }
    weatherTimer = setTimeout(loadWeather, 30 * 60 * 1000);
  }
  function renderWeather(w) {
    const el = $('#weather');
    if (!w) { el.hidden = true; weatherText = ''; return; }
    el.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">${WX[wxKind(w.code)]}</svg><span>${w.t}°</span>`;
    el.hidden = false;
    weatherText = `${state.settings.place} ${w.t}°`;
    tickClock();
  }

  // ---------------------------------------------------------------- Screensaver
  let saverTimer = 0;
  function armSaver() {
    clearTimeout(saverTimer);
    const m = state.settings.saver;
    if (m && state.mode !== 'saver') saverTimer = setTimeout(startSaver, m * 60000);
  }
  function startSaver() {
    if (state.mode === 'form' || state.mode === 'settings-input') return armSaver();
    const s = $('#saver');
    const pick = visible().filter(a => a.id !== '__add');
    const cur = visible()[state.focus];
    const pal = heroPalette(cur && cur.id !== '__add' ? cur : pick[0]);
    const other = heroPalette(pick[Math.floor(Math.random() * pick.length)]);
    const art = s.querySelector('.saver-art');
    [pal[2], pal[3], other[2], other[3]].forEach((c, k) => art.style.setProperty('--s' + (k + 1), c));
    closeOverlay();
    if (state.mode === 'move') endMove();
    tickClock();
    s.hidden = false;
    state.mode = 'saver';
  }
  function stopSaver() { $('#saver').hidden = true; state.mode = 'home'; armSaver(); }

  // ---------------------------------------------------------------- Input
  const BACK_CODES = new Set([8, 27, 461, 10009, 166, 196]);
  const isBack = (e) => e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack' || e.key === 'BrowserBack' || BACK_CODES.has(e.keyCode);
  const DIRS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', 37: 'left', 39: 'right', 38: 'up', 40: 'down' };
  const isEnter = (e) => e.key === 'Enter' || e.keyCode === 13 || e.keyCode === 29443;
  const isMenuKey = (e) => e.key === 'ContextMenu' || e.keyCode === 93 || e.key === 'm' || e.key === 'M';
  const COLOR = { 403: 'red', 404: 'green', 405: 'yellow', 406: 'blue', ColorF0Red: 'red', ColorF1Green: 'green', ColorF2Yellow: 'yellow', ColorF3Blue: 'blue' };

  let pressTimer = 0, longFired = false, enterDown = false;

  document.addEventListener('keydown', (e) => {
    document.body.classList.add('keys');
    armSaver();
    const dir = DIRS[e.key] || DIRS[e.keyCode];
    const color = COLOR[e.key] || COLOR[e.keyCode];
    const mode = state.mode;

    if (mode === 'saver') { e.preventDefault(); return stopSaver(); }

    // typing in a text field: only intercept up/down/back so the native keyboard works
    const typing = document.activeElement && document.activeElement.tagName === 'INPUT';
    if (typing && mode === 'form') {
      if (dir === 'up' || dir === 'down' || isEnter(e) || isBack(e)) {
        e.preventDefault();
        document.activeElement.blur();
        if (dir === 'up') formIdx = listNav(formItems, Math.max(0, formIdx - 1));
        else if (dir === 'down' || isEnter(e)) formIdx = listNav(formItems, Math.min(formItems.length - 2, formIdx + 1));
      }
      return;
    }

    if (mode === 'home') {
      if (dir) { e.preventDefault(); return moveFocus(dir); }
      if (isEnter(e)) {
        e.preventDefault();
        if (e.repeat || enterDown) return;
        enterDown = true; longFired = false;
        clearTimeout(pressTimer);
        pressTimer = setTimeout(() => { longFired = true; openMenu(); }, LONG_PRESS_MS);
        return;
      }
      if (isMenuKey(e) || color === 'blue') { e.preventDefault(); return openSettings(); }
      if (color === 'red') { e.preventDefault(); return openMenu(); }
      if (color === 'yellow') { e.preventDefault(); return openForm(null); }
      if (color === 'green') { e.preventDefault(); return startSaver(); }
      if (isBack(e)) { e.preventDefault(); if (state.focus !== 0) { state.lastDir = 'up'; setFocus(0); } return; }
      return;
    }

    if (mode === 'move') {
      e.preventDefault();
      if (dir) return moveTile(dir);
      if ((isEnter(e) && !e.repeat) || isBack(e)) return endMove();
      return;
    }

    if (mode === 'menu') {
      e.preventDefault();
      if (dir === 'up' || dir === 'down') menuIdx = listNav(menuItems, Math.max(0, Math.min(menuItems.length - 1, menuIdx + (dir === 'up' ? -1 : 1))));
      else if (isEnter(e) && !e.repeat && !enterDown) menuItems.opts[menuIdx].fn();
      else if (isBack(e)) closeOverlay();
      return;
    }

    if (mode === 'settings') {
      e.preventDefault();
      if (dir === 'up' || dir === 'down') {
        if (setItems[setIdx]) delete setItems[setIdx].dataset.armed;
        setIdx = listNav(setItems, Math.max(0, Math.min(setItems.length - 1, setIdx + (dir === 'up' ? -1 : 1))));
      } else if (dir === 'left' || dir === 'right') settingsChange(dir === 'left' ? -1 : 1);
      else if (isEnter(e) && !e.repeat) settingsEnter();
      else if (isBack(e) || isMenuKey(e)) closeOverlay();
      return;
    }

    if (mode === 'form') {
      e.preventDefault();
      const k = formItems[formIdx].dataset.k;
      if (dir === 'up' || dir === 'down') {
        let j = formIdx + (dir === 'up' ? -1 : 1);
        if (dir === 'down' && k === 'save') j = formIdx; // already on the bottom row
        if (dir === 'up' && k === 'cancel') j = formIdx - 2;
        formIdx = listNav(formItems, Math.max(0, Math.min(formItems.length - 1, j)));
      } else if (dir === 'left' || dir === 'right') {
        if (k === 'color') { formSwatch = (formSwatch + (dir === 'left' ? -1 : 1) + SWATCHES.length) % SWATCHES.length; updateFormPreview(); }
        else if (k === 'save' && dir === 'right') formIdx = listNav(formItems, formIdx + 1);
        else if (k === 'cancel' && dir === 'left') formIdx = listNav(formItems, formIdx - 1);
      } else if (isEnter(e) && !e.repeat) formEnter();
      else if (isBack(e)) closeOverlay();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (!isEnter(e)) return;
    const wasDown = enterDown;
    enterDown = false;
    clearTimeout(pressTimer);
    if (state.mode === 'home' && wasDown && !longFired) activate();
  });

  // Pointer support (air mice, Magic remotes, laptops)
  grid.addEventListener('mousemove', (e) => {
    document.body.classList.remove('keys');
    const cell = e.target.closest('.cell');
    if (!cell || state.mode !== 'home') return;
    const i = +cell.dataset.i;
    if (i !== state.focus) setFocus(i);
    const face = cell.querySelector('.tile-face');
    const r = cell.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    face.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
    face.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    face.style.setProperty('--gx', (-50 + x * 60).toFixed(1) + '%');
    face.style.setProperty('--gy', (-50 + y * 60).toFixed(1) + '%');
  });
  grid.addEventListener('mouseleave', () => { const c = cells[state.focus]; if (c) aimHighlight(c, state.lastDir); });
  grid.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    if (state.mode === 'move') return endMove();
    if (state.mode === 'home') activate(+cell.dataset.i);
  });
  grid.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell || state.mode !== 'home') return;
    e.preventDefault(); setFocus(+cell.dataset.i); openMenu();
  });
  document.addEventListener('mousemove', () => {
    armSaver();
    if (state.mode === 'saver') stopSaver();
  }, { passive: true });
  document.querySelectorAll('.overlay').forEach(o => o.addEventListener('click', (e) => { if (e.target === o) closeOverlay(); }));
  // wheel scrolls rows on desktop
  let wheelLock = 0;
  addEventListener('wheel', (e) => {
    if (state.mode !== 'home' || Date.now() - wheelLock < 220 || Math.abs(e.deltaY) < 8) return;
    wheelLock = Date.now(); state.lastDir = e.deltaY > 0 ? 'down' : 'up'; moveFocus(state.lastDir);
  }, { passive: true });

  // ---------------------------------------------------------------- Layout scale
  let scale = 1;
  function fit() {
    scale = Math.min(innerWidth / 1920, innerHeight / 1080);
    document.documentElement.style.setProperty('--scale', scale);
  }
  addEventListener('resize', fit);

  function applyBodyFlags() {
    document.body.classList.toggle('calm', !!state.settings.calm);
    document.body.classList.toggle('lite', !!state.settings.lite);
  }

  // ---------------------------------------------------------------- Boot
  fit();
  applyBodyFlags();
  renderGrid();
  tickClock();
  loadWeather();
  armSaver();
  cells.forEach((c, i) => { c.querySelector('.tile').style.transitionDelay = `${80 + i * 28}ms`; });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    stage.classList.remove('booting');
    setTimeout(() => cells.forEach(c => { c.querySelector('.tile').style.transitionDelay = ''; }), 1200);
  }));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tickClock(); loadWeather(); } });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
