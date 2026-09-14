import { prisma } from '../lib/prisma.js';
import { sendMonthlySecurityDigestEmail } from './email.js';
import { getSecurityPreferences } from '../lib/security-notifications.js';
import logger from '../lib/logger.js';

export async function sendMonthlyDigest() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = now; // up to now

  const monthLabel = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const [totalEvents, criticalHigh, failedSSH, banned, activeBans] = await Promise.all([
    prisma.securityEvent.count({ where: { createdAt: { gte: startOfMonth, lt: endOfMonth } } }),
    prisma.securityEvent.count({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
        severity: { in: ['CRITICAL', 'HIGH'] },
      },
    }),
    prisma.securityEvent.count({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
        type: 'SSH_FAILED',
      },
    }),
    prisma.securityEvent.count({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
        type: 'FAIL2BAN_BAN',
      },
    }),
    prisma.bannedIP.count({ where: { active: true } }),
  ]);

  const topEvents = await prisma.securityEvent.findMany({
    where: {
      createdAt: { gte: startOfMonth, lt: endOfMonth },
      severity: { in: ['CRITICAL', 'HIGH'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const stats = { totalEvents, criticalHigh, failedSSH, banned };

  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'ANALYST'] } },
    select: { id: true, email: true, notificationPreferences: true, lastMonthlyDigestSentAt: true },
  });

  for (const user of users) {
    const prefs = getSecurityPreferences(user);
    if (!prefs.monthlyDigest || !user.email) continue;

    // Avoid sending more than once per month
    if (user.lastMonthlyDigestSentAt && user.lastMonthlyDigestSentAt >= startOfMonth) {
      continue;
    }

    try {
      await sendMonthlySecurityDigestEmail({
        to: user.email,
        month: monthLabel,
        stats,
        topEvents,
        activeBans,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastMonthlyDigestSentAt: new Date() },
      });
    } catch (err) {
      logger.error({ err, userId: user.id }, 'Failed to send monthly security digest');
    }
  }

  logger.info({ month: monthLabel, recipients: users.length }, 'Monthly security digest processed');
}
