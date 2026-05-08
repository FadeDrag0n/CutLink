'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, [pathname]);

  function logout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(8,11,20,0.85)',
      backdropFilter: 'blur(20px)',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22,
          background: 'var(--grad)', WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          CutLink
        </span>
      </Link>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {isAuth ? (
          <>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ padding: '8px 18px' }}>Dashboard</button>
            </Link>
            <button className="btn-primary" style={{ padding: '8px 18px' }} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ padding: '8px 18px' }}>Login</button>
            </Link>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '8px 18px' }}>Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
