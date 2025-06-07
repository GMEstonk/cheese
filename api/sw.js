(() => {
  let cheese = caches.open("cheese");
  const cache = {
    set:(req,res)=>{
      const resClone = res?.clone?.();
      return (async()=>{
        if(cheese instanceof Promise)cheese = await cheese;
        return cheese.put(req,resClone)
      })();
    },
    get:async(req,res)=>{
      if(cheese instanceof Promise)cheese = await cheese;
      return (await cheese.match(req))?.clone?.();
    }
  };
  
  const then = Object.freeze(async()=>{});

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
  const localhost = location.host;
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
          cacheRes = await fetch(reqURL.replace(rex,localhost),req.clone());
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
        return await fetch(reqURL.replace(rex,localhost),req.clone());
      })()));
    }
    
    return event.respondWith(awaitUntil(event, fetch(req)));
  });

})();
