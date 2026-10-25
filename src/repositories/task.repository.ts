import { isValidObjectId } from "mongoose";
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskModel,
  mapTaskDocument,
} from "../models/task.model";
import { ITaskRepository } from "./task.repository.interface";

export class TaskRepository implements ITaskRepository {
  async findAll(): Promise<Task[]> {
    const docs = await TaskModel.find().sort({ createdAt: -1 }).exec();
    return docs.map(mapTaskDocument);
  }

  async findById(id: string): Promise<Task | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await TaskModel.findById(id).exec();
    if (!doc) {
      return null;
    }
    return mapTaskDocument(doc);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const doc = await TaskModel.create({
      title: input.title,
      completed: false,
    });
    return mapTaskDocument(doc);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await TaskModel.findByIdAndUpdate(
      id,
      {
        title: input.title,
        completed: input.completed,
      },
      { returnDocument: "after", runValidators: true }
    ).exec();

    if (!doc) {
      return null;
    }
    return mapTaskDocument(doc);
  }

  async markCompleted(id: string): Promise<Task | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const doc = await TaskModel.findByIdAndUpdate(
      id,
      { completed: true },
      { returnDocument: "after", runValidators: true }
    ).exec();

    if (!doc) {
      return null;
    }
    return mapTaskDocument(doc);
  }

  async delete(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }
    const result = await TaskModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

export const taskRepository = new TaskRepository();
