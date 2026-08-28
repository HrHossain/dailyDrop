import dotenv from 'dotenv';
import { app } from './app.js';
import chalk from 'chalk';
import { logger } from './lib/logger.js';
import { env } from './validations/env.schema.js';
dotenv.config();

app.listen(env.PORT, (err) => {
  if (err) {
    logger.error(
      chalk.bgRed(`Error occurred while starting the server: ${err.message}`)
    );
    process.exit(1);
  }
  logger.info(chalk.bgRed(`Server running on http://localhost:${env.PORT}`));
});
