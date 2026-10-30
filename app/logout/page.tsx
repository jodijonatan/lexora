'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutPage() {
  useEffect(() => {
    // Automatically trigger signOut and redirect to login
    signOut({ callbackUrl: '/login' });
  }, []);

  return (
    <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="panel" style={{ maxWidth: 420, textAlign: 'center', padding: '36px 24px' }}>
        <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: 16 }}>
          <LogOut size={32} style={{ color: '#EF4444' }} />
        </div>
        <h2 style={{ color: '#FFFFFF', marginBottom: 8, fontSize: '1.3rem' }}>Sedang Keluar dari Sesi...</h2>
        <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 20 }}>
          Sesi Anda sedang ditutup secara aman dari Lexora. Anda akan dialihkan ke halaman login.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#00E5FF', fontSize: '0.85rem' }}>
          <Loader2 size={16} className="animate-spin" />
          <span>Memproses...</span>
        </div>
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link href="/login" className="btn secondary" style={{ fontSize: '0.85rem' }}>
            Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
