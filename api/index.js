(()=>{
const instanceOf=(x,y) =>{
  try{
    return x instanceof y;
  }catch{
    return false;
  }
};
const WeakRefMap = (()=>{
  const $weakRefMap = Symbol('*weakRefMap');
  return class WeakRefMap extends Map {
      constructor() {
        super();
        this[$weakRefMap] = new Map();
      }

      get(key) {
        const ref = this[$weakRefMap].get(key);
        const value = ref?.deref?.();
        if (value === undefined) {
          this[$weakRefMap].delete(key);
        }
        return value;
      }

      set(key, value) {
        this[$weakRefMap].set(key, new WeakRef(value));
        return this;
      }

      delete(key) {
        return this[$weakRefMap].delete(key);
      }

      has(key) {
        const value = this[$weakRefMap].get(key)?.deref?.();
        if (value === undefined) {
          this[$weakRefMap].delete(key);
          return false;
        }
        return true;
      }
    }
  })();

  const isValidResponse = x => (x?.status === 200 && !x?.bodyUsed && !x?.body?.locked) || x?.status === 304;
  
globalThis.WeakCache = new WeakRefMap();
const $response = Symbol('*response');
const $fetch = Symbol('*fetch');
globalThis[$fetch] = fetch;
globalThis.fetch = async function fetch(){
  const args = [...arguments].map(x=>x?.clone?.() ?? x);
  let request,response;
  try{
    request = new Request(...arguments);
    if (request.method === 'GET' && !request.url.includes('?') && !request.url.includes('#')){
      let cachedResponse = WeakCache.get(request.url);
      if (cachedResponse) {
        request[$response] = cachedResponse;
        if(cachedResponse instanceof Promise){
          cachedResponse = await cachedResponse;
          if(isValidResponse(cachedResponse)){
            WeakCache.set(request.url,cachedResponse.clone());
          }else{
            WeakCache.delete(request.url);
          }
        }
        try{
          response = cachedResponse.clone();
          response[$response] = cachedResponse;
        }catch{
          WeakCache.delete(request.url);
        }
        console.log('response from cache');
      } else {
        const presponse = globalThis[$fetch](...arguments);
        WeakCache.set(request.url,presponse);
        response = await presponse;
        if (response.status === 200 && !response.bodyUsed) {
          WeakCache.set(request.url, response.clone());
        }else{
          WeakCache.delete(request.url);
        }
      }
    }
    if(!instanceOf(response,Response)){
     response = await globalThis[$fetch](...args);
    }
    return response;
  }catch(e){
    WeakCache.delete(request.url);
    return new Response(Object.getOwnPropertyNames(e).map(x=>`${x} : ${e[x]}`).join(''),{
      status : 569,
      statusText:e.message
    });
  }
};

})();

const parse = x =>{
  try{
    return JSON.parse(x);
  }catch{
    return x;
  }
};

const urlMap = new Map();
const { Readable } = require("stream");
const http = require("http");
const Buffer = require("buffer").Buffer;
const gzip = x =>  new Response(new Response(x).body.pipeThrough(new CompressionStream("gzip"))).arrayBuffer();

const nocacheHeaders = {
  "Cache-Control": "no-cache",
  "Cache-Control-": "no-cache",
  "Cdn-Cache-Control": "no-cache",
  "Cloudflare-Cdn-Cache-Control": "no-cache",
  "Surrogate-Control": "no-cache",
  "Vercel-Cdn-Cache-Control": "no-cache",
};

async function tfetch() {
  try {
    const args = [...arguments].map(x=>x?.clone?.() ?? x);
    return await fetch(...args);
  } catch (e) {
    console.log(e,...arguments);
    return new Response(null, {
      status: 500,
      statusText: e.message,
    });
  }
}

  async function streamFromURL(url,serverRes){
    try{
    const resp = await tfetch(url);
    const body = resp.body.pipeThrough(new CompressionStream("gzip"));
    serverRes.setHeader('content-encoding','gzip');
    for await (const chunk of body){
      serverRes.write(chunk);
    }
    }catch(e){
      console.warn(e,...arguments);
    }finally{
      serverRes.end();
    }
  }

const hostTarget = "pokeheroes.com";
const globalReplaceHosts = [
  "staticpokeheroes.com",
  "upload.pokeheroes.com",
  "panel.pokeheroes.com",
  "wiki.pokeheroes.com",
  "api.pokeheroes.com",
  "pokeheroes.com"
];

http.createServer({
  joinDuplicateHeaders:true,
  insecureHTTPParser:true,
},onRequest).listen(3000);

async function onRequest(req, res) {
  try{
  const replaceHosts = [...globalReplaceHosts];
  if(String(req?.headers?.referer).toLowerCase().includes('wiki')){
    replaceHosts.unshift('wiki.pokeheroes.com');
  }
  console.log("Incoming Request: ",req.headers['cookie']);
  const thisHost = req.headers.host;
  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;
  if(req.headers.cookie){
    req.headers['xx-cookie'] = req.headers.cookie;
  }

  if(req.url.endsWith('patchy.js')){
    res.setHeader('content-type','text/javascript');
    return streamFromURL(`https://raw.githubusercontent.com/GMEstonk/cheese/refs/heads/main/api/patchy.js?${new Date().getTime()}`,res);
  }
  
  if(req.url.endsWith('sw.js')){
    res.setHeader('content-type','text/javascript');
    return streamFromURL(`https://raw.githubusercontent.com/GMEstonk/cheese/refs/heads/main/api/sw.js?${new Date().getTime()}`,res);
  }

  if(req.url.endsWith('viz.css')){
    res.setHeader('content-type','text/css');
    return streamFromURL(`https://raw.githubusercontent.com/GMEstonk/cheese/refs/heads/main/api/viz.css?${new Date().getTime()}`,res);
  }

  if(req.url.includes('facvicon.ico')){
    return res.end();
  }
  
  /* start reading the body of the request*/
  let body;
  if(req.closed === false){
     body = Readable.toWeb(req);
  }
  console.log('Body: ',body);
  const options = Object.assign({
      method: req.method,
      headers: req.headers,
    },nocacheHeaders);

  if (body && !req.method.match(/GET|HEAD/)) {
    options.body = body,
    options.duplex = 'half';
  }
  let request = new Request(`https://${'heroespoke.pokeheroes.workers.dev'}${req.url}`, options);
  const oldHeaders = new Headers(request.headers);
  request.headers.forEach((value,key)=>request.headers.set(key,String(value).replace(thisHost,hostTarget)));
  request.headers.set('xx-host-target',hostTarget);
  request.headers.append('cookie','username=Substitute');
  request.headers.delete("content-length");
  request.headers.delete("content-encoding");
  console.log("Fetch Request: ",request.headers.get('cookie'));
  
  let response = await tfetch(request);
  console.log("Fetch Response: ",response.headers.get('set-cookie'));
  let headers = new Headers();
  response.headers.forEach((value,key)=>headers.set(key,String(value).replace(hostTarget,thisHost)));
  response = new Response(response.clone().body,Object.defineProperty(response.clone(),'headers',{value:headers}));
  
  for (const host of replaceHosts) {
    if (response.status >= 400) {
      const url = new URL(request.url);
      url.host = 'heroespoke.pokeheroes.workers.dev';//host;
      request = new Request(String(url), request.clone());
      oldHeaders.forEach((value,key)=>request.headers.set(key,String(value).replace(thisHost,host)));
      request.headers.set('xx-host-target',host);
      console.log("Retry Request: ",request.headers.get('cookie'));
      response = await tfetch(request);
      console.log("Retry Response: ",response.headers.get('set-cookie'));
      headers = new Headers();
      response.headers.forEach((value,key)=>headers.set(key,String(value).replace(hostTarget,thisHost)));
      response = new Response(response.clone().body,Object.defineProperty(response.clone(),'headers',{value:headers}));
    }
  }

  if(response.url && response.ok){
    urlMap.set(req.url,response.url);
  }
  
  response.headers.forEach((value, key) => res.setHeader(key, value));
  if(response.headers.has('xx-set-cookie')){
    res.setHeader('set-cookie',parse(response.headers.get('xx-set-cookie')));
  }
  new Headers(nocacheHeaders).forEach((value, key) => res.setHeader(key, value));
  res.removeHeader("content-length");
  if (/html|script|xml/i.test(`${response.headers.get("content-type")}`)) {
    let resBody = await response.clone().text();
    res.setHeader('content-encoding','gzip');
    for (const host of replaceHosts) {
        resBody = resBody.replace(RegExp(host, "gi"), thisHost);
    }
      resBody = resBody
     //.split('<img ').map((x,i,a)=>i<a?.length/2?' loading="lazy" '+x:x).join('<img ')
      .replace('<head>','<head><script src="patchy.js"></script><script src="sw.js"></script><link rel="stylesheet" href="viz.css"></link>')
      .replaceAll('chatList.length','(chatList||[]).length')
      .replaceAll('Date.parse(timeDisplay.text()).getTime();','(Date.parse(timeDisplay.text())?.getTime?.() ?? new Date().getTime());');
      res.write(Buffer.from(await gzip(resBody)));
    res.end();
  } else {
    const resBody = response.clone().body?.pipeThrough?.(new CompressionStream("gzip"));
    res.setHeader('content-encoding','gzip');
    for await (const chunk of resBody??[]){
      res.write(chunk);
    }
    res.end();
  }
}catch(e){
  res.end(e.message);
}
}
