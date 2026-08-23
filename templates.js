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

  function f(category, section, key, th, en, type, options) {
    return {
      category: category, section: section, key: key,
      th: th, en: en, type: type,
      options: options ? options.split(';').map(function (s) { return s.trim(); }) : []
    };
  }

  var COMMON = 'ข้อมูลทั่วไป | General';
  var IDENT = 'ผู้ป่วย | Patient';
  var TEAM = 'ทีมผ่าตัด | Operative team';
  var DIAG = 'การวินิจฉัยและหัตถการ | Diagnosis & procedure';

  global.DEFAULT_TEMPLATES = [

    /* ---------------- COMMON: mirrors the MR 08.1 blue form ---------------- */
    f('common', COMMON, 'or_room', 'เลขที่ห้องผ่าตัด', 'OR room', 'text'),
    f('common', COMMON, 'op_date', 'วันที่ผ่าตัด', 'Date of operation', 'date'),
    f('common', COMMON, 'time_start', 'เริ่มเวลา', 'Start time', 'time'),
    f('common', COMMON, 'time_end', 'เสร็จเวลา', 'Finish time', 'time'),
    f('common', COMMON, 'time_total', 'รวมเวลา (นาที)', 'Total time (minutes, calculated)', 'number'),
    f('common', COMMON, 'department', 'ภาควิชา', 'Department', 'text'),

    f('common', IDENT, 'hn', 'HN', 'HN', 'text'),
    f('common', IDENT, 'an', 'AN', 'AN', 'text'),
    f('common', IDENT, 'patient_name', 'ชื่อผู้ป่วย', 'Patient name', 'text'),
    f('common', IDENT, 'age', 'อายุ', 'Age', 'text'),
    f('common', IDENT, 'sex', 'เพศ', 'Sex', 'radio', 'ชาย / Male; หญิง / Female'),
    f('common', IDENT, 'ward', 'หอผู้ป่วย', 'Ward', 'text'),
    f('common', IDENT, 'admit_date', 'วันที่รับไว้', 'Admission date', 'date'),

    f('common', DIAG, 'preop_dx', 'การวินิจฉัยก่อนผ่าตัด', 'Pre-operative diagnosis', 'textarea'),
    f('common', DIAG, 'indication', 'ข้อบ่งชี้ในการผ่าตัด', 'Indication for operation', 'textarea'),
    f('common', DIAG, 'aim', 'จุดมุ่งหมายในการผ่าตัด', 'Aim of operation', 'textarea'),
    f('common', DIAG, 'postop_dx', 'การวินิจฉัยหลังผ่าตัด', 'Post-operative diagnosis', 'textarea'),
    f('common', DIAG, 'operation', 'ชนิดของการผ่าตัด', 'Operation performed', 'textarea'),
    f('common', DIAG, 'organ_removed', 'อวัยวะหรือสิ่งที่ถูกตัดออก', 'Organ / tissue removed', 'textarea'),
    f('common', DIAG, 'pathology_sent', 'ชิ้นเนื้อที่ส่งตรวจทางพยาธิวิทยา', 'Specimen sent to pathology', 'textarea'),
    f('common', DIAG, 'intraop_complication', 'ภาวะแทรกซ้อนระหว่างผ่าตัด', 'Intra-operative complication', 'textarea'),
    f('common', DIAG, 'ebl', 'ประมาณการเสียเลือด (มล.)', 'Estimated blood loss (mL)', 'number'),
    f('common', DIAG, 'transfusion', 'การให้ทดแทน', 'Replacement / transfusion', 'text'),

    f('common', TEAM, 'surgeon', 'แพทย์ผู้ผ่าตัด', 'Surgeon', 'text'),
    f('common', TEAM, 'assistant', 'ผู้ช่วย', 'Assistant', 'text'),
    f('common', TEAM, 'consultant', 'แพทย์ที่ปรึกษา', 'Consultant', 'text'),
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
    f('colorectal', 'การเข้าถึง | Approach', 'cr_position', 'ท่าผู้ป่วย', 'Patient position', 'radio',
      'Supine; Modified lithotomy (Lloyd-Davies); Prone jackknife; Right lateral; Left lateral'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_incision', 'แผลผ่าตัด / ตำแหน่ง port', 'Incision / port placement', 'textarea'),
    f('colorectal', 'การเข้าถึง | Approach', 'cr_extraction', 'ตำแหน่งเอาชิ้นเนื้อออก', 'Specimen extraction site', 'radio',
      'Midline (umbilical port site extended); Left lower quadrant; Pfannenstiel; Right lower quadrant (port site extended); Transanal (NOSE); Through the stoma site'),

    f('colorectal', 'หัตถการ | Procedure', 'cr_procedure', 'การผ่าตัดที่ทำ', 'Procedure performed', 'checklist',
      'Right hemicolectomy; Extended right hemicolectomy; Transverse colectomy; ' +
      'Left hemicolectomy; Sigmoidectomy; Anterior resection; Low anterior resection; ' +
      'Ultra-low anterior resection with coloanal anastomosis; Abdominoperineal resection; ' +
      'Hartmann procedure; Reversal of Hartmann; Subtotal colectomy; Total colectomy; ' +
      'Total proctocolectomy; Restorative proctocolectomy with IPAA; Local excision (TAMIS / TEM); ' +
      'Loop ileostomy; Loop colostomy; End colostomy; End ileostomy; Stoma closure; ' +
      'Adhesiolysis; Drainage of abscess; Exploratory laparotomy only'),
    f('colorectal', 'หัตถการ | Procedure', 'cr_urgency', 'ความเร่งด่วน', 'Urgency', 'radio',
      'Elective; Urgent; Emergency'),
    f('colorectal', 'หัตถการ | Procedure', 'cr_tumour_site', 'ตำแหน่งรอยโรค', 'Lesion / tumor site', 'text'),
    f('colorectal', 'หัตถการ | Procedure', 'cr_tumour_distance', 'ระยะจากขอบทวาร (ซม.)', 'Distance from anal verge (cm)', 'number'),

    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_vascular', 'การผูกหลอดเลือด', 'Vascular ligation', 'radio',
      'High tie (at origin); Low tie; Not applicable'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_lymphadenectomy', 'การเลาะต่อมน้ำเหลือง', 'Lymphadenectomy', 'radio',
      'D1; D2; D3 / CME; Not applicable'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_plane', 'ระนาบการเลาะ', 'Dissection plane', 'checklist',
      'CME (complete mesocolic excision); TME (total mesorectal excision); ' +
      'PME (partial mesorectal excision); Intersphincteric dissection; En-bloc resection of adjacent organ'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_splenic_flexure', 'Mobilize splenic flexure', 'Splenic flexure mobilization', 'radio',
      'Yes; No; Not applicable'),
    f('colorectal', 'มะเร็งวิทยา | Oncological detail', 'cr_margin', 'ระยะขอบตัด (ซม.)', 'Resection margin, proximal / distal (cm)', 'text'),

    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_anast_method', 'วิธีต่อลำไส้', 'Anastomosis technique', 'radio',
      'Hand-sewn; Stapled; Double stapled; Triple stapled; No anastomosis'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_anast_config', 'รูปแบบการต่อ', 'Anastomosis configuration', 'radio',
      'End-to-end; Side-to-side; End-to-side; Side-to-end; Colonic J-pouch'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_stapler', 'ชนิด/ขนาด stapler และไหมเย็บ', 'Stapler size / suture material', 'text'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_leak_test', 'การทดสอบรอยรั่ว', 'Air-leak test', 'radio',
      'Negative; Positive – repaired; Not performed'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_diverting', 'ทวารเทียมชั่วคราว', 'Diverting stoma', 'radio',
      'None; Loop ileostomy; Loop colostomy'),
    f('colorectal', 'การต่อลำไส้ | Anastomosis', 'cr_perfusion', 'ประเมินเลือดมาเลี้ยง', 'Perfusion assessment', 'radio',
      'Clinical only; ICG fluorescence; Not assessed'),

    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_drain', 'ท่อระบาย', 'Drain', 'text'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_closure', 'การปิดแผล', 'Wound closure', 'text'),
    f('colorectal', 'ปิดแผลและท่อระบาย | Closure', 'cr_count', 'นับผ้าซับและเครื่องมือครบ', 'Sponge and instrument count correct', 'checkbox'),

    f('colorectal', 'รายละเอียดขั้นตอน | Operative steps', 'cr_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('colorectal', 'รายละเอียดขั้นตอน | Operative steps', 'cr_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea'),

    /* ---------------- FISTULA ---------------- */
    f('fistula', 'การประเมิน | Assessment', 'fi_position', 'ท่าผู้ป่วย', 'Patient position', 'radio',
      'Prone jackknife; Lithotomy; Left lateral; Right lateral'),
    f('fistula', 'การประเมิน | Assessment', 'fi_eua', 'ผลตรวจใต้ยาสลบ (EUA)', 'Examination under anesthesia', 'textarea'),
    f('fistula', 'การประเมิน | Assessment', 'fi_prior', 'เคยผ่าตัดบริเวณนี้มาก่อน', 'Previous anorectal surgery', 'radio',
      'None; Previous fistula surgery; Previous abscess drainage; Previous hemorrhoid surgery; Other'),
    f('fistula', 'การประเมิน | Assessment', 'fi_aetiology', 'สาเหตุ', 'Aetiology', 'radio',
      'Cryptoglandular; Crohn disease; Tuberculosis; Post-operative; Malignancy; Radiation; Other'),

    f('fistula', 'กายวิภาค | Anatomy', 'fi_internal_opening', 'ตำแหน่งรูเปิดภายใน (นาฬิกา)', 'Internal opening (o\'clock)', 'text'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_internal_height', 'ความสูงรูเปิดภายในจากขอบทวาร (ซม.)', 'Height of internal opening from anal verge (cm)', 'number'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_external_opening', 'ตำแหน่งรูเปิดภายนอก (นาฬิกา)', 'External opening (o\'clock)', 'text'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_external_distance', 'ระยะรูเปิดภายนอกจากขอบทวาร (ซม.)', 'Distance of external opening from anal verge (cm)', 'number'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_parks', 'Parks classification', 'Parks classification', 'radio',
      'Superficial / submucosal; Intersphincteric; Transsphincteric; Suprasphincteric; Extrasphincteric'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_complexity', 'ความซับซ้อน', 'Complexity', 'radio', 'Simple; Complex'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_features', 'ลักษณะเพิ่มเติม', 'Additional features', 'checklist',
      'Secondary tract; Horseshoe extension; Abscess cavity; Supralevator extension; ' +
      'Multiple external openings; Anterior fistula in female; Recurrent fistula'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_sphincter_involved', 'สัดส่วนหูรูดที่เกี่ยวข้อง (%)', 'Proportion of external sphincter involved (%)', 'number'),
    f('fistula', 'กายวิภาค | Anatomy', 'fi_continence', 'การกลั้นอุจจาระก่อนผ่าตัด (Wexner)', 'Pre-operative continence (Wexner score)', 'number'),

    f('fistula', 'หัตถการ | Procedure', 'fi_procedure', 'การผ่าตัดที่ทำ', 'Procedure performed', 'checklist',
      'Fistulotomy; Fistulectomy; Cutting seton; Draining (loose) seton; ' +
      'LIFT (ligation of intersphincteric fistula tract); Mucosal advancement flap; ' +
      'Anodermal advancement flap; VAAFT; Fibrin glue; Fistula plug; ' +
      'Laser closure (FiLaC); Curettage of tract; Drainage of abscess; ' +
      'Examination under anesthesia only; Other'),
    f('fistula', 'หัตถการ | Procedure', 'fi_seton_material', 'วัสดุ seton', 'Seton material', 'text'),
    f('fistula', 'หัตถการ | Procedure', 'fi_marsupialise', 'Marsupialization of wound edges', 'Marsupialization', 'checkbox'),
    f('fistula', 'หัตถการ | Procedure', 'fi_specimen', 'ชิ้นเนื้อส่งตรวจ', 'Specimen sent', 'text'),

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

    f('hemorrhoid', 'รายละเอียดขั้นตอน | Operative steps', 'he_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('hemorrhoid', 'รายละเอียดขั้นตอน | Operative steps', 'he_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea'),

    /* ---------------- OTHERS ---------------- */
    f('others', 'หัตถการ | Procedure', 'ot_procedure_name', 'ชื่อการผ่าตัด', 'Name of procedure', 'text'),
    f('others', 'หัตถการ | Procedure', 'ot_position', 'ท่าผู้ป่วย', 'Patient position', 'text'),
    f('others', 'หัตถการ | Procedure', 'ot_approach', 'วิธีการผ่าตัด', 'Approach', 'radio',
      'Open; Laparoscopic; Endoscopic; Perineal; Percutaneous; Other'),
    f('others', 'หัตถการ | Procedure', 'ot_findings', 'สิ่งตรวจพบเพิ่มเติม', 'Additional findings', 'textarea'),
    f('others', 'รายละเอียดขั้นตอน | Operative steps', 'ot_steps', 'รายละเอียดขั้นตอนการผ่าตัด', 'Step-by-step operative detail', 'textarea'),
    f('others', 'รายละเอียดขั้นตอน | Operative steps', 'ot_postop', 'แผนการดูแลหลังผ่าตัด', 'Post-operative plan', 'textarea')
  ];

  global.CATEGORIES = [
    { key: 'colorectal', th: 'ผ่าตัดลำไส้ใหญ่และทวารหนัก', en: 'Colorectal surgery' },
    { key: 'fistula', th: 'ผ่าตัดฝีคัณฑสูตร', en: 'Fistula surgery' },
    { key: 'hemorrhoid', th: 'ผ่าตัดริดสีดวงทวาร', en: 'Hemorrhoid surgery' },
    { key: 'others', th: 'อื่น ๆ', en: 'Others' }
  ];

})(window);
