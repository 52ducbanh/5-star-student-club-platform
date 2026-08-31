export function buildCorsOriginMatcher(configuredOrigin?: string) {
  const configured = (configuredOrigin || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser requests (Postman, curl, internal calls)
    if (!origin) {
      return callback(null, true);
    }

    // Direct match against configured origins
    if (configured.includes(origin)) {
      return callback(null, true);
    }

    // In development mode: allow local network testing (localhost, 127.0.0.1, LAN private IPs)
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      try {
        const url = new URL(origin);
        const host = url.hostname;
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
          /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
          /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
        ) {
          return callback(null, true);
        }
      } catch {
        // Invalid URL format
      }
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  };
}
