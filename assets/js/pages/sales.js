/* Sales department. Datasets: sales_deals, sales_targets */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;
  const OPEN_STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation'];

  BI.pages = BI.pages || {};
  BI.pages.sales = {
    title: 'nav.sales',
    range: true,
    crumb: 'app.department',
    render(view) {
      const deals = BI.store.get('sales_deals');
      const targets = BI.store.get('sales_targets');
      const p = U.period(deals);

      const closedIn = (a, b) => U.inRange(deals, 'close_date', a, b).filter((d) => d.stage === 'Won' || d.stage === 'Lost');
      const wonIn = (a, b) => closedIn(a, b).filter((d) => d.stage === 'Won');
      const cur = wonIn(p.start, p.end), prev = wonIn(p.prevStart, p.prevEnd);
      const winRate = (a, b) => U.ratio(wonIn(a, b).length, closedIn(a, b).length);
      const created = U.inRange(deals, 'date', p.start, p.end);
      const createdPrev = U.inRange(deals, 'date', p.prevStart, p.prevEnd);
      const open = deals.filter((d) => OPEN_STAGES.includes(d.stage));
      const avg = (rows) => U.ratio(U.sum(rows, 'value'), rows.length);

      const targetMap = U.sumBy(targets, 'month', 'target');
      const targetSeries = p.months.map((m) => targetMap[m] || null);
      const totalTarget = U.sum(p.months.map((m) => targetMap[m] || 0), (x) => x);
      const pipeline = OPEN_STAGES.map((s) => U.sum(open.filter((d) => d.stage === s), 'value'));
      const repRevenue = U.ranked(U.sumBy(cur, 'sales_rep', 'value'));
      const sources = U.ranked(U.sumBy(created, 'source'));

      view.innerHTML = `
        ${ui.sampleNotice(['sales_deals', 'sales_targets'])}
        ${ui.kpiRow([
          { label: t('kpi.dealsWon'), value: U.moneyCompact(U.sum(cur, 'value')), delta: U.delta(U.sum(cur, 'value'), U.sum(prev, 'value')) },
          { label: t('kpi.targetAchieved'), value: totalTarget ? U.pct(U.ratio(U.sum(cur, 'value'), totalTarget)) : '–', hint: totalTarget ? `${t('kpi.target')} ${U.moneyCompact(totalTarget)}` : t('msg.noTarget') },
          { label: t('kpi.winRate'), value: U.pct(winRate(p.start, p.end)), delta: U.delta(winRate(p.start, p.end), winRate(p.prevStart, p.prevEnd)) },
          { label: t('kpi.avgDeal'), value: U.moneyCompact(avg(cur)), delta: U.delta(avg(cur), avg(prev)) },
          { label: t('kpi.newDeals'), value: U.num(created.length), delta: U.delta(created.length, createdPrev.length) },
          { label: t('kpi.openPipeline'), value: U.moneyCompact(U.sum(open, 'value')), hint: `${U.num(open.length)} ${t('unit.deals')}` }
        ])}
        <div class="grid">
          ${ui.chartCard('slWon', t('ch.wonVsTarget'), t('ch.byMonth'), 2, 300)}
          ${ui.chartCard('slPipe', t('ch.pipelineByStage'), t('ch.pipelineSub'), 1, 260)}
          ${ui.card({ title: t('ch.revenueByRep'), sub: t('ch.revenueByRepSub'), body: ui.rankList(repRevenue, U.moneyCompact, { labelFmt: (k) => k }) })}
          ${ui.chartCard('slSource', t('ch.dealsBySource'), t('ch.dealsBySourceSub'), 1, 260)}
          ${ui.card({
            title: t('sl.openDeals'), sub: t('sl.openDealsSub'),
            body: ui.table({
              rows: open, sortKey: 'value', pageSize: 6,
              columns: [
                { key: 'company', label: t('col.company') },
                { key: 'stage', label: t('col.stage'), fmt: ui.badge },
                { key: 'value', label: t('col.value'), align: 'right', fmt: U.moneyCompact }
              ]
            })
          })}
          ${ui.card({
            title: t('sl.allDeals'), sub: t('sl.allDealsSub'), span: 2,
            body: ui.table({
              rows: created, sortKey: 'date', search: true,
              columns: [
                { key: 'deal_id', label: t('col.id') },
                { key: 'date', label: t('col.created'), fmt: U.fmtDate },
                { key: 'company', label: t('col.company') },
                { key: 'sales_rep', label: t('col.rep') },
                { key: 'source', label: t('col.source'), fmt: ui.v },
                { key: 'stage', label: t('col.stage'), fmt: ui.badge },
                { key: 'value', label: t('col.value'), align: 'right', fmt: U.money }
              ]
            })
          })}
        </div>`;

      BI.charts.bar('slWon', {
        labels: p.months, indexAxisFmt: U.fmtMonth,
        valueFmt: (v, axis) => (axis ? U.compact(v) : U.money(v)),
        series: [
          { label: t('kpi.dealsWon'), data: U.byMonth(cur, p.months, 'close_date', 'value') },
          { label: t('kpi.target'), data: targetSeries, line: true, dashed: true, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() }
        ]
      });
      BI.charts.bar('slPipe', {
        labels: OPEN_STAGES.map(ui.v),
        valueFmt: (v, axis) => (axis ? U.compact(v) : U.money(v)),
        series: [{ label: t('col.value'), data: pipeline }]
      });
      BI.charts.bar('slSource', {
        labels: sources.map((e) => ui.v(e[0])), horizontal: true,
        valueFmt: (v) => U.num(v),
        series: [{ label: t('unit.deals'), data: sources.map((e) => e[1]) }]
      });
    }
  };
})(window.BI);
