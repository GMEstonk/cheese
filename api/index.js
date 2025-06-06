const urlMap = new Map();

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

const http = require("http");
const Buffer = require("buffer").Buffer;

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
  console.log("Incoming Request: ",req.headers['cookie']);
  const thisHost = req.headers.host;
  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;


  if(req.url.endsWith('patchy.js')){
    res.setHeader('content-type','text/javascript');
    return res.end(await(await tfetch(`https://raw.githubusercontent.com/GMEstonk/cheese/refs/heads/main/api/patchy.js?${new Date().getTime()}`)).text());
  }
  if(req.url.endsWith('sw.js')){
    res.setHeader('content-type','text/javascript');
    return res.end(await(await tfetch(`https://raw.githubusercontent.com/GMEstonk/cheese/refs/heads/main/api/sw.js?${new Date().getTime()}`)).text());
  }

  if(req.url.includes('facvicon.ico')){
    return res.end();
  }
  
  /* start reading the body of the request*/
  let bdy = [];
  req.on("data", (chunk) => {
    bdy = [...bdy,...chunk];
  });
  await new Promise((resolve) => {
    req.on("end", resolve);
  });
  console.log('Body: ',bdy);
  const options = Object.assign({
      method: req.method,
      headers: req.headers,
    },nocacheHeaders);
  /* fetch throws an error if you send a body with a GET request even if it is empty */
  if (!req.method.match(/GET|HEAD/)) {
    options.body = new Uint8Array(bdy);
  }
  /* finish copying over the other parts of the request */

  /* fetch from your desired target */
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
  
  /* copy over response headers*/
  response.headers.forEach((value, key) => res.setHeader(key, value));
  new Map(Object.entries(nocacheHeaders)).forEach((value, key) => res.setHeader(key, value));
  res.removeHeader("content-length");
  /* check to see if the response is not a text format */
  if (!`${response.headers.get("content-type")}`.match(/image|video|audio/i)) {
    res.removeHeader("content-encoding");
    /* Copy over target response and return */
    let resBody = await response.clone().text();
    for (const host of replaceHosts) {
      resBody = resBody.replace(RegExp(host, "gi"), thisHost);
    }
    resBody = resBody.replace('<head>','<head><script src="patchy.js"></script><script src="sw.js"></script>')
      .replaceAll('chatList.length','(chatList||[]).length')
      .replaceAll('Date.parse(timeDisplay.text()).getTime();','(Date.parse(timeDisplay.text())?.getTime?.() ?? new Date().getTime());');
    res.end(resBody);
  } else {
    if(!req.url.includes('favicon.ico'))res.removeHeader("content-encoding");
    res.end(Buffer.from(await response.clone().arrayBuffer()));
  }
  console.log("Outgoing Response: ",res.getHeader('set-cookie'));
}
