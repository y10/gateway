import {
  IRequestHandler,
  IRequestContext,
  RequestParams,
  SearchParams,
} from "./interfaces.ts";

export class Router {
  private patterns: { [key: string]: URLPattern } = {};

  constructor(
    private config: {
      [key: string]: IRequestHandler<unknown>;
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

  private patternKey(key: string) {
    const [, pattern] = key.split(" ");

    if (!pattern) {
      const [newKey] = ["GET", "POST", "PUT", "DELETE"]
        .map((x) => x + " " + key)
        .filter((x) => x in this.patterns === false);
      if (newKey) return newKey;
    }
    return key;
  }

  public async handle(context: IRequestContext, next: () => Promise<void>) {
    const request = context.request;
    for (const key in this.patterns) {
      const patternKey = this.patternKey(key);
      if (patternKey.startsWith(request.method)) {
        const pattern = this.patterns[key];
        const match = pattern.exec(request.url);
        if (match) {
          const handler = this.config[key];
          if (handler) {
            await next();
            context.params = { ...new RequestParams(match) };
            context.search = { ...new SearchParams(match) };
            context.response = await handler(context);
            return;
          }
        }
      }
    }
  }
}
