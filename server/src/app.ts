import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

const app: Application = express();

// CORS Policy Middleware & Preflight Handling
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security Headers Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Request Parsing & Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api", routes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
