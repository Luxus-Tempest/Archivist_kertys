const API_URL = import.meta.env.VITE_BASE_URL;

/**
 * Wrapper for `fetch` that automatically injects the Authorization Bearer token 
 * from localStorage if present.
 */
export async function fetchAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Si le body est un objet JSON et qu'on ne fait pas d'upload de FormData, on ajoute application/json
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Erreur lors de la requête');
  }

  return response.json();
}
