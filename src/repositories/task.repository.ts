import { randomUUID } from "node:crypto";
import { Task, CreateTaskInput, UpdateTaskInput } from "../models/task.model";
import { ITaskRepository } from "./task.repository.interface";

export class TaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  findAll(): Task[] {
    return this.tasks;
  }

  findById(id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id);
  }

  create(input: CreateTaskInput): Task {
    const newTask: Task = {
      id: randomUUID(),
      title: input.title,
      completed: false,
    };
    this.tasks.push(newTask);
    return newTask;
  }

  update(id: string, input: UpdateTaskInput): Task | undefined {
    const task = this.findById(id);
    if (!task) {
      return undefined;
    }
    task.title = input.title;
    task.completed = input.completed;
    return task;
  }

  markCompleted(id: string): Task | undefined {
    const task = this.findById(id);
    if (!task) {
      return undefined;
    }
    task.completed = true;
    return task;
  }

  delete(id: string): boolean {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }
}

export const taskRepository = new TaskRepository();
