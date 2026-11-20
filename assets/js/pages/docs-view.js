/* Documents › view, print & next steps.  Route: #/docs/view/<id> */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t, D = BI.docs, esc = U.esc;
  let printWhich = 'both';
  let onResize = null;

  function render(view, params) {
    const doc = D.get(params.rest);
    if (!doc) { view.innerHTML = `<div class="notice bad">${t('d.notFound')} <a href="#/docs">${t('nav.docs')}</a></div>`; return; }
    const ty = D.type(doc.type);
    const st = D.status(doc);
    const live = doc.status !== 'draft' && doc.status !== 'cancelled';
    document.getElementById('pageTitle').textContent = doc.no || t('st.draft');
    document.getElementById('pageCrumb').textContent = D.typeName(doc.type);

    // next-step actions
    const next = (ty.next || []).filter((k) => {
      if (!live) return false;
      if (k === 'RE' && (st === 'paid')) return false;
      if (k === 'BN' && st === 'paid') return false;
      if (doc.type === 'QT' && st === 'accepted') return false;
      return true;
    });
    const related = [];
    if (doc.source) { const s = D.get(doc.source); if (s) related.push(s); }
    (doc.refs || []).map(D.get).filter(Boolean).forEach((d) => related.push(d));
    D.children(doc.id).forEach((d) => { if (!related.includes(d)) related.push(d); });

    const x = D.calc(doc);
    view.innerHTML = `
      <div class="card">
        <div class="view-actions">
          <a class="btn ghost" href="#/docs">${ui.icon('back', 18)}${t('nav.docs')}</a>
          <span>${D.badge(doc)}</span>
          <strong style="font-size:18px">${U.money2(x.wht ? x.net : x.grand)}</strong>
          <span class="spacer"></span>
          <div class="print-opts" role="group" aria-label="${t('d.printWhich')}">
            ${['both', 'original', 'copy'].map((w) => `<button type="button" data-which="${w}" aria-pressed="${printWhich === w}">${t('d.print.' + w)}</button>`).join('')}
          </div>
          <button type="button" class="btn primary" id="printBtn">${ui.icon('print', 18)}${t('d.printPdf')}</button>
        </div>
        <div class="view-actions" style="margin-top:10px">
          ${doc.status === 'draft' ? `<a class="btn" href="#/docs/edit/${doc.id}">${ui.icon('edit', 18)}${t('d.edit')}</a>
            <button type="button" class="btn primary" id="issueBtn">${ui.icon('check', 18)}${t('d.issue')}</button>` : ''}
          ${next.map((k) => `<a class="btn ${k === 'RE' || k === 'IV' ? 'primary' : ''}" href="#/docs/new?type=${k}&from=${doc.id}">${ui.icon(D.type(k).icon, 18)}${t('d.next.' + k)}</a>`).join('')}
          <a class="btn" href="#/docs/new?dup=${doc.id}">${ui.icon('copy', 18)}${t('d.duplicate')}</a>
          <span class="spacer"></span>
          ${doc.status === 'draft' ? `<button type="button" class="btn ghost" id="delBtn">${ui.icon('trash', 18)}${t('d.delete')}</button>` : ''}
          ${live ? `<button type="button" class="btn ghost" id="cancelBtn">${ui.icon('x', 18)}${t('d.cancelDoc')}</button>` : ''}
        </div>
        ${related.length ? `<div style="margin-top:12px"><p class="footnote" style="margin:0 0 6px">${t('d.related')}</p><div class="related">${related.map((d) => `<a href="#/docs/view/${d.id}">${ui.icon(D.type(d.type).icon, 14)}${esc(d.no || t('st.draft'))} · ${D.typeName(d.type)}</a>`).join('')}</div></div>` : ''}
      </div>
      <div class="paper-wrap"><div class="paper-scale" id="paperScale">${D.page(doc, printWhich === 'copy' ? 'copy' : 'original')}</div></div>`;

    // scale the A4 preview to the available width
    const wrap = view.querySelector('.paper-wrap');
    const scaleEl = view.querySelector('#paperScale');
    const fit = () => {
      const avail = wrap.clientWidth - parseFloat(getComputedStyle(wrap).paddingLeft) * 2;
      const w = scaleEl.scrollWidth || 794;
      const s = Math.min(1, avail / w);
      scaleEl.style.transform = `scale(${s})`;
      scaleEl.style.marginLeft = s < 1 ? '0' : Math.max(0, (avail - w) / 2) + 'px';
      wrap.style.height = scaleEl.scrollHeight * s + parseFloat(getComputedStyle(wrap).paddingTop) * 2 + 'px';
    };
    fit();
    if (onResize) window.removeEventListener('resize', onResize);
    onResize = U.debounce(fit, 100);
    window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    view.querySelectorAll('[data-which]').forEach((b) => b.addEventListener('click', () => {
      printWhich = b.dataset.which;
      view.querySelectorAll('[data-which]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      scaleEl.innerHTML = D.page(doc, printWhich === 'copy' ? 'copy' : 'original');
      fit();
    }));
    view.querySelector('#printBtn').addEventListener('click', () => D.print(doc, printWhich));
    const on = (id, fn) => { const el = view.querySelector(id); if (el) el.addEventListener('click', fn); };
    on('#issueBtn', () => {
      const saved = D.issue(doc);
      ui.toast(t('d.issued').replace('{no}', saved.no), 'good');
      BI.app.render();
    });
    on('#delBtn', async () => {
      if (!(await ui.confirm(t('d.deleteConfirm'), { ok: t('d.delete') }))) return;
      D.remove(doc.id); ui.toast(t('d.deleted')); location.hash = '#/docs';
    });
    on('#cancelBtn', async () => {
      if (!(await ui.confirm(t('d.cancelConfirm').replace('{no}', doc.no), { ok: t('d.cancelDoc') }))) return;
      D.cancel(doc.id); ui.toast(t('d.cancelled')); BI.app.render();
    });
  }

  BI.pages = BI.pages || {};
  BI.pages['docs/view'] = { title: 'nav.docs', crumb: 'nav.docs', render };
})(window.BI);
