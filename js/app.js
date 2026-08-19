const SUPABASE_URL="https://fvrwhvfgrzmlzxmgiiuk.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_TrPG7148BZKVue1fwchLSw_5Ac747Yp";
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);

const fallbackTenses=[
 {id:1,name:"Simple Present",category:"Present",icon:"🟢",description:"Habits, routines and facts."},
 {id:2,name:"Present Continuous",category:"Present",icon:"🔵",description:"Actions happening now or around now."},
 {id:3,name:"Present Perfect",category:"Present",icon:"🟣",description:"Past actions connected to the present."},
 {id:4,name:"Present Perfect Continuous",category:"Present",icon:"🟠",description:"Actions continuing over a period of time."},
 {id:5,name:"Simple Past",category:"Past",icon:"🟢",description:"Completed actions in the past."},
 {id:6,name:"Past Continuous",category:"Past",icon:"🔵",description:"Actions in progress at a past time."},
 {id:7,name:"Past Perfect",category:"Past",icon:"🟣",description:"An earlier action before another past action."},
 {id:8,name:"Past Perfect Continuous",category:"Past",icon:"🟠",description:"An ongoing action before another past event."},
 {id:9,name:"Simple Future",category:"Future",icon:"🚀",description:"Predictions, promises and future actions."},
 {id:10,name:"Future Continuous",category:"Future",icon:"⏳",description:"An action that will be in progress."},
 {id:11,name:"Future Perfect",category:"Future",icon:"🏆",description:"An action completed before a future point."},
 {id:12,name:"Future Perfect Continuous",category:"Future",icon:"⭐",description:"Duration continuing up to a future point."}
];

let tenses=[]; let progress={}; let currentTense=null; let questions=[]; let qIndex=0; let score=0; let answered=false; let mistakes=[];
const demoQuestions={1:[
 {question:"She ___ to school every day.",options:["go","goes","going","gone"],answer:1,explanation:"With he, she or it in the Simple Present, the verb normally takes -s or -es."},
 {question:"Which sentence is correct?",options:["They plays football.","They play football.","They playing football.","They played every day."],answer:1,explanation:"They is plural, so use the base verb: They play."},
 {question:"Which sentence describes a routine?",options:["I am eating now.","I ate yesterday.","I walk to school every day.","I will eat later."],answer:2,explanation:"Repeated habits and routines are commonly expressed with the Simple Present."}
],2:[
 {question:"Look! The baby ___.",options:["cries","is crying","cried","has cried"],answer:1,explanation:"An action happening now uses the Present Continuous: is + verb-ing."}
],3:[
 {question:"They ___ their homework.",options:["have finished","finish yesterday","are finish","has finished"],answer:0,explanation:"Present Perfect uses have/has + past participle. They takes have."}
]};

function $(id){return document.getElementById(id)}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));window.scrollTo({top:0,behavior:'smooth'})}

document.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b)showScreen(b.dataset.screen)});
$('themeBtn').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'':'dark';localStorage.setItem('learntense-theme',document.documentElement.dataset.theme)};
if(localStorage.getItem('learntense-theme')==='dark')document.documentElement.dataset.theme='dark';
$('continueBtn').onclick=()=>startLesson(Number(localStorage.getItem('lastTense'))||1);
$('weakBtn').onclick=()=>startWeakPractice();
$('mistakesBtn').onclick=()=>showScreen('review');

async function loadTenses(){
  try{const {data,error}=await db.from('tenses').select('id,name').order('id');if(error)throw error;tenses=(data||[]).map(t=>({...t,...(fallbackTenses.find(x=>x.id===t.id)||{})}));}
  catch(e){tenses=fallbackTenses;console.warn('Using local tense catalog:',e.message)}
  if(!tenses.length)tenses=fallbackTenses;
  tenses=fallbackTenses.map(f=>tenses.find(t=>t.id===f.id)||f);
  renderLibrary(); await loadProgress();
}

async function loadProgress(){
  progress=JSON.parse(localStorage.getItem('learntense-progress')||'{}');
  try{const {data}=await db.from('user_progress').select('*');if(data) data.forEach(p=>progress[p.tense_id]={...(progress[p.tense_id]||{}),...p});}catch(e){}
  renderDashboard();renderLibrary();renderReview();
}
function getP(id){return progress[id]||{attempted:0,correct:0,mastery:0,lastPracticed:null}}
function mastery(id){const p=getP(id);return p.mastery|| (p.attempted?Math.round(p.correct/p.attempted*100):0)}
function renderDashboard(){
 const total=tenses.reduce((a,t)=>a+getP(t.id).attempted,0), correct=tenses.reduce((a,t)=>a+getP(t.id).correct,0), mastered=tenses.filter(t=>mastery(t.id)>=95).length;
 $('accuracyStat').textContent=total?Math.round(correct/total*100)+'%':'—';$('answeredStat').textContent=total;$('masteredStat').textContent=mastered+'/12';$('streakStat').textContent=Number(localStorage.getItem('streak')||0);
 const last=Number(localStorage.getItem('lastTense'))||1, t=tenses.find(x=>x.id===last)||tenses[0], m=mastery(t.id);
 $('continueCard').innerHTML=`<div class="continue-main"><div><span class="badge">${t.category}</span><h2>${t.icon} ${t.name}</h2><p class="muted">${t.description}</p></div><button class="primary" onclick="startLesson(${t.id})">${m?'Keep practicing':'Start lesson'} →</button></div><div class="progress-track"><div class="progress-fill" style="width:${m}%"></div></div><small class="muted">${m}% mastery</small>`;
 $('progressList').innerHTML=tenses.slice(0,6).map(t=>`<div class="progress-row"><div class="progress-row-head"><span>${t.icon} ${t.name}</span><span>${mastery(t.id)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${mastery(t.id)}%"></div></div></div>`).join('');
}
function renderLibrary(){$('tenseGrid').innerHTML=tenses.map(t=>`<article class="tense-card" onclick="startLesson(${t.id})"><span class="tense-icon">${t.icon}</span><span class="badge">${t.category}</span><h3>${t.name}</h3><p>${t.description}</p><div class="progress-track"><div class="progress-fill" style="width:${mastery(t.id)}%"></div></div><small>${mastery(t.id)}% mastery · Practice →</small></article>`).join('')}

function startLesson(id){currentTense=tenses.find(t=>t.id===id)||fallbackTenses[0];localStorage.setItem('lastTense',id);showScreen('lesson');const m=mastery(id);$('lessonCard').innerHTML=`<span class="badge">${currentTense.category} Tense</span><h1>${currentTense.icon} ${currentTense.name}</h1><p class="muted">${currentTense.description}</p><div class="rule"><strong>Remember</strong><p>Focus on the time, purpose and structure of the sentence. Then use the rule in practice.</p><p class="formula">${formula(id)}</p></div><h2>Examples</h2>${examples(id).map(x=>`<div class="example"><strong>${x[0]}</strong><br>${x[1]}</div>`).join('')}<div class="feedback"><strong>🎯 Your mastery: ${m}%</strong><br><span class="muted">Complete a short practice session to improve it.</span></div><button class="primary" style="margin-top:18px;width:100%" onclick="startQuiz(${id})">Start practice →</button>`}
function formula(id){if(id===1)return'Subject + base verb (add -s/-es with he, she, it)';if(id===2)return'Subject + am/is/are + verb-ing';if(id===3)return'Subject + have/has + past participle';if(id===5)return'Subject + past form of the verb';return'Choose the auxiliary and verb form that match the tense.'}
function examples(id){const e={1:[['Habit','I walk to school every day.'],['Third person','She plays tennis on Sundays.'],['Fact','Water boils at 100°C.']],2:[['Now','She is reading a book.'],['Around now','They are studying English.']],3:[['Experience','I have visited Delhi.'],['Recent result','She has finished her work.']]};return e[id]||[['Example','Use this tense in a sentence that matches its time and purpose.']]}

async function startQuiz(id){currentTense=tenses.find(t=>t.id===id)||fallbackTenses[0];questions=demoQuestions[id]||await fetchQuestions(id);if(!questions.length)questions=demoQuestions[1];qIndex=0;score=0;answered=false;showScreen('quiz');renderQuestion()}
async function fetchQuestions(id){try{const {data,error}=await db.from('questions').select('*').eq('tense_id',id).limit(10);if(error)throw error;return (data||[]).map(q=>({question:q.question_text,options:q.options||[],answer:q.correct_answer,explanation:q.explanation||'Review the rule and try a similar sentence.'}))}catch(e){return[]}}
function renderQuestion(){const q=questions[qIndex];answered=false;$('quizCard').innerHTML=`<div class="quiz-top"><span>${currentTense.name}</span><span>Question ${qIndex+1} of ${questions.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${qIndex/questions.length*100}%"></div></div><div class="question">${q.question}</div><div>${q.options.map((o,i)=>`<button class="option" onclick="answerQuestion(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><div id="feedback"></div>`}
function answerQuestion(i){if(answered)return;answered=true;const q=questions[qIndex], ok=i===q.answer;if(ok)score++;document.querySelectorAll('.option')[i].classList.add(ok?'correct':'wrong');if(!ok){document.querySelectorAll('.option')[q.answer].classList.add('correct');mistakes.push({tense:currentTense.name,question:q.question,correct:q.options[q.answer]});saveMistakes()}recordAttempt(currentTense.id,ok);$('feedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${q.explanation}</p><button class="primary" style="width:100%" onclick="nextQuestion()">${qIndex+1<questions.length?'Next question →':'See result →'}</button></div>`}
function nextQuestion(){if(qIndex+1<questions.length){qIndex++;renderQuestion()}else showResult()}
function recordAttempt(id,ok){const p=getP(id);p.attempted=(p.attempted||0)+1;p.correct=(p.correct||0)+(ok?1:0);p.mastery=Math.round(p.correct/p.attempted*100);p.lastPracticed=new Date().toISOString();progress[id]=p;localStorage.setItem('learntense-progress',JSON.stringify(progress));db.from('user_progress').upsert({tense_id:id,questions_attempted:p.attempted,correct_answers:p.correct,accuracy:p.mastery,mastery:p.mastery,last_practiced:p.lastPracticed}).then(()=>{}).catch(()=>{})}
function showResult(){showScreen('result');const pct=Math.round(score/questions.length*100);$('resultCard').innerHTML=`<div class="score">${pct}%</div><h1>${pct>=80?'🎉 Great work!':'💪 Keep practicing!'}</h1><p class="muted">You answered ${score} of ${questions.length} correctly.</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><button class="primary" style="width:100%;margin-top:20px" onclick="startQuiz(${currentTense.id})">🔄 Try again</button><button class="secondary" onclick="showScreen('dashboard')">📊 Back to dashboard</button>`;renderDashboard();renderLibrary()}
function saveMistakes(){localStorage.setItem('learntense-mistakes',JSON.stringify(mistakes.slice(-50)))}
function renderReview(){mistakes=JSON.parse(localStorage.getItem('learntense-mistakes')||'[]');$('reviewContent').innerHTML=mistakes.length?mistakes.slice().reverse().map((m,i)=>`<article class="review-item"><span class="badge">${m.tense}</span><h3>${m.question}</h3><p class="muted">Correct answer: <strong>${m.correct}</strong></p><button class="secondary" onclick="startLesson(${tenses.find(t=>t.name===m.tense)?.id||1})">Review tense</button></article>`).join(''):'<article class="panel"><h2>🎉 No mistakes to review</h2><p class="muted">Keep practicing and your missed questions will appear here.</p></article>'}
function startWeakPractice(){const weak=tenses.slice().sort((a,b)=>mastery(a.id)-mastery(b.id))[0];startQuiz(weak?.id||1)}

loadTenses();
