/* Customers (CRM core). Datasets: customers, sales_deals */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages.customers = {
    title: 'nav.customers',
    range: true,
    crumb: 'app.crm',
    render(view) {
      const customers = BI.store.get('customers');
      const deals = BI.store.get('sales_deals');
      const p = U.period(customers, 'created_date');

      const ltv = U.sumBy(deals.filter((d) => d.stage === 'Won'), 'company', 'value');
      const openVal = U.sumBy(deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost'), 'company', 'value');
      const rows = customers.map((c) => ({ ...c, ltv: ltv[c.company] || 0, open: openVal[c.company] || 0 }));
      const newCur = customers.filter((c) => c.created_date >= p.start && c.created_date <= p.end).length;
      const newPrev = p.prevStart ? customers.filter((c) => c.created_date >= p.prevStart && c.created_date <= p.prevEnd).length : null;
      const today = new Date();
      const staleCut = U.ymd(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60));
      const stale = rows.filter((c) => c.status === 'Active' && c.last_contact && c.last_contact < staleCut);

      view.innerHTML = `
        ${ui.sampleNotice(['customers'])}
        ${ui.kpiRow([
          { label: t('kpi.totalCustomers'), value: U.num(customers.length), hint: t('kpi.allTime') },
          { label: t('kpi.activeCustomers'), value: U.num(U.count(customers, (c) => c.status === 'Active')), hint: t('kpi.current') },
          { label: t('kpi.prospects'), value: U.num(U.count(customers, (c) => c.status === 'Prospect')), hint: t('kpi.current') },
          { label: t('kpi.newCustomers'), value: U.num(newCur), delta: newPrev === null ? null : U.delta(newCur, newPrev) },
          { label: t('kpi.needFollowUp'), value: U.num(stale.length), hint: t('kpi.noContact60') }
        ])}
        <div class="grid">
          ${ui.card({ title: t('cu.bySegment'), sub: t('cu.bySegmentSub'), body: ui.rankList(U.ranked(U.sumBy(rows, 'segment', 'ltv')), U.moneyCompact) })}
          ${ui.card({ title: t('cu.byOwner'), sub: t('cu.byOwnerSub'), body: ui.rankList(U.ranked(U.sumBy(customers, 'owner')), (v) => U.num(v), { labelFmt: (k) => k }) })}
          ${ui.card({
            title: t('cu.followUp'), sub: t('cu.followUpSub'), span: 2,
            body: ui.table({
              rows: stale, sortKey: 'last_contact', sortDir: 'asc', pageSize: 5,
              columns: [
                { key: 'company', label: t('col.company') },
                { key: 'contact_name', label: t('col.contact') },
                { key: 'owner', label: t('col.owner') },
                { key: 'last_contact', label: t('col.lastContact'), fmt: U.fmtDate },
                { key: 'ltv', label: t('col.ltv'), align: 'right', fmt: U.money }
              ]
            })
          })}
          ${ui.card({
            title: t('cu.directory'), sub: t('cu.directorySub'), span: 2,
            body: ui.table({
              rows, sortKey: 'ltv', search: true, pageSize: 12,
              columns: [
                { key: 'customer_id', label: t('col.id') },
                { key: 'company', label: t('col.company') },
                { key: 'contact_name', label: t('col.contact') },
                { key: 'phone', label: t('col.phone') },
                { key: 'segment', label: t('col.segment'), fmt: ui.v },
                { key: 'owner', label: t('col.owner') },
                { key: 'status', label: t('col.status'), fmt: ui.badge },
                { key: 'last_contact', label: t('col.lastContact'), fmt: U.fmtDate },
                { key: 'open', label: t('col.openDeals'), align: 'right', fmt: U.moneyCompact },
                { key: 'ltv', label: t('col.ltv'), align: 'right', fmt: U.money }
              ]
            })
          })}
        </div>`;
    }
  };
})(window.BI);
