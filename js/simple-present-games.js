(() => {
  const GAMES = [
    {id:1,level:'Easy',icon:'🌱',title:'Starter',description:'Build the Simple Present basics.'},
    {id:2,level:'Easy',icon:'⭐',title:'Builder',description:'Strengthen everyday Simple Present sentences.'},
    {id:3,level:'Hard',icon:'🔥',title:'Challenger',description:'Apply rules with common traps.'},
    {id:4,level:'Hard',icon:'⚡',title:'Expert',description:'Handle longer and trickier sentences.'},
    {id:5,level:'Difficult',icon:'🏆',title:'Master',description:'Solve complex grammar situations.'},
    {id:6,level:'Difficult',icon:'👑',title:'Grand Master',description:'Final Simple Present mastery challenge.'}
  ];
  const people=[['I','go'],['You','go'],['We','go'],['They','go'],['He','goes'],['She','goes'],['It','goes']];
  const routines=['to school every day','to work by bus','football on Sundays','English every morning','coffee before class','books at night','TV after dinner','the piano on weekends'];
  const verbs=[['go','goes'],['watch','watches'],['study','studies'],['play','plays'],['wash','washes'],['read','reads'],['cook','cooks'],['teach','teaches']];
  const shuffle=(a)=>a.slice().sort(()=>Math.random()-.5);
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function q(type,prompt,options,answer,explanation){return{type,prompt,options,answer,explanation}}
  function makeQuestions(game){
    const out=[];
    const difficulty=game<=2?'Easy':game<=4?'Hard':'Difficult';
    for(let i=0;i<5;i++){
      const [s,v]=people[(i+game)%people.length], base=v.replace(/s$/,'');
      const pair=v===base?[base,base+'s']:[base,v];
      out.push(q('fill',`${s} _____ ${routines[(i+game)%routines.length]}.`,shuffle(pair),pair.indexOf(v),`${s} takes the base verb; he, she and it take the -s/-es form.`));
      const [mv,ms]=verbs[(i+game)%verbs.length]; const subj=(i+game)%2?'She':'They'; const correct=subj==='She'?ms:mv;
      out.push(q('mc',`${subj} ___ ${mv==='study'?'English':mv+'s'} every week.`,shuffle([correct,correct===mv?ms:mv,mv+'ed',mv+'ing']),0,`${subj} is ${subj==='She'?'singular':'plural'}, so use ${correct}.`));
      out.push(q('correct',`Fix the mistake: “${subj} ${subj==='She'?mv:ms} every day.”`,[`Keep it`,`Change the verb to “${correct}”`],1,`${subj} needs the correct Simple Present agreement: “${subj} ${correct} every day.”`));
      const who=['He works in a bank.','She plays tennis.','They live in Delhi.','Ravi studies English.','The children walk to school.'][(i+game)%5];
      const question=who.startsWith('They')?'Do they live in Delhi?':who.startsWith('The children')?'Do the children walk to school?':who.startsWith('Ravi')?'Does Ravi study English?':who.startsWith('She')?'Does she play tennis?':'Does he work in a bank?';
      out.push(q('question',`Make a question: “${who}”`,[question,question.replace('Does','Do').replace('Do they','Does they').replace('Do the','Does the')],0,'Use do with I/you/we/they and does with he/she/it. The main verb stays in its base form after does.'));
      const positive=['They watch TV every night.','She reads before bed.','He plays football on Sundays.','We study English every day.','Ravi cooks dinner.'][(i+game)%5];
      const negative=positive.replace('They watch','They do not watch').replace('She reads','She does not read').replace('He plays','He does not play').replace('We study','We do not study').replace('Ravi cooks','Ravi does not cook');
      out.push(q('negative',`Make this negative: “${positive}”`,[negative,positive.replace('every','never every')],0,'Use do not/don’t for I, you, we, they; use does not/doesn’t for he, she, it.'));
      const passage=['Maria wakes up at 6 AM. She does not eat breakfast.','Tom walks to school. He drinks water at lunch.','Anita studies every evening. She watches TV after dinner.','David works in a bank. He does not drive to work.','Sara reads every night. She likes mystery books.'][(i+game)%5];
      const statement=['Maria eats breakfast every day.','Tom walks to school.','Anita never studies.','David drives to work.','Sara likes mystery books.'][(i+game)%5];
      const truth=[false,true,false,false,true][(i+game)%5];
      out.push(q('tf',`Read: “${passage}”\n\nTrue or False: ${statement}`,['True','False'],truth?0:1,truth?'The statement matches the passage.':'The statement contradicts the passage.'));
      const subject=people[(i+game)%people.length][0]; const verb=people[(i+game)%people.length][1];
      out.push(q('match',`Match the subject with its correct verb: ${subject}`, [verb,verb===base?base+'s':base],0,`${subject} uses “${verb}” in the Simple Present.`));
      const pic=['🪥','🏃','📚','🍳','⚽'][(i+game)%5]; const picText=['brush teeth','run in the park','read books','cook breakfast','play football'][(i+game)%5];
      out.push(q('picture',`${pic} Routine picture: Write the best sentence for someone who ${picText}.`,[`He/She ${picText}.`,`He/She is ${picText}.`],0,'A routine is normally expressed with the Simple Present.'));
      const scrambled=[['always','coffee','drinks','she','in','the','morning'],['every','They','day','study','English'],['football','He','Sundays','plays','on'],['school','I','to','go','every','day'],['TV','We','watch','night','at']][(i+game)%5];
      const ordered=[['She always drinks coffee in the morning.'],['They study English every day.'],['He plays football on Sundays.'],['I go to school every day.'],['We watch TV at night.']][(i+game)%5][0];
      out.push(q('reorder',`Reorder: ${scrambled.join(' / ')}`,[ordered,'Every day study they English.'],0,'Put the subject first, then the verb, and place time/frequency expressions naturally.'));
      const wake=['7 AM','6:30 AM','8 AM','6 AM','7:30 AM'][(i+game)%5];
      out.push(q('short',`What time do you usually wake up?`,[`I usually wake up at ${wake}.`,`I am usually waking up at ${wake}.`],0,'Use the Simple Present for regular routines: “I usually wake up at …”.'));
    }
    return out.map((x,i)=>({...x,id:`sp-${game}-${i+1}`,difficulty,number:i+1}));
  }
  const GAME_Q={}; for(let g=1;g<=6;g++) GAME_Q[g]=makeQuestions(g);
  let gameState=null;
  function gameProgress(){return JSON.parse(localStorage.getItem('sp-games')||'{}')}
  function saveGameProgress(g,score){const p=gameProgress();p[g]={completed:true,score:Math.max(score,p[g]?.score||0)};localStorage.setItem('sp-games',JSON.stringify(p))}
  function unlocked(g){return g===1||!!gameProgress()[g-1]?.completed}
  function renderGames(){
    const card=document.getElementById('lessonCard'); if(!card)return;
    const games=GAMES.map(g=>{const p=gameProgress()[g.id];return `<button class="sp-game ${unlocked(g.id)?'':'locked'}" ${unlocked(g.id)?`onclick="window.startSimplePresentGame(${g.id})"`: 'disabled'}><span>${g.icon}</span><div><strong>Game ${g.id}: ${g.title}</strong><small>${g.level} · 50 questions · ${p?.score||0}% best</small><em>${unlocked(g.id)?'Play →':'🔒 Complete previous game'}</em></div></button>`}).join('');
    card.insertAdjacentHTML('beforeend',`<div class="sp-games"><h2>🎮 Simple Present Games</h2><p class="muted">300 questions across six progressive games. Each game has 5 of every skill.</p>${games}</div>`);
  }
  window.startSimplePresentGame=(game)=>{if(!unlocked(game))return;gameState={game,index:0,score:0,questions:GAME_Q[game]};document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('quiz').classList.add('active');renderGameQuestion()};
  function renderGameQuestion(){
    const s=gameState,q=s.questions[s.index]; const types={fill:'Fill in the blank',mc:'Multiple choice',correct:'Correct the mistake',question:'Question formation',negative:'Negative sentence',tf:'True / False',match:'Matching',picture:'Picture-based',reorder:'Sentence reordering',short:'Short answer'};
    const opts=q.options.map((o,i)=>`<button class="option" onclick="window.answerSimplePresent(${i})">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('');
    document.getElementById('quizCard').innerHTML=`<div class="quiz-top"><span>Simple Present · Game ${s.game}</span><span>${s.index+1}/50</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.index/50*100}%"></div></div><span class="badge">${types[q.type]} · ${q.difficulty}</span><div class="question">${esc(q.prompt).replace(/\n/g,'<br>')}</div><div>${opts}</div><div id="spFeedback"></div>`;
  }
  window.answerSimplePresent=(i)=>{const s=gameState,q=s.questions[s.index];if(document.querySelectorAll('#quizCard .option')[0]?.disabled)return;const ok=i===q.answer;if(ok)s.score++;document.querySelectorAll('#quizCard .option').forEach((b,n)=>{b.disabled=true;if(n===i)b.classList.add(ok?'correct':'wrong');if(!ok&&n===q.answer)b.classList.add('correct')});document.getElementById('spFeedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${esc(q.explanation)}</p><button class="primary" style="width:100%" onclick="window.nextSimplePresent()">${s.index<49?'Next →':'Finish game →'}</button></div>`};
  window.nextSimplePresent=()=>{if(gameState.index<49){gameState.index++;renderGameQuestion()}else{const pct=Math.round(gameState.score/50*100);saveGameProgress(gameState.game,pct);document.getElementById('quizCard').innerHTML=`<div class="result-card"><div class="score">${pct}%</div><h1>${pct>=80?'🎉 Game complete!':'💪 Keep practicing!'}</h1><p>You got ${gameState.score} out of 50 correct.</p><p class="muted">${pct>=80?'The next game is now unlocked.':'You can replay this game to improve your score.'}</p><button class="primary" onclick="window.startSimplePresentGame(${gameState.game})">🔄 Replay</button><button class="secondary" onclick="showScreen('lesson');setTimeout(()=>window.renderSimplePresentGames(),0)">← Games</button></div>`;}};
  window.renderSimplePresentGames=renderGames;
  const oldStartLesson=window.startLesson;
  window.startLesson=function(id){oldStartLesson(id);if(Number(id)===1)setTimeout(renderGames,0)};
})();
