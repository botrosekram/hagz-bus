/* core.js - الجزء المشترك بين صفحات الراكب والسائق والمسؤول */
const $=i=>document.getElementById(i),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sb=(typeof SUPABASE_URL!=='undefined'&&SUPABASE_URL)?supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
let B=[],ST=[],CARS=[],GR=[],role=null,PW='',notes={},mine={},prev=null,filt='all',loaded=false,LAST=null,skew=0;
try{mine=JSON.parse(localStorage.getItem('mine2')||'{}')}catch(e){}
const saveMine=()=>{try{localStorage.setItem('mine2',JSON.stringify(mine))}catch(e){}};
const dev=(()=>{try{let d=localStorage.getItem('dev1');if(!d){d=[...Array(24)].map(()=>Math.floor(Math.random()*16).toString(16)).join('');localStorage.setItem('dev1',d)}return d}catch(e){return ''}})();
const nk=s=>String(s||'').trim().replace(/\s+/g,' ').toLowerCase();
const ss=k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},ssSet=(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},ssDel=k=>{try{sessionStorage.removeItem(k)}catch(e){}};
const P=c=>c?ST.filter(s=>s.car_id===c.id&&s.kind==='pickup').sort((a,b)=>a.ord-b.ord):[],D=c=>c?ST.filter(s=>s.car_id===c.id&&s.kind==='drop').sort((a,b)=>a.ord-b.ord):[],nm=id=>(ST.find(s=>s.id===id)||{}).name||'؟';
const carB=c=>c?B.filter(x=>x.car_id===c.id):[],grp=c=>c.group?{name:c.group}:GR.find(g=>g.id===c.group_id);
const R=()=>location.hash.replace(/^#\/?/,'').split('/').filter(Boolean),go=p=>{location.hash='#/'+p};
const curCar=()=>{const r=R();if(APP==='admin')return r[0]==='car'?CARS.find(c=>c.id===+r[1]):null;return CARS[0]};
const base=()=>location.href.split('#')[0].replace(/[^\/]*$/,'');
const pLink=t=>base()+'#/car/'+t,dLink=t=>base()+'driver.html#/car/'+t;
const STL={open:'متاحة',closed:'مغلقة',going:'في رحلة',done:'منتهية'};
const capOf=c=>c.capacity==null?Infinity:c.capacity;
const opened=c=>!c.book_at||Date.now()+skew>=Date.parse(c.book_at);
async function copy(t,msg){try{await navigator.clipboard.writeText(t);toast(msg||'تم النسخ')}catch(e){prompt('انسخ:',t)}}
function toast(m){const t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',4500)}
function setNav(items){const n=$('nav'),h=items?items.map(i=>`<a href="${i.h}" class="${i.on?'on':''}"><b>${i.i}</b>${i.l}</a>`).join(''):'';if(setNav.h===h)return;setNav.h=h;n.hidden=!items;n.innerHTML=h}

/* ---- وقت 12 ساعة (بتوقيت القاهرة) ---- */
const t12=s=>{if(!s)return'';let[h,m]=s.split(':').map(Number);const ap=h>=12?'م':'ص';h=h%12||12;return h+':'+String(m).padStart(2,'0')+' '+ap};
const HR=[...Array(12)].map((_,i)=>[i+1,String(i+1)]),MN=[...Array(60)].map((_,i)=>[i,String(i).padStart(2,'0')]);
const to24=(h,m,ap)=>ap?String((+h%12)+(ap==='م'?12:0)).padStart(2,'0')+':'+String(+m).padStart(2,'0'):'';
const from24=s=>{if(!s)return{h:7,m:0,ap:''};const[h,m]=s.split(':').map(Number);return{h:h%12||12,m:m,ap:h>=12?'م':'ص'}};
const bt=(iso,sec)=>{const d=new Date(iso),z='Africa/Cairo',day=x=>x.toLocaleDateString('en-CA',{timeZone:z});
 const o={timeZone:z,hour:'numeric',minute:'2-digit',hour12:true};if(sec)o.second='2-digit';if(sec==='ms')o.fractionalSecondDigits=3;
 const t=new Intl.DateTimeFormat('en-US',o).format(d).replace('AM','ص').replace('PM','م');
 const n=new Date(),y=new Date(n.getTime()-864e5),tm=new Date(n.getTime()+864e5),dd=day(d);
 const lb=dd===day(n)?'اليوم':dd===day(y)?'امبارح':dd===day(tm)?'بكرة':new Intl.DateTimeFormat('en-GB',{timeZone:z,day:'numeric',month:'numeric'}).format(d);
 return lb+' '+t};
const cz=iso=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Africa/Cairo',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date(iso)).map(x=>[x.type,x.value]));
const cairoToIso=(d,t)=>{const g=new Date(d+'T'+t+':00Z'),p=cz(g);return new Date(g.getTime()-(Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute)-g.getTime())).toISOString()};
const isoToCairo=iso=>{if(!iso)return{d:'',t:''};const p=cz(iso);return{d:p.year+'-'+p.month+'-'+p.day,t:p.hour+':'+p.minute}};

/* ---- الدخول والبيانات ---- */
async function auth(){const r=R();role=null;PW='';
 if(APP==='driver'&&r[0]==='car'&&r[1]){for(const pw of [ss('drv:'+r[1]),ss('adm')]){if(!pw)continue;const {data}=await sb.rpc('driver_login',{p_token:r[1],pw});if(data){role=data;PW=pw;return}}}
 else if(APP==='admin'){const pw=ss('adm');if(pw){const {data}=await sb.rpc('admin_login',{pw});if(data){role='admin';PW=pw}}}}
function logout(){const r=R();if(role==='admin')ssDel('adm');if(APP==='driver'&&r[1])ssDel('drv:'+r[1]);role=null;PW='';notes={};load()}
async function rpc(fn,args,ok){const {data,error}=await sb.rpc(fn,args);
 if(error){toast(error.message);if(error.message.includes('كلمة المرور غير صحيحة'))logout();return null}
 if(ok)toast(ok);await load();return {data}}
const confIds=()=>CARS.flatMap(c=>carB(c).slice(0,capOf(c)).map(x=>x.id));
async function load(){if(!sb)return;const r=R();
 if(APP==='admin'){if(role==='admin'){const {data,error}=await sb.rpc('admin_data',{pw:PW});if(error){logout();return}CARS=data.cars;GR=data.groups;B=data.bookings;ST=data.stops;skew=Date.parse(data.now)-Date.now()}else{CARS=[];B=[];GR=[];ST=[]}}
 else if(r[0]==='car'&&r[1]){const {data,error}=await sb.rpc('car_view',{p_token:r[1]});if(error){toast('تعذر الاتصال: '+error.message);return}
  CARS=data?[data.car]:[];B=data?data.bookings:[];ST=data?data.stops:[];GR=[];if(data)skew=Date.parse(data.now)-Date.now()}
 else{CARS=[];B=[];GR=[];ST=[]}
 const nc=role&&curCar();notes={};
 if(nc){const n=await sb.rpc('staff_notes',{pw:PW,p_car:nc.id});if(n.error){logout();return}n.data.forEach(x=>notes[x.booking_id]=x.note)}
 const old=prev,conf=confIds();loaded=true;
 if(old){const was=new Set(old.all),oc=new Set(old.conf);const up=B.filter(x=>conf.includes(x.id)&&!oc.has(x.id)&&was.has(x.id));
  if(up.length)toast('اتأكد حجز '+up.map(x=>x.name).join(' و ')+' بدل المعتذر')}
 prev={all:B.map(x=>x.id),conf};render()}
function start(){if(!sb){render();return}
 window.onhashchange=async()=>{loaded=false;CARS=[];B=[];ST=[];prev=null;LAST=null;render();await auth();await load()};
 (async()=>{await auth();await load();setInterval(()=>{if(!document.hidden)load()},5000)})()}

/* ---- مكونات العرض المشتركة ---- */
const banner=c=>{const dp=c.depart?' - موعد الانطلاق '+t12(c.depart):'',cs=P(c).find(s=>s.ord===c.cur);
 return c.status==='open'?(opened(c)?'الحجز مفتوح - الرحلة لم تبدأ بعد'+dp:'⏳ الحجز لسه مفتحش - هيفتح '+bt(c.book_at)+dp):c.status==='closed'?'الحجز مقفول'+dp:c.status==='going'?'السائق بدأ الرحلة - العربة دلوقتي عند: '+(cs?cs.name:'—')+dp:'انتهت الرحلة'};
const banHtml=c=>`<div class="ban${c.status==='going'?' g':''}" aria-live="polite">${esc(banner(c))}</div>`;
function metroHtml(c,conf){const PS=P(c),going=c.status==='going'||c.status==='done';
 if(!PS.length)return '<p class="mut">لسه مفيش محطات في خط السير.'+(role?' ضيفها من تبويب المحطات.':'')+'</p>';
 const o=conf.filter(x=>!x.stop_id).length;
 return '<ol class="m">'+PS.map((s,i)=>{const k=conf.filter(x=>x.stop_id===s.id).length,cl=c.status==='done'||(going&&c.cur>s.ord)?'p':(going&&c.cur===s.ord?'c':'');
  return `<li class="${cl}"><span class="dot">${i+1}</span><div class="nm"><span>${cl==='c'?'<b>'+esc(s.name)+'</b>':esc(s.name)}</span>${k?`<span class="chip">${k} صعود</span>`:''}</div></li>`}).join('')+'</ol>'+(o?`<p class="mut sm">+ ${o} راكب بأماكن ركوب مكتوبة بالوصف (شوف القايمة)</p>`:'')}
function cntHtml(c,conf,w){return c.capacity==null?`<div class="cnt"><div><b>${conf.length}</b>عدد الحاجزين (غير محدود)</div></div>`:`<div class="cnt"><div><b>${conf.length}</b>مؤكد من ${c.capacity}</div><div><b>${w}</b>احتياطي</div><div><b>${Math.max(0,c.capacity-conf.length)}</b>مقاعد فاضية</div></div>`}
function rowsHtml(c,bs,staff){const cap=capOf(c),open=c.status==='open';
 const row=(x,i)=>{const m=x.id in mine;
  const nt=staff&&notes[x.id]?`<small>📝 ${esc(notes[x.id])}</small>`:(m&&mine[x.id].n?'<small>📝 ملاحظتك اتبعتت للسائق</small>':'');
  const act=(staff?`<button data-a="edit" data-i="${x.id}">تعديل</button><button data-a="up" data-i="${x.id}" aria-label="أعلى">↑</button><button data-a="dn" data-i="${x.id}" aria-label="أسفل">↓</button><button data-a="del" data-i="${x.id}" aria-label="حذف">✕</button>`:'')
   +(m&&open&&!staff?`<button data-a="note" data-i="${x.id}" aria-label="ملاحظة">✏️</button><button data-a="cancel" data-i="${x.id}">إلغاء</button>`:'');
  const from=x.stop_id?esc(nm(x.stop_id)):'📍 '+esc(x.pickup_text||'—');
  return `<div class="row"><span class="no ${i<cap?'':'w'}">${i+1}</span><div class="t">${esc(x.name)}${m?' (أنت)':''}<small>${i<cap?(cap===Infinity?'محجوز':'مؤكد'):'احتياطي رقم '+(i-cap+1)} - من ${from} إلى ${esc(x.drop_name||'—')}</small>${x.created_at?`<small>🕒 وقت الحجز: ${bt(x.created_at,'ms')}</small>`:''}${nt}</div><div class="a">${act}</div></div>`};
 if(!bs.length)return '<p class="mut">مفيش حجوزات لسه على العربة دي.</p>';
 const n=Math.min(bs.length,cap),all=bs.map(row);
 return (cap===Infinity?'':`<div class="sh">✅ المقاعد المؤكدة (${n} من ${cap}) - بالأسبق في الحجز (بالثانية)</div>`)+all.slice(0,n).join('')
  +(bs.length>n?`<div class="sh w">⏳ قائمة الاحتياطي (${bs.length-n}) - بتتأكد تلقائي لو حد اعتذر</div>`+all.slice(n).join(''):'')}
function sumHtml(c,conf){const oth=conf.filter(x=>!x.stop_id);
 return P(c).map((p,i)=>{const l=conf.filter(x=>x.stop_id===p.id);return `<details ${l.length?'open':''}><summary>${i+1}. ${esc(p.name)} - ${l.length} راكب</summary>${l.map(x=>`<div>${esc(x.name)} ← ${esc(x.drop_name||'—')}${notes[x.id]?' - 📝 '+esc(notes[x.id]):''}</div>`).join('')||'<div class="mut">لا أحد</div>'}</details>`}).join('')
 +(oth.length?`<details open><summary>📍 أماكن أخرى (بالوصف) - ${oth.length} راكب</summary>${oth.map(x=>`<div>${esc(x.name)} - ${esc(x.pickup_text||'')} ← ${esc(x.drop_name||'—')}${notes[x.id]?' - 📝 '+esc(notes[x.id]):''}</div>`).join('')}</details>`:'')}
const notFound=()=>`<div class="card" style="text-align:center;margin-top:40px"><h2>الرابط ده مش موجود</h2><p class="mut">الرابط غير صحيح أو اتحذف أو اتغيّر. اطلب رابط جديد من المسؤول.</p></div>`;

/* ---- شاشات التحكم المشتركة (سائق + مسؤول) ---- */
function carHead(c,extra){const g=grp(c);return `<div class="hd"><div class="top"><h1>${esc(c.name)} ${g?`<span class="tag">${esc(g.name)}</span>`:''}</h1><span class="stt ${c.status}">${STL[c.status]}</span></div>${c.details?`<p class="mut" style="margin:4px 0">${esc(c.details)}</p>`:''}<div class="mut sm">🚌 الرحلات السابقة: <b>${c.trips_done||0}</b>${c.capacity==null?' - غير محدودة العدد':' - '+c.capacity+' مقعد'}</div>${extra||''}</div>`}
function ctlHtml(c){const s=c.status,PS=P(c);
 return `<div class="ctl"><button class="go" data-a="start" ${s==='open'||s==='closed'?'':'disabled'}>بدء الرحلة</button><button data-a="next" ${s==='going'&&PS.some(p=>p.ord>c.cur)?'':'disabled'}>وصلنا المحطة التالية</button><button class="red" data-a="end" ${s==='going'?'':'disabled'}>إنهاء الرحلة</button>
 ${s==='open'?(!opened(c)?'<button data-a="openb">فتح الحجز الآن</button>':'<button data-a="closeb">قفل الحجز</button>'):s==='closed'||(s==='done'&&APP==='admin')?'<button data-a="openb">فتح الحجز</button>':'<button disabled>الحجز مقفول</button>'}
 <button data-a="sched" ${s==='open'||s==='closed'?'':'disabled'}>⏳ تحديد موعد فتح الحجز</button></div>`}
function tabControl(c){const bs=carB(c),conf=bs.slice(0,capOf(c));
 return banHtml(c)+cntHtml(c,conf,bs.length-conf.length)+`<div class="card"><b>التحكم في الرحلة</b>${ctlHtml(c)}</div><div class="card"><b>خط السير</b>${metroHtml(c,conf)}</div>`}
function tabRiders(c){const bs=carB(c),conf=bs.slice(0,capOf(c));
 return `<div style="margin-top:14px"><button class="go" data-a="addp" style="width:100%">+ إضافة راكب يدويًا</button></div>${cntHtml(c,conf,bs.length-conf.length)}<div class="card"><b>قائمة الحجز</b>${rowsHtml(c,bs,true)}</div><div class="card"><b>كشف الركاب بالمحطات</b>${sumHtml(c,conf)}</div>`}

/* المحطات (لكل عربة محطاتها) - الفورم بتتبني مرة واحدة والقوايم بتتحدث */
const stopsSkeleton=()=>`<div id="sl"></div><div class="card"><b>إضافة محطة</b>
 <label>النوع<select id="ak"><option value="pickup">ركوب (في خط السير)</option><option value="drop">نزول</option></select></label>
 <label>الاسم<input id="an"></label><label>مكانها<select id="aa"></select></label>
 <button class="go" data-a="addstop" style="width:100%;margin-top:10px">إضافة المحطة</button></div>`;
function fillAfter(c){const a=$('aa');if(!a)return;const v=a.value,k=$('ak').value;a.innerHTML='<option value="0">في الآخر</option><option value="-1">في الأول</option>'+(k==='pickup'?P(c):D(c)).map(s=>`<option value="${s.id}">بعد: ${esc(s.name)}</option>`).join('');if(v)a.value=v}
function updStops(c){const li=l=>l.map(s=>`<div class="row"><div class="t">${esc(s.name)}</div><div class="a"><button data-a="rens" data-i="${s.id}">تعديل</button><button data-a="delstop" data-i="${s.id}">✕</button></div></div>`).join('')||'<p class="mut sm">لسه مفيش محطات.</p>';
 $('sl').innerHTML=`<div class="card"><b>محطات الركوب (خط السير) - بالترتيب</b>${li(P(c))}</div><div class="card"><b>محطات النزول</b>${li(D(c))}</div>`;
 const k=JSON.stringify(ST.filter(s=>s.car_id===c.id).map(s=>s.id));if(updStops.k!==k){updStops.k=k;fillAfter(c)}
 $('ak').onchange=()=>fillAfter(curCar())}

/* إعدادات الرحلة (فورم داخل الصفحة) */
function carFields(c,drv){const f=c&&c.depart?from24(c.depart):{h:7,m:0,ap:''},ob=isoToCairo(c&&c.book_at),bf=ob.t?from24(ob.t):{h:7,m:0,ap:'ص'};
 return [
  {k:'n',l:'اسم العربة / الرحلة',v:c?c.name:''},
  ...(drv?[]:[{k:'g',l:'المجموعة (القسم)',t:'sel',o:[['','بدون مجموعة'],...GR.map(g=>[g.id,g.name]),['new','+ مجموعة جديدة']],v:c&&c.group_id||''},
  {k:'g2',l:'اسم المجموعة الجديدة (لو اخترت + مجموعة جديدة)',v:''}]),
  {k:'cm',l:'نوع العربة',t:'sel',o:[['l','محدودة العدد (مقاعد + احتياطي)'],['u','غير محدودة العدد (بدون احتياطي)']],v:c&&c.capacity==null?'u':'l'},
  {k:'c',l:'عدد المقاعد (للمحدودة فقط)',t:'number',v:c&&c.capacity?c.capacity:14},
  {k:'d',l:'التفاصيل (مثلًا: اسم المدرسة أو مصنع أو المكان)',t:'area',v:c&&c.details||''},
  {k:'h',l:'موعد انطلاق الرحلة - الساعة',t:'sel',o:HR,v:f.h},{k:'m',l:'الدقيقة',t:'sel',o:MN,v:f.m},
  {k:'a',l:'صباحًا / مساءً',t:'sel',o:[['','بدون موعد'],['ص','ص (صباحًا)'],['م','م (مساءً)']],v:f.ap},
  {k:'bd',l:'⏳ فتح الحجز تلقائيًا - التاريخ (اتركه فاضي = الحجز مفتوح فورًا)',t:'date',v:ob.d},
  {k:'bh',l:'ساعة فتح الحجز',t:'sel',o:HR,v:bf.h},{k:'bm',l:'الدقيقة',t:'sel',o:MN,v:bf.m},
  {k:'ba',l:'صباحًا / مساءً',t:'sel',o:[['ص','ص (صباحًا)'],['م','م (مساءً)']],v:bf.ap||'ص'},
  {k:'w',l:c?'باسورد سائق جديد (اتركه فاضي للإبقاء على القديم)':'باسورد السائق (اتركه فاضي ويتولّد تلقائي)',t:'text',v:''}]}
async function saveCar(v,c,drv){let g=v.g;if(!drv&&g==='new'){if((v.g2||'').trim().length<2)return toast('اكتب اسم المجموعة الجديدة');const r=await rpc('staff_add_group',{pw:PW,p_name:v.g2});if(!r)return;g=r.data}
 if(!v.n.trim())return toast('اكتب اسم العربة');
 const a={p_name:v.n,p_cap:v.cm==='u'?null:(+v.c||14),p_details:v.d,p_depart:to24(v.h,v.m,v.a),p_dpw:v.w,p_bookat:v.bd?cairoToIso(v.bd,to24(v.bh,v.bm,v.ba)):null};
 if(c&&drv){await rpc('staff_edit_car_drv',{pw:PW,p_car:c.id,...a},'تم حفظ التعديلات')}
 else if(c){const r=await rpc('staff_edit_car',{pw:PW,p_id:c.id,p_group:g?+g:null,...a},'تم حفظ التعديلات');if(r&&v.w.trim())toast('تم حفظ التعديلات وتغيير باسورد السائق')}
 else{const r=await rpc('staff_add_car',{pw:PW,p_group:g?+g:null,...a});if(r&&r.data)showCreds(r.data.token,r.data.pw||v.w.trim())}}
const settingsSkeleton=c=>`<div class="card"><b>بيانات الرحلة</b><form id="sf" onsubmit="return false">${fieldsHtml(carFields(c,APP==='driver'))}<button type="button" class="go" data-a="savecar" style="width:100%;margin-top:14px;padding:13px">حفظ التعديلات</button></form></div>
 <div class="card danger"><b>منطقة الخطر</b><p class="mut sm">تصفير الرحلة بيمسح كل الحجوزات والملاحظات ويبدأ رحلة جديدة من الأول.</p><button class="red" data-a="reset" style="width:100%">♻️ تصفير الرحلة (رحلة جديدة)</button></div>`;

/* ---- نوافذ الفورم ---- */
const fieldsHtml=fields=>fields.map(f=>`<label>${f.l}`+(f.t==='sel'?`<select name="${f.k}">${f.o.map(o=>`<option value="${esc(o[0])}" ${String(o[0])===String(f.v)?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`:f.t==='area'?`<textarea name="${f.k}" rows="3">${esc(f.v)}</textarea>`:`<input name="${f.k}" type="${f.t||'text'}" value="${esc(f.v)}" ${f.dl?'list="dl"':''}>`)+'</label>').join('')+`<datalist id="dl">${D(curCar()).map(x=>`<option value="${esc(x.name)}">`).join('')}</datalist>`;
function form(title,fields,ok){$('dt').textContent=title;$('df').innerHTML=fieldsHtml(fields);
 $('dok').onclick=e=>{e.preventDefault();const v={};new FormData($('dform')).forEach((x,k)=>v[k]=x);$('dlg').close();ok(v)};$('dlg').showModal()}
const pk=()=>[...P(curCar()).map(s=>[s.id,s.name]),[0,'أخرى (اكتب الوصف تحت)']];
const showCreds=(token,pw)=>form(pw?'تم! احفظ البيانات دي':'الروابط الجديدة',[{k:'l',l:'رابط الركاب',v:pLink(token)},{k:'l2',l:'رابط السائق',v:dLink(token)},...(pw?[{k:'p',l:'باسورد السائق (بيظهر مرة واحدة)',v:pw}]:[])],()=>copy(pLink(token),'تم نسخ رابط الركاب'));
function passForm(x,cid){const c=curCar(),p0=P(c)[0];form(x?'تعديل بيانات الراكب':'إضافة راكب',[{k:'n',l:'الاسم',v:x?x.name:''},{k:'s',l:'محطة الركوب',t:'sel',o:pk(),v:x?(x.stop_id||0):(p0?p0.id:0)},{k:'t',l:'وصف المكان (لو اخترت أخرى)',v:x&&x.pickup_text||''},{k:'d',l:'محطة النزول (اختار أو اكتب)',v:x&&x.drop_name||'',dl:1}],
 v=>v.n.trim().length>1&&(x?rpc('staff_edit',{pw:PW,p_id:x.id,p_name:v.n,p_stop:+v.s,p_pick:v.t,p_drop:v.d},'تم التعديل'):rpc('staff_add',{pw:PW,p_car:cid,p_name:v.n,p_stop:+v.s,p_pick:v.t,p_drop:v.d},'تمت الإضافة')))}

/* ---- الأحداث المشتركة ---- */
async function onAct(e){const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,i=+b.dataset.i||0,car=curCar(),cid=car?car.id:0,x=B.find(y=>y.id===i);
 const trip=act=>rpc('staff_trip',{pw:PW,p_car:cid,act});
 switch(a){
 case 'go':go(b.dataset.p);break;
 case 'out':logout();break;
 case 'start':confirm('بدء رحلة '+car.name+' وقفل الحجز؟')&&trip('start');break;
 case 'next':trip('next');break;
 case 'end':confirm('إنهاء رحلة '+car.name+'؟')&&trip('end');break;
 case 'closeb':trip('close');break;
 case 'openb':trip('open');break;
 case 'reset':confirm('تصفير '+car.name+' وبدء رحلة جديدة؟ هيتمسح كل الحجوزات والملاحظات')&&confirm('متأكد؟ مفيش رجوع')&&trip('reset');break;
 case 'sched':{const ob=isoToCairo(car.book_at),bf=ob.t?from24(ob.t):{h:7,m:0,ap:'ص'};form('تحديد موعد فتح الحجز - '+car.name,[
  {k:'bd',l:'التاريخ',t:'date',v:ob.d||isoToCairo(new Date().toISOString()).d},{k:'bh',l:'الساعة',t:'sel',o:HR,v:bf.h},{k:'bm',l:'الدقيقة',t:'sel',o:MN,v:bf.m},{k:'ba',l:'صباحًا / مساءً',t:'sel',o:[['ص','ص (صباحًا)'],['م','م (مساءً)']],v:bf.ap||'ص'},
  {k:'x',l:'الإجراء',t:'sel',o:[['s','حفظ الموعد - الحجز يفتح تلقائيًا فيه'],['c','إلغاء الجدولة - الحجز يفتح فورًا']],v:'s'}],
  v=>{const off=v.x==='c'||!v.bd;rpc('staff_set_bookat',{pw:PW,p_car:cid,p_bookat:off?null:cairoToIso(v.bd,to24(v.bh,v.bm,v.ba))},off?'تم إلغاء الجدولة':'تم حفظ موعد فتح الحجز')});break}
 case 'addp':passForm(null,cid);break;
 case 'edit':passForm(x,cid);break;
 case 'del':confirm('حذف '+x.name+'؟')&&rpc('staff_delete',{pw:PW,p_id:i},'تم الحذف');break;
 case 'up':rpc('staff_move',{pw:PW,p_id:i,p_dir:-1});break;
 case 'dn':rpc('staff_move',{pw:PW,p_id:i,p_dir:1});break;
 case 'addstop':{const n=$('an').value.trim();if(n.length<2)return toast('اكتب اسم المحطة');const r=await rpc('staff_add_stop',{pw:PW,p_car:cid,p_kind:$('ak').value,p_name:n,p_after:+$('aa').value},'تمت إضافة المحطة');if(r)$('an').value='';break}
 case 'rens':{const s=ST.find(y=>y.id===i),n=prompt('الاسم الجديد للمحطة',s.name);if(n&&n.trim().length>1)rpc('staff_rename_stop',{pw:PW,p_id:i,p_name:n},'تم التعديل');break}
 case 'delstop':{const s=ST.find(y=>y.id===i);confirm('حذف محطة '+s.name+'؟')&&rpc('staff_delete_stop',{pw:PW,p_id:i},'تم الحذف');break}
 case 'savecar':{const v={};new FormData($('sf')).forEach((y,k)=>v[k]=y);saveCar(v,car,APP==='driver');break}
 case 'note':form('ملاحظة للسائق',[{k:'n',l:'اكتب ملاحظتك (السائق والمسؤولين بس هيشوفوها)',t:'area',v:mine[i]?mine[i].n:''}],async v=>{const r=await rpc('set_note',{p_id:i,p_secret:mine[i].s,p_note:v.n},'تم حفظ الملاحظة');if(r){mine[i].n=v.n.trim();saveMine();render()}});break;
 case 'cancel':if(confirm('إلغاء حجزك؟'))rpc('cancel_mine',{p_id:i,p_secret:mine[i].s},'تم إلغاء حجزك').then(r=>{if(r){delete mine[i];saveMine()}});break;
 default:if(typeof pageAct==='function')await pageAct(a,b,i,car)}}
$('app').onclick=onAct;
