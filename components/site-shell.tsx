'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ShieldAlert, ArrowRight, Phone, LogOut, Menu, X } from 'lucide-react';

const mainLinks = [
  ['Asisten AI', '/asisten'],
  ['Regulasi', '/regulations'],
  ['Checklist', '/checklist'],
  ['Dokumen', '/dokumen'],
  ['Insiden', '/insiden'],
  ['Edukasi', '/education'],
  ['Lapor', '/lapor'],
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [emergency, setEmergency] = useState(false);
  const [menu, setMenu] = useState(false);
  const quick = ['/lapor', '/lacak', '/insiden', '/kanal'].some((p) => path.startsWith(p));

  function exit() {
    try {
      sessionStorage.removeItem('lexora-draft');
    } catch {}
    window.location.replace('https://www.google.com');
  }

  return (
    <>
      <header className="topnav no-print">
        <div className="container navinner">
          <Link href="/" className="wordmark">
            <div style={{ position: 'relative', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo/logo-glow.webp"
                alt="Logo Lexora"
                width={34}
                height={34}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ letterSpacing: '0.08em', fontWeight: 900, lineHeight: 1.1 }}>
                LEX<span style={{ color: '#00E5FF' }}>ORA</span>
              </span>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#94A3B8', fontWeight: 600 }}>
                CYBER LEGAL COMPANION
              </span>
            </div>
          </Link>

          <nav className="navlinks">
            {mainLinks.map(([n, h]) => {
              const active = path === h || (h !== '/' && path.startsWith(h));
              return (
                <Link
                  key={h}
                  href={h}
                  style={{
                    color: active ? '#00E5FF' : undefined,
                    fontWeight: active ? 700 : 500,
                    textShadow: active ? '0 0 12px rgba(0, 229, 255, 0.45)' : 'none',
                  }}
                >
                  {n}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn danger" onClick={() => setEmergency(true)} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <ShieldAlert size={16} /> Darurat
            </button>
            <Link className="btn ghost" href="/login" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              Masuk
            </Link>
            <Link className="btn" href="/lapor" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Mulai Lapor <ArrowRight size={15} />
            </Link>
            <button
              className="btn ghost"
              aria-label="Buka menu"
              onClick={() => setMenu(!menu)}
              style={{ padding: '8px 10px', display: 'none' }}
              id="mobile-menu-btn"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {menu && (
          <div
            className="container"
            style={{
              padding: '16px 0 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {mainLinks.map(([n, h]) => (
              <Link
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                style={{
                  color: path === h ? '#00E5FF' : '#E2E8F0',
                  fontWeight: 600,
                  padding: '6px 0',
                }}
              >
                {n}
              </Link>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/dashboard" className="btn secondary" style={{ flex: 1 }}>Dashboard</Link>
              <Link href="/toolkit" className="btn ghost" style={{ flex: 1 }}>Toolkit</Link>
            </div>
          </div>
        )}
      </header>

      {quick && (
        <div className="container no-print" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
          <button className="btn ghost" onClick={exit} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            <LogOut size={14} /> Keluar cepat (Sembunyikan layar)
          </button>
        </div>
      )}

      <main id="main">{children}</main>

      {/* Floating Mascot Widget: GEN-03 Idle/Standby (Trigger AI Legal Chat) */}
      {!path.startsWith('/asisten') && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
          }}
        >
          <Link
            href="/asisten"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 16px 8px 10px',
              background: 'linear-gradient(135deg, rgba(16, 28, 46, 0.95) 0%, rgba(8, 14, 24, 0.98) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.45)',
              borderRadius: 40,
              boxShadow: '0 8px 30px rgba(0, 229, 255, 0.3), 0 4px 12px rgba(0,0,0,0.5)',
              color: '#FFFFFF',
              textDecoration: 'none',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="hover-card"
          >
            <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
              <Image
                src="/mascot/gen-03-idle.webp"
                alt="Tanya Lexo"
                width={44}
                height={44}
                style={{ objectFit: 'contain' }}
                className="animate-float"
              />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#00E5FF', fontWeight: 800, letterSpacing: '0.05em' }}>
                ASISTEN HUKUM SIBER
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#F8FAFC' }}>
                Tanya Lexo AI →
              </div>
            </div>
          </Link>
        </div>
      )}

      <footer className="footer no-print">
        <div className="container grid2" style={{ alignItems: 'start', gap: 32 }}>
          <div>
            <Link href="/" className="wordmark">
              <Image
                src="/logo/logo-glow.webp"
                alt="Logo Lexora"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <span style={{ letterSpacing: '0.08em', fontWeight: 900 }}>
                LEX<span style={{ color: '#00E5FF' }}>ORA</span>
              </span>
            </Link>
            <p className="muted" style={{ marginTop: 14, maxWidth: 440, fontSize: '0.92rem' }}>
              Platform edukasi dan pendampingan hukum siber berbasis AI. Mengubah bahasa regulasi rumit menjadi langkah aksi nyata: Masalah → Penjelasan → Checklist → Template → Tindakan.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <Image
                src="/mascot/inc-02-shield.webp"
                alt="Mascot Guard"
                width={42}
                height={42}
                style={{ objectFit: 'contain' }}
              />
              <p className="muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                Lexora dirancang untuk Web Development Competition UINIC 8.0. Seluruh panduan hukum mengacu pada UU PDP No. 27/2022 dan UU ITE No. 1/2024.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div>
              <div className="label muted" style={{ marginBottom: 12 }}>FITUR INTI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <Link href="/asisten" style={{ color: '#E2E8F0' }}>Asisten AI Bersitasi ↗</Link>
                <Link href="/regulations" style={{ color: '#E2E8F0' }}>Database Regulasi ↗</Link>
                <Link href="/checklist" style={{ color: '#E2E8F0' }}>Checklist Kepatuhan ↗</Link>
                <Link href="/dokumen" style={{ color: '#E2E8F0' }}>Template Dokumen ↗</Link>
              </div>
            </div>
            <div>
              <div className="label muted" style={{ marginBottom: 12 }}>AKSI & RESPON</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <Link href="/insiden" style={{ color: '#E2E8F0' }}>Tanggap Insiden ↗</Link>
                <Link href="/education" style={{ color: '#E2E8F0' }}>Edukasi Interaktif ↗</Link>
                <Link href="/lapor" style={{ color: '#E2E8F0' }}>Form Lapor Cepat ↗</Link>
                <Link href="/lacak" style={{ color: '#E2E8F0' }}>Lacak Status Berkas ↗</Link>
              </div>
            </div>
            <div>
              <div className="label muted" style={{ marginBottom: 12 }}>ALAT BANTU</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <Link href="/kanal" style={{ color: '#E2E8F0' }}>Kanal Pemerintah ↗</Link>
                <Link href="/toolkit" style={{ color: '#E2E8F0' }}>Cyber Toolkit ↗</Link>
                <Link href="/tentang" style={{ color: '#E2E8F0' }}>Tentang Lexora ↗</Link>
                <Link href="/dashboard" style={{ color: '#E2E8F0' }}>Dashboard Pelapor ↗</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="quickbar no-print">
        <Link className="btn" href="/lapor">
          Mulai Lapor →
        </Link>
        <button className="btn danger" onClick={() => setEmergency(true)}>
          Darurat
        </button>
      </div>

      {emergency && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(5, 10, 18, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
        >
          <section className="panel" style={{ width: 'min(560px, 100%)', borderColor: 'rgba(239, 68, 68, 0.5)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src="/mascot/inc-02-shield.webp" alt="Lexo Shield" width={38} height={38} />
                <h2 id="emergency-title" className="section-title" style={{ margin: 0, fontSize: '1.5rem', color: '#EF4444' }}>
                  Bantuan Darurat
                </h2>
              </div>
              <button className="btn ghost" aria-label="Tutup" onClick={() => setEmergency(false)} style={{ padding: '6px 10px' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ marginTop: 14 }}>Jika kamu berada dalam ancaman fisik atau bahaya mendesak, utamakan keselamatan diri dan segera cari bantuan.</p>
            <div className="grid2" style={{ marginTop: 16 }}>
              <a className="btn danger" href="tel:110">
                <Phone size={16} /> Polisi 110
              </a>
              <a className="btn danger" href="tel:112">
                <Phone size={16} /> Darurat 112
              </a>
              <a className="btn secondary" href="tel:129">
                <Phone size={16} /> SAPA 129 (Perempuan & Anak)
              </a>
              <Link className="btn" href="/lapor" onClick={() => setEmergency(false)}>
                Mulai Laporan Siber
              </Link>
            </div>
            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.1)', margin: '20px 0' }} />
            <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px', color: '#00E5FF' }}>Uang baru saja ditransfer ke penipu?</h3>
            <ol style={{ paddingLeft: 20, margin: '8px 0', fontSize: '0.92rem', lineHeight: 1.6 }}>
              <li>Segera hubungi call center bank pengirim dan minta penahanan transaksi (*holding*).</li>
              <li>Amankan bukti transfer, mutasi rekening, dan rekaman percakapan.</li>
              <li>Susun berkas laporan lengkap di Lexora untuk diajukan ke IASC / Kepolisian.</li>
            </ol>
            <button
              className="btn ghost"
              style={{ width: '100%', marginTop: 12, fontSize: '0.88rem' }}
              onClick={() => {
                navigator.clipboard?.writeText(
                  'Saya ingin melaporkan transaksi yang diduga penipuan. Mohon bantu periksa dan tahan transaksi jika masih memungkinkan.'
                );
                alert('Teks permintaan penahanan transaksi disalin ke clipboard.');
              }}
            >
              Salin Naskah Cepat untuk Telepon Bank
            </button>
          </section>
        </div>
      )}
    </>
  );
}
