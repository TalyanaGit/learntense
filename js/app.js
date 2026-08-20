const SUPABASE_URL="https://fvrwhvfgrzmlzxmgiiuk.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_TrPG7148BZKVue1fwchLSw_5Ac747Yp";
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const fallbackTenses=[{id:1,name:"Simple Present",category:"Present",icon:"🟢",description:"Habits, routines and facts."},{id:2,name:"Present Continuous",category:"Present",icon:"🔵",description:"Actions happening now or around now."},{id:3,name:"Present Perfect",category:"Present",icon:"🟣",description:"Past actions connected to the present."},{id:4,name:"Present Perfect Continuous",category:"Present",icon:"🟠",description:"Actions continuing over a period of time."},{id:5,name:"Simple Past",category:"Past",icon:"🟢",description:"Completed actions in the past."},{id:6,name:"Past Continuous",category:"Past",icon:"🔵",description:"Actions in progress at a past time."},{id:7,name:"Past Perfect",category:"Past",icon:"🟣",description:"An earlier action before another past action."},{id:8,name:"Past Perfect Continuous",category:"Past",icon:"🟠",description:"An ongoing action before another past event."},{id:9,name:"Simple Future",category:"Future",icon:"🚀",description:"Predictions, promises and future actions."},{id:10,name:"Future Continuous",category:"Future",icon:"⏳",description:"An action that will be in progress."},{id:11,name:"Future Perfect",category:"Future",icon:"🏆",description:"An action completed before a future point."},{id:12,name:"Future Perfect Continuous",category:"Future",icon:"⭐",description:"Duration continuing up to a future point."}];
let tenses=[],progress={},currentTense=null,questions=[],qIndex=0,score=0,answered=false,mistakes=[],currentUser=null,isGuest=false,authMode='signin';
const demoQuestions={1:[{question:"She ___ to school every day.",options:["go","goes","going","gone"],answer:1,explanation:"With he, she or it in the Simple Present, the verb normally takes -s or -es."},{question:"Which sentence is correct?",options:["They plays football.","They play football.","They playing football.","They played every day."],answer:1,explanation:"They is plural, so use the base verb: They play."}],2:[{question:"Look! The baby ___.",options:["cries","is crying","cried","has cried"],answer:1,explanation:"An action happening now uses the Present Continuous: is + verb-ing."}],3:[{question:"They ___ their homework.",options:["have finished","finish yesterday","are finish","has finished"],answer:0,explanation:"Present Perfect uses have/has + past participle. They takes have."}]};
function $(id){return document.getElementById(id)}
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.screen===id));window.scrollTo({top:0,behavior:'smooth'});if(id==='discover')renderLeaderboard()}
function openApp(){ $('auth').hidden=true; $('app').hidden=false; $('userLabel').textContent=currentUser?currentUser.email:'Guest'; if(currentUser)syncProfile(); loadTenses() }
async function syncProfile(){
 try{
  const local=JSON.parse(localStorage.getItem('user_profile')||'{}');
  const {data:existing}=await db.from('profiles').select('display_name,avatar_url').eq('id',currentUser.id).maybeSingle();
  const displayName=local.displayName||existing?.display_name||(currentUser.email||'Learner').split('@')[0];
  const avatar=local.avatar||existing?.avatar_url||'🤖';
  localStorage.setItem('user_profile',JSON.stringify({displayName,avatar}));
  await db.from('profiles').upsert({id:currentUser.id,display_name:displayName,avatar_url:avatar},{onConflict:'id'});
  if($('profile-username'))$('profile-username').value=displayName;
  if($('profileName'))$('profileName').textContent=displayName;
  if($('profileAvatar'))$('profileAvatar').textContent=avatar;
  if($('homeAvatar'))$('homeAvatar').textContent=avatar;
  if($('greetingName'))$('greetingName').textContent=`Hello ${displayName} 👋`;
 }catch(e){console.warn('Profile sync failed:',e.message)}
}
async function renderLeaderboard(){
 const el=$('leaderboardContent');if(!el)return;
 if(!currentUser){el.innerHTML='<article class="panel" style="text-align:center"><h2>🔒 Sign in to join the leaderboard</h2><p class="muted">Create a free account to earn points and see how you rank against other learners.</p></article>';return}
 el.innerHTML='<p class="muted">Loading leaderboard…</p>';
 try{
  const{data,error}=await db.rpc('get_leaderboard',{limit_count:50});
  if(error)throw error;
  const rows=data||[];
  if(!rows.length){el.innerHTML='<article class="panel" style="text-align:center"><h2>🏁 Leaderboard is just getting started</h2><p class="muted">Practice a few questions to claim the top spot!</p></article>';return}
  const localProfile=JSON.parse(localStorage.getItem('user_profile')||'{}');
  const myName=(localProfile.displayName||'').toLowerCase();
  el.innerHTML=`<div class="leaderboard-list">${rows.map((r,i)=>{
   const me=(r.display_name||'').toLowerCase()===myName;
   const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
   return `<article class="leaderboard-row${me?' me':''}"><span class="lb-rank">${medal}</span><span class="lb-avatar">${(r.display_name||'?').charAt(0).toUpperCase()}</span><span class="lb-name">${r.display_name||'Learner'}${me?' <small>(you)</small>':''}</span><span class="lb-points">${r.points||0}<small> pts</small></span></article>`;
  }).join('')}</div>`;
 }catch(e){el.innerHTML='<article class="panel" style="text-align:center"><h2>🏁 Leaderboard unavailable</h2><p class="muted">We couldn\'t load the leaderboard right now. Try again later.</p></article>';console.warn('Leaderboard load failed:',e.message)}
}
function showAuth(){ $('auth').hidden=false; $('app').hidden=true }
function setAuthMode(mode){authMode=mode; $('authSubmit').textContent=mode==='signin'?'Sign in':'Create account';$('authToggle').textContent=mode==='signin'?"Don't have an account? Create one":"Already have an account? Sign in";$('authMessage').textContent=mode==='signin'?'Sign in to save your progress across devices.':'Create an account to save your learning progress.';$('authPassword').value=''}
$('authToggle').onclick=()=>setAuthMode(authMode==='signin'?'signup':'signin');
$('guestBtn').onclick=()=>{isGuest=true;currentUser=null;openApp()};
$('authForm').onsubmit=async e=>{e.preventDefault();const email=$('authEmail').value.trim(),password=$('authPassword').value;const button=$('authSubmit');button.disabled=true;button.textContent=authMode==='signin'?'Signing in…':'Creating…';$('authMessage').textContent='';try{const result=authMode==='signin'?await db.auth.signInWithPassword({email,password}):await db.auth.signUp({email,password});if(result.error)throw result.error;currentUser=result.data.user||null;if(authMode==='signup'&&!result.data.session){$('authMessage').textContent='Account created. Check your email to confirm it, then sign in.';setAuthMode('signin');return}openApp()}catch(err){$('authMessage').textContent=err.message||'Authentication failed. Please try again.'}finally{button.disabled=false;button.textContent=authMode==='signin'?'Sign in':'Create account'}};
$('logoutBtn').onclick=async()=>{if(!isGuest)await db.auth.signOut();currentUser=null;isGuest=false;showAuth();setAuthMode('signin')};
document.addEventListener('click',e=>{const b=e.target.closest('[data-screen]');if(b)showScreen(b.dataset.screen)});
document.addEventListener('click',e=>{
 const soon=e.target.closest('.topic-card.coming-soon');
 if(soon){soon.classList.remove('lt-shake');void soon.offsetWidth;soon.classList.add('lt-shake')}
});
$('themeBtn').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'':'dark';localStorage.setItem('learntense-theme',document.documentElement.dataset.theme)};if(localStorage.getItem('learntense-theme')==='dark')document.documentElement.dataset.theme='dark';
$('weakBtn')?.addEventListener('click',()=>startWeakPractice());$('mistakesBtn')?.addEventListener('click',()=>showScreen('review'));
async function loadTenses(){try{const{data,error}=await db.from('tenses').select('*').order('id');if(error)throw error;tenses=(data||[]).map(t=>({...t,...(fallbackTenses.find(x=>x.id===t.id)||{})}));}catch(e){tenses=fallbackTenses}if(!tenses.length)tenses=fallbackTenses;tenses=fallbackTenses.map(f=>tenses.find(t=>t.id===f.id)||f);renderLibrary();await loadProgress()}
async function loadProgress(){progress=JSON.parse(localStorage.getItem('learntense-progress')||'{}');try{let q=db.from('user_progress').select('*');if(currentUser)q=q.eq('user_id',currentUser.id);const{data,error}=await q;if(!error&&data)data.forEach(p=>progress[p.tense_id]={attempted:p.questions_attempted||0,correct:p.correct_answers||0,mastery:p.mastery||p.accuracy||0,lastPracticed:p.last_practiced});}catch(e){}renderDashboard();renderLibrary();renderReview()}
function getP(id){return progress[id]||{attempted:0,correct:0,mastery:0,lastPracticed:null}}function mastery(id){const p=getP(id);return p.mastery||(p.attempted?Math.round(p.correct/p.attempted*100):0)}
function renderDashboard(){const total=tenses.reduce((a,t)=>a+getP(t.id).attempted,0),correct=tenses.reduce((a,t)=>a+getP(t.id).correct,0),mastered=tenses.filter(t=>mastery(t.id)>=95).length;$('accuracyStat').textContent=total?Math.round(correct/total*100)+'%':'—';$('answeredStat').textContent=total;$('masteredStat').textContent=mastered+'/12';$('streakStat').textContent=Number(localStorage.getItem('streak')||0);const last=Number(localStorage.getItem('lastTense'))||1,t=tenses.find(x=>x.id===last)||tenses[0],m=mastery(t.id);$('continueCard').innerHTML=`<div class="continue-main"><div><span class="badge">${t.category}</span><h2>${t.icon} ${t.name}</h2><p class="muted">${t.description}</p></div><button class="primary" onclick="startLesson(${t.id})">${m?'Keep practicing':'Start lesson'} →</button></div><div class="progress-track"><div class="progress-fill" style="width:${m}%"></div></div><small class="muted">${m}% mastery</small>`;$('progressList').innerHTML=tenses.slice(0,6).map(t=>`<div class="progress-row"><div class="progress-row-head"><span>${t.icon} ${t.name}</span><span>${mastery(t.id)}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${mastery(t.id)}%"></div></div></div>`).join('')}
function renderLibrary(){$('tenseGrid').innerHTML=tenses.map(t=>`<article class="tense-card" onclick="startLesson(${t.id})"><span class="tense-icon">${t.icon}</span><span class="badge">${t.category}</span><h3>${t.name}</h3><p>${t.description}</p><div class="progress-track"><div class="progress-fill" style="width:${mastery(t.id)}%"></div></div><small>${mastery(t.id)}% mastery · Practice →</small></article>`).join('')}
function startLesson(id){currentTense=tenses.find(t=>t.id===id)||fallbackTenses[0];localStorage.setItem('lastTense',id);showScreen('lesson');const m=mastery(id);$('lessonCard').innerHTML=`<span class="badge">${currentTense.category} Tense</span><h1>${currentTense.icon} ${currentTense.name}</h1><p class="muted">${currentTense.description}</p><div class="rule"><strong>Remember</strong><p>Focus on the time, purpose and structure of the sentence. Then use the rule in practice.</p><p class="formula">${formula(id)}</p></div><h2>Examples</h2>${examples(id).map(x=>`<div class="example"><strong>${x[0]}</strong><br>${x[1]}</div>`).join('')}<div class="feedback"><strong>🎯 Your mastery: ${m}%</strong><br><span class="muted">Complete a short practice session to improve it.</span></div><button class="primary" style="margin-top:18px;width:100%" onclick="startQuiz(${id})">Start practice →</button>`}
function formula(id){if(id===1)return'Subject + base verb (add -s/-es with he, she, it)';if(id===2)return'Subject + am/is/are + verb-ing';if(id===3)return'Subject + have/has + past participle';if(id===5)return'Subject + past form of the verb';return'Choose the auxiliary and verb form that match the tense.'}function examples(id){const e={1:[['Habit','I walk to school every day.'],['Third person','She plays tennis on Sundays.'],['Fact','Water boils at 100°C.']],2:[['Now','She is reading a book.'],['Around now','They are studying English.']],3:[['Experience','I have visited Delhi.'],['Recent result','She has finished her work.']]};return e[id]||[['Example','Use this tense in a sentence that matches its time and purpose.']]}
async function startQuiz(id){currentTense=tenses.find(t=>t.id===id)||fallbackTenses[0];questions=await fetchQuestions(id);if(!questions.length)questions=demoQuestions[id]||demoQuestions[1];qIndex=0;score=0;answered=false;showScreen('quiz');renderQuestion()}
async function fetchQuestions(id){try{const{data,error}=await db.from('questions').select('*').eq('tense_id',id).eq('is_active',true).limit(10);if(error)throw error;return(data||[]).map(q=>{let options=q.options||[];if(typeof options==='string'){try{options=JSON.parse(options)}catch(e){options=[]}}const answer=Number.isInteger(q.correct_index)?q.correct_index:Number.isInteger(q.correct_answer)?q.correct_answer:Number.isInteger(q.correct_option)?q.correct_option:0;return{dbId:q.id,question:q.question_text||q.question,options,answer,explanation:q.explanation||'Review the rule and try a similar sentence.'}})}catch(e){return[]}}
function renderQuestion(){const q=questions[qIndex];answered=false;$('quizCard').innerHTML=`<div class="quiz-top"><span>${currentTense.name}</span><span>Question ${qIndex+1} of ${questions.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${qIndex/questions.length*100}%"></div></div><div class="question">${q.question}</div><div>${q.options.map((o,i)=>`<button class="option" onclick="answerQuestion(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div><div id="feedback"></div>`}
function answerQuestion(i){if(answered)return;answered=true;const q=questions[qIndex],ok=i===q.answer;if(ok)score++;document.querySelectorAll('.option')[i].classList.add(ok?'correct':'wrong');if(!ok){document.querySelectorAll('.option')[q.answer].classList.add('correct');mistakes.push({tense:currentTense.name,tenseId:currentTense.id,question:q.question,correct:q.options[q.answer],questionId:q.dbId,explanation:q.explanation});saveMistakes();saveMistake(q)}recordAttempt(currentTense.id,q.dbId,ok);$('feedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${q.explanation}</p><button class="primary" style="width:100%" onclick="nextQuestion()">${qIndex+1<questions.length?'Next question →':'See result →'}</button></div>`}
function nextQuestion(){if(qIndex+1<questions.length){qIndex++;renderQuestion()}else showResult()}
async function recordAttempt(tenseId,questionId,ok){const p=getP(tenseId);p.attempted=(p.attempted||0)+1;p.correct=(p.correct||0)+(ok?1:0);p.mastery=Math.round(p.correct/p.attempted*100);p.lastPracticed=new Date().toISOString();progress[tenseId]=p;localStorage.setItem('learntense-progress',JSON.stringify(progress));if(!currentUser)return;try{await db.from('user_progress').upsert({user_id:currentUser.id,tense_id:tenseId,questions_attempted:p.attempted,correct_answers:p.correct,accuracy:p.mastery,mastery:p.mastery,last_practiced:p.lastPracticed},{onConflict:'user_id,tense_id'});if(questionId)await db.from('attempts').insert({user_id:currentUser.id,question_id:questionId,selected_answer:ok?'correct':'incorrect',correct:ok});}catch(e){console.warn('Progress sync failed:',e.message)}}
async function saveMistake(q){if(!currentUser||!q.dbId)return;try{await db.from('mistakes').insert({user_id:currentUser.id,question_id:q.dbId,reviewed:false})}catch(e){console.warn('Mistake sync failed:',e.message)}}
async function loadReview(){
 if(!currentUser){renderReview();return}
 try{
  const{data,error}=await db.from('mistakes').select('id,question_id,reviewed,created_at,reviewed_at,questions(question,question_text,options,correct_index,correct_answer,explanation,tense_id)').eq('user_id',currentUser.id).eq('reviewed',false).order('created_at',{ascending:false});
  if(error)throw error;
  mistakes=(data||[]).map(m=>{const q=m.questions||{};let options=q.options||[];if(typeof options==='string'){try{options=JSON.parse(options)}catch(e){options=[]}}const answer=Number.isInteger(q.correct_index)?q.correct_index:Number.isInteger(q.correct_answer)?q.correct_answer:0;const tense=tenses.find(t=>t.id===q.tense_id);return{id:m.id,questionId:m.question_id,tenseId:q.tense_id,tense:tense?.name||'Tense',question:q.question_text||q.question||'Question',correct:options[answer]||'Review the explanation',explanation:q.explanation||'Review this question and try again.'}});
  renderReview();
 }catch(e){console.warn('Cloud review load failed:',e.message);renderReview()}
}
async function markMistakeReviewed(id){if(!currentUser)return;try{const{error}=await db.from('mistakes').update({reviewed:true,reviewed_at:new Date().toISOString()}).eq('id',id).eq('user_id',currentUser.id);if(error)throw error;mistakes=mistakes.filter(m=>m.id!==id);renderReview()}catch(e){alert('Could not mark this mistake as reviewed. Please try again.');console.warn(e.message)}}
function showResult(){showScreen('result');const pct=Math.round(score/questions.length*100);$('resultCard').innerHTML=`<div class="score">${pct}%</div><h1>${pct>=80?'🎉 Great work!':'💪 Keep practicing!'}</h1><p class="muted">You answered ${score} of ${questions.length} correctly.</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><button class="primary" style="width:100%;margin-top:20px" onclick="startQuiz(${currentTense.id})">🔄 Try again</button><button class="secondary" onclick="showScreen('discover')">📊 Back to Practice Hub</button>`;renderDashboard();renderLibrary()}
function saveMistakes(){localStorage.setItem('learntense-mistakes',JSON.stringify(mistakes.slice(-50)))}
function renderReview(){const list=mistakes||[];$('reviewContent').innerHTML=list.length?list.map(m=>`<article class="review-item"><span class="badge">${m.tense}</span><h3>${m.question}</h3><p class="muted">Correct answer: <strong>${m.correct}</strong></p>${m.explanation?`<p class="muted">💡 ${m.explanation}</p>`:''}<div class="review-actions"><button class="secondary" onclick="startLesson(${m.tenseId||1})">📖 Review tense</button>${m.id?`<button class="secondary" onclick="markMistakeReviewed(${m.id})">✓ Mark reviewed</button>`:''}</div></article>`).join(''):'<article class="panel"><h2>🎉 No mistakes to review</h2><p class="muted">Keep practicing and your missed questions will appear here.</p></article>'}
function startWeakPractice(){const weak=tenses.slice().sort((a,b)=>mastery(a.id)-mastery(b.id))[0];startQuiz(weak?.id||1)}
async function initAuth(){try{const{data}=await db.auth.getUser();currentUser=data.user||null;db.auth.onAuthStateChange((_e,session)=>{currentUser=session?.user||null;if(currentUser){isGuest=false;openApp()}else if(!isGuest)showAuth();loadProgress()});if(currentUser)openApp();else if(!isGuest)showAuth()}catch(e){showAuth()}}
(async()=>{await initAuth()})();

// Live Challenge + profile initialization.
document.addEventListener('DOMContentLoaded', () => {
  let selectedAvatar = '🤖';

  const readProfile = () => {
    try {
      return JSON.parse(localStorage.getItem('user_profile') || '{"displayName":"Player","avatar":"🤖"}');
    } catch (_) {
      return { displayName: 'Player', avatar: '🤖' };
    }
  };

  const profile = readProfile();
  selectedAvatar = profile.avatar || '🤖';
  const usernameInput = $('profile-username');
  if (usernameInput) usernameInput.value = profile.displayName || '';

  document.querySelectorAll('.challenge-avatar-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.avatar === selectedAvatar);
    option.addEventListener('click', () => {
      document.querySelectorAll('.challenge-avatar-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedAvatar = option.dataset.avatar || '🤖';
    });
  });

  $('save-profile-btn')?.addEventListener('click', async () => {
    const displayName = usernameInput?.value.trim();
    if (!displayName) return alert('Please enter a username.');

    const profileData = { displayName, avatar: selectedAvatar };
    localStorage.setItem('user_profile', JSON.stringify(profileData));

    if (currentUser) {
      const { error } = await db.from('profiles').upsert({
        id: currentUser.id,
        display_name: displayName,
        avatar_url: selectedAvatar
      }, { onConflict: 'id' });
      if (error) console.warn('Profile save failed:', error.message);
    }

    if ($('profileName')) $('profileName').textContent = displayName;
    if ($('homeAvatar')) $('homeAvatar').textContent = selectedAvatar;
    if ($('profileAvatar')) $('profileAvatar').textContent = selectedAvatar;
    if ($('greetingName')) $('greetingName').textContent = `Hello ${displayName} 👋`;
    alert('Profile saved successfully!');
  });

  if (window.ChallengeArena && !window.arena) {
    window.arena = new ChallengeArena(db);
  }
});
