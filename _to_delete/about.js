(function(){
  const photos=document.querySelectorAll('.drag-photo');
  if(!photos.length)return;
  let topZ=10;

  photos.forEach(photo=>{
    const rect=photo.getBoundingClientRect();
    let x=rect.left+window.scrollX,y=rect.top+window.scrollY;
    photo.style.left=x+'px';
    photo.style.top=y+'px';
    photo.style.right='auto';
    photo.style.bottom='auto';

    let dragging=false,startX=0,startY=0,origX=0,origY=0;

    photo.addEventListener('pointerdown',e=>{
      dragging=true;
      photo.classList.add('dragging');
      photo.style.zIndex=++topZ;
      photo.setPointerCapture(e.pointerId);
      startX=e.clientX;startY=e.clientY;
      origX=x;origY=y;
    });
    photo.addEventListener('pointermove',e=>{
      if(!dragging)return;
      x=origX+(e.clientX-startX);
      y=origY+(e.clientY-startY);
      photo.style.left=x+'px';
      photo.style.top=y+'px';
    });
    function endDrag(){
      dragging=false;
      photo.classList.remove('dragging');
    }
    photo.addEventListener('pointerup',endDrag);
    photo.addEventListener('pointercancel',endDrag);
  });
})();
