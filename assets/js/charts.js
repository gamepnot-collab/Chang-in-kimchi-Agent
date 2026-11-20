/* ------------------------------------------------------------------
 * Chart helpers on top of Chart.js. Colours come from CSS custom
 * properties (--series-1 … --series-8) so light / dark themes stay in
 * one place (assets/css/style.css).
 * ------------------------------------------------------------------ */
(function (BI) {
  const instances = [];

  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const theme = () => ({
    text: css('--text-secondary'),
    muted: css('--text-muted'),
    grid: css('--grid'),
    surface: css('--surface-1'),
    tooltipBg: css('--tooltip-bg'),
    tooltipText: css('--tooltip-text'),
    font: css('--font-sans')
  });
  /** Series colours in fixed order — never cycle; >8 series should be folded into "Other". */
  const palette = () => [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css('--series-' + i));

  function base(type, { valueFmt, horizontal, stacked, legend, indexAxisFmt }) {
    const t = theme();
    const valueAxis = {
      beginAtZero: true,
      stacked: !!stacked,
      grid: { color: t.grid, drawTicks: false },
      border: { display: false },
      ticks: { color: t.muted, padding: 8, maxTicksLimit: 6, callback: (v) => (valueFmt ? valueFmt(v, true) : v) }
    };
    const catAxis = {
      stacked: !!stacked,
      grid: { display: false },
      border: { color: t.grid },
      ticks: {
        color: t.muted, padding: 6, autoSkip: true, maxRotation: 0,
        callback(v) { const l = this.getLabelForValue(v); return indexAxisFmt ? indexAxisFmt(l) : l; }
      }
    };
    return {
      type,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        interaction: { mode: 'index', intersect: false, axis: horizontal ? 'y' : 'x' },
        animation: { duration: 350 },
        layout: { padding: { top: 4, right: 8 } },
        scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
        plugins: {
          legend: {
            display: legend,
            position: 'top',
            align: 'start',
            reverse: false,
            labels: { sort: (a, b) => a.datasetIndex - b.datasetIndex, color: t.text, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 10, boxHeight: 10, padding: 14 }
          },
          tooltip: {
            backgroundColor: t.tooltipBg,
            titleColor: t.tooltipText,
            bodyColor: t.tooltipText,
            padding: 10,
            cornerRadius: 8,
            boxPadding: 4,
            usePointStyle: true,
            callbacks: {
              title: (items) => (items.length ? (indexAxisFmt ? indexAxisFmt(items[0].label) : items[0].label) : ''),
              label: (c) => ` ${c.dataset.label ? c.dataset.label + ': ' : ''}${valueFmt ? valueFmt(c.parsed[horizontal ? 'x' : 'y']) : c.formattedValue}`
            }
          }
        }
      }
    };
  }

  function mount(canvas, config) {
    if (typeof canvas === 'string') canvas = document.getElementById(canvas);
    if (!canvas) return null;
    if (!window.Chart) {
      canvas.parentElement.innerHTML = `<p class="empty">${BI.t('msg.chartMissing')}</p>`;
      return null;
    }
    Chart.defaults.font.family = theme().font;
    Chart.defaults.font.size = 12;
    const chart = new Chart(canvas, config);
    instances.push(chart);
    return chart;
  }

  /**
   * Bar chart.
   * opts: { labels, series:[{label, data, color?, line?:true, dashed?:true}], horizontal, stacked, valueFmt, indexAxisFmt }
   * A series with `line:true` renders as a line over the bars (e.g. a target).
   */
  function bar(canvas, opts) {
    const colors = palette();
    const t = theme();
    const bars = opts.series.filter((s) => !s.line);
    const cfg = base('bar', { ...opts, legend: opts.series.length > 1 });
    cfg.data = {
      labels: opts.labels,
      datasets: opts.series.map((s, i) => {
        const color = s.color || colors[i % colors.length];
        if (s.line) {
          return {
            type: 'line', label: s.label, data: s.data, borderColor: color, backgroundColor: color,
            borderWidth: 2, borderDash: s.dashed ? [6, 4] : [], pointRadius: 0, pointHoverRadius: 5, tension: 0, order: 0
          };
        }
        const isTop = !opts.stacked || s === bars[bars.length - 1];
        return {
          label: s.label, data: s.data, backgroundColor: color, hoverBackgroundColor: color,
          borderColor: t.surface, borderWidth: opts.stacked ? { top: 2 } : 0,
          borderRadius: isTop ? 4 : 0, borderSkipped: 'start',
          maxBarThickness: 36, categoryPercentage: 0.72, barPercentage: 0.9, order: 1
        };
      })
    };
    return mount(canvas, cfg);
  }

  /** Line chart. opts: { labels, series:[{label, data, color?, fill?}], valueFmt, indexAxisFmt } */
  function line(canvas, opts) {
    const colors = palette();
    const cfg = base('line', { ...opts, legend: opts.series.length > 1 });
    cfg.data = {
      labels: opts.labels,
      datasets: opts.series.map((s, i) => {
        const color = s.color || colors[i % colors.length];
        return {
          label: s.label, data: s.data, borderColor: color, backgroundColor: color + '22', fill: !!s.fill,
          borderWidth: 2, borderDash: s.dashed ? [6, 4] : [], tension: 0.25,
          pointRadius: 0, pointHoverRadius: 5, pointHoverBorderWidth: 2, pointHoverBorderColor: theme().surface
        };
      })
    };
    return mount(canvas, cfg);
  }

  function destroyAll() {
    while (instances.length) instances.pop().destroy();
  }

  BI.charts = { bar, line, destroyAll, palette };
})(window.BI);
