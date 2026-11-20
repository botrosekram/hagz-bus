/* passenger.js - صفحة الراكب */
const TABS=[['book','✍️','احجز'],['list','👥','القايمة'],['route','🛣️','خط السير'],['chat','💬','الشات']];
function fillSel(c){const k=JSON.stringify(ST.filter(s=>s.car_id===c.id));if(fillSel.k===k||!$('st'))return;fillSel.k=k;const s=$('st').value,d=$('dr').value;
 $('st').innerHTML='<option value="">اختر محطة الركوب</option>'+P(c).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')+'<option value="other">أخرى (اكتب وصف مكانك)</option>';
 $('dr').innerHTML='<option value="">اختر محطة النزول</option>'+D(c).map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('')+'<option value="other">أخرى (اكتب اسم المحطة)</option>';
 if(s)$('st').value=s;if(d)$('dr').value=d;
 if(!P(c).length)$('st').value='other';if(!D(c).length)$('dr').value='other';
 $('pko').hidden=$('st').value!=='other';$('dro').hidden=$('dr').value!=='other'}
function render(){const r=R(),a=$('app');
 if(!sb){a.innerHTML='<div class="card">الصفحة لسه مش متوصلة بقاعدة البيانات. عدّل ملف config.js.</div>';setNav(null);return}
 if(r[0]!=='car'||!r[1]){let lc=null;try{lc=localStorage.getItem('lastCar')}catch(e){}if(lc&&!r.length){go('car/'+lc);return}
 if(render.k!=='home'){render.k='home';a.innerHTML='<div class="card" style="text-align:center;margin-top:40px"><h1>🚐 حجز العربة</h1><p class="mut">للحجز، ادخل من الرابط الخاص بعربتك اللي بعتهولك السائق أو المسؤول.</p></div>'}setNav(null);return}
 if(!loaded){if(render.k!=='ld'){render.k='ld';a.innerHTML='<p class="mut">جارٍ التحميل…</p>'}setNav(null);return}
 const c=CARS[0];if(!c){render.k='nf';try{localStorage.removeItem('lastCar')}catch(e){}a.innerHTML=notFound();setNav(null);return}
 try{localStorage.setItem('lastCar',r[1])}catch(e){}
 const tab=TABS.some(t=>t[0]===r[2])?r[2]:'book',key=r[1]+'|'+tab;
 if(render.k!==key){render.k=key;mount(tab);window.scrollTo(0,0)}
 upd(tab,c);setNav(TABS.map(t=>({h:`#/car/${r[1]}/${t[0]}`,i:t[1],l:t[2],b:t[0]==='chat'?unreadN:0,on:t[0]===tab})))}
function mount(tab){const a=$('app'),hd='<div id="hd"></div>';
 if(tab==='book'){fillSel.k='';a.innerHTML=hd+`<div id="bres"></div><div id="nt"></div>
 <div class="card" id="fm"><b>احجز مقعدك</b>
 <label for="nm">الاسم</label><input id="nm" autocomplete="off" placeholder="اكتب اسمك">
 <label for="st">هتركب منين؟</label><select id="st"></select>
 <input id="pko" placeholder="اكتب وصف مكانك (الشارع - العمارة - علامة مميزة)" hidden style="margin-top:8px">
 <label for="dr">هتنزل فين؟</label><select id="dr"></select>
 <input id="dro" placeholder="اكتب اسم محطة النزول" hidden style="margin-top:8px">
 <button class="go" data-a="book" id="bk" style="width:100%;margin-top:14px;padding:13px">احجز</button></div>`;
  $('st').onchange=()=>{$('pko').hidden=$('st').value!=='other'};$('dr').onchange=()=>{$('dro').hidden=$('dr').value!=='other'}}
 else if(tab==='list')a.innerHTML=hd+'<div class="card"><b>قائمة الحجز</b><div id="list"></div></div>';
 else if(tab==='chat')a.innerHTML=hd+chatSkeleton();
 else a.innerHTML=hd+'<div class="card"><b>خط السير</b><div id="mt"></div></div>'}
function upd(tab,c){const bs=carB(c),conf=bs.slice(0,capOf(c)),g=grp(c);
 $('hd').innerHTML=`<div class="hd"><div class="top"><h1>${esc(c.name)} ${g?`<span class="tag">${esc(g.name)}</span>`:''}</h1></div>${c.details?`<p class="mut" style="margin:4px 0">${esc(c.details)}</p>`:''}</div>${banHtml(c)}<div class="mini">${cntHtml(c,conf,bs.length-conf.length)}</div>`;
 if(tab==='book'){fillSel(c);const can=c.status==='open'&&opened(c);$('fm').hidden=!can;
  $('nt').innerHTML=can?'':(c.status==='open'?'<div class="notice">⏳ الحجز لسه مفتحش. هيفتح تلقائيًا في الميعاد المحدد، وزرار الحجز هيظهر لوحده.</div>':'<div class="notice">الحجز مقفول لهذه العربة.</div>');
  $('bres').innerHTML=LAST&&LAST.car===c.id?`<div class="card" style="border:2px solid var(--go)"><div class="top"><b>✅ تم تسجيل حجزك</b><button data-a="bresx" aria-label="إغلاق">✕</button></div><p style="margin:6px 0 0">${esc(LAST.name)} - ${esc(LAST.pos)}</p><p style="margin:4px 0 0">🕒 وقت حجزك بالظبط: <b dir="ltr">${esc(LAST.time)}</b></p></div>`:'';
  clearTimeout(upd.t);if(c.status==='open'&&c.book_at&&!opened(c))upd.t=setTimeout(load,Math.min(Date.parse(c.book_at)-(Date.now()+skew)+400,2147000000))}
 else if(tab==='list')$('list').innerHTML=rowsHtml(c,bs,false);
 else if(tab==='chat')updChat();
 else $('mt').innerHTML=metroHtml(c,conf)}
async function doBook(){const c=CARS[0];if(!c)return;if(c.status!=='open'||!opened(c))return toast('الحجز لسه مفتحش');
 const n=$('nm').value.trim(),sv=$('st').value,pt=$('pko').value.trim(),dv=$('dr').value,drop=dv==='other'?$('dro').value.trim():dv;
 if(n.length<2)return toast('اكتب اسمك الأول');
 if(carB(c).some(x=>nk(x.name)===nk(n)))return toast('الاسم ده محجوز بالفعل في العربة دي');
 if(c.capacity!=null&&carB(c).some(x=>x.id in mine))return toast('انت حاجز قبل كده في العربة دي من الجهاز ده');
 if(!sv)return toast('اختار محطة الركوب');
 if(sv==='other'&&pt.length<3)return toast('اكتب وصف مكانك (الشارع / العمارة)');if(drop.length<2)return toast('اختار محطة النزول أو اكتبها');
 const r=await rpc('book',{p_token:R()[1],p_name:n,p_stop:sv==='other'?0:+sv,p_pick:sv==='other'?pt:'',p_drop:drop,p_dev:dev});if(!r)return;
 mine[r.data.id]={s:r.data.secret,n:''};saveMine();try{if(!localStorage.getItem('chatname'))localStorage.setItem('chatname',n)}catch(e){}$('nm').value='';$('pko').value='';$('dro').value='';
 const cc=CARS[0]||c,pos=carB(cc).findIndex(x=>x.id===r.data.id)+1,cp=capOf(cc);
 LAST={car:cc.id,name:n,pos:pos<=cp?'رقمك '+pos+' (مؤكد)':'احتياطي رقم '+(pos-cp),time:bt(r.data.created_at,'ms')};render();toast(pos<=cp?`تم حجزك، رقمك ${pos}`:`العربة مكتملة، انت احتياطي رقم ${pos-cp}`)}
function pageAct(a){if(a==='book')return doBook();if(a==='bresx'){LAST=null;render()}}
start();
