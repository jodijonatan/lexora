import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, AlertTriangle, FileText, Sparkles, CheckCircle2, Bot, BookOpen, CheckSquare, ShieldAlert, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui';
import { channels } from '@/data/channels';

const corePillars = [
  {
    title: 'AI Legal Assistant',
    eyebrow: 'FITUR §01 · RAG BERSITASI',
    desc: 'Tanya jawab seputar regulasi Indonesia dengan sitasi pasal otentik, disclaimer hukum, dan rekomendasi aksi nyata.',
    href: '/asisten',
    icon: Bot,
    tag: 'RAG Pipeline',
  },
  {
    title: 'Database Regulasi',
    eyebrow: 'FITUR §02 · BASIS HUKUM',
    desc: 'Eksplorasi hirarkis UU PDP No. 27/2022, UU ITE No. 1/2024, hingga tingkat pasal dan ayat dengan ringkasan bahasa awam.',
    href: '/regulations',
    icon: BookOpen,
    tag: 'Pasal & Ayat',
  },
  {
    title: 'Checklist Kepatuhan',
    eyebrow: 'FITUR §03 · PANDUAN LANGKAH',
    desc: 'Daftar verifikasi kepatuhan terstruktur untuk UMKM, audit perlindungan data, dan SOP penanganan kebocoran.',
    href: '/checklist',
    icon: CheckSquare,
    tag: 'Progres Dinamis',
  },
  {
    title: 'Template Dokumen Resmi',
    eyebrow: 'FITUR §04 · GENERATOR OTOMATIS',
    desc: 'Draf surat pemberitahuan kegagalan PDP (3x24 jam), surat blokir bank, dan laporan polisi siap cetak dan tanda tangan.',
    href: '/dokumen',
    icon: FileText,
    tag: 'Siap Cetak PDF',
  },
  {
    title: 'Tanggap Insiden Siber',
    eyebrow: 'FITUR §05 · RESPON DARURAT',
    desc: 'Panduan tanggap darurat saat kebocoran data atau penipuan terjadi lengkap dengan timer countdown tenggat waktu UU PDP.',
    href: '/insiden',
    icon: ShieldAlert,
    tag: 'Countdown 72 Jam',
  },
  {
    title: 'Edukasi Interaktif',
    eyebrow: 'FITUR §06 · LITERASI DIGITAL',
    desc: 'Modul pembelajaran 5 menit dan kuis pemahaman berbobot nilai untuk mengenali bahaya phishing, APK palsu, dan hak data.',
    href: '/education',
    icon: GraduationCap,
    tag: 'Kuis Berhadiah Skor',
  },
];

const advisories = [
  ['Modus APK Surat Tilang / Undangan / Kurir', 'Pelaku mengirimkan file .APK via WhatsApp untuk menyadap SMS OTP. Jangan pernah klik atau pasang file tersebut.'],
  ['Investasi Bodong Berkedok Robot Trading', 'Menjanjikan imbal hasil instan dan menekan korban untuk segera setor deposit. Selalu cek izin resmi di OJK/Bappebti.'],
  ['QRIS Palsu / Tempelan di Tempat Umum', 'Penempelan stiker barcode rekening penipu di atas QRIS merchant. Selalu periksa nama penerima sebelum menekan bayar.'],
];

export default function Home() {
  return (
    <>
      {/* Hero Section — full viewport height, Z-pattern */}
      <section
        style={{
          minHeight: 'calc(100vh - 66px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 0',
        }}
      >
        {/* Background ambient glows */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-10%',
              right: '-5%',
              width: 600,
              height: 600,
              background: 'radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              left: '-8%',
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.07) 0%, transparent 65%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'clamp(40px, 6vw, 96px)',
              alignItems: 'center',
            }}
          >
            {/* LEFT: Copy */}
            <div>
              {/* Eyebrow label */}
              {/* <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(0, 229, 255, 0.08)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  borderRadius: 100,
                  padding: '6px 14px',
                  marginBottom: 28,
                }}
              >
                <Sparkles size={13} style={{ color: '#00E5FF' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.06em', color: '#00E5FF', fontWeight: 600, textTransform: 'uppercase' }}>
                  Pendamping Hukum Siber AI · UINIC 8.0
                </span>
              </div> */}

              {/* Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
                  lineHeight: 1.06,
                  letterSpacing: '-0.04em',
                  fontWeight: 900,
                  margin: '0 0 22px',
                  color: '#FFFFFF',
                }}
              >
                Ubah Bahasa<br />
                Hukum Rumit<br />
                Menjadi{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00E5FF 0%, #38BDF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Aksi Nyata.
                </span>
              </h1>

              {/* Sub-copy */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#94A3B8',
                  lineHeight: 1.75,
                  margin: '0 0 20px',
                  maxWidth: 480,
                }}
              >
                Platform edukasi dan pendampingan hukum siber berbasis AI. Dari regulasi resmi UU PDP &amp; UU ITE ke checklist praktis, draf surat, dan panduan tanggap insiden — dalam hitungan menit.
              </p>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#64748B',
                  lineHeight: 1.75,
                  margin: '0 0 36px',
                  maxWidth: 460,
                }}
              >
                Dirancang untuk masyarakat dan UMKM yang tidak punya latar belakang hukum — Lexora menerjemahkan pasal demi pasal menjadi langkah nyata yang bisa langsung dieksekusi.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 36 }}>
                <Link className="btn" href="/asisten" style={{ padding: '13px 26px', fontSize: '1rem' }}>
                  Konsultasi AI Bersitasi <ArrowRight size={17} />
                </Link>
                <Link className="btn secondary" href="/checklist" style={{ padding: '13px 22px', fontSize: '1rem' }}>
                  Checklist Kepatuhan
                </Link>
                <Link className="btn ghost" href="/lapor" style={{ padding: '13px 18px', fontSize: '1rem' }}>
                  Lapor Cepat
                </Link>
              </div>

              {/* Social proof / trust badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  paddingTop: 28,
                  borderTop: '1px solid rgba(255,255,255,0.07)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', color: '#64748B' }}>
                  <CheckCircle2 size={14} style={{ color: '#00E5FF', flexShrink: 0 }} />
                  Rujukan Otentik UU PDP &amp; ITE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', color: '#64748B' }}>
                  <CheckCircle2 size={14} style={{ color: '#00E5FF', flexShrink: 0 }} />
                  Surat Legal Siap Cetak
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.84rem', color: '#64748B' }}>
                  <CheckCircle2 size={14} style={{ color: '#00E5FF', flexShrink: 0 }} />
                  100% Data Privat
                </div>
              </div>
            </div>

            {/* RIGHT: Circle visual with badges on the border */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'clamp(20px, 4vw, 40px)' }}>
              <div
                style={{
                  position: 'relative',
                  width: 'min(640px, 100%)',
                  aspectRatio: '1 / 1',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, rgba(13, 28, 48, 0.95) 0%, rgba(7, 16, 30, 0.98) 100%)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 80px rgba(0, 229, 255, 0.1), 0 24px 60px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.13) 0%, transparent 65%)',
                    pointerEvents: 'none',
                  }}
                />

                <Image
                  src="/mascot/gen-01-welcome.webp"
                  alt="Lexo - Asisten Hukum AI"
                  width={560}
                  height={560}
                  className="animate-float"
                  style={{ width: '96%', height: '96%', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                  priority
                />

                {[
                  { top: '14.6%', left: '14.6%', border: 'rgba(0,229,255,0.3)', bg: 'rgba(10,20,34,0.95)', big: '6+', sub: 'Modul Regulasi' },
                  { top: '14.6%', left: '85.4%', border: 'rgba(0,229,255,0.3)', bg: 'rgba(10,20,34,0.95)', icon: 'dot', title: 'UU PDP No. 27/2022', sub: 'Aktif · Per Jan 2025' },
                  { top: '85.4%', left: '85.4%', border: 'rgba(239,68,68,0.45)', bg: 'rgba(30,10,10,0.95)', icon: 'alert', title: 'Tenggat 72 Jam', sub: 'Kebocoran data wajib lapor' },
                  { top: '85.4%', left: '14.6%', border: 'rgba(0,229,255,0.3)', bg: 'rgba(10,20,34,0.95)', icon: 'bot', title: 'AI Bersitasi Pasal', sub: 'RAG · Sumber terverifikasi' },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: b.top,
                      left: b.left,
                      transform: 'translate(-50%, -50%)',
                      background: b.bg,
                      border: `1px solid ${b.border}`,
                      borderRadius: 14,
                      padding: '10px 16px',
                      backdropFilter: 'blur(12px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {b.icon === 'dot' && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px rgba(0,229,255,0.8)', flexShrink: 0 }} />
                    )}
                    {b.icon === 'alert' && <AlertTriangle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />}
                    {b.icon === 'bot' && <Bot size={16} style={{ color: '#00E5FF', flexShrink: 0 }} />}
                    <div>
                      {b.big ? (
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFF', lineHeight: 1, letterSpacing: '-0.04em' }}>{b.big}</div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFF', lineHeight: 1.2 }}>{b.title}</div>
                      )}
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: 2 }}>{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Flow: Masalah -> Penjelasan -> Checklist -> Template -> Tindakan */}
      <section className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div className="panel" style={{ background: 'rgba(11, 20, 32, 0.65)', borderColor: 'rgba(0, 229, 255, 0.2)' }}>
            <div className="label" style={{ marginBottom: 12 }}>ALUR NILAI UTAMA LEXORA (PITCH DECK CYBERLAW)</div>
            <div className="grid5" style={{ gap: 14 }}>
              {[
                ['01. Masalah', 'Masyarakat & UMKM bingung hak hukum saat data bocor atau ditipu.'],
                ['02. Penjelasan', 'AI Legal Assistant menjelaskan pasal regulasi dengan bahasa manusia.'],
                ['03. Checklist', 'Checklist kepatuhan interaktif otomatis sesuai jenis insiden.'],
                ['04. Template', 'Form dinamis menghasilkan dokumen hukum siap cetak berstandar resmi.'],
                ['05. Tindakan', 'Kirim notifikasi ke lembaga PDP, lapor bank, atau ajukan ke kepolisian.'],
              ].map(([t, d]) => (
                <div key={t} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: '#00E5FF', fontWeight: 800, fontSize: '0.95rem', marginBottom: 6 }}>{t}</div>
                  <p className="muted" style={{ fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Pillars */}
      <section className="section">
        <div className="container">
          <div className="stephead">
            <div>
              <div className="label">§02 · ENAM PILAR UTAMA ARSITEKTUR</div>
              <h2 className="section-title">Solusi Menyeluruh Hukum Siber Indonesia</h2>
            </div>
            <span className="label muted">TERINTEGRASI DATA PASAL & FORM</span>
          </div>

          <div className="grid3">
            {corePillars.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.title}
                  href={p.href}
                  className="card hover-card"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ padding: 8, background: 'rgba(0, 229, 255, 0.1)', borderRadius: 10, color: '#00E5FF' }}>
                        <Icon size={20} />
                      </div>
                      <span className="tag">{p.tag}</span>
                    </div>
                    <div className="label">{p.eyebrow}</div>
                    <h3 style={{ color: '#FFFFFF', margin: '6px 0 8px', fontSize: '1.2rem' }}>{p.title}</h3>
                    <p className="muted" style={{ fontSize: '0.88rem', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                  <div style={{ color: '#00E5FF', marginTop: 16, fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    Buka Modul <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 03: Status Pelacakan Kasus */}
      <section className="section">
        <div className="container">
          <div
            className="grid2"
            style={{
              alignItems: 'center',
              gap: 32,
              background: 'linear-gradient(135deg, rgba(14, 24, 38, 0.7) 0%, rgba(9, 16, 26, 0.9) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.18)',
              borderRadius: 16,
              padding: 'clamp(24px, 4vw, 40px)',
            }}
          >
            <div>
              <div className="label">§03 · PEMANTAUAN & AUDIT TRAIL</div>
              <h2 className="section-title" style={{ margin: '8px 0 14px' }}>
                Lacak Status Insiden & Draf Laporan
              </h2>
              <p className="muted" style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: 20 }}>
                Setiap laporan insiden menghasilkan <strong>Case ID</strong> unik untuk memantau pemenuhan tenggat waktu, checklist mitigasi, dan berkas surat resmi secara anonim dan mandiri.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/lacak" className="btn" style={{ padding: '10px 22px' }}>
                  Lacak Berkas Laporan <ArrowRight size={16} />
                </Link>
                <Link href="/insiden" className="btn secondary" style={{ padding: '10px 20px' }}>
                  Buka Modul Insiden
                </Link>
              </div>
            </div>

            <div
              className="panel"
              style={{
                borderColor: 'rgba(0, 229, 255, 0.3)',
                background: 'rgba(10, 18, 28, 0.9)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="label">CONTOH INSIDEN TERDAFTAR</div>
                <span className="tag">DITINJAU</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: '#00E5FF', margin: '4px 0 10px' }}>
                LXR-2026-000142
              </h3>
              <p className="muted" style={{ fontSize: '0.88rem', margin: '0 0 14px' }}>
                Insiden penipuan transaksi digital sedang ditindaklanjuti dengan surat permohonan pemblokiran rekening bank penipu.
              </p>
              <Link
                href="/lacak?id=LXR-2026-000142"
                style={{
                  color: '#00E5FF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Lihat Simulasi Pelacakan Ini <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04: Direktori Kanal Resmi */}
      <section className="section">
        <div className="container">
          <div className="stephead">
            <div>
              <div className="label">§04 · JALUR PELAPORAN RESMI</div>
              <h2 className="section-title">Direktori Otoritas & Lembaga Berwenang</h2>
            </div>
            <Link href="/kanal" style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.92rem' }}>
              Lihat Semua Kanal Pemerintah & Bank →
            </Link>
          </div>

          <div className="grid3">
            {channels.slice(0, 3).map((c) => (
              <Card key={c.id} title={c.name} eyebrow={c.agency} href="/kanal">
                <p style={{ margin: '0 0 12px' }}>{c.purpose}</p>
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10 }}>
                  <strong>Metode:</strong> {c.how}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 05: Edukasi & Banner Rujukan Resmi (CHT-03 Citation) */}
      <section className="section" style={{ borderBottom: 0 }}>
        <div className="container">
          <div className="stephead">
            <div>
              <div className="label">§05 · WASPADA SIBER & HUKUM</div>
              <h2 className="section-title">Modus Penipuan yang Sedang Marak</h2>
            </div>
            <Link href="/education" style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.92rem' }}>
              Modul Edukasi Lengkap →
            </Link>
          </div>

          <div className="grid3">
            {advisories.map(([t, d]) => (
              <Card key={t} title={t} eyebrow="PERINGATAN SIBER TERKINI" href="/education">
                <p style={{ margin: 0, lineHeight: 1.6 }}>{d}</p>
              </Card>
            ))}
          </div>

          {/* Banner Rujukan Resmi dengan Maskot CHT-03 (Citation / Buku UU) */}
          <div
            style={{
              marginTop: 36,
              padding: '24px 28px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(14, 26, 42, 0.8) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Image
                src="/mascot/cht-03-citation.webp"
                alt="Lexo - Rujukan Resmi Hukum"
                width={70}
                height={70}
                style={{ objectFit: 'contain' }}
              />
              <div>
                <strong style={{ color: '#FFFFFF', fontSize: '1.05rem', display: 'block' }}>
                  Pahami Hak Digital Anda Berdasarkan Regulasi Resmi
                </strong>
                <span className="muted" style={{ fontSize: '0.9rem' }}>
                  Pelajari UU No. 27/2022 (UU PDP) dan UU No. 1/2024 (UU ITE) lengkap dengan pasal, ayat, dan ringkasan bahasa awam.
                </span>
              </div>
            </div>
            <Link href="/regulations" className="btn" style={{ fontSize: '0.9rem', padding: '10px 22px' }}>
              Buka Basis Regulasi →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
