(() => {
  const pageIds=['home','daily','home-events','schedule','online','newcomer','about','calendar','phones','events','library','reader'];
  const routes={home:['home','daily','home-events'],schedule:['schedule'],online:['online'],newcomer:['newcomer'],about:['about'],calendar:['calendar'],phones:['phones'],events:['events'],library:['library'],journals:['library'],reader:['reader'],speakers:[]};
  const dateVl=()=>new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Vladivostok'}));
  let cursor=dateVl(); cursor=new Date(cursor.getFullYear(),cursor.getMonth(),1); let selected=null;
  function paintRoute(){
    let id=location.hash.slice(1)||'home'; if(id==='top') id='home'; if(!routes[id]) id='home';
    pageIds.forEach(key=>{let el=document.getElementById(key);if(el)el.hidden=!routes[id].includes(key)});
    const speakers=document.getElementById('speakers');
    speakers.toggleAttribute('collapsed',id!=='speakers');
    if(id==='speakers')speakers.focus({preventScroll:true});
    document.querySelectorAll('.committee').forEach(el=>el.hidden=true);
    document.querySelectorAll('.main a,.mobile-nav a').forEach(a=>{let active=a.getAttribute('href')==='#'+id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    if(id==='calendar')renderCalendar();
    window.scrollTo({top:0,behavior:'instant'});
    const heading=document.querySelector('#'+id+' h1, #'+id+' h2');if(heading){heading.id='main-content';heading.tabIndex=-1;heading.focus({preventScroll:true})}
    document.querySelectorAll('main h1,main h2').forEach(h=>{if(h!==heading&&h.id==='main-content')h.removeAttribute('id')});
    if(id==='journals')document.getElementById('journals').scrollIntoView({block:'start',behavior:'instant'});
  }
  let firstRoute=true,transition=null;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function route(){
    if(transition){transition.skipTransition();transition=null;}
    if(firstRoute||motion.matches){firstRoute=false;paintRoute();return;}
    if(document.startViewTransition){
      transition=document.startViewTransition(()=>paintRoute());
      const current=transition;
      current.finished.catch(()=>{}).finally(()=>{if(transition===current)transition=null});
    }else{
      paintRoute();const main=document.querySelector('main');
      main.getAnimations().forEach(a=>a.cancel());
      main.animate([{opacity:.25,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.22,1,.36,1)'});
    }
  }
  const meetingStatus=Schedule.status;
  function renderCalendar(monthDirection=0){
    const __snap=window.CalAnim?window.CalAnim.before(monthDirection):null;
    const title=document.querySelector('#cal-title'),grid=document.querySelector('#cal-grid'),result=document.querySelector('#cal-results');
    title.textContent=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(cursor);grid.innerHTML='';
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(day=>{let x=document.createElement('div');x.className='weekday';x.textContent=day;grid.append(x)});
    const start=(cursor.getDay()+6)%7;for(let i=0;i<start;i++)grid.append(document.createElement('div'));
    const count=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate();
    for(let d=1;d<=count;d++){
      let date=new Date(cursor.getFullYear(),cursor.getMonth(),d),key=[String(d).padStart(2,'0'),String(cursor.getMonth()+1).padStart(2,'0'),cursor.getFullYear()].join('.'),ev=CAL_EVENTS.filter(e=>e.eventDate===key);
      let btn=document.createElement('button');btn.type='button';btn.textContent=d;btn.setAttribute('aria-label',`${key}: ${ev.length?'событий '+ev.length:'событий нет'}`);btn.setAttribute('aria-pressed',selected===key);if(date.toDateString()===Schedule.today().toDateString())btn.setAttribute('aria-current','date');let dots=document.createElement('span');dots.className='cal-dots';dots.setAttribute('aria-hidden','true');
      [ev.length?'event':''].filter(Boolean).forEach(type=>{let dot=document.createElement('i');dot.className=type;dot.textContent=type==='event'?'◆':type==='open'?'○':'●';dots.append(dot)});btn.dataset.date=key;btn.append(dots);btn.onclick=()=>{selected=key;renderCalendar();document.querySelector(`[data-date="${key}"]`)?.focus({preventScroll:true})};grid.append(btn);
    }
    if(window.CalAnim){window.CalAnim.after(__snap,monthDirection)}else if(monthDirection&&!motion.matches){const panel=document.querySelector('.calendar-month-panel');panel.getAnimations().forEach(animation=>animation.cancel());panel.animate([{opacity:.25,transform:`translateY(${monthDirection*7}px)`},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'})}
    const monthEvents=document.querySelector('#cal-month-events');monthEvents.replaceChildren();
    const monthHeading=document.createElement('h3');monthHeading.textContent='События месяца';monthEvents.append(monthHeading);
    const inMonth=CAL_EVENTS.filter(e=>{if(!e.eventDate)return false;const[d,m,y]=e.eventDate.split('.').map(Number);return m===cursor.getMonth()+1&&y===cursor.getFullYear()});
    if(!inMonth.length){const text=document.createElement('p');text.className='data-note';text.textContent='В этом месяце событий в загруженном архиве нет.';monthEvents.append(text)}
    inMonth.forEach(e=>{const button=document.createElement('button');button.type='button';button.className='month-event-button';button.textContent=e.eventDate+' — '+e.t;button.setAttribute('aria-pressed',selected===e.eventDate);button.onclick=()=>{selected=e.eventDate;renderCalendar()};monthEvents.append(button)});
    result.className='calendar-results';result.replaceChildren();let heading=document.createElement('h3');heading.textContent=selected?`События — ${selected}`:'Выберите дату';result.append(heading);if(!selected)return;
    const found=CAL_EVENTS.filter(e=>e.eventDate===selected);found.forEach(e=>{let a=document.createElement('a');a.className='cal-event';a.href=e.u;if(/^https?:/.test(e.u)){a.target='_blank';a.rel='noopener'}a.textContent='Событие содружества: '+e.t;result.insertBefore(a,result.children[1]||null)});
    if(!found.length){let p=document.createElement('p');p.textContent='На эту дату событий в загруженном архиве нет.';result.append(p)}
  }
  function syncCity(city){
    if(!['Все',...CITIES].includes(city))return;
    state.city=city;state.fCity=city;citySel.value=city;document.querySelector('#calendar-city').value=city;
    document.querySelector('#schedule-city').value=city;
    try{localStorage.setItem('aa25city',city)}catch(e){}
    renderNext();renderDays();renderCalendar();
  }
  citySel.onchange=()=>syncCity(citySel.value);
  document.querySelector('#schedule-city').onchange=()=>syncCity(document.querySelector('#schedule-city').value);
  function renderNews(){
    const container=document.querySelector('#home-event-list');container.replaceChildren();container.className='events-editorial';
    const now=Schedule.today(),parse=value=>{const[d,m,y]=value.split('.').map(Number);return new Date(y,m-1,d)};
    const future=EVENTS.filter(e=>e.eventDate&&parse(e.eventEnd||e.eventDate)>=now).sort((a,b)=>parse(a.eventDate)-parse(b.eventDate));
    const past=EVENTS.filter(e=>e.eventDate&&parse(e.eventEnd||e.eventDate)<now).sort((a,b)=>parse(b.eventDate)-parse(a.eventDate));
    const featured=future[0]||past[0];
    const dateLabel=e=>e.eventEnd?`${e.eventDate.slice(0,2)}–${e.eventEnd.slice(0,2)} ${new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).formatToParts(parse(e.eventDate)).find(p=>p.type==='month').value} ${e.eventDate.slice(-4)}`:new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(parse(e.eventDate));
    const make=(tag,className,text)=>{const el=document.createElement(tag);el.className=className;if(text)el.textContent=text;return el};
    const sourceLink=(e,label)=>{const a=make('a','event-source',label);a.href=e.u;if(/^https?:/.test(e.u)){a.target='_blank';a.rel='noopener'}return a};
    if(featured){const feature=make('article','event-feature');feature.append(make('span','event-kicker',future.length?'Ближайшее событие':'Последнее событие / архив'));
      const date=make('div','event-display-date');date.append(make('span','event-day',featured.eventEnd?`${featured.eventDate.slice(0,2)}–${featured.eventEnd.slice(0,2)}`:featured.eventDate.slice(0,2)),make('span','event-month',new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).formatToParts(parse(featured.eventDate)).find(p=>p.type==='month').value+' '+featured.eventDate.slice(-4)));feature.append(date,make('h3','event-feature-title',featured.t),make('p','event-feature-description',featured.p));if(featured.img){const fig=make('figure','event-photo');const im=document.createElement('img');im.src=featured.img;im.alt=featured.imgAlt||'';im.loading='lazy';im.decoding='async';fig.append(im);feature.classList.add('has-photo');feature.prepend(fig)}
      if(featured.body){const more=make('details','event-story');more.append(make('summary','','Читать новость полностью'));featured.body.forEach(t=>more.append(make('p','',t)));if(featured.source)more.append(make('p','event-story-source','Источник: '+featured.source));feature.append(more)}
      const actions=make('div','event-feature-actions');if(/^https?:/.test(featured.u))actions.append(sourceLink(featured,'Открыть материал AA25.ru'));const cal=make('a','event-calendar-link','Показать в календаре');cal.href='#calendar';cal.onclick=()=>{const dt=parse(featured.eventDate);cursor=new Date(dt.getFullYear(),dt.getMonth(),1);selected=featured.eventDate;if(location.hash==='#calendar')renderCalendar()};actions.append(cal);feature.append(actions);container.append(feature);
    }
    const rail=make('div','event-rail');const status=make('div','event-future-note');status.append(make('span','event-kicker','Сегодня и впереди'),make('p','',future.length?`Предстоящих событий: ${future.length}`:'Новых анонсов в разделе AA25.ru пока нет.'));rail.append(status);
    const group=(label,items,isEvent)=>{if(!items.length)return;const block=make('section','event-rail-group');block.append(make('h3','event-rail-heading',label));items.forEach(e=>{const row=make('article','event-rail-row');row.append(make('span','event-rail-date',isEvent?dateLabel(e):`Выпуск от ${e.sourceDate}`),sourceLink(e,e.t));if(!isEvent)row.append(make('span','event-publication-date',`Опубликовано на сайте: ${e.publishedDate}`));block.append(row)});rail.append(block)};
    group('Прошедшие встречи',past.filter(e=>e!==featured),true);group('Издания комитета',EVENTS.filter(e=>!e.eventDate),false);container.append(rail);
  }
  renderNews();
  document.querySelector('#reset-filters').onclick=()=>{
    state.fDay='Сегодня';state.scheduleDate=Schedule.today();state.fType='Все';
    for(const [selector,value] of [['#f-type','Все']])document.querySelectorAll(selector+' .chip').forEach(b=>b.setAttribute('aria-pressed',b.textContent===value));
    syncCity('Все');
  };
  document.querySelector('#cal-today').onclick=()=>{const date=Schedule.today();cursor=new Date(date.getFullYear(),date.getMonth(),1);selected=[String(date.getDate()).padStart(2,'0'),String(date.getMonth()+1).padStart(2,'0'),date.getFullYear()].join('.');renderCalendar()};
  document.querySelector('#cal-prev').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);selected=null;renderCalendar(-1)};
  document.querySelector('#cal-next').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);selected=null;renderCalendar(1)};
  document.querySelector('#calendar-city').onchange=()=>syncCity(document.querySelector('#calendar-city').value);
  const today=dateVl();selected=[String(today.getDate()).padStart(2,'0'),String(today.getMonth()+1).padStart(2,'0'),today.getFullYear()].join('.');
  syncCity(state.city);window.addEventListener('hashchange',route);route();
})();
