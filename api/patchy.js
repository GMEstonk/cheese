(()=>{
function setBackgroundInterval(fn, time) {
  const requestIdleCallback =
    globalThis.requestIdleCallback ?? globalThis.requestAnimationFrame;
  let running = false;
  return setInterval(() => {
    if (running) return;
    running = true;
    requestIdleCallback(async () => {
      try {
        await fn();
      } catch (e) {
        console.warn(e);
      } finally {
        running = false;
      }
    });
  }, time);
}


  setBackgroundInterval(()=>[...document.querySelectorAll(`a[href="//${location.host}"]`)??[]]?.find?.(x=>`${x?.innerText}`.toLowerCase().includes('wiki'))?.setAttribute?.('href',`${location.origin}/wiki/Main_Page`),100);
})();
