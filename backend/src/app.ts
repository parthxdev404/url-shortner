import express from "express";
import helmet from "helmet";
import cors from 'cors'
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import healthRoute from "./routes/health.route.js";
import { requestId } from "./middlewares/request-id.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { notFound } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";
import urlRoutes from './modules/url/routes/url.routes.js'

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cookieParser());
app.use(requestId);
app.use(requestLogger);
app.use(express.json());
app.use("/", healthRoute);
app.use('/api/v1/urls',urlRoutes)
app.use(notFound)
app.use(errorHandler)





export default app
