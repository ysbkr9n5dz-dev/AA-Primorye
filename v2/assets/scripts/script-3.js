/* ---------- ДАННЫЕ: берутся из content/schedule.json и content/online.json (через content/content.js) ---------- */
const CONTENT=window.AA_CONTENT||{};
const SCHED=CONTENT.schedule||{cities:[],groups:[],addresses:[],meetings:[]};
const ONLINE=(CONTENT.online||[]).filter(o=>!o.hidden);
const CITIES=SCHED.cities.map(c=>c.name);
const DAYS=["","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота","Воскресенье"];
const DSHORT=["","Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const GEN=["",...SCHED.cities.map(c=>c.in||c.name)];
const GROUPS={};
SCHED.groups.filter(g=>!g.hidden).forEach(g=>{GROUPS[g.id]={name:g.name,city:g.city,page:g.page||undefined,map:g.map||undefined,allOpen:!!g.allOpen,tags:g.tags||[],onlineNote:g.onlineNote||""}});
const A={};
SCHED.addresses.forEach(x=>{A[x.id]=[x.address,x.entrance||""]});
// g: группа, d: день (1=Пн), t: время, a: адрес, type: in|online|hybrid, note, link
const M=SCHED.meetings.filter(m=>GROUPS[m.group]).map(m=>{const r={g:m.group,d:+m.day,t:m.time};if(m.address)r.a=m.address;if(m.format&&m.format!=="in")r.type=m.format;if(m.link)r.link=m.link;if(m.platform)r.plat=m.platform;if(m.note)r.note=m.note;return r});
const EVENTS=window.AA_NEWS;
const CAL_EVENTS=EVENTS.flatMap(e=>[...(e.eventDates||[]).map(date=>({...e,eventDate:date})),...(e.relatedEvents||[])]);

/* ---------- ВРЕМЯ ---------- */
const VL_OFFSET=10, MSK_OFFSET=3;               // часы от UTC
const mins=t=>{const[h,m]=t.split(":").map(Number);return h*60+m};
const pad=n=>String(n).padStart(2,"0");
const fmt=m=>pad(Math.floor(((m%1440)+1440)%1440/60))+":"+pad(((m%1440)+1440)%1440%60);
function nowVl(){                                // текущее время во Владивостоке
  const u=new Date(); const x=new Date(u.getTime()+VL_OFFSET*3600e3);
  return {day:x.getUTCDay()||7, min:x.getUTCHours()*60+x.getUTCMinutes()};
}
// онлайн-группы из content/online.json: время хранится в своём поясе (MSK или VL), в расписание — по Владивостоку
const TZ_OFFSET={MSK:3,VL:10};
ONLINE.filter(o=>o.inSchedule).forEach(o=>{
  GROUPS[o.id]={name:o.name,city:"Онлайн",tags:[],allOpen:false};
  const shift=(VL_OFFSET-(TZ_OFFSET[o.tz]??VL_OFFSET))*60;
  (o.times||[]).forEach(x=>x.days.forEach(d=>{
    const v=mins(x.time)+shift;
    M.push({g:o.id,d:((+d-1+Math.floor(v/1440))%7+7)%7+1,t:fmt(v),type:"online",link:o.link,plat:o.platform,note:o.tz==="MSK"?x.time+" по Москве"+(o.access?". "+o.access:""):(o.access||"")});
  }));
});
M.forEach(m=>{m.type=m.type||"in"; m.grp=GROUPS[m.g]; m.city=m.grp.city;});

function until(m,now){                            // минут до ближайшего начала; идущее сейчас (до 60 мин) = отрицательное
  let diff=(m.d-now.day)*1440+mins(m.t)-now.min;
  if(diff<=-60) diff+=7*1440;
  return diff;
}
function human(diff){
  if(diff<=0) return "идёт сейчас";
  if(diff<60) return "через "+diff+" мин";
  const h=Math.floor(diff/60), mm=diff%60;
  if(diff<1440) return "через "+h+" ч"+(mm?" "+mm+" мин":"");
  const dd=Math.floor(diff/1440);
  return dd===1?"завтра":"через "+dd+" дн.";
}
function mapUrl(m){
  if(m.grp.map) return m.grp.map;
  if(!m.a) return null;
  return "https://2gis.ru/search/"+encodeURIComponent(m.city+", "+A[m.a][0].split(",").slice(0,2).join(","));
}

/* ---------- ПЕРВЫЙ ЭКРАН ---------- */
const $=s=>document.querySelector(s);
const state={city:"Владивосток",fCity:"Все",fDay:"Сегодня",scheduleDate:Schedule.today(),fType:"Все"};
try{const s=localStorage.getItem("aa25city"); if(s&&["Все",...CITIES].includes(s)){state.city=s;}}catch(e){}

const citySel=$("#city");
["Все",...CITIES].forEach(c=>citySel.add(new Option(c,c)));
citySel.value=state.city;
citySel.onchange=()=>{state.city=citySel.value;try{localStorage.setItem("aa25city",state.city)}catch(e){};renderNext()};

function renderNext(){
  const now=nowVl();
  $("#next-title").textContent=state.city==="Все"?"Ближайшие собрания в крае":"Ближайшие собрания "+(state.city==="Владивосток"?"во ":"в ")+GEN[CITIES.indexOf(state.city)+1];
  const list=M.filter(m=>state.city==="Все"||m.city===state.city).map(m=>Schedule.next(m,now)).filter(Boolean).sort((a,b)=>a.diff-b.diff).slice(0,3);
  const ul=$("#next-list"); ul.innerHTML="";
  list.forEach(({m,diff,date},i)=>{
    const li=document.createElement("li");
    const b=document.createElement("button"); b.className="next-item"+(i===0?" first":"");
    const dayTxt=date.getTime()===Schedule.today().getTime()?"сегодня":date.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
    b.innerHTML=`${i===0?`<span class="priority-label">${diff<=0?"Собрание идёт сейчас":"Ближайшее собрание"}</span>`:""}<span class="t">${m.t}</span><span><span class="when">${human(diff)}, ${dayTxt}</span><br><span class="gname">${m.grp.name}</span><br><span class="where">${m.type==="online"?"Онлайн, "+m.plat:A[m.a][0]}</span></span>`;
    b.onclick=()=>openGroup(m.g);
    li.append(b); ul.append(li);
  });
  // онлайн: aa24.online каждый чётный час по Москве
  const u=new Date(); let h=(u.getUTCHours()+MSK_OFFSET)%24; let nextMsk=h+1; if(nextMsk%2) nextMsk++;
  const t=new Date(Date.UTC(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate(),u.getUTCHours()+(nextMsk-h),0));
  const loc=t.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Vladivostok"});
  $("#next-online").innerHTML=`<span>Не хотите ждать? Онлайн-собрание <b>в ${loc}</b> по Владивостоку</span><a class="btn online small" href="#online">Онлайн</a>`;
}

/* ---------- РАСПИСАНИЕ ---------- */
function chips(box,items,key){
  const el=$(box);
  items.forEach(v=>{
    const b=document.createElement("button"); b.className="chip"; b.textContent=v; b.type="button";
    b.setAttribute("aria-pressed",state[key]===v);
    b.onclick=()=>{state[key]=v;[...el.querySelectorAll(".chip")].forEach(c=>c.setAttribute("aria-pressed",c.textContent===v));renderDays()};
    el.append(b);
  });
}


chips("#f-type",["Все","Очно","Онлайн"],"fType");

function renderDays(){
  const today=Schedule.today(),now=nowVl(),picked=state.scheduleDate||today;
  const monday=new Date(today.getFullYear(),today.getMonth(),today.getDate()-((today.getDay()+6)%7));
  const week=Array.from({length:7},(_,i)=>new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+i));
  const all=state.fDay==='Вся неделя';
  const days=all?week:[picked];
  const key=date=>[date.getFullYear(),pad(date.getMonth()+1),pad(date.getDate())].join('-');
  const dayLabel=date=>new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(date);
  const strip=$('#f-day');strip.replaceChildren();
  week.forEach(date=>{const btn=document.createElement('button');btn.type='button';btn.dataset.scheduleDate=key(date);btn.setAttribute('aria-label',dayLabel(date));btn.setAttribute('aria-pressed',!all&&key(date)===key(picked));btn.innerHTML=`<span>${DSHORT[date.getDay()||7]}</span><b>${pad(date.getDate())}</b>`;if(key(date)===key(today))btn.setAttribute('aria-current','date');btn.onclick=()=>{state.scheduleDate=date;state.fDay='День';renderDays();document.querySelector(`[data-schedule-date="${key(date)}"]`)?.focus({preventScroll:true})};strip.append(btn)});
  $('#schedule-day-mode').setAttribute('aria-pressed',!all);$('#schedule-week-mode').setAttribute('aria-pressed',all);
  $('#schedule-day-mode').onclick=()=>{state.fDay='День';renderDays()};$('#schedule-week-mode').onclick=()=>{state.fDay='Вся неделя';renderDays()};$('#schedule-today').onclick=()=>{state.scheduleDate=Schedule.today();state.fDay='Сегодня';renderDays()};
  const accepts=m=>!(m.city==='Онлайн'&&state.fType!=='Онлайн')&&(state.fCity==='Все'||m.city===state.fCity||m.city==='Онлайн')&&!(state.fType==='Очно'&&m.type==='online')&&!(state.fType==='Онлайн'&&m.type==='in');
  const groups=days.map(date=>({date,meetings:M.filter(m=>accepts(m)&&Schedule.occurs(m,date)).sort((a,b)=>mins(a.t)-mins(b.t)||a.grp.name.localeCompare(b.grp.name,'ru'))}));
  const n=groups.reduce((sum,g)=>sum+g.meetings.length,0),word=n%10===1&&n%100!==11?'собрание':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'собрания':'собраний';
  $('#count').textContent=`${n} ${word} / ${all?'за выбранную неделю':key(picked)===key(today)?'сегодня':new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(picked)}`;
  const box=$('#days');box.replaceChildren();
  let priority=null;
  groups.forEach(g=>g.meetings.forEach(m=>{const distance=(g.date.getTime()-today.getTime())/86400000*1440+mins(m.t)-now.min;if(distance>-60&&(!priority||distance<priority.distance))priority={m,date:g.date,distance}}));
  if(!n){box.innerHTML='<div class="empty">По выбранным условиям собраний нет. Попробуйте другой день, сбросьте фильтры или посмотрите <a href="#online">онлайн-собрания</a>.</div>';return}
  groups.forEach(({date,meetings})=>{
    if(!meetings.length)return;
    const group=document.createElement('div');group.className='agenda-day planner-sheet';
    const binding=document.createElement('div');binding.className='planner-binding';binding.setAttribute('aria-hidden','true');for(let i=0;i<5;i++)binding.append(document.createElement('span'));
    const header=document.createElement('div');header.className='planner-header';
    const weekday=new Intl.DateTimeFormat('ru-RU',{weekday:'long'}).format(date),monthYear=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(date).replace(/^\d+\s/,'');
    header.innerHTML=`<span class="planner-date" aria-hidden="true">${pad(date.getDate())}</span><div class="planner-title"><span class="planner-eyebrow">Расписание собраний</span><h3>${weekday.replace(/^./,s=>s.toUpperCase())}</h3><p>${monthYear}</p></div><span class="planner-page-note">${meetings.length} ${meetings.length===1?'встреча':meetings.length<5?'встречи':'встреч'}<br>Владивосток / UTC+10</span>`;
    header.querySelector('h3').setAttribute('aria-label',dayLabel(date));group.append(binding,header);
    const list=document.createElement('ul');list.className='agenda-list';
    meetings.forEach(m=>{
      const li=document.createElement('li');li.className='agenda-meeting'+(priority&&priority.m===m&&priority.date===date?' nearest':'');
      const status=Schedule.status(m,date)==='open'?'Открытое':'Закрытое',type=m.type==='online'?'Онлайн':m.type==='hybrid'?'Очно и онлайн':'Очно';
      const address=m.a?A[m.a][0]:m.plat||'Онлайн';const entry=m.a&&A[m.a][1]?A[m.a][1]:'';
      li.innerHTML=`<div class="agenda-time"><span>${m.t}</span><small>до ${fmt(mins(m.t)+60)}</small></div><div class="agenda-info"><button class="agenda-name" type="button">${m.grp.name}</button><p>${state.fCity==='Все'&&m.city!=='Онлайн'?m.city+', ':''}${address}</p>${entry?`<small class="agenda-entry">${entry}</small>`:''}<div class="agenda-meta"><span class="${status==='Открытое'?'is-open':''}" title="${status==='Открытое'?'Может прийти любой: родственник, друг, специалист':'Для всех, кто хочет бросить пить, в том числе впервые'}">${status}</span><span>${type}</span>${(m.grp.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div><small class="status-hint">${status==='Открытое'?'Открытое — может прийти любой: родственник, друг, специалист':'Закрытое — для всех, кто хочет бросить пить, в том числе впервые'}</small></div><div class="agenda-actions"></div>`;
      li.querySelector('.agenda-name').onclick=()=>openGroup(m.g);
      const actions=li.querySelector('.agenda-actions');for(const[label,url]of [['Маршрут',mapUrl(m)],['Подключиться',m.link]]){if(!url)continue;const a=document.createElement('a');a.className='btn line small';a.href=url;a.textContent=label;a.target='_blank';a.rel='noopener';actions.append(a)}list.append(li);
    });group.append(list);box.append(group);
  });
}

/* ---------- ОНЛАЙН ---------- */
function renderOnline(){
  const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
  const toVl=(t,tz)=>{const[h,m]=t.split(":").map(Number);const u=new Date();
    return new Date(Date.UTC(u.getUTCFullYear(),u.getUTCMonth(),u.getUTCDate(),h-(TZ_OFFSET[tz]??VL_OFFSET),m)).toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit",timeZone:"Asia/Vladivostok"})};
  const fill=(text,tz)=>esc(text).replace(/\{(\d{1,2}:\d{2})\}/g,(_,t)=>toVl(t,tz));
  const where=p=>p==="MAX"?"мессенджер MAX":p;
  const card=(title,big,when,whereText,link)=>`<article class="ocard"><h3>${esc(title)}</h3><div class="big">${big}</div>
    <dl><dt>Когда</dt><dd>${when}</dd>
    <dt>Где</dt><dd>${esc(whereText)}</dd></dl>
    ${link?`<a class="btn online small" href="${esc(link)}" target="_blank" rel="noopener">Подключиться</a>`:""}</article>`;
  const cards=ONLINE.map(o=>{
    let big=o.big?fill(o.big,o.tz):"",when=o.when?fill(o.when,o.tz):"";
    if(o.everyHours){const step=o.everyHours,off=TZ_OFFSET[o.tz]??VL_OFFSET,u=new Date();const h=(u.getUTCHours()+off)%24;let n=h+1;while(n%step)n++;
      when=(when?when+"; ":"")+`каждые ${step} часа, ближайшие: `+[0,1,2].map(k=>toVl(pad((n+k*step)%24)+":00",o.tz)).join(", ");if(!big)big="Круглосуточно"}
    if(!big){const times=[...new Set((o.times||[]).map(x=>toVl(x.time,o.tz)))].sort();big=times.join(" и ")}
    return card(o.name,big,when,[where(o.platform),o.access].filter(Boolean).join(", "),o.link)});
  // группы, у которых есть онлайн-собрания (очно и онлайн или только онлайн)
  const seen=new Map();
  M.filter(m=>(m.type==="online"||m.type==="hybrid")&&m.grp.city!=="Онлайн").forEach(m=>{const k=m.g+"|"+m.t+"|"+m.type+"|"+(m.link||"");if(!seen.has(k))seen.set(k,{m,days:[]});seen.get(k).days.push(m.d)});
  [...seen.values()].sort((a,b)=>Math.min(...a.days)-Math.min(...b.days)||mins(a.m.t)-mins(b.m.t)).forEach(({m,days})=>{
    const g=m.grp,title=g.name+(g.city!=="Владивосток"?", "+g.city:"")+((g.tags||[]).includes("женская")?", женская группа":"");
    const dayText=[...new Set(days)].sort().map(d=>DSHORT[d]).join(" и ");
    const when=m.type==="hybrid"?"время владивостокское, одновременно с очным собранием":"время владивостокское"+(g.onlineNote?"; "+esc(g.onlineNote):"");
    cards.push(card(title,dayText+", "+m.t,when,where(m.plat||"онлайн"),m.link));
  });
  $("#ogrid").innerHTML=cards.join("\n");
}

/* ---------- СОБЫТИЯ ---------- */

$("#events-list").innerHTML=EVENTS.map(e=>{const[d,mo,y]=e.d.split(".");const MN=["","янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
  return `<li class="ev"><time datetime="${y}-${mo}-${d}">${+d} ${MN[+mo]}<small>${y} / публикация</small></time><div><a href="${e.u}"${/^https?:/.test(e.u)?' target="_blank" rel="noopener"':''}>${e.t}</a><p>${e.p}</p></div></li>`}).join("");

/* ---------- КАРТОЧКА ГРУППЫ ---------- */
const dlg=$("#dlg");
function openGroup(id){
  const g=GROUPS[id],ms=M.filter(m=>m.g===id).sort((a,b)=>a.d-b.d||mins(a.t)-mins(b.t));
  $('#dlg-name').textContent=g.name;
  $('#dlg-city').textContent=[g.city,...(g.tags||[])].join(' / ');
  const list=$('#dlg-meet');list.replaceChildren();
  const byDay=new Map();ms.forEach(m=>{if(!byDay.has(m.d))byDay.set(m.d,[]);byDay.get(m.d).push(m)});
  byDay.forEach((items,day)=>{
    const row=document.createElement('li'),label=document.createElement('span'),content=document.createElement('div');label.className='group-day';label.textContent=DAYS[day];
    const times=document.createElement('div');times.className='group-times';
    [...new Set(items.map(m=>m.t))].forEach(time=>{const span=document.createElement('span');span.textContent=time+'–'+fmt(mins(time)+60);times.append(span)});
    content.append(times);
    const notes=[...new Set(items.map(m=>m.note).filter(note=>note&&!note.includes('по Москве. ID')))];
    notes.forEach(note=>{const text=document.createElement('small');text.className='group-rule';text.textContent=note;content.append(text)});
    row.append(label,content);list.append(row);
  });
  const how=$('#dlg-how');how.replaceChildren();
  const addresses=[...new Set(ms.filter(m=>m.a).map(m=>m.a))];
  const heading=document.createElement('h4');heading.textContent=addresses.length?'Адрес и как пройти':'Подключение к собраниям';how.append(heading);
  addresses.forEach(key=>{const block=document.createElement('div');block.className='group-location';const address=document.createElement('p');address.textContent=A[key][0];block.append(address);if(A[key][1]){const entry=document.createElement('small');entry.textContent=A[key][1];block.append(entry)}const m=ms.find(m=>m.a===key),url=mapUrl(m);if(url){const a=document.createElement('a');a.textContent='Построить маршрут';a.href=url;a.target='_blank';a.rel='noopener';block.append(a)}how.append(block)});
  const platforms=[...new Set(ms.map(m=>m.plat).filter(Boolean))];
  if(platforms.length){const text=document.createElement('p');text.className='group-platform';text.textContent=platforms.join(' / ');how.append(text)}
  const access=ms.find(m=>m.note&&m.note.includes('по Москве. ID'));
  if(access){const text=document.createElement('p');text.className='group-access';text.textContent=access.note.split('по Москве. ')[1];how.append(text)}
  const actions=$('#dlg-act');actions.replaceChildren();
  const links=[...new Set(ms.map(m=>m.link).filter(Boolean))];
  links.forEach((url,i)=>{const a=document.createElement('a');a.className='btn primary';a.href=url;a.target='_blank';a.rel='noopener';a.textContent=links.length>1?'Подключиться / '+(i+1):'Подключиться онлайн';actions.append(a)});
  if(g.page){const a=document.createElement('a');a.className='btn line';a.href=g.page;a.target='_blank';a.rel='noopener';a.textContent='Страница группы на AA25.ru';actions.append(a)}
  dlg.showModal();
}
$("#dlg-x").onclick=()=>dlg.close();
dlg.addEventListener("click",e=>{if(e.target===dlg) dlg.close()});

renderNext(); renderDays(); renderOnline();
setInterval(()=>{renderNext()},60000);
