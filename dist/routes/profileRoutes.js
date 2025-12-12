"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profileController_1 = require("../controllers/profileController");
const router = (0, express_1.Router)();
// GET profile (name + photo)
router.get("/:idNumber", profileController_1.getProfile);
// Update name
router.post("/update-name", profileController_1.updateName);
// Update profile photo
router.post("/update-photo", profileController_1.updatePhoto);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map