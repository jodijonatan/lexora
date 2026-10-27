import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="panel"
        style={{
          maxWidth: 580,
          textAlign: 'center',
          padding: '48px 32px',
          background: 'linear-gradient(135deg, rgba(16, 28, 46, 0.85) 0%, rgba(8, 14, 24, 0.95) 100%)',
          border: '1px solid rgba(0, 229, 255, 0.25)',
          borderRadius: 20,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Image
            src="/mascot/err-03-lost-404.webp"
            alt="Mascot Lexo Tersesat 404"
            width={140}
            height={140}
            className="animate-float"
            priority
          />
        </div>

        <div className="label" style={{ color: '#00E5FF', marginBottom: 8 }}>
          KODE 404 · JALUR HUKUM TIDAK DITEMUKAN
        </div>

        <h1 className="section-title" style={{ fontSize: '1.8rem', color: '#FFFFFF', margin: '8px 0 14px' }}>
          Ups! Lexo Bingung Mencari Halaman Ini
        </h1>

        <p className="muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 28 }}>
          Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau tautan yang Anda masukkan keliru. Tenang, Lexo siap memandu Anda kembali ke jalur yang aman.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn" style={{ padding: '10px 22px' }}>
            Kembali ke Beranda →
          </Link>
          <Link href="/asisten" className="btn secondary" style={{ padding: '10px 20px' }}>
            Tanya Asisten Lexo
          </Link>
        </div>
      </div>
    </div>
  );
}
