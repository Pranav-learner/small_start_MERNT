import { Task } from "../models/task.model";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { taskRepository } from "../repositories/task.repository";

export class TaskService {
  constructor(private readonly repository: ITaskRepository = taskRepository) {}

  getAllTasks(): Task[] {
    return this.repository.findAll();
  }

  getTaskById(id: string): Task | null {
    const task = this.repository.findById(id);
    return task ?? null;
  }

  createTask(title: unknown): Task {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new Error("A non-empty character only title is required");
    }

    return this.repository.create({ title: title.trim() });
  }

  updateTask(id: string, title: unknown, completed: unknown): Task | null {
    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      typeof completed !== "boolean"
    ) {
      throw new Error("A non-empty title and boolean completed value are required");
    }

    const task = this.repository.update(id, {
      title: title.trim(),
      completed,
    });
    return task ?? null;
  }

  completeTask(id: string): Task | null {
    const task = this.repository.markCompleted(id);
    return task ?? null;
  }

  deleteTask(id: string): boolean {
    return this.repository.delete(id);
  }
}

export const taskService = new TaskService();
