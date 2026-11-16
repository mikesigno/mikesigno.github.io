(function(){
  var root=document.documentElement;
  function setTheme(t){root.setAttribute('data-theme',t);try{localStorage.setItem('ms-theme',t)}catch(e){}
    document.querySelectorAll('.theme-btn .tl-txt').forEach(function(s){s.textContent=t==='light'?'Light':'Dark'});}
  var cur='dark';try{cur=localStorage.getItem('ms-theme')||'dark'}catch(e){}
  setTheme(cur);
  document.querySelectorAll('.theme-btn').forEach(function(b){b.addEventListener('click',function(){setTheme(root.getAttribute('data-theme')==='light'?'dark':'light')})});

  var nav=document.querySelector('.nav');
  var burger=document.querySelector('.burger');
  if(burger){burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)})}
  function onScroll(){nav.classList.toggle('scrolled',window.scrollY>10)}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')})}

  /* copy buttons */
  document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-copy'),old=b.textContent;if(t==='@url')t=location.href.split('#')[0];
    var done=function(){b.textContent='Copied';setTimeout(function(){b.textContent=old},1600)};
    try{navigator.clipboard.writeText(t).then(done,function(){b.textContent=t})}catch(e){b.textContent=t}});});

  /* product detail overlay */
  var pm=document.createElement('div');pm.className='pm';pm.setAttribute('role','dialog');pm.setAttribute('aria-modal','true');
  pm.innerHTML='<div class="pm-card"><button class="pm-x" aria-label="Close">Close ✕</button><div class="pm-content"></div></div>';
  document.body.appendChild(pm);
  var pmc=pm.querySelector('.pm-content'),pmLast=null;
  function pmOpen(id){var t=document.getElementById(id);if(!t)return;pmLast=document.activeElement;pmc.innerHTML='';pmc.appendChild(t.content.cloneNode(true));pm.classList.add('on');document.body.style.overflow='hidden';pm.querySelector('.pm-x').focus();}
  function pmClose(){pm.classList.remove('on');document.body.style.overflow='';if(pmLast)pmLast.focus();}
  pm.querySelector('.pm-x').onclick=pmClose;
  pm.addEventListener('click',function(e){if(e.target===pm)pmClose()});
  document.addEventListener('click',function(e){var b=e.target.closest('[data-detail]');if(b){pmOpen(b.getAttribute('data-detail'));}});

  /* lightbox (works for photos inside the overlay too) */
  var lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.innerHTML='<img alt=""><button class="x" aria-label="Close">Close ✕</button><button class="prev" aria-label="Previous">←</button><button class="next" aria-label="Next">→</button><div class="count"></div>';
  document.body.appendChild(lb);
  var img=lb.querySelector('img'),cnt=lb.querySelector('.count'),items=[],I=0,last=null;
  function show(){var b=items[I];img.src=b.getAttribute('data-full');img.alt=(b.querySelector('img')||{}).alt||'';cnt.textContent=(I+1)+' / '+items.length;var m=items.length>1;lb.querySelector('.prev').style.display=m?'':'none';lb.querySelector('.next').style.display=m?'':'none';}
  function open(b){last=document.activeElement;var g=b.getAttribute('data-group');items=[].slice.call(document.querySelectorAll('[data-full][data-group="'+g+'"]'));I=Math.max(0,items.indexOf(b));show();lb.classList.add('on');document.body.style.overflow='hidden';lb.querySelector('.x').focus();}
  function close(){lb.classList.remove('on');if(!pm.classList.contains('on'))document.body.style.overflow='';if(last)last.focus();}
  function step(d){I=(I+d+items.length)%items.length;show();}
  document.addEventListener('click',function(e){var b=e.target.closest('[data-full]');if(b){open(b);}});
  lb.querySelector('.x').onclick=close;lb.querySelector('.prev').onclick=function(e){e.stopPropagation();step(-1)};lb.querySelector('.next').onclick=function(e){e.stopPropagation();step(1)};
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  document.addEventListener('keydown',function(e){
    if(lb.classList.contains('on')){if(e.key==='Escape')close();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1);return;}
    if(pm.classList.contains('on')&&e.key==='Escape')pmClose();
  });
  /* product slideshow */
  var activeGo=null;
  function initSlides(box){
    var sl=[].slice.call(box.querySelectorAll('.slide')),th=[].slice.call(box.querySelectorAll('.thumb')),cnt=box.querySelector('.sl-count'),i=0;
    if(sl.length<2){box._go=null;return}
    function go(n){i=(n+sl.length)%sl.length;sl.forEach(function(s,k){s.classList.toggle('on',k===i)});th.forEach(function(t,k){t.classList.toggle('on',k===i)});if(cnt)cnt.textContent=(i+1)+' / '+sl.length;
      var t=th[i];if(t&&t.parentNode.scrollWidth>t.parentNode.clientWidth){t.parentNode.scrollLeft=t.offsetLeft-t.parentNode.clientWidth/2+t.clientWidth/2}}
    box._go=function(d){go(i+d)};activeGo=box;
    box.querySelector('.sl-prev').addEventListener('click',function(){go(i-1)});
    box.querySelector('.sl-next').addEventListener('click',function(){go(i+1)});
    th.forEach(function(t,k){t.addEventListener('click',function(){go(k)})});
    var x0=null,st=box.querySelector('.stage');
    st.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    st.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(dx<0?i+1:i-1)}x0=null},{passive:true});
  }
  document.querySelectorAll('[data-slides]').forEach(initSlides);
  document.addEventListener('keydown',function(e){if(!activeGo||!activeGo._go||document.querySelector('.lb.on')||/INPUT|TEXTAREA/.test((e.target||{}).tagName||''))return;if(e.key==='ArrowLeft')activeGo._go(-1);if(e.key==='ArrowRight')activeGo._go(1)});

  /* folders on GitHub: files.json (built by GitHub Pages) lists what is in each product and resources folder */
  var autoEls=[].slice.call(document.querySelectorAll('[data-auto-dl],[data-auto-photos]'));
  if(autoEls.length&&location.protocol.indexOf('http')===0){
    var root=autoEls[0].getAttribute('data-root')||'';
    fetch(root+'files.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
      var all=JSON.parse(t).filter(function(p){return typeof p==='string'});
      var esc=function(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
      var nice=function(f){return f.replace(/\.[^.]+$/,'').replace(/^\d+[-_ ]+/,'').replace(/[-_]+/g,' ').trim()};
      var inDir=function(dir,re){return all.filter(function(p){if(p.indexOf(dir)!==0)return false;var n=p.slice(dir.length);return n.indexOf('/')<0&&n.charAt(0)!=='_'&&n.charAt(0)!=='.'&&re.test(n)}).map(function(p){return p.slice(dir.length)}).sort()};
      autoEls.forEach(function(el){
        var pre=el.getAttribute('data-prefix');
        if(el.hasAttribute('data-auto-dl')){
          var files=inDir(el.getAttribute('data-auto-dl'),/\.[a-z0-9_]+$/i);
          el.innerHTML=files.map(function(f){var k=(f.match(/\.([^.]+)$/)||['',''])[1].toUpperCase();
            return '<li><a class="doc-row" href="'+esc(pre+encodeURIComponent(f))+'" download><span class="doc-t">'+esc(nice(f))+'</span><span class="doc-k">'+esc(k)+'</span><span class="arr">↓</span></a></li>'}).join('');
          var em=el.parentNode.querySelector('.doc-empty');if(em)em.hidden=!!(files.length||el.getAttribute('data-has-links')==='1');
        }else{
          var ph=inDir(el.getAttribute('data-auto-photos'),/\.(jpe?g|png|webp|gif)$/i);
          var cur=[].slice.call(el.querySelectorAll('.slide[data-name]')).map(function(s){return s.getAttribute('data-name')});
          if(!ph.length||ph.join('|')===cur.join('|'))return;
          var title=el.getAttribute('data-title')||'',grp='pp-'+(el.getAttribute('data-auto-photos')||'').split('/')[2];
          var h='<div class="stage">'+ph.map(function(f,k){var src=esc(pre+encodeURIComponent(f)),alt=esc(nice(f)||title);
            return '<button type="button" class="slide'+(k?'':' on')+'" data-name="'+esc(f)+'" data-group="'+esc(grp)+'" data-full="'+src+'" aria-label="Open photo: '+alt+'"><img src="'+src+'" alt="'+alt+'"'+(k?' loading="lazy"':'')+'></button>'}).join('');
          if(ph.length>1){h+='<button type="button" class="sl-prev" aria-label="Previous photo">‹</button><button type="button" class="sl-next" aria-label="Next photo">›</button><span class="sl-count">1 / '+ph.length+'</span></div><div class="thumbs">'+
            ph.map(function(f,k){return '<button type="button" class="thumb'+(k?'':' on')+'" data-slide="'+k+'" aria-label="Show photo '+(k+1)+'"><img src="'+esc(pre+encodeURIComponent(f))+'" alt="" loading="lazy"></button>'}).join('')+'</div>'}
          else h+='</div>';
          el.innerHTML=h;initSlides(el);
        }
      });
    }).catch(function(){/* not on GitHub Pages: keep the lists built into the page */});
  }
  /* terms: open all / print */
  var oa=document.querySelector('[data-open-all]');
  if(oa){oa.addEventListener('click',function(){var ds=[].slice.call(document.querySelectorAll('.terms-list details'));var open=ds.some(function(d){return !d.open});ds.forEach(function(d){d.open=open});oa.textContent=open?'Close all':'Open all'});}
  var pt=document.querySelector('[data-print-terms]');
  if(pt){pt.addEventListener('click',function(){var ds=[].slice.call(document.querySelectorAll('.terms-list details')),was=ds.map(function(d){return d.open});ds.forEach(function(d){d.open=true});document.body.classList.add('print-terms');
    var done=function(){document.body.classList.remove('print-terms');ds.forEach(function(d,k){d.open=was[k]});window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);window.print();setTimeout(function(){if(document.body.classList.contains('print-terms')&&!window.matchMedia('print').matches)done()},1500)});}
  if(location.hash==='#terms'){var d0=document.querySelector('.terms-list details');if(d0)d0.open=true}
  /* clients: count the names on the page, so the number stays right when the list is edited */
  var cc=document.querySelector('[data-client-count]');
  if(cc){var nn=document.querySelectorAll('.client-cols li').length;if(nn)cc.textContent=nn}
})();
