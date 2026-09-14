import cron from 'node-cron';
import { sendMonthlyDigest } from './security-digest.js';
import logger from '../lib/logger.js';

let started = false;

export function startScheduler() {
  if (started) return;
  started = true;

  // Monthly security digest: 1st of every month at 09:00 UTC
  cron.schedule('0 9 1 * *', async () => {
    try {
      await sendMonthlyDigest();
    } catch (err) {
      logger.error({ err }, 'Monthly digest cron job failed');
    }
  });

  logger.info('Scheduler started — monthly security digest cron active');
}
