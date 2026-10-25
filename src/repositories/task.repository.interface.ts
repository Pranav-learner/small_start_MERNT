import { Task, CreateTaskInput, UpdateTaskInput } from "../models/task.model";

export interface ITaskRepository {
  findAll(): Task[];

  findById(id: string): Task | undefined;

  create(input: CreateTaskInput): Task;

  update(
    id: string,
    input: UpdateTaskInput,
  ): Task | undefined;

  markCompleted(id: string): Task | undefined;

  delete(id: string): boolean;
}