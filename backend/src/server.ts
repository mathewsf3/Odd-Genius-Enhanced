import app from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    const port = config.PORT;
    
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();