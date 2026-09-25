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
    build: '2026-08-02fn',



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
        /* Said outright, because the tumour sentences below simply fall
           silent when their fields are empty, and silence on this point
           reads as an omission rather than as a negative finding.

           Which sentence matters clinically. "No tumour" on a resection
           after a malignant polyp, or after a complete response to
           neoadjuvant therapy, does not mean the disease was benign — it
           means the operation is being done for the lymph nodes. The first
           version of this line said "non-neoplastic disease" in every case
           and so contradicted the indication on the same page. */
        { group: 'nt', needs: ['cr_f_no_tumor_reason'], equals: 'Previous endoscopic resection',
          text: 'No residual tumor was seen at the site of the previously resected malignant polyp; the resection was undertaken for oncological clearance of the draining lymph node basin.' },
        { group: 'nt', needs: ['cr_f_no_tumor_reason'], equals: 'Complete or near-complete response',
          text: 'No tumor was identified at the tumor site, the patient having had a complete or near-complete response to neoadjuvant therapy; the resection was undertaken for oncological clearance.' },
        { group: 'nt', needs: ['cr_f_no_tumor_reason'], equals: 'Lesion not palpable',
          text: 'No tumor was palpable; the site of the lesion was identified by the endoscopic tattoo.' },
        { group: 'nt', needs: ['cr_f_no_tumor_reason'], equals: 'Non-neoplastic disease',
          text: 'No tumor was present; the resection was for non-neoplastic disease.' },
        { group: 'nt', needs: ['cr_f_no_tumor'], equals: 'Yes',
          text: 'No tumor was identified at operation.' },
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

        /* "Abnormal" CONTAINS "Normal", and equals is a substring test. With
           only the two lines below, an abnormal uterus whose detail box was
           left empty fell through to the second line and the note said it
           appeared normal. Every such pair now states the longer value
           first, so the shorter one can never catch it. */
        { group: 'ut', needs: ['cr_f_uterus', 'cr_f_uterus_detail'], equals: 'Abnormal',
          text: 'The uterus was abnormal: {cr_f_uterus_detail}.' },
        { group: 'ut', needs: ['cr_f_uterus'], equals: 'Abnormal',
          text: 'The uterus was abnormal.' },
        { group: 'ut', needs: ['cr_f_uterus'], equals: 'Normal', text: 'The uterus appeared normal.' },
        { group: 'ov', needs: ['cr_f_ovaries', 'cr_f_ovaries_detail'], equals: 'Abnormal',
          text: 'The ovaries were abnormal: {cr_f_ovaries_detail}.' },
        { group: 'ov', needs: ['cr_f_ovaries'], equals: 'Abnormal',
          text: 'The ovaries were abnormal.' },
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

      /* An abscess is described by the space it filled and by what the
         tissues looked like, not by the incision that let it out — the
         incision belongs in the steps. So this list is anatomy, host and
         appearances, and stops there. */
      anorectal: [
        { group: 'sp', needs: ['ar_side', 'ar_space'], equals: 'Midline',
          text: 'Sepsis was found in the midline, involving the {ar_space|lc|and} space.' },
        { group: 'sp', needs: ['ar_side', 'ar_space'], equals: 'Bilateral',
          text: 'Sepsis was found bilaterally, involving the {ar_space|lc|and} space.' },
        { group: 'sp', needs: ['ar_side', 'ar_space'],
          text: 'Sepsis was found on the {ar_side|lc}, involving the {ar_space|lc|and} space.' },
        { group: 'sp', needs: ['ar_space'],
          text: 'Sepsis was found involving the {ar_space|lc|and} space.' },

        { group: 'cav', needs: ['ar_clock', 'ar_cavity_size'],
          text: 'The cavity lay at {ar_clock} o’clock and measured approximately {ar_cavity_size} cm.' },
        { group: 'cav', needs: ['ar_clock'], text: 'The cavity lay at {ar_clock} o’clock.' },
        { group: 'cav', needs: ['ar_cavity_size'],
          text: 'The cavity measured approximately {ar_cavity_size} cm.' },
        { needs: ['ar_pus_volume'], text: '{ar_pus_volume} mL of pus was drained.' },

        { group: 'hs', needs: ['ar_horseshoe'], equals: 'No',
          text: 'There was no horseshoe extension.' },
        { group: 'hs', needs: ['ar_horseshoe'],
          text: 'There was a {ar_horseshoe|lc} extension.' },

        { needs: ['ar_supra_origin'],
          text: 'The supralevator component was the {ar_supra_origin|lc}.' },

        { group: 'nec', needs: ['ar_necrosis'], equals: 'Crepitus',
          text: 'There was crepitus in the surrounding tissues.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'Dishwater',
          text: 'The tissues yielded dishwater fluid with necrotic fascia.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'Foul-smelling',
          text: 'The pus was foul-smelling.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'not malodorous',
          text: 'The pus was frank and not malodorous.' },

        { group: 'io', needs: ['ar_io_found', 'ar_io_clock', 'ar_io_level'], equals: 'Identified',
          text: 'An internal opening was identified at {ar_io_clock} o’clock, {ar_io_level|lc}.' },
        { group: 'io', needs: ['ar_io_found', 'ar_io_clock'], equals: 'Identified',
          text: 'An internal opening was identified at {ar_io_clock} o’clock.' },
        { group: 'io', needs: ['ar_io_found'], equals: 'Looked for but not found',
          text: 'No internal opening could be identified.' },
        { group: 'io', needs: ['ar_io_found'], equals: 'Not sought',
          text: 'The internal opening was not sought at this sitting.' },
        { group: 'pk', needs: ['ar_parks', 'ar_parks_other'], equals: 'Other',
          text: 'The tract did not fit the Parks classification: {ar_parks_other}.' },
        { group: 'pk', needs: ['ar_parks'], equals: 'Other',
          text: 'The tract did not fit the Parks classification.' },
        { group: 'pk', needs: ['ar_parks'], text: 'The tract was {ar_parks|lc} in type.' },

        { group: 'host', needs: ['ar_host'], equals: 'None',
          text: 'There was no host factor predisposing to anorectal sepsis.' },
        { group: 'host', needs: ['ar_host'],
          text: 'Host factors present: {ar_host|lc|and}.' },
        { group: 'sev', needs: ['ar_severity'], equals: 'Septic shock',
          text: 'The patient was in septic shock.' },
        { group: 'sev', needs: ['ar_severity'], equals: 'Sepsis',
          text: 'The patient was septic.' },
        { group: 'sev', needs: ['ar_severity'], equals: 'SIRS',
          text: 'The patient met the criteria for SIRS.' },

        { needs: ['ar_fn_regions'],
          text: 'Necrosis extended over the {ar_fn_regions|lc|and}.' }
      ],

      fistula: [
        /* fi_parks_text adds "high" or "low" to a transsphincteric tract
           from the recorded sphincter percentage */
        /* Parks describes a tract between two openings; a sinus that ends
           blind is not one, and saying it is would be wrong. */
        { group: 'pk', needs: ['fi_parks', 'fi_parks_other'], equals: 'Other',
          text: 'The tract did not fit the Parks classification: {fi_parks_other}.' },
        { group: 'pk', needs: ['fi_parks'], equals: 'Other',
          text: 'The tract did not fit the Parks classification.' },
        { group: 'pk', needs: ['fi_parks'], text: 'The tract was {fi_parks_text}.' },
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
        { group: 'sites', needs: ['he_positions'], equals: 'Circumferential',
          text: 'The piles were circumferential.' },
        { group: 'sites', needs: ['he_positions'], text: 'The piles lay at {he_positions|lc|and}.' },
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

      /* ================= TRANSANAL TME (Masaaki Ito, NCC East) =========
         Ball performs this the same way every time, so the technique is
         written out here rather than asked for on the screen. Only what
         genuinely varies is quoted from a field.

         The invariants below are his, from the National Cancer Center East:
         the submucosal first purse-string with no gap between bites, the
         traction test before tying, the irrigation and the change of gloves,
         the staged rectotomy, the second purse-string outside the first, the
         sweet space at 1 and 11 before 5 and 7, the recto-urethral muscle
         taken by hooking rather than pushing, the peritoneal reflection left
         until last, and the specimen delivered through the abdomen. */
      ta_setup: [
        { group: 'team', needs: ['cr_tme_route'], equals: 'TaTME (two-team)',
          text: 'The mesorectal excision was performed transanally, with the abdominal and transanal teams working simultaneously.' },
        { group: 'team', needs: ['cr_tme_route'], equals: 'TaTME (one-team)',
          text: 'The mesorectal excision was performed transanally, the abdominal and transanal phases being carried out in sequence by one team.' },
        { needs: ['cr_tme_route'],
          text: 'A Lone Star retractor was applied to expose the anal canal and a GelPOINT Path transanal access platform was inserted, with a 12 mm camera port at 12 o’clock and 8 mm working ports at 5 and 8 o’clock. Pneumopelvis was established with an AirSeal recirculating carbon dioxide insufflator at a flow of 40 L/min and a pressure of 15 mmHg, which holds the rectum open and clears the smoke without the bellowing that ordinary suction causes in a closed field.' },
        { needs: ['cr_l_clamp'], equals: 'Endoscopic bulldog clamp',
          text: 'An endoscopic bulldog clamp was placed across the sigmoid colon before the pelvis was insufflated, to keep the proximal bowel from distending.' },
        { needs: ['cr_tumor_distance'],
          text: 'With the rectum distended the lower edge of the tumour lay {cr_tumor_distance} cm from the anal verge, and the distal margin was marked circumferentially below it.' }
      ],

      ta_ps1: [
        { needs: ['cr_tme_route'],
          text: 'A gauze was packed above the marked line to absorb mucus and exfoliated tumour cells. A first purse-string was placed at the submucosal depth with 2-0 Prolene on a 26 mm needle, each bite entering where the last had exited so that no gap remained. The platform was removed and the suture tied from outside; traction on both threads confirmed that the lumen was completely closed.' },
        /* 200 mL of plain saline each round, not 400 of saline with povidone.
           Fixed prose rather than a reading of cr_l_washout_volume: that field
           is the rectal washout before transection, a different event in a
           different operation, and borrowing it meant the two could disagree. */
        { needs: ['cr_tme_route'],
          text: 'The transanal field was irrigated with 200 mL of normal saline, the contaminated instruments were discarded and all gloves were changed.' }
      ],

      ta_rectotomy: [
        { needs: ['cr_tme_route'],
          text: 'Rectotomy was carried out in stages. The marked points were joined and the rectum incised circumferentially to the submucosa, cauterising slowly to control the submucosal bleeding. The incision was then carried through the inner circular muscle until the outer longitudinal muscle was exposed circumferentially, keeping the plane perpendicular to the lumen so as not to burrow along the rectal wall. A second purse-string was placed at the circular muscle, outside the first, tied from outside, and the field irrigated with a further 200 mL of normal saline.' }
      ],

      ta_dissect: [
        { needs: ['cr_tme_route'],
          text: 'The longitudinal muscle was incised at 1 and 11 o’clock to enter the sweet space on either side of the midline, avoiding the thicker muscle at 12 o’clock. The recto-urethral muscle was then divided by hooking from either side rather than by pushing, keeping the dissection away from the urethra, and the dorsal surface of the prostate was widely exposed. Denonvilliers’ fascia was incised and the plane carried on towards the seminal vesicles.' },
        { needs: ['cr_tme_route'],
          text: 'Posteriorly the longitudinal muscle was incised at 5 and 7 o’clock to enter the sweet space, and the rectococcygeal muscle at 6 o’clock was divided.' },
        { group: 'epf', needs: ['cr_ta_epf_plane'], equals: 'Above the endopelvic fascia (standard TME plane)',
          text: 'The dissection was carried above the endopelvic fascia, in the standard mesorectal plane.' },
        { group: 'epf', needs: ['cr_ta_epf_plane'], equals: 'Below the endopelvic fascia, including the hypogastric fascia',
          text: 'The dissection was carried below the endopelvic fascia, taking the hypogastric fascia with the specimen and exposing the surface of the levator ani, to secure the circumferential margin.' },
        { group: 'epf', needs: ['cr_ta_epf_plane'], equals: 'Below the fascia past the tumour, then above it',
          text: 'The dissection was carried below the endopelvic fascia to secure the circumferential margin alongside the tumour, and returned above the fascia once the tumour had been passed, to protect the fourth pelvic splanchnic nerve.' },
        { needs: ['cr_tme_route'],
          text: 'The rectosacral fascia was incised at the S4 level and the dissection turned ventrally along the sacral fold, away from the median sacral vein.' },
        { group: 'nvb', needs: ['cr_rect_nerve'], equals: 'Complete, bilateral',
          text: 'Laterally, the rectal branches of both neurovascular bundles and the pelvic splanchnic nerves were seen and preserved intact.' },
        { group: 'nvb', needs: ['cr_rect_nerve'], equals: 'Partial',
          text: 'Laterally, the neurovascular bundles were partly preserved.' },
        { group: 'nvb', needs: ['cr_rect_nerve'], equals: 'Sacrificed for oncological clearance',
          text: 'Laterally, the neurovascular bundle was taken with the specimen for oncological clearance.' }
      ],

      ta_meet: [
        { needs: ['cr_ta_meet'],
          text: 'The peritoneal reflection was left intact until the anterior and posterior planes were established, and was then opened {cr_ta_meet|lc}ly, where the two dissections met.' }
      ],

      /* cr_extraction already offers Transanal (NOSE), and the first version of
         this part ignored it: it stated the abdominal route whatever the field
         said, so a transanal extraction would have produced a note that
         contradicted its own form. The reason NCC prefer the abdomen — a
         purse-string torn by traction, and tumour cells spilled with it — is
         only worth writing when that is in fact the route taken. */
      ta_extract: [
        { group: 'ex', needs: ['cr_extraction'], equals: 'Transanal (NOSE)',
          text: 'The specimen was delivered transanally through the access platform, taking care not to drag it against the rectal stump.' },
        { group: 'ex', needs: ['cr_extraction', 'cr_r_extraction_length'],
          text: 'The specimen was delivered through a {cr_r_extraction_length} cm {cr_extraction|lc} incision under a wound protector, rather than through the anus, so as not to tear the purse-string or spill tumour cells.' },
        { group: 'ex', needs: ['cr_extraction'],
          text: 'The specimen was delivered through a {cr_extraction|lc} incision under a wound protector, rather than through the anus, so as not to tear the purse-string or spill tumour cells.' },
        { group: 'ex', needs: ['cr_tme_route'],
          text: 'The specimen was delivered through the abdominal incision rather than through the anus, so as not to tear the purse-string or spill tumour cells.' }
      ],

      ta_anast: [
        { group: 'an', needs: ['cr_ta_anast'], equals: 'Abdominal double purse-string circular stapled anastomosis',
          text: 'The platform was reseated 1 to 2 cm from the cut edge and a full-thickness purse-string placed in the rectal stump, taking a bite at each hour of the clock 5 mm from the edge; traction on both threads confirmed complete closure. A guide tube was passed and the circular stapler railroaded up from below, the anvil docked from the abdomen and the double purse-string tied down onto it before firing.' },
        { group: 'an', needs: ['cr_ta_anast'], equals: 'Transanal pull-through circular stapled anastomosis',
          text: 'Exposure of the rectal stump from above was not sufficient to dock the anvil, so the pull-through method was used: the anvil was grasped through the untied purse-string and drawn down transanally, mated with the stapler, and the purse-string tied down onto it before firing.' },
        { group: 'an', needs: ['cr_ta_anast'], equals: 'Hand-sewn coloanal anastomosis',
          text: 'A hand-sewn coloanal anastomosis was fashioned transanally with interrupted absorbable sutures, quadrant stitches first and the intervening bites placed between them.' },
        { needs: ['cr_l_circular'], not: 'Not used',
          text: 'A {cr_l_circular} circular stapler was used.' },
        { group: 'dnut', needs: ['cr_l_doughnuts'], equals: 'Incomplete',
          text: 'The doughnuts were inspected and were incomplete; the anastomosis was reinforced.' },
        { group: 'dnut', needs: ['cr_l_doughnuts'], equals: 'Complete',
          text: 'Both doughnuts were inspected and were complete.' },
        { group: 'rf', needs: ['cr_ta_reinforce'], equals: 'Yes',
          text: 'A reinforcement suture was placed circumferentially around the anastomosis.' },
        { group: 'rf', needs: ['cr_ta_reinforce'], not: 'Yes',
          text: 'No reinforcement suture was placed; the anastomosis was judged secure.' }
      ],

      ta_events: [
        { group: 'ev', needs: ['cr_ta_events'], equals: 'None',
          text: 'The dissection plane was held throughout, and there was no urethral injury and no carbon dioxide embolism.' },
        { group: 'ev', needs: ['cr_ta_events', 'cr_ta_events_other'],
          text: 'During the transanal phase: {cr_ta_events|lc|and} ({cr_ta_events_other}).' },
        { group: 'ev', needs: ['cr_ta_events'],
          text: 'During the transanal phase: {cr_ta_events|lc|and}.' }
      ],


      /* ---- haemorrhoid: the parts either path uses ---- */
      he_setup: [
        { needs: ['he_urgency'], equals: 'Emergency',
          text: 'The operation was performed as an emergency.' },
        { needs: ['he_urgency'], equals: 'Elective',
          text: 'The operation was performed electively.' },
        { group: 'pos', needs: ['he_position', 'anaesthesia'],
          text: 'Under {anaesthesia}, the patient was placed in the {he_position|lc} position and the perineum was prepared and draped.' },
        { group: 'pos', needs: ['he_position'],
          text: 'The patient was placed in the {he_position|lc} position and the perineum was prepared and draped.' }
      ],

      he_assess: [
        { group: 'gr', needs: ['he_grade', 'he_type'],
          text: 'Examination under anesthesia confirmed {he_type|lc} hemorrhoids, {he_grade|lc}.' },
        { group: 'gr', needs: ['he_grade'], text: 'Examination under anesthesia confirmed {he_grade|lc} hemorrhoids.' },
        { group: 'sites', needs: ['he_positions'], equals: 'Circumferential',
          text: 'The piles were circumferential.' },
        { group: 'sites', needs: ['he_positions'], text: 'Piles were present at {he_positions|lc|and}.' },
        { needs: ['he_associated'], not: 'None',
          text: 'Associated findings were {he_associated|lc|and}.' },
        { needs: ['he_procedure'], text: 'The procedure performed was {he_procedure|lc|and}.' }
      ],

      he_close: [
        { needs: ['he_analgesia'], text: 'Local analgesia was infiltrated: {he_analgesia}.' },
        { group: 'pack', needs: ['he_packing_type'], not: 'None',
          text: '{he_packing_type} was placed in the anal canal at the end of the procedure.' },
        { group: 'pack', needs: ['he_packing_type'], equals: 'None',
          text: 'No anal packing was used.' }
      ],

      /* ---- excisional haemorrhoidectomy ---- */
      he_excision: [
        { group: 'exc', needs: ['he_hem_technique', 'he_columns'],
          text: 'A {he_hem_technique|lc} hemorrhoidectomy was performed, excising {he_columns} column(s).' },
        { group: 'exc', needs: ['he_hem_technique'],
          text: 'A {he_hem_technique|lc} hemorrhoidectomy was performed.' },
        { group: 'exc', needs: ['he_columns'],
          text: 'Hemorrhoidectomy was performed, excising {he_columns} column(s).' },

        { needs: ['he_energy'],
          text: 'Dissection of each pile from the underlying internal sphincter was carried out with {he_energy|lc}.' },

        { group: 'ped', needs: ['he_pedicle_done', 'he_pedicle_method', 'he_pedicle_material'], equals: 'Yes',
          text: 'Each vascular pedicle was secured with a {he_pedicle_method|lc} of {he_pedicle_material}.' },
        { group: 'ped', needs: ['he_pedicle_done', 'he_pedicle_method'], equals: 'Yes',
          text: 'Each vascular pedicle was secured with a {he_pedicle_method|lc}.' },
        { group: 'ped', needs: ['he_pedicle_done'], equals: 'Yes',
          text: 'Each vascular pedicle was ligated.' },
        { group: 'ped', needs: ['he_pedicle_done'], not: 'Yes',
          text: 'The pedicles were sealed with the energy device and no ligature was placed.' },

        { needs: ['he_hem_adjunct'], not: 'None',
          text: 'Further treatment after excision comprised {he_hem_adjunct|lc|and}.' },

        { group: 'muc', needs: ['he_mucosa_technique', 'he_mucosa_material'],
          text: 'The mucosal defect was closed with a {he_mucosa_technique|lc} suture of {he_mucosa_material}.' },
        { group: 'muc', needs: ['he_mucosa_technique'],
          text: 'The mucosal defect was closed with a {he_mucosa_technique|lc} suture.' },

        { group: 'skin', needs: ['he_skin_same'], equals: 'Yes',
          text: 'The cutaneous edge was closed in the same fashion and with the same material.' },
        { group: 'skin', needs: ['he_skin_same', 'he_skin_technique', 'he_skin_material'], equals: 'No — different',
          text: 'The cutaneous edge was closed with a {he_skin_technique|lc} suture of {he_skin_material}.' },
        { group: 'skin', needs: ['he_skin_same', 'he_skin_technique'], equals: 'No — different',
          text: 'The cutaneous edge was closed with a {he_skin_technique|lc} suture.' },
        { group: 'skin', needs: ['he_skin_same'], equals: 'Left open',
          text: 'The cutaneous wound was left open to granulate.' },

        /* the two that decide whether this anus will stenose */
        { group: 'br', needs: ['he_bridge_1cm'], equals: 'Yes',
          text: 'A mucocutaneous bridge of more than 1 cm was preserved between every excised column.' },
        { group: 'br', needs: ['he_bridge_1cm'], equals: 'No',
          text: 'A mucocutaneous bridge of more than 1 cm could not be preserved between every column.' },
        { group: 'dia', needs: ['he_diameter_50'], equals: 'Yes',
          text: 'More than half of the anal circumference was left intact.' },
        { group: 'dia', needs: ['he_diameter_50'], equals: 'No',
          text: 'Less than half of the anal circumference remained intact, and the risk of stenosis was noted.' }
      ],

      /* ---- radiofrequency ablation ---- */
      he_rfa: [
        { group: 'rfa', needs: ['he_rfa_device', 'he_rfa_power'],
          text: 'Radiofrequency ablation was carried out using {he_rfa_device} at {he_rfa_power} W.' },
        { group: 'rfa', needs: ['he_rfa_power'],
          text: 'Radiofrequency ablation was carried out at {he_rfa_power} W.' },
        { group: 'rfa', needs: ['he_rfa_device'],
          text: 'Radiofrequency ablation was carried out using {he_rfa_device}.' },

        { needs: ['he_rfa_level'],
          text: 'The probe was applied {he_rfa_level|lc}.' },
        { group: 'dose', needs: ['he_rfa_columns', 'he_rfa_points', 'he_rfa_energy'],
          text: '{he_rfa_columns} column(s) were treated at {he_rfa_points} point(s) each, delivering {he_rfa_energy} J per column.' },
        { group: 'dose', needs: ['he_rfa_columns', 'he_rfa_energy'],
          text: '{he_rfa_columns} column(s) were treated, delivering {he_rfa_energy} J per column.' },
        { group: 'dose', needs: ['he_rfa_columns'],
          text: '{he_rfa_columns} column(s) were treated.' },
        { needs: ['he_rfa_endpoint'],
          text: 'Treatment of each column was continued to the endpoint of {he_rfa_endpoint|lc}.' },
        { needs: ['he_rfa_mucopexy'], equals: 'Yes',
          text: 'A mucopexy was added to reduce the prolapsing component.' },
        { needs: ['he_rfa_mucopexy'], equals: 'No',
          text: 'No mucopexy was added.' }
      ],

      /* ---- laser haemorrhoidoplasty ---- */
      he_laser: [
        { group: 'las', needs: ['he_laser_wavelength', 'he_laser_fibre', 'he_laser_power'],
          text: 'Laser hemorrhoidoplasty was performed with a {he_laser_wavelength} {he_laser_fibre|lc} fibre at {he_laser_power} W.' },
        { group: 'las', needs: ['he_laser_wavelength', 'he_laser_power'],
          text: 'Laser hemorrhoidoplasty was performed at {he_laser_wavelength} and {he_laser_power} W.' },
        { group: 'las', needs: ['he_laser_wavelength'],
          text: 'Laser hemorrhoidoplasty was performed at {he_laser_wavelength}.' },

        { needs: ['he_laser_entry'],
          text: 'The fibre was introduced through a {he_laser_entry|lc}.' },
        { group: 'ldose', needs: ['he_laser_piles', 'he_laser_energy'],
          text: '{he_laser_piles} pile(s) were treated with approximately {he_laser_energy} J each, the shots being spread through the submucosal cushion to avoid a single burn.' },
        { group: 'ldose', needs: ['he_laser_piles'],
          text: '{he_laser_piles} pile(s) were treated.' },
        { needs: ['he_laser_mucopexy'], equals: 'Yes',
          text: 'A mucopexy was added to reduce the prolapsing component.' },
        { needs: ['he_laser_mucopexy'], equals: 'No',
          text: 'No mucopexy was added.' }
      ],

      /* ---- the smaller anorectal procedures ---- */
      he_minor: [
        { group: 'lis', needs: ['he_lis_side', 'he_lis_technique', 'he_lis_length'],
          text: 'A {he_lis_technique|lc} lateral internal sphincterotomy was performed at the {he_lis_side|lc}, dividing {he_lis_length} cm of the internal sphincter.' },
        { group: 'lis', needs: ['he_lis_side', 'he_lis_technique'],
          text: 'A {he_lis_technique|lc} lateral internal sphincterotomy was performed at the {he_lis_side|lc}.' },
        { group: 'lis', needs: ['he_lis_side'],
          text: 'A lateral internal sphincterotomy was performed at the {he_lis_side|lc}.' },
        { needs: ['he_band_number'],
          text: '{he_band_number} band(s) or injection(s) were applied to the residual piles above the dentate line.' }
      ],


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
        { group: 'flex', needs: ['cr_splenic_flexure'], equals: 'Not applicable',
          text: 'Mobilization of the splenic flexure was not applicable to this resection.' },
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
        /* Two of the six options are not incisions, and the generic sentence
           made nonsense of both: "a 6 cm transanal (NOSE) incision was made"
           and "a 6 cm through the stoma site incision was made". They are
           written out before the generic line, which now only ever sees an
           option that really is an incision with a length. */
        { group: 'extract', needs: ['cr_extraction'], equals: 'Transanal (NOSE)',
          text: 'The specimen was delivered transanally through a wound protector, as a natural-orifice extraction, and passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction'], equals: 'Through the stoma site',
          text: 'The specimen was delivered through the stoma trephine under a wound protector and passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction', 'cr_r_extraction_length'],
          text: 'A {cr_r_extraction_length} cm {cr_extraction|lc} incision was made, a wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        { group: 'extract', needs: ['cr_extraction'],
          text: 'Extraction site: {cr_extraction}. A wound protector was placed and the specimen was delivered. The specimen was passed off the field: {organ_removed}' },
        /* This used to name a Pfannenstiel whenever the extraction field was
           empty — and it is empty on every open case, because the question is
           hidden there. So an open resection extracted through its own
           laparotomy was printed as having had a second incision it never had.
           A guillemet marks a default as unconfirmed; it does not make it
           harmless. Nothing is named now unless it was recorded. */
        { group: 'extract',
          text: 'The specimen was delivered through the extraction wound under a wound protector and passed off the field: {organ_removed}' }
      ],

      /* An emergency resection for obstruction is a different operation from
         the elective one, and the note should say which. Milking a dilated
         colon and washing it out are decisions with consequences — for the
         anastomosis, and for whoever reads this when the patient leaks. */
      decompress: [
        /* One or the other, never both: that is how it is actually done, so
           there is no combined sentence to write.

           Two traps were caught here and are worth keeping in mind for any
           new part. equals tests the FIRST key in needs — cr_urgency was
           written first, so every line compared 'Emergency' with the name of
           a method and none could match. And equals is a SUBSTRING test, by
           design, because that is what lets a checklist of three items match
           one of them; while a combined option existed it also matched the
           shorter one. Removing the combined option removes that hazard too. */
        { group: 'dec', needs: ['cr_additional_procedure'], equals: 'On-table antegrade colonic lavage',
          text: 'An on-table antegrade colonic lavage was performed, warmed saline being run in proximally and the effluent led off the field into a closed bag until it ran clear.' },
        { group: 'dec', needs: ['cr_additional_procedure'], equals: 'Manual decompression',
          text: 'The obstructed proximal colon was decompressed by gentle manual milking before the bowel was divided.' },
        { group: 'dec', needs: ['cr_additional_procedure'], equals: 'Not required',
          text: 'The proximal colon was not loaded, and neither decompression nor on-table lavage was required.' }
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
      /* ================= LEFT HEMICOLECTOMY ==========================
         It used to borrow the rectal transection sentences, which describe
         firing a stapler across the rectum — an event a left hemicolectomy
         does not contain. What it does contain is two bowel divisions and
         a colo-colic join, and the orientation of that join is a real
         decision that the note should record: an antiperistaltic
         side-to-side is not the same operation as an isoperistaltic one.
         ============================================================== */
      /* "divided with a linear cutter (GIA)" read as the GIA specifically,
         when the option meant any cutting stapler and the brand was being
         recorded a field away. The device says what kind of instrument it
         was and the stapler field says which one, so the sentence carries
         both and the option label no longer names a brand it does not mean. */
      lh_transection: [
        { needs: ['cr_lh_prox_device'],
          text: 'The bowel was divided proximally with {cr_lh_prox_text}.' },
        { needs: ['cr_lh_dist_device'],
          text: 'The bowel was divided distally with {cr_lh_dist_text}.' }
      ],

      lh_anastomosis: [
        { group: 'lhs', needs: ['cr_lh_anast_site'], equals: 'Intracorporeal',
          text: 'The anastomosis was fashioned intracorporeally.' },
        { group: 'lhs', needs: ['cr_lh_anast_site'], equals: 'Extracorporeal',
          text: 'The bowel ends were delivered through the extraction wound and the anastomosis was fashioned extracorporeally.' },

        { group: 'lhc', needs: ['cr_lh_anast_config', 'cr_lh_stapler'], equals: 'Isoperistaltic',
          text: 'A side-to-side anastomosis was made in the isoperistaltic orientation with a linear cutting stapler ({cr_lh_stapler_text}), the two limbs lying with their peristalsis running the same way.' },
        { group: 'lhc', needs: ['cr_lh_anast_config'], equals: 'Isoperistaltic',
          text: 'A side-to-side anastomosis was made in the isoperistaltic orientation, the two limbs lying with their peristalsis running the same way.' },
        { group: 'lhc', needs: ['cr_lh_anast_config', 'cr_lh_stapler'], equals: 'Antiperistaltic',
          text: 'A side-to-side anastomosis was made in the antiperistaltic orientation with a linear cutting stapler ({cr_lh_stapler_text}), the two limbs lying head to head.' },
        { group: 'lhc', needs: ['cr_lh_anast_config'], equals: 'Antiperistaltic',
          text: 'A side-to-side anastomosis was made in the antiperistaltic orientation, the two limbs lying head to head.' },
        { group: 'lhc', needs: ['cr_lh_anast_config'], equals: 'End-to-side',
          text: 'An end-to-side anastomosis was made.' },
        { group: 'lhc', needs: ['cr_lh_anast_config'], equals: 'End-to-end, hand-sewn',
          text: 'An end-to-end anastomosis was hand-sewn.' },
        { group: 'lhc', needs: ['cr_lh_anast_config'], equals: 'End-to-end, circular stapled',
          text: 'An end-to-end anastomosis was made with a circular stapler.' },

        { group: 'lhe', needs: ['cr_lh_enterotomy'], equals: 'Stapled',
          text: 'The common enterotomy was closed with a further firing of the stapler.' },
        { group: 'lhe', needs: ['cr_lh_enterotomy'], equals: 'Hand-sewn two layers',
          text: 'The common enterotomy was closed by hand in two layers.' },
        { group: 'lhe', needs: ['cr_lh_enterotomy'], equals: 'Hand-sewn single layer',
          text: 'The common enterotomy was closed by hand in a single layer.' },

        { group: 'lhm', needs: ['cr_lh_mesenteric'], equals: 'Closed',
          text: 'The mesenteric defect was closed.' },
        { group: 'lhm', needs: ['cr_lh_mesenteric'], equals: 'Left open',
          text: 'The mesenteric defect was left open.' }
      ],

      drain: [
        { group: 'drain', needs: ['cr_drain_placed'], equals: 'No',
          text: 'No drain was left.' },
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
        /* cr_procedure stopped offering stoma options when stoma became its
           own category; a defunctioning stoma on a resection is cr_diverting,
           so these three had quietly become unreachable. */
        { group: 'stdeliver', needs: ['cr_diverting'], equals: 'Loop ileostomy',
          text: 'A mobile loop of terminal ileum «40 cm proximal to the ileocecal valve» was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['cr_diverting'], equals: 'Loop colostomy',
          text: 'A mobile loop of «transverse» colon was selected, its proximal and distal limbs marked, and the loop delivered through the trephine without tension and with correct orientation.' },
        { group: 'stdeliver', needs: ['cr_procedure'], equals: 'Total proctocolectomy',
          text: 'The divided end of the ileum was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { group: 'stdeliver',
          text: 'The divided proximal end of the colon was delivered through the trephine without tension and with its mesentery orientated correctly.' },
        { needs: ['cr_st_rod'], equals: 'Yes',
          text: 'A supporting rod was passed through the mesenteric window beneath the loop.' },
        { needs: ['cr_st_rod'], equals: 'No', text: 'No supporting rod was used.' }
      ],

      stoma_mature: [
        { group: 'stmat', needs: ['cr_diverting', 'cr_st_suture'], equals: 'Loop',
          text: 'The abdominal wall having been closed, the stoma was opened transversely on its distal aspect and matured as a Brooke loop stoma with {cr_st_suture|lc}, each bite taking seromuscular bowel, the fascial edge and the dermis, so that the proximal limb everted as a spout.' },
        { group: 'stmat', needs: ['cr_diverting'], equals: 'Loop',
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
        /* Acute sepsis moved to its own category; what a fistula case
           still meets is pus found on the way to doing something else. */
        { group: 'fiinc', needs: ['fi_abscess_incidental', 'fi_abscess_site', 'fi_abscess_pus'], equals: 'Yes',
          text: 'Pus was encountered during the dissection: a {fi_abscess_site|lc} collection, from which {fi_abscess_pus} mL was released, laid open, irrigated and left to drain.' },
        { group: 'fiinc', needs: ['fi_abscess_incidental', 'fi_abscess_site'], equals: 'Yes',
          text: 'Pus was encountered during the dissection, in the {fi_abscess_site|lc} space; the cavity was laid open, irrigated and left to drain.' },
        { group: 'fiinc', needs: ['fi_abscess_incidental'], equals: 'Yes',
          text: 'Pus was encountered during the dissection; the cavity was laid open, irrigated and left to drain.' },
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

      /* ================= ANORECTAL SEPSIS =============================
         One block serves the whole category, as it does for fistula,
         because combinations are the rule: a modified Hanley is usually
         a Hanley *and* counter-incisions *and* a seton, and all three
         have to reach the note. Every part below is gated on its own
         answers, so ticking one procedure prints one account and
         ticking three prints three.

         Two things are written as rules rather than as descriptions,
         because they are the two places this operation is got wrong:

         1. The route a supralevator abscess is drained by follows from
            where it came from, not from where it is easiest to reach.
            Drain one of intersphincteric origin through the ischioanal
            fossa and you have made an extrasphincteric fistula; drain
            one of ischioanal origin into the rectum and you have made
            the same fistula from the other side. ar_supra_origin picks
            the sentence, and the sentence says why.

         2. The external sphincter in a modified Hanley. Hanley divided
            both sphincters in the posterior midline; the modification is
            that the external sphincter is left alone and the extensions
            are reached through counter-incisions instead. So preserving
            it is stated positively, and dividing it is recorded as the
            deliberate decision it is.
         =============================================================== */

      ar_setup: [
        { group: 'pos', needs: ['ar_position', 'anaesthesia'],
          text: 'Under {anaesthesia}, the patient was placed in the {ar_position|lc} position with the buttocks taped apart, and the perineum was prepared and draped.' },
        { group: 'pos', needs: ['ar_position'],
          text: 'The patient was placed in the {ar_position|lc} position with the buttocks taped apart, and the perineum was prepared and draped.' },
        { text: 'Examination under anesthesia was carried out, with digital and proctoscopic examination of the anal canal and lower rectum.' }
      ],

      ar_assess: [
        { group: 'sp', needs: ['ar_side', 'ar_space'], equals: 'Midline',
          text: 'The sepsis lay in the midline, involving the {ar_space|lc|and} space.' },
        { group: 'sp', needs: ['ar_side', 'ar_space'], equals: 'Bilateral',
          text: 'The sepsis involved the {ar_space|lc|and} space on both sides.' },
        { group: 'sp', needs: ['ar_side', 'ar_space'],
          text: 'The sepsis involved the {ar_space|lc|and} space on the {ar_side|lc}.' },
        { group: 'sp', needs: ['ar_space'],
          text: 'The sepsis involved the {ar_space|lc|and} space.' },

        { needs: ['ar_clock'],
          text: 'The point of maximum fluctuance lay at {ar_clock} o’clock.' },
        { needs: ['ar_cavity_size'],
          text: 'The cavity measured approximately {ar_cavity_size} cm.' },

        { group: 'hs', needs: ['ar_horseshoe'], equals: 'No',
          text: 'There was no horseshoe extension.' },
        { group: 'hs', needs: ['ar_horseshoe'], equals: 'Posterior horseshoe',
          text: 'The sepsis had tracked as a posterior horseshoe, the deep postanal space communicating with both ischioanal fossae.' },
        { group: 'hs', needs: ['ar_horseshoe'], equals: 'Anterior horseshoe',
          text: 'The sepsis had tracked as an anterior horseshoe, communicating across the midline in front of the anal canal.' },

        { group: 'nec', needs: ['ar_necrosis'], equals: 'Crepitus',
          text: 'There was crepitus in the surrounding tissues, and gas escaped on opening them.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'Dishwater',
          text: 'The tissues yielded thin dishwater fluid and the fascia was grey and stripped off the underlying muscle with finger pressure — the appearances of a necrotising soft-tissue infection.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'Foul-smelling',
          text: 'The pus was foul-smelling.' },
        { group: 'nec', needs: ['ar_necrosis'], equals: 'not malodorous',
          text: 'The pus was frank and not malodorous.' },

        { group: 'sev', needs: ['ar_severity'], equals: 'Septic shock',
          text: 'The patient was in septic shock at the time of operation.' },
        { group: 'sev', needs: ['ar_severity'], equals: 'Sepsis',
          text: 'The patient was septic at the time of operation.' },
        { group: 'sev', needs: ['ar_severity'], equals: 'SIRS',
          text: 'The patient met the criteria for SIRS at the time of operation.' },

        { group: 'aet', needs: ['ar_aetiology'], equals: 'Cryptoglandular',
          text: 'The sepsis was cryptoglandular in origin, arising from an infected anal gland.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Crohn',
          text: 'The sepsis arose on a background of Crohn disease.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Tuberculosis',
          text: 'Tuberculous infection was suspected as the underlying cause.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Hidradenitis',
          text: 'The sepsis arose within an area of hidradenitis suppurativa.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Pilonidal',
          text: 'The sepsis arose from pilonidal disease.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Post-operative',
          text: 'The sepsis followed previous anorectal surgery.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Malignancy',
          text: 'The sepsis arose in association with an underlying malignancy.' },
        { group: 'aet', needs: ['ar_aetiology'], equals: 'Foreign body',
          text: 'The sepsis followed a foreign body or perineal trauma.' },
        { group: 'aet', needs: ['ar_aetiology'],
          text: 'The underlying cause is set out in the operative findings.' }
      ],

      /* Probing an acutely inflamed anorectum makes tracts that were not
         there. So "not identified" and "not sought" are written as
         deliberate decisions, which is what they are. */
      ar_opening: [
        { group: 'io', needs: ['ar_io_found'], equals: 'Not sought',
          text: 'The internal opening was not sought at this sitting, the intention being source control alone, with reassessment once the acute inflammation had settled.' },
        { group: 'io', needs: ['ar_io_found'], equals: 'Looked for but not found',
          text: 'The internal opening was looked for but could not be identified, and no attempt was made to force a passage that might have created a false tract.' },
        { group: 'io', needs: ['ar_io_found', 'ar_io_clock', 'ar_io_level'], equals: 'Identified',
          text: 'The internal opening was identified at {ar_io_clock} o’clock, {ar_io_level|lc}.' },
        { group: 'io', needs: ['ar_io_found', 'ar_io_clock'], equals: 'Identified',
          text: 'The internal opening was identified at {ar_io_clock} o’clock.' },
        { group: 'io', needs: ['ar_io_found'], equals: 'Identified',
          text: 'The internal opening was identified.' },
        { group: 'pk', needs: ['ar_parks', 'ar_parks_other'], equals: 'Other',
          text: 'The tract did not fit the Parks classification: {ar_parks_other}.' },
        { group: 'pk', needs: ['ar_parks'], equals: 'Other',
          text: 'The tract did not fit the Parks classification.' },
        { group: 'pk', needs: ['ar_parks'], text: 'The tract was {ar_parks|lc} in type.' }
      ],

      ar_eua_only: [
        { needs: ['ar_procedure'], equals: 'Examination under anesthesia only',
          text: 'No collection requiring drainage was found, and the operation was concluded without an incision.' }
      ],

      ar_drain: [
        { group: 'dr', needs: ['ar_procedure', 'ar_id_incision', 'ar_id_distance', 'ar_pus_volume'],
          equals: 'Incision and drainage',
          text: 'A {ar_id_incision|lc} incision was made over the point of maximum fluctuance, {ar_id_distance} cm from the anal verge, and {ar_pus_volume} mL of pus was released and sent for examination.' },
        { group: 'dr', needs: ['ar_procedure', 'ar_id_incision', 'ar_id_distance'],
          equals: 'Incision and drainage',
          text: 'A {ar_id_incision|lc} incision was made over the point of maximum fluctuance, {ar_id_distance} cm from the anal verge, and the pus was released.' },
        { group: 'dr', needs: ['ar_procedure', 'ar_id_incision'], equals: 'Incision and drainage',
          text: 'A {ar_id_incision|lc} incision was made over the point of maximum fluctuance and the pus was released.' },
        { group: 'dr', needs: ['ar_procedure'], equals: 'Incision and drainage',
          text: 'The abscess was incised over the point of maximum fluctuance and the pus was released.' },

        { needs: ['ar_procedure'], equals: 'Deroofing of the cavity',
          text: 'The skin edges were excised so that the cavity was deroofed, allowing it to heal from its depth outward rather than closing over at the skin and refilling.' },
        { needs: ['ar_id_loculi'], equals: 'Yes',
          text: 'All loculi were broken down digitally and the cavity was irrigated with normal saline.' },

        { group: 'left', needs: ['ar_id_leftin'], equals: 'Nothing',
          text: 'Nothing was left in the cavity.' },
        { group: 'left', needs: ['ar_id_leftin'], equals: 'Packing',
          text: 'The cavity was lightly packed.' },
        { group: 'left', needs: ['ar_id_leftin'],
          text: 'A {ar_id_leftin|lc} was left in the cavity.' }
      ],

      ar_counter: [
        { group: 'ci', needs: ['ar_procedure', 'ar_h_counter'], equals: 'counter-incision',
          text: 'The lateral extensions were opened through separate counter-incisions ({ar_h_counter} in all), each placed over the most dependent part of its extension.' },
        { group: 'ci', needs: ['ar_procedure'], equals: 'counter-incision',
          text: 'The lateral extensions were opened through separate counter-incisions, each placed over the most dependent part of its extension.' },
        { group: 'cdr', needs: ['ar_h_drains'], equals: 'Nothing',
          text: 'Nothing was passed through the counter-incisions.' },
        { group: 'cdr', needs: ['ar_h_drains'],
          text: '{ar_h_drains} were passed between the counter-incisions and the midline wound and secured.' }
      ],

      ar_hanley: [
        { needs: ['ar_procedure'], equals: 'Modified Hanley procedure',
          text: 'A midline incision was made posteriorly, between the anal verge and the tip of the coccyx.' },
        { group: 'hlig', needs: ['ar_h_ligament'], equals: 'Yes',
          text: 'The anococcygeal ligament was divided and the deep postanal space of Courtney was entered, releasing the collection within it.' },
        { group: 'hlig', needs: ['ar_h_ligament'], equals: 'No',
          text: 'The deep postanal space was entered without dividing the anococcygeal ligament.' },
        { needs: ['ar_procedure'], equals: 'Modified Hanley procedure',
          text: 'The space was explored digitally along its whole length, and its lateral extensions into each ischioanal fossa were followed to their limits.' },
        { group: 'hes', needs: ['ar_h_es'], equals: 'Yes',
          text: 'The external sphincter was preserved in its entirety.' },
        { group: 'hes', needs: ['ar_h_es'], equals: 'No',
          text: 'The external sphincter was divided in the posterior midline, the extent of the division being set out in the findings; the consequence for continence had been discussed with the patient before operation.' },
        { group: 'his', needs: ['ar_h_is'], equals: 'Divided over the internal opening',
          text: 'The internal sphincter alone was divided over the internal opening in the posterior midline, laying the primary tract open into the anal canal.' },
        { group: 'his', needs: ['ar_h_is'], equals: 'Preserved, seton placed instead',
          text: 'The internal sphincter was left intact, a seton being passed through the primary tract instead, so that the decision to divide it could be taken once the sepsis had settled.' }
      ],

      ar_intersphincteric: [
        { needs: ['ar_procedure'], equals: 'Drainage of an intersphincteric abscess',
          text: 'The intersphincteric abscess was drained into the anal canal by dividing the internal sphincter over it. No external incision was made, so that the sepsis was not carried out across the external sphincter.' }
      ],

      /* The invariant. Which way a supralevator abscess is drained is
         decided by where it came from, and the wrong choice makes an
         extrasphincteric fistula. So the sentence carries its reason. */
      ar_supralevator: [
        { group: 'sup', needs: ['ar_supra_origin'], equals: 'Upward extension of an intersphincteric',
          text: 'The supralevator collection was the upward extension of an intersphincteric abscess. It was therefore drained through the anal canal into the rectum above the anorectal ring, and not through the ischioanal fossa, since drainage through the fossa would have created an extrasphincteric fistula.' },
        { group: 'sup', needs: ['ar_supra_origin'], equals: 'Upward extension of an ischioanal',
          text: 'The supralevator collection was the upward extension of an ischioanal abscess. It was therefore drained downward through the ischioanal fossa, and not into the rectum, since transrectal drainage would have created an extrasphincteric fistula.' },
        { group: 'sup', needs: ['ar_supra_origin'], equals: 'Downward extension of pelvic sepsis',
          text: 'The supralevator collection was the downward extension of pelvic sepsis rather than a disease of the anal glands, and was drained by the route leading most directly to it; the intra-abdominal source was addressed separately.' },

        { group: 'suproute', needs: ['ar_procedure'], equals: 'Transrectal drainage of a supralevator',
          text: 'The collection was opened through the rectal wall above the anorectal ring and a catheter was left to keep the track open.' },
        { group: 'suproute', needs: ['ar_procedure'], equals: 'supralevator abscess through the ischioanal fossa',
          text: 'The collection was reached from below by opening the levator through the ischioanal fossa, and a drain was left in the track.' }
      ],

      ar_necrotising: [
        { needs: ['ar_procedure'], equals: 'Radical debridement for necrotising',
          text: 'All necrotic skin, subcutaneous tissue and fascia were excised back to bleeding, viable tissue, the limits of the excision being set by what was found at operation rather than by the margin marked out before it.' },
        { needs: ['ar_fn_regions'],
          text: 'The debridement extended over the {ar_fn_regions|lc|and}.' },
        { needs: ['ar_fn_area'],
          text: 'Approximately {ar_fn_area}% of the body surface was debrided.' },
        { group: 'fnt', needs: ['ar_fn_testis'], equals: 'Both preserved',
          text: 'The testes were viable, their blood supply arising independently of the scrotal skin, and both were preserved.' },
        { group: 'fnt', needs: ['ar_fn_testis'], equals: 'Orchidectomy, one side',
          text: 'A unilateral orchidectomy was required.' },
        { group: 'fnt', needs: ['ar_fn_testis'], equals: 'Orchidectomy, both sides',
          text: 'Bilateral orchidectomy was required.' },
        { group: 'fnd', needs: ['ar_fn_diversion'], equals: 'None',
          text: 'No faecal diversion was performed.' },
        { group: 'fnd', needs: ['ar_fn_diversion'], equals: 'Faecal management system',
          text: 'A faecal management system was placed rather than a stoma.' },
        { group: 'fnd', needs: ['ar_fn_diversion'],
          text: 'A {ar_fn_diversion|lc} was fashioned to divert stool away from the wound.' },
        { group: 'fnr', needs: ['ar_fn_relook'], equals: 'Not planned',
          text: 'No second look was planned.' },
        { group: 'fnr', needs: ['ar_fn_relook'], equals: 'When clinically indicated',
          text: 'A second-look debridement was planned for whenever the wound should demand it.' },
        { group: 'fnr', needs: ['ar_fn_relook'],
          text: 'A second-look debridement was planned {ar_fn_relook|lc}.' },
        { group: 'fndr', needs: ['ar_fn_dressing'], equals: 'Negative-pressure',
          text: 'Negative-pressure wound therapy was applied.' },
        { group: 'fndr', needs: ['ar_fn_dressing'],
          text: 'The wound was dressed with {ar_fn_dressing|lc}.' }
      ],

      ar_seton: [
        { group: 'set', needs: ['ar_procedure', 'ar_seton_material'], equals: 'Draining (loose) seton',
          text: 'A loose draining seton of {ar_seton_material} was passed along the tract, from the internal opening to the external wound, and tied without tension so that it would drain rather than cut.' },
        { group: 'set', needs: ['ar_procedure'], equals: 'Draining (loose) seton',
          text: 'A loose draining seton was passed along the tract and tied without tension so that it would drain rather than cut.' },
        { needs: ['ar_seton_number'],
          text: 'The number of setons placed was {ar_seton_number}.' },
        /* his own sentence, so it supplies its own full stop */
        { needs: ['ar_seton_plan'],
          text: 'The plan for the seton is as follows: {ar_seton_plan}' }
      ],

      ar_fistulotomy: [
        { needs: ['ar_procedure'], equals: 'Primary fistulotomy',
          text: 'The primary tract was laid open at the same sitting, the internal opening being low and the bulk of the external sphincter not at risk.' }
      ],

      ar_curettage: [
        { needs: ['ar_procedure'], equals: 'Curettage and debridement',
          text: 'The cavity was curetted of granulation tissue and necrotic debris until a clean, bleeding wall was reached.' }
      ],

      ar_specimens: [
        { group: 'cul', needs: ['ar_culture'], equals: 'Yes',
          text: 'Pus was sent for culture and sensitivity.' },
        { group: 'cul', needs: ['ar_culture'], equals: 'No',
          text: 'No specimen was sent for culture.' },
        { needs: ['ar_histology'], equals: 'Yes',
          text: 'Tissue from the cavity wall was sent for histopathology.' }
      ],

      ar_close: [
        { group: 'w', needs: ['ar_wound'], equals: 'Marsupialized',
          text: 'The wound edges were marsupialized to the wall of the cavity.' },
        { group: 'w', needs: ['ar_wound'], equals: 'Left open',
          text: 'The wound was left open to heal by secondary intention.' },
        { group: 'w', needs: ['ar_wound'], equals: 'Partially closed',
          text: 'The wound was partially closed, a dependent portion being left open for drainage.' },
        { group: 'pk', needs: ['ar_packing'], equals: 'None',
          text: 'No anal packing was used.' },
        { group: 'pk', needs: ['ar_packing'],
          text: '{ar_packing} was placed in the anal canal at the end of the procedure.' },
        { needs: ['ar_antibiotic'],
          text: 'Antibiotic treatment was continued with {ar_antibiotic}.' }
      ],

      ar_count: [
        { needs: ['ar_count'], equals: 'Yes',
          text: 'Swab, needle and instrument counts were correct at the end of the procedure.' }
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
          { use: 'extraction_left' }, { use: 'decompress' }, { use: 'margins' },
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
        /* One block for the whole category. Like a fistula, an abscess
           operation is usually several named procedures at once — a
           modified Hanley is a Hanley and counter-incisions and, more
           often than not, a seton — and the first matching block wins,
           so splitting them would print only the first. Every part is
           gated on its own answers instead.

           The order of the parts is the order of the operation: look,
           describe, find the opening, let the pus out, deal with what
           the pus had reached, then close. */
        name: 'Anorectal sepsis',
        when: [
          { key: 'ar_procedure', any: ['Incision and drainage',
            'Deroofing of the cavity', 'Drainage with counter-incision',
            'Modified Hanley procedure', 'Drainage of an intersphincteric abscess',
            'Transrectal drainage of a supralevator abscess',
            'Drainage of a supralevator abscess through the ischioanal fossa',
            'Draining (loose) seton', 'Primary fistulotomy',
            'Curettage and debridement',
            'Radical debridement for necrotising soft-tissue infection',
            'Faecal diversion', 'Examination under anesthesia only', 'Other'] }
        ],
        lines: [
          { use: 'ar_setup' }, { use: 'ar_assess' }, { use: 'ar_opening' },
          { use: 'ar_eua_only' },
          { use: 'ar_drain' }, { use: 'ar_hanley' }, { use: 'ar_counter' },
          { use: 'ar_intersphincteric' }, { use: 'ar_supralevator' },
          { use: 'ar_necrotising' },
          { use: 'ar_curettage' }, { use: 'ar_fistulotomy' }, { use: 'ar_seton' },
          { use: 'ar_specimens' }, { use: 'ar_close' }, { use: 'ar_count' }
        ]
      },
      {
        name: 'Hemorrhoid and minor anorectal procedures',
        when: [
          { key: 'he_procedure', any: ['Hemorrhoidectomy',
            'Radiofrequency ablation (RFA)', 'Laser hemorrhoidoplasty (LHP)',
            'Rubber band ligation', 'Sclerotherapy',
            'Excision of thrombosed external pile', 'Lateral internal sphincterotomy',
            'Fissurectomy', 'Excision of skin tag', 'Other'] }
        ],
        lines: [
          { use: 'he_setup' }, { use: 'he_assess' },
          { use: 'he_excision' }, { use: 'he_rfa' }, { use: 'he_laser' },
          { use: 'he_minor' }, { use: 'he_close' }
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
        /* Placed before the left-sided block, which would otherwise sweep up
           a TaTME low anterior resection and describe it as though the whole
           mesorectum had been taken from above. The abdominal phase is the
           same operation and reuses the same parts; only the pelvic dissection
           and the anastomosis are replaced. */
        name: 'Transanal total mesorectal excision',
        when: [
          { key: 'cr_tme_route', any: ['TaTME (two-team)', 'TaTME (one-team)'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_left' }, { use: 'explore_left' },
          { use: 'left_mobilise' }, { use: 'left_vessels' }, { use: 'splenic_flexure' },
          { use: 'ta_setup' }, { use: 'ta_ps1' }, { use: 'ta_rectotomy' },
          { use: 'ta_dissect' }, { use: 'ta_meet' },
          { use: 'ta_extract' }, { use: 'decompress' }, { use: 'margins' },
          { use: 'ta_anast' }, { use: 'anast_check' }, { use: 'ta_events' },
          { use: 'hemostasis_pelvis' }, { use: 'drain' },
          { use: 'close_abdomen' }, { use: 'count' }
        ]
      },
      {
        /* Narrower than the left-sided block below, so it must come
           first: otherwise a left hemicolectomy is swept up by it and
           told how many times its rectum was stapled across. */
        name: 'Left hemicolectomy',
        when: [
          { key: 'cr_procedure', any: ['Left hemicolectomy'] },
          { key: 'cr_approach', any: ['Open', 'Laparoscopic', 'Robotic'] }
        ],
        lines: [
          { use: 'setup' }, { use: 'access_left' }, { use: 'explore_left' },
          { use: 'left_mobilise' }, { use: 'left_vessels' }, { use: 'splenic_flexure' },
          { use: 'lh_transection' },
          { use: 'extraction_left' }, { use: 'decompress' }, { use: 'margins' },
          { use: 'lh_anastomosis' }, { use: 'anast_check' },
          { use: 'hemostasis_abdomen' }, { use: 'drain' },
          { use: 'close_abdomen' }, { use: 'count' }
        ]
      },
      {
        /* One block for every left-sided and rectal resection. The rectal
           sentences quote fields that only a rectal case is asked for, so a
           sigmoidectomy simply skips them — which is safer than keeping a
           second, older block that had to be corrected separately. */
        name: 'Left-sided and rectal resection',
        when: [
          { key: 'cr_procedure', any: ['Sigmoidectomy',
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
          { use: 'right_mobilise' }, { use: 'right_resect' }, { use: 'decompress' }, { use: 'margins' },
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
      /* cr_stapler was never a field; this line could not render. The real
         ones are cr_l_circular for a circular stapler and cr_r_stapler for a
         linear one. */
      { needs: ['cr_l_circular'], not: 'Not used',
        text: 'A {cr_l_circular} circular stapler was used.' },
      { needs: ['cr_leak_test'], not: 'Not performed',
        text: 'An air-leak test was performed and was {cr_leak_test}.' },
      { needs: ['cr_perfusion'], not: 'Not assessed',
        text: 'Perfusion of the anastomosis was assessed by {cr_perfusion}.' },
      { needs: ['cr_diverting'], not: 'None',
        text: 'A {cr_diverting} was fashioned to divert the anastomosis.' },

      { needs: ['cr_drain'], not: 'None', text: 'A drain was placed: {cr_drain}.' },
      /* cr_closure likewise: the fascia and the skin are recorded separately */
      { group: 'cl', needs: ['cr_closure_sheath_material', 'cr_closure_sheath_fashion'],
        text: 'The fascia was closed with {cr_closure_sheath_material}, {cr_closure_sheath_fashion|lc}.' },
      { group: 'cl', needs: ['cr_closure_sheath_material'],
        text: 'The fascia was closed with {cr_closure_sheath_material}.' },
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

      { group: 'pk', needs: ['fi_parks', 'fi_parks_other'], equals: 'Other',
        text: 'The tract did not fit the Parks classification: {fi_parks_other}.' },
      { group: 'pk', needs: ['fi_parks'], equals: 'Other',
        text: 'The tract did not fit the Parks classification.' },
      { group: 'pk', needs: ['fi_parks'], text: 'The tract was {fi_parks_text} in type.' },
      { needs: ['fi_complexity'], text: 'It was classified as a {fi_complexity|lc} fistula.' },
      { needs: ['fi_features'], text: 'Additional findings: {fi_features}.' },
      { needs: ['fi_sphincter_involved'],
        text: 'Approximately {fi_sphincter_involved}% of the external sphincter was encircled by the tract.' },

      { needs: ['fi_procedure'], text: 'The procedure performed was {fi_procedure|lc}.' },
      { needs: ['fi_seton_material'], text: 'The seton used was {fi_seton_material}.' },
      /* fi_specimen was removed from the fistula form on Ball's instruction;
         the sentence that quoted it outlived the field */
      { needs: ['fi_marsupialise'], equals: 'Yes',
        text: 'The wound edges were marsupialized.' }
    ],

    /* ----------------------------------------------------------------
       ANORECTAL SEPSIS — the fallback, naming the same parts as the
       block above so the two cannot drift apart.
       ---------------------------------------------------------------- */
    anorectal: [
      { use: 'ar_setup' }, { use: 'ar_assess' }, { use: 'ar_opening' },
      { use: 'ar_eua_only' },
      { use: 'ar_drain' }, { use: 'ar_hanley' }, { use: 'ar_counter' },
      { use: 'ar_intersphincteric' }, { use: 'ar_supralevator' },
      { use: 'ar_necrotising' },
      { use: 'ar_curettage' }, { use: 'ar_fistulotomy' }, { use: 'ar_seton' },
      { use: 'ar_specimens' }, { use: 'ar_close' }, { use: 'ar_count' }
    ],

    /* ----------------------------------------------------------------
       HAEMORRHOID — the fallback list, used when no operation block matches.
       It names the same parts as the block below, so the two can never drift
       into telling different stories about the same operation.
       ---------------------------------------------------------------- */
    hemorrhoid: [
      { use: 'he_setup' }, { use: 'he_assess' },
      { use: 'he_excision' }, { use: 'he_rfa' }, { use: 'he_laser' },
      { use: 'he_minor' }, { use: 'he_close' }
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
      { group: 'icx', needs: ['intraop_complication'], equals: 'None',
        text: 'There was no intra-operative complication.' },
      { group: 'icx', needs: ['intraop_complication'],
        text: 'Intra-operative complication: {intraop_complication}' },
      { group: 'pcx', needs: ['postop_complication'], equals: 'None',
        text: 'There was no immediate post-operative complication.' },
      { group: 'pcx', needs: ['postop_complication', 'postop_complication_other'],
        equals: 'Other',
        text: 'Immediate post-operative complication: {postop_complication_other}.' },
      { group: 'pcx', needs: ['postop_complication'],
        text: 'Immediate post-operative complication: {postop_complication|lc}.' },
      { needs: ['ebl'], text: 'Estimated blood loss was {ebl} mL.' },
      { needs: ['transfusion'], not: 'None',
        text: 'Replacement given: {transfusion}.' },
      { needs: ['pathology_sent'],
        text: 'The specimen was sent for histopathology: {pathology_sent}.' }
    ]

  };

})(window);
