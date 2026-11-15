(function(){
'use strict';
var reduced=matchMedia('(prefers-reduced-motion: reduce)');
var wide=matchMedia('(min-width:821px)');
var EASE='cubic-bezier(.22,1,.36,1)';
var store={get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
function el(cls){var d=document.createElement('div');d.className=cls;d.setAttribute('aria-hidden','true');return d}
function inView(node){var r=node.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>0}
var FREEZE=['font','letterSpacing','color','textTransform','textAlign','padding','margin','display','alignSelf','justifySelf','gridColumn','gridRow','background','border','borderRadius','width','height','minHeight','boxShadow'];
/* Копия узла без id: стили, привязанные к id, переносятся в инлайн */
function snapshot(src){
  var copy=src.cloneNode(true),a=[src].concat([].slice.call(src.querySelectorAll('[id]'))),b=[copy].concat([].slice.call(copy.querySelectorAll('[id]')));
  for(var i=0;i<a.length;i++){
    if(!a[i].id)continue;
    if(i>0){var cs=getComputedStyle(a[i]);FREEZE.forEach(function(p){b[i].style[p]=cs[p]})}
    b[i].removeAttribute('id');
  }
  copy.removeAttribute('aria-live');copy.setAttribute('aria-hidden','true');copy.inert=true;
  [].forEach.call(copy.querySelectorAll('button,a,input,select'),function(n){n.tabIndex=-1});
  return copy;
}
function run(node,frames,opts){return node.animate(frames,opts)}
function whenDone(anims,done){
  var settled=false;function once(){if(settled)return;settled=true;done()}
  Promise.all(anims.map(function(a){return a.finished})).then(once,function(){});
  return {finish:function(){if(settled)return;anims.forEach(function(a){try{a.cancel()}catch(e){}});once()}};
}

/* ================= КНИГА ================= */
var spread=document.querySelector('.reading-spread');
var front=spread&&spread.querySelector('.reading-front');
var paper=spread&&spread.querySelector('.reading-paper');
var bookActive=null;
function finishBook(){if(bookActive){var a=bookActive;bookActive=null;a.finish()}}
function face(kind,content){var f=el('pt-face '+kind);f.append(content);var t=el('pt-tint');f.append(t);f._tint=t;return f}

/* Лист идёт двумя половинами: старая страница встаёт на ребро у корешка, новая ложится с ребра.
   Так страницы разной ширины (левая уже правой) стыкуются без скачка. */
function place(node,page){node.style.left=page.offsetLeft+'px';node.style.width=page.offsetWidth+'px'}
function twoPhase(stage,srcPage,dstPage,aContent,bContent,dir,D){
  var A=el('pt-leaf'),B=el('pt-leaf'),shade=el('pt-shade '+(dir>0?'from-left':'from-right'));
  place(A,srcPage);place(B,dstPage);place(shade,srcPage);
  A.style.transformOrigin=(dir>0?'0':'100%')+' 50%';B.style.transformOrigin=(dir>0?'100%':'0')+' 50%';
  var fa=face('pt-a',aContent),fb=face('pt-a',bContent);A.append(fa);B.append(fb);stage.append(shade,A,B);
  var h=D/2,up=(dir>0?-90:90),down=(dir>0?90:-90);
  stage.style.perspectiveOrigin=paper.offsetLeft+'px 45%';
  return [
    run(A,[{opacity:1},{opacity:1,offset:.97},{opacity:0}],{duration:h,fill:'both'}),
    run(B,[{opacity:0},{opacity:1,offset:.03},{opacity:1}],{duration:h,delay:h,fill:'both'}),
    run(A,[{transform:'rotateY(0deg)'},{transform:'rotateY('+up+'deg)'}],{duration:h,easing:'cubic-bezier(.5,0,.9,.55)',fill:'both'}),
    run(B,[{transform:'rotateY('+down+'deg)'},{transform:'rotateY(0deg)'}],{duration:h,delay:h,easing:'cubic-bezier(.1,.45,.3,1)',fill:'both'}),
    run(fa._tint,[{opacity:0},{opacity:.3}],{duration:h,fill:'both'}),
    run(fb._tint,[{opacity:.3},{opacity:0}],{duration:h,delay:h,fill:'both'}),
    run(shade,[{opacity:.55},{opacity:0}],{duration:D,easing:'ease-out',fill:'both'})
  ];
}
function flipDesktop(dir,oldFront,oldPaper){
  var stage=el('pt-stage');stage.style.height=spread.offsetHeight+'px';
  var still=el('pt-still'),anims;
  spread.append(stage);spread.classList.add('is-page-turning');
  if(dir>0){place(still,front);still.append(oldFront);stage.append(still);anims=twoPhase(stage,paper,front,oldPaper,snapshot(front),1,560)}
  else{place(still,paper);still.append(oldPaper);stage.append(still);anims=twoPhase(stage,front,paper,oldFront,snapshot(paper),-1,560)}
  return whenDone(anims,function(){stage.remove();spread.classList.remove('is-page-turning')});
}
function slideMobile(dir,oldFront,oldPaper,oldH){
  // Only the printed page moves; the date panel remains a stable anchor.
  var ghost=el('pt-ghost');ghost.style.top=paper.offsetTop+'px';
  ghost.style.height=Math.min(oldPaper.getBoundingClientRect().height||oldH,paper.offsetHeight)+'px';
  ghost.append(oldPaper);spread.append(ghost);
  var anims=[
    run(ghost,[{transform:'translateX(0)',opacity:1},{transform:'translateX('+(-dir*22)+'px)',opacity:0}],{duration:170,easing:'ease-out',fill:'both'}),
    run(paper,[{opacity:0},{opacity:1}],{duration:220,delay:100,easing:EASE,fill:'backwards'})
  ];
  return whenDone(anims,function(){ghost.remove()});
}
function turn(commit,dir){
  finishBook();
  if(!spread||!front||!paper||!dir||reduced.matches||!inView(spread)||!paper.firstChild){commit();return}
  var oldFront,oldPaper,oldH;
  try{oldFront=snapshot(front);oldPaper=snapshot(paper);oldH=spread.offsetHeight}catch(e){commit();return}
  commit();
  try{bookActive=wide.matches?flipDesktop(dir,oldFront,oldPaper):slideMobile(dir,oldFront,oldPaper,oldH)}
  catch(e){bookActive=null;[].forEach.call(spread.querySelectorAll('.pt-stage,.pt-ghost'),function(n){n.remove()});spread.classList.remove('is-page-turning')}
}
window.BookAnim={turn:turn};

/* Листание пальцем на телефоне */
if(spread){
  var sx=0,sy=0,st=0,tracking=false;
  spread.addEventListener('touchstart',function(e){if(e.touches.length!==1){tracking=false;return}tracking=true;sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now()},{passive:true});
  spread.addEventListener('touchend',function(e){
    if(!tracking)return;tracking=false;var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Math.abs(dx)<56||Math.abs(dx)<Math.abs(dy)*1.6||Date.now()-st>700)return;
    var btn=document.querySelector(dx<0?'#reading-next':'#reading-prev');
    if(btn&&!btn.disabled)btn.click();
    else if(!reduced.matches)spread.animate([{transform:'translateX(0)'},{transform:'translateX('+(dx<0?-10:10)+'px)'},{transform:'translateX(0)'}],{duration:260,easing:EASE});
  },{passive:true});
  spread.addEventListener('touchcancel',function(){tracking=false},{passive:true});
}

/* ================= КАЛЕНДАРЬ ================= */
var sheet=document.querySelector('.calendar-sheet');
var panel=sheet&&sheet.querySelector('.calendar-month-panel');
var calActive=null,markActive=null;
function finishCal(){if(calActive){var a=calActive;calActive=null;a.finish()}}
function finishMark(){if(markActive){var a=markActive;markActive=null;a.finish()}}
function relRect(node){var r=node.getBoundingClientRect(),p=panel.getBoundingClientRect();return {left:r.left-p.left,top:r.top-p.top,width:r.width,height:r.height}}
function fixGridHeight(){
  var grid=panel&&panel.querySelector('.calendar-grid');if(!grid)return;
  var day=grid.querySelector('button'),wd=grid.querySelector('.weekday');if(!day||!wd||!day.offsetHeight)return;
  var gap=parseFloat(getComputedStyle(grid).rowGap)||0;
  grid.style.minHeight=Math.ceil(wd.offsetHeight+6*day.offsetHeight+6*gap)+'px';
}
function flipMonth(snap,dir){
  var stage=el('ca-stage');stage.style.left=panel.offsetLeft+'px';stage.style.top=panel.offsetTop+'px';stage.style.width=panel.offsetWidth+'px';stage.style.height=panel.offsetHeight+'px';
  var origin='50% '+(-panel.offsetTop)+'px',shade=el('ca-shade'),leaf=el('ca-leaf'),anims,D=480;
  leaf.style.transformOrigin=origin;
  if(dir>0){            /* следующий месяц: старый лист откидывается вверх через скрепки */
    leaf.append(snap.old);stage.append(shade,leaf);sheet.append(stage);
    anims=[run(leaf,[{transform:'rotateX(0deg)',opacity:1},{transform:'rotateX(62deg)',opacity:1,offset:.62},{transform:'rotateX(92deg)',opacity:0}],{duration:D,easing:'cubic-bezier(.45,0,.7,.6)',fill:'both'}),
           run(shade,[{opacity:1},{opacity:0}],{duration:D,easing:'ease-out',fill:'both'})];
  }else{                /* предыдущий месяц: лист опускается обратно */
    var under=el('ca-under');under.append(snap.old);leaf.append(snapshot(panel));stage.append(under,leaf);sheet.append(stage);
    anims=[run(leaf,[{transform:'rotateX(92deg)',opacity:0},{transform:'rotateX(62deg)',opacity:1,offset:.38},{transform:'rotateX(0deg)',opacity:1}],{duration:D,easing:EASE,fill:'both'})];
  }
  calActive=whenDone(anims,function(){stage.remove()});
}
function slideDay(snap){
  var now=panel.querySelector('.calendar-grid [aria-pressed="true"]');
  if(!now)return;
  if(!snap.prevRect||snap.prevKey===now.dataset.date){
    if(snap.prevKey!==now.dataset.date)now.animate([{transform:'scale(.86)'},{transform:'scale(1)'}],{duration:200,easing:EASE});
    return;
  }
  var to=relRect(now),from=snap.prevRect,marker=el('ca-marker');
  marker.style.left=to.left+'px';marker.style.top=to.top+'px';marker.style.width=to.width+'px';marker.style.height=to.height+'px';
  panel.append(marker);now.classList.add('ca-sliding');
  var move=run(marker,[{transform:'translate('+(from.left-to.left)+'px,'+(from.top-to.top)+'px)'},{transform:'translate(0,0)'}],{duration:230,easing:EASE,fill:'both'});
  var ink=run(now,[{color:'#16233b'},{color:'#16233b',offset:.3},{color:'#ffffff'}],{duration:200,fill:'both'});
  var done=false;
  function land(){if(done)return;done=true;try{ink.cancel()}catch(e){}now.classList.remove('ca-sliding');
    var fade=run(marker,[{opacity:1},{opacity:0}],{duration:110,fill:'both'});fade.finished.then(function(){marker.remove()},function(){marker.remove()});
    markActive=null}
  move.finished.then(land,function(){});
  markActive={finish:function(){if(done)return;done=true;try{move.cancel();ink.cancel()}catch(e){}now.classList.remove('ca-sliding');marker.remove()}};
}
function stagger(){
  var rows=[].slice.call(document.querySelectorAll('#cal-results .cal-event,#cal-results .cal-meeting')).slice(0,6);
  rows.forEach(function(row,i){row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,delay:i*30,easing:EASE,fill:'backwards'})});
}
window.CalAnim={
  before:function(dir){
    if(!panel)return null;
    finishMark();
    var pressed=panel.querySelector('.calendar-grid [aria-pressed="true"]');
    var snap={prevKey:pressed?pressed.dataset.date:null,prevRect:pressed?relRect(pressed):null,old:null,h:panel.offsetHeight,animate:!reduced.matches&&inView(sheet)};
    if(dir&&snap.animate){finishCal();try{snap.old=snapshot(panel)}catch(e){snap.old=null}}
    return snap;
  },
  after:function(snap,dir){
    fixGridHeight();
    if(!snap||!snap.animate)return;
    try{
      if(dir&&snap.old)flipMonth(snap,dir);else if(!dir)slideDay(snap);
    }catch(e){[].forEach.call(sheet.querySelectorAll('.ca-stage,.ca-marker'),function(n){n.remove()});[].forEach.call(sheet.querySelectorAll('.ca-sliding'),function(n){n.classList.remove('ca-sliding')})}
    var prevKey=snap.prevKey;
    Promise.resolve().then(function(){
      var now=panel.querySelector('.calendar-grid [aria-pressed="true"]');
      if(dir||(now&&now.dataset.date!==prevKey))stagger();
    });
  }
};

/* ================= ДВЕРЬ ================= */
var door=document.querySelector('.door-scene');
if(door){
  if(store.get('aa-door-seen'))door.classList.add('door-seen');
  door.addEventListener('animationend',function(e){if(e.animationName==='welcome-door-open'){door.classList.add('door-seen');store.set('aa-door-seen','1')}});
}

/* При смене ширины или настройки движения незавершённые анимации снимаются */
function reset(){finishBook();finishCal();finishMark()}
wide.addEventListener('change',reset);reduced.addEventListener('change',reset);
var rz=0;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){var g=panel&&panel.querySelector('.calendar-grid');if(g){g.style.minHeight='';fixGridHeight()}},150)});
addEventListener('hashchange',function(){reset();setTimeout(fixGridHeight,60);setTimeout(fixGridHeight,450)});
fixGridHeight();
})();
