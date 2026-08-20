// LearnTense gamification layer.
// Loaded last: wraps the existing global quiz functions (from app.js,
// runtime-fixes.js and simple-present-games.js) instead of rewriting them,
// so all Supabase sync / progress logic keeps working unchanged.
(function () {
  'use strict';

  const MAX_HEARTS = 5;
  const LS_XP = 'lt-xp';
  const LS_SOUND = 'lt-sound';

  let hearts = MAX_HEARTS;
  let combo = 0;
  let xp = Number(localStorage.getItem(LS_XP) || 0);
  let soundOn = localStorage.getItem(LS_SOUND) !== 'off';
  const comboMilestones = new Set([3, 5, 8, 12]);

  // ---------------- XP / Level ----------------
  function levelFromXp(x) { return Math.floor(Math.sqrt(x / 40)) + 1; }
  function xpIntoLevel(x) { const l = levelFromXp(x); const lo = Math.pow(l - 1, 2) * 40, hi = Math.pow(l, 2) * 40; return { l, pct: Math.round(((x - lo) / (hi - lo)) * 100) }; }
  function saveXp() { localStorage.setItem(LS_XP, String(xp)); }
  function addXp(n) {
    const before = levelFromXp(xp);
    xp += n;
    saveXp();
    const after = levelFromXp(xp);
    renderXpBadge();
    if (after > before) {
      playLevelUp();
      showToast(`⭐ Level ${after}!`, true);
      confettiBurst(document.body, 46);
    }
  }

  // ---------------- Sound (WebAudio synth, no assets) ----------------
  let actx = null;
  function ctx() { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); return actx; }
  function tone(freq, dur, type, delay, vol) {
    if (!soundOn) return;
    try {
      const c = ctx(), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      const t0 = c.currentTime + (delay || 0);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(vol || 0.16, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0); o.stop(t0 + dur + 0.03);
    } catch (e) { /* audio unsupported — fail silently */ }
  }
  function playCorrect() { tone(523.25, .12, 'triangle', 0, .16); tone(659.25, .14, 'triangle', .08, .16); tone(783.99, .18, 'triangle', .16, .16); }
  function playWrong() { tone(196, .28, 'sawtooth', 0, .12); }
  function playHeartLoss() { tone(150, .22, 'square', 0, .1); }
  function playLevelUp() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .22, 'triangle', i * .09, .17)); }

  // ---------------- Hearts ----------------
  function resetHearts() { hearts = MAX_HEARTS; }
  function loseHeart() { hearts = Math.max(0, hearts - 1); playHeartLoss(); }
  function heartsHtml() {
    let out = '';
    for (let i = 0; i < MAX_HEARTS; i++) out += `<span class="lt-heart${i < hearts ? '' : ' empty'}">❤️</span>`;
    return out;
  }

  // ---------------- Toast ----------------
  function showToast(text, isLevel) {
    const el = document.createElement('div');
    el.className = 'lt-toast' + (isLevel ? ' lt-toast-level' : '');
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1900);
  }

  // ---------------- Confetti ----------------
  const CONFETTI_COLORS = ['#16834b', '#f5ad12', '#f28b21', '#7650c9', '#2d6ac7', '#e0483f'];
  function confettiBurst(target, count) {
    const host = (target && target.style) ? target : document.body;
    const rect = host === document.body ? { left: 0, top: 0, width: window.innerWidth, height: 120 } : host.getBoundingClientRect();
    const layer = document.createElement('div');
    layer.className = 'lt-confetti-layer';
    if (host === document.body) {
      layer.style.position = 'fixed';
      layer.style.left = '0'; layer.style.top = '0'; layer.style.right = '0'; layer.style.height = '0';
      layer.style.zIndex = '9998';
    }
    for (let i = 0; i < (count || 18); i++) {
      const p = document.createElement('span');
      p.className = 'lt-confetti-piece';
      p.style.left = (host === document.body ? Math.random() * rect.width : Math.random() * rect.width) + 'px';
      p.style.top = (host === document.body ? 0 : Math.random() * 20) + 'px';
      p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDelay = (Math.random() * .25) + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
    }
    if (host === document.body) document.body.appendChild(layer);
    else { host.style.position = host.style.position || 'relative'; host.appendChild(layer); }
    setTimeout(() => layer.remove(), 1500);
  }

  function shake(el) {
    if (!el) return;
    el.classList.remove('lt-shake');
    void el.offsetWidth;
    el.classList.add('lt-shake');
    setTimeout(() => el && el.classList.remove('lt-shake'), 460);
  }

  // ---------------- Stars ----------------
  function starsForPct(pct) { return pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0; }
  function starsHtml(pct) {
    const n = starsForPct(pct);
    let out = '<div class="lt-stars">';
    for (let i = 0; i < 3; i++) out += `<span class="lt-star${i < n ? ' filled' : ''}">⭐</span>`;
    return out + '</div>';
  }

  // ---------------- Persistent HUD widgets ----------------
  function renderXpBadge() {
    let badge = document.getElementById('ltXpBadge');
    const actions = document.querySelector('.top-actions');
    if (!badge && actions) {
      badge = document.createElement('span');
      badge.className = 'lt-xp-badge';
      badge.id = 'ltXpBadge';
      const soundBtn = document.createElement('button');
      soundBtn.className = 'icon-btn lt-sound-btn' + (soundOn ? '' : ' muted');
      soundBtn.id = 'ltSoundBtn';
      soundBtn.type = 'button';
      soundBtn.setAttribute('aria-label', 'Toggle sound');
      soundBtn.textContent = soundOn ? '🔊' : '🔇';
      soundBtn.onclick = () => {
        soundOn = !soundOn;
        localStorage.setItem(LS_SOUND, soundOn ? 'on' : 'off');
        soundBtn.textContent = soundOn ? '🔊' : '🔇';
        soundBtn.classList.toggle('muted', !soundOn);
        if (soundOn) tone(660, .1, 'triangle', 0, .15);
      };
      const userLabel = document.getElementById('userLabel');
      const anchor = userLabel && userLabel.nextSibling ? userLabel.nextSibling : actions.firstChild;
      actions.insertBefore(badge, anchor);
      actions.insertBefore(soundBtn, anchor);
    }
    if (badge) {
      const { l, pct } = xpIntoLevel(xp);
      badge.innerHTML = `⭐ Lv <b>${l}</b> <span style="opacity:.7">· ${xp} XP</span>`;
      badge.title = `${Math.max(0, pct)}% to next level`;
    }
  }

  function injectQuizHud() {
    const quizCard = document.getElementById('quizCard');
    if (!quizCard) return;
    const top = quizCard.querySelector('.quiz-top');
    if (!top) return;
    let hud = quizCard.querySelector('.lt-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.className = 'lt-hud';
      top.insertAdjacentElement('afterend', hud);
    }
    hud.innerHTML = `<span class="lt-hearts">${heartsHtml()}</span>${combo >= 2 ? `<span class="lt-combo-pill">🔥 ${combo} streak</span>` : '<span></span>'}`;
  }

  // ---------------- Context detection (which quiz mode is active) ----------------
  function currentContext() {
    const topText = (document.querySelector('#quizCard .quiz-top') || {}).textContent || '';
    const m = topText.match(/Simple Present\s*·\s*Game\s*(\d+)/);
    if (m) return { type: 'sp', game: Number(m[1]) };
    return { type: 'generic' };
  }

  function handleGameOver() {
    const c = currentContext();
    const panel = c.type === 'sp' ? document.getElementById('spFeedback') : document.getElementById('feedback');
    if (!panel) return;
    panel.innerHTML = `<div class="feedback lt-gameover"><div class="lt-gameover-icon">💔</div><strong>Out of hearts!</strong><p class="muted">No worries — take a breath and give it another shot.</p><button class="primary" style="width:100%" id="ltRetryBtn">🔄 Try again</button><button class="secondary" id="ltBackBtn">← Back</button></div>`;
    const retry = document.getElementById('ltRetryBtn');
    const back = document.getElementById('ltBackBtn');
    if (retry) retry.onclick = () => {
      resetHearts(); combo = 0;
      if (c.type === 'sp' && typeof window.startSimplePresentGame === 'function') window.startSimplePresentGame(c.game);
      else if (typeof startQuiz === 'function') startQuiz(typeof currentTense !== 'undefined' && currentTense ? currentTense.id : 1);
    };
    if (back) back.onclick = () => {
      resetHearts(); combo = 0;
      if (typeof showScreen === 'function') {
        if (c.type === 'sp') { showScreen('lesson'); setTimeout(() => window.renderSimplePresentGames && window.renderSimplePresentGames(), 0); }
        else showScreen('dashboard');
      }
    };
  }

  // Called right after an answer button click resolves, based only on the
  // resulting DOM state — works identically for both quiz engines without
  // needing access to their private internal state.
  function afterAnswer() {
    const wrongPicked = document.querySelector('#quizCard .option.wrong');
    const ok = !wrongPicked;
    const card = document.getElementById('quizCard');
    document.querySelectorAll('#quizCard .option').forEach(b => b.disabled = true);
    if (ok) {
      combo++;
      const bonus = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;
      addXp(10 * bonus);
      playCorrect();
      confettiBurst(card, 14);
      if (comboMilestones.has(combo) || (combo > 12 && combo % 6 === 0)) showToast(`🔥 ${combo} in a row!`);
    } else {
      combo = 0;
      loseHeart();
      playWrong();
      shake(card);
    }
    injectQuizHud();
    if (!ok && hearts <= 0) setTimeout(handleGameOver, 650);
  }

  function enhanceResultCard(root) {
    const scoreEl = root.querySelector('.score');
    if (!scoreEl || scoreEl.dataset.ltDone) return;
    scoreEl.dataset.ltDone = '1';
    const pct = parseInt(scoreEl.textContent, 10) || 0;
    scoreEl.insertAdjacentHTML('afterend', starsHtml(pct));
    const gained = pct >= 80 ? 40 : pct >= 50 ? 20 : 10;
    addXp(gained);
    const container = scoreEl.parentElement || root;
    container.insertAdjacentHTML('beforeend', `<div class="lt-xp-gain">+${gained} XP</div>`);
    if (pct >= 80) confettiBurst(document.body, 60);
  }

  // ---------------- Wrapping helpers ----------------
  function wrap(name, fn) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = fn(orig);
  }

  wrap('answerQuestion', orig => function (i) {
    const already = typeof answered !== 'undefined' && answered;
    const r = orig.apply(this, arguments);
    if (!already) afterAnswer();
    return r;
  });

  wrap('answerSimplePresent', orig => function (i) {
    const already = !!document.querySelector('#quizCard .option[disabled]');
    const r = orig.apply(this, arguments);
    if (!already) afterAnswer();
    return r;
  });

  wrap('renderQuestion', orig => function () {
    const r = orig.apply(this, arguments);
    injectQuizHud();
    return r;
  });

  wrap('startQuiz', orig => async function (id) {
    resetHearts(); combo = 0;
    const r = await orig.apply(this, arguments);
    injectQuizHud();
    return r;
  });

  wrap('startSimplePresentGame', orig => function (game) {
    resetHearts(); combo = 0;
    const r = orig.apply(this, arguments);
    injectQuizHud();
    return r;
  });

  wrap('nextSimplePresent', orig => function () {
    const r = orig.apply(this, arguments);
    const resultCard = document.querySelector('#quizCard .result-card');
    if (resultCard) enhanceResultCard(document.getElementById('quizCard'));
    else injectQuizHud();
    return r;
  });

  wrap('showResult', orig => function () {
    const r = orig.apply(this, arguments);
    const root = document.getElementById('resultCard');
    if (root) enhanceResultCard(root);
    return r;
  });

  document.addEventListener('DOMContentLoaded', renderXpBadge);
  if (document.readyState !== 'loading') renderXpBadge();
})();
