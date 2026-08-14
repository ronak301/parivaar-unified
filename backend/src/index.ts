import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';
import { startBirthdayCron } from './cron/birthdayCron';

async function start() {
  await connectDB();
  startBirthdayCron();
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
