import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import matchRoutes from './routes/matchRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/matches', matchRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'up',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

export default app;