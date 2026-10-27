import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Phone, ShieldCheck, AlertTriangle, FileText, Lock, Sparkles, CheckCircle2, Bot, BookOpen, CheckSquare, ShieldAlert, GraduationCap } from 'lucide-react';
import { Card } from '@/components/ui';
import { channels, incidentTypes } from '@/data/channels';

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
      {/* Hero Section */}
      <section style={{ padding: '36px 0 48px', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <div
            className="grid2"
            style={{
              alignItems: 'center',
              gap: 36,
              background: 'linear-gradient(135deg, rgba(16, 28, 46, 0.75) 0%, rgba(8, 14, 24, 0.9) 100%)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              borderRadius: 20,
              padding: 'clamp(28px, 5vw, 56px)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              position: 'relative',
            }}
          >
            {/* Ambient Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-20%',
                right: '10%',
                width: 380,
                height: 380,
                background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)',
                filter: 'blur(50px)',
                pointerEvents: 'none',
              }}
            />

            <div>
              <div className="label" style={{ marginBottom: 14 }}>
                <Sparkles size={14} style={{ color: '#00E5FF' }} />
                PENDAMPING HUKUM SIBER BERBASIS AI · UINIC 8.0
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.3rem, 4.8vw, 4.2rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  fontWeight: 900,
                  margin: '0 0 18px',
                  color: '#FFFFFF',
                }}
              >
                Ubah Bahasa Hukum Rumit Menjadi <br />
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00E5FF 0%, #38BDF8 60%, #FFFFFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  Langkah Aksi Nyata.
                </span>
              </h1>

              <p style={{ maxWidth: 540, fontSize: '1.05rem', color: '#CBD5E1', lineHeight: 1.7, margin: '0 0 24px' }}>
                Lexora adalah platform edukasi dan pendampingan hukum siber cerdas. Menghubungkan regulasi resmi (UU PDP & UU ITE) ke dalam checklist praktis, draf surat resmi, dan panduan tanggap insiden untuk masyarakat dan UMKM.
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link className="btn" href="/asisten" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                  Konsultasi AI Bersitasi <ArrowRight size={18} />
                </Link>
                <Link className="btn secondary" href="/checklist" style={{ padding: '12px 20px', fontSize: '1rem' }}>
                  Checklist Kepatuhan
                </Link>
                <Link className="btn ghost" href="/lapor" style={{ padding: '12px 18px', fontSize: '1rem' }}>
                  Lapor Cepat
                </Link>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#94A3B8' }}>
                  <CheckCircle2 size={15} style={{ color: '#00E5FF' }} /> Rujukan Otentik UU PDP & ITE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#94A3B8' }}>
                  <CheckCircle2 size={15} style={{ color: '#00E5FF' }} /> Generator Surat Legal Siap Cetak
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#94A3B8' }}>
                  <CheckCircle2 size={15} style={{ color: '#00E5FF' }} /> 100% Data Aman & Privat
                </div>
              </div>
            </div>

            {/* Right Hero: Mascot Lexo (GEN-01 Waving) & Quick Action Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Mascot Greeting Speech Bubble (GEN-01 Welcome / Waving) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  background: 'rgba(11, 22, 36, 0.85)',
                  border: '1px solid rgba(0, 229, 255, 0.35)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  boxShadow: '0 8px 30px rgba(0, 229, 255, 0.15)',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <Image
                    src="/mascot/gen-01-welcome.webp"
                    alt="Lexo - Maskot Waving / Welcome"
                    width={95}
                    height={95}
                    className="animate-float"
                    style={{ objectFit: 'contain' }}
                    priority
                  />
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>
                    HAI, SAYA LEXO! · MASKOT RESMI LEXORA
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    &ldquo;Jangan panik menghadapi masalah siber atau kepatuhan UU PDP. Saya akan temani membedah pasal dan menyusun langkah penyelamatan.&rdquo;
                  </p>
                </div>
              </div>

              {/* Quick Action Card: Tenggat 3x24 Jam UU PDP */}
              <div className="panel" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(17, 24, 38, 0.9)' }}>
                <div className="label" style={{ color: '#EF4444', marginBottom: 8 }}>
                  <AlertTriangle size={14} style={{ display: 'inline', marginRight: 4 }} />
                  TANGGAP DARURAT · PASAL 46 UU PDP
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF' }}>
                  Usaha / Website Mengalami Kebocoran Data?
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.6, margin: '0 0 14px' }}>
                  UU PDP mewajibkan pemberitahuan tertulis maksimal <strong>3 x 24 jam (72 jam)</strong> kepada subjek data & lembaga resmi.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link className="btn danger" href="/dokumen/pemberitahuan-kegagalan-pdp" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    Buat Surat 3x24 Jam →
                  </Link>
                  <Link className="btn secondary" href="/checklist/kebocoran-data-pdp" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    SOP Mitigasi
                  </Link>
                </div>
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
              ].map(([t, d], i) => (
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
