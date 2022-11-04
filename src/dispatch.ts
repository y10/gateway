import { IRequestContext, Middleware } from "./interfaces.ts";

export async function dispatch(
  context: IRequestContext,
  ...middlewares: Array<Middleware>
) {
  const next = async () => {
    const middleware = middlewares.shift();
    const middlewareFn =
      typeof middleware === "object"
        ? middleware.handle.bind(middleware)
        : middleware;

    if (middlewareFn) {
      await middlewareFn(context, next);
    }
  };

  await next();
}
