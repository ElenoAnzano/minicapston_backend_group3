"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginController_1 = require("../controllers/loginController");
const router = (0, express_1.Router)();
router.post("/register", loginController_1.register);
router.post("/login", loginController_1.login);
router.post("/reset-password", loginController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=loginRoutes.js.map