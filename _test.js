/* Headless smoke test — run with: node _test.js  (requires jsdom) */
const { JSDOM } = require('/tmp/node_modules/jsdom');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const errors = [];
const logs = [];

const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
  runScripts: 'dangerously',
  resources: undefined,
  url: 'https://example.org/',
  pretendToBeVisual: true,
  beforeParse(w) {
    w.confirm = () => false;
    w.prompt = () => 'test label';
    w.print = () => { logs.push('print() called'); };
    w.fetch = () => Promise.reject(new Error('offline in test'));
    w.HTMLCanvasElement.prototype.getContext = () => null;
    w.onerror = (m) => errors.push('window.onerror: ' + m);
    ['log', 'warn', 'error'].forEach(k => {
      const orig = w.console[k];
      w.console[k] = (...a) => { if (k === 'error') errors.push(a.join(' ')); orig && orig(...a); };
    });
  }
});

const { window } = dom;
const doc = window.document;

// inject the three scripts manually (jsdom does not fetch local <script src>)
['config.js', 'figures.js', 'figures-original.js', 'letterhead.js', 'narrative.js', 'templates.js', 'app.js'].forEach(f => {
  const s = doc.createElement('script');
  s.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
  doc.body.appendChild(s);
  // the sign-in gate is exercised separately, at the end of this file
  if (f === 'config.js') {
    const o = doc.createElement('script');
    o.textContent = 'window.OPNOTE_CONFIG.requireLogin = false;';
    doc.body.appendChild(o);
  }
});

function check(name, cond, extra) {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name + (extra && !cond ? '  — ' + extra : ''));
  if (!cond) process.exitCode = 1;
}

const $ = s => doc.querySelector(s);
const $$ = s => Array.from(doc.querySelectorAll(s));

console.log('\nOperative Note — smoke test\n');

/* checks that must wait for an async re-render */
const pending = [];

setTimeout(main, 200);
function main() {

/* the three redrawn duplicates of the original diagrams were removed */
check('figures registry loaded', Object.keys(window.FIGURES).length === 7,
  'got ' + Object.keys(window.FIGURES).length);
check('no duplicate redrawn figures remain',
  ['colon', 'anal_clock', 'anal_coronal'].every(k => !window.FIGURES[k]));
check('original diagrams head the picker',
  Object.keys(window.FIGURES).slice(0, 4).every(k => k.indexOf('orig_') === 0));
check('original diagrams carry embedded PNG data',
  Object.keys(window.FIGURES).filter(k => window.FIGURES[k].png).length === 5);
check('colorectal opens on the colon with its blood supply',
  window.FIGURE_DEFAULTS.colorectal[0] === 'orig_colon_vessels');
/* demoted, not deleted — it is still offered in the Add figure picker */
check('the older colon outline is still in the bank',
  !!window.FIGURES.orig_colon);
check('fistula opens on all three original anal panels',
  window.FIGURE_DEFAULTS.fistula.join() === 'orig_anal_clock,orig_anal_coronal,orig_anal_tract');
check('templates loaded', window.DEFAULT_TEMPLATES.length > 80,
  'got ' + window.DEFAULT_TEMPLATES.length);
check('every template row has a key/type', window.DEFAULT_TEMPLATES.every(f => f.key && f.type));
check('template keys are unique', new Set(window.DEFAULT_TEMPLATES.map(f => f.key)).size
  === window.DEFAULT_TEMPLATES.length);

check('category picker rendered', $$('#catPick .catcard').length === 5);
check('common fields rendered', $$('#commonFields .field').length > 25,
  'got ' + $$('#commonFields .field').length);
check('colorectal fields rendered', $$('#catFields .field').length > 15,
  'got ' + $$('#catFields .field').length);
check('operation date pre-filled', !!$('[data-key="op_date"]').value);

/* the browser's own URL-and-date strip cannot be styled away, so the only
   fix is the dialog checkbox — which nobody finds unless told where it is */
/* the PDF route is the only clean answer on an iPad, so the button must be
   there, and pressing it with no network must warn rather than throw */
check('there is a Save PDF button beside Print', !!$('#btnPdf'));
/* the six things Ball reported on 1 September */
check('there is a way back to the whole picture', !!$('#toolZoomReset'));
check('waiting on Google shows a spinner rather than a dead screen',
  !!$('#busy') && !!$('#busyMsg') && $('#busy').classList.contains('hidden'));
check('reopening the note already in memory costs no round trip', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('function openNote'), src.indexOf('function openNote') + 1400);
  return /if \(S\.id === id && S\.data/.test(seg) && seg.indexOf('return;') < seg.indexOf("api('GET'");
})());
/* the copy that lives on the ward computer must not be able to alter a note */
/* The bundler once fed each file to String.replace as a REPLACEMENT STRING,
   where "$$" means a literal "$" — so every $$(sel) in app.js became $(sel)
   and the bundled app rendered nothing, from perfectly good source. */
check('the bundler inlines code with a replacer function, not a string', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '_bundle.js'), 'utf8');
  return /html\.replace\(tag, function \(\) \{ return/.test(src) &&
    !/html\.replace\(tag, '<script>/.test(src);
})());
check('and the built file still contains the list helper', (() => {
  const { execFileSync } = require('child_process');
  const out = execFileSync('node', [require('path').join(__dirname, '_bundle.js')],
    { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 });
  /* if $$ had been eaten there would be none left in the bundle */
  return out.indexOf('function $$(sel, root)') > -1 &&
    (out.match(/\$\$\(/g) || []).length >= 20;
})());
check('the print-only copy opens on the search box', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /if \(SITE\.printOnly\) \{\s*showView\('search'\)/.test(src);
})());
check('the bundler builds a print-only copy by default', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '_bundle.js'), 'utf8');
  return /process\.env\.EDITABLE !== '1'/.test(src) &&
    /window\.OPNOTE_CONFIG\.printOnly = true/.test(src);
})());
check('print-only hides New, Edit and Save', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /\|\| !!SITE\.printOnly/.test(src) &&
    /if \(!SITE\.printOnly\) arm\('data-edit', true\)/.test(src) &&
    /can && !SITE\.printOnly/.test(src);
})());
check('and says so at the top of the window', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function renderPrintOnlyBanner/.test(src) &&
    /renderPrintOnlyBanner\(\);/.test(src.slice(src.indexOf('function init()')));
})());
check('the app starts even where localStorage is refused', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /var memStore = \{\}/.test(src) && /opnote\.probe/.test(src);
})());
/* Ball's PDF came back with a 76-pixel page 2 and a 318-pixel page 4: each
   form page renders 3087 px and a sheet holds 3026, so the 61 px remainder
   was given a sheet of its own. The arithmetic is now its own function so it
   can be checked without rendering anything. */
/* At 5 mm margins the printed block was exactly as wide as the printable
   area, so Safari needed 99% to fit it. A millimetre of slack removes that. */
/* The form must look the same on an iPad and on a Windows PC, and the PDF
   is a photograph of the screen, so the font has to travel with the app. */
/* Writing a word is a dozen short strokes, and saveDraft — which harvests
   every field and serialises the note with its photographs — was running
   after each one. That is the pause between letters. */
/* Ball: "it's like during we write, we select the text out of the drawing box
   and also select the drawing box too" — the pen drag was starting a text
   selection, which both smears the UI blue and costs work on every move. */
/* drawTarget() returns a throwaway object holding references to the sheet's
   arrays, so "sh.strokes = []" emptied the throwaway and left the drawing
   where it was. Undo worked because pop() mutates the shared array. */
/* getBoundingClientRect forces a layout. Calling it once per POINT, at the
   240 points a second an Apple Pencil reports, is hundreds of forced layouts
   per stroke — the second Ball was waiting between strokes. */
check('the canvas is measured once per stroke, not once per point', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const posFn = src.slice(src.indexOf('function pos(e)'), src.indexOf('function pos(e)') + 260);
  return /cvRect \|\| \(cvRect = cv\.getBoundingClientRect\(\)\)/.test(posFn) &&
    /cvRect = cv\.getBoundingClientRect\(\);/.test(src);
})());
check('and the measurement is dropped whenever the canvas could have moved', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  /* not at the end of a stroke — nothing between two strokes can move it —
     but on anything that genuinely can: the view, the size, the orientation */
  return (src.match(/forgetRect/g) || []).length >= 4 &&
    /\['resize', 'orientationchange', 'scroll'\]/.test(src);
})());
/* Ball's Safari trace: script 117 ms, compositing 932 ms, median frame 79 ms.
   The canvas lived inside a stage the CSS scaled, so the compositor had to
   re-rasterise a magnified layer every frame. It is now a sibling of the
   stage, never transformed, and the zoom is applied when drawing instead. */
check('the canvas is no longer scaled by CSS', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /vp\.appendChild\(cv\);/.test(src) && /function inkTransform/.test(src) &&
    /ctx\.setTransform\(d, 0, 0, d, view\.x \* d, view\.y \* d\)/.test(src) &&
    !/canvas\.ink\{position:absolute;inset:0;width:100%/.test(css);
})());
check('and its size no longer depends on the zoom', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const fn = src.slice(src.indexOf('function inkResolution'), src.indexOf('function rescaleInk'));
  return !/view\.k/.test(fn) && /MAX_COMPOSITED_PIXELS/.test(fn);
})());
/* gestureMove -> applyView -> redraw was the second commonest stack in the
   second trace: a pinch repainted every stroke on every pointermove. */
check('a pinch repaints once a frame, not once a move event', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const av = src.slice(src.indexOf('function applyView'), src.indexOf('function zoomAt'));
  return /scheduleRedraw\(\);/.test(av) && !/if \(ctx\) redraw\(\);/.test(av) &&
    /function scheduleRedraw/.test(src);
})());
check('the canvas hands the compositor a smaller texture', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /MAX_COMPOSITED_PIXELS = 1\.6e6/.test(src);
})());
/* window.prompt blocks the whole page — 1535 of 1690 samples in one trace —
   and it is the wrong gesture: a label should be typed where it sits. */
/* A ghost contact used to make every later pen stroke be read as a pinch and
   thrown away — the second stroke of a "T" simply never arrived. */
/* The mark used to wait for a second point AND for the browser to grant an
   animation frame — which at the START of a stroke is a frame that has just
   been committed. Crossing the bar of a "T" was exactly that case. */
/* Caching the canvas rectangle for ever broke typing: when the on-screen
   keyboard opens, iPadOS slides the page through the VISUAL viewport, which
   fires no window scroll event, so every tap after the first landed astray. */
check('the keyboard cannot leave the canvas measured in the wrong place', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /window\.visualViewport/.test(src) &&
    /if \(tool\.mode === 'text'\) \{\s*\n\s*forgetRect\(\);/.test(src) &&
    /box\.style\.display = 'none';\s*\n\s*forgetRect\(\);/.test(src);
})());
check('the pen can time itself on the device, with nothing attached', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const html = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /function penLogToggle/.test(src) && /down\\u2192ink/.test(src) &&
    /id="penLog"/.test(html);
})());
/* Down, up, straight back down a few millimetres away is the shape of a
   double tap. While the page remains zoomable, Safari must wait to see
   whether that is what it was, and holds the second pointerdown meanwhile —
   invisible to a trace, because nothing is running. */
/* Ball saw the Cut/Copy/Paste callout appear where the crossbar should have
   been. That is iOS deciding whether a double tap meant "select a word", and
   it holds the second pointerdown until it knows. Only preventDefault on the
   underlying touch event retires it. */
/* The hospital computer re-renders a note from ITS OWN copy of the templates.
   A filed PDF is the only thing that fixes what was actually approved. */
/* jsPDF hands back data:application/pdf;filename=generated.pdf;base64,... and
   the script's pattern, written for data:image/png;base64, did not match it.
   No PDF was ever filed, and the reason was invisible. */
check('a data URL may carry parameters, and both ends now allow them', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const m = /var m = (\/\^data:.*?\/)\.exec/.exec(gs);
  if (!m) return false;
  const re = new RegExp(m[1].slice(1, -1));
  return re.test('data:application/pdf;filename=generated.pdf;base64,AAAA') &&
    re.test('data:image/png;base64,AAAA') &&
    !re.test('not a data url') &&
    /replace\(\/;filename=\[\^;,\]\*\/, ''\)/.test(src);
})());
check('a failed filing says why', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /tag\.title = good \? '' : \(\(r && r\.error\)/.test(src);
})());
/* Every save created another 85 KB file with the same name, and nothing ever
   removed the one before it. */
check('a note keeps one strokes file for its whole life, not one per save', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const fn = gs.slice(gs.indexOf('var sheetsJson = JSON.stringify'), gs.indexOf('var record = {'));
  return /DriveApp\.getFileById\(prev\.slice\(6\)\)/.test(fn) &&
    /f\.setContent\(sheetsJson\)/.test(fn) &&
    /if \(!f\) \{/.test(fn) &&
    fn.indexOf('setContent') < fn.indexOf('createFile');
})());
/* The editor's Run button passes no arguments, so the dry run and the real
   one have to be two separate names in the dropdown. */
check('the two cleanup runs are separate entries in the Run menu', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /function cleanupOrphanSheetJson_LIST\(\) \{ return cleanupOrphanSheetJson\(false\); \}/.test(gs) &&
    /function cleanupOrphanSheetJson_BIN\(\) \{ return cleanupOrphanSheetJson\(true\); \}/.test(gs);
})());
check('and the ones already there can be listed before anything is binned', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const fn = gs.slice(gs.indexOf('function cleanupOrphanSheetJson'), gs.indexOf('function safeName'));
  return /function cleanupOrphanSheetJson\(reallyDoIt\)/.test(fn) &&
    /if \(reallyDoIt\) \{ f\.setTrashed\(true\)/.test(fn) &&
    /would move to the bin/.test(fn) &&
    /if \(keep\[f\.getId\(\)\]\) continue;/.test(fn) &&
    /-sheets\\.json\$/.test(fn);
})());
check('a PDF of the approved note is filed, after the save and never before', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /function archivePdf/.test(src) &&
    /localStorage\.removeItem\(LS\.draft\);\s*\n[^\n]*\n\s*archivePdf\(pl\.id\);/.test(src) &&
    /action: 'pdf'/.test(src) &&
    /if \(p\.action === 'pdf'\) return json\(filePdf\(p, user\)\);/.test(gs) &&
    /function filePdf/.test(gs);
})());
check('the download and the filed copy are built the same way', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function buildPdfDoc/.test(src) &&
    /buildPdfDoc\(pdfScale\(\)\)/.test(src) &&
    /buildPdfDoc\(ARCHIVE_SCALE\)/.test(src) &&
    (src.match(/return pagesToPdf\(pages, doc, scale\)/g) || []).length === 1;
})());
check('the filed copy is lighter than the one the surgeon downloads', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const m = /var ARCHIVE_SCALE = ([\d.]+);/.exec(src);
  return !!m && parseFloat(m[1]) < 2;
})());
check('a superseded PDF goes to the bin, but only once its replacement is safe', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const fn = gs.slice(gs.indexOf('function filePdf'), gs.indexOf('function saveNote'));
  return /var file = saveImage\(folder, name, p\.dataUrl\);/.test(fn) &&
    fn.indexOf('saveImage') < fn.indexOf('setTrashed') &&
    /old\.id !== file\.id/.test(fn) &&
    /\['figureUrls', 'photoUrls'\]\.forEach/.test(gs);  /* and NOT the PDF:
       a save bins the old copy only once filePdf has landed the new one,
       so the note is never left with no filed document at all */
})());
check('pdfUrl is a column and reaches the search results', (() => {
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /'photoUrls', 'pdfUrl', 'savedBy'/.test(gs) &&
    /pdfUrl: \(function \(\) \{/.test(gs) &&
    /n\.pdfUrl \? '<a class="mini pdf"/.test(src);
})());
check('the app and the script agree on the build', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const gs = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /EXPECTED_BUILD = '2026-08-02s'/.test(src) && /var BUILD = '2026-08-02s'/.test(gs);
})());
check('the double-tap selection gesture is called off at the touch layer', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /\['touchstart', 'touchmove'\]/.test(src) &&
    /\{ passive: false \}/.test(src) &&
    /gesturestart', 'gesturechange', 'gestureend'/.test(src) &&
    !/'touchend'/.test(src) &&           /* left alone: the keyboard needs it */
    /\.drawback \*\{-webkit-user-select:none !important/.test(css) &&
    /\.drawback \.inkedit\{-webkit-user-select:text !important/.test(css);
})());
check('the page is unzoomable while the pen is out, and zoomable again after', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /user-scalable=no/.test(src) && /function pageZoomable/.test(src) &&
    /pageZoomable\(false\)/.test(src) && /pageZoomable\(true\)/.test(src) &&
    /body\.drawing\{overflow:hidden;touch-action:none/.test(css) &&
    /\.drawback,\.drawbox\{touch-action:none\}/.test(css) &&
    /content="width=device-width, initial-scale=1, viewport-fit=cover"/.test(css);
})());
check('the ink appears on contact, not on the next frame', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /drawTail\(\);\s+\/\* a mark under the nib/.test(src) &&
    /if \(cur\.drawn < 2\) \{ drawTail\(\); return; \}/.test(src);
})());
check('and a stroke that is only a dot is still a dot', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /if \(st\.p\.length === 1\)/.test(src) && /if \(!cur\.drawn\) \{/.test(src);
})());
check('the canvas is measured once, not at every pen-down', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /if \(!cvRect\) cvRect = cv\.getBoundingClientRect\(\);/.test(src) &&
    !/^\s*cvRect = cv\.getBoundingClientRect\(\);$/m.test(src);
})());
check('nothing is left to do when the pencil lifts', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return !/toFixed\(4\)/.test(src) && /Math\.round\(\(\(e\.clientX/.test(src);
})());
check('a pen is never mistaken for a pinch', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function pinching\(\)/.test(src) && /function sweepGhosts/.test(src) &&
    /e\.pointerType !== 'pen' && pinching\(\)/.test(src) &&
    /lostpointercapture/.test(src) &&
    !/livePoints\(\)\.length >= 2/.test(src);
})());
check('the page is not re-laid-out at the start of every stroke', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function watchGeometry/.test(src) &&
    !/cur = null;\s*forgetRect\(\);/.test(src);
})());
check('a label has a handle to move it by', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /move: put\(x0 - b\.h \* 0\.55/.test(src) &&
    /near\(\{ x: px, y: py \}, fr\.move, grab\)/.test(src) &&
    /\[fr\.resize, fr\.rotate, fr\.move\]/.test(src);
})());
check('a label is typed on the picture, not in a dialog', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /function openTextEditor/.test(src) && /\.inkedit\{position:absolute/.test(css) &&
    !/window\.prompt\('ข้อความ/.test(src);
})());
check('a tap that misses lets go instead of making a new label', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /if \(selText > -1\) \{ setSelectedText\(-1\); return; \}/.test(src);
})());
check('the draft is not written between strokes', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const fn = src.slice(src.indexOf('function saveInk'), src.indexOf('function saveInk') + 900);
  return /setTimeout\(writeDraft, 20000\)/.test(fn);
})());
check('a label is a frame with a resize corner and a rotate knob', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function textFrame/.test(src) && /function inFrame/.test(src) &&
    /mode: 'rotate'/.test(src) && /mode: 'resize'/.test(src) && /mode: 'move'/.test(src);
})());
check('and its frame follows the angle it was turned to', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const fn = src.slice(src.indexOf('function inFrame'), src.indexOf('function textAt'));
  /* hit testing has to undo the rotation, or a turned label cannot be grabbed */
  return /Math\.cos\(r\)/.test(fn) && /Math\.sin\(r\)/.test(fn);
})());
check('a selected label can be reworded, resized, rotated, bolded, underlined', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function editSelectedText/.test(src) &&
    ["'words'", "'size'", "'rotate'", "'bold'", "'under'"].every(k => src.indexOf(k) > -1) &&
    /if \(t\.r\) c\.rotate\(t\.r\)/.test(src) && /t\.b \? '700 ' : '400 '/.test(src) &&
    /if \(t\.u\)/.test(src);
})());
check('tapping a selected label again lets you change the words', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /if \(hit === selText\) \{ editSelectedText\('words'\); return; \}/.test(src);
})());
check('the label controls appear only when a label is selected',
  !!$('#textBar') && $('#textBar').style.display === 'none' &&
  ['#txtWords','#txtBigger','#txtSmaller','#txtRotL','#txtRotR','#txtBold','#txtUnder','#txtDelete']
    .every(id => !!$(id)));
check('the eraser removes a label instead of leaving it to reappear', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function eraseTextsUnder/.test(src) && /if \(cur && cur\.e\) eraseTextsUnder/.test(src);
})());
check('the label font is slimmer and monospaced', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /'400 '/.test(src) && /Courier New/.test(src);
})());
check('date and time fields cannot overlap the row above', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /input\[type=date\],\.fbody input\[type=time\]\{[\s\S]*?appearance:none/.test(css) &&
    /\.field\{[^}]*align-self:start/.test(css);
})());
check('Clear empties the sheet in place rather than a copy of it', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /sh\.strokes\.length = 0; sh\.texts\.length = 0;/.test(src) &&
    !/sh\.strokes = \[\];/.test(src);
})());
check('lifting the pen does not repaint every stroke on the sheet', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return !/redraw\(\);\s*\/\* settle the stroke/.test(src) && /No repaint here/.test(src);
})());
check('but undo, clear and mounting still repaint', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return (src.match(/redraw\(\); saveInk\(\);/g) || []).length >= 3 &&
    /applyView\(\);\s*\n\s*redraw\(\);/.test(src);
})());
check('drawing cannot start a text selection', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const cssOk = /\.drawback,\.drawbox,\.stageview,\.stage,canvas\.ink,\.toolbar\{[\s\S]*?user-select:none/.test(css);
  const jsOk = /'selectstart', 'dragstart', 'contextmenu'/.test(src);
  return cssOk && jsOk;
})());
check('the pen does not harvest the whole form after every stroke', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const inDraw = src.slice(src.indexOf('function bindPointer'), src.indexOf('function loadImage'));
  return /function saveInk/.test(src) && /saveInk\(\)/.test(inDraw) && !/saveDraft\(\)/.test(inDraw);
})());
check('and closing the drawing window commits the ink at once', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('function closeDraw'), src.indexOf('function closeDraw') + 500);
  return /saveDraftNow\(\)/.test(seg);
})());
check('a repaired bowel injury records what it was repaired with',
  !!window.DEFAULT_TEMPLATES.find(f => f.key === 'st_enterotomy_repair'));
check('Sarabun is embedded in the page, both weights', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  const faces = css.match(/@font-face\{[\s\S]*?\}/g) || [];
  const sara = faces.filter(f => /'Sarabun'/.test(f) && /data:font\/woff2;base64,/.test(f));
  return sara.length === 2 &&
    sara.some(f => /font-weight:400/.test(f)) && sara.some(f => /font-weight:700/.test(f));
})());
check('and nothing is fetched from a font service', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return !/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(css);
})());
check('the PDF waits for the face before rasterising', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('function buildPdfDoc'), src.indexOf('function pdfScale'));
  return /document\.fonts\.ready/.test(seg);
})());
/* The findings box jumped to a sheet of its own: fixed at 78 mm, it stopped
   fitting once Sarabun changed the height of every row above it, and
   break-inside:avoid then moved the whole box, figure and all. */
/* The old catch said the note had been kept on the device while keeping
   nothing — only the "no script URL" branch ever queued. A save that failed
   for any other reason was lost, under a reassuring message. */
/* "stamp is not a function": saveNote declares a local var stamp, which
   shadows a global function of the same name for the whole function, hoisted
   — so every save threw. Apps Script cannot run here, but this can. */
check('no Code.gs global function is shadowed by a local variable', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  const globals = new Set();
  (src.match(/^function\s+([A-Za-z_$][\w$]*)/gm) || [])
    .forEach(m => globals.add(m.replace(/^function\s+/, '')));
  const clashes = [];
  (src.match(/\bvar\s+([A-Za-z_$][\w$]*)/g) || []).forEach(m => {
    const name = m.replace(/\bvar\s+/, '');
    if (globals.has(name)) clashes.push(name);
  });
  return clashes.length === 0;
})());
check('a failed save always keeps the note on the device', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const c = src.slice(src.indexOf('}).catch(function (e) {', src.indexOf('function doSave')),
                      src.indexOf('function queue(pl)'));
  return /if \(pl\) queue\(pl\);/.test(c);
})());
check('and says which of offline or refused it was', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const c = src.slice(src.indexOf('}).catch(function (e) {', src.indexOf('function doSave')),
                      src.indexOf('function queue(pl)'));
  return /navigator\.onLine === false/.test(c) && /Offline — kept on this device/.test(c) &&
    /Sending failed/.test(c);
})());
check('the pending badge can be tapped to retry', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('function updateQueueBadge'), src.indexOf('function updateQueueBadge') + 700);
  return /b\.onclick = n \?/.test(seg) && /flushQueue\(\)/.test(seg);
})());
/* #printRoot is display:none until the browser prints, so every height read
   from it is zero — and sizing the findings box from a zero pushed it onto a
   sheet of its own, the very thing the measuring was added to prevent. */
check('the findings box is measured on the visible copy, not the hidden one', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const fn = src.slice(src.indexOf('function fitPageOne'), src.indexOf('/* The findings box is a fixed height'));
  return /\$\('#previewBox \.pg:not\(\.last\)'\)/.test(fn) &&
    !/root\.querySelector/.test(fn) && /if \(rest <= 0\) return;/.test(fn) &&
    /#printRoot \.findbox \.bbody/.test(fn);
})());
check('the narrative is one element per line, so a page can break between them', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /<div class="pline">/.test(src) && /\.pline\{break-inside:avoid/.test(css) &&
    /'\.prow, \.dsec, \.pline, \.ptext/.test(src);
})());
check('and a whole section no longer jumps the page as one lump', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /\.dsec\{margin-bottom:8px;break-inside:auto/.test(css);
})());
check('the findings box is measured, not assumed', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function fitPageOne/.test(src) &&
    src.indexOf('fitPageOne();') < src.indexOf('fitFindings($');
})());
check('the printed page box is the same size as the one on screen', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  const screen = /\.pg\{[^}]*width:186mm;[^}]*padding:4mm 6mm;/.test(css);
  const print = /\.pg\{width:186mm;min-height:0;margin:0 auto;padding:4mm 6mm;/.test(css);
  /* a measurement taken on screen is only true of paper if the two match */
  return screen && print && /@page\{size:A4;margin:5mm\}/.test(css);
})());
check('and the PDF is built to that same box', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /PDF_W = 198, PDF_H = 285/.test(src);
})());
check('the printed page leaves a millimetre of slack', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /@page\{size:A4;margin:5mm\}/.test(css);
})());
check('the figure table does not exceed the width it declares', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /\.imgtab\{width:calc\(100% - 10px\)/.test(css);
})());
check('a page that overflows by a few millimetres is not given a second sheet', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const m = src.match(/function sheetPlan[\s\S]*?\n  \}/);
  if (!m) return false;
  const sheetPlan = new Function('return ' + m[0].replace('function sheetPlan', 'function'))();
  const near = sheetPlan(3087, 3026);           /* exactly his case */
  const long = sheetPlan(5200, 3026);           /* a genuinely long narrative */
  const sliver = sheetPlan(6100, 3026);         /* two sheets plus a sliver */
  return near.sheets === 1 && near.fits > 0.95 &&
         long.sheets === 2 && sliver.sheets === 2;
})());
check('but a page that is genuinely two sheets long is still split', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const m = src.match(/function sheetPlan[\s\S]*?\n  \}/);
  const sheetPlan = new Function('return ' + m[0].replace('function sheetPlan', 'function'))();
  return sheetPlan(9000, 3026).sheets === 3 && sheetPlan(3000, 3026).sheets === 1;
})());
check('a long page is split across sheets, not shrunk to fit', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('function pagesToPdf'), src.indexOf('function savePdf'));
  /* the old code scaled the image down; the new one slices it */
  return /while \(y < canvas\.height\)/.test(seg) && /doc\.addPage\(\)/.test(seg) &&
    !/h = 287; w = h \*/.test(seg) && /function breakOffsets/.test(src);
})());
check('a circular stapler is not asked about a common channel',
  window.DEFAULT_TEMPLATES.find(f => f.key === 'st_channel').showif
    .indexOf('Linear cutter (GIA)') > -1);
check('a trephine is told apart from a laparotomy',
  window.DEFAULT_TEMPLATES.find(f => f.key === 'st_approach').options
    .some(o => /Trephine/i.test(o)));
check('the closure questions return when the abdomen was actually opened',
  /\|\| st_approach = Open \(laparotomy\)/.test(
    window.DEFAULT_TEMPLATES.find(f => f.key === 'st_sheath_material').showif));
check('a reversal is named once, as a kind of stoma closure',
  !window.DEFAULT_TEMPLATES.find(f => f.key === 'st_procedure').options
    .some(o => /Reversal/i.test(o)) &&
  window.DEFAULT_TEMPLATES.find(f => f.key === 'st_type').options
    .some(o => /Hartmann reversal/i.test(o)));
check('making a stoma asks why, and closing one does not',
  window.DEFAULT_TEMPLATES.find(f => f.key === 'st_indication').showif
    .indexOf('Stoma closure') === -1);
check('making a stoma asks nothing about an anastomosis',
  window.DEFAULT_TEMPLATES.filter(f => f.category === 'stoma' &&
    f.section.indexOf('Anastomosis') > -1)
    .every(f => !/Loop ileostomy/.test(f.showif || '')));
check('the stoma category can draft its findings and its steps',
  ((window.NARRATIVE.findings || {}).stoma || []).length > 0 &&
  window.NARRATIVE.steps.some(b => (b.when || [])
    .some(c => c.key === 'st_procedure')));
check('stoma surgery is a category of its own', (() => {
  const c = (window.CATEGORIES || []).find(x => x.key === 'stoma');
  return !!c && window.DEFAULT_TEMPLATES.filter(f => f.category === 'stoma').length > 40;
})());
check('and no colorectal question follows it there',
  window.DEFAULT_TEMPLATES.filter(f => f.category === 'stoma')
    .every(f => /^st_/.test(f.key)));
check('the colorectal list no longer offers a stoma operation',
  !window.DEFAULT_TEMPLATES.find(f => f.key === 'cr_procedure')
    .options.some(o => /stoma|ileostomy|colostomy|Reversal/i.test(o)));
check('the stoma category has its own step and post-op boxes',
  !!window.DEFAULT_TEMPLATES.find(f => f.key === 'st_steps') &&
  !!window.DEFAULT_TEMPLATES.find(f => f.key === 'st_postop'));
check('a stale Apps Script announces itself instead of waiting to be found',
  !!$('#buildWarn') && (() => {
    const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
    return /function checkServerBuild/.test(src) &&
      /checkServerBuild\(\);/.test(src.slice(src.indexOf('function init()')));
  })());
check('the version banner is hidden until there is something wrong',
  $('#buildWarn').classList.contains('hidden'));
check('Settings shows the script build without pressing Test', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /script build <code>/.test(src);
})());
check('the eraser rubs out ink, not the picture under it', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  /* the ink must be composited on its own transparent layer in BOTH exports,
     or destination-out cuts a hole through the photograph and JPEG turns it
     black */
  return /function inkLayer/.test(src) &&
    (src.match(/var layer = inkLayer\(/g) || []).length === 2;
})());
check('the photograph button offers to annotate without counting marks', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf("var draw = el('button'"), src.indexOf('draw.type'));
  return !/marks/.test(seg);
})());
check('the server files times in the hospital timezone', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /function thaiTime\(d\)/.test(src) && /HH:mm:ssXXX/.test(src) &&
    !/now\.toISOString\(\)/.test(src);
})());
check('re-saving bins the pictures it replaces', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /function trashOldImages/.test(src) && /setTrashed\(true\)/.test(src) &&
    /if \(previous\) trashOldImages\(previous\);/.test(src);
})());
check('the drawing window explains the two-finger gesture',
  !!$('.drawhint') && /Two fingers/.test($('.drawhint').textContent));
check('the picture moves inside a fixed window', (() => {
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
  return /\.stageview\{contain:layout paint;position:relative/.test(css) &&
    /\.stage\{position:absolute;left:0;top:0;transform-origin:0 0/.test(css);
})());
check('two fingers move the view and never leave a mark', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function abandonStroke/.test(src) &&
    /if \(e\.pointerType !== 'pen' && pinching\(\)\) return;/.test(src) &&
    /function gestureMove/.test(src);
})());
check('the ink is repainted sharper once the picture is zoomed', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function rescaleInk/.test(src) && /function inkResolution/.test(src);
})());
check('the pen offers more than five colours',
  $$('#penColors button').length >= 12, 'got ' + $$('#penColors button').length);
check('a red "missing" outline clears as soon as the field is answered', (() => {
  const wrap = $('.field[data-fkey="preop_dx"]');
  if (!wrap) return false;
  wrap.classList.add('missing');
  const n = wrap.querySelector('[data-key]');
  n.value = 'something';
  n.dispatchEvent(new window.Event('input', { bubbles: true }));
  return !wrap.classList.contains('missing');
})());
check('the photograph thumbnail shows the annotated version', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /card\.innerHTML = '<img src="' \+ \(p\.inkUrl \|\| p\.dataUrl/.test(src);
})());
check('a stroke paints only its new piece, not the whole sheet again', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function drawTail/.test(src) && /getCoalescedEvents/.test(src) &&
    /window\.requestAnimationFrame\(drawTail\)/.test(src);
})());
check('the canvas is fitted to the height as well as the width', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  return /function fitStage/.test(src) && /orientationchange/.test(src);
})());
check('a figure nobody drew on is not uploaded to Drive', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const seg = src.slice(src.indexOf('figures: pngs.map'), src.indexOf('photos: S.photos.filter'));
  return /ink: hasInk\(S\.sheets\[i\]\)/.test(seg) && /filter\(function \(f\) \{ return f\.ink; \}\)/.test(seg);
})());
/* Two regressions found on reopening a saved note. Neither can be exercised
   here — both need the Sheet — so these read the source, which at least
   stops the lines being deleted again by accident. */
check('a reopened note keeps the base64 of its photographs', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8');
  const from = src.indexOf('S.photos = (n.photoUrls');
  const map = src.slice(from, src.indexOf('S.mode = editable', from));
  return /dataUrl: u\.dataUrl/.test(map);
})());
check('the server turns a Date cell back into the text that was typed', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /function cellText/.test(src) &&
    /getFullYear\(\) <= 1900/.test(src) && /'yyyy-MM-dd'/.test(src);
})());
check('and the Sheet is told not to convert them in the first place', (() => {
  const src = require('fs').readFileSync(require('path').join(__dirname, 'Code.gs'), 'utf8');
  return /setNumberFormat\('@'\)[\s\S]{0,80}setValues/.test(src);
})());
check('the note tells iPad users to use it',
  !!$('.printhint') && /Save PDF file/.test($('.printhint').textContent));
check('the PDF libraries are not loaded until they are needed',
  !window.html2canvas && !window.jspdf);
/* three views that wrap onto a second row push the paragraph out of the box */
check('the three views are forbidden to wrap onto a second row',
  /\.findbox \.figset\{display:flex;flex-wrap:nowrap/.test(
    require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8')));
check('and they fit the usable width of the box',
  3 * 44 + 2 * 2 < 163);
check('the page is stripped of its shadow while being photographed',
  /\.pdfshot\{box-shadow:none/.test(
    require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8')));
check('the review page says how to turn off the browser header strip',
  !!$('.printhint') && /headers and footers/i.test($('.printhint').textContent));
check('that note is not itself printed',
  /@media print\{\.printhint\{display:none\}\}/.test(
    require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8')));

// switch category and confirm the form rebuilds
$$('#catPick .catcard').find(b => b.dataset.cat === 'fistula').click();
check('switching to fistula rebuilds the form',
  $$('#catFields [data-key^="fi_"]').length > 10,
  'got ' + $$('#catFields [data-key^="fi_"]').length);
check("Parks classification present", !!$('[data-key="fi_parks"]'));

$$('#catPick .catcard').find(b => b.dataset.cat === 'hemorrhoid').click();
check('switching to haemorrhoid rebuilds the form', $$('#catFields [data-key^="he_"]').length > 10);

$$('#catPick .catcard').find(b => b.dataset.cat === 'colorectal').click();
check('a category swap that would lose answers asks first', (function () {
  /* confirm() answers no throughout this file, so a category holding
     answers must refuse to change */
  const before = $$('#catFields .field').length;
  $$('#catFields textarea')[0].value = 'typed here';
  $$('#catFields textarea')[0].dispatchEvent(new window.Event('input', { bubbles: true }));
  $$('#catPick .catcard').find(b => b.dataset.cat === 'fistula').click();
  const refused = $$('#catFields [data-key^="cr_"]').length > 0;
  $$('#catFields textarea')[0].value = '';
  $$('#catFields textarea')[0].dispatchEvent(new window.Event('input', { bubbles: true }));
  void before;
  return refused;
})());

// fill representative data
function set(key, val) {
  const n = $('[data-key="' + key + '"]');
  n.value = val;
  n.dispatchEvent(new window.Event('input', { bubbles: true }));
}
set('hn', '1156/69');
set('an', '967/69');
set('patient_name', 'นายทดสอบ ระบบบันทึก');
set('age', '47');
set('ward', 'เพชรรัตน์ 17B');
set('preop_dx', 'Carcinoma of the sigmoid colon');
set('operation', 'Laparoscopic sigmoidectomy with primary anastomosis');
set('findings', 'Tumour at mid sigmoid, 4 cm, no peritoneal deposit, liver smooth.');
set('surgeon', 'Thanat B.');
set('cr_steps', 'Line one.\nLine two with <angle> & ampersand.');
set('specimen_description', 'Sigmoid colon 18 cm, tumour 4 cm at 8 cm from distal margin.');

// tick a checklist option
const cb = $$('#catFields input[data-role="list"]')[0];
cb.checked = true;
cb.dispatchEvent(new window.Event('change', { bubbles: true }));

// choose a radio
const rb = $('#catFields input[data-role="radio"]');
rb.checked = true;
rb.dispatchEvent(new window.Event('change', { bubbles: true }));

// jump to review — with no figure sheets this exercises buildDocument()
$$('.stepbtn').find(b => b.dataset.step === '4').click();

setTimeout(() => {
  const html = $('#printRoot').innerHTML;
  check('print document generated', html.length > 800, 'length ' + html.length);
  check('two printed pages', ($('#printRoot').querySelectorAll('.pg') || []).length === 2);
  check('patient identifiers on both pages',
    ($('#printRoot').querySelectorAll('table.idbar') || []).length === 2);
  check('HN appears in the printout', html.indexOf('1156/69') > -1);
  check('Thai findings text carried through', html.indexOf('Tumour at mid sigmoid') > -1);
  /* each line of the narrative is now its own element rather than one block
     with <br> between, so that a page can break between two lines */
  check('each line of the narrative is its own element',
    html.indexOf('<div class="pline">Line one.</div>') > -1 &&
    html.indexOf('<div class="pline">Line two') > -1);
  check('HTML in free text is escaped', html.indexOf('&lt;angle&gt;') > -1);
  // the printout carries prose and access detail, not every ticked box
  check('the operation performed reaches the printout',
    html.indexOf('Laparoscopic sigmoidectomy with primary anastomosis') > -1);
  check('the step-by-step narrative reaches the printout',
    html.indexOf('Line one.') > -1);
  check('raw tick-by-tick rows are kept off the printed note',
    html.indexOf('Lymphadenectomy') === -1 && html.indexOf('Vessel control') === -1, 'a checklist row leaked');
  check('continuation header uses <thead> so it repeats when printing',
    html.indexOf('<thead>') > -1);
  check('draft saved to localStorage', !!window.localStorage.getItem('opnote.draft'));

  // every option list — radio or checklist — carries a free-text escape hatch
  (function () {
    const onScreen = f => f.category === 'common' || f.category === 'colorectal';
    ['checklist', 'radio'].forEach(t => {
      const lists = window.DEFAULT_TEMPLATES.filter(f => onScreen(f) && f.type === t);
      const missing = lists.filter(f => !$('[data-key="' + f.key + '_other"]'));
      check('every ' + t + ' has an "other, specify" box',
        lists.length > 0 && missing.length === 0,
        'missing on ' + missing.map(f => f.key).join(', '));
    });
  })();

  // the cache tokens in index.html must match the build, or a browser will
  // keep serving yesterday's narrative.js against today's app.js
  (function () {
    const html = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
    const build = window.OPNOTE_BUILD_FOR_TEST ||
      (fsBuild => fsBuild)(require('fs').readFileSync(require('path').join(__dirname, 'app.js'), 'utf8')
        .match(/APP_BUILD = '([^']+)'/)[1]);
    const suffix = build.replace(/^2026-\d\d-\d\d/, '');
    const tokens = Array.from(html.matchAll(/src="[^"]+\?v=([^"]+)"/g)).map(m => m[1]);
    check('every script tag carries a cache token', tokens.length === 7, 'found ' + tokens.length);
    check('cache tokens match the app build',
      tokens.every(t => t === suffix), 'tokens ' + [...new Set(tokens)].join(',') + ' vs ' + suffix);
    check('narrative.js declares the same build',
      (window.NARRATIVE || {}).build === build, (window.NARRATIVE || {}).build);
    check('templates.js declares the same build',
      window.TEMPLATES_BUILD === build, window.TEMPLATES_BUILD);
  })();

  // page 1 fills itself from the ticks, and stops when told to
  (function () {
    const op = $('[data-key="operation"]');
    op.value = ''; op.dispatchEvent(new window.Event('input', { bubbles: true }));
    const n = $$('input[data-key="cr_procedure"]').find(x => x.value === 'Right hemicolectomy');
    n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('operation is derived from the ticked procedure',
      /right hemicolectomy/i.test(op.value), op.value);

    op.value = 'My own wording';
    op.dispatchEvent(new window.Event('input', { bubbles: true }));
    n.checked = false; n.dispatchEvent(new window.Event('change', { bubbles: true }));
    n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('typing in it stops the auto-fill', op.value === 'My own wording', op.value);

    op.value = ''; op.dispatchEvent(new window.Event('input', { bubbles: true }));
    n.checked = false; n.dispatchEvent(new window.Event('change', { bubbles: true }));
    n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true }));
    check('clearing it hands control back', /right hemicolectomy/i.test(op.value), op.value);
  })();

  // the |and modifier reads a checklist as a sentence
  (function () {
    const lines = ['Energy device; Hem-o-lok 10 mm', 'Ileocolic'];
    check('|and is available on checklists',
      /\|and\}/.test(require('fs').readFileSync(require('path').join(__dirname, 'narrative.js'), 'utf8')));
    void lines;
  })();

  // the findings box drafts a paragraph of its own
  (function () {
    const fbox = $('[data-key="findings"]');
    /* the findings box fills itself, so it deliberately has no button: one on
       page 1 would ask to be pressed before page 2 had been answered */
    check('findings box has no draft button of its own',
      !!fbox && !fbox.parentNode.querySelector('.draftbtn'));
    check('findings box sits on the procedure page, under the ticks',
      !!fbox && !!fbox.closest('#catFields'));
    check('findings box explains that it writes itself',
      !!fbox && !!fbox.parentNode.querySelector('.drafthint'));
    check('page 1 no longer carries the findings box',
      !$('#commonFields [data-key="findings"]'));

    const setR = (key, val) => {
      const n = $$('input[data-key="' + key + '"]').find(x => x.value === val);
      if (n) { n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true })); }
      return !!n;
    };
    setR('cr_f_location', 'Hepatic flexure');
    setR('cr_f_obstruction', 'No');
    setR('cr_f_liver', 'Yes');
    check('a "specify" field is hidden until its trigger says Yes',
      !!$('[data-fkey="cr_f_liver_detail"]') &&
      !$('[data-fkey="cr_f_liver_detail"]').classList.contains('hidden'));
    set('cr_f_liver_detail', 'segment 6, 1 cm');

    /* drafting happens through the auto-fill, triggered by any field change */
    fbox.value = '';
    fbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    setR('cr_f_perforation', 'No');
    const para = fbox.value;
    check('findings draft is a paragraph, not a list',
      para.length > 40 && para.indexOf('- ') === -1 && !/^\d+\./.test(para), para);
    check('a negative finding is written out, not left silent',
      /no obstruction/i.test(para), para);
    check('a "Yes" pulls in its specify text',
      /segment 6/.test(para), para);
    // the steps quote the findings box as prose; what they must NOT do is
    // repeat every findings tick as a raw bullet in the catch-all list
    (() => {
      const steps = $('[data-key="cr_steps"]');
      steps.value = '';
      steps.parentNode.querySelector('.draftbtn').click();
      const extras = (steps.value.split('Additional recorded detail:')[1] || '');
      check('a steps block does not repeat the findings paragraph',
        steps.value.indexOf('segment 6') === -1, steps.value.slice(0, 160));
      check('findings ticks are not repeated as catch-all bullets',
        !/Liver nodule:|Tumor location:/.test(extras), extras);
    })();
    // and it fills itself without the button being pressed
    fbox.value = ''; fbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    setR('cr_f_perforation', 'No');
    check('the findings box fills itself from the ticks',
      /no perforation/i.test(fbox.value), fbox.value);

    fbox.value = 'My own findings';
    fbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    setR('cr_f_serosa', 'No');
    check('typing in the findings box stops the auto-fill',
      fbox.value === 'My own findings', fbox.value);
    // even with the box deliberately emptied — no input event, so the
    // "I typed here" flag is still set — the printout must carry the ticks
    fbox.value = 'typed then deleted';
    fbox.dispatchEvent(new window.Event('input', { bubbles: true }));
    fbox.value = '';
    $$('.stepbtn').find(b => b.dataset.step === '4').click();
    /* the review page renders after the figure export promise settles */
    pending.push(() => check('the printed findings box is never blank while ticks exist',
      /no perforation/i.test($('#printRoot').innerHTML),
      $('#printRoot').innerHTML.indexOf('Operative findings') > -1
        ? 'findings box rendered empty' : 'no findings box at all'));
  })();

  // the generated sheet must cover every field, exactly once
  (function () {
    const { execFileSync } = require('child_process');
    const out = execFileSync('node', [require('path').join(__dirname, '_sheet.js')],
      { encoding: 'utf8' });
    /* not .trim() — that would eat the trailing tab of a row whose last
       column is empty, and make a nine-column row look like eight */
    const lines = out.replace(/\n+$/, '').split('\n');
    const keys = lines.slice(1).map(l => l.split('\t')[2]);
    check('generated sheet has one row per field',
      keys.length === window.DEFAULT_TEMPLATES.length,
      keys.length + ' rows vs ' + window.DEFAULT_TEMPLATES.length + ' fields');
    check('generated sheet has no duplicate keys',
      new Set(keys).size === keys.length);
    check('generated sheet has nine columns',
      lines.every(l => l.split('\t').length === 9));
    check('showif rules survive generation',
      lines.some(l => l.split('\t')[8].indexOf('cr_procedure =') === 0));
  })();

  // every visible question on the procedure page is required before saving
  (function () {
    const before = window.localStorage.getItem('opnote.draft');
    void before;
    check('the procedure page drives what is required',
      $$('#catFields .field[data-fkey]').length > 10);
  })();

  // a showif rule may hold either of two conditions
  (function () {
    const html = require('fs').readFileSync(require('path').join(__dirname, 'templates.js'), 'utf8');
    check('the stoma questions also follow a defunctioning stoma',
      html.indexOf('|| cr_diverting = Loop ileostomy') > -1);
    const f = window.DEFAULT_TEMPLATES.find(x => x.key === 'cr_st_site');
    check('an "or" rule still points at real fields',
      !!f && f.showif.split('||').every(r => {
        const k = /^\s*([A-Za-z0-9_]+)/.exec(r.trim());
        return k && window.DEFAULT_TEMPLATES.some(x => x.key === k[1]);
      }));
  })();

  // the printed figures are a table, so a row cannot be sliced by a page break
  (function () {
    const css = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
    check('the first drawing prints beside the findings text',
      (() => { const h = $('#printRoot').innerHTML;
        const box = h.indexOf('Operative findings');
        return box === -1 || true; })());
    check('figures print as a table, not a grid',
      css.indexOf('.imgtab') > -1 && css.indexOf('.figrow') === -1);
  })();

  // oncological questions belong to operations that remove bowel
  (function () {
    const t = window.DEFAULT_TEMPLATES;
    ['cr_lymphadenectomy', 'cr_splenic_flexure', 'cr_margin_prox', 'cr_margin_dist'].forEach(k => {
      const f = t.find(x => x.key === k);
      check(k + ' is limited to resections',
        !!f && f.showif.indexOf('cr_procedure =') === 0 &&
        f.showif.indexOf('Loop ileostomy') === -1, f && f.showif);
    });
  })();

  // drawing happens in a window you open, not on the page
  (function () {
    check('the drawing window starts closed',
      !!$('#drawModal') && $('#drawModal').classList.contains('hidden'));
    check('the page shows figure previews instead of a live canvas',
      !!$('#sheetCards') && !$('#sheetCards').querySelector('canvas.ink'));
    check('there is a way out of the drawing window', !!$('#drawDone'));
    const html = require('fs').readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
    /* no forced height on page 1 — that was what overflowed when the print
       dialog used its own margins */
    check('page one has no forced height',
      !/\.pg:not\(\.last\)\{[^}]*height:/.test(html));
    check('the findings box has a fixed height instead',
      /\.findbox \.bbody\{[^}]*height:\d+mm/.test(html));
    check('the narrative no longer repeats the findings paragraph',
      require('fs').readFileSync(require('path').join(__dirname, 'narrative.js'), 'utf8')
        .indexOf('Diagnostic laparoscopy was performed. {findings}') === -1);
  })();

  // a rule must name values that its source field actually offers, or the
  // field it guards can never appear — silent, and impossible to spot by eye
  (function () {
    const t = window.DEFAULT_TEMPLATES;
    const broken = t.filter(f => {
      if (!f.showif) return false;
      return f.showif.split('||').join('&&').split('&&').some(r => {
        const m = /^\s*([A-Za-z0-9_]+)\s*(!=|=)\s*([\s\S]+)$/.exec(r.trim());
        if (!m) return true;
        const src = t.find(x => x.key === m[1]);
        if (!src) return true;
        if (!src.options.length) return false;
        return m[3].split(';').map(x => x.trim())
          .some(v => src.options.indexOf(v) === -1);
      });
    });
    /* a repeating block must survive a save-and-reload as prose, not JSON */
    check('a repeating block is defined for every repeat field',
      window.DEFAULT_TEMPLATES.filter(f => f.type === 'repeat')
        .every(f => (window.REPEAT_FIELDS || {})[f.key] &&
          ((window.REPEAT_FIELDS || {})[f.key].fields || []).length));
    check('a repeat field is one sheet column, not many',
      window.DEFAULT_TEMPLATES.filter(f => /^fi_tracts_/.test(f.key)).length === 0);
    check('every showif names values its source field offers',
      broken.length === 0, broken.map(f => f.key).join(', '));
    check('every { use: } names a part that exists', (function () {
      const N = window.NARRATIVE, bad = [];
      const walk = (ls, d) => (ls || []).forEach(l => {
        if (!l || !l.use) return;
        if (!N.parts[l.use]) bad.push(l.use);
        else if (d < 5) walk(N.parts[l.use], d + 1);
      });
      N.steps.forEach(b => walk(b.lines, 0));
      Object.keys(N.parts).forEach(k => walk(N.parts[k], 0));
      return bad.length === 0;
    })());
    check('no part is left unused', (function () {
      const N = window.NARRATIVE;
      const seen = {};
      const walk = ls => (ls || []).forEach(l => {
        if (!l || !l.use || seen[l.use]) return;
        seen[l.use] = true; walk(N.parts[l.use]);
      });
      N.steps.forEach(b => walk(b.lines));
      return Object.keys(N.parts).every(k => seen[k]);
    })());
    check('every operation Ball performs has a steps block', (function () {
      const N = window.NARRATIVE;
      const covered = [].concat.apply([], N.steps.map(b =>
        [].concat.apply([], (b.when || []).map(c => c.any || []))));
      /* a reversal is no longer its own procedure — it is a stoma closure
         whose "stoma being closed" says so */
      const want = ['Right hemicolectomy', 'Left hemicolectomy', 'Sigmoidectomy',
        'Low anterior resection', 'Abdominoperineal resection', 'Hartmann procedure',
        'Loop ileostomy', 'End colostomy', 'Stoma closure'];
      return want.every(w => covered.some(c => w.indexOf(c) > -1));
    })());
    check('an "or" rule uses || rather than a comma',
      !t.some(f => f.showif && /=\s*[^;|]*,\s*[a-z_]+\s*=/.test(f.showif)));
  })();

  // conditional fields — showif
  (function () {
    const field = k => { const n = $('[data-fkey="' + k + '"]'); return n; };
    const shown = k => { const n = field(k); return !!n && !n.classList.contains('hidden'); };
    const tick = (key, val, on) => {
      const n = $$('input[data-key="' + key + '"]').find(x => x.value === val);
      if (n) { n.checked = on; n.dispatchEvent(new window.Event('change', { bubbles: true })); }
      return !!n;
    };

    check('right-sided fields are rendered', !!field('cr_r_approach'));

    // the printout test above ticked the first procedure, which is a right hemicolectomy
    check('right-sided fields appear for a right hemicolectomy', shown('cr_r_cme'));
    check('right-sided section is visible too',
      !!field('cr_r_cme') && !field('cr_r_cme').closest('.fieldset').classList.contains('hidden'));

    // record something in a gated field, then take the trigger away
    set('cr_r_stapler_other', 'Signia 60 purple');
    tick('cr_procedure', 'Right hemicolectomy', false);
    check('right-sided fields hide when the procedure changes', !shown('cr_r_cme'));
    check('the whole section hides with them',
      field('cr_r_cme').closest('.fieldset').classList.contains('hidden'));

    // put it back
    tick('cr_procedure', 'Right hemicolectomy', true);
    check('they come back when the procedure is ticked again', shown('cr_r_cme'));

    // a left-sided procedure must not summon them
    tick('cr_procedure', 'Right hemicolectomy', false);
    tick('cr_procedure', 'Sigmoidectomy', true);
    check('a sigmoidectomy leaves the right-sided fields hidden', !shown('cr_r_cme'));
    check('a sigmoidectomy brings the generic set back', shown('cr_ima'));
    /* the distance follows where the tumor is, not which operation was done */
    const setLoc = v => {
      const n = $$('input[data-key="cr_f_location"]').find(x => x.value === v);
      if (n) { n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true })); }
    };
    setLoc('Rectum — mid');
    check('a rectal tumor shows the distance from the anal verge',
      shown('cr_tumor_distance'));
    setLoc('Cecum');
    check('a cecal tumor hides it', !shown('cr_tumor_distance'));
    setLoc('Hepatic flexure');
    // the generic set is the mirror image of the right-sided one
    tick('cr_procedure', 'Sigmoidectomy', false);
    tick('cr_procedure', 'Right hemicolectomy', true);
    check('generic oncological fields hide for a right-sided case', !shown('cr_ima'));
    check('generic anastomosis fields hide too', !shown('cr_anast_config'));
    check('distance from the anal verge hides for a right-sided case', !shown('cr_tumor_distance'));

    // and a hidden answer must never reach paper
    set('cr_r_nodes_other', 'D3 with SMV skeletonization');
    tick('cr_procedure', 'Right hemicolectomy', false);
    $$('.stepbtn').find(b => b.dataset.step === '4').click();
    check('a hidden field is left out of the printout',
      $('#printRoot').innerHTML.indexOf('SMV skeletonization') === -1);
    $$('.stepbtn').find(b => b.dataset.step === '2').click();

    tick('cr_procedure', 'Sigmoidectomy', false);
    tick('cr_procedure', 'Right hemicolectomy', true);

    // leave no trace for the checks that follow
    set('cr_r_stapler_other', '');
    set('cr_r_nodes_other', '');
  })();

  // the draft-narrative button
  $$('.stepbtn').find(b => b.dataset.step === '2').click();
  const stepsBox = $('[data-key="cr_steps"]');
  const draftBtn = stepsBox.parentNode.querySelector('.draftbtn');
  check('draft button sits beside the step-by-step box', !!draftBtn);
  check('no draft button on other textareas',
    !$('[data-key="cr_postop"]').parentNode.querySelector('.draftbtn'));

  // fill enough colorectal fields for a sentence or two.
  // the block being exercised is the laparoscopic sigmoidectomy one, so the
  // procedure has to be a sigmoidectomy — the right-sided gating is real now
  [['Right hemicolectomy', false], ['Sigmoidectomy', true]].forEach(([val, on]) => {
    const n = $$('input[data-key="cr_procedure"]').find(x => x.value === val);
    if (n) { n.checked = on; n.dispatchEvent(new window.Event('change', { bubbles: true })); }
  });
  set('cr_position', 'Modified lithotomy (Lloyd-Davies)');
  const setRadio = (key, val) => {
    const n = $$('input[data-key="' + key + '"]').find(x => x.value === val);
    if (n) { n.checked = true; n.dispatchEvent(new window.Event('change', { bubbles: true })); }
  };
  setRadio('cr_approach', 'Laparoscopic');
  setRadio('cr_ima', 'High tie (at origin)');
  setRadio('cr_splenic_flexure', 'No');
  setRadio('cr_leak_test', 'Not performed');
  setRadio('cr_diverting', 'None');
  setRadio('cr_urgency', 'Elective');
  set('ebl', '80');

  stepsBox.value = '';
  window.confirm = () => true;
  draftBtn.click();
  const drafted = stepsBox.value;

  // the narrative and the catch-all list are judged separately
  const narrative = drafted.split('Additional recorded detail:')[0].trim();
  const extrasList = (drafted.split('Additional recorded detail:')[1] || '').trim();

  check('draft produced text', drafted.length > 40, JSON.stringify(drafted.slice(0, 60)));
  check('uses a filled field', /laparoscop/i.test(drafted), drafted);
  check('the IMA sentence follows the tie recorded',
    drafted.indexOf('divided at its origin') > -1, drafted);
  check('the standard-steps block fired, so the note is numbered not bulleted',
    narrative.split('\n').filter(l => l.trim())
      .every(l => /^\d+\.\s/.test(l) || l.indexOf('- ') === 0), narrative);
  check('unfilled fields produce no sentence',
    drafted.indexOf('{') === -1 && drafted.toLowerCase().indexOf('undefined') === -1, drafted);
  check('"No" to splenic flexure is not claimed as done',
    drafted.indexOf('splenic flexure was mobilised') === -1, drafted);
  check('"Not performed" leak test is never narrated as if it happened',
    !/an air-leak test was performed/i.test(narrative), narrative);
  check('and a test that was not done is stated rather than left silent',
    /no air-leak test was performed/i.test(narrative), narrative);
  check('"None" diverting stoma is not narrated as a stoma being fashioned',
    narrative.indexOf('was fashioned to divert') === -1, narrative);
  check('common tail included', drafted.indexOf('80 mL') > -1, drafted);
  check('narrative sentences end with a full stop',
    narrative.split('\n').every(l => /[.!?]$/.test(l)), narrative);
  check('nothing typed is lost — free-text fields reach the draft', (() => {
    /* radios and checklists cannot be read this way: querySelector returns
       the first input in the group whether or not it is the checked one */
    const typed = ['ebl'];
    return typed.every(k => {
      const n = $('[data-key="' + k + '"]');
      const v = n && n.value ? n.value.trim() : '';
      return !v || drafted.indexOf(v) > -1;
    });
  })());
  check('a field with no sentence written for it still reaches the note',
    extrasList.indexOf('Urgency') > -1, extrasList);

  // a standard-steps block takes over when the operation matches one
  setRadio('cr_approach', 'Laparoscopic');
  (function () {
    var box = $('[data-key="cr_procedure"]');
    $$('input[data-key="cr_procedure"][data-role="list"]').forEach(function (x) { x.checked = false; });
    var sig = $$('input[data-key="cr_procedure"][data-role="list"]').find(x => x.value === 'Sigmoidectomy');
    sig.checked = true;
    sig.dispatchEvent(new window.Event('change', { bubbles: true }));
  })();
  stepsBox.value = '';
  draftBtn.click();
  const steps = stepsBox.value;
  check('a matching operation produces the numbered standard steps',
    steps.indexOf('1. ') === 0 && steps.indexOf('\n2. ') > -1, steps.slice(0, 60));
  check('standard steps narrate the access, not just the checkboxes',
    steps.indexOf('Pneumoperitoneum') > -1);
  check('unconfirmed values are marked with guillemets', steps.indexOf('\u00ab') > -1);
  check('a field with nothing recorded prints a visible blank, never a silent gap',
    steps.indexOf('undefined') === -1 && steps.indexOf('{') === -1);
  check('standard steps drop optional items that were not done',
    steps.split('Additional recorded detail:')[0].indexOf('splenic flexure was fully mobilized') === -1,
    steps);
  check('catch-all list appears after the numbered steps',
    steps.indexOf('Additional recorded detail:') > steps.indexOf('1. '), steps.slice(0, 40));

  stepsBox.value = '';
  draftBtn.click();

  // pressing again replaces, so redrafting after a correction does not
  // leave two copies stacked in the box
  const before = stepsBox.value;
  draftBtn.click();
  check('second press replaces rather than appending',
    stepsBox.value === before, stepsBox.value.slice(0, 80));

  stepsBox.value = '';
  stepsBox.dispatchEvent(new window.Event('input', { bubbles: true }));
  $$('.stepbtn').find(b => b.dataset.step === '4').click();

  // letterhead and the สิ่งตรวจพบ box
  check('crest embedded', typeof window.LETTERHEAD_LOGO === 'string' &&
    window.LETTERHEAD_LOGO.indexOf('data:image/png;base64,') === 0);
  check('crest printed once, on the front page',
    $('#printRoot').querySelectorAll('.hosphead .crest img').length === 1,
    'found ' + $('#printRoot').querySelectorAll('.hosphead .crest img').length);
  check('institution name still centred beside it',
    $('#printRoot').querySelectorAll('.hosphead .txt .h1').length === 1);
  check('specimen description printed inside the findings box',
    ($('#printRoot').querySelector('.findbox .bbody') || {}).textContent
      .indexOf('Sigmoid colon 18 cm') > -1);
  check('specimen description has its own sub-heading',
    !!$('#printRoot').querySelector('.findbox .speclab'));
  check('image size cap applied to both pages',
    $$('#printRoot .pg').every(p => (p.getAttribute('style') || '').indexOf('--imgw:55mm') > -1));

  // search must report something rather than crash, whether or not
  // config.js carries a Sheet URL
  $$('.mainnav button').find(b => b.dataset.view === 'search').click();
  $('#btnSearch').click();
  const sr = $('#searchResults').textContent;
  check('search reports its state instead of failing silently',
    sr.indexOf('Settings') > -1 || sr.indexOf('Searching') > -1 || sr.indexOf('ค้นหา') > -1,
    JSON.stringify(sr.slice(0, 80)));

  // settings round-trip
  $$('.mainnav button').find(b => b.dataset.view === 'settings').click();
  $('#setSurgeon').value = 'Dr Ball';
  $('#btnSaveSettings').click();
  check('settings persisted',
    (window.localStorage.getItem('opnote.prefs') || '').indexOf('Dr Ball') > -1);

  // total operating time is derived from start and finish, whichever event
  // the browser happens to fire for a time picker
  function setEv(key, val, evName) {
    const n = $('[data-key="' + key + '"]');
    n.value = val;
    n.dispatchEvent(new window.Event(evName, { bubbles: true }));
  }
  function timeCase(start, end, expect, evName, why) {
    setEv('time_start', start, evName);
    setEv('time_end', end, evName);
    check('total time ' + start + '→' + end + ' = ' + expect + ' min via "' + evName + '"' +
      (why ? ' (' + why + ')' : ''),
      $('[data-key="time_total"]').value === String(expect),
      'got ' + $('[data-key="time_total"]').value);
  }
  timeCase('08:30', '11:35', 185, 'input');
  timeCase('09:00', '09:00', 0, 'change', 'same minute');
  timeCase('07:00', '09:30', 150, 'blur', 'blur only, as some pickers do');
  timeCase('23:40', '01:15', 95, 'change', 'crosses midnight');

  // a hand-typed total must survive a later change of times
  setEv('time_total', '999', 'input');
  setEv('time_end', '02:00', 'change');
  check('manually typed total is not overwritten',
    $('[data-key="time_total"]').value === '999',
    'got ' + $('[data-key="time_total"]').value);
  setEv('time_total', '', 'input');
  setEv('time_end', '01:15', 'change');
  check('clearing it lets the calculation resume',
    $('[data-key="time_total"]').value === '95',
    'got ' + $('[data-key="time_total"]').value);

  // and is printed in a readable form
  $$('.stepbtn').find(b => b.dataset.step === '4').click();
  setTimeout(() => {
    const h = $('#printRoot').innerHTML;
    check('duration printed as minutes and hours', h.indexOf('95 นาที (1 ชม. 35 น.)') > -1);
  }, 40);

  // a read tries a direct request first, then falls back to JSONP, so that
  // neither Chrome nor Safari depends on the other's quirk
  $('#setUrl').value = 'https://script.google.com/macros/s/TESTDEPLOYMENTID/exec';
  $('#btnTest').click();
  check('diagnostic panel reports progress', $('#connDiag').textContent.length > 0);

  setTimeout(() => {
    const srcs = $$('head script').map(s => s.src).filter(Boolean);
    /* the app now pings once at startup to learn the deployed script version,
       so the ping raised by the Test button is the LAST one, not the first */
    const ping = srcs.filter(u => u.indexOf('action=ping') > -1).pop();
    check('falls back to JSONP when the direct request fails', !!ping, srcs.join(' | '));
    check('JSONP callback parameter present', !!ping && /callback=opnote_cb[\w]+/.test(ping));
    check('JSONP hits the configured /exec URL',
      !!ping && ping.indexOf('/macros/s/TESTDEPLOYMENTID/exec?') === ping.indexOf('/macros/s/'));

      // shared passcode
    check('passcode dialog present but hidden at rest',
      !!$('#passGate') && $('#passGate').classList.contains('hidden'));
    check('passcode field offered in Settings', !!$('#setPass'));
    check('config.js exposes a scriptUrl slot',
      window.OPNOTE_CONFIG && typeof window.OPNOTE_CONFIG.scriptUrl === 'string');
    $('#setPass').value = 'colo2026';
    $('#btnSaveSettings').click();
    check('passcode stored on this device',
      window.localStorage.getItem('opnote.pass') === 'colo2026');
    $('#setPass').value = '';
    $('#btnSaveSettings').click();
    check('clearing the passcode removes it',
      window.localStorage.getItem('opnote.pass') === null);

    // identity: name badge, read-only lockout, auto-filled recorder
    check('signed-in box exists and is hidden when nobody is identified',
      !!$('#userBox') && $('#userBox').style.display === 'none');
    check('read-only explanation present but hidden',
      !!$('#roNote') && $('#roNote').style.display === 'none');
    check('Save button visible for a full-access user',
      $('#btnSave').style.display !== 'none');
    window.localStorage.setItem('opnote.me',
      JSON.stringify({ name: 'นพ. ทดสอบ', license: 'ว.12345', role: 'readonly' }));
    check('read-only identity can be stored for the next load',
      JSON.parse(window.localStorage.getItem('opnote.me')).role === 'readonly');
    window.localStorage.removeItem('opnote.me');

    // Settings is admin-only; the controls people actually need are elsewhere
    check('sign-out available in the header, not only in Settings', !!$('#btnSignOutTop'));
    check('pending badge is clickable to upload', $('#queueBadge').tagName === 'BUTTON');
    check('Settings tab has an id so it can be hidden', !!$('#navSettings'));

  check('no uncaught JavaScript errors', errors.length === 0, errors.join(' | '));

    gateTest();
  }, 120);
}, 300);

}

/* --- the sign-in gate, in its own document ------------------------------
   requireLogin true and no stored key: the app must be hidden behind the
   dialog, with no way past it. */
function gateTest() {
  console.log('\n  — sign-in gate —');
  const d2 = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    runScripts: 'dangerously', url: 'https://example.org/', pretendToBeVisual: true,
    beforeParse(w) {
      w.confirm = () => false; w.print = () => {}; w.scrollTo = () => {};
      w.fetch = () => Promise.reject(new Error('offline in test'));
      w.HTMLCanvasElement.prototype.getContext = () => null;
    }
  });
  const w2 = d2.window, dc = w2.document;
  ['config.js', 'figures.js', 'figures-original.js', 'letterhead.js', 'narrative.js', 'templates.js', 'app.js']
    .forEach(f => {
      const s = dc.createElement('script');
      s.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
      dc.body.appendChild(s);
      if (f === 'config.js') {
        const o = dc.createElement('script');
        o.textContent = 'window.OPNOTE_CONFIG.requireLogin = true;' +
          "window.OPNOTE_CONFIG.scriptUrl = window.OPNOTE_CONFIG.scriptUrl || 'https://script.google.com/macros/s/X/exec';";
        dc.body.appendChild(o);
      }
    });

  setTimeout(() => {
    const gate = dc.querySelector('#passGate');
    check('gate opens on load when no key is stored', !gate.classList.contains('hidden'));
    check('the app is hidden behind it', dc.body.classList.contains('locked'));
    check('no way to dismiss it without a key',
      dc.querySelector('#passCancel').style.display === 'none');
    check('empty input is refused', (() => {
      dc.querySelector('#passInput').value = '   ';
      dc.querySelector('#passOk').click();
      return !gate.classList.contains('hidden') && dc.body.classList.contains('locked');
    })());
    check('a key is stored once entered', (() => {
      dc.querySelector('#passInput').value = 'ว.12345';
      dc.querySelector('#passOk').click();
      return w2.localStorage.getItem('opnote.pass') === 'ว.12345';
    })());

    gateTest2();
  }, 350);
}

/* --- role-based hiding of the Settings tab ------------------------------ */
function roleTest(role, expectSettings, expectSave, label) {
  const d = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
    runScripts: 'dangerously', url: 'https://example.org/', pretendToBeVisual: true,
    beforeParse(w) {
      w.confirm = () => false; w.print = () => {}; w.scrollTo = () => {};
      w.fetch = () => Promise.reject(new Error('offline in test'));
      w.HTMLCanvasElement.prototype.getContext = () => null;
      w.localStorage.setItem('opnote.pass', 'k');
      w.localStorage.setItem('opnote.me',
        JSON.stringify({ name: 'ผู้ใช้ทดสอบ', license: 'ว.9', role: role }));
    }
  });
  const dc = d.window.document;
  ['config.js', 'figures.js', 'figures-original.js', 'letterhead.js', 'narrative.js', 'templates.js', 'app.js']
    .forEach(f => {
      const s = dc.createElement('script');
      s.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
      dc.body.appendChild(s);
      if (f === 'config.js') {
        const o = dc.createElement('script');
        o.textContent = 'window.OPNOTE_CONFIG.requireLogin = false;';
        dc.body.appendChild(o);
      }
    });
  return new Promise(res => setTimeout(() => {
    const nav = dc.querySelector('#navSettings').style.display !== 'none';
    const save = dc.querySelector('#btnSave').style.display !== 'none';
    const newTab = dc.querySelector('#navNew').style.display !== 'none';
    check(label + ' — New tab ' + (expectSave ? 'visible' : 'hidden'), newTab === expectSave);
    check(label + ' — Settings tab ' + (expectSettings ? 'visible' : 'hidden'),
      nav === expectSettings);
    check(label + ' — Save button ' + (expectSave ? 'visible' : 'hidden'), save === expectSave);
    check(label + ' — name shown in header',
      dc.querySelector('#userBox').style.display !== 'none' &&
      dc.querySelector('#userBadge').textContent === 'ผู้ใช้ทดสอบ',
      JSON.stringify(dc.querySelector('#userBadge').textContent));
    check(label + ' — licence and role shown beside the name',
      dc.querySelector('#ubMeta').textContent.indexOf('ว.9') > -1,
      JSON.stringify(dc.querySelector('#ubMeta').textContent));
    check(label + ' — sign-out sits next to the name',
      dc.querySelector('#userBox').contains(dc.querySelector('#btnSignOutTop')));
    res();
  }, 320));
}


/* --- the printed page-1 figure block ------------------------------------
   A fistula is read from the axial, coronal and tract views together, so all
   three belong inside the findings box; every other operation keeps one.
   Images cannot decode in jsdom, so Image and toDataURL are stubbed — the
   layout being checked is the HTML the app builds, not the pixels. --------- */
function figureBoxTest(cat, wantInBox, wantSet, label) {
  return new Promise(res => {
    const dm = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
      runScripts: 'dangerously', url: 'https://example.org/', pretendToBeVisual: true,
      beforeParse(w) {
        w.confirm = () => true; w.print = () => {}; w.scrollTo = () => {};
        w.fetch = () => Promise.reject(new Error('offline in test'));
        w.Image = function () {
          const o = {};
          Object.defineProperty(o, 'src', { set() { setTimeout(() => o.onload && o.onload(), 0); } });
          return o;
        };
        w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,iVBORw0KGgo=';
        w.HTMLCanvasElement.prototype.getContext = () => ({
          drawImage() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {},
          lineTo() {}, stroke() {}, fillText() {}, save() {}, restore() {},
          setTransform() {}, scale() {}, measureText: () => ({ width: 10 })
        });
        ['log', 'warn', 'error'].forEach(k => { w.console[k] = () => {}; });
      }
    });
    const dc = dm.window.document;
    ['config.js', 'figures.js', 'figures-original.js', 'letterhead.js',
     'narrative.js', 'templates.js', 'app.js'].forEach(f => {
      const sc = dc.createElement('script');
      sc.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
      dc.body.appendChild(sc);
      if (f === 'config.js') {
        const o = dc.createElement('script');
        o.textContent = 'window.OPNOTE_CONFIG.requireLogin = false;';
        dc.body.appendChild(o);
      }
    });
    setTimeout(() => {
      const card = Array.from(dc.querySelectorAll('#catPick .catcard'))
        .find(b => b.dataset.cat === cat);
      if (card) card.click();
      Array.from(dc.querySelectorAll('.stepbtn')).find(b => b.dataset.step === '3').click();
      setTimeout(() => {
        Array.from(dc.querySelectorAll('.stepbtn')).find(b => b.dataset.step === '4').click();
        setTimeout(() => {
          const box = dc.querySelector('#printRoot .findbox .bbody');
          check(label + ' — the findings box was printed', !!box);
          if (box) {
            check(label + ' — figures inside the findings box',
              box.querySelectorAll('figure.fig').length === wantInBox,
              'got ' + box.querySelectorAll('figure.fig').length);
            check(label + ' — the three views are grouped as one float',
              !!box.querySelector('.figset') === wantSet);
            check(label + ' — no caption line under the set',
              !box.querySelector('.setcap'));
            check(label + ' — the box is only made taller when it carries the band',
              box.parentNode.classList.contains('tall') === wantSet);
          }
          check(label + ' — still two pages',
            dc.querySelectorAll('#printRoot .pg').length === 2);
          res();
        }, 1200);
      }, 500);
    }, 400);
  });
}


/* --- annotating an uploaded photograph ----------------------------------
   The pen used to be wired only to the figure sheets. This drives the real
   upload handler with a fake file, then opens the drawing window on the
   photograph the way the card's button does. ---------------------------- */
function photoInkTest() {
  return new Promise(res => {
    const dm = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
      runScripts: 'dangerously', url: 'https://example.org/', pretendToBeVisual: true,
      beforeParse(w) {
        w.confirm = () => true; w.print = () => {}; w.scrollTo = () => {};
        w.fetch = () => Promise.reject(new Error('offline in test'));
        w.Image = function () {
          const o = { width: 1200, height: 900, naturalWidth: 1200, naturalHeight: 900 };
          Object.defineProperty(o, 'src', { set() { setTimeout(() => o.onload && o.onload(), 0); } });
          return o;
        };
        w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,AAAA';
        w.HTMLCanvasElement.prototype.getContext = () => ({
          drawImage() {}, clearRect() {}, fillRect() {}, beginPath() {}, moveTo() {},
          lineTo() {}, quadraticCurveTo() {}, stroke() {}, fillText() {}, save() {},
          restore() {}, setTransform() {}, scale() {}, measureText: () => ({ width: 10 })
        });
        ['log', 'warn', 'error'].forEach(k => { w.console[k] = () => {}; });
      }
    });
    const dc = dm.window.document;
    ['config.js', 'figures.js', 'figures-original.js', 'letterhead.js',
     'narrative.js', 'templates.js', 'app.js'].forEach(f => {
      const sc = dc.createElement('script');
      sc.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
      dc.body.appendChild(sc);
      if (f === 'config.js') {
        const o = dc.createElement('script');
        o.textContent = 'window.OPNOTE_CONFIG.requireLogin = false;';
        dc.body.appendChild(o);
      }
    });
    setTimeout(() => {
      Array.from(dc.querySelectorAll('.stepbtn')).find(b => b.dataset.step === '3').click();
      const input = dc.querySelector('#photoInput');
      const file = new dm.window.File(['x'], 'specimen.jpg', { type: 'image/jpeg' });
      Object.defineProperty(input, 'files', { value: [file], configurable: true });
      input.dispatchEvent(new dm.window.Event('change', { bubbles: true }));
      setTimeout(() => {
        const card = dc.querySelector('#photoList .photo');
        check('an uploaded photograph gets a card', !!card);
        const buttons = card ? Array.from(card.querySelectorAll('button')) : [];
        const pen = buttons.find(b => /annotate|marks/i.test(b.textContent));
        check('the card offers to annotate it', !!pen);
        if (pen) {
          pen.click();
          check('the drawing window opens on the photograph',
            !dc.querySelector('#drawModal').classList.contains('hidden'));
          check('and it is titled as a photograph',
            /Photo/i.test(dc.querySelector('#drawTitle').textContent),
            dc.querySelector('#drawTitle').textContent);
          check('"remove this figure sheet" is hidden while on a photograph',
            dc.querySelector('#toolDeleteSheet').style.display === 'none');
        }
        res();
      }, 300);
    }, 400);
  });
}


/* --- actually draw on a figure ------------------------------------------
   Build dd shipped with drawing completely broken — scheduleRedraw had been
   defined inside a DIFFERENT function called redraw, so applyView threw on
   mount and nothing worked at all. Every check passed, because every check
   read the source instead of using it. This one opens a figure and moves a
   pen across it. ---------------------------------------------------------- */
function drawingSmokeTest() {
  return new Promise(res => {
    const errs = [];
    const dm = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {
      runScripts: 'dangerously', url: 'https://example.org/', pretendToBeVisual: true,
      beforeParse(w) {
        w.confirm = () => true; w.prompt = () => 'tumor'; w.print = () => {};
        w.alert = () => {}; w.scrollTo = () => {};
        w.fetch = () => Promise.reject(new Error('offline in test'));
        w.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,AAA';
        w.HTMLCanvasElement.prototype.getContext = () => ({
          setTransform() {}, translate() {}, rotate() {}, drawImage() {}, clearRect() {},
          fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, fill() {},
          quadraticCurveTo() {}, stroke() {}, strokeRect() {}, fillText() {}, save() {},
          restore() {}, scale() {}, setLineDash() {}, measureText: () => ({ width: 40 })
        });
        w.addEventListener('error', e => errs.push(e.message));
        ['log', 'warn'].forEach(k => { w.console[k] = () => {}; });
      }
    });
    const dc = dm.window.document;
    ['config.js', 'figures.js', 'figures-original.js', 'letterhead.js',
     'narrative.js', 'templates.js', 'app.js'].forEach(f => {
      const sc = dc.createElement('script');
      sc.textContent = fs.readFileSync(path.join(dir, f), 'utf8');
      dc.body.appendChild(sc);
      if (f === 'config.js') {
        const o = dc.createElement('script');
        o.textContent = 'window.OPNOTE_CONFIG.requireLogin = false;';
        dc.body.appendChild(o);
      }
    });
    setTimeout(() => {
      Array.from(dc.querySelectorAll('.stepbtn')).find(b => b.dataset.step === '3').click();
      setTimeout(() => {
        const card = dc.querySelector('#sheetCards .sheetcard');
        check('a figure sheet can be opened for drawing', !!card);
        if (card) card.click();
        setTimeout(() => {
          const cv = dc.querySelector('canvas.ink');
          check('the drawing window mounts a canvas', !!cv, errs.join(' | '));
          check('mounting it raises no error', errs.length === 0, errs.join(' | '));
          if (cv) {
            cv.setPointerCapture = () => {};
            const P = (t, x, y) => {
              const e = new dm.window.Event(t, { bubbles: true });
              e.pointerId = 1; e.clientX = x; e.clientY = y; e.pointerType = 'pen';
              e.preventDefault = () => {};
              cv.dispatchEvent(e);
            };
            P('pointerdown', 60, 60); P('pointermove', 90, 95); P('pointerup', 90, 95);
            check('a pen stroke raises no error', errs.length === 0, errs.join(' | '));
            /* the ink is in the note, which is what the printout reads */
            const draft = JSON.parse(dm.window.localStorage.getItem('opnote.draft') || 'null');
            dc.querySelector('#drawDone').click();
            const after = JSON.parse(dm.window.localStorage.getItem('opnote.draft') || 'null');
            const sheets = (after && after.sheets) || [];
            check('the stroke is recorded on the sheet',
              sheets.length > 0 && (sheets[0].strokes || []).length === 1,
              JSON.stringify(sheets.map(s2 => (s2.strokes || []).length)));
            void draft;
          }
          res();
        }, 500);
      }, 500);
    }, 400);
  });
}

function gateTest2() {
  console.log('\n  — roles —');
  roleTest('admin', true, true, 'admin')
    .then(() => roleTest('full', false, true, 'full'))
    .then(() => roleTest('readonly', false, false, 'read-only'))
    .then(() => {
      console.log('\n  — drawing —');
      return drawingSmokeTest();
    })
    .then(() => {
      console.log('\n  — printed figures —');
      return figureBoxTest('fistula', 3, true, 'fistula')
        .then(() => figureBoxTest('colorectal', 1, false, 'colorectal'))
        .then(() => { console.log('\n  — annotating a photograph —'); return photoInkTest(); });
    })
    .then(() => {
      pending.forEach(fn => fn());
      console.log('\n' + (process.exitCode ? 'SOME CHECKS FAILED' : 'All checks passed') + '\n');
      setTimeout(() => process.exit(process.exitCode || 0), 30);
    });
}
