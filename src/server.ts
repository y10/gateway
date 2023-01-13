import { serve, ServeInit } from "https://deno.land/std@0.159.0/http/server.ts";
import { Middleware, IRequestContext } from "./interfaces.ts";
import { dispatch } from "./dispatch.ts";
import { Router } from "./router.ts";

export class Server {
  private readonly middlewares: Array<Middleware> = [];
  public static start(): Server;
  public static start(router: Router): Server;
  public static start(config: {
    [key: string]: Middleware | Array<Middleware>;
  }): Server;
  public static start(
    config?:
      | Router
      | {
          [key: string]: Middleware | Array<Middleware>;
        }
  ): Server {
    const server = new Server();
    if (config instanceof Router) {
      server.use(config);
    } else if (config) {
      server.use(new Router(config));
    }
    
    return server;
  }

  public use(...middlewares: Middleware[]): Server {
    for (const middleware of middlewares) {
      this.middlewares.push(middleware);
    }
    return this;
  }

  public async listen(options?: ServeInit) {
    await serve(this.handle.bind(this), options);
  }

  private async handle(request: Request) {
    try {
      const context: IRequestContext = {
        request,
        params: {},
        search: {},
        state: {},
      };

      await dispatch(context, ...this.middlewares);

      if (!context.response) {
        return new Response("not found", { status: 404 });
      }
      if (context.response instanceof Response) {
        return context.response;
      }
      if (typeof context.response === "object") {
        return Response.json(context.response);
      }

      return new Response(`${context.response}`);
    } catch (error) {
      return new Response(`${error}`, { status: 500 });
    }
  }
}
