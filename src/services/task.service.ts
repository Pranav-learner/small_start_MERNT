import { Task } from "../models/task.model";
import type { ITaskRepository } from "../repositories/task.repository.interface";
import { taskRepository } from "../repositories/task.repository";
import { BadRequestError } from "../errors/app-error";

export class TaskService {
  constructor(private readonly repository: ITaskRepository = taskRepository) {}

  async getAllTasks(): Promise<Task[]> {
    return this.repository.findAll();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.repository.findById(id);
  }

  async createTask(title: unknown): Promise<Task> {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new BadRequestError("A non-empty character only title is required");
    }

    return this.repository.create({ title: title.trim() });
  }

  async updateTask(
    id: string,
    title: unknown,
    completed: unknown
  ): Promise<Task | null> {
    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      typeof completed !== "boolean"
    ) {
      throw new BadRequestError(
        "A non-empty title and boolean completed value are required"
      );
    }

    return this.repository.update(id, {
      title: title.trim(),
      completed,
    });
  }

  async completeTask(id: string): Promise<Task | null> {
    return this.repository.markCompleted(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export const taskService = new TaskService();
