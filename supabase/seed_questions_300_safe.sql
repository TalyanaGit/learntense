-- LearnTense: type-safe 300-question seed
-- Use this script instead of the legacy simple_present_300.sql.
-- It never uses INSERT INTO public.questions VALUES (...).
-- 6 games x 50 questions = 300 questions.

alter table public.questions add column if not exists game_number integer;

DO $$
declare
  i integer;
  game_no integer;
  skill_no integer;
  diff integer;
  q text;
  opts jsonb;
  correct_idx integer;
  qtype text;
  exp text;
  tense bigint := 1;
  subjects text[] := array['I','You','We','They','He','She','My brother','Maria','The children','The teacher'];
  verbs text[] := array['go','watch','study','play','read','cook','work','visit','teach','drink'];
  s text;
  v text;
  sv text;
begin
  -- 6 games, 10 skills, 5 questions per skill = 300 questions.
  for i in 1..300 loop
    game_no := ((i - 1) / 50) + 1;
    skill_no := (((i - 1) % 50) / 5) + 1;
    diff := case when game_no <= 2 then 1 when game_no <= 4 then 2 else 3 end;
    s := subjects[((i - 1) % array_length(subjects,1)) + 1];
    v := verbs[((i * 3 - 1) % array_length(verbs,1)) + 1];

    -- Third-person singular form used by the templates below.
    sv := case v
      when 'go' then 'goes' when 'watch' then 'watches' when 'study' then 'studies'
      when 'play' then 'plays' when 'read' then 'reads' when 'cook' then 'cooks'
      when 'work' then 'works' when 'visit' then 'visits' when 'teach' then 'teaches'
      when 'drink' then 'drinks' else v || 's' end;

    if skill_no = 1 then
      q := s || ' ___ every day.';
      opts := jsonb_build_array(v, case when s in ('He','She','My brother','Maria','The teacher') then sv else v end);
      correct_idx := case when s in ('He','She','My brother','Maria','The teacher') then 1 else 0 end;
      qtype := 'fill_blank';
      exp := 'Choose the Simple Present verb that agrees with the subject.';

    elsif skill_no = 2 then
      q := 'Choose the correct sentence about ' || lower(s) || '.';
      opts := jsonb_build_array(
        s || ' ' || v || ' every day.',
        s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then sv else v end || ' every day.'
      );
      correct_idx := case when s in ('He','She','My brother','Maria','The teacher') then 1 else 0 end;
      qtype := 'multiple_choice';
      exp := 'The verb must agree with the subject in the Simple Present.';

    elsif skill_no = 3 then
      q := 'Correct the mistake: ' || s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then v else sv end || ' every day.';
      opts := jsonb_build_array(
        s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then sv else v end || ' every day.',
        s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then v else sv end || ' every day.'
      );
      correct_idx := 0;
      qtype := 'correct_mistake';
      exp := 'In the Simple Present, third-person singular subjects normally take -s or -es.';

    elsif skill_no = 4 then
      q := case when s in ('He','She','My brother','Maria','The teacher') then 'Does ' || lower(s) else 'Do ' || lower(s) end || ' ' || v || ' every day?';
      opts := jsonb_build_array(q, replace(q, ' ' || v || ' ', ' ' || sv || ' '));
      correct_idx := 0;
      qtype := 'question_formation';
      exp := 'After do or does, use the base verb.';

    elsif skill_no = 5 then
      q := 'Choose the correct negative sentence.';
      opts := jsonb_build_array(
        case when s in ('He','She','My brother','Maria','The teacher') then s || ' does not ' || v || '.' else s || ' do not ' || v || '.' end,
        case when s in ('He','She','My brother','Maria','The teacher') then s || ' does not ' || sv || '.' else s || ' do not ' || sv || '.' end
      );
      correct_idx := 0;
      qtype := 'negative';
      exp := 'Use do not or does not followed by the base verb.';

    elsif skill_no = 6 then
      q := 'Read the statement: ' || s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then sv else v end || ' every day. Is it grammatically correct?';
      opts := jsonb_build_array('True','False');
      correct_idx := 0;
      qtype := 'true_false';
      exp := 'Check subject-verb agreement in the Simple Present.';

    elsif skill_no = 7 then
      q := 'Match the subject ' || s || ' with the correct verb form.';
      opts := case when s in ('He','She','My brother','Maria','The teacher')
        then jsonb_build_array(v, sv) else jsonb_build_array(v, sv) end;
      correct_idx := case when s in ('He','She','My brother','Maria','The teacher') then 1 else 0 end;
      qtype := 'matching';
      exp := 'Select the verb form that agrees with the subject.';

    elsif skill_no = 8 then
      q := 'Reorder: ' || lower(s) || ' / ' || v || ' / every day';
      opts := jsonb_build_array(
        s || ' ' || case when s in ('He','She','My brother','Maria','The teacher') then sv else v end || ' every day.',
        'Every day ' || lower(s) || ' ' || v || '.'
      );
      correct_idx := 0;
      qtype := 'reordering';
      exp := 'Build a complete Simple Present sentence with correct subject-verb agreement.';

    elsif skill_no = 9 then
      q := 'Short answer: What does ' || lower(s) || ' usually do?';
      opts := jsonb_build_array(
        s || ' usually ' || case when s in ('He','She','My brother','Maria','The teacher') then sv else v end || '.',
        s || ' usually ' || v || 'ed.'
      );
      correct_idx := 0;
      qtype := 'short_answer';
      exp := 'Use the Simple Present for usual or repeated actions.';

    else
      q := 'Which verb form completes this routine sentence: ' || s || ' ___ every morning?';
      opts := jsonb_build_array(v, sv, v || 'ing', v || 'ed');
      correct_idx := case when s in ('He','She','My brother','Maria','The teacher') then 1 else 0 end;
      qtype := 'routine';
      exp := 'Routines are commonly expressed with the Simple Present.';
    end if;

    insert into public.questions (
      tense_id,
      question,
      options,
      correct_index,
      explanation,
      difficulty,
      is_active,
      attempt_count,
      correct_option,
      question_type,
      question_text,
      correct_answer,
      created_at,
      game_number
    ) values (
      tense,
      q,
      opts,
      correct_idx,
      exp,
      diff,
      true,
      0,
      correct_idx,
      qtype,
      q,
      correct_idx,
      now(),
      game_no
    );
  end loop;
end $$;

-- Verify the generated bank.
select game_number, count(*) as questions
from public.questions
where tense_id = 1 and game_number is not null
 group by game_number
 order by game_number;
