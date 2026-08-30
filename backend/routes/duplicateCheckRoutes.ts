import { Router } from "express";

import {
    detectDuplicates,
    getChecks,
    reviewDuplicate,
} from "../controllers/duplicateCheckController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
    "/request/:id/detect",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    detectDuplicates
);

router.get(
    "/request/:id",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    getChecks
);

router.put(
    "/:id/review",
    authenticate,
    authorize("CONTROL_CENTRE_OPERATOR"),
    reviewDuplicate
);

export default router;