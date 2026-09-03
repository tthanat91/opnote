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
    build: '2026-08-02cy',



    /* =================================================================
       OPERATIVE FINDINGS

       A paragraph, not a numbered list, because that is how the box is
       read on the printed form. One list per category: what counts as a
       finding in a fistula case has nothing to do with a colectomy.

       A "No" is written out rather than left silent. In an operative note
       the difference between "no liver nodule was seen" and saying nothing
       at all is the difference between a negative finding and an omission.
       ================================================================= */
    findings: {

      colorectal: [
        { group: 'loc', needs: ['cr_f_location', 'cr_f_size_w', 'cr_f_size_l', 'cr_f_size_h'],
          text: 'The tumor was located at the {cr_f_location|lc}, measuring {cr_f_size_w} × {cr_f_size_l} × {cr_f_size_h} cm.' },
        { group: 'loc', needs: ['cr_f_location'], text: 'The tumor was located at the {cr_f_location|lc}.' },

        { group: 'app', needs: ['cr_f_appearance', 'cr_f_annular_pct'], equals: 'Annular',
          text: 'It was annular, involving {cr_f_annular_pct}% of the circumference.' },
        { group: 'app', needs: ['cr_f_appearance'], text: 'It was {cr_f_appearance|lc} in appearance.' },

        { group: 'obs', needs: ['cr_f_obstruction'], equals: 'Yes', text: 'The lesion was obstructing.' },
        { group: 'obs', needs: ['cr_f_obstruction'], equals: 'No', text: 'There was no obstruction.' },

        { group: 'perf', needs: ['cr_f_perforation'], equals: 'Yes', text: 'The bowel was perforated at the tumor site.' },
        { group: 'perf', needs: ['cr_f_perforation'], equals: 'No', text: 'There was no perforation.' },

        { group: 'ser', needs: ['cr_f_serosa'], equals: 'Yes', text: 'The serosa was involved.' },
        { group: 'ser', needs: ['cr_f_serosa'], equals: 'No', text: 'The serosa was not breached.' },

        { group: 'inv', needs: ['cr_f_invasion', 'cr_f_invasion_detail'], equals: 'Yes',
          text: 'There was direct invasion of the {cr_f_invasion_detail|lc}.' },
        { group: 'inv', needs: ['cr_f_invasion'], equals: 'Yes', text: 'There was invasion of an adjacent organ.' },
        { group: 'inv', needs: ['cr_f_invasion'], equals: 'No', text: 'No adjacent organ was involved.' },

        { group: 'liv', needs: ['cr_f_liver', 'cr_f_liver_detail'], equals: 'Yes',
          text: 'A liver nodule was present: {cr_f_liver_detail}.' },
        { group: 'liv', needs: ['cr_f_liver'], equals: 'Yes', text: 'A liver nodule was present.' },
        { group: 'liv', needs: ['cr_f_liver'], equals: 'No', text: 'The liver was smooth, with no nodule.' },

        { group: 'per', needs: ['cr_f_peritoneal', 'cr_f_peritoneal_detail'], equals: 'Yes',
          text: 'Peritoneal nodules were seen: {cr_f_peritoneal_detail}.' },
        { group: 'per', needs: ['cr_f_peritoneal'], equals: 'Yes', text: 'Peritoneal nodules were seen.' },
        { group: 'per', needs: ['cr_f_peritoneal'], equals: 'No', text: 'There was no peritoneal deposit.' },

        { group: 'ln', needs: ['cr_f_nodes', 'cr_f_nodes_detail'], equals: 'Yes',
          text: 'Suspicious metastatic lymph nodes were found at the {cr_f_nodes_detail|lc}.' },
        { group: 'ln', needs: ['cr_f_nodes'], equals: 'Yes', text: 'Suspicious metastatic lymph nodes were found.' },
        { group: 'ln', needs: ['cr_f_nodes'], equals: 'No', text: 'No suspicious lymph node was identified.' },

        { group: 'syn', needs: ['cr_f_synchronous', 'cr_f_synchronous_detail'], equals: 'Yes',
          text: 'A synchronous lesion was present: {cr_f_synchronous_detail}.' },
        { group: 'syn', needs: ['cr_f_synchronous'], equals: 'Yes', text: 'A synchronous lesion was present.' },
        { group: 'syn', needs: ['cr_f_synchronous'], equals: 'No', text: 'No synchronous lesion was found.' },

        { group: 'ut', needs: ['cr_f_uterus', 'cr_f_uterus_detail'], equals: 'Abnormal',
          text: 'The uterus was abnormal: {cr_f_uterus_detail}.' },
        { group: 'ut', needs: ['cr_f_uterus'], equals: 'Normal', text: 'The uterus appeared normal.' },
        { group: 'ov', needs: ['cr_f_ovaries', 'cr_f_ovaries_detail'], equals: 'Abnormal',
          text: 'The ovaries were abnormal: {cr_f_ovaries_detail}.' },
        { group: 'ov', needs: ['cr_f_ovaries'], equals: 'Normal', text: 'Both ovaries appeared normal.' },

        { needs: ['cr_f_plane_quality'],
          text: 'The specimen was assessed after removal and the mesocolic / mesorectal plane was {cr_f_plane_quality|lc}.' },

        /* ---- from มะเร็งวิทยา | Oncological detail ----
           What the resection achieved is a finding about the specimen, so it
           belongs in this paragraph as well as in the step-by-step account.
           The purely technical rows of that section — how the pedicle was
           taken, how the flexure was mobilized — stay in the steps only. */
        /* whichever nodal field the procedure exposes — never both */
        { group: 'fnodes', needs: ['cr_lymphadenectomy'], not: 'Not applicable',
          text: 'The specimen included a {cr_lymphadenectomy} lymphadenectomy.' },
        { group: 'fnodes', needs: ['cr_r_nodes'],
          text: 'The specimen included a {cr_r_nodes} lymphadenectomy.' },
        { group: 'fmarg', needs: ['cr_margin_prox', 'cr_margin_dist'],
          text: 'Resection margins measured {cr_margin_prox} cm proximally and {cr_margin_dist} cm distally.' },
        { group: 'fmarg', needs: ['cr_margin_prox'],
          text: 'The proximal resection margin measured {cr_margin_prox} cm.' },
        { group: 'fmarg', needs: ['cr_margin_dist'],
          text: 'The distal resection margin measured {cr_margin_dist} cm.' },
        /* its own sentence rather than a third clause — the radial margin is
           read on its own in a rectal specimen */
        { needs: ['cr_mesenteric_margin'],
          text: 'The mesenteric resection margin measured {cr_mesenteric_margin} cm.' },
        { group: 'fenb', needs: ['cr_enbloc'], equals: 'Yes',
          text: 'The involved organ was taken en bloc with the specimen.' },
        { group: 'fenb', needs: ['cr_enbloc'], equals: 'No',
          text: 'The adjacent organ was dissected free and no en-bloc resection was required.' }
      ],

      fistula: [
        /* fi_parks_text adds "high" or "low" to a transsphincteric tract
           from the recorded sphincter percentage */
        { needs: ['fi_parks'], text: 'The tract was {fi_parks_text}.' },
        { group: 'io', needs: ['fi_internal_opening', 'fi_internal_height'],
          text: 'The internal opening lay at {fi_internal_opening} o’clock, {fi_internal_height} cm from the anal verge.' },
        { group: 'io', needs: ['fi_internal_opening'], text: 'The internal opening lay at {fi_internal_opening} o’clock.' },
        { group: 'eo', needs: ['fi_external_opening', 'fi_external_distance'],
          text: 'The external opening lay at {fi_external_opening} o’clock, {fi_external_distance} cm from the anal verge.' },
        { group: 'eo', needs: ['fi_external_opening'], text: 'The external opening lay at {fi_external_opening} o’clock.' },
        { needs: ['fi_complexity'], text: 'The fistula was classified as {fi_complexity|lc}.' },
        { group: 'fifeat', needs: ['fi_features'], equals: 'None',
          text: 'There was no secondary tract, horseshoe extension or other complicating feature.' },
        { group: 'fifeat', needs: ['fi_features'],
          text: 'Additional features were noted: {fi_features|lc|and}.' },
        /* the repeating block renders itself as finished sentences */
        { needs: ['fi_tracts'], text: '{fi_tracts}' },
        { needs: ['fi_sphincter_involved'], text: 'Approximately {fi_sphincter_involved}% of the external sphincter was involved by the tract.' },
        { needs: ['fi_aetiology'], text: 'The etiology was {fi_aetiology|lc}.' }
      ],

      hemorrhoid: [
        { group: 'gr', needs: ['he_grade', 'he_type'], text: 'There were {he_type|lc} hemorrhoids, {he_grade|lc}.' },
        { group: 'gr', needs: ['he_grade'], text: 'The hemorrhoids were {he_grade|lc}.' },
        { needs: ['he_positions'], text: 'The piles lay at {he_positions|lc|and}.' },
        { group: 'assoc', needs: ['he_associated'], equals: 'None', text: 'No associated anorectal pathology was found.' },
        { group: 'assoc', needs: ['he_associated'], text: 'Associated pathology was present: {he_associated|lc|and}.' }
      ],

      /* What a stoma operation finds is the state of the abdomen it is
         opened into, not a lesion. */
      stoma: [
        { group: 'stfadh', needs: ['st_adhesion'], equals: 'None',
          text: 'There were no significant intra-abdominal adhesions.' },
        { group: 'stfadh', needs: ['st_adhesion'],
          text: 'Intra-abdominal adhesions were {st_adhesion|lc}.' },
        { group: 'stfph', needs: ['st_parastomal', 'st_parastomal_size'], equals: 'Present',
          text: 'A parastomal hernia was present, with a fascial defect of {st_parastomal_size} cm.' },
        { group: 'stfph', needs: ['st_parastomal'], equals: 'Present',
          text: 'A parastomal hernia was present.' },
        { group: 'stfph', needs: ['st_parastomal'], equals: 'None',
          text: 'There was no parastomal hernia.' },
        { group: 'stfent', needs: ['st_enterotomy'], equals: 'None',
          text: 'The bowel was not injured during the dissection.' },
        { group: 'stfent', needs: ['st_enterotomy', 'st_enterotomy_repair'],
          text: 'The bowel was injured during the dissection: {st_enterotomy|lc}, {st_enterotomy_repair}.' },
        { group: 'stfent', needs: ['st_enterotomy'],
          text: 'The bowel was injured during the dissection: {st_enterotomy|lc}.' },
        { needs: ['st_stump'],
          text: 'The rectal stump had been {st_stump|lc} at the index operation.' },
        /* a stoma being raised has no adhesions to report — what it has is
           a reason, and that is the finding worth stating */
        { group: 'stfwhy', needs: ['st_indication'], equals: 'Other',
          text: 'The indication for the stoma was as recorded: {st_indication}.' },
        { group: 'stfwhy', needs: ['st_indication'],
          text: 'The indication for the stoma was {st_indication|lc}.' }
      ],

      /* "Others" has no checklist to summarize, so the findings box is
         typed by hand. An empty list here is what leaves it alone. */
      others: []
    },

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
    /* =================================================================
       REUSABLE PARTS

       A block does not own its sentences. It names the runs it needs —
       { use: 'left_vessels' } — and app.js expands them before drafting.

       This is the point of the whole arrangement: the sentence describing
       a high tie of the inferior mesenteric artery exists ONCE, and the
       anterior resection, the Hartmann and the APR all read from it. When
       each operation kept its own copy, one of them was still claiming a
       hard-coded «10 cm below the tumor» long after the same line had been
       corrected elsewhere. That cannot happen again.

       Open and laparoscopic share one block. The difference between them
       is real but small — how the abdomen is entered, how the bowel is
       exposed, whether ports are removed at the end — so those three
       sentences switch on cr_approach inside the part, and every sentence
       about the dissection itself is written once. A case converted from
       laparoscopic to open reads correctly too: it was ported, it was
       converted, and the ports were removed.
       ================================================================= */
    parts: {

      /* ---- opening ------------------------------------------------- */
      setup: [
        { text: 'Under {anaesthesia}, the patient was placed in the {cr_position|lc} position with both arms tucked. A urinary catheter was inserted. The abdomen was prepared and draped in the usual sterile fashion and the surgical safety checklist was completed.' }
      ],

      /* The conversion lines come first on purpose. "Laparoscopic converted
         to open" contains the word "open", so if the open lines were tested
         first a converted case would lose its ports. */
      access_left: [
        { group: 'access', needs: ['cr_approach', 'cr_incision'], equals: 'converted to open',
          text: 'Pneumoperitoneum was established to «12 mmHg» and the ports were placed as for a laparoscopic resection. The procedure was subsequently converted to open: {cr_incision}' },
        { group: 'access', needs: ['cr_approach'], equals: 'converted to open',
          text: 'Pneumoperitoneum was established to «12 mmHg» and the ports were placed as for a laparoscopic resection. The procedure was subsequently converted to open through a «lower midline» incision.' },
        { group: 'access', needs: ['cr_approach', 'cr_incision'], equals: 'Open',
          text: 'The abdomen was opened: {cr_incision}' },
        { group: 'access', needs: ['cr_approach'], equals: 'Open',
          text: 'The abdomen was opened through a «lower midline» incision.' },
        { group: 'access', needs: ['cr_approach'], equals: 'Robotic',
          text: 'Pneumoperitoneum was established to «12 mmHg». A camera port was placed at the umbilicus with «three further robotic ports and one assistant port», and the platform was docked from the left side of the patient.' },
        { group: 'access', needs: ['cr_ports'],
          text: 'Pneumoperitoneum was established to «12 mmHg» and a {cr_ports|lc} was used. A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the right lower quadrant» and «5 mm in the right upper quadrant, left lower quadrant and left upper quadrant».' },
        { group: 'access',
          text: 'Pneumoperitoneum was established to «12 mmHg». A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the right lower quadrant» and «5 mm in the right upper quadrant, left lower quadrant and left upper quadrant».' }
      ],

      access_right: [
        { group: 'access', needs: ['cr_approach', 'cr_incision'], equals: 'converted to open',
          text: 'Pneumoperitoneum was established to «12 mmHg» and the ports were placed as for a laparoscopic resection. The procedure was subsequently converted to open: {cr_incision}' },
        { group: 'access', needs: ['cr_approach'], equals: 'converted to open',
          text: 'Pneumoperitoneum was established to «12 mmHg» and the ports were placed as for a laparoscopic resection. The procedure was subsequently converted to open through a «midline» incision.' },
        { group: 'access', needs: ['cr_approach', 'cr_incision'], equals: 'Open',
          text: 'The abdomen was opened: {cr_incision}' },
        { group: 'access', needs: ['cr_approach'], equals: 'Open',
          text: 'The abdomen was opened through a «midline» incision.' },
        { group: 'access', needs: ['cr_approach'], equals: 'Robotic',
          text: 'Pneumoperitoneum was established to «12 mmHg». A camera port was placed at the umbilicus with «three further robotic ports and one assistant port», and the platform was docked from the right side of the patient.' },
        { group: 'access', needs: ['cr_ports'],
          text: 'Pneumoperitoneum was established to «12 mmHg» and a {cr_ports|lc} was used. A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the left lower quadrant» and «5 mm in the left upper quadrant and the suprapubic position».' },
        { group: 'access',
          text: 'Pneumoperitoneum was established to «12 mmHg». A «12 mm balloon blunt-tip» camera port was placed at the umbilicus, with working ports of «12 mm in the left lower quadrant» and «5 mm in the left upper quadrant and the suprapubic position».' }
      ],

      /* a stoma formed on its own, or a stoma closure, still has to say how
         the abdomen was entered — but not through a colectomy port map */

      explore_left: [
        { group: 'explore', needs: ['cr_approach'], equals: 'Laparoscopic', text: 'Diagnostic laparoscopy was performed.' },
        { group: 'explore', needs: ['cr_approach'], equals: 'Robotic', text: 'The peritoneal cavity was inspected before the dissection was begun.' },
        { group: 'explore', text: 'The abdomen was explored.' },
        { group: 'site', needs: ['cr_f_location', 'cr_tumor_distance'],
          text: 'The lesion was confirmed at the {cr_f_location|lc}, {cr_tumor_distance} cm from the anal verge.' },
        { group: 'site', needs: ['cr_f_location'], text: 'The lesion was confirmed at the {cr_f_location|lc}.' },
        { group: 'expose', needs: ['cr_approach'], equals: 'Open',
          text: 'The small bowel was packed away into the upper abdomen and a self-retaining retractor was positioned to expose the base of the sigmoid mesocolon and the sacral promontory.' },
        { group: 'expose',
          text: 'The patient was placed in steep Trendelenburg with the right side down, and the small bowel was retracted to the right upper quadrant to expose the base of the sigmoid mesocolon and the sacral promontory.' }
      ],

      explore_right: [
        { group: 'explore', needs: ['cr_approach'], equals: 'Laparoscopic', text: 'Diagnostic laparoscopy was performed.' },
        { group: 'explore', needs: ['cr_approach'], equals: 'Robotic', text: 'The peritoneal cavity was inspected before the dissection was begun.' },
        { group: 'explore', text: 'The abdomen was explored.' },
        { needs: ['cr_f_location'], text: 'The lesion was confirmed at the {cr_f_location|lc}.' },
        { needs: ['cr_r_distance_icv'], text: 'It lay {cr_r_distance_icv} cm from the ileocecal valve.' },
        { group: 'expose', needs: ['cr_approach'], equals: 'Open',
          text: 'The small bowel and omentum were packed to the left upper quadrant and a self-retaining retractor was positioned to expose the ileocolic pedicle.' },
        { group: 'expose',
          text: 'The patient was placed in Trendelenburg with the right side elevated, and the small bowel and omentum were retracted to the left upper quadrant to expose the ileocolic pedicle.' }
      ],

      /* ---- left-sided and rectal dissection ------------------------ */
      left_mobilise: [
        { group: 'lapp', needs: ['cr_l_approach'], equals: 'Medial-to-lateral',
          text: 'A medial-to-lateral dissection was begun at the sacral promontory. The avascular plane between the mesocolon and the retroperitoneum was developed, and the left ureter and gonadal vessels were identified and preserved throughout.' },
        { group: 'lapp', needs: ['cr_l_approach'], equals: 'Lateral-to-medial',
          text: 'A lateral-to-medial dissection was begun by dividing the peritoneum along the white line of Toldt and reflecting the left colon medially off the retroperitoneum, with the left ureter and gonadal vessels identified and preserved throughout.' },
        { group: 'lapp', needs: ['cr_l_approach'], equals: 'Retroperitoneal-first',
          text: 'The retroperitoneal plane was entered first and developed towards the midline, with the left ureter and gonadal vessels identified and preserved throughout.' },
        { group: 'lapp', needs: ['cr_l_approach'], equals: 'Combined',
          text: 'A combined approach was used: the medial dissection was carried as far as the plane allowed before the lateral attachments were released, with the left ureter and gonadal vessels identified and preserved throughout.' },
        { group: 'lapp',
          text: 'A «medial-to-lateral» dissection was begun at the sacral promontory. The avascular plane between the mesocolon and the retroperitoneum was developed, and the left ureter and gonadal vessels were identified and preserved throughout.' },
        { text: 'The lateral peritoneal attachments were divided along the white line of Toldt to join the medial dissection.' }
      ],

      left_vessels: [
        { group: 'ima', needs: ['cr_ima'], equals: 'High tie',
          text: 'The inferior mesenteric artery was skeletonized and divided at its origin, «1 cm distal to the aorta so as to preserve the superior hypogastric nerve plexus», secured «with three Hem-o-lok clips, two proximal and one distal».' },
        { group: 'ima', needs: ['cr_ima'], equals: 'Low tie',
          text: 'The inferior mesenteric artery was divided distal to the origin of the left colic artery, which was preserved, «secured with three Hem-o-lok clips», with the superior hypogastric nerve plexus swept posteriorly and preserved.' },
        { group: 'ima', needs: ['cr_vascular'], not: 'Not applicable',
          text: 'The inferior mesenteric artery was divided using a {cr_vascular|lc} technique.' },
        { group: 'imv', needs: ['cr_imv'], equals: 'High tie',
          text: 'The inferior mesenteric vein was divided at the lower border of the pancreas.' },
        { group: 'imv', needs: ['cr_imv'], equals: 'Low tie',
          text: 'The inferior mesenteric vein was divided at the level of the inferior mesenteric artery.' },
        { needs: ['cr_l_vessel_control'],
          text: 'The pedicles were secured with {cr_l_vessel_control|lc|and}.' },
        { needs: ['cr_l_imv_preserve'], equals: 'Yes',
          text: 'The inferior mesenteric vein was preserved.' },
        { needs: ['cr_l_sra'], equals: 'Divided',
          text: 'The superior rectal artery was divided in continuity with the pedicle.' },
        { needs: ['cr_l_sra'], equals: 'Preserved',
          text: 'The superior rectal artery was preserved.' },
        { needs: ['cr_lymphadenectomy'], not: 'Not applicable',
          text: 'A {cr_lymphadenectomy} lymphadenectomy was performed with the specimen.' }
      ],

      splenic_flexure: [
        { group: 'flex', needs: ['cr_splenic_flexure', 'cr_splenic_approach'], equals: 'Yes',
          text: 'The splenic flexure was fully mobilized using a {cr_splenic_approach|lc} approach to allow the conduit to reach the pelvis without tension.' },
        { group: 'flex', needs: ['cr_splenic_flexure'], equals: 'Yes',
          text: 'The splenic flexure was fully mobilized «using a combined inferior, anterior and lateral approach» to allow the conduit to reach the pelvis without tension.' },
        { group: 'flex', needs: ['cr_splenic_flexure'], equals: 'No',
          text: 'The splenic flexure was not mobilized; the conduit reached the pelvis without tension.' }
      ],

      tme: [
        { group: 'tme', needs: ['cr_rect_tme'], equals: 'Total',
          text: 'A total mesorectal excision was carried out under direct vision in the areolar plane between the mesorectal fascia and the presacral fascia — posteriorly to the pelvic floor at the level of the levator ani, anteriorly along Denonvilliers fascia, and laterally with the hypogastric nerves and pelvic plexus preserved. The mesorectum was taken intact as far as the anorectal junction.' },
        { group: 'tme', needs: ['cr_rect_tme', 'cr_rect_mobilisation'], equals: 'Tumor-specific',
          text: 'A tumor-specific mesorectal excision was carried out in the areolar plane between the mesorectal fascia and the presacral fascia, the rectum being mobilized to {cr_rect_mobilisation} cm below the tumor and the mesorectum divided at right angles at that level.' },
        { group: 'tme', needs: ['cr_rect_tme'], equals: 'Tumor-specific',
          text: 'A tumor-specific mesorectal excision was carried out in the areolar plane between the mesorectal fascia and the presacral fascia, the mesorectum being divided at right angles «5 cm» below the tumor.' },
        { group: 'tme', needs: ['cr_rect_tme'],
          text: 'A {cr_rect_tme|lc} mesorectal excision was carried out in the areolar plane between the mesorectal fascia and the presacral fascia.' },
        { needs: ['cr_rect_nerve'],
          text: 'Autonomic nerve preservation was {cr_rect_nerve|lc}.' },
        { group: 'isr', needs: ['cr_rect_isr'], not: 'None',
          text: 'A {cr_rect_isr|lc} intersphincteric resection was performed to obtain an adequate distal margin.' },
        { group: 'isr', needs: ['cr_rect_isr'], equals: 'None',
          text: 'No intersphincteric resection was required.' }
      ],

      washout: [
        { group: 'washout', needs: ['cr_l_clamp', 'cr_l_washout', 'cr_l_washout_volume', 'cr_l_washout_solution'], not: 'None',
          text: 'The bowel distal to the tumor was occluded with a {cr_l_clamp|lc} and a rectal washout was performed with {cr_l_washout_volume} mL of {cr_l_washout_solution|lc} before transection.' },
        { group: 'washout', needs: ['cr_l_clamp', 'cr_l_washout', 'cr_l_washout_solution'], not: 'None',
          text: 'The bowel distal to the tumor was occluded with a {cr_l_clamp|lc} and a rectal washout was performed with {cr_l_washout_solution|lc} before transection.' },
        { group: 'washout', needs: ['cr_l_clamp', 'cr_l_washout'], not: 'None',
          text: 'The bowel distal to the tumor was occluded with a {cr_l_clamp|lc} and a rectal washout was performed before transection.' },
        { group: 'washout', needs: ['cr_l_washout'], equals: 'No',
          text: 'No rectal washout was performed.' }
      ],

      rectal_transection: [
        { group: 'trans', needs: ['cr_l_firings', 'cr_l_transection_size', 'cr_l_transection_color'], equals: '1',
          text: 'The rectum was divided distally with a single firing of a {cr_l_transection_size} stapler, {cr_l_transection_color|lc} cartridge, at right angles to the bowel.' },
        { group: 'trans', needs: ['cr_l_firings', 'cr_l_transection_size', 'cr_l_transection_color'],
          text: 'The rectum was divided distally with {cr_l_firings} firings of a {cr_l_transection_size} stapler, {cr_l_transection_color|lc} cartridge, at right angles to the bowel.' },
        { group: 'trans', needs: ['cr_l_transection_size', 'cr_l_transection_color'],
          text: 'The rectum was divided distally with a {cr_l_transection_size} stapler, {cr_l_transection_color|lc} cartridge.' },
        { group: 'trans', needs: ['cr_l_transection_size'],
          text: 'The rectum was divided distally with a {cr_l_transection_size} stapler.' },
        /* a sigmoidectomy that records no stapler still divided the bowel;
           the distal margin is the fact that must not go missing */
        { group: 'trans', needs: ['cr_margin_dist'],
          text: 'The bowel was divided distally at the intended margin, {cr_margin_dist} cm beyond the lesion.' },
        { group: 'trans',
          text: 'The bowel was divided distally at the intended margin.' }
      ],

      extraction_left: [
        { group: 'extract', needs: ['cr_approach'], equals: 'Open',
          text: 'The specimen was delivered through the laparotomy wound and passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction', 'cr_r_extraction_length'],
          text: 'A {cr_r_extraction_length} cm {cr_extraction|lc} incision was made, a wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction'],
          text: 'Extraction site: {cr_extraction}. A wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract',
          text: 'A «Pfannenstiel» incision was made, a wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' }
      ],

      margins: [
        { group: 'margins', needs: ['cr_margin_prox', 'cr_margin_dist'],
          text: 'Macroscopic resection margins measured {cr_margin_prox} cm proximally and {cr_margin_dist} cm distally.' },
        { group: 'margins', needs: ['cr_margin_prox'],
          text: 'The macroscopic proximal margin measured {cr_margin_prox} cm.' },
        { group: 'margins', needs: ['cr_margin_dist'],
          text: 'The macroscopic distal margin measured {cr_margin_dist} cm.' },
        { needs: ['cr_mesenteric_margin'],
          text: 'The mesenteric margin measured {cr_mesenteric_margin} cm.' }
      ],

      left_anastomosis: [
        { group: 'anast', needs: ['cr_approach', 'cr_l_circular', 'cr_anast_config'], equals: 'Open',
          text: 'The anvil of a {cr_l_circular} circular stapler was secured in the proximal colon with a purse-string suture, the stapler was passed per anum, and a double-stapled {cr_anast_config|lc} anastomosis was completed under direct vision, confirming correct orientation and absence of tension.' },
        { group: 'anast', needs: ['cr_l_circular', 'cr_anast_config'], not: 'Not used',
          text: 'The anvil of a {cr_l_circular} circular stapler was secured in the proximal colon with a purse-string suture and returned to the abdomen. Pneumoperitoneum was re-established and a double-stapled {cr_anast_config|lc} anastomosis was completed under direct vision, confirming correct orientation and absence of tension.' },
        { group: 'anast', needs: ['cr_anast_config'],
          text: 'A {cr_anast_config|lc} anastomosis was fashioned, confirming correct orientation and absence of tension.' },
        { needs: ['cr_l_doughnuts'], not: 'Not applicable',
          text: 'The doughnuts were inspected and were {cr_l_doughnuts|lc}.' },
        { needs: ['cr_rect_level'],
          text: 'The anastomosis lay {cr_rect_level} cm from the anal verge.' }
      ],

      /* every anastomosis is checked the same way, whoever made it */
      anast_check: [
        { group: 'perf', needs: ['cr_perfusion'], equals: 'Clinical only',
          text: 'The anastomosis was inspected and was clinically well perfused.' },
        { group: 'perf', needs: ['cr_perfusion'], equals: 'ICG',
          text: 'Perfusion of the anastomosis was confirmed by indocyanine green fluorescence.' },
        { group: 'perf', needs: ['cr_perfusion'], not: 'Not assessed',
          text: 'Perfusion of the anastomosis was assessed by {cr_perfusion|lc} and was satisfactory.' },
        { group: 'leak', needs: ['cr_leak_test', 'cr_l_leak_method'], not: 'Not performed',
          text: 'A {cr_l_leak_method|lc} air-leak test was performed under saline and was {cr_leak_test|lc}.' },
        { group: 'leak', needs: ['cr_leak_test'], not: 'Not performed',
          text: 'An air-leak test was performed under saline and was {cr_leak_test|lc}.' },
        { group: 'leak', needs: ['cr_leak_test'], equals: 'Not performed',
          text: 'No air-leak test was performed.' },
        { group: 'divert', needs: ['cr_diverting', 'cr_st_site'], not: 'None',
          text: 'A {cr_diverting|lc} was fashioned and matured at the {cr_st_site|lc} to protect the anastomosis.' },
        { group: 'divert', needs: ['cr_diverting'], not: 'None',
          text: 'A {cr_diverting|lc} was fashioned and matured at «the marked stoma site in the right iliac fossa» to protect the anastomosis.' },
        { group: 'divert', needs: ['cr_diverting'], equals: 'None',
          text: 'No defunctioning stoma was fashioned.' }
      ],

      /* ---- closing ------------------------------------------------- */
      hemostasis_pelvis: [
        { text: 'Hemostasis was confirmed and the pelvis irrigated with «warm saline».' }
      ],
      hemostasis_abdomen: [
        { text: 'Hemostasis was confirmed and the abdomen irrigated with «warm saline».' }
      ],
      drain: [
        { group: 'drain', needs: ['cr_drain', 'cr_drain_site', 'cr_drain_exit'], not: 'None',
          text: 'A {cr_drain|lc} was placed in the {cr_drain_site|lc|and}, brought out through the {cr_drain_exit|lc}.' },
        { group: 'drain', needs: ['cr_drain', 'cr_drain_site'], not: 'None',
          text: 'A {cr_drain|lc} was placed in the {cr_drain_site|lc|and}.' },
        { group: 'drain', needs: ['cr_drain'], not: 'None', text: 'A drain was placed: {cr_drain}.' },
        { group: 'drain', needs: ['cr_drain_site'], text: 'A drain was placed in the {cr_drain_site|lc|and}.' }
      ],
      close_ports: [
        { group: 'closeaccess', needs: ['cr_approach'], equals: 'Laparoscopic',
          text: 'Ports were removed under direct vision.' },
        { group: 'closeaccess', needs: ['cr_approach'], equals: 'Robotic',
          text: 'The platform was undocked and the ports were removed under direct vision.' }
      ],
      close_fascia: [
        { group: 'sheath', needs: ['cr_closure_sheath_material', 'cr_closure_sheath_fashion'],
          text: 'The fascia was closed with {cr_closure_sheath_material}, {cr_closure_sheath_fashion|lc}.' },
        { group: 'sheath', needs: ['cr_closure_sheath_material'],
          text: 'The fascia was closed with {cr_closure_sheath_material}.' }
      ],
      close_skin: [
        { group: 'skin', needs: ['cr_closure_skin_material', 'cr_closure_skin_fashion'],
          text: 'The skin was closed with {cr_closure_skin_material}, {cr_closure_skin_fashion|lc}.' },
        { group: 'skin', needs: ['cr_closure_skin_fashion'],
          text: 'The skin was closed {cr_closure_skin_fashion|lc}.' },
        { group: 'skin', needs: ['cr_closure_skin_material'],
          text: 'The skin was closed with {cr_closure_skin_material}.' }
      ],
      /* a part may itself be built out of parts */
      close_abdomen: [
        { use: 'close_ports' }, { use: 'close_fascia' }, { use: 'close_skin' }
      ],
      count: [
        { needs: ['cr_count'], equals: 'Yes',
          text: 'Sponge, needle and instrument counts were correct at the end of the procedure. The patient was extubated and transferred to recovery in a stable condition.' }
      ],

      /* ---- right-sided dissection ---------------------------------- */
      /* Each approach is a different operation, not a different word for
         the same one, so each gets its own step. The last line of the
         group is the fallback for a value I have not written for. */
      right_mobilise: [
        { group: 'rapp', needs: ['cr_r_approach'], equals: 'Medial-to-lateral',
          text: 'A medial-to-lateral dissection was performed. The ileocolic pedicle was placed on tension and the peritoneum incised at the junction of the ileocolic vein and the superior mesenteric vein. The avascular plane anterior to the duodenum and the head of the pancreas was entered and developed laterally, lifting the mesocolon off the retroperitoneum, with the right ureter and gonadal vessels identified and preserved.' },
        { group: 'rapp', needs: ['cr_r_approach'], equals: 'Inferior',
          text: 'An inferior, caudal-to-cranial dissection was performed. The peritoneum was incised at the base of the terminal ileal mesentery below the ileocolic pedicle, the retroperitoneal plane was entered from below and developed cranially over the duodenum and the head of the pancreas, with the right ureter and gonadal vessels identified and preserved.' },
        { group: 'rapp', needs: ['cr_r_approach'], equals: 'Superior',
          text: 'A superior, cranial-to-caudal dissection was performed. The gastrocolic ligament was divided and the lesser sac entered, the transverse mesocolon was separated from the anterior surface of the pancreas, and the gastrocolic trunk of Henle was exposed at its origin. The dissection was then carried caudally towards the ileocolic pedicle, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
        { group: 'rapp', needs: ['cr_r_approach'], equals: 'Lateral-to-medial',
          text: 'A lateral-to-medial dissection was performed. The lateral peritoneal attachments of the right colon were divided along the white line of Toldt and the right colon with its mesentery was reflected medially off the retroperitoneum, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
        { group: 'rapp', needs: ['cr_r_approach'], equals: 'Combined',
          text: 'A combined approach was used. The medial dissection was carried as far as the plane would safely allow before the inferior and lateral attachments were released to complete the mobilization, with the duodenum, right ureter and gonadal vessels identified and preserved.' },
        { group: 'rapp', needs: ['cr_r_approach'],
          text: 'A {cr_r_approach|lc} dissection was performed. The avascular plane between the mesocolon and the retroperitoneum was developed, exposing the duodenum and the head of the pancreas, with the right ureter and gonadal vessels identified and preserved.' },
        { needs: ['cr_r_cme'], equals: 'Yes',
          text: 'A complete mesocolic excision was performed, the mesocolic fascia being kept intact throughout the dissection.' },
        { group: 'cvl', needs: ['cr_r_cvl'], equals: 'Yes',
          text: 'Central vascular ligation was performed, the pedicles being taken flush with the superior mesenteric vein.' },
        { group: 'cvl', needs: ['cr_r_cvl'], equals: 'No',
          text: 'Central vascular ligation was not performed; the pedicles were divided distal to their origin.' },
        { group: 'vess', needs: ['cr_r_vessels', 'cr_r_vessel_control'],
          text: 'The following vessels were divided at their origin: {cr_r_vessels|lc|and}, secured with {cr_r_vessel_control|lc|and}. The gastrocolic trunk of Henle was identified and «preserved».' },
        { group: 'vess', needs: ['cr_r_vessels'],
          text: 'The following vessels were divided at their origin: {cr_r_vessels|lc|and}, secured «with Hem-o-lok clips». The gastrocolic trunk of Henle was identified and «preserved».' },
        { group: 'rca', needs: ['cr_r_rca'], equals: 'Absent',
          text: 'No true right colic artery was present, which is a recognized anatomical variant.' },
        { group: 'rca', needs: ['cr_r_rca'],
          text: 'The right colic artery was identified and divided at its origin.' },
        { needs: ['cr_r_nodes'], text: 'A {cr_r_nodes} lymphadenectomy was performed with the specimen.' },
        { needs: ['cr_procedure'], equals: 'Extended right hemicolectomy',
          text: 'The dissection was carried to the left of the middle colic trunk, «with the middle colic vessels divided at their origin», as appropriate for an extended right hemicolectomy.' },
        /* what is left to mobilize depends on where the dissection started */
        { group: 'flexure', needs: ['cr_r_approach'], equals: 'Lateral-to-medial',
          text: 'The gastrocolic ligament was divided and the hepatic flexure was taken down, completing the mobilization of the right colon.' },
        { group: 'flexure', needs: ['cr_r_approach'], equals: 'Superior',
          text: 'The lateral peritoneal attachments of the right colon were divided along the white line of Toldt and the hepatic flexure was taken down, joining the plane already developed in the lesser sac.' },
        { group: 'flexure',
          text: 'The hepatic flexure was mobilized «using a combined inferior and lateral approach», the gastrocolic ligament was divided, and the lateral attachments of the right colon were taken along the white line of Toldt to join the medial dissection.' }
      ],

      right_resect: [
        { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler', 'cr_r_ileal_margin'], equals: 'Intracorporeal',
          text: 'The terminal ileum {cr_r_ileal_margin} cm proximal to the ileocecal valve and the transverse colon at the intended distal margin were divided intracorporeally with {cr_r_stapler}.' },
        { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler'], equals: 'Intracorporeal',
          text: 'The terminal ileum «15 cm proximal to the ileocecal valve» and the transverse colon at the intended distal margin were divided intracorporeally with {cr_r_stapler}.' },
        { group: 'divide', needs: ['cr_approach', 'cr_r_stapler', 'cr_r_ileal_margin'], equals: 'Open',
          text: 'The terminal ileum {cr_r_ileal_margin} cm proximal to the ileocecal valve and the transverse colon at the intended distal margin were divided with {cr_r_stapler}.' },
        { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler', 'cr_r_extraction_length', 'cr_r_ileal_margin'], equals: 'Extracorporeal',
          text: 'A {cr_r_extraction_length} cm {cr_extraction|lc} incision was made, a wound protector was placed and the mobilized right colon was exteriorized. The terminal ileum {cr_r_ileal_margin} cm proximal to the ileocecal valve and the transverse colon at the intended distal margin were divided with {cr_r_stapler}.' },
        { group: 'divide', needs: ['cr_r_anast_site', 'cr_r_stapler'], equals: 'Extracorporeal',
          text: 'A «6 cm periumbilical midline» incision was made, a wound protector was placed and the mobilized right colon was exteriorized. The terminal ileum «15 cm proximal to the ileocecal valve» and the transverse colon at the intended distal margin were divided with {cr_r_stapler}.' },
        { group: 'divide', needs: ['cr_r_stapler'],
          text: 'The terminal ileum and the transverse colon were divided at the intended margins with {cr_r_stapler}.' },

        { group: 'ranast', needs: ['cr_approach', 'cr_r_anast_config'], equals: 'Open',
          text: 'A {cr_r_anast_config|lc} ileocolic anastomosis was fashioned, confirming correct orientation and absence of tension.' },
        { group: 'ranast', needs: ['cr_r_anast_site', 'cr_r_anast_config'], equals: 'Intracorporeal',
          text: 'An intracorporeal {cr_r_anast_config|lc} ileocolic anastomosis was fashioned, confirming correct orientation and absence of tension.' },
        { group: 'ranast', needs: ['cr_r_anast_site', 'cr_r_anast_config'], equals: 'Extracorporeal',
          text: 'An extracorporeal {cr_r_anast_config|lc} ileocolic anastomosis was fashioned, confirming correct orientation and absence of tension.' },
        { group: 'ranast', needs: ['cr_r_anast_config'],
          text: 'A {cr_r_anast_config|lc} ileocolic anastomosis was fashioned.' },
        { needs: ['cr_r_enterotomy'], text: 'The common enterotomy was closed: {cr_r_enterotomy|lc}.' },
        { group: 'mesdef', needs: ['cr_r_mesenteric', 'cr_r_mesenteric_material', 'cr_r_mesenteric_fashion'], equals: 'Closed',
          text: 'The mesenteric defect was closed with {cr_r_mesenteric_material}, {cr_r_mesenteric_fashion|lc}.' },
        { group: 'mesdef', needs: ['cr_r_mesenteric'], equals: 'Closed',
          text: 'The mesenteric defect was closed «with a running barbed suture».' },
        { group: 'mesdef', needs: ['cr_r_mesenteric'], equals: 'Left open',
          text: 'The mesenteric defect was left open.' },
        { group: 'mesdef', text: 'The mesenteric defect was «closed with a running barbed suture».' },

        { group: 'extract', needs: ['cr_approach'], equals: 'Open',
          text: 'The specimen was delivered through the laparotomy wound and passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_r_anast_site'], equals: 'Extracorporeal',
          text: 'The anastomosis was returned to the abdomen and the specimen was delivered through the same incision. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction', 'cr_r_extraction_length'],
          text: 'A {cr_r_extraction_length} cm {cr_extraction|lc} incision was made, a wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction'],
          text: 'Extraction site: {cr_extraction}. A wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract',
          text: 'The umbilical port site was extended as a «periumbilical midline» incision, a wound protector was placed, and the specimen was delivered. The specimen was passed off the field: {organ_removed}' }
      ],

      /* ---- stoma ---------------------------------------------------- */
      /* Forming a stoma and maturing it are separated because the abdomen
         is closed between the two. Writing them as one run would put the
         maturation before the fascial closure, which is not what happened. */
      stoma_form: [
        { group: 'stsite', needs: ['cr_st_marked', 'cr_st_site'], equals: 'stoma nurse',
          text: 'The stoma site had been marked preoperatively by the stoma nurse. The stoma was sited at the {cr_st_site|lc}.' },
        { group: 'stsite', needs: ['cr_st_marked', 'cr_st_site'], equals: 'by the surgeon',
          text: 'The stoma site had been marked preoperatively by the surgeon. The stoma was sited at the {cr_st_site|lc}.' },
        { group: 'stsite', needs: ['cr_st_marked', 'cr_st_site'], equals: 'No',
          text: 'The stoma site had not been marked preoperatively. The stoma was sited at the {cr_st_site|lc}.' },
        { group: 'stsite', needs: ['cr_st_site'],
          text: 'The stoma was sited at the {cr_st_site|lc}.' },
        { group: 'stsite', text: 'The stoma was sited at «the marked site in the left iliac fossa».' },
        { group: 'treph', needs: ['cr_st_trephine'],
          text: 'The abdominal wall was opened at that site through a {cr_st_trephine|lc}: the subcutaneous fat was divided, the anterior rectus sheath incised cruciately, the rectus muscle split rather than divided and the posterior sheath and peritoneum opened to admit two fingers.' },
        { group: 'treph',
          text: 'The abdominal wall was opened at that site through a «circular skin disc»: the anterior rectus sheath incised cruciately, the rectus muscle split rather than divided and the posterior sheath and peritoneum opened to admit two fingers.' },
        { group: 'stdeliver', needs: ['cr_procedure'], equals: 'Loop ileostomy',
          text: 'A mobile loop of terminal ileum «40 cm proximal to the ileocecal valve» was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['cr_procedure'], equals: 'Loop colostomy',
          text: 'A mobile loop of «transverse» colon was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['cr_procedure'], equals: 'End ileostomy',
          text: 'The divided end of the ileum was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { group: 'stdeliver',
          text: 'The divided proximal end of the colon was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { needs: ['cr_st_rod'], equals: 'Yes',
          text: 'A supporting rod was passed through the mesenteric window beneath the loop.' },
        { needs: ['cr_st_rod'], equals: 'No', text: 'No supporting rod was used.' }
      ],

      stoma_mature: [
        { group: 'stmat', needs: ['cr_procedure', 'cr_st_suture'], equals: 'Loop',
          text: 'The abdominal wall having been closed, the stoma was opened transversely on its distal aspect and matured as a Brooke loop stoma with {cr_st_suture|lc}, each bite taking seromuscular bowel, the fascial edge and the dermis, so that the proximal limb everted as a spout.' },
        { group: 'stmat', needs: ['cr_procedure'], equals: 'Loop',
          text: 'The abdominal wall having been closed, the stoma was opened transversely on its distal aspect and matured as a Brooke loop stoma with «interrupted 3-0 Vicryl», each bite taking seromuscular bowel, the fascial edge and the dermis, so that the proximal limb everted as a spout.' },
        { group: 'stmat', needs: ['cr_st_suture'],
          text: 'The abdominal wall having been closed, the stoma was matured as a Brooke end stoma with {cr_st_suture|lc}, each bite taking seromuscular bowel, the fascial edge and the dermis.' },
        { group: 'stmat',
          text: 'The abdominal wall having been closed, the stoma was matured as a Brooke end stoma with «interrupted 3-0 Vicryl», each bite taking seromuscular bowel, the fascial edge and the dermis.' },
        { text: 'The stoma was pink and viable at the end of the procedure and an appliance was applied.' }
      ],

      /* The same two acts as the colorectal versions, reading the stoma
         category's own fields. They are kept apart rather than shared,
         because a stoma raised to protect an anastomosis and a stoma raised
         as the whole operation are answered on different pages. */
      st_form: [
        { group: 'ststsite', needs: ['st_marked', 'st_site'], equals: 'stoma nurse',
          text: 'The stoma site had been marked preoperatively by the stoma nurse. The stoma was sited at the {st_site|lc}.' },
        { group: 'ststsite', needs: ['st_marked', 'st_site'], equals: 'by the surgeon',
          text: 'The stoma site had been marked preoperatively by the surgeon. The stoma was sited at the {st_site|lc}.' },
        { group: 'ststsite', needs: ['st_marked', 'st_site'], equals: 'No',
          text: 'The stoma site had not been marked preoperatively. The stoma was sited at the {st_site|lc}.' },
        { group: 'ststsite', needs: ['st_site'], text: 'The stoma was sited at the {st_site|lc}.' },
        { group: 'sttreph', needs: ['st_trephine'],
          text: 'The abdominal wall was opened at that site through a {st_trephine|lc}: the subcutaneous fat was divided, the anterior rectus sheath incised cruciately, the rectus muscle split rather than divided and the posterior sheath and peritoneum opened to admit two fingers.' },
        { group: 'stdeliver', needs: ['st_procedure'], equals: 'Loop ileostomy',
          text: 'A mobile loop of terminal ileum «40 cm proximal to the ileocecal valve» was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['st_procedure'], equals: 'Loop colostomy',
          text: 'A mobile loop of «transverse» colon was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['st_procedure'], equals: 'End ileostomy',
          text: 'The divided end of the ileum was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { group: 'stdeliver',
          text: 'The divided proximal end of the colon was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { needs: ['st_rod'], equals: 'Yes',
          text: 'A supporting rod was passed through the mesenteric window beneath the loop.' },
        { needs: ['st_rod'], equals: 'No', text: 'No supporting rod was used.' }
      ],

      st_mature: [
        { group: 'ststmat', needs: ['st_procedure', 'st_suture'], equals: 'Loop',
          text: 'The abdominal wall having been closed, the stoma was opened transversely on its distal aspect and matured as a Brooke loop stoma with {st_suture|lc}, each bite taking seromuscular bowel, the fascial edge and the dermis, so that the proximal limb everted as a spout.' },
        { group: 'ststmat', needs: ['st_procedure'], equals: 'Loop',
          text: 'The abdominal wall having been closed, the stoma was opened transversely on its distal aspect and matured as a Brooke loop stoma «with interrupted 3-0 Vicryl».' },
        { group: 'ststmat', needs: ['st_suture'],
          text: 'The abdominal wall having been closed, the stoma was matured as a Brooke end stoma with {st_suture|lc}, each bite taking seromuscular bowel, the fascial edge and the dermis.' },
        { group: 'ststmat',
          text: 'The abdominal wall having been closed, the stoma was matured as a Brooke end stoma «with interrupted 3-0 Vicryl».' },
        { text: 'The stoma was pink and viable at the end of the procedure and an appliance was applied.' }
      ],

      st_reason: [
        { group: 'streason', needs: ['st_indication'], equals: 'Other',
          text: 'The stoma was raised for the reason recorded: {st_indication}.' },
        { group: 'streason', needs: ['st_indication'],
          text: 'The stoma was raised {st_indication|lc}.' }
      ],

      st_setup: [
        { group: 'stpos', needs: ['st_position', 'anaesthesia'],
          text: 'Under {anaesthesia}, the patient was placed in the {st_position|lc} position. A urinary catheter was inserted. The abdomen was prepared and draped in the usual sterile fashion and the surgical safety checklist was completed.' },
        { group: 'stpos', needs: ['st_position'],
          text: 'The patient was placed in the {st_position|lc} position and the abdomen was prepared and draped in the usual sterile fashion.' }
      ],

      st_access_form: [
        { group: 'staccess', needs: ['st_approach'], equals: 'Trephine',
          text: 'The abdomen was not opened; the stoma was made through a trephine at the marked site alone.' },
        { group: 'staccess', needs: ['st_approach', 'st_incision'], equals: 'Open (laparotomy)',
          text: 'The abdomen was opened: {st_incision}' },
        { group: 'staccess', needs: ['st_approach'], equals: 'converted to open',
          text: 'Pneumoperitoneum was established to «12 mmHg» and the procedure was subsequently converted to open.' },
        { group: 'staccess', needs: ['st_approach'], equals: 'Laparoscopic',
          text: 'Pneumoperitoneum was established to «12 mmHg» and «a camera port at the umbilicus with two 5 mm working ports» was used, and the bowel was inspected.' },
        { group: 'staccess', needs: ['st_approach'], equals: 'Robotic',
          text: 'Pneumoperitoneum was established to «12 mmHg», the robotic ports were placed and the platform was docked.' },
        { group: 'staccess', needs: ['st_approach'], equals: 'Open (laparotomy)',
          text: 'The abdomen was opened through a «midline» incision.' }
      ],

      st_check: [
        { group: 'stperf', needs: ['st_perfusion'], equals: 'Clinical only',
          text: 'The anastomosis was inspected and was clinically well perfused.' },
        { group: 'stperf', needs: ['st_perfusion'], equals: 'ICG',
          text: 'Perfusion of the anastomosis was confirmed by indocyanine green fluorescence.' },
        { group: 'stleak', needs: ['st_leak_test'], not: 'Not performed',
          text: 'An air-leak test was performed under saline and was {st_leak_test|lc}.' },
        { group: 'stleak', needs: ['st_leak_test'], equals: 'Not performed',
          text: 'No air-leak test was performed.' }
      ],

      st_flexure: [
        { group: 'stflex', needs: ['st_splenic_flexure'], equals: 'Yes',
          text: 'The splenic flexure was mobilized «using a combined inferior, anterior and lateral approach» so that the conduit reached the stump without tension.' },
        { group: 'stflex', needs: ['st_splenic_flexure'], equals: 'No',
          text: 'The splenic flexure was not mobilized; the conduit reached the stump without tension.' }
      ],

      st_stump_found: [
        { needs: ['st_stump'],
          text: 'The rectal stump had been {st_stump|lc} at the index operation.' },
        { group: 'stfoundmark', needs: ['st_stump_marked'], equals: 'Not marked',
          text: 'It had not been marked.' },
        { group: 'stfoundmark', needs: ['st_stump_marked'],
          text: 'It had been marked with {st_stump_marked|lc}, which aided its identification.' },
        /* only a reversal has a stump to find — an ileostomy closure does not */
        { needs: ['st_stump'],
          text: 'The stump was identified «with the aid of a rigid sigmoidoscope passed per anum» and mobilized sufficiently to allow a tension-free anastomosis.' }
      ],

      st_drain_part: [
        { group: 'stdrain', needs: ['st_drain_site'], equals: 'None',
          text: 'No intra-abdominal drain was left.' },
        { group: 'stdrain', needs: ['st_drain_site', 'st_drain'],
          text: 'A {st_drain|lc} was placed in the {st_drain_site|lc}.' },
        { group: 'stdrain', needs: ['st_drain_site'],
          text: 'A drain was placed in the {st_drain_site|lc}.' }
      ],

      st_close: [
        { group: 'stports', needs: ['st_approach'], equals: 'Laparoscopic',
          text: 'Ports were removed under direct vision.' },
        { group: 'stsheath', needs: ['st_sheath_material', 'st_sheath_fashion'],
          text: 'The sheath was closed with {st_sheath_material}, {st_sheath_fashion|lc}.' },
        { group: 'stsheath', needs: ['st_sheath_material'],
          text: 'The sheath was closed with {st_sheath_material}.' },
        { group: 'stsheath', needs: ['st_sheath_fashion'],
          text: 'The sheath was closed {st_sheath_fashion|lc}.' }
      ],

      st_count: [
        { needs: ['st_count'], equals: 'Yes',
          text: 'Sponge, needle and instrument counts were correct at the end of the procedure. The patient was extubated and transferred to recovery in a stable condition.' }
      ],

      /* ---- perineal phase (APR) ------------------------------------ */
      perineal: [
        { group: 'appos', needs: ['cr_ap_position'], equals: 'Prone jackknife',
          text: 'The abdomen having been closed, the patient was turned into the prone jackknife position and the perineum was prepared and draped.' },
        { group: 'appos', needs: ['cr_ap_position'], equals: 'Lithotomy',
          text: 'The perineal phase was carried out with the patient in the lithotomy position.' },
        { group: 'appos', text: 'The perineal phase was then carried out.' },
        { text: 'The anus was closed with a heavy purse-string suture and an elliptical incision was made around the anal verge.' },
        { group: 'aptype', needs: ['cr_ap_type'], equals: 'Extralevator',
          text: 'An extralevator excision was performed: the ischioanal fat was taken with the specimen and the levator ani was divided at its origin, producing a cylindrical specimen without a waist at the anorectal junction.' },
        { group: 'aptype', needs: ['cr_ap_type'], equals: 'Ischioanal',
          text: 'An ischioanal dissection was performed, the ischioanal fat being taken widely with the specimen.' },
        { group: 'aptype', needs: ['cr_ap_type'], equals: 'Standard',
          text: 'A standard abdominoperineal excision was performed, the dissection being carried up in the intersphincteric and perirectal plane to meet the abdominal dissection.' },
        { group: 'aplev', needs: ['cr_ap_levator'], equals: 'pelvic sidewall',
          text: 'The levator ani was divided at its origin on the pelvic sidewall.' },
        { group: 'aplev', needs: ['cr_ap_levator'], equals: 'insertion',
          text: 'The levator ani was divided at its insertion on the rectum.' },
        { text: 'Anteriorly the dissection was carried in the plane in front of the anorectum, taking care to avoid injury to the adjacent structures, until the perineal and abdominal planes met.' },
        { text: 'The specimen was delivered through the perineal wound and passed off the field: {organ_removed}' },
        { text: 'Hemostasis in the pelvis was secured.' }
      ],

      /* split so the resection margins can be stated once the specimen is
         off the field but before the perineum is closed over it */
      perineal_close: [
        { group: 'apclose', needs: ['cr_ap_closure'], equals: 'Primary',
          text: 'The perineal wound was closed primarily in layers.' },
        { group: 'apclose', needs: ['cr_ap_closure'], equals: 'Biologic mesh',
          text: 'The pelvic floor defect was reconstructed with a biologic mesh and the perineal wound was closed in layers over it.' },
        { group: 'apclose', needs: ['cr_ap_closure'], equals: 'Myocutaneous flap',
          text: 'The perineal defect was reconstructed with a myocutaneous flap.' },
        { group: 'apclose', needs: ['cr_ap_closure'], equals: 'Omentoplasty',
          text: 'An omental pedicle flap was brought down to fill the pelvis and the perineal wound was closed in layers.' },
        { group: 'apclose', needs: ['cr_ap_closure'], equals: 'Left open',
          text: 'The perineal wound was left open and packed.' },
        { group: 'apclose', needs: ['cr_ap_closure'], text: 'Perineal closure: {cr_ap_closure}.' },
        { needs: ['cr_ap_drain'], equals: 'Yes',
          text: 'A presacral drain was left in the pelvis and brought out through a separate perineal stab incision.' },
        { needs: ['cr_ap_drain'], equals: 'No', text: 'No presacral drain was left.' }
      ],

      /* ---- Hartmann and its reversal -------------------------------- */
      hartmann_stump: [
        { group: 'stump', needs: ['cr_ha_stump'], equals: 'linear stapler',
          text: 'The rectal stump was closed with a linear stapler and the staple line was inspected and found to be intact.' },
        { group: 'stump', needs: ['cr_ha_stump'], equals: 'Hand-sewn',
          text: 'The rectal stump was closed by hand «in two layers».' },
        { group: 'stump', needs: ['cr_ha_stump'], equals: 'mucous fistula',
          text: 'The distal bowel was brought out as a mucous fistula rather than closed.' },
        { group: 'stump', text: 'The rectal stump was closed «with a linear stapler».' },
        { group: 'stumpmark', needs: ['cr_ha_stump_marked'], equals: 'Long non-absorbable',
          text: 'The stump was marked with long non-absorbable sutures to aid its identification at a future reversal.' },
        { group: 'stumpmark', needs: ['cr_ha_stump_marked'], equals: 'Metal clips',
          text: 'The stump was marked with metal clips to aid its identification at a future reversal.' },
        { group: 'stumpmark', needs: ['cr_ha_stump_marked'], equals: 'Not marked',
          text: 'The stump was not marked.' }
      ],


      adhesiolysis: [
        { needs: ['cr_ha_adhesio'], equals: 'None', text: 'No significant adhesions were encountered.' },
        { needs: ['cr_ha_adhesio'], equals: 'Limited',
          text: 'Limited adhesiolysis was required to expose the rectal stump and the proximal bowel.' },
        { needs: ['cr_ha_adhesio'], equals: 'Extensive',
          text: 'Extensive adhesiolysis was required, and the small bowel was run in its entirety at the end of the dissection to confirm that no enterotomy had been made.' }
      ],

      /* ---- taking a stoma down -------------------------------------- */
      st_takedown: [
        { group: 'sctype', needs: ['st_type'],
          text: 'The {st_type|lc} was mobilized, the mucocutaneous junction being excised circumferentially and the bowel freed from the fascia and the peritoneum until it lay free within the abdominal cavity.' },
        { group: 'sctype',
          text: 'The stoma was mobilized, the mucocutaneous junction being excised circumferentially and the bowel freed from the fascia and the peritoneum until it lay free within the abdominal cavity.' }
      ],

      /* ---- perianal fistula ----------------------------------------
         fi_procedure is a checklist, so a case may be "drainage of
         abscess AND draining seton" — the usual pattern. Each procedure
         therefore carries its OWN group prefix rather than sharing one,
         so ticking two prints two accounts instead of the first one only. */
      fi_setup: [
        { group: 'fipos', needs: ['fi_position', 'anaesthesia'],
          text: 'Under {anaesthesia}, the patient was placed in the {fi_position|lc} position and the perineum was prepared and draped.' },
        { group: 'fipos', needs: ['fi_position'],
          text: 'The patient was placed in the {fi_position|lc} position and the perineum was prepared and draped.' },
        { group: 'fiprior', needs: ['fi_prior'], equals: 'None',
          text: 'There had been no previous anorectal surgery.' },
        { group: 'fiprior', needs: ['fi_prior'],
          text: 'There had been previous anorectal surgery: {fi_prior|lc}.' },
        { text: 'Examination under anesthesia was performed, with inspection of the perineum, digital rectal examination and proctoscopy.' }
      ],

      fi_assess: [
        { group: 'fiid', needs: ['fi_identify'], not: 'Not identified',
          text: 'The internal opening was identified using {fi_identify|lc|and}.' },
        { group: 'fiid', needs: ['fi_identify'], equals: 'Not identified',
          text: 'Despite a careful search the internal opening could not be identified.' },
        { group: 'fiprobe', needs: ['fi_probe'], equals: 'Yes, easily',
          text: 'A malleable probe passed easily along the tract between the two openings.' },
        { group: 'fiprobe', needs: ['fi_probe'], equals: 'with difficulty',
          text: 'A malleable probe passed along the tract with difficulty, the tract being narrow and tortuous; no false passage was created.' },
        { group: 'fiprobe', needs: ['fi_probe'], equals: 'No',
          text: 'A probe could not be passed along the tract, so no attempt was made to force it.' },
        { needs: ['fi_tracts'], text: '{fi_tracts}' }
      ],

      fi_eua_only: [
        { needs: ['fi_procedure'], equals: 'Examination under anesthesia only',
          text: 'Examination under anesthesia alone was performed; no definitive procedure was undertaken at this sitting, and the findings were recorded to plan definitive treatment.' }
      ],

      fi_abscess: [
        { group: 'fiabs', needs: ['fi_procedure', 'fi_abscess_site', 'fi_abscess_pus'], equals: 'Drainage of abscess',
          text: 'A {fi_abscess_site|lc} abscess was drained through a «cruciate» incision placed as close to the anal verge as the cavity allowed, and {fi_abscess_pus} mL of pus was released and sent for culture and sensitivity.' },
        { group: 'fiabs', needs: ['fi_procedure', 'fi_abscess_site'], equals: 'Drainage of abscess',
          text: 'A {fi_abscess_site|lc} abscess was drained through a «cruciate» incision placed as close to the anal verge as the cavity allowed, and the pus was sent for culture and sensitivity.' },
        { group: 'fiabs', needs: ['fi_procedure'], equals: 'Drainage of abscess',
          text: 'The abscess was drained through a «cruciate» incision and the pus sent for culture and sensitivity.' },
        { needs: ['fi_procedure'], equals: 'Drainage of abscess',
          text: 'The cavity was explored with a finger, all loculi were broken down and the cavity was irrigated with «warm saline».' },
        { group: 'fiabsdr', needs: ['fi_procedure', 'fi_abscess_drain'], equals: 'Drainage of abscess', not: 'Nothing',
          text: 'A {fi_abscess_drain|lc} was left in the cavity.' },
        { group: 'fiabsdr', needs: ['fi_abscess_drain'], equals: 'Nothing',
          text: 'Nothing was left in the cavity, which was left open to drain freely.' }
      ],

      /* "Fistulotomy" is a substring of "Fistulotomy with immediate
         sphincteroplasty (FIPS)", so these lines say what they are NOT as
         well as what they are — equals and not both test the same field. */
      fi_fistulotomy: [
        { group: 'filo', needs: ['fi_procedure', 'fi_lay_open'], equals: 'Fistulotomy', not: 'immediate sphincteroplasty',
          text: 'The tract was laid open along the probe with diathermy, dividing the overlying skin, subcutaneous tissue and the {fi_lay_open}% of the external sphincter that the tract encircled. The remaining sphincter was left intact and the anorectal ring was preserved.' },
        { group: 'filo', needs: ['fi_procedure'], equals: 'Fistulotomy', not: 'immediate sphincteroplasty',
          text: 'The tract was laid open along the probe with diathermy, dividing the overlying skin and subcutaneous tissue and only that part of the external sphincter encircled by the tract. The anorectal ring was preserved.' },
        { needs: ['fi_procedure'], equals: 'Fistulotomy', not: 'immediate sphincteroplasty',
          text: 'The laid-open tract was saucerized, its edges trimmed so that the wound was wider at the skin than at its base and would heal from the base upwards.' }
      ],

      fi_fistulectomy: [
        { group: 'file', needs: ['fi_procedure'], equals: 'Fistulectomy', not: 'immediate sphincteroplasty',
          text: 'The tract was cored out in its entirety by sharp dissection immediately outside its fibrous wall, from the external opening through to the internal opening, and removed intact as a single specimen.' },
        { group: 'filedivide', needs: ['fi_procedure', 'fi_lay_open'], equals: 'Fistulectomy', not: 'immediate sphincteroplasty',
          text: 'In the course of the excision {fi_lay_open}% of the external sphincter was divided; the remainder and the anorectal ring were left intact.' },
        { needs: ['fi_procedure'], equals: 'Fistulectomy', not: 'immediate sphincteroplasty',
          text: 'The resulting defect was left open to granulate.' }
      ],

      /* FIPS — the tract is dealt with as usual and the divided sphincter
         is then repaired at the same sitting, which is the whole point of
         the operation and must be narrated as its own act. */
      fi_fips: [
        { group: 'fipsopen', needs: ['fi_procedure', 'fi_lay_open'], equals: 'Fistulotomy with immediate sphincteroplasty',
          text: 'The tract was laid open along the probe with diathermy, dividing the overlying skin, subcutaneous tissue and the {fi_lay_open}% of the external sphincter that the tract encircled.' },
        { group: 'fipsopen', needs: ['fi_procedure'], equals: 'Fistulotomy with immediate sphincteroplasty',
          text: 'The tract was laid open along the probe with diathermy, dividing the overlying skin, subcutaneous tissue and that part of the external sphincter encircled by the tract.' },
        { group: 'fipsopen', needs: ['fi_procedure', 'fi_lay_open'], equals: 'Fistulectomy with immediate sphincteroplasty',
          text: 'The tract was cored out in its entirety by sharp dissection immediately outside its fibrous wall and removed intact as a single specimen, dividing the {fi_lay_open}% of the external sphincter that it encircled.' },
        { group: 'fipsopen', needs: ['fi_procedure'], equals: 'Fistulectomy with immediate sphincteroplasty',
          text: 'The tract was cored out in its entirety by sharp dissection immediately outside its fibrous wall and removed intact as a single specimen, dividing that part of the external sphincter which it encircled.' },
        { needs: ['fi_procedure'], equals: 'immediate sphincteroplasty',
          text: 'The granulation tissue was curetted away and the internal opening was excised together with the adjacent crypt-bearing tissue, so that the repair would lie on healthy tissue.' },
        { needs: ['fi_procedure'], equals: 'immediate sphincteroplasty',
          text: 'The cut ends of the sphincter were identified, held on stay sutures and mobilized laterally for «1 cm» in each direction, keeping the dissection close to the muscle so that the nerve supply entering posterolaterally was not disturbed.' },
        { group: 'fipsrep', needs: ['fi_fips_repair', 'fi_fips_suture'], equals: 'Overlapping',
          text: 'An immediate sphincteroplasty was performed, the divided ends being overlapped and repaired with {fi_fips_suture}.' },
        { group: 'fipsrep', needs: ['fi_fips_repair', 'fi_fips_suture'], equals: 'End-to-end',
          text: 'An immediate sphincteroplasty was performed, the divided ends being repaired by direct end-to-end apposition with {fi_fips_suture}.' },
        { group: 'fipsrep', needs: ['fi_fips_repair'], equals: 'Overlapping',
          text: 'An immediate sphincteroplasty was performed, the divided ends being overlapped and repaired «with interrupted 3-0 PDS».' },
        { group: 'fipsrep', needs: ['fi_fips_repair'],
          text: 'An immediate sphincteroplasty was performed, the divided ends being repaired by direct end-to-end apposition «with interrupted 3-0 PDS».' },
        { group: 'fipsrep', needs: ['fi_procedure'], equals: 'immediate sphincteroplasty',
          text: 'An immediate sphincteroplasty was performed, the divided ends being repaired «by direct end-to-end apposition with interrupted 3-0 PDS».' },
        { needs: ['fi_procedure'], equals: 'immediate sphincteroplasty',
          text: 'The repair was tested digitally and gripped the finger evenly, with no palpable gap.' },
        { needs: ['fi_procedure'], equals: 'immediate sphincteroplasty',
          text: 'The anoderm and skin were closed over the repair «with interrupted 3-0 Vicryl», the most dependent part of the wound being left open so that any collection could drain away from the suture line.' }
      ],

      fi_curettage: [
        { group: 'ficur', needs: ['fi_curettage'], equals: 'Yes',
          text: 'The granulation tissue lining the tract was curetted away with a Volkmann spoon and the tract irrigated.' },
        { group: 'ficur', needs: ['fi_curettage'], equals: 'No',
          text: 'The lining of the tract was not curetted.' },
        { group: 'ficur', needs: ['fi_procedure'], equals: 'Curettage of tract',
          text: 'The tract was curetted thoroughly with a Volkmann spoon and irrigated until the walls were clean and bleeding freely.' }
      ],

      fi_lift: [
        { needs: ['fi_procedure'], equals: 'LIFT',
          text: 'A curved incision was made over the intersphincteric groove at the level of the tract, and the plane between the internal and external sphincters was opened by combined blunt and sharp dissection.' },
        { needs: ['fi_procedure'], equals: 'LIFT',
          text: 'The intersphincteric portion of the tract was isolated on a right-angled forceps, its identity confirmed by passing a probe from the external opening.' },
        { group: 'filift', needs: ['fi_lift_tract', 'fi_lift_suture'], equals: 'Ligated and divided',
          text: 'The tract was ligated on both sides with {fi_lift_suture} and divided between the ligatures.' },
        { group: 'filift', needs: ['fi_lift_tract'], equals: 'Ligated and divided',
          text: 'The tract was ligated on both sides «with 3-0 Vicryl» and divided between the ligatures.' },
        { group: 'filift', needs: ['fi_lift_tract', 'fi_lift_suture'], equals: 'Ligated only',
          text: 'The tract was ligated close to the internal sphincter with {fi_lift_suture} and left undivided.' },
        { group: 'filift', needs: ['fi_lift_tract'], equals: 'Excised',
          text: 'The intersphincteric segment of the tract was excised and both ends were ligated «with 3-0 Vicryl».' },
        { needs: ['fi_procedure'], equals: 'LIFT',
          text: 'Hydrogen peroxide was injected through the external opening and no leak was seen at the ligated internal end, confirming that the tract had been sealed.' },
        { group: 'filiftext', needs: ['fi_lift_external'], equals: 'Cored out',
          text: 'The external part of the tract was cored out and the external opening was left open to drain.' },
        { group: 'filiftext', needs: ['fi_lift_external'], equals: 'Curetted',
          text: 'The external part of the tract was curetted and the external opening was left open to drain.' },
        { group: 'filiftext', needs: ['fi_lift_external'], equals: 'Closed',
          text: 'The external opening was closed.' },
        { needs: ['fi_procedure'], equals: 'LIFT',
          text: 'The intersphincteric wound was closed «with interrupted 3-0 Vicryl», leaving a small gap at its dependent end for drainage.' }
      ],

      fi_flap: [
        { group: 'fiflapopen', needs: ['fi_procedure'], equals: 'advancement flap',
          text: 'The internal opening was excised together with the adjacent crypt-bearing tissue, and the tract was curetted from the internal opening outwards.' },
        { group: 'fiflap', needs: ['fi_flap_type'], equals: 'Anodermal',
          text: 'An anodermal flap with a broad base was raised from below the dentate line, «twice as wide at its base as at its apex», and mobilized until it lay over the defect without tension.' },
        { group: 'fiflap', needs: ['fi_flap_type'],
          text: 'A {fi_flap_type|lc} flap with a broad base was raised from the rectal wall above the internal opening, «twice as wide at its base as at its apex», and mobilized until it lay over the defect without tension.' },
        { group: 'fiflap', needs: ['fi_procedure'], equals: 'advancement flap',
          text: 'A broad-based flap was raised above the internal opening and mobilized until it lay over the defect without tension.' },
        { needs: ['fi_procedure'], equals: 'advancement flap',
          text: 'The defect in the sphincter was closed «with interrupted 3-0 Vicryl».' },
        { group: 'fiflapsut', needs: ['fi_flap_suture'],
          text: 'The flap was advanced beyond the level of the closed internal opening and sutured in place with {fi_flap_suture}, its suture line lying on healthy tissue away from the repair.' },
        { group: 'fiflapsut', needs: ['fi_procedure'], equals: 'advancement flap',
          text: 'The flap was advanced beyond the level of the closed internal opening and sutured in place «with interrupted 3-0 Vicryl», its suture line lying on healthy tissue away from the repair.' },
        { needs: ['fi_procedure'], equals: 'advancement flap',
          text: 'The external opening was curetted and left open to drain.' }
      ],

      fi_vaaft: [
        { needs: ['fi_procedure'], equals: 'VAAFT',
          text: 'A fistuloscope was introduced through the external opening and the tract was inspected under continuous irrigation along its whole length, the internal opening being identified endoscopically from within the tract and confirmed by transillumination in the anal canal.' },
        { needs: ['fi_procedure'], equals: 'VAAFT',
          text: 'Any secondary tract seen was followed and treated in the same way.' },
        { needs: ['fi_procedure'], equals: 'VAAFT',
          text: 'The lining of the tract was ablated under direct vision with a unipolar electrode and the necrotic debris cleared with the endobrush and irrigation.' },
        { needs: ['fi_procedure'], equals: 'VAAFT',
          text: 'The internal opening was closed «with a linear stapler», and the closure was checked and found to be secure.' }
      ],

      fi_filac: [
        { needs: ['fi_procedure'], equals: 'Laser closure',
          text: 'The tract was curetted and irrigated, and a radial-emitting laser fibre was passed along it until its tip lay at the internal opening.' },
        { needs: ['fi_procedure'], equals: 'Laser closure',
          text: 'The fibre was withdrawn at a steady «1 mm per second» while delivering «13 W», so that the epithelial lining was ablated and the tract shrank along its whole length.' },
        { needs: ['fi_procedure'], equals: 'Laser closure',
          text: 'The internal opening was closed «with an advancement flap» and the external opening was left open to drain.' }
      ],

      fi_plug: [
        { needs: ['fi_procedure'], equals: 'Fistula plug',
          text: 'The tract was curetted and irrigated «with hydrogen peroxide and saline», and no attempt was made to excise it.' },
        { needs: ['fi_procedure'], equals: 'Fistula plug',
          text: 'A bioprosthetic plug was drawn through the tract from the internal opening until it seated snugly, secured at the internal opening «with a figure-of-eight 2-0 Vicryl taking the internal sphincter», and the excess trimmed flush at both ends.' },
        { needs: ['fi_procedure'], equals: 'Fistula plug',
          text: 'The external opening was left open so that the tract could drain around the plug.' }
      ],

      fi_glue: [
        { needs: ['fi_procedure'], equals: 'Fibrin glue',
          text: 'The tract was curetted and irrigated, and fibrin glue was injected through a catheter advanced to the internal opening and withdrawn steadily, until glue appeared at the external opening and the tract was filled along its whole length.' },
        { needs: ['fi_procedure'], equals: 'Fibrin glue',
          text: 'The glue was left undisturbed to set and no dressing was packed into the tract.' }
      ],

      fi_seton: [
        /* the material is quoted after the sentence rather than in front of
           it, because "a 2-0 silk" and "2-0 silk" are both things a surgeon
           types and only one of them takes an article */
        { group: 'fisetonpass', needs: ['fi_procedure', 'fi_seton_material'], equals: 'seton',
          text: 'A seton was passed along the tract from the external opening, brought out through the internal opening and tied outside the anal verge; the material used was {fi_seton_material}.' },
        { group: 'fisetonpass', needs: ['fi_procedure'], equals: 'seton',
          text: 'A «2-0 silk» seton was passed along the tract from the external opening, brought out through the internal opening and tied outside the anal verge.' },
        { group: 'fisetonkind', needs: ['fi_seton_type'], equals: 'Loose draining',
          text: 'It was tied loosely and without tension as a draining seton, so that sepsis is controlled and the tract allowed to mature before any definitive procedure. It divides nothing.' },
        { group: 'fisetonkind', needs: ['fi_seton_type'], equals: 'Cutting',
          text: 'It was tied snugly as a cutting seton, so that the encircled sphincter divides slowly while healing takes place behind it.' },
        { group: 'fisetonkind', needs: ['fi_seton_type'], equals: 'Chemical',
          text: 'A chemical seton was used.' },
        { group: 'fisetonkind', needs: ['fi_procedure'], equals: 'Draining (loose) seton',
          text: 'It was tied loosely and without tension as a draining seton, so that sepsis is controlled and the tract allowed to mature. It divides nothing.' },
        { group: 'fisetonkind', needs: ['fi_procedure'], equals: 'Cutting seton',
          text: 'It was tied snugly as a cutting seton, so that the encircled sphincter divides slowly while healing takes place behind it.' },
        { needs: ['fi_seton_plan'],
          text: 'The plan for the seton is as follows: {fi_seton_plan}' }
      ],

      fi_other: [
        { needs: ['fi_procedure'], equals: 'Other',
          text: 'A further procedure was performed as recorded: {fi_procedure}.' }
      ],

      fi_close: [
        { needs: ['fi_marsupialise'], equals: 'Yes',
          text: 'The cut edges of the wound were marsupialized to the base of the track «with a continuous 3-0 Vicryl», reducing the raw area and hastening healing.' },
        { group: 'fiwound', needs: ['fi_wound'], equals: 'Left open',
          text: 'The wound was left open to heal by secondary intention.' },
        { group: 'fiwound', needs: ['fi_wound'], equals: 'Marsupialized',
          text: 'The wound was left marsupialized.' },
        { group: 'fiwound', needs: ['fi_wound'], equals: 'Partially closed',
          text: 'The wound was partially closed, its dependent part being left open to drain.' },
        { group: 'fidrain', needs: ['fi_drain'], equals: 'None',
          text: 'No drain was left.' },
        { group: 'fidrain', needs: ['fi_drain'],
          text: 'A {fi_drain|lc} was left in the wound.' },
        /* an examination under anesthesia leaves no wound to dress */
        { group: 'ficlose', needs: ['fi_procedure'], equals: 'Examination under anesthesia only',
          text: 'No wound was made. A digital examination confirmed that the sphincter tone was preserved, and the patient was returned to recovery in a stable condition.' },
        { group: 'ficlose',
          text: 'Hemostasis was secured with diathermy. A digital examination confirmed that the anal canal admitted a finger comfortably and that the sphincter tone was preserved. The wound was dressed «with a light non-adherent dressing» and the patient was returned to recovery in a stable condition.' }
      ],

      /* ---- taking a stoma down -------------------------------------
         The branching here is deeper than anywhere else in the app: hand
         or stapler, then which stapler, then how the common channel was
         closed. Each answer is asked only when the one above it calls for
         it, and each has its own sentence — so the note reads as an account
         of one operation rather than a list of everything that might have
         been done. */
      st_findings: [
        { group: 'scadh', needs: ['st_adhesion'], equals: 'None',
          text: 'No significant intra-abdominal adhesions were encountered.' },
        { group: 'scadh', needs: ['st_adhesion'], equals: 'Filmy',
          text: 'Filmy adhesions around the stoma were divided; the rest of the abdomen was free.' },
        { group: 'scadh', needs: ['st_adhesion'], equals: 'Dense, around the stoma only',
          text: 'Dense adhesions around the stoma were divided sharply; the rest of the abdomen was free.' },
        { group: 'scadh', needs: ['st_adhesion'], equals: 'Dense and generalized',
          text: 'Dense and generalized adhesions were encountered and divided sharply, and the small bowel was run in its entirety at the end to confirm that no injury had been missed.' },
        { group: 'scent', needs: ['st_enterotomy'], equals: 'None',
          text: 'The bowel was not injured during the dissection.' },
        { group: 'scent', needs: ['st_enterotomy', 'st_enterotomy_repair'], equals: 'Serosal tear',
          text: 'A serosal tear was made during the dissection and was repaired: {st_enterotomy_repair}.' },
        { group: 'scent', needs: ['st_enterotomy'], equals: 'Serosal tear',
          text: 'A serosal tear was made during the dissection and was repaired «with interrupted 3-0 Vicryl».' },
        { group: 'scent', needs: ['st_enterotomy', 'st_enterotomy_repair'], equals: 'Full-thickness',
          text: 'A full-thickness enterotomy was made during the dissection and was repaired: {st_enterotomy_repair}.' },
        { group: 'scent', needs: ['st_enterotomy'], equals: 'Full-thickness',
          text: 'A full-thickness enterotomy was made during the dissection and was repaired «in two layers».' },
        { group: 'scent', needs: ['st_enterotomy'], equals: 'Required resection',
          text: 'The bowel was injured beyond repair during the dissection, and the damaged segment was resected.' },
        { group: 'scph', needs: ['st_parastomal', 'st_parastomal_size'], equals: 'Present',
          text: 'A parastomal hernia was present, with a fascial defect of {st_parastomal_size} cm.' },
        { group: 'scph', needs: ['st_parastomal'], equals: 'Present',
          text: 'A parastomal hernia was present.' },
        { group: 'scph', needs: ['st_parastomal'], equals: 'None',
          text: 'There was no parastomal hernia.' },
        { group: 'scphr', needs: ['st_parastomal_repair'], equals: 'Primary suture',
          text: 'The defect was repaired primarily «with interrupted 0 Prolene».' },
        { group: 'scphr', needs: ['st_parastomal_repair'], equals: 'Mesh',
          text: 'The defect was repaired with «a sublay polypropylene» mesh.' },
        { group: 'scphr', needs: ['st_parastomal_repair'], equals: 'Not repaired',
          text: 'The defect was closed with the fascia and no separate repair was undertaken.' }
      ],

      /* This says how the abdomen was entered, so the generic access part is
         not used as well — together they produced "the abdomen was opened"
         immediately followed by "the abdomen was not opened". */
      st_access: [
        { group: 'sclap', needs: ['st_laparotomy', 'st_approach', 'st_incision'], equals: 'circumstomal incision only',
          text: '{st_incision} The operation was completed through this incision alone; the abdomen was not opened.' },
        { group: 'sclap', needs: ['st_laparotomy', 'st_approach'], equals: 'circumstomal incision only',
          text: 'A circumstomal incision was made, and the operation was completed through it alone; the abdomen was not opened.' },
        { group: 'sclap', needs: ['st_laparotomy', 'st_approach', 'st_incision'], equals: 'midline laparotomy',
          text: 'A circumstomal incision was made, but the dissection would not free the bowel safely, so the abdomen was opened. {st_incision}' },
        { group: 'sclap', needs: ['st_laparotomy', 'st_approach'], equals: 'midline laparotomy',
          text: 'A circumstomal incision was made, but the dissection would not free the bowel safely, so a midline laparotomy was made and the mobilization completed from within the abdomen.' }
      ],

      st_resect_part: [
        { group: 'screm', needs: ['st_resect', 'st_resect_len'], equals: 'Yes',
          text: 'A {st_resect_len} cm segment of bowel carrying the stoma was resected, and the ends were trimmed back to healthy, well-perfused tissue.' },
        { group: 'screm', needs: ['st_resect'], equals: 'Yes',
          text: 'The segment of bowel carrying the stoma was resected, and the ends were trimmed back to healthy, well-perfused tissue.' },
        { group: 'screm', needs: ['st_resect'], equals: 'No',
          text: 'No bowel was resected; the edges of the stoma were freshened back to healthy tissue.' }
      ],

      st_anastomosis: [
        /* --- by hand --- */
        { group: 'scan', needs: ['st_method', 'st_anast_config', 'st_hs_material', 'st_hs_technique'], equals: 'Hand-sewn',
          text: 'A hand-sewn {st_anast_config|lc} anastomosis was fashioned with {st_hs_material}, {st_hs_technique|lc}.' },
        { group: 'scan', needs: ['st_method', 'st_anast_config', 'st_hs_material'], equals: 'Hand-sewn',
          text: 'A hand-sewn {st_anast_config|lc} anastomosis was fashioned with {st_hs_material}.' },
        { group: 'scan', needs: ['st_method', 'st_anast_config'], equals: 'Hand-sewn',
          text: 'A hand-sewn {st_anast_config|lc} anastomosis was fashioned «with interrupted 3-0 PDS».' },
        { needs: ['st_hs_layers'], equals: 'Two layers',
          text: 'A second, seromuscular layer was placed over the first.' },
        { needs: ['st_hs_layers'], equals: 'Single layer',
          text: 'The anastomosis was made in a single layer.' },

        /* --- with a stapler --- */
        /* "1 firings" is the sort of thing that makes a reader distrust the
           whole note, so one firing gets its own sentence */
        { group: 'scan', needs: ['st_st_firings', 'st_st_device', 'st_st_gia_len', 'st_st_gia_colour', 'st_method'], equals: '1',
          text: 'The two limbs were aligned antimesenterically and a {st_anast_config|lc} anastomosis was made with a single firing of a {st_st_gia_len} linear cutter, {st_st_gia_colour|lc} cartridge.' },
        { group: 'scan', needs: ['st_st_device', 'st_st_firings', 'st_st_gia_len', 'st_st_gia_colour', 'st_method'], equals: 'Linear cutter',
          text: 'The two limbs were aligned antimesenterically and a {st_anast_config|lc} anastomosis was made with {st_st_firings} firings of a {st_st_gia_len} linear cutter, {st_st_gia_colour|lc} cartridge.' },
        { group: 'scan', needs: ['st_st_device', 'st_st_gia_len', 'st_st_gia_colour', 'st_method'], equals: 'Linear cutter',
          text: 'The two limbs were aligned antimesenterically and a {st_anast_config|lc} anastomosis was made with a {st_st_gia_len} linear cutter, {st_st_gia_colour|lc} cartridge.' },
        { group: 'scan', needs: ['st_st_device', 'st_st_gia_len', 'st_method'], equals: 'Linear cutter',
          text: 'The two limbs were aligned antimesenterically and a {st_anast_config|lc} anastomosis was made with a {st_st_gia_len} linear cutter.' },
        { group: 'scan', needs: ['st_st_device', 'st_st_circ_size', 'st_anast_config', 'st_method'], equals: 'Circular',
          text: 'The anvil of a {st_st_circ_size} circular stapler was secured in the proximal limb with a purse-string suture, the stapler was passed per anum, and a stapled {st_anast_config|lc} anastomosis was completed under direct vision.' },
        { group: 'scan', needs: ['st_st_device', 'st_st_circ_size', 'st_method'], equals: 'Circular',
          text: 'The anvil of a {st_st_circ_size} circular stapler was secured in the proximal limb with a purse-string suture, the stapler was passed per anum, and a stapled end-to-end anastomosis was completed under direct vision.' },
        { group: 'scan', needs: ['st_st_device', 'st_method'], equals: 'Circular',
          text: 'A «29 mm» circular stapler was used to complete an end-to-end anastomosis under direct vision.' },
        { group: 'scan', needs: ['st_st_device', 'st_method'], equals: 'Linear (TA)',
          text: 'The anastomosis was completed with a linear (TA) stapler.' },
        { group: 'scan', needs: ['st_method'], equals: 'Stapled',
          text: 'A stapled anastomosis was fashioned.' },
        { needs: ['st_st_circ_size'], text: 'The doughnuts were inspected and were complete.' },

        /* --- the hole the stapler was passed through --- */
        { group: 'scch', needs: ['st_channel', 'st_channel_device', 'st_channel_len', 'st_channel_colour'], equals: 'Stapled',
          text: 'The common channel was closed with a {st_channel_len} {st_channel_device|lc} stapler, {st_channel_colour|lc} cartridge.' },
        { group: 'scch', needs: ['st_channel', 'st_channel_device'], equals: 'Stapled',
          text: 'The common channel was closed with a {st_channel_device|lc} stapler.' },
        { group: 'scch', needs: ['st_channel', 'st_channel_material', 'st_channel_technique'], equals: 'Hand-sewn',
          text: 'The common channel was closed by hand with {st_channel_material}, {st_channel_technique|lc}.' },
        { group: 'scch', needs: ['st_channel', 'st_channel_material'], equals: 'Hand-sewn',
          text: 'The common channel was closed by hand with {st_channel_material}.' },
        { group: 'scch', needs: ['st_channel'], equals: 'Hand-sewn',
          text: 'The common channel was closed by hand «with interrupted 3-0 PDS».' },

        { text: 'The anastomosis was patent and lay without tension, and the mesenteric defect was «closed».' }
      ],

      st_wound_part: [
        { group: 'scw', needs: ['st_wound', 'st_wound_material'], equals: 'Primary',
          text: 'The skin was closed primarily with {st_wound_material}.' },
        { group: 'scw', needs: ['st_wound'], equals: 'Primary',
          text: 'The skin was closed primarily.' },
        { group: 'scw', needs: ['st_wound', 'st_wound_material'], equals: 'Purse-string',
          text: 'The skin was closed with a subcuticular purse-string of {st_wound_material}, leaving a small central opening to drain.' },
        { group: 'scw', needs: ['st_wound'], equals: 'Purse-string',
          text: 'The skin was closed with a subcuticular purse-string, leaving a small central opening to drain.' },
        { group: 'scw', needs: ['st_wound'], equals: 'Left open',
          text: 'The skin was left open to heal by secondary intention.' },
        { group: 'scsd', needs: ['st_drain_sc', 'st_drain_sc_type'], equals: 'Yes',
          text: 'A subcutaneous drain was left in the wound: {st_drain_sc_type}.' },
        { group: 'scsd', needs: ['st_drain_sc'], equals: 'Yes',
          text: 'A subcutaneous drain was left in the wound.' },
        { group: 'scsd', needs: ['st_drain_sc'], equals: 'No',
          text: 'No subcutaneous drain was left.' }
      ],
    },

    /* =================================================================
       OPERATIONS

       The first block whose conditions all hold is the one used, so the
       narrower operation must be listed before the wider one: an
       abdominoperineal resection would otherwise be swept up by the
       left-sided block, and a Hartmann would be given an anastomosis it
       never had.

       Approach is deliberately NOT a condition. Open and laparoscopic
       share the block and differ only inside the access and closure
       parts, so a correction to the dissection reaches both at once.
       ================================================================= */
    steps: [
      {
        /* The abdominal half is an anterior resection: same access, same
           mobilization, same pedicle, same mesorectal plane. It diverges
           only below — there is no distal transection, no anastomosis and
           no abdominal extraction, because the specimen leaves through the
           perineum and the proximal colon becomes the colostomy. */
        name: 'Abdominoperineal resection',
        when: [
          { key: 'cr_procedure', any: ['Abdominoperineal resection'] },
          { key: 'cr_approach', any: ['Open', 'Laparoscopic', 'Robotic', 'Transanal'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_left' }, { use: 'explore_left' },
          { use: 'left_mobilise' }, { use: 'left_vessels' }, { use: 'splenic_flexure' },
          { use: 'tme' },
          { text: 'The mesorectal dissection was carried circumferentially to the pelvic floor, to be met later from below.' },
          { text: 'The colon was divided at the intended proximal margin, the distal bowel being left in continuity with the specimen for perineal delivery.' },
          { use: 'hemostasis_pelvis' }, { use: 'drain' },
          { use: 'stoma_form' }, { use: 'close_abdomen' },
          { use: 'perineal' }, { use: 'margins' }, { use: 'perineal_close' },
          { use: 'stoma_mature' }, { use: 'count' }
        ]
      },
      {
        /* A sigmoidectomy that stops short of an anastomosis. Every
           sentence up to and including the transection and the specimen is
           the sigmoidectomy sentence, unchanged; what follows is the stump
           and the colostomy instead of a join. */
        name: 'Hartmann procedure',
        when: [
          { key: 'cr_procedure', any: ['Hartmann procedure'] },
          { key: 'cr_approach', any: ['Open', 'Laparoscopic', 'Robotic', 'Transanal'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_left' }, { use: 'explore_left' },
          { use: 'adhesiolysis' },
          { use: 'left_mobilise' }, { use: 'left_vessels' }, { use: 'splenic_flexure' },
          { use: 'washout' }, { use: 'rectal_transection' },
          { text: 'The colon was divided at the intended proximal margin in healthy, well-perfused bowel.' },
          { use: 'extraction_left' }, { use: 'margins' },
          { use: 'hartmann_stump' },
          { use: 'hemostasis_pelvis' }, { use: 'drain' },
          { use: 'stoma_form' }, { use: 'close_abdomen' },
          { use: 'stoma_mature' }, { use: 'count' }
        ]
      },
      {
        /* fi_procedure is a checklist and combinations are the norm —
           "drainage of abscess with a draining seton" is one operation
           with two named parts, and both must reach the note. Each
           procedure carries its own group prefix, so ticking two prints
           two accounts rather than the first one only. */
        name: 'Perianal fistula and anorectal abscess',
        when: [
          { key: 'fi_procedure', any: ['Fistulotomy', 'Fistulectomy',
            'Fistulotomy with immediate sphincteroplasty (FIPS)',
            'Fistulectomy with immediate sphincteroplasty (FIPS)', 'Cutting seton',
            'Draining (loose) seton', 'LIFT', 'Mucosal advancement flap',
            'Anodermal advancement flap', 'VAAFT', 'Fibrin glue', 'Fistula plug',
            'Laser closure', 'Curettage of tract', 'Drainage of abscess',
            'Examination under anesthesia only', 'Other'] }
        ],
        lines: [
          { use: 'fi_setup' }, { use: 'fi_assess' },
          { use: 'fi_eua_only' }, { use: 'fi_abscess' },
          { use: 'fi_fistulotomy' }, { use: 'fi_fistulectomy' }, { use: 'fi_fips' },
          { use: 'fi_curettage' },
          { use: 'fi_lift' }, { use: 'fi_flap' }, { use: 'fi_vaaft' },
          { use: 'fi_filac' }, { use: 'fi_plug' }, { use: 'fi_glue' },
          { use: 'fi_seton' }, { use: 'fi_other' },
          { use: 'fi_close' }
        ]
      },
      {
        /* Stoma surgery is its own category now, with its own fields — a
           stoma has no lesion to locate, no margin to measure and no
           lymphadenectomy, and asking those questions of it was noise. */
        name: 'Stoma closure and reversal of Hartmann',
        when: [{ key: 'st_procedure', any: ['Stoma closure'] }],
        lines: [
          { use: 'st_setup' }, { use: 'st_access' },
          { use: 'st_findings' }, { use: 'st_takedown' }, { use: 'st_resect_part' },
          { use: 'st_stump_found' }, { use: 'st_flexure' },
          { use: 'st_anastomosis' }, { use: 'st_check' },
          { text: 'The anastomosis was returned to the peritoneal cavity in the correct orientation.' },
          { use: 'st_drain_part' }, { use: 'st_close' }, { use: 'st_wound_part' },
          { use: 'st_count' }
        ]
      },
      {
        name: 'Stoma formation',
        when: [{ key: 'st_procedure', any: ['Loop ileostomy', 'Loop colostomy',
          'End colostomy', 'End ileostomy'] }],
        lines: [
          { use: 'st_setup' }, { use: 'st_access_form' }, { use: 'st_reason' },
          { use: 'st_form' }, { use: 'st_mature' }, { use: 'st_count' }
        ]
      },
      {
        /* One block for every left-sided and rectal resection. The rectal
           sentences quote fields that only a rectal case is asked for, so a
           sigmoidectomy simply skips them — which is safer than keeping a
           second, older block that had to be corrected separately. */
        name: 'Left-sided and rectal resection',
        when: [
          { key: 'cr_procedure', any: ['Left hemicolectomy', 'Sigmoidectomy',
          'Anterior resection', 'Low anterior resection', 'Ultra-low anterior resection'] },
          { key: 'cr_approach', any: ['Open', 'Laparoscopic', 'Robotic', 'Transanal'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_left' }, { use: 'explore_left' },
          { use: 'left_mobilise' }, { use: 'left_vessels' }, { use: 'splenic_flexure' },
          { use: 'tme' }, { use: 'washout' }, { use: 'rectal_transection' },
          { use: 'extraction_left' }, { use: 'margins' },
          { use: 'left_anastomosis' }, { use: 'anast_check' },
          { use: 'hemostasis_pelvis' }, { use: 'drain' },
          { use: 'close_abdomen' }, { use: 'count' }
        ]
      },
      {
        name: 'Right, extended right and transverse colectomy',
        when: [
          { key: 'cr_procedure', any: ['Right hemicolectomy',
          'Extended right hemicolectomy', 'Transverse colectomy'] },
          { key: 'cr_approach', any: ['Open', 'Laparoscopic', 'Robotic', 'Transanal'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_right' }, { use: 'explore_right' },
          { use: 'right_mobilise' }, { use: 'right_resect' }, { use: 'margins' },
          { use: 'anast_check' },
          { use: 'hemostasis_abdomen' }, { use: 'drain' },
          { use: 'close_abdomen' }, { use: 'count' }
        ]
      },
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
      { needs: ['cr_f_location'], text: 'The lesion was identified at the {cr_f_location|lc}.' },
      { needs: ['cr_tumor_distance'],
        text: 'It lay {cr_tumor_distance} cm from the anal verge.' },

      { needs: ['cr_splenic_flexure'], equals: 'Yes',
        text: 'The splenic flexure was mobilized.' },
      { group: 'gped', needs: ['cr_ima'], not: 'Not applicable',
        text: 'The inferior mesenteric artery was taken by {cr_ima|lc}.' },
      { group: 'gped', needs: ['cr_vascular'], not: 'Not applicable',
        text: 'The vascular pedicle was divided using a {cr_vascular|lc} technique.' },
      { needs: ['cr_imv'], not: 'Not applicable',
        text: 'The inferior mesenteric vein was taken by {cr_imv|lc}.' },
      { needs: ['cr_lymphadenectomy'], not: 'Not applicable',
        text: 'A {cr_lymphadenectomy} lymphadenectomy was performed.' },

      { needs: ['cr_procedure'], text: 'The procedure performed was {cr_procedure|lc}.' },
      { needs: ['organ_removed'], text: 'The specimen removed was {organ_removed}.' },
      { group: 'gmargins', needs: ['cr_margin_prox', 'cr_margin_dist'],
        text: 'Resection margins measured {cr_margin_prox} cm proximally and {cr_margin_dist} cm distally.' },
      { group: 'gmargins', needs: ['cr_margin_prox'], text: 'The proximal margin measured {cr_margin_prox} cm.' },
      { group: 'gmargins', needs: ['cr_margin_dist'], text: 'The distal margin measured {cr_margin_dist} cm.' },

      { needs: ['cr_anast_config'], text: 'A {cr_anast_config|lc} anastomosis was fashioned.' },
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

      { needs: ['fi_aetiology'], text: 'The aetiology was considered to be {fi_aetiology|lc}.' },

      { group: 'int', needs: ['fi_internal_opening', 'fi_internal_height'],
        text: 'The internal opening was identified at {fi_internal_opening} o’clock, {fi_internal_height} cm from the anal verge.' },
      { group: 'int', needs: ['fi_internal_opening'],
        text: 'The internal opening was identified at {fi_internal_opening} o’clock.' },

      { group: 'ext', needs: ['fi_external_opening', 'fi_external_distance'],
        text: 'The external opening lay at {fi_external_opening} o’clock, {fi_external_distance} cm from the anal verge.' },
      { group: 'ext', needs: ['fi_external_opening'],
        text: 'The external opening lay at {fi_external_opening} o’clock.' },

      { needs: ['fi_parks'], text: 'The tract was {fi_parks_text} in type.' },
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
      { needs: ['ot_procedure_name'], text: 'The procedure performed was {ot_procedure_name}.' },
      { needs: ['ot_incision'], text: 'The incision used was {ot_incision|lc}.' },
      { needs: ['findings'], text: 'On exploration: {findings}' }
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
