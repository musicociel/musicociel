import type express from "express";
import { ValidationError } from "express-json-validator-middleware";

export const apiHandleError = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ValidationError) {
    res
      .type("json")
      .status(400)
      .send({ message: "Invalid request.", ...err.validationErrors });
  } else {
    console.log(err);
    res.type("json").status(500).send({
      message: "Unknown error"
    });
  }
};
