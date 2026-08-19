# 📚 LearnTense

Learn English tenses through short lessons, interactive practice, mistake review and progress tracking.

## What changed in LearnTense 2.0

- Dashboard with accuracy, streak, questions answered and mastery
- Tense library for all 12 English tenses
- Structured lesson screens with formulas and examples
- Interactive practice with instant explanations
- Mistake review queue
- Weak-area practice
- Local progress persistence
- Supabase-ready progress persistence
- Responsive mobile/tablet/desktop design
- Dark mode

## Project structure

```text
learntense/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Supabase

## Database direction

The application is designed around these Supabase tables:

- `tenses` — tense catalogue
- `lessons` — lesson content for each tense
- `questions` — practice questions
- `options` — answer options when questions use a normalized option model
- `user_progress` — learner accuracy and mastery
- `attempts` — individual question attempts
- `mistakes` — questions needing review
- `profiles` — learner profile data

The browser uses the Supabase publishable/anon key only. Keep Row Level Security enabled and never expose a service-role/secret key in frontend code.

## Learning loop

**Learn → Practice → Understand mistakes → Review → Master**

## Roadmap

### Phase 1 — Foundation
- [x] Dashboard
- [x] Tense library
- [x] Responsive UI
- [x] Basic progress tracking
- [x] Mistake review
- [ ] Authentication
- [ ] Complete Supabase schema/RLS

### Phase 2 — Learning
- [x] Lesson explanations
- [x] Multiple-choice practice
- [x] Instant feedback
- [ ] Multiple question types
- [ ] Difficulty levels
- [ ] Complete lesson content for all 12 tenses

### Phase 3 — Personalization
- [x] Weak-area recommendation
- [ ] Adaptive question selection
- [ ] Spaced repetition
- [ ] Daily practice
- [ ] Streaks and achievements synced to accounts

### Phase 4 — Product
- [ ] Profile page
- [ ] Teacher/admin dashboard
- [ ] Learning analytics
- [ ] More grammar topics

## Local development

This is a static frontend. Serve the repository with any local HTTP server or deploy it to a static hosting provider. Configure the Supabase project and database before enabling production user data.
