/* =========================================================
   GLAZE — homepage
   ========================================================= */
(function () {
  const G = window.GLAZE, C = window.GlazeCurrency, FX = window.GlazeFX;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Packs ---------- */
  const packsEl = $('[data-packs]');
  ['phone', 'desktop', 'complete'].forEach((key, i) => {
    const p = G.packs[key];
    const covers = p.cover.map(src => `<img class="${/\/p\d/.test(src) ? 'c-phone' : 'c-desk'}" src="${src}" alt="" loading="lazy">`).join('');
    const el = document.createElement('article');
    el.className = 'pack glass refract reveal' + (p.featured ? ' featured' : '');
    el.dataset.pack = key; el.style.setProperty('--d', i * 0.1 + 's');
    el.innerHTML = `
      ${p.featured ? '<span class="badge glass">Best value</span>' : ''}
      <div class="cover">${covers}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="tag">${p.tagline}</div>
        <div class="price"><span class="amt" data-price="${key}"></span><small>one-time</small></div>
        ${key === 'complete' ? '<div><span class="save" data-save></span></div>' : ''}
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn-violet' : 'btn-primary'}" href="checkout.html?pack=${key}">Get the ${p.name} <span class="arrow">→</span></a>
        <div class="fine">Instant download · No subscription</div>
      </div>`;
    packsEl.appendChild(el);
    FX.tilt(el, 4);
  });
  document.addEventListener('glaze:currency', () => {
    const s = C.price('phone') + C.price('desktop') - C.price('complete');
    $$('[data-save]').forEach(el => (el.textContent = `Save ${C.format(Math.round(s * 100) / 100)} vs. buying separately`));
  });

  /* ---------- Gallery ---------- */
  ['desktop', 'phone'].forEach(kind => {
    const grid = $(`[data-grid="${kind}"]`);
    G.wallpapers[kind].forEach((w, i) => {
      const card = document.createElement('button');
      card.className = 'card reveal'; card.style.setProperty('--d', (i % 3) * 0.08 + 's');
      card.setAttribute('aria-label', `Preview ${w.title}`);
      card.innerHTML = `<img src="${w.src}" alt="${w.title}" loading="lazy"><div class="wm"></div><div class="glare"></div>
        <div class="meta glass"><b>${w.title}</b><small>${kind}</small></div>`;
      card.addEventListener('click', () => openLightbox(kind, w));
      grid.appendChild(card); FX.tilt(card, 6);
    });
  });
  $$('[data-tab]').forEach(tab => tab.addEventListener('click', () => {
    $$('[data-tab]').forEach(t => t.setAttribute('aria-selected', t === tab));
    $$('[data-grid]').forEach(g => {
      g.hidden = g.dataset.grid !== tab.dataset.tab;
      if (!g.hidden) $$('.reveal', g).forEach(el => el.classList.add('in'));
    });
  }));

  /* ---------- Lightbox: preview a wallpaper on a device ---------- */
  const lb = $('[data-lightbox]');
  function openLightbox(kind, w) {
    const dev = kind === 'desktop'
      ? `<div class="laptop"><div class="lid"><div class="screen"><img class="cur" src="${w.src}" alt=""><div class="screen-glare"></div></div></div><div class="base"></div></div>`
      : `<div class="phone"><div class="island"></div><div class="screen"><img class="cur" src="${w.src}" alt=""><div class="screen-glare"></div></div></div>`;
    $('[data-lb-device]').innerHTML = dev;
    $('[data-lb-kind]').innerHTML = `<span class="dot"></span>${kind === 'desktop' ? 'Desktop wallpaper' : 'Phone wallpaper'}`;
    $('[data-lb-title]').textContent = w.title;
    const pack = kind === 'desktop' ? 'desktop' : 'phone';
    $('[data-lb-text]').innerHTML = `Included in the ${G.packs[pack].name} (<b>${C.format(C.price(pack))}</b>) and the Complete Collection (<b>${C.format(C.price('complete'))}</b>).`;
    const cta = $('[data-lb-cta]'); cta.href = `checkout.html?pack=${pack}`; cta.textContent = `Get the ${G.packs[pack].name}`;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
  }
  const closeLb = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-lb-close]')) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- Hero: 3D stage follows the pointer ---------- */
  const stage = $('[data-stage]'), inner = $('.stage-inner', stage), hero = $('.hero');
  if (!FX.reduced) hero.addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    inner.style.setProperty('--ry', (-6 + x * 14) + 'deg'); inner.style.setProperty('--rx', (8 - y * 10) + 'deg');
  });

  /* ---------- Hero: liquid glass lens ---------- */
  const lens = $('.lens', stage);
  let tx = 0, ty = 0, lx = 0, ly = 0, lastMove = -1e9, stageVisible = true;
  stage.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect(); tx = e.clientX - r.left - lens.offsetWidth / 2; ty = e.clientY - r.top - lens.offsetHeight / 2; lastMove = performance.now();
  });
  new IntersectionObserver(([e]) => (stageVisible = e.isIntersecting)).observe(stage);
  (function loop(now) {
    if (stageVisible) {
      const r = stage.getBoundingClientRect(), s = lens.offsetWidth;
      if (now - lastMove > 2200) { // drift on its own when the pointer is away (and on phones)
        const t = now / 1000;
        tx = (r.width - s) * (0.5 + 0.38 * Math.sin(t * 0.45)); ty = (r.height - s) * (0.45 + 0.3 * Math.sin(t * 0.7 + 1));
      }
      lx += (tx - lx) * 0.08; ly += (ty - ly) * 0.08;
      lens.style.setProperty('--lx', lx + 'px'); lens.style.setProperty('--ly', ly + 'px');
    }
    requestAnimationFrame(loop);
  })(0);

  /* ---------- Hero: screens dissolve into the next painting ---------- */
  function cycler(screen, list, interval, offset, onShow) {
    const cur = $('.cur', screen), nxt = $('.nxt', screen), d = new FX.Dissolver($('canvas', screen));
    let i = Math.max(0, list.findIndex(w => cur.src.endsWith(w.src))), busy = false;
    async function next() {
      if (busy || document.hidden || !stageVisible) return; busy = true;
      i = (i + 1) % list.length; const w = list[i];
      nxt.src = w.src; try { await nxt.decode(); } catch (e) {}
      d.fit(); d.drawCover(cur); cur.style.opacity = 0;
      onShow && onShow(w);
      await d.play();
      cur.src = w.src; try { await cur.decode(); } catch (e) {}
      cur.style.opacity = 1; busy = false;
    }
    setTimeout(() => { next(); setInterval(next, interval); }, offset);
  }
  const now = $('[data-now]');
  cycler($('[data-cycle="desktop"]'), G.wallpapers.desktop, 6500, 3200, w => (now.textContent = w.title));
  cycler($('[data-cycle="phone"]'), G.wallpapers.phone, 6500, 6400);

  /* ---------- Manifesto: snap the default wallpaper away ---------- */
  const snap = $('[data-snap]'), snapD = new FX.Dissolver($('canvas', snap));
  function paintDefault() {
    snapD.fit(); const { ctx, w, h } = snapD;
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#0b3a8f'); g.addColorStop(.55, '#2f8cf0'); g.addColorStop(1, '#9fd3ff');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < 4; k++) {
      ctx.beginPath(); ctx.moveTo(0, h * (.55 + k * .1));
      ctx.bezierCurveTo(w * .3, h * (.3 + k * .12), w * .6, h * (.85 + k * .03), w, h * (.45 + k * .12));
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fillStyle = `rgba(255,255,255,${0.06 + k * 0.03})`; ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `600 ${Math.round(w / 34)}px ui-monospace, Menlo, monospace`;
    ctx.fillText('default_wallpaper_01.jpg', w * 0.05, h * 0.12);
    ctx.font = `500 ${Math.round(w / 9)}px -apple-system, Helvetica, Arial`; ctx.fillStyle = 'rgba(255,255,255,.9)';
    const d = new Date(); ctx.fillText(d.toTimeString().slice(0, 5), w * 0.05, h * 0.36);
  }
  let snapping = false;
  async function doSnap() { if (snapping) return; snapping = true; paintDefault(); await new Promise(r => setTimeout(r, 650)); await snapD.play(); snapping = false; }
  paintDefault();
  const sio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(doSnap, 500); sio.disconnect(); } }, { threshold: 0.6 });
  sio.observe(snap);
  $('[data-snap-btn]').addEventListener('click', doSnap);
  addEventListener('resize', () => { if (!snapping) { snapD.fit(); } });

  /* ---------- Manifesto words light up while scrolling ---------- */
  const words = $('[data-words]');
  words.innerHTML = words.textContent.split(' ').map(w => `<span class="w">${w}</span>`).join(' ');
  const ws = $$('.w', words);
  function lightWords() {
    const r = words.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const n = Math.round(p * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n));
  }

  /* ---------- Sticky purchase bar ---------- */
  const sticky = $('[data-sticky]'), packsSec = $('#packs'); let packsVisible = false;
  new IntersectionObserver(([e]) => (packsVisible = e.isIntersecting), { threshold: 0.15 }).observe(packsSec);
  function onScroll() {
    sticky.classList.toggle('show', scrollY > innerHeight * 0.9 && !packsVisible && innerHeight + scrollY < document.body.scrollHeight - 200);
    lightWords();
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  FX.initCurrency();
  FX.reveal();
})();
