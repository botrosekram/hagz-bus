/* admin.js - لوحة المسؤول */
const ADM=[['home','🏠','الرئيسية','#/'],['groups','🗂️','المجموعات','#/groups'],['settings','⚙️','الإعدادات','#/settings']];
const CT=[['control','🎛️','تحكم'],['riders','👥','ركاب'],['stops','🚏','محطات'],['settings','⚙️','إعدادات'],['link','🔗','الرابط']];
function carCard(c){const bs=carB(c),cp=capOf(c),conf=Math.min(bs.length,cp),w=Math.max(0,bs.length-cp),p=cp===Infinity?0:Math.round(conf/cp*100),g=grp(c),cs=P(c).find(s=>s.ord===c.cur),wait=c.status==='open'&&!opened(c);
 return `<article class="cc ${c.status}" data-a="opencar" data-i="${c.id}" tabindex="0" role="button"><div class="ct"><b>${esc(c.name)}</b>${g?`<span class="tag">${esc(g.name)}</span>`:''}</div>
 ${c.details?`<div class="mut sm">${esc(c.details)}</div>`:''}${cp===Infinity?'':`<div class="bar"><i style="width:${p}%"></i></div>`}
 <div class="sm">${cp===Infinity?bs.length+' حاجز (غير محدودة العدد)':conf+'/'+cp+' مقعد'+(w?' - احتياطي '+w:'')}</div>
 <div class="sm mut">${c.depart?'🕒 '+t12(c.depart):''}${wait?' - ⏳ الحجز يفتح '+bt(c.book_at):''}${c.status==='going'&&cs?' - عند: '+esc(cs.name):''} - رحلات سابقة: ${c.trips_done||0}</div>
 <div class="cb"><button data-a="opencar" data-i="${c.id}">فتح والتحكم</button><button data-a="copyp" data-i="${c.id}">🔗 رابط الركاب</button></div></article>`}
function updHome(){const cnf=c=>Math.min(carB(c).length,capOf(c)),wt=c=>Math.max(0,carB(c).length-capOf(c));
 const ac=CARS.filter(c=>filt==='all'||(filt==='none'?!grp(c):c.group_id===+filt));
 const secs=[['🟢 عربات متاحة للحجز',ac.filter(c=>c.status==='open')],['🔒 عربات مغلقة / منتهية',ac.filter(c=>c.status==='closed'||c.status==='done')],['🚌 رحلات جارية الآن',ac.filter(c=>c.status==='going')]];
 const nOpen=CARS.filter(c=>c.status==='open').length,nClosed=CARS.filter(c=>c.status==='closed'||c.status==='done').length,nGo=CARS.filter(c=>c.status==='going').length,nNone=CARS.filter(c=>!grp(c)).length;
 $('tab').innerHTML=`<div class="top"><div><h1>لوحة التحكم</h1><div class="mut sm">المسؤول</div></div><button class="go" data-a="addcar">+ إضافة عربة</button></div>
 <div class="kpis"><div class="kpi"><b>${nOpen}</b>عربات متاحة</div><div class="kpi x"><b>${nClosed}</b>عربات مغلقة</div><div class="kpi a"><b>${nGo}</b>رحلات جارية</div>
 <div class="kpi"><b>${CARS.reduce((a,c)=>a+cnf(c),0)}</b>ركاب مؤكدين</div><div class="kpi x"><b>${CARS.reduce((a,c)=>a+wt(c),0)}</b>احتياطي</div></div>
 <div class="chips"><button class="${filt==='all'?'on':''}" data-a="filt" data-v="all">الكل (${CARS.length})</button>${GR.map(g=>`<button class="${filt==g.id?'on':''}" data-a="filt" data-v="${g.id}">${esc(g.name)} (${CARS.filter(c=>c.group_id===g.id).length})</button>`).join('')}${nNone?`<button class="${filt==='none'?'on':''}" data-a="filt" data-v="none">بدون مجموعة (${nNone})</button>`:''}</div>`
 +secs.map(s=>`<details class="sec" open><summary>${s[0]} <span class="tag">${s[1].length}</span></summary><div class="gr">${s[1].map(carCard).join('')||'<p class="mut">لا توجد عربات هنا.</p>'}</div></details>`).join('')}
function updGroups(){$('gl').innerHTML='<div class="card"><b>المجموعات (الأقسام)</b>'+(GR.map(g=>`<div class="row"><div class="t">${esc(g.name)}<small>${CARS.filter(c=>c.group_id===g.id).length} عربة</small></div><div class="a"><button data-a="gren" data-i="${g.id}">تعديل</button><button data-a="gdel" data-i="${g.id}">✕</button></div></div>`).join('')||'<p class="mut">لا توجد مجموعات</p>')+'</div>'}
function tabLink(c){return `<div class="card"><b>رابط الركاب</b><div class="lk"><input readonly value="${esc(pLink(c.token))}" aria-label="رابط الركاب"><button data-a="copyp" data-i="${c.id}">نسخ</button></div></div>
 <div class="card"><b>رابط السائق</b><div class="lk"><input readonly value="${esc(dLink(c.token))}" aria-label="رابط السائق"><button data-a="copyd" data-i="${c.id}">نسخ</button></div><p class="mut sm" style="margin-bottom:0">السائق بيفتح الرابط ده ويكتب باسورد العربة (بتحدده من تبويب إعدادات).</p></div>
 <div class="card danger"><b>منطقة الخطر (للمسؤول فقط)</b><button data-a="regen" style="width:100%;margin-top:8px">🔄 تغيير الروابط (القديمة بتبطل)</button><button class="red" data-a="delcar" style="width:100%;margin-top:8px">حذف العربة نهائيًا</button></div>`}
function render(){const r=R(),a=$('app');a.className='w'+(role?' wide':'');
 if(!sb){a.innerHTML='<div class="card">الصفحة لسه مش متوصلة بقاعدة البيانات. عدّل ملف config.js.</div>';setNav(null);return}
 if(!role){if(render.k!=='login'){render.k='login';a.innerHTML='<div class="card" style="max-width:380px;margin:30px auto"><b>دخول المسؤول</b><label for="pw">كلمة المرور</label><input id="pw" type="password" autocomplete="off"><button class="go" data-a="alogin" style="width:100%;margin-top:12px">دخول</button></div>'}setNav(null);return}
 if(!loaded){if(render.k!=='ld'){render.k='ld';a.innerHTML='<p class="mut">جارٍ التحميل…</p>'}setNav(null);return}
 if(r[0]==='car'){const c=curCar();if(!c){render.k='nf';a.innerHTML=notFound()+'<div style="text-align:center"><button data-a="go" data-p="">← الرئيسية</button></div>';setNav(null);return}
  const tab=CT.some(t=>t[0]===r[2])?r[2]:'control',key='car/'+c.id+'/'+tab;
  if(render.k!==key){render.k=key;updStops.k='';a.innerHTML='<div id="hd"></div>'+(tab==='stops'?stopsSkeleton():tab==='settings'?settingsSkeleton(c):'<div id="tab"></div>');window.scrollTo(0,0)}
  $('hd').innerHTML=carHead(c,'<div style="margin-top:8px"><button data-a="go" data-p="">← لوحة التحكم</button></div>');
  if(tab==='control')$('tab').innerHTML=tabControl(c);else if(tab==='riders')$('tab').innerHTML=tabRiders(c);else if(tab==='link')$('tab').innerHTML=tabLink(c);else if(tab==='stops')updStops(c);
  setNav(CT.map(t=>({h:`#/car/${c.id}/${t[0]}`,i:t[1],l:t[2],on:t[0]===tab})));return}
 const tab=r[0]==='groups'?'groups':r[0]==='settings'?'settings':'home';
 if(render.k!==tab){render.k=tab;window.scrollTo(0,0);
  a.innerHTML=tab==='home'?'<div id="tab"></div>':tab==='groups'?'<div class="hd"><h1>المجموعات</h1></div><div id="gl"></div><div class="card"><b>إضافة مجموعة</b><label>الاسم<input id="gn" placeholder="مثلًا: جامعات"></label><button class="go" data-a="gadd" style="width:100%;margin-top:10px">إضافة</button></div>'
   :'<div class="hd"><h1>الإعدادات</h1></div><div class="card"><b>تغيير باسورد المسؤول</b><label>الباسورد الجديد (4 أحرف على الأقل)<input id="np" type="password" autocomplete="off"></label><button class="go" data-a="pws" style="width:100%;margin-top:10px">تغيير الباسورد</button></div><div class="card"><button data-a="out" style="width:100%">تسجيل خروج</button></div>'}
 if(tab==='home')updHome();else if(tab==='groups')updGroups();
 setNav(ADM.map(t=>({h:t[3],i:t[1],l:t[2],on:t[0]===tab})))}
$('app').onkeydown=e=>{if(e.key==='Enter'&&e.target.id==='pw'){const b=$('app').querySelector('[data-a=alogin]');b&&b.click()}};
async function pageAct(a,b,i,car){
 switch(a){
 case 'alogin':{const pw=$('pw').value;const {data}=await sb.rpc('admin_login',{pw});if(!data)return toast('كلمة المرور غير صحيحة');role='admin';PW=pw;ssSet('adm',pw);await load();break}
 case 'opencar':go('car/'+i+'/control');break;
 case 'copyp':{const c=CARS.find(y=>y.id===i);if(c)copy(pLink(c.token),'تم نسخ رابط الركاب');break}
 case 'copyd':{const c=CARS.find(y=>y.id===i);if(c)copy(dLink(c.token),'تم نسخ رابط السائق');break}
 case 'filt':filt=b.dataset.v;render();break;
 case 'addcar':form('إضافة عربة جديدة',carFields(null,false),v=>saveCar(v,null,false));break;
 case 'regen':if(confirm('تغيير روابط '+car.name+'؟ الروابط القديمة هتبطل تفتح فورًا، وهتبعت الجديدة للركاب والسائق (التفاصيل والحجوزات بتفضل زي ما هي).')){const r=await rpc('staff_regen_token',{pw:PW,p_id:car.id});if(r)showCreds(r.data,null)}break;
 case 'delcar':if(confirm('حذف '+car.name+' نهائيًا مع كل حجوزاتها؟')&&confirm('متأكد؟ الروابط بتاعتها هتبطل تفتح ومفيش رجوع')){const r=await rpc('staff_delete_car',{pw:PW,p_id:car.id},'تم حذف العربة والروابط بتاعتها');if(r)go('')}break;
 case 'gadd':{const n=$('gn').value.trim();if(n.length<2)return toast('اكتب اسم المجموعة');const r=await rpc('staff_add_group',{pw:PW,p_name:n},'تمت الإضافة');if(r)$('gn').value='';break}
 case 'gren':{const g=GR.find(y=>y.id===i),n=prompt('الاسم الجديد',g.name);if(n&&n.trim().length>1)rpc('staff_rename_group',{pw:PW,p_id:i,p_name:n},'تم التعديل');break}
 case 'gdel':{const g=GR.find(y=>y.id===i);if(confirm('حذف مجموعة '+g.name+'؟ العربات اللي فيها هتفضل موجودة بدون مجموعة.'))rpc('staff_delete_group',{pw:PW,p_id:i},'تم الحذف');break}
 case 'pws':{const v=$('np').value;if(v.length<4)return toast('4 أحرف على الأقل');const r=await rpc('staff_set_pw',{pw:PW,newpw:v},'تم تغيير الباسورد');if(r){PW=v;ssSet('adm',v);$('np').value=''}break}
 }}
start();
