/* =========================================================
   GLAZE — homepage
   ========================================================= */
(function () {
  const G = window.GLAZE, C = window.GlazeCurrency, FX = window.GlazeFX, DV = window.GlazeDevices;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KIND_LABEL = { desktop: 'Desktop', phone: 'Phone' };
  const D = G.wallpapers.desktop, P = G.wallpapers.phone;
  const byId = id => [...D, ...P].find(w => w.id === id);

  /* ---------- Hero: real MacBook + iPhone ---------- */
  const stage = $('[data-hero-stage]');
  const heroMac = DV.make('air', 'starlight', byId('d2').src, { eager: true, alt: 'Starry Datejust oil painting wallpaper on a MacBook Air' });
  const heroPhone = DV.make('iphone', 'burgundy', byId('p1').src, { eager: true, lock: true, alt: 'The World Is Yours oil painting wallpaper on an iPhone' });
  heroMac.classList.add('hero-mac'); heroPhone.classList.add('hero-phone');
  stage.append(heroMac, heroPhone);
  if (!FX.reduced) {
    const seq = [['d2', 'p1'], ['d4', 'p3'], ['d6', 'p6'], ['d3', 'p2']]; let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % seq.length;
      DV.setWallpaper(heroMac, byId(seq[i][0]).src); DV.setWallpaper(heroPhone, byId(seq[i][1]).src);
    }, 5000);
  }

  /* ---------- Packs: real device covers ---------- */
  const packsEl = $('[data-packs]');
  ['phone', 'desktop', 'complete'].forEach((key, i) => {
    const p = G.packs[key];
    const el = document.createElement('article');
    el.className = 'pack reveal' + (p.featured ? ' featured' : '');
    el.style.setProperty('--d', i * 0.08 + 's');
    el.innerHTML = `
      ${p.featured ? '<span class="badge">Best value</span>' : ''}
      <a class="cover cover-${key}" href="checkout.html?pack=${key}" aria-label="${p.name}" tabindex="-1"></a>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="tagline">${p.tagline}</div>
        <div class="price"><span class="amt" data-price="${key}"></span><small>one payment</small></div>
        ${key === 'complete' ? '<div class="was" data-save></div>' : ''}
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn-gilt' : 'btn-ghost'} btn-block" href="checkout.html?pack=${key}">Get the ${p.name} <span class="arrow">→</span></a>
      </div>`;
    const cover = $('.cover', el);
    if (key !== 'desktop') { const ph = DV.make('iphone', key === 'phone' ? 'silver' : 'burgundy', byId(key === 'phone' ? 'p3' : 'p2').thumb, { lock: true }); ph.classList.add('c-phone'); cover.appendChild(ph); }
    if (key !== 'phone') { const mc = DV.make('air', key === 'desktop' ? 'midnight' : 'starlight', byId(key === 'desktop' ? 'd3' : 'd4').thumb); mc.classList.add('c-mac'); cover.prepend(mc); }
    packsEl.appendChild(el);
  });
  document.addEventListener('glaze:currency', () => {
    const s = Math.round((C.price('phone') + C.price('desktop') - C.price('complete')) * 100) / 100;
    $$('[data-save]').forEach(el => (el.textContent = `You save ${C.format(s)} vs buying both`));
    if (current && lb.classList.contains('open')) openLightbox(current);
  });

  /* ---------- Try it on ---------- */
  const tryTilt = $('[data-try-tilt]'), tryStage = $('[data-try-stage]');
  const state = { device: 'iphone', color: { iphone: 'burgundy', air: 'midnight', pro: 'space-black' }, wall: { phone: 'p1', desktop: 'd2' } };
  let tryDev = null;
  function renderTry() {
    const D0 = DV.DEVICES[state.device], kind = D0.kind;
    const w = byId(state.wall[kind]);
    tryDev = DV.make(state.device, state.color[state.device], w.src, { lock: kind === 'phone', alt: `${w.title} on ${D0.name}` });
    tryTilt.replaceChildren(tryDev);
    tryStage.dataset.kind = kind;
    // colors
    $('[data-try-colors]').innerHTML = D0.colors.map(c => `<button role="radio" aria-checked="${c.id === state.color[state.device]}" data-c="${c.id}" title="${c.name}" style="--sw:${c.swatch}"><span class="sr">${c.name}</span></button>`).join('');
    $('[data-try-color-name]').textContent = D0.colors.find(c => c.id === state.color[state.device]).name;
    // wallpapers
    const list = kind === 'phone' ? P : D;
    $('[data-try-walls]').innerHTML = list.map(x => `<button role="radio" aria-checked="${x.id === state.wall[kind]}" data-w="${x.id}" class="${kind}" title="${x.title}"><img src="${x.thumb}" alt="${x.title}" loading="lazy"></button>`).join('');
    $('[data-try-wall-name]').textContent = w.title;
    // CTA
    const pack = kind === 'phone' ? 'phone' : 'desktop';
    const cta = $('[data-try-cta]'); cta.href = `checkout.html?pack=${pack}`;
    cta.innerHTML = `Get the ${G.packs[pack].name} · <span data-price="${pack}">${C.format(C.price(pack))}</span>`;
    DV.preload(state.device);
  }
  $$('[data-try-device]').forEach(b => b.addEventListener('click', () => {
    state.device = b.dataset.tryDevice;
    $$('[data-try-device]').forEach(x => x.setAttribute('aria-selected', x === b));
    renderTry();
  }));
  $('[data-try-colors]').addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    state.color[state.device] = b.dataset.c; DV.setColor(tryDev, b.dataset.c);
    $$('[data-c]').forEach(x => x.setAttribute('aria-checked', x === b));
    $('[data-try-color-name]').textContent = b.title;
  });
  $('[data-try-walls]').addEventListener('click', e => {
    const b = e.target.closest('[data-w]'); if (!b) return;
    const kind = DV.DEVICES[state.device].kind; state.wall[kind] = b.dataset.w;
    DV.setWallpaper(tryDev, byId(b.dataset.w).src);
    $$('[data-w]').forEach(x => x.setAttribute('aria-checked', x === b));
    $('[data-try-wall-name]').textContent = byId(b.dataset.w).title;
  });
  renderTry();

  // Drag / hover to tilt in 3D
  (function tilt() {
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0, dragging = false, sx = 0, sy = 0, auto = true;
    const loop = () => {
      rx += (tx - rx) * .12; ry += (ty - ry) * .12;
      tryTilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      tryTilt.style.setProperty('--gx', (50 + ry * 1.6) + '%');
      if (Math.abs(tx - rx) > .05 || Math.abs(ty - ry) > .05 || auto) raf = requestAnimationFrame(loop); else raf = 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const t0 = performance.now();
    const idle = () => { if (!auto) return; const t = (performance.now() - t0) / 1000; ty = Math.sin(t * .7) * 14; tx = Math.sin(t * .5) * 3; kick(); requestAnimationFrame(idle); };
    if (!FX.reduced) requestAnimationFrame(idle);
    const stop = () => { auto = false; $('[data-try-hint]').classList.add('gone'); };
    tryStage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; dragging = true; sx = e.clientX; sy = e.clientY; stop(); tryStage.setPointerCapture(e.pointerId); });
    tryStage.addEventListener('pointermove', e => {
      if (dragging) { ty = Math.max(-38, Math.min(38, (e.clientX - sx) * .35)); tx = Math.max(-16, Math.min(16, -(e.clientY - sy) * .15)); kick(); }
      else if (e.pointerType === 'mouse') { const r = tryStage.getBoundingClientRect(); stop(); ty = ((e.clientX - r.left) / r.width - .5) * 36; tx = -((e.clientY - r.top) / r.height - .5) * 14; kick(); }
    });
    const end = () => { if (!dragging) return; dragging = false; tx = 0; ty = 0; kick(); };
    tryStage.addEventListener('pointerup', end); tryStage.addEventListener('pointercancel', end);
    tryStage.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { tx = 0; ty = 0; kick(); } });
  })();

  /* ---------- Gallery (bento) ---------- */
  const order = [];
  const dq = D.map(w => ({ kind: 'desktop', ...w })), pq = P.map(w => ({ kind: 'phone', ...w }));
  for (let b = 0; dq.length >= 2 && pq.length >= 2; b++) {
    const [d1, d2, p1, p2] = [dq.shift(), dq.shift(), pq.shift(), pq.shift()];
    order.push(...(b % 2 ? [p1, p2, d1, d2] : [d1, p1, p2, d2]));
  }
  dq.forEach(w => order.push({ ...w, wide: true }));
  pq.forEach(w => order.push(w));
  const gallery = $('[data-gallery]');
  order.forEach((w, idx) => {
    const card = document.createElement('button');
    card.className = 'card reveal' + (w.wide ? ' wide' : ''); card.dataset.kind = w.kind;
    card.style.setProperty('--d', (idx % 3) * 0.06 + 's');
    card.setAttribute('aria-label', `Preview ${w.title}, ${KIND_LABEL[w.kind]} wallpaper`);
    card.innerHTML = `<img src="${w.thumb}" alt="${w.title}" loading="lazy" decoding="async">
      <div class="wm"></div><span class="tag">${KIND_LABEL[w.kind]}</span>
      <div class="cap"><b>${w.title}</b><span>Preview on ${w.kind === 'desktop' ? 'MacBook' : 'iPhone'} →</span></div>`;
    card.addEventListener('click', () => openLightbox(w));
    gallery.appendChild(card);
  });
  const more = document.createElement('a');
  more.className = 'more-tile reveal'; more.href = '#packs';
  more.innerHTML = '<b>And many more inside every pack.</b><span>See the packs →</span>';
  gallery.appendChild(more);
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-filter]').forEach(b => b.setAttribute('aria-selected', b === btn));
    const f = btn.dataset.filter;
    $$('.card', gallery).forEach(c => { c.hidden = f !== 'all' && c.dataset.kind !== f; c.classList.add('in'); });
    more.hidden = f === 'desktop';
  }));

  /* ---------- Lightbox ---------- */
  const lb = $('[data-lightbox]');
  let current = null, lastFocus = null;
  const visible = () => { const f = $('[data-filter][aria-selected="true"]').dataset.filter; return order.filter(w => f === 'all' || w.kind === f); };
  function openLightbox(w) {
    current = w; lastFocus = lastFocus || document.activeElement;
    const dev = w.kind === 'desktop' ? DV.make('air', 'midnight', w.src, { alt: `${w.title} on a MacBook Air` }) : DV.make('iphone', 'burgundy', w.src, { lock: true, alt: `${w.title} on an iPhone` });
    $('[data-lb-device]').replaceChildren(dev);
    $('[data-lb-device]').dataset.kind = w.kind;
    const pack = w.kind;
    $('[data-lb-kind]').textContent = `${KIND_LABEL[w.kind]} wallpaper`;
    $('[data-lb-title]').textContent = w.title;
    $('[data-lb-text]').innerHTML = `In the ${G.packs[pack].name} for <b>${C.format(C.price(pack))}</b>, and in the Complete Collection for <b>${C.format(C.price('complete'))}</b>.`;
    const cta = $('[data-lb-cta]'); cta.href = `checkout.html?pack=${pack}`; cta.innerHTML = `Get the ${G.packs[pack].name} <span class="arrow">→</span>`;
    if (!lb.classList.contains('open')) {
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => $('[data-lb-close]').focus(), 50);
    }
  }
  function closeLb() {
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus({ preventScroll: true }); lastFocus = null;
  }
  function stepLb(dir) { const list = visible(); const i = list.findIndex(w => w === current); openLightbox(list[(i + dir + list.length) % list.length]); }
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-lb-close]')) closeLb(); });
  $('[data-lb-prev]').addEventListener('click', () => stepLb(-1));
  $('[data-lb-next]').addEventListener('click', () => stepLb(1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') stepLb(1);
    if (e.key === 'ArrowLeft') stepLb(-1);
  });

  /* ---------- Before / after on a real MacBook ---------- */
  const cmp = $('[data-compare]');
  const cmpDev = DV.make('air', 'silver', byId('d6').src, { alt: 'Alpine Wall oil painting wallpaper on a MacBook Air' });
  cmp.appendChild(cmpDev);
  const scr = $('.dev-screen', cmpDev);
  scr.insertAdjacentHTML('beforeend', `<span class="after-tag">Glaze</span><div class="stock"><span>Stock wallpaper</span></div><div class="handle"></div>
    <input type="range" min="0" max="100" value="50" aria-label="Compare stock wallpaper and Glaze wallpaper">`);
  const range = $('input', scr);
  const setPos = v => scr.style.setProperty('--pos', v + '%');
  range.addEventListener('input', () => setPos(range.value)); setPos(50);
  if (!FX.reduced) {
    const hio = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; hio.disconnect();
      let t0 = null;
      const step = ts => { if (t0 === null) t0 = ts; const k = Math.min(1, (ts - t0) / 1600); const v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k); range.value = v; setPos(v); if (k < 1) requestAnimationFrame(step); };
      setTimeout(() => requestAnimationFrame(step), 400);
    }, { threshold: 0.6 });
    hio.observe(cmp);
  }

  /* ---------- Manifesto words ---------- */
  const words = $('[data-words]');
  words.innerHTML = [...words.childNodes].flatMap(n => {
    const em = n.nodeType === 1;
    return n.textContent.split(/\s+/).filter(Boolean).map(t => `<span class="w${em ? ' em' : ''}">${t}</span>`);
  }).join(' ');
  const ws = $$('.w', words);
  function lightWords() {
    const r = words.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.25)));
    const n = Math.round(p * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n));
  }
  if (FX.reduced) ws.forEach(w => w.classList.add('on'));

  /* ---------- Final fan ---------- */
  const fanIds = ['p4', 'p2', 'p1', 'p6', 'p5'];
  $('[data-fan]').innerHTML = fanIds.map((id, i) => {
    const a = (i - 2) * 11, x = (i - 2) * 64;
    return `<img src="assets/img/w/${id}-s.webp" alt="" loading="lazy" style="transform:translateX(calc(-50% + ${x}%)) rotate(${a}deg);z-index:${3 - Math.abs(i - 2)}">`;
  }).join('');

  /* ---------- Sticky bar ---------- */
  const sticky = $('[data-sticky]'), hero = $('.hero'), packsSec = $('#packs'), foot = $('footer');
  const seen = { hero: true, packs: false, foot: false };
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.target === hero) seen.hero = e.isIntersecting;
    if (e.target === packsSec) seen.packs = e.isIntersecting;
    if (e.target === foot) seen.foot = e.isIntersecting;
    sticky.classList.toggle('show', !seen.hero && !seen.packs && !seen.foot);
  }), { threshold: 0 });
  [hero, packsSec, foot].forEach(el => sio.observe(el));

  let ticking = false;
  addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { lightWords(); ticking = false; }); }, { passive: true });
  lightWords();

  FX.initCurrency();
  FX.reveal();
})();
