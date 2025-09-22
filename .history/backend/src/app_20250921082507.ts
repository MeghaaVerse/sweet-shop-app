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
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// check endpoint
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow all origins in production for now
    : true,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/inventory', inventoryRoutes); 


// API routes will be added here
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

// Update CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sweet-shop-frontend-kbtrk19ib-meghashetty1309-5282s-projects.vercel.app'] 
    : true,
  credentials: true
}));


if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🍭 Sweet Shop API running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;