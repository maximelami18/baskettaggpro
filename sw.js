var CACHE_NAME = 'btp-shell-v1';
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(['./', './index.html']);
    })
  );
});
self.addEventListener('activate', function(e){
  e.waitUntil(Promise.all([
    clients.claim(),
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){return n!==CACHE_NAME;}).map(function(n){return caches.delete(n);}));
    })
  ]));
});
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res&&res.ok&&e.request.url.indexOf(self.location.origin)===0){
        var clone=res.clone();
        caches.open(CACHE_NAME).then(function(cache){cache.put(e.request,clone);});
      }
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){return cached||caches.match('./index.html');});
    })
  );
});
