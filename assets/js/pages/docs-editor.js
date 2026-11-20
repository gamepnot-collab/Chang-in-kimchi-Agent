/* Documents › create / edit
 * Routes:  #/docs/new?type=IV            blank document
 *          #/docs/new?type=RE&from=<id>  convert from another document
 *          #/docs/new?dup=<id>           duplicate (repeat order)
 *          #/docs/edit/<id>              edit a draft
 */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t, D = BI.docs, esc = U.esc;

  const CN_REASONS = ['damaged', 'expired', 'returned', 'discount', 'overcharge', 'short', 'other'];
  const DB_REASONS = ['extra', 'price_up', 'undercharge', 'other'];

  function load(params) {
    const q = params.query;
    if (params.rest) {
      const d = D.get(params.rest);
      return d ? JSON.parse(JSON.stringify(d)) : null;
    }
    if (q.dup) return D.duplicate(q.dup);
    const type = D.TYPES[q.type] ? q.type : 'IV';
    return q.from ? D.convert(q.from, type) : D.blank(type);
  }

  function render(view, params) {
    const doc = load(params);
    if (!doc) { view.innerHTML = `<div class="notice bad">${t('d.notFound')}</div>`; return; }
    if (doc.id && doc.status !== 'draft') { location.replace('#/docs/view/' + doc.id); return; }
    const ty = D.type(doc.type);
    const c = D.company();
    const partyKind = ty.party;
    const parties = D.parties(partyKind);
    const allProducts = D.products();
    const prods = ty.materials ? [...allProducts.filter((p) => p.kind === 'material'), ...allProducts.filter((p) => p.kind !== 'material')] : allProducts.filter((p) => p.kind !== 'material');
    const showVat = c.vat_registered || doc.type === 'PO';
    const field = (label, inner, cls = '', hint = '') => `<label class="field ${cls}"><span>${label}</span>${inner}${hint ? `<small>${hint}</small>` : ''}</label>`;
    const inp = (name, value, type = 'text', extra = '') => `<input class="input" name="${name}" type="${type}" value="${esc(value ?? '')}" ${extra}>`;

    document.getElementById('pageTitle').textContent = (doc.id ? t('d.editTitle') : t('d.newTitle')) + ' · ' + D.typeName(doc.type);

    const date2Label = { valid_until: t('d.validUntil'), due_date: t('d.dueDate'), delivery_date: t('d.deliveryDate') }[ty.date2];

    view.innerHTML = `
      <form id="docForm" class="grid" novalidate>
        <section class="card span-2">
          <header class="card-head"><div><h2>${D.typeName(doc.type)}</h2><p>${t('type.' + doc.type + '.hint')}</p></div>
            <span class="badge info">${esc(doc.no || t('d.autoNo'))}</span></header>
          <div class="form-grid">
            ${field(t('col.date'), inp('date', doc.date, 'date', 'required'))}
            ${ty.date2 ? field(date2Label, inp(ty.date2, doc[ty.date2], 'date')) : ''}
            ${field(t('d.ref'), inp('ref', doc.ref, 'text', `placeholder="${t('d.refPh')}"`), ty.date2 ? 'full' : '')}
          </div>
        </section>

        <section class="card span-2">
          <header class="card-head"><div><h2>${partyKind === 'supplier' ? t('d.supplier') : t('d.customer')}</h2><p>${t('d.partyHint')}</p></div></header>
          <div class="form-grid">
            ${field(t('d.partyName'), inp('p_name', doc.party.name, 'text', `list="partyList" autocomplete="off" placeholder="${t('d.partyNamePh')}"`), 'full')}
            <datalist id="partyList">${parties.map((p) => `<option value="${esc(p.name)}"></option>`).join('')}</datalist>
            ${field(t('d.address'), `<textarea class="input" name="p_address" rows="2">${esc(doc.party.address)}</textarea>`, 'full')}
            ${field(t('d.taxId'), inp('p_tax_id', doc.party.tax_id, 'text', 'inputmode="numeric" maxlength="13"'), '', t('d.taxIdHint'))}
            ${field(t('d.branch'), inp('p_branch', doc.party.branch, 'text', `list="branchList" placeholder="${t('d.branchPh')}"`))}
            <datalist id="branchList"><option value="สำนักงานใหญ่"></option></datalist>
            ${field(t('col.contact'), inp('p_contact', doc.party.contact))}
            ${field(t('col.phone'), inp('p_phone', doc.party.phone, 'tel'))}
          </div>
        </section>

        <section class="card span-2" id="bodyCard"></section>

        <section class="card">
          <header class="card-head"><div><h2>${t('d.summary')}</h2></div></header>
          <div class="form-grid">
            ${ty.mode !== 'refs' ? field(t('d.billDiscount'), inp('bill_discount', doc.bill_discount || '', 'number', 'min="0" step="0.01" inputmode="decimal" placeholder="0.00"')) : ''}
            ${ty.mode !== 'refs' && showVat ? field(t('d.vatMode'), `<select class="input" name="vat_mode">
              ${['exclusive', 'inclusive', 'none'].map((m) => `<option value="${m}" ${doc.vat_mode === m ? 'selected' : ''}>${t('d.vat.' + m)}</option>`).join('')}</select>`) : ''}
            ${ty.mode === 'items' && doc.type !== 'PO' ? field(t('d.wht'), `<select class="input" name="wht_rate">
              ${[0, 1, 2, 3, 5].map((r) => `<option value="${r}" ${+doc.wht_rate === r ? 'selected' : ''}>${r ? r + '%' : t('d.whtNone')}</option>`).join('')}</select>`, '', t('d.whtHint')) : ''}
          </div>
          <div class="totals-box" id="totals" style="margin-top:14px"></div>
        </section>

        <section class="card">
          ${ty.payment ? `<header class="card-head"><div><h2>${t('d.payment')}</h2></div></header>
          <div class="form-grid" style="margin-bottom:14px">
            ${field(t('d.payMethod'), `<select class="input" name="pay_method">${Object.keys(D.PAY).map((k) => `<option value="${k}" ${doc.payment.method === k ? 'selected' : ''}>${t('pay.' + k)}</option>`).join('')}</select>`)}
            ${field(t('d.payDate'), inp('pay_date', doc.payment.date, 'date'))}
            ${field(t('d.payBank'), inp('pay_bank', doc.payment.bank))}
            ${field(t('d.payRef'), inp('pay_ref', doc.payment.ref))}
          </div>` : ''}
          ${field(t('d.notes'), `<textarea class="input" name="notes" rows="4">${esc(doc.notes)}</textarea>`)}
        </section>

        <div class="action-bar span-2">
          <a class="btn ghost" href="${doc.id ? '#/docs/view/' + doc.id : '#/docs'}">${t('d.cancel')}</a>
          <button type="button" class="btn" id="saveDraft">${t('d.saveDraft')}</button>
          <button type="submit" class="btn primary">${ui.icon('check', 18)}${t('d.issue')}</button>
        </div>
      </form>`;

    const form = view.querySelector('#docForm');
    const body = view.querySelector('#bodyCard');
    const totalsEl = view.querySelector('#totals');

    /* ----- body: items / refs / adjust ----- */
    function lineHtml(l, i) {
      return `<div class="line" data-i="${i}">
        <span class="no">${i + 1}</span>
        <label class="field f-name"><span>${t('d.item')}</span><input class="input" data-k="name" value="${esc(l.name)}" list="prodList" autocomplete="off" placeholder="${t('d.itemPh')}"></label>
        <label class="field f-qty"><span>${t('d.qty')}</span><input class="input" data-k="qty" type="number" min="0" step="any" inputmode="decimal" value="${esc(l.qty)}"></label>
        <label class="field f-unit"><span>${t('d.unit')}</span><input class="input" data-k="unit" value="${esc(l.unit)}"></label>
        <label class="field f-price"><span>${t('d.price')}</span><input class="input" data-k="price" type="number" min="0" step="0.01" inputmode="decimal" value="${esc(l.price)}"></label>
        <label class="field f-disc"><span>${t('d.disc')}</span><input class="input" data-k="discount" type="number" min="0" step="0.01" inputmode="decimal" value="${+l.discount ? esc(l.discount) : ''}" placeholder="0"></label>
        <span class="amount" data-amount>${D.fmt.n2(D.r2(l.qty * l.price - (l.discount || 0)), 2)}</span>
        <button type="button" class="icon-btn rm" data-rm="${i}" aria-label="${t('d.removeLine')}">${ui.icon('trash', 18)}</button>
        ${ty.lot ? `<div class="lot-row">
          <label class="field"><span>${t('d.lot')}</span><input class="input" data-k="lot" value="${esc(l.lot)}"></label>
          <label class="field"><span>${t('d.exp')}</span><input class="input" data-k="exp" type="date" value="${esc(l.exp)}"></label>
        </div>` : ''}
      </div>`;
    }

    function drawItems(title) {
      const quick = prods.slice(0, 6);
      body.innerHTML = `
        <header class="card-head lines-head"><div><h2>${title || t('d.items')}</h2><p>${ty.lot ? t('d.itemsHintLot') : t('d.itemsHint')}</p></div></header>
        <datalist id="prodList">${prods.map((p) => `<option value="${esc(p.name)}">${esc(p.sku)} · ${U.num(p.price, 2)}</option>`).join('')}</datalist>
        <div class="lines">${doc.items.map(lineHtml).join('') || `<p class="empty">${t('d.noItems')}</p>`}</div>
        <div class="toolbar" style="margin-top:12px">
          <button type="button" class="btn" id="addLine">${ui.icon('plus', 18)}${t('d.addLine')}</button>
          ${quick.map((p) => `<button type="button" class="chip" data-quick="${esc(p.id)}">+ ${esc(p.name)}</button>`).join('')}
        </div>`;
      body.querySelector('#addLine').addEventListener('click', () => {
        doc.items.push({ sku: '', name: '', qty: 1, unit: '', price: 0, discount: 0, lot: '', exp: '' });
        drawBody();
        const inputs = body.querySelectorAll('[data-k="name"]');
        inputs[inputs.length - 1].focus();
      });
      body.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => {
        const p = prods.find((x) => x.id === b.dataset.quick);
        const existing = doc.items.find((l) => l.sku === p.sku);
        if (existing && ty.mode === 'items') existing.qty = (+existing.qty || 0) + 1;
        else doc.items.push(D.lineFromProduct(p, doc.date));
        drawBody();
      }));
    }

    function drawRefs() {
      const open = doc.party.name ? D.openInvoices(doc.party.name) : [];
      const ids = new Set([...open.map((d) => d.id), ...doc.refs]);
      const list = [...ids].map(D.get).filter(Boolean);
      body.innerHTML = `
        <header class="card-head"><div><h2>${t('d.selectInvoices')}</h2><p>${doc.type === 'BN' ? t('d.selectInvoicesBN') : t('d.selectInvoicesRE')}</p></div></header>
        ${!doc.party.name ? `<p class="empty">${t('d.pickCustomerFirst')}</p>` : list.length ? `<ul class="refs-list">${list.map((d) => `<li><label>
          <input type="checkbox" data-ref="${d.id}" ${doc.refs.includes(d.id) ? 'checked' : ''}>
          <span><b>${esc(d.no)}</b><small>${U.fmtDate(d.date)} · ${t('d.dueDate')} ${U.fmtDate(d.due_date)} · ${t('st.' + D.status(d))}</small></span>
          <b>${U.money2(D.calc(d).net)}</b></label></li>`).join('')}</ul>` : `<p class="empty">${t('d.noOpenInvoices')}</p>`}`;
      body.querySelectorAll('[data-ref]').forEach((cb) => cb.addEventListener('change', () => {
        doc.refs = [...body.querySelectorAll('[data-ref]:checked')].map((x) => x.dataset.ref);
        drawTotals();
      }));
    }

    function drawAdjust() {
      const invs = D.all().filter((d) => ['IV', 'CS'].includes(d.type) && d.status !== 'draft' && d.status !== 'cancelled' && (!doc.party.name || d.party.name === doc.party.name));
      const reasons = doc.type === 'CN' ? CN_REASONS : DB_REASONS;
      const head = `<header class="card-head"><div><h2>${t('d.adjustTitle')}</h2><p>${t('d.adjustHint.' + doc.type)}</p></div></header>
        <div class="form-grid" style="margin-bottom:14px">
          ${field(t('d.originalInvoice'), `<select class="input" id="srcInv"><option value="">${t('d.choose')}</option>${invs.map((d) => `<option value="${d.id}" ${doc.source === d.id ? 'selected' : ''}>${esc(d.no)} · ${esc(d.party.name)} · ${U.money2(D.calc(d).grand)}</option>`).join('')}</select>`)}
          ${field(t('d.reason'), `<select class="input" id="reason"><option value="">${t('d.choose')}</option>${reasons.map((r) => `<option value="${r}" ${doc.adjust.reason === r ? 'selected' : ''}>${D.REASONS[r]}</option>`).join('')}</select>`)}
          ${field(t('d.reasonNote'), `<input class="input" id="reasonNote" value="${esc(doc.adjust.reason_note || '')}">`, 'full')}
        </div>`;
      drawItems();
      body.insertAdjacentHTML('afterbegin', head);
      body.querySelector('#srcInv').addEventListener('change', (e) => {
        const src = D.get(e.target.value);
        doc.source = src ? src.id : '';
        doc.ref = src ? src.no : '';
        form.ref.value = doc.ref;
        if (src) {
          doc.party = { ...src.party };
          fillParty();
          doc.adjust.original = D.calc(src).beforeVat;
          if (!doc.items.length) doc.items = src.items.map((l) => ({ ...l, qty: 0 }));
        }
        drawBody();
      });
      body.querySelector('#reason').addEventListener('change', (e) => { doc.adjust.reason = e.target.value; });
      body.querySelector('#reasonNote').addEventListener('input', (e) => { doc.adjust.reason_note = e.target.value; });
    }

    function drawBody() {
      if (ty.mode === 'refs') drawRefs();
      else if (ty.mode === 'adjust') drawAdjust();
      else drawItems();
      bindLines();
      drawTotals();
    }

    function bindLines() {
      body.querySelectorAll('.line').forEach((row) => {
        const i = +row.dataset.i;
        row.querySelectorAll('[data-k]').forEach((el) => {
          el.addEventListener('input', () => {
            const k = el.dataset.k;
            doc.items[i][k] = ['qty', 'price', 'discount'].includes(k) ? (el.value === '' ? 0 : +el.value) : el.value;
            const l = doc.items[i];
            row.querySelector('[data-amount]').textContent = D.fmt.n2(D.r2((+l.qty || 0) * (+l.price || 0) - (+l.discount || 0)), 2);
            drawTotals();
          });
          if (el.dataset.k === 'name') el.addEventListener('change', () => {
            const p = prods.find((x) => x.name === el.value || x.sku === el.value);
            if (!p) return;
            const qtyKeep = doc.items[i].qty || 1;
            doc.items[i] = { ...D.lineFromProduct(p, doc.date), qty: qtyKeep };
            drawBody();
          });
        });
        row.querySelector('[data-rm]').addEventListener('click', () => { doc.items.splice(i, 1); drawBody(); });
      });
    }

    function drawTotals() {
      const x = D.calc(doc);
      const rows = [];
      if (x.mode === 'refs') rows.push([t('d.docsSelected'), `${x.lines.length}`]);
      else {
        if (x.mode === 'adjust') rows.push([t('d.originalValue'), U.money2(x.original)], [t('d.correctValue'), U.money2(x.corrected)]);
        rows.push([x.mode === 'adjust' ? t('d.difference') : t('d.subtotal'), D.fmt.n2(x.sub)]);
        if (x.discount) rows.push([t('d.billDiscount'), '−' + D.fmt.n2(x.discount)]);
        if (x.vatMode !== 'none') rows.push([t('d.beforeVat'), D.fmt.n2(x.beforeVat)], [`VAT ${Math.round(x.rate * 100)}%`, D.fmt.n2(x.vat)]);
        if (x.wht) rows.push([t('d.grand'), D.fmt.n2(x.grand)], [`${t('d.wht')} ${doc.wht_rate}%`, '−' + D.fmt.n2(x.wht)]);
      }
      const final = x.wht ? x.net : x.grand;
      totalsEl.innerHTML = rows.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('') +
        `<div class="grand"><span>${x.wht ? t('d.netPay') : t('d.grand')}</span><span>${U.money2(final)}</span></div>
         <span class="words">(${D.bahtText(final)})</span>`;
    }

    function fillParty() {
      ['name', 'address', 'tax_id', 'branch', 'contact', 'phone'].forEach((k) => { form['p_' + k].value = doc.party[k] || ''; });
    }

    /* ----- header / party / summary bindings ----- */
    form.addEventListener('input', (e) => {
      const n = e.target.name;
      if (!n) return;
      if (n.startsWith('p_')) doc.party[n.slice(2)] = e.target.value;
      else if (n.startsWith('pay_')) doc.payment[n.slice(4)] = e.target.value;
      else if (n === 'bill_discount') doc.bill_discount = +e.target.value || 0;
      else if (n === 'wht_rate') doc.wht_rate = +e.target.value;
      else doc[n] = e.target.value;
      if (['bill_discount', 'vat_mode', 'wht_rate'].includes(n)) drawTotals();
    });
    form.addEventListener('change', (e) => {
      const n = e.target.name;
      if (n === 'vat_mode' || n === 'wht_rate') { doc[n] = n === 'wht_rate' ? +e.target.value : e.target.value; drawTotals(); }
      if (n === 'p_name') {
        const p = parties.find((x) => x.name === e.target.value);
        if (p) { doc.party = { name: p.name, address: p.address || '', tax_id: p.tax_id || '', branch: p.branch || '', phone: p.phone || '', email: p.email || '', contact: p.contact || '' }; fillParty(); }
        if (ty.mode !== 'items') { if (ty.mode === 'refs') doc.refs = []; drawBody(); }
      }
      if (n === 'date' && doc.id === '' && ty.date2) {
        const days = ty.date2 === 'valid_until' ? c.quote_valid_days : ty.date2 === 'due_date' ? c.credit_days : 3;
        doc[ty.date2] = D.addDays(doc.date, days);
        form[ty.date2].value = doc[ty.date2];
      }
    });

    function validate() {
      const errs = [];
      if (!doc.party.name.trim()) {
        if (doc.type === 'CS') doc.party.name = t('d.walkIn');
        else errs.push(partyKind === 'supplier' ? t('d.errSupplier') : t('d.errCustomer'));
      }
      if (ty.mode === 'refs' && !doc.refs.length) errs.push(t('d.errRefs'));
      if (ty.mode !== 'refs') {
        doc.items = doc.items.filter((l) => l.name.trim() && +l.qty > 0);
        if (!doc.items.length) errs.push(t('d.errItems'));
      }
      if (ty.mode === 'adjust' && !doc.source) errs.push(t('d.errSource'));
      if (ty.mode === 'adjust' && !doc.adjust.reason) errs.push(t('d.errReason'));
      if (doc.party.tax_id && !/^\d{13}$/.test(doc.party.tax_id)) errs.push(t('d.errTaxId'));
      return errs;
    }

    function persist(issueIt) {
      const errs = validate();
      if (errs.length) { ui.toast(errs[0], 'bad'); drawBody(); return; }
      const saved = issueIt ? D.issue(doc) : D.save(doc);
      ui.toast(issueIt ? t('d.issued').replace('{no}', saved.no) : t('d.draftSaved'), 'good');
      location.hash = '#/docs/view/' + saved.id;
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); persist(true); });
    view.querySelector('#saveDraft').addEventListener('click', () => persist(false));

    drawBody();
  }

  BI.pages = BI.pages || {};
  BI.pages['docs/new'] = { title: 'd.newTitle', crumb: 'nav.docs', render };
  BI.pages['docs/edit'] = { title: 'd.editTitle', crumb: 'nav.docs', render };
})(window.BI);
