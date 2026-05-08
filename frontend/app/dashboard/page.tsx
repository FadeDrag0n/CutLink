'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

interface LinkItem {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  clicks: number;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [shortening, setShortening] = useState(false);
  const [error, setError] = useState('');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [qrLoading, setQrLoading] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const loadLinks = useCallback(async () => {
    try {
      const data = await api.myLinks();
      setLinks(data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    api.me().then(setUser).catch(() => router.push('/login'));
    loadLinks();
  }, [router, loadLinks]);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setShortening(true);
    try {
      await api.shorten(url);
      setUrl('');
      await loadLinks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setShortening(false);
    }
  }

  async function handleGenerateQR(shortCode: string) {
    setQrLoading(prev => ({ ...prev, [shortCode]: true }));
    try {
      const data = await api.generateQR(shortCode);
      setQrMap(prev => ({ ...prev, [shortCode]: data.qr_url }));
    } catch {
      // ignore
    } finally {
      setQrLoading(prev => ({ ...prev, [shortCode]: false }));
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid var(--border)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22 }}>
            Cut<span className="gradient-text">Link</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>
              👋 {user.username}
            </span>
          )}
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--muted)', cursor: 'pointer',
            fontSize: 13, padding: '6px 14px'
          }}>
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>My Links</h1>
          <p style={{ color: 'var(--muted)' }}>Manage your shortened links and generate QR codes</p>
        </div>

        {/* Shorten form */}
        <div className="card fade-up-2" style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Shorten a new link</h2>
          <form onSubmit={handleShorten} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              className="input"
              type="url"
              placeholder="https://your-long-url.com/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
              style={{ flex: 1, minWidth: 200 }}
            />
            <button className="glow-btn" type="submit" disabled={shortening}>
              {shortening ? '...' : 'Shorten →'}
            </button>
          </form>
          {error && <p style={{ color: '#ff6584', fontSize: 14, marginTop: 12 }}>{error}</p>}
        </div>

        {/* Links list */}
        <div className="fade-up-3">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>Loading...</div>
          ) : links.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
              <p style={{ color: 'var(--muted)' }}>No links yet. Shorten your first URL above!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {links.map(link => (
                <div key={link.id} className="card">
                  {/* Original URL */}
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {link.original_url}
                  </p>

                  {/* Short URL + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    <a
                      href={link.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent)', fontFamily: 'Syne', fontSize: 18, fontWeight: 700, textDecoration: 'none' }}
                    >
                      {link.short_url}
                    </a>
                    <button
                      onClick={() => handleCopy(link.short_url, String(link.id))}
                      style={{
                        background: copied === String(link.id) ? 'rgba(108,99,255,0.2)' : 'var(--surface2)',
                        border: '1px solid var(--border)', borderRadius: 6,
                        color: copied === String(link.id) ? 'var(--accent)' : 'var(--muted)',
                        cursor: 'pointer', fontSize: 12, padding: '4px 10px', transition: 'all 0.2s'
                      }}
                    >
                      {copied === String(link.id) ? '✓ Copied' : 'Copy'}
                    </button>
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {link.clicks} clicks
                    </span>
                  </div>

                  {/* QR section */}
                  {qrMap[link.short_code] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                      <img
                        src={qrMap[link.short_code]}
                        alt="QR Code"
                        style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid var(--border)' }}
                      />
                      <a
                        href={qrMap[link.short_code]}
                        download
                        style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none' }}
                      >
                        ↓ Download QR
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateQR(link.short_code)}
                      disabled={qrLoading[link.short_code]}
                      style={{
                        background: 'transparent', border: '1px solid rgba(108,99,255,0.4)',
                        borderRadius: 8, color: 'var(--accent)', cursor: 'pointer',
                        fontSize: 13, padding: '6px 14px', transition: 'all 0.2s'
                      }}
                    >
                      {qrLoading[link.short_code] ? 'Generating...' : '📱 Generate QR'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}