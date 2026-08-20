-- LearnTense existing-database fix
-- Run this once if the app was already deployed before profile/avatar + leaderboard updates.

alter table public.profiles add column if not exists avatar_url text;

drop function if exists public.get_leaderboard(integer);

create function public.get_leaderboard(limit_count int default 50)
returns table (
  display_name text,
  avatar_url text,
  points bigint,
  tenses_mastered bigint,
  is_current_user boolean
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(p.display_name, 'Learner') as display_name,
    coalesce(p.avatar_url, '🤖') as avatar_url,
    coalesce(sum(up.correct_answers), 0)::bigint as points,
    count(*) filter (
      where coalesce(
        up.mastery,
        case when up.questions_attempted > 0
          then round(up.correct_answers::numeric / up.questions_attempted * 100)
          else 0
        end
      ) >= 95
    )::bigint as tenses_mastered,
    (p.id = auth.uid()) as is_current_user
  from public.profiles p
  left join public.user_progress up on up.user_id = p.id
  group by p.id, p.display_name, p.avatar_url
  order by points desc, tenses_mastered desc, display_name asc
  limit greatest(coalesce(limit_count, 50), 1);
$$;

revoke all on function public.get_leaderboard(int) from public;
grant execute on function public.get_leaderboard(int) to authenticated;
