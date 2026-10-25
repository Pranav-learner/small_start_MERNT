import express, { Express } from "express";
import taskRoutes from "./routes/task.routes";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/error.middleware";

const app: Express = express();

// Middleware: parse incoming JSON bodies
app.use(express.json());

// Middleware: basic request logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1/tasks", taskRoutes);

// 404 Handler for unknown routes
app.use(notFoundHandler);

// Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
