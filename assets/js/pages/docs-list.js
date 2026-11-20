/* Documents › list (ออกบิล / เอกสารทั้งหมด) */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t, D = BI.docs;
  const state = { type: '', status: '', q: '', limit: 30 };

  BI.pages = BI.pages || {};
  BI.pages.docs = {
    title: 'nav.docs',
    crumb: 'nav.sec.documents',
    render(view, params) {
      if (params.query.type !== undefined) state.type = params.query.type;
      const docs = D.all();
      const c = D.company();
      const month = U.ymd(new Date()).slice(0, 7);
      const live = (d) => d.status !== 'draft' && d.status !== 'cancelled';
      const ivs = docs.filter((d) => d.type === 'IV' && live(d));
      const open = ivs.filter((d) => ['unpaid', 'overdue'].includes(D.status(d)));
      const overdue = open.filter((d) => D.status(d) === 'overdue');
      const sumNet = (rows) => rows.reduce((a, d) => a + D.calc(d).net, 0);
      const monthSales = docs.filter((d) => live(d) && d.date.startsWith(month) && ['IV', 'CS', 'DB', 'CN'].includes(d.type))
        .reduce((a, d) => a + (d.type === 'CN' ? -1 : 1) * D.calc(d).grand, 0);
      const pendingQt = docs.filter((d) => d.type === 'QT' && D.status(d) === 'pending');

      const counts = U.sumBy(docs, 'type');
      const statuses = ['draft', 'unpaid', 'overdue', 'paid', 'pending', 'accepted', 'billed', 'cancelled'];

      view.innerHTML = `
        ${c.is_example ? `<div class="notice">${t('d.companyExample')} <a href="#/settings">${t('d.goSettings')} →</a></div>` : ''}
        ${ui.kpiRow([
          { label: t('d.kpiOpen'), value: U.money2(sumNet(open)), hint: `${U.num(open.length)} ${t('unit.docs')}` },
          { label: t('d.kpiOverdue'), value: U.money2(sumNet(overdue)), hint: `${U.num(overdue.length)} ${t('unit.docs')}` },
          { label: t('d.kpiMonth'), value: U.money2(monthSales), hint: t('d.kpiMonthHint') },
          { label: t('d.kpiQuotes'), value: U.num(pendingQt.length), hint: U.money2(sumNet(pendingQt)) }
        ]).replace('<div class="kpi">', '<div class="kpi accent">')}
        <div class="chip-row" role="group" aria-label="${t('d.filterType')}">
          <button type="button" class="chip" data-type="" aria-pressed="${!state.type}">${t('d.all')}<span class="count">${docs.length}</span></button>
          ${D.TYPE_ORDER.map((k) => `<button type="button" class="chip" data-type="${k}" aria-pressed="${state.type === k}">${D.typeName(k)}<span class="count">${counts[k] || 0}</span></button>`).join('')}
        </div>
        <div class="toolbar">
          <input type="search" class="input" id="docSearch" placeholder="${t('d.searchPh')}" value="${U.esc(state.q)}" aria-label="${t('ctrl.search')}">
          <select class="input" id="docStatus" aria-label="${t('col.status')}">
            <option value="">${t('d.allStatus')}</option>
            ${statuses.map((s) => `<option value="${s}" ${state.status === s ? 'selected' : ''}>${t('st.' + s)}</option>`).join('')}
          </select>
          <button type="button" class="btn primary" id="newDoc">${ui.icon('plus', 18)}${t('d.new')}</button>
        </div>
        <div id="docList"></div>
        ${D.hasDemo() ? `<div class="notice demo-bar"><span>${t('d.demoNotice')}</span><button type="button" class="btn sm" id="clearDemo">${ui.icon('trash', 16)}${t('d.clearDemo')}</button></div>` : ''}`;

      const listEl = view.querySelector('#docList');
      const draw = () => {
        const q = state.q.toLowerCase();
        let rows = docs.filter((d) => (!state.type || d.type === state.type) && (!state.status || D.status(d) === state.status) &&
          (!q || [d.no, d.party && d.party.name, d.ref, D.typeName(d.type)].some((v) => String(v || '').toLowerCase().includes(q))));
        rows.sort((a, b) => b.date.localeCompare(a.date) || String(b.created).localeCompare(String(a.created)));
        const total = rows.length;
        rows = rows.slice(0, state.limit);
        listEl.innerHTML = total ? `<ul class="doc-list">${rows.map((d) => {
          const x = D.calc(d);
          return `<li><a class="doc-row" href="#/docs/view/${d.id}">
            <span class="doc-ico">${ui.icon(D.type(d.type).icon, 20)}</span>
            <span class="doc-main"><strong>${U.esc(d.party.name || t('d.noParty'))}</strong>
              <small>${U.esc(d.no || t('st.draft'))} · ${D.typeName(d.type)} · ${U.fmtDate(d.date)}</small></span>
            <span class="doc-side"><b>${U.money2(x.net)}</b>${D.badge(d)}</span>
          </a></li>`;
        }).join('')}
        ${total > rows.length ? `<li class="more-row"><button type="button" class="btn ghost" id="moreDocs">${t('d.more')} (${total - rows.length})</button></li>` : ''}</ul>`
          : `<div class="card"><p class="empty">${t('d.empty')}</p></div>`;
        const more = listEl.querySelector('#moreDocs');
        if (more) more.addEventListener('click', () => { state.limit += 30; draw(); });
      };
      draw();

      view.querySelectorAll('.chip[data-type]').forEach((b) => b.addEventListener('click', () => {
        state.type = b.dataset.type; state.limit = 30;
        view.querySelectorAll('.chip[data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        draw();
      }));
      view.querySelector('#docSearch').addEventListener('input', U.debounce((e) => { state.q = e.target.value.trim(); draw(); }, 150));
      view.querySelector('#docStatus').addEventListener('change', (e) => { state.status = e.target.value; draw(); });
      view.querySelector('#newDoc').addEventListener('click', () => BI.app.openSheet());
      const cd = view.querySelector('#clearDemo');
      if (cd) cd.addEventListener('click', async () => {
        if (!(await ui.confirm(t('d.clearDemoConfirm')))) return;
        D.clearDemo(); ui.toast(t('d.demoCleared'), 'good'); BI.app.render();
      });
    }
  };
})(window.BI);
