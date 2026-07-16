function trackWord(id,fid){
  const w=document.getElementById(id),f=document.getElementById(fid);
  if(!w||!f)return;
  w.addEventListener('mouseenter',()=>f.classList.add('vis'));
  w.addEventListener('mouseleave',()=>f.classList.remove('vis'));
  w.addEventListener('mousemove',e=>{f.style.left=(e.clientX+20)+'px';f.style.top=(e.clientY-95)+'px'});
}
trackWord('hw1','float1');trackWord('hw2','float2');

const canvas=document.getElementById('gifCanvas');
if(canvas){
  const ctx=canvas.getContext('2d');
  function resize(){const r=canvas.parentElement.getBoundingClientRect();canvas.width=r.width;canvas.height=r.height}
  resize();window.addEventListener('resize',resize);
  let frame=0;
  const screensByLang={
    pt:[
      {label:'Descoberta',bg:'#f0f4ff',accent:'#2A5BD7',items:['Entrevistas','Pontos de dor','Hipótese']},
      {label:'Wireframes',bg:'#f5f0ff',accent:'#7c3aed',items:['Esboços','Fluxo de usuário','Mapa de IA']},
      {label:'Protótipo',bg:'#f0fdf4',accent:'#059669',items:['Mock interativo','Testes','Iterações']},
    ],
    en:[
      {label:'Discovery',bg:'#f0f4ff',accent:'#2A5BD7',items:['User interviews','Pain points','Hypothesis']},
      {label:'Wireframes',bg:'#f5f0ff',accent:'#7c3aed',items:['Low-fi sketches','User flow','IA map']},
      {label:'Prototype',bg:'#f0fdf4',accent:'#059669',items:['Interactive mock','Test sessions','Iterations']},
    ],
  };
  let screens=screensByLang[document.documentElement.lang]||screensByLang.pt;
  window.onLangChange=lang=>{screens=screensByLang[lang]||screensByLang.pt};
  function draw(){
    const si=Math.floor(frame/60)%3,lf=frame%60,p=lf/60;
    const s=screens[si],w=canvas.width,h=canvas.height,pad=22;
    ctx.fillStyle=s.bg;ctx.fillRect(0,0,w,h);
    ctx.fillStyle=s.accent;ctx.globalAlpha=.08;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
    ctx.fillStyle=s.accent;ctx.font=`600 ${Math.min(w*.052,15)}px 'Cabinet Grotesk',sans-serif`;ctx.fillText(s.label,pad,pad+16);
    ctx.fillStyle='#00000012';ctx.fillRect(pad,pad+26,w-pad*2,3);
    ctx.fillStyle=s.accent;ctx.fillRect(pad,pad+26,(w-pad*2)*Math.min(p*1.2,1),3);
    const ih=(h-pad*2-46)/3;
    s.items.forEach((it,i)=>{
      const y=pad+42+i*ih,ap=Math.min(1,(p*3-i*.9));
      if(ap<=0)return;
      ctx.globalAlpha=ap;
      ctx.fillStyle=s.accent+'18';ctx.beginPath();ctx.roundRect(pad,y,w-pad*2,ih-8,6);ctx.fill();
      ctx.fillStyle=s.accent;ctx.beginPath();ctx.arc(pad+11,y+(ih-8)/2,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#333';ctx.font=`300 ${Math.min(w*.035,12)}px 'Cabinet Grotesk',sans-serif`;
      ctx.fillText(it,pad+22,y+(ih-8)/2+4);ctx.globalAlpha=1;
    });
    frame=(frame+1)%180;requestAnimationFrame(draw);
  }
  draw();
}
