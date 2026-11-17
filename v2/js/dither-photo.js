/* Dithered photo — redraws the About portrait in color as a grid of ordered-dither
   (Bayer 8×8, per RGB channel) dots on a canvas. Dots spring in on load and are pushed away
   by the cursor, then settle back. Falls back to the plain <img> without JS. */
(function(){
  const wrap=document.querySelector('.about-photo');
  const img=wrap&&wrap.querySelector('img');
  if(!wrap||!img||!window.HTMLCanvasElement)return;

  const CELL=2;          // dot pitch in CSS px
  const DOT=1.6;         // dot size in CSS px
  const RADIUS=50;       // cursor influence radius
  const FORCE=3;         // push strength
  const SPRING=.07, DAMP=.82;
  const LEVELS=5;        // tones per RGB channel
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const B=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,
           3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];

  const canvas=document.createElement('canvas');
  canvas.className='about-photo-dither';
  canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d');

  let W=0,H=0,dpr=1,hx,hy,px,py,vx,vy,n=0,runs=[],paper='#fff';
  let mx=-1e4,my=-1e4,raf=0,crop=null;

  // Visible part of the image, matching the CSS object-fit:cover + scale crop
  function readCrop(){
    const cs=getComputedStyle(img);
    const m=cs.transform.match(/matrix\(([^,]+)/);
    const s=m?parseFloat(m[1]):1;
    const o=cs.transformOrigin.split(' ').map(parseFloat);
    return {s,ox:o[0]/(img.clientWidth||1),oy:o[1]/(img.clientHeight||1)};
  }

  function build(){
    const r=wrap.getBoundingClientRect();
    W=Math.round(r.width);H=Math.round(r.height);
    if(!W||!H||!img.naturalWidth)return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=W*dpr;canvas.height=H*dpr;

    const cols=Math.floor(W/CELL),rows=Math.floor(H/CELL);
    const iw=img.naturalWidth,ih=img.naturalHeight;
    const c=Math.max(W/iw,H/ih),dx=(W-iw*c)/2,dy=(H-ih*c)/2;
    const ox=crop.ox*W,oy=crop.oy*H,s=crop.s;
    const qx0=ox-ox/s,qx1=ox+(W-ox)/s,qy0=oy-oy/s,qy1=oy+(H-oy)/s;

    const off=document.createElement('canvas');
    off.width=cols;off.height=rows;
    const octx=off.getContext('2d',{willReadFrequently:true});
    octx.imageSmoothingQuality='high';
    octx.drawImage(img,(qx0-dx)/c,(qy0-dy)/c,(qx1-qx0)/c,(qy1-qy0)/c,0,0,cols,rows);
    const d=octx.getImageData(0,0,cols,rows).data;

    // Auto-levels on luminance so the dither uses the full tonal range
    const hist=new Uint32Array(256),N=cols*rows;
    for(let i=0;i<N;i++)hist[(.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2])|0]++;
    let lo=0,hi=255,acc=0;
    for(let i=0;i<256;i++){acc+=hist[i];if(acc>N*.02){lo=i;break}}
    acc=0;
    for(let i=255;i>=0;i--){acc+=hist[i];if(acc>N*.02){hi=i;break}}
    const span=Math.max(hi-lo,1);

    // Ordered dither per RGB channel down to LEVELS steps, keeping the photo in color
    const q=v=>Math.min(Math.max((v-lo)/span,0),1)*(LEVELS-1);
    const xs=new Float32Array(N),ys=new Float32Array(N),ci=new Uint16Array(N);
    for(let y=0,i=0;y<rows;y++)for(let x=0;x<cols;x++,i++){
      const t=(B[(y&7)*8+(x&7)]+.5)/64;
      const r=Math.floor(q(d[i*4])+t),g=Math.floor(q(d[i*4+1])+t),b=Math.floor(q(d[i*4+2])+t);
      xs[i]=x*CELL+CELL/2;ys[i]=y*CELL+CELL/2;
      ci[i]=(Math.min(r,LEVELS-1)*LEVELS+Math.min(g,LEVELS-1))*LEVELS+Math.min(b,LEVELS-1);
    }
    // Sort dots by color so each frame only switches fillStyle once per color
    const order=Array.from({length:N},(_,i)=>i).sort((a,b)=>ci[a]-ci[b]);
    n=N;
    hx=new Float32Array(n);hy=new Float32Array(n);
    runs=[];
    for(let k=0;k<n;k++){
      const i=order[k];hx[k]=xs[i];hy[k]=ys[i];
      if(!k||ci[i]!==ci[order[k-1]])runs.push(k,ci[i]);
    }
    runs.push(n,-1);
    vx=new Float32Array(n);vy=new Float32Array(n);
    px=Float32Array.from(hx);py=Float32Array.from(hy);

    paper=getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()||'#f0f0f0';
  }

  function scatter(){
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2,r=40+Math.random()*120;
      px[i]=hx[i]+Math.cos(a)*r;py[i]=hy[i]+Math.sin(a)*r;
    }
  }

  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=paper;ctx.fillRect(0,0,W,H);
    const h=DOT/2,m=255/(LEVELS-1);
    for(let r=0;r<runs.length-2;r+=2){
      const c=runs[r+1],L2=LEVELS*LEVELS;
      ctx.fillStyle=`rgb(${(c/L2|0)*m},${((c/LEVELS|0)%LEVELS)*m},${(c%LEVELS)*m})`;
      for(let i=runs[r];i<runs[r+2];i++)ctx.fillRect(px[i]-h,py[i]-h,DOT,DOT);
    }
  }

  function step(){
    raf=0;
    let moving=false;
    const r2=RADIUS*RADIUS;
    for(let i=0;i<n;i++){
      const ddx=px[i]-mx,ddy=py[i]-my,dist2=ddx*ddx+ddy*ddy;
      if(dist2<r2){
        const dist=Math.sqrt(dist2)||1,f=(1-dist/RADIUS)*FORCE;
        vx[i]+=ddx/dist*f;vy[i]+=ddy/dist*f;
      }
      vx[i]=(vx[i]+(hx[i]-px[i])*SPRING)*DAMP;
      vy[i]=(vy[i]+(hy[i]-py[i])*SPRING)*DAMP;
      px[i]+=vx[i];py[i]+=vy[i];
      if(!moving&&(Math.abs(vx[i])>.02||Math.abs(vy[i])>.02||Math.abs(hx[i]-px[i])>.1||Math.abs(hy[i]-py[i])>.1))moving=true;
    }
    draw();
    if(moving||mx>-1e4)kick();
  }
  function kick(){if(!reduce&&!raf)raf=requestAnimationFrame(step)}

  function rebuild(intro){
    build();
    if(!n)return;
    if(intro&&!reduce){scatter();kick()}else draw();
  }

  function start(){
    crop=readCrop();
    wrap.appendChild(canvas);
    wrap.classList.add('is-dithered');
    rebuild(true);

    if(!reduce){
      wrap.addEventListener('pointermove',e=>{
        const r=canvas.getBoundingClientRect();
        mx=e.clientX-r.left;my=e.clientY-r.top;kick();
      });
      wrap.addEventListener('pointerleave',()=>{mx=my=-1e4});
      wrap.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')mx=my=-1e4});
    }

    let t=0,lastW=W;
    new ResizeObserver(()=>{
      clearTimeout(t);
      t=setTimeout(()=>{
        const w=Math.round(wrap.getBoundingClientRect().width);
        if(w!==lastW){lastW=w;rebuild(false)}
      },120);
    }).observe(wrap);
    new MutationObserver(()=>rebuild(false))
      .observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }

  if(img.complete&&img.naturalWidth)start();
  else img.addEventListener('load',start,{once:true});
})();
