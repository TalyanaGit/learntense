-- LearnTense Simple Present: 300-question game bank
-- 6 games x 50 questions. Each game contains 5 questions from each of 10 skills.
-- IMPORTANT: all inserts use explicit column names. Never use INSERT ... VALUES (...)
-- because the questions table contains legacy/evolved columns.

alter table public.questions add column if not exists game_number integer;

do $$
declare
  r record;
  i integer;
  game_no integer;
  skill_no integer;
  diff integer;
  singular boolean;
  b text;
  s text;
  opts jsonb;
  q text;
  exp text;
  correct_idx integer;
  qtype text;
  subjects text[] := array['I','You','We','They','He','She','My brother','Our teacher','Maria','David','The children','My parents','The bus','A good student','The manager'];
  bases text[] := array['go','watch','study','carry','fix','wash','play','read','cook','teach','try','miss','visit','work','drink'];
  third text[] := array['He','She','My brother','Our teacher','Maria','David','The bus','A good student','The manager'];
begin
  -- 300 questions: 6 games x 10 skills x 5 questions.
  for i in 1..300 loop
    game_no := ((i - 1) / 50) + 1;
    skill_no := (((i - 1) % 50) / 5) + 1;
    diff := case when game_no <= 2 then 1 when game_no <= 4 then 2 else 3 end;
    s := subjects[((i - 1) % array_length(subjects,1)) + 1];
    b := bases[((i * 3 - 1) % array_length(bases,1)) + 1];
    singular := s = any(third);

    if b='go' and singular then
      q := s || ' ___ to school every day.';
    else
      q := s || ' ___ ' || case b when 'watch' then 'TV' when 'study' then 'English' when 'carry' then 'the books' when 'fix' then 'the bike' when 'wash' then 'their hands' when 'play' then 'football' when 'read' then 'the news' when 'cook' then 'dinner' when 'teach' then 'maths' when 'try' then 'again' when 'miss' then 'the bus' when 'visit' then 'their grandparents' when 'work' then 'at a clinic' else 'tea' end || ' every day.';
    end if;

    s := case when singular then case b when 'go' then 'goes' when 'watch' then 'watches' when 'study' then 'studies' when 'carry' then 'carries' when 'fix' then 'fixes' when 'wash' then 'washes' when 'play' then 'plays' when 'read' then 'reads' when 'cook' then 'cooks' when 'teach' then 'teaches' when 'try' then 'tries' when 'miss' then 'misses' when 'visit' then 'visits' when 'work' then 'works' else 'drinks' end else b end;

    -- Ten distinct question types, five questions per type in each game.
    if skill_no = 1 then
      opts := jsonb_build_array(s, 'The correct Simple Present form is ' || s);
      correct_idx := 0; qtype := 'fill_blank'; exp := 'Choose the verb form that agrees with the subject.';
    elsif skill_no = 2 then
      q := 'Choose the correct sentence: ' || subjects[((i*2-1)%array_length(subjects,1))+1] || ' ___ every day.';
      opts := jsonb_build_array(q, replace(q,' ___ ',' ___s '));
      correct_idx := case when subjects[((i*2-1)%array_length(subjects,1))+1] = any(third) then 1 else 0 end;
      qtype := 'multiple_choice'; exp := 'Check subject-verb agreement in the Simple Present.';
    elsif skill_no = 3 then
      q := 'Correct the mistake: ' || lower(s) || ' ' || b || ' every day.';
      opts := jsonb_build_array(q, lower(s) || ' ' || s || ' every day.');
      correct_idx := 0; qtype := 'correct_mistake'; exp := 'Third-person singular subjects normally take -s or -es.';
    elsif skill_no = 4 then
      q := case when singular then 'Does ' || lower(s) else 'Do ' || lower(s) end || ' ' || b || ' every day?';
      opts := jsonb_build_array(q, replace(q,' ' || b || ' ',' ' || s || ' '));
      correct_idx := 0; qtype := 'question_formation'; exp := 'After do or does, use the base verb.';
    elsif skill_no = 5 then
      q := 'Choose the correct negative sentence.';
      opts := jsonb_build_array(case when singular then s || ' does not ' || b || ' every day.' else s || ' do not ' || b || ' every day.' end, case when singular then s || ' does not ' || s || ' every day.' else s || ' do not ' || s || ' every day.' end);
      correct_idx := 0; qtype := 'negative'; exp := 'Use do not or does not followed by the base verb.';
    elsif skill_no = 6 then
      q := 'Is this Simple Present sentence correct? ' || q;
      opts := jsonb_build_array('True','False'); correct_idx := 0; qtype := 'true_false'; exp := 'Check the subject and verb form.';
    elsif skill_no = 7 then
      q := 'Match the subject ' || s || ' with its correct verb form.';
      opts := jsonb_build_array(b, s); correct_idx := case when singular then 0 else 0 end; qtype := 'matching'; exp := 'Select the verb form that agrees with the subject.';
    elsif skill_no = 8 then
      q := 'Reorder: ' || lower(s) || ' / ' || b || ' / every day';
      opts := jsonb_build_array(initcap(lower(s)) || ' ' || case when singular then s else b end || ' every day.','Every day ' || lower(s) || ' ' || b || '.');
      correct_idx := 0; qtype := 'reordering'; exp := 'Build a grammatical Simple Present sentence.';
    elsif skill_no = 9 then
      q := 'Short answer: What does the subject usually do?';
      opts := jsonb_build_array('The subject follows a daily routine.','The subject followed a routine yesterday.'); correct_idx := 0; qtype := 'short_answer'; exp := 'Use the Simple Present for usual or repeated actions.';
    else
      q := 'Picture routine: choose the best Simple Present description.';
      opts := jsonb_build_array('The person follows the routine every day.','The person follow the routine every day.'); correct_idx := 0; qtype := 'picture_based'; exp := 'Routines use the Simple Present and correct subject-verb agreement.';
    end if;

    insert into public.questions (
      tense_id, question, options, correct_index, explanation, difficulty,
      is_active, attempt_count, correct_option, question_type, question_text,
      correct_answer, created_at, game_number
    ) values (
      1, q, opts, correct_idx, exp, diff,
      true, 0, correct_idx, qtype, q,
      correct_idx, now(), game_no
    );
  end loop;
end $$;

-- Verification: should show 50 questions for each game.
select game_number, count(*) as questions
from public.questions
where tense_id = 1 and game_number is not null
group by game_number
order by game_number;
