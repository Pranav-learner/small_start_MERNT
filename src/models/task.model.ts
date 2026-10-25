import mongoose, { Schema, Document, Model } from "mongoose";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateTaskInput = Pick<Task, "title">;
export type UpdateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;

export interface ITaskDocument extends Document {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (value: string) => typeof value === "string" && value.trim().length > 0,
        message: "A non-empty character only title is required",
      },
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TaskModel: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", taskSchema);

export function mapTaskDocument(doc: ITaskDocument): Task {
  return {
    id: doc._id.toString(),
    title: doc.title,
    completed: doc.completed,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
