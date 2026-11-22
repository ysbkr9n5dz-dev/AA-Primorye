(()=>{
 const input=document.querySelector('#reading-date'),body=document.querySelector('#reading-body'),status=document.querySelector('#reading-status'),source=document.querySelector('#reading-source');
 const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Vladivostok'}).format(new Date());
 let lastToday=today(),request=0;input.value=lastToday;input.max=lastToday;
 const cache=new Map();
 let archive={};
 archive=((window.AA_CONTENT||{}).readings)||{};
 const quotePage=document.querySelector('.reading-quote'),wide=matchMedia('(min-width:821px)');
 function arrangePages(){
   const quote=quotePage.querySelector('blockquote');
   if(quote){const heading=body.querySelector('h3,h2');if(heading)heading.after(quote);else body.prepend(quote)}
 }

 function safeContent(html){const doc=new DOMParser().parseFromString(html,'text/html'),fragment=document.createDocumentFragment();const allowed=new Set(['P','H1','H2','H3','BLOCKQUOTE','STRONG','EM','BR','CITE','UL','LI']);function copy(node,parent){if(node.nodeType===3){parent.append(document.createTextNode(node.textContent));return}if(node.nodeType!==1||['SCRIPT','STYLE','IFRAME','IMG','FORM'].includes(node.tagName))return;let target=allowed.has(node.tagName)?document.createElement(node.tagName==='H1'?'h3':node.tagName.toLowerCase()):document.createDocumentFragment();for(const child of node.childNodes)copy(child,target);parent.append(target)}for(const child of doc.body.childNodes)copy(child,fragment);return fragment}
 let displayed=null,turning=false,fetchController=null;
 function controls(locked){input.disabled=locked;document.querySelector('#reading-prev').disabled=locked;document.querySelector('#reading-today').disabled=locked;document.querySelector('#reading-next').disabled=locked||input.value>=today();}
 async function update(){
   if(turning)return;
   const value=input.value,id=++request;
   if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||value>today())return;
   const[y,m,d]=value.split('-').map(Number),months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
   const label=`${d} ${months[m-1]} ${y}`;
   status.textContent=label+' / Загрузка размышления…';body.setAttribute('aria-busy','true');controls(false);
   if(fetchController)fetchController.abort();
   const controller=new AbortController();fetchController=controller;
   try{
     let post=cache.get(value)||archive[value.slice(5)];
     if(!post)throw Error('no-reading');
     if(id!==request)return;
     const fragment=safeContent(post.content.rendered);
     const commit=()=>{
       quotePage.replaceChildren();body.replaceChildren(fragment);arrangePages();
       document.querySelector('#reading-day-number').textContent=String(d).padStart(2,'0');document.querySelector('#reading-month-name').textContent=months[m-1];document.querySelector('#reading-year-number').textContent=y;
       source.href=post.link;status.textContent=label;
     };
     (window.BookAnim?window.BookAnim.turn(commit,displayed?(value>displayed?1:-1):0):commit());
     displayed=value;
   }catch(e){
     if(id!==request)return;
     status.textContent=`Не удалось загрузить размышление за ${label}.${displayed?' Предыдущий текст сохранён.':''}`;
     if(!displayed){const p=document.createElement('p');p.textContent='Текст временно недоступен. Попробуйте загрузить его снова.';body.replaceChildren(p)}
     const retry=document.createElement('button');retry.className='btn line small';retry.textContent='Повторить загрузку';retry.onclick=update;status.append(' ',retry);
   }finally{if(id===request){turning=false;body.setAttribute('aria-busy','false');controls(false);fetchController=null}}
 }
 function shift(n){const[y,m,d]=input.value.split('-').map(Number),date=new Date(y,m-1,d+n);input.value=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');update()}
 input.onchange=update;document.querySelector('#reading-prev').onclick=()=>shift(-1);document.querySelector('#reading-next').onclick=()=>shift(1);document.querySelector('#reading-today').onclick=()=>{input.value=today();update()};setInterval(()=>{const now=today();if(now!==lastToday){input.max=now;if(input.value===lastToday){input.value=now;update()}lastToday=now}},60000);update();
})();
