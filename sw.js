/* sw.js - يخلي الموقع يتثبت كتطبيق ويفتح حتى لو النت ضعيف، ويعرض التنبيهات */
const V='hagz-v6';
const ASSETS=['./','index.html','driver.html','admin.html','style.css?v=6','core.js?v=6','passenger.js?v=6','driver.js?v=6','admin.js?v=6','config.js?v=6','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(x){d={title:'حجز العربة',body:e.data?e.data.text():''}}
 e.waitUntil(Promise.all([self.registration.showNotification(d.title||'حجز العربة',{body:d.body||'',icon:'icon-192.png',badge:'icon-192.png',dir:'rtl',lang:'ar',vibrate:[200,100,200],tag:d.tag||'hagz',renotify:true,data:{url:d.url||'./'}}),
  (self.navigator&&self.navigator.setAppBadge)?self.navigator.setAppBadge().catch(()=>{}):Promise.resolve()]))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if(c.url.split('#')[0]===url.split('#')[0]&&'focus' in c){if(c.navigate)c.navigate(url);return c.focus()}}return clients.openWindow(url)}).then(()=>{if(self.navigator&&self.navigator.clearAppBadge)return self.navigator.clearAppBadge()}).catch(()=>{}))});
