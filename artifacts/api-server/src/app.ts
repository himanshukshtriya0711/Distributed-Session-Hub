import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import { createSessionMiddleware } from "./middlewares/session.js";

const app: Express = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(createSessionMiddleware());

app.use("/api", router);

export default app;
