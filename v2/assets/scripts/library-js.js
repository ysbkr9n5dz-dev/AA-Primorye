(()=>{
 const menu=document.getElementById('site-menu'),trigger=document.getElementById('nav-more');
 const books={bigbook:'Анонимные Алкоголики',steps:'12 шагов и 12 традиций',living:'Жить трезвыми',digest:'Дайджест журнала АА России'};
 const frameNav=url=>{const f=document.getElementById('reader-frame');try{f.contentWindow.location.replace(url==='about:blank'?url:new URL(url,location.href).href)}catch(e){f.src=url}f.dataset.src=url};
 function reader(key){if(!books[key])key='bigbook';const path='library-files/'+key+'.pdf';document.querySelector('#reader h2').textContent=books[key];document.getElementById('reader-frame').title='Читать: '+books[key];frameNav('library-files/reader.html?file='+key+'.pdf&title='+encodeURIComponent(books[key]));document.getElementById('reader-download').href=path;document.getElementById('reader-original').href=path;try{sessionStorage.setItem('aa-reading-book',key)}catch(e){}}
 document.querySelectorAll('[data-read]').forEach(link=>link.addEventListener('click',()=>reader(link.dataset.read)));
 trigger.addEventListener('click',()=>{menu.showModal();trigger.setAttribute('aria-expanded','true')});
 document.getElementById('menu-close').addEventListener('click',()=>menu.close());
 menu.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false')});
 menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientY<r.top||e.clientX<r.left||e.clientX>r.right)menu.close()}});
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>menu.close()));
 function sync(){const route=location.hash.slice(1)||'home';trigger.classList.toggle('active',['library','journals','reader','calendar','events','newcomer','phones'].includes(route));menu.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+route)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(route!=='reader'){if((document.getElementById('reader-frame').dataset.src||'about:blank')!=='about:blank')frameNav('about:blank')}else if((document.getElementById('reader-frame').dataset.src||'about:blank')==='about:blank'){let key;try{key=sessionStorage.getItem('aa-reading-book')}catch(e){}reader(key)}}
 window.addEventListener('hashchange',sync);sync();
})();
