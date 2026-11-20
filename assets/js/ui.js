/* ------------------------------------------------------------------
 * Reusable UI pieces: KPI tiles, cards, sortable / searchable tables,
 * status badges, toast, icons.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util;
  const t = (k) => BI.t(k);

  const ICONS = {
    grid: '<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    megaphone: '<path d="M3 10v4h3l7 5V5L6 10zM16 8a5 5 0 0 1 0 8"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    users: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 6v1"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 0 1 6 0M15 10h3M15 14h3"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
    upload: '<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>',
    download: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    doc: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    box: '<path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    quote: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 12h6M9 16h4M14 3v5h5"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9.5 12l2 2 3.5-4"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/>',
    minus: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9.5 14h5"/>',
    plusdoc: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9.5 14h5M12 11.5v5"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.6a1 1 0 0 0 1-.8L21 7H6"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M6 14h12v7H6z"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const icon = (name, size = 18) =>
    `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /**
   * KPI tile.
   * { label, value, delta (fraction or null), goodWhen: 'up'|'down', hint }
   */
  function kpi({ label, value, delta = null, goodWhen = 'up', hint = '' }) {
    let d = '';
    if (delta !== null && isFinite(delta)) {
      const up = delta >= 0;
      const good = goodWhen === 'up' ? up : !up;
      d = `<span class="delta ${Math.abs(delta) < 0.005 ? 'flat' : good ? 'good' : 'bad'}">${icon(up ? 'up' : 'down', 12)}${U.pct(Math.abs(delta))}</span>
           <span class="delta-note">${t('kpi.vsPrev')}</span>`;
    } else if (hint) {
      d = `<span class="delta-note">${U.esc(hint)}</span>`;
    }
    return `<div class="kpi"><p class="kpi-label">${U.esc(label)}</p><p class="kpi-value">${value}</p><div class="kpi-foot">${d}</div></div>`;
  }
  const kpiRow = (items) => `<section class="kpi-grid">${items.map(kpi).join('')}</section>`;

  function card({ title, sub = '', body, span = 1, actions = '', cls = '' }) {
    return `<section class="card span-${span} ${cls}">
      <header class="card-head"><div><h2>${U.esc(title)}</h2>${sub ? `<p>${U.esc(sub)}</p>` : ''}</div>${actions}</header>
      <div class="card-body">${body}</div></section>`;
  }
  const chartCard = (id, title, sub, span = 1, height = 280) =>
    card({ title, sub, span, body: `<div class="chart-box" style="height:${height}px"><canvas id="${id}" role="img" aria-label="${U.esc(title)}"></canvas></div>` });

  /** Translate a data value (e.g. stage "Won") if a dictionary entry exists. */
  const v = (val) => BI.tv(val);

  const STATUS_TONE = {
    Won: 'good', Active: 'good', Paid: 'good', Published: 'good',
    Lost: 'bad', Overdue: 'bad', Resigned: 'muted', Inactive: 'muted', Draft: 'muted',
    Pending: 'warn', Scheduled: 'info', Prospect: 'info', Negotiation: 'info', Proposal: 'info', Qualified: 'info', Lead: 'info'
  };
  const badge = (val) => `<span class="badge ${STATUS_TONE[val] || 'muted'}">${U.esc(v(val))}</span>`;

  /**
   * Sortable, searchable, paginated table.
   * columns: [{ key, label, fmt?(value,row)→html, align?:'right', sort?: 'num'|'text' }]
   * Returns HTML; call BI.ui.bindTables(root) after inserting into the DOM.
   */
  const tables = {};
  let tableSeq = 0;
  function table({ columns, rows, pageSize = 10, search = false, sortKey = null, sortDir = 'desc' }) {
    const id = 'tbl' + ++tableSeq;
    tables[id] = { columns, rows, pageSize, page: 0, q: '', sortKey, sortDir };
    return `<div class="table-wrap" data-table="${id}">
      ${search ? `<div class="table-tools"><input type="search" class="input" placeholder="${t('ctrl.search')}" aria-label="${t('ctrl.search')}"></div>` : ''}
      <div class="table-scroll"><table class="tbl"><thead></thead><tbody></tbody></table></div>
      <div class="table-foot"></div>
    </div>`;
  }

  function renderTable(el) {
    const s = tables[el.dataset.table];
    if (!s) return;
    let rows = s.rows;
    if (s.q) {
      const q = s.q.toLowerCase();
      rows = rows.filter((r) => s.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q) || String(v(r[c.key]) ?? '').toLowerCase().includes(q)));
    }
    if (s.sortKey) {
      const dir = s.sortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const x = a[s.sortKey], y = b[s.sortKey];
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
        return String(x ?? '').localeCompare(String(y ?? '')) * dir;
      });
    }
    const pages = Math.max(1, Math.ceil(rows.length / s.pageSize));
    s.page = Math.min(s.page, pages - 1);
    const slice = rows.slice(s.page * s.pageSize, (s.page + 1) * s.pageSize);

    el.querySelector('thead').innerHTML = `<tr>${s.columns.map((c) => {
      const active = s.sortKey === c.key;
      return `<th class="${c.align === 'right' ? 'num' : ''}" aria-sort="${active ? (s.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}">
        <button type="button" data-sort="${c.key}">${U.esc(c.label)}<span class="sort-ind">${active ? (s.sortDir === 'asc' ? '▲' : '▼') : ''}</span></button></th>`;
    }).join('')}</tr>`;
    el.querySelector('tbody').innerHTML = slice.length
      ? slice.map((r) => `<tr>${s.columns.map((c) => `<td class="${c.align === 'right' ? 'num' : ''}">${c.fmt ? c.fmt(r[c.key], r) : U.esc(r[c.key])}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${s.columns.length}" class="empty">${t('msg.noData')}</td></tr>`;
    el.querySelector('.table-foot').innerHTML = `<span>${t('tbl.rows').replace('{n}', U.num(rows.length))}</span>
      ${pages > 1 ? `<span class="pager">
        <button type="button" class="btn sm" data-page="-1" ${s.page === 0 ? 'disabled' : ''}>‹</button>
        <span>${s.page + 1} / ${pages}</span>
        <button type="button" class="btn sm" data-page="1" ${s.page >= pages - 1 ? 'disabled' : ''}>›</button></span>` : ''}`;
  }

  function bindTables(root) {
    root.querySelectorAll('[data-table]').forEach((el) => {
      const s = tables[el.dataset.table];
      renderTable(el);
      el.addEventListener('click', (e) => {
        const sb = e.target.closest('[data-sort]');
        if (sb) {
          const k = sb.dataset.sort;
          if (s.sortKey === k) s.sortDir = s.sortDir === 'asc' ? 'desc' : 'asc';
          else { s.sortKey = k; s.sortDir = 'desc'; }
          renderTable(el);
        }
        const pb = e.target.closest('[data-page]');
        if (pb) { s.page += +pb.dataset.page; renderTable(el); }
      });
      const input = el.querySelector('input[type=search]');
      if (input) input.addEventListener('input', U.debounce(() => { s.q = input.value.trim(); s.page = 0; renderTable(el); }, 150));
    });
  }
  function resetTables() { Object.keys(tables).forEach((k) => delete tables[k]); }

  /** Ranked list with an inline proportion bar — used for "top N" breakdowns. */
  function rankList(entries, fmt, { labelFmt = v } = {}) {
    if (!entries.length) return `<p class="empty">${t('msg.noData')}</p>`;
    const max = Math.max(...entries.map((e) => e[1])) || 1;
    return `<ol class="rank">${entries.map(([k, val]) => `<li>
      <span class="rank-label">${U.esc(labelFmt(k))}</span>
      <span class="rank-val">${fmt(val)}</span>
      <span class="rank-bar"><i style="width:${(val / max) * 100}%"></i></span></li>`).join('')}</ol>`;
  }

  function sampleNotice(names) {
    const sample = names.filter((n) => BI.store.isSample(n));
    if (!sample.length) return '';
    return `<div class="notice">${t('msg.sampleNotice')} <a href="#/data">${t('msg.connectData')} →</a></div>`;
  }

  let toastTimer;
  function toast(msg, tone = 'info') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + tone;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = 'toast'), 3200);
  }

  /** In-page confirmation dialog (browser confirm() is blocked in some embeds). */
  function confirmBox(message, { ok = t('ui.ok'), danger = false } = {}) {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'modal';
      el.setAttribute('role', 'alertdialog');
      el.innerHTML = `<div class="modal-panel confirm-panel"><p>${BI.util.esc(message)}</p>
        <div class="modal-actions"><button type="button" class="btn" data-v="0">${t('d.cancel')}</button>
        <button type="button" class="btn primary" data-v="1">${BI.util.esc(ok)}</button></div></div>`;
      document.body.appendChild(el);
      const done = (v) => { el.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = (e) => { if (e.key === 'Escape') done(false); };
      document.addEventListener('keydown', onKey);
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (b) done(b.dataset.v === '1'); else if (e.target === el) done(false); });
      el.querySelector('[data-v="1"]').focus();
    });
  }

  BI.ui = { confirm: confirmBox, icon, kpi, kpiRow, card, chartCard, badge, table, bindTables, resetTables, rankList, sampleNotice, toast, v };
})(window.BI);
