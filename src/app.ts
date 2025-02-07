import express from "express";
import bodyParser from "body-parser";
import eventRoutes from "./routes/event";
import { handleErrors } from "./middlewares/error";
import rateLimit from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(bodyParser.json());
app.use("/api", eventRoutes);

app.use(handleErrors);

app.use((req, res, _next) => {
  res.status(404).json({
    status: "error",
    message: "resource not found",
    path: req.url,
  });
});

export default app;
