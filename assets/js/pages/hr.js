/* HR department. Dataset: employees */
(function (BI) {
  const U = BI.util, ui = BI.ui, t = BI.t;

  BI.pages = BI.pages || {};
  BI.pages.hr = {
    title: 'nav.hr',
    crumb: 'app.department',
    render(view) {
      const emp = BI.store.get('employees');
      const p = U.period(emp, 'hire_date');
      const today = new Date();
      const activeOn = (day) => emp.filter((e) => e.hire_date && e.hire_date <= day && (!e.exit_date || e.exit_date > day));
      const active = activeOn(U.ymd(today));
      const hires = (a, b) => (a ? emp.filter((e) => e.hire_date >= a && e.hire_date <= b) : []);
      const exits = (a, b) => (a ? emp.filter((e) => e.exit_date && e.exit_date >= a && e.exit_date <= b) : []);
      const turnover = (a, b) => {
        if (!a) return 0;
        const avgHc = (activeOn(a).length + activeOn(b).length) / 2;
        return U.ratio(exits(a, b).length, avgHc);
      };
      const tenureYears = active.length
        ? U.sum(active, (e) => (today - U.parseDate(e.hire_date)) / (365.25 * 864e5)) / active.length
        : 0;

      const depts = U.ranked(U.sumBy(active, 'department')).map((e) => e[0]);
      const hc = depts.map((d) => active.filter((e) => e.department === d).length);
      const leaveAvg = depts.map((d) => {
        const rows = active.filter((e) => e.department === d);
        return U.ratio(U.sum(rows, 'leave_days_used'), rows.length);
      });
      const curHires = hires(p.start, p.end), curExits = exits(p.start, p.end);
      const payroll = U.sum(active, 'salary');

      view.innerHTML = `
        ${ui.sampleNotice(['employees'])}
        ${ui.kpiRow([
          { label: t('kpi.headcount'), value: U.num(active.length), hint: t('kpi.current') },
          { label: t('kpi.newHires'), value: U.num(curHires.length), delta: p.prevStart ? U.delta(curHires.length, hires(p.prevStart, p.prevEnd).length) : null },
          { label: t('kpi.exits'), value: U.num(curExits.length), delta: p.prevStart ? U.delta(curExits.length, exits(p.prevStart, p.prevEnd).length) : null, goodWhen: 'down' },
          { label: t('kpi.turnover'), value: U.pct(turnover(p.start === '0000-01-01' ? null : p.start, p.end)), hint: t('kpi.inPeriod') },
          { label: t('kpi.avgTenure'), value: U.num(tenureYears, 1) + ' ' + t('unit.years'), hint: t('kpi.current') },
          { label: t('kpi.payroll'), value: U.moneyCompact(payroll), hint: t('kpi.perMonth') }
        ])}
        <div class="grid">
          ${ui.chartCard('hrMove', t('ch.hiresVsExits'), t('ch.byMonth'), 2, 280)}
          ${ui.chartCard('hrDept', t('ch.headcountByDept'), t('kpi.current'), 1, 260)}
          ${ui.chartCard('hrLeave', t('ch.leaveByDept'), t('ch.leaveSub'), 1, 260)}
          ${ui.card({
            title: t('hr.directory'), sub: t('hr.directorySub'), span: 2,
            body: ui.table({
              rows: emp, sortKey: 'hire_date', search: true, pageSize: 12,
              columns: [
                { key: 'employee_id', label: t('col.id') },
                { key: 'name', label: t('col.name') },
                { key: 'department', label: t('col.department'), fmt: ui.v },
                { key: 'position', label: t('col.position') },
                { key: 'hire_date', label: t('col.hireDate'), fmt: U.fmtDate },
                { key: 'status', label: t('col.status'), fmt: ui.badge },
                { key: 'leave_days_used', label: t('col.leaveUsed'), align: 'right', fmt: (v) => U.num(v) }
              ]
            })
          })}
        </div>`;

      BI.charts.bar('hrMove', {
        labels: p.months, indexAxisFmt: U.fmtMonth, valueFmt: (v) => U.num(v),
        series: [
          { label: t('kpi.newHires'), data: U.byMonth(curHires, p.months, 'hire_date') },
          { label: t('kpi.exits'), data: U.byMonth(curExits, p.months, 'exit_date') }
        ]
      });
      BI.charts.bar('hrDept', {
        labels: depts.map(ui.v), horizontal: true, valueFmt: (v) => U.num(v),
        series: [{ label: t('kpi.headcount'), data: hc }]
      });
      BI.charts.bar('hrLeave', {
        labels: depts.map(ui.v), horizontal: true, valueFmt: (v) => U.num(v, 1) + ' ' + t('unit.days'),
        series: [{ label: t('ch.leaveByDept'), data: leaveAvg }]
      });
    }
  };
})(window.BI);
