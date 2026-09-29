// Whitelabel brand config — all values come from build-time env vars so the
// same codebase can compile to any tenant (e.g. VITE_BRAND_NAME="Pis Airtel
// Mail" VITE_SERVER_URL="https://mail.pisairtel.com" vite build).

export const BRAND = {
  // Product display name, e.g. "Kreatix Mail" / "Pis Airtel Mail"
  name: import.meta.env.VITE_BRAND_NAME || 'Kreatix Mail',
  // Company name used in copyright lines
  company: import.meta.env.VITE_BRAND_COMPANY || 'Kreatix Technologies',
  // Big word in the SVG logo lockup
  logoMain: import.meta.env.VITE_BRAND_LOGO_MAIN || 'kreatix',
  // Small sub-line in the SVG logo lockup
  logoSub: import.meta.env.VITE_BRAND_LOGO_SUB || 'TECHNOLOGIES',
  // Mail domain used in placeholder text, e.g. kreatixtech.com / pisairtel.com
  domain: import.meta.env.VITE_BRAND_DOMAIN || 'kreatixtech.com',
  // Mail server base URL — used by Electron/Capacitor builds which can't use
  // a relative /api path
  serverUrl: import.meta.env.VITE_SERVER_URL || 'https://mail.kreatixtech.com',
};

// Splits the product name for the two-tone title treatment:
// "Kreatix Mail" -> { main: "KREATIX", accent: "MAIL" }
// "Pis Airtel Mail" -> { main: "PIS AIRTEL", accent: "MAIL" }
export function brandTitle(): { main: string; accent: string } {
  const parts = BRAND.name.trim().split(/\s+/);
  const accent = parts.pop() || '';
  return { main: parts.join(' ').toUpperCase(), accent: accent.toUpperCase() };
}

// WebSocket endpoint derived from the configured server URL
export function wsUrl(): string {
  return `${BRAND.serverUrl.replace(/^http/, 'ws')}/ws`;
}
