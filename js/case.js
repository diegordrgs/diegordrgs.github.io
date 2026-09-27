(function(){
  const links=document.querySelectorAll('.sidebar-link');
  if(!links.length)return;
  const sectionIds=Array.from(links).map(l=>l.getAttribute('href').replace('#',''));
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(l=>l.classList.remove('active'));
        const l=document.querySelector(`.sidebar-link[href="#${e.target.id}"]`);
        if(l)l.classList.add('active');
      }
    });
  },{rootMargin:'-15% 0px -75% 0px'});
  sectionIds.forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el)});

  links.forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const id=link.getAttribute('href').replace('#','');
      const el=document.getElementById(id);
      if(el)el.scrollIntoView({behavior:'smooth'});
    });
  });
})();

(function(){
  const root=document.querySelector('.hero-carousel');
  if(!root)return;
  const slides=root.querySelectorAll('.hero-slide');
  const dotsWrap=root.querySelector('.carousel-dots');
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DELAY=5000;
  let i=0,timer=null,paused=false;
  const dots=Array.from(slides).map((_,n)=>{
    const d=document.createElement('button');
    d.type='button';d.className='carousel-dot';d.setAttribute('aria-label',`${n+1} / ${slides.length}`);
    d.addEventListener('click',()=>{go(n);restart()});
    dotsWrap.appendChild(d);return d;
  });
  function go(n){
    slides[i].classList.remove('is-active');dots[i].classList.remove('is-active');
    i=(n+slides.length)%slides.length;
    slides[i].classList.add('is-active');dots[i].classList.add('is-active');
  }
  function start(){if(!reduce&&!paused&&!timer&&!document.hidden)timer=setInterval(()=>go(i+1),DELAY)}
  function stop(){clearInterval(timer);timer=null}
  function restart(){stop();start()}
  root.querySelector('.carousel-prev').addEventListener('click',()=>{go(i-1);restart()});
  root.querySelector('.carousel-next').addEventListener('click',()=>{go(i+1);restart()});
  root.addEventListener('mouseenter',()=>{paused=true;stop()});
  root.addEventListener('mouseleave',()=>{paused=false;start()});
  document.addEventListener('visibilitychange',()=>{document.hidden?stop():start()});
  let x0=null;
  root.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
  root.addEventListener('touchend',e=>{
    if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;
    if(Math.abs(dx)>40){go(dx<0?i+1:i-1);restart()}
  });
  go(0);start();
})();
