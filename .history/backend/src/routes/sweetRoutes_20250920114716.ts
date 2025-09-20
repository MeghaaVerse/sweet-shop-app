import { Router } from 'express';
import {
  createSweet,
  getAllSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  getSweetCategories
} from '../controllers/sweetController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateSweet,
  validateUpdateSweet,
  validateSweetQuery
} from '../middleware/sweetValidation';

const router = Router();

// Public routes
router.get('/', validateSweetQuery, getAllSweets);
router.get('/categories', getSweetCategories);
router.get('/:id', getSweetById);

console.log('Incoming sweet data:', req.body);

// Protected routes (require authentication)
router.post('/', authenticateToken, validateCreateSweet, createSweet);
router.put('/:id', authenticateToken, validateUpdateSweet, updateSweet);
router.delete('/:id', authenticateToken, deleteSweet);

export default router;