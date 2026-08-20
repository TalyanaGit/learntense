-- ============================================================
-- LearnTense
-- SIMPLE PRESENT - CLEAN 300 QUESTION GAME BANK
--
-- 6 Games
-- 50 questions per game
-- 10 skills
-- 5 questions per skill per game
--
-- IMPORTANT RULE:
-- The question text NEVER contains the answer verb
-- when the answer belongs in a blank.
--
-- Example:
-- GOOD:
--   She ___ TV every week.
--   A. watches
--   B. watch
--   C. watched
--   D. watching
--
-- BAD:
--   She ___ watchs every week.
--
-- ============================================================


-- ------------------------------------------------------------
-- 1. Make sure game_number exists
-- ------------------------------------------------------------

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS game_number integer;


-- ------------------------------------------------------------
-- 2. Remove the old generated Simple Present game bank
-- ------------------------------------------------------------

DELETE FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6;


-- ------------------------------------------------------------
-- 3. Generate 300 questions
-- ------------------------------------------------------------

DO $$
DECLARE

    i integer;
    game_no integer;
    skill_no integer;
    difficulty_level integer;

    subject_text text;
    base_verb text;
    correct_verb text;
    object_text text;

    question_text_value text;
    explanation_text text;

    options_value jsonb;

    correct_index_value integer;
    correct_answer_value text;

    question_type_value text;

    is_third_person boolean;


BEGIN

    -- ========================================================
    -- 300 QUESTIONS
    -- ========================================================

    FOR i IN 1..300 LOOP


        -- ----------------------------------------------------
        -- GAME NUMBER
        -- 1-50   = Game 1
        -- 51-100 = Game 2
        -- etc.
        -- ----------------------------------------------------

        game_no :=
            ((i - 1) / 50) + 1;


        -- ----------------------------------------------------
        -- SKILL NUMBER
        --
        -- 1-5    = Skill 1
        -- 6-10   = Skill 2
        -- ...
        -- ----------------------------------------------------

        skill_no :=
            (((i - 1) % 50) / 5) + 1;


        -- ----------------------------------------------------
        -- DIFFICULTY
        -- Games 1-2 = Easy
        -- Games 3-4 = Medium
        -- Games 5-6 = Hard
        -- ----------------------------------------------------

        difficulty_level :=
            CASE
                WHEN game_no <= 2 THEN 1
                WHEN game_no <= 4 THEN 2
                ELSE 3
            END;


        -- ====================================================
        -- SUBJECT
        -- ====================================================

        subject_text :=
            CASE ((i - 1) % 15)

                WHEN 0  THEN 'I'
                WHEN 1  THEN 'You'
                WHEN 2  THEN 'We'
                WHEN 3  THEN 'They'
                WHEN 4  THEN 'He'
                WHEN 5  THEN 'She'
                WHEN 6  THEN 'My brother'
                WHEN 7  THEN 'Our teacher'
                WHEN 8  THEN 'Maria'
                WHEN 9  THEN 'David'
                WHEN 10 THEN 'The children'
                WHEN 11 THEN 'My parents'
                WHEN 12 THEN 'The bus'
                WHEN 13 THEN 'A good student'
                WHEN 14 THEN 'The manager'

            END;


        -- ====================================================
        -- BASE VERB
        -- ====================================================

        base_verb :=
            CASE ((i * 3 - 1) % 15)

                WHEN 0  THEN 'go'
                WHEN 1  THEN 'watch'
                WHEN 2  THEN 'study'
                WHEN 3  THEN 'carry'
                WHEN 4  THEN 'fix'
                WHEN 5  THEN 'wash'
                WHEN 6  THEN 'play'
                WHEN 7  THEN 'read'
                WHEN 8  THEN 'cook'
                WHEN 9  THEN 'teach'
                WHEN 10 THEN 'try'
                WHEN 11 THEN 'miss'
                WHEN 12 THEN 'visit'
                WHEN 13 THEN 'work'
                WHEN 14 THEN 'drink'

            END;


        -- ====================================================
        -- THIRD PERSON TEST
        -- ====================================================

        is_third_person :=
            subject_text IN (
                'He',
                'She',
                'My brother',
                'Our teacher',
                'Maria',
                'David',
                'The bus',
                'A good student',
                'The manager'
            );


        -- ====================================================
        -- CORRECT SIMPLE PRESENT FORM
        -- ====================================================

        correct_verb :=
            CASE base_verb

                WHEN 'go'    THEN 'goes'
                WHEN 'watch' THEN 'watches'
                WHEN 'study' THEN 'studies'
                WHEN 'carry' THEN 'carries'
                WHEN 'fix'   THEN 'fixes'
                WHEN 'wash'  THEN 'washes'
                WHEN 'play'  THEN 'plays'
                WHEN 'read'  THEN 'reads'
                WHEN 'cook'  THEN 'cooks'
                WHEN 'teach' THEN 'teaches'
                WHEN 'try'   THEN 'tries'
                WHEN 'miss'  THEN 'misses'
                WHEN 'visit' THEN 'visits'
                WHEN 'work'  THEN 'works'
                WHEN 'drink' THEN 'drinks'

            END;


        -- ====================================================
        -- OBJECT
        -- ====================================================

        object_text :=
            CASE base_verb

                WHEN 'go'    THEN 'to school'
                WHEN 'watch' THEN 'TV'
                WHEN 'study' THEN 'English'
                WHEN 'carry' THEN 'the books'
                WHEN 'fix'   THEN 'the bike'
                WHEN 'wash'  THEN 'their hands'
                WHEN 'play'  THEN 'football'
                WHEN 'read'  THEN 'the news'
                WHEN 'cook'  THEN 'dinner'
                WHEN 'teach' THEN 'maths'
                WHEN 'try'   THEN 'again'
                WHEN 'miss'  THEN 'the bus'
                WHEN 'visit' THEN 'their grandparents'
                WHEN 'work'  THEN 'at a clinic'
                WHEN 'drink' THEN 'tea'

            END;


        -- ====================================================
        -- DEFAULT VALUES
        -- ====================================================

        question_text_value := '';
        options_value := '[]'::jsonb;
        correct_index_value := 0;
        correct_answer_value := '';
        question_type_value := '';
        explanation_text := '';


        -- ====================================================
        -- SKILL 1
        -- FILL IN THE BLANK
        --
        -- CRITICAL:
        -- Question contains ONLY the blank.
        -- It NEVER contains watches/watchs/etc.
        -- ====================================================

        IF skill_no = 1 THEN

            question_text_value :=
                subject_text ||
                ' ___ ' ||
                object_text ||
                ' every week.';

            options_value :=
                jsonb_build_array(
                    correct_verb,
                    base_verb,
                    base_verb || 'ed',
                    base_verb || 'ing'
                );

            correct_index_value := 0;

            correct_answer_value := correct_verb;

            question_type_value := 'fill_blank';

            explanation_text :=
                CASE
                    WHEN is_third_person THEN
                        'With he, she, or a singular third-person subject, use the -s or -es form in the Simple Present.'
                    ELSE
                        'With I, you, we, and they, use the base form of the verb in the Simple Present.'
                END;


        -- ====================================================
        -- SKILL 2
        -- CHOOSE THE CORRECT SENTENCE
        -- ====================================================

        ELSIF skill_no = 2 THEN

            question_text_value :=
                'Choose the correct sentence.';

            options_value :=
                jsonb_build_array(

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' ' || object_text || ' every week.',

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN base_verb
                        ELSE correct_verb
                    END ||
                    ' ' || object_text || ' every week.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || ' every week.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || ' every week.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every week.';

            question_type_value := 'multiple_choice';

            explanation_text :=
                'The verb must agree with the subject in the Simple Present.';


        -- ====================================================
        -- SKILL 3
        -- CORRECT THE MISTAKE
        -- ====================================================

        ELSIF skill_no = 3 THEN

            question_text_value :=
                'Correct the mistake: ' ||
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN base_verb
                    ELSE correct_verb
                END ||
                ' ' || object_text || ' every week.';

            options_value :=
                jsonb_build_array(

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' ' || object_text || ' every week.',

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN base_verb
                        ELSE correct_verb
                    END ||
                    ' ' || object_text || ' every week.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || ' every week.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || ' every week.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every week.';

            question_type_value := 'correct_mistake';

            explanation_text :=
                'Third-person singular subjects use the correct -s or -es form of the verb.';


        -- ====================================================
        -- SKILL 4
        -- QUESTION FORMATION
        -- ====================================================

        ELSIF skill_no = 4 THEN

            question_text_value :=
                'Choose the correct question.';

            options_value :=
                jsonb_build_array(

                    CASE
                        WHEN is_third_person
                        THEN
                            'Does ' || lower(subject_text) ||
                            ' ' || base_verb ||
                            ' every week?'
                        ELSE
                            'Do ' || lower(subject_text) ||
                            ' ' || base_verb ||
                            ' every week?'
                    END,

                    CASE
                        WHEN is_third_person
                        THEN
                            'Does ' || lower(subject_text) ||
                            ' ' || correct_verb ||
                            ' every week?'
                        ELSE
                            'Does ' || lower(subject_text) ||
                            ' ' || base_verb ||
                            ' every week?'
                    END,

                    CASE
                        WHEN is_third_person
                        THEN
                            'Do ' || lower(subject_text) ||
                            ' ' || base_verb ||
                            ' every week?'
                        ELSE
                            'Do ' || lower(subject_text) ||
                            ' ' || correct_verb ||
                            ' every week?'
                    END,

                    'Is ' || lower(subject_text) ||
                    ' ' || base_verb ||
                    ' every week?'

                );

            correct_index_value := 0;

            correct_answer_value :=
                CASE
                    WHEN is_third_person
                    THEN
                        'Does ' || lower(subject_text) ||
                        ' ' || base_verb ||
                        ' every week?'
                    ELSE
                        'Do ' || lower(subject_text) ||
                        ' ' || base_verb ||
                        ' every week?'
                END;

            question_type_value := 'question_formation';

            explanation_text :=
                'After do or does, use the base form of the main verb.';


        -- ====================================================
        -- SKILL 5
        -- NEGATIVE
        -- ====================================================

        ELSIF skill_no = 5 THEN

            question_text_value :=
                'Choose the correct negative sentence.';

            options_value :=
                jsonb_build_array(

                    CASE
                        WHEN is_third_person
                        THEN
                            subject_text ||
                            ' does not ' ||
                            base_verb ||
                            ' ' || object_text ||
                            ' every week.'
                        ELSE
                            subject_text ||
                            ' do not ' ||
                            base_verb ||
                            ' ' || object_text ||
                            ' every week.'
                    END,

                    CASE
                        WHEN is_third_person
                        THEN
                            subject_text ||
                            ' does not ' ||
                            correct_verb ||
                            ' ' || object_text ||
                            ' every week.'
                        ELSE
                            subject_text ||
                            ' do not ' ||
                            correct_verb ||
                            ' ' || object_text ||
                            ' every week.'
                    END,

                    CASE
                        WHEN is_third_person
                        THEN
                            subject_text ||
                            ' do not ' ||
                            base_verb ||
                            ' ' || object_text ||
                            ' every week.'
                        ELSE
                            subject_text ||
                            ' does not ' ||
                            base_verb ||
                            ' ' || object_text ||
                            ' every week.'
                    END,

                    subject_text ||
                    ' did not ' ||
                    base_verb ||
                    ' ' || object_text ||
                    ' every week.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                CASE
                    WHEN is_third_person
                    THEN
                        subject_text ||
                        ' does not ' ||
                        base_verb ||
                        ' ' || object_text ||
                        ' every week.'
                    ELSE
                        subject_text ||
                        ' do not ' ||
                        base_verb ||
                        ' ' || object_text ||
                        ' every week.'
                END;

            question_type_value := 'negative';

            explanation_text :=
                'Use does not with third-person singular subjects and do not with I, you, we, and they.';


        -- ====================================================
        -- SKILL 6
        -- TRUE / FALSE
        -- ====================================================

        ELSIF skill_no = 6 THEN

            question_text_value :=
                'Is this sentence correct? ' ||
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every week.';

            options_value :=
                jsonb_build_array(
                    'True',
                    'False'
                );

            correct_index_value := 0;

            correct_answer_value := 'True';

            question_type_value := 'true_false';

            explanation_text :=
                'The subject and verb correctly agree in the Simple Present.';


        -- ====================================================
        -- SKILL 7
        -- MATCHING
        -- ====================================================

        ELSIF skill_no = 7 THEN

            question_text_value :=
                'Choose the correct verb form for "' ||
                subject_text ||
                '".';

            options_value :=
                jsonb_build_array(
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END,

                    CASE
                        WHEN is_third_person
                        THEN base_verb
                        ELSE correct_verb
                    END,

                    base_verb || 'ed',

                    base_verb || 'ing'
                );

            correct_index_value := 0;

            correct_answer_value :=
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END;

            question_type_value := 'matching';

            explanation_text :=
                'Choose the verb form that agrees with the subject.';


        -- ====================================================
        -- SKILL 8
        -- REORDERING
        -- ====================================================

        ELSIF skill_no = 8 THEN

            question_text_value :=
                'Reorder the words: ' ||
                lower(subject_text) ||
                ' / ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' / every week';

            options_value :=
                jsonb_build_array(

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' every week.',

                    'Every week ' ||
                    lower(subject_text) || ' ' ||
                    base_verb || '.',

                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' ' || lower(subject_text) ||
                    ' every week.',

                    lower(subject_text) ||
                    ' every week ' ||
                    CASE
                        WHEN is_third_person
                        THEN base_verb
                        ELSE correct_verb
                    END ||
                    '.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' every week.';

            question_type_value := 'reordering';

            explanation_text :=
                'The subject comes before the verb, and the verb must agree with the subject.';


        -- ====================================================
        -- SKILL 9
        -- SHORT ANSWER
        -- ====================================================

        ELSIF skill_no = 9 THEN

            question_text_value :=
                'What does ' ||
                lower(subject_text) ||
                ' usually do?';

            options_value :=
                jsonb_build_array(

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' ' || object_text || '.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || '.',

                    subject_text || ' is ' ||
                    base_verb || ' ' ||
                    object_text || '.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || '.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' ' || object_text || '.';

            question_type_value := 'short_answer';

            explanation_text :=
                'The Simple Present is used for usual, repeated, and routine actions.';


        -- ====================================================
        -- SKILL 10
        -- ROUTINE / PICTURE DESCRIPTION
        -- ====================================================

        ELSE

            question_text_value :=
                'Choose the best Simple Present description.';

            options_value :=
                jsonb_build_array(

                    'The person ' ||
                    CASE
                        WHEN is_third_person
                        THEN correct_verb
                        ELSE base_verb
                    END ||
                    ' ' || object_text ||
                    ' every week.',

                    'The person ' ||
                    base_verb ||
                    ' ' || object_text ||
                    ' every week.',

                    'The person ' ||
                    base_verb || 'ed ' ||
                    object_text ||
                    ' every week.',

                    'The person is ' ||
                    base_verb || 'ing ' ||
                    object_text ||
                    ' every week.'

                );

            correct_index_value := 0;

            correct_answer_value :=
                'The person ' ||
                CASE
                    WHEN is_third_person
                    THEN correct_verb
                    ELSE base_verb
                END ||
                ' ' || object_text ||
                ' every week.';

            question_type_value := 'picture_based';

            explanation_text :=
                'The Simple Present is commonly used to describe routines and repeated actions.';

        END IF;


        -- ====================================================
        -- INSERT
        -- EXPLICIT COLUMN NAMES
        -- ====================================================

        INSERT INTO public.questions (
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
        )
        VALUES (
            1,
            question_text_value,
            options_value,
            correct_index_value,
            explanation_text,
            difficulty_level,
            true,
            0,
            correct_index_value,
            question_type_value,
            question_text_value,
            correct_answer_value,
            now(),
            game_no
        );

    END LOOP;

END $$;


-- ============================================================
-- VERIFICATION 1
-- EXPECTED:
--
-- game_number | questions
-- ------------+----------
-- 1           | 50
-- 2           | 50
-- 3           | 50
-- 4           | 50
-- 5           | 50
-- 6           | 50
-- ============================================================

SELECT
    game_number,
    COUNT(*) AS questions
FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6
GROUP BY game_number
ORDER BY game_number;


-- ============================================================
-- VERIFICATION 2
-- EXPECTED:
-- Every game × every question type = 5
-- ============================================================

SELECT
    game_number,
    question_type,
    COUNT(*) AS questions
FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6
GROUP BY game_number, question_type
ORDER BY game_number, question_type;


-- ============================================================
-- VERIFICATION 3
-- CHECK WATCH QUESTIONS
--
-- There should NEVER be:
-- "She ___ watchs..."
--
-- Instead:
-- "She ___ TV every week."
-- ============================================================

SELECT
    id,
    game_number,
    question_type,
    question,
    options,
    correct_index,
    correct_answer
FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6
  AND (
      question ILIKE '%watch%'
      OR options::text ILIKE '%watch%'
  )
ORDER BY id;


-- ============================================================
-- VERIFICATION 4
-- FIND MALFORMED "___ VERB" QUESTIONS
--
-- This catches cases where a conjugated verb accidentally
-- appears immediately after the blank.
-- ============================================================

SELECT
    id,
    game_number,
    question,
    options,
    correct_answer
FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6
  AND (
      question ILIKE '%___ watch%'
      OR question ILIKE '%___ study%'
      OR question ILIKE '%___ carry%'
      OR question ILIKE '%___ fix%'
      OR question ILIKE '%___ wash%'
      OR question ILIKE '%___ play%'
      OR question ILIKE '%___ read%'
      OR question ILIKE '%___ cook%'
      OR question ILIKE '%___ teach%'
      OR question ILIKE '%___ try%'
      OR question ILIKE '%___ miss%'
      OR question ILIKE '%___ visit%'
      OR question ILIKE '%___ work%'
      OR question ILIKE '%___ drink%'
      OR question ILIKE '%___ go%'
  )
ORDER BY id;