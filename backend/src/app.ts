import express from "express";
import helmet from "helmet";
import cors from 'cors'
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import healthRoute from "./routes/health.route.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(compression());

app.use("/", healthRoute);

export default app
