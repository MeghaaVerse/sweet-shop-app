import { Router } from 'express';
import { customerRegister, customerLogin, getCustomerProfile } from '../controllers/customerAuthController';
import { validateCustomerRegister, validateCustomerLogin } from '../middleware/customerValidation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateCustomerRegister, customerRegister);
router.post('/login', validateCustomerLogin, customerLogin);

// Protected routes
router.get('/profile', authenticateToken, getCustomerProfile);

export default router;