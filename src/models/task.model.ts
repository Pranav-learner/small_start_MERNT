export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export type CreateTaskInput = Pick<Task, "title">;
export type UpdateTaskInput = Omit<Task, "id">;
