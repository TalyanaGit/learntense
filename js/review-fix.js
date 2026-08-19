document.addEventListener('click',function(event){
  var button=event.target.closest('[data-review-id]');
  if(!button)return;
  event.preventDefault();
  button.disabled=true;
  button.textContent='Saving...';
  if(typeof markMistakeReviewed==='function'){
    markMistakeReviewed(button.getAttribute('data-review-id'));
  }
});

var reviewObserver=new MutationObserver(function(){
  var box=document.getElementById('reviewContent');
  if(!box)return;
  box.querySelectorAll('.review-item').forEach(function(item){
    if(item.querySelector('[data-review-id]'))return;
    var text=item.querySelector('h3');
    var buttons=item.querySelectorAll('button');
    var reviewButton=document.createElement('button');
    reviewButton.type='button';
    reviewButton.className='secondary review-action';
    reviewButton.textContent='✓ Mark reviewed';
    var idMatch=item.outerHTML.match(/startLesson\((\d+)\)/);
    var allMistakes=window.mistakes||[];
    var found=allMistakes.find(function(m){return text&&m.question===text.textContent;});
    if(found)reviewButton.setAttribute('data-review-id',found.id);
    if(found && buttons.length)buttons[0].insertAdjacentElement('beforebegin',reviewButton);
  });
});
reviewObserver.observe(document.body,{childList:true,subtree:true});
