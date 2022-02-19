import type express from "express";

export const asyncHandler =
  (handler: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) =>
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
      return;
    }
  };
