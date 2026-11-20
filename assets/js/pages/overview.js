/* Executive overview — headline numbers from every department. */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages.overview = {
    title: 'nav.overview',
    range: true,
    crumb: 'app.company',
    render(view) {
      const fin = BI.store.get('finance_transactions');
      const deals = BI.store.get('sales_deals');
      const posts = BI.store.get('content_posts');
      const ads = BI.store.get('ad_campaigns');
      const emp = BI.store.get('employees');
      const customers = BI.store.get('customers');
      const p = U.period(fin);

      const inc = (rows) => U.sum(rows.filter((r) => r.type === 'Income'), 'amount');
      const exp = (rows) => U.sum(rows.filter((r) => r.type === 'Expense'), 'amount');
      const finCur = U.inRange(fin, 'date', p.start, p.end), finPrev = U.inRange(fin, 'date', p.prevStart, p.prevEnd);
      const wonCur = U.inRange(deals, 'close_date', p.start, p.end).filter((d) => d.stage === 'Won');
      const wonPrev = U.inRange(deals, 'close_date', p.prevStart, p.prevEnd).filter((d) => d.stage === 'Won');
      const adsCur = U.inRange(ads, 'date', p.start, p.end), adsPrev = U.inRange(ads, 'date', p.prevStart, p.prevEnd);
      const roas = (rows) => U.ratio(U.sum(rows, 'revenue'), U.sum(rows, 'spend'));
      const newCust = (a, b) => customers.filter((c) => a && c.created_date >= a && c.created_date <= b).length;
      const headcount = emp.filter((e) => e.status !== 'Resigned' && !e.exit_date).length;
      const pubCur = U.inRange(posts, 'date', p.start, p.end).filter((x) => x.status === 'Published');
      const net = (rows) => inc(rows) - exp(rows);
      const closed = U.inRange(deals, 'close_date', p.start, p.end).filter((d) => d.stage === 'Won' || d.stage === 'Lost');
      const exits = emp.filter((e) => e.exit_date && e.exit_date >= p.start && e.exit_date <= p.end).length;
      const overdue = U.sum(fin.filter((r) => r.type === 'Income' && r.status === 'Overdue'), 'amount');

      const kpis = ui.kpiRow([
        { label: t('kpi.revenue'), value: U.moneyCompact(inc(finCur)), delta: U.delta(inc(finCur), inc(finPrev)) },
        { label: t('kpi.netProfit'), value: U.moneyCompact(net(finCur)), delta: U.delta(net(finCur), net(finPrev)) },
        { label: t('kpi.dealsWon'), value: U.moneyCompact(U.sum(wonCur, 'value')), delta: U.delta(U.sum(wonCur, 'value'), U.sum(wonPrev, 'value')) },
        { label: t('kpi.newCustomers'), value: U.num(newCust(p.start, p.end)), delta: U.delta(newCust(p.start, p.end), newCust(p.prevStart, p.prevEnd)) },
        { label: t('kpi.roas'), value: U.num(roas(adsCur), 2) + '×', delta: U.delta(roas(adsCur), roas(adsPrev)) },
        { label: t('kpi.headcount'), value: U.num(headcount), hint: t('kpi.current') }
      ]);

      const dept = (route, titleKey, crumbKey, items) => `
        <a class="dept-card" href="#/${route}">
          <span class="dept-crumb">${crumbKey ? t(crumbKey) : '&nbsp;'}</span>
          <strong>${t(titleKey)}</strong>
          <dl>${items.map(([k, val]) => `<div><dt>${t(k)}</dt><dd>${val}</dd></div>`).join('')}</dl>
          <span class="dept-go">${t('ctrl.open')} ${ui.icon('chevron', 14)}</span>
        </a>`;

      const reach = U.sum(pubCur, 'reach');
      view.innerHTML = `
        ${ui.sampleNotice(Object.keys(BI.schemas))}
        ${kpis}
        <div class="grid">
          ${ui.chartCard('ovFinance', t('ch.incomeVsExpense'), t('ch.byMonth'), 2, 300)}
          <section class="card span-2">
            <header class="card-head"><div><h2>${t('ov.departments')}</h2><p>${t('ov.departmentsSub')}</p></div></header>
            <div class="dept-grid">
              ${dept('marketing/content', 'nav.content', 'nav.marketing', [['kpi.postsPublished', U.num(pubCur.length)], ['kpi.reach', U.compact(reach)]])}
              ${dept('marketing/strategy', 'nav.strategy', 'nav.marketing', [['kpi.adSpend', U.moneyCompact(U.sum(adsCur, 'spend'))], ['kpi.roas', U.num(roas(adsCur), 2) + '×']])}
              ${dept('sales', 'nav.sales', null, [['kpi.dealsWon', U.moneyCompact(U.sum(wonCur, 'value'))], ['kpi.winRate', U.pct(U.ratio(wonCur.length, closed.length))]])}
              ${dept('hr', 'nav.hr', null, [['kpi.headcount', U.num(headcount)], ['kpi.exits', U.num(exits)]])}
              ${dept('finance', 'nav.finance', null, [['kpi.netProfit', U.moneyCompact(net(finCur))], ['kpi.overdue', U.moneyCompact(overdue)]])}
            </div>
          </section>
        </div>`;

      BI.charts.bar('ovFinance', {
        labels: p.months,
        indexAxisFmt: U.fmtMonth,
        valueFmt: (v, axis) => (axis ? U.compact(v) : U.money(v)),
        series: [
          { label: t('kpi.revenue'), data: U.byMonth(finCur.filter((r) => r.type === 'Income'), p.months, 'date', 'amount') },
          { label: t('kpi.expenses'), data: U.byMonth(finCur.filter((r) => r.type === 'Expense'), p.months, 'date', 'amount') }
        ]
      });
    }
  };
})(window.BI);
