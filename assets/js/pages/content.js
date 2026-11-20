/* Marketing › Content Creator department. Dataset: content_posts */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages['marketing/content'] = {
    title: 'nav.content',
    crumb: 'nav.marketing',
    render(view) {
      const posts = BI.store.get('content_posts');
      const p = U.period(posts);
      const pub = (rows) => rows.filter((r) => r.status === 'Published');
      const cur = pub(U.inRange(posts, 'date', p.start, p.end));
      const prev = pub(U.inRange(posts, 'date', p.prevStart, p.prevEnd));
      const er = (rows) => U.ratio(U.sum(rows, 'engagements'), U.sum(rows, 'reach'));
      const avgEng = (rows) => U.ratio(U.sum(rows, 'engagements'), rows.length);
      const today = U.ymd(new Date());
      const upcoming = posts.filter((r) => r.date >= today && r.status !== 'Published').sort((a, b) => a.date.localeCompare(b.date));

      const platforms = U.ranked(U.sumBy(cur, 'platform', 'reach')).map((e) => e[0]);
      const creatorReach = U.ranked(U.sumBy(cur, 'creator', 'reach'));
      const creatorPosts = U.sumBy(cur, 'creator');
      const erByPlatform = platforms.map((pl) => er(cur.filter((r) => r.platform === pl)));

      view.innerHTML = `
        ${ui.sampleNotice(['content_posts'])}
        ${ui.kpiRow([
          { label: t('kpi.postsPublished'), value: U.num(cur.length), delta: U.delta(cur.length, prev.length) },
          { label: t('kpi.reach'), value: U.compact(U.sum(cur, 'reach')), delta: U.delta(U.sum(cur, 'reach'), U.sum(prev, 'reach')) },
          { label: t('kpi.engagements'), value: U.compact(U.sum(cur, 'engagements')), delta: U.delta(U.sum(cur, 'engagements'), U.sum(prev, 'engagements')) },
          { label: t('kpi.engagementRate'), value: U.pct(er(cur), 2), delta: U.delta(er(cur), er(prev)) },
          { label: t('kpi.avgEngPerPost'), value: U.num(avgEng(cur)), delta: U.delta(avgEng(cur), avgEng(prev)) },
          { label: t('kpi.upcoming'), value: U.num(upcoming.length), hint: t('kpi.scheduledDraft') }
        ])}
        <div class="grid">
          ${ui.chartCard('ctReach', t('ch.reachByPlatform'), t('ch.byMonthStacked'), 2, 300)}
          ${ui.chartCard('ctEr', t('ch.erByPlatform'), t('ch.erSub'), 1, 260)}
          ${ui.card({
            title: t('ch.creatorPerformance'), sub: t('ch.creatorSub'),
            body: ui.rankList(creatorReach, (v) => U.compact(v), { labelFmt: (k) => `${k} · ${U.num(creatorPosts[k] || 0)} ${t('unit.posts')}` })
          })}
          ${ui.card({
            title: t('ct.upcoming'), sub: t('ct.upcomingSub'), span: 2,
            body: ui.table({
              rows: upcoming, sortKey: 'date', sortDir: 'asc', pageSize: 6,
              columns: [
                { key: 'date', label: t('col.date'), fmt: U.fmtDate },
                { key: 'title', label: t('col.title') },
                { key: 'platform', label: t('col.platform') },
                { key: 'content_type', label: t('col.contentType'), fmt: ui.v },
                { key: 'creator', label: t('col.creator') },
                { key: 'status', label: t('col.status'), fmt: ui.badge }
              ]
            })
          })}
          ${ui.card({
            title: t('ct.topPosts'), sub: t('ct.topPostsSub'), span: 2,
            body: ui.table({
              rows: cur.map((r) => ({ ...r, er: U.ratio(r.engagements, r.reach) })), sortKey: 'engagements', search: true,
              columns: [
                { key: 'date', label: t('col.date'), fmt: U.fmtDate },
                { key: 'title', label: t('col.title') },
                { key: 'platform', label: t('col.platform') },
                { key: 'creator', label: t('col.creator') },
                { key: 'reach', label: t('kpi.reach'), align: 'right', fmt: (v) => U.num(v) },
                { key: 'engagements', label: t('kpi.engagements'), align: 'right', fmt: (v) => U.num(v) },
                { key: 'er', label: t('kpi.engagementRate'), align: 'right', fmt: (v) => U.pct(v, 2) }
              ]
            })
          })}
        </div>`;

      BI.charts.bar('ctReach', {
        labels: p.months, stacked: true, indexAxisFmt: U.fmtMonth,
        valueFmt: (v) => U.compact(v),
        series: platforms.map((pl) => ({ label: pl, data: U.byMonth(cur.filter((r) => r.platform === pl), p.months, 'date', 'reach') }))
      });
      BI.charts.bar('ctEr', {
        labels: platforms, horizontal: true,
        valueFmt: (v) => U.pct(v, 2),
        series: [{ label: t('kpi.engagementRate'), data: erByPlatform }]
      });
    }
  };
})(window.BI);
