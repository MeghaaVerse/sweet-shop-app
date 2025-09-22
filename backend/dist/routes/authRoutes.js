"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', validation_1.validateRegister, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
// Protected routes
router.get('/profile', auth_1.authenticateToken, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map