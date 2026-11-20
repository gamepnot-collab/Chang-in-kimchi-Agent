/* ------------------------------------------------------------------
 * Translations: Thai (th) · English (en) · Korean (ko)
 * Each entry is [th, en, ko]. To add a language, append a column and
 * register it in LANGS.
 * ------------------------------------------------------------------ */
(function (BI) {
  const LANGS = ['th', 'en', 'ko'];

  const UI = {
    /* app */
    'app.tagline': ['CRM & ระบบวิเคราะห์ธุรกิจ', 'CRM & Business Intelligence', 'CRM & 비즈니스 인텔리전스'],
    'app.company': ['ภาพรวมบริษัท', 'Company', '회사 전체'],
    'app.department': ['แผนก', 'Department', '부서'],
    'app.crm': ['CRM', 'CRM', 'CRM'],
    'app.settings': ['ตั้งค่า', 'Settings', '설정'],

    /* navigation */
    'nav.overview': ['ภาพรวมผู้บริหาร', 'Executive Overview', '경영 요약'],
    'nav.marketing': ['การตลาด', 'Marketing', '마케팅'],
    'nav.content': ['Content Creator', 'Content Creator', '콘텐츠 크리에이터'],
    'nav.strategy': ['กลยุทธ์การตลาดออนไลน์', 'Online Strategy Marketing', '온라인 전략 마케팅'],
    'nav.sales': ['ฝ่ายขาย', 'Sales', '영업'],
    'nav.customers': ['ลูกค้า', 'Customers', '고객'],
    'nav.hr': ['ทรัพยากรบุคคล', 'Human Resources', '인사'],
    'nav.finance': ['การเงินและบัญชี', 'Finance & Accounting', '재무·회계'],
    'nav.data': ['แหล่งข้อมูล', 'Data Sources', '데이터 소스'],

    /* controls */
    'ctrl.range': ['ช่วงเวลา', 'Period', '기간'],
    'ctrl.search': ['ค้นหา…', 'Search…', '검색…'],
    'ctrl.open': ['ดูรายละเอียด', 'Open', '자세히'],
    'ctrl.light': ['โหมดสว่าง', 'Light mode', '라이트 모드'],
    'ctrl.dark': ['โหมดมืด', 'Dark mode', '다크 모드'],
    'range.months': ['{n} เดือนล่าสุด', 'Last {n} months', '최근 {n}개월'],
    'range.all': ['ทั้งหมด', 'All time', '전체 기간'],
    'status.connected': ['เชื่อมข้อมูลจริงแล้ว {n}/{total} ชุด', 'Live data: {n}/{total} datasets', '실데이터 연결: {n}/{total}'],

    /* KPI labels */
    'kpi.vsPrev': ['เทียบช่วงก่อน', 'vs previous period', '이전 기간 대비'],
    'kpi.current': ['ณ ปัจจุบัน', 'Current', '현재'],
    'kpi.allTime': ['ทั้งหมด', 'All time', '전체'],
    'kpi.inPeriod': ['ในช่วงที่เลือก', 'In selected period', '선택 기간'],
    'kpi.perMonth': ['ต่อเดือน', 'Per month', '월 기준'],
    'kpi.revenue': ['รายได้', 'Revenue', '매출'],
    'kpi.expenses': ['ค่าใช้จ่าย', 'Expenses', '비용'],
    'kpi.netProfit': ['กำไรสุทธิ', 'Net profit', '순이익'],
    'kpi.netMargin': ['อัตรากำไรสุทธิ', 'Net margin', '순이익률'],
    'kpi.dealsWon': ['ยอดขายที่ปิดได้', 'Won revenue', '수주 금액'],
    'kpi.newCustomers': ['ลูกค้าใหม่', 'New customers', '신규 고객'],
    'kpi.roas': ['ROAS', 'ROAS', 'ROAS'],
    'kpi.headcount': ['จำนวนพนักงาน', 'Headcount', '인원'],
    'kpi.postsPublished': ['โพสต์ที่เผยแพร่', 'Posts published', '게시물 수'],
    'kpi.reach': ['การเข้าถึง (Reach)', 'Reach', '도달'],
    'kpi.engagements': ['การมีส่วนร่วม', 'Engagements', '참여'],
    'kpi.engagementRate': ['อัตราการมีส่วนร่วม', 'Engagement rate', '참여율'],
    'kpi.avgEngPerPost': ['Engagement เฉลี่ย/โพสต์', 'Avg. engagement / post', '게시물당 평균 참여'],
    'kpi.upcoming': ['คอนเทนต์ที่รอเผยแพร่', 'Upcoming content', '예정 콘텐츠'],
    'kpi.scheduledDraft': ['ตั้งเวลา + ร่าง', 'Scheduled + drafts', '예약 + 초안'],
    'kpi.adSpend': ['งบโฆษณา', 'Ad spend', '광고비'],
    'kpi.adRevenue': ['รายได้จากโฆษณา', 'Ad revenue', '광고 매출'],
    'kpi.cpa': ['ต้นทุนต่อการขาย (CPA)', 'Cost per acquisition', '전환당 비용(CPA)'],
    'kpi.ctr': ['อัตราการคลิก (CTR)', 'Click-through rate', '클릭률(CTR)'],
    'kpi.leads': ['ลีด', 'Leads', '리드'],
    'kpi.impressions': ['การแสดงผล', 'Impressions', '노출'],
    'kpi.clicks': ['คลิก', 'Clicks', '클릭'],
    'kpi.conversions': ['ยอดขาย (Conversion)', 'Conversions', '전환'],
    'kpi.winRate': ['อัตราปิดการขาย', 'Win rate', '수주율'],
    'kpi.targetAchieved': ['ทำได้ตามเป้า', 'Target achieved', '목표 달성률'],
    'kpi.target': ['เป้าหมาย', 'Target', '목표'],
    'kpi.avgDeal': ['มูลค่าดีลเฉลี่ย', 'Avg. deal size', '평균 거래 규모'],
    'kpi.newDeals': ['ดีลใหม่', 'New deals', '신규 거래'],
    'kpi.openPipeline': ['ไปป์ไลน์ที่เปิดอยู่', 'Open pipeline', '진행 중 파이프라인'],
    'kpi.totalCustomers': ['ลูกค้าทั้งหมด', 'Total customers', '전체 고객'],
    'kpi.activeCustomers': ['ลูกค้าที่ใช้งานอยู่', 'Active customers', '활성 고객'],
    'kpi.prospects': ['ลูกค้าคาดหวัง', 'Prospects', '잠재 고객'],
    'kpi.needFollowUp': ['ต้องติดตาม', 'Need follow-up', '후속 조치 필요'],
    'kpi.noContact60': ['ไม่ได้ติดต่อเกิน 60 วัน', 'No contact in 60+ days', '60일 이상 미접촉'],
    'kpi.newHires': ['พนักงานใหม่', 'New hires', '신규 입사'],
    'kpi.exits': ['ลาออก', 'Exits', '퇴사'],
    'kpi.turnover': ['อัตราการลาออก', 'Turnover rate', '이직률'],
    'kpi.avgTenure': ['อายุงานเฉลี่ย', 'Avg. tenure', '평균 근속'],
    'kpi.payroll': ['ค่าจ้างรวม', 'Payroll', '급여 총액'],
    'kpi.receivables': ['ลูกหนี้ค้างรับ', 'Receivables', '미수금'],
    'kpi.overdue': ['ลูกหนี้เกินกำหนด', 'Overdue', '연체'],
    'kpi.budget': ['งบประมาณ', 'Budget', '예산'],
    'kpi.spentYtd': ['ใช้จริงถึงปัจจุบัน', 'Spent YTD', '연초 대비 지출'],

    /* units */
    'unit.posts': ['โพสต์', 'posts', '게시물'],
    'unit.deals': ['ดีล', 'deals', '건'],
    'unit.years': ['ปี', 'yrs', '년'],
    'unit.days': ['วัน', 'days', '일'],
    'unit.docs': ['เอกสาร', 'docs', '건'],
    'tbl.rows': ['{n} รายการ', '{n} rows', '{n}개 항목'],

    /* messages */
    'msg.noData': ['ไม่มีข้อมูลในช่วงนี้', 'No data for this period', '이 기간에 데이터가 없습니다'],
    'msg.noTarget': ['ยังไม่ได้ตั้งเป้า', 'No target set', '목표 미설정'],
    'msg.chartMissing': ['โหลดไลบรารีกราฟไม่สำเร็จ', 'Chart library failed to load', '차트 라이브러리를 불러오지 못했습니다'],
    'msg.sampleNotice': ['บางส่วนของหน้านี้ยังใช้ข้อมูลตัวอย่าง', 'Some of this page still uses sample data.', '이 페이지 일부는 샘플 데이터를 사용 중입니다.'],
    'msg.connectData': ['เชื่อมข้อมูลจริง', 'Connect real data', '실데이터 연결'],
    'msg.renderError': ['แสดงหน้านี้ไม่สำเร็จ ลองตรวจสอบคอลัมน์ข้อมูลที่นำเข้า', 'This page could not be displayed. Check the imported data columns.', '페이지를 표시할 수 없습니다. 가져온 데이터 열을 확인하세요.'],

    /* overview */
    'ov.departments': ['สรุปรายแผนก', 'Departments at a glance', '부서별 요약'],
    'ov.departmentsSub': ['คลิกเพื่อดูแดชบอร์ดของแต่ละแผนก', 'Open a department dashboard', '부서 대시보드로 이동'],

    /* chart titles */
    'ch.byMonth': ['รายเดือน', 'By month', '월별'],
    'ch.byMonthStacked': ['รายเดือน แยกตามแพลตฟอร์ม', 'By month, stacked by platform', '월별, 플랫폼별 누적'],
    'ch.inPeriod': ['ในช่วงที่เลือก', 'In selected period', '선택 기간'],
    'ch.incomeVsExpense': ['รายได้เทียบค่าใช้จ่าย', 'Revenue vs expenses', '매출 vs 비용'],
    'ch.plSub': ['รายเดือน พร้อมเส้นกำไรสุทธิ', 'By month, with net profit line', '월별, 순이익 포함'],
    'ch.reachByPlatform': ['Reach ตามแพลตฟอร์ม', 'Reach by platform', '플랫폼별 도달'],
    'ch.erByPlatform': ['อัตราการมีส่วนร่วมตามแพลตฟอร์ม', 'Engagement rate by platform', '플랫폼별 참여율'],
    'ch.erSub': ['Engagement ÷ Reach', 'Engagements ÷ reach', '참여 ÷ 도달'],
    'ch.creatorPerformance': ['ผลงานรายครีเอเตอร์', 'Creator performance', '크리에이터 성과'],
    'ch.creatorSub': ['Reach รวม · จำนวนโพสต์', 'Total reach · posts', '총 도달 · 게시물 수'],
    'ch.spendVsRevenue': ['งบโฆษณาเทียบรายได้', 'Ad spend vs revenue', '광고비 vs 매출'],
    'ch.roasByChannel': ['ROAS ตามช่องทาง', 'ROAS by channel', '채널별 ROAS'],
    'ch.roasSub': ['รายได้ ÷ งบโฆษณา', 'Revenue ÷ spend', '매출 ÷ 광고비'],
    'ch.wonVsTarget': ['ยอดขายที่ปิดได้เทียบเป้า', 'Won revenue vs target', '수주 금액 vs 목표'],
    'ch.pipelineByStage': ['ไปป์ไลน์ตามขั้นตอน', 'Pipeline by stage', '단계별 파이프라인'],
    'ch.pipelineSub': ['มูลค่าดีลที่ยังเปิดอยู่', 'Value of open deals', '진행 중 거래 금액'],
    'ch.revenueByRep': ['ยอดขายรายพนักงานขาย', 'Revenue by sales rep', '영업 담당자별 매출'],
    'ch.revenueByRepSub': ['ดีลที่ปิดได้ในช่วงที่เลือก', 'Won deals in selected period', '선택 기간 수주'],
    'ch.dealsBySource': ['ดีลตามแหล่งที่มา', 'Deals by lead source', '리드 출처별 거래'],
    'ch.dealsBySourceSub': ['จำนวนดีลใหม่', 'Number of new deals', '신규 거래 수'],
    'ch.hiresVsExits': ['รับเข้าเทียบลาออก', 'Hires vs exits', '입사 vs 퇴사'],
    'ch.headcountByDept': ['พนักงานตามแผนก', 'Headcount by department', '부서별 인원'],
    'ch.leaveByDept': ['วันลาเฉลี่ยต่อคน', 'Avg. leave days per person', '1인당 평균 휴가'],
    'ch.leaveSub': ['แยกตามแผนก ปีนี้', 'By department, this year', '부서별, 올해'],
    'ch.expenseByCategory': ['ค่าใช้จ่ายตามหมวด', 'Expenses by category', '항목별 비용'],
    'ch.budgetVsActual': ['งบประมาณเทียบใช้จริง', 'Budget vs actual', '예산 vs 실적'],
    'ch.budgetSub': ['ปี {year} แยกตามแผนก', '{year}, by department', '{year}년, 부서별'],

    /* content */
    'ct.upcoming': ['ปฏิทินคอนเทนต์ที่จะมาถึง', 'Upcoming content calendar', '예정 콘텐츠 캘린더'],
    'ct.upcomingSub': ['โพสต์ที่ตั้งเวลาไว้และฉบับร่าง', 'Scheduled posts and drafts', '예약 게시물 및 초안'],
    'ct.topPosts': ['โพสต์ที่ทำผลงานดีที่สุด', 'Top performing posts', '성과 상위 게시물'],
    'ct.topPostsSub': ['คลิกหัวคอลัมน์เพื่อเรียงลำดับ', 'Click a column header to sort', '열 제목을 클릭해 정렬'],

    /* strategy */
    'st.funnel': ['Funnel การตลาด', 'Marketing funnel', '마케팅 퍼널'],
    'st.funnelSub': ['จากการแสดงผลจนถึงการขาย', 'From impression to conversion', '노출부터 전환까지'],
    'st.fromPrev': ['จากขั้นก่อนหน้า', 'of previous step', '이전 단계 대비'],
    'st.funnelNote': ['ความยาวแถบใช้สเกลรากที่สองเพื่อให้เห็นทุกขั้น', 'Bar length uses a square-root scale so every stage stays visible.', '모든 단계가 보이도록 막대 길이는 제곱근 척도입니다.'],
    'st.campaigns': ['ผลแคมเปญ', 'Campaign performance', '캠페인 성과'],
    'st.campaignsSub': ['รวมตามช่องทางและแคมเปญ', 'Grouped by channel and campaign', '채널·캠페인별 합계'],

    /* sales */
    'sl.openDeals': ['ดีลที่ยังเปิดอยู่', 'Open deals', '진행 중 거래'],
    'sl.openDealsSub': ['เรียงตามมูลค่า', 'Sorted by value', '금액순'],
    'sl.allDeals': ['ดีลที่สร้างในช่วงนี้', 'Deals created in period', '기간 내 생성 거래'],
    'sl.allDealsSub': ['ค้นหาตามบริษัท พนักงานขาย หรือสถานะ', 'Search by company, rep or stage', '회사, 담당자, 단계로 검색'],

    /* customers */
    'cu.bySegment': ['มูลค่าลูกค้าตามกลุ่ม', 'Customer value by segment', '세그먼트별 고객 가치'],
    'cu.bySegmentSub': ['ยอดซื้อสะสม', 'Lifetime won revenue', '누적 수주 금액'],
    'cu.byOwner': ['ลูกค้าต่อผู้ดูแล', 'Customers per owner', '담당자별 고객 수'],
    'cu.byOwnerSub': ['จำนวนบัญชีที่ดูแล', 'Accounts managed', '관리 계정 수'],
    'cu.followUp': ['ลูกค้าที่ควรติดตาม', 'Customers to follow up', '후속 조치 대상 고객'],
    'cu.followUpSub': ['ลูกค้าที่ใช้งานอยู่แต่ไม่ได้ติดต่อเกิน 60 วัน', 'Active customers with no contact in 60+ days', '60일 이상 미접촉 활성 고객'],
    'cu.directory': ['รายชื่อลูกค้า', 'Customer directory', '고객 목록'],
    'cu.directorySub': ['ข้อมูลลูกค้าทั้งหมดในระบบ', 'All customer records', '전체 고객 기록'],

    /* hr */
    'hr.directory': ['รายชื่อพนักงาน', 'Employee directory', '직원 목록'],
    'hr.directorySub': ['รวมพนักงานที่ลาออกแล้ว', 'Including former employees', '퇴사자 포함'],

    /* finance */
    'fn.receivables': ['ลูกหนี้ค้างรับ', 'Accounts receivable', '매출채권'],
    'fn.receivablesSub': ['ใบแจ้งหนี้ที่รอรับชำระและเกินกำหนด', 'Pending and overdue invoices', '미결 및 연체 청구서'],
    'fn.payables': ['เจ้าหนี้ค้างจ่าย', 'Accounts payable', '매입채무'],
    'fn.payablesSub': ['ค่าใช้จ่ายที่ยังไม่ได้ชำระ', 'Unpaid expenses', '미지급 비용'],

    /* columns */
    'col.id': ['รหัส', 'ID', 'ID'],
    'col.date': ['วันที่', 'Date', '날짜'],
    'col.title': ['หัวข้อ', 'Title', '제목'],
    'col.platform': ['แพลตฟอร์ม', 'Platform', '플랫폼'],
    'col.contentType': ['ประเภท', 'Type', '유형'],
    'col.creator': ['ครีเอเตอร์', 'Creator', '크리에이터'],
    'col.status': ['สถานะ', 'Status', '상태'],
    'col.channel': ['ช่องทาง', 'Channel', '채널'],
    'col.campaign': ['แคมเปญ', 'Campaign', '캠페인'],
    'col.company': ['บริษัท', 'Company', '회사'],
    'col.stage': ['ขั้นตอน', 'Stage', '단계'],
    'col.value': ['มูลค่า', 'Value', '금액'],
    'col.created': ['วันที่สร้าง', 'Created', '생성일'],
    'col.rep': ['พนักงานขาย', 'Sales rep', '영업 담당'],
    'col.source': ['แหล่งที่มา', 'Source', '출처'],
    'col.contact': ['ผู้ติดต่อ', 'Contact', '담당자'],
    'col.owner': ['ผู้ดูแล', 'Owner', '관리자'],
    'col.lastContact': ['ติดต่อล่าสุด', 'Last contact', '최근 연락'],
    'col.ltv': ['ยอดซื้อสะสม', 'Lifetime value', '누적 매출'],
    'col.phone': ['โทรศัพท์', 'Phone', '전화'],
    'col.segment': ['กลุ่มลูกค้า', 'Segment', '세그먼트'],
    'col.openDeals': ['ดีลที่เปิดอยู่', 'Open deals', '진행 거래'],
    'col.name': ['ชื่อ', 'Name', '이름'],
    'col.department': ['แผนก', 'Department', '부서'],
    'col.position': ['ตำแหน่ง', 'Position', '직책'],
    'col.hireDate': ['วันเริ่มงาน', 'Hire date', '입사일'],
    'col.leaveUsed': ['วันลาที่ใช้', 'Leave used', '사용 휴가'],
    'col.doc': ['เลขที่เอกสาร', 'Document', '문서 번호'],
    'col.customer': ['ลูกค้า', 'Customer', '고객'],
    'col.vendor': ['ผู้ขาย', 'Vendor', '공급업체'],
    'col.category': ['หมวด', 'Category', '항목'],
    'col.amount': ['จำนวนเงิน', 'Amount', '금액'],

    /* data sources */
    'ds.introTitle': ['เชื่อมข้อมูลจริงเข้าระบบ', 'Connect your real data', '실제 데이터 연결'],
    'ds.step1': ['ดาวน์โหลด <b>แม่แบบ (Template)</b> ของชุดข้อมูลที่ต้องการ เพื่อดูชื่อคอลัมน์ที่ระบบใช้', 'Download the <b>template</b> for a dataset to see the column names the dashboard expects.', '데이터셋의 <b>템플릿</b>을 내려받아 필요한 열 이름을 확인하세요.'],
    'ds.step2': ['ใส่ข้อมูลใน Excel หรือ Google Sheets โดยใช้หัวคอลัมน์ตามแม่แบบ (ตัวพิมพ์เล็ก/ใหญ่ไม่มีผล)', 'Fill it in Excel or Google Sheets using the same headers (case does not matter).', 'Excel 또는 Google Sheets에 같은 열 제목으로 입력하세요(대소문자 무관).'],
    'ds.step3': ['กด <b>อัปโหลดไฟล์</b> หรือวางลิงก์ <b>Google Sheets</b> แดชบอร์ดจะอัปเดตทันที', 'Click <b>Upload file</b> or paste a <b>Google Sheets</b> link — dashboards update instantly.', '<b>파일 업로드</b> 또는 <b>Google Sheets</b> 링크를 붙여넣으면 대시보드가 즉시 업데이트됩니다.'],
    'ds.privacy': ['ข้อมูลที่นำเข้าเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น ยังไม่ได้ส่งขึ้นเซิร์ฟเวอร์', 'Imported data is stored only in this browser — nothing is uploaded to a server.', '가져온 데이터는 이 브라우저에만 저장되며 서버로 전송되지 않습니다.'],
    'ds.sample': ['ข้อมูลตัวอย่าง', 'Sample data', '샘플 데이터'],
    'ds.file': ['ไฟล์', 'File', '파일'],
    'ds.updated': ['อัปเดต', 'Updated', '업데이트'],
    'ds.columns': ['คอลัมน์ที่ต้องมี', 'Required columns', '필수 열'],
    'ds.type.text': ['ข้อความ', 'text', '텍스트'],
    'ds.type.num': ['ตัวเลข', 'number', '숫자'],
    'ds.type.date': ['วันที่ (YYYY-MM-DD)', 'date (YYYY-MM-DD)', '날짜 (YYYY-MM-DD)'],
    'ds.type.month': ['เดือน (YYYY-MM)', 'month (YYYY-MM)', '월 (YYYY-MM)'],
    'ds.upload': ['อัปโหลดไฟล์', 'Upload file', '파일 업로드'],
    'ds.refresh': ['ดึงข้อมูลใหม่', 'Refresh', '새로고침'],
    'ds.template': ['แม่แบบ', 'Template', '템플릿'],
    'ds.export': ['ส่งออก CSV', 'Export CSV', 'CSV 내보내기'],
    'ds.reset': ['กลับไปใช้ข้อมูลตัวอย่าง', 'Reset to sample', '샘플로 초기화'],
    'ds.connect': ['เชื่อมต่อ', 'Connect', '연결'],
    'ds.gsheetHelp': ['ตั้งค่าแชร์ชีตเป็น "ทุกคนที่มีลิงก์ดูได้" แล้ววางลิงก์ของแท็บที่ต้องการ ระบบจะดึงข้อมูลใหม่ทุกครั้งที่เปิดเว็บ', 'Share the sheet as "Anyone with the link can view", then paste the link of the tab you want. It re-syncs every time the app opens.', '시트를 "링크가 있는 모든 사용자 보기"로 공유한 뒤 원하는 탭 링크를 붙여넣으세요. 앱을 열 때마다 동기화됩니다.'],
    'ds.imported': ['นำเข้า {n} รายการ ไปยัง "{name}" แล้ว', 'Imported {n} rows into "{name}"', '"{name}"에 {n}개 행을 가져왔습니다'],
    'ds.missing': ['ไม่พบคอลัมน์', 'missing columns', '누락된 열'],
    'ds.tooBig': ['ไฟล์ใหญ่เกินกว่าที่เบราว์เซอร์จะจำได้ ข้อมูลจะหายเมื่อปิดหน้า', 'File is too large to keep in this browser; it will be lost on reload.', '파일이 너무 커서 브라우저에 저장되지 않습니다. 새로고침 시 사라집니다.'],
    'ds.readError': ['อ่านไฟล์ไม่สำเร็จ ตรวจสอบว่าเป็นไฟล์ CSV หรือ Excel ที่มีหัวคอลัมน์', 'Could not read the file. Make sure it is a CSV or Excel file with a header row.', '파일을 읽을 수 없습니다. 머리글 행이 있는 CSV 또는 Excel인지 확인하세요.'],
    'ds.badUrl': ['ลิงก์ไม่ถูกต้อง ต้องเป็นลิงก์ Google Sheets', 'That is not a Google Sheets link.', 'Google Sheets 링크가 아닙니다.'],
    'ds.gsheetError': ['ดึงข้อมูลไม่สำเร็จ ตรวจสอบว่าแชร์ชีตเป็นสาธารณะแบบดูได้', 'Could not load the sheet. Check that it is shared as "Anyone with the link can view".', '시트를 불러올 수 없습니다. 공유 설정을 확인하세요.'],
    'ds.resetConfirm': ['ลบข้อมูลที่นำเข้าและกลับไปใช้ข้อมูลตัวอย่าง?', 'Remove imported data and go back to sample data?', '가져온 데이터를 삭제하고 샘플 데이터로 돌아갈까요?'],
    'ds.resetDone': ['กลับไปใช้ข้อมูลตัวอย่างแล้ว', 'Reset to sample data', '샘플 데이터로 초기화했습니다'],
    'ds.synced': ['ซิงก์ข้อมูลจาก Google Sheets แล้ว', 'Synced from Google Sheets', 'Google Sheets에서 동기화됨'],
    'ds.soonTitle': ['การเชื่อมต่อที่จะเพิ่มในอนาคต', 'Coming next', '추가 예정 연동'],
    'ds.soonBody': ['ระหว่างนี้สามารถส่งออกรายงานจากแพลตฟอร์มเหล่านี้เป็น CSV/Excel แล้วนำเข้าตามแม่แบบได้เลย', 'Until direct connectors are added, export reports from these platforms as CSV/Excel and import them using the templates.', '직접 연동 전까지 각 플랫폼 보고서를 CSV/Excel로 내보내 템플릿에 맞춰 가져오세요.'],

    'ds.name.customers': ['ลูกค้า', 'Customers', '고객'],
    'ds.name.sales_deals': ['ดีลการขาย', 'Sales deals', '영업 거래'],
    'ds.name.sales_targets': ['เป้ายอดขายรายเดือน', 'Monthly sales targets', '월별 매출 목표'],
    'ds.name.content_posts': ['โพสต์คอนเทนต์', 'Content posts', '콘텐츠 게시물'],
    'ds.name.ad_campaigns': ['แคมเปญโฆษณาออนไลน์', 'Online ad campaigns', '온라인 광고 캠페인'],
    'ds.name.employees': ['พนักงาน', 'Employees', '직원'],
    'ds.name.finance_transactions': ['รายการบัญชี', 'Accounting transactions', '회계 거래'],
    'ds.name.budgets': ['งบประมาณรายแผนก', 'Department budgets', '부서별 예산'],
    'ds.desc.customers': ['ข้อมูลลูกค้า ผู้ติดต่อ และผู้ดูแลบัญชี', 'Customer accounts, contacts and owners', '고객 계정, 연락처, 담당자'],
    'ds.desc.sales_deals': ['ดีลทุกขั้นตอน ตั้งแต่ Lead จนปิดการขาย', 'Every deal from lead to won / lost', '리드부터 수주/실패까지 모든 거래'],
    'ds.desc.sales_targets': ['เป้ายอดขายของแต่ละเดือน', 'Revenue target for each month', '월별 매출 목표'],
    'ds.desc.content_posts': ['โพสต์จาก Facebook, Instagram, TikTok, YouTube, LINE', 'Posts from Facebook, Instagram, TikTok, YouTube, LINE', 'Facebook, Instagram, TikTok, YouTube, LINE 게시물'],
    'ds.desc.ad_campaigns': ['ผลโฆษณา Facebook / Google / TikTok / LINE Ads', 'Results from Facebook / Google / TikTok / LINE Ads', 'Facebook / Google / TikTok / LINE 광고 성과'],
    'ds.desc.employees': ['ข้อมูลพนักงาน วันเริ่มงาน การลาออก วันลา', 'Staff records, hire / exit dates, leave', '직원 정보, 입·퇴사일, 휴가'],
    'ds.desc.finance_transactions': ['รายรับ-รายจ่าย ใบแจ้งหนี้ และสถานะการชำระ', 'Income, expenses, invoices and payment status', '수입·지출, 청구서, 결제 상태'],
    'ds.desc.budgets': ['งบประมาณประจำปีของแต่ละแผนก', 'Annual budget per department', '부서별 연간 예산']
  };

  /* Translations for data values (stages, statuses, categories…). */
  const VALUES = {
    Lead: ['ลีด', 'Lead', '리드'], Qualified: ['ผ่านการคัดกรอง', 'Qualified', '검증됨'], Proposal: ['เสนอราคา', 'Proposal', '제안'],
    Negotiation: ['เจรจา', 'Negotiation', '협상'], Won: ['ปิดได้', 'Won', '수주'], Lost: ['ไม่สำเร็จ', 'Lost', '실패'],
    Active: ['ใช้งานอยู่', 'Active', '활성'], Prospect: ['คาดหวัง', 'Prospect', '잠재'], Inactive: ['ไม่ใช้งาน', 'Inactive', '비활성'],
    Resigned: ['ลาออกแล้ว', 'Resigned', '퇴사'], Paid: ['ชำระแล้ว', 'Paid', '지급 완료'], Pending: ['รอชำระ', 'Pending', '대기'],
    Overdue: ['เกินกำหนด', 'Overdue', '연체'], Published: ['เผยแพร่แล้ว', 'Published', '게시됨'], Scheduled: ['ตั้งเวลาไว้', 'Scheduled', '예약됨'],
    Draft: ['ร่าง', 'Draft', '초안'],
    Enterprise: ['องค์กรใหญ่', 'Enterprise', '대기업'], SME: ['SME', 'SME', '중소기업'], Retail: ['รายย่อย', 'Retail', '소매'],
    'Online Ads': ['โฆษณาออนไลน์', 'Online Ads', '온라인 광고'], Referral: ['แนะนำต่อ', 'Referral', '추천'],
    'Social Media': ['โซเชียลมีเดีย', 'Social Media', '소셜 미디어'], Event: ['อีเวนต์', 'Event', '이벤트'], 'Walk-in': ['Walk-in', 'Walk-in', '방문'],
    Video: ['วิดีโอ', 'Video', '동영상'], Image: ['รูปภาพ', 'Image', '이미지'], Carousel: ['อัลบั้ม', 'Carousel', '캐러셀'],
    Article: ['บทความ', 'Article', '아티클'], Live: ['ไลฟ์', 'Live', '라이브'],
    Marketing: ['การตลาด', 'Marketing', '마케팅'], Sales: ['ฝ่ายขาย', 'Sales', '영업'], HR: ['ทรัพยากรบุคคล', 'HR', '인사'],
    Finance: ['การเงิน', 'Finance', '재무'], Operations: ['ปฏิบัติการ', 'Operations', '운영'], IT: ['ไอที', 'IT', 'IT'],
    Salaries: ['เงินเดือน', 'Salaries', '급여'], 'Raw Materials': ['วัตถุดิบ', 'Raw materials', '원재료'], Rent: ['ค่าเช่า', 'Rent', '임대료'],
    Utilities: ['ค่าน้ำ-ไฟ', 'Utilities', '공과금'], Software: ['ซอฟต์แวร์', 'Software', '소프트웨어'], Logistics: ['ขนส่ง', 'Logistics', '물류'],
    Training: ['อบรม', 'Training', '교육'], Other: ['อื่น ๆ', 'Other', '기타'],
    'Sales Revenue': ['รายได้จากการขาย', 'Sales revenue', '판매 수익'], 'Service Revenue': ['รายได้ค่าบริการ', 'Service revenue', '서비스 수익'],
    Income: ['รายรับ', 'Income', '수입'], Expense: ['รายจ่าย', 'Expense', '지출']
  };

  const i18n = {
    lang: 'th',
    langs: LANGS,
    set(l) { this.lang = LANGS.includes(l) ? l : 'th'; },
    /** Merge more [th, en, ko] entries (used by feature modules). */
    extend(dict, values) { Object.assign(UI, dict); if (values) Object.assign(VALUES, values); }
  };
  const idx = () => LANGS.indexOf(i18n.lang);

  BI.i18n = i18n;
  /** Translate a UI key. Falls back to English, then the key itself. */
  BI.t = (key) => {
    const e = UI[key];
    return e ? e[idx()] ?? e[1] : key;
  };
  /** Translate a data value if known, else return it unchanged. */
  BI.td = (key) => BI.t(key);
  BI.tv = (val) => {
    const e = VALUES[val];
    return e ? e[idx()] ?? e[1] : val;
  };
})(window.BI);
