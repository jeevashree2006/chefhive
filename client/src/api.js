/* Talks to the Express API. In development Vite proxies /api to http://localhost:4000. */
const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors; // field name -> message, for validation failures
  }
}

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (cause) {
    throw new ApiError('Cannot reach the ChefHive server. Check your connection and try again.', { status: 0 });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.message || 'That did not work. Please try again.', { status: response.status, errors: data.errors });
  }
  return data;
};

export const getCatalog = () => request('/catalog');
export const createBooking = (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) });
export const getBooking = (ref) => request(`/bookings/${encodeURIComponent(ref)}`);
export const applyAsCook = (payload) => request('/cooks/apply', { method: 'POST', body: JSON.stringify(payload) });
