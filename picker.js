
(function () {
  // Song data lives in picker-data.json, fetched in the background after the page is up
  // (or inlined as window.__PICKER_DATA__ in the preview build).
  var POOL = window.__PICKER_DATA__ || null;
  var N = 1590;
  var loading = null;
  var MIN_MATCHES = 4;
  var LANGS = ['Tamil', 'Hindi', 'Telugu', 'Malayalam'];
  var ERAS = [['1990s', 1990, 1999], ['2000s', 2000, 2009], ['2010s', 2010, 2019], ['2020s', 2020, 2099]];
  // bands on the catalogue percentile: low < 0.4, mid 0.4-0.7, high > 0.7
  var MOOD = [['Dark & tender', 0, 0.4], ['In between', 0.4, 0.7], ['Bright & joyful', 0.7, 1.01]];
  var ENERGY = [['Soft', 0, 0.4], ['Medium', 0.4, 0.7], ['Intense', 0.7, 1.01]];

  var CSS = '\
#rahman-picker{margin:28px auto 0;max-width:640px;text-align:left;border-radius:18px;padding:2px;\
background:linear-gradient(135deg,#C02068,#E85D20,#B8A820);box-shadow:0 8px 32px rgba(192,32,104,0.12)}\
#rahman-picker .pk-inner{background:#fff;border-radius:16px;padding:22px 22px 18px}\
#rahman-picker h2{font-size:22px;font-weight:800;color:#1A1A2E;margin:0 0 4px;letter-spacing:-0.2px}\
#rahman-picker .pk-sub{font-size:14px;color:#555570;margin-bottom:16px;line-height:1.5}\
#rahman-picker .pk-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}\
#rahman-picker .pk-label{flex:0 0 76px;font-size:12px;font-weight:700;color:#888898;text-transform:uppercase;letter-spacing:.6px}\
#rahman-picker .pk-pill{border:1.5px solid rgba(26,26,46,0.14);background:#fff;color:#1A1A2E;border-radius:999px;\
padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer;line-height:1;font-family:inherit;transition:all .15s ease;min-height:36px}\
#rahman-picker .pk-pill:hover{border-color:#C02068;color:#C02068}\
#rahman-picker .pk-pill[aria-pressed="true"]{background:#C02068;border-color:#C02068;color:#fff}\
#rahman-picker .pk-pill.pk-any[aria-pressed="true"]{background:#EEEEF4;border-color:#EEEEF4;color:#555570}\
#rahman-picker .pk-go{display:block;width:100%;margin-top:14px;background:#1A1A2E;color:#fff;border:none;border-radius:12px;\
padding:15px 20px;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .1s ease,background .2s ease}\
#rahman-picker .pk-go:hover{background:#7B2D8E;transform:translateY(-1px)}\
#rahman-picker .pk-go:disabled{opacity:.6;cursor:default;transform:none}\
#rahman-picker .pk-result{margin-top:16px;border-top:1px solid rgba(26,26,46,0.08);padding-top:16px;display:none}\
#rahman-picker .pk-result.show{display:block;animation:pkIn .45s ease-out}\
@keyframes pkIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\
#rahman-picker .pk-kicker{font-size:12px;font-weight:700;color:#E85D20;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;min-height:14px}\
#rahman-picker .pk-title{font-size:30px;font-weight:800;line-height:1.15;color:#1A1A2E;margin-bottom:6px;word-break:break-word}\
#rahman-picker .pk-title a{color:inherit;text-decoration:none}\
#rahman-picker .pk-title a:hover{color:#C02068}\
#rahman-picker .pk-meta{font-size:15px;color:#555570;line-height:1.5;margin-bottom:4px}\
#rahman-picker .pk-meta b{color:#1A1A2E;font-weight:600}\
#rahman-picker .pk-bars{display:flex;gap:18px;margin:12px 0 4px;flex-wrap:wrap}\
#rahman-picker .pk-bar{flex:1 1 180px;font-size:12px;color:#888898}\
#rahman-picker .pk-bar span{display:flex;justify-content:space-between;margin-bottom:4px}\
#rahman-picker .pk-bar em{font-style:normal}\
#rahman-picker .pk-bar i{display:block;height:6px;border-radius:3px;background:rgba(26,26,46,0.08);overflow:hidden}\
#rahman-picker .pk-bar i b{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#C02068,#E85D20)}\
#rahman-picker .pk-note{font-size:12px;color:#888898;margin-top:6px;min-height:14px}\
#rahman-picker .pk-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}\
#rahman-picker .pk-btn{display:inline-flex;align-items:center;gap:6px;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:700;\
text-decoration:none;cursor:pointer;font-family:inherit;border:1.5px solid transparent;line-height:1;min-height:40px}\
#rahman-picker .pk-btn.primary{background:#C02068;color:#fff}\
#rahman-picker .pk-btn.primary:hover{background:#7B2D8E}\
#rahman-picker .pk-btn.ghost{background:#fff;color:#1A1A2E;border-color:rgba(26,26,46,0.18)}\
#rahman-picker .pk-btn.ghost:hover{border-color:#C02068;color:#C02068}\
#rahman-picker .pk-shuffle{font-size:22px;font-weight:700;color:#888898;min-height:36px;display:flex;align-items:center;letter-spacing:.2px}\
#rahman-picker .pk-toast{font-size:12px;color:#7B2D8E;margin-top:8px;min-height:14px;word-break:break-all}\
@media (max-width:480px){#rahman-picker .pk-inner{padding:18px 14px 14px}#rahman-picker h2{font-size:20px}\
#rahman-picker .pk-label{flex-basis:100%;margin-bottom:-2px}#rahman-picker .pk-title{font-size:26px}}\
@media (prefers-reduced-motion:reduce){#rahman-picker .pk-result.show{animation:none}}';

  // same as makeSlug() in song_database.html, so links open the right song
  function slug(s) {
    return (s.t + '-' + s.a + '-' + s.y).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + (s.k ? '-' + s.k : '');
  }
  function film(s) { return s.a.replace(/\s*\([^)]*\)\s*$/, ''); }

  var state = { mood: -1, energy: -1, lang: -1, era: -1 };
  var recent = [];
  var root, resultEl, goBtn;

  function ensureData() {
    if (POOL) return Promise.resolve(POOL);
    if (!loading) {
      var src = (document.currentScript && document.currentScript.src || 'picker.js').replace(/picker\.js.*$/, 'picker-data.json');
      loading = fetch(src, { cache: 'force-cache' }).then(function (r) { return r.json(); })
        .then(function (d) { POOL = d; return d; })
        .catch(function () { loading = null; throw new Error('load'); });
    }
    return loading;
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  function pillRow(label, key, names, anyLabel) {
    var row = el('div', 'pk-row');
    row.appendChild(el('span', 'pk-label', label));
    var opts = (anyLabel ? [anyLabel] : []).concat(names);
    opts.forEach(function (name, i) {
      var idx = anyLabel ? i - 1 : i;
      var b = el('button', 'pk-pill' + (idx < 0 ? ' pk-any' : ''), name);
      b.type = 'button';
      b.setAttribute('aria-pressed', state[key] === idx ? 'true' : 'false');
      b.addEventListener('click', function () {
        state[key] = idx;
        row.querySelectorAll('.pk-pill').forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
      });
      row.appendChild(b);
    });
    return row;
  }

  function inBand(v, band) { return v >= band[1] && v < band[2]; }
  function matches(song, s, widen) {
    if (s.lang >= 0 && song.l !== LANGS[s.lang]) return false;
    if (s.era >= 0 && (song.y < ERAS[s.era][1] || song.y > ERAS[s.era][2])) return false;
    if (s.mood >= 0) {
      var ok = inBand(song.v, MOOD[s.mood]);
      if (!ok && widen) ok = (s.mood > 0 && inBand(song.v, MOOD[s.mood - 1])) || (s.mood < 2 && inBand(song.v, MOOD[s.mood + 1]));
      if (!ok) return false;
    }
    if (s.energy >= 0) {
      var ok2 = inBand(song.e, ENERGY[s.energy]);
      if (!ok2 && widen) ok2 = (s.energy > 0 && inBand(song.e, ENERGY[s.energy - 1])) || (s.energy < 2 && inBand(song.e, ENERGY[s.energy + 1]));
      if (!ok2) return false;
    }
    return true;
  }

  // returns {songs, note}
  function candidates() {
    var steps = [
      [state, false, ''],
      [{ mood: state.mood, energy: state.energy, lang: state.lang, era: -1 }, false, 'Nothing quite fits that era, so here is the closest match from another decade.'],
      [{ mood: state.mood, energy: state.energy, lang: state.lang, era: -1 }, true, 'Closest match: we loosened the mood a little.'],
      [{ mood: state.mood, energy: state.energy, lang: -1, era: -1 }, true, 'Closest match: that mood is rare in that language, so this one is from another.'],
      [{ mood: -1, energy: -1, lang: -1, era: -1 }, true, 'A wild card.']
    ];
    for (var i = 0; i < steps.length; i++) {
      var list = POOL.filter(function (s) { return matches(s, steps[i][0], steps[i][1]); });
      if (list.length >= MIN_MATCHES || (i === steps.length - 1 && list.length)) return { songs: list, note: steps[i][2] };
    }
    return { songs: POOL, note: '' };
  }

  function pick(list) {
    var fresh = list.filter(function (s) { return recent.indexOf(slug(s)) < 0; });
    if (fresh.length) list = fresh;
    var total = 0, w = list.map(function (s) { var x = s.p ? 3 : 1; total += x; return x; });
    var r = Math.random() * total;
    for (var i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  function listenUrl(s) {
    return s.p ? 'https://open.spotify.com/track/' + s.p
      : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s.t + ' ' + film(s) + ' AR Rahman');
  }
  function songUrl(s) { return 'song_database.html#' + slug(s); }
  function shareUrl(s) {
    var u = location.origin + location.pathname.replace(/index\.html$/, '');
    return u + '?pick=' + encodeURIComponent(slug(s));
  }
  function bar(label, lo, hi, v) {
    return '<div class="pk-bar"><span><em>' + lo + '</em><em>' + label + '</em><em>' + hi + '</em></span><i><b style="width:' + Math.round(v * 100) + '%"></b></i></div>';
  }

  function render(s, note) {
    recent.push(slug(s)); if (recent.length > 8) recent.shift();
    var h = '<div class="pk-kicker">' + (note ? 'Closest match' : 'Your song') + '</div>';
    h += '<div class="pk-title"><a href="' + songUrl(s) + '">' + esc(s.t) + '</a></div>';
    h += '<div class="pk-meta"><b>' + esc(film(s)) + '</b> (' + s.y + ') &middot; ' + esc(s.l) + '</div>';
    if (s.s) h += '<div class="pk-meta">' + esc(s.s) + '</div>';
    h += '<div class="pk-bars">' + bar('mood', 'dark', 'bright', s.v) + bar('energy', 'soft', 'intense', s.e) + '</div>';
    h += '<div class="pk-note">' + esc(note) + '</div>';
    h += '<div class="pk-actions">';
    h += '<a class="pk-btn primary" href="' + songUrl(s) + '">Open song &rarr;</a>';
    h += '<a class="pk-btn ghost" href="' + listenUrl(s) + '" target="_blank" rel="noopener">&#9654; Listen</a>';
    h += '<button type="button" class="pk-btn ghost" data-act="again">&#8635; Another one</button>';
    h += '<button type="button" class="pk-btn ghost" data-act="share">Share</button>';
    h += '</div><div class="pk-toast"></div>';
    resultEl.innerHTML = h;
    resultEl.classList.add('show');
    resultEl.querySelector('[data-act="again"]').addEventListener('click', function () { go(); });
    resultEl.querySelector('[data-act="share"]').addEventListener('click', function () { share(s); });
    // on a phone the result lands below the button; bring it into view
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { resultEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) {}
    track('pick', s);
  }

  function share(s) {
    var url = shareUrl(s), text = s.t + ' (' + film(s) + ', ' + s.y + ') - my Rahman song';
    var toast = resultEl.querySelector('.pk-toast');
    if (navigator.share) { navigator.share({ title: 'Inside the Sound of Rahman', text: text, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast.textContent = 'Link copied.'; });
    else { toast.textContent = url; }
  }

  function track(what, s) {
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: 'picker/' + what, title: s ? s.t : what, event: true }); } catch (e) {}
  }

  function go() {
    goBtn.disabled = true;
    if (!POOL) {
      resultEl.innerHTML = '<div class="pk-kicker">Loading the songs&hellip;</div>';
      resultEl.classList.add('show');
    }
    ensureData().then(function () { goNow(); }, function () {
      resultEl.innerHTML = '<div class="pk-kicker">Could not load the song list. Check your connection and try again.</div>';
      resultEl.classList.add('show');
      goBtn.disabled = false;
    });
  }

  function goNow() {
    var c = candidates();
    var chosen = pick(c.songs);
    resultEl.classList.remove('show');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { render(chosen, c.note); goBtn.disabled = false; return; }
    resultEl.innerHTML = '<div class="pk-kicker">Finding your song</div><div class="pk-shuffle"></div>';
    resultEl.classList.add('show');
    var box = resultEl.querySelector('.pk-shuffle'), n = 0, src = c.songs.length > 1 ? c.songs : POOL;
    var iv = setInterval(function () {
      box.textContent = src[Math.floor(Math.random() * src.length)].t;
      if (++n >= 11) { clearInterval(iv); resultEl.classList.remove('show'); void resultEl.offsetWidth; render(chosen, c.note); goBtn.disabled = false; }
    }, 75);
  }

  function build() {
    root = document.getElementById('rahman-picker');
    if (!root) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var inner = el('div', 'pk-inner');
    inner.appendChild(el('h2', null, 'What Rahman song are you feeling like?'));
    inner.appendChild(el('p', 'pk-sub', 'Tap a mood and we pick one of ' + N.toLocaleString() + ' songs for you. Every choice is optional.'));
    inner.appendChild(pillRow('Mood', 'mood', MOOD.map(function (m) { return m[0]; }), 'Any'));
    inner.appendChild(pillRow('Energy', 'energy', ENERGY.map(function (m) { return m[0]; }), 'Any'));
    inner.appendChild(pillRow('Language', 'lang', LANGS, 'Any'));
    inner.appendChild(pillRow('Era', 'era', ERAS.map(function (e) { return e[0]; }), 'Any'));
    goBtn = el('button', 'pk-go', 'Find my song'); goBtn.type = 'button';
    goBtn.addEventListener('click', go);
    inner.appendChild(goBtn);
    resultEl = el('div', 'pk-result');
    inner.appendChild(resultEl);
    root.appendChild(inner);

    // shared link: ?pick=<slug>
    var q = /[?&]pick=([^&#]+)/.exec(location.search);
    if (q) {
      var h = decodeURIComponent(q[1]);
      ensureData().then(function (d) {
        for (var i = 0; i < d.length; i++) if (slug(d[i]) === h) { render(d[i], ''); track('open-shared', d[i]); break; }
        root.scrollIntoView({ block: 'start' });
      }, function () {});
    } else {
      // warm the data in the background once the page is idle
      var warm = function () { ensureData().then(null, function () {}); };
      if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 3000 }); else setTimeout(warm, 1500);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
