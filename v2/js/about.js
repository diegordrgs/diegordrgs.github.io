/* Floating thumb that follows the mouse over [data-float] words in the bio.
   Delegated on document so it survives the PT/EN innerHTML swap. */
(function(){
  let active=null;
  function ready(f){const i=f&&f.querySelector('img');return i&&i.complete&&i.naturalWidth>0}
  function place(f,e){
    const w=f.offsetWidth,h=f.offsetHeight;
    let x=e.clientX+20,y=e.clientY-h-12;
    if(x+w>window.innerWidth-8)x=e.clientX-w-20;
    if(y<8)y=e.clientY+24;
    f.style.left=x+'px';f.style.top=y+'px';
  }
  document.addEventListener('mouseover',e=>{
    const t=e.target.closest&&e.target.closest('[data-float]');
    if(!t)return;
    const f=document.getElementById(t.dataset.float);
    if(!ready(f))return;
    active=f;place(f,e);f.classList.add('vis');
  });
  document.addEventListener('mouseout',e=>{
    const t=e.target.closest&&e.target.closest('[data-float]');
    if(!t||(e.relatedTarget&&t.contains(e.relatedTarget)))return;
    if(active){active.classList.remove('vis');active=null}
  });
  document.addEventListener('mousemove',e=>{if(active)place(active,e)});
})();
