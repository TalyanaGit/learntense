// LearnTense UI revamp wiring.
// Loaded last: populates the new greeting/avatar/search bar and the new
// Profile screen by wrapping existing render functions from app.js —
// no changes to auth, Supabase sync, or quiz logic.
(function () {
  'use strict';

  function displayName() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.email) return currentUser.email.split('@')[0];
    return 'Guest';
  }
  function initials(name) { return (name || 'G').trim().charAt(0).toUpperCase(); }

  function renderGreeting() {
    const nameEl = document.getElementById('greetingName');
    const avatar = document.getElementById('homeAvatar');
    const name = displayName();
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    if (nameEl) nameEl.textContent = `Hello, ${label} 👋`;
    if (avatar) avatar.textContent = initials(name);
  }

  function renderProfile() {
    const name = displayName();
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const avatar = document.getElementById('profileAvatar');
    if (nameEl) nameEl.textContent = label;
    if (emailEl) emailEl.textContent = (typeof currentUser !== 'undefined' && currentUser && currentUser.email) ? currentUser.email : 'Playing as guest';
    if (avatar) avatar.textContent = initials(name);

    const acc = document.getElementById('accuracyStat');
    const streak = document.getElementById('streakStat');
    const mastered = document.getElementById('masteredStat');
    const answered = document.getElementById('answeredStat');
    const pAcc = document.getElementById('profileAccuracy');
    const pStreak = document.getElementById('profileStreak');
    const pMastered = document.getElementById('profileMastered');
    const pAnswered = document.getElementById('profileAnswered');
    if (acc && pAcc) pAcc.textContent = acc.textContent;
    if (streak && pStreak) pStreak.textContent = `${streak.textContent} Days`;
    if (mastered && pMastered) pMastered.textContent = mastered.textContent;
    if (answered && pAnswered) pAnswered.textContent = answered.textContent;

    const xpBadge = document.getElementById('ltXpBadge');
    const pLevel = document.getElementById('profileLevel');
    if (pLevel) {
      if (xpBadge) { const m = xpBadge.textContent.match(/Lv\s*(\d+)/); pLevel.textContent = m ? `Lv ${m[1]}` : 'Lv 1'; }
      else pLevel.textContent = 'Lv 1';
    }
  }

  // Search-as-you-type over the tense list
  function wireSearch() {
    const input = document.getElementById('tenseSearch');
    const results = document.getElementById('tenseSearchResults');
    if (!input || !results || input.dataset.wired) return;
    input.dataset.wired = '1';
    input.addEventListener('input', () => {
      const term = input.value.trim().toLowerCase();
      if (!term) { results.classList.remove('show'); results.innerHTML = ''; return; }
      const list = (typeof tenses !== 'undefined' && tenses.length ? tenses : []).filter(t =>
        t.name.toLowerCase().includes(term) || t.category.toLowerCase().includes(term));
      results.innerHTML = list.length
        ? list.slice(0, 8).map(t => `<button type="button" data-id="${t.id}">${t.icon} ${t.name} <span class="muted">· ${t.category}</span></button>`).join('')
        : `<div class="lt-empty">No tenses match "${input.value.trim()}"</div>`;
      results.classList.add('show');
    });
    document.addEventListener('click', e => {
      const btn = e.target.closest('#tenseSearchResults button');
      if (btn) { startLesson(Number(btn.dataset.id)); results.classList.remove('show'); input.value = ''; return; }
      if (!e.target.closest('.home-search')) results.classList.remove('show');
    });
  }

  function wireProfileExtras() {
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn && !logoutBtn.dataset.wired) { logoutBtn.dataset.wired = '1'; logoutBtn.onclick = () => document.getElementById('logoutBtn').click(); }
    const themeBtn = document.getElementById('profileThemeBtn');
    if (themeBtn && !themeBtn.dataset.wired) { themeBtn.dataset.wired = '1'; themeBtn.onclick = () => document.getElementById('themeBtn').click(); }
    const tabs = document.querySelectorAll('.profile-tabs .pill-tab');
    tabs.forEach(tab => { if (!tab.dataset.wired) { tab.dataset.wired = '1'; tab.onclick = () => tabs.forEach(t => t.classList.toggle('active', t === tab)); } });
  }

  function wrap(name, fn) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = fn(orig);
  }

  wrap('renderDashboard', orig => function () {
    const r = orig.apply(this, arguments);
    renderGreeting();
    renderProfile();
    return r;
  });

  wrap('renderLibrary', orig => function () {
    const r = orig.apply(this, arguments);
    wireSearch();
    return r;
  });

  wrap('openApp', orig => function () {
    const r = orig.apply(this, arguments);
    renderGreeting();
    wireSearch();
    wireProfileExtras();
    return r;
  });

  document.addEventListener('DOMContentLoaded', wireProfileExtras);
  if (document.readyState !== 'loading') wireProfileExtras();
})();
