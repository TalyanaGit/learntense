-- LearnTense Simple Present: 300-question game bank
-- 6 games x 50 questions. Each game contains 5 questions from each of 10 skills.
-- Games 1-2 = Easy, 3-4 = Hard, 5-6 = Difficult.
-- The bank is generated from deliberately varied subject/verb/context combinations.

alter table public.questions add column if not exists game_number integer;

do $$
declare
  r record;
  i integer;
  game_no integer;
  diff integer;
  subjects text[] := array['I','You','We','They','He','She','My brother','Our teacher','Maria','David','The children','My parents','The bus','A good student','The manager'];
  bases text[] := array['go','watch','study','carry','fix','wash','play','read','cook','teach','try','miss','visit','work','drink'];
  third text[] := array['He','She','My brother','Our teacher','Maria','David','The bus','A good student','The manager'];
  contexts text[] := array['before breakfast','after school','every morning','on Mondays','in the evening','at weekends','before dinner','during the week','twice a week','after exercise','before the lesson','on Fridays','each afternoon','every Sunday','at seven'];
  singular boolean;
  b text;
  s text;
  opts jsonb;
  q text;
  exp text;
begin
  -- 30 fill-in-the-blank questions: exactly 5 in each game.
  for i in 1..30 loop
    s:=subjects[((i-1)%array_length(subjects,1))+1];
    b:=bases[((i*3-1)%array_length(bases,1))+1];
    singular:=s=any(third);
    if b='go' and singular then q:=s||' ___ to school '||contexts[((i-1)%15)+1]||'.';
    else q:=s||' ___ '||case b when 'watch' then 'TV' when 'study' then 'English' when 'carry' then 'the books' when 'fix' then 'the bike' when 'wash' then 'their hands' when 'play' then 'football' when 'read' then 'the news' when 'cook' then 'dinner' when 'teach' then 'maths' when 'try' then 'again' when 'miss' then 'the bus' when 'visit' then 'their grandparents' when 'work' then 'at a clinic' else 'tea' end||' '||contexts[((i-1)%15)+1]||'.'; end if;
    s:=case when singular then case b when 'go' then 'goes' when 'watch' then 'watches' when 'study' then 'studies' when 'carry' then 'carries' when 'fix' then 'fixes' when 'wash' then 'washes' when 'play' then 'plays' when 'read' then 'reads' when 'cook' then 'cooks' when 'teach' then 'teaches' when 'try' then 'tries' when 'miss' then 'misses' when 'visit' then 'visits' when 'work' then 'works' else 'drinks' end else b end;
    opts=jsonb_build_array(s,b);
    game_no=((i-1)/5)+1; diff=case when game_no<=2 then 1 when game_no<=4 then 2 else 3 end;
    insert into public.questions(tense_id,question,options,correct_index,explanation,difficulty,is_active,question_type,question_text,correct_answer,correct_option,game_number)
    values(1,q,opts,0,'Choose the verb form that agrees with the subject.',diff,true,'fill_blank',q,0,0,game_no);
  end loop;

  -- 30 multiple-choice questions.
  for i in 1..30 loop
    s:=subjects[((i*2-1)%array_length(subjects,1))+1]; b:=bases[((i*5-1)%array_length(bases,1))+1]; singular:=s=any(third);
    q:='Choose the correct sentence: '||s||' '||case when singular then b||'s' else b end||' '||contexts[((i+2)%15)+1]||'.';
    if singular then opts=jsonb_build_array(s||' '||b||' '||contexts[((i+2)%15)+1]||'.',s||' '||b||'s '||contexts[((i+2)%15)+1]||'.'); else opts=jsonb_build_array(s||' '||b||' '||contexts[((i+2)%15)+1]||'.',s||' '||b||'s '||contexts[((i+2)%15)+1]||'.'); end if;
    -- For MC, correct_index is 0 for plural/I/you/we/they and 1 for third person.
    insert into public.questions(tense_id,question,options,correct_index,explanation,difficulty,is_active,question_type,question_text,correct_answer,correct_option,game_number)
    values(1,q,opts,case when singular then 1 else 0 end,'Check subject-verb agreement before choosing.',case when i<=10 then 1 when i<=20 then 2 else 3 end,true,'multiple_choice',q,case when singular then 1 else 0 end,case when singular then 1 else 0 end,((i-1)/5)+1);
  end loop;

  -- The remaining eight skills use 30 distinct task contexts each.
  for i in 1..30 loop
    game_no=((i-1)/5)+1; diff=case when game_no<=2 then 1 when game_no<=4 then 2 else 3 end;

    -- Correct the mistake
    s:=subjects[((i*4-1)%array_length(subjects,1))+1]; b:=bases[((i*7-1)%array_length(bases,1))+1]; singular:=s=any(third);
    q:='Correct the mistake: “'||s||' '||case when singular then b else b||'s' end||' '||contexts[((i+4)%15)+1]||'.”';
    opts=jsonb_build_array(s||' '||case when singular then case b when 'go' then 'goes' when 'watch' then 'watches' when 'study' then 'studies' when 'carry' then 'carries' when 'fix' then 'fixes' when 'wash' then 'washes' when 'play' then 'plays' when 'read' then 'reads' when 'cook' then 'cooks' when 'teach' then 'teaches' when 'try' then 'tries' when 'miss' then 'misses' when 'visit' then 'visits' when 'work' then 'works' else 'drinks' end else b end||' '||contexts[((i+4)%15)+1]||'.',s||' '||b||'s '||contexts[((i+4)%15)+1]||'.');
    insert into public.questions(tense_id,question,options,correct_index,explanation,difficulty,is_active,question_type,question_text,correct_answer,correct_option,game_number) values(1,q,opts,0,'The correction must match the subject.',diff,true,'correct_mistake',q,0,0,game_no);

    -- Question formation
    s:=case when singular then 'Does '||lower(s) else 'Do '||lower(s) end; q:=s||' '||b||' '||contexts[((i+6)%15)+1]||'?'; opts=jsonb_build_array(q,replace(q,' '||b||' ',' '||b||'s '));
    insert into public.questions values(default,1,q,opts,0,'After do/does, use the base verb.',diff,true,0,0,'question_formation',q,0,now(),game_no);

    -- Negative
    s:=case when singular then lower(s)||' does not ' else lower(s)||' do not ' end; q:=initcap(s)||b||' '||contexts[((i+8)%15)+1]||'.'; opts=jsonb_build_array(q,initcap(s)||b||'s '||contexts[((i+8)%15)+1]||'.');
    insert into public.questions values(default,1,q,opts,0,'Use do not/does not + base verb.',diff,true,0,0,'negative',q,0,now(),game_no);

    -- True/False passage
    q:='Read: '||initcap(lower(s))||' '||b||' '||contexts[((i+10)%15)+1]||'. Is the statement true?'; opts=jsonb_build_array('True','False');
    insert into public.questions values(default,1,q,opts,0,'Use only the information stated in the passage.',diff,true,0,0,'true_false',q,0,now(),game_no);

    -- Matching
    q:='Match the subject “'||subjects[((i+3)%15)+1]||'” with its correct verb form.'; opts=jsonb_build_array(b,b||'s');
    insert into public.questions values(default,1,q,opts,case when subjects[((i+3)%15)+1]=any(third) then 1 else 0 end,'Choose the verb that agrees with the subject.',diff,true,0,0,'matching',q,case when subjects[((i+3)%15)+1]=any(third) then 1 else 0 end,now(),game_no);

    -- Picture-based routine prompt (emoji acts as the current visual placeholder).
    q:='🖼️ Picture routine: someone performs an everyday action. Choose the best Simple Present sentence about it ('||contexts[((i+1)%15)+1]||').'; opts=jsonb_build_array('The person follows the routine every day.','The person follow the routine every day.');
    insert into public.questions values(default,1,q,opts,0,'Describe a routine with the Simple Present.',diff,true,0,0,'picture_based',q,0,now(),game_no);

    -- Reordering
    q:='Reorder: '||lower(subjects[((i+5)%15)+1])||' / '||b||' / '||contexts[((i+9)%15)+1]; opts=jsonb_build_array(initcap(lower(subjects[((i+5)%15)+1]))||' '||case when subjects[((i+5)%15)+1]=any(third) then b||'s' else b end||' '||contexts[((i+9)%15)+1]||'.',''||contexts[((i+9)%15)+1]||' '||lower(subjects[((i+5)%15)+1])||' '||b||'.');
    insert into public.questions values(default,1,q,opts,0,'Build a grammatical Simple Present sentence and check subject-verb agreement.',diff,true,0,0,'reordering',q,0,now(),game_no);

    -- Short answer (two clickable model answers for the current no-typing stage).
    q:='Short answer: What do you usually do '||contexts[((i+11)%15)+1]||'?'; opts=jsonb_build_array('I usually follow my routine '||contexts[((i+11)%15)+1]||'.','I usually do not know.');
    insert into public.questions values(default,1,q,opts,0,'Choose the complete sentence that answers the question using the Simple Present.',diff,true,0,0,'short_answer',q,0,now(),game_no);
  end loop;
end $$;
