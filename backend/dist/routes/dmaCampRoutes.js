"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dmaCampController_1 = require("../controllers/dmaCampController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
router.put("/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("DMA_SUPERVISOR"), dmaCampController_1.updateOfficialCamp);
exports.default = router;
