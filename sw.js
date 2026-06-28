const CACHE='cubefall-v4';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(res=>{
        if(res && res.status===200 && res.type==='basic'){
          const cl=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,cl));
        }
        return res;
      }).catch(()=>new Response('Offline',{status:503,statusText:'Offline',headers:{'Content-Type':'text/plain; charset=utf-8'}}));
    })
  );
});
