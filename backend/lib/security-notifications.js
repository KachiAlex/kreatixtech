// ── Security notification preference helpers ─────────────────────────────────
// Users can control which security events trigger immediate email alerts and
// whether they receive a monthly digest.

export const DEFAULT_SECURITY_NOTIFICATION_PREFERENCES = {
  monthlyDigest: true,
  immediate: {
    critical: true,
    high: false,
    medium: false,
    low: false,
    info: false,
    unauthorizedAccess: true,
    bans: false,
    firewallChanges: false,
  },
};

export function getSecurityPreferences(user) {
  const prefs = user?.notificationPreferences || {};
  const security = prefs.security || {};
  return {
    monthlyDigest: security.monthlyDigest ?? DEFAULT_SECURITY_NOTIFICATION_PREFERENCES.monthlyDigest,
    immediate: {
      ...DEFAULT_SECURITY_NOTIFICATION_PREFERENCES.immediate,
      ...(security.immediate || {}),
    },
  };
}

export function isUnauthorizedAccess(event) {
  if (event.type === 'SUSPICIOUS_LOGIN') return true;
  if (event.type === 'SSH_SUCCESS') {
    const details = event.details || {};
    if (details.unauthorized === true) return true;
    if (details.authorized === false) return true;
  }
  return false;
}

export function eventMatchesUserPreference(event, preferences) {
  const immediate = preferences.immediate;

  if (isUnauthorizedAccess(event) && immediate.unauthorizedAccess) return true;

  const severity = (event.severity || '').toLowerCase();
  if (severity === 'critical' && immediate.critical) return true;
  if (severity === 'high' && immediate.high) return true;
  if (severity === 'medium' && immediate.medium) return true;
  if (severity === 'low' && immediate.low) return true;
  if (severity === 'info' && immediate.info) return true;

  const type = (event.type || '').toLowerCase();
  if (type === 'fail2ban_ban' && immediate.bans) return true;
  if (type === 'firewall_change' && immediate.firewallChanges) return true;

  return false;
}

export function filterEventsForUser(events, preferences) {
  return events.filter(e => eventMatchesUserPreference(e, preferences));
}

export function getAdminRecipientsForEvents(admins, events) {
  const recipients = [];
  for (const admin of admins) {
    const prefs = getSecurityPreferences(admin);
    const matching = filterEventsForUser(events, prefs);
    if (matching.length > 0) {
      recipients.push({ admin, preferences: prefs, events: matching });
    }
  }
  return recipients;
}
