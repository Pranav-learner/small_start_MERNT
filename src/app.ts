import express, { Express } from "express";
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

export default app;
