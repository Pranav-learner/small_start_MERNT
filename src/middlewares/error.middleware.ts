import { Request, Response, NextFunction } from "express";
import { AppError, NotFoundError } from "../errors/app-error";

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. AppError (operational error with custom status)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
      },
    });
    return;
  }

  // 2. Malformed JSON from express.json()
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "body" in err
  ) {
    res.status(400).json({
      success: false,
      error: {
        message: "Malformed JSON payload",
      },
    });
    return;
  }

  // 3. Mongoose CastError (e.g., malformed ObjectId)
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "CastError"
  ) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid ID format",
      },
    });
    return;
  }

  // 4. Mongoose ValidationError
  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "ValidationError"
  ) {
    const message = (err as Error).message || "Validation error";
    res.status(400).json({
      success: false,
      error: {
        message,
      },
    });
    return;
  }

  // 5. Unexpected server errors (500)
  // Stack traces or database internals are never leaked in client responses
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
    },
  });
}
