-- LearnTense leaderboard
-- Run this in the Supabase SQL Editor after schema.sql.
--
-- Design note: user_progress and profiles both stay locked to
-- "auth.uid() = user_id" (see schema.sql) — this migration does NOT
-- loosen those policies. Instead it adds a single SECURITY DEFINER
-- function that returns only what a leaderboard needs (a display
-- name, a points total and a mastered-tense count) and nothing else
-- — no user_id, no email, no per-question detail. That keeps every
-- child's raw progress data private while still letting everyone
-- see a fair, aggregate ranking.

create or replace function public.get_leaderboard(limit_count int default 50)
returns table (
  display_name text,
  points bigint,
  tenses_mastered bigint
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(p.display_name, 'Learner') as display_name,
    coalesce(sum(up.correct_answers), 0)::bigint as points,
    count(*) filter (
      where coalesce(
        up.mastery,
        case when up.questions_attempted > 0
          then round(up.correct_answers::numeric / up.questions_attempted * 100)
          else 0
        end
      ) >= 95
    ) as tenses_mastered
  from public.profiles p
  left join public.user_progress up on up.user_id = p.id
  group by p.id, p.display_name
  having coalesce(sum(up.correct_answers), 0) > 0
  order by points desc, tenses_mastered desc
  limit greatest(limit_count, 1);
$$;

-- Any signed-in user can call this (it only ever returns the safe,
-- aggregated columns defined above — never raw table rows).
grant execute on function public.get_leaderboard(int) to authenticated;
