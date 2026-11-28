/* passenger.js - صفحة الراكب */
const TABS=[['book','✍️','احجز'],['list','👥','القايمة'],['route','🛣️','خط السير'],['chat','💬','الشات']];
let PN=null;   // اسم الراكب المسجّل على جهازه (من السيرفر): null=بيتحمّل، ''=لسه مسجّلش
async function afterAuth(){try{const {data,error}=await sb.rpc('dev_name',{p_dev:dev});PN=error?'':(data||'')}catch(e){PN=''}}
function fillSel(c){const k=JSON.stringify(ST.filter(s=>s.car_id===c.id));if(fillSel.k===k||!$('st'))return;fillSel.k=k;const s=$('st').value,d=$('dr').value;
 $('st').innerHTML='<option value="">اختر محطة الركوب</option>'+P(c).map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')+'<option value="other">أخرى (اكتب وصف مكانك)</option>';
 $('dr').innerHTML='<option value="">اختر محطة النزول</option>'+D(c).map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('')+'<option value="other">أخرى (اكتب اسم المحطة)</option>';
 if(s)$('st').value=s;if(d)$('dr').value=d;
 if(!P(c).length)$('st').value='other';if(!D(c).length)$('dr').value='other';
 $('pko').hidden=$('st').value!=='other';$('dro').hidden=$('dr').value!=='other'}
function render(){const r=R(),a=$('app');
 if(!sb){a.innerHTML='<div class="card">الصفحة لسه مش متوصلة بقاعدة البيانات. عدّل ملف config.js.</div>';setNav(null);return}
 if(PN===null){if(render.k!=='ld0'){render.k='ld0';a.innerHTML='<p class="mut">جارٍ التحميل…</p>'}setNav(null);return}
 if(!PN){if(render.k!=='gate'){render.k='gate';a.innerHTML='<div class="card" style="max-width:420px;margin:30px auto;text-align:center"><h1>👋 أهلًا بيك</h1><p class="mut">اكتب اسمك مرة واحدة. هيتسجل في الحجز والشات تلقائي ومش هتكتبه تاني.</p><input id="gn" maxlength="30" placeholder="اسمك" autocomplete="off"><button class="go" data-a="regname" style="width:100%;margin-top:12px;padding:13px">متابعة</button><p class="mut sm">الاسم بيتثبت بعد أول حجز أو رسالة.</p></div>'}setNav(null);return}
 if(r[0]!=='car'||!r[1]){let lc=null;try{lc=localStorage.getItem('lastCar')}catch(e){}if(lc&&!r.length){go('car/'+lc);return}
  if(render.k!=='home'){render.k='home';a.innerHTML='<div class="card" style="text-align:center;margin-top:40px"><h1>🚐 حجز العربة</h1><p class="mut">للحجز، ادخل من الرابط اللي بعتهولك السائق أو المسؤول، أو الصق الرابط (أو الكود) هنا:</p><input id="lk" placeholder="الصق رابط العربة هنا" style="direction:ltr" autocomplete="off"><button class="go" data-a="openlink" style="width:100%;margin-top:10px">فتح العربة</button></div>'}setNav(null);return}
 if(!loaded){if(render.k!=='ld'){render.k='ld';a.innerHTML='<p class="mut">جارٍ التحميل…</p>'}setNav(null);return}
 const c=CARS[0];if(!c){render.k='nf';try{localStorage.removeItem('lastCar')}catch(e){}a.innerHTML=notFound();setNav(null);return}
 try{localStorage.setItem('lastCar',r[1])}catch(e){}
 const tab=TABS.some(t=>t[0]===r[2])?r[2]:'book',key=r[1]+'|'+tab;
 if(render.k!==key){render.k=key;mount(tab);window.scrollTo(0,0)}
 upd(tab,c);setNav(TABS.map(t=>({h:`#/car/${r[1]}/${t[0]}`,i:t[1],l:t[2],b:t[0]==='chat'?unreadN:0,on:t[0]===tab})))}
function mount(tab){const a=$('app'),hd='<div id="hd"></div>';
 if(tab==='book'){fillSel.k='';a.innerHTML=hd+`<div id="bres"></div><div id="nt"></div>
 <div class="card" id="fm"><b>احجز مقعدك</b>
 <div style="margin-top:8px">👤 اسمك: <b id="pnm"></b> <button data-a="rename" style="padding:2px 9px;font-size:12px">تغيير</button></div>
 <label for="st">هتركب منين؟</label><select id="st"></select>
 <input id="pko" placeholder="اكتب وصف مكانك (الشارع - العمارة - علامة مميزة)" hidden style="margin-top:8px">
 <label for="dr">هتنزل فين؟</label><select id="dr"></select>
 <input id="dro" placeholder="اكتب اسم محطة النزول" hidden style="margin-top:8px">
 <button class="go" data-a="book" id="bk" style="width:100%;margin-top:14px;padding:13px">احجز</button></div>`;
  $('st').onchange=()=>{$('pko').hidden=$('st').value!=='other'};$('dr').onchange=()=>{$('dro').hidden=$('dr').value!=='other'}}
 else if(tab==='list')a.innerHTML=hd+'<div class="card"><b>قائمة الحجز</b><div id="list"></div></div>';
 else if(tab==='chat')a.innerHTML=hd+chatSkeleton();
 else a.innerHTML=hd+'<div class="card"><b>خط السير</b><div id="mt"></div></div>'}
/* زرار الحجز: متعطّل قبل الميعاد ويتفعّل في الثانية بالظبط (بتوقيت السيرفر) */
function tickBtn(){const c=CARS[0],b=$('bk');if(!c||!b||(R()[2]||'book')!=='book'||c.status!=='open')return;
 const rem=c.book_at?Date.parse(c.book_at)-(Date.now()+skew):0;
 if(rem>0){const s=Math.ceil(rem/1000),m=Math.floor(s/60),t='⏳ يفتح بعد '+(m?m+' دقيقة و ':'')+(s%60)+' ثانية';if(b.textContent!==t)b.textContent=t;b.disabled=true}
 else{if(b.disabled||b.textContent!=='احجز'){b.disabled=false;b.textContent='احجز'}}}
function upd(tab,c){const bs=carB(c),conf=bs.slice(0,capOf(c)),g=grp(c);
 $('hd').innerHTML=`<div class="hd"><div class="top"><h1>${esc(c.name)} ${g?`<span class="tag">${esc(g.name)}</span>`:''}</h1></div>${c.details?`<p class="mut" style="margin:4px 0">${esc(c.details)}</p>`:''}</div>${banHtml(c)}<div class="mini">${cntHtml(c,conf,bs.length-conf.length)}</div>`;
 if(tab==='book'){fillSel(c);const open=c.status==='open';$('fm').hidden=!open;$('pnm').textContent=PN;
  $('nt').innerHTML=open?(opened(c)?'':'<div class="notice">⏳ الحجز لسه مفتحش. جهّز محطتك دلوقتي، وزرار «احجز» هيتفعّل لوحده في الميعاد بالظبط. الأولوية لأسرع حجز.</div>'):'<div class="notice">الحجز مقفول لهذه العربة.</div>';
  $('bres').innerHTML=LAST&&LAST.car===c.id?`<div class="card" style="border:2px solid var(--go)"><div class="top"><b>✅ تم تسجيل حجزك</b><button data-a="bresx" aria-label="إغلاق">✕</button></div><p style="margin:6px 0 0">${esc(LAST.name)} - ${esc(LAST.pos)}</p><p style="margin:4px 0 0">🕒 وقت حجزك بالظبط: <b dir="ltr">${esc(LAST.time)}</b></p></div>`:'';
  tickBtn()}
 else if(tab==='list')$('list').innerHTML=rowsHtml(c,bs,false);
 else if(tab==='chat')updChat();
 else $('mt').innerHTML=metroHtml(c,conf)}
async function doBook(){const c=CARS[0];if(!c||!PN)return;if(c.status!=='open')return toast('الحجز مقفول');
 if(!opened(c))return toast('الحجز لسه مفتحش');
 const sv=$('st').value,pt=$('pko').value.trim(),dv=$('dr').value,drop=dv==='other'?$('dro').value.trim():dv;
 if(carB(c).some(x=>nk(x.name)===nk(PN)))return toast('الاسم ده محجوز بالفعل في العربة دي');
 if(c.capacity!=null&&carB(c).some(x=>x.id in mine))return toast('انت حاجز قبل كده في العربة دي من الجهاز ده');
 if(!sv)return toast('اختار محطة الركوب');
 if(sv==='other'&&pt.length<3)return toast('اكتب وصف مكانك (الشارع / العمارة)');if(drop.length<2)return toast('اختار محطة النزول أو اكتبها');
 const args={p_token:R()[1],p_name:PN,p_stop:sv==='other'?0:+sv,p_pick:sv==='other'?pt:'',p_drop:drop,p_dev:dev};
 let res=null,err=null;
 for(let k=0;k<8;k++){const x=await sb.rpc('book',args);if(!x.error){res=x;break}err=x.error;if(/لسه مفتحش/.test(err.message))await new Promise(z=>setTimeout(z,250));else break}   // لو وصلت قبل السيرفر بأجزاء من الثانية: يعيد المحاولة
 if(!res){toast(err.message);return}
 mine[res.data.id]={s:res.data.secret,n:''};saveMine();loadChat.me=0;$('pko').value='';$('dro').value='';
 await load();
 const cc=CARS[0]||c,pos=carB(cc).findIndex(x=>x.id===res.data.id)+1,cp=capOf(cc);
 LAST={car:cc.id,name:PN,pos:pos<=cp?'رقمك '+pos+' (مؤكد)':'احتياطي رقم '+(pos-cp),time:bt(res.data.created_at,'ms')};render();toast(pos<=cp?`تم حجزك، رقمك ${pos}`:`العربة مكتملة، انت احتياطي رقم ${pos-cp}`)}
async function pageAct(a){
 if(a==='regname'){const n=($('gn').value||'').trim();if(n.length<2)return toast('اكتب اسمك (حرفين على الأقل)');const {data,error}=await sb.rpc('dev_register',{p_dev:dev,p_name:n});if(error)return toast(error.message);PN=data||'';loadChat.me=0;render();return}
 if(a==='rename'){form('تغيير الاسم',[{k:'n',l:'اسمك الجديد (بيتثبت بعد أول حجز أو رسالة)',v:PN}],async v=>{const {data,error}=await sb.rpc('dev_rename',{p_dev:dev,p_name:v.n});if(error)return toast(error.message);PN=data;loadChat.me=0;render();toast('تم تغيير الاسم')});return}
 if(a==='openlink'){const m=(($('lk')||{}).value||'').match(/[0-9a-f]{24}/i);if(!m)return toast('الرابط أو الكود غير صحيح');return go('car/'+m[0].toLowerCase())}
 if(a==='book')return doBook();if(a==='bresx'){LAST=null;render()}}
$('app').addEventListener&&$('app').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='gn'){e.preventDefault();pageAct('regname')}});
setInterval(tickBtn,250);
start();
