"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Control Centre creates resource-delivery tasks
router.post("/", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("CONTROL_CENTRE_OPERATOR"), taskController_1.createTask);
// Relief Team views its own tasks
router.get("/my-team", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("RELIEF_TEAM"), taskController_1.getMyTeamTasks);
// Authenticated users can view a task
router.get("/:id", authMiddleware_1.authenticate, taskController_1.getOneTask);
// Relief Team updates its own task
router.put("/:id/status", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("RELIEF_TEAM"), taskController_1.updateStatus);
exports.default = router;
