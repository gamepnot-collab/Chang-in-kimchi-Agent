/* Data sources — import CSV / Excel files or link Google Sheets per dataset. */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  const DEPT_KEY = { sales: 'nav.sales', marketing: 'nav.marketing', hr: 'nav.hr', finance: 'nav.finance' };

  function sourceLabel(m) {
    if (m.source === 'sample') return `<span class="badge muted">${t('ds.sample')}</span>`;
    if (m.source === 'gsheet') return `<span class="badge info">Google Sheets</span>`;
    return `<span class="badge good">${U.esc(m.label || t('ds.file'))}</span>`;
  }

  function row(name) {
    const m = BI.store.meta(name);
    const cols = BI.schemas[name].columns;
    return `<article class="ds" data-ds="${name}">
      <header class="ds-head">
        <div>
          <span class="ds-dept">${t(DEPT_KEY[BI.schemas[name].dept])}</span>
          <h3>${t('ds.name.' + name)}</h3>
          <p>${t('ds.desc.' + name)}</p>
        </div>
        <div class="ds-meta">
          ${sourceLabel(m)}
          <span>${t('tbl.rows').replace('{n}', U.num(m.count ?? BI.store.get(name).length))}</span>
          ${m.updated ? `<span>${t('ds.updated')} ${U.fmtDate(m.updated.slice(0, 10))}</span>` : ''}
        </div>
      </header>
      <details class="ds-cols">
        <summary>${t('ds.columns')} (${cols.length})</summary>
        <ul>${cols.map((c) => `<li><code>${c.name}</code><span>${t('ds.type.' + c.type)}</span></li>`).join('')}</ul>
      </details>
      <div class="ds-actions">
        <label class="btn primary">${ui.icon('upload', 16)}${t('ds.upload')}
          <input type="file" accept=".csv,.xlsx,.xls,.txt" data-act="file" hidden>
        </label>
        <button type="button" class="btn" data-act="gsheet">${ui.icon('link', 16)}Google Sheets</button>
        ${m.source === 'gsheet' ? `<button type="button" class="btn" data-act="refresh">${ui.icon('refresh', 16)}${t('ds.refresh')}</button>` : ''}
        <button type="button" class="btn" data-act="template">${ui.icon('download', 16)}${t('ds.template')}</button>
        <button type="button" class="btn" data-act="export">${ui.icon('download', 16)}${t('ds.export')}</button>
        ${m.source !== 'sample' ? `<button type="button" class="btn ghost" data-act="reset">${ui.icon('reset', 16)}${t('ds.reset')}</button>` : ''}
      </div>
      <div class="ds-gsheet" hidden>
        <input type="url" class="input" placeholder="https://docs.google.com/spreadsheets/d/…" value="${U.esc(m.url || '')}" aria-label="Google Sheets URL">
        <button type="button" class="btn primary" data-act="gsheet-go">${t('ds.connect')}</button>
        <p class="footnote">${t('ds.gsheetHelp')}</p>
      </div>
    </article>`;
  }

  function report(name, { rows, missing, extra }) {
    let msg = t('ds.imported').replace('{n}', U.num(rows.length)).replace('{name}', t('ds.name.' + name));
    if (missing.length) msg += ' · ' + t('ds.missing') + ': ' + missing.join(', ');
    ui.toast(msg, missing.length ? 'warn' : 'good');
    if (extra.length) console.info('Ignored columns for', name, extra);
  }

  BI.pages = BI.pages || {};
  BI.pages.data = {
    title: 'nav.data',
    crumb: 'app.settings',
    render(view) {
      view.innerHTML = `
        <section class="card span-2 intro">
          <h2>${t('ds.introTitle')}</h2>
          <ol class="steps">
            <li>${t('ds.step1')}</li>
            <li>${t('ds.step2')}</li>
            <li>${t('ds.step3')}</li>
          </ol>
          <p class="footnote">${t('ds.privacy')}</p>
        </section>
        <div class="ds-list">${Object.keys(BI.schemas).map(row).join('')}</div>
        <section class="card span-2 roadmap">
          <h2>${t('ds.soonTitle')}</h2>
          <p>${t('ds.soonBody')}</p>
          <ul class="chips">${['Facebook Pages', 'Instagram', 'TikTok', 'YouTube', 'LINE OA', 'Google Ads', 'Excel / CSV', 'Accounting software'].map((x) => `<li>${x}</li>`).join('')}</ul>
        </section>`;

      view.querySelectorAll('.ds').forEach((el) => {
        const name = el.dataset.ds;
        const rerender = () => { BI.app.refreshStatus(); BI.app.render(); };

        el.addEventListener('change', async (e) => {
          if (e.target.dataset.act !== 'file' || !e.target.files[0]) return;
          const file = e.target.files[0];
          try {
            const res = BI.store.normalize(name, await BI.store.readFile(file));
            if (!res.rows.length) throw new Error('empty');
            if (!BI.store.set(name, res.rows, { source: 'file', label: file.name })) ui.toast(t('ds.tooBig'), 'warn');
            report(name, res);
            rerender();
          } catch (err) {
            console.error(err);
            ui.toast(t('ds.readError'), 'bad');
          }
        });

        el.addEventListener('click', async (e) => {
          const act = e.target.closest('[data-act]')?.dataset.act;
          if (!act || act === 'file') return;
          if (act === 'gsheet') {
            const box = el.querySelector('.ds-gsheet');
            box.hidden = !box.hidden;
            if (!box.hidden) box.querySelector('input').focus();
          } else if (act === 'gsheet-go' || act === 'refresh') {
            const url = act === 'refresh' ? BI.store.meta(name).url : el.querySelector('.ds-gsheet input').value;
            if (!url) return;
            const btn = e.target.closest('button');
            btn.disabled = true;
            try {
              const res = BI.store.normalize(name, await BI.store.fetchGoogleSheet(url));
              if (!res.rows.length) throw new Error('empty');
              BI.store.set(name, res.rows, { source: 'gsheet', url, label: 'Google Sheets' });
              report(name, res);
              rerender();
            } catch (err) {
              console.error(err);
              ui.toast(t(err.message === 'bad-url' ? 'ds.badUrl' : 'ds.gsheetError'), 'bad');
              btn.disabled = false;
            }
          } else if (act === 'template') {
            U.download(`${name}_template.csv`, BI.store.templateCSV(name));
          } else if (act === 'export') {
            U.download(`${name}_${U.ymd(new Date())}.csv`, BI.store.exportCSV(name));
          } else if (act === 'reset') {
            if (!confirm(t('ds.resetConfirm'))) return;
            BI.store.reset(name);
            ui.toast(t('ds.resetDone'));
            rerender();
          }
        });
      });
    }
  };
})(window.BI);
