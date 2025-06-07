(()=>{
  const _eval = eval;
  globalThis.eval = function eval(){
    try{
      return _eval(...arguments);
    }catch(e){
      console.warn(e,...arguments);
    }
  };
})();

(()=>{
  const xhr = XMLHttpRequest.prototype;
  const _open = xhr.open;
  xhr.open = function open(){
    try{
      arguments[1] &&= String(arguments[1]).replace(RegExp(atob('cG9rZWhlcm9lcy5jb20='),'gi'),location.host);
    }catch(e){
      console.warn(this,e,...arguments);
    }
    return _open.apply(this,arguments);
  };
})();

(()=>{
  const dateParse = Date.parse;
  Date.parse = function parse(){
    try{
      return dateParse(...arguments) || new Date();
    }catch{
      return new Date();
    }
  };
})();

(()=>{
  const jsonParse = JSON.parse;
  JSON.parse = function parse(){
    try{
      return jsonParse(...arguments);
    }catch(e){
      return e;
    }
  };
})();

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
