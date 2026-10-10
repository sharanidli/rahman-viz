
(function () {
  // Song data lives in picker-data.json (or inline as window.__PICKER_DATA__ in the preview).
  var POOL = window.__PICKER_DATA__ || null;
  var N = 1590;
  var EPISODES = [["Cockroaches x A R Rahman: The Collab No One Saw Coming", "https://www.buzzsprout.com/2289931/episodes/19588118-cockroaches-x-a-r-rahman-the-collab-no-one-saw-coming"], ["1999 (Part 1)", "https://www.buzzsprout.com/2289931/episodes/18530972-1999-part-1"], ["1998 (Part 2: 1947 Earth)", "https://www.buzzsprout.com/2289931/episodes/18347210-1998-part-2-1947-earth"], ["1998 (Part 1: Dil Se)", "https://www.buzzsprout.com/2289931/episodes/18174129-1998-part-1-dil-se"], ["1997: Vande Mataram", "https://www.buzzsprout.com/2289931/episodes/17683835-1997-vande-mataram"], ["1997 (Part 2)", "https://www.buzzsprout.com/2289931/episodes/17407780-1997-part-2"], ["1997 (Part 1)", "https://www.buzzsprout.com/2289931/episodes/17261998-1997-part-1"], ["1996", "https://www.buzzsprout.com/2289931/episodes/16763025-1996"], ["1995 (Part 2)", "https://www.buzzsprout.com/2289931/episodes/15560834-1995-part-2"], ["1995 (Part 1)", "https://www.buzzsprout.com/2289931/episodes/15459654-1995-part-1"], ["1994 (Part 2)", "https://www.buzzsprout.com/2289931/episodes/15011254-1994-part-2"], ["1994 (Part 1)", "https://www.buzzsprout.com/2289931/episodes/14744910-1994-part-1"], ["1993", "https://www.buzzsprout.com/2289931/episodes/14256448-1993"], ["1992", "https://www.buzzsprout.com/2289931/episodes/14153075-1992"]];   // [title, url], newest first; songs reference them by index
  var loading = null;
  var MIN_MATCHES = 3;
  var LANGS = ['Tamil', 'Hindi', 'Other'];   // Other = everything that is not Tamil or Hindi
  var ERAS = [['1990s', 1990, 1999], ['2000s', 2000, 2009], ['2010s', 2010, 2019], ['2020s', 2020, 2099]];
  // bands on the catalogue percentile: low < 0.4, mid 0.4-0.7, high > 0.7
  var MOOD = [['Dark & tender', 0, 0.4], ['In between', 0.4, 0.7], ['Bright & joyful', 0.7, 1.01]];
  var ENERGY = [['Soft', 0, 0.4], ['Medium', 0.4, 0.7], ['Intense', 0.7, 1.01]];
  // f = [energy, microtonal, valence, acousticness, rhythm, tempo] percentiles
  var AXES = [['More energetic than', 'Softer than'], ['More microtonal than', 'Less microtonal than'],
              ['Brighter than', 'Darker than'], ['More acoustic than', 'Less acoustic than'],
              ['More rhythmically complex than', 'Simpler in rhythm than'], ['Faster than', 'Slower than']];

  var CSS = '\
.sotd{margin:26px auto 0;max-width:640px;text-align:left;border-radius:18px;padding:2px;\
background:linear-gradient(135deg,#C02068,#E85D20,#B8A820);box-shadow:0 8px 32px rgba(192,32,104,0.12)}\
.sotd .sotd-inner{background:#fff;border-radius:16px;padding:22px 24px 20px;min-height:120px}\
.sotd .sotd-kicker{font-size:12px;font-weight:700;color:#E85D20;text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px}\
.sotd .sotd-title{font-size:34px;font-weight:800;line-height:1.1;color:#1A1A2E;margin-bottom:8px;word-break:break-word}\
.sotd .sotd-title a{color:inherit;text-decoration:none}.sotd .sotd-title a:hover{color:#C02068}\
.sotd .sotd-meta{font-size:15px;color:#555570;line-height:1.5}.sotd .sotd-meta b{color:#1A1A2E;font-weight:600}\
.sotd .sotd-fact{margin-top:12px;font-size:15px;color:#1A1A2E;line-height:1.5;padding-left:12px;border-left:3px solid #C02068}\
.sotd .sotd-skel{color:#888898;font-size:15px;padding:18px 0}\
.sotd .pk-actions{margin-top:16px}\
#rahman-picker{margin:16px auto 0;max-width:640px;text-align:left;border-radius:16px;background:#FAFAFE;border:1px solid rgba(26,26,46,0.08)}\
#rahman-picker .pk-inner{padding:20px 22px 18px}\
#rahman-picker h2{font-size:19px;font-weight:800;color:#1A1A2E;margin:0 0 4px;letter-spacing:-0.2px}\
#rahman-picker .pk-sub{font-size:14px;color:#555570;margin-bottom:14px;line-height:1.5}\
#rahman-picker .pk-row{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px}\
#rahman-picker .pk-label{flex:0 0 76px;font-size:12px;font-weight:700;color:#888898;text-transform:uppercase;letter-spacing:.6px}\
#rahman-picker .pk-pill{border:1.5px solid rgba(26,26,46,0.14);background:#fff;color:#1A1A2E;border-radius:999px;\
padding:8px 14px;font-size:14px;font-weight:600;cursor:pointer;line-height:1;font-family:inherit;transition:all .15s ease;min-height:36px}\
#rahman-picker .pk-pill:hover{border-color:#C02068;color:#C02068}\
#rahman-picker .pk-pill[aria-pressed="true"]{background:#C02068;border-color:#C02068;color:#fff}\
#rahman-picker .pk-pill.pk-any[aria-pressed="true"]{background:#EEEEF4;border-color:#EEEEF4;color:#555570}\
#rahman-picker .pk-go{display:block;width:100%;margin-top:12px;background:#C02068;color:#fff;border:none;border-radius:12px;\
padding:14px 20px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .1s ease,background .2s ease}\
#rahman-picker .pk-go:hover{background:#7B2D8E;transform:translateY(-1px)}\
#rahman-picker .pk-go:disabled{opacity:.6;cursor:default;transform:none}\
#rahman-picker .pk-result{margin-top:16px;border-top:1px solid rgba(26,26,46,0.08);padding-top:16px;display:none}\
#rahman-picker .pk-result.show{display:block;animation:pkIn .45s ease-out}\
@keyframes pkIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}\
#rahman-picker .pk-kicker{font-size:12px;font-weight:700;color:#E85D20;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;min-height:14px}\
#rahman-picker .pk-title{font-size:28px;font-weight:800;line-height:1.15;color:#1A1A2E;margin-bottom:6px;word-break:break-word}\
#rahman-picker .pk-title a{color:inherit;text-decoration:none}#rahman-picker .pk-title a:hover{color:#C02068}\
#rahman-picker .pk-meta{font-size:15px;color:#555570;line-height:1.5;margin-bottom:4px}#rahman-picker .pk-meta b{color:#1A1A2E;font-weight:600}\
#rahman-picker .pk-bars{display:flex;gap:18px;margin:12px 0 4px;flex-wrap:wrap}\
#rahman-picker .pk-bar{flex:1 1 180px;font-size:12px;color:#888898}\
#rahman-picker .pk-bar span{display:flex;justify-content:space-between;margin-bottom:4px}#rahman-picker .pk-bar em{font-style:normal}\
#rahman-picker .pk-bar i{display:block;height:6px;border-radius:3px;background:rgba(26,26,46,0.08);overflow:hidden}\
#rahman-picker .pk-bar i b{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#C02068,#E85D20)}\
#rahman-picker .pk-note{font-size:12px;color:#888898;margin-top:6px;min-height:14px}\
.pk-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}\
.pk-btn{display:inline-flex;align-items:center;gap:6px;border-radius:10px;padding:11px 16px;font-size:14px;font-weight:700;\
text-decoration:none;cursor:pointer;font-family:inherit;border:1.5px solid transparent;line-height:1;min-height:40px}\
.pk-btn.primary{background:#C02068;color:#fff}.pk-btn.primary:hover{background:#7B2D8E}\
.pk-btn.ghost{background:#fff;color:#1A1A2E;border-color:rgba(26,26,46,0.18)}.pk-btn.ghost:hover{border-color:#C02068;color:#C02068}\
#rahman-picker .pk-shuffle{font-size:22px;font-weight:700;color:#888898;min-height:36px;display:flex;align-items:center}\
.pk-toast{font-size:12px;color:#7B2D8E;margin-top:8px;min-height:14px;word-break:break-all}\
.pk-pod{font-size:13px;color:#555570;margin-top:10px;line-height:1.5}.pk-pod a{color:#7B2D8E;font-weight:600;text-decoration:none}.pk-pod a:hover{text-decoration:underline}\
@media (max-width:480px){.sotd .sotd-inner{padding:18px 16px 16px}.sotd .sotd-title{font-size:28px}\
#rahman-picker .pk-inner{padding:16px 14px 14px}#rahman-picker .pk-label{flex-basis:100%;margin-bottom:-2px}#rahman-picker .pk-title{font-size:25px}}\
@media (prefers-reduced-motion:reduce){#rahman-picker .pk-result.show{animation:none}}';

  // same as makeSlug() in song_database.html; the Song DNA page accepts the same form
  function slug(s) {
    return (s.t + '-' + s.a + '-' + s.y).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + (s.k ? '-' + s.k : '');
  }
  function film(s) {
    return s.a.replace(/\s*\([^)]*\)\s*$/, '')
      .replace(/\s*[:\-]?\s*\(?(original motion picture soundtrack|music from the motion picture|original soundtrack|soundtrack)\)?\s*$/i, '');
  }
  function songUrl(s) { return 'song_database.html#' + slug(s); }
  function dnaUrl(s) { return 'indian_audio_map.html#' + slug(s); }
  function listenUrl(s) {
    return s.p ? 'https://open.spotify.com/track/' + s.p
      : 'https://www.youtube.com/results?search_query=' + encodeURIComponent(s.t + ' ' + film(s) + ' AR Rahman');
  }
  function shareUrl(s) {
    var u = location.origin + location.pathname.replace(/index\.html$/, '');
    return u + '?pick=' + encodeURIComponent(slug(s));
  }
  function fact(s) {
    var best = -1, bi = -1;
    for (var i = 0; i < 6; i++) {
      var v = s.f[i];
      if (v == null) continue;
      var d = Math.abs(v - 0.5);
      if (d > best) { best = d; bi = i; }
    }
    if (bi < 0) return '';
    var hi = s.f[bi] >= 0.5, pct = Math.round((hi ? s.f[bi] : 1 - s.f[bi]) * 100);
    return (hi ? AXES[bi][0] : AXES[bi][1]) + ' ' + pct + '% of his songs.';
  }
  function podcastLine(s) {
    if (!s.e || !s.e.length || !EPISODES.length) return '';
    var links = s.e.map(function (i) { var e = EPISODES[i]; return e ? '<a href="' + e[1] + '" target="_blank" rel="noopener">' + esc(e[0]) + '</a>' : ''; }).filter(Boolean).join(' and ');
    if (!links) return '';
    return '<div class="pk-pod"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#7B2D8E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>' + (s.ek === 'f' ? 'We talked about this film in ' + links + ' on the podcast.' : 'Our podcast episodes on ' + s.y + ': ' + links + '.') + '</div>';
  }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function track(what, s) {
    try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: 'picker/' + what, title: s ? s.t : what, event: true }); } catch (e) {}
  }
  function actions(s, share, again) {
    var h = '<div class="pk-actions">';
    if (s.d) {
      h += '<a class="pk-btn primary" href="' + dnaUrl(s) + '">See its DNA &rarr;</a>';
      h += '<a class="pk-btn ghost" href="' + songUrl(s) + '">Song page</a>';
    } else {
      h += '<a class="pk-btn primary" href="' + songUrl(s) + '">Open song &rarr;</a>';
    }
    h += '<a class="pk-btn ghost" href="' + listenUrl(s) + '" target="_blank" rel="noopener">&#9654; Listen</a>';
    if (again) h += '<button type="button" class="pk-btn ghost" data-act="again">&#8635; Another one</button>';
    if (share) h += '<button type="button" class="pk-btn ghost" data-act="share">Share</button>';
    return h + '</div>';
  }
  function wireShare(container, s) {
    var b = container.querySelector('[data-act="share"]');
    if (!b) return;
    b.addEventListener('click', function () {
      var url = shareUrl(s), text = s.t + ' (' + film(s) + ', ' + s.y + ') - my Rahman song';
      var toast = container.querySelector('.pk-toast');
      if (navigator.share) { navigator.share({ title: 'Inside the Sound of Rahman', text: text, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast.textContent = 'Link copied.'; }, function () { toast.textContent = url; });
      else toast.textContent = url;
    });
  }

  function ensureData() {
    if (POOL) return Promise.resolve(POOL);
    if (!loading) {
      var base = '';
      var sc = document.querySelector('script[src*="picker.js"]');
      if (sc) base = sc.getAttribute('src').replace(/picker\.js.*$/, '');
      loading = fetch(base + 'picker-data.json', { cache: 'force-cache' }).then(function (r) { return r.json(); })
        .then(function (d) { POOL = d; return d; })
        .catch(function () { loading = null; throw new Error('load'); });
    }
    return loading;
  }

  // ---------- Song of the Day ----------
  function fnv(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function songOfTheDay(d) {
    var known = d.filter(function (s) { return s.p; });
    var list = known.length ? known : d;
    var now = new Date();
    var key = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    return list[fnv(key) % list.length];
  }
  function renderSotd(box) {
    box.innerHTML = '<div class="sotd-inner"><div class="sotd-kicker">Song of the day</div><div class="sotd-skel">Picking today’s song…</div></div>';
    ensureData().then(function (d) {
      var s = songOfTheDay(d);
      var day = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
      var h = '<div class="sotd-inner">';
      h += '<div class="sotd-kicker">Song of the day &middot; ' + esc(day) + '</div>';
      h += '<div class="sotd-title"><a href="' + (s.d ? dnaUrl(s) : songUrl(s)) + '">' + esc(s.t) + '</a></div>';
      h += '<div class="sotd-meta"><b>' + esc(film(s)) + '</b> (' + s.y + ') &middot; ' + esc(s.l) + (s.s ? ' &middot; ' + esc(s.s) : '') + '</div>';
      var f = fact(s);
      if (f) h += '<div class="sotd-fact">' + esc(f) + '</div>';
      h += podcastLine(s);
      h += actions(s, true, false) + '<div class="pk-toast"></div></div>';
      box.innerHTML = h;
      wireShare(box, s);
      track('song-of-the-day', s);
    }, function () {
      box.innerHTML = '<div class="sotd-inner"><div class="sotd-kicker">Song of the day</div><div class="sotd-skel">Could not load the song list. Check your connection and reload.</div></div>';
    });
  }

  // ---------- Picker ----------
  var state = { mood: -1, energy: -1, lang: -1, era: -1 };
  var recent = [];
  var root, resultEl, goBtn;

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
    var e = song.f[0], v = song.f[2];
    if (s.lang === 2) { if (song.l === 'Tamil' || song.l === 'Hindi') return false; }
    else if (s.lang >= 0 && song.l !== LANGS[s.lang]) return false;
    if (s.era >= 0 && (song.y < ERAS[s.era][1] || song.y > ERAS[s.era][2])) return false;
    if (s.mood >= 0) {
      var ok = inBand(v, MOOD[s.mood]);
      if (!ok && widen) ok = (s.mood > 0 && inBand(v, MOOD[s.mood - 1])) || (s.mood < 2 && inBand(v, MOOD[s.mood + 1]));
      if (!ok) return false;
    }
    if (s.energy >= 0) {
      var ok2 = inBand(e, ENERGY[s.energy]);
      if (!ok2 && widen) ok2 = (s.energy > 0 && inBand(e, ENERGY[s.energy - 1])) || (s.energy < 2 && inBand(e, ENERGY[s.energy + 1]));
      if (!ok2) return false;
    }
    return true;
  }
  // Decade and language are what people notice, so they hold as long as anything exists
  // for them; mood and energy loosen first (neighbouring band, then dropped).
  function candidates() {
    var st = state, steps = [
      [st, false, ''],
      [st, true, 'Closest match: we loosened the mood a little.'],
      [{ mood: -1, energy: -1, lang: st.lang, era: st.era }, false, 'Closest match: nothing from that decade and language fits that mood exactly, so here is one that keeps the decade and language.'],
      [{ mood: st.mood, energy: st.energy, lang: -1, era: st.era }, true, 'Closest match: that mood is rare in that language, so this one is from the same decade in another language.'],
      [{ mood: -1, energy: -1, lang: -1, era: st.era }, false, 'Closest match from that decade.'],
      [{ mood: st.mood, energy: st.energy, lang: st.lang, era: -1 }, true, 'Nothing from that decade fits at all, so here is the closest match from another decade.'],
      [{ mood: -1, energy: -1, lang: -1, era: -1 }, false, 'A wild card.']
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
  function bar(label, lo, hi, v) {
    return '<div class="pk-bar"><span><em>' + lo + '</em><em>' + label + '</em><em>' + hi + '</em></span><i><b style="width:' + Math.round(v * 100) + '%"></b></i></div>';
  }
  function render(s, note) {
    recent.push(slug(s)); if (recent.length > 8) recent.shift();
    var h = '<div class="pk-kicker">' + (note ? 'Closest match' : 'Your song') + '</div>';
    h += '<div class="pk-title"><a href="' + songUrl(s) + '">' + esc(s.t) + '</a></div>';
    h += '<div class="pk-meta"><b>' + esc(film(s)) + '</b> (' + s.y + ') &middot; ' + esc(s.l) + '</div>';
    if (s.s) h += '<div class="pk-meta">' + esc(s.s) + '</div>';
    h += '<div class="pk-bars">' + bar('mood', 'dark', 'bright', s.f[2]) + bar('energy', 'soft', 'intense', s.f[0]) + '</div>';
    h += '<div class="pk-note">' + esc(note) + '</div>';
    h += podcastLine(s);
    h += actions(s, true, true) + '<div class="pk-toast"></div>';
    resultEl.innerHTML = h;
    resultEl.classList.add('show');
    resultEl.querySelector('[data-act="again"]').addEventListener('click', function () { go(); });
    wireShare(resultEl, s);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try { resultEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); } catch (e) {}
    track('pick', s);
  }
  function go() {
    goBtn.disabled = true;
    if (!POOL) { resultEl.innerHTML = '<div class="pk-kicker">Loading the songs&hellip;</div>'; resultEl.classList.add('show'); }
    ensureData().then(goNow, function () {
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
  function showPicker() {
    if (!root) return;
    root.hidden = false;
    var tb = document.getElementById('pick-toggle-btn');
    if (tb) tb.parentNode.style.display = 'none';
  }
  function buildPicker() {
    root = document.getElementById('rahman-picker');
    if (!root) return;
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
    var tb = document.getElementById('pick-toggle-btn');
    if (tb) tb.addEventListener('click', function () { showPicker(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); track('open-picker'); });
  }

  function build() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    buildPicker();
    var sotd = document.getElementById('song-of-the-day');
    var q = /[?&]pick=([^&#]+)/.exec(location.search);
    if (q && root) {
      var h = decodeURIComponent(q[1]);
      showPicker();
      ensureData().then(function (d) {
        for (var i = 0; i < d.length; i++) if (slug(d[i]) === h) { render(d[i], ''); track('open-shared', d[i]); break; }
        root.scrollIntoView({ block: 'start' });
      }, function () {});
    }
    if (sotd) renderSotd(sotd);
    else { var warm = function () { ensureData().then(null, function () {}); }; if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 3000 }); else setTimeout(warm, 1500); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
