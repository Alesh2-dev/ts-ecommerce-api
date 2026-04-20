import app from './app';
import { config } from './config/env';
import { testConnection } from './db/connection';

const start = async () => {
  await testConnection();
  app.listen(config.server.port, () => {
    console.log(`Server running on http://localhost:${config.server.port}`);
    console.log(`Environment: ${config.server.nodeEnv}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});