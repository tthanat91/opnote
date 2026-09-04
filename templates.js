/* =====================================================================
   templates.js — the default field definitions.

   These are ONLY used when the app cannot reach your Google Sheet
   (first run, or no internet). Once the Sheet is connected, the
   "Templates" tab of the Sheet is the single source of truth and you
   edit fields there — no code changes needed.

   Column meaning (identical to the Sheet):
     category  common | colorectal | fistula | hemorrhoid | others
     section   grouping heading, written "ไทย | English"
     key       unique, no spaces — becomes the spreadsheet column name
     th / en   the bilingual field label
     type      text | textarea | number | date | time | select |
               radio | checkbox | checklist | heading
     options   choices for select / radio / checklist, separated by ";"
   ===================================================================== */

(function (global) {
  'use strict';

  function f(category, section, key, th, en, type, options, showif) {
    return {
      category: category, section: section, key: key,
      th: th, en: en, type: type,
      options: options ? options.split(';').map(function (s) { return s.trim(); }) : [],
      showif: showif || ''
    };
  }

  var COMMON = 'ข้อมูลทั่วไป | General';
  var IDENT = 'ผู้ป่วย | Patient';
  var TEAM = 'ทีมผ่าตัด | Operative team';
  var DIAG = 'การวินิจฉัยและหัตถการ | Diagnosis & procedure';

  global.TEMPLATES_BUILD = '2026-08-02de';

  global.DEFAULT_TEMPLATES = [

    /* ---------------- COMMON: mirrors the MR 08.1 blue form ---------------- */
    f('common', COMMON, 'or_room', 'เลขที่ห้องผ่าตัด', 'OR room', 'text'),
    f('common', COMMON, 'op_date', 'วันที่ผ่าตัด', 'Date of operation', 'date'),
    f('common', COMMON, 'time_start', 'เริ่มเวลา', 'Start time', 'time'),
    f('common', COMMON, 'time_end', 'เสร็จเวลา', 'Finish time', 'time'),
    f('common', COMMON, 'time_total', 'รวมเวลา (นาที)', 'Total time (minutes, calculated)', 'number'),
    f('common', COMMON, 'department', 'ภาควิชา', 'Department', 'text'),

    f('common', IDENT, 'hn', 'HN', 'HN', 'text'),
    f('common', IDENT, 'an', 'AN (ถ้าเป็น case ODS ใส่วันที่มาผ่าตัด DD/MM/YYYY)',
      'AN (for an ODS case, enter the date of operation, DD/MM/YYYY)', 'text'),
    f('common', IDENT, 'patient_name', 'ชื่อ', 'First name', 'text'),
    f('common', IDENT, 'patient_surname', 'นามสกุล', 'Surname', 'text'),
    f('common', IDENT, 'age', 'อายุ', 'Age', 'text'),
    f('common', IDENT, 'sex', 'เพศ', 'Sex', 'radio', 'ชาย / Male; หญิง / Female'),
    f('common', IDENT, 'ward', 'หอผู้ป่วย (ถ้าเป็น case ODS ใส่ ODS)',
      'Ward (for an ODS case, enter ODS)', 'text'),
    f('common', IDENT, 'admit_date', 'วันที่รับไว้', 'Admission date', 'date'),

    f('common', DIAG, 'preop_dx', 'การวินิจฉัยก่อนผ่าตัด', 'Pre-operative diagnosis', 'textarea'),
    f('common', DIAG, 'indication', 'ข้อบ่งชี้ในการผ่าตัด', 'Indication for operation', 'checklist',
      'Malignancy; Obstruction; Perforation; Bleeding; Ischemia / necrosis; Abscess or infection; ' +
      'Inflammatory disease (IBD / diverticulitis); Fistula; Prolapse; ' +
      'Incontinence or functional disorder; Anastomotic complication; Stoma-related; Trauma; ' +
      'Failed medical or endoscopic treatment; Other'),
    f('common', DIAG, 'aim', 'จุดมุ่งหมายในการผ่าตัด', 'Aim of operation', 'radio',
      'Curative (R0 intent); Palliative; Diagnostic / staging; Prophylactic; ' +
      'Symptom relief / decompression; Restoration of intestinal continuity; ' +
      'Source control / damage control'),
    f('common', DIAG, 'postop_dx', 'การวินิจฉัยหลังผ่าตัด', 'Post-operative diagnosis', 'textarea'),
    f('common', DIAG, 'operation', 'ชนิดของการผ่าตัด', 'Operation performed', 'textarea'),
    f('common', DIAG, 'organ_removed', 'อวัยวะหรือสิ่งที่ถูกตัดออก', 'Organ / tissue removed', 'textarea'),
    f('common', DIAG, 'pathology_sent', 'ชิ้นเนื้อที่ส่งตรวจทางพยาธิวิทยา', 'Specimen sent to pathology', 'textarea'),
    f('common', DIAG, 'intraop_complication', 'ภาวะแทรกซ้อนระหว่างผ่าตัด', 'Intra-operative complication', 'textarea'),
    f('common', DIAG, 'ebl', 'ประมาณการเสียเลือด (มล.)', 'Estimated blood loss (mL)', 'number'),
    f('common', DIAG, 'transfusion', 'การให้ทดแทน', 'Replacement / transfusion', 'text'),

    f('common', TEAM, 'surgeon', 'แพทย์ผู้ผ่าตัด', 'Surgeon', 'text'),
    f('common', TEAM, 'assistant', 'ผู้ช่วย', 'Assistant', 'text'),
    f('common', TEAM, 'consultant', 'แพทย์ที่ปรึกษา', 'Consultant', 'select',
      'อ.กุลวัฒน์; อ.บุญชัย; อ.ณัฐพล; อ.รังสิมา; อ.ปุณวัฒน์; อ.สุรเดช; อ.ธนัท'),
    f('common', TEAM, 'recorder', 'ผู้บันทึกรายงาน', 'Recorded by', 'text'),
    f('common', TEAM, 'anaesthetist', 'วิสัญญีแพทย์', 'Anesthetist', 'text'),
    f('common', TEAM, 'anaesthesia', 'วิธีระงับความรู้สึก', 'Type of anesthesia', 'select',
      'GA; GA + epidural; Spinal block; Spinal + sedation; Caudal block; ' +
      'Pudendal / perianal block; Local infiltration; MAC / sedation'),
    f('common', TEAM, 'scrub_nurse', 'พยาบาลส่งเครื่องมือ', 'Scrub nurse', 'text'),
    f('common', TEAM, 'circulating_nurse', 'พยาบาลช่วยรอบนอก', 'Circulating nurse', 'text'),
    f('common', TEAM, 'others_note', 'อื่น ๆ', 'Others', 'text'),

    f('common', 'สิ่งตรวจพบ | Findings', 'findings', 'สิ่งตรวจพบ', 'Operative findings', 'textarea'),
    f('common', 'สิ่งตรวจพบ | Findings', 'specimen_description', 'คำอธิบายชิ้นเนื้อ', 'Specimen description', 'textarea'),

    /* ---------------- COLORECTAL ---------------- */
    f('colorectal', 'การเข้าถึง | Approach', 'cr_approach', 'วิธีการผ่าตัด', 'Surgical approach', 'radio',
      'Open; Laparoscopic; Laparoscopic converted to open; Robotic; ' +
      'Transanal (taTME / TAMIS); Combined abdominoperineal'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_ports', 'จำนวน port', 'Port placement', 'radio',
      'Single port (SILS); Two-port technique; Three-port technique; Four-port technique; ' +
      'Five-port technique; Other',
      'cr_approach = Laparoscopic'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_position', 'ท่าผู้ป่วย', 'Patient position', 'radio',
      'Supine; Modified lithotomy (Lloyd-Davies); Prone jackknife; Right lateral; Left lateral'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_incision', 'แผลผ่าตัด', 'Incision', 'textarea',
      '', 'cr_approach != Laparoscopic'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_extraction', 'ตำแหน่งเอาชิ้นเนื้อออก', 'Specimen extraction site', 'radio',
      'Midline (umbilical port site extended); Left lower quadrant; Pfannenstiel; Right lower quadrant (port site extended); Transanal (NOSE); Through the stoma site',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA && cr_approach != Open'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_r_extraction_length', 'ความยาวแผลเอาชิ้นเนื้อออก (ซม.)',
      'Extraction incision length (cm)', 'number', '',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA && cr_approach != Open'),

    f('colorectal', 'หัตถการ | Procedure', 'cr_procedure', 'การผ่าตัดที่ทำ', 'Procedure performed', 'checklist',
      'Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; ' +
      'Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; ' +
      'Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; ' +
      'Hartmann procedure; Subtotal colectomy; Total colectomy; ' +
      'Total proctocolectomy; Restorative proctocolectomy with IPAA; Local excision (TAMIS / TEM); ' +
      /* forming a stoma and taking one down now live in their own category */
      'Adhesiolysis; Drainage of abscess; Exploratory laparotomy only'),
    f('colorectal', 'หัตถการ | Procedure', 'cr_urgency', 'ความเร่งด่วน', 'Urgency', 'radio',
      'Elective; Urgent; Emergency'),


    /* Right-sided detail. Every row is gated on the procedure, so these
       questions stay out of the way during a left-sided or rectal case. */
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_approach', 'แนวทางเข้าหา mesentery', 'Approach to the mesentery', 'radio',
      'Medial-to-lateral (SMV first); Inferior / caudal-to-cranial; Superior / cranial-to-caudal; ' +
      'Lateral-to-medial; Combined',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_distance_icv', 'ระยะจากลิ้นไอลีโอซีคัล (ซม.)',
      'Distance from the ileocecal valve (cm)', 'number', '',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_ileal_margin', 'ระยะตัดลำไส้เล็กจากลิ้นไอลีโอซีคัล (ซม.)',
      'Ileal transection, distance from the ileocecal valve (cm)', 'number', '',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_cme', 'การตัด mesocolon แบบสมบูรณ์ (CME)', 'Complete mesocolic excision', 'radio',
      'Yes; No', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_cvl', 'การผูกหลอดเลือดที่ต้นทาง (CVL)', 'Central vascular ligation', 'radio',
      'Yes; No', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_nodes', 'ระดับการเลาะต่อมน้ำเหลือง', 'Lymphadenectomy (right-sided)', 'radio',
      'D2; D3', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_rca', 'หลอดเลือด right colic', 'Right colic artery', 'radio',
      'Present, divided; Absent', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_vessels', 'หลอดเลือดที่ตัด', 'Vessels divided', 'checklist',
      'Ileocolic; Right colic; Middle colic — right branch; Middle colic — trunk', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_vessel_control', 'วิธีตัดหลอดเลือด', 'Vessel control', 'checklist',
      'Energy device; Metal clips; Hem-o-lok 5 mm; Hem-o-lok 10 mm; Suture ligation; Vascular stapler',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_anast_site', 'ตำแหน่งการต่อลำไส้', 'Anastomosis performed', 'radio',
      'Intracorporeal; Extracorporeal', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_anast_config', 'รูปแบบการต่อลำไส้', 'Anastomosis configuration', 'radio',
      'Isoperistaltic side-to-side; Antiperistaltic side-to-side; End-to-side; Hand-sewn end-to-end',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_stapler', 'เครื่องเย็บที่ใช้', 'Linear stapler used', 'radio',
      'GIA 80; Endo GIA 60; Signia; Echelon; Tri-stapler', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_enterotomy', 'การปิดรูเย็บลำไส้', 'Enterotomy closure', 'radio',
      'Stapled; Hand-sewn two layers; Hand-sewn single layer', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_mesenteric', 'ช่องว่าง mesentery', 'Mesenteric defect', 'radio',
      'Closed; Left open', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_mesenteric_material', 'ไหมที่ใช้ปิด', 'Mesenteric defect — suture', 'text',
      '', 'cr_r_mesenteric = Closed'),
    f('colorectal', 'ลำไส้ใหญ่ด้านขวา | Right-sided colectomy', 'cr_r_mesenteric_fashion', 'วิธีเย็บ', 'Mesenteric defect — technique', 'radio',
      'Interrupted; Running; Running barbed', 'cr_r_mesenteric = Closed'),

    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_vascular', 'การผูกหลอดเลือด', 'Vascular ligation', 'radio',
      'High tie (at origin); Low tie; Not applicable',
      'cr_procedure = Total proctocolectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_ima', 'การผูกหลอดเลือด IMA', 'Inferior mesenteric artery', 'radio',
      'High tie (at origin); Low tie; Not applicable',
      'cr_procedure = Abdominoperineal resection; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_imv', 'การผูกหลอดเลือด IMV', 'Inferior mesenteric vein', 'radio',
      'High tie (below the pancreas); Low tie (at the level of the IMA); Not applicable',
      'cr_procedure = Abdominoperineal resection; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_lymphadenectomy', 'การเลาะต่อมน้ำเหลือง', 'Lymphadenectomy', 'radio',
      'D1; D2; D3 / CME; Not applicable',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_enbloc', 'ตัดอวัยวะข้างเคียงร่วม',
      'En-bloc resection of the invaded organ', 'radio', 'Yes; No',
      'cr_f_invasion = Yes || cr_f_uterus = Abnormal || cr_f_ovaries = Abnormal'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_enbloc_detail', 'อวัยวะที่ตัดร่วม',
      'En-bloc resection — specify', 'text', '', 'cr_enbloc = Yes'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_splenic_flexure', 'mobilize splenic flexure', 'Splenic flexure mobilization', 'radio',
      'Yes; No; Not applicable',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_splenic_approach', 'วิธีเลาะ splenic flexure',
      'Splenic flexure — approach', 'radio',
      'Inferior; Anterior; Lateral; Combined inferior, anterior and lateral',
      'cr_splenic_flexure = Yes'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_margin_prox', 'ขอบตัดด้านต้น (ซม.)', 'Proximal resection margin (cm)', 'number',
      '', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_margin_dist', 'ขอบตัดด้านปลาย (ซม.)', 'Distal resection margin (cm)', 'number',
      '', 'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; Hartmann procedure; Subtotal colectomy; Total colectomy; Total proctocolectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_mesenteric_margin', 'ขอบ mesentery (ซม.)',
      'Mesenteric resection margin (cm)', 'number', '',
      'cr_procedure = Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection'),

    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_anast_config', 'รูปแบบการต่อ', 'Anastomosis configuration', 'radio',
      'End-to-end; Side-to-side; End-to-side; Side-to-end; Colonic J-pouch',
      'cr_procedure != Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_diverting', 'ทวารเทียมชั่วคราว', 'Diverting stoma', 'radio',
      'None; Loop ileostomy; Loop colostomy',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy; Restorative proctocolectomy with IPAA'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_perfusion', 'ประเมินเลือดมาเลี้ยง', 'Perfusion assessment', 'radio',
      'Clinical only; ICG fluorescence; Not assessed',
      'cr_procedure = Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy; Restorative proctocolectomy with IPAA'),

    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_drain', 'ชนิดท่อระบาย', 'Drain type', 'text'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_drain_site', 'ตำแหน่งท่อระบาย', 'Drain site', 'radio',
      'Cul-de-sac (pelvis); Right paracolic gutter; Left paracolic gutter; Subhepatic; ' +
      'Subphrenic; Adjacent to the anastomosis; Other'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_drain_exit', 'ตำแหน่งที่ผิวหนัง', 'Drain exit through the skin', 'radio',
      'Left lower quadrant port site; Right lower quadrant port site; ' +
      'Left upper quadrant port site; Right upper quadrant port site; ' +
      'Separate stab incision; Through the extraction wound; Other'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_closure_sheath_material', 'ไหมเย็บชั้น sheath', 'Fascia / sheath — suture', 'text'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_closure_sheath_fashion', 'วิธีเย็บ sheath', 'Fascia / sheath — technique', 'radio',
      'Continuous; Interrupted; Continuous with interrupted reinforcement'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_closure_skin_material', 'วัสดุปิดผิวหนัง', 'Skin — material', 'text'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_closure_skin_fashion', 'วิธีปิดผิวหนัง', 'Skin — technique', 'radio',
      'Interrupted; Continuous; Other'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_count', 'นับผ้าซับและเครื่องมือครบ', 'Sponge and instrument count correct', 'checkbox'),


    /* ---- structured operative findings, colorectal ---- */
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_location', 'ตำแหน่งรอยโรค', 'Tumor location', 'radio',
      'Cecum; Ascending colon; Hepatic flexure; Transverse colon — proximal; ' +
      'Transverse colon — mid; Transverse colon — distal; Splenic flexure; Descending colon; ' +
      'Descendosigmoid colon; Sigmoid colon; Rectosigmoid colon; Rectum — upper; ' +
      'Rectum — mid; Rectum — lower'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_size_w', 'กว้าง (ซม.)', 'Width (cm)', 'number'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_size_l', 'ยาว (ซม.)', 'Length (cm)', 'number'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_size_h', 'หนา (ซม.)', 'Height (cm)', 'number'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_appearance', 'ลักษณะรอยโรค', 'Appearance', 'radio',
      'Polypoid; Ulcerated; Ulceroproliferative; Annular; Circumferential; Other'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_annular_pct', 'สัดส่วนรอบวง (%)', 'Circumference involved (%)', 'number'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_tumor_distance', 'ระยะจากขอบทวาร (ซม.)',
      'Distance of the tumor from the anal verge (cm)', 'number', '',
      'cr_f_location = Transverse colon — proximal; Transverse colon — mid; Transverse colon — distal; Splenic flexure; Descending colon; Descendosigmoid colon; Sigmoid colon; Rectosigmoid colon; Rectum — upper; Rectum — mid; Rectum — lower'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_obstruction', 'ลำไส้อุดตัน', 'Obstruction', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_perforation', 'ลำไส้ทะลุ', 'Perforation', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_serosa', 'เยื่อหุ้มลำไส้ถูกรุกล้ำ', 'Serosal involvement', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_invasion', 'รุกล้ำอวัยวะข้างเคียง', 'Adjacent organ invasion', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_invasion_detail', 'อวัยวะที่ถูกรุกล้ำ', 'Organ invaded — specify', 'text',
      '', 'cr_f_invasion = Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_liver', 'ก้อนที่ตับ', 'Liver nodule', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_liver_detail', 'รายละเอียดก้อนที่ตับ', 'Liver nodule — specify', 'text',
      '', 'cr_f_liver = Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_peritoneal', 'ก้อนในเยื่อบุช่องท้อง', 'Peritoneal nodule', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_peritoneal_detail', 'รายละเอียด', 'Peritoneal nodule — specify', 'text',
      '', 'cr_f_peritoneal = Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_nodes', 'ต่อมน้ำเหลืองที่สงสัยการแพร่กระจาย', 'Suspicious metastatic lymph node', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_nodes_detail', 'ตำแหน่งต่อมน้ำเหลือง', 'Lymph node — specify', 'text',
      '', 'cr_f_nodes = Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_synchronous', 'รอยโรคร่วม', 'Synchronous lesion', 'radio', 'No; Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_synchronous_detail', 'รายละเอียดรอยโรคร่วม', 'Synchronous lesion — specify', 'text',
      '', 'cr_f_synchronous = Yes'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_uterus', 'มดลูก', 'Uterus', 'radio', 'Normal; Abnormal', 'sex = หญิง / Female'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_uterus_detail', 'ความผิดปกติของมดลูก', 'Uterus — specify', 'text',
      '', 'cr_f_uterus = Abnormal'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_ovaries', 'รังไข่', 'Ovaries', 'radio', 'Normal; Abnormal', 'sex = หญิง / Female'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_ovaries_detail', 'ความผิดปกติของรังไข่', 'Ovaries — specify', 'text',
      '', 'cr_f_ovaries = Abnormal'),
    f('colorectal', 'สิ่งตรวจพบ | Operative findings', 'cr_f_plane_quality', 'คุณภาพระนาบ CME / TME', 'CME / TME specimen quality', 'radio',
      'Complete; Nearly complete; Incomplete'),


    /* ---------------- LEFT-SIDED AND RECTAL ---------------- */
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_approach', 'แนวทางเข้าหา mesentery', 'Approach to the mesentery', 'radio',
      'Medial-to-lateral; Lateral-to-medial; Combined; Retroperitoneal-first',
      'cr_procedure = Abdominoperineal resection; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_vessel_control', 'วิธีตัดหลอดเลือด', 'Vessel control', 'checklist',
      'Energy device; Metal clips; Hem-o-lok 5 mm; Hem-o-lok 10 mm; Suture ligation; Vascular stapler',
      'cr_procedure = Abdominoperineal resection; Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_sra', 'หลอดเลือด superior rectal', 'Superior rectal artery', 'radio',
      'Divided; Preserved', 'cr_procedure = Left hemicolectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_imv_preserve', 'เก็บ IMV ไว้', 'Inferior mesenteric vein preserved', 'radio',
      'Yes; No', 'cr_procedure = Left hemicolectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_transection_size', 'ขนาดเครื่องเย็บ', 'Stapler cartridge length', 'radio',
      '30 mm; 45 mm; 60 mm; Curved (Contour); Open linear stapler (TA)',
      'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_transection_color', 'สีของ cartridge', 'Cartridge colour (staple height)', 'radio',
      'White (2.5 mm); Blue (3.5 mm); Gold (3.8 mm); Green (4.1 mm); Black (4.2 mm); ' +
      'Purple (tri-staple); Tan (tri-staple); Black (tri-staple)',
      'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_firings', 'จำนวนครั้งที่ยิง', 'Number of stapler firings', 'number', '',
      'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_circular', 'ขนาด circular stapler', 'Circular stapler size', 'radio',
      '25 mm; 28 mm; 29 mm; 31 mm; 33 mm; Not used', 'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_doughnuts', 'Doughnuts', 'Anastomotic doughnuts', 'radio',
      'Complete; Incomplete — reinforced; Not applicable', 'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_washout', 'ล้างลำไส้ส่วนปลายก่อนตัด', 'Rectal washout before transection', 'radio',
      'Yes; No', 'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_washout_solution', 'น้ำยาที่ใช้ล้าง', 'Washout solution', 'radio',
      'Normal saline; Povidone-iodine; Normal saline with povidone-iodine; Sterile water; Other',
      'cr_l_washout = Yes'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_washout_volume', 'ปริมาณ (มล.)', 'Washout volume (mL)', 'number', '',
      'cr_l_washout = Yes'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_clamp', 'การหนีบลำไส้ส่วนปลาย', 'Distal bowel occlusion', 'radio',
      'Endoscopic bulldog clamp; Right-angled clamp; Umbilical tape; None',
      'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Hartmann procedure; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_l_leak_method', 'วิธีทดสอบรอยรั่ว', 'Air-leak test method', 'radio',
      'Colonoscopic; Rigid proctoscope; Bulb syringe; Not performed', 'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy'),
    f('colorectal', 'ลำไส้ใหญ่ด้านซ้าย | Left-sided & rectal resection', 'cr_leak_test',
      'ผลการทดสอบรอยรั่ว', 'Air-leak test result', 'radio',
      'Negative; Positive – repaired; Not performed',
      'cr_procedure = Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Subtotal colectomy; Total colectomy'),

    /* ---------------- RECTAL DETAIL ---------------- */
    f('colorectal', 'ทวารหนัก | Rectal detail', 'cr_rect_tme', 'ขอบเขตการเลาะ mesorectum', 'Extent of mesorectal excision', 'radio',
      'Total (TME); Tumor-specific (TSME)', 'cr_procedure = Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection'),
    f('colorectal', 'ทวารหนัก | Rectal detail', 'cr_rect_nerve', 'การรักษาเส้นประสาทอัตโนมัติ', 'Autonomic nerve preservation', 'radio',
      'Complete, bilateral; Partial; Sacrificed for oncological clearance; Not identified',
      'cr_procedure = Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection'),
    f('colorectal', 'ทวารหนัก | Rectal detail', 'cr_rect_mobilisation', 'ระยะเลาะใต้ก้อน (ซม.)',
      'Mesorectal division below the tumor (cm)', 'number', '',
      'cr_rect_tme = Tumor-specific (TSME)'),
    f('colorectal', 'ทวารหนัก | Rectal detail', 'cr_rect_isr', 'Intersphincteric resection', 'Intersphincteric resection', 'radio',
      'None; Partial; Subtotal; Total', 'cr_procedure = Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis'),
    f('colorectal', 'ทวารหนัก | Rectal detail', 'cr_rect_level', 'ระดับรอยต่อจากขอบทวาร (ซม.)', 'Anastomotic level from the anal verge (cm)', 'number', '',
      'cr_procedure = Anterior resection; Low anterior resection; Ultra-low anterior resection with coloanal anastomosis'),

    /* ---------------- PERINEAL PHASE ---------------- */
    f('colorectal', 'ฝีเย็บ | Perineal phase (APR)', 'cr_ap_position', 'ท่าในช่วงฝีเย็บ', 'Position for the perineal phase', 'radio',
      'Prone jackknife; Lithotomy', 'cr_procedure = Abdominoperineal resection'),
    f('colorectal', 'ฝีเย็บ | Perineal phase (APR)', 'cr_ap_type', 'ชนิดของการผ่าตัด', 'Type of perineal excision', 'radio',
      'Standard APR; Extralevator (ELAPE); Ischioanal', 'cr_procedure = Abdominoperineal resection'),
    f('colorectal', 'ฝีเย็บ | Perineal phase (APR)', 'cr_ap_levator', 'ระดับการตัดกล้ามเนื้อ levator', 'Level of levator division', 'radio',
      'At the pelvic sidewall; At the insertion on the rectum', 'cr_procedure = Abdominoperineal resection'),
    f('colorectal', 'ฝีเย็บ | Perineal phase (APR)', 'cr_ap_closure', 'การปิดแผลฝีเย็บ', 'Perineal wound closure', 'radio',
      'Primary, layered; Biologic mesh; Myocutaneous flap; Omentoplasty; Left open with packing',
      'cr_procedure = Abdominoperineal resection'),
    f('colorectal', 'ฝีเย็บ | Perineal phase (APR)', 'cr_ap_drain', 'ท่อระบายหน้ากระดูก sacrum', 'Presacral drain', 'radio',
      'Yes; No', 'cr_procedure = Abdominoperineal resection'),

    /* ---------------- HARTMANN AND REVERSAL ---------------- */
    f('colorectal', 'Hartmann | Hartmann & reversal', 'cr_ha_stump', 'การจัดการตอลำไส้ส่วนปลาย', 'Rectal stump', 'radio',
      'Closed with a linear stapler; Hand-sewn closure; Brought out as a mucous fistula',
      'cr_procedure = Hartmann procedure'),
    f('colorectal', 'Hartmann | Hartmann & reversal', 'cr_ha_stump_marked', 'การทำเครื่องหมายที่ตอลำไส้', 'Stump marked for future identification', 'radio',
      'Long non-absorbable sutures; Metal clips; Not marked', 'cr_procedure = Hartmann procedure'),
    f('colorectal', 'Hartmann | Hartmann & reversal', 'cr_ha_adhesio', 'การเลาะพังผืด', 'Adhesiolysis required', 'radio',
      'None; Limited; Extensive', 'cr_procedure = Hartmann procedure'),

    /* ---------------- STOMA FORMATION ---------------- */
    f('colorectal', 'ทวารเทียม | Stoma formation', 'cr_st_site', 'ตำแหน่งทวารเทียม', 'Stoma site', 'radio',
      'Right iliac fossa; Left iliac fossa; Right upper quadrant; Left upper quadrant; Through the midline wound',
      'cr_procedure = Abdominoperineal resection; Hartmann procedure || cr_diverting = Loop ileostomy; Loop colostomy'),
    f('colorectal', 'ทวารเทียม | Stoma formation', 'cr_st_marked', 'ทำเครื่องหมายก่อนผ่าตัด', 'Site marked pre-operatively', 'radio',
      'Yes, by a stoma nurse; Yes, by the surgeon; No', 'cr_procedure = Abdominoperineal resection; Hartmann procedure || cr_diverting = Loop ileostomy; Loop colostomy'),
    f('colorectal', 'ทวารเทียม | Stoma formation', 'cr_st_trephine', 'วิธีเปิดผนังหน้าท้อง', 'Trephine', 'radio',
      'Circular skin disc; Transverse incision', 'cr_procedure = Abdominoperineal resection; Hartmann procedure || cr_diverting = Loop ileostomy; Loop colostomy'),
    f('colorectal', 'ทวารเทียม | Stoma formation', 'cr_st_rod', 'ใส่แท่งรอง', 'Supporting rod', 'radio', 'Yes; No',
      'cr_procedure = Abdominoperineal resection; Hartmann procedure || cr_diverting = Loop ileostomy; Loop colostomy'),
    f('colorectal', 'ทวารเทียม | Stoma formation', 'cr_st_suture', 'ไหมเย็บ mucocutaneous', 'Mucocutaneous suture', 'text', '',
      'cr_procedure = Abdominoperineal resection; Hartmann procedure || cr_diverting = Loop ileostomy; Loop colostomy'),

    /* ---------------- STOMA CLOSURE ---------------- */

    /* ---------------- LOCAL EXCISION ---------------- */
    f('colorectal', 'ตัดเฉพาะที่ | Local excision', 'cr_le_platform', 'อุปกรณ์ที่ใช้', 'Platform', 'radio',
      'TAMIS; TEM; Parks retractor; Rigid proctoscope', 'cr_procedure = Local excision (TAMIS / TEM)'),
    f('colorectal', 'ตัดเฉพาะที่ | Local excision', 'cr_le_thickness', 'ความลึกของการตัด', 'Depth of excision', 'radio',
      'Full thickness; Submucosal', 'cr_procedure = Local excision (TAMIS / TEM)'),
    f('colorectal', 'ตัดเฉพาะที่ | Local excision', 'cr_le_defect', 'การปิดแผลผนังลำไส้', 'Defect closure', 'radio',
      'Closed transversely; Closed longitudinally; Left open', 'cr_procedure = Local excision (TAMIS / TEM)'),
    f('colorectal', 'ตัดเฉพาะที่ | Local excision', 'cr_le_orientation', 'การจัดวางชิ้นเนื้อ', 'Specimen pinned and oriented', 'radio',
      'Yes; No', 'cr_procedure = Local excision (TAMIS / TEM)'),

    /* ---------------- ILEAL POUCH ---------------- */
    f('colorectal', 'ถุงลำไส้เล็ก | Ileal pouch', 'cr_ip_config', 'รูปแบบถุงลำไส้', 'Pouch configuration', 'radio',
      'J-pouch; S-pouch; W-pouch; No pouch', 'cr_procedure = Restorative proctocolectomy with IPAA; Total proctocolectomy'),
    f('colorectal', 'ถุงลำไส้เล็ก | Ileal pouch', 'cr_ip_limb', 'ความยาวแขนถุง (ซม.)', 'Pouch limb length (cm)', 'number', '',
      'cr_procedure = Restorative proctocolectomy with IPAA; Total proctocolectomy'),
    f('colorectal', 'ถุงลำไส้เล็ก | Ileal pouch', 'cr_ip_anast', 'การต่อถุงกับทวารหนัก', 'Pouch–anal anastomosis', 'radio',
      'Stapled; Hand-sewn with mucosectomy; Not performed', 'cr_procedure = Restorative proctocolectomy with IPAA; Total proctocolectomy'),
    f('colorectal', 'ถุงลำไส้เล็ก | Ileal pouch', 'cr_ip_divert', 'ทวารเทียมชั่วคราว', 'Diverting loop ileostomy', 'radio',
      'Yes; No', 'cr_procedure = Restorative proctocolectomy with IPAA; Total proctocolectomy'),

    f('colorectal', 'รายละเอียดขั้นตอน | Operative steps', 'cr_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('colorectal', 'รายละเอียดขั้นตอน | Operative steps', 'cr_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea'),

    /* ---------------- FISTULA ---------------- */
    f('fistula', 'การประเมิน | Assessment', 'fi_position', 'ท่าผู้ป่วย', 'Patient position', 'radio',
      'Prone jackknife; Lithotomy; Prone splitleg'),
    f('fistula', 'การประเมิน | Assessment', 'fi_prior', 'เคยผ่าตัดบริเวณนี้มาก่อน', 'Previous anorectal surgery', 'radio',
      'None; Previous fistula surgery; Previous abscess drainage; Previous hemorrhoid surgery; Other'),
    f('fistula', 'การประเมิน | Assessment', 'fi_aetiology', 'สาเหตุ', 'Aetiology', 'radio',
      'Cryptoglandular; Crohn disease; Tuberculosis; Post-operative; Malignancy; Radiation; Other'),

    f('fistula', 'กายวิภาค | Anatomy', 'fi_internal_opening', 'ตำแหน่งรูเปิดภายใน (นาฬิกา)', 'Internal opening (o\'clock)', 'text'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_internal_height', 'ความสูงรูเปิดภายในจากขอบทวาร (ซม.)', 'Height of internal opening from anal verge (cm)', 'number'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_external_opening', 'ตำแหน่งรูเปิดภายนอก (นาฬิกา)', 'External opening (o\'clock)', 'text'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_external_distance', 'ระยะรูเปิดภายนอกจากขอบทวาร (ซม.)', 'Distance of external opening from anal verge (cm)', 'number'),
    /* type 'repeat' renders a block the surgeon can add to; the sub-fields
       live in REPEAT_FIELDS below and the answers are stored in this one
       column as JSON, so the Sheet gains no columns as tracts are added */
    f('fistula', 'กายวิภาค | Anatomy', 'fi_tracts',
      'ทางเดินเพิ่มเติม', 'Additional tracts', 'repeat'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_parks', 'Parks classification', 'Parks classification', 'radio',
      'Superficial / submucosal; Intersphincteric; Transsphincteric; Suprasphincteric; Extrasphincteric'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_complexity', 'ความซับซ้อน', 'Complexity', 'radio', 'Simple; Complex'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_features', 'ลักษณะเพิ่มเติม', 'Additional features', 'checklist',
      'None; Secondary tract; Horseshoe extension; Abscess cavity; Supralevator extension; ' +
      'Multiple external openings; Anterior fistula in female; Recurrent fistula'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_sphincter_involved', 'สัดส่วนหูรูดที่เกี่ยวข้อง (%)', 'Proportion of external sphincter involved (%)', 'number', '',
      'fi_parks != Superficial / submucosal; Intersphincteric'),

    f('fistula', 'หัตถการ | Procedure', 'fi_procedure', 'การผ่าตัดที่ทำ', 'Procedure performed', 'checklist',
      'Fistulotomy; Fistulectomy; Fistulotomy with immediate sphincteroplasty (FIPS); Fistulectomy with immediate sphincteroplasty (FIPS); Cutting seton; Draining (loose) seton; ' +
      'LIFT (ligation of intersphincteric fistula tract); Mucosal advancement flap; ' +
      'Anodermal advancement flap; VAAFT; Fibrin glue; Fistula plug; ' +
      'Laser closure (FiLaC); Curettage of tract; Drainage of abscess; ' +
      'Examination under anesthesia only; Other'),
    f('fistula', 'หัตถการ | Procedure', 'fi_seton_material', 'วัสดุ seton', 'Seton material', 'text', '',
      'fi_procedure = Cutting seton; Draining (loose) seton'),
    f('fistula', 'หัตถการ | Procedure', 'fi_marsupialise', 'Marsupialization of wound edges', 'Marsupialization', 'checkbox', '',
      'fi_procedure = Fistulotomy; Fistulotomy with immediate sphincteroplasty (FIPS)'),


    /* ---- how the tract was found, and what was done to it ---- */
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_identify', 'วิธีหารูเปิดภายใน', 'How the internal opening was identified', 'checklist',
      'Malleable probe; Hydrogen peroxide; Methylene blue; Milk of the tract; ' +
      'Correlation with pre-operative MRI; Normal saline injection; Core-out of the tract; Not identified'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_probe', 'ผลการสอดโพรบ', 'Probe passed along the tract', 'radio',
      'Yes, easily; Yes, with difficulty; No'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_lay_open', 'สัดส่วนหูรูดที่ถูกตัด (%)', 'External sphincter divided (%)', 'number', '',
      'fi_procedure = Fistulotomy; Fistulotomy with immediate sphincteroplasty (FIPS); Fistulectomy with immediate sphincteroplasty (FIPS) && fi_parks != Superficial / submucosal; Intersphincteric'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_curettage', 'การขูดโพรง', 'Curettage of granulation tissue', 'radio',
      'Yes; No', 'fi_procedure = Fistulotomy; Fistulectomy'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_fips_repair',
      'วิธีซ่อมหูรูด', 'Sphincter repair', 'radio',
      'End-to-end apposition; Overlapping repair',
      'fi_procedure = Fistulotomy with immediate sphincteroplasty (FIPS); Fistulectomy with immediate sphincteroplasty (FIPS)'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_fips_suture',
      'ไหมเย็บซ่อมหูรูด', 'Sphincter repair suture', 'text', '',
      'fi_procedure = Fistulotomy with immediate sphincteroplasty (FIPS); Fistulectomy with immediate sphincteroplasty (FIPS)'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_seton_type', 'ชนิด seton', 'Seton type', 'radio',
      'Loose draining; Cutting, to be tightened; Chemical', 'fi_procedure = Cutting seton; Draining (loose) seton'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_seton_plan', 'แผนการปรับ seton', 'Seton plan', 'text', '',
      'fi_procedure = Cutting seton; Draining (loose) seton'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_lift_tract', 'การจัดการ intersphincteric tract', 'Intersphincteric tract at LIFT', 'radio',
      'Ligated and divided; Ligated only; Excised', 'fi_procedure = LIFT (ligation of intersphincteric fistula tract)'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_lift_suture', 'ไหมที่ใช้ผูก', 'Ligation suture', 'text', '',
      'fi_procedure = LIFT (ligation of intersphincteric fistula tract)'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_lift_external', 'การจัดการรูเปิดภายนอก', 'External opening at LIFT', 'radio',
      'Cored out and left open; Curetted and left open; Closed', 'fi_procedure = LIFT (ligation of intersphincteric fistula tract)'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_flap_type', 'ชนิดของ flap', 'Flap type', 'radio',
      'Mucosal; Mucosa and submucosa; Full thickness rectal wall; Anodermal',
      'fi_procedure = Mucosal advancement flap; Anodermal advancement flap'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_flap_suture', 'ไหมเย็บ flap', 'Flap suture', 'text', '',
      'fi_procedure = Mucosal advancement flap; Anodermal advancement flap'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_abscess_site', 'ตำแหน่งฝี', 'Abscess location', 'radio',
      'Perianal; Ischioanal; Intersphincteric; Supralevator; Horseshoe',
      'fi_procedure = Drainage of abscess'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_abscess_pus', 'ปริมาณหนอง (มล.)', 'Volume of pus drained (mL)', 'number', '',
      'fi_procedure = Drainage of abscess'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_abscess_drain', 'สิ่งที่ใส่คาไว้', 'Left in the cavity', 'radio',
      'Nothing; Corrugated drain; Mushroom catheter; Packing', 'fi_procedure = Drainage of abscess'),

    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_wound', 'การดูแลแผล', 'Wound at the end of the operation', 'radio',
      'Left open; Marsupialized; Partially closed',
      'fi_procedure != Examination under anesthesia only'),
    f('fistula', 'เทคนิคการผ่าตัด | Operative technique', 'fi_drain',
      'ท่อระบายที่ใส่ไว้', 'Drain placement', 'radio',
      'None; Penrose drain; Rubber catheter; Other'),

    f('fistula', 'รายละเอียดขั้นตอน | Operative steps', 'fi_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('fistula', 'รายละเอียดขั้นตอน | Operative steps', 'fi_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea'),

    /* ---------------- HAEMORRHOID ---------------- */
    f('hemorrhoid', 'การประเมิน | Assessment', 'he_position', 'ท่าผู้ป่วย', 'Patient position', 'radio',
      'Prone jackknife; Lithotomy; Left lateral'),
    f('hemorrhoid', 'การประเมิน | Assessment', 'he_grade', 'ระดับของริดสีดวง', 'Goligher grade', 'radio',
      'Grade I; Grade II; Grade III; Grade IV; External only; Thrombosed external'),
    f('hemorrhoid', 'การประเมิน | Assessment', 'he_type', 'ชนิด', 'Type', 'radio',
      'Internal; External; Mixed / interno-external'),
    f('hemorrhoid', 'การประเมิน | Assessment', 'he_positions', 'ตำแหน่งหัวริดสีดวง', 'Position of piles', 'checklist',
      '3 o\'clock; 7 o\'clock; 11 o\'clock; 1 o\'clock; 5 o\'clock; 9 o\'clock; Circumferential'),
    f('hemorrhoid', 'การประเมิน | Assessment', 'he_associated', 'พยาธิสภาพร่วม', 'Associated pathology', 'checklist',
      'Anal fissure; Skin tag; Anal fistula; Perianal abscess; Rectal prolapse; ' +
      'Hypertrophied anal papilla; Anal stenosis; None'),

    f('hemorrhoid', 'หัตถการ | Procedure', 'he_procedure', 'การผ่าตัดที่ทำ', 'Procedure performed', 'checklist',
      'Open hemorrhoidectomy (Milligan-Morgan); Closed hemorrhoidectomy (Ferguson); ' +
      'Stapled hemorrhoidopexy (PPH); LigaSure / vessel-sealing hemorrhoidectomy; ' +
      'Doppler-guided hemorrhoidal artery ligation (HAL / RAR); Rubber band ligation; ' +
      'Sclerotherapy; Excision of thrombosed external pile; Lateral internal sphincterotomy; ' +
      'Fissurectomy; Excision of skin tag; Other'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_piles_excised', 'จำนวนหัวที่ตัด', 'Number of piles excised', 'number'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_energy', 'เครื่องมือที่ใช้', 'Energy device', 'radio',
      'Monopolar diathermy; LigaSure; Harmonic; Scissors / cold steel; Stapler; Laser'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_pedicle', 'การผูกขั้ว', 'Pedicle ligation', 'text'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_bridge', 'เหลือ mucosal bridge เพียงพอ', 'Adequate mucocutaneous bridges preserved', 'checkbox'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_packing', 'ใส่ anal packing', 'Anal packing inserted', 'checkbox'),
    f('hemorrhoid', 'หัตถการ | Procedure', 'he_analgesia', 'การระงับปวดเฉพาะที่', 'Local analgesia used', 'text'),


    /* ---- technique, shown only for the operation actually done ---- */
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_pedicle_suture', 'ไหมผูกขั้ว', 'Pedicle suture', 'text', '',
      'he_procedure = Open hemorrhoidectomy (Milligan-Morgan); Closed hemorrhoidectomy (Ferguson); LigaSure / vessel-sealing hemorrhoidectomy'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_pedicle_method', 'วิธีผูกขั้ว', 'Pedicle ligation technique', 'radio',
      'Transfixion suture; Simple ligature; Vessel sealed, no suture', 'he_procedure = Open hemorrhoidectomy (Milligan-Morgan); Closed hemorrhoidectomy (Ferguson); LigaSure / vessel-sealing hemorrhoidectomy'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_bridges', 'จำนวน mucocutaneous bridge ที่เหลือ', 'Mucocutaneous bridges preserved', 'number', '',
      'he_procedure = Open hemorrhoidectomy (Milligan-Morgan); Closed hemorrhoidectomy (Ferguson); LigaSure / vessel-sealing hemorrhoidectomy'),

    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_pph_size', 'ขนาด stapler', 'Circular stapler size', 'radio',
      '32 mm; 33 mm; 34 mm', 'he_procedure = Stapled hemorrhoidopexy (PPH)'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_pph_height', 'ระยะ purse-string เหนือ dentate line (ซม.)',
      'Purse-string height above the dentate line (cm)', 'number', '', 'he_procedure = Stapled hemorrhoidopexy (PPH)'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_pph_reinforce', 'การเสริมแนวเย็บ', 'Staple line reinforced', 'radio',
      'Yes; No', 'he_procedure = Stapled hemorrhoidopexy (PPH)'),

    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_hal_arteries', 'จำนวนหลอดเลือดที่ผูก', 'Number of arteries ligated', 'number', '',
      'he_procedure = Doppler-guided hemorrhoidal artery ligation (HAL / RAR)'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_hal_rar', 'ทำ rectoanal repair', 'Rectoanal repair (RAR) performed', 'radio',
      'Yes; No', 'he_procedure = Doppler-guided hemorrhoidal artery ligation (HAL / RAR)'),

    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_lis_side', 'ตำแหน่งที่ตัดหูรูด', 'Sphincterotomy position', 'radio',
      'Left lateral (3 o\'clock); Right lateral (9 o\'clock)', 'he_procedure = Lateral internal sphincterotomy'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_lis_technique', 'วิธีตัดหูรูด', 'Sphincterotomy technique', 'radio',
      'Open; Closed', 'he_procedure = Lateral internal sphincterotomy'),
    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_lis_length', 'ความยาวที่ตัด (ซม.)', 'Length divided (cm)', 'number', '',
      'he_procedure = Lateral internal sphincterotomy'),

    f('hemorrhoid', 'เทคนิคการผ่าตัด | Operative technique', 'he_band_number', 'จำนวนยางที่รัด', 'Number of bands or injections', 'number', '',
      'he_procedure = Rubber band ligation; Sclerotherapy'),

    f('hemorrhoid', 'รายละเอียดขั้นตอน | Operative steps', 'he_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('hemorrhoid', 'รายละเอียดขั้นตอน | Operative steps', 'he_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea'),

    /* ---------------- OTHERS ---------------- */
    /* ---------------- stoma surgery ---------------- */
    f('stoma', 'การเข้าถึง | Approach', 'st_approach',
      'วิธีการผ่าตัด', 'Approach', 'radio', 'Trephine (local incision only); Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'การเข้าถึง | Approach', 'st_position',
      'ท่าผู้ป่วย', 'Patient position', 'radio', 'Supine; Modified lithotomy (Lloyd-Davies)'),
    f('stoma', 'การเข้าถึง | Approach', 'st_incision',
      'แผลผ่าตัด', 'Incision', 'textarea', '',
      'st_procedure = Stoma closure && st_approach = Open (laparotomy); Laparoscopic converted to open; Robotic'),
    f('stoma', 'หัตถการ | Procedure', 'st_procedure',
      'การผ่าตัดที่ทำ', 'Procedure performed', 'radio', 'Loop ileostomy; Loop colostomy; End colostomy; End ileostomy; Stoma closure'),
    f('stoma', 'หัตถการ | Procedure', 'st_urgency',
      'ความเร่งด่วน', 'Urgency', 'radio', 'Elective; Urgent; Emergency'),
    f('stoma', 'หัตถการ | Procedure', 'st_indication',
      'เหตุผลที่ทำทวารเทียม', 'Reason for the stoma', 'radio',
      'To protect a distal anastomosis; To relieve obstruction; To divert stool away from perineal or perianal sepsis; To divert stool away from a fistula; Palliative diversion; Faecal incontinence; Other',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_type',
      'ทวารเทียมที่ปิด', 'Stoma being closed', 'radio', 'Loop ileostomy; Loop colostomy; End colostomy (Hartmann reversal); End ileostomy',
      'st_procedure = Stoma closure'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_adhesion',
      'พังผืดในช่องท้อง', 'Intra-abdominal adhesions', 'radio', 'None; Filmy, around the stoma only; Dense, around the stoma only; Dense and generalized',
      'st_procedure = Stoma closure'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_enterotomy',
      'ลำไส้บาดเจ็บระหว่างเลาะ', 'Bowel injury during dissection', 'radio', 'None; Serosal tear, repaired; Full-thickness enterotomy, repaired; Required resection of the injured segment',
      'st_procedure = Stoma closure'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_enterotomy_repair',
      'วิธีซ่อมและไหมที่ใช้', 'How it was repaired, and with what', 'text', '',
      'st_enterotomy = Serosal tear, repaired; Full-thickness enterotomy, repaired'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_parastomal',
      'ไส้เลื่อนข้างทวารเทียม', 'Parastomal hernia', 'radio', 'None; Present',
      'st_procedure = Stoma closure'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_parastomal_size',
      'ขนาดคอไส้เลื่อน (ซม.)', 'Hernia defect size (cm)', 'number', '',
      'st_parastomal = Present'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_parastomal_repair',
      'วิธีซ่อมไส้เลื่อน', 'Hernia repair', 'radio', 'Primary suture repair; Mesh repair; Not repaired',
      'st_parastomal = Present'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_laparotomy',
      'ต้องเปิดหน้าท้องหรือไม่', 'Laparotomy required', 'radio', 'No, circumstomal incision only; Yes, midline laparotomy',
      'st_procedure = Stoma closure'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_stump',
      'ปลายลำไส้ส่วนปลายเดิม', 'Rectal stump as found', 'radio', 'Closed with a linear stapler; Hand-sewn closure; Brought out as a mucous fistula',
      'st_type = End colostomy (Hartmann reversal)'),
    f('stoma', 'สิ่งตรวจพบ | Operative findings', 'st_stump_marked',
      'การทำเครื่องหมายไว้ที่ปลายลำไส้', 'Stump marking found', 'radio', 'Long non-absorbable sutures; Metal clips; Not marked',
      'st_type = End colostomy (Hartmann reversal)'),
    f('stoma', 'ทวารเทียม | Stoma formation', 'st_site',
      'ตำแหน่งทวารเทียม', 'Stoma site', 'radio', 'Right iliac fossa; Left iliac fossa; Right upper quadrant; Left upper quadrant; Through the midline wound',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'ทวารเทียม | Stoma formation', 'st_marked',
      'ทำเครื่องหมายก่อนผ่าตัด', 'Site marked pre-operatively', 'radio', 'Yes, by a stoma nurse; Yes, by the surgeon; No',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'ทวารเทียม | Stoma formation', 'st_trephine',
      'วิธีเปิดผนังหน้าท้อง', 'Trephine', 'radio', 'Circular skin disc; Transverse incision',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'ทวารเทียม | Stoma formation', 'st_rod',
      'ใส่แท่งรองใต้ทวารเทียม', 'Supporting rod', 'radio', 'Yes; No',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'ทวารเทียม | Stoma formation', 'st_suture',
      'ไหมเย็บทวารเทียม', 'Maturation suture', 'text', '',
      'st_procedure = Loop ileostomy; Loop colostomy; End colostomy; End ileostomy'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_splenic_flexure',
      'เลาะมุมม้าม', 'Splenic flexure mobilized', 'radio', 'Yes; No',
      'st_type = End colostomy (Hartmann reversal)'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_anast_config',
      'รูปแบบการต่อลำไส้', 'Anastomosis configuration', 'radio',
      'End-to-end; End-to-side; Side-to-end; Side-to-side (functional end-to-end)',
      'st_procedure = Stoma closure'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_method',
      'วิธีต่อลำไส้', 'Anastomosis method', 'radio', 'Hand-sewn; Stapled',
      'st_procedure = Stoma closure'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_hs_material',
      'ไหมที่ใช้เย็บต่อ', 'Suture material', 'text', '',
      'st_method = Hand-sewn'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_hs_technique',
      'ลักษณะการเย็บ', 'Suture technique', 'radio', 'Interrupted; Continuous',
      'st_method = Hand-sewn'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_hs_layers',
      'จำนวนชั้นที่เย็บ', 'Layers', 'radio', 'Single layer; Two layers, with a seromuscular second layer',
      'st_method = Hand-sewn'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_st_device',
      'เครื่องเย็บที่ใช้', 'Stapling device', 'radio', 'Linear cutter (GIA); Circular stapler; Linear (TA)',
      'st_method = Stapled'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_st_circ_size',
      'ขนาดหัวเครื่องเย็บวงกลม', 'Circular stapler size', 'radio', '25 mm; 28 mm; 29 mm; 31 mm; 33 mm',
      'st_st_device = Circular stapler'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_st_gia_len',
      'ความยาวแม็ก', 'Cartridge length', 'radio', '45 mm; 60 mm; 75 mm; 80 mm',
      'st_st_device = Linear cutter (GIA)'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_st_gia_colour',
      'สีแม็ก (ความสูงลวด)', 'Cartridge colour (staple height)', 'radio', 'White; Blue; Gold; Green; Purple; Black',
      'st_st_device = Linear cutter (GIA)'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_st_firings',
      'จำนวนครั้งที่ยิง', 'Number of firings', 'number', '',
      'st_st_device = Linear cutter (GIA)'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel',
      'ปิดรูร่วมด้วย', 'Common channel closed by', 'radio', 'Stapled; Hand-sewn',
      'st_st_device = Linear cutter (GIA)'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel_device',
      'เครื่องเย็บที่ปิดรูร่วม', 'Device used on the common channel', 'radio', 'Linear (TA); Linear cutter (GIA)',
      'st_channel = Stapled'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel_len',
      'ความยาวแม็กที่ปิดรูร่วม', 'Cartridge length, common channel', 'radio', '45 mm; 60 mm; 75 mm; 80 mm',
      'st_channel = Stapled'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel_colour',
      'สีแม็กที่ปิดรูร่วม', 'Cartridge colour, common channel', 'radio', 'White; Blue; Gold; Green; Purple; Black',
      'st_channel = Stapled'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel_material',
      'ไหมที่เย็บปิดรูร่วม', 'Suture material, common channel', 'text', '',
      'st_channel = Hand-sewn'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_channel_technique',
      'ลักษณะการเย็บปิดรูร่วม', 'Suture technique, common channel', 'radio', 'Interrupted; Continuous',
      'st_channel = Hand-sewn'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_resect',
      'ตัดลำไส้ออกหรือไม่', 'Bowel resected', 'radio', 'No; Yes',
      'st_procedure = Stoma closure'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_resect_len',
      'ความยาวลำไส้ที่ตัดออก (ซม.)', 'Length of bowel resected (cm)', 'number', '',
      'st_resect = Yes'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_perfusion',
      'ประเมินเลือดมาเลี้ยง', 'Perfusion assessment', 'radio', 'Clinical only; ICG fluorescence; Not assessed',
      'st_procedure = Stoma closure'),
    f('stoma', 'การต่อลำไส้ | Anastomosis', 'st_leak_test',
      'ผลทดสอบรอยรั่ว', 'Air-leak test result', 'radio', 'Negative; Positive – repaired; Not performed',
      'st_procedure = Stoma closure'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_sheath_material',
      'ไหมเย็บชั้นชีท', 'Sheath suture', 'text', '',
      'st_procedure = Stoma closure || st_approach = Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_sheath_fashion',
      'ลักษณะการเย็บชั้นชีท', 'Sheath closure', 'radio', 'Continuous; Interrupted; Mass closure',
      'st_procedure = Stoma closure || st_approach = Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_wound',
      'การปิดแผลผิวหนัง', 'Skin closure', 'radio', 'Primary; Purse-string; Left open to heal by secondary intention',
      'st_procedure = Stoma closure || st_approach = Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_wound_material',
      'ไหมเย็บผิวหนัง', 'Skin suture', 'text', '',
      'st_wound = Primary; Purse-string'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_drain_site',
      'ท่อระบายในช่องท้อง', 'Intra-abdominal drain', 'radio', 'None; Cul-de-sac (pelvis); Adjacent to the anastomosis; Right paracolic gutter; Left paracolic gutter; Other',
      'st_procedure = Stoma closure || st_approach = Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_drain',
      'ชนิดท่อระบายในช่องท้อง', 'Intra-abdominal drain type', 'text', '',
      'st_drain_site = Cul-de-sac (pelvis); Adjacent to the anastomosis; Right paracolic gutter; Left paracolic gutter; Other'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_drain_sc',
      'ท่อระบายใต้ผิวหนัง', 'Subcutaneous drain', 'radio', 'No; Yes',
      'st_procedure = Stoma closure || st_approach = Open (laparotomy); Laparoscopic; Laparoscopic converted to open; Robotic'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_drain_sc_type',
      'ชนิดท่อระบายใต้ผิวหนัง', 'Subcutaneous drain type', 'text', '',
      'st_drain_sc = Yes'),
    f('stoma', 'ปิดแผลและท่อระบาย | Closure', 'st_count',
      'นับผ้าซับและเครื่องมือครบ', 'Counts correct', 'checkbox', ''),
    f('stoma', 'รายละเอียดขั้นตอน | Operative steps', 'st_steps',
      'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea', ''),
    f('stoma', 'รายละเอียดขั้นตอน | Operative steps', 'st_postop',
      'แผนการรักษาหลังผ่าตัด', 'Post-operative plan', 'textarea', ''),

    f('others', 'หัตถการ | Procedure', 'ot_procedure_name', 'ชื่อการผ่าตัด', 'Name of procedure', 'text'),
    f('others', 'หัตถการ | Procedure', 'ot_position', 'ท่าผู้ป่วย', 'Patient position', 'text'),
    f('others', 'หัตถการ | Procedure', 'ot_incision', 'แผลผ่าตัด', 'Incision', 'text'),
    f('others', 'รายละเอียดขั้นตอน | Operative steps', 'ot_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('others', 'รายละเอียดขั้นตอน | Operative steps', 'ot_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea')
  ];

  global.CATEGORIES = [
    { key: 'colorectal', th: 'ผ่าตัดลำไส้ใหญ่และทวารหนัก', en: 'Colorectal surgery' },
    { key: 'fistula', th: 'ผ่าตัดฝีคัณฑสูตร', en: 'Fistula surgery' },
    { key: 'hemorrhoid', th: 'ผ่าตัดริดสีดวงทวาร', en: 'Hemorrhoid surgery' },
    /* A stoma has no lesion to locate, no margins and no lymphadenectomy,
       so it sat badly among the resections. Forming one and taking one
       down are the same operation seen from opposite ends, and they
       belong together. */
    { key: 'stoma', th: 'ทวารเทียม', en: 'Stoma surgery' },
    { key: 'others', th: 'อื่น ๆ', en: 'Others' }
  ];

  /* -------------------------------------------------------------------
     Sub-fields of a repeating block. The block itself is an ordinary row
     in the Templates tab with type "repeat"; what each entry contains is
     defined here, because a spreadsheet cell is the wrong place to keep a
     nested structure.
     ------------------------------------------------------------------- */
  global.REPEAT_FIELDS = {
    fi_tracts: {
      /* the word used when the block is empty and on the add button */
      th: 'ทางเดิน', en: 'tract',
      fields: [
        { key: 'ext', th: 'รูเปิดภายนอก (นาฬิกา)', en: "External opening (o'clock)", type: 'text' },
        { key: 'dist', th: 'ระยะจากขอบทวาร (ซม.)', en: 'Distance from the anal verge (cm)', type: 'number' },
        { key: 'course', th: 'แนวทางเดิน', en: 'Course', type: 'select',
          options: ['Superficial / submucosal', 'Intersphincteric', 'Transsphincteric',
            'Suprasphincteric', 'Extrasphincteric'] },
        { key: 'into', th: 'เปิดเข้าสู่', en: 'Joins', type: 'select',
          options: ['The same internal opening', 'A separate internal opening',
            'No internal opening found'] },
        { key: 'into_pos', th: 'รูเปิดภายในของทางเดินนี้ (นาฬิกา)',
          en: "Its own internal opening (o'clock)", type: 'text' },
        { key: 'treat', th: 'การจัดการ', en: 'How it was dealt with', type: 'select',
          options: ['Laid open', 'Cored out', 'Curetted', 'Draining seton',
            'Cutting seton', 'Left alone'] }
      ]
    }
  };

})(window);
