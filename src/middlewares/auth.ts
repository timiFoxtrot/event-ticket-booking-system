import { Request, Response, NextFunction } from "express";
import basicAuth from "basic-auth";

const USERNAME = process.env.AUTH_USERNAME;
const PASSWORD = process.env.AUTH_PASSWORD;

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = basicAuth(req);
  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.set("WWW-Authenticate", "Basic realm='example'");
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }
  next();
};
