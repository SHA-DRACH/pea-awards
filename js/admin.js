/* PEA Admin Dashboard (prototype).
   SECURITY NOTE: this login is a client-side demo gate only. The production version
   must authenticate organizers on a server and read votes from a protected database. */
(() => {
  const DEMO_PASSWORD = 'pea2026';
  const SESSION_KEY = 'pea_admin';
  const app = document.getElementById('app');
  const E = PEA.esc;
  let tab = 'overview';
  let txSearch = '';
  let resultsCat = 'all';

  const loggedIn = () => { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } };

  function login() {
    app.innerHTML = `
      <div class="card login-box reveal">
        <img src="assets/logo.png" alt="PEA">
        <h1 style="font-size:1.6rem" class="gold-text">Organizer Login</h1>
        <p class="muted">Private area for managing the competition.</p>
        <form id="login-form" novalidate>
          <div class="field" style="text-align:left">
            <label for="pw">Password</label>
            <input class="input" id="pw" type="password" autocomplete="current-password" placeholder="Enter organizer password">
            <span class="error-text" id="pw-err"></span>
          </div>
          <button class="btn btn-gold btn-block" type="submit">Sign in</button>
        </form>
        <p class="notice" style="margin-top:18px">Prototype demo password: <b>${DEMO_PASSWORD}</b></p>
      </div>`;
    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      if (document.getElementById('pw').value === DEMO_PASSWORD) {
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
        render();
      } else {
        document.getElementById('pw-err').textContent = 'Incorrect password.';
      }
    });
  }

  const TABS = [['overview', '📊 Overview'], ['results', '🏆 Results'], ['transactions', '🗳️ Vote log'], ['nominees', '👥 Nominees'], ['categories', '🗂️ Categories'], ['settings', '⚙️ Settings']];

  function render() {
    if (!loggedIn()) return login();
    PEA.reload();
    app.innerHTML = `
      <div class="admin-shell">
        <nav class="admin-nav">${TABS.map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? 'active' : ''}">${l}</button>`).join('')}
          <button data-action="logout">🚪 Log out</button></nav>
        <section id="panel"></section>
      </div>`;
    app.querySelector('.admin-nav').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.action === 'logout') { try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {} return render(); }
      tab = b.dataset.tab; render();
    });
    ({ overview, results, transactions, nominees, categories, settings })[tab]();
  }
  const panel = () => document.getElementById('panel');

  // ---------- Overview ----------
  function overview() {
    const bs = PEA.ballots();
    const voters = new Set(bs.map(x => x.email)).size;
    const today = new Date().toDateString();
    const todayVotes = bs.filter(x => new Date(x.date).toDateString() === today).length;
    const avg = voters ? (bs.length / voters).toFixed(1) : '0';
    const leaders = PEA.categories().map(c => {
      const list = PEA.byCategory(c.id).slice().sort((a, b) => PEA.votesFor(b.id) - PEA.votesFor(a.id));
      return { c, top: list[0], total: PEA.categoryTotal(c.id) };
    });
    const busiest = leaders.slice().sort((a, b) => b.total - a.total).slice(0, 5);
    const maxT = Math.max(1, ...busiest.map(x => x.total));
    panel().innerHTML = `
      <div class="panel-head"><h2>Dashboard</h2><span class="live">Live vote count</span></div>
      <div class="kpis">
        <div class="kpi"><span>Total votes</span><strong>${PEA.num(PEA.totalVotes())}</strong></div>
        <div class="kpi"><span>Unique voters</span><strong>${PEA.num(voters)}</strong></div>
        <div class="kpi"><span>Votes today</span><strong>${PEA.num(todayVotes)}</strong></div>
        <div class="kpi"><span>Votes / voter</span><strong>${avg}</strong></div>
        <div class="kpi"><span>Categories</span><strong>${PEA.categories().length}</strong></div>
      </div>
      <div class="grid grid-2" style="margin-bottom:20px">
        <div class="card"><h3 style="font-size:1.05rem">Most active categories</h3>
          ${busiest.map(({ c, total }) => `<div style="margin:12px 0"><div class="sum-row"><span>${c.icon} ${E(c.name)}</span><b>${PEA.num(total)}</b></div><div class="bar"><span style="width:${total / maxT * 100}%"></span></div></div>`).join('')}
        </div>
        <div class="card"><h3 style="font-size:1.05rem">Recent votes</h3>
          ${bs.slice(0, 6).map(t => `<div class="sum-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${E(t.nomineeName)}</span><b class="small muted" style="white-space:nowrap">${E(PEA.maskEmail(t.email))}</b></div>`).join('') || '<p class="muted">No votes yet.</p>'}
        </div>
      </div>
      <div class="card">
        <h3 style="font-size:1.05rem">Current leaders by category</h3>
        <div class="table-wrap" style="margin-top:12px"><table>
          <thead><tr><th>Category</th><th>Leading nominee</th><th>Votes</th><th>Category total</th></tr></thead>
          <tbody>${leaders.map(({ c, top, total }) => `<tr><td>${c.icon} ${E(c.name)}</td><td>${top && total ? E(top.name) : '<span class="muted">—</span>'}</td><td>${top ? PEA.num(PEA.votesFor(top.id)) : 0}</td><td>${PEA.num(total)}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>
      ${!bs.length ? `<p class="notice" style="margin-top:20px">No votes yet. To preview the dashboard with sample data, open <b>Settings → Generate sample votes</b>.</p>` : ''}`;
  }

  // ---------- Results ----------
  function results() {
    const cats = resultsCat === 'all' ? PEA.categories() : [PEA.category(resultsCat)].filter(Boolean);
    panel().innerHTML = `
      <div class="panel-head"><h2>Results</h2>
        <div class="toolbar">
          <select class="input" id="res-cat"><option value="all">All categories</option>${PEA.categories().map(c => `<option value="${c.id}" ${c.id === resultsCat ? 'selected' : ''}>${E(c.name)}</option>`).join('')}</select>
          <button class="btn btn-sm" id="export-results">⬇ Export CSV</button>
        </div></div>
      <div class="grid grid-2">${cats.map(c => {
        const total = PEA.categoryTotal(c.id);
        const list = PEA.byCategory(c.id).slice().sort((a, b) => PEA.votesFor(b.id) - PEA.votesFor(a.id));
        return `<div class="card"><div class="panel-head" style="margin-bottom:8px"><h3 style="font-size:1rem;margin:0">${c.icon} ${E(c.name)}</h3><span class="muted small">${PEA.num(total)} votes</span></div>
          ${list.map((n, i) => {
            const v = PEA.votesFor(n.id), pct = total ? v / total * 100 : 0;
            return `<div class="result-row"><img src="${PEA.photo(n)}" alt="">
              <div><div class="top"><b>${E(n.name)}${i === 0 && v > 0 ? '<span class="leader">👑 Leading</span>' : ''}</b><span>${PEA.num(v)} · ${pct.toFixed(1)}%</span></div>
              <div class="bar"><span style="width:${pct}%"></span></div></div></div>`;
          }).join('')}</div>`;
      }).join('')}</div>`;
    document.getElementById('res-cat').onchange = e => { resultsCat = e.target.value; results(); };
    document.getElementById('export-results').onclick = () => {
      const rows = [['Category', 'Nominee', 'Votes', 'Share %']];
      PEA.categories().forEach(c => {
        const total = PEA.categoryTotal(c.id);
        PEA.byCategory(c.id).forEach(n => rows.push([c.name, n.name, PEA.votesFor(n.id), total ? (PEA.votesFor(n.id) / total * 100).toFixed(2) : '0']));
      });
      downloadCSV('pea-results.csv', rows);
    };
  }

  // ---------- Vote log ----------
  function transactions() {
    const q = txSearch.toLowerCase();
    const list = PEA.ballots().filter(t => !q || [t.ref, t.nomineeName, t.voterName, t.email].join(' ').toLowerCase().includes(q));
    const shown = list.slice(0, 300);
    panel().innerHTML = `
      <div class="panel-head"><h2>Vote log</h2>
        <div class="toolbar"><input class="input" id="tx-search" type="search" placeholder="Search ref, nominee, email…" value="${E(txSearch)}">
        <button class="btn btn-sm" id="export-tx">⬇ Export CSV</button></div></div>
      <p class="muted small">${PEA.num(list.length)} vote${list.length === 1 ? '' : 's'} from ${PEA.num(new Set(list.map(x => x.email)).size)} email(s)${list.length > shown.length ? ` · showing latest ${shown.length}` : ''}</p>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Reference</th><th>Voter</th><th>Email</th><th>Nominee</th><th>Category</th></tr></thead>
        <tbody>${shown.map(t => `<tr><td>${PEA.fmtDate(t.date)}</td><td>${t.ref}${t.demo ? ' <span class="muted small">(demo)</span>' : ''}</td><td>${E(t.voterName)}</td><td>${E(t.email)}</td><td>${E(t.nomineeName)}</td><td>${E(PEA.category(t.categoryId)?.name || '')}</td></tr>`).join('') || '<tr><td colspan="6" class="center muted">No votes found.</td></tr>'}</tbody>
      </table></div>`;
    document.getElementById('tx-search').oninput = e => { txSearch = e.target.value; transactions(); const el = document.getElementById('tx-search'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); };
    document.getElementById('export-tx').onclick = () => downloadCSV('pea-votes.csv',
      [['Date', 'Reference', 'Voter', 'Email', 'Nominee', 'Category'],
        ...list.map(t => [t.date, t.ref, t.voterName, t.email, t.nomineeName, PEA.category(t.categoryId)?.name || ''])]);
  }

  // ---------- Nominees ----------
  function nominees() {
    panel().innerHTML = `
      <div class="panel-head"><h2>Nominees</h2></div>
      <div class="card" style="margin-bottom:20px">
        <h3 style="font-size:1.05rem" id="form-title">Add a nominee</h3>
        <form id="nom-form" class="grid grid-2" style="gap:0 16px" novalidate>
          <input type="hidden" id="nf-id">
          <div class="field"><label for="nf-name">Name</label><input class="input" id="nf-name" required></div>
          <div class="field"><label for="nf-cat">Category</label><select class="input" id="nf-cat">${PEA.categories().map(c => `<option value="${c.id}">${E(c.name)}</option>`).join('')}</select></div>
          <div class="field" style="grid-column:1/-1"><label for="nf-bio">Biography</label><textarea class="input" id="nf-bio" placeholder="Short biography shown on the nominee page"></textarea></div>
          <div class="field"><label for="nf-photo">Photo</label><input class="input" id="nf-photo" type="file" accept="image/*"><span class="hint">Image is resized and stored in this browser (prototype).</span></div>
          <div class="field" style="justify-content:flex-end"><div class="toolbar"><button class="btn btn-gold" type="submit" id="nf-submit">Add nominee</button><button class="btn btn-ghost" type="button" id="nf-cancel" hidden>Cancel</button></div></div>
        </form>
      </div>
      <div class="toolbar" style="margin-bottom:14px"><select class="input" id="nf-filter"><option value="">All categories</option>${PEA.categories().map(c => `<option value="${c.id}">${E(c.name)}</option>`).join('')}</select></div>
      <div class="grid grid-2" id="nom-list" style="gap:10px"></div>`;

    const listEl = document.getElementById('nom-list');
    const filter = document.getElementById('nf-filter');
    const drawList = () => {
      const list = PEA.nominees().filter(n => !filter.value || n.categoryId === filter.value);
      listEl.innerHTML = list.map(n => `
        <div class="manage-item"><img src="${PEA.photo(n)}" alt="">
          <div class="info"><b>${E(n.name)}</b><small>${E(PEA.category(n.categoryId)?.name || '')} · ${PEA.num(PEA.votesFor(n.id))} votes</small></div>
          <button class="btn btn-sm btn-ghost" data-edit="${n.id}">Edit</button>
          <button class="btn btn-sm btn-danger" data-del="${n.id}" aria-label="Remove">✕</button></div>`).join('') || '<p class="muted">No nominees.</p>';
    };
    filter.onchange = drawList;
    drawList();

    let photoData = '';
    document.getElementById('nf-photo').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      resizeImage(f, 400).then(d => { photoData = d; PEA.toast('Photo ready'); });
    };
    const resetForm = () => {
      document.getElementById('nom-form').reset(); document.getElementById('nf-id').value = ''; photoData = '';
      document.getElementById('form-title').textContent = 'Add a nominee';
      document.getElementById('nf-submit').textContent = 'Add nominee';
      document.getElementById('nf-cancel').hidden = true;
    };
    document.getElementById('nf-cancel').onclick = resetForm;
    listEl.addEventListener('click', e => {
      const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
      if (ed) {
        const n = PEA.nominee(ed.dataset.edit);
        document.getElementById('nf-id').value = n.id;
        document.getElementById('nf-name').value = n.name;
        document.getElementById('nf-cat').value = n.categoryId;
        document.getElementById('nf-bio').value = n.bio || '';
        document.getElementById('form-title').textContent = 'Edit nominee';
        document.getElementById('nf-submit').textContent = 'Save changes';
        document.getElementById('nf-cancel').hidden = false;
        photoData = '';
        document.getElementById('nom-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (del) {
        const n = PEA.nominee(del.dataset.del);
        if (confirm(`Remove ${n.name}? Their ${PEA.votesFor(n.id)} votes will be removed from results.`)) { PEA.removeNominee(n.id); drawList(); PEA.toast('Nominee removed'); }
      }
    });
    document.getElementById('nom-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('nf-name').value.trim();
      if (!name) { PEA.toast('Please enter a name', 'error'); return; }
      const data = { name, categoryId: document.getElementById('nf-cat').value, bio: document.getElementById('nf-bio').value.trim() };
      if (photoData) data.photo = photoData;
      const id = document.getElementById('nf-id').value;
      if (id) { PEA.updateNominee(id, data); PEA.toast('Nominee updated'); } else { PEA.addNominee(data); PEA.toast('Nominee added'); }
      resetForm(); drawList();
    });
  }

  // ---------- Categories ----------
  function categories() {
    panel().innerHTML = `
      <div class="panel-head"><h2>Categories</h2></div>
      <div class="card" style="margin-bottom:20px">
        <h3 style="font-size:1.05rem">Add a category</h3>
        <form id="cat-form" class="grid grid-2" style="gap:0 16px" novalidate>
          <div class="field"><label for="cf-name">Category name</label><input class="input" id="cf-name" placeholder="e.g. Best Rapper of the Year"></div>
          <div class="field"><label for="cf-icon">Icon (emoji)</label><input class="input" id="cf-icon" maxlength="4" placeholder="🏆"></div>
          <div class="field" style="grid-column:1/-1"><label for="cf-desc">Description (optional)</label><input class="input" id="cf-desc"></div>
          <div><button class="btn btn-gold" type="submit">Add category</button></div>
        </form>
      </div>
      <div class="grid grid-2" style="gap:10px">${PEA.categories().map(c => `
        <div class="manage-item"><div style="font-size:1.6rem;width:48px;text-align:center">${c.icon}</div>
          <div class="info"><b>${E(c.name)}</b><small>${PEA.byCategory(c.id).length} nominees · ${PEA.num(PEA.categoryTotal(c.id))} votes</small></div>
          <button class="btn btn-sm btn-danger" data-del="${c.id}" aria-label="Remove">✕</button></div>`).join('')}</div>`;
    document.getElementById('cat-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('cf-name').value.trim();
      if (!name) { PEA.toast('Please enter a category name', 'error'); return; }
      PEA.addCategory(name, document.getElementById('cf-icon').value.trim(), document.getElementById('cf-desc').value);
      PEA.toast('Category added'); categories();
    });
    panel().onclick = e => {
      const del = e.target.closest('[data-del]'); if (!del) return;
      const c = PEA.category(del.dataset.del);
      if (c && confirm(`Delete "${c.name}" and all its nominees and votes?`)) { PEA.removeCategory(c.id); PEA.toast('Category deleted'); categories(); }
    };
  }

  // ---------- Settings ----------
  function settings() {
    const s = PEA.settings();
    const toLocal = iso => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
    panel().innerHTML = `
      <div class="panel-head"><h2>Settings</h2></div>
      <div class="card" style="margin-bottom:20px">
        <div class="manage-item" style="border:0;background:none;padding:0 0 16px">
          <div class="info"><b>Voting open</b><small>When off, nobody can vote. Each email can vote once per category.</small></div>
          <label class="switch"><input type="checkbox" id="st-open" ${s.votingOpen ? 'checked' : ''}><span></span></label>
        </div>
        <form id="st-form" class="grid grid-2" style="gap:0 16px" novalidate>
          <div class="field"><label for="st-season">Season</label><input class="input" id="st-season" value="${E(s.season)}"></div>
          <div class="field"><label for="st-date">Awards night date &amp; time</label><input class="input" id="st-date" type="datetime-local" value="${toLocal(s.eventDate)}"></div>
          <div class="field"><label for="st-venue">Venue</label><input class="input" id="st-venue" value="${E(s.eventVenue)}"></div>
          <div><button class="btn btn-gold" type="submit">Save settings</button></div>
        </form>
      </div>
      <div class="card">
        <h3 style="font-size:1.05rem">Demo data</h3>
        <p class="muted small">Use these to preview the dashboard. Sample votes come from example.com emails and are marked “(demo)”.</p>
        <div class="toolbar">
          <button class="btn btn-sm" id="st-demo">➕ Generate sample votes</button>
          <button class="btn btn-sm btn-danger" id="st-reset">↺ Reset all data</button>
        </div>
      </div>`;
    document.getElementById('st-open').onchange = e => { PEA.updateSettings({ votingOpen: e.target.checked }); PEA.toast(e.target.checked ? 'Voting is now OPEN' : 'Voting is now CLOSED'); };
    document.getElementById('st-form').addEventListener('submit', e => {
      e.preventDefault();
      const date = document.getElementById('st-date').value;
      PEA.updateSettings({
        season: document.getElementById('st-season').value.trim() || s.season,
        eventDate: date ? new Date(date).toISOString() : s.eventDate,
        eventVenue: document.getElementById('st-venue').value.trim() || s.eventVenue
      });
      PEA.toast('Settings saved');
    });
    document.getElementById('st-demo').onclick = () => { PEA.generateDemoVotes(25); PEA.toast('Sample votes from 25 demo voters added'); };
    document.getElementById('st-reset').onclick = () => { if (confirm('Reset all votes, nominees and settings to the original data?')) { PEA.reset(); PEA.toast('Data reset'); render(); } };
  }

  // ---------- Utils ----------
  function downloadCSV(name, rows) {
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function resizeImage(file, max) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = img.width * scale; cv.height = img.height * scale;
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL('image/jpeg', .82));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  document.addEventListener('DOMContentLoaded', render);
  // Live updates when votes are cast in another tab
  document.addEventListener('pea:update', () => { if (loggedIn() && ['overview', 'results', 'transactions'].includes(tab)) render(); });
})();
