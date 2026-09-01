import { Router } from "express";

import {
    create,
    getAll,
} from "../controllers/auditLogController";

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
    getAll
);

router.post(
    "/",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    create
);

export default router;