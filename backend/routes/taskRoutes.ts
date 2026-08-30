import { Router } from "express";

import {
    createTask,
    getOneTask,
    getMyTeamTasks,
    updateStatus,
} from "../controllers/taskController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Control Centre creates resource-delivery tasks
router.post(
    "/",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    createTask
);

// Relief Team views its own tasks
router.get(
    "/my-team",
    authenticate,
    authorize("RELIEF_TEAM"),
    getMyTeamTasks
);

// Authenticated users can view a task
router.get(
    "/:id",
    authenticate,
    getOneTask
);

// Relief Team updates its own task
router.put(
    "/:id/status",
    authenticate,
    authorize("RELIEF_TEAM"),
    updateStatus
);

export default router;