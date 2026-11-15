(()=>{
 const icons={home:'<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',schedule:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h3m3 0h3"/>',online:'<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M1 21h22"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m4 4h2m3 0h2m3 0h2"/>',left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m10 5 7 7-7 7"/>'};
 const svg=name=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
 document.querySelectorAll('.mobile-nav a').forEach(a=>{a.querySelector('span').innerHTML=svg(a.hash.slice(1))});
 for(const[id,name]of [['cal-prev','left'],['cal-next','right'],['reading-prev','left'],['reading-next','right']])document.getElementById(id).innerHTML=svg(name);
 document.querySelector('#cal-grid').addEventListener('keydown',e=>{const button=e.target.closest('[data-date]');if(!button)return;const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7};if(!(e.key in offsets))return;e.preventDefault();const buttons=[...document.querySelectorAll('#cal-grid [data-date]')],i=buttons.indexOf(button),next=buttons[i+offsets[e.key]];if(next)next.focus()});
 document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();document.getElementById('main-content')?.focus()});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const welcome=document.querySelector('#newcomer'),door=welcome.querySelector('.door-scene');
 function welcomeDoor(){door.classList.toggle('is-arriving',!welcome.hidden&&!reduced.matches)}
 new MutationObserver(welcomeDoor).observe(welcome,{attributes:true,attributeFilter:['hidden']});
 reduced.addEventListener('change',welcomeDoor);
 welcomeDoor();
 if('IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     observer.unobserve(entry.target);
     if(!reduced.matches)entry.target.animate([{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
   }),{threshold:.12});
   document.querySelectorAll('#daily .reading-controls,#home-events .event-feature,#home-events .event-rail,.about-grid article,.about-more').forEach(el=>observer.observe(el));
 }
 const dialog=document.querySelector('#dlg');
 const dialogObserver=new MutationObserver(()=>{if(dialog.open&&!reduced.matches){dialog.getAnimations().forEach(a=>a.cancel());dialog.animate([{opacity:.4,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});}});
 dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
 reduced.addEventListener('change',event=>{if(event.matches)document.getAnimations().forEach(a=>a.cancel())});
})();
