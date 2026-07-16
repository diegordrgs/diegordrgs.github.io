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
