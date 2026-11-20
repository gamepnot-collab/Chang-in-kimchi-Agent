/* ------------------------------------------------------------------
 * Data store.
 *
 * Every dashboard reads from a named dataset. A dataset is an array of
 * row objects whose columns are defined in BI.schemas below. Data comes
 * from (in priority order):
 *   1. an imported file (CSV / Excel) or Google Sheet saved in localStorage
 *   2. built-in sample data (BI.sampleData)
 *
 * To connect a new source later (Facebook, TikTok, accounting API …),
 * convert its output to rows that match the schema and call
 * BI.store.set(name, rows, { source: '...' }).
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util;

  /* type suffix: :date  :month  :num   (default = text) */
  const S = (dept, cols) => ({
    dept,
    columns: cols.map((c) => {
      const [name, type = 'text'] = c.split(':');
      return { name, type };
    })
  });

  BI.schemas = {
    customers: S('sales', ['customer_id', 'company', 'contact_name', 'email', 'phone', 'segment', 'owner', 'status', 'created_date:date', 'last_contact:date']),
    sales_deals: S('sales', ['deal_id', 'date:date', 'company', 'sales_rep', 'source', 'stage', 'value:num', 'close_date:date']),
    sales_targets: S('sales', ['month:month', 'target:num']),
    content_posts: S('marketing', ['post_id', 'date:date', 'platform', 'creator', 'content_type', 'title', 'reach:num', 'engagements:num', 'status']),
    ad_campaigns: S('marketing', ['date:date', 'channel', 'campaign', 'spend:num', 'impressions:num', 'clicks:num', 'leads:num', 'conversions:num', 'revenue:num']),
    employees: S('hr', ['employee_id', 'name', 'department', 'position', 'hire_date:date', 'exit_date:date', 'status', 'salary:num', 'leave_days_used:num']),
    finance_transactions: S('finance', ['date:date', 'doc_no', 'type', 'category', 'department', 'party', 'amount:num', 'status']),
    budgets: S('finance', ['year', 'department', 'budget:num'])
  };

  const KEY = (name) => BI.config.storagePrefix + 'data:' + name;
  const cache = {};
  let sample = null;

  const readLS = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const writeLS = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; }
  };

  /* ---------- value normalisation ---------- */
  const excelSerialToDate = (n) => new Date(Math.round((n - 25569) * 864e5));
  const toDate = (v) => {
    if (v === '' || v == null) return '';
    if (v instanceof Date) return isNaN(v) ? '' : U.ymd(v);
    if (typeof v === 'number' || /^\d{5}(\.\d+)?$/.test(String(v))) {
      const d = excelSerialToDate(+v);
      return U.ymd(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
    const s = String(v).trim();
    let m = /^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?/.exec(s);
    if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${(m[3] || '1').padStart(2, '0')}`;
    m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s); // DD/MM/YYYY (Thai / Korean style)
    if (m) {
      let y = +m[3];
      if (y > 2400) y -= 543; // Buddhist era → Gregorian
      return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    const d = new Date(s);
    return isNaN(d) ? '' : U.ymd(d);
  };
  const toNum = (v) => {
    if (typeof v === 'number') return v;
    const n = parseFloat(String(v ?? '').replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? 0 : n;
  };
  const headerKey = (h) => String(h).trim().toLowerCase().replace(/[\s\-]+/g, '_');

  /**
   * Map raw imported rows onto a schema. Header matching ignores case and
   * treats spaces / dashes as underscores.
   * Returns { rows, missing: [columns not found], extra: [unknown headers] }
   */
  function normalize(name, raw) {
    const schema = BI.schemas[name];
    if (!raw.length) return { rows: [], missing: schema.columns.map((c) => c.name), extra: [] };
    const headers = Object.keys(raw[0]);
    const map = {};
    headers.forEach((h) => { map[headerKey(h)] = h; });
    const missing = schema.columns.filter((c) => !(c.name in map)).map((c) => c.name);
    const known = new Set(schema.columns.map((c) => c.name));
    const extra = headers.filter((h) => !known.has(headerKey(h)));
    const rows = raw.map((r) => {
      const o = {};
      schema.columns.forEach(({ name: col, type }) => {
        const v = col in map ? r[map[col]] : '';
        if (type === 'num') o[col] = toNum(v);
        else if (type === 'date') o[col] = toDate(v);
        else if (type === 'month') o[col] = toDate(v).slice(0, 7);
        else o[col] = v == null ? '' : String(v).trim();
      });
      return o;
    });
    return { rows, missing, extra };
  }

  BI.store = {
    normalize,

    get(name) {
      if (cache[name]) return cache[name];
      const saved = readLS(KEY(name));
      if (saved && Array.isArray(saved.rows)) return (cache[name] = saved.rows);
      if (!sample) sample = BI.sampleData.generate();
      return (cache[name] = sample[name] || []);
    },

    /** meta: { source: 'file'|'gsheet'|..., label, url } */
    set(name, rows, meta = {}) {
      const payload = { rows, meta: { ...meta, updated: new Date().toISOString(), count: rows.length } };
      cache[name] = rows;
      return writeLS(KEY(name), payload);
    },

    reset(name) {
      delete cache[name];
      try { localStorage.removeItem(KEY(name)); } catch (e) { /* ignore */ }
    },

    meta(name) {
      const saved = readLS(KEY(name));
      return saved ? saved.meta : { source: 'sample', count: this.get(name).length };
    },

    isSample(name) { return this.meta(name).source === 'sample'; },

    templateCSV(name) {
      const cols = BI.schemas[name].columns.map((c) => c.name);
      const rows = this.get(name).slice(0, 5);
      return U.toCSV(cols, rows);
    },

    exportCSV(name) {
      const cols = BI.schemas[name].columns.map((c) => c.name);
      return U.toCSV(cols, this.get(name));
    },

    /** Parse a File (csv / xlsx / xls) into raw row objects. */
    async readFile(file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'csv' || ext === 'txt') return U.parseCSV(await file.text());
      if (!window.XLSX) throw new Error('Excel reader not loaded');
      const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
    },

    /**
     * Fetch a Google Sheet as CSV. Accepts a normal sheet URL (the sheet must be
     * shared "Anyone with the link can view") or a "Publish to web" CSV link.
     */
    async fetchGoogleSheet(url) {
      const csvUrl = this.googleCsvUrl(url);
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (/^\s*<!doctype html|<html/i.test(text)) throw new Error('not-public');
      return U.parseCSV(text);
    },

    googleCsvUrl(url) {
      url = url.trim();
      if (/output=csv|tqx=out:csv/.test(url)) return url;
      const id = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(url);
      if (!id) throw new Error('bad-url');
      const gid = /[#&?]gid=(\d+)/.exec(url);
      return `https://docs.google.com/spreadsheets/d/${id[1]}/gviz/tq?tqx=out:csv${gid ? '&gid=' + gid[1] : ''}`;
    },

    /** Re-fetch every dataset linked to a Google Sheet. */
    async refreshLinked() {
      const jobs = Object.keys(BI.schemas).map(async (name) => {
        const m = this.meta(name);
        if (m.source !== 'gsheet' || !m.url) return false;
        try {
          const { rows } = normalize(name, await this.fetchGoogleSheet(m.url));
          this.set(name, rows, { source: 'gsheet', url: m.url, label: m.label });
          return true;
        } catch (e) {
          console.warn('Refresh failed for', name, e);
          return false;
        }
      });
      return (await Promise.all(jobs)).some(Boolean);
    }
  };
})(window.BI);
