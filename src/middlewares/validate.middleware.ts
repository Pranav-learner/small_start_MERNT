import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { BadRequestError } from "../errors/app-error";

export function validateTaskId(
  req: Request<{ id: string }>,
  _res: Response,
  next: NextFunction
): void {
  const { id } = req.params;
  if (!id || !isValidObjectId(id)) {
    return next(new BadRequestError("Invalid task ID format"));
  }
  next();
}

export function validateCreateTask(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return next(new BadRequestError("Request body must be a valid JSON object"));
  }

  const { title } = req.body as { title?: unknown };

  if (title === undefined || title === null) {
    return next(new BadRequestError("A non-empty character only title is required"));
  }

  if (typeof title !== "string") {
    return next(new BadRequestError("A non-empty character only title is required"));
  }

  const trimmedTitle = title.trim();
  if (trimmedTitle.length === 0) {
    return next(new BadRequestError("A non-empty character only title is required"));
  }

  req.body.title = trimmedTitle;
  next();
}

export function validateUpdateTask(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return next(new BadRequestError("Request body must be a valid JSON object"));
  }

  const { title, completed } = req.body as {
    title?: unknown;
    completed?: unknown;
  };

  if (
    title === undefined ||
    title === null ||
    typeof title !== "string" ||
    title.trim().length === 0 ||
    completed === undefined ||
    completed === null ||
    typeof completed !== "boolean"
  ) {
    return next(
      new BadRequestError(
        "A non-empty title and boolean completed value are required"
      )
    );
  }

  req.body.title = title.trim();
  req.body.completed = completed;
  next();
}
