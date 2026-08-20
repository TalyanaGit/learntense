(() => {
  const TOTAL_GAMES=10, QUESTIONS_PER_GAME=25;
  const GAMES=[[1,'Easy','🌱','Starter'],[2,'Easy','⭐','Builder'],[3,'Easy','📘','Routine Master'],[4,'Medium','🔥','Third Person'],[5,'Medium','⚡','Do & Does'],[6,'Medium','🎯','Negatives'],[7,'Hard','🏆','Mixed Practice'],[8,'Hard','💎','Challenge'],[9,'Hard','🚀','Advanced'],[10,'Expert','👑','Grand Master']].map(([id,level,icon,title])=>({id,level,icon,title}));
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  // Fisher-Yates shuffle — used for BOTH option order and question order every time a game is played.
  function shuffle(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  // Build an options array from a correct string + wrong strings, shuffled, returning the new correct index.
  function buildOptions(correct,wrongs){const tagged=shuffle([{t:correct,c:true},...wrongs.map(t=>({t,c:false}))]);return{options:tagged.map(o=>o.t),answer:tagged.findIndex(o=>o.c)};}
  function pick(len,avoid){if(len<2)return 0;let i;do{i=Math.floor(Math.random()*len)}while(i===avoid);return i;}
  const q=(type,prompt,options,answer,explanation)=>({type,prompt,options,answer,explanation});

  // Each verb carries its correct third-person form AND a realistic common-mistake spelling,
  // so distractors teach an actual rule instead of a generic -ed/-ing suffix.
  const VERBS=[
    {b:'go',t:'goes',mistake:'gos',obj:'to school'},
    {b:'do',t:'does',mistake:'dos',obj:'homework'},
    {b:'watch',t:'watches',mistake:'watchs',obj:'TV'},
    {b:'wash',t:'washes',mistake:'washs',obj:'the dishes'},
    {b:'teach',t:'teaches',mistake:'teachs',obj:'English'},
    {b:'fix',t:'fixes',mistake:'fixs',obj:'bicycles'},
    {b:'miss',t:'misses',mistake:'misss',obj:'the bus'},
    {b:'pass',t:'passes',mistake:'passs',obj:'the shop'},
    {b:'study',t:'studies',mistake:'studys',obj:'English'},
    {b:'try',t:'tries',mistake:'trys',obj:'new recipes'},
    {b:'carry',t:'carries',mistake:'carrys',obj:'a bag'},
    {b:'cry',t:'cries',mistake:'crys',obj:'at sad movies'},
    {b:'play',t:'plays',mistake:'playes',obj:'football'},
    {b:'stay',t:'stays',mistake:'stayes',obj:'up late'},
    {b:'enjoy',t:'enjoys',mistake:'enjoyes',obj:'music'},
    {b:'read',t:'reads',mistake:'reades',obj:'books'},
    {b:'write',t:'writes',mistake:'writees',obj:'letters'},
    {b:'cook',t:'cooks',mistake:'cookes',obj:'dinner'},
    {b:'clean',t:'cleans',mistake:'cleanes',obj:'the house'},
    {b:'drive',t:'drives',mistake:'drivees',obj:'to work'},
    {b:'run',t:'runs',mistake:'runnes',obj:'every morning'},
    {b:'swim',t:'swims',mistake:'swimes',obj:'in the lake'},
    {b:'finish',t:'finishes',mistake:'finishs',obj:'work at six'},
    {b:'brush',t:'brushes',mistake:'brushs',obj:'their teeth'}
  ];
  const SUBJECTS=['I','You','We','They','He','She','It','Ravi','Maya','Sam','The teacher','My parents','The children','Our neighbor'];
  const TIMES=['every day','every morning','every evening','every weekend','on Sundays','after school','before breakfast','at night','once a week','in the morning','on weekdays','every Friday'];
  const singular=s=>/^(He|She|It|Ravi|Maya|Sam|The teacher|Our neighbor)$/.test(s);

  function oneRound(vI,sI,tI){
    const v=VERBS[vI],sub=SUBJECTS[sI],time=TIMES[tI],is3=singular(sub),correct=is3?v.t:v.b,wrongForm=is3?v.b:v.t;
    const out=[];

    // 1. Fill in the blank
    {const{options,answer}=buildOptions(correct,[wrongForm,v.mistake,v.b+'ing']);
     out.push(q('Fill in the blank',`${sub} ___ ${v.obj} ${time}.`,options,answer,
       is3?`With “${sub}”, add -s/-es: “${correct}”. “${v.mistake}” is a common spelling mistake.`
          :`“${sub}” takes the base form (no -s): “${correct}”.`));}

    // 2. Multiple choice — different subject so it isn't just a repeat of #1
    {const sI2=pick(SUBJECTS.length,sI),sub2=SUBJECTS[sI2],is3b=singular(sub2),correct2=is3b?v.t:v.b,wrong2=is3b?v.b:v.t,time2=TIMES[pick(TIMES.length,tI)];
     const{options,answer}=buildOptions(correct2,[wrong2,v.mistake,v.b+'ed']);
     out.push(q('Multiple choice',`Choose the correct word: “${sub2} ___ ${v.obj} ${time2}.”`,options,answer,
       `${sub2} ${is3b?'is third person, so it':'does not'} take${is3b?'':' the'} ${is3b?'-s/-es':'base verb'}: “${correct2}”.`));}

    // 3. Spot the correct sentence — 4 full sentences, only one fully correct
    {const time3=TIMES[pick(TIMES.length,tI)];
     const good=`${sub} ${correct} ${v.obj} ${time3}.`;
     const bad1=`${sub} ${wrongForm} ${v.obj} ${time3}.`;
     const bad2=`${sub} ${v.mistake} ${v.obj} ${time3}.`;
     const bad3=`${sub} ${is3?'is':'are'} ${v.b} ${v.obj} ${time3}.`;
     const{options,answer}=buildOptions(good,[bad1,bad2,bad3]);
     out.push(q('Correct the mistake','Which sentence is correct?',options,answer,
       `The correct form here is “${correct}”, so the full sentence is “${good}”.`));}

    // 4. Question formation
    {const time4=TIMES[pick(TIMES.length,tI)];
     const statement=`${sub} ${correct} ${v.obj} ${time4}.`;
     const goodQ=`${is3?'Does':'Do'} ${sub} ${v.b} ${v.obj} ${time4}?`;
     const badQ1=`${is3?'Do':'Does'} ${sub} ${v.b} ${v.obj}?`;
     const badQ2=`${is3?'Does':'Do'} ${sub} ${correct} ${v.obj}?`;
     const badQ3=`${sub} ${correct} ${v.obj}?`;
     const{options,answer}=buildOptions(goodQ,[badQ1,badQ2,badQ3]);
     out.push(q('Question formation',`Turn this into a question: “${statement}”`,options,answer,
       `Use ${is3?'“Does”':'“Do”'} + subject + the BASE verb (not “${correct}”): “${goodQ}”.`));}

    // 5. Negative sentence
    {const time5=TIMES[pick(TIMES.length,tI)];
     const statement=`${sub} ${correct} ${v.obj} ${time5}.`;
     const goodNeg=`${sub} ${is3?'does not':'do not'} ${v.b} ${v.obj} ${time5}.`;
     const badNeg1=`${sub} ${is3?'do not':'does not'} ${v.b} ${v.obj} ${time5}.`;
     const badNeg2=`${sub} ${is3?'does not':'do not'} ${correct} ${v.obj} ${time5}.`;
     const badNeg3=`${sub} ${is3?'no':'not'} ${v.b} ${v.obj} ${time5}.`;
     const{options,answer}=buildOptions(goodNeg,[badNeg1,badNeg2,badNeg3]);
     out.push(q('Negative sentence',`Make this negative: “${statement}”`,options,answer,
       `Use ${is3?'“does not”':'“do not”'} + the BASE verb: “${goodNeg}”.`));}

    return out;
  }

  function makeQuestions(game){
    const rounds=[];let lastV=-1,lastS=-1,lastT=-1;
    for(let i=0;i<5;i++){
      const vI=pick(VERBS.length,lastV),sI=pick(SUBJECTS.length,lastS),tI=pick(TIMES.length,lastT);
      lastV=vI;lastS=sI;lastT=tI;
      rounds.push(...oneRound(vI,sI,tI));
    }
    // Shuffle the full 25-question order so question types don't appear in a predictable fixed pattern.
    return shuffle(rounds).map((x,i)=>({...x,id:`sp-${game}-${i+1}`,number:i+1,difficulty:game<=3?'Easy':game<=6?'Medium':game<=9?'Hard':'Expert'}));
  }

  const progress=()=>JSON.parse(localStorage.getItem('sp-games')||'{}');
  const save=(g,score)=>{const p=progress();p[g]={completed:true,score:Math.max(score,p[g]?.score||0)};localStorage.setItem('sp-games',JSON.stringify(p));};
  const unlocked=g=>g===1||!!progress()[g-1]?.completed;
  function renderGames(){const card=document.getElementById('lessonCard');if(!card)return;const games=GAMES.map(g=>{const p=progress()[g.id];return `<button class="sp-game ${unlocked(g.id)?'':'locked'}" ${unlocked(g.id)?`onclick="window.startSimplePresentGame(${g.id})"`:'disabled'}><span>${g.icon}</span><div><strong>Game ${g.id}: ${g.title}</strong><small>${g.level} · ${QUESTIONS_PER_GAME} questions · ${p?.score||0}% best</small><em>${unlocked(g.id)?'Play →':'🔒 Complete previous game'}</em></div></button>`}).join('');card.insertAdjacentHTML('beforeend',`<div class="sp-games"><h2>🎮 Simple Present Games</h2><p class="muted">${TOTAL_GAMES} progressive games · ${QUESTIONS_PER_GAME} questions each · freshly shuffled every time you play.</p>${games}</div>`);}
  let gameState=null;
  window.startSimplePresentGame=game=>{if(!unlocked(game))return;gameState={game,index:0,score:0,questions:makeQuestions(game)};document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('quiz').classList.add('active');renderQuestion();};
  function renderQuestion(){const s=gameState,qq=s.questions[s.index],opts=qq.options.map((o,i)=>`<button class="option" onclick="window.answerSimplePresent(${i})">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('');document.getElementById('quizCard').innerHTML=`<div class="quiz-top"><span>Simple Present · Game ${s.game}</span><span>${s.index+1}/${QUESTIONS_PER_GAME}</span></div><div class="progress-track"><div class="progress-fill" style="width:${s.index/QUESTIONS_PER_GAME*100}%"></div></div><span class="badge">${qq.type} · ${qq.difficulty}</span><div class="question">${esc(qq.prompt)}</div><div>${opts}</div><div id="spFeedback"></div>`;}
  window.answerSimplePresent=i=>{const s=gameState,qq=s.questions[s.index];if(document.querySelector('#quizCard .option')?.disabled)return;const ok=i===qq.answer;if(ok)s.score++;document.querySelectorAll('#quizCard .option').forEach((b,n)=>{b.disabled=true;if(n===i)b.classList.add(ok?'correct':'wrong');if(!ok&&n===qq.answer)b.classList.add('correct');});document.getElementById('spFeedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${esc(qq.explanation)}</p><button class="primary" style="width:100%" onclick="window.nextSimplePresent()">${s.index<QUESTIONS_PER_GAME-1?'Next →':'Finish game →'}</button></div>`;};
  window.nextSimplePresent=()=>{if(gameState.index<QUESTIONS_PER_GAME-1){gameState.index++;renderQuestion();return;}const pct=Math.round(gameState.score/QUESTIONS_PER_GAME*100);save(gameState.game,pct);document.getElementById('quizCard').innerHTML=`<div class="result-card"><div class="score">${pct}%</div><h1>${pct>=80?'🎉 Game complete!':'💪 Keep practicing!'}</h1><p>You got ${gameState.score} out of ${QUESTIONS_PER_GAME} correct.</p><p class="muted">${pct>=80?'The next game is now unlocked.':'Replay this game to improve your score.'}</p><button class="primary" onclick="window.startSimplePresentGame(${gameState.game})">🔄 Replay</button><button class="secondary" onclick="showScreen('lesson');setTimeout(()=>window.renderSimplePresentGames(),0)">← Games</button></div>`;};
  window.renderSimplePresentGames=renderGames;const oldStartLesson=window.startLesson;window.startLesson=function(id){oldStartLesson(id);if(Number(id)===1)setTimeout(renderGames,0);};
})();
