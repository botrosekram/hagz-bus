/* driver.js - صفحة السائق (لعربته بس) */
const TABS=[['control','🎛️','التحكم'],['riders','👥','الركاب'],['stops','🚏','المحطات'],['settings','⚙️','الإعدادات']];
function render(){const r=R(),a=$('app');
 if(!sb){a.innerHTML='<div class="card">الصفحة لسه مش متوصلة بقاعدة البيانات. عدّل ملف config.js.</div>';setNav(null);return}
 if(r[0]!=='car'||!r[1]){render.k='home';a.innerHTML='<div class="card" style="text-align:center;margin-top:40px"><h1>🚐 صفحة السائق</h1><p class="mut">ادخل من رابط السائق الخاص بعربتك اللي بعتهولك المسؤول.</p></div>';setNav(null);return}
 if(!loaded){if(render.k!=='ld'){render.k='ld';a.innerHTML='<p class="mut">جارٍ التحميل…</p>'}setNav(null);return}
 const c=CARS[0];if(!c){render.k='nf';a.innerHTML=notFound();setNav(null);return}
 if(!role){if(render.k!==r[1]+'|login'){render.k=r[1]+'|login';a.innerHTML=`<div class="card" style="max-width:380px;margin:30px auto"><b>دخول السائق</b><div class="mut sm">${esc(c.name)}</div><label for="pw">باسورد السائق</label><input id="pw" type="password" autocomplete="off"><button class="go" data-a="dlogin" style="width:100%;margin-top:12px">دخول</button></div>`}setNav(null);return}
 const tab=TABS.some(t=>t[0]===r[2])?r[2]:'control',key=r[1]+'|'+tab+'|'+role;
 if(render.k!==key){render.k=key;updStops.k='';a.innerHTML='<div id="hd"></div>'+(tab==='stops'?stopsSkeleton():tab==='settings'?settingsSkeleton(c):'<div id="tab"></div>');window.scrollTo(0,0)}
 $('hd').innerHTML=carHead(c,`<div style="margin-top:8px"><button data-a="out">خروج (${role==='admin'?'مسؤول':'سائق'})</button></div>`);
 if(tab==='control')$('tab').innerHTML=tabControl(c);else if(tab==='riders')$('tab').innerHTML=tabRiders(c);else if(tab==='stops')updStops(c);
 setNav(TABS.map(t=>({h:`#/car/${r[1]}/${t[0]}`,i:t[1],l:t[2],on:t[0]===tab})))}
$('app').onkeydown=e=>{if(e.key==='Enter'&&e.target.id==='pw'){const b=$('app').querySelector('[data-a=dlogin]');b&&b.click()}};
async function pageAct(a){if(a==='dlogin'){const t=R()[1],pw=$('pw').value;const {data}=await sb.rpc('driver_login',{p_token:t,pw});if(!data)return toast('الباسورد غير صحيح');role=data;PW=pw;ssSet(data==='admin'?'adm':'drv:'+t,pw);await load()}}
start();
