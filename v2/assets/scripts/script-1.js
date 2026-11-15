/* Общие правила конкретных дат. Даты — календарные даты Владивостока. */
const Schedule = (() => {
  function today(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Vladivostok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=t=>+parts.find(p=>p.type===t).value;return new Date(get('year'),get('month')-1,get('day'));}
  function occurs(m,date){return m.d===(date.getDay()||7)&&!(m.g==='vost'&&date.getDate()>28);}
  function status(m,date){const nth=Math.floor((date.getDate()-1)/7)+1,last=new Date(date.getFullYear(),date.getMonth(),date.getDate()+7).getMonth()!==date.getMonth();if(m.grp?.allOpen)return 'open';if(m.g==='prim'&&last)return 'open';if(m.g==='vost')return nth===1||nth===3?'open':'closed';if(m.g==='bereg')return nth===4?'open':'closed';if(m.g==='preo'&&date.getDay()===6&&last)return 'open';return 'closed';}
  function next(m,now){const start=today();for(let i=0;i<15;i++){const date=new Date(start.getFullYear(),start.getMonth(),start.getDate()+i);if(!occurs(m,date))continue;const diff=i*1440+(+m.t.slice(0,2)*60+ +m.t.slice(3))-now.min;if(diff>-60)return {m,date,diff};}return null;}
  return {today,occurs,status,next};
})();
