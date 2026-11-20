# Chang-in-kimchi BI — CRM & Business Intelligence

เว็บแอป CRM + แดชบอร์ดวิเคราะห์ธุรกิจ แยกตามแผนก เขียนด้วย **HTML + CSS + JavaScript ล้วน**
ไม่ต้องติดตั้งโปรแกรม ไม่ต้องมีเซิร์ฟเวอร์ เปิดในเบราว์เซอร์ได้ทุกที่ (คอมพิวเตอร์ แท็บเล็ต มือถือ)

รองรับ 3 ภาษา: **ไทย · English · 한국어** และโหมดสว่าง/มืด

## วิธีเปิดใช้งาน

- **เปิดในเครื่อง:** ดับเบิลคลิกไฟล์ `index.html` ก็ใช้งานได้ทันที (ใช้แบบออฟไลน์ได้ เพราะไลบรารีกราฟเก็บไว้ในโปรเจกต์แล้ว)
- **เปิดจากที่ไหนก็ได้ผ่านอินเทอร์เน็ต:** เปิด GitHub Pages ที่ *Settings → Pages → Deploy from a branch* แล้วเลือก branch และโฟลเดอร์ `/ (root)`

## โครงสร้างแดชบอร์ด

| เมนู | สิ่งที่แสดง | ชุดข้อมูลที่ใช้ |
|---|---|---|
| ภาพรวมผู้บริหาร | KPI รวมทั้งบริษัท รายได้เทียบค่าใช้จ่าย สรุปรายแผนก | ทุกชุด |
| การตลาด › Content Creator | โพสต์ Reach Engagement แยกตามแพลตฟอร์มและครีเอเตอร์ ปฏิทินคอนเทนต์ | `content_posts` |
| การตลาด › กลยุทธ์การตลาดออนไลน์ | งบโฆษณา ROAS CPA CTR Funnel และผลแต่ละแคมเปญ | `ad_campaigns` |
| ฝ่ายขาย | ยอดขายเทียบเป้า Win rate Pipeline ผลงานรายเซลส์ แหล่งที่มาของลีด | `sales_deals`, `sales_targets` |
| ลูกค้า (CRM) | รายชื่อลูกค้า ยอดซื้อสะสม ลูกค้าที่ต้องติดตาม | `customers`, `sales_deals` |
| ทรัพยากรบุคคล | จำนวนพนักงาน รับเข้า/ลาออก Turnover วันลา | `employees` |
| การเงินและบัญชี | รายได้ ค่าใช้จ่าย กำไร งบประมาณเทียบใช้จริง ลูกหนี้/เจ้าหนี้ | `finance_transactions`, `budgets` |
| แหล่งข้อมูล | นำเข้า Excel / CSV / Google Sheets ดาวน์โหลดแม่แบบ ส่งออกข้อมูล | — |

ทุกหน้ามีตัวเลือกช่วงเวลา (1, 3, 6, 12, 24 เดือน หรือทั้งหมด) และเทียบกับช่วงก่อนหน้าให้อัตโนมัติ

## การเชื่อมข้อมูลจริง

ตอนนี้ระบบใช้ **ข้อมูลตัวอย่าง** เพื่อให้เห็นภาพก่อน เมื่อพร้อมแล้ว:

1. ไปที่เมนู **แหล่งข้อมูล** แล้วกด **แม่แบบ** ของชุดข้อมูลที่ต้องการ เพื่อดูชื่อคอลัมน์
2. ใส่ข้อมูลใน Excel หรือ Google Sheets ให้หัวคอลัมน์ตรงกับแม่แบบ
3. กด **อัปโหลดไฟล์** (`.xlsx`, `.xls`, `.csv`) หรือวางลิงก์ **Google Sheets**
   (ต้องแชร์แบบ “ทุกคนที่มีลิงก์ดูได้” ระบบจะดึงข้อมูลใหม่ทุกครั้งที่เปิดเว็บ)

รูปแบบวันที่ที่รองรับ: `YYYY-MM-DD`, `DD/MM/YYYY` (รวมปี พ.ศ.) และวันที่ของ Excel

> ข้อมูลที่นำเข้าจะเก็บไว้ในเบราว์เซอร์ของเครื่องนั้นเท่านั้น (localStorage) ยังไม่มีเซิร์ฟเวอร์กลาง

### คอลัมน์ของแต่ละชุดข้อมูล

| ชุดข้อมูล | คอลัมน์ |
|---|---|
| `customers` | customer_id, company, contact_name, email, phone, segment, owner, status, created_date, last_contact |
| `sales_deals` | deal_id, date, company, sales_rep, source, stage *(Lead / Qualified / Proposal / Negotiation / Won / Lost)*, value, close_date |
| `sales_targets` | month *(YYYY-MM)*, target |
| `content_posts` | post_id, date, platform, creator, content_type, title, reach, engagements, status *(Published / Scheduled / Draft)* |
| `ad_campaigns` | date, channel, campaign, spend, impressions, clicks, leads, conversions, revenue |
| `employees` | employee_id, name, department, position, hire_date, exit_date, status *(Active / Resigned)*, salary, leave_days_used |
| `finance_transactions` | date, doc_no, type *(Income / Expense)*, category, department, party, amount, status *(Paid / Pending / Overdue)* |
| `budgets` | year, department, budget |

## โครงสร้างไฟล์

```
index.html                 หน้าหลัก
assets/css/style.css       สไตล์ทั้งหมด (สี โหมดมืด รองรับมือถือ)
assets/js/config.js        ตั้งค่าบริษัท สกุลเงิน เมนู
assets/js/i18n.js          คำแปล ไทย / อังกฤษ / เกาหลี
assets/js/store.js         ชุดข้อมูล โครงสร้างคอลัมน์ การนำเข้า Excel/CSV/Google Sheets
assets/js/sample-data.js   ข้อมูลตัวอย่าง
assets/js/charts.js        ตัวช่วยวาดกราฟ (Chart.js)
assets/js/ui.js            การ์ด KPI ตาราง ป้ายสถานะ
assets/js/pages/*.js       แดชบอร์ดแต่ละแผนก
assets/vendor/             Chart.js 4.4.1 (MIT) และ SheetJS 0.18.5 (Apache-2.0)
```

### เพิ่มภาษาใหม่
เพิ่มคอลัมน์ใหม่ในแต่ละรายการของ `assets/js/i18n.js` แล้วเพิ่มรหัสภาษาใน `LANGS` และปุ่มใน `index.html`

### เพิ่มแผนก/หน้าใหม่
สร้างไฟล์ใน `assets/js/pages/` ตามแบบหน้าที่มีอยู่ เพิ่มเมนูใน `assets/js/config.js` และใส่ `<script>` ใน `index.html`

## แผนงานถัดไป
- เชื่อมต่อ API โดยตรง: Facebook / Instagram / TikTok / YouTube / LINE OA / Google Ads
- เชื่อมโปรแกรมบัญชี
- ระบบล็อกอินและสิทธิ์การเข้าถึงตามแผนก (ต้องมี backend)
- ฐานข้อมูลกลางให้ทุกคนเห็นข้อมูลชุดเดียวกัน
