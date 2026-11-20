/* ------------------------------------------------------------------
 * A4 document layout (Thai + English labels, as is standard for Thai
 * business documents) and printing.
 *
 * A full tax invoice (section 86/4 of the Revenue Code) shows:
 * the words "ใบกำกับภาษี", seller name / address / tax ID / head office or
 * branch, buyer name / address (and tax ID + branch for VAT-registered
 * buyers), document number, description / quantity / value of goods,
 * VAT shown separately, and the issue date. All of these are rendered here.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util;
  const D = BI.docs;
  const esc = U.esc;

  const n2 = (v) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+v || 0);
  const qty = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(+v || 0);
  const date = (s) => {
    const d = U.parseDate(s);
    return d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear() + 543}` : '-';
  };
  const initials = (name) => (String(name || 'CK').split(/[\s\-]+/).filter((w) => w.length > 2).map((w) => w[0]).join('').slice(0, 2) || 'CK').toUpperCase();
  const L = (th, en) => `<span class="lb">${th}</span><span class="lb-en">${en}</span>`;
  const branchText = (b) => (!b ? '' : /^\d+$/.test(b) ? `สาขาที่ ${b.padStart(5, '0')}` : b);

  const SIGN = {
    'sign.preparedBy': ['ผู้เสนอราคา', 'Prepared by'], 'sign.approvedBy': ['ผู้อนุมัติ', 'Approved by'],
    'sign.customerAccept': ['ลูกค้ายืนยันการสั่งซื้อ', 'Customer acceptance'], 'sign.deliveredBy': ['ผู้ส่งสินค้า', 'Delivered by'],
    'sign.receivedBy': ['ผู้รับสินค้า / ผู้รับเอกสาร', 'Received by'], 'sign.authorized': ['ผู้มีอำนาจลงนาม', 'Authorized signature'],
    'sign.billedBy': ['ผู้วางบิล', 'Billed by'], 'sign.billReceivedBy': ['ผู้รับวางบิล', 'Bill received by'],
    'sign.collector': ['ผู้รับเงิน', 'Collected by'], 'sign.orderedBy': ['ผู้สั่งซื้อ', 'Ordered by']
  };
  const PAY = { cash: ['เงินสด', 'Cash'], transfer: ['โอนเงิน', 'Bank transfer'], promptpay: ['พร้อมเพย์', 'PromptPay'], cheque: ['เช็ค', 'Cheque'], card: ['บัตรเครดิต', 'Credit card'] };
  const REASONS = {
    damaged: 'สินค้าชำรุด / บรรจุภัณฑ์เสียหาย', expired: 'สินค้าหมดอายุ / เสื่อมคุณภาพ', returned: 'ลูกค้าส่งคืนสินค้า',
    discount: 'ลดราคาหลังออกใบกำกับภาษี', overcharge: 'คำนวณราคาสูงกว่าที่ตกลง', short: 'ส่งสินค้าไม่ครบ',
    extra: 'ส่งสินค้าเพิ่มเติม', price_up: 'ปรับราคาเพิ่มตามข้อตกลง', undercharge: 'คำนวณราคาต่ำกว่าที่ตกลง', other: 'อื่น ๆ'
  };

  function header(doc, copyLabel) {
    const c = D.company();
    const [th, en] = D.printTitle(doc.type);
    return `<header class="p-head">
      <div class="p-company">
        ${c.logo ? `<img class="p-logo" src="${esc(c.logo)}" alt="">` : `<div class="p-logo p-logo-text">${esc(initials(c.name_en || c.name_th))}</div>`}
        <div>
          <strong class="p-cname">${esc(c.name_th)}</strong>
          ${c.name_en ? `<div class="p-cname-en">${esc(c.name_en)}</div>` : ''}
          <div>${esc(c.address)}</div>
          <div>เลขประจำตัวผู้เสียภาษี / Tax ID: <b>${esc(c.tax_id)}</b> ${c.branch ? '· ' + esc(branchText(c.branch)) : ''}</div>
          <div>${[c.phone && 'โทร ' + esc(c.phone), c.email && esc(c.email), c.website && esc(c.website)].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      <div class="p-title">
        <h1>${th}</h1>
        <p>${en}</p>
        ${copyLabel ? `<span class="p-copy">${copyLabel}</span>` : ''}
        ${doc.status === 'cancelled' ? '<span class="p-void">ยกเลิก / VOID</span>' : ''}
        ${doc.status === 'draft' ? '<span class="p-void">ฉบับร่าง / DRAFT</span>' : ''}
      </div>
    </header>`;
  }

  function meta(doc) {
    const ty = D.type(doc.type);
    const p = doc.party || {};
    const partyLabel = ty.party === 'supplier' ? L('ผู้ขาย', 'Supplier') : L('ลูกค้า', 'Customer');
    const rows = [
      [L('เลขที่', 'No.'), `<b>${esc(doc.no || '—')}</b>`],
      [L('วันที่', 'Date'), date(doc.date)]
    ];
    if (doc.valid_until) rows.push([L('ยืนราคาถึง', 'Valid until'), date(doc.valid_until)]);
    if (doc.due_date) rows.push([L('ครบกำหนดชำระ', 'Due date'), date(doc.due_date)]);
    if (doc.delivery_date) rows.push([L('กำหนดส่งของ', 'Delivery date'), date(doc.delivery_date)]);
    if (doc.due_date && doc.type === 'IV') {
      const days = Math.round((U.parseDate(doc.due_date) - U.parseDate(doc.date)) / 864e5);
      rows.push([L('เครดิต', 'Credit term'), `${days} วัน / days`]);
    }
    if (doc.ref) rows.push([L('อ้างอิง', 'Reference'), esc(doc.ref)]);
    return `<section class="p-meta">
      <div class="p-party">
        <div class="p-party-label">${partyLabel}</div>
        <strong>${esc(p.name || '-')}</strong>
        ${p.address ? `<div>${esc(p.address)}</div>` : ''}
        ${p.tax_id ? `<div>เลขประจำตัวผู้เสียภาษี / Tax ID: ${esc(p.tax_id)} ${p.branch ? '· ' + esc(branchText(p.branch)) : ''}</div>` : ''}
        ${p.contact || p.phone ? `<div>${[p.contact && 'ผู้ติดต่อ ' + esc(p.contact), p.phone && 'โทร ' + esc(p.phone)].filter(Boolean).join(' · ')}</div>` : ''}
      </div>
      <dl class="p-docinfo">${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </section>`;
  }

  function itemsTable(doc, x) {
    const lot = D.type(doc.type).lot;
    const showDisc = x.lines.some((l) => +l.discount);
    return `<table class="p-items">
      <thead><tr>
        <th class="c">${L('ลำดับ', 'No.')}</th>
        <th>${L('รหัส', 'Code')}</th>
        <th class="w">${L('รายการ', 'Description')}</th>
        ${lot ? `<th>${L('ล็อต / หมดอายุ', 'Lot / EXP')}</th>` : ''}
        <th class="r">${L('จำนวน', 'Qty')}</th>
        <th class="r">${L('ราคา/หน่วย', 'Unit price')}</th>
        ${showDisc ? `<th class="r">${L('ส่วนลด', 'Disc.')}</th>` : ''}
        <th class="r">${L('จำนวนเงิน', 'Amount')}</th>
      </tr></thead>
      <tbody>${x.lines.map((l, i) => `<tr>
        <td class="c">${i + 1}</td>
        <td>${esc(l.sku || '')}</td>
        <td class="w">${esc(l.name)}</td>
        ${lot ? `<td class="small">${l.lot ? esc(l.lot) : ''}${l.exp ? `<br>EXP ${date(l.exp)}` : ''}</td>` : ''}
        <td class="r">${qty(l.qty)} ${esc(l.unit || '')}</td>
        <td class="r">${n2(l.price)}</td>
        ${showDisc ? `<td class="r">${+l.discount ? n2(l.discount) : ''}</td>` : ''}
        <td class="r">${n2(l.amount)}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  }

  function refsTable(doc, x) {
    return `<table class="p-items">
      <thead><tr>
        <th class="c">${L('ลำดับ', 'No.')}</th>
        <th class="w">${L('เลขที่ใบแจ้งหนี้ / ใบกำกับภาษี', 'Invoice no.')}</th>
        <th>${L('ลงวันที่', 'Date')}</th>
        <th>${L('ครบกำหนด', 'Due')}</th>
        <th class="r">${L('จำนวนเงิน', 'Amount')}</th>
      </tr></thead>
      <tbody>${x.lines.map((l, i) => `<tr><td class="c">${i + 1}</td><td class="w">${esc(l.no)}</td><td>${date(l.date)}</td><td>${date(l.due_date)}</td><td class="r">${n2(l.amount)}</td></tr>`).join('')}</tbody>
    </table>`;
  }

  function totals(doc, x) {
    const rows = [];
    const vatPct = Math.round(x.rate * 100);
    if (x.mode === 'refs') {
      rows.push([L('รวมจำนวน', 'Documents'), `${x.lines.length} ฉบับ`]);
      rows.push([L('จำนวนเงินรวมทั้งสิ้น', 'Grand total'), n2(x.grand), 'grand']);
    } else if (x.mode === 'adjust') {
      rows.push([L('มูลค่าตามใบกำกับภาษีเดิม', 'Original value'), n2(x.original)]);
      rows.push([L('มูลค่าที่ถูกต้อง', 'Correct value'), n2(x.corrected)]);
      rows.push([L('ผลต่าง', 'Difference'), n2(x.beforeVat)]);
      if (x.vatMode !== 'none') rows.push([L(`ภาษีมูลค่าเพิ่ม ${vatPct}%`, `VAT ${vatPct}%`), n2(x.vat)]);
      rows.push([L('รวมทั้งสิ้น', 'Total'), n2(x.grand), 'grand']);
    } else {
      rows.push([L('รวมเป็นเงิน', 'Subtotal'), n2(x.sub)]);
      if (x.discount) {
        rows.push([L('ส่วนลด', 'Discount'), n2(x.discount)]);
        rows.push([L('หลังหักส่วนลด', 'After discount'), n2(x.after)]);
      }
      if (x.vatMode !== 'none') {
        rows.push([L('มูลค่าสินค้าก่อนภาษี', 'Value before VAT'), n2(x.beforeVat)]);
        rows.push([L(`ภาษีมูลค่าเพิ่ม ${vatPct}%`, `VAT ${vatPct}%`), n2(x.vat)]);
      }
      rows.push([L('จำนวนเงินรวมทั้งสิ้น', 'Grand total'), n2(x.grand), 'grand']);
      if (x.wht) {
        rows.push([L(`หัก ณ ที่จ่าย ${doc.wht_rate}%`, `Withholding tax ${doc.wht_rate}%`), n2(x.wht)]);
        rows.push([L('ยอดชำระสุทธิ', 'Net payable'), n2(x.net), 'grand']);
      }
    }
    return `<table class="p-totals">${rows.map(([k, v, cls]) => `<tr class="${cls || ''}"><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
  }

  function paymentBox(doc, x) {
    const c = D.company();
    const ty = D.type(doc.type);
    const parts = [];
    if (ty.payment) {
      const p = doc.payment || {};
      parts.push(`<div class="p-paid"><div class="p-box-title">${L('การชำระเงิน', 'Payment')}</div>
        <div class="p-checks">${Object.entries(PAY).map(([k, [th]]) => `<span class="${p.method === k ? 'on' : ''}">${p.method === k ? '☑' : '☐'} ${th}</span>`).join('')}</div>
        <div>${[p.bank && 'ธนาคาร ' + esc(p.bank), p.ref && 'เลขที่อ้างอิง ' + esc(p.ref), p.date && 'วันที่ ' + date(p.date)].filter(Boolean).join(' · ')}</div></div>`);
    } else if (['QT', 'IV', 'BN'].includes(doc.type) && (c.bank_account_no || c.promptpay)) {
      const qr = c.promptpay ? D.promptpaySvg(c.promptpay, x.net, 92) : '';
      parts.push(`<div class="p-bank">
        <div><div class="p-box-title">${L('ชำระเงินโดยโอนเข้าบัญชี', 'Pay to')}</div>
          ${c.bank_account_no ? `<div>${esc(c.bank_name)}</div><div>ชื่อบัญชี ${esc(c.bank_account_name)}</div><div>เลขที่บัญชี <b>${esc(c.bank_account_no)}</b></div>` : ''}
          ${c.promptpay ? `<div>พร้อมเพย์ <b>${esc(c.promptpay)}</b></div>` : ''}</div>
        ${qr ? `<div class="p-qr">${qr}<small>สแกนจ่าย ${n2(x.net)} บาท</small></div>` : ''}
      </div>`);
    }
    return parts.join('');
  }

  function signatures(doc) {
    const c = D.company();
    return `<section class="p-sign">${D.type(doc.type).sign.map((k, i) => `
      <div class="p-sig">
        <div class="p-sig-line"></div>
        <div>${SIGN[k][0]}</div>
        <div class="lb-en">${SIGN[k][1]}</div>
        <div class="p-sig-name">${i === D.type(doc.type).sign.length - 1 && c.signer_name && !/customer|receivedBy|billReceivedBy/.test(k) ? esc(c.signer_name) : '(...............................................)'}</div>
        <div class="p-sig-date">วันที่ / Date ......../......../..........</div>
      </div>`).join('')}
    </section>`;
  }

  /** Render one A4 page. copy: 'original' | 'copy' | '' */
  function page(doc, copy = '') {
    const x = D.calc(doc);
    const copyLabel = copy === 'original' ? 'ต้นฉบับ / ORIGINAL' : copy === 'copy' ? 'สำเนา / COPY' : '';
    const ty = D.type(doc.type);
    const reason = doc.adjust && doc.adjust.reason ? (REASONS[doc.adjust.reason] || doc.adjust.reason) : '';
    let ref = '';
    if (ty.mode === 'adjust' && doc.source) {
      const src = D.get(doc.source);
      ref = `<div class="p-adjust">${L('อ้างอิงใบกำกับภาษีเลขที่', 'Original tax invoice')} <b>${esc(src ? src.no : doc.ref)}</b> ${src ? `ลงวันที่ ${date(src.date)}` : ''}
        ${reason ? `<br>${L('เหตุผล', 'Reason')} ${esc(reason)}${doc.adjust.reason_note ? ' — ' + esc(doc.adjust.reason_note) : ''}` : ''}</div>`;
    }
    return `<article class="paper">
      ${header(doc, copyLabel)}
      ${meta(doc)}
      ${ref}
      ${x.mode === 'refs' ? refsTable(doc, x) : itemsTable(doc, x)}
      <section class="p-sum">
        <div class="p-left">
          <div class="p-words">(${D.bahtText(x.wht ? x.net : x.grand)})</div>
          ${doc.notes ? `<div class="p-notes"><div class="p-box-title">${L('หมายเหตุ', 'Remarks')}</div>${esc(doc.notes).replace(/\n/g, '<br>')}</div>` : ''}
          ${paymentBox(doc, x)}
        </div>
        ${totals(doc, x)}
      </section>
      ${signatures(doc)}
      <footer class="p-foot">${doc.type === 'BN' ? 'กรุณาชำระเงินภายในวันที่ครบกำหนด · Please settle by the due date' : ty.tax && D.company().vat_registered ? 'เอกสารออกเป็นชุด · Issued as a set' : ''}</footer>
    </article>`;
  }

  /** Print the document. which: 'original' | 'copy' | 'both' */
  function print(doc, which = 'both') {
    const pages = which === 'both' ? [page(doc, 'original'), page(doc, 'copy')] : [page(doc, which)];
    let root = document.getElementById('printRoot');
    if (!root) { root = document.createElement('div'); root.id = 'printRoot'; document.body.appendChild(root); }
    root.innerHTML = pages.join('');
    document.body.classList.add('printing');
    const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    const prevTitle = document.title;
    document.title = doc.no || D.typeName(doc.type);
    setTimeout(() => { window.print(); document.title = prevTitle; }, 50);
  }

  D.page = page;
  D.print = print;
  D.REASONS = REASONS;
  D.PAY = PAY;
  D.fmt = { n2, date };
})(window.BI);
