import { Router } from "express";

import {
    getEmergencyContacts,
} from "../controllers/emergencyContactController";

const router = Router();

router.get("/", getEmergencyContacts);

export default router;