# 📚 LearnTense 2.0

Learn English tenses through a simple learning loop:

**Learn → Practice → Understand mistakes → Review → Master**

## Features

- Dashboard with accuracy, mastery and question statistics
- Library for all 12 English tenses
- Structured tense lessons
- Interactive practice with instant explanations
- Weak-area practice
- Mistake review
- Local progress fallback
- Supabase cloud progress for signed-in users
- Responsive design and dark mode

## Tech stack

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase

## Supabase setup

1. Open your Supabase project SQL Editor.
2. Run [`supabase/schema.sql`](supabase/schema.sql).
3. In Supabase Authentication, enable Email/OTP if you want cloud accounts.
4. Keep Row Level Security enabled.
5. Never put a Supabase service-role/secret key in frontend code. The browser should only use the publishable/anon key.

The schema creates:

- `profiles` — learner profile
- `tenses` — 12-tense catalogue
- `lessons` — lesson content
- `questions` — practice questions
- `user_progress` — per-user mastery
- `attempts` — individual answers
- `mistakes` — review queue
- `achievements` — unlocked achievements

## Project structure

```text
learntense/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── supabase/
│   └── schema.sql
└── README.md
```

## Roadmap

### Phase 1 — Foundation
- [x] Dashboard
- [x] Tense library
- [x] Progress tracking
- [x] Mistake review
- [x] Supabase schema + RLS
- [ ] Email authentication UI

### Phase 2 — Learning
- [x] Lesson explanations
- [x] Multiple-choice practice
- [x] Instant feedback
- [ ] Complete lesson content for all 12 tenses
- [ ] Multiple question types
- [ ] Difficulty levels

### Phase 3 — Personalization
- [x] Weak-area recommendation
- [ ] Adaptive question selection
- [ ] Spaced repetition
- [ ] Daily practice
- [ ] Synced streaks and achievements

### Phase 4 — Product
- [ ] Profile page
- [ ] Teacher/admin dashboard
- [ ] Learning analytics
- [ ] Additional grammar topics
