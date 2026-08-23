import type { NextFunction, Request, Response } from "express";

type AsyncHandlerFnType<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export default function asyncHandler<TReq extends Request>(
  fn: AsyncHandlerFnType<TReq>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
}
