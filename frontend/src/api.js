const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export async function api(path, options = {}) {
  const token = localStorage.getItem('accessToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response = await fetch(`${BASE}${path}`, { ...options, headers });
  if (response.status === 401 && localStorage.getItem('refreshToken') && !path.includes('/auth/')) {
    const refresh = await fetch(`${BASE}/auth/refresh`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }) });
    if (refresh.ok) {
      const data = await refresh.json();
      localStorage.setItem('accessToken', data.accessToken); localStorage.setItem('refreshToken', data.refreshToken);
      headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(`${BASE}${path}`, { ...options, headers });
    }
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
