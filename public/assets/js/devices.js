/* =========================================================
   GLAZE — real device mockups (official Apple product bezels)
   Each device = wallpaper layer (masked to the exact screen shape)
   + the transparent bezel image on top.
   ========================================================= */
(function () {
  const BASE = 'assets/img/devices/';
  const DEVICES = {
    iphone: {
      name: 'iPhone 18 Pro Max', kind: 'phone', ratio: '1470 / 3000',
      hole: [5.1020, 2.2, 89.7959, 95.6],
      colors: [
        { id: 'burgundy', name: 'Burgundy', swatch: '#5a2230' },
        { id: 'black',    name: 'Black',    swatch: '#2a2a2c' },
        { id: 'silver',   name: 'Silver',   swatch: '#dcdcd8' },
        { id: 'glacier',  name: 'Glacier',  swatch: '#c9d6de' }
      ]
    },
    air: {
      name: 'MacBook Air', kind: 'desktop', ratio: '3400 / 2240',
      hole: [12.3529, 12.8571, 75.2941, 74.2857],
      colors: [
        { id: 'midnight',  name: 'Midnight',  swatch: '#2e3540' },
        { id: 'starlight', name: 'Starlight', swatch: '#e2d8c6' },
        { id: 'sky-blue',  name: 'Sky Blue',  swatch: '#b9cbd9' },
        { id: 'silver',    name: 'Silver',    swatch: '#d4d6d8' }
      ]
    },
    pro: {
      name: 'MacBook Pro', kind: 'desktop', ratio: '3860 / 2540',
      hole: [10.8290, 11.3386, 78.3420, 77.3228],
      colors: [
        { id: 'space-black', name: 'Space Black', swatch: '#232325' },
        { id: 'silver',      name: 'Silver',      swatch: '#d4d6d8' }
      ]
    }
  };

  const pad = n => String(n).padStart(2, '0');
  function lockMarkup() {
    return `<div class="lock" aria-hidden="true"><div class="lock-date" data-lock-date></div><div class="lock-time" data-lock-time></div><div class="lock-bar"></div></div>`;
  }
  function tick(root = document) {
    const d = new Date();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
    const date = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    root.querySelectorAll('[data-lock-time]').forEach(el => (el.textContent = time));
    root.querySelectorAll('[data-lock-date]').forEach(el => (el.textContent = date));
  }
  setInterval(tick, 20000);

  /* make(device, color, wallpaperSrc, { lock, alt, eager }) → HTMLElement */
  function make(device, color, src, opts = {}) {
    const D = DEVICES[device];
    const c = (D.colors.find(x => x.id === color) || D.colors[0]).id;
    const el = document.createElement('div');
    el.className = `dev dev-${device}`; el.dataset.device = device; el.dataset.color = c;
    const [x, y, w, h] = D.hole;
    el.style.aspectRatio = D.ratio;
    el.innerHTML = `
      <div class="dev-screen" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%;-webkit-mask-image:url(${BASE}${device}-mask.png);mask-image:url(${BASE}${device}-mask.png)">
        <img class="dev-wall" src="${src}" alt="${opts.alt || ''}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
        ${opts.lock ? lockMarkup() : ''}
      </div>
      <img class="dev-frame" src="${BASE}${device}-${c}.webp" alt="" ${opts.eager ? '' : 'loading="lazy"'} decoding="async">`;
    if (opts.lock) tick(el);
    return el;
  }
  function setColor(el, color) {
    const d = el.dataset.device; el.dataset.color = color;
    el.querySelector('.dev-frame').src = `${BASE}${d}-${color}.webp`;
  }
  /* crossfade to a new wallpaper */
  function setWallpaper(el, src, alt = '') {
    const screen = el.querySelector('.dev-screen'), old = screen.querySelector('.dev-wall');
    if (old && old.getAttribute('src') === src) return Promise.resolve();
    const img = new Image(); img.className = 'dev-wall out'; img.alt = alt; img.decoding = 'async'; img.src = src;
    return img.decode().catch(() => {}).then(() => {
      screen.insertBefore(img, old ? old.nextSibling : screen.firstChild);
      requestAnimationFrame(() => requestAnimationFrame(() => { img.classList.remove('out'); }));
      setTimeout(() => { if (old && old.parentNode) old.remove(); }, 900);
    });
  }
  function preload(device) { DEVICES[device].colors.forEach(c => { const i = new Image(); i.src = `${BASE}${device}-${c.id}.webp`; }); }

  window.GlazeDevices = { DEVICES, make, setColor, setWallpaper, preload, tick };
})();
