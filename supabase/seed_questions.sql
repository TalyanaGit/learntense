-- LearnTense question bank
-- Run this once in Supabase SQL Editor after schema.sql.
-- 36 questions: 3 for each of the 12 tenses.

WITH seed(tense_id, question, options, correct_index, explanation, difficulty) AS (
VALUES
(1,'She ___ coffee every morning.',jsonb_build_array('drink','drinks','is drinking','drank'),1,'Simple Present describes routines. With she, use drinks.',1),
(1,'Which sentence states a general fact?',jsonb_build_array('Water boils at 100°C.','Water is boiling yesterday.','Water boiled tomorrow.','Water has boil.'),0,'General facts use the Simple Present.',1),
(1,'My brother ___ football on Sundays.',jsonb_build_array('play','plays','is play','played'),1,'My brother is third-person singular, so use plays.',1),
(2,'Look! The children ___.',jsonb_build_array('run','ran','are running','have run'),2,'An action happening now uses am/is/are + verb-ing.',1),
(2,'I ___ for my exam this week.',jsonb_build_array('study','studied','am studying','have studied'),2,'An activity happening around the present can use the Present Continuous.',1),
(2,'Why ___ you ___ so fast?',jsonb_build_array('are / walking','do / walking','did / walk','have / walked'),0,'Present Continuous uses are + walking for an action happening now.',2),
(3,'She ___ her homework already.',jsonb_build_array('has finished','finished yesterday','is finish','finish'),0,'Present Perfect uses has/have + past participle.',1),
(3,'I ___ never ___ sushi.',jsonb_build_array('have / eaten','am / eating','did / eat','has / ate'),0,'Present Perfect is commonly used for life experiences.',1),
(3,'They ___ in this city since 2020.',jsonb_build_array('live','lived','have lived','are live'),2,'Since + a starting point commonly uses Present Perfect for an action continuing to the present.',2),
(4,'She ___ for two hours.',jsonb_build_array('has been studying','studied','is study','has study'),0,'Present Perfect Continuous emphasizes an activity continuing over time.',2),
(4,'They ___ football since 4 p.m.',jsonb_build_array('have been playing','played','are played','have play'),0,'Since + duration continuing to now fits Present Perfect Continuous.',2),
(4,'I am tired because I ___.',jsonb_build_array('have been running','ran tomorrow','am run','have run yesterday'),0,'The tense highlights a recent activity and its present result.',2),
(5,'We ___ the museum last Saturday.',jsonb_build_array('visit','visited','have visited','are visiting'),1,'A completed action at a definite past time uses Simple Past.',1),
(5,'He ___ me yesterday.',jsonb_build_array('calls','called','has called','is calling'),1,'Yesterday signals a completed past action.',1),
(5,'They ___ home after dinner.',jsonb_build_array('walked','have walk','are walked','will walking'),0,'Simple Past describes a completed past action.',1),
(6,'At 8 p.m. yesterday, I ___.',jsonb_build_array('sleep','was sleeping','have slept','will sleep'),1,'An action in progress at a specific past time uses was/were + verb-ing.',1),
(6,'While she ___, the phone rang.',jsonb_build_array('was cooking','cooks','has cooked','will cook'),0,'While commonly introduces an ongoing past action.',2),
(6,'They ___ when the teacher entered.',jsonb_build_array('were talking','talk','have talked','will talk'),0,'The conversation was in progress when another past event occurred.',2),
(7,'The train ___ before we reached the station.',jsonb_build_array('left','had left','is leaving','has left'),1,'Past Perfect shows the earlier of two past actions.',2),
(7,'She was tired because she ___ badly the night before.',jsonb_build_array('had slept','sleeps','is sleeping','will sleep'),0,'Had + past participle describes an earlier past event.',2),
(7,'By the time I arrived, they ___.',jsonb_build_array('had eaten','eat','are eating','will eat'),0,'The earlier completed action uses Past Perfect.',2),
(8,'He ___ for an hour before the bus came.',jsonb_build_array('had been waiting','waits','was wait','has waited'),0,'Past Perfect Continuous emphasizes duration before a past event.',2),
(8,'They were exhausted because they ___ all day.',jsonb_build_array('had been working','work','are working','will work'),0,'The activity continued for a period before a past result.',2),
(8,'Before the match started, we ___ for 30 minutes.',jsonb_build_array('had been warming up','warm up','have warmed','will warm'),0,'For + duration before a past event fits Past Perfect Continuous.',3),
(9,'I think it ___ tomorrow.',jsonb_build_array('rains','will rain','is raining yesterday','has rained'),1,'Will is commonly used for predictions about the future.',1),
(9,'I ___ help you with that.',jsonb_build_array('will','was','have','am'),0,'Will can express a decision or promise made about the future.',1),
(9,'She ___ visit her grandmother next week.',jsonb_build_array('will','did','has','was'),0,'Will + base verb forms the Simple Future.',1),
(10,'This time tomorrow, we ___.',jsonb_build_array('will be travelling','travelled','have travelled','travel'),0,'Future Continuous describes an action that will be in progress at a future time.',2),
(10,'At 9 p.m. tonight, he ___.',jsonb_build_array('will be studying','studied','has studied','studies'),0,'A future action in progress uses will be + verb-ing.',2),
(10,'When you call me, I ___.',jsonb_build_array('will be working','worked','have work','am worked'),0,'The action will be in progress when the future call happens.',2),
(11,'By Friday, I ___ the project.',jsonb_build_array('will have finished','finish','finished','am finishing'),0,'Future Perfect describes an action completed before a future point.',2),
(11,'By next year, she ___ her course.',jsonb_build_array('will have completed','completed','completes','is complete'),0,'Will have + past participle forms the Future Perfect.',2),
(11,'By 6 p.m., they ___ home.',jsonb_build_array('will have arrived','arrived','are arriving yesterday','have arrive'),0,'The completion happens before a specified future time.',2),
(12,'By June, I ___ here for five years.',jsonb_build_array('will have been working','worked','will work','have worked yesterday'),0,'Future Perfect Continuous emphasizes duration up to a future point.',3),
(12,'Next month, they ___ together for a decade.',jsonb_build_array('will have been living','live','lived','are live'),0,'For + duration continuing to a future point uses Future Perfect Continuous.',3),
(12,'By 10 p.m., she ___ for three hours.',jsonb_build_array('will have been studying','studied','will study','has studied yesterday'),0,'The tense emphasizes how long an activity will have continued.',3)
)
INSERT INTO public.questions (tense_id, question, options, correct_index, explanation, difficulty, question_text, correct_answer, correct_option, is_active)
SELECT tense_id, question, options, correct_index, explanation, difficulty, question, correct_index, correct_index, true
FROM seed
WHERE NOT EXISTS (
  SELECT 1 FROM public.questions q
  WHERE q.tense_id = seed.tense_id AND q.question = seed.question
);
