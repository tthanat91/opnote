/* =====================================================================
   narrative.js — sentence templates for the "Draft from the fields
   above" button beside each Step-by-step operative detail box.

   HOW A LINE WORKS
     needs   list of field keys. The line is skipped unless every one of
             them has been filled in. That is what stops the draft from
             asserting anything you did not record.
     text    the sentence. {cr_approach} is replaced by that field's value.
             {cr_approach|lc} does the same but drops the leading capital so
             the value reads naturally in mid-sentence. Acronyms such as TME,
             GA, D2 and names like Milligan-Morgan are left untouched.
     group   optional. Only the FIRST line of a group that qualifies is
             printed, so you can write a detailed sentence and a shorter
             fallback for when fewer fields are filled.
     equals  optional. Print only if the first needed field contains this
             text — used for yes/no boxes.
     not     optional. Skip if the first needed field contains this text,
             so "None" and "Not performed" do not become sentences.

   EDITING
     Rewrite the sentences freely; they are ordinary text. Keep the {keys}
     spelled exactly as in the Templates tab. Adding a line for a field you
     added to the Sheet is just one more entry in the right list.

   The result is always a draft. The surgeon reads and edits it before
   saving — an operative note is a legal document and no generated
   sentence should reach the record unread.
   ===================================================================== */

(function (global) {
  'use strict';

  global.NARRATIVE = {

    /* bumped with every edit — app.js compares it and complains if this
       file was not uploaded alongside the others */
    build: '2026-08-02ag',


    /* =================================================================
       STANDARD STEPS

       When one of these blocks matches the operation recorded, the draft
       becomes this numbered narrative instead of the short field-based
       list — the steps already say everything those sentences would.

       when   every condition must match. `any` is a list; a condition is
              satisfied when the field's value contains one of them.
       lines  same shape as the sentences above. A line with `needs` is
              printed only when those fields are filled, so optional steps
              (splenic flexure, stoma, drain) disappear when not done.

       «guillemets» mark a typical value that you must confirm. Anything
       left in «…» is glaringly obvious on the printed page, which is the
       point: a placeholder can never quietly pass as fact. A {field} with
       nothing recorded also prints as «…».
       ================================================================= */
    steps: [
      {
        name: 'Laparoscopic right / extended right / transverse colectomy',
        when: [
          { key: 'cr_procedure', any: ['Right hemicolectomy', 'Extended right hemicolectomy', 'Transverse colectomy'] },
          { key: 'cr_approach', any: ['Laparoscopic'] }
        ],
        lines: [
          { text: 'Under {anaesthesia}, the patient was placed in the {cr_position|lc} position with both arms tucked. A urinary catheter was inserted. The abdomen was prepared and draped in the usual sterile fashion and the surgical safety checklist was completed.' },
          { text: 'Pneumoperitoneum was established to «12 mmHg». A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the left lower quadrant» and «5 mm in the left upper quadrant and the suprapubic position».' },
          { needs: ['cr_incision'], text: '{cr_incision}' },
          { text: 'Diagnostic laparoscopy was performed. {findings}' },
          { needs: ['cr_tumour_site'], text: 'The lesion was confirmed at the {cr_tumour_site}, «with no evidence of peritoneal or hepatic metastasis».' },
          { text: 'The patient was placed in Trendelenburg with the right side elevated, and the small bowel and omentum were retracted to the left upper quadrant to expose the ileocolic pedicle.' },

          /* Each approach is a different operation, not a different word for
             the same one, so each gets its own step. The last line of the
             group is the fallback for a value I have not written for. */
          { group: 'approach', needs: ['cr_r_approach'], equals: 'Medial-to-lateral',
            text: 'A medial-to-lateral dissection was performed. The ileocolic pedicle was placed on tension and the peritoneum incised at the junction of the ileocolic vein and the superior mesenteric vein. The avascular plane anterior to the duodenum and the head of the pancreas was entered and developed laterally, lifting the mesocolon off the retroperitoneum, with the right ureter and gonadal vessels identified and preserved.' },
          { group: 'approach', needs: ['cr_r_approach'], equals: 'Inferior',
            text: 'An inferior, caudal-to-cranial dissection was performed. The peritoneum was incised at the base of the terminal ileal mesentery below the ileocolic pedicle, the retroperitoneal plane was entered from below and developed cranially over the duodenum and the head of the pancreas, with the right ureter and gonadal vessels identified and preserved.' },
          { group: 'approach', needs: ['cr_r_approach'], equals: 'Superior',
            text: 'A superior, cranial-to-caudal dissection was performed. The gastrocolic ligament was divided and the lesser sac entered, the transverse mesocolon was separated from the anterior surface of the pancreas, and the gastrocolic trunk of Henle was exposed at its origin. The dissection was then carried caudally towards the ileocolic pedicle, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
          { group: 'approach', needs: ['cr_r_approach'], equals: 'Lateral-to-medial',
            text: 'A lateral-to-medial dissection was performed. The lateral peritoneal attachments of the right colon were divided along the white line of Toldt and the right colon with its mesentery was reflected medially off the retroperitoneum, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
          { group: 'approach', needs: ['cr_r_approach'], equals: 'Combined',
            text: 'A combined approach was used. The medial dissection was carried as far as the plane would safely allow before the inferior and lateral attachments were released to complete the mobilization, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
          { group: 'approach', needs: ['cr_r_approach'],
            text: 'A {cr_r_approach|lc} dissection was performed. The avascular plane between the mesocolon and the retroperitoneum was developed, exposing the duodenum and the head of the pancreas, with the right ureter and gonadal vessels identified and preserved.' },
          { needs: ['cr_r_cme'], equals: 'Yes', text: 'A complete mesocolic excision was performed, the mesocolic fascia being kept intact throughout the dissection.' },
          { needs: ['cr_r_cvl'], equals: 'Yes', text: 'Central vascular ligation was performed, the pedicles being taken flush with the superior mesenteric vein.' },
          { needs: ['cr_r_vessels'], text: 'The following vessels were divided at their origin: {cr_r_vessels|lc}, secured «with Hem-o-lok clips». The gastrocolic trunk of Henle was identified and «preserved».' },
          { group: 'rca', needs: ['cr_r_rca'], equals: 'Absent', text: 'No true right colic artery was present, which is a recognized anatomical variant.' },
          { group: 'rca', needs: ['cr_r_rca'], text: 'The right colic artery was identified and divided at its origin.' },
          { needs: ['cr_r_nodes'], text: 'A {cr_r_nodes} lymphadenectomy was performed with the specimen.' },
          { needs: ['cr_procedure'], equals: 'Extended right hemicolectomy', text: 'The dissection was carried to the left of the middle colic trunk, «with the middle colic vessels divided at their origin», as appropriate for an extended right hemicolectomy.' },
          /* what is left to mobilize depends on where the dissection started */
          { group: 'flexure', needs: ['cr_r_approach'], equals: 'Lateral-to-medial',
            text: 'The gastrocolic ligament was divided and the hepatic flexure was taken down, completing the mobilization of the right colon.' },
          { group: 'flexure', needs: ['cr_r_approach'], equals: 'Superior',
            text: 'The lateral peritoneal attachments of the right colon were divided along the white line of Toldt and the hepatic flexure was taken down, joining the plane already developed in the lesser sac.' },
          { group: 'flexure',
            text: 'The hepatic flexure was mobilized «using a combined inferior and lateral approach», the gastrocolic ligament was divided, and the lateral attachments of the right colon were taken along the white line of Toldt to join the medial dissection.' },

          { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler'], equals: 'Intracorporeal',
            text: 'The terminal ileum «15 cm proximal to the ileocecal valve» and the transverse colon at the intended distal margin were divided intracorporeally with {cr_r_stapler}.' },
          { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler'], equals: 'Extracorporeal',
            text: 'A «6 cm periumbilical midline» incision was made, a wound protector was placed and the mobilized right colon was exteriorized. The terminal ileum «15 cm proximal to the ileocecal valve» and the transverse colon at the intended distal margin were divided with {cr_r_stapler}.' },
          { group: 'divide', needs: ['cr_r_stapler'],
            text: 'The terminal ileum and the transverse colon were divided at the intended margins with {cr_r_stapler}.' },

          { group: 'anast', needs: ['cr_r_anast_site', 'cr_r_anast_config'], equals: 'Intracorporeal',
            text: 'An intracorporeal {cr_r_anast_config|lc} ileocolic anastomosis was fashioned, confirming correct orientation and absence of tension.' },
          { group: 'anast', needs: ['cr_r_anast_site', 'cr_r_anast_config'], equals: 'Extracorporeal',
            text: 'An extracorporeal {cr_r_anast_config|lc} ileocolic anastomosis was fashioned, confirming correct orientation and absence of tension.' },
          { group: 'anast', needs: ['cr_r_anast_config'],
            text: 'A {cr_r_anast_config|lc} ileocolic anastomosis was fashioned.' },
          { needs: ['cr_r_enterotomy'], text: 'The common enterotomy was closed: {cr_r_enterotomy|lc}.' },
          { text: 'The mesenteric defect was «closed with a running barbed suture».' },

          { group: 'extract', needs: ['cr_r_anast_site'], equals: 'Extracorporeal',
            text: 'The anastomosis was returned to the abdomen and the specimen was delivered through the same incision. The specimen was passed off the field: {organ_removed}' },
          { group: 'extract', needs: ['cr_extraction'],
            text: 'Extraction site: {cr_extraction}. A wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
          { group: 'extract',
            text: 'The umbilical port site was extended as a «periumbilical midline» incision, a wound protector was placed, and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },

          { needs: ['cr_margin'], text: 'Macroscopic resection margins measured {cr_margin}.' },
          { needs: ['cr_perfusion'], not: 'Not assessed', text: 'Perfusion of the anastomosis was assessed by {cr_perfusion|lc} and was satisfactory.' },
          { needs: ['cr_diverting'], not: 'None', text: 'A {cr_diverting|lc} was fashioned and matured at «the marked stoma site».' },
          { text: 'Hemostasis was confirmed and the abdomen irrigated with «warm saline».' },
          { needs: ['cr_drain'], not: 'None', text: 'A drain was placed: {cr_drain}.' },
          { needs: ['cr_closure'], text: 'Ports were removed under direct vision. The wound and port sites were closed: {cr_closure}.' },
          { needs: ['cr_count'], equals: 'Yes', text: 'Sponge, needle and instrument counts were correct at the end of the procedure. The patient was extubated and transferred to recovery in a stable condition.' }
        ]
      },
      {
        name: 'Laparoscopic sigmoidectomy / anterior resection',
        when: [
          { key: 'cr_procedure', any: ['Sigmoidectomy', 'Anterior resection'] },
          { key: 'cr_approach', any: ['Laparoscopic'] }
        ],
        lines: [
          { text: 'Under {anaesthesia}, the patient was placed in the {cr_position|lc} position with both arms tucked. A urinary catheter was inserted. The abdomen was prepared and draped in the usual sterile fashion and the surgical safety checklist was completed.' },
          { text: 'Pneumoperitoneum was established to «12 mmHg». A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the right lower quadrant» and «5 mm in the right upper quadrant, left lower quadrant and left upper quadrant».' },
          { needs: ['cr_incision'], text: '{cr_incision}' },
          { text: 'Diagnostic laparoscopy was performed. {findings}' },
          { needs: ['cr_tumour_site'], text: 'The lesion was confirmed at the {cr_tumour_site}, «with no evidence of peritoneal or hepatic metastasis».' },
          { text: 'The patient was placed in steep Trendelenburg with the left side elevated, and the small bowel was retracted to the right upper quadrant to expose the base of the sigmoid mesocolon.' },
          { text: 'A «medial-to-lateral» dissection was begun at the sacral promontory. The avascular plane between the mesocolon and the retroperitoneum was developed, and the left ureter and gonadal vessels were identified and preserved throughout.' },
          { needs: ['cr_vascular'], not: 'Not applicable', text: 'The inferior mesenteric artery was skeletonized and divided using a {cr_vascular|lc} technique, «1 cm distal to its aortic origin so as to preserve the superior hypogastric nerve plexus», secured «with three Hem-o-lok clips, two proximal and one distal». The inferior mesenteric vein was divided «at the lower border of the pancreas».' },
          { needs: ['cr_lymphadenectomy'], not: 'Not applicable', text: 'A {cr_lymphadenectomy} lymphadenectomy was performed with the specimen.' },
          { needs: ['cr_plane'], text: 'Dissection was continued in the {cr_plane|lc} plane «(Toldt fascia)» under direct vision, with the hypogastric nerves identified and preserved.' },
          { text: 'The lateral peritoneal attachments were divided along the white line of Toldt to join the medial dissection.' },
          { needs: ['cr_splenic_flexure'], equals: 'Yes', text: 'The splenic flexure was fully mobilized using «a combined inferior, anterior and lateral approach» to allow a tension-free anastomosis.' },
          { text: 'The rectum was mobilized to «10 cm below the tumor» and the mesorectum divided at the level of the intended distal margin.' },
          { text: 'The bowel distal to the tumor was occluded with «an endoscopic bulldog clamp» and a rectal washout was performed with «1 L of warm saline» before transection.' },
          { needs: ['cr_stapler'], text: 'The rectum was then divided distally with «one firing of» {cr_stapler}.' },
          { needs: ['cr_procedure'], equals: 'Anterior resection', text: 'A distal margin of «at least 5 cm» was obtained, appropriate for a tumor at the rectosigmoid junction or upper rectum.' },
          { group: 'extract', needs: ['cr_extraction'], equals: 'Transanal',
            text: 'The specimen was extracted transanally through a wound protector, avoiding an abdominal extraction incision.' },
          { group: 'extract', needs: ['cr_extraction'],
            text: 'Extraction site: {cr_extraction}. A wound protector was placed and the specimen delivered.' },
          { group: 'extract',
            text: 'The umbilical port site was extended as a «midline» incision, a wound protector was placed, and the specimen was delivered.' },
          { text: 'The proximal margin was selected «10 cm proximal to the tumor» and the bowel divided. The specimen was passed off the field: {organ_removed}' },
          { needs: ['cr_margin'], text: 'Macroscopic resection margins measured {cr_margin}.' },
          { needs: ['cr_anast_method'], not: 'No anastomosis', text: 'The anvil of «an EEA 28 mm circular stapler» was secured in the proximal colon with a purse-string suture and returned to the abdomen. Pneumoperitoneum was re-established and the anastomosis was completed under direct vision \u2014 {cr_anast_config|lc}, {cr_anast_method|lc} \u2014 confirming correct orientation and absence of tension. The doughnuts were inspected and were complete.' },
          { needs: ['cr_perfusion'], not: 'Not assessed', text: 'Perfusion of the anastomosis was assessed by {cr_perfusion|lc} and was satisfactory.' },
          { needs: ['cr_leak_test'], not: 'Not performed', text: 'A «colonoscopic» air-leak test was performed under saline and was {cr_leak_test|lc}.' },
          { needs: ['cr_diverting'], not: 'None', text: 'A {cr_diverting|lc} was fashioned and matured at «the marked stoma site in the right iliac fossa».' },
          { text: 'Hemostasis was confirmed and the pelvis irrigated with «warm saline».' },
          { needs: ['cr_drain'], not: 'None', text: 'A drain was placed: {cr_drain}.' },
          { needs: ['cr_closure'], text: 'Ports were removed under direct vision. The wound and port sites were closed: {cr_closure}.' },
          { needs: ['cr_count'], equals: 'Yes', text: 'Sponge, needle and instrument counts were correct at the end of the procedure. The patient was extubated and transferred to recovery in a stable condition.' }
        ]
      }
    ],

    /* ---------------------------------------------------------------- */
    colorectal: [
      { group: 'pos', needs: ['cr_position', 'anaesthesia'],
        text: 'Under {anaesthesia}, the patient was placed in the {cr_position|lc} position, and the abdomen was prepared and draped in the usual sterile fashion.' },
      { group: 'pos', needs: ['cr_position'],
        text: 'The patient was placed in the {cr_position|lc} position, and the abdomen was prepared and draped in the usual sterile fashion.' },

      { group: 'app', needs: ['cr_approach', 'cr_incision'],
        text: 'A {cr_approach|lc} approach was used. {cr_incision}' },
      { group: 'app', needs: ['cr_approach'],
        text: 'A {cr_approach|lc} approach was used.' },
      { group: 'app', needs: ['cr_incision'], text: '{cr_incision}' },

      { needs: ['findings'], text: 'On exploration: {findings}' },
      { needs: ['cr_tumour_site'], text: 'The lesion was identified at the {cr_tumour_site}.' },
      { needs: ['cr_tumour_distance'],
        text: 'It lay {cr_tumour_distance} cm from the anal verge.' },

      { needs: ['cr_plane'], text: 'Dissection was carried out in the {cr_plane|lc} plane.' },
      { needs: ['cr_splenic_flexure'], equals: 'Yes',
        text: 'The splenic flexure was mobilized.' },
      { needs: ['cr_vascular'], not: 'Not applicable',
        text: 'The vascular pedicle was divided using a {cr_vascular|lc} technique.' },
      { needs: ['cr_lymphadenectomy'], not: 'Not applicable',
        text: 'A {cr_lymphadenectomy} lymphadenectomy was performed.' },

      { needs: ['cr_procedure'], text: 'The procedure performed was {cr_procedure|lc}.' },
      { needs: ['organ_removed'], text: 'The specimen removed was {organ_removed}.' },
      { needs: ['cr_margin'], text: 'Resection margins measured {cr_margin}.' },

      { group: 'anast', needs: ['cr_anast_config', 'cr_anast_method'], not: 'No anastomosis',
        text: 'A {cr_anast_config}, {cr_anast_method} anastomosis was fashioned.' },
      { group: 'anast', needs: ['cr_anast_method'], not: 'No anastomosis',
        text: 'The anastomosis was {cr_anast_method}.' },
      { needs: ['cr_stapler'], text: 'Stapler and suture material used: {cr_stapler}.' },
      { needs: ['cr_leak_test'], not: 'Not performed',
        text: 'An air-leak test was performed and was {cr_leak_test}.' },
      { needs: ['cr_perfusion'], not: 'Not assessed',
        text: 'Perfusion of the anastomosis was assessed by {cr_perfusion}.' },
      { needs: ['cr_diverting'], not: 'None',
        text: 'A {cr_diverting} was fashioned to divert the anastomosis.' },

      { needs: ['cr_drain'], not: 'None', text: 'A drain was placed: {cr_drain}.' },
      { needs: ['cr_closure'], text: 'The wound was closed: {cr_closure}.' },
      { needs: ['cr_count'], equals: 'Yes',
        text: 'Sponge and instrument counts were correct at the end of the procedure.' }
    ],

    /* ---------------------------------------------------------------- */
    fistula: [
      { group: 'pos', needs: ['fi_position', 'anaesthesia'],
        text: 'Under {anaesthesia}, the patient was placed in the {fi_position|lc} position and the perineum was prepared and draped.' },
      { group: 'pos', needs: ['fi_position'],
        text: 'The patient was placed in the {fi_position|lc} position and the perineum was prepared and draped.' },

      { needs: ['fi_eua'], text: 'Examination under anesthesia showed {fi_eua}' },
      { needs: ['fi_aetiology'], text: 'The aetiology was considered to be {fi_aetiology|lc}.' },

      { group: 'int', needs: ['fi_internal_opening', 'fi_internal_height'],
        text: 'The internal opening was identified at {fi_internal_opening} o’clock, {fi_internal_height} cm from the anal verge.' },
      { group: 'int', needs: ['fi_internal_opening'],
        text: 'The internal opening was identified at {fi_internal_opening} o’clock.' },

      { group: 'ext', needs: ['fi_external_opening', 'fi_external_distance'],
        text: 'The external opening lay at {fi_external_opening} o’clock, {fi_external_distance} cm from the anal verge.' },
      { group: 'ext', needs: ['fi_external_opening'],
        text: 'The external opening lay at {fi_external_opening} o’clock.' },

      { needs: ['fi_parks'], text: 'The tract was {fi_parks|lc} in type.' },
      { needs: ['fi_complexity'], text: 'It was classified as a {fi_complexity|lc} fistula.' },
      { needs: ['fi_features'], text: 'Additional findings: {fi_features}.' },
      { needs: ['fi_sphincter_involved'],
        text: 'Approximately {fi_sphincter_involved}% of the external sphincter was encircled by the tract.' },

      { needs: ['fi_procedure'], text: 'The procedure performed was {fi_procedure|lc}.' },
      { needs: ['fi_seton_material'], text: 'The seton used was {fi_seton_material}.' },
      { needs: ['fi_marsupialise'], equals: 'Yes',
        text: 'The wound edges were marsupialized.' },
      { needs: ['fi_specimen'], text: 'Specimen sent: {fi_specimen}.' }
    ],

    /* ---------------------------------------------------------------- */
    hemorrhoid: [
      { group: 'pos', needs: ['he_position', 'anaesthesia'],
        text: 'Under {anaesthesia}, the patient was placed in the {he_position|lc} position and the perineum was prepared and draped.' },
      { group: 'pos', needs: ['he_position'],
        text: 'The patient was placed in the {he_position|lc} position and the perineum was prepared and draped.' },

      { group: 'gr', needs: ['he_grade', 'he_type'],
        text: 'Examination confirmed {he_type|lc} hemorrhoids, {he_grade}.' },
      { group: 'gr', needs: ['he_grade'], text: 'Examination confirmed {he_grade|lc} hemorrhoids.' },
      { needs: ['he_positions'], text: 'Piles were present at {he_positions}.' },
      { needs: ['he_associated'], not: 'None',
        text: 'Associated findings: {he_associated}.' },

      { needs: ['he_procedure'], text: 'The procedure performed was {he_procedure|lc}.' },
      { needs: ['he_piles_excised'], text: '{he_piles_excised} pile(s) were excised.' },
      { needs: ['he_energy'],
        text: 'Division and hemostasis were achieved with {he_energy|lc}.' },
      { needs: ['he_pedicle'], text: 'The pedicles were secured: {he_pedicle}.' },
      { needs: ['he_bridge'], equals: 'Yes',
        text: 'Adequate mucocutaneous bridges were preserved between the excision sites.' },
      { needs: ['he_analgesia'], text: 'Local analgesia was infiltrated: {he_analgesia}.' },
      { needs: ['he_packing'], equals: 'Yes', text: 'An anal pack was inserted.' }
    ],

    /* ---------------------------------------------------------------- */
    others: [
      { group: 'pos', needs: ['ot_position', 'anaesthesia'],
        text: 'Under {anaesthesia}, the patient was placed in the {ot_position|lc} position and prepared and draped.' },
      { group: 'pos', needs: ['ot_position'],
        text: 'The patient was placed in the {ot_position|lc} position and prepared and draped.' },
      { needs: ['ot_approach'], text: 'A {ot_approach|lc} approach was used.' },
      { needs: ['ot_procedure_name'], text: 'The procedure performed was {ot_procedure_name}.' },
      { needs: ['findings'], text: 'On exploration: {findings}' },
      { needs: ['ot_findings'], text: 'Additional findings: {ot_findings}' }
    ],

    /* appended to every category ------------------------------------- */
    common: [
      { needs: ['intraop_complication'], not: 'None',
        text: 'Intra-operative complication: {intraop_complication}' },
      { needs: ['ebl'], text: 'Estimated blood loss was {ebl} mL.' },
      { needs: ['transfusion'], not: 'None',
        text: 'Replacement given: {transfusion}.' },
      { needs: ['pathology_sent'],
        text: 'The specimen was sent for histopathology: {pathology_sent}.' }
    ]

  };

})(window);
