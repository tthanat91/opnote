/* =====================================================================
   app.js — Operative Note (บันทึกการผ่าตัด)
   Static front-end. Talks to a Google Apps Script web app that writes
   to your own Google Sheet and Drive folder. Works fully offline for
   filling in and printing; saving queues until the connection returns.
   ===================================================================== */

(function () {
  'use strict';

  /* =================== configuration =================== */

  var LS = {
    url: 'opnote.scriptUrl',
    tpl: 'opnote.templates',
    tplAt: 'opnote.templatesAt',
    draft: 'opnote.draft',
    queue: 'opnote.queue',
    prefs: 'opnote.prefs',
    pass: 'opnote.pass',
    me: 'opnote.me',
    method: 'opnote.method'
  };

  /* config.js ships the Sheet URL with the app so a colleague only has to
     open the link. A device-specific URL in Settings still wins, which is
     how you would point one iPad at a test Sheet. */
  var SITE = window.OPNOTE_CONFIG || {};

  var DEFAULT_PREFS = {
    hospital1: 'คณะแพทยศาสตร์วชิรพยาบาล มหาวิทยาลัยนวมินทราธิราช',
    hospital2: '681 ถนนสามเสน แขวงวชิรพยาบาล เขตดุสิต กรุงเทพฯ 10300  โทรศัพท์ 0-2244-3000  โทรสาร 0-2241-4388',
    formCode: 'MR 08.1  แก้ไขครั้งที่ 00',
    department: 'ศัลยศาสตร์',
    surgeon: '',
    recorder: '',
    showLogo: true,
    imgSize: '55x38',     /* max printed width × height, in millimetres */
    fontSize: '12'        /* printed body text size, in px */
  };

  var EDIT_WINDOW_DAYS = 30;

  /* must match BUILD in Code.gs — lets the app say plainly when an old
     version of the script is still deployed */
  var EXPECTED_BUILD = '2026-08-02l';

  /* Shown in Settings. If this is not the newest value, the browser is
     serving a cached copy of app.js — bump the ?v= tokens in index.html. */
  var APP_BUILD = '2026-08-02bm';

  var prefs = Object.assign({}, DEFAULT_PREFS, readJSON(LS.prefs, {}));
  var scriptUrl = localStorage.getItem(LS.url) || SITE.scriptUrl || '';
  var passcode = localStorage.getItem(LS.pass) || '';
  var me = readJSON(LS.me, null);   /* { name, license, role } once identified */
  var TEMPLATES = readJSON(LS.tpl, null) || window.DEFAULT_TEMPLATES;

  /* =================== state =================== */

  var S = newNote();

  function newNote() {
    return {
      id: null,
      createdAt: null,
      category: 'colorectal',
      data: {},
      sheets: [],
      photos: [],
      active: 0,
      mode: 'new'
    };
  }

  /* =================== tiny helpers =================== */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function readJSON(k, dflt) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; }
  }
  function writeJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* quota */ }
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function uid() {
    return 'ON-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function toast(msg, kind) {
    var t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + (kind || '');
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.className = 'toast'; }, 3600);
  }
  function bilingual(th, en) {
    return '<span class="th">' + esc(th) + '</span><span class="en">' + esc(en) + '</span>';
  }
  function todayISO() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function thaiDate(iso) {
    if (!iso) return '';
    var p = String(iso).split('-');
    if (p.length !== 3) return iso;
    return p[2] + '/' + p[1] + '/' + (parseInt(p[0], 10) + 543);
  }

  /* =================== templates =================== */

  function fieldsFor(cat) {
    return TEMPLATES.filter(function (f) { return f.category === cat; });
  }
  function fieldByKey(key) {
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].key === key) return TEMPLATES[i];
    return null;
  }

  /* The categories come from whatever appears in the Templates tab, so
     typing a new category name in the Sheet creates a new card in the app.
     Known keys keep their bilingual labels; unknown ones show the raw key
     until a label is added to templates.js. */
  function categoryList() {
    var known = {};
    (window.CATEGORIES || []).forEach(function (c) { known[c.key] = c; });
    var seen = {}, out = [];
    TEMPLATES.forEach(function (f) {
      var k = f.category;
      if (!k || k === 'common' || seen[k]) return;
      seen[k] = true;
      out.push(known[k] || { key: k, th: k, en: k });
    });
    return out.length ? out : (window.CATEGORIES || []);
  }

  function loadTemplatesFromSheet(silent) {
    if (!scriptUrl) { if (!silent) toast('ยังไม่ได้ตั้งค่า URL / No script URL set', 'warn'); return Promise.resolve(false); }
    return api('GET', { action: 'templates' }).then(function (r) {
      if (r && r.ok && r.templates && r.templates.length) {
        TEMPLATES = r.templates;
        writeJSON(LS.tpl, TEMPLATES);
        localStorage.setItem(LS.tplAt, new Date().toISOString());
        renderCategoryPicker(); buildCommonForm(); buildCategoryForm();
        if (!silent) toast('โหลดแบบฟอร์มล่าสุดแล้ว / Templates updated (' + TEMPLATES.length + ' fields)', 'ok');
        return true;
      }
      if (!silent) toast('ไม่พบข้อมูลแบบฟอร์ม / No templates returned', 'warn');
      return false;
    }).catch(function (e) {
      if (!silent) toast('เชื่อมต่อไม่สำเร็จ / Connection failed: ' + e.message, 'warn');
      return false;
    });
  }

  /* =================== network =================== */

  /* ---------------------------------------------------------------
     Talking to Apps Script.

     A deployed /exec URL answers with a 302 redirect to
     script.googleusercontent.com. Safari — on macOS and on iPad —
     refuses to hand back the body of a cross-origin fetch that has
     been redirected, and reports it as "Load failed", even though the
     same URL opens perfectly in a browser tab. Chrome is lenient here;
     Safari is not.

     So reads go out as JSONP: the reply is loaded as a <script>, which
     redirects are allowed to do and which CORS never touches. Writes
     try a normal fetch first, and if the browser hides the answer the
     request is repeated in no-cors mode — the data still reaches the
     Sheet — and the save is then confirmed with a JSONP status check.
     --------------------------------------------------------------- */

  /* Short, because a failure now costs nothing: the other method is already
     running alongside it. */
  var JSONP_TIMEOUT = 12000;

  function qs(params) {
    return Object.keys(params).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
  }

  function jsonp(params) {
    return new Promise(function (resolve, reject) {
      var cb = 'opnote_cb_' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
      var script = document.createElement('script');
      var done = false;

      function cleanup() {
        done = true;
        clearTimeout(timer);
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      var timer = setTimeout(function () {
        if (!done) { cleanup(); reject(new Error('หมดเวลารอ / request timed out')); }
      }, JSONP_TIMEOUT);

      window[cb] = function (data) { if (!done) { cleanup(); resolve(data); } };
      script.onerror = function () {
        if (!done) { cleanup(); reject(new Error('เรียกสคริปต์ไม่สำเร็จ / script could not be loaded')); }
      };
      script.src = scriptUrl + (scriptUrl.indexOf('?') > -1 ? '&' : '?') +
        qs(params) + '&callback=' + cb;
      document.head.appendChild(script);
    });
  }

  function postBlind(payload) {
    return fetch(scriptUrl, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () { return confirmSaved(payload.id, 0); });
  }

  function confirmSaved(id, tries) {
    return new Promise(function (r) { setTimeout(r, tries === 0 ? 2500 : 2000); })
      .then(function () { return jsonp({ action: 'status', id: id }); })
      .then(function (r) {
        if (r && r.ok && r.exists) return { ok: true, id: id, confirmed: true };
        if (tries < 6) return confirmSaved(id, tries + 1);
        throw new Error('ส่งแล้วแต่ยืนยันไม่ได้ / sent but could not be confirmed');
      });
  }

  function fetchGet(params) {
    var url = scriptUrl + (scriptUrl.indexOf('?') > -1 ? '&' : '?') + qs(params);
    return fetch(url, { method: 'GET', redirect: 'follow' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function attempt(method, payload) {
    var body = Object.assign({}, payload, { pass: passcode });

    /* A direct request works in Chrome whatever version of Code.gs is
       deployed; JSONP is the fallback that rescues Safari. Trying both
       means neither browser depends on the other's quirk. */
    /* Hedged request.

       Neither transport works everywhere: a plain fetch is blocked on desktop
       Safari by the Apps Script redirect, while JSONP silently fails on some
       iPads. Running them in sequence made one device or the other wait for a
       timeout first — 26 s a call on an iPad. Running both at once fixes that
       but doubles the load on a script that is already rate-limited.

       So: start with whichever transport last worked on this device, and only
       start the other if the first has not answered within a second. In the
       normal case that is one request, as before; on a device where the
       preferred transport is broken it costs one extra second, once, and then
       the preference flips and stays flipped. */
    if (method === 'GET') {
      return new Promise(function (resolve, reject) {
        var settled = false, failures = [], started = 1, hedge;
        var prefer = localStorage.getItem(LS.method) === 'fetch' ? 'fetch' : 'jsonp';

        function run(which) {
          return (which === 'fetch' ? fetchGet(body) : jsonp(body)).then(function (r) {
            if (settled) return;
            settled = true;
            clearTimeout(hedge);
            localStorage.setItem(LS.method, which);
            resolve(r);
          }, function (e) {
            failures.push(which + ': ' + e.message);
            if (started === 1) { clearTimeout(hedge); started = 2; run(other(prefer)); }
            else if (failures.length >= 2 && !settled) {
              reject(new Error('ทั้งสองวิธีล้มเหลว / both methods failed — ' +
                failures.join(' · ')));
            }
          });
        }
        function other(w) { return w === 'fetch' ? 'jsonp' : 'fetch'; }

        run(prefer);
        hedge = setTimeout(function () {
          if (!settled && started === 1) { started = 2; run(other(prefer)); }
        }, 1200);
      });
    }

    return fetch(scriptUrl, {
      method: 'POST', redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); })
      .catch(function () { return postBlind(body); });
  }

  function api(method, payload) {
    if (!scriptUrl) return Promise.reject(new Error('ยังไม่ได้ตั้งค่า URL / no script URL'));
    return attempt(method, payload).then(function (r) {
      if (r && r.ok === false && r.auth) {
        /* a read-only key is a valid key — never re-prompt for it */
        if (r.reason === 'readonly') {
          if (me) { me.role = 'readonly'; writeJSON(LS.me, me); applyIdentity(); }
          throw new Error(r.error);
        }
        if (r.reason === 'blocked') { forgetIdentity(); throw new Error(r.error); }
        return askPasscode(!!passcode).then(function (given) {
          if (!given) throw new Error('ต้องใส่รหัสเข้าใช้งาน / an access key is required');
          return attempt(method, payload).then(function (r2) {
            if (r2 && r2.ok !== false) loadIdentity();
            return r2;
          });
        });
      }
      return r;
    });
  }

  /* =================== who is using this device =================== */

  function loadIdentity() {
    if (!scriptUrl || !passcode) { applyIdentity(); return Promise.resolve(null); }
    return attempt('GET', { action: 'me' }).then(function (r) {
      if (r && r.ok && r.user) {
        me = r.user;
        writeJSON(LS.me, me);
        applyIdentity();
      }
      return me;
    }).catch(function () { return null; });
  }

  function forgetIdentity() {
    me = null; passcode = '';
    localStorage.removeItem(LS.me);
    localStorage.removeItem(LS.pass);
    applyIdentity();
  }

  var ROLE_LABEL = {
    admin: 'ผู้ดูแลระบบ · admin',
    full: 'บันทึกและแก้ไขได้ · full access',
    readonly: 'ดูและพิมพ์เท่านั้น · read-only'
  };

  function applyIdentity() {
    /* the name of whoever this device is signed in as, with Sign out beside
       it — so nobody writes a note under a colleague's name by accident */
    var known = me && (me.name || me.license);
    $('#userBox').style.display = known ? '' : 'none';
    if (known) {
      $('#userBadge').textContent = me.name || me.license;
      $('#ubMeta').textContent =
        (me.name && me.license ? me.license + ' · ' : '') +
        (ROLE_LABEL[me.role] || me.role || '');
    }
    /* read-only means exactly that: Search only. The New tab is hidden so a
       blank note cannot be started, but opening an existing note for
       reprinting still works — that view is reached from Search, not from
       the tab bar. */
    var ro = !!(me && me.role === 'readonly');
    $('#btnSave').style.display = ro ? 'none' : '';
    $('#roNote').style.display = ro ? '' : 'none';
    $('#navNew').style.display = ro ? 'none' : '';
    $('#btnNew').style.display = ro ? 'none' : '';
    if (ro && !S.id && !$('#view-new').classList.contains('hidden')) showView('search');

    /* Settings is an administrator's screen: it holds the Sheet URL, the
       letterhead and the template reload. Everyone else gets New and
       Search only. Sign-out and the pending-upload badge sit in the header
       so that hiding Settings never strands anyone. */
    var admin = !me || me.role === 'admin' || me.open || me.shared;
    $('#navSettings').style.display = admin ? '' : 'none';
    if (!admin && !$('#view-settings').classList.contains('hidden')) showView('new');

  }

  function signOut() {
    if (!window.confirm('ออกจากระบบบนเครื่องนี้? / Sign out on this device?')) return;
    forgetIdentity();
    showView('new');
    ensureAccess();
  }

  /* the person holding the key is, by default, the person writing the note */
  function applyMyName() {
    if (me && me.name && !S.data.recorder) {
      S.data.recorder = me.name;
      var n = document.querySelector('[data-key="recorder"]');
      if (n && !n.value) n.value = me.name;
    }
  }

  /* =================== passcode dialog =================== */

  /* opts.locked = a sign-in gate on opening: no way past it except a key.
     Otherwise it is a re-prompt in the middle of a task and can be cancelled. */
  function showGate(opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var gate = $('#passGate'), input = $('#passInput'), msg = $('#passMsg');
      msg.textContent = opts.wrong
        ? 'รหัสไม่ถูกต้อง กรุณาลองใหม่ / That key was not accepted. Please try again.'
        : (SITE.contact || '');
      msg.className = 'gatemsg' + (opts.wrong ? ' warn' : '');
      input.value = '';
      $('#passCancel').style.display = opts.locked ? 'none' : '';
      gate.classList.remove('hidden');
      if (opts.locked) document.body.classList.add('locked');
      setTimeout(function () { input.focus(); }, 80);

      function done(value) {
        gate.classList.add('hidden');
        $('#passOk').onclick = null;
        $('#passCancel').onclick = null;
        input.onkeydown = null;
        resolve(value);
      }
      $('#passOk').onclick = function () {
        var v = input.value.trim();
        if (!v) { input.focus(); return; }
        passcode = v;
        localStorage.setItem(LS.pass, v);
        done(true);
      };
      $('#passCancel').onclick = function () { done(false); };
      input.onkeydown = function (e) { if (e.key === 'Enter') $('#passOk').onclick(); };
    });
  }

  function askPasscode(wasWrong) { return showGate({ wrong: wasWrong }); }

  /* --- sign-in on opening ------------------------------------------------
     Checks the key with the Sheet before letting anyone in. If the device
     is simply offline the check cannot be made, and a previously accepted
     key is honoured rather than locking a surgeon out of a form they only
     want to fill in and print. */

  function verifyKey() {
    /* bootstrap returns identity and the field definitions together, so a
       fresh sign-in costs one round trip instead of two */
    return attempt('GET', { action: 'bootstrap' }).then(function (r) {
      if (r && r.ok && r.user) {
        me = r.user; writeJSON(LS.me, me);
        if (r.templates && r.templates.length) {
          TEMPLATES = r.templates;
          writeJSON(LS.tpl, TEMPLATES);
          localStorage.setItem(LS.tplAt, new Date().toISOString());
          renderCategoryPicker(); buildCommonForm(); buildCategoryForm();
        }
        return 'ok';
      }
      if (r && r.auth) return r.reason === 'blocked' ? 'blocked' : 'bad';
      return 'ok';
    }).catch(function () { return 'offline'; });
  }

  function signIn(wrong) {
    return showGate({ locked: true, wrong: wrong }).then(function () {
      return verifyKey().then(function (res) {
        if (res === 'ok') return unlock();
        if (res === 'offline') {
          toast('ออฟไลน์ ยังตรวจสอบรหัสไม่ได้ / Offline — key not verified yet', 'warn');
          return unlock();
        }
        if (res === 'blocked') {
          forgetIdentity();
          return signIn(true);
        }
        passcode = '';
        localStorage.removeItem(LS.pass);
        return signIn(true);
      });
    });
  }

  function unlock() {
    document.body.classList.remove('locked');
    applyIdentity();
    applyMyName();
    return true;
  }

  function ensureAccess() {
    if (!scriptUrl || SITE.requireLogin === false) return Promise.resolve(unlock());
    if (!passcode) return signIn(false);

    /* A device that has signed in before opens straight away and is
       re-checked in the background, so nobody waits on Apps Script waking
       up. A key that has since been revoked locks the app a second later,
       and could not have saved anything in the meantime anyway. */
    if (me) {
      unlock();
      verifyKey().then(function (res) {
        if (res === 'bad' || res === 'blocked') { forgetIdentity(); signIn(true); }
      });
      return Promise.resolve(true);
    }

    return verifyKey().then(function (res) {
      if (res === 'ok' || res === 'offline') return unlock();
      if (res === 'blocked') forgetIdentity();
      return signIn(true);
    });
  }

  /* =================== form building =================== */

  /* =================== conditional fields ===================
     A template row may carry a "showif" rule, written in the Sheet as

         cr_procedure = Right hemicolectomy; Extended right hemicolectomy
         cr_approach != Open

     The field then appears only when that rule holds. Values are compared
     case-insensitively and a checklist matches if ANY ticked option matches,
     so one rule covers both a radio and a multi-select list.

     A field whose rule fails is not merely hidden: valueOf() reports it as
     empty, so it cannot reach the printout or the narrative. Its stored value
     survives in S.data, and comes back if the trigger is ticked again. */

  function parseOneRule(rule) {
    var m = /^\s*([A-Za-z0-9_]+)\s*(!=|=)\s*([\s\S]*)$/.exec(String(rule || ''));
    if (!m) return null;
    var vals = m[3].split(';').map(function (x) { return x.trim().toLowerCase(); })
      .filter(function (x) { return x.length; });
    if (!vals.length) return null;
    return { key: m[1], negate: m[2] === '!=', values: vals };
  }

  /* Two rules joined by || show the field when EITHER holds. A defunctioning
     stoma is the case that needs it: the stoma questions belong on the note
     whether the stoma is the operation or an addition to a resection. */
  /* && binds tighter than ||, so "a = 1 && b != 2 || c = 3" reads as
     "(a and b) or c". The case that needs it: the extraction site is asked
     for a resection, but not when the abdomen is already open. */
  function parseShowIf(rule) {
    return String(rule || '').split('||').map(function (grp) {
      return grp.split('&&').map(parseOneRule).filter(function (r) { return r; });
    }).filter(function (g) { return g.length; });
  }

  /* Deliberately reads S.data, not the DOM, so the printout and the draft
     narrative apply the same rule whether or not the field is on screen. */
  function ruleHolds(rule) {
    var raw = S.data[rule.key];
    var have = (Array.isArray(raw) ? raw : String(raw == null ? '' : raw).split(';'))
      .map(function (x) { return String(x).trim().toLowerCase(); })
      .filter(function (x) { return x.length; });
    var hit = have.some(function (x) { return rule.values.indexOf(x) > -1; });
    return rule.negate ? !hit : hit;
  }

  function showIfOk(f) {
    if (!f || !f.showif) return true;
    var groups = parseShowIf(f.showif);
    if (!groups.length) return true;      /* an unreadable rule never hides a field */
    return groups.some(function (g) { return g.every(ruleHolds); });
  }

  /* Show or hide what the current answers call for. A section whose every
     field has gone disappears too, so no empty heading is left behind. */
  function applyVisibility() {
    $$('.field[data-fkey], .field-heading[data-fkey]').forEach(function (n) {
      var f = fieldByKey(n.dataset.fkey);
      n.classList.toggle('hidden', !showIfOk(f));
    });
    $$('#commonFields .fieldset, #catFields .fieldset').forEach(function (sec) {
      var kids = $$('[data-fkey]', sec);
      sec.classList.toggle('hidden',
        kids.length > 0 && kids.every(function (k) { return k.classList.contains('hidden'); }));
    });
  }

  /* Every option list — radio or checklist — gets a free-text escape hatch.
     A fixed list can only record what we anticipated; this catches the rest,
     and it is stored in its own <key>_other column so the tick data stays clean. */
  function addOtherBox(body, f) {
    var other = el('input', 'other');
    other.type = 'text';
    other.placeholder = 'อื่น ๆ ระบุ / other, specify';
    other.dataset.key = f.key + '_other';
    other.value = S.data[f.key + '_other'] || '';
    body.appendChild(other);
  }

  function fieldControl(f) {
    var v = S.data[f.key];
    var wrap = el('div', 'field f-' + f.type);
    wrap.dataset.fkey = f.key;
    wrap.appendChild(el('label', 'flabel', bilingual(f.th, f.en)));
    var body = el('div', 'fbody');
    var i;

    if (f.type === 'heading') {
      wrap.className = 'field-heading';
      wrap.innerHTML = '<h4>' + bilingual(f.th, f.en) + '</h4>';
      return wrap;
    }

    if (f.type === 'textarea') {
      var ta = el('textarea');
      ta.rows = 4; ta.dataset.key = f.key; ta.value = v || '';
      body.appendChild(ta);

      /* the step-by-step box gets a draft button — pressed deliberately,
         never filled automatically, and always editable afterwards */
      /* The findings box writes itself from the boxes above it, so it needs a
         note rather than a button — a button would imply it had not happened. */
      /* "Others" has no checklist behind the findings box, so the note
         promising that it writes itself would be a lie there. */
      if (f.key === 'findings' && (((window.NARRATIVE || {}).findings || {})[S.category] || []).length) {
        body.appendChild(el('p', 'drafthint',
          '\u0e02\u0e49\u0e2d\u0e04\u0e27\u0e32\u0e21\u0e19\u0e35\u0e49\u0e2a\u0e23\u0e49\u0e32\u0e07\u0e08\u0e32\u0e01\u0e2a\u0e34\u0e48\u0e07\u0e15\u0e23\u0e27\u0e08\u0e1e\u0e1a\u0e17\u0e35\u0e48\u0e15\u0e34\u0e4a\u0e01\u0e14\u0e49\u0e32\u0e19\u0e1a\u0e19 \u0e41\u0e01\u0e49\u0e44\u0e02\u0e44\u0e14\u0e49' +
          '<span class="en">Written automatically from the findings ticked above. ' +
          'Edit it freely — once you type here it is yours and stops updating; ' +
          'clear the box to let it write itself again.</span>'));
      }

      /* An "Others" case is whatever it is — there is no field set to draft
         from, so the box is simply typed. */
      if (/_steps$/.test(f.key) && S.category !== 'others') {
        var kind = 'steps';
        var draft = el('button', 'btn ghost draftbtn',
          '\u270E \u0e23\u0e48\u0e32\u0e07\u0e08\u0e32\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e35\u0e48\u0e15\u0e34\u0e4a\u0e01 \u00b7 Draft from the fields ticked');
        draft.type = 'button';
        draft.onclick = function () { draftInto(ta, kind); };
        body.appendChild(draft);
        body.appendChild(el('p', 'drafthint',
          '\u0e23\u0e48\u0e32\u0e07\u0e19\u0e35\u0e49\u0e40\u0e1b\u0e47\u0e19\u0e40\u0e1e\u0e35\u0e22\u0e07\u0e08\u0e38\u0e14\u0e15\u0e31\u0e49\u0e07\u0e15\u0e49\u0e19 \u0e42\u0e1b\u0e23\u0e14\u0e2d\u0e48\u0e32\u0e19\u0e41\u0e25\u0e30\u0e41\u0e01\u0e49\u0e44\u0e02\u0e01\u0e48\u0e2d\u0e19\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01' +
          '<span class="en">A starting point only. Read every line and correct it — this is a legal record, ' +
          'and only what you actually did should remain.</span>'));
      }

    } else if (f.type === 'select' || f.type === 'dropdown') {
      var sel = el('select');
      sel.dataset.key = f.key;
      sel.appendChild(new Option('— เลือก / select —', ''));
      f.options.forEach(function (o) { sel.appendChild(new Option(o, o)); });
      sel.value = v || '';
      body.appendChild(sel);

    } else if (f.type === 'radio') {
      var rg = el('div', 'optgrid');
      f.options.forEach(function (o, ix) {
        var id = 'r_' + f.key + '_' + ix;
        var lab = el('label', 'opt');
        lab.innerHTML = '<input type="radio" id="' + id + '" name="' + esc(f.key) + '" ' +
          'data-key="' + esc(f.key) + '" data-role="radio" value="' + esc(o) + '"' +
          (v === o ? ' checked' : '') + '><span>' + esc(o) + '</span>';
        rg.appendChild(lab);
      });
      var clr = el('button', 'linkbtn', 'ล้างตัวเลือก / clear');
      clr.type = 'button';
      clr.onclick = function () {
        $$('input[name="' + f.key + '"]', rg).forEach(function (x) { x.checked = false; });
        S.data[f.key] = ''; saveDraft();
      };
      body.appendChild(rg); body.appendChild(clr);
      addOtherBox(body, f);

    } else if (f.type === 'checkbox') {
      var lab2 = el('label', 'opt single');
      lab2.innerHTML = '<input type="checkbox" data-key="' + esc(f.key) + '" data-role="bool"' +
        (v ? ' checked' : '') + '><span>ใช่ / Yes</span>';
      body.appendChild(lab2);

    } else if (f.type === 'checklist') {
      var arr = Array.isArray(v) ? v : (v ? String(v).split(';').map(function (s) { return s.trim(); }) : []);
      var cg = el('div', 'optgrid');
      f.options.forEach(function (o, ix) {
        var lab3 = el('label', 'opt');
        lab3.innerHTML = '<input type="checkbox" data-key="' + esc(f.key) + '" data-role="list" ' +
          'value="' + esc(o) + '"' + (arr.indexOf(o) > -1 ? ' checked' : '') + '><span>' + esc(o) + '</span>';
        cg.appendChild(lab3);
      });
      body.appendChild(cg);
      addOtherBox(body, f);

    } else {
      var inp = el('input');
      inp.type = (f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text');
      if (f.type === 'number') inp.inputMode = 'decimal';
      inp.dataset.key = f.key;
      inp.value = v == null ? '' : v;
      body.appendChild(inp);
    }

    wrap.appendChild(body);
    return wrap;
  }

  function renderFields(list, container) {
    container.innerHTML = '';
    var curSection = null, sec = null;
    list.forEach(function (f) {
      if (f.section !== curSection) {
        curSection = f.section;
        sec = el('section', 'fieldset');
        var parts = String(curSection || '').split('|');
        sec.appendChild(el('h3', null, bilingual((parts[0] || '').trim(), (parts[1] || '').trim())));
        var grid = el('div', 'fgrid');
        sec.appendChild(grid);
        sec._grid = grid;
        container.appendChild(sec);
      }
      sec._grid.appendChild(fieldControl(f));
    });
    if (!list.length) container.appendChild(el('p', 'muted', 'ยังไม่มีหัวข้อในหมวดนี้ / No fields defined for this category.'));
    applyVisibility();
  }

  /* The findings box is a common field, but it is written from the boxes
     ticked on the procedure page. Leaving it on page 1 meant reading it
     before the answers it summarizes had been given, and walking back a page
     to check. It renders at the foot of page 2 instead — directly under the
     ticks that produce it — while remaining the same `findings` column. */
  var FINDINGS_SECTION = 'สิ่งตรวจพบ | Findings';

  function commonOnPageOne(f) { return f.section !== FINDINGS_SECTION; }
  function commonOnPageTwo(f) { return f.section === FINDINGS_SECTION; }

  function buildCommonForm() {
    renderFields(fieldsFor('common').filter(commonOnPageOne), $('#commonFields'));
  }
  function buildCategoryForm() {
    renderFields(fieldsFor(S.category).concat(fieldsFor('common').filter(commonOnPageTwo)),
      $('#catFields'));
  }

  /* ---------- "Operation performed" on page 1 ----------
     Typing the operation out again after ticking it is duplicated effort and
     a chance to contradict yourself, so page 1 is filled from the ticks. The
     moment anything is typed into the box by hand it is left alone; clearing
     the box hands control back. */

  var PROC_KEY = {
    colorectal: 'cr_procedure', fistula: 'fi_procedure',
    hemorrhoid: 'he_procedure', others: 'ot_procedure_name'
  };

  function lcOrdinary(word) {
    var first = String(word).split(/[\s,(]/)[0];
    return /^[A-Z][a-z]+(-[a-z][a-z-]*)*$/.test(first)
      ? word.charAt(0).toLowerCase() + word.slice(1) : word;
  }

  function deriveOperation() {
    var procs = valueOf(PROC_KEY[S.category] || '');
    if (!String(procs).trim()) return '';
    var list = String(procs).split(';').map(function (x) { return x.trim(); })
      .filter(function (x) { return x.length; });
    var head = list.shift();
    var approach = S.category === 'colorectal' ? valueOf('cr_approach') : '';
    if (approach) head = approach + ' ' + lcOrdinary(head);
    var parts = [head].concat(list.map(lcOrdinary));

    /* the anastomosis is part of how the operation is named */
    var site = valueOf('cr_r_anast_site'), cfg = valueOf('cr_r_anast_config');
    if (site && cfg) {
      parts.push(lcOrdinary(site) + ' ' + lcOrdinary(cfg) + ' ileocolic anastomosis');
    } else {
      var m = valueOf('cr_anast_method'), c = valueOf('cr_anast_config');
      if (m && c && m.indexOf('No anastomosis') === -1) {
        parts.push(lcOrdinary(c) + ', ' + lcOrdinary(m) + ' anastomosis');
      }
    }
    var txt = parts.join(' with ');
    var div = valueOf('cr_diverting');
    if (div && div.indexOf('None') === -1) txt += ' and ' + lcOrdinary(div);
    return txt;
  }

  /* Same bargain as the operation box: composed from the ticks until you
     type in it, and yours from then on. Without this the paragraph only
     existed if you remembered to press Draft, and the printed findings box
     came out blank — which is worse than no feature at all. */
  function autofillFindings() {
    var node = $('[data-key="findings"]');
    if (!node) return;
    /* an empty box means nothing was typed, whatever a stale flag says */
    if (!String(node.value || '').trim()) S.data.findings_manual = false;
    if (S.data.findings_manual) return;
    var txt = buildFindings(S.category);
    if (!txt) return;
    if (node.value !== txt) node.value = txt;
    S.data.findings = txt;
  }

  /* A field that is the same on every note in the department is a field the
     surgeon should not have to type. Settings can override it. */
  function seedDefaults() {
    if (!S.data.department) S.data.department = prefs.department || 'ศัลยศาสตร์';
    var n = $('[data-key="department"]');
    if (n && !n.value) n.value = S.data.department;
  }

  function autofillOperation() {
    var node = $('[data-key="operation"]');
    if (!node || S.data.operation_manual) return;
    var txt = deriveOperation();
    if (!txt) return;
    if (node.value !== txt) node.value = txt;
    S.data.operation = txt;
  }

  /* read every visible control back into S.data */
  function harvest() {
    var lists = {};
    $$('[data-key]').forEach(function (n) {
      var k = n.dataset.key, role = n.dataset.role;
      if (role === 'list') {
        if (!lists[k]) lists[k] = [];
        if (n.checked) lists[k].push(n.value);
      } else if (role === 'radio') {
        if (n.checked) S.data[k] = n.value;
        else if (S.data[k] === n.value && !n.checked) S.data[k] = S.data[k];
      } else if (role === 'bool') {
        S.data[k] = n.checked;
      } else if (n.tagName === 'SELECT' || n.tagName === 'TEXTAREA' || n.tagName === 'INPUT') {
        S.data[k] = n.value;
      }
    });
    Object.keys(lists).forEach(function (k) { S.data[k] = lists[k]; });
    recalcTotalTime();
    seedDefaults();
    autofillOperation();
    autofillFindings();
    return S.data;
  }

  /* ---------- operating time ----------
     Finish minus start, in minutes. A finish time earlier than the start is
     read as crossing midnight rather than as an error, since that is the
     commoner case in an emergency list. */

  function minutesBetween(start, end) {
    var a = /^(\d{1,2}):(\d{2})/.exec(String(start || ''));
    var b = /^(\d{1,2}):(\d{2})/.exec(String(end || ''));
    if (!a || !b) return null;
    var d = (+b[1] * 60 + +b[2]) - (+a[1] * 60 + +a[2]);
    if (d < 0) d += 1440;
    return d;
  }

  /* Recomputed by harvest(), so it does not depend on which events a
     particular browser chooses to fire for a time picker — the value is
     correct whenever the form is read, which includes every save and print.
     A total the user has typed by hand is left alone. */
  var lastAutoTotal = null;

  function recalcTotalTime() {
    var m = minutesBetween(S.data.time_start, S.data.time_end);
    if (m == null) return;
    var cur = String(S.data.time_total == null ? '' : S.data.time_total).trim();
    if (cur !== '' && cur !== String(lastAutoTotal) && cur !== String(m)) return;
    lastAutoTotal = m;
    S.data.time_total = String(m);
    var node = document.querySelector('[data-key="time_total"]');
    if (node && node.value !== String(m)) node.value = String(m);
  }

  /* 185 → "185 นาที (3 ชม. 5 นาที)"; anything non-numeric is left alone so a
     hand-typed note survives. */
  function fmtDuration(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return '';
    if (!/^\d+$/.test(s)) return s;
    var n = parseInt(s, 10), h = Math.floor(n / 60), m = n % 60;
    return n + ' นาที' + (h ? ' (' + h + ' ชม. ' + m + ' น.)' : '');
  }

  /* ---------- draft narrative ----------
     Turns the ticked boxes into prose. Deterministic: no model, no network,
     identical output for identical input, works offline. A line is printed
     only when every field it names has been filled, so the draft can never
     claim something that was not recorded. */

  function fieldFilled(k) {
    var v = valueOf(k);
    return String(v == null ? '' : v).trim() !== '';
  }

  function contains(hay, needle) {
    return String(hay || '').toLowerCase().indexOf(String(needle).toLowerCase()) > -1;
  }

  /* Does this operation have a standard-steps block? */
  function matchingSteps() {
    var blocks = (window.NARRATIVE || {}).steps || [];
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      var ok = (b.when || []).every(function (c) {
        var v = String(valueOf(c.key) || '');
        return (c.any || []).some(function (a) { return contains(v, a); });
      });
      if (ok && (b.when || []).length) return b;
    }
    return null;
  }

  /* "A inferior approach" reads badly, and which article is right depends on
     the value the surgeon picked, not on the sentence I wrote. So the article
     is corrected after substitution. The exceptions are the u- words sounded
     as "yoo", where "a" is correct. */
  var A_NOT_AN = /^(uni|use|usu|util|urin|ureth|ureter|uter|eu|one)/i;

  /* device and suture names keep their capital wherever they fall */
  /* device, suture and eponym names keep their capital wherever they fall */
  var TRADE_NAMES = /^(Hem-o-lok|V-Loc|Endo|LigaSure|Ligasure|Signia|Echelon|Monocryl|Vicryl|Prolene|PDS|Ethibond|Stratafix|Harmonic|Thunderbeat|Enseal|Pfannenstiel|Denonvilliers|Toldt|Henle|Hartmann|Brooke|Baker|Waldeyer|Lloyd-Davies|Trendelenburg)$/i;

  function fixArticles(text) {
    return text.replace(/\b([Aa]) (?=[aeiouAEIOU])([A-Za-z-]+)/g, function (m, art, word) {
      if (A_NOT_AN.test(word)) return m;
      return (art === 'A' ? 'An' : 'an') + ' ' + word;
    });
  }

  /* Turns a list of sentence templates into finished sentences, and reports
     which fields each one consumed. Both the step-by-step draft and the
     findings paragraph run through here, so the two can never drift apart
     in how they treat |lc, «placeholders» or a missing value. */
  function renderSentences(lines, used) {
    var usedGroup = {}, out = [];

    lines.forEach(function (l) {
      if (l.group && usedGroup[l.group]) return;
      var needs = l.needs || [];
      if (!needs.every(fieldFilled)) return;
      var first = valueOf(needs[0]);
      if (l.equals && !contains(first, l.equals)) return;
      if (l.not && contains(first, l.not)) return;

      var text = String(l.text).replace(/\{(\w+)((?:\|\w+)*)\}/g, function (_, k, mods) {
        var lc = mods.indexOf('|lc') > -1;
        var joinAnd = mods.indexOf('|and') > -1;
        var val = String(valueOf(k) || '').trim();
        /* nothing recorded — leave a visible blank rather than a silent gap */
        if (!val) return '\u00ab\u2026\u00bb';
        /* |lc drops the capital on an ordinary word so it reads naturally
           mid-sentence, but leaves TME, GA, D2, LIFT and hyphenated proper
           names such as Milligan-Morgan exactly as written */
        /* lowercase only an ordinary first word: "End-to-end" and
           "Modified lithotomy" yes; "TME", "D3", "ICG" and proper names
           like "Milligan-Morgan" left alone */
        /* a checklist arrives as "Ileocolic; Right colic; …" — lowercase
           the opening word of each item, not just the first */
        if (lc) {
          val = val.split(';').map(function (part) {
            var t = part.replace(/^\s+/, '');
            var lead = part.slice(0, part.length - t.length);
            var firstWord = t.split(/[\s,(]/)[0];
            if (/^[A-Z][a-z]+(-[a-z][a-z-]*)*$/.test(firstWord) && !TRADE_NAMES.test(firstWord)) {
              t = t.charAt(0).toLowerCase() + t.slice(1);
            }
            return lead + t;
          }).join(';');
        }
        /* a checklist read aloud: "a, b and c" rather than "a; b; c" */
        if (joinAnd) {
          var items = val.split(';').map(function (x) { return x.trim(); })
            .filter(function (x) { return x.length; });
          val = items.length < 2 ? (items[0] || val)
            : items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
        }
        return val;
      }).replace(/\s+/g, ' ').trim();
      if (!text) return;
      text = fixArticles(text);
      if (!/[.!?]$/.test(text)) text += '.';

      if (l.group) usedGroup[l.group] = true;
      /* remember every field this sentence consumed, so the sweep below
         knows what has already been said */
      needs.forEach(function (k) { used[k] = true; });
      String(l.text).replace(/\{(\w+)/g, function (_, k) { used[k] = true; return _; });
      out.push(text);
    });
    return out;
  }

  /* A block lists { use: 'name' } wherever a run of sentences is shared with
     another operation — the APR, the Hartmann and the anterior resection all
     pull in the same left-sided vessel sentences. Expanding the names here
     means each sentence exists once in narrative.js and is corrected once.
     The depth guard is for a part that names itself by mistake. */
  function expandLines(lines, depth) {
    var parts = (window.NARRATIVE || {}).parts || {}, out = [];
    (lines || []).forEach(function (l) {
      if (!l) return;
      if (l.use) {
        if ((depth || 0) > 4) return;
        out = out.concat(expandLines(parts[l.use] || [], (depth || 0) + 1));
      } else out.push(l);
    });
    return out;
  }

  function buildNarrative(cat) {
    var N = window.NARRATIVE || {};
    var block = matchingSteps();

    /* A standard-steps block already narrates position, access, dissection
       and closure, so it replaces the short field-based list rather than
       being added to it. The common tail still follows. */
    var lines = block
      ? expandLines(block.lines).concat(N.common || [])
      : (N[cat] || []).concat(N.common || []);
    var numbered = !!block, used = {};
    var out = renderSentences(lines, used).map(function (t, i) {
      return numbered ? (i + 1) + '. ' + t : '- ' + t;
    });
    /* Anything ticked but not mentioned by a sentence is listed at the end.
       Writing a template for every field would mean guessing phrasing for
       all of them; this way a box you tick always reaches the note, and you
       reword it if you want it in the prose. */
    if (out.length) {
      var extras = [];
      fieldsFor(cat).forEach(function (f) {
        if (used[f.key] || /_steps$|_postop$/.test(f.key) || f.type === 'heading') return;
        if (/^[a-z]{2}_f_/.test(f.key)) return;   /* said in the findings paragraph */
        var v = valueOf(f.key);
        if (!String(v == null ? '' : v).trim()) return;
        extras.push('- ' + (f.en || f.th) + ': ' + v);
      });
      if (extras.length) {
        out.push('');
        out.push('Additional recorded detail:');
        out = out.concat(extras);
      }
    }

    return out.join('\n');
  }

  /* The findings box gets its own draft: a paragraph, not a numbered list,
     because that is how it is read on the page. Its sentences live under
     NARRATIVE.findings, one list per category. */
  function buildFindings(cat) {
    var N = window.NARRATIVE || {};
    var lines = (N.findings || {})[cat] || [];
    if (!lines.length) return '';
    return renderSentences(lines, {}).join(' ');
  }

  function draftInto(node, kind) {
    harvest();
    var text = kind === 'findings' ? buildFindings(S.category) : buildNarrative(S.category);
    if (!text) {
      toast('ยังไม่มีข้อมูลพอจะร่าง กรอกช่องด้านบนก่อน / Nothing to draft yet — fill the fields above first', 'warn');
      return;
    }
    var existing = node.value.trim();
    if (existing) {
      /* Appending made the box grow a second copy every time the button was
         pressed. Redrafting after correcting a field is the common case, so
         the draft replaces what is there — and says so before it does. */
      if (!window.confirm('เขียนร่างใหม่ทับข้อความเดิมทั้งหมด?\n\n' +
        'Replace the text here with a new draft?\n' +
        'ข้อความที่แก้ไขเองจะหายไป / Any edits you made by hand will be lost.')) return;
      node.value = text;
    } else {
      node.value = text;
    }
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.focus();
    toast('ร่างแล้ว โปรดอ่านและแก้ไขก่อนบันทึก / Draft inserted — please read and edit it', 'ok');
  }

  function valueOf(key) {
    var f = fieldByKey(key);
    if (!showIfOk(f)) return '';          /* the question was never asked */
    var v = S.data[key];
    if (Array.isArray(v)) v = v.join('; ');
    if (v === true) return 'ใช่ / Yes';
    if (v === false) return '';
    if (f && (f.type === 'checklist' || f.type === 'radio') && S.data[key + '_other']) {
      v = (v ? v + '; ' : '') + S.data[key + '_other'];
    }
    return v == null ? '' : String(v);
  }

  /* =================== drawing =================== */

  var cv, ctx, drawing = false, cur = null;
  var tool = { color: '#111111', width: 3, mode: 'pen' };

  /* A figure is either a raster (Ball's original diagrams, stored as a PNG
     data URI) or a vector drawn in figures.js. Both end up as an image URL. */
  function figSvgUrl(figKey) {
    var f = window.FIGURES[figKey];
    if (f.png) return f.png;
    var svg = f.svg.replace('<svg ', '<svg width="' + f.w + '" height="' + f.h + '" ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function activeSheet() { return S.sheets[S.active] || null; }

  function addSheet(figKey) {
    S.sheets.push({ fig: figKey, strokes: [], texts: [] });
    S.active = S.sheets.length - 1;
    renderSheetTabs(); saveDraft();
    openDraw(S.active);
  }

  /* The page shows what has been drawn; the canvas lives in a window you open
     deliberately. A figure sitting live on a scrolling page collects marks
     from the scroll itself, which is what made drawing feel unreliable. */
  function renderSheetTabs() {
    var box = $('#sheetCards');
    if (!box) return;
    box.innerHTML = '';
    S.sheets.forEach(function (sh, i) {
      var fig = window.FIGURES[sh.fig];
      var card = el('div', 'sheetcard');
      card.setAttribute('role', 'button');
      card.tabIndex = 0;

      var thumb = el('div', 'thumb');
      thumb.style.aspectRatio = fig.w + ' / ' + fig.h;
      thumb.style.backgroundImage = 'url("' + figSvgUrl(sh.fig) + '")';
      var pc = el('canvas');
      thumb.appendChild(pc);
      card.appendChild(thumb);

      var marks = (sh.strokes || []).length + (sh.texts || []).length;
      card.appendChild(el('div', 'cap', esc((i + 1) + '. ' + fig.en) +
        '<div class="marks">' + (marks
          ? marks + ' \u0e23\u0e2d\u0e22 / marks'
          : '\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e27\u0e32\u0e14 / not drawn on') + '</div>'));

      card.onclick = function () { openDraw(i); };
      card.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') openDraw(i); };
      box.appendChild(card);

      /* paint the preview once the card has a width to measure */
      setTimeout(function () { paintPreview(pc, sh, fig); }, 0);
    });

    var add = el('div', 'sheetcard add', '\uFF0B \u0e40\u0e1e\u0e34\u0e48\u0e21\u0e23\u0e39\u0e1b / Add figure');
    add.onclick = function () { $('#figPicker').classList.toggle('hidden'); };
    box.appendChild(add);
  }

  function paintPreview(canvas, sh, fig) {
    var w = canvas.clientWidth || 200;
    var h = Math.round(w * fig.h / fig.w);
    canvas.width = w; canvas.height = h;
    var c = canvas.getContext('2d');
    if (!c) return;
    c.clearRect(0, 0, w, h);
    (sh.strokes || []).forEach(function (st) { drawStroke(c, st, w, h); });
    (sh.texts || []).forEach(function (t) { drawTextItem(c, t, w, h); });
  }

  function openDraw(i) {
    S.active = i;
    var fig = window.FIGURES[S.sheets[i].fig];
    $('#drawTitle').textContent = (i + 1) + '. ' + fig.en;
    $('#drawModal').classList.remove('hidden');
    mountCanvas();
  }

  function closeDraw() {
    $('#drawModal').classList.add('hidden');
    saveDraft();
    renderSheetTabs();          /* the previews pick up what was just drawn */
  }

  function renderFigPicker() {
    var p = $('#figPicker');
    p.innerHTML = '';
    Object.keys(window.FIGURES).forEach(function (k) {
      var f = window.FIGURES[k];
      var b = el('button', 'figcard');
      b.type = 'button';
      b.innerHTML = '<img alt="" src="' + figSvgUrl(k) + '"><span>' + bilingual(f.th, f.en) + '</span>';
      b.onclick = function () { addSheet(k); p.classList.add('hidden'); };
      p.appendChild(b);
    });
  }

  function mountCanvas() {
    var host = $('#canvasHost');
    var sh = activeSheet();
    if (!sh) { host.innerHTML = '<p class="muted">ยังไม่มีรูป — กด “เพิ่มรูป” / No figure yet — tap “Add figure”.</p>'; return; }
    var fig = window.FIGURES[sh.fig];
    host.innerHTML = '';
    var stage = el('div', 'stage');
    stage.style.aspectRatio = fig.w + ' / ' + fig.h;
    stage.style.backgroundImage = 'url("' + figSvgUrl(sh.fig) + '")';
    cv = el('canvas', 'ink');
    stage.appendChild(cv);
    host.appendChild(stage);
    sizeCanvas(fig);
    bindPointer();
  }

  function sizeCanvas(fig) {
    var rect = cv.parentNode.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = Math.max(2, Math.round(rect.width * dpr));
    cv.height = Math.max(2, Math.round(rect.width * (fig.h / fig.w) * dpr));
    ctx = cv.getContext('2d');
    redraw();
  }

  function drawStroke(c, st, w, h) {
    if (!st.p.length) return;
    c.save();
    c.globalCompositeOperation = st.e ? 'destination-out' : 'source-over';
    c.strokeStyle = st.c;
    c.lineWidth = Math.max(1, st.w * (w / 1000));
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(st.p[0][0] * w, st.p[0][1] * h);
    for (var i = 1; i < st.p.length; i++) {
      var a = st.p[i - 1], b = st.p[i];
      c.quadraticCurveTo(a[0] * w, a[1] * h, (a[0] + b[0]) / 2 * w, (a[1] + b[1]) / 2 * h);
    }
    c.stroke();
    c.restore();
  }

  function drawTextItem(c, t, w, h) {
    c.save();
    c.fillStyle = t.c;
    c.font = '600 ' + Math.round(t.s * w / 1000) + 'px Helvetica, Arial, sans-serif';
    c.textBaseline = 'middle';
    c.fillText(t.t, t.x * w, t.y * h);
    c.restore();
  }

  function redraw() {
    var sh = activeSheet();
    if (!ctx || !sh) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    sh.strokes.forEach(function (st) { drawStroke(ctx, st, cv.width, cv.height); });
    sh.texts.forEach(function (t) { drawTextItem(ctx, t, cv.width, cv.height); });
  }

  function pos(e) {
    var r = cv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  function bindPointer() {
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', function (e) {
      var sh = activeSheet(); if (!sh) return;
      if (tool.mode === 'text') {
        var txt = window.prompt('ข้อความ / Text:');
        if (txt) {
          var p = pos(e);
          sh.texts.push({ t: txt, x: p[0], y: p[1], c: tool.color, s: 26 + tool.width * 4 });
          redraw(); saveDraft();
        }
        return;
      }
      cv.setPointerCapture(e.pointerId);
      drawing = true;
      cur = { c: tool.color, w: tool.mode === 'eraser' ? tool.width * 5 : tool.width, e: tool.mode === 'eraser', p: [pos(e)] };
      sh.strokes.push(cur);
      redraw();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!drawing || !cur) return;
      cur.p.push(pos(e));
      redraw();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      cv.addEventListener(ev, function () {
        if (!drawing) return;
        drawing = false;
        if (cur) cur.p = cur.p.map(function (q) { return [+q[0].toFixed(4), +q[1].toFixed(4)]; });
        cur = null; saveDraft();
      });
    });
  }

  function loadImage(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { rej(new Error('image load failed')); };
      im.src = src;
    });
  }

  function exportSheet(sh, targetW) {
    var fig = window.FIGURES[sh.fig];
    /* vectors can be rendered at any size; rasters are exported near their
       own resolution so the line art stays crisp on paper */
    var natural = fig.png ? Math.min(1600, Math.max(1000, fig.w * 2)) : 1400;
    var w = targetW || natural, h = Math.round(w * fig.h / fig.w);
    return loadImage(figSvgUrl(sh.fig)).then(function (img) {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      x.drawImage(img, 0, 0, w, h);
      sh.strokes.forEach(function (st) { drawStroke(x, st, w, h); });
      sh.texts.forEach(function (t) { drawTextItem(x, t, w, h); });
      return c.toDataURL('image/png');
    });
  }

  function exportAllSheets() {
    return Promise.all(S.sheets.map(function (sh) { return exportSheet(sh); }));
  }

  /* =================== photos =================== */

  function addPhotos(files) {
    var jobs = Array.prototype.slice.call(files).map(function (file) {
      return new Promise(function (res) {
        var fr = new FileReader();
        fr.onload = function () {
          loadImage(fr.result).then(function (im) {
            var max = 1400, sc = Math.min(1, max / Math.max(im.width, im.height));
            var c = document.createElement('canvas');
            c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
            c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
            S.photos.push({ name: file.name, caption: '', dataUrl: c.toDataURL('image/jpeg', 0.85) });
            res();
          }).catch(res);
        };
        fr.readAsDataURL(file);
      });
    });
    return Promise.all(jobs).then(function () { renderPhotos(); saveDraft(); });
  }

  function renderPhotos() {
    var box = $('#photoList');
    box.innerHTML = '';
    S.photos.forEach(function (p, i) {
      var card = el('div', 'photo');
      card.innerHTML = '<img src="' + (p.dataUrl || p.url) + '" alt="">';
      var cap = el('input');
      cap.type = 'text'; cap.placeholder = 'คำบรรยาย / caption'; cap.value = p.caption || '';
      cap.oninput = function () { p.caption = cap.value; saveDraft(); };
      var del = el('button', 'linkbtn danger', 'ลบ / remove');
      del.type = 'button';
      del.onclick = function () { S.photos.splice(i, 1); renderPhotos(); saveDraft(); };
      card.appendChild(cap); card.appendChild(del);
      box.appendChild(card);
    });
    if (!S.photos.length) box.appendChild(el('p', 'muted', 'ยังไม่มีรูปถ่าย / No photos attached.'));
  }

  /* =================== required fields ===================
     An operative note with no surgeon, no date or no narrative is not a
     record, and the moment to catch that is before it is filed — not weeks
     later when someone needs it. Only fields actually on screen are checked,
     so a question hidden by its showif rule is never demanded.

     Category rows use the prefix, so `_procedure` covers cr_, fi_ and he_. */
  var REQUIRED_COMMON = ['hn', 'an', 'patient_name', 'op_date', 'time_start',
    'time_end', 'preop_dx', 'postop_dx', 'operation', 'surgeon', 'recorder',
    'anaesthesia', 'findings'];

  /* Page 1 keeps a short list of essentials — it is administrative and often
     filled by someone else. The procedure page is different: every question
     it shows is a question this operation raised, so leaving one blank means
     the note does not say what was done. Hidden fields are never demanded. */
  function requiredKeys() {
    var keys = REQUIRED_COMMON.slice();
    fieldsFor(S.category).forEach(function (f) {
      if (f.type === 'heading' || f.type === 'checkbox') return;
      if (/_other$/.test(f.key)) return;
      keys.push(f.key);
    });
    return keys;
  }

  function missingRequired() {
    var out = [];
    requiredKeys().forEach(function (k) {
      var f = fieldByKey(k);
      if (!f || !showIfOk(f)) return;          /* never demand a hidden answer */
      if (String(valueOf(k) || '').trim()) return;
      out.push(f);
    });
    return out;
  }

  /* Marks the empty fields and scrolls to the first, so "incomplete" is
     actionable rather than an accusation. */
  function flagMissing(list) {
    $$('.field.missing').forEach(function (n) { n.classList.remove('missing'); });
    list.forEach(function (f) {
      var n = $('.field[data-fkey="' + f.key + '"]');
      if (n) n.classList.add('missing');
    });
    if (list.length) {
      var first = $('.field[data-fkey="' + list[0].key + '"]');
      if (first && first.scrollIntoView) first.scrollIntoView({ block: 'center' });
    }
  }

  /* Returns true when it is safe to go ahead. */
  function requireComplete(what) {
    var miss = missingRequired();
    if (!miss.length) { $$('.field.missing').forEach(function (n) { n.classList.remove('missing'); }); return true; }
    var names = miss.map(function (f) { return '• ' + (f.th || '') + '  ' + (f.en || ''); }).join('\n');
    flagMissing(miss);
    window.alert('\u0e01\u0e23\u0e2d\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e44\u0e21\u0e48\u0e04\u0e23\u0e1a — ' +
      'The note is not complete.\n\n' +
      (what === 'print' ? 'ยังพิมพ์ไม่ได้ / Cannot print yet.'
        : what === 'next' ? 'ยังไปหน้าถัดไปไม่ได้ / Cannot move on yet.'
        : 'ยังบันทึกไม่ได้ / Cannot save yet.') +
      '\n\n\u0e02\u0e32\u0e14 / Missing (' + miss.length + '):\n' + names +
      '\n\n\u0e0a\u0e48\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e02\u0e32\u0e14\u0e16\u0e39\u0e01\u0e17\u0e33\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e2b\u0e21\u0e32\u0e22\u0e2a\u0e35\u0e41\u0e14\u0e07\u0e44\u0e27\u0e49\u0e41\u0e25\u0e49\u0e27 / ' +
      'The missing fields are outlined in red.');
    return false;
  }

  /* =================== printable document =================== */

  function row(th, en, val, cls) {
    return '<div class="prow ' + (cls || '') + '">' +
      '<div class="plab"><span class="th">' + esc(th) + '</span>' +
      '<span class="en">' + esc(en) + '</span></div>' +
      '<div class="pval">' + nl2br(val || '') + '</div></div>';
  }

  function idBar() {
    return '<table class="idbar"><tr>' +
      '<td><b>AN</b> ' + esc(valueOf('an')) + '</td>' +
      '<td><b>HN</b> ' + esc(valueOf('hn')) + '</td>' +
      '<td class="wide"><b>ชื่อ</b> ' +
        esc([valueOf('patient_name'), valueOf('patient_surname')]
          .filter(function (x) { return x; }).join(' ')) + '</td>' +
      '<td><b>เพศ</b> ' + esc(valueOf('sex')) + '</td>' +
      '<td><b>อายุ</b> ' + esc(valueOf('age')) + '</td>' +
      '<td><b>ADMIT</b> ' + esc(thaiDate(valueOf('admit_date'))) + '</td>' +
      '<td><b>ward</b> ' + esc(valueOf('ward')) + '</td>' +
      '</tr></table>';
  }

  function categoryLabel() {
    var c = categoryList().filter(function (x) { return x.key === S.category; })[0];
    return c ? (c.th === c.en ? c.th : c.th + ' / ' + c.en) : S.category;
  }

  /* What belongs on the printed page is not what belongs on the screen.
     The form asks fifty questions so the narrative can be written from them;
     the note itself should read as prose. So the printout carries the access
     details — which cannot be inferred from a paragraph — and then the
     narrative, and nothing else. Every answer is still saved to the Sheet. */
  var PRINT_ACCESS = {
    colorectal: ['cr_approach', 'cr_position', 'cr_ports', 'cr_extraction',
      'cr_r_extraction_length', 'cr_urgency'],
    fistula: ['fi_position'],
    hemorrhoid: ['he_position'],
    others: ['ot_approach', 'ot_position']
  };

  function accessBlock() {
    var keys = PRINT_ACCESS[S.category] || [];
    var rows = '';
    keys.forEach(function (k) {
      var f = fieldByKey(k), v = valueOf(k);
      if (!f || !v) return;
      rows += row(f.th, f.en, v);
    });
    if (!rows) return '';
    return '<div class="dsec"><h5>การเข้าถึง <i>Approach</i></h5>' + rows + '</div>';
  }

  function stepsBlock() {
    var pre = { colorectal: 'cr', fistula: 'fi', hemorrhoid: 'he', others: 'ot' }[S.category] || 'ot';
    var out = '';
    [pre + '_steps', pre + '_postop'].forEach(function (k) {
      var f = fieldByKey(k), v = valueOf(k);
      if (!f || !v) return;
      out += '<div class="dsec"><h5>' + esc(f.th) + ' <i>' + esc(f.en) + '</i></h5>' +
        '<div class="ptext">' + nl2br(v) + '</div></div>';
    });
    return out || '<p class="muted">—</p>';
  }

  /* A real table, not a grid. Browsers split a grid item down the middle at a
     page boundary; a table row they move whole. Four cells to a row. */
  function imageTable(cells, cls) {
    if (!cells.length) return '';
    var rows = '', i;
    for (i = 0; i < cells.length; i += 4) {
      var row = cells.slice(i, i + 4);
      while (row.length < 4) row.push('');
      rows += '<tr>' + row.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }
    return '<table class="imgtab ' + cls + '"><tbody>' + rows + '</tbody></table>';
  }

  /* Drawings and photographs fill one grid between them. Two tables left a
     half-empty row wherever the drawings ended, and the photographs started
     again on a fresh line. */
  function imagesHTML(pngs, from) {
    var cells = [];
    for (var i = from; i < pngs.length; i++) {
      cells.push('<figure class="fig"><img src="' + pngs[i] + '" alt="">' +
        '<figcaption>' + esc(window.FIGURES[S.sheets[i].fig].en) + '</figcaption></figure>');
    }
    S.photos.forEach(function (p) {
      cells.push('<figure class="pph"><img src="' + (p.dataUrl || p.url) + '" alt="">' +
        '<figcaption>' + esc(p.caption || '') + '</figcaption></figure>');
    });
    return imageTable(cells, 'figs');
  }

  function imgVars() {
    var p = String(prefs.imgSize || '55x38').split('x');
    return '--imgw:' + (+p[0] || 55) + 'mm;--imgh:' + (+p[1] || 38) + 'mm' +
      ';--fs:' + (parseFloat(prefs.fontSize) || 12) + 'px';
  }

  function letterhead() {
    var crest = (prefs.showLogo && window.LETTERHEAD_LOGO)
      ? '<div class="crest"><img alt="" src="' + window.LETTERHEAD_LOGO + '"></div>' : '';
    return '<div class="hosphead">' + crest +
      '<div class="txt"><div class="h1">' + esc(prefs.hospital1) + '</div>' +
      '<div class="h2">' + esc(prefs.hospital2) + '</div></div></div>';
  }

  /* The printed findings box must never come out blank while the ticks say
     otherwise. Auto-fill normally puts the paragraph in the box; this is the
     backstop for a draft restored from an older build, or a box someone
     emptied by hand after ticking. */
  function printableFindings() {
    var typed = String(valueOf('findings') || '').trim();
    return typed || buildFindings(S.category);
  }

  function buildDocument(pngs) {
    var p1 =
      '<section class="pg" style="' + imgVars() + '">' +
      letterhead() +
      '<div class="formtitle"><span></span><b>รายงานการผ่าตัด (OPERATIVE NOTE)</b><span class="pgtag">หน้าแรก</span></div>' +
      '<div class="inline2">' +
      row('เลขที่ห้องผ่าตัด', 'OR room', valueOf('or_room')) +
      row('ภาควิชา', 'Department', valueOf('department') || prefs.department) +
      '</div>' +
      '<div class="inline4">' +
      row('วันที่', 'Date', thaiDate(valueOf('op_date'))) +
      row('เริ่มเวลา', 'Start', valueOf('time_start')) +
      row('เสร็จเวลา', 'Finish', valueOf('time_end')) +
      row('รวมเวลา', 'Total', fmtDuration(valueOf('time_total'))) +
      '</div>' +
      idBar() +
      row('การวินิจฉัยก่อนผ่าตัด', 'Pre-operative diagnosis', valueOf('preop_dx')) +
      row('ข้อบ่งชี้ในการผ่าตัด', 'Indication', valueOf('indication')) +
      row('จุดมุ่งหมายในการผ่าตัด', 'Aim of operation', valueOf('aim')) +
      row('การวินิจฉัยหลังผ่าตัด', 'Post-operative diagnosis', valueOf('postop_dx')) +
      row('ชนิดของการผ่าตัด', 'Operation performed', valueOf('operation')) +
      row('อวัยวะหรือสิ่งที่ถูกตัดออก', 'Organ / tissue removed', valueOf('organ_removed')) +
      row('ชิ้นเนื้อที่ส่งตรวจทางพยาธิวิทยา', 'Specimen to pathology', valueOf('pathology_sent')) +
      row('ภาวะแทรกซ้อนระหว่างผ่าตัด', 'Intra-operative complication', valueOf('intraop_complication')) +
      '<div class="inline2">' +
      row('ประมาณการเสียเลือด (มล.)', 'Estimated blood loss', valueOf('ebl')) +
      row('การให้ทดแทน', 'Replacement', valueOf('transfusion')) +
      '</div>' +
      '<div class="inline2">' +
      row('แพทย์ผู้ผ่าตัด', 'Surgeon', valueOf('surgeon')) +
      row('ผู้ช่วย', 'Assistant', valueOf('assistant')) +
      '</div>' +
      '<div class="inline2">' +
      row('แพทย์ที่ปรึกษา', 'Consultant', valueOf('consultant')) +
      row('ผู้บันทึกรายงาน', 'Recorded by', valueOf('recorder')) +
      '</div>' +
      '<div class="inline2">' +
      row('วิสัญญีแพทย์', 'Anesthetist', valueOf('anaesthetist')) +
      row('วิธีระงับความรู้สึก', 'Anesthesia', valueOf('anaesthesia')) +
      '</div>' +
      '<div class="inline2">' +
      row('พยาบาลส่งเครื่องมือ', 'Scrub nurse', valueOf('scrub_nurse')) +
      row('พยาบาลช่วยรอบนอก', 'Circulating nurse', valueOf('circulating_nurse')) +
      '</div>' +
      row('อื่น ๆ', 'Others', valueOf('others_note')) +
      '<div class="findbox"><div class="bhead">สิ่งตรวจพบ <i>Operative findings</i></div>' +
      '<div class="bbody">' +
      /* The first drawing sits inside the box, floated right, wrapped by the
         findings text. One small figure cannot overflow the page, so page 1
         stays whole; the rest go to page 2 where the narrative can follow
         straight on from them. */
      (pngs.length ? '<figure class="fig"><img src="' + pngs[0] + '" alt="">' +
        '<figcaption>' + esc(window.FIGURES[S.sheets[0].fig].en) + '</figcaption></figure>' : '') +
      nl2br(printableFindings()) +
      (valueOf('specimen_description')
        ? '<div class="speclab">คำอธิบายชิ้นเนื้อ <i>Specimen description</i></div>' +
        nl2br(valueOf('specimen_description'))
        : '') +
      '</div></div>' +
      '<div class="pgfoot"><span>ต่อหน้าหลัง</span><span>' + esc(prefs.formCode) + '</span></div>' +
      '</section>';

    var p2 =
      '<section class="pg last" style="' + imgVars() + '">' +
      '<table class="flow"><thead><tr><th>' + idBar() +
      '<div class="formtitle small"><span></span><b>รายละเอียดขั้นตอนการผ่าตัด</b>' +
      '<span class="pgtag">หน้าหลัง</span></div></th></tr></thead>' +
      '<tbody><tr><td>' +
      /* Pictures live on this page, not the first one. Page 1 is a fixed
         section, so anything overflowing it lands on a sheet of its own and
         the narrative — which belongs to this section — could never follow on
         from it. Here the figures and the narrative are one flow. */
      imagesHTML(pngs, 1) +
      accessBlock() +
      stepsBlock() +
      '<div class="signline"><span>ลงชื่อ ..........................................................</span>' +
      '<span>(' + esc(valueOf('surgeon')) + ')</span></div>' +
      '<div class="pgfoot"><span></span><span>' + esc(prefs.formCode) + '</span></div>' +
      '</td></tr></tbody></table></section>';

    return p1 + p2;
  }

  /* The findings box is a fixed height on the form, so the paragraph is
     shrunk to fit rather than the box being stretched to hold it. A box that
     grows pushes the page 1 footer onto a sheet of its own — the blank second
     page — and the printed form should look the same whatever was written. */
  function fitFindings(root) {
    var box = root.querySelector('.findbox .bbody');
    if (!box) return;
    var size = 12.5;
    box.style.fontSize = size + 'px';
    while (box.scrollHeight > box.clientHeight + 1 && size > 7.5) {
      size -= 0.25;
      box.style.fontSize = size + 'px';
    }
  }

  function refreshPreview() {
    harvest();
    return exportAllSheets().then(function (pngs) {
      var html = buildDocument(pngs);
      $('#printRoot').innerHTML = html;
      $('#previewBox').innerHTML = html;
      fitFindings($('#printRoot'));
      fitFindings($('#previewBox'));
      return pngs;
    });
  }

  /* =================== saving =================== */

  function payload(pngs) {
    harvest();
    return {
      action: S.mode === 'edit' ? 'update' : 'save',
      id: S.id || uid(),
      createdAt: S.createdAt || new Date().toISOString(),
      category: S.category,
      categoryLabel: categoryLabel(),
      data: S.data,
      sheets: S.sheets.map(function (sh) {
        return { fig: sh.fig, strokes: sh.strokes, texts: sh.texts };
      }),
      figures: pngs.map(function (d, i) {
        return { name: 'figure' + (i + 1) + '_' + S.sheets[i].fig + '.png', dataUrl: d };
      }),
      photos: S.photos.filter(function (p) { return p.dataUrl; }).map(function (p, i) {
        return { name: 'photo' + (i + 1) + '.jpg', caption: p.caption || '', dataUrl: p.dataUrl };
      })
    };
  }

  function doSave() {
    var btn = $('#btnSave');
    btn.disabled = true; btn.textContent = 'กำลังบันทึก… / Saving…';
    return refreshPreview().then(function (pngs) {
      var pl = payload(pngs);
      S.id = pl.id; S.createdAt = pl.createdAt;
      if (!scriptUrl) { queue(pl); throw new Error('ยังไม่ได้ตั้งค่า Google Sheet / Sheet not configured'); }
      return api('POST', pl).then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || 'save failed');
        S.mode = 'edit';
        toast('บันทึกเรียบร้อย / Saved to Google Sheet', 'ok');
        localStorage.removeItem(LS.draft);
      });
    }).catch(function (e) {
      toast('บันทึกลงเครื่องไว้ก่อน จะส่งเมื่อออนไลน์ / Queued locally: ' + e.message, 'warn');
    }).then(function () {
      btn.disabled = false; btn.textContent = 'บันทึก / Save';
      updateQueueBadge();
    });
  }

  function queue(pl) {
    var q = readJSON(LS.queue, []);
    q = q.filter(function (x) { return x.id !== pl.id; });
    q.push(pl);
    writeJSON(LS.queue, q);
  }

  function flushQueue() {
    var q = readJSON(LS.queue, []);
    if (!q.length || !scriptUrl) { updateQueueBadge(); return Promise.resolve(); }
    var next = q[0];
    return api('POST', next).then(function (r) {
      if (r && r.ok) {
        q.shift(); writeJSON(LS.queue, q);
        if (q.length) return flushQueue();
        toast('ส่งข้อมูลค้างขึ้นระบบครบแล้ว / Pending notes uploaded', 'ok');
      }
    }).catch(function () { /* stay queued */ })
      .then(updateQueueBadge);
  }

  function updateQueueBadge() {
    var n = readJSON(LS.queue, []).length;
    var b = $('#queueBadge');
    b.textContent = n ? n + ' รอส่ง / pending' : '';
    b.style.display = n ? 'inline-block' : 'none';
  }

  function saveDraft() {
    harvest();
    writeJSON(LS.draft, {
      at: Date.now(), id: S.id, createdAt: S.createdAt, mode: S.mode,
      category: S.category, data: S.data,
      sheets: S.sheets, photos: S.photos
    });
  }

  function restoreDraft(d) {
    S = newNote();
    S.id = d.id; S.createdAt = d.createdAt; S.mode = d.mode || 'new';
    S.category = d.category || 'colorectal';
    S.data = d.data || {};
    S.sheets = d.sheets || [];
    S.photos = d.photos || [];
    S.active = 0;
    syncCategoryUI();
    buildCommonForm(); buildCategoryForm();
    renderSheetTabs(); renderPhotos();
  }

  /* =================== search & reopen =================== */

  function runSearch() {
    var q = $('#searchQ').value.trim();
    var box = $('#searchResults');
    if (!scriptUrl) { box.innerHTML = '<p class="muted">ต้องตั้งค่า Google Sheet ก่อน / Connect the Sheet first (Settings).</p>'; return; }
    box.innerHTML = '<p class="muted">กำลังค้นหา… / Searching…</p>';
    api('GET', { action: 'list', q: q, limit: 100 }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || 'search failed');
      if (!r.rows.length) { box.innerHTML = '<p class="muted">ไม่พบข้อมูล / No matching notes.</p>'; return; }
      var t = '<table class="results"><thead><tr>' +
        '<th>วันที่ / Date</th><th>HN</th><th>AN</th><th>ชื่อ / Name</th>' +
        '<th>หมวด / Category</th><th>การผ่าตัด / Operation</th><th></th></tr></thead><tbody>';
      r.rows.forEach(function (n) {
        var days = (Date.now() - new Date(n.createdAt).getTime()) / 86400000;
        var can = days <= EDIT_WINDOW_DAYS;
        t += '<tr><td>' + esc(thaiDate(n.op_date) || '') + '</td><td>' + esc(n.hn || '') +
          '</td><td>' + esc(n.an || '') + '</td><td>' + esc(n.patient_name || '') +
          '</td><td>' + esc(n.categoryLabel || n.category || '') + '</td><td>' + esc(n.operation || '') + '</td>' +
          '<td class="act"><button class="mini" data-open="' + esc(n.id) + '">เปิด/ดูพิมพ์<br>Open</button>' +
          (can ? '<button class="mini go" data-edit="' + esc(n.id) + '">แก้ไข<br>Edit</button>'
            : '<span class="mini off" title="เกิน 30 วัน">ล็อกแล้ว<br>Locked</span>') +
          '</td></tr>';
      });
      box.innerHTML = t + '</tbody></table>';
      $$('[data-open]', box).forEach(function (b) {
        b.onclick = function () { openNote(b.dataset.open, false); };
      });
      $$('[data-edit]', box).forEach(function (b) {
        b.onclick = function () { openNote(b.dataset.edit, true); };
      });
    }).catch(function (e) {
      box.innerHTML = '<p class="muted">ค้นหาไม่สำเร็จ / Search failed: ' + esc(e.message) + '</p>';
    });
  }

  function openNote(id, editable) {
    api('GET', { action: 'get', id: id }).then(function (r) {
      if (!r || !r.ok || !r.note) throw new Error('not found');
      var n = r.note;
      S = newNote();
      S.id = n.id; S.createdAt = n.createdAt;
      S.category = n.category || 'colorectal';
      S.data = n.data || {};
      S.sheets = n.sheets || [];
      S.photos = (n.photoUrls || []).map(function (u) {
        return { url: u.url, caption: u.caption || '', name: u.name || '' };
      });
      S.mode = editable ? 'edit' : 'view';
      syncCategoryUI();
      buildCommonForm(); buildCategoryForm();
      renderSheetTabs(); renderPhotos();
      showView('new');
      gotoStep(editable ? 1 : 4);
      $('#btnSave').style.display = editable ? '' : 'none';
      $('#lockNote').style.display = editable ? 'none' : '';
      if (!editable) refreshPreview();
      toast(editable ? 'เปิดเพื่อแก้ไข / Opened for editing' : 'เปิดเพื่อดูและพิมพ์ / Opened read-only', 'ok');
    }).catch(function (e) {
      toast('เปิดไม่สำเร็จ / Could not open: ' + e.message, 'warn');
    });
  }

  /* =================== navigation =================== */

  function showView(v) {
    $$('.view').forEach(function (n) { n.classList.toggle('hidden', n.id !== 'view-' + v); });
    $$('.mainnav button').forEach(function (b) { b.classList.toggle('on', b.dataset.view === v); });
  }

  function gotoStep(n) {
    $$('.step').forEach(function (s) { s.classList.toggle('hidden', +s.dataset.step !== n); });
    $$('.stepbtn').forEach(function (b) { b.classList.toggle('on', +b.dataset.step === n); });
    $('#btnPrev').disabled = n === 1;
    $('#btnNext').style.visibility = n === 4 ? 'hidden' : '';
    if (n === 3 && S.sheets.length === 0) {
      (window.FIGURE_DEFAULTS[S.category] || ['blank']).forEach(function (k) {
        S.sheets.push({ fig: k, strokes: [], texts: [] });
      });
      S.active = 0; renderSheetTabs();
    }
    if (n === 3) { renderSheetTabs(); renderPhotos(); }
    if (n === 4) refreshPreview();
    window.scrollTo(0, 0);
  }

  function syncCategoryUI() {
    $$('#catPick .catcard').forEach(function (b) {
      b.classList.toggle('on', b.dataset.cat === S.category);
    });
  }

  function renderCategoryPicker() {
    var box = $('#catPick');
    var list = categoryList();
    if (!list.filter(function (c) { return c.key === S.category; }).length && list.length) {
      S.category = list[0].key;
    }
    box.innerHTML = '';
    list.forEach(function (c) {
      var b = el('button', 'catcard' + (c.key === S.category ? ' on' : ''));
      b.type = 'button';
      b.dataset.cat = c.key;
      b.innerHTML = bilingual(c.th, c.en);
      b.onclick = function () {
        if (S.category === c.key) return;
        /* the picker is now visible on every step, so a mis-tap on step 3
           could throw away drawings without warning */
        var loss = [];
        /* a blank sheet is not a loss — only sheets that carry marks */
        if ((S.sheets || []).some(function (sh) {
          return (sh.strokes || []).length || (sh.texts || []).length;
        })) loss.push('\u0e23\u0e39\u0e1b\u0e27\u0e32\u0e14 / the drawings on the figure sheets');
        /* an unticked checkbox is stored as false, which is not an answer */
        if (fieldsFor(S.category).some(function (f) {
          var v = S.data[f.key];
          if (v == null || v === false) return false;
          if (Array.isArray(v)) return v.length > 0;
          return v === true || String(v).trim() !== '';
        })) loss.push('\u0e04\u0e33\u0e15\u0e2d\u0e1a\u0e43\u0e19\u0e2b\u0e19\u0e49\u0e32 2 / the answers on the procedure page');
        if (loss.length && !window.confirm(
          '\u0e40\u0e1b\u0e25\u0e35\u0e48\u0e22\u0e19\u0e0a\u0e19\u0e34\u0e14\u0e01\u0e32\u0e23\u0e1c\u0e48\u0e32\u0e15\u0e31\u0e14? / Change the kind of operation?\n\n' +
          '\u0e08\u0e30\u0e25\u0e1a: / This will discard:\n\u2022 ' + loss.join('\n\u2022 '))) return;
        S.category = c.key;
        S.sheets = [];
        syncCategoryUI(); buildCategoryForm(); saveDraft();
      };
      box.appendChild(b);
    });
  }

  /* =================== settings =================== */

  function fillSettings() {
    $('#setUrl').value = scriptUrl;
    $('#setPass').value = passcode;
    $('#urlNote').textContent = SITE.scriptUrl
      ? 'ตั้งค่ามาให้แล้วในแอป ปกติไม่ต้องแก้ / Supplied with the app — normally leave as is.'
      : 'ยังไม่ได้ตั้งค่าใน config.js / Not set in config.js, so each device must paste it.';
    $('#setHosp1').value = prefs.hospital1;
    $('#setHosp2').value = prefs.hospital2;
    $('#setForm').value = prefs.formCode;
    $('#setDept').value = prefs.department;
    $('#setSurgeon').value = prefs.surgeon;
    $('#setRecorder').value = prefs.recorder;
    $('#setLogo').checked = prefs.showLogo !== false;
    $('#setImgSize').value = prefs.imgSize || '55x38';
    $('#setFontSize').value = String(prefs.fontSize || '12');
    var at = localStorage.getItem(LS.tplAt);
    $('#tplInfo').innerHTML = TEMPLATES.length + ' fields' +
      (at ? ' · updated ' + esc(new Date(at).toLocaleString()) : ' · built-in defaults') +
      ' · app build <code>' + esc(APP_BUILD) + '</code>' +
      ' · ตราสัญลักษณ์ / crest ' + (window.LETTERHEAD_LOGO ? 'loaded &#10003;' : 'NOT loaded') +
      staleFileWarning() + findingsDiagnostic();
  }

  /* Uploading app.js but not narrative.js leaves the app running new code
     against old sentences, and the only symptom is a draft that quietly
     falls back to the generic list. Each file states its own build, so the
     mismatch can be named instead of guessed at. */
  function staleFileWarning() {
    var stale = [];
    if (((window.NARRATIVE || {}).build || '') !== APP_BUILD) stale.push('narrative.js');
    if ((window.TEMPLATES_BUILD || '') !== APP_BUILD) stale.push('templates.js');
    if (!stale.length) return '';
    return '<br><b style="color:#a12f2f">ไฟล์ไม่ตรงรุ่น / out of date: ' +
      esc(stale.join(', ')) + '</b> — อัปโหลดใหม่พร้อม index.html / ' +
      're-upload these together with index.html, then reload.';
  }

  /* A diagnostic, not a feature. Three attempts at the empty findings box
     have passed here and failed on the real form, which means the fault is
     in something I cannot see: a stale narrative.js, an option spelled
     differently in the Sheet, or a category mismatch. This prints the facts
     needed to tell those apart. */
  function findingsDiagnostic() {
    var N = window.NARRATIVE || {};
    var sets = N.findings;
    if (!sets) {
      return '<br><b style="color:#a12f2f">narrative.js has no findings lists</b>' +
        ' — that file is older than app.js. Re-upload it with index.html.';
    }
    var counts = Object.keys(sets).map(function (k) {
      return esc(k) + '(' + sets[k].length + ')';
    }).join(' ');

    var lines = sets[S.category] || [];
    var matched = 0, ticked = [];
    lines.forEach(function (l) {
      var needs = l.needs || [];
      if (!needs.length || !needs.every(fieldFilled)) return;
      var first = valueOf(needs[0]);
      if (l.equals && !contains(first, l.equals)) return;
      if (l.not && contains(first, l.not)) return;
      matched++;
    });
    fieldsFor(S.category).forEach(function (f) {
      if (!/^[a-z]{2}_f_/.test(f.key)) return;
      var v = valueOf(f.key);
      if (String(v == null ? '' : v).trim()) ticked.push(f.key);
    });

    var draft = buildFindings(S.category);
    return '<br><span class="muted">findings — lists ' + counts +
      ' · category <code>' + esc(S.category) + '</code>' +
      ' · fields answered ' + ticked.length +
      ' · sentences matched ' + matched + '</span>' +
      (draft ? '<br><span class="muted">draft: ' + esc(draft.slice(0, 140)) + '…</span>'
             : '<br><b style="color:#a12f2f">draft is empty</b>' +
               (ticked.length ? ' although ' + ticked.length +
                 ' finding fields are answered (' + esc(ticked.slice(0, 6).join(', ')) + ')'
                 : ' because no finding field is answered on this note'));
  }

  function saveSettings() {
    scriptUrl = $('#setUrl').value.trim().replace(/\s+/g, '') || SITE.scriptUrl || '';
    if (scriptUrl === (SITE.scriptUrl || '')) localStorage.removeItem(LS.url);
    else localStorage.setItem(LS.url, scriptUrl);
    passcode = $('#setPass').value.trim();
    if (passcode) localStorage.setItem(LS.pass, passcode);
    else { localStorage.removeItem(LS.pass); me = null; localStorage.removeItem(LS.me); }
    applyIdentity();
    prefs.hospital1 = $('#setHosp1').value;
    prefs.hospital2 = $('#setHosp2').value;
    prefs.formCode = $('#setForm').value;
    prefs.department = $('#setDept').value;
    prefs.surgeon = $('#setSurgeon').value;
    prefs.recorder = $('#setRecorder').value;
    prefs.showLogo = $('#setLogo').checked;
    prefs.imgSize = $('#setImgSize').value;
    prefs.fontSize = $('#setFontSize').value;
    writeJSON(LS.prefs, prefs);
    toast('บันทึกการตั้งค่าแล้ว / Settings saved', 'ok');
    updateConnBadge();
  }

  function updateConnBadge() {
    var b = $('#connBadge');
    if (!scriptUrl) { b.textContent = 'ยังไม่เชื่อมต่อ Sheet / not connected'; b.className = 'badge warn'; return; }
    b.textContent = navigator.onLine ? 'เชื่อมต่อแล้ว / connected' : 'ออฟไลน์ / offline';
    b.className = 'badge ' + (navigator.onLine ? 'ok' : 'warn');
  }

  /* =================== boot =================== */

  function bind() {
    $$('.mainnav button').forEach(function (b) {
      b.onclick = function () { showView(b.dataset.view); if (b.dataset.view === 'settings') fillSettings(); };
    });
    $$('.stepbtn').forEach(function (b) { b.onclick = function () { harvest(); gotoStep(+b.dataset.step); }; });
    $('#btnPrev').onclick = function () {
      var curStep = +$$('.stepbtn.on')[0].dataset.step;
      harvest(); gotoStep(Math.max(1, curStep - 1));
    };
    $('#btnNext').onclick = function () {
      var curStep = +$$('.stepbtn.on')[0].dataset.step;
      harvest(); saveDraft();
      /* Catch the blanks while the surgeon is still on the page that has
         them, not three steps later at the printer. */
      if (curStep === 2 && !requireComplete('next')) return;
      gotoStep(Math.min(4, curStep + 1));
    };

    function onFieldChanged(e) {
      var k = e.target.dataset && e.target.dataset.key;
      if (!k) return;
      /* only a keystroke counts as taking over — a programmatic fill does not */
      if ((k === 'operation' || k === 'findings') && e.type === 'input') {
        S.data[k + '_manual'] = !!e.target.value.trim();
      }
      saveDraft(); applyVisibility();
    }
    document.addEventListener('input', onFieldChanged);
    document.addEventListener('change', onFieldChanged);
    document.addEventListener('blur', onFieldChanged, true);

    /* drawing toolbar */
    $$('#penColors button').forEach(function (b) {
      b.onclick = function () {
        tool.color = b.dataset.color; tool.mode = 'pen';
        $$('#penColors button').forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('.toolbtn').forEach(function (x) { x.classList.remove('on'); });
      };
    });
    $('#penSize').oninput = function () { tool.width = +this.value; };
    $('#toolPen').onclick = function () { tool.mode = 'pen'; markTool(this); };
    $('#toolEraser').onclick = function () { tool.mode = 'eraser'; markTool(this); };
    $('#toolText').onclick = function () { tool.mode = 'text'; markTool(this); };
    function markTool(b) { $$('.toolbtn').forEach(function (x) { x.classList.toggle('on', x === b); }); }
    $('#toolUndo').onclick = function () {
      var sh = activeSheet(); if (!sh) return;
      if (sh.strokes.length) sh.strokes.pop();
      else if (sh.texts.length) sh.texts.pop();
      redraw(); saveDraft();
    };
    $('#toolClear').onclick = function () {
      var sh = activeSheet(); if (!sh) return;
      if (!window.confirm('ล้างภาพวาดทั้งหมดในแผ่นนี้? / Clear all drawing on this sheet?')) return;
      sh.strokes = []; sh.texts = []; redraw(); saveDraft();
    };
    $('#toolDeleteSheet').onclick = function () {
      if (!S.sheets.length) return;
      if (!window.confirm('ลบแผ่นรูปนี้? / Remove this figure sheet?')) return;
      S.sheets.splice(S.active, 1);
      S.active = Math.max(0, S.active - 1);
      saveDraft();
      if (S.sheets.length) { openDraw(S.active); } else { closeDraw(); }
      renderSheetTabs();
    };
    $('#drawDone').onclick = closeDraw;
    $('#drawModal').onclick = function (e) { if (e.target === this) closeDraw(); };
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#drawModal').classList.contains('hidden')) closeDraw();
    });
    $('#photoInput').onchange = function () { addPhotos(this.files); this.value = ''; };

    /* review actions */
    $('#btnPrint').onclick = function () {
      harvest();
      if (!requireComplete('print')) return;
      refreshPreview().then(function () { window.print(); });
    };
    $('#btnSave').onclick = function () {
      harvest();
      if (!requireComplete('save')) return;
      doSave();
    };
    $('#btnRefresh').onclick = function () { refreshPreview(); };
    $('#btnNew').onclick = function () {
      if (!window.confirm('เริ่มบันทึกใหม่? ข้อมูลที่ยังไม่บันทึกจะหายไป / Start a new note? Unsaved data will be lost.')) return;
      localStorage.removeItem(LS.draft);
      S = newNote();
      S.data.op_date = todayISO();
      S.data.surgeon = prefs.surgeon;
      S.data.recorder = (me && me.name) || prefs.recorder;
      S.data.department = prefs.department;
      syncCategoryUI(); buildCommonForm(); buildCategoryForm();
      renderSheetTabs(); renderPhotos();
      $('#btnSave').style.display = ''; $('#lockNote').style.display = 'none';
      gotoStep(1);
    };

    /* search */
    $('#btnSearch').onclick = runSearch;
    $('#searchQ').addEventListener('keydown', function (e) { if (e.key === 'Enter') runSearch(); });

    /* settings */
    $('#btnSaveSettings').onclick = saveSettings;
    $('#btnTest').onclick = function () {
      saveSettings();
      var out = $('#connDiag');
      out.className = 'diag';
      out.innerHTML = 'กำลังทดสอบ… / testing…';
      var t0 = Date.now(), timings = [];
      function timedPing() {
        var t = Date.now();
        return api('GET', { action: 'ping' }).then(function (r) {
          timings.push(Date.now() - t);
          return r;
        });
      }
      timedPing().then(function (r) {
        return timedPing().then(function () { return timedPing(); }).then(function () { return r; });
      }).then(function (r) {
        if (r && r.ok) {
          var current = r.build === EXPECTED_BUILD;
          out.className = 'diag ' + (current ? 'ok' : 'warn');
          var worst = Math.max.apply(null, timings);
          var slow = worst > 4000;
          out.innerHTML = '<b>เชื่อมต่อสำเร็จ · Connection OK</b><br>' +
            'เวอร์ชันสคริปต์ / script build: <code>' + esc(r.build || 'unknown') + '</code>' +
            ' · เวอร์ชันแอป / app build: <code>' + esc(APP_BUILD) + '</code><br>' +
            'ความเร็ว 3 ครั้ง / three round trips: <b>' + timings.join(' · ') + ' ms</b><br>' +
            '<span class="en">' +
            (slow
              ? 'At least one call took ' + (worst / 1000).toFixed(1) + ' s. If the others were ' +
                'quick, Google stalled that request — it happens at random on free Apps Script ' +
                'hosting and no change in this app can prevent it. The app now makes as few ' +
                'calls as possible so you are exposed to it less often.'
              : 'All three were quick, so the script is warm and the network is fine.') +
            '</span>' +
            (current ? ' &#10003;'
              : '<br><br><b>เวอร์ชันไม่ตรงกัน</b> — แอปคาดว่าสคริปต์เป็น <code>' +
              esc(EXPECTED_BUILD) + '</code> แต่ได้ <code>' + esc(r.build || '?') + '</code>' +
              '<br><span class="en">The two halves are out of step. If the script build is the ' +
              'newer of the two, upload the current index.html and app.js to GitHub; if it is ' +
              'the older, paste the current Code.gs and deploy a New version. They work anyway ' +
              'unless a feature needs both halves.</span>');
          toast(current ? 'เชื่อมต่อสำเร็จ / Connection OK'
            : 'เชื่อมต่อได้ แต่เวอร์ชันแอปกับสคริปต์ไม่ตรงกัน / Connected, but the two versions differ',
            current ? 'ok' : 'warn');
        } else {
          out.className = 'diag warn';
          out.innerHTML = '<b>ตอบกลับผิดรูปแบบ · Unexpected reply</b><br>' + esc(JSON.stringify(r));
        }
      }).catch(function (e) {
        out.className = 'diag warn';
        out.innerHTML = '<b>เชื่อมต่อไม่ได้ · Could not reach the script</b><br>' +
          esc(e.message) + '<br><br>' +
          '<p><b>บน iPhone / iPad: ปิด “Hide IP Address” ก่อน</b><br>' +
          'ตั้งค่า ▸ แอป ▸ Safari ▸ Hide IP Address ▸ <b>Off</b><br>' +
          '<span class="en">On iPhone or iPad this is the commonest cause by far. ' +
          'iCloud Private Relay routes Safari through Apple’s servers and Google refuses the ' +
          'relayed request — the page cannot reach the script even though the same address ' +
          'opens fine in a tab. Settings ▸ Apps ▸ Safari ▸ Hide IP Address ▸ Off, then reload ' +
          'this page. Only devices with a paid iCloud+ subscription have it switched on.</span></p>' +
          '<p><b>สาเหตุถัดมา: สิทธิ์การเข้าถึงตั้งเป็น “Anyone with Google account”</b><br>' +
          '<span class="en">Next most likely: the deployment’s access is set to ' +
          '<b>Anyone with Google account</b> instead of <b>Anyone</b>. Opening the URL yourself ' +
          'then works, because your browser is signed in — but a request made by this page ' +
          'carries no Google session, is redirected to a login screen, and fails.</span></p>' +
          '<p><b>วิธีตรวจสอบ / how to confirm:</b> ' +
          '<a href="' + esc(scriptUrl) + '?action=ping" target="_blank" rel="noopener">' +
          'เปิดลิงก์นี้ในหน้าต่างส่วนตัว (incognito)</a> ' +
          '&#8212; คัดลอกลิงก์ไปเปิดในหน้าต่างที่ไม่ได้ล็อกอิน Google<br>' +
          '<span class="en">Copy that link into an incognito window. If it still prints ' +
          'ok:true you are fine; if it shows a Google sign-in page, the access setting is ' +
          'the problem.</span></p>' +
          'ตรวจสอบตามลำดับนี้ / check in this order:' +
          '<ol>' +
          '<li><b>Who has access = <code>Anyone</code></b> — ไม่ใช่ ' +
          '<code>Anyone with Google account</code><br>' +
          '<span class="en">These two sit next to each other in the dropdown and are easy to ' +
          'confuse. Only plain <b>Anyone</b> works. Execute as must be <b>Me</b>.</span></li>' +
          '<li><b>Deploy เวอร์ชันใหม่หลังแก้ Code.gs ทุกครั้ง</b><br>' +
          'Deploy &#9656; Manage deployments &#9656; ไอคอนดินสอ &#9656; Version: <b>New version</b> ' +
          '&#9656; Deploy<br>' +
          '<span class="en">Saving the code is not enough. Use the pencil icon on the existing ' +
          'deployment and pick <b>New version</b> — the URL then stays the same.</span></li>' +
          '<li>ถ้าสร้าง <i>New deployment</i> ใหม่ จะได้ URL ใหม่ ต้องนำมาวางแทนของเดิม<br>' +
          '<span class="en">Creating a fresh deployment instead gives a different /exec URL, ' +
          'which must be pasted in above.</span></li>' +
          '<li>URL ต้องลงท้ายด้วย <code>/exec</code> ไม่ใช่ <code>/dev</code><br>' +
          '<span class="en">The URL must end in /exec, not /dev.</span></li>' +
          '</ol>';
        toast('เชื่อมต่อไม่ได้ / Failed: ' + e.message, 'warn');
      });
    };
    $('#btnReloadTpl').onclick = function () { loadTemplatesFromSheet(false).then(fillSettings); };
    $('#btnBackup').onclick = function () {
      var blob = new Blob([JSON.stringify({
        prefs: prefs, templates: TEMPLATES,
        draft: readJSON(LS.draft, null), queue: readJSON(LS.queue, [])
      }, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = todayISO() + '-opnote-backup.json';
      a.click();
    };
    $('#btnFlush').onclick = function () { flushQueue(); };
    $('#btnSignOut').onclick = signOut;
    $('#btnSignOutTop').onclick = signOut;
    $('#queueBadge').onclick = function () {
      if (readJSON(LS.queue, []).length) flushQueue();
    };

    window.addEventListener('online', function () { updateConnBadge(); flushQueue(); });
    window.addEventListener('offline', updateConnBadge);
    window.addEventListener('resize', function () {
      var sh = activeSheet();
      if (sh && cv && cv.parentNode) sizeCanvas(window.FIGURES[sh.fig]);
    });
  }

  function init() {
    renderCategoryPicker();
    renderFigPicker();
    buildCommonForm();
    buildCategoryForm();
    bind();
    updateConnBadge();
    updateQueueBadge();

    var d = readJSON(LS.draft, null);
    if (d && d.data && Object.keys(d.data).length) {
      if (window.confirm('พบร่างที่ยังไม่บันทึก ต้องการเปิดต่อหรือไม่?\nAn unsaved draft was found. Continue editing it?')) {
        restoreDraft(d);
      } else {
        localStorage.removeItem(LS.draft);
        S.data.op_date = todayISO();
        buildCommonForm();
      }
    } else {
      S.data.op_date = todayISO();
      S.data.surgeon = prefs.surgeon;
      S.data.recorder = (me && me.name) || prefs.recorder;
      S.data.department = prefs.department;
      buildCommonForm();
    }

    gotoStep(1);
    applyIdentity();
    ensureAccess().then(function () {
      if (!scriptUrl) return;
      /* Templates change once in a while, not once a session. Refreshing
         them on every open added a second cold-start-prone request that
         competed with the sign-in check. Six hours, or press Reload. */
      flushQueue();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
