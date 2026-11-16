(()=>{
 const paper=document.querySelector('.aa-newspaper');if(!paper)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(matchMedia('(hover:hover) and (pointer:fine)').matches){
   let raf=0;
   paper.addEventListener('pointermove',e=>{if(reduced.matches||raf)return;raf=requestAnimationFrame(()=>{raf=0;const r=paper.getBoundingClientRect();paper.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%');paper.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%')})});
   paper.addEventListener('pointerleave',()=>{paper.style.removeProperty('--mx');paper.style.removeProperty('--my')});
 }
 if('IntersectionObserver' in window){
   const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;paper.classList.remove('is-lit');void paper.offsetWidth;paper.classList.add('is-lit')}),{threshold:.25});
   io.observe(paper);
 }
})();
