const contentLanguage=document.documentElement.lang;
const menuWords=({en:[' products',' found.',' · discover ingredients and prices',' brands'],de:[' Produkte',' gefunden.',' · Zutaten und Preise entdecken',' Marken'],fr:[' produits',' trouvés.',' · ingrédients et prix',' marques']})[contentLanguage]||[' ürün',' bulundu.',' · içerik ve fiyatları keşfedin',' marka'];
const query=document.getElementById('menu-query');
if(query){
  const reset=document.getElementById('menu-reset'),status=document.getElementById('menu-status');
  const groups=[...document.querySelectorAll('[data-menu-group]')].map(section=>({section,cards:[...section.querySelectorAll('[data-product]')],rows:[...section.querySelectorAll('[data-table-product]')]}));
  const normalize=value=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('ı','i').trim();
  function filter(){
    const terms=normalize(query.value).split(/\s+/);let total=0;
    for(const group of groups){
      let count=0;
      const groupName=group.section.querySelector('h2').textContent;
      group.cards.forEach((card,index)=>{
        const text=normalize(card.dataset.product+' '+groupName);
        const match=terms.every(term=>text.includes(term));
        card.hidden=!match;group.rows[index].hidden=!match;if(match)count++;
      });
      group.section.hidden=count===0;total+=count;
    }
    status.textContent=total+menuWords[0]+(query.value?menuWords[1]:menuWords[2]);
    document.getElementById('menu-empty').hidden=total!==0;reset.hidden=!query.value;
  }
  query.addEventListener('input',filter);
  reset.addEventListener('click',()=>{query.value='';filter();query.focus();});
  document.querySelector('.category-nav')?.addEventListener('click',event=>{
    if(event.target.closest('a')){query.value='';filter();}
  });
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const hero=document.querySelector('.neo-photo');
  if(hero){
    let queued=false;
    addEventListener('scroll',()=>{
      if(queued)return;queued=true;
      requestAnimationFrame(()=>{hero.style.setProperty('--parallax',Math.min(innerHeight*.05,scrollY*.09)+'px');queued=false;});
    },{passive:true});
  }
}
for(const directory of document.querySelectorAll('[data-brand-directory]')){
  const controls=directory.querySelector('.brand-controls');
  if(!controls)continue;
  controls.hidden=false;
  const search=controls.querySelector('input'),cards=[...directory.querySelectorAll('[data-brand-category]')],status=controls.querySelector('.brand-result');
  let category='';
  const normalize=value=>value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/\p{Diacritic}/gu,'').replaceAll('ı','i').trim();
  function filterBrands(){
    const terms=normalize(search.value).split(/\s+/);let count=0;
    for(const card of cards){
      const match=(!category||card.dataset.brandCategory===category)&&terms.every(term=>normalize(card.dataset.brandSearch).includes(term));
      card.hidden=!match;if(match)count++;
    }
    status.textContent=count+menuWords[3]+(search.value?menuWords[1]:'');
    directory.querySelector('.brand-empty').hidden=count!==0;
  }
  search.addEventListener('input',filterBrands);
  controls.querySelector('.brand-filter').addEventListener('click',event=>{
    const button=event.target.closest('[data-brand-filter]');if(!button)return;
    category=button.dataset.brandFilter;
    controls.querySelectorAll('[data-brand-filter]').forEach(b=>b.setAttribute('aria-pressed',b===button?'true':'false'));
    filterBrands();
  });
}
const categoryLinks=[...document.querySelectorAll('.category-nav a')];
function activateCategory(selected){
  for(const link of categoryLinks){
    link.classList.toggle('is-active',link===selected);
    if(link===selected)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  }
  const rail=selected.closest('.category-nav');
  if(matchMedia('(max-width:650px)').matches){
    const left=selected.offsetLeft-rail.offsetLeft-(rail.clientWidth-selected.offsetWidth)/2;
    rail.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
}
categoryLinks.forEach(link=>link.addEventListener('click',()=>activateCategory(link)));
if(categoryLinks.length)activateCategory(categoryLinks.find(link=>link.hash===location.hash)||categoryLinks[0]);
if(categoryLinks.length&&'IntersectionObserver' in window){
  const categoryObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const selected=categoryLinks.find(link=>link.hash==='#'+entry.target.id);
      if(selected)activateCategory(selected);
    }
  },{rootMargin:matchMedia('(max-width:650px)').matches?'-190px 0px -50% 0px':'-115px 0px -60% 0px',threshold:0});
  document.querySelectorAll('[data-menu-group]').forEach(section=>categoryObserver.observe(section));
}

const intro=document.querySelector('[data-intro]');
if(intro){
 let seen=false;try{seen=sessionStorage.getItem('vena-intro')==='1';sessionStorage.setItem('vena-intro','1');}catch{}
 const closeIntro=()=>{intro.classList.add('is-leaving');setTimeout(()=>intro.remove(),500);};
 if(seen||matchMedia('(prefers-reduced-motion: reduce)').matches)intro.remove();
 else{intro.setAttribute('aria-hidden','false');intro.querySelector('[data-intro-skip]').addEventListener('click',closeIntro);setTimeout(closeIntro,2100);}
}
document.querySelectorAll('.category-nav a,.mobile-dock a,.main-nav a').forEach(link=>link.addEventListener('click',()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 link.classList.remove('tap-feedback');void link.offsetWidth;link.classList.add('tap-feedback');
 if(typeof navigator.vibrate==='function'&&matchMedia('(pointer:coarse)').matches)navigator.vibrate(8);
}));

// Language choices stay within the header and preserve the reading position.
const languageMenu=document.querySelector('[data-language-menu]');
if(languageMenu){
 document.addEventListener('pointerdown',event=>{if(languageMenu.open&&!languageMenu.contains(event.target))languageMenu.open=false;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&languageMenu.open){languageMenu.open=false;languageMenu.querySelector('summary').focus();}});
 languageMenu.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!languageMenu.contains(document.activeElement))languageMenu.open=false;});});
 languageMenu.querySelectorAll('a[hreflang]').forEach(link=>link.addEventListener('click',event=>{
  if(link.getAttribute('aria-current')){event.preventDefault();languageMenu.open=false;return;}
  if(location.hash)link.hash=location.hash;
  try{sessionStorage.setItem('vena-language-position',JSON.stringify({path:new URL(link.href).pathname,ratio:scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight),time:Date.now()}));}catch{}
 }));
}
try{
 const position=JSON.parse(sessionStorage.getItem('vena-language-position')||'null');
 sessionStorage.removeItem('vena-language-position');
 if(position&&position.path===location.pathname&&Date.now()-position.time<20000&&!location.hash){
  const restore=()=>requestAnimationFrame(()=>scrollTo({top:Math.max(0,Math.min(1,position.ratio))*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'}));
  if(document.readyState==='complete')restore();else addEventListener('load',restore,{once:true});
 }
}catch{}
const currentSection=(location.pathname.startsWith('/')?location.pathname.slice(''.length):location.pathname).replace(/^\/(en|de|fr)(?=\/)/,'');
const dockLinks=[...document.querySelectorAll('.mobile-dock a')];
const dockIndex=currentSection.startsWith('/menu/')?0:currentSection.startsWith('/shop/')?1:currentSection.startsWith('/contact/')?2:-1;
dockLinks.forEach((link,index)=>{if(index===dockIndex)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});

const heroSlider=document.querySelector('[data-hero-slider]');
if(heroSlider){
 const slides=[...heroSlider.querySelectorAll('.hero-slide')],dots=[...heroSlider.querySelectorAll('[data-slide-to]')],pause=heroSlider.querySelector('[data-slide-pause]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let current=0,timer,paused=reduced.matches,startX=null,startY=0;
 const labels={tr:['Önceki görsel','Sonraki görsel','Duraklat','Oynat'],en:['Previous image','Next image','Pause','Play'],de:['Vorheriges Bild','Nächstes Bild','Pause','Abspielen'],fr:['Image précédente','Image suivante','Pause','Lire']}[contentLanguage]||['Previous','Next','Pause','Play'];
 heroSlider.querySelector('[data-slide-prev]').ariaLabel=labels[0];heroSlider.querySelector('[data-slide-next]').ariaLabel=labels[1];
 function sync(){pause.ariaLabel=labels[paused?3:2];pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'▷':'Ⅱ';}
 function schedule(){clearInterval(timer);if(!paused&&!document.hidden)timer=setInterval(()=>show(current+1),5500);}
 function show(index){current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-current',i===current);slide.setAttribute('aria-hidden',String(i!==current));dots[i].setAttribute('aria-pressed',String(i===current));});}
 function manual(index){show(index);schedule();}
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>manual(i)));
 heroSlider.querySelector('[data-slide-prev]').addEventListener('click',()=>manual(current-1));heroSlider.querySelector('[data-slide-next]').addEventListener('click',()=>manual(current+1));
 pause.addEventListener('click',()=>{paused=!paused;sync();schedule();});
 heroSlider.addEventListener('mouseenter',()=>clearInterval(timer));heroSlider.addEventListener('mouseleave',schedule);
 heroSlider.addEventListener('focusin',()=>clearInterval(timer));heroSlider.addEventListener('focusout',event=>{if(!heroSlider.contains(event.relatedTarget))schedule();});
 heroSlider.addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();manual(current+(event.key==='ArrowRight'?1:-1));}});
 heroSlider.addEventListener('touchstart',event=>{startX=event.touches[0].clientX;startY=event.touches[0].clientY;clearInterval(timer);},{passive:true});
 heroSlider.addEventListener('touchend',event=>{if(startX!==null){const dx=event.changedTouches[0].clientX-startX,dy=event.changedTouches[0].clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))show(current+(dx<0?1:-1));startX=null;schedule();}},{passive:true});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;sync();schedule();});sync();schedule();
}
const shopDialog=document.getElementById('shop-discovery');
if(shopDialog){
 const key='vena-shop-discovery-v1';let lastFocus,seen=false,start=Date.now();try{seen=sessionStorage.getItem(key)==='1';}catch{}
 function openShops(){if(shopDialog.open)return;lastFocus=document.activeElement;shopDialog.showModal();seen=true;try{sessionStorage.setItem(key,'1');}catch{}shopDialog.querySelector('[data-close-shops]').focus();}
 function closeShops(){shopDialog.close();lastFocus?.focus({preventScroll:true});}
 document.querySelector('[data-open-shops]').addEventListener('click',openShops);
 shopDialog.querySelectorAll('[data-close-shops]').forEach(button=>button.addEventListener('click',closeShops));
 shopDialog.addEventListener('cancel',()=>{lastFocus?.focus({preventScroll:true});});
 shopDialog.addEventListener('click',event=>{if(event.target===shopDialog){const box=shopDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeShops();}});
 addEventListener('scroll',()=>{if(!seen&&Date.now()-start>12000&&scrollY>innerHeight*.8&&!document.querySelector('input:focus,textarea:focus,details.language-switch[open]'))openShops();},{passive:true});
}
