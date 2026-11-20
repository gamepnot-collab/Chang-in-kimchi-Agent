/* Products & raw materials catalogue (used when issuing documents). */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t, D = BI.docs, esc = U.esc;
  const state = { kind: 'product', q: '' };

  function modal(p) {
    const isNew = !p;
    p = p || { sku: '', name: '', name_en: '', unit: '', price: 0, cost: 0, shelf_life_days: 0, fda_no: '', kind: state.kind };
    const f = (label, name, value, type = 'text', extra = '') => `<label class="field"><span>${label}</span><input class="input" name="${name}" type="${type}" value="${esc(value ?? '')}" ${extra}></label>`;
    const el = document.createElement('div');
    el.className = 'modal';
    el.innerHTML = `<form class="modal-panel" novalidate>
      <h2>${isNew ? t('p.add') : t('p.edit')}</h2>
      <div class="form-grid">
        <label class="field full"><span>${t('p.kind')}</span><select class="input" name="kind">
          <option value="product" ${p.kind !== 'material' ? 'selected' : ''}>${t('p.kind.product')}</option>
          <option value="material" ${p.kind === 'material' ? 'selected' : ''}>${t('p.kind.material')}</option></select></label>
        ${f(t('p.sku'), 'sku', p.sku, 'text', 'required')}
        ${f(t('d.unit'), 'unit', p.unit, 'text', `placeholder="${t('p.unitPh')}"`)}
        <label class="field full"><span>${t('p.name')}</span><input class="input" name="name" value="${esc(p.name)}" required></label>
        <label class="field full"><span>${t('p.nameEn')}</span><input class="input" name="name_en" value="${esc(p.name_en)}"></label>
        ${f(t('p.price'), 'price', p.price, 'number', 'min="0" step="0.01" inputmode="decimal"')}
        ${f(t('p.cost'), 'cost', p.cost, 'number', 'min="0" step="0.01" inputmode="decimal"')}
        ${f(t('p.shelfLife'), 'shelf_life_days', p.shelf_life_days, 'number', 'min="0" step="1"')}
        ${f(t('p.fda'), 'fda_no', p.fda_no, 'text', 'placeholder="xx-x-xxxxx-x-xxxx"')}
      </div>
      <div class="modal-actions">
        ${isNew ? '' : `<button type="button" class="btn ghost" data-del>${ui.icon('trash', 18)}${t('d.delete')}</button>`}
        <span class="spacer"></span>
        <button type="button" class="btn" data-close>${t('d.cancel')}</button>
        <button type="submit" class="btn primary">${t('p.save')}</button>
      </div></form>`;
    document.body.appendChild(el);
    const form = el.querySelector('form');
    form.querySelector('[name=name]').focus();
    const close = () => el.remove();
    el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-close]')) close(); });
    const del = el.querySelector('[data-del]');
    if (del) del.addEventListener('click', async () => { if (await ui.confirm(t('p.deleteConfirm'))) { D.removeProduct(p.id); close(); BI.app.render(); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(form));
      if (!v.sku.trim() || !v.name.trim()) { ui.toast(t('p.required'), 'bad'); return; }
      const dup = D.products().find((x) => x.sku === v.sku.trim() && x.id !== p.id);
      if (dup) { ui.toast(t('p.dupSku'), 'bad'); return; }
      D.saveProduct({ ...p, ...v, sku: v.sku.trim(), name: v.name.trim(), price: +v.price || 0, cost: +v.cost || 0, shelf_life_days: +v.shelf_life_days || 0, id: p.id || v.sku.trim() });
      ui.toast(t('p.saved'), 'good');
      close(); BI.app.render();
    });
  }

  BI.pages = BI.pages || {};
  BI.pages.products = {
    title: 'nav.products',
    crumb: 'nav.sec.documents',
    render(view) {
      const list = D.products();
      const counts = U.sumBy(list, (p) => (p.kind === 'material' ? 'material' : 'product'));
      view.innerHTML = `
        <div class="chip-row" role="group">
          ${['product', 'material'].map((k) => `<button type="button" class="chip" data-kind="${k}" aria-pressed="${state.kind === k}">${t('p.kind.' + k)}<span class="count">${counts[k] || 0}</span></button>`).join('')}
        </div>
        <div class="toolbar">
          <input type="search" class="input" id="prodSearch" placeholder="${t('p.search')}" value="${esc(state.q)}" aria-label="${t('ctrl.search')}">
          <button type="button" class="btn primary" id="addProd">${ui.icon('plus', 18)}${t('p.add')}</button>
        </div>
        <div class="prod-grid" id="prodGrid"></div>`;
      const grid = view.querySelector('#prodGrid');
      const draw = () => {
        const q = state.q.toLowerCase();
        const rows = list.filter((p) => (p.kind === 'material' ? 'material' : 'product') === state.kind && (!q || [p.sku, p.name, p.name_en].some((v) => String(v || '').toLowerCase().includes(q))));
        grid.innerHTML = rows.length ? rows.map((p) => `<button type="button" class="prod" data-id="${esc(p.id)}">
          <span class="sku">${esc(p.sku)}</span><strong>${esc(p.name)}</strong>
          ${p.name_en ? `<small>${esc(p.name_en)}</small>` : ''}
          <span class="price">${U.money2(p.price)} <small>/ ${esc(p.unit)}</small></span>
          ${p.kind !== 'material' && p.shelf_life_days ? `<small>${t('p.shelfLifeShort').replace('{n}', p.shelf_life_days)}${p.fda_no ? ' · อย. ' + esc(p.fda_no) : ''}</small>` : ''}
        </button>`).join('') : `<p class="empty">${t('msg.noData')}</p>`;
      };
      draw();
      view.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { state.kind = b.dataset.kind; BI.app.render(); }));
      view.querySelector('#prodSearch').addEventListener('input', U.debounce((e) => { state.q = e.target.value.trim(); draw(); }, 120));
      view.querySelector('#addProd').addEventListener('click', () => modal(null));
      grid.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) modal(list.find((p) => p.id === b.dataset.id)); });
    }
  };
})(window.BI);
