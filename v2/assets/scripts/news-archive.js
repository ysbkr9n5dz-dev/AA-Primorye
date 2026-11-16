(()=>{
 const list=document.getElementById('news-archive-list');if(!list||!window.AA_NEWS)return;
 const parse=v=>{const[d,m,y]=v.split('.').map(Number);return new Date(y,m-1,d)};
 const fmt=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'});
 const label=e=>{if(!e.eventEnd)return fmt.format(parse(e.eventDate));const a=parse(e.eventDate),b=parse(e.eventEnd);return a.getMonth()===b.getMonth()?`${a.getDate()}–${fmt.format(b)}`:`${fmt.format(a).replace(/ \d{4}.*$/,'')} – ${fmt.format(b)}`};
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
 const items=window.AA_NEWS.filter(e=>e.eventDate).sort((a,b)=>parse(b.eventDate)-parse(a.eventDate));
 items.forEach(e=>{
   const card=el('article','news-card'+(e.img?' has-photo':''));
   if(e.img){const f=el('figure','news-card-photo');const im=document.createElement('img');im.src=e.img;im.alt=e.imgAlt||'';im.loading='lazy';im.decoding='async';f.append(im);card.append(f)}
   const body=el('div','news-card-body');
   const t=el('time','news-card-date',label(e));t.dateTime=e.eventDate.split('.').reverse().join('-');
   body.append(t,el('h4','news-card-title',e.t),el('p','news-card-text',e.p));
   if(e.body){const d=el('details','news-card-more');d.append(el('summary','','Читать полностью'));e.body.forEach(x=>d.append(el('p','',x)));if(e.source)d.append(el('p','news-card-source','Источник: '+e.source));body.append(d)}
   else if(/^https?:/.test(e.u)){const a=el('a','news-card-link','Материал на AA25.ru');a.href=e.u;a.target='_blank';a.rel='noopener';body.append(a)}
   card.append(body);list.append(card);
 });
})();
