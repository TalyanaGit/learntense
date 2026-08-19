-- ============================================================
-- LearnTense: SIMPLE PRESENT - CLEAN 250 QUESTION GAME BANK
-- ============================================================
-- 10 games x 25 questions = 250 questions
-- 10 skills distributed through every game
-- Games 1-3: Easy | 4-6: Medium | 7-10: Hard
--
-- IMPORTANT:
-- Fill-in-the-blank questions NEVER put the answer verb in
-- the question text. Example:
--   She ___ TV every week.
--   A. watches  B. watch  C. watched  D. watching
--
-- The three answer fields are synchronized for compatibility:
-- correct_index, correct_option, correct_answer
-- ============================================================

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS game_number integer;

-- Remove generated Simple Present games from either the old
-- 6-game bank or this new 10-game bank.
DELETE FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 10;

DO $$
DECLARE
    i integer;
    game_no integer;
    skill_no integer;
    difficulty_level integer;
    subject_text text;
    base_verb text;
    third_verb text;
    past_verb text;
    ing_verb text;
    object_text text;
    time_text text;
    correct_form text;
    question_text_value text;
    explanation_text text;
    correct_answer_value text;
    question_type_value text;
    options_value jsonb;
    correct_index_value integer;
    is_third_person boolean;
BEGIN
    FOR i IN 1..250 LOOP
        game_no := ((i - 1) / 25) + 1;
        skill_no := ((i - 1) % 10) + 1;
        difficulty_level := CASE
            WHEN game_no <= 3 THEN 1
            WHEN game_no <= 6 THEN 2
            ELSE 3
        END;

        subject_text := CASE ((i - 1) % 15)
            WHEN 0 THEN 'I'
            WHEN 1 THEN 'You'
            WHEN 2 THEN 'We'
            WHEN 3 THEN 'They'
            WHEN 4 THEN 'He'
            WHEN 5 THEN 'She'
            WHEN 6 THEN 'My brother'
            WHEN 7 THEN 'Our teacher'
            WHEN 8 THEN 'Maria'
            WHEN 9 THEN 'David'
            WHEN 10 THEN 'The children'
            WHEN 11 THEN 'My parents'
            WHEN 12 THEN 'The bus'
            WHEN 13 THEN 'A good student'
            ELSE 'The manager'
        END;

        base_verb := CASE ((i - 1) % 15)
            WHEN 0 THEN 'go'
            WHEN 1 THEN 'watch'
            WHEN 2 THEN 'study'
            WHEN 3 THEN 'carry'
            WHEN 4 THEN 'fix'
            WHEN 5 THEN 'wash'
            WHEN 6 THEN 'play'
            WHEN 7 THEN 'read'
            WHEN 8 THEN 'cook'
            WHEN 9 THEN 'teach'
            WHEN 10 THEN 'try'
            WHEN 11 THEN 'miss'
            WHEN 12 THEN 'visit'
            WHEN 13 THEN 'work'
            ELSE 'drink'
        END;

        third_verb := CASE base_verb
            WHEN 'go' THEN 'goes'
            WHEN 'watch' THEN 'watches'
            WHEN 'study' THEN 'studies'
            WHEN 'carry' THEN 'carries'
            WHEN 'fix' THEN 'fixes'
            WHEN 'wash' THEN 'washes'
            WHEN 'play' THEN 'plays'
            WHEN 'read' THEN 'reads'
            WHEN 'cook' THEN 'cooks'
            WHEN 'teach' THEN 'teaches'
            WHEN 'try' THEN 'tries'
            WHEN 'miss' THEN 'misses'
            WHEN 'visit' THEN 'visits'
            WHEN 'work' THEN 'works'
            ELSE 'drinks'
        END;

        past_verb := CASE base_verb
            WHEN 'go' THEN 'went'
            WHEN 'watch' THEN 'watched'
            WHEN 'study' THEN 'studied'
            WHEN 'carry' THEN 'carried'
            WHEN 'fix' THEN 'fixed'
            WHEN 'wash' THEN 'washed'
            WHEN 'play' THEN 'played'
            WHEN 'read' THEN 'read'
            WHEN 'cook' THEN 'cooked'
            WHEN 'teach' THEN 'taught'
            WHEN 'try' THEN 'tried'
            WHEN 'miss' THEN 'missed'
            WHEN 'visit' THEN 'visited'
            WHEN 'work' THEN 'worked'
            ELSE 'drank'
        END;

        ing_verb := CASE base_verb
            WHEN 'go' THEN 'going'
            WHEN 'watch' THEN 'watching'
            WHEN 'study' THEN 'studying'
            WHEN 'carry' THEN 'carrying'
            WHEN 'fix' THEN 'fixing'
            WHEN 'wash' THEN 'washing'
            WHEN 'play' THEN 'playing'
            WHEN 'read' THEN 'reading'
            WHEN 'cook' THEN 'cooking'
            WHEN 'teach' THEN 'teaching'
            WHEN 'try' THEN 'trying'
            WHEN 'miss' THEN 'missing'
            WHEN 'visit' THEN 'visiting'
            WHEN 'work' THEN 'working'
            ELSE 'drinking'
        END;

        object_text := CASE base_verb
            WHEN 'go' THEN 'to school'
            WHEN 'watch' THEN 'TV'
            WHEN 'study' THEN 'English'
            WHEN 'carry' THEN 'the books'
            WHEN 'fix' THEN 'the bike'
            WHEN 'wash' THEN 'their hands'
            WHEN 'play' THEN 'football'
            WHEN 'read' THEN 'the news'
            WHEN 'cook' THEN 'dinner'
            WHEN 'teach' THEN 'maths'
            WHEN 'try' THEN 'again'
            WHEN 'miss' THEN 'the bus'
            WHEN 'visit' THEN 'their grandparents'
            WHEN 'work' THEN 'at a clinic'
            ELSE 'tea'
        END;

        -- Each game gets a distinct context, preventing duplicate
        -- question text across the ten games.
        time_text := CASE game_no
            WHEN 1 THEN 'every day'
            WHEN 2 THEN 'every week'
            WHEN 3 THEN 'on Mondays'
            WHEN 4 THEN 'in the morning'
            WHEN 5 THEN 'after school'
            WHEN 6 THEN 'on weekends'
            WHEN 7 THEN 'every month'
            WHEN 8 THEN 'in the evening'
            WHEN 9 THEN 'regularly'
            ELSE 'before dinner'
        END;

        is_third_person := subject_text IN (
            'He','She','My brother','Our teacher','Maria','David',
            'The bus','A good student','The manager'
        );

        correct_form := CASE WHEN is_third_person THEN third_verb ELSE base_verb END;
        question_text_value := '';
        explanation_text := '';
        correct_answer_value := correct_form;
        question_type_value := 'multiple_choice';
        options_value := '[]'::jsonb;
        correct_index_value := 0;

        -- Skill 1: fill in the blank.
        IF skill_no = 1 THEN
            question_text_value := subject_text || ' ___ ' || object_text || ' ' || time_text || '.';
            options_value := jsonb_build_array(correct_form, base_verb, past_verb, ing_verb);
            correct_answer_value := correct_form;
            question_type_value := 'fill_blank';
            explanation_text := CASE WHEN is_third_person
                THEN 'With he, she, or a singular third-person subject, use the -s or -es form.'
                ELSE 'With I, you, we, and they, use the base form.'
            END;

        -- Skill 2: choose the correct sentence.
        ELSIF skill_no = 2 THEN
            question_text_value := 'Choose the correct sentence.';
            options_value := jsonb_build_array(
                subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || CASE WHEN is_third_person THEN base_verb ELSE third_verb END || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || past_verb || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || ing_verb || ' ' || object_text || ' ' || time_text || '.'
            );
            correct_answer_value := subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.';
            explanation_text := 'The verb must agree with the subject in the Simple Present.';

        -- Skill 3: correct the mistake.
        ELSIF skill_no = 3 THEN
            question_text_value := 'Correct the mistake: ' || subject_text || ' ' || CASE WHEN is_third_person THEN base_verb ELSE third_verb END || ' ' || object_text || ' ' || time_text || '.';
            options_value := jsonb_build_array(
                subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || past_verb || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || ing_verb || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' ' || CASE WHEN is_third_person THEN base_verb ELSE third_verb END || ' ' || object_text || ' ' || time_text || '.'
            );
            correct_answer_value := subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.';
            question_type_value := 'correct_mistake';
            explanation_text := 'Use the base verb with I, you, we, and they; use the -s or -es form with singular third-person subjects.';

        -- Skill 4: question formation.
        ELSIF skill_no = 4 THEN
            question_text_value := 'Choose the correct question.';
            correct_answer_value := CASE WHEN is_third_person
                THEN 'Does ' || lower(subject_text) || ' ' || base_verb || ' ' || object_text || ' ' || time_text || '?'
                ELSE 'Do ' || lower(subject_text) || ' ' || base_verb || ' ' || object_text || ' ' || time_text || '?'
            END;
            options_value := jsonb_build_array(
                correct_answer_value,
                CASE WHEN is_third_person THEN 'Does ' || lower(subject_text) || ' ' || third_verb || ' ' || object_text || ' ' || time_text || '?' ELSE 'Does ' || lower(subject_text) || ' ' || base_verb || ' ' || object_text || ' ' || time_text || '?' END,
                CASE WHEN is_third_person THEN 'Do ' || lower(subject_text) || ' ' || base_verb || ' ' || object_text || ' ' || time_text || '?' ELSE 'Do ' || lower(subject_text) || ' ' || third_verb || ' ' || object_text || ' ' || time_text || '?' END,
                'Is ' || lower(subject_text) || ' ' || ing_verb || ' ' || object_text || ' ' || time_text || '?'
            );
            question_type_value := 'question_formation';
            explanation_text := 'After do or does, use the base form of the main verb.';

        -- Skill 5: negative sentences.
        ELSIF skill_no = 5 THEN
            question_text_value := 'Choose the correct negative sentence.';
            correct_answer_value := CASE WHEN is_third_person
                THEN subject_text || ' does not ' || base_verb || ' ' || object_text || ' ' || time_text || '.'
                ELSE subject_text || ' do not ' || base_verb || ' ' || object_text || ' ' || time_text || '.'
            END;
            options_value := jsonb_build_array(
                correct_answer_value,
                CASE WHEN is_third_person THEN subject_text || ' does not ' || third_verb || ' ' || object_text || ' ' || time_text || '.' ELSE subject_text || ' does not ' || base_verb || ' ' || object_text || ' ' || time_text || '.' END,
                CASE WHEN is_third_person THEN subject_text || ' do not ' || base_verb || ' ' || object_text || ' ' || time_text || '.' ELSE subject_text || ' does not ' || base_verb || ' ' || object_text || ' ' || time_text || '.' END,
                subject_text || ' did not ' || base_verb || ' ' || object_text || ' ' || time_text || '.'
            );
            question_type_value := 'negative';
            explanation_text := 'Use does not with singular third-person subjects and do not with I, you, we, and they.';

        -- Skill 6: true/false.
        ELSIF skill_no = 6 THEN
            question_text_value := 'Is this sentence correct? ' || subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.';
            options_value := '["True","False"]'::jsonb;
            correct_answer_value := 'True';
            question_type_value := 'true_false';
            explanation_text := 'The subject and verb correctly agree in the Simple Present.';

        -- Skill 7: verb-form matching.
        ELSIF skill_no = 7 THEN
            question_text_value := 'Choose the correct verb form for "' || subject_text || '".';
            options_value := jsonb_build_array(correct_form, CASE WHEN is_third_person THEN base_verb ELSE third_verb END, past_verb, ing_verb);
            correct_answer_value := correct_form;
            question_type_value := 'matching';
            explanation_text := 'Match the verb form to the subject.';

        -- Skill 8: habit/routine recognition.
        ELSIF skill_no = 8 THEN
            question_text_value := 'Which sentence best describes a regular habit?';
            options_value := jsonb_build_array(
                subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.',
                subject_text || ' is ' || ing_verb || ' ' || object_text || ' now.',
                subject_text || ' ' || past_verb || ' ' || object_text || ' yesterday.',
                subject_text || ' will ' || base_verb || ' ' || object_text || ' tomorrow.'
            );
            correct_answer_value := subject_text || ' ' || correct_form || ' ' || object_text || ' ' || time_text || '.';
            question_type_value := 'context_choice';
            explanation_text := 'The Simple Present is commonly used for habits and routines.';

        -- Skill 9: do/does selection.
        ELSIF skill_no = 9 THEN
            question_text_value := 'Choose the correct auxiliary: ___ ' || lower(subject_text) || ' ' || base_verb || ' ' || object_text || '?';
            options_value := CASE WHEN is_third_person
                THEN '["Does","Do","Is","Did"]'::jsonb
                ELSE '["Do","Does","Is","Did"]'::jsonb
            END;
            correct_answer_value := CASE WHEN is_third_person THEN 'Does' ELSE 'Do' END;
            question_type_value := 'auxiliary_choice';
            explanation_text := CASE WHEN is_third_person
                THEN 'Use does with singular third-person subjects.'
                ELSE 'Use do with I, you, we, and they.'
            END;

        -- Skill 10: contextual fill.
        ELSE
            question_text_value := subject_text || ' usually ___ ' || object_text || '.';
            options_value := jsonb_build_array(correct_form, base_verb, past_verb, ing_verb);
            correct_answer_value := correct_form;
            question_type_value := 'context_choice';
            explanation_text := 'Usually describes a repeated habit, so the Simple Present is appropriate.';
        END IF;

        INSERT INTO public.questions (
            tense_id, question, options, correct_index, explanation,
            difficulty, is_active, attempt_count, correct_option,
            question_type, question_text, correct_answer, game_number
        ) VALUES (
            1, question_text_value, options_value, correct_index_value,
            explanation_text, difficulty_level, true, 0, correct_index_value,
            question_type_value, question_text_value, correct_index_value, game_no
        );
    END LOOP;
END $$;

-- ============================================================
-- VALIDATION: these queries should return 250 total and
-- exactly 25 questions for every game 1-10.
-- ============================================================
SELECT count(*) AS total_questions
FROM public.questions
WHERE tense_id = 1 AND game_number BETWEEN 1 AND 10;

SELECT game_number, count(*) AS questions_per_game
FROM public.questions
WHERE tense_id = 1 AND game_number BETWEEN 1 AND 10
GROUP BY game_number
ORDER BY game_number;
