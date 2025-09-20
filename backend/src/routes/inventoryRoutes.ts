import { Router } from 'express';
import {
  logInventoryChange,
  getInventoryLogs,
  getInventoryReport,
  getStockAlerts
} from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/auth';
import {
  validateInventoryLog,
  validateInventoryQuery
} from '../middleware/inventoryValidation';

const router = Router();

// All inventory routes require authentication
router.use(authenticateToken);

// Inventory logging
router.post('/log', validateInventoryLog, logInventoryChange);

// Inventory reports and queries
router.get('/logs', validateInventoryQuery, getInventoryLogs);
router.get('/report', validateInventoryQuery, getInventoryReport);
router.get('/alerts', validateInventoryQuery, getStockAlerts);

export default router;