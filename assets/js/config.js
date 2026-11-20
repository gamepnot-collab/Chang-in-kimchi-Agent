/* ------------------------------------------------------------------
 * Global configuration. Edit this file to change company-wide settings.
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

/* Sidebar navigation. `group` items render as a heading with children. */
BI.nav = [
  { route: 'overview', key: 'nav.overview', icon: 'grid' },
  {
    group: 'nav.marketing', icon: 'megaphone', children: [
      { route: 'marketing/content', key: 'nav.content' },
      { route: 'marketing/strategy', key: 'nav.strategy' }
    ]
  },
  { route: 'sales', key: 'nav.sales', icon: 'trend' },
  { route: 'customers', key: 'nav.customers', icon: 'users' },
  { route: 'hr', key: 'nav.hr', icon: 'id' },
  { route: 'finance', key: 'nav.finance', icon: 'coin' },
  { route: 'data', key: 'nav.data', icon: 'db', foot: true }
];
