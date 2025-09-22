"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryController_1 = require("../controllers/inventoryController");
const auth_1 = require("../middleware/auth");
const inventoryValidation_1 = require("../middleware/inventoryValidation");
const router = (0, express_1.Router)();
// All inventory routes require authentication
router.use(auth_1.authenticateToken);
// Inventory logging
router.post('/log', inventoryValidation_1.validateInventoryLog, inventoryController_1.logInventoryChange);
// Inventory reports and queries
router.get('/logs', inventoryValidation_1.validateInventoryQuery, inventoryController_1.getInventoryLogs);
router.get('/report', inventoryValidation_1.validateInventoryQuery, inventoryController_1.getInventoryReport);
router.get('/alerts', inventoryValidation_1.validateInventoryQuery, inventoryController_1.getStockAlerts);
exports.default = router;
//# sourceMappingURL=inventoryRoutes.js.map