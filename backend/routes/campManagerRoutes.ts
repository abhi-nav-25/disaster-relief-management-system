import { Router } from "express";
import { updateOwnCamp } from "../controllers/campManagerController";
import { authenticate } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/roleMiddleware";

const router = Router();

router.put(
    "/me",
    authenticate,
    authorize("RELIEF_CAMP_MANAGER"),
    updateOwnCamp
);

export default router;