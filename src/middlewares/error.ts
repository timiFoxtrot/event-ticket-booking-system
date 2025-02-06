import { isCelebrateError } from "celebrate";
import { Request, Response, NextFunction } from "express";

export const handleErrors = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (isCelebrateError(err)) {
    const errorBody =
      err.details.get("body") ||
      err.details.get("query") ||
      err.details.get("params");

    const errors = errorBody?.details.reduce((acc: any, val) => {
      const key = val.path.join(".");
      const message = val.message.replace(/['"]+/g, "");
      acc[key] = { message };
      return acc;
    }, {});

    res
      .status(400)
      .json({ status: "error", message: "Validation Error", error: errors });
  } else {
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
