'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, Phone, LogOut, Menu, X, Check } from 'lucide-react';

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
  const [copiedBankScript, setCopiedBankScript] = useState(false);
  const quick = ['/lapor', '/lacak', '/insiden', '/kanal'].some((p) => path.startsWith(p));

  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setMenu(false);
  }

  // Scroll to top immediately on route change without animation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [path]);

  // Handle ESC key for modal
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (emergency) setEmergency(false);
        if (menu) setMenu(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [emergency, menu]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (menu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  function exit() {
    try {
      sessionStorage.removeItem('lexora-draft');
    } catch {}
    window.location.replace('https://www.google.com');
  }

  function copyBankScript() {
    const text = 'Saya ingin melaporkan transaksi yang diduga penipuan. Mohon bantu periksa dan tahan transaksi jika masih memungkinkan.';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBankScript(true);
      setTimeout(() => setCopiedBankScript(false), 2500);
    }
  }

  return (
    <>
      <header className="topnav no-print">
        <div className="container navinner">
          <Link href="/" className="wordmark" aria-label="Lexora Home" onClick={() => setMenu(false)}>
            <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image
                src="/logo/logo-flat.webp"
                alt="Logo Lexora"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ letterSpacing: '0.06em', fontWeight: 800, lineHeight: 1.15, fontSize: '1.15rem' }}>
                LEX<span style={{ color: '#00E5FF' }}>ORA</span>
              </span>
              <span className="wordmark-subtitle" style={{ fontSize: '0.62rem', letterSpacing: '0.12em', color: '#94A3B8', fontWeight: 500 }}>
                CYBER LEGAL COMPANION
              </span>
            </div>
          </Link>

          <nav className="navlinks" aria-label="Navigasi Utama">
            {mainLinks.map(([name, href]) => {
              const active = path === href || (href !== '/' && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    color: active ? '#00E5FF' : '#CBD5E1',
                    fontWeight: active ? 600 : 500,
                    borderBottom: active ? '2px solid #00E5FF' : '2px solid transparent',
                    paddingBottom: '4px',
                  }}
                >
                  {name}
                </Link>
              );
            })}
          </nav>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn danger"
              onClick={() => setEmergency(true)}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              aria-label="Bantuan Darurat"
            >
              <ShieldAlert size={15} />
              <span className="nav-btn-text">Darurat</span>
            </button>
            <Link
              className="btn ghost nav-btn-desktop-only"
              href="/login"
              style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            >
              Masuk
            </Link>
            <Link
              className="btn nav-btn-desktop-only"
              href="/lapor"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              Mulai Lapor <ArrowRight size={14} />
            </Link>
            <button
              className="btn ghost mobile-menu-btn"
              aria-label={menu ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
              style={{ padding: '7px 10px' }}
              id="mobile-menu-btn"
            >
              {menu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menu && (
          <div className="mobile-menu-drawer" role="dialog" aria-label="Menu Navigasi Mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span className="label muted">NAVIGASI MODUL</span>
              <button
                className="btn ghost"
                onClick={() => setMenu(false)}
                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                aria-label="Tutup Menu"
              >
                <X size={16} /> Tutup
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {mainLinks.map(([name, href]) => {
                const active = path === href || (href !== '/' && path.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: active ? '#00E5FF' : '#E2E8F0',
                      background: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                      border: active ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                      borderRadius: 8,
                      fontWeight: active ? 600 : 500,
                      padding: '11px 14px',
                      fontSize: '0.96rem',
                    }}
                  >
                    <span>{name}</span>
                    <ArrowRight size={14} style={{ opacity: active ? 1 : 0.4 }} />
                  </Link>
                );
              })}
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Link href="/dashboard" className="btn secondary" style={{ fontSize: '0.85rem' }} onClick={() => setMenu(false)}>
                  Dashboard
                </Link>
                <Link href="/toolkit" className="btn ghost" style={{ fontSize: '0.85rem' }} onClick={() => setMenu(false)}>
                  Cyber Toolkit
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Link href="/login" className="btn ghost" style={{ fontSize: '0.85rem' }} onClick={() => setMenu(false)}>
                  Masuk Akun
                </Link>
                <Link href="/lapor" className="btn" style={{ fontSize: '0.85rem' }} onClick={() => setMenu(false)}>
                  Mulai Lapor →
                </Link>
              </div>

              <button
                className="btn danger"
                onClick={() => {
                  setMenu(false);
                  setEmergency(true);
                }}
                style={{ width: '100%', fontSize: '0.88rem', marginTop: 4 }}
              >
                <ShieldAlert size={16} /> Butuh Bantuan Darurat?
              </button>
            </div>
          </div>
        )}
      </header>

      {quick && (
        <div className="container no-print" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button
            className="btn ghost"
            onClick={exit}
            style={{ fontSize: '0.78rem', padding: '5px 10px', color: '#94A3B8' }}
            title="Sembunyikan layar dan buka google.com"
          >
            <LogOut size={13} /> Keluar cepat (Sembunyikan layar)
          </button>
        </div>
      )}

      <main id="main">{children}</main>

      {/* Floating Companion Widget: GEN-03 Idle/Standby */}
      {!path.startsWith('/asisten') && (
        <div className="floating-companion no-print">
          <Link
            href="/asisten"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 14px 6px 8px',
              background: '#0D1726',
              border: '1px solid rgba(0, 229, 255, 0.28)',
              borderRadius: 32,
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
              color: '#FFFFFF',
              textDecoration: 'none',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            className="hover-card floating-companion-pill"
            title="Buka Asisten AI Hukum Siber Lexo"
          >
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <Image
                src="/mascot/gen-03-idle.webp"
                alt="Tanya Lexo"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
                className="animate-float"
              />
            </div>
            <div className="companion-text">
              <div style={{ fontSize: '0.68rem', color: '#00E5FF', fontWeight: 600, letterSpacing: '0.04em' }}>
                ASISTEN HUKUM
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F8FAFC' }}>
                Tanya Lexo AI →
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Global Footer */}
      <footer className="footer no-print">
        <div className="container grid2" style={{ alignItems: 'start', gap: 36 }}>
          <div>
            <Link href="/" className="wordmark">
              <Image
                src="/logo/logo-flat.webp"
                alt="Logo Lexora"
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
              <span style={{ letterSpacing: '0.06em', fontWeight: 800 }}>
                LEX<span style={{ color: '#00E5FF' }}>ORA</span>
              </span>
            </Link>
            <p className="muted" style={{ marginTop: 12, maxWidth: 440, fontSize: '0.88rem', lineHeight: 1.6 }}>
              Platform edukasi dan pendampingan hukum siber cerdas. Menghubungkan regulasi resmi UU PDP & UU ITE ke dalam checklist praktis, draf surat resmi, dan panduan tanggap insiden untuk masyarakat dan UMKM.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
              <Image
                src="/mascot/inc-02-shield.webp"
                alt="Mascot Guard"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
              <p className="muted" style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.5 }}>
                Dirancang untuk Web Development Competition UINIC 8.0. Seluruh panduan hukum mengacu pada UU PDP No. 27/2022 dan UU ITE No. 1/2024.
              </p>
            </div>
          </div>

          <div className="footer-links-grid">
            <div>
              <div className="label muted" style={{ marginBottom: 12, fontSize: '0.7rem' }}>FITUR INTI</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <Link href="/asisten" style={{ color: '#CBD5E1' }}>Asisten AI Bersitasi</Link>
                <Link href="/regulations" style={{ color: '#CBD5E1' }}>Database Regulasi</Link>
                <Link href="/checklist" style={{ color: '#CBD5E1' }}>Checklist Kepatuhan</Link>
                <Link href="/dokumen" style={{ color: '#CBD5E1' }}>Template Dokumen</Link>
              </div>
            </div>
            <div>
              <div className="label muted" style={{ marginBottom: 12, fontSize: '0.7rem' }}>AKSI & RESPON</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <Link href="/insiden" style={{ color: '#CBD5E1' }}>Tanggap Insiden</Link>
                <Link href="/education" style={{ color: '#CBD5E1' }}>Edukasi Interaktif</Link>
                <Link href="/lapor" style={{ color: '#CBD5E1' }}>Form Lapor Cepat</Link>
                <Link href="/lacak" style={{ color: '#CBD5E1' }}>Lacak Status Berkas</Link>
              </div>
            </div>
            <div>
              <div className="label muted" style={{ marginBottom: 12, fontSize: '0.7rem' }}>ALAT BANTU</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <Link href="/kanal" style={{ color: '#CBD5E1' }}>Kanal Pemerintah</Link>
                <Link href="/toolkit" style={{ color: '#CBD5E1' }}>Cyber Toolkit</Link>
                <Link href="/tentang" style={{ color: '#CBD5E1' }}>Tentang Lexora</Link>
                <Link href="/dashboard" style={{ color: '#CBD5E1' }}>Dashboard Pelapor</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Quick Bar */}
      <div className="quickbar no-print">
        <Link className="btn" href="/lapor" style={{ fontSize: '0.85rem' }}>
          Mulai Lapor →
        </Link>
        <button className="btn danger" onClick={() => setEmergency(true)} style={{ fontSize: '0.85rem' }}>
          <ShieldAlert size={15} /> Darurat
        </button>
      </div>

      {/* Emergency Assistance Modal */}
      {emergency && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(5, 8, 14, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEmergency(false);
          }}
        >
          <section
            className="panel"
            style={{
              width: 'min(540px, 100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Image src="/mascot/inc-02-shield.webp" alt="Lexo Shield" width={34} height={34} />
                <h2 id="emergency-title" style={{ margin: 0, fontSize: '1.35rem', color: '#EF4444', fontWeight: 700 }}>
                  Bantuan Darurat
                </h2>
              </div>
              <button
                className="btn ghost"
                aria-label="Tutup"
                onClick={() => setEmergency(false)}
                style={{ padding: '6px 9px' }}
              >
                <X size={17} />
              </button>
            </div>

            <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.55 }}>
              Jika kamu berada dalam ancaman fisik atau bahaya mendesak, utamakan keselamatan diri dan segera hubungi layanan darurat resmi:
            </p>

            <div className="grid2" style={{ marginTop: 14, gap: 10 }}>
              <a className="btn danger" href="tel:110" style={{ fontSize: '0.85rem' }}>
                <Phone size={15} /> Polisi 110
              </a>
              <a className="btn danger" href="tel:112" style={{ fontSize: '0.85rem' }}>
                <Phone size={15} /> Darurat 112
              </a>
              <a className="btn secondary" href="tel:129" style={{ fontSize: '0.85rem' }}>
                <Phone size={15} /> SAPA 129 (Perempuan & Anak)
              </a>
              <Link className="btn" href="/lapor" onClick={() => setEmergency(false)} style={{ fontSize: '0.85rem' }}>
                Mulai Laporan Siber
              </Link>
            </div>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '18px 0' }} />

            <h3 style={{ fontSize: '1rem', margin: '0 0 8px', color: '#00E5FF', fontWeight: 600 }}>
              Uang baru saja ditransfer ke penipu?
            </h3>
            <ol style={{ paddingLeft: 18, margin: '8px 0', fontSize: '0.88rem', lineHeight: 1.6, color: '#CBD5E1' }}>
              <li>Segera hubungi call center bank pengirim dan minta penahanan transaksi (<em>holding</em>).</li>
              <li>Amankan bukti transfer, mutasi rekening, dan rekaman percakapan.</li>
              <li>Susun berkas laporan lengkap di Lexora untuk diajukan ke IASC / Kepolisian.</li>
            </ol>

            <button
              className="btn ghost"
              style={{ width: '100%', marginTop: 10, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={copyBankScript}
            >
              {copiedBankScript ? (
                <>
                  <Check size={15} style={{ color: '#10B981' }} />
                  Naskah Berhasil Disalin!
                </>
              ) : (
                'Salin Naskah Cepat untuk Telepon Bank'
              )}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
