"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sweetController_1 = require("../controllers/sweetController");
const auth_1 = require("../middleware/auth");
const sweetValidation_1 = require("../middleware/sweetValidation");
const router = (0, express_1.Router)();
// Public routes
router.get('/', sweetValidation_1.validateSweetQuery, sweetController_1.getAllSweets);
router.get('/categories', sweetController_1.getSweetCategories);
router.get('/:id', sweetController_1.getSweetById);
// Protected routes (require authentication)
router.post('/', auth_1.authenticateToken, sweetValidation_1.validateCreateSweet, sweetController_1.createSweet);
router.put('/:id', auth_1.authenticateToken, sweetValidation_1.validateUpdateSweet, sweetController_1.updateSweet);
router.delete('/:id', auth_1.authenticateToken, sweetController_1.deleteSweet);
exports.default = router;
//# sourceMappingURL=sweetRoutes.js.map