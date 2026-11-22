/* ===== Правки 16.11.2026 ===== */
(()=>{
'use strict';

/* Одна дата сверки для всего сайта: меняется только здесь */
const VERIFIED=(((window.AA_CONTENT||{}).schedule||{}).verified)||'15 ноября 2026 года';
document.querySelectorAll('[data-verified]').forEach(el=>{el.textContent=VERIFIED});

/* ---------- Тест «Подходит ли вам АА?» ----------
   Вопросы и пояснения не хранятся на этом сайте: они загружаются со страницы
   «Что такое АА» на aa25.ru в момент открытия теста. Ответы никуда не отправляются
   и не сохраняются: после закрытия окна они пропадают. */
const SOURCE_API='https://aa25.ru/wp-json/wp/v2/pages?slug=info&_fields=content,link';
const SOURCE_PAGE='https://aa25.ru/info/';
const opener=document.getElementById('open-selftest');
if(!opener||typeof HTMLDialogElement==='undefined')return;

const dlg=document.createElement('dialog');
dlg.className='selftest';dlg.setAttribute('aria-labelledby','st-title');
dlg.innerHTML='<div class="st-in"><div class="st-head"><b id="st-title">Подходит ли вам АА?</b><button class="st-x" type="button" aria-label="Закрыть тест">×</button></div><div class="st-body" aria-live="polite"></div><div class="st-foot"></div></div>';
document.body.append(dlg);
const body=dlg.querySelector('.st-body'),foot=dlg.querySelector('.st-foot');
dlg.querySelector('.st-x').onclick=()=>dlg.close();
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});

let data=null,answers=[],step=0;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const btn=(text,cls,on)=>{const b=el('button','st-btn '+(cls||''),text);b.type='button';b.onclick=on;return b};
const link=(text,href,cls)=>{const a=el('a','st-btn '+(cls||''),text);a.href=href;return a};
function screen(nodes,actions){body.replaceChildren(...nodes);foot.replaceChildren(...actions);body.scrollTop=0}
function focusFirst(){const b=foot.querySelector('button,a');if(b)b.focus({preventScroll:true})}
function source(){const p=el('p','st-src');p.append('Вопросы и пояснения — со страницы «Что такое АА» сайта ');const a=el('a',null,'aa25.ru');a.href=SOURCE_PAGE;a.target='_blank';a.rel='noopener';p.append(a,'.');return p}

/* Разбор страницы aa25.ru: после заголовка «Подходит ли…» идут вступление, 12 вопросов в <details> и итог */
const textOf=node=>{const c=node.cloneNode(true);c.querySelectorAll('br').forEach(b=>b.replaceWith('\n'));return c.textContent.replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim()};
function parse(html){
  const doc=new DOMParser().parseFromString(html,'text/html');
  const head=[...doc.querySelectorAll('h1,h2,h3')].find(h=>/подходит ли/i.test(h.textContent));
  if(!head)return null;
  const questions=[],closing=[];
  for(let n=head.nextElementSibling;n&&!/^H[1-3]$/.test(n.tagName);n=n.nextElementSibling){
    if(n.tagName==='DETAILS'){
      const s=n.querySelector('summary');if(!s)continue;
      const more=[...n.querySelectorAll('p')].map(textOf).filter(Boolean).join('\n\n');
      questions.push({q:textOf(s).replace(/^\d{1,2}\s*[—–.)-]\s*/,''),more});   /* номер уже показан над вопросом */
    }else if(questions.length){
      const t=textOf(n);if(t)closing.push({text:t,sign:/text-align-right/.test(n.className)});
    }
  }
  return questions.length>=10?{questions,closing}:null;
}
async function load(){
  if(data)return data;
  const local=(window.AA_CONTENT||{}).selftest;
  if(local&&local.questions&&local.questions.length){data=local;return data}
  try{const c=sessionStorage.getItem('aa-selftest-v2');if(c){data=JSON.parse(c);return data}}catch(e){}
  const ctl=window.AbortController?new AbortController():null;const t=ctl&&setTimeout(()=>ctl.abort(),12000);
  try{
    const r=await fetch(SOURCE_API,ctl?{signal:ctl.signal}:{});if(!r.ok)throw Error(r.status);
    const json=await r.json();data=parse(json[0]&&json[0].content&&json[0].content.rendered||'');
    if(!data)throw Error('format');
    try{sessionStorage.setItem('aa-selftest-v2',JSON.stringify(data))}catch(e){}
    return data;
  }finally{if(t)clearTimeout(t)}
}

function intro(){
  const n=data?data.questions.length:12;
  screen([el('h2',null,'Подходит ли вам АА?'),
    el('p',null,'Этот тест помогает честно ответить себе на один вопрос: есть ли у меня проблема с алкоголем. Его предлагает содружество Анонимные Алкоголики тем, кто сомневается.'),
    el('p',null,n+' вопросов о том, как выпивка влияет на вашу жизнь. На каждый ответьте «да» или «нет». Займёт 3–5 минут.'),
    el('p','st-note','Это не диагноз и не экзамен. Ответы никуда не отправляются и не сохраняются: когда вы закроете окно, они исчезнут. Решение всегда остаётся за вами.'),
    source()],
   [btn('Начать тест','primary',()=>{answers=[];step=0;question()})]);
  focusFirst();
}
function question(){
  const qs=data.questions,q=qs[step],bar=el('div','st-progress'),fill=el('i');
  fill.style.width=(step/qs.length*100)+'%';bar.append(fill);
  const nodes=[bar,el('p','st-count','Вопрос '+(step+1)+' из '+qs.length),el('p','st-q',q.q)];
  if(q.more){const d=el('details','st-more');d.append(el('summary',null,'Пояснение'));q.more.split('\n\n').forEach(t=>d.append(el('p',null,t)));nodes.push(d)}
  const answer=v=>{answers[step]=v;step++;step<qs.length?question():result()};
  const acts=[btn('Да','answer'+(answers[step]===true?' primary':''),()=>answer(true)),btn('Нет','answer'+(answers[step]===false?' primary':''),()=>answer(false))];
  if(step>0)acts.push(btn('← Назад','ghost',()=>{step--;question()}));
  screen(nodes,acts);requestAnimationFrame(()=>{fill.style.width=((step+1)/qs.length*100)+'%'});focusFirst();
}
function result(){
  const yes=answers.filter(Boolean).length,total=data.questions.length;
  const box=el('div','st-text');
  data.closing.forEach(c=>box.append(el('p',c.sign?'st-sign':null,c.text)));
  screen([el('p','st-count','Готово'),el('p','st-result','«Да» — '+yes+' из '+total),box,source()],
   [link('Найти собрание','#schedule','primary'),link('Позвонить','#phones'),btn('Пройти заново','ghost',()=>{answers=[];step=0;question()})]);
  foot.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>dlg.close()));
  focusFirst();
}
function failed(){
  screen([el('h2',null,'Не удалось загрузить вопросы'),el('p',null,'Вопросы теста загружаются с сайта aa25.ru, а он сейчас не ответил. Проверьте интернет или откройте тест на самом сайте.')],
   [btn('Попробовать снова','primary',start),link('Открыть на aa25.ru',SOURCE_PAGE)]);
  const a=foot.querySelector('a');a.target='_blank';a.rel='noopener';focusFirst();
}
async function start(){
  screen([el('h2',null,'Подходит ли вам АА?'),el('p','st-note','Загружаем вопросы…')],[]);
  try{await load();intro()}catch(e){failed()}
}
/* Тест открывается и из карточки «Впервые здесь», и по ссылке на главной */
[opener,...document.querySelectorAll('[data-selftest]')].forEach(el=>el.addEventListener('click',e=>{e.preventDefault();if(!dlg.open)dlg.showModal();start()}));
})();
