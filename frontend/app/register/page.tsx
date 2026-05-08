'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '', username: '', password: '', password_confirm: '', age: '', gender: 'other'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.register({
        email: form.email,
        username: form.username,
        password: form.password,
        password_confirm: form.password_confirm,
        age: Number(form.age),
        gender: form.gender,
      });
      const data = await api.login(form.email, form.password);
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display: 'block', marginBottom: 32, textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22 }}>
            Cut<span className="gradient-text">Link</span>
          </span>
        </Link>

        <div className="card">
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>
            Already have one? <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'username', label: 'Username', type: 'text', placeholder: 'cooluser' },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { name: 'password_confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••' },
              { name: 'age', label: 'Age', type: 'number', placeholder: '25' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                <input
                  className="input"
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  required
                  min={field.name === 'age' ? 1 : undefined}
                  max={field.name === 'age' ? 120 : undefined}
                />
              </div>
            ))}

            <div>
              <label style={{ fontSize: 13, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--text)', fontFamily: 'DM Sans',
                  fontSize: 15, padding: '12px 16px', width: '100%', outline: 'none'
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && <p style={{ color: '#ff6584', fontSize: 14 }}>{error}</p>}

            <button className="glow-btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8, padding: '14px', fontSize: 16 }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}