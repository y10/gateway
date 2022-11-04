export interface IRequestParams {
  [param: string]: string;
}
export interface IRequestContext {
  request: Request;
  response?: unknown;
  params: IRequestParams;
  search: IRequestParams;
}

export class RequestParams implements IRequestParams {
  [param: string]: string;

  constructor(match: URLPatternResult) {
    for (const paramName in match.pathname.groups) {
      this[paramName] = match.pathname.groups[paramName];
    }
  }
}

export class SearchParams implements IRequestParams {
  [param: string]: string;

  constructor(match: URLPatternResult) {
    for (const paramName in match.search.groups) {
      this[paramName] = match.search.groups[paramName];
    }
  }
}

export interface IRequestHandler<TResult> {
  (context: IRequestContext): Promise<TResult>;
}

export interface IMiddlewareHandler {
  (context: IRequestContext, next: () => Promise<void>): Promise<void>;
}

export interface IMiddleware {
  handle: IMiddlewareHandler;
}

export type Middleware = IMiddleware | IMiddlewareHandler;
