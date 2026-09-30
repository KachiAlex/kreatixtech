import net from 'node:net';

// ── ClamAV scanner (clamd INSTREAM over TCP — no external deps) ──────────
//
// Env:
//   CLAMAV_SOCKET    unix socket path      (default /var/run/clamav/clamd.ctl)
//   CLAMAV_HOST      TCP host              (used when CLAMAV_SOCKET=off)
//   CLAMAV_PORT      TCP port              (default 3310)
//   CLAMAV_REQUIRED  '1' = reject when daemon is unreachable (fail closed);
//                    default allows + logs so a clamd outage can't block mail
//   AV_SCAN          '0' disables scanning entirely

const CLAMAV_SOCKET = process.env.CLAMAV_SOCKET ?? '/var/run/clamav/clamd.ctl';
const CLAMAV_HOST = process.env.CLAMAV_HOST || '127.0.0.1';
const CLAMAV_PORT = parseInt(process.env.CLAMAV_PORT || '3310');
const CLAMAV_REQUIRED = process.env.CLAMAV_REQUIRED === '1';
export const AV_ENABLED = process.env.AV_SCAN !== '0';

export interface ScanResult {
  clean: boolean;
  signature?: string;
  error?: string;
  skipped?: boolean;
}

export async function scanBuffer(buf: Buffer): Promise<ScanResult> {
  if (!AV_ENABLED) return { clean: true, skipped: true };

  return new Promise((resolve) => {
    let out = '';
    let settled = false;
    const socket = CLAMAV_SOCKET && CLAMAV_SOCKET !== 'off'
      ? net.createConnection({ path: CLAMAV_SOCKET } as any)
      : net.createConnection({ host: CLAMAV_HOST, port: CLAMAV_PORT });
    socket.setTimeout(60000);

    const finish = (r: ScanResult) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(r);
    };

    socket.on('error', (err) => {
      // Daemon unreachable — fail open unless CLAMAV_REQUIRED=1
      finish({ clean: !CLAMAV_REQUIRED, error: `clamd unavailable: ${err.message}` });
    });
    socket.on('timeout', () => {
      finish({ clean: !CLAMAV_REQUIRED, error: 'clamd scan timed out' });
    });
    socket.on('data', (d) => {
      out += d.toString('utf8');
      // clamd answers "stream: OK" or "stream: <signature> FOUND"
      if (out.includes('FOUND')) {
        const sig = /:\s*(.+)\s+FOUND/.exec(out)?.[1] || 'unknown';
        finish({ clean: false, signature: sig });
      } else if (out.includes('OK')) {
        finish({ clean: true });
      } else if (out.includes('ERROR')) {
        finish({ clean: !CLAMAV_REQUIRED, error: out.trim() });
      }
    });
    socket.on('close', () => {
      // Socket closed without a verdict — treat as scanner failure
      finish({ clean: !CLAMAV_REQUIRED, error: 'clamd closed without a verdict' });
    });

    socket.on('connect', () => {
      socket.write('nINSTREAM\n');
      // INSTREAM protocol: 4-byte BE length + chunk, terminated by a 0 length
      const CHUNK = 128 * 1024;
      for (let i = 0; i < buf.length; i += CHUNK) {
        const n = Math.min(CHUNK, buf.length - i);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(n, 0);
        socket.write(len);
        socket.write(buf.subarray(i, i + n));
      }
      socket.write(Buffer.alloc(4)); // zero-length terminator
    });
  });
}
