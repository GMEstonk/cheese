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
    return await fetch(...arguments);
  } catch (e) {
    return new Response(null, {
      status: 500,
      statusText: e.message,
    });
  }
}

const http = require("http");
const Buffer = require("buffer").Buffer;

const hostTarget = "pokeheroes.com";
const replaceHosts = ["staticpokeheroes.com", "pokeheroes.com"];

http.createServer(onRequest).listen(3000);

async function onRequest(req, res) {
  const thisHost = req.headers.host;
  req.headers.host = hostTarget;
  req.headers.referer = hostTarget;

  /* start reading the body of the request*/
  let bdy = "";
  req.on("readable", (_) => {
    bdy += req.read() || "";
  });
  await new Promise((resolve) => {
    req.on("end", resolve);
  });
  /* finish reading the body of the request*/
  /* start copying over the other parts of the request */
  const options = Object.assign(
    {
      method: req.method,
      headers: req.headers,
    },
    nocacheHeaders,
  );
  /* fetch throws an error if you send a body with a GET request even if it is empty */
  if (!req.method.match(/GET|HEAD/) && bdy.length > 4) {
    options.body = bdy;
  }
  /* finish copying over the other parts of the request */

  /* fetch from your desired target */
  let request = new Request(`https://${hostTarget}${req.url}`, options);
  let response = await tfetch(request);

  for (const host of replaceHosts) {
    console.log(host);
    if (response.status >= 400) {
      console.log(response.status, request.url);
      const url = new URL(request.url);
      url.host = host;
      console.log(url);
      request = new Request(String(url), request);
      response = await tfetch(request);
      console.log(response);
    }
  }
  /* copy over response headers*/
  response.headers?.forEach?.((value, key) => res.setHeader(key, value));
  res.removeHeader("content-length");
  res.removeHeader("content-encoding");
  /* check to see if the response is not a text format */
  if (!`${response.headers.get("content-type")}`.match(/image|video|audio/i)) {
    /* Copy over target response and return */
    let resBody = await response.text();
    for (const host of replaceHosts) {
      resBody = resBody.replace(RegExp(host, "gi"), thisHost);
    }
    res.end(resBody);
  } else {
    res.end(Buffer.from(await response.arrayBuffer()));
  }
}
