/* ------------------------------------------------------------------
 * Small helpers: formatting, dates, aggregation, CSV.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = {};
  const LOCALES = { th: 'th-TH', en: 'en-US', ko: 'ko-KR' };

  U.locale = () => LOCALES[BI.i18n.lang] || 'en-US';

  /* ---------- number formatting ---------- */
  U.num = (v, digits = 0) =>
    new Intl.NumberFormat(U.locale(), { maximumFractionDigits: digits }).format(+v || 0);
  U.compact = (v) =>
    new Intl.NumberFormat(U.locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(+v || 0);
  U.money = (v) =>
    new Intl.NumberFormat(U.locale(), { style: 'currency', currency: BI.config.currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(+v || 0);
  U.moneyCompact = (v) =>
    new Intl.NumberFormat(U.locale(), { style: 'currency', currency: BI.config.currency, currencyDisplay: 'narrowSymbol', notation: 'compact', maximumFractionDigits: 1 }).format(+v || 0);
  U.pct = (v, digits = 1) =>
    new Intl.NumberFormat(U.locale(), { style: 'percent', maximumFractionDigits: digits }).format(isFinite(v) ? v : 0);
  U.ratio = (a, b) => (b ? a / b : 0);

  /* ---------- dates (stored as 'YYYY-MM-DD' strings) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  U.ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  U.parseDate = (s) => {
    if (!s) return null;
    if (s instanceof Date) return s;
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s);
    if (m) return new Date(+m[1], +m[2] - 1, +(m[3] || 1));
    const d = new Date(s);
    return isNaN(d) ? null : d;
  };
  U.monthKey = (s) => (s ? String(s).slice(0, 7) : '');
  U.addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  U.fmtDate = (s) => {
    const d = U.parseDate(s);
    return d ? new Intl.DateTimeFormat(U.locale(), { year: 'numeric', month: 'short', day: 'numeric' }).format(d) : '–';
  };
  U.fmtMonth = (key) => {
    const d = U.parseDate(key + '-01');
    return d ? new Intl.DateTimeFormat(U.locale(), { month: 'short', year: '2-digit' }).format(d) : key;
  };
  U.monthRange = (startKey, endKey) => {
    const out = [];
    let d = U.parseDate(startKey + '-01');
    const end = U.parseDate(endKey + '-01');
    while (d && end && d <= end && out.length < 240) {
      out.push(U.ymd(d).slice(0, 7));
      d = U.addMonths(d, 1);
    }
    return out;
  };

  /**
   * Current reporting period from the global range selector.
   * Returns { start, end, prevStart, prevEnd, months } where start/end are
   * 'YYYY-MM-DD' (inclusive) and months lists the month keys on the x-axis.
   */
  U.period = (rows = [], dateCol = 'date') => {
    const range = BI.state.range;
    const today = new Date();
    const endKey = U.ymd(today);
    if (!range) {
      const keys = rows.map((r) => U.monthKey(r[dateCol])).filter(Boolean).sort();
      const first = keys[0] || endKey.slice(0, 7);
      const last = keys[keys.length - 1] > endKey.slice(0, 7) ? keys[keys.length - 1] : endKey.slice(0, 7);
      return { start: '0000-01-01', end: '9999-12-31', prevStart: null, prevEnd: null, months: U.monthRange(first, last) };
    }
    const startD = U.addMonths(today, -(range - 1));
    const prevStartD = U.addMonths(startD, -range);
    const prevEndD = new Date(startD.getFullYear(), startD.getMonth(), 0);
    return {
      start: U.ymd(startD),
      end: endKey,
      prevStart: U.ymd(prevStartD),
      prevEnd: U.ymd(prevEndD),
      months: U.monthRange(U.ymd(startD).slice(0, 7), endKey.slice(0, 7))
    };
  };
  U.inRange = (rows, col, start, end) =>
    start ? rows.filter((r) => r[col] && r[col] >= start && r[col] <= end) : [];

  /* ---------- aggregation ---------- */
  U.sum = (rows, f) => rows.reduce((a, r) => a + (+(typeof f === 'function' ? f(r) : r[f]) || 0), 0);
  U.count = (rows, pred) => rows.reduce((a, r) => a + (pred(r) ? 1 : 0), 0);
  /** Sum valueFn per key, returns plain object {key: total}. */
  U.sumBy = (rows, keyFn, valFn) => {
    const out = {};
    const kf = typeof keyFn === 'function' ? keyFn : (r) => r[keyFn];
    const vf = typeof valFn === 'function' ? valFn : valFn ? (r) => r[valFn] : () => 1;
    rows.forEach((r) => {
      const k = kf(r);
      if (k === undefined || k === null || k === '') return;
      out[k] = (out[k] || 0) + (+vf(r) || 0);
    });
    return out;
  };
  U.byMonth = (rows, months, dateCol, valFn) => {
    const m = U.sumBy(rows, (r) => U.monthKey(r[dateCol]), valFn);
    return months.map((k) => m[k] || 0);
  };
  /** Sort an object's entries by value desc → [[key, value], ...] */
  U.ranked = (obj, limit) => {
    const e = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return limit ? e.slice(0, limit) : e;
  };
  U.unique = (rows, col) => [...new Set(rows.map((r) => r[col]).filter((v) => v !== '' && v != null))];
  U.delta = (cur, prev) => (prev ? (cur - prev) / Math.abs(prev) : null);

  /* ---------- misc ---------- */
  U.esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  U.debounce = (fn, ms = 200) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  /* ---------- CSV ---------- */
  U.parseCSV = (text) => {
    const rows = [];
    let row = [], field = '', q = false;
    text = text.replace(/^﻿/, '');
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
        } else field += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); rows.push(row); row = []; field = '';
      } else field += c;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    const nonEmpty = rows.filter((r) => r.some((v) => v.trim() !== ''));
    if (!nonEmpty.length) return [];
    const headers = nonEmpty[0].map((h) => h.trim());
    return nonEmpty.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  };
  U.toCSV = (headers, rows) => {
    const cell = (v) => {
      const s = String(v ?? '');
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [headers.join(','), ...rows.map((r) => headers.map((h) => cell(r[h])).join(','))].join('\n');
  };
  U.download = (filename, text, type = 'text/csv;charset=utf-8') => {
    const blob = new Blob(['﻿' + text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  BI.util = U;
})(window.BI);
