import { Router } from "express";

import {
    create,
    getOne,
    getForRequest,
    updateStatus,
} from "../controllers/deliveryController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
    "/",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    create
);

router.get(
    "/request/:requestId",
    authenticate,
    getForRequest
);

router.get(
    "/:id",
    authenticate,
    getOne
);

router.put(
    "/:id/status",
    authenticate,
    authorize(
        "CONTROL_CENTRE_OPERATOR",
        "RELIEF_TEAM"
    ),
    updateStatus
);

export default router;