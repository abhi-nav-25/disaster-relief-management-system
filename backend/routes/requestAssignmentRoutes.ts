import { Router } from "express";

import {
    getTeams,
    assignTeam,
    getRequestAssignments,
} from "../controllers/requestAssignmentController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
    "/available-teams",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    getTeams
);

router.post(
    "/request/:requestId/team/:teamId",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    assignTeam
);

router.get(
    "/request/:requestId",
    authenticate,
    getRequestAssignments
);

export default router;