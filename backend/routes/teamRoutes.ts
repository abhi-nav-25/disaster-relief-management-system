import { Router } from "express";

import {
    getAllTeams,
    getOneTeam,
    create,
    updateStatus,
} from "../controllers/teamController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
    "/",
    authenticate,
    authorize(
        "CONTROL_CENTRE_OPERATOR",
        "DMA_SUPERVISOR"
    ),
    getAllTeams
);

router.get(
    "/:id",
    authenticate,
    authorize(
        "CONTROL_CENTRE_OPERATOR",
        "DMA_SUPERVISOR"
    ),
    getOneTeam
);

router.post(
    "/",
    authenticate,
    authorize("DMA_SUPERVISOR"),
    create
);

router.put(
    "/:id/status",
    authenticate,
    authorize(
        "CONTROL_CENTRE_OPERATOR",
        "DMA_SUPERVISOR",
        "RELIEF_TEAM"
    ),
    updateStatus
);

export default router;