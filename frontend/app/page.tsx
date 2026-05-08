'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';

export default function Home() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<{ short_url: string; short_code: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await api.shorten(url);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid var(--border)'
      }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, letterSpacing: -0.5 }}>
          Cut<span className="gradient-text">Link</span>
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="glow-btn" style={{ padding: '8px 18px', fontSize: 14 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
                Login
              </Link>
              <Link href="/register">
                <button className="glow-btn" style={{ padding: '8px 18px', fontSize: 14 }}>
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div className="fade-up" style={{ textAlign: 'center', maxWidth: 680 }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 100,
            border: '1px solid rgba(108,99,255,0.4)', fontSize: 13, color: 'var(--accent)',
            marginBottom: 24, background: 'rgba(108,99,255,0.08)'
          }}>
            ✦ Fast · Simple · Free
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 7vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
            Shorten links,<br />
            <span className="gradient-text">share smarter</span>
          </h1>

          <p style={{ color: 'var(--muted)', fontSize: 18, lineHeight: 1.6, marginBottom: 48 }}>
            Turn any long URL into a clean, shareable link in seconds.
            Generate QR codes and track clicks effortlessly.
          </p>

          {/* Form */}
          <form onSubmit={handleShorten} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              className="input"
              type="url"
              placeholder="Paste your long URL here..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              style={{ flex: 1, minWidth: 280, maxWidth: 480, fontSize: 16 }}
            />
            <button className="glow-btn" type="submit" disabled={loading} style={{ fontSize: 16, padding: '12px 32px' }}>
              {loading ? '...' : 'Shorten →'}
            </button>
          </form>

          {error && (
            <p style={{ color: '#ff6584', marginTop: 16, fontSize: 14 }}>{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="card fade-up" style={{ marginTop: 32, textAlign: 'left' }}>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>Your short link:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <a
                  href={result.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', fontFamily: 'Syne', fontSize: 20, fontWeight: 700, textDecoration: 'none' }}
                >
                  {result.short_url}
                </a>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copied ? 'rgba(108,99,255,0.2)' : 'var(--surface2)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    color: copied ? 'var(--accent)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: 13, padding: '6px 14px', transition: 'all 0.2s'
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="fade-up-3" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, maxWidth: 700, width: '100%', marginTop: 80
        }}>
          {[
            { icon: '⚡', title: 'Instant', desc: 'Links ready in milliseconds' },
            { icon: '📊', title: 'Analytics', desc: 'Track clicks on your links' },
            { icon: '📱', title: 'QR Codes', desc: 'Generate QR for any link' },
          ].map(f => (
            <div key={f.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}