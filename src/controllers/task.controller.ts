import { Request, Response, NextFunction } from "express";
import { taskService, TaskService } from "../services/task.service";
import { NotFoundError } from "../errors/app-error";

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
        throw new NotFoundError("Task not found");
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
      const { title } = req.body as { title: string };
      const task = await this.service.createTask(title);
      res.status(201).json({ data: task });
    } catch (error) {
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
        title: string;
        completed: boolean;
      };
      const task = await this.service.updateTask(id, title, completed);
      if (!task) {
        throw new NotFoundError("Task not found");
      }
      res.status(200).json({ data: task });
    } catch (error) {
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
        throw new NotFoundError("Task not found");
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
        throw new NotFoundError("Task not found");
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

export const taskController = new TaskController();
