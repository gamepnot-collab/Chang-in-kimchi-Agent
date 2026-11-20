/* ------------------------------------------------------------------
 * App shell: routing, hamburger drawer, bottom nav, create sheet,
 * language and period selector.
 *
 * Routes are hash paths like  #/docs/view/abc?x=1 . The page whose key
 * is the longest prefix of the path is rendered; the remainder is passed
 * as `params.rest` and the query string as `params.query`.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;
  const PREF = BI.config.storagePrefix + 'pref:';
  const getPref = (k, d) => { try { return localStorage.getItem(PREF + k) ?? d; } catch (e) { return d; } };
  const setPref = (k, v) => { try { localStorage.setItem(PREF + k, v); } catch (e) { /* ignore */ } };

  BI.state.range = +getPref('range', BI.config.defaultRange);
  BI.i18n.set(getPref('lang', BI.config.defaultLang));

  const $ = (s) => document.querySelector(s);

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '') || 'overview';
    const [path, qs = ''] = raw.split('?');
    const keys = Object.keys(BI.pages).sort((a, b) => b.length - a.length);
    const key = keys.find((k) => path === k || path.startsWith(k + '/')) || 'overview';
    const rest = path.slice(key.length).replace(/^\//, '');
    return { key, path, params: { rest, query: Object.fromEntries(new URLSearchParams(qs)) } };
  }

  /** Which drawer / bottom item should be highlighted for a page key. */
  const activeRoute = (key) => key.split('/')[0] === 'docs' ? 'docs' : key;

  function renderNav(key) {
    const act = activeRoute(key);
    $('#nav').innerHTML = BI.nav.map((it) => {
      if (it.section) return `<p class="nav-section">${t(it.section)}</p>`;
      const on = act === it.route;
      return `<a href="#/${it.route}" class="nav-link ${on ? 'active' : ''}" ${on ? 'aria-current="page"' : ''}>
        ${ui.icon(it.icon, 20)}<span>${it.sub ? `<small>${t(it.sub)}</small>` : ''}${t(it.key)}</span></a>`;
    }).join('');
    $('#bottomNav').innerHTML = `<div class="bn-inner">${BI.bottomNav.map((it) => {
      if (it.create) return `<button type="button" class="bn-item bn-create" id="createBtn" aria-haspopup="dialog"><span class="fab">${ui.icon('plus', 24)}</span><span>${t(it.key)}</span></button>`;
      const on = act === it.route;
      return `<a href="#/${it.route}" class="bn-item ${on ? 'active' : ''}" ${on ? 'aria-current="page"' : ''}>${ui.icon(it.icon, 22)}<span>${t(it.key)}</span></a>`;
    }).join('')}</div>`;
    $('#createBtn').addEventListener('click', openSheet);
  }

  function renderSheet() {
    $('#sheetGrid').innerHTML = BI.docs.TYPE_ORDER.map((code) => {
      const ty = BI.docs.type(code);
      return `<a class="sheet-item" href="#/docs/new?type=${code}">${ui.icon(ty.icon, 22)}<strong>${BI.docs.typeName(code)}</strong><small>${BI.td('type.' + code + '.hint')}</small></a>`;
    }).join('');
  }

  function renderControls(page) {
    const sel = $('#rangeSelect');
    sel.hidden = !page.range;
    sel.innerHTML = BI.config.rangeOptions.map((m) =>
      `<option value="${m}" ${m === BI.state.range ? 'selected' : ''}>${m ? t('range.months').replace('{n}', m) : t('range.all')}</option>`).join('');
    document.querySelectorAll('#langSwitch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === BI.i18n.lang)));
    $('#langPill').textContent = BI.i18n.lang.toUpperCase();
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.documentElement.lang = BI.i18n.lang;
    $('#brandName').textContent = BI.docs.company().name_en || BI.config.companyName;
  }

  function refreshStatus() {
    const names = Object.keys(BI.schemas);
    const live = names.filter((n) => !BI.store.isSample(n)).length;
    $('#dataStatus').innerHTML = `<span class="status-dot ${live ? 'live' : ''}"></span>${t('status.connected').replace('{n}', live).replace('{total}', names.length)}`;
  }

  function render() {
    const { key, params } = parseHash();
    const page = BI.pages[key];
    BI.charts.destroyAll();
    ui.resetTables();
    renderNav(key);
    renderControls(page);
    renderSheet();
    const title = typeof page.title === 'function' ? page.title(params) : t(page.title);
    $('#pageTitle').textContent = title;
    $('#pageCrumb').textContent = page.crumb ? t(page.crumb) : '';
    document.title = `${title} · ${BI.config.companyName}`;
    const view = $('#view');
    view.className = 'view ' + (page.cls || '');
    try {
      page.render(view, params);
    } catch (e) {
      console.error(e);
      view.innerHTML = `<div class="notice bad">${t('msg.renderError')}<br><code>${U.esc(e.message)}</code></div>`;
    }
    ui.bindTables(view);
    closeAll();
  }

  function openMenu() { document.body.classList.add('menu-open'); $('#drawer').setAttribute('aria-hidden', 'false'); $('#menuBtn').setAttribute('aria-expanded', 'true'); }
  function openSheet() { document.body.classList.add('sheet-open'); $('#createSheet').setAttribute('aria-hidden', 'false'); }
  function closeAll() {
    document.body.classList.remove('menu-open', 'sheet-open');
    $('#drawer').setAttribute('aria-hidden', 'true');
    $('#createSheet').setAttribute('aria-hidden', 'true');
    $('#menuBtn').setAttribute('aria-expanded', 'false');
  }

  function setLang(l) { BI.i18n.set(l); setPref('lang', l); refreshStatus(); render(); }

  function init() {
    window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
    $('#rangeSelect').addEventListener('change', (e) => { BI.state.range = +e.target.value; setPref('range', BI.state.range); render(); });
    $('#langSwitch').addEventListener('click', (e) => { const l = e.target.closest('[data-lang]')?.dataset.lang; if (l) setLang(l); });
    $('#langPill').addEventListener('click', () => {
      const L = BI.i18n.langs;
      setLang(L[(L.indexOf(BI.i18n.lang) + 1) % L.length]);
    });
    $('#menuBtn').addEventListener('click', openMenu);
    $('#drawerClose').addEventListener('click', closeAll);
    $('#scrim').addEventListener('click', closeAll);
    $('#createSheet').addEventListener('click', (e) => { if (e.target.id === 'createSheet') closeAll(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

    BI.docs.ensureSeed();
    refreshStatus();
    render();

    BI.store.refreshLinked().then((changed) => {
      if (changed) { refreshStatus(); render(); ui.toast(t('ds.synced'), 'good'); }
    });
  }

  BI.app = { render, refreshStatus, closeAll, openSheet };
  document.addEventListener('DOMContentLoaded', init);
})(window.BI);
