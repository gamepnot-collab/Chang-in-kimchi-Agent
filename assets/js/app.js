/* ------------------------------------------------------------------
 * App shell: routing, sidebar, language, theme, period selector.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;
  const PREF = BI.config.storagePrefix + 'pref:';
  const getPref = (k, d) => { try { return localStorage.getItem(PREF + k) ?? d; } catch (e) { return d; } };
  const setPref = (k, v) => { try { localStorage.setItem(PREF + k, v); } catch (e) { /* ignore */ } };

  BI.state = {
    range: +getPref('range', BI.config.defaultRange),
    theme: getPref('theme', '') // '' = follow OS
  };
  BI.i18n.set(getPref('lang', BI.config.defaultLang));

  const $ = (s) => document.querySelector(s);
  const route = () => (location.hash.replace(/^#\/?/, '') || 'overview').split('?')[0];

  function renderNav() {
    const cur = route();
    const link = (it, child) => `<a href="#/${it.route}" class="nav-link ${child ? 'child' : ''} ${cur === it.route ? 'active' : ''}" ${cur === it.route ? 'aria-current="page"' : ''}>
        ${child ? '<span class="dot"></span>' : ui.icon(it.icon)}<span>${t(it.key)}</span></a>`;
    $('#nav').innerHTML = BI.nav.map((it) => {
      if (it.group) {
        const open = it.children.some((c) => c.route === cur);
        return `<div class="nav-group ${open ? 'open' : ''}">
          <p class="nav-heading">${ui.icon(it.icon)}<span>${t(it.group)}</span></p>
          ${it.children.map((c) => link(c, true)).join('')}</div>`;
      }
      return (it.foot ? '<hr class="nav-sep">' : '') + link(it);
    }).join('');
  }

  function renderControls() {
    const sel = $('#rangeSelect');
    sel.innerHTML = BI.config.rangeOptions.map((m) =>
      `<option value="${m}" ${m === BI.state.range ? 'selected' : ''}>${m ? t('range.months').replace('{n}', m) : t('range.all')}</option>`).join('');
    document.querySelectorAll('#langSwitch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === BI.i18n.lang)));
    const dark = isDark();
    $('#themeBtn').innerHTML = ui.icon(dark ? 'sun' : 'moon', 18);
    $('#themeBtn').title = t(dark ? 'ctrl.light' : 'ctrl.dark');
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.documentElement.lang = BI.i18n.lang;
  }

  const isDark = () => BI.state.theme ? BI.state.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  function applyTheme() {
    if (BI.state.theme) document.documentElement.dataset.theme = BI.state.theme;
    else delete document.documentElement.dataset.theme;
  }

  function refreshStatus() {
    const names = Object.keys(BI.schemas);
    const live = names.filter((n) => !BI.store.isSample(n)).length;
    $('#dataStatus').innerHTML = `<span class="status-dot ${live ? 'live' : ''}"></span>${t('status.connected').replace('{n}', live).replace('{total}', names.length)}`;
  }

  function render() {
    const r = route();
    const page = BI.pages[r] || BI.pages.overview;
    BI.charts.destroyAll();
    ui.resetTables();
    renderNav();
    renderControls();
    $('#pageTitle').textContent = t(page.title);
    $('#pageCrumb').textContent = t(page.crumb);
    document.title = `${t(page.title)} · ${BI.config.companyName} BI`;
    const view = $('#view');
    view.className = 'view' + (r === 'data' ? ' view-data' : '');
    try {
      page.render(view);
    } catch (e) {
      console.error(e);
      view.innerHTML = `<div class="notice bad">${t('msg.renderError')}<br><code>${U.esc(e.message)}</code></div>`;
    }
    ui.bindTables(view);
    closeMenu();
  }

  const closeMenu = () => document.body.classList.remove('menu-open');

  function init() {
    applyTheme();
    window.addEventListener('hashchange', () => { render(); $('#view').focus({ preventScroll: true }); window.scrollTo(0, 0); });
    $('#rangeSelect').addEventListener('change', (e) => { BI.state.range = +e.target.value; setPref('range', BI.state.range); render(); });
    $('#langSwitch').addEventListener('click', (e) => {
      const l = e.target.closest('[data-lang]')?.dataset.lang;
      if (!l) return;
      BI.i18n.set(l); setPref('lang', l); refreshStatus(); render();
    });
    $('#themeBtn').addEventListener('click', () => {
      BI.state.theme = isDark() ? 'light' : 'dark';
      setPref('theme', BI.state.theme); applyTheme(); render();
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (!BI.state.theme) render(); });
    $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('menu-open'));
    $('#scrim').addEventListener('click', closeMenu);

    refreshStatus();
    render();

    // Pull fresh data from any linked Google Sheets in the background.
    BI.store.refreshLinked().then((changed) => {
      if (changed) { refreshStatus(); render(); ui.toast(t('ds.synced'), 'good'); }
    });
  }

  BI.app = { render, refreshStatus };
  document.addEventListener('DOMContentLoaded', init);
})(window.BI);
