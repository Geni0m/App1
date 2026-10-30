const CH='jdr-v14';
const FILES=['./','index.html','style.css?v=14','outils.js?v=14','donnees.js?v=14','carte.js?v=14','jeu.js?v=14','admin.js?v=14','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CH).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CH).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CH).then(h=>h.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
