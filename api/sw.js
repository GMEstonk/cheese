(() => {
  const cache = {
    set:async(req,res)=>(await caches.open("cheese")).put(req,res?.clone?.()),
    get:async(req,res)=>(await (await caches.open("cheese")).match(req))?.clone?.()
  };
  
  async function then() { };

  function awaitUntil(event, promise) {
    event.waitUntil((async () => {
      await then();
      await promise
      await then();
    })());
    return promise;
  }

  self?.navigator?.serviceWorker?.register?.(self?.document?.currentScript?.src);

  self?.ServiceWorkerGlobalScope && addEventListener?.('install', async (event) => event?.waitUntil?.(self?.skipWaiting?.()));

  self?.ServiceWorkerGlobalScope && addEventListener?.("activate", event => event?.waitUntil?.(clients?.claim?.()));
  
  const rex = RegExp(atob('cG9rZWhlcm9lcy5jb20='),'gi');
  self?.ServiceWorkerGlobalScope && addEventListener?.('fetch', function onRequest(event) {
    
    if(`${event?.request?.url}`.endsWith('.png')){
      return event?.respondWith?.(awaitUntil(event, (async () => {
        let cacheRes = await cache.get(event.request.url);
        if(cacheRes){
            return cacheRes;
        }
        if (rex.test(event?.request?.url)) {
          cacheRes = await fetch(event.request.url.replace(rex,location.host),event.request.clone());
        }else{
          cacheRes = await fetch(event.request);
        }
        if(cacheRes.ok && cacheRes.body && !cacheRes.bodyUsed){
          cache.set(event.request.url,cacheRes);
        }
        return cacheRes;
      })()));
    }
    
    if (rex.test(event?.request?.url)) {
      return event?.respondWith?.(awaitUntil(event, (async () => {
        return await fetch(event.request.url.replace(rex,location.host),event.request.clone());
      })()));
    }
    
    return event?.respondWith?.(awaitUntil(event, fetch(event?.request)));
  });

})();
