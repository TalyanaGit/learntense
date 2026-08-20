class ChallengeArena {
  constructor(supabaseClient) {
    this.sb = supabaseClient;
    this.roomCode = null;
    this.roomId = null;
    this.channel = null;
    this.isHost = false;
    this.questions = [];
    this.currentIdx = 0;
    this.score = 0;
    this.timer = null;
    this.timeLeft = 10;
    this.startTime = null;
    this.players = new Map();
    this.userId = null;
    this.answeredCurrent = false;
    this.bindEvents();
  }

  bindEvents() {
    document.getElementById('btn-create-challenge')?.addEventListener('click', () => this.createRoom());
    document.getElementById('btn-join-challenge')?.addEventListener('click', () => {
      const code = document.getElementById('join-room-code')?.value.trim().toUpperCase();
      if (code) this.joinRoom(code);
    });
    document.getElementById('btn-start-challenge')?.addEventListener('click', () => this.startMatch());
    document.getElementById('btn-exit-challenge')?.addEventListener('click', () => this.exitLobby());
  }

  getStoredProfile() {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || '{"displayName":"Player","avatar":"🤖"}');
    } catch (_) {
      return { displayName: 'Player', avatar: '🤖' };
    }
  }

  getCurrentUser() {
    return this.sb.auth.getUser().then(({ data }) => data?.user || null);
  }

  async createRoom() {
    const topic = document.getElementById('challenge-topic')?.value || 'simple_present';
    const count = Math.max(1, parseInt(document.getElementById('challenge-count')?.value, 10) || 5);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const user = await this.getCurrentUser();

    if (!user) return alert('Please log in to host a challenge.');

    const { data: room, error } = await this.sb.from('challenge_rooms').insert({
      host_id: user.id,
      room_code: code,
      topic,
      question_count: count,
      status: 'waiting'
    }).select().single();

    if (error) {
      console.error('Create challenge room failed:', error);
      return alert('Could not create the challenge room. Make sure the challenge tables are installed in Supabase.');
    }

    this.roomId = room.id;
    this.roomCode = code;
    this.isHost = true;
    this.userId = user.id;

    // The existing LearnTense schema stores tense_id rather than a topic column.
    const topicTenseId = {
      simple_present: 1,
      present_continuous: 2,
      present_perfect: 3,
      simple_past: 5
    }[topic];

    let qQuery = this.sb.from('questions').select('*').limit(count);
    if (topicTenseId) qQuery = qQuery.eq('tense_id', topicTenseId);
    const { data: qData, error: qError } = await qQuery;

    if (qError) console.warn('Question lookup failed:', qError.message);
    this.questions = (qData || []).map(this.normalizeQuestion).filter(Boolean);
    if (!this.questions.length) this.questions = this.getFallbackQuestions(topic, count);

    await this.connectRealtime(user);
    this.showWaitingScreen();
  }

  async joinRoom(code) {
    const user = await this.getCurrentUser();
    if (!user) return alert('Please log in to join.');

    const { data: room, error } = await this.sb.from('challenge_rooms')
      .select('*')
      .eq('room_code', code)
      .eq('status', 'waiting')
      .single();

    if (error || !room) return alert('Room not found, or the challenge has already started.');

    this.roomId = room.id;
    this.roomCode = code;
    this.isHost = false;
    this.userId = user.id;

    await this.connectRealtime(user);
    this.showWaitingScreen();
  }

  async connectRealtime(user) {
    const profile = this.getStoredProfile();
    if (this.channel) await this.channel.unsubscribe();

    this.channel = this.sb.channel(`room_${this.roomCode}`, {
      config: { presence: { key: user.id } }
    });

    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel.presenceState();
      this.renderLobbyPlayers(state);
    });

    this.channel.on('broadcast', { event: 'game_start' }, ({ payload }) => {
      this.questions = (payload?.questions || []).map(this.normalizeQuestion).filter(Boolean);
      if (this.questions.length) this.startArena();
    });

    this.channel.on('broadcast', { event: 'score_update' }, ({ payload }) => {
      if (!payload?.userId) return;
      this.updateLiveScores(payload.userId, payload.score, payload.displayName, payload.avatar);
    });

    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.channel.track({
          userId: user.id,
          displayName: profile.displayName || 'Player',
          avatar: profile.avatar || '🤖',
          score: 0
        });
      }
    });
  }

  renderLobbyPlayers(presenceState) {
    const container = document.getElementById('connected-players-list');
    const counter = document.getElementById('player-count');
    if (!container || !counter) return;

    const activeUsers = Object.values(presenceState || {}).flat();
    counter.textContent = activeUsers.length;
    container.innerHTML = '';

    activeUsers.forEach(p => {
      this.updateLiveScores(p.userId, Number(p.score) || 0, p.displayName, p.avatar);
      const el = document.createElement('div');
      el.className = 'player-chip';
      el.innerHTML = `<div class="challenge-avatar">${this.escapeHtml(p.avatar || '🤖')}</div><small>${this.escapeHtml(p.displayName || 'Player')}</small>`;
      container.appendChild(el);
    });

    const startButton = document.getElementById('btn-start-challenge');
    if (startButton) startButton.classList.toggle('hidden', !this.isHost || activeUsers.length < 2);
  }

  async startMatch() {
    if (!this.isHost || !this.channel || this.questions.length === 0) return;
    await this.sb.from('challenge_rooms').update({ status: 'active' }).eq('id', this.roomId);
    await this.channel.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { questions: this.questions }
    });
    this.startArena();
  }

  startArena() {
    clearInterval(this.timer);
    document.getElementById('challenge-waiting-screen')?.classList.add('hidden');
    document.getElementById('challenge-arena-screen')?.classList.remove('hidden');
    document.getElementById('challenge-results-screen')?.classList.add('hidden');
    this.currentIdx = 0;
    this.score = 0;
    this.players = new Map();
    this.answeredCurrent = false;

    const profile = this.getStoredProfile();
    this.updateLiveScores(this.userId, 0, profile.displayName, profile.avatar);
    this.renderQuestion();
  }

  renderQuestion() {
    clearInterval(this.timer);
    if (this.currentIdx >= this.questions.length) return this.finishMatch();

    const q = this.questions[this.currentIdx];
    this.answeredCurrent = false;
    document.getElementById('live-question-index').textContent =
      `Question ${this.currentIdx + 1} of ${this.questions.length}`;
    document.getElementById('live-question-text').textContent = q.question;

    const optContainer = document.getElementById('live-options-container');
    optContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => this.handleAnswer(idx, q.correct_index, btn));
      optContainer.appendChild(btn);
    });

    this.timeLeft = 10;
    this.startTime = Date.now();
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.textContent = `${this.timeLeft}s`;

    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      if (timerEl) timerEl.textContent = `${Math.max(0, this.timeLeft)}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.nextQuestion();
      }
    }, 1000);
  }

  handleAnswer(selected, correct, clickedButton) {
    if (this.answeredCurrent) return;
    this.answeredCurrent = true;
    clearInterval(this.timer);

    const elapsed = Math.min(10, Math.max(0, (Date.now() - this.startTime) / 1000));
    const correctAnswer = Number(selected) === Number(correct);

    if (correctAnswer) {
      const speedBonus = Math.max(0, Math.round((10 - elapsed) * 10));
      this.score += 100 + speedBonus;
      clickedButton?.classList.add('challenge-correct');
    } else {
      clickedButton?.classList.add('challenge-wrong');
    }

    const profile = this.getStoredProfile();
    this.updateLiveScores(this.userId, this.score, profile.displayName, profile.avatar);
    this.channel?.send({
      type: 'broadcast',
      event: 'score_update',
      payload: {
        userId: this.userId,
        score: this.score,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    });

    this.nextQuestion();
  }

  nextQuestion() {
    this.currentIdx += 1;
    setTimeout(() => this.renderQuestion(), 400);
  }

  updateLiveScores(userId, score, displayName, avatar) {
    if (!userId) return;
    this.players.set(userId, { score: Number(score) || 0, displayName: displayName || 'Player', avatar: avatar || '🤖' });

    const liveBar = document.getElementById('live-ranking-chips');
    if (!liveBar) return;
    liveBar.innerHTML = '';

    [...this.players.entries()]
      .sort((a, b) => b[1].score - a[1].score)
      .forEach(([, p]) => {
        const tag = document.createElement('div');
        tag.className = 'player-score-tag';
        tag.textContent = `${p.avatar} ${p.displayName}: ${p.score} pts`;
        liveBar.appendChild(tag);
      });
  }

  async finishMatch() {
    clearInterval(this.timer);
    document.getElementById('challenge-arena-screen')?.classList.add('hidden');
    document.getElementById('challenge-results-screen')?.classList.remove('hidden');

    const tbody = document.getElementById('final-rankings-body');
    if (tbody) {
      tbody.innerHTML = '';
      [...this.players.values()].sort((a, b) => b.score - a.score).forEach((p, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${medal}</td><td>${this.escapeHtml(p.avatar)} ${this.escapeHtml(p.displayName)}</td><td><strong>${p.score}</strong> pts</td>`;
        tbody.appendChild(tr);
      });
    }

    const user = await this.getCurrentUser();
    if (user && this.roomId) {
      const { error } = await this.sb.from('challenge_participants').upsert({
        room_id: this.roomId,
        user_id: user.id,
        score: this.score,
        finished: true
      });
      if (error) console.warn('Challenge score save failed:', error.message);
    }
  }

  showWaitingScreen() {
    document.getElementById('challenge-lobby-screen')?.classList.add('hidden');
    document.getElementById('challenge-waiting-screen')?.classList.remove('hidden');
    const codeEl = document.getElementById('display-room-code');
    if (codeEl) codeEl.textContent = this.roomCode;
  }

  async exitLobby() {
    clearInterval(this.timer);
    if (this.channel) {
      await this.channel.untrack().catch(() => {});
      await this.channel.unsubscribe().catch(() => {});
      this.channel = null;
    }
    if (this.isHost && this.roomId) {
      await this.sb.from('challenge_rooms').update({ status: 'finished' }).eq('id', this.roomId);
    }
    this.roomId = null;
    this.roomCode = null;
    this.isHost = false;
    this.questions = [];
    this.players.clear();
    document.getElementById('challenge-results-screen')?.classList.add('hidden');
    document.getElementById('challenge-arena-screen')?.classList.add('hidden');
    document.getElementById('challenge-waiting-screen')?.classList.add('hidden');
    document.getElementById('challenge-lobby-screen')?.classList.remove('hidden');
  }

  normalizeQuestion(q) {
    if (!q) return null;
    let options = q.options;
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch (_) { options = []; }
    }
    options = Array.isArray(options) ? options : [];
    const question = q.question || q.question_text;
    const correct_index = Number.isInteger(q.correct_index)
      ? q.correct_index
      : Number.isInteger(q.correct_answer) ? q.correct_answer : 0;
    return question && options.length ? { question, options, correct_index } : null;
  }

  getFallbackQuestions(topic, count) {
    const sets = {
      simple_present: [
        { question: 'She ___ to the market every morning.', options: ['go', 'goes', 'gone', 'going'], correct_index: 1 },
        { question: 'They ___ soccer on Sundays.', options: ['play', 'plays', 'played', 'playing'], correct_index: 0 },
        { question: 'The sun ___ in the east.', options: ['rise', 'rises', 'rising', 'rose'], correct_index: 1 },
        { question: 'He does not ___ coffee.', options: ['likes', 'like', 'liked', 'liking'], correct_index: 1 },
        { question: 'Water ___ at 100 degrees Celsius.', options: ['boils', 'boil', 'boiled', 'boiling'], correct_index: 0 }
      ],
      simple_past: [
        { question: 'Yesterday, I ___ to school.', options: ['go', 'went', 'gone', 'going'], correct_index: 1 },
        { question: 'She ___ the book last night.', options: ['read', 'reads', 'reading', 'has read'], correct_index: 0 }
      ]
    };
    const list = sets[topic] || sets.simple_present;
    return Array.from({ length: count }, (_, i) => list[i % list.length]);
  }

  escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }
}

window.ChallengeArena = ChallengeArena;
