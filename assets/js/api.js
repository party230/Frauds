/* ============================================================
   OFFICIAL FRAUD RANKINGS — API client
   ------------------------------------------------------------
   Talks to the Node backend on the same origin. The session is an
   HttpOnly cookie, so nothing here handles tokens; the custom client
   header is what the server checks for CSRF.
   ============================================================ */

class ApiError extends Error {
  constructor(status, payload) {
    const body = (payload && payload.error) || {};
    super(body.message || 'The board is not responding.');
    this.status = status;
    this.code = body.code || 'network_error';
    this.field = body.field || null;
  }
}

const Api = {
  base: '/api',
  offline: false,           /* set when the backend is not reachable */

  async request(method, path, body) {
    let res;
    try {
      res = await fetch(this.base + path, {
        method: method,
        credentials: 'same-origin',
        headers: Object.assign({ 'X-OFR-Client': 'web' }, body ? { 'Content-Type': 'application/json' } : {}),
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (e) {
      throw new ApiError(0, null);
    }

    let payload = null;
    try { payload = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) throw new ApiError(res.status, payload);
    return payload;
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body || {}); },
  patch(path, body) { return this.request('PATCH', path, body || {}); },
  put(path, body) { return this.request('PUT', path, body || {}); },
  del(path) { return this.request('DELETE', path); }
};
