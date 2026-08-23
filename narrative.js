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
          { needs: ['cr_drain'], text: 'A drain was placed: {cr_drain}.' },
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

      { needs: ['cr_drain'], text: 'A drain was placed: {cr_drain}.' },
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
