import { Router } from "express";

import {
    getCamps,
    getCamp,
    getNearest,
} from "../controllers/campController";

const router = Router();
router.get("/", getCamps);
router.get("/nearest", getNearest);
router.get("/:id", getCamp);

export default router;