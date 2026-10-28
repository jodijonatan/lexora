'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="panel"
        style={{
          maxWidth: 580,
          textAlign: 'center',
          padding: '48px 32px',
          background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.85) 0%, rgba(10, 14, 22, 0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 20,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Image
            src="/mascot/err-02-maintenance.webp"
            alt="Mascot Lexo Maintenance"
            width={140}
            height={140}
            className="animate-float"
            priority
          />
        </div>

        <div className="label" style={{ color: '#EF4444', marginBottom: 8 }}>
          TERJADI KESALAHAN SISTEM (MAINTENANCE)
        </div>

        <h1 className="section-title" style={{ fontSize: '1.8rem', color: '#FFFFFF', margin: '8px 0 14px' }}>
          Maaf, Lexo Sedang Memperbaiki Jaringan
        </h1>

        <p className="muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
          Sistem mendeteksi kendala saat memuat data halaman ini. Data lokal dan privasi Anda tetap aman di perangkat. Silakan coba muat ulang halaman.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => reset()} style={{ padding: '10px 22px' }}>
            Coba Muat Ulang
          </button>
          <Link href="/" className="btn secondary" style={{ padding: '10px 20px' }}>
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
