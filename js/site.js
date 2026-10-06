(function(){
  const dot=document.getElementById('dot'),ring=document.getElementById('ring');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
  (function anim(){rx+=(mx-rx)*.1;ry+=(my-ry)*.1;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(anim)})();
  document.querySelectorAll('a,button,.pf-thumb,.hw,.fun-item,.theme-toggle,.lang-option').forEach(el=>{
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

(function(){
  // Hand-drawn scribble under links: a fresh, slightly different stroke is drawn on every hover
  const NS='http://www.w3.org/2000/svg';
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const QUICK='.pf-nav-link,.pf-foot-links a';
  const targets=document.querySelectorAll(QUICK+',.scribble-link,.pf-foot-email');
  const j=n=>(Math.random()-.5)*n;
  function shape(w){
    const x0=4+j(4),x1=w-4+j(4);
    return `M${x0},${3+j(2)} C${w*.3},${1+j(2)} ${w*.65},${5+j(2)} ${x1},${2+j(2)}`+
      ` Q${w*.55},${7+j(2)} ${w*.12+j(6)},${11+j(2)}`+
      ` Q${w*.45},${9+j(2)} ${w*.78+j(w*.1)},${13+j(2)}`;
  }
  // Short links (menu, footer) get one of a few quick, simple strokes
  const marks=[
    w=>`M${2+j(2)},${5+j(1.5)} Q${w*.45},${8+j(1.5)} ${w-2+j(2)},${1+j(1.5)}`, // swoosh
    w=>{const c=w*(.55+j(.1));return `M2,${6+j(1)} C${w*.3},${9+j(1)} ${c-6},${8} ${c},${3} C${c+4},${-2} ${c-5},${-2} ${c-2},${4} C${c+1},${9} ${w*.8},${8} ${w-2},${3+j(1)}`}, // loop
    w=>`M${4+j(2)},${0+j(1)} Q${1+j(1)},${8} ${w*.2},${7+j(1)} Q${w*.6},${5+j(1)} ${w-3+j(2)},${7+j(1)}`, // hook
    w=>{const n=Math.max(3,Math.round(w/14)),step=(w-4)/n;let d=`M2,4`;for(let i=0;i<n;i++)d+=` Q${2+step*(i+.5)},${i%2?0:9} ${2+step*(i+1)},4`;return d} // wave
  ];
  let lastMark=-1;
  function quickMark(w){
    let i;do{i=Math.floor(Math.random()*marks.length)}while(i===lastMark);
    lastMark=i;return marks[i](w);
  }
  targets.forEach(link=>{
    link.classList.add('scribble-link');
    const host=link.querySelector('.scribble-host')||link;
    const svg=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');
    svg.setAttribute('class','scribble');svg.setAttribute('aria-hidden','true');
    svg.appendChild(path);
    let anim;
    link.addEventListener('mouseenter',()=>{
      if(!svg.isConnected)host.appendChild(svg);
      const simple=link.matches(QUICK);
      path.setAttribute('d',(simple?quickMark:shape)(svg.getBoundingClientRect().width));
      const len=path.getTotalLength();
      if(anim)anim.cancel();
      path.style.strokeDasharray=len;
      anim=path.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:reduce?0:simple?Math.min(280,120+len*.9):Math.min(380,180+len*.6),easing:'cubic-bezier(.6,.05,.3,1)',fill:'forwards'});
    });
    link.addEventListener('mouseleave',()=>{
      if(!anim)return;
      const len=path.getTotalLength();
      anim.cancel();
      anim=path.animate([{strokeDashoffset:0},{strokeDashoffset:-len}],{duration:reduce?0:160,easing:'cubic-bezier(.5,0,.75,0)',fill:'forwards'});
    });
  });
})();
