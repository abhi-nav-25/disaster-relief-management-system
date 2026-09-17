"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emergencyContactController_1 = require("../controllers/emergencyContactController");
const router = (0, express_1.Router)();
router.get("/", emergencyContactController_1.getEmergencyContacts);
exports.default = router;
