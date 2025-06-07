(() => {
  
  const cache = {
    set:(req,res)=>{
      const resClone = res?.clone?.();
      return (async()=>(await caches.open("cheese")).put(req,resClone))();
    },
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
    const req = event?.request;
    const reqURL = String(req?.url);
    if(reqURL.endsWith('.png')){
      return event.respondWith(awaitUntil(event, (async () => {
        let cacheRes = await cache.get(reqURL);
        if(cacheRes){
            return cacheRes;
        }
        if (rex.test(reqURL)) {
          cacheRes = await fetch(reqURL.replace(rex,location.host),req.clone());
        }else{
          cacheRes = await fetch(req);
        }
        if(cacheRes.ok && cacheRes.body && !cacheRes.bodyUsed){
         await cache.set(reqURL,cacheRes.clone());
        }
        return cacheRes;
      })()));
    }
    
    if (rex.test(reqURL)) {
      return event.respondWith(awaitUntil(event, (async () => {
        return await fetch(reqURL.replace(rex,location.host),req.clone());
      })()));
    }
    
    return event.respondWith(awaitUntil(event, fetch(req)));
  });

})();
