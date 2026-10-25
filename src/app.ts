import express, { Express, Request, Response, NextFunction } from "express";
import taskRoutes from "./routes/task.routes";

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

// Global Error Handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
});

export default app;
