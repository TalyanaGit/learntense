-- ============================================================
-- LearnTense - Simple Present
-- 300-question game bank
-- 6 games × 50 questions
-- 10 skills × 5 questions per skill per game
-- ============================================================

ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS game_number integer;


-- Remove the previously generated Simple Present game bank
-- so this script can be safely re-run.
DELETE FROM public.questions
WHERE tense_id = 1
  AND game_number BETWEEN 1 AND 6;


DO $$
DECLARE
    i integer;
    game_no integer;
    skill_no integer;
    diff integer;

    subject_text text;
    base_verb text;
    third_person_form text;
    object_text text;

    q text;
    exp text;
    opts jsonb;
    correct_idx integer;
    correct_answer text;
    qtype text;

    is_third_person boolean;

    subjects text[] := ARRAY[
        'I',
        'You',
        'We',
        'They',
        'He',
        'She',
        'My brother',
        'Our teacher',
        'Maria',
        'David',
        'The children',
        'My parents',
        'The bus',
        'A good student',
        'The manager'
    ];

    bases text[] := ARRAY[
        'go',
        'watch',
        'study',
        'carry',
        'fix',
        'wash',
        'play',
        'read',
        'cook',
        'teach',
        'try',
        'miss',
        'visit',
        'work',
        'drink'
    ];

    third_person_subjects text[] := ARRAY[
        'He',
        'She',
        'My brother',
        'Our teacher',
        'Maria',
        'David',
        'The bus',
        'A good student',
        'The manager'
    ];

BEGIN

    FOR i IN 1..300 LOOP

        -- ----------------------------------------------------
        -- Game and skill calculation
        -- ----------------------------------------------------

        game_no :=
            ((i - 1) / 50) + 1;

        skill_no :=
            (((i - 1) % 50) / 5) + 1;

        diff :=
            CASE
                WHEN game_no <= 2 THEN 1
                WHEN game_no <= 4 THEN 2
                ELSE 3
            END;


        -- ----------------------------------------------------
        -- Select subject and verb
        -- ----------------------------------------------------

        subject_text :=
            subjects[((i - 1) % array_length(subjects, 1)) + 1];

        base_verb :=
            bases[((i * 3 - 1) % array_length(bases, 1)) + 1];

        is_third_person :=
            subject_text = ANY(third_person_subjects);


        -- ----------------------------------------------------
        -- Correct third-person singular form
        -- ----------------------------------------------------

        third_person_form :=
            CASE base_verb
                WHEN 'go'      THEN 'goes'
                WHEN 'watch'   THEN 'watches'
                WHEN 'study'   THEN 'studies'
                WHEN 'carry'   THEN 'carries'
                WHEN 'fix'     THEN 'fixes'
                WHEN 'wash'    THEN 'washes'
                WHEN 'play'    THEN 'plays'
                WHEN 'read'    THEN 'reads'
                WHEN 'cook'    THEN 'cooks'
                WHEN 'teach'   THEN 'teaches'
                WHEN 'try'     THEN 'tries'
                WHEN 'miss'    THEN 'misses'
                WHEN 'visit'   THEN 'visits'
                WHEN 'work'    THEN 'works'
                WHEN 'drink'   THEN 'drinks'
                ELSE base_verb || 's'
            END;


        -- ----------------------------------------------------
        -- Object
        -- ----------------------------------------------------

        object_text :=
            CASE base_verb
                WHEN 'go'      THEN 'to school'
                WHEN 'watch'   THEN 'TV'
                WHEN 'study'   THEN 'English'
                WHEN 'carry'   THEN 'the books'
                WHEN 'fix'     THEN 'the bike'
                WHEN 'wash'    THEN 'their hands'
                WHEN 'play'    THEN 'football'
                WHEN 'read'    THEN 'the news'
                WHEN 'cook'    THEN 'dinner'
                WHEN 'teach'   THEN 'maths'
                WHEN 'try'     THEN 'again'
                WHEN 'miss'    THEN 'the bus'
                WHEN 'visit'   THEN 'their grandparents'
                WHEN 'work'    THEN 'at a clinic'
                WHEN 'drink'   THEN 'tea'
                ELSE ''
            END;


        -- ====================================================
        -- SKILL 1: Fill in the blank
        -- ====================================================

        IF skill_no = 1 THEN

            q :=
                subject_text || ' ___ ' ||
                object_text ||
                ' every day.';

            opts :=
                CASE
                    WHEN is_third_person THEN
                        jsonb_build_array(
                            base_verb,
                            third_person_form,
                            base_verb || 's',
                            base_verb || 'ed'
                        )
                    ELSE
                        jsonb_build_array(
                            base_verb,
                            third_person_form,
                            base_verb || 's',
                            base_verb || 'ed'
                        )
                END;

            correct_idx :=
                CASE
                    WHEN is_third_person THEN 1
                    ELSE 0
                END;

            correct_answer :=
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END;

            qtype := 'fill_blank';

            exp :=
                CASE
                    WHEN is_third_person THEN
                        'He, she, and singular third-person subjects take the -s or -es form in the Simple Present.'
                    ELSE
                        'I, you, we, and they use the base form of the verb in the Simple Present.'
                END;


        -- ====================================================
        -- SKILL 2: Subject-verb agreement
        -- ====================================================

        ELSIF skill_no = 2 THEN

            q :=
                'Choose the correct sentence.';

            opts :=
                jsonb_build_array(
                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' ' || object_text || ' every day.',

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN base_verb
                        ELSE third_person_form
                    END ||
                    ' ' || object_text || ' every day.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || ' every day.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || ' every day.'
                );

            correct_idx := 0;

            correct_answer :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every day.';

            qtype := 'multiple_choice';

            exp :=
                'The verb must agree with the subject. Third-person singular subjects use the -s or -es form.';


        -- ====================================================
        -- SKILL 3: Correct the mistake
        -- ====================================================

        ELSIF skill_no = 3 THEN

            q :=
                'Correct the mistake: ' ||
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN base_verb
                    ELSE third_person_form
                END ||
                ' ' || object_text || ' every day.';

            opts :=
                jsonb_build_array(
                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' ' || object_text || ' every day.',

                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN base_verb
                        ELSE third_person_form
                    END ||
                    ' ' || object_text || ' every day.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || ' every day.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || ' every day.'
                );

            correct_idx := 0;

            correct_answer :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every day.';

            qtype := 'correct_mistake';

            exp :=
                'In the Simple Present, third-person singular subjects require the correct -s or -es form.';


        -- ====================================================
        -- SKILL 4: Question formation
        -- ====================================================

        ELSIF skill_no = 4 THEN

            q :=
                'Choose the correct question.';

            opts :=
                CASE
                    WHEN is_third_person THEN
                        jsonb_build_array(
                            'Does ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?',

                            'Does ' || lower(subject_text) ||
                            ' ' || third_person_form || ' every day?',

                            'Do ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?',

                            'Is ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?'
                        )
                    ELSE
                        jsonb_build_array(
                            'Do ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?',

                            'Do ' || lower(subject_text) ||
                            ' ' || third_person_form || ' every day?',

                            'Does ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?',

                            'Is ' || lower(subject_text) ||
                            ' ' || base_verb || ' every day?'
                        )
                END;

            correct_idx := 0;

            correct_answer :=
                CASE
                    WHEN is_third_person
                        THEN 'Does ' || lower(subject_text) ||
                             ' ' || base_verb || ' every day?'
                    ELSE
                        'Do ' || lower(subject_text) ||
                        ' ' || base_verb || ' every day?'
                END;

            qtype := 'question_formation';

            exp :=
                'After do or does, always use the base form of the main verb.';


        -- ====================================================
        -- SKILL 5: Negative sentences
        -- ====================================================

        ELSIF skill_no = 5 THEN

            q :=
                'Choose the correct negative sentence.';

            opts :=
                CASE
                    WHEN is_third_person THEN
                        jsonb_build_array(
                            subject_text || ' does not ' ||
                            base_verb || ' ' || object_text || ' every day.',

                            subject_text || ' does not ' ||
                            third_person_form || ' ' || object_text || ' every day.',

                            subject_text || ' do not ' ||
                            base_verb || ' ' || object_text || ' every day.',

                            subject_text || ' does not ' ||
                            base_verb || 'ed ' || object_text || ' every day.'
                        )
                    ELSE
                        jsonb_build_array(
                            subject_text || ' do not ' ||
                            base_verb || ' ' || object_text || ' every day.',

                            subject_text || ' do not ' ||
                            third_person_form || ' ' || object_text || ' every day.',

                            subject_text || ' does not ' ||
                            base_verb || ' ' || object_text || ' every day.',

                            subject_text || ' do not ' ||
                            base_verb || 'ed ' || object_text || ' every day.'
                        )
                END;

            correct_idx := 0;

            correct_answer :=
                CASE
                    WHEN is_third_person
                        THEN subject_text || ' does not ' ||
                             base_verb || ' ' || object_text || ' every day.'
                    ELSE
                        subject_text || ' do not ' ||
                        base_verb || ' ' || object_text || ' every day.'
                END;

            qtype := 'negative';

            exp :=
                'Use do not with I, you, we, and they. Use does not with he, she, and singular third-person subjects.';


        -- ====================================================
        -- SKILL 6: True / False
        -- ====================================================

        ELSIF skill_no = 6 THEN

            -- Always create a grammatically correct statement.
            q :=
                'Is this sentence correct? ' ||
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every day.';

            opts :=
                jsonb_build_array(
                    'True',
                    'False'
                );

            correct_idx := 0;
            correct_answer := 'True';

            qtype := 'true_false';

            exp :=
                'The subject and verb correctly agree in the Simple Present.';


        -- ====================================================
        -- SKILL 7: Matching
        -- ====================================================

        ELSIF skill_no = 7 THEN

            q :=
                'Match the subject with the correct verb form: ' ||
                subject_text || ' ___';

            opts :=
                CASE
                    WHEN is_third_person THEN
                        jsonb_build_array(
                            third_person_form,
                            base_verb,
                            base_verb || 'ed',
                            base_verb || 'ing'
                        )
                    ELSE
                        jsonb_build_array(
                            base_verb,
                            third_person_form,
                            base_verb || 'ed',
                            base_verb || 'ing'
                        )
                END;

            correct_idx :=
                CASE
                    WHEN is_third_person THEN 0
                    ELSE 0
                END;

            correct_answer :=
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END;

            qtype := 'matching';

            exp :=
                'Choose the verb form that agrees with the subject.';


        -- ====================================================
        -- SKILL 8: Reordering
        -- ====================================================

        ELSIF skill_no = 8 THEN

            q :=
                'Reorder the words: ' ||
                lower(subject_text) || ' / ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' / every day';

            opts :=
                jsonb_build_array(
                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' every day.',

                    'Every day ' ||
                    lower(subject_text) || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN base_verb
                        ELSE third_person_form
                    END || '.',

                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' ' || lower(subject_text) || ' every day.',

                    lower(subject_text) ||
                    ' every day ' ||
                    CASE
                        WHEN is_third_person
                            THEN base_verb
                        ELSE third_person_form
                    END || '.'
                );

            correct_idx := 0;

            correct_answer :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' every day.';

            qtype := 'reordering';

            exp :=
                'The correct sentence places the subject first and uses the correct Simple Present verb form.';


        -- ====================================================
        -- SKILL 9: Short answer
        -- ====================================================

        ELSIF skill_no = 9 THEN

            q :=
                'What does ' || lower(subject_text) ||
                ' usually do?';

            opts :=
                jsonb_build_array(
                    subject_text || ' ' ||
                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' ' || object_text || '.',

                    subject_text || ' ' ||
                    base_verb || 'ed ' ||
                    object_text || '.',

                    subject_text || ' is ' ||
                    base_verb || ' ' || object_text || '.',

                    subject_text || ' ' ||
                    base_verb || 'ing ' ||
                    object_text || '.'
                );

            correct_idx := 0;

            correct_answer :=
                subject_text || ' ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' ' || object_text || '.';

            qtype := 'short_answer';

            exp :=
                'The Simple Present is used for usual, repeated, or routine actions.';


        -- ====================================================
        -- SKILL 10: Picture / routine
        -- ====================================================

        ELSE

            q :=
                'Picture routine: choose the best Simple Present description.';

            opts :=
                jsonb_build_array(
                    'The person ' ||
                    CASE
                        WHEN is_third_person
                            THEN third_person_form
                        ELSE base_verb
                    END ||
                    ' ' || object_text || ' every day.',

                    'The person ' ||
                    base_verb ||
                    ' ' || object_text || ' every day.',

                    'The person ' ||
                    base_verb || 'ed ' ||
                    object_text || ' every day.',

                    'The person is ' ||
                    base_verb || 'ing ' ||
                    object_text || ' every day.'
                );

            correct_idx := 0;

            correct_answer :=
                'The person ' ||
                CASE
                    WHEN is_third_person
                        THEN third_person_form
                    ELSE base_verb
                END ||
                ' ' || object_text || ' every day.';

            qtype := 'picture_based';

            exp :=
                'Daily routines are normally expressed using the Simple Present.';

        END IF;


        -- ====================================================
        -- INSERT
        -- Explicit column names only
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
            correct_answer,
            now(),
            game_no
        );

    END LOOP;

END $$;


-- ============================================================
-- VERIFICATION 1
-- Should return:
-- game 1 = 50
-- game 2 = 50
-- ...
-- game 6 = 50
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
-- Each game should contain exactly 5 questions per skill.
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
-- Check the generated questions.
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
ORDER BY game_number, id
LIMIT 50;