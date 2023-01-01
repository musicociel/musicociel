import type express from "express";
import type { AllowedSchema } from "express-json-validator-middleware";
import { ValidationError, Validator } from "express-json-validator-middleware";
import { isHttpError } from "http-errors";

export const { validate } = new Validator({});
export type Schema = AllowedSchema;

export const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ValidationError) {
    res
      .type("json")
      .status(400)
      .send({ message: "Invalid request.", ...err.validationErrors });
  } else if (isHttpError(err)) {
    if (err.headers) {
      for (const header of Object.keys(err.headers)) {
        res.header(header, err.headers[header]);
      }
    }
    res
      .type("json")
      .status(err.statusCode ?? 400)
      .send({
        message: err.message
      });
  } else {
    console.log(err);
    res.type("json").status(500).send({
      message: "Unknown error"
    });
  }
};
