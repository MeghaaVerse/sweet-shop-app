import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import sweetRoutes from './routes/sweetRoutes';
import inventoryRoutes from './routes/inventoryRoutes';

// Initialize Prisma client
export const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
aapp.use(cors({
  origin: [
    'https://sweet-shop-frontend-kbtrk19ib-meghashetty1309-5282s-projects.vercel.app',
    /\.vercel\.app$/,
    'http://localhost:5173', // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Sweet Shop API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      sweets: '/api/sweets',
      inventory: '/api/inventory'
    }
  });
});

// Health check endpoint - MUST be before other routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Sweet Shop API is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3001
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/inventory', inventoryRoutes);

// Catch-all for undefined routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🍭 Sweet Shop API running on port ${PORT}`);
});

export default app;