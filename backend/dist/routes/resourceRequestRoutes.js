"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resourceRequestController_1 = require("../controllers/resourceRequestController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Camp Manager
router.post("/", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("RELIEF_CAMP_MANAGER"), resourceRequestController_1.createRequest);
router.get("/my-camp", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("RELIEF_CAMP_MANAGER"), resourceRequestController_1.getMyCampRequests);
// Control Centre
router.post("/on-behalf", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("CONTROL_CENTRE_OPERATOR"), resourceRequestController_1.createOnBehalfRequest);
router.get("/", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("CONTROL_CENTRE_OPERATOR"), resourceRequestController_1.getRequests);
router.put("/:id/verify", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("CONTROL_CENTRE_OPERATOR"), resourceRequestController_1.verify);
router.put("/:id/priority", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("CONTROL_CENTRE_OPERATOR"), resourceRequestController_1.updatePriority);
// Individual request
router.get("/:id", authMiddleware_1.authenticate, resourceRequestController_1.getOneRequest);
exports.default = router;
