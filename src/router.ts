import { dispatch } from "./dispatch.ts";
import {
  IMiddleware,
  IRequestContext,
  Middleware,
  RequestParams,
  SearchParams,
} from "./interfaces.ts";

export class Router implements IMiddleware {
  private patterns: { [key: string]: URLPattern } = {};

  constructor(
    private config: {
      [key: string]: Middleware | Array<Middleware>;
    }
  ) {
    Object.keys(config).reduce(
      (map: { [input: string]: URLPattern }, input: string) => {
        const [, uri] = input.split(" ");
        const [pathname, search] = (uri ?? input).split("?");
        map[input] = new URLPattern({ pathname, search });
        return map;
      },
      this.patterns
    );
  }

  public async handle(context: IRequestContext, next?: () => Promise<void>) {
    const handlerFn = (m: Middleware) =>
    {
      if (typeof m === "function") {
        return async (
          c: IRequestContext,
          n?: () => Promise<void>
        ): Promise<void> => {
          const result = await m(c, n);
          if (result) c.response = result;
        };
      }
      return m;
    }

    const patternKeyFn = (key: string) => {
      const [, pattern] = key.split(" ");
  
      if (!pattern) {
        const [newKey] = ["GET", "POST", "PUT", "DELETE"]
          .map((x) => x + " " + key)
          .filter((x) => x in this.patterns === false);
        if (newKey) return newKey;
      }
      return key;
    }

    const { request } = context;
    for (const key in this.patterns) {
      const patternKey = patternKeyFn(key);
      if (patternKey.startsWith(request.method)) {
        const pattern = this.patterns[key];
        const match = pattern.exec(request.url);
        if (match) {
          const middleware = this.config[key];
          if (middleware) {
            const middlewares = Array.isArray(middleware)
              ? middleware
              : [middleware];
            context.params = { ...new RequestParams(match) };
            context.search = { ...new SearchParams(match) };
            await dispatch(
              context,
              ...middlewares.map((m) => handlerFn(m))
            );
          }
        }
      }
    }

    if (next) await next();
  }
}
