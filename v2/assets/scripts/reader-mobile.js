(()=>{
 const mq=matchMedia('(max-width:820px)'),root=document.documentElement;
 let enteredFromSite=false;   /* читалку открыли с другой страницы сайта — «Назад» возвращает туда же */
 function sync(){root.classList.toggle('reader-full',location.hash==='#reader'&&mq.matches)}
 addEventListener('hashchange',e=>{
  if(location.hash==='#reader'){try{enteredFromSite=new URL(e.oldURL).pathname===location.pathname}catch(err){enteredFromSite=false}}
  sync();
 });
 mq.addEventListener('change',sync);sync();
 addEventListener('message',e=>{
  const frame=document.getElementById('reader-frame');
  if(!frame||e.source!==frame.contentWindow||!e.data||e.data.aaReader!=='close')return;
  if(enteredFromSite){enteredFromSite=false;history.back()}else location.hash='#library';
 });
})();
