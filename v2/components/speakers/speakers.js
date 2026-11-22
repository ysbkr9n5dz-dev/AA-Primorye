(() => {
const stylesheet = new URL('speakers.css?v=20261123a', document.currentScript.src).href;
let records = [];
class AASpeakers extends HTMLElement {
  static get observedAttributes() { return ['collapsed']; }
  attributeChangedCallback() { this.refreshMini?.(); }
  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({mode:'open'});
    this.gate();
  }
  async load() {
    const settings = (window.AA_CONTENT || {}).settings || {};
    const r = await fetch('content/speakers.json?v=' + encodeURIComponent(settings.speakersVersion || ''), {cache:'no-cache'});
    if (!r.ok) throw Error(r.status);
    records = (await r.json()).filter(x => !x.hidden);
  }
  async open() {
    try { await this.load(); } catch (e) { this.shadowRoot.innerHTML = '<p style="padding:48px 24px;font:16px/1.5 Arial,sans-serif;color:#1c3b7d">Не удалось загрузить записи. Проверьте интернет и обновите страницу.</p>'; return; }
    this.shadowRoot.replaceChildren();
    this.build();
  }
  async gate() {
    const settings = (window.AA_CONTENT || {}).settings || {};
    const hash = settings.speakersPasswordSha256;
    let ok = !hash;
    try { if (hash && sessionStorage.getItem('aa-speakers-key') === hash) ok = true; } catch (e) {}
    if (ok) return this.open();
    const root = this.shadowRoot;
    const style = document.createElement('link'); style.rel = 'stylesheet'; style.href = stylesheet;
    root.innerHTML = `<section class="speakers-page speakers-locked"><div class="wrap"><div class="speakers-gate">
<span class="eyebrow">ЖИВОЙ ОПЫТ СОДРУЖЕСТВА</span><h2>Спикерские</h2>
<p>Записи выступлений доступны членам содружества. Пароль можно узнать у служащего группы или по телефону доверия.</p>
<form id="gate-form" autocomplete="off"><label for="gate-pass">Пароль</label><div class="gate-row"><input id="gate-pass" type="password" inputmode="numeric" required><button type="submit" class="gate-btn">Открыть</button></div><p id="gate-error" class="gate-error" role="alert" hidden>Неверный пароль. Попробуйте ещё раз.</p></form>
</div></div></section>`;
    root.prepend(style);
    const form = root.getElementById('gate-form'), input = root.getElementById('gate-pass'), err = root.getElementById('gate-error');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value.trim()));
      const hex = [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
      if (hex !== hash) { err.hidden = false; input.select(); return; }
      try { sessionStorage.setItem('aa-speakers-key', hash); } catch (e) {}
      this.open();
    });
  }
  build() {
    const host = this;
    const root = this.shadowRoot;
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = stylesheet;
    root.innerHTML = `<section class="speakers-page"><div class="wrap">
 <div class="speakers-heading"><div><span class="eyebrow">ЖИВОЙ ОПЫТ СОДРУЖЕСТВА</span><h2>Спикерские</h2><p>Истории выздоровления, опыт и надежда — в голосах людей из содружества.</p></div><span class="audio-library-mark" aria-hidden="true">АУДИО<br>ТЕКА<span>АА / ПРИМОРЬЕ</span></span></div>
 <div class="audio-deck" aria-label="Аудиоплеер спикерских"><div class="deck-topline"><span>ГОЛОСА ОПЫТА</span><span>АА · ПРИМОРСКИЙ КРАЙ</span></div><div class="deck-body"><div class="deck-display"><div class="deck-display-label"><span id="audio-state" role="status">Готово к прослушиванию</span><span class="level-meter" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></div><h3 id="audio-title">Выберите запись</h3><p id="audio-detail"></p><div class="audio-timeline"><label class="sr-only" for="audio-seek">Позиция воспроизведения</label><input id="audio-seek" type="range" min="0" max="1000" value="0" disabled><div><span id="audio-current">0:00</span><span id="audio-duration">—:—</span></div></div></div><div class="deck-grille" aria-hidden="true"><span></span></div></div><div class="deck-controls"><div class="transport"><button type="button" id="audio-back" class="audio-small" aria-label="Назад на 15 секунд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V3m0 6h6M4.5 8A8 8 0 1 1 4 16"/></svg><span>15</span></button><button type="button" id="audio-play" class="audio-main" aria-label="Воспроизвести"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg><span>Слушать</span></button><button type="button" id="audio-forward" class="audio-small" aria-label="Вперёд на 15 секунд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 9V3m0 6h-6m5.5-1A8 8 0 1 0 20 16"/></svg><span>15</span></button></div><div class="audio-options"><label for="audio-rate">Скорость <select id="audio-rate"><option value="0.75">0,75×</option><option value="1" selected>1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label><label class="audio-volume" for="audio-volume">Громкость <input id="audio-volume" type="range" min="0" max="1" step="0.05" value="1"></label></div></div><div class="deck-footnote"><span class="deck-light" aria-hidden="true"></span><span>Каждая история — чей-то путь к трезвости</span></div></div>
 <div class="audio-catalogue"><div class="audio-catalogue-head"><h3>Записи выступлений</h3><span id="audio-count" aria-live="polite"></span></div><div class="audio-filters"><label>Поиск<input id="audio-search" type="search" placeholder="Имя, группа или тема" autocomplete="off"></label><label>Год<select id="audio-year"><option value="">Все годы</option></select></label><label>Содружество<select id="audio-fellowship"><option value="">Все записи</option><option>АА</option><option>Ал-Анон</option></select></label></div><div id="audio-records" class="audio-records"></div><button type="button" id="audio-more" class="btn line">Показать ещё</button><p class="audio-source">Записи и подписи — из архива AA25.ru. Имена сохранены в том виде, в котором указаны в источнике.</p></div>
</div></section>
<audio id="speaker-audio" preload="none"></audio>
<aside id="audio-mini" class="audio-mini" aria-label="Сейчас играет" hidden><a href="#speakers"><span>СЕЙЧАС СЛУШАЕТЕ</span><strong id="mini-title"></strong></a><span id="mini-time">0:00</span><button id="mini-play" type="button" aria-label="Пауза"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button><button id="mini-close" type="button" aria-label="Остановить и закрыть плеер"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></aside>`;
    root.prepend(style);
    const $ = id => root.getElementById(id);
    const audio = $('speaker-audio'), deck = root.querySelector('.audio-deck'), mini = $('audio-mini');
    mini.querySelector('a').hash = this.id || 'speakers';
    let current=records[0],limit=12,remember=0,lastSave=0,hasStarted=false,miniDismissed=false;
    this.refreshMini = showMini;
    const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/></svg>',pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
const readStore=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}},writeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}};
const saved=readStore('aa-audio-current');if(saved){current=records.find(r=>r.id===saved)||current}
const time=n=>{if(!Number.isFinite(n)||n<0)return '—:—';n=Math.floor(n);const h=Math.floor(n/3600),m=Math.floor(n%3600/60),s=String(n%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+s:m+':'+s};
const date=r=>r.date?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date+'T12:00:00Z')):'Дата не указана';
function description(r,compact=false){let s=r.description;if(s.startsWith(r.name))s=s.slice(r.name.length).replace(/^[, .]+/,'');if(compact)s=s.replace(/,?\s*\d{2}\/\d{2}\/20\d{2}/,'').replace(/[, ]+$/,'');return s.charAt(0).toUpperCase()+s.slice(1)}
function filtered(){const q=$('audio-search').value.trim().toLocaleLowerCase('ru'),year=$('audio-year').value,f=$('audio-fellowship').value;return records.filter(r=>(!q||r.description.toLocaleLowerCase('ru').includes(q))&&(!year||r.year===year)&&(!f||r.fellowship===f))}
function renderList(){const list=filtered();$('audio-count').textContent=list.length+' из '+records.length+' записей';$('audio-records').replaceChildren();if(!list.length){const p=document.createElement('p');p.className='audio-empty';p.textContent='По этому запросу записей нет. Попробуйте другое имя, группу или год.';$('audio-records').append(p)}list.slice(0,limit).forEach((r,i)=>{const row=document.createElement('article');row.className='audio-row'+(r.id===current.id?' active':'');row.dataset.record=r.id;const number=document.createElement('span');number.className='record-number';number.textContent=String(i+1).padStart(2,'0');number.setAttribute('aria-hidden','true');const info=document.createElement('div'),h=document.createElement('h4'),p=document.createElement('p');h.textContent=r.name;p.textContent=description(r,true);info.append(h,p);const stamp=document.createElement('div');stamp.className='record-date';stamp.textContent=date(r);const kind=document.createElement('span');kind.textContent=r.fellowship;stamp.append(kind);const b=document.createElement('button');b.type='button';b.className='record-listen';const playing=r.id===current.id&&!audio.paused;b.innerHTML=(playing?pauseIcon:playIcon)+(playing?'Пауза':'Слушать');b.setAttribute('aria-label',(playing?'Пауза: ':'Слушать: ')+r.description);b.onclick=()=>{if(current.id===r.id)toggle();else select(r,true)};row.append(number,info,stamp,b);$('audio-records').append(row)});$('audio-more').hidden=limit>=list.length}
function showMini(){mini.hidden=!host.hasAttribute('collapsed')||!hasStarted||miniDismissed;}
function update(){const playing=!audio.paused&&!audio.ended;deck.classList.toggle('is-playing',playing);$('audio-play').innerHTML=(playing?pauseIcon:playIcon)+'<span>'+(playing?'Пауза':'Слушать')+'</span>';$('audio-play').setAttribute('aria-label',playing?'Пауза':'Воспроизвести');$('mini-play').innerHTML=playing?pauseIcon:playIcon;$('mini-play').setAttribute('aria-label',playing?'Пауза':'Воспроизвести');$('audio-current').textContent=time(audio.currentTime||0);$('mini-time').textContent=time(audio.currentTime||0);$('audio-duration').textContent=time(audio.duration);$('audio-seek').disabled=!Number.isFinite(audio.duration)||audio.duration<=0;if(!$('audio-seek').disabled){$('audio-seek').value=1000*audio.currentTime/audio.duration;$('audio-seek').setAttribute('aria-valuetext',time(audio.currentTime)+' из '+time(audio.duration))}showMini()}
function select(r,play=false){if(audio.currentSrc&&current)save();audio.pause();current=r;audio.removeAttribute('src');audio.load();remember=Number(readStore('aa-audio-position-'+r.id))||0;hasStarted=false;miniDismissed=false;$('audio-title').textContent=r.name;$('audio-detail').textContent=description(r);$('mini-title').textContent=r.name;$('audio-state').textContent=remember>5?'Продолжить с '+time(remember):'Готово к прослушиванию';writeStore('aa-audio-current',r.id);if('mediaSession' in navigator&&'MediaMetadata' in window)navigator.mediaSession.metadata=new MediaMetadata({title:r.name,artist:'Спикерские АА Приморья',album:date(r)});update();renderList();if(play)toggle()}
function save(){if(Number.isFinite(audio.currentTime)&&audio.currentTime>0)writeStore('aa-audio-position-'+current.id,audio.currentTime)}
async function toggle(){if(!audio.paused){audio.pause();return}const selected=current.id;if(!audio.getAttribute('src')){audio.src=current.src;audio.load()}$('audio-state').textContent='Загрузка записи…';miniDismissed=false;try{await audio.play();if(current.id===selected){hasStarted=true;update()}}catch(e){if(current.id!==selected||e.name==='AbortError')return;$('audio-state').textContent='Не удалось начать воспроизведение. Нажмите «Слушать», чтобы повторить.';update()}}
$('audio-play').onclick=toggle;$('mini-play').onclick=toggle;$('mini-close').onclick=()=>{audio.pause();miniDismissed=true;showMini()};
$('audio-back').onclick=()=>{if(audio.getAttribute('src'))audio.currentTime=Math.max(0,audio.currentTime-15)};$('audio-forward').onclick=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)};
$('audio-seek').oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number($('audio-seek').value)/1000};
$('audio-rate').value=String(readStore('aa-audio-rate')||1);audio.playbackRate=Number($('audio-rate').value)||1;$('audio-rate').onchange=()=>{audio.playbackRate=Number($('audio-rate').value);writeStore('aa-audio-rate',audio.playbackRate)};$('audio-volume').oninput=()=>{audio.volume=Number($('audio-volume').value)};
audio.addEventListener('loadedmetadata',()=>{audio.playbackRate=Number($('audio-rate').value)||1;if(remember>5&&remember<audio.duration-10)audio.currentTime=remember;remember=0;update()});
audio.addEventListener('timeupdate',()=>{update();if(Date.now()-lastSave>5000){save();lastSave=Date.now()}});
audio.addEventListener('playing',()=>{hasStarted=true;$('audio-state').textContent='Сейчас играет';update();renderList()});
audio.addEventListener('pause',()=>{save();if(hasStarted)$('audio-state').textContent='На паузе';update();renderList()});
audio.addEventListener('waiting',()=>{$('audio-state').textContent='Подгружаем запись…'});
audio.addEventListener('ended',()=>{writeStore('aa-audio-position-'+current.id,0);$('audio-state').textContent='Запись завершена';update();renderList()});
audio.addEventListener('error',()=>{if(audio.getAttribute('src'))$('audio-state').textContent='Запись не загрузилась. Проверьте соединение и попробуйте ещё раз.';update()});
[...new Set(records.map(r=>r.year).filter(Boolean))].sort().reverse().forEach(year=>{const o=document.createElement('option');o.value=year;o.textContent=year;$('audio-year').append(o)});
for(const id of ['audio-search','audio-year','audio-fellowship'])$(id).addEventListener(id==='audio-search'?'input':'change',()=>{limit=12;renderList()});$('audio-more').onclick=()=>{limit+=12;renderList()};window.addEventListener('hashchange',showMini);window.addEventListener('pagehide',save);
if('mediaSession' in navigator){for(const [action,handler]of [['play',()=>{if(audio.paused)toggle()}],['pause',()=>audio.pause()],['seekbackward',()=>{audio.currentTime=Math.max(0,audio.currentTime-15)}],['seekforward',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,audio.currentTime+15)}]])try{navigator.mediaSession.setActionHandler(action,handler)}catch(e){}}
select(current);

  }
}
if (!customElements.get('aa-speakers')) customElements.define('aa-speakers', AASpeakers);
})();
