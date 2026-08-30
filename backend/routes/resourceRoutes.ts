import { Router } from "express";

import {
    getResources,
    getResource,
    create,
    update,
} from "../controllers/resourceController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

// Public read access
router.get("/", getResources);
router.get("/:id", getResource);
router.post(
    "/",
    authenticate,
    authorize("DMA_SUPERVISOR"),
    create
);
router.put(
    "/:id",
    authenticate,
    authorize("DMA_SUPERVISOR"),
    update
);

export default router;