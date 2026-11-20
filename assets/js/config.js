/* ------------------------------------------------------------------
 * Global configuration. Edit this file to change app-wide settings.
 * Company details used on documents are edited in-app (Settings page).
 * ------------------------------------------------------------------ */
window.BI = window.BI || {};

BI.config = {
  companyName: 'Chang-in-kimchi',
  currency: 'THB',
  defaultLang: 'th',
  defaultRange: 12, // months
  rangeOptions: [1, 3, 6, 12, 24, 0], // 0 = all time
  storagePrefix: 'ck-bi:'
};

BI.state = { range: BI.config.defaultRange };

/* Drawer (hamburger) navigation. `section` renders a heading. */
BI.nav = [
  { route: 'overview', key: 'nav.overview', icon: 'grid' },
  { section: 'nav.sec.documents' },
  { route: 'docs', key: 'nav.docs', icon: 'doc' },
  { route: 'products', key: 'nav.products', icon: 'box' },
  { route: 'settings', key: 'nav.settings', icon: 'gear' },
  { section: 'nav.sec.departments' },
  { route: 'marketing/content', key: 'nav.content', icon: 'megaphone', sub: 'nav.marketing' },
  { route: 'marketing/strategy', key: 'nav.strategy', icon: 'target', sub: 'nav.marketing' },
  { route: 'sales', key: 'nav.sales', icon: 'trend' },
  { route: 'customers', key: 'nav.customers', icon: 'users' },
  { route: 'hr', key: 'nav.hr', icon: 'id' },
  { route: 'finance', key: 'nav.finance', icon: 'coin' },
  { section: 'nav.sec.system' },
  { route: 'data', key: 'nav.data', icon: 'db' }
];

/* Bottom navigation bar. `create: true` is the centre "issue a document" button. */
BI.bottomNav = [
  { route: 'overview', key: 'bn.home', icon: 'home' },
  { route: 'docs', key: 'bn.docs', icon: 'doc' },
  { create: true, key: 'bn.create', icon: 'plus' },
  { route: 'customers', key: 'bn.customers', icon: 'users' },
  { route: 'finance', key: 'bn.finance', icon: 'coin' }
];
