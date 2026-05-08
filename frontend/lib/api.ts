const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  register: (data: { email: string; username: string; password: string; password_confirm: string; age: number; gender: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  me: () => request('/auth/me'),

  shorten: (url: string) =>
    request('/shorten', { method: 'POST', body: JSON.stringify({ original_url: url }) }),

  myLinks: () => request('/my'),

  generateQR: (shortCode: string) =>
    request(`/qr/${shortCode}`, { method: 'POST' }),
};