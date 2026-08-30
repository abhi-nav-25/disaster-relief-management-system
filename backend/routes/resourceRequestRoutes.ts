import { Router } from "express";

import {
    createRequest,
    getOneRequest,
    getMyCampRequests,
    getRequests,
    verify,
    updatePriority,
} from "../controllers/resourceRequestController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Camp Manager
router.post(
    "/",
    authenticate,
    authorize("RELIEF_CAMP_MANAGER"),
    createRequest
);

router.get(
    "/my-camp",
    authenticate,
    authorize("RELIEF_CAMP_MANAGER"),
    getMyCampRequests
);

// Control Centre
router.get(
    "/",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    getRequests
);

router.put(
    "/:id/verify",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    verify
);

router.put(
    "/:id/priority",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    updatePriority
);

// Individual request
router.get(
    "/:id",
    authenticate,
    getOneRequest
);

export default router;