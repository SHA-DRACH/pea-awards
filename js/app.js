/* PEA core: storage, vote counting, shared layout and helpers.
   PROTOTYPE NOTE: data is kept in the browser's localStorage. A production build
   must move votes, payments and admin auth to a secure server + database. */
const PEA = (() => {
  const KEY = 'pea_state_v2';
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
    s.transactions = [];
    return s;
  }

  // Admin demo helper: fill in sample transactions so the dashboard can be previewed.
  function generateDemoVotes(count = 60) {
    const s = load();
    const names = ['Musu K.', 'Jartu S.', 'Emmanuel T.', 'Fatu B.', 'Prince W.', 'Hawa D.', 'Joseph K.', 'Comfort N.', 'Varney C.', 'Mamie G.'];
    const pkgs = [1, 4, 10, 20, 40, 100];
    for (let i = 0; i < count; i++) {
      const n = s.nominees[Math.floor(Math.random() * s.nominees.length)];
      const qty = pkgs[Math.floor(Math.random() * pkgs.length)];
      const method = Math.random() < .5 ? 'orange' : 'mtn';
      const phone = (method === 'orange' ? '077' : '088') + String(Math.floor(1e6 + Math.random() * 8.99e6)).slice(0, 7);
      s.votes[n.id] = (s.votes[n.id] || 0) + qty;
      s.transactions.push({
        ref: makeRef(), nomineeId: n.id, nomineeName: n.name, categoryId: n.categoryId, votes: qty,
        amount: +(qty * s.settings.pricePerVote).toFixed(2), voterName: names[i % names.length], phone, method,
        status: 'Successful', demo: true, date: new Date(Date.now() - Math.random() * 7 * 864e5).toISOString()
      });
    }
    s.transactions.sort((a, b) => b.date.localeCompare(a.date));
    save();
  }
  const bioFor = n => n.bio || `Nominated for ${category(n.categoryId)?.name || 'an award'} at the Paynesville Entertainment Awards ${settings().season}. Show your support — every vote counts!`;

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
  const transactions = () => load().transactions;

  // ---------- Vote counting ----------
  function normalizePhone(p) {
    let d = String(p || '').replace(/\D/g, '');
    if (d.startsWith('231')) d = d.slice(3);
    if (d.length === 9) d = '0' + d;
    return d;
  }
  function validPhone(p) { return /^0\d{9}$/.test(normalizePhone(p)); }

  function makeRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let r = '';
    for (let i = 0; i < 8; i++) r += chars[Math.floor(Math.random() * chars.length)];
    return 'PEA-' + r;
  }

  function recordPurchase({ nomineeId, votes, voterName, phone, method }) {
    const s = load();
    const n = nominee(nomineeId);
    if (!n) throw new Error('Nominee not found');
    if (!s.settings.votingOpen) throw new Error('Voting is currently closed');
    const qty = Math.max(1, Math.floor(Number(votes)));
    const tx = {
      ref: makeRef(),
      nomineeId,
      nomineeName: n.name,
      categoryId: n.categoryId,
      votes: qty,
      amount: +(qty * s.settings.pricePerVote).toFixed(2),
      voterName: (voterName || '').trim() || 'Anonymous',
      phone: normalizePhone(phone),
      method,
      status: 'Successful',
      date: new Date().toISOString()
    };
    s.votes[nomineeId] = (s.votes[nomineeId] || 0) + qty;   // automatic count
    s.transactions.unshift(tx);
    save();
    return tx;
  }
  const findTx = ref => transactions().find(t => t.ref === ref);
  const historyFor = phone => transactions().filter(t => t.phone === normalizePhone(phone));

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
  const money = n => '$' + Number(n).toFixed(2);
  const num = n => Number(n).toLocaleString();
  const param = k => new URLSearchParams(location.search).get(k);
  const fmtDate = iso => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  const methodName = m => m === 'orange' ? 'Orange Money' : m === 'mtn' ? 'Lonestar Cell MTN MoMo' : m;

  function initials(name) {
    const clean = name.replace(/[“”"]/g, '').split('–')[0].trim();
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
    if (!el) { el = document.createElement('div'); el.id = 'pea-toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => el.className = 'toast', 2800);
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
          <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
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
          <div><h4>Pay with</h4><span class="pay-chip orange">Orange Money</span><span class="pay-chip mtn">Lonestar Cell MTN MoMo</span>
            <p class="muted small">Only ${money(settings().pricePerVote)} per vote</p></div>
        </div>
        <div class="container footer-bottom">© ${new Date().getFullYear()} Paynesville Entertainment Awards · Prototype preview — no real payments are processed.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', renderLayout);
  // Keep tabs in sync (e.g. admin dashboard updates live when votes are cast in another tab)
  window.addEventListener('storage', e => { if (e.key === KEY) { state = null; document.dispatchEvent(new CustomEvent('pea:update')); } });

  return {
    load, save, reload, reset, settings, categories, nominees, category, nominee, byCategory,
    votesFor, categoryTotal, totalVotes, transactions, recordPurchase, findTx, historyFor,
    normalizePhone, validPhone, addNominee, updateNominee, removeNominee, addCategory, removeCategory,
    updateSettings, generateDemoVotes, bioFor, esc, money, num, param, fmtDate, methodName, photo, toast
  };
})();
