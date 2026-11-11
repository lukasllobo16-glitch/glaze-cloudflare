/* =========================================================
   GLAZE — homepage
   ========================================================= */
(function () {
  const G = window.GLAZE, C = window.GlazeCurrency, FX = window.GlazeFX;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KIND_LABEL = { desktop: 'Desktop', phone: 'Phone' };

  /* ---------- Hero: slow crossfade between paintings ---------- */
  const heroSets = {
    desktop: ['d2', 'd4', 'd6', 'd3'],
    phone: ['p1', 'p3', 'p6', 'p2']
  };
  const titleOf = id => (G.wallpapers[id[0] === 'd' ? 'desktop' : 'phone'].find(w => w.id === id) || {}).title || '';
  if (!FX.reduced) {
    let i = 0;
    const swap = (screen, id) => {
      const old = $('img', screen), img = new Image();
      img.alt = old.alt; img.width = old.width; img.height = old.height; img.className = 'out';
      img.src = `assets/img/w/${id}.webp`;
      img.decode().then(() => {
        screen.appendChild(img);
        requestAnimationFrame(() => requestAnimationFrame(() => { img.classList.remove('out'); old.classList.add('out'); }));
        setTimeout(() => old.remove(), 1500);
      }).catch(() => {});
    };
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % heroSets.desktop.length;
      swap($('[data-cycle="desktop"]'), heroSets.desktop[i]);
      swap($('[data-cycle="phone"]'), heroSets.phone[i]);
      $('[data-now]').textContent = titleOf(heroSets.desktop[i]);
    }, 5200);
  }

  /* ---------- Before / after ---------- */
  const cmp = $('[data-compare]');
  if (cmp) {
    const range = $('input', cmp), screen = $('.screen', cmp);
    const set = v => screen.style.setProperty('--pos', v + '%');
    range.addEventListener('input', () => set(range.value));
    set(range.value);
    // Gentle hint the first time it comes into view
    if (!FX.reduced) {
      const hio = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return; hio.disconnect();
        let t0 = null; const from = 50;
        const step = ts => {
          if (t0 === null) t0 = ts; const k = Math.min(1, (ts - t0) / 1600);
          const v = from + Math.sin(k * Math.PI * 2) * 22 * (1 - k);
          range.value = v; set(v); if (k < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 500);
      }, { threshold: 0.6 });
      hio.observe(cmp);
    }
  }

  /* ---------- Gallery ---------- */
  const order = [];
  const D = G.wallpapers.desktop, P = G.wallpapers.phone;
  // Bento blocks: two desktops stacked next to two phones, alternating sides.
  // Leftover desktops become one large feature tile next to the "more" tile.
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
    const [wd, ht] = w.kind === 'desktop' ? [800, 450] : [420, 908];
    card.innerHTML = `<img src="${w.thumb}" alt="${w.title}" loading="lazy" decoding="async" width="${wd}" height="${ht}">
      <div class="wm"></div><span class="tag">${KIND_LABEL[w.kind]}</span>
      <div class="cap"><b>${w.title}</b><span>Preview on ${w.kind === 'desktop' ? 'laptop' : 'phone'} →</span></div>`;
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
  const visible = () => order.filter(w => { const f = $('[data-filter][aria-selected="true"]').dataset.filter; return f === 'all' || w.kind === f; });
  function openLightbox(w) {
    current = w; lastFocus = lastFocus || document.activeElement;
    $('[data-lb-device]').innerHTML = w.kind === 'desktop'
      ? `<div class="laptop"><div class="lid"><div class="screen"><img src="${w.src}" alt="${w.title} on a laptop"></div></div><div class="base"></div></div>`
      : `<div class="phone"><div class="island"></div><div class="screen"><img src="${w.src}" alt="${w.title} on a phone"></div></div>`;
    const pack = w.kind;
    $('[data-lb-kind]').textContent = `${KIND_LABEL[w.kind]} wallpaper`;
    $('[data-lb-title]').textContent = w.title;
    $('[data-lb-text]').innerHTML = `Included in the ${G.packs[pack].name} for <b>${C.format(C.price(pack))}</b>, and in the Complete Collection for <b>${C.format(C.price('complete'))}</b>.`;
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
  function stepLb(dir) {
    const list = visible(); const i = list.findIndex(w => w === current);
    openLightbox(list[(i + dir + list.length) % list.length]);
  }
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-lb-close]')) closeLb(); });
  $('[data-lb-prev]').addEventListener('click', () => stepLb(-1));
  $('[data-lb-next]').addEventListener('click', () => stepLb(1));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') stepLb(1);
    if (e.key === 'ArrowLeft') stepLb(-1);
  });

  /* ---------- Lock screen demo ---------- */
  const lockImg = $('[data-lock-img]'), lockList = $('[data-lock-list]');
  P.forEach((w, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<button aria-pressed="${i === 0}"><img src="${w.thumb}" alt="" loading="lazy" width="420" height="908"><span><b>${w.title}</b><small>Phone wallpaper</small></span></button>`;
    $('button', li).addEventListener('click', () => {
      $$('button', lockList).forEach(b => b.setAttribute('aria-pressed', b === $('button', li)));
      lockImg.src = w.src; lockImg.alt = `${w.title} on a phone lock screen`;
    });
    lockList.appendChild(li);
  });
  lockImg.alt = `${P[0].title} on a phone lock screen`;
  function tickClock() {
    const d = new Date();
    $('[data-lock-time]').textContent = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');
    $('[data-lock-date]').textContent = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  tickClock(); setInterval(tickClock, 15000);

  /* ---------- Manifesto: words light up as you scroll ---------- */
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

  /* ---------- Packs ---------- */
  const packsEl = $('[data-packs]');
  const COVER = {
    phone:    ['left:13%;top:22%;width:23%;aspect-ratio:9/19.5;transform:rotate(-8deg)', 'left:39%;top:12%;width:23%;aspect-ratio:9/19.5;z-index:2', 'left:65%;top:22%;width:23%;aspect-ratio:9/19.5;transform:rotate(8deg)'],
    desktop:  ['left:4%;top:16%;width:60%;aspect-ratio:16/9;transform:rotate(-5deg)', 'left:20%;top:40%;width:60%;aspect-ratio:16/9;z-index:2', 'left:37%;top:10%;width:58%;aspect-ratio:16/9;transform:rotate(5deg)'],
    complete: ['left:4%;top:16%;width:62%;aspect-ratio:16/9;transform:rotate(-4deg)', 'left:66%;top:9%;width:24%;aspect-ratio:9/19.5;z-index:2;transform:rotate(6deg)', 'left:14%;top:48%;width:52%;aspect-ratio:16/9;transform:rotate(3deg)']
  };
  ['phone', 'desktop', 'complete'].forEach((key, i) => {
    const p = G.packs[key];
    const el = document.createElement('article');
    el.className = 'pack reveal' + (p.featured ? ' featured' : '');
    el.style.setProperty('--d', i * 0.08 + 's');
    el.innerHTML = `
      ${p.featured ? '<span class="badge">Best value</span>' : ''}
      <div class="cover" aria-hidden="true">${p.cover.map((src, j) => `<img src="${src}" alt="" loading="lazy" style="${COVER[key][j]}">`).join('')}</div>
      <div class="body">
        <h3>${p.name}</h3>
        <div class="tagline">${p.tagline}</div>
        <div class="price"><span class="amt" data-price="${key}"></span><small>one payment</small></div>
        <div class="was" ${key === 'complete' ? 'data-save' : ''}>${key === 'complete' ? '' : '&nbsp;'}</div>
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn-gilt' : 'btn-ghost'} btn-block" href="checkout.html?pack=${key}">Get the ${p.name} <span class="arrow">→</span></a>
        <div class="fine">Instant download · No subscription</div>
      </div>`;
    packsEl.appendChild(el);
  });
  document.addEventListener('glaze:currency', () => {
    const s = Math.round((C.price('phone') + C.price('desktop') - C.price('complete')) * 100) / 100;
    $$('[data-save]').forEach(el => (el.textContent = `Save ${C.format(s)} compared with buying both`));
    if (current && lb.classList.contains('open')) openLightbox(current);
  });

  /* ---------- Final fan of phone paintings ---------- */
  const fan = $('[data-fan]');
  const fanIds = ['p4', 'p2', 'p1', 'p6', 'p5'];
  fan.innerHTML = fanIds.map((id, i) => {
    const a = (i - 2) * 11, x = (i - 2) * 64;
    return `<img src="assets/img/w/${id}-s.webp" alt="" loading="lazy" style="transform:translateX(calc(-50% + ${x}%)) rotate(${a}deg);z-index:${3 - Math.abs(i - 2)}">`;
  }).join('');

  /* ---------- Sticky buy bar ---------- */
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
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { lightWords(); ticking = false; });
  }, { passive: true });
  lightWords();

  FX.initCurrency();
  FX.reveal();
})();
