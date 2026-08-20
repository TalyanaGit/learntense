// LearnTense runtime compatibility fixes.
// Keeps legacy app.js behavior while fixing current Supabase column mismatches.
(function(){
  window.recordAttempt=async function(tenseId,questionId,ok){
    const p=getP(tenseId);p.attempted=(p.attempted||0)+1;p.correct=(p.correct||0)+(ok?1:0);p.mastery=Math.round(p.correct/p.attempted*100);p.lastPracticed=new Date().toISOString();progress[tenseId]=p;localStorage.setItem('learntense-progress',JSON.stringify(progress));
    if(!currentUser)return;
    try{
      const r=await db.from('user_progress').upsert({user_id:currentUser.id,tense_id:tenseId,questions_attempted:p.attempted,correct_answers:p.correct,accuracy:p.mastery,mastery:p.mastery,last_practiced:p.lastPracticed},{onConflict:'user_id,tense_id'});
      if(r.error)throw r.error;
      if(questionId){const a=await db.from('attempts').insert({user_id:currentUser.id,question_id:questionId,selected_answer:Number.isInteger(window.__lastSelectedAnswer)?window.__lastSelectedAnswer:null,correct:ok});if(a.error)throw a.error;}
    }catch(e){console.warn('Progress sync failed:',e.message)}
  };
  window.answerQuestion=function(i){
    if(answered)return;answered=true;window.__lastSelectedAnswer=i;
    const q=questions[qIndex],ok=i===q.answer;if(ok)score++;
    const buttons=document.querySelectorAll('.option');if(buttons[i])buttons[i].classList.add(ok?'correct':'wrong');if(!ok&&buttons[q.answer])buttons[q.answer].classList.add('correct');
    if(!ok){mistakes.push({tense:currentTense.name,tenseId:currentTense.id,question:q.question,correct:q.options[q.answer],questionId:q.dbId,explanation:q.explanation});saveMistakes();saveMistake(q)}
    recordAttempt(currentTense.id,q.dbId,ok);
    $('feedback').innerHTML=`<div class="feedback"><strong>${ok?'✅ Correct!':'❌ Not quite.'}</strong><p>${q.explanation}</p><button class="primary" style="width:100%" onclick="nextQuestion()">${qIndex+1<questions.length?'Next question →':'See result →'}</button></div>`;
  };
  window.loadReview=async function(){
    if(!currentUser){renderReview();return}
    try{
      const r=await db.from('mistakes').select('id,question_id,reviewed,created_at,questions(question,question_text,options,correct_index,correct_answer,explanation,tense_id)').eq('user_id',currentUser.id).eq('reviewed',false).order('created_at',{ascending:false});
      if(r.error)throw r.error;
      mistakes=(r.data||[]).map(m=>{const q=m.questions||{};let options=q.options||[];if(typeof options==='string'){try{options=JSON.parse(options)}catch(e){options=[]}}const answer=Number.isInteger(q.correct_index)?q.correct_index:Number.isInteger(q.correct_answer)?q.correct_answer:0;const tense=tenses.find(t=>t.id===q.tense_id);return{id:m.id,questionId:m.question_id,tenseId:q.tense_id,tense:tense?.name||'Tense',question:q.question_text||q.question||'Question',correct:options[answer]||'Review the explanation',explanation:q.explanation||'Review this question and try again.'}});
      renderReview();
    }catch(e){console.warn('Cloud review load failed:',e.message);renderReview()}
  };
  window.markMistakeReviewed=async function(id){if(!currentUser)return;try{const r=await db.from('mistakes').update({reviewed:true}).eq('id',id).eq('user_id',currentUser.id);if(r.error)throw r.error;mistakes=mistakes.filter(m=>m.id!==id);renderReview()}catch(e){alert('Could not mark this mistake as reviewed. Please try again.');console.warn(e.message)}};
})();
