/* ------------------------------------------------------------------
 * Sample data so every dashboard works before real data is connected.
 * Generated deterministically relative to today's date (last 24 months).
 * Replace any dataset from the "Data sources" page.
 * ------------------------------------------------------------------ */
(function (BI) {
  const U = BI.util;

  function generate() {
    const r = U.rng(20261120);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const between = (a, b) => a + r() * (b - a);
    const int = (a, b) => Math.round(between(a, b));
    const today = new Date();
    const todayStr = U.ymd(today);
    const MONTHS = 24;
    const months = [];
    for (let i = MONTHS - 1; i >= 0; i--) months.push(U.addMonths(today, -i));
    const dayIn = (m, maxDay) => {
      const last = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      return U.ymd(new Date(m.getFullYear(), m.getMonth(), int(1, Math.min(last, maxDay || last))));
    };
    // growth factor: ~ +35% over the two years with seasonality peaking in Nov/Dec
    const growth = (m, i) => (1 + i * 0.015) * (1 + 0.18 * Math.max(0, Math.cos(((m.getMonth() - 11) / 12) * 2 * Math.PI)));

    /* ---------- customers ---------- */
    const prefixes = ['Siam', 'Bangkok', 'Seoul', 'Chiang Mai', 'Busan', 'Phuket', 'Korat', 'Gangnam', 'Lanna', 'Hana', 'Sukhumvit', 'Jeju'];
    const suffixes = ['Fresh Mart', 'Kitchen Co.', 'Foods', 'Trading', 'Restaurant Group', 'Retail', 'Catering', 'Supermarket', 'Distribution', 'Café'];
    const contacts = ['Somsak P.', 'Ploy K.', 'Kim Ji-woo', 'Narin S.', 'Park Min-ji', 'Anong T.', 'Lee Seo-yeon', 'Wichai R.', 'Choi Hyun', 'Malee C.', 'Arisa N.', 'Jung Da-eun'];
    const reps = ['Somchai', 'Nattaya', 'Min-jun', 'Arthit', 'Kanya'];
    const seen = new Set();
    const customers = [];
    while (customers.length < 64) {
      const company = `${pick(prefixes)} ${pick(suffixes)}`;
      if (seen.has(company)) continue;
      seen.add(company);
      const n = customers.length + 1;
      const created = dayIn(months[int(0, MONTHS - 1)]);
      customers.push({
        customer_id: 'C' + String(n).padStart(4, '0'),
        company,
        contact_name: pick(contacts),
        email: `contact${n}@example.com`,
        phone: `0${int(80, 99)}-${int(100, 999)}-${int(1000, 9999)}`,
        segment: pick(['Enterprise', 'SME', 'SME', 'Retail', 'Retail']),
        owner: pick(reps),
        status: pick(['Active', 'Active', 'Active', 'Prospect', 'Inactive']),
        created_date: created,
        last_contact: created
      });
    }

    /* ---------- sales deals & targets ---------- */
    const sales_deals = [];
    const sales_targets = [];
    let dealNo = 1;
    months.forEach((m, i) => {
      const g = growth(m, i);
      const n = Math.round(int(22, 30) * g);
      for (let k = 0; k < n; k++) {
        const date = dayIn(m, m.getMonth() === today.getMonth() && m.getFullYear() === today.getFullYear() ? today.getDate() : 0);
        const cust = pick(customers);
        const age = MONTHS - 1 - i; // months ago
        let stage;
        const x = r();
        if (age >= 3) stage = x < 0.38 ? 'Won' : x < 0.72 ? 'Lost' : x < 0.85 ? 'Won' : 'Lost';
        else if (age >= 1) stage = x < 0.25 ? 'Won' : x < 0.4 ? 'Lost' : x < 0.6 ? 'Negotiation' : x < 0.8 ? 'Proposal' : 'Qualified';
        else stage = x < 0.08 ? 'Won' : x < 0.3 ? 'Qualified' : x < 0.55 ? 'Lead' : x < 0.8 ? 'Proposal' : 'Negotiation';
        const value = Math.round(between(25, 420) * (cust.segment === 'Enterprise' ? 2.2 : cust.segment === 'SME' ? 1 : 0.55)) * 1000;
        const closed = stage === 'Won' || stage === 'Lost';
        let close = '';
        if (closed) {
          const c = U.parseDate(date);
          c.setDate(c.getDate() + int(7, 45));
          close = U.ymd(c) > todayStr ? todayStr : U.ymd(c);
          if (close > cust.last_contact) cust.last_contact = close;
        }
        if (date > cust.last_contact) cust.last_contact = date;
        sales_deals.push({
          deal_id: 'D' + String(dealNo++).padStart(5, '0'),
          date,
          company: cust.company,
          sales_rep: cust.owner,
          source: pick(['Online Ads', 'Online Ads', 'Referral', 'Social Media', 'Event', 'Walk-in']),
          stage,
          value,
          close_date: close
        });
      }
      sales_targets.push({ month: U.ymd(m).slice(0, 7), target: Math.round((4.2e6 * g) / 1e4) * 1e4 });
    });

    /* ---------- content posts ---------- */
    const platforms = { Facebook: [9000, 0.035], Instagram: [7000, 0.055], TikTok: [16000, 0.075], YouTube: [5000, 0.045], LINE: [4000, 0.025] };
    const creators = ['Mint', 'Ploy', 'Ken', 'Jisoo', 'Beam'];
    const topics = ['Kimchi recipe', 'Behind the kitchen', 'Promo of the week', 'Customer review', 'Korean street food', 'How we ferment', 'New menu launch', 'Live Q&A', 'Office vlog', 'Healthy bowl'];
    const content_posts = [];
    let postNo = 1;
    months.forEach((m, i) => {
      const g = growth(m, i);
      const isCurrent = m.getMonth() === today.getMonth() && m.getFullYear() === today.getFullYear();
      const n = int(34, 44);
      for (let k = 0; k < n; k++) {
        const platform = pick(Object.keys(platforms));
        const [base, er] = platforms[platform];
        let date = dayIn(m);
        let status = 'Published';
        if (isCurrent && date > todayStr) status = 'Scheduled';
        const reach = status === 'Published' ? Math.round(base * g * between(0.4, 2.2)) : 0;
        content_posts.push({
          post_id: 'P' + String(postNo++).padStart(5, '0'),
          date,
          platform,
          creator: pick(creators),
          content_type: pick(platform === 'TikTok' || platform === 'YouTube' ? ['Video', 'Video', 'Live'] : ['Image', 'Video', 'Carousel', 'Article']),
          title: pick(topics),
          reach,
          engagements: Math.round(reach * er * between(0.6, 1.5)),
          status
        });
      }
    });
    // a few upcoming / draft posts in the next two weeks
    for (let k = 0; k < 9; k++) {
      const d = new Date(today);
      d.setDate(d.getDate() + int(1, 14));
      content_posts.push({
        post_id: 'P' + String(postNo++).padStart(5, '0'), date: U.ymd(d), platform: pick(Object.keys(platforms)), creator: pick(creators),
        content_type: pick(['Video', 'Image', 'Carousel']), title: pick(topics), reach: 0, engagements: 0, status: k % 3 ? 'Scheduled' : 'Draft'
      });
    }

    /* ---------- ad campaigns ---------- */
    const channels = { 'Facebook Ads': 1.0, 'Google Ads': 1.15, 'TikTok Ads': 0.9, 'LINE Ads': 0.75 };
    const campaignNames = ['Brand Awareness', 'Retargeting', 'Lead Generation', 'Seasonal Promo'];
    const ad_campaigns = [];
    months.forEach((m, i) => {
      const g = growth(m, i);
      Object.entries(channels).forEach(([channel, eff]) => {
        campaignNames.slice(0, int(2, 4)).forEach((campaign) => {
          const spend = Math.round(between(18, 95) * g) * 1000;
          const impressions = Math.round(spend * between(9, 16));
          const clicks = Math.round(impressions * between(0.009, 0.028));
          const leads = Math.round(clicks * between(0.04, 0.1));
          const conversions = Math.round(leads * between(0.15, 0.35) * eff);
          ad_campaigns.push({
            date: U.ymd(m).slice(0, 7) + '-01', channel, campaign, spend, impressions, clicks, leads, conversions,
            revenue: Math.round(conversions * between(1100, 2300))
          });
        });
      });
    });

    /* ---------- employees ---------- */
    const depts = { Marketing: 14, Sales: 18, HR: 5, Finance: 7, Operations: 26, IT: 8 };
    const positions = {
      Marketing: ['Content Creator', 'Graphic Designer', 'Online Marketing Specialist', 'Marketing Manager'],
      Sales: ['Sales Executive', 'Account Manager', 'Sales Manager'],
      HR: ['HR Officer', 'Recruiter', 'HR Manager'],
      Finance: ['Accountant', 'Finance Officer', 'Finance Manager'],
      Operations: ['Kitchen Staff', 'Production Lead', 'Logistics Officer', 'QC Officer'],
      IT: ['Developer', 'IT Support', 'Data Analyst']
    };
    const first = ['Anan', 'Benja', 'Chai', 'Darin', 'Eakkarat', 'Fah', 'Gun', 'Hathai', 'Itsara', 'Jarun', 'Kwan', 'Lada', 'Mek', 'Nok', 'Oil', 'Pim', 'Seo-jun', 'Ha-eun', 'Do-yun', 'Yuna'];
    const last = ['S.', 'K.', 'P.', 'T.', 'W.', 'C.', 'Kim', 'Park', 'Lee', 'N.'];
    const employees = [];
    let empNo = 1;
    Object.entries(depts).forEach(([department, size]) => {
      const total = size + int(3, 6); // some will have left
      for (let k = 0; k < total; k++) {
        const hire = U.addMonths(today, -int(1, 72));
        hire.setDate(int(1, 28));
        const left = k >= size;
        let exit = '';
        if (left) {
          const e = U.addMonths(today, -int(0, 20));
          e.setDate(int(1, 28));
          exit = U.ymd(e) > U.ymd(hire) ? U.ymd(e) : '';
        }
        const pos = pick(positions[department]);
        employees.push({
          employee_id: 'E' + String(empNo++).padStart(4, '0'),
          name: `${pick(first)} ${pick(last)}`,
          department,
          position: pos,
          hire_date: U.ymd(hire),
          exit_date: exit,
          status: exit ? 'Resigned' : 'Active',
          salary: Math.round(between(18, 45) * (/Manager/.test(pos) ? 2.2 : 1)) * 1000,
          leave_days_used: exit ? 0 : int(0, 12)
        });
      }
    });

    /* ---------- finance ---------- */
    const finance_transactions = [];
    let docNo = 1;
    const expenseCats = [
      ['Salaries', 'Operations', 0.32], ['Raw Materials', 'Operations', 0.24], ['Marketing', 'Marketing', 0.0], ['Rent', 'Operations', 0.06],
      ['Utilities', 'Operations', 0.03], ['Software', 'IT', 0.02], ['Logistics', 'Operations', 0.05], ['Training', 'HR', 0.01], ['Other', 'Finance', 0.02]
    ];
    const vendors = ['Siam Supply', 'Korea Food Import', 'Bangkok Logistics', 'Cloud Services Ltd.', 'Property Co.', 'MEA / PEA', 'Ad Platforms'];
    months.forEach((m, i) => {
      const key = U.ymd(m).slice(0, 7);
      const age = MONTHS - 1 - i;
      const daysInMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      const share = age === 0 ? today.getDate() / daysInMonth : 1; // current month is partial
      const income = Math.round(sales_targets[i].target * between(0.88, 1.18) * share);
      // income split into invoices
      const parts = int(6, 10);
      for (let k = 0; k < parts; k++) {
        const amt = Math.round(income / parts / 100) * 100;
        let status = 'Paid';
        if (age === 0) status = r() < 0.6 ? 'Pending' : 'Paid';
        else if (age === 1) status = r() < 0.25 ? 'Overdue' : r() < 0.3 ? 'Pending' : 'Paid';
        else if (age === 2 && r() < 0.1) status = 'Overdue';
        finance_transactions.push({
          date: dayIn(m, age === 0 ? today.getDate() : 0), doc_no: 'INV-' + String(docNo++).padStart(5, '0'),
          type: 'Income', category: k % 4 === 0 ? 'Service Revenue' : 'Sales Revenue', department: 'Sales',
          party: pick(customers).company, amount: amt, status
        });
      }
      const marketingSpend = ad_campaigns.filter((a) => U.monthKey(a.date) === key).reduce((a, c) => a + c.spend, 0);
      expenseCats.forEach(([category, department, share]) => {
        const amount = category === 'Marketing' ? marketingSpend + Math.round(between(40, 90)) * 1000 : Math.round((income * share * between(0.85, 1.15)) / 100) * 100;
        finance_transactions.push({
          date: dayIn(m, age === 0 ? today.getDate() : 0), doc_no: 'EXP-' + String(docNo++).padStart(5, '0'),
          type: 'Expense', category, department, party: pick(vendors), amount,
          status: age === 0 && r() < 0.4 ? 'Pending' : 'Paid'
        });
      });
    });

    const budgets = [];
    const yearNow = today.getFullYear();
    [yearNow - 1, yearNow].forEach((y) => {
      const yearExp = {};
      finance_transactions.filter((t) => t.type === 'Expense' && t.date.startsWith(String(y))).forEach((t) => {
        yearExp[t.department] = (yearExp[t.department] || 0) + t.amount;
      });
      Object.entries(yearExp).forEach(([department, spent]) => {
        const monthsCovered = y === yearNow ? today.getMonth() + 1 : 12;
        budgets.push({ year: String(y), department, budget: Math.round(((spent / monthsCovered) * 12 * between(0.95, 1.18)) / 1e4) * 1e4 });
      });
    });

    return { customers, sales_deals, sales_targets, content_posts, ad_campaigns, employees, finance_transactions, budgets };
  }

  BI.sampleData = { generate };
})(window.BI);
