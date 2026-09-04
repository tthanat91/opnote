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
  var EXPECTED_BUILD = '2026-08-02p';

  /* Shown in Settings. If this is not the newest value, the browser is
     serving a cached copy of app.js — bump the ?v= tokens in index.html. */
  var APP_BUILD = '2026-08-02dh';

  var prefs = Object.assign({}, DEFAULT_PREFS, readJSON(LS.prefs, {}));
  /* Opened as a file rather than from a web address — which is how the app
     runs on a hospital computer that cannot reach colovjr.com — some browsers
     refuse localStorage outright and throw. Everything the app remembers is
     a convenience, not the record, so it falls back to remembering it for
     this session only rather than failing to start. */
  var memStore = {};
  var localStorage = (function () {
    /* Reading window.localStorage is itself what throws on a file:// page —
       "localStorage is not available for opaque origins" — so even touching
       it has to be inside the try. Taking it as an argument, as this did at
       first, evaluates it before the guard can run and the app dies before
       it draws anything. */
    try {
      var real = window.localStorage;
      real.setItem('opnote.probe', '1');
      real.removeItem('opnote.probe');
      return real;
    } catch (e) {
      return {
        getItem: function (k) { return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null; },
        setItem: function (k, v) { memStore[k] = String(v); },
        removeItem: function (k) { delete memStore[k]; }
      };
    }
  })();

  var scriptUrl = localStorage.getItem(LS.url) || SITE.scriptUrl || '';
  var passcode = localStorage.getItem(LS.pass) || '';
  var me = readJSON(LS.me, null);   /* { name, license, role } once identified */
  var TEMPLATES = readJSON(LS.tpl, null) || window.DEFAULT_TEMPLATES;

  /* =================== state =================== */

  var S = newNote();   /* S.drawKind says which picture the pen is on */

  function newNote() {
    return {
      id: null,
      createdAt: null,
      category: 'colorectal',
      data: {},
      sheets: [],
      photos: [],
      active: 0,
      drawKind: 'sheet',
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
  /* A screen that has not changed for fifteen seconds looks broken, whatever
     is happening behind it. */
  function busy(msg) {
    var n = $('#busy');
    if (!n) return;
    if (msg === false) { n.classList.add('hidden'); return; }
    $('#busyMsg').innerHTML = msg;
    n.classList.remove('hidden');
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
    /* The bundled copy that lives on the hospital computer is built with
       printOnly set: it exists to find a note and print it, and nothing on
       it can alter the record. That is not a security boundary — the Sheet
       and the passcode are — it is a guard against the wrong window being
       open when someone starts typing. */
    var ro = !!(me && me.role === 'readonly') || !!SITE.printOnly;
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

  /* =================== repeating blocks ===================
     A fistula may have one tract or five. Rather than freezing a guess into
     the Templates tab, a field of type "repeat" renders a block the surgeon
     adds to. The answers are held in ONE column as JSON, so adding a tract
     never adds a column to the Sheet, and R can read the column back as a
     list. Everything downstream — the printout, the narrative, the required
     check — sees ordinary prose, because valueOf turns the JSON into it. */

  function repeatSpec(key) {
    return (window.REPEAT_FIELDS || {})[key] || null;
  }

  function repeatRows(key) {
    var raw = S.data[key];
    if (Array.isArray(raw)) return raw;
    if (!raw) return [];
    try { var a = JSON.parse(raw); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }

  function repeatStore(key, rows) {
    S.data[key] = rows.length ? JSON.stringify(rows) : '';
  }

  var ORDINAL = ['', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

  /* One sentence per entry, so the block reads as prose wherever it lands
     rather than as a row of raw values. */
  function repeatText(key) {
    var spec = repeatSpec(key);
    if (!spec) return '';
    /* an entry the surgeon added and then left blank says nothing */
    var rows = repeatRows(key).filter(function (r) {
      return Object.keys(r || {}).some(function (k) {
        return String(r[k] == null ? '' : r[k]).trim();
      });
    });
    return rows.map(function (r, i) {
      var word = ORDINAL[i + 1] || 'further';
      var t = 'A ' + word + ' ' + (spec.en || 'entry');
      var bits = [];
      if (r.ext) bits.push('an external opening at ' + r.ext + ' o\u2019clock' +
        (r.dist ? ', ' + r.dist + ' cm from the anal verge' : ''));
      else if (r.dist) bits.push('an external opening ' + r.dist + ' cm from the anal verge');
      if (bits.length) t += ' ran from ' + bits.join('');
      if (r.course) t += (bits.length ? ', taking' : ' took') + ' ' +
        (/^[AEIOU]/i.test(r.course) ? 'an' : 'a') + ' ' +
        r.course.charAt(0).toLowerCase() + r.course.slice(1) + ' course';
      if (r.into === 'A separate internal opening') {
        t += ' to a separate internal opening' + (r.into_pos ? ' at ' + r.into_pos + ' o\u2019clock' : '');
      } else if (r.into === 'The same internal opening') {
        t += ' to the same internal opening';
      } else if (r.into) {
        t += ', with no internal opening found';
      }
      t += '.';
      /* "It was draining seton" is not English — a seton is placed in a
         tract, the tract is not the seton */
      if (/seton/i.test(r.treat || '')) {
        t += ' A ' + r.treat.charAt(0).toLowerCase() + r.treat.slice(1) + ' was placed in it.';
      } else if (r.treat) {
        t += ' It was ' + r.treat.charAt(0).toLowerCase() + r.treat.slice(1) + '.';
      }
      return t;
    }).join(' ');
  }

  function repeatControl(f) {
    var spec = repeatSpec(f.key);
    var box = el('div', 'repeatbox');

    function redraw() {
      box.innerHTML = '';
      var rows = repeatRows(f.key);
      rows.forEach(function (row, ix) {
        var card = el('div', 'repeatrow');
        var head = el('div', 'repeathead');
        head.appendChild(el('b', '', (spec.th || '') + ' ' + (ix + 2) +
          ' <span class="en">' + (spec.en || 'entry') + ' ' + (ix + 2) + '</span>'));
        var del = el('button', 'linkbtn danger',
          '\u0e25\u0e1a / remove');
        del.type = 'button';
        del.onclick = function () {
          if (!window.confirm('\u0e25\u0e1a' + (spec.th || '') + ' ' + (ix + 2) +
            '? / Remove ' + (spec.en || 'entry') + ' ' + (ix + 2) + '?')) return;
          rows.splice(ix, 1); repeatStore(f.key, rows); redraw(); saveDraft(); applyVisibility();
        };
        head.appendChild(del);
        card.appendChild(head);

        var grid = el('div', 'repeatgrid');
        spec.fields.forEach(function (sf) {
          var cell = el('div', 'repeatcell');
          cell.appendChild(el('label', 'flabel', bilingual(sf.th, sf.en)));
          var node;
          if (sf.type === 'select') {
            node = el('select');
            node.appendChild(new Option('\u2014 \u0e40\u0e25\u0e37\u0e2d\u0e01 / select \u2014', ''));
            (sf.options || []).forEach(function (o) { node.appendChild(new Option(o, o)); });
          } else {
            node = el('input');
            node.type = sf.type === 'number' ? 'number' : 'text';
            if (sf.type === 'number') node.inputMode = 'decimal';
          }
          node.value = row[sf.key] == null ? '' : row[sf.key];
          node.oninput = node.onchange = function () {
            row[sf.key] = node.value;
            repeatStore(f.key, rows);
            saveDraft();
          };
          cell.appendChild(node);
          grid.appendChild(cell);
        });
        card.appendChild(grid);
        box.appendChild(card);
      });

      var add = el('button', 'btn ghost',
        '\uff0b \u0e40\u0e1e\u0e34\u0e48\u0e21' + (spec.th || '') + ' \u00b7 Add ' + (spec.en || 'entry'));
      add.type = 'button';
      add.onclick = function () {
        rows.push({}); repeatStore(f.key, rows); redraw(); saveDraft();
      };
      box.appendChild(add);

      if (!rows.length) {
        box.appendChild(el('p', 'drafthint',
          '\u0e16\u0e49\u0e32\u0e21\u0e35\u0e17\u0e32\u0e07\u0e40\u0e14\u0e34\u0e19\u0e40\u0e14\u0e35\u0e22\u0e27 \u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e23\u0e2d\u0e01\u0e2a\u0e48\u0e27\u0e19\u0e19\u0e35\u0e49' +
          '<span class="en">Leave this empty for a single tract. Add one entry per extra tract; ' +
          'several external openings joining one internal opening are recorded by giving each ' +
          'its own entry and choosing \u201cthe same internal opening\u201d.</span>'));
      }
    }

    redraw();
    return box;
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

    if (f.type === 'repeat') {
      body.appendChild(repeatControl(f));
      wrap.appendChild(body);
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
  var TRADE_NAMES = /^(Hem-o-lok|V-Loc|Endo|LigaSure|Ligasure|Signia|Echelon|Monocryl|Vicryl|Prolene|PDS|Ethibond|Stratafix|Harmonic|Thunderbeat|Enseal|Pfannenstiel|Penrose|Volkmann|Denonvilliers|Toldt|Henle|Hartmann|Brooke|Baker|Waldeyer|Lloyd-Davies|Trendelenburg)$/i;

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
    /* Anything the findings paragraph already states has been said once on
       the page. Marking those fields as used stops the catch-all list at the
       foot of the narrative from repeating them as bullets — which is how
       the Parks type and the opening positions were appearing twice. */
    renderSentences((N.findings || {})[cat] || [], used);
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

  /* Values the surgeon does not type, worked out from ones he did. They are
     read-only, exist only for the sentence templates to quote, and have no
     row in the Templates tab — so they never appear as a question on screen
     and never take a column in the Sheet. */
  var DERIVED = {
    /* a transsphincteric tract is called high or low by how much of the
       external sphincter lies below it, and 30% is the line Ball uses */
    fi_parks_text: function () {
      var parks = String(S.data.fi_parks || '');
      if (!parks) return '';
      var pct = parseFloat(S.data.fi_sphincter_involved);
      var word = parks.charAt(0).toLowerCase() + parks.slice(1);
      if (!/transsphincteric/i.test(parks) || isNaN(pct)) return word;
      return (pct >= 30 ? 'high ' : 'low ') + word;
    }
  };

  function valueOf(key) {
    if (DERIVED[key]) return DERIVED[key]();
    var f = fieldByKey(key);
    if (!showIfOk(f)) return '';          /* the question was never asked */
    if (f && f.type === 'repeat') return repeatText(key);
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

  /* The drawing window used to be wired straight to a figure sheet. A
     photograph of the specimen wants exactly the same pen, so the window now
     asks this what it is pointed at — a diagram from the bank, or one of the
     uploaded photographs — and everything downstream is the same code. */
  function drawTarget() {
    if (S.drawKind === 'photo') {
      var p = S.photos[S.active];
      if (!p) return null;
      if (!p.strokes) p.strokes = [];
      if (!p.texts) p.texts = [];
      return {
        bg: p.dataUrl || p.url, w: p.w || 1000, h: p.h || 750,
        strokes: p.strokes, texts: p.texts,
        title: p.caption || p.name || 'photograph'
      };
    }
    var sh = activeSheet();
    if (!sh) return null;
    var f = window.FIGURES[sh.fig] || { w: 1000, h: 750 };
    return {
      bg: figSvgUrl(sh.fig), w: f.w, h: f.h,
      strokes: sh.strokes, texts: sh.texts, title: f.en
    };
  }

  function hasInk(o) {
    return !!o && (((o.strokes || []).length) || ((o.texts || []).length));
  }

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

  function openDraw(i, kind) {
    selText = -1; movingText = null;
    S.drawKind = kind || 'sheet';
    S.active = i;
    var t = drawTarget();
    if (!t) return;
    $('#drawTitle').textContent = (S.drawKind === 'photo'
      ? '\u0e23\u0e39\u0e1b\u0e16\u0e48\u0e32\u0e22 \u00b7 Photo ' : '') + (i + 1) + '. ' + (t.title || '');
    /* "remove this figure sheet" would delete the wrong thing on a photo */
    $('#toolDeleteSheet').style.display = S.drawKind === 'photo' ? 'none' : '';
    $('#drawModal').classList.remove('hidden');
    /* a photograph has whatever shape the camera gave it, and a note reopened
       from the Sheet has not been measured yet */
    if (S.drawKind === 'photo' && !S.photos[i].w) {
      loadImage(t.bg).then(function (im) {
        S.photos[i].w = im.naturalWidth || im.width || 1000;
        S.photos[i].h = im.naturalHeight || im.height || 750;
        mountCanvas();
      }, mountCanvas);
    } else mountCanvas();
  }

  function closeDraw() {
    var wasPhoto = S.drawKind === 'photo', ix = S.active;
    $('#drawModal').classList.add('hidden');
    saveDraftNow();
    renderSheetTabs();          /* the previews pick up what was just drawn */
    /* the photograph's thumbnail is the annotated version, which has to be
       composited before the card can show it */
    if (wasPhoto && S.photos[ix]) {
      exportPhotoInk(S.photos[ix]).then(renderPhotos, renderPhotos);
    } else renderPhotos();
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

  /* =================== zoom and pan ===================
     A 5 mm fistula tract drawn on a figure the width of a phone is guesswork.
     So the picture can be pinched up to six times and pushed around under
     the finger, exactly as a photograph would be.

     The view is a CSS transform on the stage, and the ink canvas is a child
     of it — so the drawing scales and moves with the picture for free, and
     no stroke has to be recomputed. Strokes are stored as fractions of the
     picture, and getBoundingClientRect already reports the transformed box,
     so the pen lands in the right place at any zoom without a line of extra
     arithmetic.

     One finger or the Pencil draws. Two fingers always mean the view, never
     a mark — which is the rule every drawing app on these devices uses. */
  var view = { k: 1, x: 0, y: 0 };

  function resetView() { view.k = 1; view.x = 0; view.y = 0; }

  /* THE REFACTOR THE TRACE ASKED FOR.

     The canvas used to live inside the stage, so CSS scaled it with the zoom
     and the compositor had to re-rasterise a magnified layer on every frame:
     932 ms of compositing against 117 ms of script, 13 frames a second.

     Now the canvas is a sibling of the stage, always exactly the size of the
     window you look through, never transformed. Only the background picture
     is scaled, and a static image scales on the GPU for nothing. The zoom is
     applied when DRAWING instead — the strokes are stored as fractions of the
     picture, so it costs one setTransform per repaint.

     The canvas is therefore the same handful of pixels whatever the zoom. */
  function stageEl() { return $('.stage', $('#canvasHost')); }
  function viewportEl() { return $('.stageview', $('#canvasHost')); }

  /* the picture's size on screen at zoom 1 — which is the viewport */
  function baseSize() {
    var st = stageEl();
    return {
      w: st ? (parseFloat(st.style.width) || st.offsetWidth || 300) : 300,
      h: st ? (parseFloat(st.style.height) || st.offsetHeight || 200) : 200
    };
  }

  /* Put the canvas into picture space: a stroke stored as 0..1 lands where the
     zoom and pan say it should, and the line thickens with the zoom because
     the drawing itself is being magnified. */
  function inkTransform() {
    var d = inkResolution();
    ctx.setTransform(d, 0, 0, d, view.x * d, view.y * d);
  }

  function inkW() { return baseSize().w * view.k; }
  function inkH() { return baseSize().h * view.k; }

  function clampView() {
    var st = stageEl();
    if (!st) return;
    var b = baseSize(), w = b.w, h = b.h;
    /* 4x, not 6x: beyond that the bitmap the compositor can afford
       is too soft to draw on, and 4x is already a 5 mm tract filling a third
       of the screen */
    view.k = Math.min(4, Math.max(1, view.k));
    /* the picture may not be dragged away from the window it sits in */
    view.x = Math.min(0, Math.max(w - w * view.k, view.x));
    view.y = Math.min(0, Math.max(h - h * view.k, view.y));
  }

  function applyView() {
    var st = stageEl();
    if (!st) return;
    clampView();
    st.style.transform = 'translate(' + view.x + 'px,' + view.y + 'px) scale(' + view.k + ')';
    forgetRect();
    /* The canvas did not move, but what it must draw did — and a pinch calls
       this on EVERY pointermove, which in the last build meant a full repaint
       of every stroke per move event. gestureMove -> applyView -> redraw was
       the second most common stack in Ball's trace. One repaint per animation
       frame is all a screen can show. */
    scheduleRedraw();
    var tag = $('#zoomTag');
    if (tag) tag.textContent = Math.round(view.k * 100) + '%';
  }

  /* Zoom about a point, so the tissue under the fingers stays under them. */
  function zoomAt(k, cx, cy) {
    var before = view.k;
    view.k = Math.min(4, Math.max(1, k));
    var f = view.k / before;
    view.x = cx - (cx - view.x) * f;
    view.y = cy - (cy - view.y) * f;
    applyView();
  }

  function mountCanvas() {
    var host = $('#canvasHost');
    var t = drawTarget();
    if (!t) { host.innerHTML = '<p class="muted">ยังไม่มีรูป — กด “เพิ่มรูป” / No figure yet — tap “Add figure”.</p>'; return; }
    host.innerHTML = '';
    /* the window the picture is seen through; the picture moves inside it */
    var vp = el('div', 'stageview');
    var stage = el('div', 'stage');
    stage.style.backgroundImage = 'url("' + t.bg + '")';
    stage.style.backgroundSize = '100% 100%';
    stage.style.backgroundRepeat = 'no-repeat';
    cv = el('canvas', 'ink');
    vp.appendChild(stage);
    vp.appendChild(cv);          /* beside the stage, not inside it */
    host.appendChild(vp);
    resetView();
    sizeCanvas(t);
    applyView();
    bindPointer();
  }

  /* Turning an iPad on its side halves the height available and doubles the
     width. Sizing the picture from its width alone — which is what this did —
     leaves a portrait figure taller than the screen, with the bottom of it
     unreachable. So the stage is fitted to BOTH dimensions of whatever space
     the window actually has, and the smaller of the two wins. */
  function fitStage(stage, t) {
    var vp = stage.parentNode;
    var host = vp.parentNode;
    var box = host.parentNode;
    var used = 0;
    Array.prototype.forEach.call(box.children, function (ch) {
      if (ch !== host) used += ch.offsetHeight + 10;
    });
    var availW = host.clientWidth || 320;
    var availH = Math.max(200, (window.innerHeight || 700) - used - 46);
    var w = availW, h = w * t.h / t.w;
    if (h > availH) { h = availH; w = h * t.w / t.h; }
    w = Math.round(w); h = Math.round(h);
    vp.style.width = w + 'px'; vp.style.height = h + 'px';
    stage.style.width = w + 'px'; stage.style.height = h + 'px';
  }

  /* Zoomed in, the ink would be a blown-up version of the pixels drawn at
     100%. Painting the bitmap larger keeps the line sharp — but only up to
     a point, because a 6x bitmap on a Retina iPad is memory nobody has. */
  /* An iPad canvas is one layer: any mark on it dirties the whole thing, and
     the whole thing is then re-rasterised and re-uploaded to the GPU. So the
     cost of a single pen stroke is set by the AREA of the canvas, not by how
     much of it changed.

     Scaling the bitmap with the zoom — 2x for the screen, times 1.94 for the
     zoom, capped at 3.5 — made a stage of about 700 x 1015 CSS pixels into a
     canvas of 2450 x 3550. Nearly nine million pixels, some thirty-five
     megabytes, re-uploaded on every frame of every stroke. That is the pause
     between letters, and it is why the earlier fixes barely helped: they were
     shaving work that ran once per stroke while this ran on every frame
     inside it.

     The cap is now on total area rather than on the ratio. Sharpness while
     zoomed is barely affected — and it does not touch the printed note at
     all, which is re-rendered from the stored strokes at full resolution
     when the PDF is built. */
  /* Ball's Safari trace settled this: over the whole recording the script
     accounted for 117 ms and COMPOSITING for 932 ms, with a median frame of
     79 ms — under 13 frames a second. Forced layout was 7 ms, so the earlier
     fixes worked; none of them could touch this, because the cost is the
     compositor re-rasterising the canvas layer, not anything JavaScript does.

     The canvas sits inside a stage that CSS scales by the zoom, so what the
     compositor must produce each frame is the canvas area TIMES the zoom
     squared. Budgeting by the canvas's own area therefore let the real cost
     grow with the zoom: at 194% a 3 Mpx canvas became 11 Mpx on screen.

     The budget is now on what the compositor actually paints. Zoomed in, the
     bitmap is smaller and the GPU magnifies it — slightly softer while
     zoomed, but the frame rate stops collapsing exactly when the surgeon has
     zoomed in to write something small. The printed note is unaffected: it is
     re-rendered from the stored strokes. */
  /* Every mark dirties the whole canvas, and the whole canvas is then handed
     to the GPU. At 3 Mpx that is 12 MB a frame, which an iPad cannot sustain:
     compositing was still 1.6 s of Ball's second trace, with a median frame
     of 93 ms. Half the pixels is half the upload, and on a figure drawn over
     with a pen the difference is not visible. */
  var MAX_COMPOSITED_PIXELS = 1.6e6;

  /* The canvas is the viewport, never the zoomed picture, so its size no
     longer has anything to do with the zoom. Device pixels, capped so that a
     large iPad in landscape does not hand the compositor more than it can
     paint in a frame. */
  function inkResolution() {
    var b = baseSize();
    var mult = Math.min(window.devicePixelRatio || 1, 2);
    var px = b.w * b.h * mult * mult;
    if (px > MAX_COMPOSITED_PIXELS) mult *= Math.sqrt(MAX_COMPOSITED_PIXELS / px);
    return Math.max(1, mult);
  }

  function rescaleInk() { /* nothing to do: the canvas no longer follows the zoom */ }

  function sizeCanvas(t) {
    var stage = stageEl();
    fitStage(stage, t);
    var b = baseSize(), mult = inkResolution();
    cv.style.width = b.w + 'px';
    cv.style.height = b.h + 'px';
    cv.width = Math.max(2, Math.round(b.w * mult));
    cv.height = Math.max(2, Math.round(b.h * mult));
    ctx = cv.getContext('2d');
    forgetRect();
    applyView();
    redraw();
  }

  function drawStroke(c, st, w, h) {
    if (!st.p.length) return;
    c.save();
    if (st.p.length === 1) {
      c.globalCompositeOperation = st.e ? 'destination-out' : 'source-over';
      c.fillStyle = st.c;
      c.beginPath();
      c.arc(st.p[0][0] * w, st.p[0][1] * h, Math.max(1, st.w * (w / 1000)) / 2, 0, Math.PI * 2);
      c.fill(); c.restore(); return;
    }
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

  function textFont(t, w) {
    /* slimmer than the old 600-weight Helvetica, and monospaced so a label
       written over a diagram reads as an annotation rather than as part of it */
    return (t.b ? '700 ' : '400 ') + Math.round(t.s * w / 1000) +
      "px 'Courier New', Courier, 'Sarabun', monospace";
  }

  function drawTextItem(c, t, w, h) {
    var size = t.s * w / 1000;
    c.save();
    c.translate(t.x * w, t.y * h);
    if (t.r) c.rotate(t.r);              /* radians, 0 unless rotated */
    c.fillStyle = t.c;
    c.font = textFont(t, w);
    c.textBaseline = 'middle';
    c.fillText(t.t, 0, 0);
    if (t.u) {
      var tw = c.measureText(t.t).width;
      c.strokeStyle = t.c;
      c.lineWidth = Math.max(1, size / 14);
      c.beginPath();
      c.moveTo(0, size * 0.42);
      c.lineTo(tw, size * 0.42);
      c.stroke();
    }
    c.restore();
  }

  /* A label is an object, the way a text box in a slide is: a frame you can
     drag by its middle, resize by the corner and turn by the handle above it.
     Everything below works in canvas pixels; the label itself stores only a
     position as a fraction of the picture, a size, and an angle. */
  function textBox(t, w, h) {
    if (!ctx) return null;
    ctx.save();
    ctx.font = textFont(t, w);
    var tw = ctx.measureText(t.t).width;
    ctx.restore();
    var th = t.s * w / 1000 * 1.35;
    return { x: t.x * w, y: t.y * h - th / 2, w: tw, h: th };
  }

  /* the four corners and the two handles, after the label's own rotation */
  function textFrame(t, w, h) {
    var b = textBox(t, w, h);
    if (!b) return null;
    var pad = 6 * (w / 1000) * 7;   /* generous: it is easier to nudge a
                                       label than to hit it exactly */
    var ox = t.x * w, oy = t.y * h, r = t.r || 0;
    var cos = Math.cos(r), sin = Math.sin(r);
    function put(dx, dy) {
      return { x: ox + dx * cos - dy * sin, y: oy + dx * sin + dy * cos };
    }
    var x0 = -pad, x1 = b.w + pad, y0 = -b.h / 2 - pad, y1 = b.h / 2 + pad;
    return {
      box: b, pad: pad,
      corners: [put(x0, y0), put(x1, y0), put(x1, y1), put(x0, y1)],
      centre: put((x0 + x1) / 2, (y0 + y1) / 2),
      resize: put(x1, y1),                     /* bottom-right */
      rotate: put((x0 + x1) / 2, y0 - b.h * 0.9),
      /* Something definite to take hold of. Dragging the letters themselves
         still works, but it competes with tapping them to retype, and on a
         short label there is little to aim at. */
      move: put(x0 - b.h * 0.55, y0 - b.h * 0.55)
    };
  }

  function near(p, q, r) {
    return (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y) <= r * r;
  }

  /* is (px,py) inside the label's frame, allowing for its rotation? */
  function inFrame(t, w, h, px, py) {
    var b = textBox(t, w, h);
    if (!b) return false;
    var r = -(t.r || 0), ox = t.x * w, oy = t.y * h;
    var dx = px - ox, dy = py - oy;
    var lx = dx * Math.cos(r) - dy * Math.sin(r);
    var ly = dx * Math.sin(r) + dy * Math.cos(r);
    var pad = 6 * (w / 1000) * 7;
    return lx >= -pad && lx <= b.w + pad && ly >= -b.h / 2 - pad && ly <= b.h / 2 + pad;
  }

  function textAt(target, u, v, w, h) {
    var texts = target.texts || [];
    for (var i = texts.length - 1; i >= 0; i--) {
      if (inFrame(texts[i], w, h, u * w, v * h)) return i;
    }
    return -1;
  }

  var selText = -1, movingText = null;

  function selectedText() {
    var t = drawTarget();
    return (t && selText >= 0 && t.texts[selText]) ? t.texts[selText] : null;
  }

  /* Everything you can do to a label, in one place that appears only when a
     label is selected. Buried in the main toolbar these read as drawing
     tools; here they plainly belong to the thing with the dashed box round
     it. */
  function setSelectedText(i) {
    selText = i;
    var bar = $('#textBar');
    if (bar) bar.style.display = i >= 0 ? '' : 'none';
    syncTextBar();
    redraw();
  }

  function syncTextBar() {
    var t = selectedText();
    if (!t) return;
    var b = $('#txtBold'), u = $('#txtUnder');
    if (b) b.classList.toggle('on', !!t.b);
    if (u) u.classList.toggle('on', !!t.u);
  }

  /* Typing into a box on the picture, not answering a dialog. window.prompt
     blocks the whole page — it was 1535 of the 1690 samples in one of Ball's
     traces — and it is the wrong gesture: a label should be typed where it
     sits, with the keyboard coming up as it does anywhere else. */
  function openTextEditor(create) {
    var t = selectedText();
    if (!t) return;
    var vp = viewportEl();
    if (!vp) return;
    var box = $('.inkedit', vp) || (function () {
      var i = el('input', 'inkedit');
      i.type = 'text';
      vp.appendChild(i);
      return i;
    })();
    /* Sit the box exactly where the label is. t.y is the label's CENTRE line,
       so the box is centred on it once its real height is known, and the
       padding and border are subtracted so the first letter starts where the
       first letter will end up. The label's own angle is applied too. */
    var w = inkW(), h = inkH();
    var fs = Math.max(13, Math.round(t.s * w / 1000));
    box.style.display = 'block';
    box.style.fontSize = fs + 'px';
    box.style.fontWeight = t.b ? '700' : '400';
    box.style.color = t.c;
    box.style.transform = 'none';
    box.value = t.t;
    var lead = box.clientLeft + parseFloat(getComputedStyle(box).paddingLeft || 0);
    var bh = box.offsetHeight || (fs * 1.2 + 10);
    var lx = view.x + t.x * w - lead;
    var ly = view.y + t.y * h - bh / 2;
    /* never let it hide outside the window it is drawn in */
    lx = Math.max(2, Math.min(lx, Math.max(2, vp.clientWidth - 90)));
    ly = Math.max(2, Math.min(ly, Math.max(2, vp.clientHeight - bh - 2)));
    box.style.left = Math.round(lx) + 'px';
    box.style.top = Math.round(ly) + 'px';
    if (t.r) {
      box.style.transformOrigin = (lead + 1) + 'px 50%';
      box.style.transform = 'rotate(' + t.r + 'rad)';
    }
    box.focus();
    if (box.setSelectionRange) box.setSelectionRange(box.value.length, box.value.length);

    function done(keep) {
      box.style.display = 'none';
      box.onblur = box.onkeydown = null;
      var cur2 = selectedText();
      if (!cur2) return;
      if (keep && box.value.trim()) { cur2.t = box.value; redraw(); saveInk(); }
      else if (create) { deleteSelectedText(); }
      else if (keep) { deleteSelectedText(); }   /* emptied means removed */
    }
    box.onblur = function () { done(true); };
    box.onkeydown = function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); done(true); }
      else if (ev.key === 'Escape') { ev.preventDefault(); done(false); }
    };
  }

  function editSelectedText(field, delta) {
    var t = selectedText();
    if (!t) return;
    if (field === 'words') {
      openTextEditor(false);
      return;
    } else if (field === 'size') {
      t.s = Math.max(10, Math.min(160, (t.s || 30) + delta));
    } else if (field === 'rotate') {
      t.r = ((t.r || 0) + delta * Math.PI / 180);
    } else if (field === 'bold') {
      t.b = !t.b;
    } else if (field === 'under') {
      t.u = !t.u;
    }
    syncTextBar();
    redraw(); saveInk();
  }

  function deleteSelectedText() {
    var target = drawTarget();
    if (!target || selText < 0) return;
    target.texts.splice(selText, 1);
    setSelectedText(-1); saveInk();
  }

  var redrawPending = false;

  /* Coalesced to one repaint per animation frame. Defined out here beside the
     real redraw — it was first written next to the OTHER function called
     redraw, the one nested inside the repeating-block control, where it was
     invisible to everything that needed it and drawing stopped working
     altogether. */
  function scheduleRedraw() {
    if (!ctx || redrawPending) return;
    redrawPending = true;
    if (window.requestAnimationFrame) {
      /* called through window: extracted and called bare it throws in Safari */
      window.requestAnimationFrame(function () { redrawPending = false; redraw(); });
    } else {
      setTimeout(function () { redrawPending = false; redraw(); }, 16);
    }
  }

  function redraw() {
    var d = drawTarget();
    if (!ctx || !d) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    inkTransform();
    var w = inkW(), h = inkH();
    d.strokes.forEach(function (st) { drawStroke(ctx, st, w, h); });
    d.texts.forEach(function (t) { drawTextItem(ctx, t, w, h); });
    var sel = selectedText();
    if (sel) {
      var fr = textFrame(sel, w, h);
      if (fr) {
        var lw = Math.max(1, w / 600), hr = Math.max(6, w / 90);
        ctx.save();
        ctx.strokeStyle = '#0e7a6d';
        ctx.lineWidth = lw;
        ctx.setLineDash([w / 90, w / 140]);
        ctx.beginPath();
        ctx.moveTo(fr.corners[0].x, fr.corners[0].y);
        for (var ci = 1; ci < 4; ci++) ctx.lineTo(fr.corners[ci].x, fr.corners[ci].y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
        /* the stalk up to the rotate handle */
        ctx.beginPath();
        ctx.moveTo((fr.corners[0].x + fr.corners[1].x) / 2, (fr.corners[0].y + fr.corners[1].y) / 2);
        ctx.lineTo(fr.rotate.x, fr.rotate.y);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        [fr.resize, fr.rotate, fr.move].forEach(function (p) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, hr, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        });
        /* the cross inside the move handle */
        ctx.beginPath();
        ctx.moveTo(fr.move.x - hr * 0.55, fr.move.y);
        ctx.lineTo(fr.move.x + hr * 0.55, fr.move.y);
        ctx.moveTo(fr.move.x, fr.move.y - hr * 0.55);
        ctx.lineTo(fr.move.x, fr.move.y + hr * 0.55);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* THE ONE THAT COST A SECOND.

     getBoundingClientRect forces the browser to lay the page out then and
     there. This ran once per POINT — and an Apple Pencil reports around 240
     points a second, every one of them re-laying out a page holding the whole
     form and a transformed stage. Hundreds of forced layouts per stroke.

     The canvas cannot move while a stroke is in progress: the modal is fixed,
     the page cannot scroll, and zoom needs two fingers, which cancels the
     stroke. So the rectangle is measured once when the pen goes down and
     reused until something that could actually change it happens. */
  var cvRect = null;

  function forgetRect() { cvRect = null; }

  /* Rounded here rather than in one sweep when the pen lifts: the same work,
     a thousandth at a time, on the frames that have room for it instead of
     the one instant that has none. 1/10 000 of the picture is a fifth of a
     pixel, so nothing visible is lost. */
  function pos(e) {
    var r = cvRect || (cvRect = cv.getBoundingClientRect());
    /* the canvas is the window, so undo the pan and the zoom to get back to
       the fraction of the PICTURE the pen is over */
    var b = baseSize();
    return [
      Math.round(((e.clientX - r.left) - view.x) / (b.w * view.k) * 1e4) / 1e4,
      Math.round(((e.clientY - r.top) - view.y) / (b.h * view.k) * 1e4) / 1e4
    ];
  }

  /* Why drawing lagged: every pointermove redrew EVERY stroke on the sheet
     from scratch. The tenth stroke therefore cost ten times the first, and a
     Pencil reporting 240 points a second made it worse, not better. Now only
     the new piece of the current stroke is painted, and only once per frame.
     A full redraw happens when the stroke ends, so what is exported is the
     same smoothed path as before. */
  /* Text is painted after every stroke, so an eraser stroke could never
     remove it — it was rubbed out and then drawn again on the next repaint,
     which is why an erased label came back in the thumbnail. The eraser now
     deletes any label it is dragged across. */
  function eraseTextsUnder(target, stroke) {
    if (!target || !stroke || !stroke.p.length) return;
    var w = inkW(), h = inkH();
    var reach = Math.max(12, stroke.w * (w / 1000) * 1.2);
    var gone = false;
    for (var i = (target.texts || []).length - 1; i >= 0; i--) {
      var b = textBox(target.texts[i], w, h);
      if (!b) continue;
      for (var j = 0; j < stroke.p.length; j++) {
        var px = stroke.p[j][0] * w, py = stroke.p[j][1] * h;
        if (px >= b.x - reach && px <= b.x + b.w + reach &&
            py >= b.y - reach && py <= b.y + b.h + reach) {
          target.texts.splice(i, 1); gone = true; break;
        }
      }
    }
    if (gone) { setSelectedText(-1); redraw(); }
  }

  var inkPending = false;

  /* THE WAIT AFTER THE PENCIL COMES BACK DOWN.

     Nothing was painted until (a) a second point had arrived and (b) the
     browser granted an animation frame. Batching by frame is right in the
     middle of a stroke — a Pencil reports four times faster than the screen
     refreshes — but it is wrong at the start of one, where it means the mark
     waits for a frame that has just been committed. Crossing the bar of a "T"
     is exactly that case: down, and nothing there yet.

     So the first touch is painted THERE AND THEN, and so is the first segment
     after it. Only once the stroke is under way does it fall back to one
     paint per frame. */
  function drawTail() {
    inkPending = false;
    if (!ctx || !cur || !cur.p.length) return;
    inkTransform();
    var w = inkW(), h = inkH();
    var lw = Math.max(1, cur.w * (w / 1000));
    ctx.save();
    ctx.globalCompositeOperation = cur.e ? 'destination-out' : 'source-over';
    ctx.strokeStyle = cur.c;
    ctx.fillStyle = cur.c;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!cur.drawn) {
      ctx.beginPath();
      ctx.arc(cur.p[0][0] * w, cur.p[0][1] * h, lw / 2, 0, Math.PI * 2);
      ctx.fill();
      cur.drawn = 1;
    }
    var from = cur.drawn;
    if (from < cur.p.length) {
      ctx.beginPath();
      var a0 = cur.p[from - 1];
      ctx.moveTo(a0[0] * w, a0[1] * h);
      for (var i = from; i < cur.p.length; i++) {
        var a = cur.p[i - 1], b = cur.p[i];
        ctx.quadraticCurveTo(a[0] * w, a[1] * h, (a[0] + b[0]) / 2 * w, (a[1] + b[1]) / 2 * h);
      }
      ctx.stroke();
      cur.drawn = cur.p.length;
    }
    ctx.restore();
  }

  /* Every finger and pen currently on the glass. Two or more of them mean
     the view is being moved, not drawn on. */
  var live = {};

  function livePoints() {
    var out = [];
    for (var k in live) if (live.hasOwnProperty(k)) out.push(live[k]);
    return out;
  }

  /* WHY THE SECOND STROKE OF A "T" WOULD NOT START.
     A pinch was declared whenever two entries sat in `live`, and entries were
     removed only by a pointerup that reached the viewport. A palm whose
     pointercancel never arrived, or a finger lifted off the edge of the glass,
     therefore left a ghost behind for the rest of the session — and from then
     on EVERY pen-down saw "two points", called it a gesture and threw the
     stroke away. Nothing appears in a performance trace, because nothing runs:
     the mark is simply discarded. Two defences:
       - only fingers pinch. An Apple Pencil cannot, so a pen stroke is never
         refused on these grounds again;
       - a contact nobody has heard from in two seconds is a ghost, and is
         forgotten before it can block anything. */
  var GHOST_MS = 2000;

  function sweepGhosts() {
    var now = Date.now();
    for (var k in live) {
      if (live.hasOwnProperty(k) && now - (live[k].seen || 0) > GHOST_MS) delete live[k];
    }
  }

  function touchPoints() {
    sweepGhosts();
    var out = [];
    for (var k in live) {
      if (live.hasOwnProperty(k) && live[k].t !== 'pen') out.push(live[k]);
    }
    return out;
  }

  function pinching() { return touchPoints().length >= 2; }

  function abandonStroke(target) {
    /* a second finger landing turns what had begun as a mark into a gesture,
       and the half-drawn line must not be left behind */
    if (!drawing) return;
    drawing = false;
    if (cur && target && target.strokes[target.strokes.length - 1] === cur) {
      target.strokes.pop();
    }
    cur = null;
    redraw();
  }

  var gesture = null;

  function gestureStart() {
    var p = livePoints();
    if (p.length < 2) { gesture = null; return; }
    var dx = p[0].x - p[1].x, dy = p[0].y - p[1].y;
    gesture = {
      dist: Math.max(1, Math.hypot(dx, dy)),
      cx: (p[0].x + p[1].x) / 2, cy: (p[0].y + p[1].y) / 2,
      k: view.k, x: view.x, y: view.y
    };
  }

  function gestureMove() {
    var p = livePoints();
    if (!gesture || p.length < 2) return;
    var st = stageEl();
    if (!st) return;
    var r = st.parentNode.getBoundingClientRect();
    var dx = p[0].x - p[1].x, dy = p[0].y - p[1].y;
    var dist = Math.max(1, Math.hypot(dx, dy));
    var cx = (p[0].x + p[1].x) / 2, cy = (p[0].y + p[1].y) / 2;
    /* zoom about where the fingers started, then follow where they moved */
    var k = Math.min(4, Math.max(1, gesture.k * (dist / gesture.dist)));
    var ax = gesture.cx - r.left, ay = gesture.cy - r.top;
    var f = k / gesture.k;
    view.k = k;
    view.x = ax - (ax - gesture.x) * f + (cx - gesture.cx);
    view.y = ay - (ay - gesture.y) * f + (cy - gesture.cy);
    applyView();
  }

  function watchGeometry() {
    if (watchGeometry.done) return;
    watchGeometry.done = true;
    ['resize', 'orientationchange', 'scroll'].forEach(function (ev) {
      window.addEventListener(ev, forgetRect, true);
    });
  }

  function bindPointer() {
    watchGeometry();
    cv.style.touchAction = 'none';
    var vp = cv.parentNode.parentNode;
    vp.style.touchAction = 'none';

    /* the gesture is watched on the window the picture sits in, so it keeps
       working when a finger strays off the picture itself */
    vp.addEventListener('pointerdown', function (e) {
      sweepGhosts();
      live[e.pointerId] = { x: e.clientX, y: e.clientY, t: e.pointerType, seen: Date.now() };
      if (pinching()) {
        abandonStroke(drawTarget());
        gestureStart();
      }
    });
    vp.addEventListener('pointermove', function (e) {
      if (!live[e.pointerId]) return;
      live[e.pointerId].x = e.clientX;
      live[e.pointerId].y = e.clientY;
      live[e.pointerId].seen = Date.now();
      if (pinching()) { gestureMove(); e.preventDefault(); }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      vp.addEventListener(ev, function (e) {
        var many = pinching();
        delete live[e.pointerId];
        if (!pinching()) {
          gesture = null;
          /* redraw the ink at the resolution the new zoom deserves */
          if (many) rescaleInk();
        } else gestureStart();
      });
    });
    /* a trackpad pinch arrives as ctrl+wheel; a plain wheel scrolls the view */
    vp.addEventListener('wheel', function (e) {
      var r = vp.getBoundingClientRect();
      if (e.ctrlKey) {
        e.preventDefault();
        zoomAt(view.k * (1 - e.deltaY / 400), e.clientX - r.left, e.clientY - r.top);
        rescaleInk();
      } else if (view.k > 1) {
        e.preventDefault();
        view.x -= e.deltaX; view.y -= e.deltaY;
        applyView();
      }
    }, { passive: false });

    /* belt and braces: the stylesheet stops the selection being drawn, these
       stop it being started at all — Safari begins one on pointerdown before
       any CSS has a say, and a started selection keeps costing on every move */
    ['selectstart', 'dragstart', 'contextmenu'].forEach(function (ev) {
      vp.addEventListener(ev, function (e) { e.preventDefault(); });
      cv.addEventListener(ev, function (e) { e.preventDefault(); });
    });

    cv.addEventListener('pointerdown', function (e) {
      var sh = drawTarget(); if (!sh) return;
      if (e.pointerType !== 'pen' && pinching()) return;   /* a gesture */
      e.preventDefault();
      if (tool.mode === 'text') {
        var p = pos(e), w = inkW(), h = inkH();
        var px = p[0] * w, py = p[1] * h;

        /* the handles of the label already selected come first: they sit
           outside its frame, so they must be tested before anything else */
        var sel = selectedText();
        if (sel) {
          var fr = textFrame(sel, w, h);
          var grab = Math.max(14, w / 40);   /* a handle you can hit with a thumb */
          if (fr && near({ x: px, y: py }, fr.rotate, grab)) {
            movingText = { i: selText, mode: 'rotate',
              a0: Math.atan2(py - sel.y * h, px - sel.x * w), r0: sel.r || 0 };
            cv.setPointerCapture(e.pointerId); return;
          }
          if (fr && near({ x: px, y: py }, fr.move, grab)) {
            movingText = { i: selText, mode: 'move',
              dx: p[0] - sel.x, dy: p[1] - sel.y };
            cv.setPointerCapture(e.pointerId); return;
          }
          if (fr && near({ x: px, y: py }, fr.resize, grab)) {
            movingText = { i: selText, mode: 'resize', s0: sel.s,
              d0: Math.max(1, Math.hypot(px - sel.x * w, py - sel.y * h)) };
            cv.setPointerCapture(e.pointerId); return;
          }
        }

        var hit = textAt(sh, p[0], p[1], w, h);
        if (hit > -1) {
          /* tapping the one already selected means "let me change the words" */
          if (hit === selText) { editSelectedText('words'); return; }
          setSelectedText(hit);
          movingText = { i: hit, mode: 'move',
            dx: p[0] - sh.texts[hit].x, dy: p[1] - sh.texts[hit].y };
          cv.setPointerCapture(e.pointerId);
          return;
        }
        /* A tap that misses lets go of what was held. Creating a label on
           every miss is what made a fumbled attempt to move one produce a
           new one instead. */
        if (selText > -1) { setSelectedText(-1); return; }
        sh.texts.push({ t: '', x: p[0], y: p[1], c: tool.color,
          s: 26 + tool.width * 4, r: 0, b: false, u: false });
        setSelectedText(sh.texts.length - 1);
        openTextEditor(true);
        return;
      }
      if (selText > -1) setSelectedText(-1);   /* drawing deselects */
      cv.setPointerCapture(e.pointerId);
      /* This measured the canvas afresh on EVERY pen-down — the forced page
         layout I thought I had removed by dropping forgetRect() from the pen
         lift, put back three lines later by overwriting the cache anyway. The
         cache is now trusted: it is emptied only when something that can
         actually move the canvas happens. */
      if (!cvRect) cvRect = cv.getBoundingClientRect();
      drawing = true;
      cur = { c: tool.color, w: tool.mode === 'eraser' ? tool.width * 5 : tool.width, e: tool.mode === 'eraser', p: [pos(e)] };
      sh.strokes.push(cur);
      drawTail();          /* a mark under the nib before the hand has moved */
    });
    cv.addEventListener('pointermove', function (e) {
      if (movingText) {
        var t = drawTarget(); if (!t) return;
        var it = t.texts[movingText.i];
        if (!it) return;
        var q = pos(e), w2 = inkW(), h2 = inkH();
        var qx = q[0] * w2, qy = q[1] * h2;
        if (movingText.mode === 'rotate') {
          it.r = movingText.r0 +
            (Math.atan2(qy - it.y * h2, qx - it.x * w2) - movingText.a0);
        } else if (movingText.mode === 'resize') {
          var d = Math.max(1, Math.hypot(qx - it.x * w2, qy - it.y * h2));
          it.s = Math.max(10, Math.min(200, movingText.s0 * (d / movingText.d0)));
        } else {
          it.x = q[0] - movingText.dx;
          it.y = q[1] - movingText.dy;
        }
        scheduleRedraw();
        return;
      }
      if (!drawing || !cur) return;
      if (e.pointerType !== 'pen' && pinching()) { abandonStroke(drawTarget()); return; }
      /* an Apple Pencil reports far faster than the screen refreshes; taking
         the coalesced events keeps the curve smooth without painting each */
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (var i = 0; i < evs.length; i++) cur.p.push(pos(evs[i]));
      if (cur.drawn < 2) { drawTail(); return; }   /* the opening of a stroke
                                                     does not wait for a frame */
      if (!inkPending) {
        inkPending = true;
        if (window.requestAnimationFrame) window.requestAnimationFrame(drawTail);
        else setTimeout(drawTail, 16);
      }
    });
    /* Safari takes the capture away when a contact ends abnormally; without
       this the entry would linger and become one of the ghosts above. */
    cv.addEventListener('lostpointercapture', function (e) { delete live[e.pointerId]; });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      cv.addEventListener(ev, function (e) {
        delete live[e.pointerId];
        if (movingText) { movingText = null; saveInk(); return; }
        if (!drawing) return;
        drawing = false;
        if (cur && cur.e) eraseTextsUnder(drawTarget(), cur);
        /* Everything that used to happen here is gone. The points are already
           rounded, the ink is already painted, and no repaint is needed. All
           that is left is to stop pointing at the finished stroke. */
        if (cur) delete cur.drawn;   /* a paint cursor, not part of the record */
        cur = null;
        /* The rectangle was thrown away here, so the FIRST thing every new
           stroke did was force the browser to lay the whole page out again
           before a single pixel of ink could be painted. Nothing between one
           stroke and the next can move the canvas — the window is fixed, the
           page cannot scroll, and zooming needs two fingers. It is measured
           again when the view, the size or the orientation actually change. */
        /* No repaint here. drawTail has already painted this stroke, and
           redrawing every stroke on the sheet each time the pen lifts is the
           last of the per-stroke costs — the one felt between letters, where
           lifts come a dozen to the word. The full redraw still happens
           where it is actually needed: mounting, undo, clear and zoom. */
        saveInk();
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
      var layer = inkLayer(sh, w, h);
      if (layer) x.drawImage(layer, 0, 0);
      return c.toDataURL('image/png');
    });
  }

  /* The printed note and the copy filed in Drive both want the photograph
     with its annotation burned in. The original is never touched — it is
     what the specimen looked like, and it is uploaded unchanged. */
  /* The ink is composited on a transparent sheet of its own and then laid
     over the picture — which is exactly what happens on screen, where the
     canvas floats above a CSS background.

     Doing it in one pass was the bug behind the black smears: the eraser
     works by punching a hole through whatever is already on the canvas
     ("destination-out"), so with the photograph painted underneath it, the
     eraser cut a hole through the PHOTOGRAPH as well. A hole is transparent,
     and transparency saved as JPEG comes out black. On its own layer the
     eraser can only reach the ink. */
  function inkLayer(o, w, h) {
    if (!hasInk(o)) return null;
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    (o.strokes || []).forEach(function (st) { drawStroke(x, st, w, h); });
    (o.texts || []).forEach(function (t) { drawTextItem(x, t, w, h); });
    return c;
  }

  function exportPhotoInk(p) {
    var src = p.dataUrl || p.url;
    if (!src) return Promise.resolve('');
    if (!hasInk(p)) { p.inkUrl = ''; return Promise.resolve(src); }
    return loadImage(src).then(function (img) {
      var nw = img.naturalWidth || img.width || 1200;
      var nh = img.naturalHeight || img.height || 900;
      var w = Math.min(1600, nw), h = Math.round(w * nh / nw);
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      x.drawImage(img, 0, 0, w, h);
      var layer = inkLayer(p, w, h);
      if (layer) x.drawImage(layer, 0, 0);
      p.inkUrl = c.toDataURL('image/jpeg', 0.92);
      return p.inkUrl;
    }, function () { p.inkUrl = ''; return src; });
  }

  function exportAllPhotos() {
    return Promise.all(S.photos.map(function (p) { return exportPhotoInk(p); }));
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
            S.photos.push({
              name: file.name, caption: '',
              dataUrl: c.toDataURL('image/jpeg', 0.85),
              /* measured now so the annotation canvas opens at the right
                 shape without having to load the picture again */
              w: c.width, h: c.height,
              strokes: [], texts: []
            });
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
      card.innerHTML = '<img src="' + (p.inkUrl || p.dataUrl || p.url) + '" alt="">';
      var cap = el('input');
      cap.type = 'text'; cap.placeholder = 'คำบรรยาย / caption'; cap.value = p.caption || '';
      cap.oninput = function () { p.caption = cap.value; saveDraft(); };
      var draw = el('button', 'linkbtn',
        '\u270e \u0e27\u0e32\u0e14 / annotate');
      draw.type = 'button';
      draw.onclick = function () { openDraw(i, 'photo'); };
      var del = el('button', 'linkbtn danger', 'ลบ / remove');
      del.type = 'button';
      del.onclick = function () {
        if (hasInk(p) && !window.confirm(
          '\u0e25\u0e1a\u0e23\u0e39\u0e1b\u0e19\u0e35\u0e49\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e20\u0e32\u0e1e\u0e27\u0e32\u0e14\u0e1a\u0e19\u0e19\u0e31\u0e49\u0e19? / ' +
          'Remove this photograph and the drawing on it?')) return;
        S.photos.splice(i, 1); renderPhotos(); saveDraft();
      };
      card.appendChild(cap); card.appendChild(draw); card.appendChild(del);
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
      if (f.type === 'heading' || f.type === 'checkbox' || f.type === 'repeat') return;
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
    var pre = { colorectal: 'cr', fistula: 'fi', hemorrhoid: 'he', stoma: 'st', others: 'ot' }[S.category] || 'ot';
    var out = '';
    [pre + '_steps', pre + '_postop'].forEach(function (k) {
      var f = fieldByKey(k), v = valueOf(k);
      if (!f || !v) return;
      /* One element per line, not one block with <br> between. The page can
         only be cut where an element ends, so a narrative written as a
         single block offered no cut between "Approach" and the end of the
         steps — the slicer had to break before the whole section and leave
         the rest of the sheet blank. A line each, and it can break anywhere
         sensible. */
      var lines = String(v).split(/\n/).map(function (ln) {
        return '<div class="pline">' + esc(ln) + '</div>';
      }).join('');
      out += '<div class="dsec"><h5>' + esc(f.th) + ' <i>' + esc(f.en) + '</i></h5>' +
        '<div class="ptext">' + lines + '</div></div>';
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
      cells.push('<figure class="pph"><img src="' + (p.inkUrl || p.dataUrl || p.url) + '" alt="">' +
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

  /* How many drawings belong inside the findings box rather than on page 2.
     A fistula is read from the axial, coronal and tract views together — one
     of them alone says nothing — so all three sit beside the paragraph that
     interprets them. Every other operation keeps a single figure there. */
  function inBoxCount(pngs) {
    if (S.category === 'fistula') return Math.min(3, pngs.length);
    return pngs.length ? 1 : 0;
  }

  function boxFigures(pngs) {
    var n = inBoxCount(pngs);
    if (!n) return '';
    var figs = '', i;
    for (i = 0; i < n; i++) {
      var f = window.FIGURES[S.sheets[i].fig] || {};
      figs += '<figure class="fig"><img src="' + pngs[i] + '" alt="">' +
        '<figcaption>' + esc(n > 1 ? (f.short || f.en || '') : (f.en || '')) +
        '</figcaption></figure>';
    }
    /* no caption under the set: three labelled views sitting together in
       one frame already say they belong together, and the line cost a row
       of height that the figures themselves can use */
    /* At 1.7x the three views are 56 mm across — together they span the full
       width of the box, so there is no column left for the paragraph to wrap
       into. The set therefore stops floating and sits as a band across the
       top, with the findings written underneath it. */
    if (n === 1) return figs;
    return '<div class="figset">' + figs + '</div>';
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
      '<div class="findbox' + (inBoxCount(pngs) > 1 ? ' tall' : '') + '">' +
      '<div class="bhead">สิ่งตรวจพบ <i>Operative findings</i></div>' +
      '<div class="bbody">' +
      /* The first drawing sits inside the box, floated right, wrapped by the
         findings text. One small figure cannot overflow the page, so page 1
         stays whole; the rest go to page 2 where the narrative can follow
         straight on from them. */
      boxFigures(pngs) +
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
      imagesHTML(pngs, inBoxCount(pngs)) +
      accessBlock() +
      stepsBlock() +
      '<div class="signline"><span>ลงชื่อ ..........................................................</span>' +
      '<span>(' + esc(valueOf('surgeon')) + ')</span></div>' +
      '<div class="pgfoot"><span></span><span>' + esc(prefs.formCode) + '</span></div>' +
      '</td></tr></tbody></table></section>';

    return p1 + p2;
  }

  /* The findings box belongs at the foot of page 1, and page 1 belongs on one
     sheet. Fixing the box at 78 mm made both true only as long as everything
     above it stayed the same height — and embedding Sarabun changed the
     height of every row on the page, so the box no longer fitted and
     break-inside:avoid moved the whole thing, figure and all, to a sheet of
     its own.

     So the height is measured rather than assumed: shrink the box to nothing,
     see how much of the sheet the rest of page 1 uses, and give the box what
     is left. It then ends exactly at the foot of the page whatever the
     operation, the font or the number of rows. */
  var MM_PX = 96 / 25.4;

  function fitPageOne() {
    /* Measured on the PREVIEW, never on #printRoot: that one is display:none
       until the browser prints, so every height read from it is zero. Asking
       a hidden element how tall it is and then sizing the findings box from
       the answer is what pushed the box onto a sheet of its own — the very
       bug this function was written to fix.

       The height is computed once from the copy that is actually laid out,
       then applied to both. */
    var pg = $('#previewBox .pg:not(.last)');
    var body = pg && pg.querySelector('.findbox .bbody');
    if (!body) return;
    var floor = 40 * MM_PX;                 /* never squeeze it below this */
    body.style.height = floor + 'px';
    var rest = pg.getBoundingClientRect().height - floor;
    if (rest <= 0) return;                  /* not laid out — leave the CSS */
    var room = (PDF_H * MM_PX) - rest - 2;  /* a hair, for rounding */
    var h = Math.max(floor, Math.floor(room));
    body.style.height = h + 'px';
    var twin = $('#printRoot .findbox .bbody');
    if (twin) twin.style.height = h + 'px';
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

  /* =================== PDF file ===================

     iOS stamps the address and the date onto any WEB PAGE it prints, and
     Apple removed the setting that used to turn it off — so on an iPad the
     printed form can never come out clean. It adds nothing to a PDF file.
     So the app photographs each A4 page and assembles a real PDF, which the
     surgeon prints from Files instead.

     The pages go in as images rather than as text. That is a deliberate
     trade: the file is larger and the text cannot be selected, but what
     comes out is pixel-for-pixel the form that was reviewed on screen —
     no font substitution, no reflow, no Thai shaping surprises on a device
     I cannot test. For a document that is signed and filed, looking exactly
     right matters more than being searchable.

     The two libraries load from the CDN on first use only, so opening the
     app costs nothing and everything else still works without a network. */

  var PDF_LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  ];
  var pdfLibs = null;

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var t = document.createElement('script');
      t.src = src;
      t.onload = function () { res(); };
      t.onerror = function () { rej(new Error('cannot load ' + src)); };
      document.head.appendChild(t);
    });
  }

  function ensurePdfLibs() {
    if (window.html2canvas && window.jspdf) return Promise.resolve();
    if (!pdfLibs) {
      pdfLibs = PDF_LIBS.reduce(function (chain, u) {
        return chain.then(function () { return loadScript(u); });
      }, Promise.resolve()).catch(function (e) {
        pdfLibs = null;              /* let the next press try again */
        throw e;
      });
    }
    return pdfLibs;
  }

  function pdfFileName() {
    var bits = [valueOf('hn'), valueOf('an'), valueOf('patient_name')]
      .map(function (x) { return String(x || '').trim(); })
      .filter(function (x) { return x; })
      .join(' ');
    var safe = bits.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_').slice(0, 60);
    return (safe || 'operative-note') + '.pdf';
  }

  var PDF_W = 198, PDF_H = 285;   /* the page box, which is A4 less 6 mm */

  /* Where a tall page may be cut without slicing through a line of text.
     Every block inside the page offers its bottom edge as a candidate; the
     cut is then made at the last one that still fits. Without this the page
     is sliced wherever the arithmetic lands, which on a narrative means
     through the middle of a sentence. */
  function breakOffsets(pg) {
    var top = pg.getBoundingClientRect().top, out = [];
    var nodes = pg.querySelectorAll('.prow, .dsec, .pline, .ptext, .catline, tr, figure, p, li, .findbox, .signline, .pgfoot');
    Array.prototype.forEach.call(nodes, function (n) {
      var r = n.getBoundingClientRect();
      if (r.height > 0) out.push(r.bottom - top);
    });
    out.sort(function (a, b) { return a - b; });
    return out;
  }

  /* How many sheets a rendered page should occupy, and how much to shrink it
     so that it fills them exactly.

     Slicing on the raw arithmetic produced a blank sheet for every page:
     a form page renders 3087 px tall and a sheet holds 3026, so the last
     61 px — under 6 mm — got a sheet to itself. A page that overflows by a
     hair should be nudged onto the sheet it nearly fits, not split; a page
     that genuinely runs long should still be split rather than shrunk into
     unreadability. The line between the two is drawn at 12%: below that the
     shrink is invisible, above it the text starts to suffer.

     Kept separate from the drawing so the arithmetic can be tested on its
     own, which is how the 61 px sliver would have been caught. */
  function sheetPlan(height, sliceMax) {
    var sheets = Math.ceil(height / sliceMax);
    if (sheets > 1 && (height / (sheets - 1)) <= sliceMax * 1.12) sheets -= 1;
    var strip = Math.ceil(height / sheets);
    return { sheets: sheets, strip: strip, fits: Math.min(1, sliceMax / strip) };
  }

  /* One page at a time. An iPad will run out of memory if three A4 canvases
     at this resolution are alive at once.

     A page taller than A4 is SPLIT across as many sheets as it needs. It
     used to be scaled down to fit, which is why a long narrative came out
     in shrinking type instead of running on to a third page — the note has
     a fixed size on paper and must keep it. */
  function pagesToPdf(pages, doc, scale) {
    var added = 0;
    return pages.reduce(function (chain, pg) {
      return chain.then(function () {
        var breaks = breakOffsets(pg);
        var cssH = pg.getBoundingClientRect().height;
        pg.classList.add('pdfshot');
        return window.html2canvas(pg, {
          scale: scale, backgroundColor: '#ffffff', useCORS: true, logging: false
        }).then(function (canvas) {
          pg.classList.remove('pdfshot');
          var pxPerMm = canvas.width / PDF_W;
          var pxPerCss = canvas.height / (cssH || 1);
          var sliceMax = Math.floor(PDF_H * pxPerMm);
          var plan = sheetPlan(canvas.height, sliceMax);
          var y = 0;
          while (y < canvas.height) {
            var h = Math.min(plan.strip, canvas.height - y);
            if (plan.sheets > 1 && h === plan.strip && y + h < canvas.height) {
              /* pull the cut back to the nearest block boundary */
              var limitCss = (y + h) / pxPerCss, best = 0;
              for (var b = 0; b < breaks.length; b++) {
                /* only pull the cut back if little is lost by doing so —
                   snapping to a boundary at 40% of the sheet wastes 60% */
                if (breaks[b] <= limitCss && breaks[b] * pxPerCss > y + plan.strip * 0.82) {
                  best = breaks[b];
                }
              }
              if (best) h = Math.round(best * pxPerCss) - y;
            }
            var strip = document.createElement('canvas');
            strip.width = canvas.width; strip.height = h;
            strip.getContext('2d').drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
            if (added) doc.addPage();
            /* a page that overflows by a few millimetres is set very
               slightly smaller so it lands on one sheet */
            var hmm = Math.min(PDF_H, (h / pxPerMm) * plan.fits);
            var wmm = PDF_W * (hmm / (h / pxPerMm));
            doc.addImage(strip.toDataURL('image/jpeg', 0.92), 'JPEG',
              (210 - wmm) / 2, 5, wmm, hmm, undefined, 'FAST');
            added++;
            y += h;
          }
        }, function (e) {
          pg.classList.remove('pdfshot');
          throw e;
        });
      });
    }, Promise.resolve());
  }

  function savePdf() {
    harvest();
    if (!requireComplete('print')) return;
    toast('กำลังสร้าง PDF … / Building the PDF …');
    ensurePdfLibs().then(function () {
      /* rasterising while the embedded face is still loading would put the
         fallback font in the PDF — the very thing the font is here to stop */
      return (document.fonts && document.fonts.ready) ? document.fonts.ready : null;
    }).then(function () {
      return refreshPreview();
    }).then(function () {
      var pages = $$('#previewBox .pg');
      if (!pages.length) throw new Error('nothing to print');
      var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
      /* a lower factor on a phone, where memory is tightest */
      var scale = Math.min(3, Math.max(2, (window.devicePixelRatio || 1) * 1.5));
      return pagesToPdf(pages, doc, scale).then(function () {
        doc.save(pdfFileName());
        toast('บันทึกไฟล์ PDF แล้ว / PDF saved', 'ok');
      });
    }).catch(function (e) {
      toast('สร้าง PDF ไม่สำเร็จ ต้องต่ออินเทอร์เน็ตครั้งแรก / ' +
        'Could not build the PDF — the first time needs a network connection. ' +
        (e && e.message ? '(' + e.message + ')' : ''), 'warn');
    });
  }

  function refreshPreview() {
    harvest();
    return exportAllPhotos().then(exportAllSheets).then(function (pngs) {
      var html = buildDocument(pngs);
      $('#printRoot').innerHTML = html;
      $('#previewBox').innerHTML = html;
      fitPageOne();
      fitFindings($('#previewBox'));
      /* the same reason: the printed copy cannot be measured while hidden,
         so it is given whatever size the visible one settled on */
      (function () {
        var from = $('#previewBox .findbox .bbody');
        var to = $('#printRoot .findbox .bbody');
        if (from && to) to.style.fontSize = from.style.fontSize;
      })();
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
      /* the ink on the photographs travels with the ink on the figures, in
         the one column that is already parked in Drive when it grows large.
         An older note is a bare array; both shapes are read back. */
      sheets: {
        v: 2,
        sheets: S.sheets.map(function (sh) {
          return { fig: sh.fig, strokes: sh.strokes, texts: sh.texts };
        }),
        photoInk: S.photos.map(function (p) {
          return { strokes: p.strokes || [], texts: p.texts || [] };
        })
      },
      /* Every image in this list becomes a separate createFile call in Apps
         Script, and each of those takes a second or two — which is nearly all
         of the wait when saving. A figure sheet with nothing drawn on it is
         just the stock diagram from the bank: filing a copy of it in Drive
         records nothing that the note does not already say. So only the
         sheets that were actually drawn on are uploaded. The printed note
         still shows all of them, and the strokes are kept either way, so
         nothing is lost. */
      figures: pngs.map(function (d, i) {
        return { name: 'figure' + (i + 1) + '_' + S.sheets[i].fig + '.png', dataUrl: d, ink: hasInk(S.sheets[i]) };
      }).filter(function (f) { return f.ink; }).map(function (f) {
        return { name: f.name, dataUrl: f.dataUrl };
      }),
      photos: S.photos.filter(function (p) { return p.dataUrl; }).map(function (p, i) {
        var o = { name: 'photo' + (i + 1) + '.jpg', caption: p.caption || '', dataUrl: p.dataUrl };
        /* the annotated copy goes up as a second file, -drawing, beside the
           untouched original */
        if (hasInk(p) && p.inkUrl) o.drawnDataUrl = p.inkUrl;
        return o;
      })
    };
  }

  function doSave() {
    var btn = $('#btnSave'), pl = null;
    btn.disabled = true;
    btn.textContent = '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e40\u0e15\u0e23\u0e35\u0e22\u0e21\u0e23\u0e39\u0e1b… / Preparing images…';
    return refreshPreview().then(function (pngs) {
      pl = payload(pngs);
      /* the upload is the slow part and it is worth saying so, with a count,
         rather than leaving a dead button for ten seconds */
      var n = (pl.figures || []).length + (pl.photos || []).length;
      btn.textContent = n
        ? '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e2a\u0e48\u0e07 ' + n + ' \u0e23\u0e39\u0e1b… / Uploading ' + n + ' image' + (n === 1 ? '' : 's') + '…'
        : '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01… / Saving…';
      S.id = pl.id; S.createdAt = pl.createdAt;
      if (!scriptUrl) { queue(pl); throw new Error('ยังไม่ได้ตั้งค่า Google Sheet / Sheet not configured'); }
      return api('POST', pl).then(function (r) {
        if (!r || !r.ok) throw new Error((r && r.error) || 'save failed');
        S.mode = 'edit';
        toast('บันทึกเรียบร้อย / Saved to Google Sheet', 'ok');
        localStorage.removeItem(LS.draft);
      });
    }).catch(function (e) {
      /* This said the note had been kept on the device while keeping nothing.
         Only the "no script URL" branch above ever queued, so a save that
         failed for any other reason — a slow Sheet, a refused request, an
         error while drawing the preview — was lost, and the surgeon was told
         it was safe. For a record-keeping app that is the one message that
         must never be wrong.

         Now it is queued first, and only then reported. And the report says
         which of the two things happened, because "we are offline" and "we
         are online and it still failed" call for different actions from the
         person reading it. */
      if (pl) queue(pl);
      var offline = ('onLine' in navigator) && navigator.onLine === false;
      if (!pl) {
        toast('\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08 \u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e22\u0e31\u0e07\u0e2d\u0e22\u0e39\u0e48\u0e43\u0e19\u0e2b\u0e19\u0e49\u0e32\u0e08\u0e2d / ' +
          'Could not save — nothing was sent and nothing was queued. The note is still on screen: ' +
          e.message, 'warn');
      } else if (offline) {
        toast('\u0e2d\u0e2d\u0e1f\u0e44\u0e25\u0e19\u0e4c \u2014 \u0e40\u0e01\u0e47\u0e1a\u0e44\u0e27\u0e49\u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07 \u0e08\u0e30\u0e2a\u0e48\u0e07\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e2d\u0e2d\u0e19\u0e44\u0e25\u0e19\u0e4c / ' +
          'Offline — kept on this device and sent automatically when the connection returns.', 'warn');
      } else {
        toast('\u0e2a\u0e48\u0e07\u0e44\u0e21\u0e48\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08 \u0e40\u0e01\u0e47\u0e1a\u0e44\u0e27\u0e49\u0e43\u0e19\u0e40\u0e04\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e41\u0e25\u0e49\u0e27 \u0e41\u0e15\u0e30\u0e17\u0e35\u0e48\u0e1b\u0e49\u0e32\u0e22 "\u0e23\u0e2d\u0e2a\u0e48\u0e07" \u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e25\u0e2d\u0e07\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07 / ' +
          'Sending failed, but the note is kept on this device — tap the pending badge to try again. (' +
          e.message + ')', 'warn');
      }
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
    /* it looked like a button and did nothing; now it is one */
    b.style.cursor = n ? 'pointer' : '';
    b.title = n ? 'แตะเพื่อลองส่งอีกครั้ง / tap to try sending again' : '';
    b.onclick = n ? function () {
      toast('กำลังลองส่งอีกครั้ง… / Trying again…');
      flushQueue();
    } : null;
  }

  /* Called on every keystroke and every stroke of the pen. Reading the form
     back into S.data has to happen at once — everything else in the app asks
     S.data what the answers are — but writing the whole note out to
     localStorage that often is work the browser does instead of drawing, so
     only that half is coalesced. */
  var draftTimer = null;

  function writeDraft() {
    writeJSON(LS.draft, {
      at: Date.now(), id: S.id, createdAt: S.createdAt, mode: S.mode,
      category: S.category, data: S.data,
      sheets: S.sheets, photos: S.photos
    });
  }

  function saveDraft() {
    harvest();
    clearTimeout(draftTimer);
    draftTimer = setTimeout(writeDraft, 250);
  }

  /* What the pen writes is held in S.sheets and S.photos, not in any form
     field — so calling saveDraft after every stroke was paying twice over
     for nothing: harvest() walks every input on the page and re-runs the
     findings and operation auto-fill, and writeDraft serialises the whole
     note, photographs included, into localStorage. Writing a word is a
     dozen short strokes, and that bill fell due after each of them, which
     is the pause between letters.

     The ink is written out when the drawing window closes, and every few
     seconds in between as insurance against a crash. */
  function saveInk() {
    /* writeDraft serialises the whole note — photographs included — into
       localStorage, which on a note with four photographs is the only thing
       left on this path that could block for half a second. It used to be
       scheduled 4 s after the last stroke, which is exactly the gap between
       strokes when someone is thinking. The ink is committed when the drawing
       window closes; this is only the insurance against a crash, so it can
       wait until the pen has been still for a good while. */
    clearTimeout(draftTimer);
    draftTimer = setTimeout(writeDraft, 20000);
  }

  function saveDraftNow() {
    clearTimeout(draftTimer);
    harvest();
    writeDraft();
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
          ((can && !SITE.printOnly) ? '<button class="mini go" data-edit="' + esc(n.id) + '">แก้ไข<br>Edit</button>'
            : (SITE.printOnly ? '' : '<span class="mini off" title="เกิน 30 วัน">ล็อกแล้ว<br>Locked</span>')) +
          '</td></tr>';
      });
      box.innerHTML = t + '</tbody></table>';
      /* Fetching a note is slow enough that a second press feels reasonable,
         and a second press starts a second fetch. So the pressed button says
         what it is doing and every button in the list goes dead until it
         finishes. */
      function arm(attr, editable) {
        $$('[' + attr + ']', box).forEach(function (b) {
          b.onclick = function () {
            if (b.disabled) return;
            var was = b.innerHTML;
            $$('button.mini', box).forEach(function (x) { x.disabled = true; });
            b.classList.add('loading');
            b.innerHTML = '\u0e01\u0e33\u0e25\u0e31\u0e07\u0e40\u0e1b\u0e34\u0e14…<br>Opening…';
            openNote(b.dataset[attr === 'data-open' ? 'open' : 'edit'], editable, function () {
              b.classList.remove('loading');
              b.innerHTML = was;
              $$('button.mini', box).forEach(function (x) { x.disabled = false; });
            });
          };
        });
      }
      arm('data-open', false);
      if (!SITE.printOnly) arm('data-edit', true);
    }).catch(function (e) {
      box.innerHTML = '<p class="muted">ค้นหาไม่สำเร็จ / Search failed: ' + esc(e.message) + '</p>';
    });
  }

  function openNote(id, editable, done) {
    /* The note just saved is already here, in full, with every photograph in
       memory. Asking Google to send it all back — which means re-downloading
       each picture from Drive and encoding it as text — is a slow way to
       fetch something we are already holding. */
    if (S.id === id && S.data && Object.keys(S.data).length) {
      S.mode = editable ? 'edit' : 'view';
      syncCategoryUI();
      buildCommonForm(); buildCategoryForm();
      renderSheetTabs(); renderPhotos();
      showView('new');
      gotoStep(editable ? 1 : 4);
      $('#btnSave').style.display = editable ? '' : 'none';
      $('#lockNote').style.display = editable ? 'none' : '';
      if (!editable) refreshPreview();
      toast(editable ? '\u0e40\u0e1b\u0e34\u0e14\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e41\u0e01\u0e49\u0e44\u0e02 / Opened for editing'
        : '\u0e40\u0e1b\u0e34\u0e14\u0e40\u0e1e\u0e37\u0e48\u0e2d\u0e14\u0e39\u0e41\u0e25\u0e30\u0e1e\u0e34\u0e21\u0e1e\u0e4c / Opened read-only', 'ok');
      if (done) done();
      return;
    }
    busy('\u0e01\u0e33\u0e25\u0e31\u0e07\u0e40\u0e1b\u0e34\u0e14\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u2026<br>' +
      '<span class="en">Fetching the note. Photographs come back one at a time ' +
      'from Drive, so a note with several may take a few seconds.</span>');
    api('GET', { action: 'get', id: id }).then(function (r) {
      if (!r || !r.ok || !r.note) throw new Error('not found');
      var n = r.note;
      S = newNote();
      S.id = n.id; S.createdAt = n.createdAt;
      S.category = n.category || 'colorectal';
      S.data = n.data || {};
      var ink = n.sheets || [];
      S.sheets = Array.isArray(ink) ? ink : (ink.sheets || []);
      var photoInk = Array.isArray(ink) ? [] : (ink.photoInk || []);
      /* the server sends each photograph back as base64 as well as a Drive
         link; dropping the base64 here was why a reopened note printed
         without its photographs — a Drive link cannot be drawn into the
         page, and would taint the canvas even if it could */
      S.photos = (n.photoUrls || []).map(function (u, i) {
        var k = photoInk[i] || {};
        return {
          url: u.url, dataUrl: u.dataUrl || '', drawnUrl: u.drawnUrl || '',
          caption: u.caption || '', name: u.name || '',
          strokes: k.strokes || [], texts: k.texts || []
        };
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
      busy(false);
      if (done) done();
      toast(editable ? 'เปิดเพื่อแก้ไข / Opened for editing' : 'เปิดเพื่อดูและพิมพ์ / Opened read-only', 'ok');
    }).catch(function (e) {
      busy(false);
      if (done) done();
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
      ' · script build <code>' + esc(serverBuild || 'ยังไม่ทราบ / press Test') + '</code>' +
      (serverBuild && serverBuild !== EXPECTED_BUILD
        ? ' <b style="color:#8a3d00">— ต้อง deploy ใหม่ / needs redeploying</b>' : '') +
      ' · ตราสัญลักษณ์ / crest ' + (window.LETTERHEAD_LOGO ? 'loaded &#10003;' : 'NOT loaded') +
      staleFileWarning() + findingsDiagnostic();
  }

  /* Uploading app.js but not narrative.js leaves the app running new code
     against old sentences, and the only symptom is a draft that quietly
     falls back to the generic list. Each file states its own build, so the
     mismatch can be named instead of guessed at. */
  /* The deployed script announces its own version. A script left on an old
     deployment does not fail loudly — it simply stops doing whatever the
     newest version added, and the -drawing copy of an annotated photograph
     silently never appears. So the app asks once at startup and says so in
     plain sight, rather than waiting to be interrogated in Settings. */
  var serverBuild = null;

  /* the /macros/s/<this>/exec part, which is what identifies one deployment
     among several in the same script project */
  function deploymentId() {
    var m = /\/macros\/s\/([^\/]+)\//.exec(scriptUrl || '');
    return m ? m[1] : (scriptUrl || 'no URL set');
  }

  function renderPrintOnlyBanner() {
    try { paintPrintOnlyBanner(); } catch (e) { /* never block the app */ }
  }

  function paintPrintOnlyBanner() {
    if (!SITE.printOnly) return;
    var n = $('#buildWarn');
    if (!n) return;
    var b = document.createElement('div');
    b.className = 'buildwarn printonly';
    b.innerHTML = '<b>\u0e2a\u0e33\u0e40\u0e19\u0e32\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e49\u0e19\u0e2b\u0e32\u0e41\u0e25\u0e30\u0e1e\u0e34\u0e21\u0e1e\u0e4c\u0e40\u0e17\u0e48\u0e32\u0e19\u0e31\u0e49\u0e19</b> ' +
      '\u2014 \u0e41\u0e01\u0e49\u0e44\u0e02\u0e2b\u0e23\u0e37\u0e2d\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e43\u0e2b\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e17\u0e33\u0e17\u0e35\u0e48 colovjr.com ' +
      '<span class="en">This is the print-only copy: search, open and print. ' +
      'Nothing here can change a note \u2014 do that on colovjr.com. ' +
      'App build <code>' + esc(APP_BUILD) + '</code>.</span>';
    /* defensive: this runs before anything else on a copy that may have been
       opened from a file, and a banner is never worth failing to start for */
    var host = n.parentNode || document.body;
    if (host === document.body && !n.parentNode) host.insertBefore(b, host.firstChild);
    else host.insertBefore(b, n);
  }

  function renderBuildBanner() {
    var n = $('#buildWarn');
    if (!n) return;
    var bad = serverBuild && serverBuild !== EXPECTED_BUILD;
    n.classList.toggle('hidden', !bad);
    if (!bad) return;
    n.innerHTML = '<b>\u0e2a\u0e04\u0e23\u0e34\u0e1b\u0e15\u0e4c\u0e43\u0e19 Google \u0e22\u0e31\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e40\u0e27\u0e2d\u0e23\u0e4c\u0e0a\u0e31\u0e19\u0e40\u0e01\u0e48\u0e32</b> \u2014 ' +
      '\u0e21\u0e35 <code>' + esc(serverBuild) + '</code> \u0e41\u0e15\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23 <code>' + esc(EXPECTED_BUILD) + '</code>. ' +
      '\u0e43\u0e2b\u0e49\u0e27\u0e32\u0e07 Code.gs \u0e43\u0e2b\u0e21\u0e48 \u0e41\u0e25\u0e49\u0e27 Deploy \u25b8 Manage deployments \u25b8 ' +
      '\u0e14\u0e34\u0e19\u0e2a\u0e2d \u25b8 Version: New version \u25b8 Deploy<br>' +
      '<span class="en">The Apps Script deployment is older than this app expects. ' +
      'Some things will simply not happen \u2014 an annotated photograph will not get its ' +
      '<code>-drawing</code> copy, for one. Paste the current Code.gs, then ' +
      'Deploy \u25b8 Manage deployments \u25b8 pencil \u25b8 Version: <b>New version</b> \u25b8 Deploy.</span>' +
      /* The app can only report what the URL it is pointed at replies. If the
         editor shows the new code but this still shows the old build, the two
         are not the same deployment — and the only way to tell is to ask the
         URL directly, outside the app. */
      '<br><b>\u0e15\u0e23\u0e27\u0e08\u0e42\u0e14\u0e22\u0e15\u0e23\u0e07 / check it directly:</b> ' +
      '<a href="' + esc(scriptUrl) + '?action=ping" target="_blank" rel="noopener">' +
      esc(deploymentId()) + '</a> ' +
      '<span class="en">\u2014 opens the script itself and prints the build it is really ' +
      'running. Compare that id with the one in Deploy \u25b8 Manage deployments: if they ' +
      'differ, the version you updated is not the one this app is calling.</span>';
  }

  function checkServerBuild() {
    if (!scriptUrl) return Promise.resolve();
    return api('GET', { action: 'ping' }).then(function (r) {
      serverBuild = (r && r.build) || '';
      renderBuildBanner();
      if ($('#viewSettingsOpen')) fillSettings();
    }, function () { /* offline is not a version problem */ });
  }

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
      clearMissingFlag(e.target);
      saveDraft(); applyVisibility();
    }

    /* Being told a field is missing and then still being shouted at after
       filling it in is the sort of thing that makes people distrust a form. */
    function clearMissingFlag(node) {
      var wrap = node.closest ? node.closest('.field.missing') : null;
      if (!wrap) return;
      var answered = $$('[data-key]', wrap).some(function (n) {
        if (n.type === 'radio' || n.type === 'checkbox') return n.checked;
        return String(n.value || '').trim() !== '';
      });
      if (answered) wrap.classList.remove('missing');
    }
    document.addEventListener('input', onFieldChanged);
    document.addEventListener('change', onFieldChanged);
    document.addEventListener('blur', onFieldChanged, true);

    /* drawing toolbar */
    $$('#penColors button').forEach(function (b) {
      b.onclick = function () {
        tool.color = b.dataset.color;
        $$('#penColors button').forEach(function (x) { x.classList.toggle('on', x === b); });
        var sel = selectedText();
        if (sel) { sel.c = tool.color; redraw(); saveInk(); return; }
        tool.mode = 'pen';
        $$('.toolbtn').forEach(function (x) { x.classList.remove('on'); });
      };
    });
    $('#penSize').oninput = function () {
      tool.width = +this.value;
      var sel = selectedText();
      if (sel) { sel.s = 26 + tool.width * 4; redraw(); saveInk(); }
    };
    $('#txtWords').onclick = function () { editSelectedText('words'); };
    $('#txtBigger').onclick = function () { editSelectedText('size', 6); };
    $('#txtSmaller').onclick = function () { editSelectedText('size', -6); };
    $('#txtRotL').onclick = function () { editSelectedText('rotate', -15); };
    $('#txtRotR').onclick = function () { editSelectedText('rotate', 15); };
    $('#txtBold').onclick = function () { editSelectedText('bold'); };
    $('#txtUnder').onclick = function () { editSelectedText('under'); };
    $('#txtDelete').onclick = deleteSelectedText;
    $('#toolZoomReset').onclick = function () {
      resetView(); applyView(); rescaleInk();
    };
    $('#toolPen').onclick = function () { tool.mode = 'pen'; markTool(this); };
    $('#toolEraser').onclick = function () { tool.mode = 'eraser'; markTool(this); };
    $('#toolText').onclick = function () { tool.mode = 'text'; markTool(this); };
    function markTool(b) { $$('.toolbtn').forEach(function (x) { x.classList.toggle('on', x === b); }); }
    $('#toolUndo').onclick = function () {
      var sh = drawTarget(); if (!sh) return;
      if (sh.strokes.length) sh.strokes.pop();
      else if (sh.texts.length) sh.texts.pop();
      redraw(); saveInk();
    };
    $('#toolClear').onclick = function () {
      var sh = drawTarget(); if (!sh) return;
      if (!window.confirm('ล้างภาพวาดทั้งหมดในแผ่นนี้? / Clear all drawing on this sheet?')) return;
      /* drawTarget() hands back a fresh little object each time, holding
         REFERENCES to the sheet's arrays. Assigning sh.strokes = [] replaced
         the property on that throwaway object and left the real sheet
         untouched — which is why Clear appeared to do nothing while Undo,
         which calls pop() on the same array, worked. Empty them in place. */
      sh.strokes.length = 0; sh.texts.length = 0; redraw(); saveInk();
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
    $('#btnPdf').onclick = savePdf;
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
          serverBuild = r.build || '';
          renderBuildBanner();
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

    window.addEventListener('pagehide', saveDraftNow);
    window.addEventListener('online', function () { updateConnBadge(); flushQueue(); });
    window.addEventListener('offline', updateConnBadge);
    var refit = null;
    function refitCanvas() {
      clearTimeout(refit);
      /* iOS reports the old viewport size until a moment after the turn */
      refit = setTimeout(function () {
        var t = drawTarget();
        if (t && cv && cv.parentNode && !$('#drawModal').classList.contains('hidden')) {
          sizeCanvas(t);
        }
      }, 120);
    }
    window.addEventListener('resize', refitCanvas);
    window.addEventListener('orientationchange', refitCanvas);
    window.addEventListener('scroll', forgetRect, true);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', refitCanvas);
  }

  function init() {
    renderPrintOnlyBanner();
    renderCategoryPicker();
    renderFigPicker();
    buildCommonForm();
    buildCategoryForm();
    bind();
    updateConnBadge();
    updateQueueBadge();
    /* one call, which also warms the script so the first save is not the
       one that pays for waking it up */
    checkServerBuild();

    /* nothing on this copy can write a note, so the note-writing screen is
       not where it should open */
    if (SITE.printOnly) {
      showView('search');
      var box = $('#searchQ');
      if (box && box.focus) box.focus();
    }

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
