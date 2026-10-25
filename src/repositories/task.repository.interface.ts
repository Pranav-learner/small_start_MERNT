import { Task, CreateTaskInput, UpdateTaskInput } from "../models/task.model";

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, input: UpdateTaskInput): Promise<Task | null>;
  markCompleted(id: string): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}