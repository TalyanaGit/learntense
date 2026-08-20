-- LearnTense Simple Present: clean 250-question seed
-- 10 games x 25 questions. Each game has 5 questions from each of 5 skills:
-- fill-in-the-blank, multiple choice, correction, question formation, negatives.
-- Explicit column names are used throughout.

alter table public.questions add column if not exists game_number integer;
alter table public.questions add column if not exists skill_number integer;

-- Keep old Simple Present seed rows out of the active practice pool.
update public.questions set is_active=false where tense_id=1;

DO $$
declare
  g integer;
  i integer;
  v integer;
  subj text;
  base text;
  third text;
  object_text text;
  routine text;
  singular boolean;
  correct_text text;
  wrong_text text;
  question_text text;
  options jsonb;
  answer_idx integer;
  explanation text;
begin
  for g in 1..10 loop
    for i in 1..5 loop
      v := ((g-1)*5+i-1) % 15 + 1;
      base := (array['go','watch','study','play','wash','read','cook','teach','fix','carry','try','brush','miss','pass','do'])[v];
      third := (array['goes','watches','studies','plays','washes','reads','cooks','teaches','fixes','carries','tries','brushes','misses','passes','does'])[v];
      object_text := (array['to school','TV','English','football','the dishes','books','dinner','English','bicycles','a bag','new recipes','their teeth','the bus','the shop','homework'])[v];
      subj := (array['I','You','We','They','He','She','It','Ravi','Maya','The children'])[((g+i-2)%10)+1];
      singular := subj in ('He','She','It','Ravi','Maya');
      correct_text := case when singular then third else base end;
      wrong_text := case when singular then base else third end;
      routine := (array['every day','every morning','on Sundays','after school','at night'])[((g+i-2)%5)+1];

      -- Skill 1: fill in the blank
      question_text := subj || ' ___ ' || object_text || ' ' || routine || '.';
      options := jsonb_build_array(correct_text,wrong_text,base || 'ed',base || 'ing');
      insert into public.questions(tense_id,question,question_text,options,correct_index,correct_option,correct_answer,explanation,difficulty,is_active,attempt_count,question_type,game_number,skill_number)
      values(1,question_text,question_text,options,0,0,0,'Use ' || case when singular then 'the third-person -s/-es form' else 'the base form' end || ' with ' || subj || '.',case when g<=3 then 1 when g<=6 then 2 else 3 end,true,0,'multiple_choice',g,1);

      -- Skill 2: multiple choice
      question_text := (case when singular then subj else 'She' end) || ' ___ ' || object_text || ' ' || routine || '.';
      correct_text := case when singular then third else third end;
      options := jsonb_build_array(correct_text,base,base || 'ed',base || 'ing');
      insert into public.questions(tense_id,question,question_text,options,correct_index,correct_option,correct_answer,explanation,difficulty,is_active,attempt_count,question_type,game_number,skill_number)
      values(1,question_text,question_text,options,0,0,0,'He, she and it use the third-person -s/-es form.',case when g<=3 then 1 when g<=6 then 2 else 3 end,true,0,'multiple_choice',g,2);

      -- Skill 3: correction
      question_text := 'Choose the correct sentence.';
      options := jsonb_build_array(subj || ' ' || wrong_text || ' ' || object_text || ' ' || routine || '.',subj || ' ' || correct_text || ' ' || object_text || ' ' || routine || '.');
      insert into public.questions(tense_id,question,question_text,options,correct_index,correct_option,correct_answer,explanation,difficulty,is_active,attempt_count,question_type,game_number,skill_number)
      values(1,question_text,question_text,options,1,1,1,'The correct sentence uses ' || correct_text || ' with ' || subj || '.',case when g<=3 then 1 when g<=6 then 2 else 3 end,true,0,'multiple_choice',g,3);

      -- Skill 4: question formation
      question_text := 'Make a question from: ' || subj || ' ' || correct_text || ' ' || object_text || ' ' || routine || '.';
      correct_text := case when singular then 'Does ' || subj || ' ' || base || ' ' || object_text || ' ' || routine || '?' else 'Do ' || subj || ' ' || base || ' ' || object_text || ' ' || routine || '?' end;
      wrong_text := case when singular then 'Do ' || subj || ' ' || third || ' ' || object_text || '?' else 'Does ' || subj || ' ' || third || ' ' || object_text || '?' end;
      options := jsonb_build_array(correct_text,wrong_text,subj || ' ' || third || ' ' || object_text || '?','Is ' || subj || ' ' || base || ' ' || object_text || '?');
      insert into public.questions(tense_id,question,question_text,options,correct_index,correct_option,correct_answer,explanation,difficulty,is_active,attempt_count,question_type,game_number,skill_number)
      values(1,question_text,question_text,options,0,0,0,'Use ' || case when singular then 'does' else 'do' end || ' and keep the main verb in its base form.',case when g<=3 then 1 when g<=6 then 2 else 3 end,true,0,'multiple_choice',g,4);

      -- Skill 5: negatives
      question_text := 'Choose the correct negative sentence.';
      correct_text := subj || ' ' || case when singular then 'does not ' else 'do not ' end || base || ' ' || object_text || ' ' || routine || '.';
      wrong_text := subj || ' ' || case when singular then 'do not ' else 'does not ' end || base || ' ' || object_text || ' ' || routine || '.';
      options := jsonb_build_array(correct_text,wrong_text,'No ' || subj || ' ' || correct_text || '.','Not ' || subj || ' ' || base || ' ' || object_text || '.');
      insert into public.questions(tense_id,question,question_text,options,correct_index,correct_option,correct_answer,explanation,difficulty,is_active,attempt_count,question_type,game_number,skill_number)
      values(1,question_text,question_text,options,0,0,0,'Use ' || case when singular then 'does not' else 'do not' end || ' plus the base verb.',case when g<=3 then 1 when g<=6 then 2 else 3 end,true,0,'multiple_choice',g,5);
    end loop;
  end loop;
end $$;

-- Verification: exactly 250 active Simple Present seed questions.
select count(*) as active_simple_present_questions from public.questions where tense_id=1 and is_active=true;
