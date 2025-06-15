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
const replaceHosts = [
  "staticpokeheroes.com",
  "upload.pokeheroes.com",
  "panel.pokeheroes.com",
  "wiki.pokeheroes.com",
  "api.pokeheroes.com",
  "pokeheroes.com"
];

http.createServer(onRequest).listen(3000);

async function onRequest(req, res) {
  try{
  console.log("Incoming Request: ",req.headers['cookie']);
  const thisHost = req.headers.host;
  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;


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
  let request = new Request(urlMap.get(req.url) ?? `https://${hostTarget}${req.url}`, options);
  request.headers.forEach((value,key)=>request.headers.set(key,String(value).replace(thisHost,hostTarget)));
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
      url.host = host;
      request = new Request(String(url), request.clone());
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
  new Headers(nocacheHeaders).forEach((value, key) => res.setHeader(key, value));
  res.removeHeader("content-length");
  if (/html|script|xml/i.test(`${response.headers.get("content-type")}`)) {
    let resBody = response.clone().body;
    res.setHeader('content-encoding','gzip');
    for (const host of replaceHosts) {
        resBody = resBody.replace(RegExp(host, "gi"), thisHost);
    }
      resBody = resBody
     // .replaceAll('<img', '<img loading="lazy" ')
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
