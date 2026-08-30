/* =====================================================================
   figures.js — anatomical base diagrams for the Operative Note app
   Each figure is a self-contained SVG string, drawn as vector so it
   prints sharply at any size. Add your own figure by copying one of
   the entries below and giving it a new key.
   ===================================================================== */

(function (global) {
  'use strict';

  /* ---------- small geometry helpers ---------- */

  function pol(cx, cy, r, deg) {
    var a = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  /* a closed "wavy" circle, used for mucosal folds of the anal lumen */
  function wavyCircle(cx, cy, r, amp, teeth) {
    var d = '', i, rr, p;
    for (i = 0; i <= teeth * 2; i++) {
      rr = r + (i % 2 ? amp : -amp);
      p = pol(cx, cy, rr, i * 360 / (teeth * 2));
      d += (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1);
    }
    return d + 'Z';
  }

  /* clock face: hour ticks + numbers 1..12 around a circle */
  function clockRing(cx, cy, rTick, rNum, size) {
    var s = '', h, a, b, t;
    for (h = 1; h <= 12; h++) {
      a = pol(cx, cy, rTick, h * 30);
      b = pol(cx, cy, rTick + 12, h * 30);
      s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) +
        '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) +
        '" stroke="#333" stroke-width="2"/>';
      t = pol(cx, cy, rNum, h * 30);
      s += '<text x="' + t[0].toFixed(1) + '" y="' + (t[1] + size * 0.35).toFixed(1) +
        '" font-size="' + size + '" text-anchor="middle" fill="#333" ' +
        'font-family="Helvetica,Arial,sans-serif">' + h + '</text>';
    }
    return s;
  }

  var FONT = 'font-family="Georgia,\'Times New Roman\',serif" font-style="italic"';

  /* =================================================================
     1. COLON — full large bowel, for colorectal resections
     ================================================================= */

  var COLON_PATH =
    'M176,474 C160,430 158,300 172,228 C182,170 226,148 282,150 ' +
    'C342,152 372,186 422,170 C464,157 500,154 518,184 ' +
    'C542,224 542,322 528,394 C516,450 472,478 434,492 ' +
    'C400,504 382,526 380,556';

  function haustra() {
    /* short tick marks that suggest haustral folds */
    var ticks = [
      [163, 260, 197, 258], [163, 300, 197, 298], [163, 340, 197, 338],
      [165, 380, 199, 378], [168, 420, 202, 418],
      [232, 152, 230, 186], [272, 150, 272, 186], [312, 155, 312, 189],
      [352, 168, 352, 200], [392, 172, 392, 204], [432, 166, 432, 198],
      [468, 158, 470, 190],
      [522, 240, 490, 242], [528, 282, 496, 284], [530, 324, 498, 326],
      [524, 366, 492, 368], [512, 408, 482, 400],
      [452, 470, 442, 442], [412, 492, 404, 462]
    ];
    return ticks.map(function (t) {
      return '<line x1="' + t[0] + '" y1="' + t[1] + '" x2="' + t[2] + '" y2="' + t[3] +
        '" stroke="#111" stroke-width="1.6" opacity=".55"/>';
    }).join('');
  }

  var colon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 660">' +
    '<rect width="700" height="660" fill="#ffffff"/>' +
    /* tube: black outline then white core */
    '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' + COLON_PATH + '" stroke="#111" stroke-width="36"/>' +
    '<path d="' + COLON_PATH + '" stroke="#ffffff" stroke-width="29"/>' +
    /* terminal ileum */
    '<path d="M76,548 C104,534 132,514 152,498" stroke="#111" stroke-width="18"/>' +
    '<path d="M76,548 C104,534 132,514 152,498" stroke="#ffffff" stroke-width="12"/>' +
    /* appendix, arising from the caecal pole */
    '<path d="M170,508 C176,552 204,570 236,556" stroke="#111" stroke-width="15"/>' +
    '<path d="M170,508 C176,552 204,570 236,556" stroke="#ffffff" stroke-width="9.5"/>' +
    '</g>' +
    /* caecum */
    '<ellipse cx="176" cy="474" rx="44" ry="40" fill="#ffffff" stroke="#111" stroke-width="3.5"/>' +
    /* rectum tapering into the anal canal */
    '<path d="M360,546 C358,578 354,600 350,616 L406,616 C402,600 398,578 396,546 Z" ' +
    'fill="#ffffff" stroke="#111" stroke-width="3.5"/>' +
    '<path d="M358,616 L398,616 L392,650 L364,650 Z" fill="#ffffff" stroke="#111" stroke-width="3.5"/>' +
    haustra() +
    /* labels */
    '<g ' + FONT + ' font-size="16" fill="#111">' +
    '<text x="300" y="30" text-anchor="middle">Transverse</text>' +
    '<text x="300" y="49" text-anchor="middle">colon</text>' +
    '<line x1="300" y1="58" x2="300" y2="150" stroke="#111" stroke-width="1.2"/>' +
    '<text x="14" y="206">Ascending</text><text x="14" y="225">colon</text>' +
    '<line x1="100" y1="212" x2="168" y2="222" stroke="#111" stroke-width="1.2"/>' +
    '<text x="596" y="252">Descending</text><text x="596" y="271">colon</text>' +
    '<line x1="590" y1="258" x2="536" y2="272" stroke="#111" stroke-width="1.2"/>' +
    '<text x="14" y="452">Caecum</text>' +
    '<line x1="88" y1="446" x2="140" y2="452" stroke="#111" stroke-width="1.2"/>' +
    '<text x="6" y="596">Terminal</text><text x="6" y="615">ileum</text>' +
    '<line x1="62" y1="590" x2="80" y2="558" stroke="#111" stroke-width="1.2"/>' +
    '<text x="192" y="622">Appendix</text>' +
    '<line x1="230" y1="616" x2="232" y2="570" stroke="#111" stroke-width="1.2"/>' +
    '<text x="614" y="470">Sigmoid</text>' +
    '<line x1="608" y1="464" x2="456" y2="474" stroke="#111" stroke-width="1.2"/>' +
    '<text x="500" y="612">Rectum</text>' +
    '<line x1="494" y1="606" x2="414" y2="596" stroke="#111" stroke-width="1.2"/>' +
    '</g></svg>';

  /* =================================================================
     2. ANAL CLOCK — axial view with o'clock numbering
        (lithotomy convention: 12 anterior, 6 posterior, Rt on left)
     ================================================================= */

  var CX = 270, CY = 250;

  var analClock =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 520">' +
    '<rect width="540" height="520" fill="#ffffff"/>' +
    '<circle cx="' + CX + '" cy="' + CY + '" r="168" fill="#ffffff" stroke="#111" stroke-width="7"/>' +
    '<circle cx="' + CX + '" cy="' + CY + '" r="146" fill="#d9d9d9" stroke="#111" stroke-width="2.5"/>' +
    '<circle cx="' + CX + '" cy="' + CY + '" r="118" fill="#ffffff" stroke="#111" stroke-width="2.5"/>' +
    '<circle cx="' + CX + '" cy="' + CY + '" r="96"  fill="#d9d9d9" stroke="#111" stroke-width="2.5"/>' +
    '<circle cx="' + CX + '" cy="' + CY + '" r="70"  fill="#ffffff" stroke="#111" stroke-width="2.5"/>' +
    '<path d="' + wavyCircle(CX, CY, 56, 6, 11) + '" fill="#ffffff" stroke="#111" stroke-width="2"/>' +
    clockRing(CX, CY, 168, 192, 15) +
    '<g font-family="Helvetica,Arial,sans-serif" font-size="23" font-weight="bold" fill="#111">' +
    '<text x="' + CX + '" y="28" text-anchor="middle">A</text>' +
    '<text x="' + CX + '" y="500" text-anchor="middle">P</text>' +
    '<text x="14" y="' + (CY + 8) + '">Rt</text>' +
    '<text x="526" y="' + (CY + 8) + '" text-anchor="end">Lt</text>' +
    '</g>' +
    '<g font-family="Helvetica,Arial,sans-serif" font-size="11" fill="#777">' +
    '<text x="' + CX + '" y="' + (CY + 4) + '" text-anchor="middle">lumen</text>' +
    '<text x="' + CX + '" y="514" text-anchor="middle">lithotomy view &#183; 12 = anterior, 6 = posterior</text>' +
    '</g></svg>';

  /* =================================================================
     3. ANAL CANAL — coronal section, for fistula / sphincter mapping
     ================================================================= */

  function coronalHalf() {
    return (
      /* levator ani / puborectalis, drawn first so the sphincters sit on top */
      '<path d="M346,188 L346,152 L552,58 L560,86 Z" ' +
      'fill="#cfcfcf" stroke="#111" stroke-width="2.2" stroke-linejoin="round"/>' +
      /* rectal ampulla flaring above the anal canal */
      '<path d="M310,104 C312,74 332,50 364,30" fill="none" stroke="#111" stroke-width="3"/>' +
      /* mucosal wall of the anal canal, opening out to the anal verge */
      '<path d="M310,104 L310,300 C310,330 320,346 336,354" fill="none" stroke="#111" stroke-width="3"/>' +
      /* internal anal sphincter */
      '<rect x="313" y="110" width="25" height="206" rx="11" fill="#cfcfcf" stroke="#111" stroke-width="2.2"/>' +
      /* intersphincteric plane */
      '<line x1="342" y1="118" x2="342" y2="322" stroke="#888" stroke-width="1.6" stroke-dasharray="5 5"/>' +
      /* external anal sphincter: deep / superficial / subcutaneous */
      '<rect x="346" y="132" width="34" height="62" rx="15" fill="#cfcfcf" stroke="#111" stroke-width="2.2"/>' +
      '<rect x="346" y="202" width="34" height="62" rx="15" fill="#cfcfcf" stroke="#111" stroke-width="2.2"/>' +
      '<rect x="346" y="272" width="34" height="50" rx="15" fill="#cfcfcf" stroke="#111" stroke-width="2.2"/>' +
      /* perianal skin */
      '<path d="M336,354 C386,376 470,392 566,398" fill="none" stroke="#111" stroke-width="3"/>'
    );
  }

  var analCoronal =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 440">' +
    '<rect width="600" height="440" fill="#ffffff"/>' +
    '<g>' + coronalHalf() + '</g>' +
    '<g transform="translate(600,0) scale(-1,1)">' + coronalHalf() + '</g>' +
    /* dentate line across the lumen */
    '<path d="M290,208 q5,-8 10,0 q5,8 10,0" fill="none" stroke="#111" stroke-width="2.5"/>' +
    /* labels — kept outside the mirrored group so the text is not flipped */
    '<g font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#111">' +
    '<text x="392" y="168">EAS deep</text>' +
    '<text x="392" y="238">EAS superficial</text>' +
    '<text x="392" y="304">EAS subcutaneous</text>' +
    '<text x="592" y="24" text-anchor="end">Levator ani / puborectalis</text>' +
    '<line x1="470" y1="30" x2="486" y2="66" stroke="#111" stroke-width="1.2"/>' +
    '<text x="212" y="108" text-anchor="end">IAS</text>' +
    '<line x1="216" y1="112" x2="286" y2="122" stroke="#111" stroke-width="1.2"/>' +
    '<text x="212" y="198" text-anchor="end">Dentate line</text>' +
    '<line x1="216" y1="194" x2="286" y2="207" stroke="#111" stroke-width="1.2"/>' +
    '<text x="212" y="360" text-anchor="end">Anal verge</text>' +
    '<line x1="216" y1="356" x2="262" y2="354" stroke="#111" stroke-width="1.2"/>' +
    '<text x="300" y="430" text-anchor="middle" font-size="12" fill="#666">' +
    'Rt &#8592;&#8195;coronal section&#8195;&#8594; Lt</text>' +
    '</g></svg>';

  /* =================================================================
     4. ABDOMEN — anterior wall, for incisions, ports and stoma sites
     ================================================================= */

  var abdomen =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540">' +
    '<rect width="480" height="540" fill="#ffffff"/>' +
    '<path d="M240,34 C322,34 400,74 420,146 L442,306 C452,410 358,502 240,502 ' +
    'C122,502 28,410 38,306 L60,146 C80,74 158,34 240,34 Z" ' +
    'fill="#ffffff" stroke="#111" stroke-width="4"/>' +
    /* costal margins */
    '<path d="M58,232 C138,152 194,124 240,120 C286,124 342,152 422,232" ' +
    'fill="none" stroke="#111" stroke-width="3"/>' +
    /* xiphisternum */
    '<path d="M240,94 L240,120" stroke="#111" stroke-width="3"/>' +
    /* umbilicus */
    '<circle cx="240" cy="300" r="11" fill="none" stroke="#111" stroke-width="3"/>' +
    '<path d="M234,296 q6,4 12,0" fill="none" stroke="#111" stroke-width="2"/>' +
    /* iliac crests + inguinal ligaments */
    '<path d="M62,352 C110,410 150,438 196,452 L240,458 L284,452 C330,438 370,410 418,352" ' +
    'fill="none" stroke="#111" stroke-width="2" stroke-dasharray="7 6"/>' +
    /* midline */
    '<path d="M240,150 L240,289 M240,311 L240,470" stroke="#111" stroke-width="1.5" stroke-dasharray="5 6"/>' +
    /* quadrant guides */
    '<path d="M70,300 L410,300" stroke="#111" stroke-width="1" stroke-dasharray="4 7" opacity=".5"/>' +
    '<g font-family="Helvetica,Arial,sans-serif" font-size="13" fill="#666">' +
    '<text x="120" y="250">RUQ</text><text x="330" y="250">LUQ</text>' +
    '<text x="120" y="392">RLQ</text><text x="330" y="392">LLQ</text>' +
    '<text x="240" y="524" text-anchor="middle" font-size="12">Anterior abdominal wall</text>' +
    '</g></svg>';

  /* =================================================================
     5. BLANK — plain sheet with a faint grid, for free sketching
     ================================================================= */

  var blank =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">' +
    '<defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">' +
    '<path d="M20,0 L0,0 L0,20" fill="none" stroke="#e3e3e3" stroke-width="1"/>' +
    '</pattern></defs>' +
    '<rect width="600" height="420" fill="#ffffff"/>' +
    '<rect width="600" height="420" fill="url(#g)"/>' +
    '<rect x="1" y="1" width="598" height="418" fill="none" stroke="#bbb" stroke-width="2"/>' +
    '</svg>';

  /* =================================================================
     Registry
     ================================================================= */

  global.FIGURES = {
    abdomen: {
      th: 'ผนังหน้าท้อง', en: 'Abdominal wall', w: 480, h: 540, svg: abdomen
    },
    blank: {
      th: 'กระดาษเปล่า', en: 'Blank sheet', w: 600, h: 420, svg: blank
    }
  };

  /* which figures are offered first for each surgical category */
  global.FIGURE_DEFAULTS = {
    colorectal: ['colon', 'abdomen'],
    fistula: ['anal_clock', 'anal_coronal'],
    hemorrhoid: ['anal_clock'],
    others: ['blank']
  };

})(window);
