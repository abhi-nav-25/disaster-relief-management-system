"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resourceController_1 = require("../controllers/resourceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Public read access
router.get("/", resourceController_1.getResources);
router.get("/:id", resourceController_1.getResource);
router.post("/", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("DMA_SUPERVISOR"), resourceController_1.create);
router.put("/:id", authMiddleware_1.authenticate, (0, roleMiddleware_1.authorize)("DMA_SUPERVISOR"), resourceController_1.update);
exports.default = router;
