const CH='jdr-v17';
const FILES=['./','index.html','style.css?v=17','outils.js?v=17','donnees.js?v=17','carte.js?v=17','v7.js?v=17','v8.js?v=17','v9.js?v=17','jeu.js?v=17','admin.js?v=17','manifest.webmanifest','icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CH).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CH).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CH).then(h=>h.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
