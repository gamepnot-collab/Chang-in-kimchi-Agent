/* Finance & Accounting. Datasets: finance_transactions, budgets */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages.finance = {
    title: 'nav.finance',
    crumb: 'app.department',
    render(view) {
      const fin = BI.store.get('finance_transactions');
      const budgets = BI.store.get('budgets');
      const p = U.period(fin);
      const cur = U.inRange(fin, 'date', p.start, p.end), prev = U.inRange(fin, 'date', p.prevStart, p.prevEnd);
      const inc = (r) => U.sum(r.filter((x) => x.type === 'Income'), 'amount');
      const exp = (r) => U.sum(r.filter((x) => x.type === 'Expense'), 'amount');
      const net = (r) => inc(r) - exp(r);
      const margin = (r) => U.ratio(net(r), inc(r));
      const receivables = fin.filter((x) => x.type === 'Income' && (x.status === 'Pending' || x.status === 'Overdue'));
      const payables = fin.filter((x) => x.type === 'Expense' && (x.status === 'Pending' || x.status === 'Overdue'));
      const overdue = receivables.filter((x) => x.status === 'Overdue');

      const incM = U.byMonth(cur.filter((x) => x.type === 'Income'), p.months, 'date', 'amount');
      const expM = U.byMonth(cur.filter((x) => x.type === 'Expense'), p.months, 'date', 'amount');
      const netM = incM.map((v, i) => v - expM[i]);
      const cats = U.ranked(U.sumBy(cur.filter((x) => x.type === 'Expense'), 'category', 'amount'));

      // Budget vs actual for the current year (year-to-date)
      const year = String(new Date().getFullYear());
      const ytd = fin.filter((x) => x.type === 'Expense' && x.date.startsWith(year));
      const spent = U.sumBy(ytd, 'department', 'amount');
      const budget = U.sumBy(budgets.filter((b) => String(b.year) === year), 'department', 'budget');
      const bDepts = [...new Set([...Object.keys(budget), ...Object.keys(spent)])].sort((a, b) => (budget[b] || 0) - (budget[a] || 0));

      view.innerHTML = `
        ${ui.sampleNotice(['finance_transactions', 'budgets'])}
        ${ui.kpiRow([
          { label: t('kpi.revenue'), value: U.moneyCompact(inc(cur)), delta: U.delta(inc(cur), inc(prev)) },
          { label: t('kpi.expenses'), value: U.moneyCompact(exp(cur)), delta: U.delta(exp(cur), exp(prev)), goodWhen: 'down' },
          { label: t('kpi.netProfit'), value: U.moneyCompact(net(cur)), delta: U.delta(net(cur), net(prev)) },
          { label: t('kpi.netMargin'), value: U.pct(margin(cur)), delta: U.delta(margin(cur), margin(prev)) },
          { label: t('kpi.receivables'), value: U.moneyCompact(U.sum(receivables, 'amount')), hint: `${U.num(receivables.length)} ${t('unit.docs')}` },
          { label: t('kpi.overdue'), value: U.moneyCompact(U.sum(overdue, 'amount')), hint: `${U.num(overdue.length)} ${t('unit.docs')}` }
        ])}
        <div class="grid">
          ${ui.chartCard('fnPL', t('ch.incomeVsExpense'), t('ch.plSub'), 2, 300)}
          ${ui.chartCard('fnCat', t('ch.expenseByCategory'), t('ch.inPeriod'), 1, 300)}
          ${ui.chartCard('fnBudget', t('ch.budgetVsActual'), t('ch.budgetSub').replace('{year}', year), 1, 300)}
          ${ui.card({
            title: t('fn.receivables'), sub: t('fn.receivablesSub'), span: 2,
            body: ui.table({
              rows: receivables, sortKey: 'date', sortDir: 'asc', pageSize: 8, search: true,
              columns: [
                { key: 'doc_no', label: t('col.doc') },
                { key: 'date', label: t('col.date'), fmt: U.fmtDate },
                { key: 'party', label: t('col.customer') },
                { key: 'category', label: t('col.category'), fmt: ui.v },
                { key: 'status', label: t('col.status'), fmt: ui.badge },
                { key: 'amount', label: t('col.amount'), align: 'right', fmt: U.money }
              ]
            })
          })}
          ${ui.card({
            title: t('fn.payables'), sub: t('fn.payablesSub'), span: 2,
            body: ui.table({
              rows: payables, sortKey: 'amount', pageSize: 6,
              columns: [
                { key: 'doc_no', label: t('col.doc') },
                { key: 'date', label: t('col.date'), fmt: U.fmtDate },
                { key: 'party', label: t('col.vendor') },
                { key: 'category', label: t('col.category'), fmt: ui.v },
                { key: 'department', label: t('col.department'), fmt: ui.v },
                { key: 'amount', label: t('col.amount'), align: 'right', fmt: U.money }
              ]
            })
          })}
        </div>`;

      const money = (v, axis) => (axis ? U.compact(v) : U.money(v));
      BI.charts.bar('fnPL', {
        labels: p.months, indexAxisFmt: U.fmtMonth, valueFmt: money,
        series: [
          { label: t('kpi.revenue'), data: incM },
          { label: t('kpi.expenses'), data: expM },
          { label: t('kpi.netProfit'), data: netM, line: true, color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() }
        ]
      });
      BI.charts.bar('fnCat', {
        labels: cats.map((e) => ui.v(e[0])), horizontal: true, valueFmt: money,
        series: [{ label: t('kpi.expenses'), data: cats.map((e) => e[1]) }]
      });
      BI.charts.bar('fnBudget', {
        labels: bDepts.map(ui.v), horizontal: true, valueFmt: money,
        series: [
          { label: t('kpi.budget'), data: bDepts.map((d) => budget[d] || 0) },
          { label: t('kpi.spentYtd'), data: bDepts.map((d) => spent[d] || 0) }
        ]
      });
    }
  };
})(window.BI);
