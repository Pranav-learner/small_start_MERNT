import { Request, Response, NextFunction } from "express";
import { taskService, TaskService } from "../services/task.service";

export class TaskController {
  constructor(private readonly service: TaskService = taskService) {}

  getTasks = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const tasks = await this.service.getAllTasks();
      res.status(200).json({ data: tasks });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.service.getTaskById(id);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  createTask = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { title } = req.body as { title?: unknown };
      const task = await this.service.createTask(title);
      res.status(201).json({ data: task });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "ValidationError" ||
          error.message.includes("title"))
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  updateTask = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, completed } = req.body as {
        title?: unknown;
        completed?: unknown;
      };
      const task = await this.service.updateTask(id, title, completed);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ data: task });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "ValidationError" ||
          error.message.includes("title") ||
          error.message.includes("completed"))
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  };

  completeTask = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const task = await this.service.completeTask(id);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.service.deleteTask(id);
      if (!deleted) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();
