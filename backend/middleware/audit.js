import { prisma } from '../lib/prisma.js';

export async function logAudit({ userId, action, resourceType, resourceId, details, req }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        details: details ? JSON.stringify(details) : null,
        ipAddress: req?.ip || req?.headers['x-forwarded-for'] || null,
        userAgent: req?.headers['user-agent'] || null,
      }
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

// Express middleware wrapper
export function auditMiddleware(action, resourceType, getResourceId = null) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      const resourceId = getResourceId ? getResourceId(req, data) : req.params?.id || null;
      logAudit({
        userId: req.user?.id,
        action,
        resourceType,
        resourceId,
        details: req.body,
        req
      });
      return originalJson(data);
    };
    
    next();
  };
}
