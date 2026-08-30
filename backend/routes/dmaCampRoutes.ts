import { Router } from "express";

import {
    updateOfficialCamp,
} from "../controllers/dmaCampController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.put(
    "/:id",
    authenticate,
    authorize("DMA_SUPERVISOR"),
    updateOfficialCamp
);

export default router;