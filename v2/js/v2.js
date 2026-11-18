(function(){
  var root=document.documentElement;
  var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

  /* ── Scramble text ── */
  var GLYPHS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
  function esc(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c}
  function scramble(el,opts){
    opts=opts||{};
    var final=el.dataset.final!==undefined?el.dataset.final:el.textContent;
    el.dataset.final=final;
    if(el._raf)cancelAnimationFrame(el._raf);
    var speed=opts.speed||1.6,start=null,len=final.length,stagger=opts.stagger||28;
    function frame(t){
      if(!start)start=t;
      var e=t-start,out='',done=true;
      for(var i=0;i<len;i++){
        var ch=final[i],reveal=i*stagger/speed+(opts.delay||0)+180;
        if(ch===' '||ch==='\n'||e>=reveal){out+=esc(ch)}
        else{done=false;
          if(e<reveal-260&&!opts.full){out+=' '}
          else{out+='<span class="scr'+(Math.random()<.4?' alt':'')+'">'+GLYPHS[(Math.random()*GLYPHS.length)|0]+'</span>'}
        }
      }
      el.innerHTML=out;
      if(!done)el._raf=requestAnimationFrame(frame);else{el.textContent=final;el._raf=null}
    }
    el._raf=requestAnimationFrame(frame);
  }
  window.v2Scramble=scramble;
  function runIntro(){
    document.querySelectorAll('[data-scramble]').forEach(function(el,i){
      delete el.dataset.final;
      scramble(el,{delay:i*140,full:el.hasAttribute('data-scramble-full')});
    });
  }
  document.querySelectorAll('[data-scramble-hover]').forEach(function(el){
    el.addEventListener('mouseenter',function(){delete el.dataset.final;scramble(el,{full:true,stagger:22})});
  });

  /* ── Language ── */
  function applyLang(lang){
    root.lang=lang==='en'?'en':'pt-BR';
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(el.dataset.pt===undefined)el.dataset.pt=el.innerHTML;
      el.innerHTML=lang==='en'?el.dataset.en:el.dataset.pt;
      delete el.dataset.final;
    });
    var t=document.querySelector('title[data-en]');
    if(t){if(t.dataset.pt===undefined)t.dataset.pt=t.textContent;t.textContent=lang==='en'?t.dataset.en:t.dataset.pt}
    var lb=document.getElementById('langBtn');
    if(lb)lb.textContent=lang==='en'?'EN[PT]':'PT[EN]';
    store.set('lang',lang);
  }
  var lang=store.get('lang')==='en'?'en':'pt';
  applyLang(lang);
  var langBtn=document.getElementById('langBtn');
  if(langBtn)langBtn.addEventListener('click',function(){lang=lang==='en'?'pt':'en';applyLang(lang);runIntro()});

  /* ── Theme: A (auto) → L → D ── */
  var modes=['auto','light','dark'],labels={auto:'A',light:'L',dark:'D'};
  var mode=store.get('theme');if(modes.indexOf(mode)<0)mode='auto';
  function applyTheme(){
    if(mode==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',mode);
    var b=document.getElementById('themeBtn');if(b)b.textContent=(lang==='en'?'THEME':'TEMA')+'['+labels[mode]+']';
  }
  applyTheme();
  var themeBtn=document.getElementById('themeBtn');
  if(themeBtn)themeBtn.addEventListener('click',function(){mode=modes[(modes.indexOf(mode)+1)%3];store.set('theme',mode);applyTheme()});
  if(langBtn)langBtn.addEventListener('click',applyTheme);

  /* ── Grid crosshairs ── */
  function plus(){
    document.querySelectorAll('.frame-plus').forEach(function(n){n.remove()});
    if(innerWidth<=720)return;
    var pad=parseFloat(getComputedStyle(root).getPropertyValue('--pad'))||56;
    var w=innerWidth-pad*2;
    [1/3,2/3].forEach(function(r){
      for(var c=0;c<4;c++){var s=document.createElement('i');s.className='frame-plus';s.style.left=(pad+w*c/3)+'px';s.style.top=(r*100)+'%';document.body.appendChild(s)}
    });
  }
  plus();addEventListener('resize',plus);

  /* ── Clock + cursor coords ── */
  var clock=document.getElementById('clock'),coords=document.getElementById('coords');
  function tick(){
    if(!clock)return;
    var s=new Date().toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit'});
    clock.textContent='GMT-3 SP '+s;
  }
  tick();setInterval(tick,15000);
  function pad4(n){n=Math.max(0,Math.round(n));return ('0000'+n).slice(-4)}
  if(coords)addEventListener('mousemove',function(e){coords.textContent=pad4(e.clientX)+' X '+pad4(e.clientY)+' Y'});

  /* ── Hero flower parallax ── */
  var flower=document.querySelector('.hero-flower');
  if(flower&&matchMedia('(pointer:fine)').matches){
    addEventListener('mousemove',function(e){
      var x=(e.clientX/innerWidth-.5)*30,y=(e.clientY/innerHeight-.5)*30;
      flower.style.transform='translate(calc(-50% + '+x+'px),calc(-50% + '+y+'px))';
    });
  }

  /* ── Reveal on scroll ── */
  var rv=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);
      en.target.querySelectorAll('[data-scramble-view]').forEach(function(s){delete s.dataset.final;scramble(s,{full:true})})}})},{threshold:.15});
    rv.forEach(function(el){io.observe(el)});
  }else rv.forEach(function(el){el.classList.add('in')});

  /* ── Warp lines (outro) ── */
  var cv=document.getElementById('warp');
  if(cv){
    var ctx=cv.getContext('2d'),W,H,stars=[],running=false,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    var cols=['#4D74FF','#0038FF','#7AA2FF','#D4FF3A','#9AE6FF','#6E5BFF'];
    function size(){var d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
    function mk(){return{x:(Math.random()-.5)*W,y:(Math.random()-.5)*H,z:Math.random()*W,pz:0,c:cols[(Math.random()*cols.length)|0]}}
    size();for(var i=0;i<260;i++){var s=mk();s.pz=s.z;stars.push(s)}
    addEventListener('resize',size);
    function draw(){
      ctx.fillStyle='rgba(5,5,6,.35)';ctx.fillRect(0,0,W,H);
      ctx.lineCap='round';
      stars.forEach(function(s){
        s.pz=s.z;s.z-=reduced?0:9;
        if(s.z<1){Object.assign(s,mk());s.z=W;s.pz=W}
        var k=W*.5,sx=s.x/s.z*k+W/2,sy=s.y/s.z*k+H/2,px=s.x/s.pz*k+W/2,py=s.y/s.pz*k+H/2;
        ctx.strokeStyle=s.c;ctx.lineWidth=Math.max(.6,(1-s.z/W)*3.2);
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke();
      });
      if(running)requestAnimationFrame(draw);
    }
    new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!running){running=true;draw()}else if(!v)running=false},{threshold:0}).observe(cv);
  }

  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(runIntro);else runIntro();
})();
