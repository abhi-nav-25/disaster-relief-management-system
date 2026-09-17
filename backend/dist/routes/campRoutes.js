"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campController_1 = require("../controllers/campController");
const router = (0, express_1.Router)();
router.get("/", campController_1.getCamps);
router.get("/nearest", campController_1.getNearest);
router.get("/:id", campController_1.getCamp);
exports.default = router;
