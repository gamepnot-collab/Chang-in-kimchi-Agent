/* ------------------------------------------------------------------
 * Business documents (ระบบออกเอกสาร / ออกบิล)
 *
 * Document flow for a kimchi / pickled-vegetable business:
 *
 *   QT ใบเสนอราคา ──► IV ใบส่งสินค้า/ใบกำกับภาษี/ใบแจ้งหนี้ ──► BN ใบวางบิล
 *                         │                                   │
 *                         ├──► RE ใบเสร็จรับเงิน ◄─────────────┘
 *                         ├──► CN ใบลดหนี้  (returns, spoiled / expired goods)
 *                         └──► DB ใบเพิ่มหนี้ (extra goods, price increase)
 *   CS ใบกำกับภาษี/ใบเสร็จรับเงิน (cash sale: shop, market, walk-in)
 *   PO ใบสั่งซื้อ (buying cabbage, chili flakes, jars … from suppliers)
 *
 * Under Thai VAT rules the tax point for goods is delivery, so a VAT-
 * registered seller issues the tax invoice together with the delivery
 * note (IV), and the receipt (RE) later when the customer pays.
 *
 * Everything is stored in this browser's localStorage.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util;
  const P = BI.config.storagePrefix;
  const KEYS = { docs: P + 'docs', company: P + 'company', products: P + 'products', parties: P + 'parties' };

  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const r2 = (n) => Math.round((+n || 0) * 100) / 100;
  const today = () => U.ymd(new Date());
  const addDays = (s, n) => { const d = U.parseDate(s) || new Date(); d.setDate(d.getDate() + (+n || 0)); return U.ymd(d); };

  /* ---------- document types ---------- */
  const TYPES = {
    QT: { icon: 'quote', party: 'customer', mode: 'items', date2: 'valid_until', next: ['IV', 'CS'],
      sign: ['sign.preparedBy', 'sign.approvedBy', 'sign.customerAccept'] },
    IV: { icon: 'truck', party: 'customer', mode: 'items', lot: true, date2: 'due_date', next: ['RE', 'BN', 'CN', 'DB'], tax: true,
      sign: ['sign.deliveredBy', 'sign.receivedBy', 'sign.authorized'] },
    BN: { icon: 'bill', party: 'customer', mode: 'refs', date2: 'due_date', next: ['RE'],
      sign: ['sign.billedBy', 'sign.billReceivedBy'] },
    RE: { icon: 'receipt', party: 'customer', mode: 'refs', payment: true,
      sign: ['sign.collector', 'sign.authorized'] },
    CS: { icon: 'cash', party: 'customer', mode: 'items', lot: true, payment: true, tax: true,
      sign: ['sign.collector', 'sign.authorized'] },
    CN: { icon: 'minus', party: 'customer', mode: 'adjust', tax: true,
      sign: ['sign.approvedBy', 'sign.receivedBy'] },
    DB: { icon: 'plusdoc', party: 'customer', mode: 'adjust', tax: true,
      sign: ['sign.approvedBy', 'sign.receivedBy'] },
    PO: { icon: 'cart', party: 'supplier', mode: 'items', date2: 'delivery_date', materials: true,
      sign: ['sign.orderedBy', 'sign.approvedBy'] }
  };
  const TYPE_ORDER = ['QT', 'IV', 'BN', 'RE', 'CS', 'CN', 'DB', 'PO'];

  /** Printed title [thai, english] — some depend on VAT registration. */
  function printTitle(code) {
    const vat = company().vat_registered;
    return {
      QT: ['ใบเสนอราคา', 'QUOTATION'],
      IV: vat ? ['ใบส่งสินค้า / ใบกำกับภาษี / ใบแจ้งหนี้', 'DELIVERY ORDER / TAX INVOICE / INVOICE'] : ['ใบส่งสินค้า / ใบแจ้งหนี้', 'DELIVERY ORDER / INVOICE'],
      BN: ['ใบวางบิล', 'BILLING NOTE'],
      RE: ['ใบเสร็จรับเงิน', 'RECEIPT'],
      CS: vat ? ['ใบกำกับภาษี / ใบเสร็จรับเงิน', 'TAX INVOICE / RECEIPT'] : ['บิลเงินสด / ใบเสร็จรับเงิน', 'CASH SALE / RECEIPT'],
      CN: ['ใบลดหนี้', 'CREDIT NOTE'],
      DB: ['ใบเพิ่มหนี้', 'DEBIT NOTE'],
      PO: ['ใบสั่งซื้อ', 'PURCHASE ORDER']
    }[code];
  }

  /* ---------- company settings ---------- */
  const COMPANY_DEFAULT = {
    name_th: 'ช้างอินกิมจิ', name_en: 'Chang-in-kimchi',
    address: '123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพมหานคร 10000',
    tax_id: '0000000000000', branch: 'สำนักงานใหญ่',
    phone: '02-000-0000', email: 'sales@example.com', website: '',
    vat_registered: true, vat_rate: 7,
    credit_days: 30, quote_valid_days: 30,
    bank_name: '', bank_account_name: '', bank_account_no: '', promptpay: '',
    signer_name: '', logo: '',
    note_default: 'สินค้าเป็นอาหารหมักดอง กรุณาเก็บรักษาที่อุณหภูมิ 0–4 °C และบริโภคก่อนวันหมดอายุที่ระบุ',
    is_example: true
  };
  function company() { return { ...COMPANY_DEFAULT, ...read(KEYS.company, {}) }; }
  function saveCompany(c) { write(KEYS.company, { ...c, is_example: false }); }

  /* ---------- products & raw materials ---------- */
  const PRODUCTS_SEED = [
    ['KC-001', 'กิมจิผักกาดขาว 500 ก.', 'Napa cabbage kimchi 500 g', 'กระปุก', 129, 52, 60],
    ['KC-002', 'กิมจิผักกาดขาว 1 กก.', 'Napa cabbage kimchi 1 kg', 'ถุง', 229, 95, 60],
    ['KC-003', 'กิมจิหัวไชเท้า (คักดูกี) 500 ก.', 'Radish kimchi (kkakdugi) 500 g', 'กระปุก', 139, 55, 45],
    ['KC-004', 'กิมจิกุยช่าย 300 ก.', 'Chive kimchi 300 g', 'กระปุก', 99, 40, 21],
    ['KC-005', 'กิมจิแตงกวา (โออีโซบากี) 400 ก.', 'Cucumber kimchi 400 g', 'กระปุก', 119, 48, 14],
    ['KC-006', 'กิมจิขาว (แบ็กกิมจิ) 500 ก.', 'White kimchi (baek kimchi) 500 g', 'กระปุก', 139, 55, 30],
    ['KC-007', 'ผักกาดดองเปรี้ยว 500 ก.', 'Pickled mustard greens 500 g', 'ถุง', 69, 26, 90],
    ['KC-008', 'หัวไชเท้าดองเหลือง (ดันมูจี) 500 ก.', 'Yellow pickled radish (danmuji) 500 g', 'แพ็ค', 89, 34, 120],
    ['KC-009', 'กิมจิผักกาดขาว ถัง 10 กก. (Food service)', 'Napa cabbage kimchi 10 kg tub', 'ถัง', 1950, 820, 45],
    ['KC-010', 'ซอสกิมจิเข้มข้น 1 กก.', 'Kimchi seasoning paste 1 kg', 'ถุง', 320, 130, 180]
  ].map(([sku, name, name_en, unit, price, cost, shelf]) => ({ id: sku, sku, name, name_en, unit, price, cost, shelf_life_days: shelf, fda_no: '', kind: 'product' }));
  const MATERIALS_SEED = [
    ['RM-001', 'ผักกาดขาว (กะหล่ำปลีจีน)', 'Napa cabbage', 'กก.', 18],
    ['RM-002', 'หัวไชเท้า', 'Korean radish', 'กก.', 22],
    ['RM-003', 'พริกป่นเกาหลี (โกชูการู)', 'Gochugaru chili flakes', 'กก.', 420],
    ['RM-004', 'กระเทียมไทย', 'Garlic', 'กก.', 95],
    ['RM-005', 'ขิง', 'Ginger', 'กก.', 60],
    ['RM-006', 'น้ำปลา', 'Fish sauce', 'ขวด', 35],
    ['RM-007', 'กุ้งหมักเกาหลี (แซอูจ็อต)', 'Salted shrimp (saeujeot)', 'กก.', 380],
    ['RM-008', 'เกลือทะเล', 'Sea salt', 'กก.', 15],
    ['RM-009', 'กระปุกพลาสติก PET 500 ก. พร้อมฝา', 'PET jar 500 g with lid', 'ใบ', 6.5],
    ['RM-010', 'ฉลากสินค้า', 'Product label', 'ดวง', 1.2]
  ].map(([sku, name, name_en, unit, price]) => ({ id: sku, sku, name, name_en, unit, price, cost: price, shelf_life_days: 0, fda_no: '', kind: 'material' }));

  function products() { return read(KEYS.products, null) || [...PRODUCTS_SEED, ...MATERIALS_SEED]; }
  function saveProducts(list) { write(KEYS.products, list); }
  function saveProduct(p) {
    const list = products();
    if (!p.id) p.id = p.sku || uid();
    const i = list.findIndex((x) => x.id === p.id);
    if (i >= 0) list[i] = p; else list.push(p);
    saveProducts(list);
    return p;
  }
  function removeProduct(id) { saveProducts(products().filter((p) => p.id !== id)); }

  /* ---------- parties (customers / suppliers) ---------- */
  const SUPPLIERS_SEED = [
    { kind: 'supplier', name: 'สวนผักกาดขาวเชียงใหม่', address: 'อ.สะเมิง จ.เชียงใหม่ 50250', tax_id: '', branch: '', phone: '053-000-000' },
    { kind: 'supplier', name: 'Korea Food Import Co., Ltd.', address: 'แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', tax_id: '0105500000000', branch: 'สำนักงานใหญ่', phone: '02-000-1111' },
    { kind: 'supplier', name: 'บรรจุภัณฑ์สยาม', address: 'อ.บางพลี จ.สมุทรปราการ 10540', tax_id: '0115500000000', branch: 'สำนักงานใหญ่', phone: '02-000-2222' }
  ];
  function parties(kind) {
    const saved = read(KEYS.parties, null) || SUPPLIERS_SEED;
    const list = saved.filter((p) => p.kind === kind);
    if (kind === 'customer') {
      const names = new Set(list.map((p) => p.name));
      BI.store.get('customers').forEach((c) => {
        if (!names.has(c.company)) list.push({ kind, name: c.company, address: c.address || '', tax_id: c.tax_id || '', branch: c.branch || '', phone: c.phone || '', email: c.email || '', contact: c.contact_name || '' });
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
  function rememberParty(kind, party) {
    if (!party || !party.name) return;
    const saved = read(KEYS.parties, null) || SUPPLIERS_SEED.slice();
    const i = saved.findIndex((p) => p.kind === kind && p.name === party.name);
    const row = { kind, ...party };
    if (i >= 0) saved[i] = row; else saved.push(row);
    write(KEYS.parties, saved);
  }

  /* ---------- documents CRUD ---------- */
  function all() { return read(KEYS.docs, []); }
  function get(id) { return all().find((d) => d.id === id) || null; }
  function saveAll(list) { if (!write(KEYS.docs, list)) BI.ui.toast(BI.t('doc.storageFull'), 'bad'); }
  function save(doc) {
    const list = all();
    doc.updated = new Date().toISOString();
    if (!doc.id) { doc.id = uid(); doc.created = doc.updated; }
    const i = list.findIndex((d) => d.id === doc.id);
    if (i >= 0) list[i] = doc; else list.push(doc);
    saveAll(list);
    if (doc.party && doc.party.name) rememberParty(TYPES[doc.type].party, doc.party);
    return doc;
  }
  function remove(id) { saveAll(all().filter((d) => d.id !== id)); }

  /** Running number per type per month: IV2611-0001 */
  function nextNo(type, date) {
    const d = U.parseDate(date) || new Date();
    const prefix = `${type}${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-`;
    const max = all().filter((x) => x.no && x.no.startsWith(prefix)).reduce((m, x) => Math.max(m, +x.no.slice(prefix.length) || 0), 0);
    return prefix + String(max + 1).padStart(4, '0');
  }
  function issue(doc) {
    if (!doc.no) doc.no = nextNo(doc.type, doc.date);
    doc.status = 'issued';
    return save(doc);
  }
  function cancel(id) { const d = get(id); if (d) { d.status = 'cancelled'; save(d); } }

  /** Blank document of a given type with sensible defaults. */
  function blank(type) {
    const c = company();
    const d = today();
    const doc = {
      id: '', type, no: '', status: 'draft', date: d, ref: '', refs: [], source: '',
      party: { name: '', address: '', tax_id: '', branch: '', phone: '', email: '', contact: '' },
      items: [], bill_discount: 0,
      vat_mode: c.vat_registered && type !== 'RE' && type !== 'BN' ? 'exclusive' : 'none',
      wht_rate: 0, notes: '', adjust: { reason: '', original: 0 },
      payment: { method: 'transfer', date: d, bank: '', ref: '' }
    };
    if (type === 'QT') doc.valid_until = addDays(d, c.quote_valid_days);
    if (type === 'IV' || type === 'BN') doc.due_date = addDays(d, c.credit_days);
    if (type === 'PO') doc.delivery_date = addDays(d, 3);
    if (type === 'IV' || type === 'CS') doc.notes = c.note_default;
    if (type === 'PO') doc.vat_mode = c.vat_registered ? 'exclusive' : 'none';
    return doc;
  }

  /** Line built from a product, with auto lot number and expiry date. */
  function lineFromProduct(p, date) {
    const d = U.parseDate(date) || new Date();
    const lot = 'L' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    return {
      sku: p.sku, name: p.name, qty: 1, unit: p.unit, price: +p.price || 0, discount: 0,
      lot: p.kind === 'product' ? lot : '', exp: p.kind === 'product' && p.shelf_life_days ? addDays(U.ymd(d), p.shelf_life_days) : ''
    };
  }

  /* ---------- calculations ---------- */
  function calc(doc) {
    const c = company();
    const rate = (+c.vat_rate || 7) / 100;
    const ty = TYPES[doc.type];
    if (ty.mode === 'refs') {
      const lines = (doc.refs || []).map(get).filter(Boolean).map((inv) => {
        const x = calc(inv);
        return { id: inv.id, no: inv.no, date: inv.date, due_date: inv.due_date, amount: x.net, vat: x.vat, beforeVat: x.beforeVat };
      });
      const total = r2(lines.reduce((a, l) => a + l.amount, 0));
      return { mode: 'refs', lines, sub: total, discount: 0, after: total, beforeVat: r2(lines.reduce((a, l) => a + l.beforeVat, 0)), vat: r2(lines.reduce((a, l) => a + l.vat, 0)), grand: total, wht: 0, net: total };
    }
    const lines = (doc.items || []).map((l) => ({ ...l, amount: r2((+l.qty || 0) * (+l.price || 0) - (+l.discount || 0)) }));
    const sub = r2(lines.reduce((a, l) => a + l.amount, 0));
    const discount = r2(doc.bill_discount);
    const after = r2(sub - discount);
    let beforeVat = after, vat = 0, grand = after;
    const mode = c.vat_registered || doc.type === 'PO' ? doc.vat_mode : 'none';
    if (mode === 'exclusive') { vat = r2(after * rate); grand = r2(after + vat); }
    else if (mode === 'inclusive') { beforeVat = r2(after / (1 + rate)); vat = r2(after - beforeVat); }
    const wht = r2(beforeVat * (+doc.wht_rate || 0) / 100);
    const out = { mode: ty.mode, vatMode: mode, rate, lines, sub, discount, after, beforeVat, vat, grand, wht, net: r2(grand - wht) };
    if (ty.mode === 'adjust') {
      out.original = r2(doc.adjust && doc.adjust.original);
      out.corrected = r2(doc.type === 'CN' ? out.original - beforeVat : out.original + beforeVat);
    }
    return out;
  }

  /* ---------- derived status ---------- */
  const live = (d) => d.status !== 'draft' && d.status !== 'cancelled';
  function paidBy(id) { return all().filter((d) => (d.type === 'RE') && live(d) && (d.refs || []).includes(id)); }
  function children(id) { return all().filter((d) => d.status !== 'cancelled' && (d.source === id || (d.refs || []).includes(id))); }
  /** Display status key: draft | cancelled | unpaid | overdue | paid | pending | accepted | expired | billed | issued | ordered */
  function status(doc) {
    if (doc.status === 'draft' || doc.status === 'cancelled') return doc.status;
    const t = today();
    switch (doc.type) {
      case 'QT':
        if (children(doc.id).length) return 'accepted';
        return doc.valid_until && doc.valid_until < t ? 'expired' : 'pending';
      case 'IV':
        if (paidBy(doc.id).length) return 'paid';
        return doc.due_date && doc.due_date < t ? 'overdue' : 'unpaid';
      case 'BN':
        return (doc.refs || []).length && doc.refs.every((r) => paidBy(r).length) ? 'paid' : 'billed';
      case 'RE': case 'CS': return 'paid';
      case 'PO': return 'ordered';
      default: return 'issued';
    }
  }
  const STATUS_TONE = { draft: 'muted', cancelled: 'muted', unpaid: 'warn', overdue: 'bad', paid: 'good', pending: 'info', accepted: 'good', expired: 'muted', billed: 'info', issued: 'info', ordered: 'info' };
  function badge(doc) { const s = status(doc); return `<span class="badge ${STATUS_TONE[s]}">${BI.t('st.' + s)}</span>`; }

  /** Unpaid invoices for a customer (for billing notes and receipts). */
  function openInvoices(partyName) {
    return all().filter((d) => d.type === 'IV' && live(d) && (!partyName || d.party.name === partyName) && !paidBy(d.id).length)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /* ---------- conversions ---------- */
  function convert(srcId, type) {
    const src = get(srcId);
    if (!src) return blank(type);
    const doc = blank(type);
    doc.party = { ...src.party };
    doc.source = src.id;
    doc.ref = src.no;
    if (TYPES[type].mode === 'items' && TYPES[src.type].mode === 'items') {
      doc.items = src.items.map((l) => ({ ...l }));
      doc.bill_discount = src.bill_discount;
      doc.vat_mode = src.vat_mode;
      if (type === 'IV' || type === 'CS') {
        const fresh = doc.items.map((l) => { const p = products().find((x) => x.sku === l.sku); return p ? { ...lineFromProduct(p, doc.date), ...l, lot: l.lot || lineFromProduct(p, doc.date).lot, exp: l.exp || lineFromProduct(p, doc.date).exp } : l; });
        doc.items = fresh;
      }
    }
    if (TYPES[type].mode === 'refs') {
      doc.refs = src.type === 'BN' ? (src.refs || []).filter((r) => !paidBy(r).length) : [src.id];
      doc.vat_mode = 'none';
    }
    if (TYPES[type].mode === 'adjust') {
      doc.adjust = { reason: '', original: calc(src).beforeVat };
      doc.vat_mode = src.vat_mode === 'none' ? 'none' : 'exclusive';
    }
    return doc;
  }
  function duplicate(srcId) {
    const src = get(srcId);
    const doc = blank(src.type);
    Object.assign(doc, JSON.parse(JSON.stringify({ party: src.party, items: src.items, bill_discount: src.bill_discount, vat_mode: src.vat_mode, wht_rate: src.wht_rate, notes: src.notes, refs: [] })));
    doc.items.forEach((l) => {
      const p = products().find((x) => x.sku === l.sku);
      if (p && TYPES[doc.type].lot) { const f = lineFromProduct(p, doc.date); l.lot = f.lot; l.exp = f.exp; }
    });
    return doc;
  }

  /* ---------- Thai baht text ---------- */
  const DIG = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const POS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
  function readInt(s) {
    s = String(s).replace(/^0+/, '');
    if (!s) return '';
    const groups = [];
    while (s.length > 6) { groups.unshift(s.slice(-6)); s = s.slice(0, -6); }
    groups.unshift(s);
    return groups.map((g, gi) => {
      const n = g.replace(/^0+/, '');
      let out = '';
      for (let i = 0; i < n.length; i++) {
        const d = +n[i], p = n.length - i - 1;
        if (!d) continue;
        if (p === 1 && d === 1) out += 'สิบ';
        else if (p === 1 && d === 2) out += 'ยี่สิบ';
        else if (p === 0 && d === 1 && (n.length > 1 || gi > 0)) out += 'เอ็ด';
        else out += DIG[d] + POS[p];
      }
      return out + (gi < groups.length - 1 ? 'ล้าน' : '');
    }).join('');
  }
  function bahtText(amount) {
    const neg = amount < 0;
    const [b, s] = Math.abs(r2(amount)).toFixed(2).split('.');
    const baht = readInt(b), satang = readInt(s);
    let out = '';
    if (!baht && !satang) out = 'ศูนย์บาทถ้วน';
    else out = (baht ? baht + 'บาท' : '') + (satang ? satang + 'สตางค์' : 'ถ้วน');
    return (neg ? 'ลบ' : '') + out;
  }

  /* ---------- PromptPay QR (EMVCo) ---------- */
  function crc16(s) {
    let crc = 0xffff;
    for (let i = 0; i < s.length; i++) {
      crc ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function promptpayPayload(id, amount) {
    const f = (tag, v) => tag + String(v.length).padStart(2, '0') + v;
    const target = String(id || '').replace(/\D/g, '');
    if (!target) return '';
    let acc;
    if (target.length >= 15) acc = f('03', target);
    else if (target.length >= 13) acc = f('02', target);
    else acc = f('01', ('0000000000000' + target.replace(/^0/, '66')).slice(-13));
    const p = f('00', '01') + f('01', amount ? '12' : '11') + f('29', f('00', 'A000000677010111') + acc) +
      f('53', '764') + (amount ? f('54', (+amount).toFixed(2)) : '') + f('58', 'TH') + '6304';
    return p + crc16(p);
  }
  function promptpaySvg(id, amount, size = 120) {
    const payload = promptpayPayload(id, amount);
    if (!payload || !window.qrcode) return '';
    const qr = qrcode(0, 'M');
    qr.addData(payload);
    qr.make();
    const n = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" width="${size}" height="${size}" role="img" aria-label="PromptPay QR"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
  }

  /* ---------- finance integration ---------- */
  /** Rows in finance_transactions format generated from real (non-demo) documents. */
  function financeRows() {
    return all().filter((d) => live(d) && !d.demo && ['IV', 'CS', 'CN', 'DB'].includes(d.type)).map((d) => {
      const x = calc(d);
      const st = status(d);
      const sign = d.type === 'CN' ? -1 : 1;
      return {
        date: d.date, doc_no: d.no, type: 'Income', category: d.type === 'CS' ? 'Sales Revenue' : d.type === 'IV' ? 'Sales Revenue' : 'Sales Adjustment',
        department: 'Sales', party: d.party.name, amount: sign * x.beforeVat,
        status: d.type === 'IV' ? (st === 'paid' ? 'Paid' : st === 'overdue' ? 'Overdue' : 'Pending') : 'Paid'
      };
    });
  }

  /* ---------- demo seed ---------- */
  function ensureSeed() {
    if (localStorage.getItem(KEYS.docs) !== null) return;
    const cust = BI.store.get('customers').slice(0, 6);
    const prods = products().filter((p) => p.kind === 'product');
    const mats = products().filter((p) => p.kind === 'material');
    const party = (c) => ({ name: c.company, address: c.address || '', tax_id: c.tax_id || '', branch: c.branch || '', phone: c.phone, email: c.email, contact: c.contact_name });
    const mk = (type, c, daysAgo, lines, extra = {}) => {
      const doc = blank(type);
      doc.date = addDays(today(), -daysAgo);
      if (doc.due_date) doc.due_date = addDays(doc.date, company().credit_days);
      if (doc.valid_until) doc.valid_until = addDays(doc.date, company().quote_valid_days);
      if (c) doc.party = party(c);
      doc.items = lines.map(([p, q]) => ({ ...lineFromProduct(p, doc.date), qty: q }));
      doc.demo = true;
      Object.assign(doc, extra);
      return issue(doc);
    };
    write(KEYS.docs, []);
    const qt = mk('QT', cust[0], 12, [[prods[8], 4], [prods[0], 24], [prods[2], 12]]);
    const iv1 = mk('IV', cust[0], 9, qt.items.map((l) => [prods.find((p) => p.sku === l.sku), l.qty]), { source: qt.id, ref: qt.no });
    const iv2 = mk('IV', cust[1], 40, [[prods[1], 30], [prods[6], 20]]);
    const iv3 = mk('IV', cust[1], 20, [[prods[1], 25], [prods[7], 15]]);
    const iv4 = mk('IV', cust[2], 5, [[prods[3], 20], [prods[4], 20], [prods[5], 10]]);
    mk('BN', cust[1], 3, [], { refs: [iv2.id, iv3.id], due_date: addDays(today(), 7), items: [] });
    mk('RE', cust[0], 1, [], { refs: [iv1.id], items: [], payment: { method: 'transfer', date: addDays(today(), -1), bank: 'ธนาคารกสิกรไทย', ref: 'TRX-00981' } });
    mk('CS', null, 0, [[prods[0], 3], [prods[3], 2]], { party: { name: 'ลูกค้าหน้าร้าน', address: '', tax_id: '', branch: '', phone: '', email: '', contact: '' }, payment: { method: 'promptpay', date: today(), bank: '', ref: '' } });
    const cn = blank('CN');
    Object.assign(cn, { date: addDays(today(), -2), party: { ...iv4.party }, source: iv4.id, ref: iv4.no, demo: true,
      adjust: { reason: 'expired', original: calc(iv4).beforeVat }, items: [{ ...lineFromProduct(prods[4], iv4.date), qty: 4 }] });
    issue(cn);
    const po = blank('PO');
    Object.assign(po, { date: addDays(today(), -4), party: { ...SUPPLIERS_SEED[0] }, demo: true,
      items: [{ ...lineFromProduct(mats[0], today()), qty: 400 }, { ...lineFromProduct(mats[1], today()), qty: 120 }] });
    delete po.party.kind;
    issue(po);
    const draft = blank('QT');
    Object.assign(draft, { party: party(cust[3]), demo: true, items: [{ ...lineFromProduct(prods[9], today()), qty: 10 }, { ...lineFromProduct(prods[0], today()), qty: 48 }] });
    save(draft);
  }
  function clearDemo() { saveAll(all().filter((d) => !d.demo)); }
  const hasDemo = () => all().some((d) => d.demo);

  /* ---------- backup ---------- */
  function exportBackup() {
    return JSON.stringify({ app: 'chang-in-kimchi', version: 1, exported: new Date().toISOString(), company: read(KEYS.company, {}), products: products(), parties: read(KEYS.parties, null), docs: all() }, null, 2);
  }
  function importBackup(text) {
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.docs)) throw new Error('bad-backup');
    write(KEYS.company, data.company || {});
    if (data.products) write(KEYS.products, data.products);
    if (data.parties) write(KEYS.parties, data.parties);
    write(KEYS.docs, data.docs);
    return data.docs.length;
  }

  const typeName = (code) => BI.t('type.' + code + '.name');

  BI.docs = {
    TYPES, TYPE_ORDER, type: (c) => TYPES[c], typeName, printTitle,
    company, saveCompany, products, saveProduct, removeProduct, parties,
    all, get, save, remove, issue, cancel, nextNo, blank, lineFromProduct,
    calc, status, badge, paidBy, children, openInvoices, convert, duplicate,
    bahtText, promptpayPayload, promptpaySvg, financeRows,
    ensureSeed, clearDemo, hasDemo, exportBackup, importBackup, r2, addDays
  };
})(window.BI);
