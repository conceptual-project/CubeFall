const CACHE='cubefall-v6';
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
  const req=e.request;
  const isNav=req.mode==='navigate';
  e.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(res=>{
        if(res&&res.status===200&&res.type==='basic'){
          const cl=res.clone();
          caches.open(CACHE).then(c=>c.put(req,cl));
        }
        return res;
      }).catch(()=>cached||new Response('Offline',{status:503,statusText:'Offline',headers:{'Content-Type':'text/plain; charset=utf-8'}}));
      // Navigation requests: network-first (users get fresh HTML on update)
      if(isNav){
        return network.then(function(r){return r},function(){return cached});
      }
      // Static assets: stale-while-revalidate (serve cached immediately, refresh in background)
      return cached||network;
    })
  );
});
