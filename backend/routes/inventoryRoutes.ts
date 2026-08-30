import { Router } from "express";

import {
    getInventory,
    updateInventory,
} from "../controllers/inventoryController";

import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.get(
    "/my-camp",
    authenticate,
    authorize("RELIEF_CAMP_MANAGER"),
    getInventory
);

router.put(
    "/my-camp/:resourceId",
    authenticate,
    authorize("RELIEF_CAMP_MANAGER"),
    updateInventory
);

export default router;