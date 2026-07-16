(function(){
  const dot=document.getElementById('dot'),ring=document.getElementById('ring');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
  (function anim(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(anim)})();
  document.querySelectorAll('a,.pf-thumb,.hw,.fun-item,.theme-toggle,.lang-option').forEach(el=>{
    el.addEventListener('mouseenter',()=>{dot.classList.add('hov');ring.classList.add('hov')});
    el.addEventListener('mouseleave',()=>{dot.classList.remove('hov');ring.classList.remove('hov')});
  });
})();

(function(){
  const btns=document.querySelectorAll('.theme-toggle');
  if(!btns.length)return;
  const root=document.documentElement;
  btns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      const isDark=root.getAttribute('data-theme')==='dark';
      root.setAttribute('data-theme',isDark?'light':'dark');
      localStorage.setItem('theme',isDark?'light':'dark');
    });
  });
})();

(function(){
  const menuToggle=document.getElementById('menuToggle');
  const menuClose=document.getElementById('menuClose');
  const mobileMenu=document.getElementById('mobileMenu');
  if(!menuToggle||!mobileMenu)return;
  const breakpoint=parseInt(mobileMenu.dataset.breakpoint||'640',10);
  function openMenu(){mobileMenu.classList.add('open');document.body.style.overflow='hidden'}
  function closeMenu(){mobileMenu.classList.remove('open');document.body.style.overflow=''}
  menuToggle.addEventListener('click',openMenu);
  if(menuClose)menuClose.addEventListener('click',closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(window.innerWidth>breakpoint)closeMenu()});
})();

(function(){
  function applyLang(lang){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-en]').forEach(el=>{
      if(el.dataset.pt===undefined)el.dataset.pt=el.innerHTML;
      el.innerHTML=lang==='en'?el.dataset.en:el.dataset.pt;
    });
    const titleEl=document.querySelector('title[data-en]');
    if(titleEl){
      if(titleEl.dataset.pt===undefined)titleEl.dataset.pt=titleEl.textContent;
      titleEl.textContent=lang==='en'?titleEl.dataset.en:titleEl.dataset.pt;
    }
    const metaDesc=document.querySelector('meta[name="description"][data-en]');
    if(metaDesc){
      if(metaDesc.dataset.pt===undefined)metaDesc.dataset.pt=metaDesc.getAttribute('content');
      metaDesc.setAttribute('content',lang==='en'?metaDesc.dataset.en:metaDesc.dataset.pt);
    }
    document.querySelectorAll('.lang-option').forEach(b=>{
      b.classList.toggle('active',b.dataset.lang===lang);
    });
    if(window.onLangChange)window.onLangChange(lang);
    localStorage.setItem('lang',lang);
  }
  function detectLang(){
    const saved=localStorage.getItem('lang');
    if(saved)return saved;
    const nav=(navigator.language||navigator.userLanguage||'pt').toLowerCase();
    return nav.startsWith('en')?'en':'pt';
  }
  applyLang(detectLang());
  document.querySelectorAll('.lang-option').forEach(btn=>{
    btn.addEventListener('click',()=>applyLang(btn.dataset.lang));
  });
})();
