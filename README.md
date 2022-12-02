# Bimba middleware framework for Deno.
A lightweight middleware framework for Deno's native HTTP server.

## Getting started

```javascript
export { Server } from "https://deno.land/x/bimba/mod.ts";
import * as api from "./handlers.ts";

const {Server} = Http;

Server
  .start({
    "GET /": () => 
      api.html("index.html"),
    "GET /:model/:requestId": ({ params: { model, requestId } }) =>
      api.get(model, requestId),
    "POST /:model/": ({ params: { model }, request }) => 
      api.post(request, model),
    "POST /:model/analyze?*=:callbackUrl": ({
      params: { model },
      search: { callbackUrl },
      request,
    }) => 
      api.analyze(request, model, callbackUrl),
    "POST /:model/analyze": ({ params: { model }, request }) =>
      api.analyze(request, model),
    "DELETE /:model/analyze/:requestId*": ({ params: { model, requestId } }) =>
      api.stop(model, requestId),
  })
  .listen({
    port: 8000
  });
  ```