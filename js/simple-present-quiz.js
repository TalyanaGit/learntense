/* LearnTense — Simple Present structured quiz
   Ten task types: fill-in, MCQ, correction, question formation, negative,
   true/false passage, matching, picture prompt, reordering, open answer. */
(function(){
  const tasks=[
    {type:'fill',title:'Fill in the blank',prompt:'She _____ (go) to school every day.',answer:'goes',hint:'Remember: he/she/it takes -s or -es.'},
    {type:'fill',title:'Fill in the blank',prompt:'They _____ (not/like) coffee.',answer:"don't like",alternates:['do not like'],hint:'Use do not/don’t + base verb with they.'},
    {type:'mcq',title:'Multiple choice',prompt:'He ___ football on weekends.',options:['play','plays','playing','played'],answer:1,explanation:'He is third-person singular, so play becomes plays.'},
    {type:'correct',title:'Correct the mistake',prompt:'She go to work by bus.',answer:'She goes to work by bus.',hint:'Add -es to the verb after she.'},
    {type:'question',title:'Question formation',prompt:'Make a question: He works in a bank.',answer:'Does he work in a bank?',hint:'Use Does + subject + base verb.'},
    {type:'negative',title:'Negative sentence',prompt:'Turn positive to negative: They watch TV every night.',answer:"They don't watch TV every night.",alternates:['They do not watch TV every night.'],hint:'Use do not/don’t + base verb.'},
    {type:'tf',title:'True / False',passage:'Maria wakes up at 6 AM. She doesn’t eat breakfast.',prompt:'Maria eats breakfast every day.',answer:false,explanation:'The passage says Maria doesn’t eat breakfast.'},
    {type:'match',title:'Matching',prompt:'Match each subject with the correct verb form.',pairs:[['I','go'],['She','goes'],['They','go']],options:['go','goes'],answer:{I:'go',She:'goes',They:'go'}},
    {type:'picture',title:'Picture-based',prompt:'Look at the routine picture and write one Simple Present sentence.',answerPattern:['brush','brushes','teeth'],hint:'Example: He brushes his teeth every morning.'},
    {type:'reorder',title:'Sentence reordering',prompt:'always / coffee / drinks / she / morning / in / the',answer:'She always drinks coffee in the morning.',hint:'Start with the subject and place “always” before the main verb.'},
    {type:'open',title:'Short answer',prompt:'What time do you usually wake up?',answerPattern:['I usually wake up'],hint:'Answer in a full sentence using the Simple Present.'}
  ];
  let taskIndex=0,taskScore=0,taskAnswered=false,taskResults=[];
  const norm=s=>String(s||'').trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  const accepted=(value,task)=>{const v=norm(value);if(task.answer!==undefined&&v===norm(task.answer))return true;if(task.alternates&&task.alternates.some(a=>v===norm(a)))return true;if(task.answerPattern)return task.answerPattern.every(p=>v.includes(norm(p)));return false};
  function quizCard(){return document.getElementById('quizCard')}
  function startSimplePresent(){taskIndex=0;taskScore=0;taskAnswered=false;taskResults=[];showScreen('quiz');renderTask()}
  function renderTask(){
    const t=tasks[taskIndex]; taskAnswered=false;
    let body='';
    if(t.type==='fill'||t.type==='correct'||t.type==='question'||t.type==='negative'||t.type==='reorder'||t.type==='open') body=`<input id="spAnswer" class="answer-input" autocomplete="off" placeholder="Type your answer here">`;
    if(t.type==='mcq') body=t.options.map((o,i)=>`<button class="option sp-option" data-i="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('');
    if(t.type==='tf') body=`<div class="passage"><strong>Read:</strong><p>${t.passage}</p></div><div class="tf-row"><button class="secondary sp-tf" data-value="true">True</button><button class="secondary sp-tf" data-value="false">False</button></div>`;
    if(t.type==='match') body=`<div class="match-grid">${Object.keys(t.answer).map(s=>`<label><strong>${s}</strong><select class="sp-match" data-subject="${s}"><option value="">Choose…</option>${t.options.map(o=>`<option>${o}</option>`).join('')}</select></label>`).join('')}</div>`;
    if(t.type==='picture') body=`<div class="routine-picture" role="img" aria-label="Person brushing teeth">🧑‍🦱<div class="routine-icon">🪥</div><small>Morning routine: brushing teeth</small></div><input id="spAnswer" class="answer-input" autocomplete="off" placeholder="Write a Simple Present sentence">`;
    quizCard().innerHTML=`<div class="quiz-top"><span>Simple Present · ${t.type==='picture'?'Picture practice':'Skill practice'}</span><span>${taskIndex+1} of ${tasks.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${taskIndex/tasks.length*100}%"></div></div><span class="badge">${t.title}</span><div class="question">${t.prompt}</div>${body}<div id="spFeedback"></div><button id="spSubmit" class="primary" style="width:100%;margin-top:16px">${t.type==='mcq'||t.type==='tf'?'Check answer':'Check answer'} →</button>`;
    if(t.type==='mcq')document.querySelectorAll('.sp-option').forEach(b=>b.onclick=()=>{document.querySelectorAll('.sp-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
    if(t.type==='tf')document.querySelectorAll('.sp-tf').forEach(b=>b.onclick=()=>{document.querySelectorAll('.sp-tf').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')});
    document.getElementById('spSubmit').onclick=checkTask;
  }
  function getValue(t){
    if(t.type==='mcq'){const b=document.querySelector('.sp-option.selected');return b?Number(b.dataset.i):null}
    if(t.type==='tf'){const b=document.querySelector('.sp-tf.selected');return b?b.dataset.value==='true':null}
    if(t.type==='match'){const out={};document.querySelectorAll('.sp-match').forEach(s=>out[s.dataset.subject]=s.value);return out}
    return document.getElementById('spAnswer')?.value||'';
  }
  function isCorrect(t,v){
    if(t.type==='mcq')return v===t.answer;
    if(t.type==='tf')return v===t.answer;
    if(t.type==='match')return Object.keys(t.answer).every(k=>v[k]===t.answer[k]);
    return accepted(v,t);
  }
  function displayAnswer(t){if(t.type==='mcq')return t.options[t.answer];if(t.type==='tf')return t.answer?'True':'False';if(t.type==='match')return 'I → go · She → goes · They → go';return t.answer||'A correct Simple Present sentence matching the prompt.'}
  async function checkTask(){if(taskAnswered)return;const t=tasks[taskIndex],v=getValue(t);if(v===null||v===''||(t.type==='match'&&Object.values(v).some(x=>!x))){document.getElementById('spFeedback').innerHTML='<div class="feedback"><strong>Please complete the answer first.</strong></div>';return}taskAnswered=true;const ok=isCorrect(t,v);if(ok)taskScore++;taskResults.push({task:t,ok,value:v});
    document.getElementById('spFeedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${ok?'Great work!':`Correct answer: <strong>${displayAnswer(t)}</strong>`}</p><p class="muted">${t.explanation||t.hint||''}</p><button class="primary" style="width:100%" onclick="window.nextSimplePresentTask()">${taskIndex+1<tasks.length?'Next skill →':'See result →'}</button></div>`;
    if(!ok){const q={dbId:null,question:t.prompt,options:[displayAnswer(t)],answer:0,explanation:t.explanation||t.hint||'Review the Simple Present rule.'};mistakes.push({tense:'Simple Present',tenseId:1,question:t.prompt,correct:displayAnswer(t),explanation:q.explanation});saveMistakes();}
    // Store the session score using the existing progress function. This structured quiz has no DB question IDs yet.
    recordAttempt(1,null,ok);
  }
  window.nextSimplePresentTask=()=>{if(taskIndex+1<tasks.length){taskIndex++;renderTask()}else showStructuredResult()};
  function showStructuredResult(){showScreen('result');const pct=Math.round(taskScore/tasks.length*100);document.getElementById('resultCard').innerHTML=`<div class="score">${pct}%</div><span class="badge">Simple Present · 10 skills</span><h1>${pct>=80?'🎉 Great work!':'💪 Keep practicing!'}</h1><p class="muted">You completed ${taskScore} of ${tasks.length} skills correctly.</p><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div><div class="feedback"><strong>Skills practiced</strong><p>Fill in the blank · Multiple choice · Correction · Questions · Negatives · True/False · Matching · Picture · Reordering · Open answer</p></div><button class="primary" style="width:100%;margin-top:18px" onclick="window.startSimplePresentQuiz()">🔄 Try again</button><button class="secondary" onclick="showScreen('dashboard')">📊 Back to dashboard</button>`;renderDashboard();renderLibrary()}
  window.startSimplePresentQuiz=startSimplePresent;
  // Override only Simple Present; other tenses retain the normal database quiz.
  const originalStartQuiz=window.startQuiz;
  window.startQuiz=async function(id){if(Number(id)===1){startSimplePresent();return}return originalStartQuiz(id)};
})();
