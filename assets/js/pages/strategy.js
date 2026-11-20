/* Marketing › Online Strategy Marketing. Dataset: ad_campaigns */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages['marketing/strategy'] = {
    title: 'nav.strategy',
    range: true,
    crumb: 'nav.marketing',
    render(view) {
      const ads = BI.store.get('ad_campaigns');
      const p = U.period(ads);
      const cur = U.inRange(ads, 'date', p.start, p.end);
      const prev = U.inRange(ads, 'date', p.prevStart, p.prevEnd);
      const s = (rows, k) => U.sum(rows, k);
      const roas = (r) => U.ratio(s(r, 'revenue'), s(r, 'spend'));
      const cpa = (r) => U.ratio(s(r, 'spend'), s(r, 'conversions'));
      const ctr = (r) => U.ratio(s(r, 'clicks'), s(r, 'impressions'));

      const channels = U.ranked(U.sumBy(cur, 'channel', 'spend')).map((e) => e[0]);

      // campaign table: aggregate by channel + campaign
      const agg = {};
      cur.forEach((r) => {
        const k = r.channel + '||' + r.campaign;
        const a = (agg[k] = agg[k] || { channel: r.channel, campaign: r.campaign, spend: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0 });
        ['spend', 'impressions', 'clicks', 'leads', 'conversions', 'revenue'].forEach((c) => (a[c] += r[c]));
      });
      const campaigns = Object.values(agg).map((a) => ({ ...a, roas: U.ratio(a.revenue, a.spend), cpa: U.ratio(a.spend, a.conversions), ctr: U.ratio(a.clicks, a.impressions) }));

      const stages = [
        ['kpi.impressions', s(cur, 'impressions')],
        ['kpi.clicks', s(cur, 'clicks')],
        ['kpi.leads', s(cur, 'leads')],
        ['kpi.conversions', s(cur, 'conversions')]
      ];
      const funnel = `<ol class="funnel">${stages.map(([k, val], i) => `
        <li>
          <span class="funnel-label">${t(k)}</span>
          <strong>${U.compact(val)}</strong>
          ${i ? `<span class="funnel-rate">${U.pct(U.ratio(val, stages[i - 1][1]), 2)} ${t('st.fromPrev')}</span>` : '<span class="funnel-rate">&nbsp;</span>'}
          <span class="funnel-bar"><i style="width:${Math.max(2, Math.sqrt(U.ratio(val, stages[0][1])) * 100)}%"></i></span>
        </li>`).join('')}</ol>
        <p class="footnote">${t('st.funnelNote')}</p>`;

      view.innerHTML = `
        ${ui.sampleNotice(['ad_campaigns'])}
        ${ui.kpiRow([
          { label: t('kpi.adSpend'), value: U.moneyCompact(s(cur, 'spend')), delta: U.delta(s(cur, 'spend'), s(prev, 'spend')), goodWhen: 'down' },
          { label: t('kpi.adRevenue'), value: U.moneyCompact(s(cur, 'revenue')), delta: U.delta(s(cur, 'revenue'), s(prev, 'revenue')) },
          { label: t('kpi.roas'), value: U.num(roas(cur), 2) + '×', delta: U.delta(roas(cur), roas(prev)) },
          { label: t('kpi.cpa'), value: U.money(cpa(cur)), delta: U.delta(cpa(cur), cpa(prev)), goodWhen: 'down' },
          { label: t('kpi.ctr'), value: U.pct(ctr(cur), 2), delta: U.delta(ctr(cur), ctr(prev)) },
          { label: t('kpi.leads'), value: U.num(s(cur, 'leads')), delta: U.delta(s(cur, 'leads'), s(prev, 'leads')) }
        ])}
        <div class="grid">
          ${ui.chartCard('stSpendRev', t('ch.spendVsRevenue'), t('ch.byMonth'), 2, 300)}
          ${ui.chartCard('stRoas', t('ch.roasByChannel'), t('ch.roasSub'), 1, 240)}
          ${ui.card({ title: t('st.funnel'), sub: t('st.funnelSub'), body: funnel })}
          ${ui.card({
            title: t('st.campaigns'), sub: t('st.campaignsSub'), span: 2,
            body: ui.table({
              rows: campaigns, sortKey: 'roas', search: true,
              columns: [
                { key: 'channel', label: t('col.channel') },
                { key: 'campaign', label: t('col.campaign') },
                { key: 'spend', label: t('kpi.adSpend'), align: 'right', fmt: U.money },
                { key: 'revenue', label: t('kpi.adRevenue'), align: 'right', fmt: U.money },
                { key: 'roas', label: t('kpi.roas'), align: 'right', fmt: (v) => U.num(v, 2) + '×' },
                { key: 'ctr', label: t('kpi.ctr'), align: 'right', fmt: (v) => U.pct(v, 2) },
                { key: 'leads', label: t('kpi.leads'), align: 'right', fmt: (v) => U.num(v) },
                { key: 'cpa', label: t('kpi.cpa'), align: 'right', fmt: U.money }
              ]
            })
          })}
        </div>`;

      BI.charts.bar('stSpendRev', {
        labels: p.months, indexAxisFmt: U.fmtMonth,
        valueFmt: (v, axis) => (axis ? U.compact(v) : U.money(v)),
        series: [
          { label: t('kpi.adSpend'), data: U.byMonth(cur, p.months, 'date', 'spend') },
          { label: t('kpi.adRevenue'), data: U.byMonth(cur, p.months, 'date', 'revenue') }
        ]
      });
      BI.charts.bar('stRoas', {
        labels: channels, horizontal: true,
        valueFmt: (v) => U.num(v, 2) + '×',
        series: [{ label: t('kpi.roas'), data: channels.map((c) => roas(cur.filter((r) => r.channel === c))) }]
      });
    }
  };
})(window.BI);
