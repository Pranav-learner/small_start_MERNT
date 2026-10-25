import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import {
  validateTaskId,
  validateCreateTask,
  validateUpdateTask,
} from "../middlewares/validate.middleware";

const router = Router();

router.get("/", taskController.getTasks);
router.get("/:id", validateTaskId, taskController.getTaskById);
router.post("/", validateCreateTask, taskController.createTask);
router.put("/:id", validateTaskId, validateUpdateTask, taskController.updateTask);
router.patch("/:id/complete", validateTaskId, taskController.completeTask);
router.delete("/:id", validateTaskId, taskController.deleteTask);

export default router;
