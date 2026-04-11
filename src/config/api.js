/**
 * Base URL for API requests.
 * In development: uses Vite proxy → "/api"
 * In production: uses the full backend URL from env var
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export default API_BASE;
