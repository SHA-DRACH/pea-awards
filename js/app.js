/* PEA core: storage, email-based vote counting, theme, shared layout and helpers.
   PROTOTYPE NOTE: data is kept in the browser's localStorage. A production build
   must move votes, email verification and admin auth to a secure server + database. */

// Apply the saved theme before the page paints (avoids a flash of the wrong theme)
(function () {
  let t = null;
  try { t = localStorage.getItem('pea_theme'); } catch (e) {}
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
})();

const PEA = (() => {
  const KEY = 'pea_state_v3';
  let state = null;

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }

  function seed() {
    const s = JSON.parse(JSON.stringify(PEA_DEFAULT));
    s.votes = {};
    s.nominees.forEach(n => { s.votes[n.id] = 0; });   // every nominee starts at zero
    s.ballots = [];                                    // one entry per vote cast
    return s;
  }

  function load() {
    if (state) return state;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return state; }
    } catch (e) { /* storage unavailable */ }
    state = seed();
    save();
    return state;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }
  function reload() { state = null; return load(); }
  function reset() { state = seed(); save(); return state; }

  // ---------- Queries ----------
  const settings = () => load().settings;
  const categories = () => load().categories;
  const nominees = () => load().nominees;
  const category = id => categories().find(c => c.id === id);
  const nominee = id => nominees().find(n => n.id === id);
  const byCategory = id => nominees().filter(n => n.categoryId === id);
  const votesFor = id => load().votes[id] || 0;
  const categoryTotal = id => byCategory(id).reduce((t, n) => t + votesFor(n.id), 0);
  const totalVotes = () => Object.values(load().votes).reduce((a, b) => a + b, 0);
  const ballots = () => load().ballots;
  const limit = () => Number(settings().votesPerCategory) || 2;

  // ---------- Email voting ----------
  const normalizeEmail = e => String(e || '').trim().toLowerCase();
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(e));
  const usedInCategory = (email, categoryId) =>
    ballots().filter(b => b.email === normalizeEmail(email) && b.categoryId === categoryId).length;
  const remainingInCategory = (email, categoryId) => Math.max(0, limit() - usedInCategory(email, categoryId));

  function makeRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for (let i = 0; i < 8; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return 'PEA-' + r;
  }

  function castVote({ nomineeId, email, voterName }) {
    const s = load();
    const n = nominee(nomineeId);
    if (!n) throw new Error('Nominee not found.');
    if (!s.settings.votingOpen) throw new Error('Voting is currently closed.');
    if (!validEmail(email)) throw new Error('Please enter a valid email address.');
    const mail = normalizeEmail(email);
    if (remainingInCategory(mail, n.categoryId) <= 0) {
      throw new Error(`You have used all ${limit()} votes for ${category(n.categoryId).name}.`);
    }
    const b = {
      ref: makeRef(), nomineeId, nomineeName: n.name, categoryId: n.categoryId,
      email: mail, voterName: (voterName || '').trim() || 'Anonymous', date: new Date().toISOString()
    };
    s.votes[nomineeId] = (s.votes[nomineeId] || 0) + 1;   // automatic count
    s.ballots.unshift(b);
    save();
    return b;
  }
  const findBallot = ref => ballots().find(b => b.ref === ref);
  const historyFor = email => ballots().filter(b => b.email === normalizeEmail(email));

  // Admin demo helper: sample votes so the dashboard can be previewed.
  function generateDemoVotes(voters = 25) {
    const s = load();
    const names = ['Musu K.', 'Jartu S.', 'Emmanuel T.', 'Fatu B.', 'Prince W.', 'Hawa D.', 'Joseph K.', 'Comfort N.', 'Varney C.', 'Mamie G.'];
    for (let v = 0; v < voters; v++) {
      const email = `demo.voter${Date.now().toString(36)}${v}@example.com`;
      const cats = s.categories.slice().sort(() => Math.random() - .5).slice(0, 3 + Math.floor(Math.random() * 6));
      cats.forEach(c => {
        const list = s.nominees.filter(n => n.categoryId === c.id);
        const k = 1 + Math.floor(Math.random() * limit());
        for (let i = 0; i < k && list.length; i++) {
          const n = list[Math.floor(Math.random() * list.length)];
          s.votes[n.id] = (s.votes[n.id] || 0) + 1;
          s.ballots.push({ ref: makeRef(), nomineeId: n.id, nomineeName: n.name, categoryId: c.id, email,
            voterName: names[v % names.length], demo: true, date: new Date(Date.now() - Math.random() * 7 * 864e5).toISOString() });
        }
      });
    }
    s.ballots.sort((a, b) => b.date.localeCompare(a.date));
    save();
  }
  const bioFor = n => n.bio || `Nominated for ${category(n.categoryId)?.name || 'an award'} at the Paynesville Entertainment Awards ${settings().season}. Show your support — every vote counts!`;

  // ---------- Admin ----------
  function addNominee(data) {
    const s = load();
    const id = 'n' + Date.now().toString(36);
    s.nominees.push({ id, categoryId: data.categoryId, name: data.name.trim(), bio: (data.bio || '').trim(), photo: data.photo || '' });
    s.votes[id] = 0;
    save();
    return id;
  }
  function updateNominee(id, data) { const n = nominee(id); if (n) { Object.assign(n, data); save(); } }
  function removeNominee(id) {
    const s = load();
    s.nominees = s.nominees.filter(n => n.id !== id);
    delete s.votes[id];
    save();
  }
  function addCategory(name, icon, desc) {
    const s = load();
    let id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cat';
    while (category(id)) id += '-x';
    s.categories.push({ id, name: name.trim(), icon: icon || '🏆', desc: (desc || '').trim() });
    save();
    return id;
  }
  function removeCategory(id) {
    const s = load();
    byCategory(id).forEach(n => delete s.votes[n.id]);
    s.nominees = s.nominees.filter(n => n.categoryId !== id);
    s.categories = s.categories.filter(c => c.id !== id);
    save();
  }
  function updateSettings(patch) { Object.assign(load().settings, patch); save(); }

  // ---------- Helpers ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => Number(n).toLocaleString();
  const param = k => new URLSearchParams(location.search).get(k);
  const fmtDate = iso => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const maskEmail = e => { const [u, d] = String(e).split('@'); return d ? (u.slice(0, 2) + '•••@' + d) : e; };

  function initials(name) {
    const clean = name.replace(/[“”"()]/g, '').split('–')[0].trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  function avatar(n) {
    const hues = [[38, 70], [28, 65], [45, 75], [15, 55], [50, 60], [33, 80]];
    const [h, s] = hues[hash(n.id) % hues.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${h},${s}%,22%)"/><stop offset="1" stop-color="hsl(${h},${s}%,8%)"/></linearGradient>
        <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e08a"/><stop offset="1" stop-color="#b8892a"/></linearGradient></defs>
      <rect width="300" height="300" fill="url(#g)"/>
      <circle cx="150" cy="150" r="118" fill="none" stroke="#d4af37" stroke-opacity=".35" stroke-width="3"/>
      <circle cx="150" cy="150" r="104" fill="none" stroke="#d4af37" stroke-opacity=".18" stroke-width="2"/>
      <text x="150" y="172" text-anchor="middle" font-family="Georgia,serif" font-size="92" font-weight="700" fill="url(#t)">${initials(n.name)}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const photo = n => n.photo || avatar(n);

  function toast(msg, type = '') {
    let el = document.getElementById('pea-toast');
    if (!el) { el = document.createElement('div'); el.id = 'pea-toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.className = 'toast', 2800);
  }

  // ---------- Theme (light / dark, user's choice) ----------
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('pea_theme', t); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(b => {
      b.innerHTML = t === 'dark' ? '☀️<span>Light</span>' : '🌙<span>Dark</span>';
      b.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
    });
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.content = t === 'dark' ? '#070707' : '#faf7f0';
  }

  // ---------- Scroll animations (AOS) ----------
  // Attributes are added from JS only when the AOS library loaded, so content
  // never stays hidden if the CDN is unavailable.
  const AOS_MAP = [
    // [selector, animation, stagger step (ms), items per stagger cycle]
    ['.hero-logo', 'zoom-in', 0, 1],
    ['.hero .season', 'fade-down', 0, 1],
    ['.hero h1', 'fade-up', 0, 1, 100],
    ['.hero .welcome', 'fade-up', 0, 1, 200],
    ['.hero-cta', 'fade-up', 0, 1, 300],
    ['.vote-band .container > div', 'fade-right', 0, 1],
    ['.vote-band .container > .btn', 'fade-left', 0, 1],
    ['.event-banner', 'fade-up', 0, 1],
    ['.countdown > div', 'flip-up', 100, 4],
    ['.announce', 'fade-up', 0, 1],
    ['.section-head', 'fade-up', 0, 1],
    ['.page-head .container > *', 'fade-up', 80, 6],
    ['.cat-card', 'fade-up', 90, 3],
    ['.step', 'fade-up', 120, 4],
    ['.nom-card', 'zoom-in-up', 80, 4],
    ['.poster-wrap', 'fade-up', 0, 1],
    ['.profile .portrait', 'zoom-in', 0, 1],
    ['.profile > div:last-child', 'fade-up', 0, 1, 150],
    ['.vote-layout > *', 'fade-up', 120, 2],
    ['.receipt', 'zoom-in', 0, 1],
    ['.kpis .kpi', 'fade-up', 70, 4],
    ['.tx', 'fade-up', 50, 4],
    ['.cat-progress .row', 'fade-left', 40, 5],
    ['main .manage-item', 'fade-up', 50, 4],
    ['.site-footer .footer-grid > div', 'fade-up', 100, 3],
    ['.login-box', 'zoom-in', 0, 1]
  ];
  const reducedMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let aosReady = false;
  function animate() {
    if (!window.AOS || reducedMotion()) return;
    const admin = document.body.dataset.page === 'admin';
    AOS_MAP.forEach(([sel, anim, step, cycle, base = 0]) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (el.hasAttribute('data-aos')) return;
        if (admin && !el.closest('.site-footer, .login-box') && !el.matches('.login-box')) return; // keep the dashboard snappy
        el.classList.remove('reveal');
        el.setAttribute('data-aos', anim);
        const delay = base + (step ? (i % cycle) * step : 0);
        if (delay) el.setAttribute('data-aos-delay', String(delay));
      });
    });
    if (!aosReady) {
      AOS.init({ duration: 750, easing: 'ease-out-cubic', once: true, offset: 30, anchorPlacement: 'top-bottom' });
      aosReady = true;
    } else {
      AOS.refreshHard();
    }
  }
  function onScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
  }

  // ---------- Layout ----------
  function renderLayout() {
    const page = document.body.dataset.page || '';
    const links = [
      ['home', 'index.html', 'Home'],
      ['categories', 'categories.html', 'Categories'],
      ['history', 'history.html', 'My Votes'],
      ['admin', 'admin.html', 'Admin']
    ];
    const header = document.getElementById('site-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML = `
        <div class="container nav">
          <a class="brand" href="index.html" aria-label="PEA home">
            <img src="assets/logo.png" alt="PEA logo" width="44" height="44">
            <span><strong>PEA</strong><small>Paynesville Entertainment Awards</small></span>
          </a>
          <div class="nav-right">
            <button class="theme-toggle" type="button"></button>
            <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
          </div>
          <nav class="nav-links">
            ${links.map(([k, href, label]) => `<a href="${href}" class="${k === page ? 'active' : ''}">${label}</a>`).join('')}
            <a href="categories.html" class="btn btn-gold btn-sm">Vote Now</a>
          </nav>
        </div>`;
      const toggle = header.querySelector('.nav-toggle');
      toggle.addEventListener('click', () => {
        const open = header.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });
      header.querySelector('.theme-toggle').addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    }
    const footer = document.getElementById('site-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = `
        <div class="container footer-grid">
          <div>
            <a class="brand" href="index.html"><img src="assets/logo.png" alt="" width="44" height="44">
              <span><strong>PEA</strong><small>Paynesville Entertainment Awards</small></span></a>
            <p class="muted">Celebrating the music, film and creative talent of Paynesville, Liberia.</p>
            <p class="muted small">For sponsorship, call <a href="tel:${settings().sponsorPhone.replace(/\s/g, '')}">${esc(settings().sponsorPhone)}</a> · Follow us ${esc(settings().social)}</p>
          </div>
          <div><h4>Explore</h4>${links.map(([, h, l]) => `<a href="${h}">${l}</a>`).join('')}</div>
          <div><h4>How voting works</h4>
            <p class="muted small">Voting is free. Enter your email to vote — each email gets <b>${limit()} votes in every category</b>.</p></div>
        </div>
        <div class="container footer-bottom">© ${new Date().getFullYear()} Paynesville Entertainment Awards · Prototype preview</div>`;
    }
    setTheme(currentTheme());

    // Gold scroll-progress bar under the header
    if (!document.getElementById('scroll-progress')) {
      const bar = document.createElement('div');
      bar.id = 'scroll-progress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      addEventListener('scroll', onScrollProgress, { passive: true });
      addEventListener('resize', onScrollProgress);
    }
    // Run after every page's own DOMContentLoaded rendering has finished
    setTimeout(() => { animate(); onScrollProgress(); }, 0);
  }

  document.addEventListener('DOMContentLoaded', renderLayout);
  // Keep tabs in sync (e.g. admin dashboard updates live when votes are cast in another tab)
  window.addEventListener('storage', e => { if (e.key === KEY) { state = null; document.dispatchEvent(new CustomEvent('pea:update')); } });

  return {
    load, save, reload, reset, settings, categories, nominees, category, nominee, byCategory,
    votesFor, categoryTotal, totalVotes, ballots, limit, castVote, findBallot, historyFor,
    normalizeEmail, validEmail, usedInCategory, remainingInCategory,
    addNominee, updateNominee, removeNominee, addCategory, removeCategory,
    updateSettings, generateDemoVotes, bioFor, animate, esc, num, param, fmtDate, maskEmail, photo, toast, setTheme, currentTheme
  };
})();
