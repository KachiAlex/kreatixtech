const API_URL = import.meta.env.VITE_API_URL || '';

let sessionId = sessionStorage.getItem('analytics_session_id');
if (!sessionId) {
  sessionId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem('analytics_session_id', sessionId);
}

let lastPage = null;

export function trackPageView(page) {
  if (page === lastPage) return;
  lastPage = page;

  fetch(`${API_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'PAGE_VIEW',
      page,
      sessionId,
    }),
  }).catch(() => {});
}

export function trackClick(label, page) {
  fetch(`${API_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'CLICK',
      page: page || window.location.pathname,
      label,
      sessionId,
    }),
  }).catch(() => {});
}

export { sessionId };
