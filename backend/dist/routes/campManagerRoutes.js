"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campManagerController_1 = require("../controllers/campManagerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
router.put("/me", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("RELIEF_CAMP_MANAGER"), campManagerController_1.updateOwnCamp);
exports.default = router;
