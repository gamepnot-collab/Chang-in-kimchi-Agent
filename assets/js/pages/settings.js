/* Company settings used on every document, plus backup / restore. */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t, D = BI.docs, esc = U.esc;

  function resizeImage(file, max = 320) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        resolve(cv.toDataURL('image/png'));
        URL.revokeObjectURL(img.src);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  BI.pages = BI.pages || {};
  BI.pages.settings = {
    title: 'nav.settings',
    crumb: 'nav.sec.documents',
    render(view) {
      const c = D.company();
      const f = (label, name, value, cls = '', type = 'text', extra = '', hint = '') =>
        `<label class="field ${cls}"><span>${label}</span><input class="input" name="${name}" type="${type}" value="${esc(value ?? '')}" ${extra}>${hint ? `<small>${hint}</small>` : ''}</label>`;

      view.innerHTML = `
        <form id="coForm" class="grid" novalidate>
          <section class="card span-2">
            <header class="card-head"><div><h2>${t('s.company')}</h2><p>${t('s.companyHint')}</p></div></header>
            <div class="form-grid">
              <div class="field full"><span>${t('s.logo')}</span>
                <div class="logo-box">
                  ${c.logo ? `<img src="${esc(c.logo)}" alt="">` : '<span class="brand-mark">CK</span>'}
                  <label class="btn">${ui.icon('upload', 18)}${t('s.uploadLogo')}<input type="file" accept="image/*" id="logoFile" hidden></label>
                  ${c.logo ? `<button type="button" class="btn ghost" id="rmLogo">${t('d.delete')}</button>` : ''}
                </div></div>
              ${f(t('s.nameTh'), 'name_th', c.name_th)}
              ${f(t('s.nameEn'), 'name_en', c.name_en)}
              <label class="field full"><span>${t('d.address')}</span><textarea class="input" name="address" rows="2">${esc(c.address)}</textarea></label>
              ${f(t('d.taxId'), 'tax_id', c.tax_id, '', 'text', 'inputmode="numeric" maxlength="13"')}
              ${f(t('d.branch'), 'branch', c.branch, '', 'text', 'list="branchList2"', t('s.branchHint'))}
              <datalist id="branchList2"><option value="สำนักงานใหญ่"></option></datalist>
              ${f(t('col.phone'), 'phone', c.phone, '', 'tel')}
              ${f('Email', 'email', c.email, '', 'email')}
              ${f(t('s.website'), 'website', c.website, 'full')}
            </div>
          </section>

          <section class="card">
            <header class="card-head"><div><h2>${t('s.tax')}</h2></div></header>
            <div class="form-grid">
              <div class="field full field-inline">
                <label class="switch"><input type="checkbox" name="vat_registered" ${c.vat_registered ? 'checked' : ''}><i></i></label>
                <span>${t('s.vatRegistered')}</span>
              </div>
              ${f(t('s.vatRate'), 'vat_rate', c.vat_rate, '', 'number', 'min="0" step="0.01"')}
              ${f(t('s.creditDays'), 'credit_days', c.credit_days, '', 'number', 'min="0" step="1"')}
              ${f(t('s.quoteDays'), 'quote_valid_days', c.quote_valid_days, '', 'number', 'min="0" step="1"')}
              ${f(t('s.signer'), 'signer_name', c.signer_name, '', 'text', '', t('s.signerHint'))}
            </div>
          </section>

          <section class="card">
            <header class="card-head"><div><h2>${t('s.bank')}</h2><p>${t('s.bankHint')}</p></div></header>
            <div class="form-grid">
              ${f(t('s.bankName'), 'bank_name', c.bank_name, 'full', 'text', 'placeholder="ธนาคาร…"')}
              ${f(t('s.accName'), 'bank_account_name', c.bank_account_name)}
              ${f(t('s.accNo'), 'bank_account_no', c.bank_account_no)}
              ${f(t('s.promptpay'), 'promptpay', c.promptpay, 'full', 'text', 'inputmode="numeric"', t('s.promptpayHint'))}
              <div class="full" id="ppPreview"></div>
            </div>
          </section>

          <section class="card span-2">
            <label class="field"><span>${t('s.noteDefault')}</span><textarea class="input" name="note_default" rows="2">${esc(c.note_default)}</textarea><small>${t('s.noteDefaultHint')}</small></label>
          </section>

          <div class="action-bar span-2">
            <button type="submit" class="btn primary">${ui.icon('check', 18)}${t('s.save')}</button>
          </div>
        </form>

        <section class="card">
          <header class="card-head"><div><h2>${t('s.backup')}</h2><p>${t('s.backupHint')}</p></div></header>
          <div class="toolbar">
            <button type="button" class="btn" id="exportBk">${ui.icon('download', 18)}${t('s.export')}</button>
            <label class="btn">${ui.icon('upload', 18)}${t('s.import')}<input type="file" accept=".json,application/json" id="importBk" hidden></label>
            ${D.hasDemo() ? `<button type="button" class="btn ghost" id="clearDemo2">${ui.icon('trash', 18)}${t('d.clearDemo')}</button>` : ''}
          </div>
        </section>`;

      const form = view.querySelector('#coForm');
      let logo = c.logo;
      const pp = () => {
        const id = form.promptpay.value;
        const svg = id ? D.promptpaySvg(id, 0, 120) : '';
        view.querySelector('#ppPreview').innerHTML = svg ? `<div class="logo-box">${svg}<small class="footnote">${t('s.ppPreview')}</small></div>` : '';
      };
      pp();
      form.promptpay.addEventListener('input', U.debounce(pp, 200));

      view.querySelector('#logoFile').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try { logo = await resizeImage(file); D.saveCompany({ ...collect(), logo }); ui.toast(t('s.saved'), 'good'); BI.app.render(); }
        catch (err) { ui.toast(t('ds.readError'), 'bad'); }
      });
      const rm = view.querySelector('#rmLogo');
      if (rm) rm.addEventListener('click', () => { logo = ''; D.saveCompany({ ...collect(), logo: '' }); BI.app.render(); });

      function collect() {
        const v = Object.fromEntries(new FormData(form));
        return {
          ...c, ...v, logo,
          vat_registered: form.vat_registered.checked,
          vat_rate: +v.vat_rate || 0, credit_days: +v.credit_days || 0, quote_valid_days: +v.quote_valid_days || 0
        };
      }
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = collect();
        if (v.tax_id && !/^\d{13}$/.test(v.tax_id)) { ui.toast(t('d.errTaxId'), 'bad'); return; }
        D.saveCompany(v);
        ui.toast(t('s.saved'), 'good');
        BI.app.render();
      });

      view.querySelector('#exportBk').addEventListener('click', () => U.download(`chang-in-kimchi-backup-${U.ymd(new Date())}.json`, D.exportBackup(), 'application/json'));
      view.querySelector('#importBk').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !(await ui.confirm(t('s.importConfirm')))) return;
        try { const n = D.importBackup(await file.text()); ui.toast(t('s.imported').replace('{n}', n), 'good'); BI.app.render(); }
        catch (err) { ui.toast(t('s.importError'), 'bad'); }
      });
      const cd = view.querySelector('#clearDemo2');
      if (cd) cd.addEventListener('click', async () => { if (await ui.confirm(t('d.clearDemoConfirm'))) { D.clearDemo(); ui.toast(t('d.demoCleared'), 'good'); BI.app.render(); } });
    }
  };
})(window.BI);
