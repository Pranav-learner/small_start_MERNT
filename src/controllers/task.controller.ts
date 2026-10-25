import { Request, Response } from "express";
import { taskService, TaskService } from "../services/task.service";

export class TaskController {
  constructor(private readonly service: TaskService = taskService) {}

  getTasks = (_req: Request, res: Response): void => {
    const tasks = this.service.getAllTasks();
    res.status(200).json({ data: tasks });
  };

  getTaskById = (req: Request<{ id: string }>, res: Response): void => {
    const { id } = req.params;
    const task = this.service.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json({ data: task });
  };

  createTask = (req: Request, res: Response): void => {
    try {
      const { title } = req.body as { title?: unknown };
      const task = this.service.createTask(title);
      res.status(201).json({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid input";
      res.status(400).json({ error: message });
    }
  };

  updateTask = (req: Request<{ id: string }>, res: Response): void => {
    try {
      const { id } = req.params;
      const { title, completed } = req.body as {
        title?: unknown;
        completed?: unknown;
      };
      const task = this.service.updateTask(id, title, completed);
      if (!task) {
        res.status(404).json({ error: "Task not found" });
        return;
      }
      res.status(200).json({ data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid input";
      res.status(400).json({ error: message });
    }
  };

  completeTask = (req: Request<{ id: string }>, res: Response): void => {
    const { id } = req.params;
    const task = this.service.completeTask(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json({ data: task });
  };

  deleteTask = (req: Request<{ id: string }>, res: Response): void => {
    const { id } = req.params;
    const deleted = this.service.deleteTask(id);
    if (!deleted) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(204).end();
  };
}

export const taskController = new TaskController();
