import { RequestHandler } from "express";
import { ObjectSchema } from "joi";

const formatErrorDetails = (details: any[]) =>
  details.map((detail) => ({
    message: detail.message,
    path: detail.path.join("."),
    type: detail.type,
  }));

export const validateBody =
  (schema: ObjectSchema): RequestHandler =>
  (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({
          message: "Invalid request body",
          errors: formatErrorDetails(error.details),
        });
    }
    req.body = value;
    return next();
  };

export const validateQuery =
  (schema: ObjectSchema): RequestHandler =>
  (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res
        .status(400)
        .json({
          message: "Invalid query parameters",
          errors: formatErrorDetails(error.details),
        });
    }
    req.query = value;
    return next();
  };
