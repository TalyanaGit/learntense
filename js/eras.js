// LearnTense "Time Travel" restructure.
// Loaded last: rebuilds the Library screen as Past / Present / Future eras,
// each with 4 stages (Simple, Continuous, Perfect, Perfect Continuous),
// by reading the same `tenses` / `progress` globals app.js already
// maintains. No quiz, auth or Supabase logic is touched — startLesson()
// and startQuiz() are called exactly as before.
(function () {
  'use strict';

  const ASPECTS = [
    { key: 'simple', label: 'Simple', icon: '➡️', hint: 'One clear action' },
    { key: 'continuous', label: 'Continuous', icon: '🔁', hint: 'Action in progress' },
    { key: 'perfect', label: 'Perfect', icon: '🚩', hint: 'Done by a point in time' },
    { key: 'perfectContinuous', label: 'Perfect Continuous', icon: '⏱️', hint: 'Ongoing up to a point' }
  ];

  const ERAS = [
    { key: 'past', label: 'Past', icon: '🕰️', tenseIds: [5, 6, 7, 8], line: "Let's dig up what already happened!" },
    { key: 'present', label: 'Present', icon: '🌱', tenseIds: [1, 2, 3, 4], line: "Right now, right here — let's go!" },
    { key: 'future', label: 'Future', icon: '🚀', tenseIds: [9, 10, 11, 12], line: "Blast off to what's coming next!" }
  ];

  // Present-only seasonal flavor per stage (kept out of Past/Future so
  // those two eras get their own distinct identity instead of borrowing
  // "seasons" that don't really belong to them).
  const SEASONS = ['🌸 Spring', '☀️ Summer', '🍂 Autumn', '❄️ Winter'];

  const UNLOCK_THRESHOLD = 50; // % mastery needed on a stage to unlock the next
  const BOSS_THRESHOLD = 80;   // % mastery needed on all 4 stages to unlock the boss quiz
  const LS_ERA = 'lt-era';

  let currentEra = localStorage.getItem(LS_ERA) || 'present';

  function eraTenses(era) {
    return era.tenseIds.map(id => (typeof tenses !== 'undefined' && tenses.find(t => t.id === id)) || (typeof fallbackTenses !== 'undefined' && fallbackTenses.find(t => t.id === id)));
  }

  function eraProgressPct(era) {
    const list = eraTenses(era);
    if (!list.length) return 0;
    const sum = list.reduce((a, t) => a + (t ? mastery(t.id) : 0), 0);
    return Math.round(sum / list.length);
  }

  // ---------------- Era tabs (with progress ring) ----------------
  function renderEraTabs() {
    const wrap = document.getElementById('eraTabs');
    if (!wrap) return;
    wrap.innerHTML = ERAS.map(era => {
      const pct = eraProgressPct(era);
      return `<button class="era-tab era-tab-${era.key}${era.key === currentEra ? ' active' : ''}" data-era="${era.key}">
        <span class="era-ring" style="--pct:${pct}"><span class="era-ring-icon">${era.icon}</span></span>
        <span class="era-tab-label">${era.label}</span>
        <span class="era-tab-pct">${pct}%</span>
      </button>`;
    }).join('');
    wrap.querySelectorAll('.era-tab').forEach(btn => {
      btn.onclick = () => switchEra(btn.dataset.era);
    });
  }

  function switchEra(key) {
    if (key === currentEra) return;
    currentEra = key;
    localStorage.setItem(LS_ERA, key);
    document.getElementById('library')?.setAttribute('data-era', key);
    renderEraTabs();
    renderEraGuide();
    const path = document.getElementById('eraPath');
    if (path) {
      path.classList.remove('lt-era-swoosh');
      void path.offsetWidth; // restart animation
      path.classList.add('lt-era-swoosh');
    }
    renderEraPath();
    renderBoss();
  }

  // ---------------- Lion "Time Explorer" guide line ----------------
  function renderEraGuide() {
    const wrap = document.getElementById('eraGuide');
    if (!wrap) return;
    const era = ERAS.find(e => e.key === currentEra);
    wrap.innerHTML = `<div class="era-guide-card">
      <span class="era-guide-mascot">🦁</span>
      <div class="era-guide-bubble"><strong>Time Explorer:</strong> ${era.line}</div>
    </div>`;
  }

  // ---------------- 4-stage path ----------------
  function renderEraPath() {
    const wrap = document.getElementById('eraPath');
    if (!wrap) return;
    const era = ERAS.find(e => e.key === currentEra);
    const list = eraTenses(era);
    if (!list.length || !list[0]) { wrap.innerHTML = ''; return; }

    let prevMastery = 100; // stage 1 is always unlocked
    wrap.innerHTML = list.map((t, i) => {
      const asp = ASPECTS[i];
      const m = t ? mastery(t.id) : 0;
      const locked = i > 0 && prevMastery < UNLOCK_THRESHOLD;
      prevMastery = m;
      const done = m >= 95;
      const season = era.key === 'present' ? `<span class="era-node-season">${SEASONS[i]}</span>` : '';
      return `<div class="era-node ${locked ? 'era-node-locked' : ''} ${done ? 'era-node-done' : ''}" style="--i:${i}" ${locked ? '' : `onclick="startLesson(${t.id})"`}>
        <div class="era-node-badge">${locked ? '🔒' : done ? '✅' : asp.icon}</div>
        <div class="era-node-body">
          <span class="era-node-stage">Stage ${i + 1} · ${asp.label}</span>
          <h3>${t.icon} ${t.name}</h3>
          <p class="muted">${asp.hint}</p>
          ${season}
          <div class="progress-track"><div class="progress-fill" style="width:${m}%"></div></div>
          <small class="muted">${locked ? `Reach ${UNLOCK_THRESHOLD}% on Stage ${i} to unlock` : `${m}% mastery`}</small>
        </div>
      </div>`;
    }).join('');
  }

  // ---------------- Cross-era boss quiz ----------------
  function renderBoss() {
    const wrap = document.getElementById('eraBoss');
    if (!wrap) return;
    const era = ERAS.find(e => e.key === currentEra);
    const list = eraTenses(era);
    const ready = list.length === 4 && list.every(t => t && mastery(t.id) >= BOSS_THRESHOLD);
    if (!ready) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = `<article class="era-boss">
      <div class="era-boss-icon">🏆</div>
      <div>
        <h3>${era.icon} ${era.label} Master Challenge</h3>
        <p class="muted">You've mastered all 4 ${era.label} stages! Mix them together in one challenge round.</p>
      </div>
      <button class="primary" onclick="startBossQuiz('${era.key}')">Start challenge →</button>
    </article>`;
  }

  window.startBossQuiz = async function (eraKey) {
    const era = ERAS.find(e => e.key === eraKey);
    if (!era) return;
    const list = eraTenses(era).filter(Boolean);
    let pool = [];
    for (const t of list) {
      const qs = (typeof fetchQuestions === 'function') ? await fetchQuestions(t.id) : [];
      pool = pool.concat((qs.length ? qs : (demoQuestions[t.id] || [])));
    }
    pool = pool.sort(() => Math.random() - 0.5).slice(0, 8);
    if (!pool.length) return;
    currentTense = { id: -1000 - era.tenseIds[0], name: `${era.label} Mix`, category: era.label, icon: era.icon };
    questions = pool; qIndex = 0; score = 0; answered = false;
    showScreen('quiz'); renderQuestion();
  };

  // ---------------- Parent / teacher view ----------------
  function renderParentView() {
    const wrap = document.getElementById('parentView');
    if (!wrap) return;
    wrap.innerHTML = ERAS.map(era => {
      const list = eraTenses(era);
      return `<div class="parent-era"><h4>${era.icon} ${era.label} — ${eraProgressPct(era)}% overall</h4>
        <ul>${list.map((t, i) => t ? `<li><span>${ASPECTS[i].label}: ${t.name}</span><span>${mastery(t.id)}%</span></li>` : '').join('')}</ul>
      </div>`;
    }).join('');
  }

  function wireParentView() {
    const btn = document.getElementById('parentViewBtn');
    const panel = document.getElementById('parentView');
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.onclick = () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderParentView();
    };
  }

  // ---------------- Wiring ----------------
  function wrap(name, fn) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = fn(orig);
  }

  function renderAll() {
    document.getElementById('library')?.setAttribute('data-era', currentEra);
    renderEraTabs();
    renderEraGuide();
    renderEraPath();
    renderBoss();
    wireParentView();
  }

  wrap('renderLibrary', orig => function () {
    const r = orig.apply(this, arguments);
    renderAll();
    return r;
  });

  wrap('renderDashboard', orig => function () {
    const r = orig.apply(this, arguments);
    renderEraTabs();
    return r;
  });

  document.addEventListener('DOMContentLoaded', renderAll);
  if (document.readyState !== 'loading') renderAll();
})();
