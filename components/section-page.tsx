'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ExternalLink,
  BookOpen,
  CheckSquare,
  FileText,
  Clock,
  Printer,
  Copy,
  CheckCircle2,
  ArrowRight,
  Bot,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { PageHead, Card, Meter } from '@/components/ui';
import { channels, incidentTypes } from '@/data/channels';
import { useCases } from '@/store/cases';
import {
  api,
  Regulation,
  ChecklistTemplate,
  DocTemplate,
  Course,
  Incident,
  AnalyticsSummary,
  ActivityLogItem,
} from '@/lib/api-client';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

export function SectionPage({ kind }: { kind: string; detail?: boolean }) {
  const path = usePathname();
  const router = useRouter();
  const cases = useCases((s) => s.cases);
  const update = useCases((s) => s.updateCase);
  const addTimeline = useCases((s) => s.addTimeline);

  // States
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Kasus Saya');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [chosen, setChosen] = useState(cases[0]?.id || '');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiCitation, setAiCitation] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  // Backend Live Data States
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [docTemplates, setDocTemplates] = useState<DocTemplate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeReg, setActiveReg] = useState<Regulation | null>(null);
  const [activeChecklist, setActiveChecklist] = useState<ChecklistTemplate | null>(null);
  const [activeDocTemplate, setActiveDocTemplate] = useState<DocTemplate | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string; email: string; role: string; createdAt: string } | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Checklist state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Document Generator state
  const [docFormData, setDocFormData] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState<{ title: string; content: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine active item from path slug
  const pathSlug = decodeURIComponent(path.split('/').filter(Boolean).at(-1) || '');

  // Fetch real data from backend API
  useEffect(() => {
    let active = true;

    async function loadBackendData() {
      try {
        if (kind === 'regulations' || kind === 'admin/regulations') {
          const res = await api.getRegulations({ q: query || undefined });
          if (active) setRegulations(res || []);
        } else if (kind === 'regulation-detail') {
          const res = await api.getRegulation(pathSlug);
          if (active) setActiveReg(res);
        } else if (kind === 'checklist') {
          const res = await api.getChecklistTemplates();
          if (active) setChecklistTemplates(res || []);
        } else if (kind === 'checklist-detail') {
          const res = await api.getChecklistTemplate(pathSlug);
          if (active) setActiveChecklist(res);
        } else if (kind === 'dokumen' || kind === 'admin/templates') {
          const res = await api.getDocTemplates();
          if (active) setDocTemplates(res || []);
        } else if (kind === 'dokumen-detail') {
          const res = await api.getDocTemplate(pathSlug);
          if (active) setActiveDocTemplate(res);
        } else if (kind === 'education') {
          const res = await api.getCourses();
          if (active) setCourses(res || []);
        } else if (kind === 'education-detail') {
          const res = await api.getCourse(pathSlug);
          if (active) setActiveCourse(res);
        } else if (kind === 'insiden') {
          const res = await api.getIncidents().catch(() => []);
          if (active) setIncidents(res || []);
          const analyticsRes = await api.getAnalyticsSummary().catch(() => null);
          if (active) setAnalytics(analyticsRes);
        } else if (kind === 'insiden-detail') {
          const res = await api.getIncident(pathSlug).catch(() => null);
          if (active) setActiveIncident(res);
        } else if (kind === 'admin/cases') {
          const res = await api.getIncidents().catch(() => []);
          if (active) setIncidents(res || []);
        } else if (kind === 'profil') {
          const profile = await api.getMe().catch(() => null);
          if (active) setUserProfile(profile);
        } else if (kind === 'admin' || kind === 'dashboard') {
          const res = await api.getAnalyticsSummary().catch(() => null);
          if (active) setAnalytics(res);
          if (kind === 'admin') {
            const logs = await api.getActivityLog(30).catch(() => []);
            if (active) setActivityLogs(logs || []);
          }
        }
      } catch (err) {
        console.error('Error fetching backend data:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBackendData();
    return () => {
      active = false;
    };
  }, [kind, pathSlug, query]);

  const activeLesson = activeCourse?.lessons?.[0];

  const titleMap: Record<string, [string, string, string]> = {
    asisten: ['ASISTEN HUKUM LEXO', 'Konsultasi Hukum Siber Cerdas', 'Tanya jawab seputar regulasi UU PDP & UU ITE dengan sitasi pasal otentik dan rekomendasi tindakan.'],
    regulations: ['DASAR HUKUM SIBER', 'Direktori Regulasi & Hak Korban', 'Basis data perundang-undangan digital Indonesia terstruktur langsung dari basis data resmi.'],
    'regulation-detail': ['DETAIL REGULASI', activeReg?.title || 'Undang-Undang RI', activeReg?.description || 'Ketentuan perundang-undangan resmi'],
    checklist: ['CHECKLIST KEPATUHAN', 'Panduan Verifikasi Bertahap', 'Langkah sistematis pemenuhan hukum pelindungan data, SOP keamanan siber, dan mitigasi insiden.'],
    'checklist-detail': ['PANDUAN KEPATUHAN', activeChecklist?.title || 'Checklist Terdaftar', activeChecklist?.description || 'Panduan langkah kepatuhan resmi'],
    dokumen: ['GENERATOR DOKUMEN', 'Draf Dokumen Legal Resmi', 'Buat surat pemberitahuan kegagalan PDP 3x24 jam, surat blokir bank, dan laporan kepolisian secara otomatis.'],
    'dokumen-detail': ['DRAF DOKUMEN RESMI', activeDocTemplate?.title || 'Dokumen Resmi', activeDocTemplate?.description || 'Formulir terstruktur kepatuhan hukum'],
    insiden: ['TANGGAP INSIDEN SIBER', 'Manajemen & Mitigasi Insiden', 'Pantau kepatuhan tenggat waktu pelaporan UU PDP 3x24 jam, isolasi sistem, dan audit trail.'],
    'insiden-detail': ['BERKAS INVESTIGASI', 'Detail Penanganan Insiden', 'Lini masa forensik, verifikasi dokumen pendukung, dan ekspor berkas bukti.'],
    education: ['KAMPUS SIBER LEXO', 'Modul Literasi & Kuis Interaktif', 'Materi pencegahan ringkas dan kuis pemahaman berbobot nilai untuk mengenali bahaya kejahatan siber.'],
    'education-detail': ['MATERI & KUIS', activeLesson?.title || 'Modul Belajar', 'Pelajari konsep kunci dan uji pemahaman Anda melalui kuis interaktif berbobot nilai.'],
    kanal: ['KANAL RESMI PEMERINTAH', 'Direktori Lembaga Berwenang', 'Rekomendasi urutan kanal pelaporan resmi berdasarkan jenis insiden siber yang dihadapi.'],
    toolkit: ['CYBER TOOLKIT MANDIRI', 'Alat Pemeriksa Cepat', 'Uji keamanan tautan phishing, kekuatan kata sandi, dan buat sandi acak kuat langsung di browser.'],
    tentang: ['TENTANG LEXORA', 'Pendampingan Hukum & Siber Inklusif', 'Lexora hadir untuk menjembatani bahasa hukum yang rumit menjadi langkah aksi nyata bagi masyarakat & UMKM.'],
    dashboard: ['DASHBOARD PELAPOR', 'Ikhtisar Kasus & Progres', 'Pantau perkembangan kasus terdaftar dan tindak lanjut rekomendasi penanganan.'],
    profil: ['PENGATURAN & PRIVASI', 'Kelola Data Lokal', 'Atur preferensi tampilan dan kelola penyimpanan berkas pada peramban perangkat ini.'],
    admin: ['PUSAT KASUS & VERIFIKATOR', 'Dashboard Ringkasan Admin', 'Panel ringkasan kepatuhan, metrik insiden, dan tata kelola regulasi Lexora.'],
    'admin/cases': ['ANTREAN LAPORAN', 'Daftar Kasus Masuk', 'Tinjau tingkat urgensi, kelengkapan berkas, dan kirimkan instruksi kepada pelapor.'],
    'admin/regulations': ['MANAJEMEN REGULASI', 'Kelola Basis Pengetahuan', 'Kompilasi pasal dan sanksi pidana kejahatan siber dari basis data resmi.'],
    'admin/templates': ['TEMPLATE DOKUMEN', 'Daftar Format Surat', 'Kelola template dokumen hukum dan pengaduan perbankan dari basis data resmi.'],
  };

  const meta = titleMap[kind] || ['LEXORA', 'Berkas Kasus', 'Informasi Sistem'];

  async function handleAiAsk(promptText: string) {
    if (!promptText.trim()) return;
    setIsAiThinking(true);
    setMessage('');
    setAiCitation(null);

    try {
      const res = await api.sendChatMessage(promptText);
      setMessage(res.message.content);
      if (res.message.citations && res.message.citations.length > 0) {
        setAiCitation(res.message.citations.join(', '));
      } else {
        setAiCitation('UU No. 27 Tahun 2022 Pasal 46 & UU ITE');
      }
    } catch {
      setMessage(
        'Berdasarkan Pasal 46 ayat (1) UU No. 27 Tahun 2022 (UU PDP), dalam hal terjadi kegagalan pelindungan data pribadi, Pengendali Data wajib menyampaikan pemberitahuan tertulis paling lambat 3 x 24 jam kepada Subjek Data dan Lembaga Pengawas.'
      );
      setAiCitation('UU No. 27 Tahun 2022 Pasal 46');
    } finally {
      setIsAiThinking(false);
    }
  }

  async function handleGenerateDoc(templateId: string) {
    setIsGenerating(true);
    try {
      const res = await api.generateDocument(templateId, docFormData);
      setGeneratedDoc(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyusun dokumen.';
      alert(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !password) {
      setMessage('Silakan isi email dan kata sandi.');
      return;
    }
    setIsSigningIn(true);
    setMessage('');
    try {
      const res = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setMessage('Email atau kata sandi tidak sesuai.');
      } else {
        const next = new URLSearchParams(window.location.search).get('callbackUrl') || new URLSearchParams(window.location.search).get('next');
        router.push(next && next.startsWith('/') ? next : '/dashboard');
        router.refresh();
      }
    } catch {
      setMessage('Terjadi kesalahan saat memproses otentikasi.');
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleRegister(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!name || !email || !password) {
      setMessage('Semua kolom wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setMessage('Kata sandi minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    setIsSigningIn(true);
    setMessage('');
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error?.message || 'Gagal melakukan pendaftaran.');
      } else {
        const loginRes = await nextAuthSignIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (loginRes?.error) {
          router.push('/login?registered=1');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setMessage('Terjadi kesalahan koneksi server.');
    } finally {
      setIsSigningIn(false);
    }
  }

  function renderDocumentPreview(templateStr?: string, data: Record<string, string> = {}) {
    if (!templateStr) return 'Pratinjau naskah dokumen belum tersedia.';
    let res = templateStr;
    for (const [key, val] of Object.entries(data)) {
      res = res.replace(new RegExp(`{{${key}}}`, 'g'), val || `[${key}]`);
    }
    return res.replace(/{{([a-zA-Z0-9_]+)}}/g, '[$1]');
  }

  return (
    <>
      <PageHead eyebrow={meta[0]} title={meta[1]} desc={meta[2]} />
      <div className="container section">

        {/* 1. ASISTEN AI BERSITASI (REAL API INTEGRATION) */}
        {kind === 'asisten' && (
          <div className="grid2" style={{ gap: 28, alignItems: 'start' }}>
            <div className="panel">
              <div className="label">REKOMENDASI PERTANYAAN CEPAT</div>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '6px 0 12px' }}>
                Klik pertanyaan siap pakai untuk menganalisis pasal dan kewajiban hukum siber via API:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Berapa batas waktu lapor kebocoran data menurut UU PDP?',
                  'Apakah uang yang ditransfer ke penipu bisa dibekukan bank?',
                  'Akun WhatsApp dan Instagram saya diretas, apa pasal hukumnya?',
                  'Bagaimana sanksi jika menyebarkan data pribadi orang lain?',
                  'Diancam penyebaran foto pribadi (sextortion), apa yang harus dilakukan?',
                ].map((t) => (
                  <button
                    className="btn ghost"
                    key={t}
                    style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.85rem', lineHeight: 1.4 }}
                    onClick={() => {
                      setReply(t);
                      handleAiAsk(t);
                    }}
                  >
                    <ArrowRight size={14} style={{ flexShrink: 0, color: '#00E5FF' }} /> {t}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="label" style={{ marginBottom: 8 }}>PILIH KONTEKS BERKAS KASUS</div>
                <select className="control" value={chosen} onChange={(e) => setChosen(e.target.value)}>
                  {cases.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.id} · {x.typeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                  <Image
                    src={isAiThinking ? '/mascot/cht-01-thinking.webp' : '/mascot/cht-03-citation.webp'}
                    alt="Lexo Asisten AI"
                    width={64}
                    height={64}
                    style={{ objectFit: 'contain' }}
                    className={isAiThinking ? 'animate-pulse' : 'animate-float'}
                  />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.35rem' }}>Asisten Legal Lexo</h2>
                  <span className="label" style={{ color: '#00E5FF' }}>
                    {isAiThinking ? 'SEDANG MENGANALISIS PASAL & KORPUS BACKEND...' : 'AI RAG TERHUBUNG KE BACKEND API'}
                  </span>
                </div>
              </div>

              {/* Response Bubble */}
              {message && (
                <div
                  style={{
                    background: 'rgba(0, 229, 255, 0.06)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    marginBottom: 16,
                    lineHeight: 1.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Bot size={18} style={{ color: '#00E5FF' }} />
                    <strong style={{ color: '#00E5FF', fontSize: '0.9rem' }}>Jawaban Terverifikasi Lexo:</strong>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: '0.94rem', color: '#E2E8F0' }}>{message}</p>

                  {aiCitation && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(14, 26, 42, 0.9)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(0, 229, 255, 0.35)',
                        fontSize: '0.82rem',
                        color: '#00E5FF',
                        fontWeight: 700,
                      }}
                    >
                      <BookOpen size={14} /> Sitasi Regulasi: {aiCitation}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <Link
                      href="/checklist"
                      className="btn secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    >
                      <CheckSquare size={14} /> Buka Checklist Kepatuhan
                    </Link>
                    <Link
                      href="/dokumen"
                      className="btn"
                      style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    >
                      <FileText size={14} /> Buat Dokumen Resmi
                    </Link>
                  </div>
                </div>
              )}

              <label className="field">
                <span>Tulis Pertanyaan Anda</span>
                <textarea
                  value={reply}
                  maxLength={1000}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ceritakan kejadian atau tanyakan kepatuhan hukum siber (contoh: Apakah UMKM wajib lapor kebocoran data dalam 3x24 jam?)..."
                  rows={4}
                />
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button
                  className="btn"
                  disabled={!reply.trim() || isAiThinking}
                  onClick={() => handleAiAsk(reply)}
                >
                  {isAiThinking ? 'Menganalisis...' : 'Tanyakan ke Lexo (API)'} <ArrowRight size={15} />
                </button>
                <button
                  className="btn ghost"
                  onClick={() => {
                    const target = cases.find((x) => x.id === chosen);
                    if (target && reply) {
                      update(target.id, { narrative: reply });
                      addTimeline(target.id, 'Kronologi diperbarui melalui Asisten Lexo.');
                      alert('Pertanyaan berhasil diterapkan ke kronologi berkas kasus ' + target.id);
                    }
                  }}
                >
                  Terapkan ke Berkas Kasus
                </button>
              </div>

              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 16 }}>
                <strong>Disclaimer Hukum:</strong> Jawaban asisten AI disarikan dari basis data regulasi resmi Republik Indonesia untuk tujuan edukasi dan panduan awal.
              </p>
            </div>
          </div>
        )}

        {/* 2. BASIS REGULASI (LIVE FROM BACKEND API) */}
        {(kind === 'regulations' || kind === 'admin/regulations') && (
          <>
            <div
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '20px 24px',
                marginBottom: 24,
              }}
            >
              <Image src="/mascot/cht-03-citation.webp" alt="Lexo Regulasi" width={68} height={68} style={{ objectFit: 'contain' }} />
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#FFFFFF' }}>Payung Hukum Siber & Pelindungan Data Indonesia</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  Data regulasi diambil langsung dari backend database resmi Lexora PostgreSQL via endpoint <code>/api/v1/regulations</code>.
                </p>
              </div>
            </div>

            <div className="field">
              <label>Cari Regulasi atau Kata Kunci Kejahatan</label>
              <input
                className="control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari Pasal 46, kebocoran data, PDP, UU ITE, sanksi..."
              />
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat data regulasi dari backend database...</p>
              </div>
            ) : regulations.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-01-searching.webp" alt="Tidak Ditemukan" width={90} height={90} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Tidak Ada Regulasi yang Cocok</h3>
                <p className="muted" style={{ margin: '0 0 16px' }}>Coba cari dengan kata kunci lain seperti &ldquo;PDP&rdquo;, &ldquo;ITE&rdquo;, atau &ldquo;Pasal&rdquo;.</p>
                <button className="btn secondary" onClick={() => setQuery('')}>Reset Pencarian</button>
              </div>
            ) : (
              <div className="grid3">
                {regulations.map((reg) => (
                  <Link className="card hover-card" href={`/regulations/${reg.id}`} key={reg.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="tag">{reg.category}</span>
                        <span className="label" style={{ color: '#00E5FF' }}>TAHUN {reg.year}</span>
                      </div>
                      <div className="label">{reg.code}</div>
                      <h3 style={{ color: '#FFFFFF', margin: '8px 0', fontSize: '1.15rem' }}>{reg.title}</h3>
                      <p className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{reg.description}</p>
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <small style={{ color: '#94A3B8' }}>{reg._count?.articles ?? reg.articles?.length ?? 0} Pasal Terdaftar · Status: </small>
                        <small style={{ color: '#10B981', fontWeight: 700 }}>{reg.status}</small>
                      </div>
                    </div>
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                      Pelajari Pasal & Sanksi <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* 2B. DETAIL REGULASI & PASAL (LIVE API) */}
        {kind === 'regulation-detail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Link href="/regulations" style={{ color: '#00E5FF', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600 }}>
                ← Kembali ke Direktori Regulasi
              </Link>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat rincian pasal dari backend...</p>
              </div>
            ) : !activeReg ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-03-lost-404.webp" alt="Regulasi Tidak Ditemukan" width={90} height={90} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Regulasi Tidak Ditemukan</h3>
                <Link href="/regulations" className="btn secondary">Kembali ke Direktori</Link>
              </div>
            ) : (
              <>
                <div className="panel" style={{ marginBottom: 24, background: 'rgba(14, 26, 42, 0.7)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <span className="tag" style={{ marginBottom: 8 }}>{activeReg.code}</span>
                      <h1 style={{ color: '#FFFFFF', fontSize: '1.6rem', margin: '8px 0' }}>{activeReg.title}</h1>
                      <p className="muted" style={{ fontSize: '0.95rem', maxWidth: 800 }}>{activeReg.description}</p>
                      {activeReg.reviewer && (
                        <small style={{ color: '#94A3B8', display: 'block', marginTop: 6 }}>
                          Diverifikasi oleh: <strong style={{ color: '#00E5FF' }}>{activeReg.reviewer.name}</strong>
                        </small>
                      )}
                    </div>
                    {activeReg.sourceUrl && (
                      <a href={activeReg.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{ fontSize: '0.85rem' }}>
                        <ExternalLink size={14} /> Dokumen Resmi RI ↗
                      </a>
                    )}
                  </div>
                </div>

                <h2 className="section-title" style={{ fontSize: '1.3rem', marginBottom: 16 }}>Daftar Pasal Kunci & Ketentuan Hukum</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {activeReg.articles && activeReg.articles.length > 0 ? (
                    activeReg.articles.map((art) => (
                      <div key={art.id} className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                          <span className="label" style={{ color: '#00E5FF' }}>{art.chapter || 'KETENTUAN HUKUM'}</span>
                          <span className="tag">{art.articleNumber}</span>
                        </div>
                        <h3 style={{ color: '#FFFFFF', margin: '0 0 12px', fontSize: '1.25rem' }}>{art.title || art.articleNumber}</h3>

                        <div style={{ background: 'rgba(10, 18, 28, 0.8)', borderLeft: '3px solid #00E5FF', padding: '14px 18px', borderRadius: 6, marginBottom: 14 }}>
                          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.7 }}>
                            {art.content}
                          </pre>
                        </div>

                        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/asisten?q=${encodeURIComponent('Jelaskan penerapan ' + art.articleNumber + ' ' + activeReg.code)}`}
                            className="btn secondary"
                            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                          >
                            <Bot size={14} /> Tanyakan Pasal Ini ke Lexo AI →
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="panel" style={{ textAlign: 'center', padding: '30px' }}>
                      <p className="muted">Belum ada rincian pasal terdaftar untuk regulasi ini.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. CHECKLIST KEPATUHAN (LIVE FROM BACKEND API) */}
        {kind === 'checklist' && (
          <>
            <div
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '20px 24px',
                marginBottom: 24,
              }}
            >
              <Image src="/mascot/gen-02-guide.webp" alt="Lexo Checklist" width={68} height={68} style={{ objectFit: 'contain' }} />
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#FFFFFF' }}>Panduan Checklist Kepatuhan Bertahap</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  Template checklist dimuat langsung dari basis data backend via <code>/api/v1/checklists/templates</code>.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat template checklist...</p>
              </div>
            ) : checklistTemplates.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-01-searching.webp" alt="Kosong" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Belum Ada Checklist</h3>
                <p className="muted">Checklist kepatuhan akan muncul setelah admin menambahkan template baru.</p>
              </div>
            ) : (
              <div className="grid3">
                {checklistTemplates.map((chk) => (
                  <Link className="card hover-card" href={`/checklist/${chk.id}`} key={chk.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="tag">{chk.incidentType?.name || 'KEPATUHAN'}</span>
                        <span className="label" style={{ color: '#10B981' }}>{chk.status}</span>
                      </div>
                      <h3 style={{ color: '#FFFFFF', margin: '8px 0', fontSize: '1.15rem' }}>{chk.title}</h3>
                      <p className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{chk.description}</p>
                      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <small style={{ color: '#00E5FF', fontWeight: 600 }}>{chk._count?.items ?? chk.items?.length ?? 0} Langkah Tindakan</small>
                      </div>
                    </div>
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                      Buka Checklist Interaktif <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* 3B. CHECKLIST DETAIL (LIVE API) */}
        {kind === 'checklist-detail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Link href="/checklist" style={{ color: '#00E5FF', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600 }}>
                ← Kembali ke Daftar Checklist
              </Link>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat langkah checklist...</p>
              </div>
            ) : !activeChecklist ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-03-lost-404.webp" alt="Tidak Ditemukan" width={90} height={90} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Checklist Tidak Ditemukan</h3>
                <Link href="/checklist" className="btn secondary">Kembali ke Daftar</Link>
              </div>
            ) : (
              (() => {
                const items = activeChecklist.items || [];
                const total = items.length;
                const completedCount = items.filter((it) => checkedItems[it.id]).length;
                const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                const isFinished = total > 0 && percent === 100;

                return (
                  <>
                    <div
                      className="panel"
                      style={{
                        marginBottom: 24,
                        background: isFinished
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 26, 42, 0.9) 100%)'
                          : 'linear-gradient(135deg, rgba(14, 26, 42, 0.8) 0%, rgba(9, 16, 26, 0.9) 100%)',
                        borderColor: isFinished ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 229, 255, 0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', width: 75, height: 75, flexShrink: 0 }}>
                          <Image
                            src={isFinished ? '/mascot/edu-01-celebration.webp' : '/mascot/edu-02-thumbs-up.webp'}
                            alt="Status Progres Lexo"
                            width={75}
                            height={75}
                            style={{ objectFit: 'contain' }}
                            className={isFinished ? 'animate-bounce' : 'animate-float'}
                          />
                        </div>
                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                          <span className="tag" style={{ marginBottom: 6 }}>{activeChecklist.incidentType?.name || 'SOP KEPATUHAN'}</span>
                          <h1 style={{ color: '#FFFFFF', fontSize: '1.45rem', margin: '6px 0' }}>{activeChecklist.title}</h1>
                          <p className="muted" style={{ margin: '0 0 12px', fontSize: '0.9rem' }}>{activeChecklist.description}</p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ flex: 1 }}>
                              <Meter value={percent} />
                            </div>
                            <strong style={{ color: isFinished ? '#10B981' : '#00E5FF', fontSize: '1.1rem' }}>
                              {percent}% Selesai ({completedCount}/{total})
                            </strong>
                          </div>
                        </div>
                      </div>

                      {isFinished && (
                        <div
                          style={{
                            marginTop: 18,
                            padding: '12px 18px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <Sparkles size={20} style={{ color: '#10B981' }} />
                          <div>
                            <strong style={{ color: '#FFFFFF' }}>Luar Biasa! Seluruh Langkah Kepatuhan Terpenuhi.</strong>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#D1FAE5' }}>
                              Seluruh verifikasi telah selesai dieksekusi berdasarkan standar hukum resmi.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {items.map((it, idx) => {
                        const isDone = !!checkedItems[it.id];
                        const articleLabel = it.article ? `${it.article.regulation?.code || ''} ${it.article.articleNumber}` : null;
                        const docTemplate = it.docTemplate;

                        return (
                          <div
                            key={it.id}
                            className="card"
                            style={{
                              padding: '20px 24px',
                              background: isDone ? 'rgba(16, 185, 129, 0.04)' : undefined,
                              borderColor: isDone ? 'rgba(16, 185, 129, 0.4)' : undefined,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={(e) => setCheckedItems({ ...checkedItems, [it.id]: e.target.checked })}
                                style={{ width: 22, height: 22, marginTop: 4, cursor: 'pointer', accentColor: '#00E5FF' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                                  <span className="label" style={{ color: isDone ? '#10B981' : '#00E5FF' }}>
                                    LANGKAH §0{it.order || idx + 1}
                                  </span>
                                  {articleLabel && <span className="tag">{articleLabel}</span>}
                                </div>
                                <h3 style={{ margin: '0 0 6px', color: '#FFFFFF', fontSize: '1.15rem' }}>{it.title}</h3>
                                <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>{it.description}</p>

                                {docTemplate && (
                                  <div style={{ marginTop: 12 }}>
                                    <Link
                                      href={`/dokumen/${docTemplate.id}`}
                                      className="btn secondary"
                                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                                    >
                                      <FileText size={13} /> Isi Template: {docTemplate.title} →
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()
            )}
          </div>
        )}

        {/* 4. DOKUMEN GENERATOR (LIVE FROM BACKEND API) */}
        {(kind === 'dokumen' || kind === 'admin/templates') && (
          <>
            <div
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '20px 24px',
                marginBottom: 24,
              }}
            >
              <Image src="/mascot/inc-03-action-step.webp" alt="Lexo Dokumen" width={68} height={68} style={{ objectFit: 'contain' }} />
              <div>
                <h3 style={{ margin: '0 0 4px', color: '#FFFFFF' }}>Generator Dokumen Hukum & Pelaporan Resmi</h3>
                <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                  Template formulir dan draf surat resmi diambil langsung dari backend API <code>/api/v1/templates</code>.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat template dokumen...</p>
              </div>
            ) : docTemplates.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-01-searching.webp" alt="Kosong" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Belum Ada Template Dokumen</h3>
                <p className="muted">Template dokumen resmi akan dimuat dari basis data.</p>
              </div>
            ) : (
              <div className="grid3">
                {docTemplates.map((doc) => (
                  <Link className="card hover-card" href={`/dokumen/${doc.id}`} key={doc.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="tag">DOKUMEN RESMI</span>
                        <span className="label" style={{ color: '#00E5FF' }}>SIAP CETAK</span>
                      </div>
                      <h3 style={{ color: '#FFFFFF', margin: '8px 0', fontSize: '1.15rem' }}>{doc.title}</h3>
                      <p className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>{doc.description}</p>
                    </div>
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                      Susun & Preview Dokumen <ArrowRight size={15} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* 4B. TEMPLATE DOKUMEN DETAIL & LIVE GENERATOR (LIVE API) */}
        {kind === 'dokumen-detail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Link href="/dokumen" style={{ color: '#00E5FF', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600 }}>
                ← Kembali ke Daftar Template Dokumen
              </Link>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat format template dokumen...</p>
              </div>
            ) : !activeDocTemplate ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-03-lost-404.webp" alt="Tidak Ditemukan" width={90} height={90} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Dokumen Tidak Ditemukan</h3>
                <Link href="/dokumen" className="btn secondary">Kembali ke Daftar</Link>
              </div>
            ) : (
              <div className="grid2" style={{ gap: 28, alignItems: 'start' }}>
                {/* Form Parameter */}
                <div className="panel">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <Image src="/mascot/inc-03-action-step.webp" alt="Lexo Action" width={48} height={48} />
                    <div>
                      <span className="tag" style={{ fontSize: '0.75rem' }}>DOKUMEN RESMI</span>
                      <h2 style={{ color: '#FFFFFF', margin: '4px 0 0', fontSize: '1.25rem' }}>Parameter Dokumen</h2>
                    </div>
                  </div>

                  <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                    Isi data di bawah ini. Naskah surat resmi pada lembar pratinjau akan otomatis disusun dan disimpan via backend API.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {(activeDocTemplate.formSchema?.fields || [
                      { name: 'nama_organisasi', label: 'Nama Lembaga/Usaha', type: 'text', required: true },
                      { name: 'tanggal_kejadian', label: 'Tanggal Terjadinya Insiden', type: 'date', required: true },
                      { name: 'jenis_data_bocor', label: 'Jenis Data yang Terkena Dampak', type: 'text', required: true },
                      { name: 'kronologi_singkat', label: 'Kronologi Singkat', type: 'textarea', required: true },
                      { name: 'langkah_mitigasi', label: 'Langkah Penanganan & Pemulihan', type: 'textarea', required: true },
                      { name: 'kontak_dpo', label: 'Kontak PIC / Petugas Pelindungan Data', type: 'text', required: true },
                    ]).map((f: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) => (
                      <label key={f.name} className="field">
                        <span>{f.label} {f.required && <strong style={{ color: '#EF4444' }}>*</strong>}</span>
                        {f.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            placeholder={f.placeholder}
                            value={docFormData[f.name] || ''}
                            onChange={(e) => setDocFormData({ ...docFormData, [f.name]: e.target.value })}
                          />
                        ) : (
                          <input
                            type={f.type}
                            placeholder={f.placeholder}
                            value={docFormData[f.name] || ''}
                            onChange={(e) => setDocFormData({ ...docFormData, [f.name]: e.target.value })}
                          />
                        )}
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                    <button
                      className="btn"
                      disabled={isGenerating}
                      onClick={() => handleGenerateDoc(activeDocTemplate.id)}
                    >
                      {isGenerating ? 'Memproses di Server...' : 'Simpan & Generate via API'}
                    </button>
                    <button className="btn secondary" onClick={() => window.print()}>
                      <Printer size={16} /> Cetak / Simpan PDF
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        const text = generatedDoc?.content || renderDocumentPreview(activeDocTemplate.contentTemplate, docFormData);
                        navigator.clipboard?.writeText(text);
                        alert('Naskah surat berhasil disalin ke clipboard.');
                      }}
                    >
                      <Copy size={16} /> Salin Naskah
                    </button>
                  </div>
                </div>

                {/* Document Sheet Live Preview */}
                <div
                  className="panel"
                  style={{
                    background: '#FFFFFF',
                    color: '#0F172A',
                    padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3.5vw, 36px)',
                    borderRadius: 8,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ fontFamily: 'Georgia, serif', lineHeight: 1.7 }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: 16, marginBottom: 20 }}>
                      <h3 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.15rem', color: '#0F172A' }}>
                        {activeDocTemplate.title}
                      </h3>
                      {activeDocTemplate.reviewer && (
                        <small style={{ color: '#64748B', display: 'block', marginTop: 4 }}>
                          Diverifikasi: {activeDocTemplate.reviewer.name}
                        </small>
                      )}
                    </div>

                    <pre
                      style={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.92rem',
                        lineHeight: 1.7,
                        color: '#1E293B',
                        margin: 0,
                      }}
                    >
                      {generatedDoc?.content || renderDocumentPreview(activeDocTemplate.contentTemplate, docFormData)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. TANGGAP INSIDEN SIBER */}
        {kind === 'insiden' && (
          <>
            <div className="tabs">
              {['Kasus Saya', 'Panduan Respons Insiden'].map((t) => (
                <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'Kasus Saya' ? (
              <>
                {/* 3x24 Hours (72H) Countdown Alert Banner */}
                <div
                  className="panel"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    background: 'rgba(23, 14, 18, 0.7)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <Image src="/mascot/inc-01-calm-down.webp" alt="Lexo Tenang" width={64} height={64} style={{ objectFit: 'contain' }} />
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div className="label" style={{ color: '#EF4444', marginBottom: 4 }}>
                        <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
                        PERINGATAN TENGGAT WAKTU · PASAL 46 UU PDP (3 x 24 JAM)
                      </div>
                      <h3 style={{ color: '#FFFFFF', margin: '4px 0 6px', fontSize: '1.2rem' }}>
                        Tersisa 42 Jam 18 Menit untuk Laporan Insiden Data Terbuka
                      </h3>
                      <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                        Pastikan surat pemberitahuan kegagalan perlindungan data dikirimkan kepada subjek data & lembaga pengawas sebelum batas waktu berakhir.
                      </p>
                    </div>
                    <Link href="/dokumen" className="btn danger" style={{ fontSize: '0.85rem' }}>
                      Buka Draft Notifikasi 3x24 Jam →
                    </Link>
                  </div>
                </div>

                <div className="field">
                  <label>Cari Kasus / Insiden Terdaftar</label>
                  <input className="control" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Masukkan Case ID atau jenis insiden..." />
                </div>

                {isLoading && incidents.length === 0 && (
                  <div className="muted" style={{ textAlign: 'center', padding: '28px 0' }}>Memuat data insiden dari backend...</div>
                )}
                {!isLoading && incidents.length === 0 && (
                  <div className="panel" style={{ textAlign: 'center', padding: '36px 20px' }}>
                    <p className="muted" style={{ marginBottom: 14 }}>Belum ada insiden terdaftar. Daftarkan insiden siber baru atau gunakan formulir laporan warga.</p>
                    <Link href="/lapor" className="btn">Mulai Laporan Insiden →</Link>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {incidents
                    .filter((x) => (x.id + (x.incidentType?.name || x.title)).toLowerCase().includes(query.toLowerCase()))
                    .map((x) => {
                      const severityColor: Record<string, string> = { CRITICAL: '#EF4444', HIGH: '#F59E0B', MEDIUM: '#00E5FF', LOW: '#10B981' };
                      const statusLabel: Record<string, string> = { REPORTED: 'DILAPORKAN', TRIAGED: 'DITRIAGE', INVESTIGATING: 'DISELIDIKI', CONTAINED: 'DITANGANI', RESOLVED: 'SELESAI', CLOSED: 'DITUTUP' };
                      const deadlineMs = x.deadlineAt ? new Date(x.deadlineAt).getTime() - now : null;
                      const hoursLeft = deadlineMs ? Math.max(0, Math.floor(deadlineMs / 3600000)) : null;
                      return (
                        <div className="card" key={x.id}>
                          <div className="stephead">
                            <div>
                              <div className="label" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{x.id.slice(0, 20)}...</div>
                              <h3 style={{ margin: '4px 0', color: '#FFFFFF' }}>{x.incidentType?.name || 'Insiden Siber'}</h3>
                              <p className="muted" style={{ margin: '2px 0 0', fontSize: '0.84rem' }}>{x.title}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                              <span className="tag" style={{ background: `${severityColor[x.severity] ?? '#00E5FF'}22`, borderColor: severityColor[x.severity] ?? '#00E5FF', color: severityColor[x.severity] ?? '#00E5FF' }}>{x.severity}</span>
                              <span className="tag">{statusLabel[x.status] || x.status}</span>
                            </div>
                          </div>
                          {hoursLeft !== null && hoursLeft < 72 && (
                            <div style={{ marginTop: 10, padding: '8px 12px', background: hoursLeft < 12 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)', borderRadius: 8, border: `1px solid ${hoursLeft < 12 ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}` }}>
                              <Clock size={13} style={{ display: 'inline', marginRight: 5, color: hoursLeft < 12 ? '#EF4444' : '#F59E0B' }} />
                              <span style={{ fontSize: '0.83rem', color: hoursLeft < 12 ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>
                                {hoursLeft < 1 ? 'Tenggat sudah lewat!' : `Tenggat: ${hoursLeft} jam lagi`}
                              </span>
                            </div>
                          )}
                          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                            <Link href={`/insiden/${x.id}`} className="btn" style={{ fontSize: '0.83rem', padding: '6px 12px' }}>
                              Buka Berkas →
                            </Link>
                            <Link href="/dokumen" className="btn ghost" style={{ fontSize: '0.83rem', padding: '6px 12px' }}>
                              Draft Notifikasi
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="grid3">
                {[
                  ['Kebocoran Data Pribadi (Data Breach)', 'chk-breach-pdp', 'SOP pemenuhan tenggat 3x24 jam UU PDP dan isolasi database.'],
                  ['Penipuan Transfer & Belanja Online', 'chk-online-fraud', 'Langkah darurat holding mutasi bank dalam 1 jam pertama.'],
                  ['Peretasan Akun Bisnis & Sosmed', 'chk-umkm-pdp', 'Prosedur pemulihan akun 2FA dan penghentian sesi tak dikenal.'],
                  ['Pemerasan Siber & Ancaman Doxing', 'chk-umkm-pdp', 'Prosedur dokumentasi bukti ancaman dan bantuan hukum darurat.'],
                  ['Menyimpan Bukti Digital yang Sah', 'chk-umkm-pdp', 'SOP pengambilan screenshot, hash file, dan rantai bukti (chain of custody).'],
                  ['Kepatuhan Keamanan Sistem PSE', 'chk-umkm-pdp', 'Pedoman tata kelola sistem elektronik sesuai PP No. 71 Tahun 2019.'],
                ].map(([t, , d]) => (
                  <Card key={t} title={t} href="/checklist" eyebrow="SOP RESPON CEPAT">
                    <p style={{ margin: 0 }}>{d}</p>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* 5B. DETAIL PENANGANAN INSIDEN (LIVE BACKEND API) */}
        {kind === 'insiden-detail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Link
                href="/insiden"
                style={{
                  color: '#00E5FF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                ← Kembali ke Daftar Insiden
              </Link>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat data berkas insiden dari database...</p>
              </div>
            ) : !activeIncident ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image
                  src="/mascot/err-01-searching.webp"
                  alt="Tidak Ditemukan"
                  width={80}
                  height={80}
                  style={{ objectFit: 'contain', margin: '0 auto 14px' }}
                />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Berkas Insiden Tidak Ditemukan</h3>
                <p className="muted" style={{ marginBottom: 16 }}>
                  Insiden dengan ID <code>{pathSlug}</code> tidak terdaftar atau Anda belum login dengan akun yang memiliki akses.
                </p>
                <Link href="/insiden" className="btn">
                  Lihat Semua Insiden
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header Card */}
                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div className="label" style={{ color: '#00E5FF' }}>
                        CASE ID: {activeIncident.id} · {activeIncident.incidentType?.name || 'TANGGAP DARURAT'}
                      </div>
                      <h2 style={{ color: '#FFFFFF', margin: '8px 0 10px', fontSize: '1.45rem' }}>
                        {activeIncident.title}
                      </h2>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span
                        className="tag"
                        style={{
                          background:
                            activeIncident.severity === 'CRITICAL'
                              ? 'rgba(239, 68, 68, 0.25)'
                              : activeIncident.severity === 'HIGH'
                              ? 'rgba(249, 115, 22, 0.25)'
                              : activeIncident.severity === 'MEDIUM'
                              ? 'rgba(234, 179, 8, 0.25)'
                              : 'rgba(59, 130, 246, 0.25)',
                          color:
                            activeIncident.severity === 'CRITICAL'
                              ? '#EF4444'
                              : activeIncident.severity === 'HIGH'
                              ? '#F97316'
                              : activeIncident.severity === 'MEDIUM'
                              ? '#EAB308'
                              : '#60A5FA',
                          border: '1px solid currentColor',
                          fontWeight: 700,
                        }}
                      >
                        SEVERITY: {activeIncident.severity}
                      </span>
                      <span
                        className="tag"
                        style={{
                          background:
                            activeIncident.status === 'RESOLVED' || activeIncident.status === 'CLOSED'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(0, 229, 255, 0.15)',
                          color:
                            activeIncident.status === 'RESOLVED' || activeIncident.status === 'CLOSED'
                              ? '#10B981'
                              : '#00E5FF',
                          border: '1px solid currentColor',
                          fontWeight: 700,
                        }}
                      >
                        STATUS: {activeIncident.status}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#E2E8F0', lineHeight: 1.7, margin: '12px 0 18px', fontSize: '0.95rem' }}>
                    {activeIncident.description}
                  </p>

                  {/* 72H Deadline Countdown Banner */}
                  {activeIncident.deadlineAt && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(14, 26, 42, 0.8) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        borderRadius: 12,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Image
                        src="/mascot/inc-01-calm-down.webp"
                        alt="Lexo Alert"
                        width={52}
                        height={52}
                        style={{ objectFit: 'contain' }}
                      />
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div className="label" style={{ color: '#EF4444' }}>
                          <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                          TENGGAT LAPOR HUKUM (UU PDP PASAL 46 - 3x24 JAM)
                        </div>
                        <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.98rem', marginTop: 2 }}>
                          Batas Akhir: {new Date(activeIncident.deadlineAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </div>
                        <small className="muted" style={{ fontSize: '0.82rem' }}>
                          Wajib menyampaikan pemberitahuan tertulis kepada lembaga pengawas pelindungan data pribadi dan subjek data.
                        </small>
                      </div>
                      <Link href="/dokumen" className="btn" style={{ fontSize: '0.85rem' }}>
                        Buat Surat Notifikasi →
                      </Link>
                    </div>
                  )}
                </div>

                <div className="grid2" style={{ gap: 20 }}>
                  {/* Left Column: Timeline Events */}
                  <div className="panel">
                    <h3 style={{ color: '#FFFFFF', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Clock size={18} style={{ color: '#00E5FF' }} />
                      Lini Masa & Jejak Audit (Audit Trail)
                    </h3>

                    {(!activeIncident.events || activeIncident.events.length === 0) ? (
                      <p className="muted" style={{ fontSize: '0.9rem' }}>Belum ada rekaman lini masa.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {activeIncident.events.map((evt, idx) => (
                          <div
                            key={evt.id || idx}
                            style={{
                              padding: '12px 16px',
                              background: 'rgba(255,255,255,0.03)',
                              borderRadius: 10,
                              borderLeft: '3px solid #00E5FF',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{evt.title}</strong>
                              <span className="label" style={{ fontSize: '0.75rem' }}>
                                {new Date(evt.occurredAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            {evt.description && (
                              <p className="muted" style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                {evt.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reminders section */}
                    {activeIncident.reminders && activeIncident.reminders.length > 0 && (
                      <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="label" style={{ marginBottom: 10 }}>PENGINGAT OTOMATIS SISTEM</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {activeIncident.reminders.map((rem) => (
                            <div
                              key={rem.id}
                              style={{
                                padding: '10px 14px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 8,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.85rem',
                              }}
                            >
                              <div>
                                <span className="tag" style={{ marginRight: 8 }}>{rem.reminderType}</span>
                                <span style={{ color: '#E2E8F0' }}>{rem.message}</span>
                              </div>
                              <span className="label" style={{ color: rem.isSent ? '#10B981' : '#F59E0B' }}>
                                {rem.isSent ? 'Terkirim' : 'Dijadwalkan'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions & Recommended Checklists */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Recommended Checklists */}
                    <div className="panel">
                      <h3 style={{ color: '#FFFFFF', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckSquare size={18} style={{ color: '#10B981' }} />
                        SOP Kepatuhan yang Direkomendasikan
                      </h3>

                      {(!activeIncident.incidentType?.recommendedChecklists || activeIncident.incidentType.recommendedChecklists.length === 0) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <p className="muted" style={{ fontSize: '0.88rem', margin: 0 }}>
                            Gunakan checklist respon cepat standar kami:
                          </p>
                          <Link href="/checklist" className="btn secondary" style={{ justifyContent: 'flex-start' }}>
                            <CheckSquare size={15} /> Buka Direktori Checklist Lengkap →
                          </Link>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {activeIncident.incidentType.recommendedChecklists.map((chk) => (
                            <Link
                              key={chk.id}
                              href={`/checklist/${chk.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 8,
                                border: '1px solid rgba(16, 185, 129, 0.25)',
                                color: '#FFFFFF',
                                textDecoration: 'none',
                              }}
                            >
                              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{chk.title}</span>
                              <span style={{ color: '#10B981', fontSize: '0.82rem' }}>Buka SOP →</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Update & Mitigation Actions */}
                    <div className="panel">
                      <h3 style={{ color: '#FFFFFF', margin: '0 0 14px' }}>Aksi Penanganan</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Link href="/dokumen" className="btn" style={{ justifyContent: 'center' }}>
                          <FileText size={15} /> Buat Dokumen & Surat Notifikasi Resmi
                        </Link>
                        <Link href="/asisten" className="btn secondary" style={{ justifyContent: 'center' }}>
                          <Bot size={15} /> Tanya Panduan Hukum ke Asisten AI
                        </Link>
                        <div style={{ marginTop: 10, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                          <span className="label" style={{ display: 'block', marginBottom: 8, color: '#00E5FF' }}>
                            UBAH STATUS KASUS (VERIFIKATOR / ADMIN)
                          </span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                            {[
                              { key: 'INVESTIGATING', label: 'Investigasi', color: '#F59E0B' },
                              { key: 'CONTAINED', label: 'Terkendali', color: '#3B82F6' },
                              { key: 'RESOLVED', label: 'Selesai (Resolved)', color: '#10B981' },
                              { key: 'CLOSED', label: 'Tutup Kasus', color: '#94A3B8' },
                            ].map((st) => (
                              <button
                                key={st.key}
                                type="button"
                                className="btn ghost"
                                style={{
                                  fontSize: '0.8rem',
                                  padding: '8px 10px',
                                  borderColor: activeIncident.status === st.key ? st.color : 'rgba(255,255,255,0.15)',
                                  color: activeIncident.status === st.key ? '#FFFFFF' : st.color,
                                  background: activeIncident.status === st.key ? `${st.color}33` : 'transparent',
                                  fontWeight: activeIncident.status === st.key ? 700 : 500,
                                }}
                                onClick={async () => {
                                  try {
                                    await api.updateIncidentStatus(activeIncident.id, st.key);
                                    setActiveIncident({ ...activeIncident, status: st.key as Incident['status'] });
                                    alert(`Status kasus berhasil diubah menjadi ${st.key}!`);
                                  } catch (err: unknown) {
                                    const msg = err instanceof Error ? err.message : 'Kesalahan server';
                                    alert('Gagal memperbarui status: ' + msg);
                                  }
                                }}
                              >
                                {activeIncident.status === st.key ? '✓ ' : ''}{st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5C. ANTREAN KASUS & INSIDEN ADMIN (LIVE BACKEND API) */}
        {kind === 'admin/cases' && (
          <div>
            <div className="panel" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <h3 style={{ color: '#FFFFFF', margin: '0 0 6px' }}>Antrean Laporan & Tanggap Insiden Masuk</h3>
                  <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                    Daftar insiden siber yang dilaporkan dan tercatat di database Lexora untuk ditinjau oleh tim verifikator.
                  </p>
                </div>
                <Link href="/insiden" className="btn" style={{ fontSize: '0.85rem' }}>
                  + Lapor Insiden Baru
                </Link>
              </div>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat data antrean kasus dari database...</p>
              </div>
            ) : incidents.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image
                  src="/mascot/err-01-searching.webp"
                  alt="Belum Ada Kasus"
                  width={80}
                  height={80}
                  style={{ objectFit: 'contain', margin: '0 auto 14px' }}
                />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Belum Ada Kasus Masuk</h3>
                <p className="muted">Saat ini belum ada insiden yang dilaporkan ke sistem.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {incidents.map((x) => (
                  <div
                    key={x.id}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span className="label" style={{ color: '#00E5FF' }}>{x.id}</span>
                        <span className="tag">{x.incidentType?.name || 'Insiden Siber'}</span>
                        <span
                          className="tag"
                          style={{
                            background:
                              x.severity === 'CRITICAL'
                                ? 'rgba(239, 68, 68, 0.25)'
                                : x.severity === 'HIGH'
                                ? 'rgba(249, 115, 22, 0.25)'
                                : 'rgba(59, 130, 246, 0.25)',
                            color:
                              x.severity === 'CRITICAL'
                                ? '#EF4444'
                                : x.severity === 'HIGH'
                                ? '#F97316'
                                : '#60A5FA',
                            fontWeight: 700,
                          }}
                        >
                          {x.severity}
                        </span>
                        <span className="tag" style={{ color: x.status === 'RESOLVED' ? '#10B981' : '#E2E8F0' }}>
                          {x.status}
                        </span>
                      </div>
                      <h4 style={{ color: '#FFFFFF', margin: '0 0 6px', fontSize: '1.05rem' }}>{x.title}</h4>
                      <p className="muted" style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                        {x.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <Link href={`/insiden/${x.id}`} className="btn" style={{ fontSize: '0.83rem', padding: '6px 14px' }}>
                        Tinjau Berkas →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. EDUKASI INTERAKTIF (LIVE FROM BACKEND API) */}
        {kind === 'education' && (
          <>
            <div
              className="panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '22px 26px',
                marginBottom: 28,
              }}
            >
              <Image src="/mascot/cht-03-citation.webp" alt="Lexo Edukasi" width={78} height={78} className="animate-float" />
              <div>
                <span className="label">KAMPUS SIBER LEXORA · LITERASI HUKUM</span>
                <h2 style={{ margin: '4px 0 8px', color: '#FFFFFF', fontSize: '1.4rem' }}>
                  Modul Pembelajaran Interaktif & Kuis Berbobot
                </h2>
                <p className="muted" style={{ margin: 0, fontSize: '0.92rem' }}>
                  Kursus literasi siber dan kepatuhan hukum yang disinkronkan langsung dari endpoint backend <code>/api/v1/courses</code>.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat kursus edukasi dari database...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-01-searching.webp" alt="Kosong" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Belum Ada Modul Kursus</h3>
                <p className="muted">Kursus edukasi hukum siber sedang disiapkan oleh tim legal.</p>
              </div>
            ) : (
              <div className="grid2" style={{ gap: 20 }}>
                {courses.map((crs) => (
                  <div key={crs.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="tag">{crs.targetAudience}</span>
                        <span className="label" style={{ color: '#10B981' }}>{crs.status}</span>
                      </div>
                      <h3 style={{ color: '#FFFFFF', margin: '8px 0', fontSize: '1.25rem' }}>{crs.title}</h3>
                      <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{crs.description}</p>

                      <div style={{ marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                        <div className="label" style={{ marginBottom: 8 }}>PELAJARAN TERSEDIA:</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(crs.lessons || []).map((les) => (
                            <Link
                              key={les.id}
                              href={`/education/${crs.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 8,
                                color: '#E2E8F0',
                                fontSize: '0.88rem',
                                textDecoration: 'none',
                              }}
                            >
                              <span>§0{les.order} · {les.title}</span>
                              <span style={{ color: '#00E5FF', fontSize: '0.8rem' }}>~{les.durationMinutes} mnt →</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <Link href={`/education/${crs.id}`} className="btn" style={{ width: '100%', justifyContent: 'center' }}>
                        Mulai Belajar Materi Ini →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 6B. EDUKASI DETAIL & KUIS (LIVE API) */}
        {kind === 'education-detail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Link href="/education" style={{ color: '#00E5FF', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 600 }}>
                ← Kembali ke Kampus Edukasi
              </Link>
            </div>

            {isLoading ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p className="muted">Memuat materi kursus...</p>
              </div>
            ) : !activeCourse ? (
              <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Image src="/mascot/err-03-lost-404.webp" alt="Tidak Ditemukan" width={90} height={90} style={{ objectFit: 'contain', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#FFFFFF', margin: '0 0 8px' }}>Kursus Tidak Ditemukan</h3>
                <Link href="/education" className="btn secondary">Kembali ke Kampus Edukasi</Link>
              </div>
            ) : (
              <div>
                <div className="panel" style={{ marginBottom: 24 }}>
                  <span className="tag" style={{ marginBottom: 8 }}>{activeCourse.targetAudience}</span>
                  <h1 style={{ color: '#FFFFFF', fontSize: '1.6rem', margin: '6px 0 10px' }}>{activeCourse.title}</h1>
                  <p className="muted" style={{ margin: 0, fontSize: '0.95rem' }}>{activeCourse.description}</p>
                </div>

                <h2 className="section-title" style={{ fontSize: '1.3rem', marginBottom: 16 }}>Daftar Pelajaran Materi</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(activeCourse.lessons || []).map((les, idx) => (
                    <div key={les.id} className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="label" style={{ color: '#00E5FF' }}>PELAJARAN §0{les.order || idx + 1}</span>
                        <span className="tag">DURASI ~{les.durationMinutes} MENIT</span>
                      </div>
                      <h3 style={{ color: '#FFFFFF', margin: '0 0 12px', fontSize: '1.3rem' }}>{les.title}</h3>

                      <div style={{ background: 'rgba(10, 18, 28, 0.8)', borderLeft: '3px solid #00E5FF', padding: '16px 20px', borderRadius: 6, lineHeight: 1.8, fontSize: '0.95rem', color: '#E2E8F0', marginBottom: 16 }}>
                        {les.content}
                      </div>

                      <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(0, 229, 255, 0.2)' }}>
                        <strong style={{ color: '#00E5FF', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <CheckCircle2 size={16} /> Kuis Pemahaman Kepatuhan:
                        </strong>
                        <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#CBD5E1' }}>
                          Apakah ketentuan 3 x 24 jam berlaku wajib untuk seluruh pengendali data di Indonesia?
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            className="btn secondary"
                            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                            onClick={() => alert('Benar! Pasal 46 UU PDP mewajibkan pemberitahuan tertulis maksimal 3 x 24 jam.')}
                          >
                            Ya, Wajib Berdasarkan Pasal 46 UU PDP
                          </button>
                          <button
                            className="btn ghost"
                            style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                            onClick={() => alert('Kurang tepat. Kewajiban ini diatur secara tegas dalam Pasal 46 UU PDP.')}
                          >
                            Tidak, Bersifat Opsional
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. KANAL RESMI PEMERINTAH */}
        {kind === 'kanal' && (
          <>
            <div className="panel">
              <h2 style={{ color: '#FFFFFF', margin: '0 0 16px' }}>§01 · Urutan Kanal Pelaporan yang Paling Tepat</h2>
              <div className="field">
                <label>Pilih jenis insiden yang dialami</label>
                <select className="control" value={tab} onChange={(e) => setTab(e.target.value)}>
                  {incidentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="muted" style={{ marginBottom: 20 }}>
                Urutan di bawah ini diprioritaskan berdasarkan kecepatan tanggap. Selalu utamakan bank jika transfer dana baru saja terjadi.
              </p>
              <div className="grid3">
                {(tab === 'fraud' || tab === 'investment' || tab === 'marketplace'
                  ? ['bank', 'iasc', 'patroli', 'spkt', 'komdigi']
                  : tab === 'sextortion'
                  ? ['sapa', 'patroli', 'konten', 'spkt']
                  : tab === 'breach'
                  ? ['bssn', 'patroli']
                  : ['patroli', 'konten', 'spkt']
                ).map((id, i) => {
                  const ch = channels.find((x) => x.id === id)!;
                  return (
                    <div className="card" key={id}>
                      <div className="label">PRIORITAS §0{i + 1}</div>
                      <h3 style={{ margin: '8px 0', color: '#FFFFFF' }}>{ch.name}</h3>
                      <p className="muted" style={{ fontSize: '0.88rem' }}>{ch.purpose}</p>
                      <div style={{ margin: '10px 0' }}>
                        <span className="tag">METODE: {ch.how}</span>
                      </div>
                      <p className="muted" style={{ fontSize: '0.82rem' }}>
                        <strong>Dokumen:</strong> {ch.bring.join(', ')}
                      </p>
                      {ch.url ? (
                        <a className="btn secondary" href={ch.url} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10, fontSize: '0.82rem' }}>
                          Buka Portal {ch.name} ↗
                        </a>
                      ) : (
                        <Link className="btn" href="/lapor" style={{ marginTop: 10, fontSize: '0.82rem' }}>
                          Susun Berkas Laporan →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 8. CYBER TOOLKIT MANDIRI */}
        {kind === 'toolkit' && (
          <div className="grid3">
            {[
              ['cek-link', 'Pemeriksa Tautan Phishing', 'Analisis URL mencurigakan dan cek pola manipulasi domain homograf.'],
              ['cek-sandi', 'Uji Kekuatan Kata Sandi', 'Periksa ketahanan sandi dari serangan kamus dan brute-force lokal.'],
              ['generator-sandi', 'Generator Sandi Acak Kuat', 'Buat sandi kombinasi 16+ karakter dengan simbol dan angka aman.'],
            ].map(([id, t, d]) => (
              <Card key={id} title={t} href={`/toolkit/${id}`} eyebrow="TOOLKIT SIBER MANDIRI">
                {d}
              </Card>
            ))}
          </div>
        )}

        {/* 9. TENTANG LEXORA */}
        {kind === 'tentang' && (
          <div className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Image src="/logo/logo-glow.webp" alt="Logo Lexora" width={48} height={48} />
              <div>
                <h2 style={{ color: '#FFFFFF', margin: 0 }}>Tentang Platform Lexora</h2>
                <span className="label">WEB DEVELOPMENT COMPETITION UINIC 8.0</span>
              </div>
            </div>
            <p style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#E2E8F0' }}>
              Lexora dibangun untuk menjawab kesenjangan pemahaman hukum siber di Indonesia. Berdasarkan riset, sebagian besar korban kejahatan digital dan pelaku UMKM tidak memahami hak hukum mereka saat data bocor atau menjadi korban penipuan.
            </p>
            <p style={{ lineHeight: 1.8, fontSize: '0.95rem', color: '#E2E8F0' }}>
              Dengan pendekatan <strong>Masalah → Penjelasan → Checklist → Template → Tindakan</strong>, Lexora menerjemahkan teks undang-undang yang rumit (UU PDP dan UU ITE) menjadi instrumen praktis yang dapat langsung dieksekusi.
            </p>
          </div>
        )}

        {/* 9B. PROFIL & PENGATURAN (LIVE FROM BACKEND GET /api/v1/users/me) */}
        {kind === 'profil' && (
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <Image src="/mascot/gen-01-welcome.webp" alt="Avatar Profil" width={64} height={64} style={{ borderRadius: '50%' }} />
                <div>
                  <h2 style={{ color: '#FFFFFF', margin: 0 }}>{userProfile?.name || 'Pengguna Lexora'}</h2>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <span className="tag" style={{ color: '#00E5FF', fontWeight: 600 }}>{userProfile?.role || 'PENGGUNA'}</span>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>{userProfile?.email || 'Sesi Browser Lokal'}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">ID Akun Database:</span>
                  <code style={{ color: '#00E5FF' }}>{userProfile?.id || '-'}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">Tanggal Terdaftar:</span>
                  <span style={{ color: '#FFFFFF' }}>
                    {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'Aktif'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span className="muted">Penyimpanan Berkas Kasus Lokal:</span>
                  <span style={{ color: '#10B981' }}>{cases.length} berkas tersimpan di peramban</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    if (confirm('Bersihkan riwayat pelaporan lokal di peramban ini?')) {
                      localStorage.removeItem('lexora-cases');
                      window.location.reload();
                    }
                  }}
                >
                  Bersihkan Cache Kasus Lokal
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    nextAuthSignOut({ callbackUrl: '/login' });
                  }}
                >
                  Keluar dari Sesi (Logout)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 10. AUTH: LOGIN & REGISTER */}
        {kind === 'login' && (
          <div className="panel" style={{ maxWidth: 460, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Image src="/mascot/gen-01-welcome.webp" alt="Lexo Wave" width={56} height={56} />
              <div>
                <h2 style={{ margin: 0, color: '#FFFFFF' }}>Masuk ke Lexora</h2>
                <span className="label">AKSES BERKAS & DASHBOARD</span>
              </div>
            </div>

            {message && <div className="alert" style={{ marginBottom: 14 }}>{message}</div>}

            <form onSubmit={handleSignIn}>
              <label className="field">
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
              </label>
              <label className="field" style={{ marginTop: 10 }}>
                <span>Kata Sandi</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>

              <button className="btn" type="submit" disabled={isSigningIn} style={{ width: '100%', marginTop: 18 }}>
                {isSigningIn ? 'Memverifikasi...' : 'Masuk Sekarang →'}
              </button>
            </form>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'center' }}>
              Belum memiliki akun? <Link href="/register" style={{ color: '#00E5FF', fontWeight: 600 }}>Daftar akun baru</Link>
            </div>
          </div>
        )}

        {kind === 'register' && (
          <div className="panel" style={{ maxWidth: 460, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <Image src="/mascot/gen-01-welcome.webp" alt="Lexo Wave" width={56} height={56} />
              <div>
                <h2 style={{ margin: 0, color: '#FFFFFF' }}>Daftar Akun Lexora</h2>
                <span className="label">BUAT AKUN PELAPOR & AKSES DASHBOARD</span>
              </div>
            </div>

            {message && <div className="alert" style={{ marginBottom: 14 }}>{message}</div>}

            <form onSubmit={handleRegister}>
              <label className="field">
                <span>Nama Lengkap</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" required />
              </label>
              <label className="field" style={{ marginTop: 10 }}>
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required />
              </label>
              <label className="field" style={{ marginTop: 10 }}>
                <span>Kata Sandi (Minimal 8 Karakter)</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              </label>
              <label className="field" style={{ marginTop: 10 }}>
                <span>Konfirmasi Kata Sandi</span>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
              </label>

              <button className="btn" type="submit" disabled={isSigningIn} style={{ width: '100%', marginTop: 18 }}>
                {isSigningIn ? 'Mendaftarkan Akun...' : 'Daftar Sekarang →'}
              </button>
            </form>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#94A3B8', textAlign: 'center' }}>
              Sudah memiliki akun? <Link href="/login" style={{ color: '#00E5FF', fontWeight: 600 }}>Masuk di sini</Link>
            </div>
          </div>
        )}

        {/* 11. DASHBOARD & ADMIN PANEL (WITH LIVE DB METRICS) */}
        {(kind === 'dashboard' || kind === 'admin') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="grid3">
              <div className="panel">
                <div className="label">KASUS & INSIDEN</div>
                <h3 style={{ fontSize: '1.8rem', color: '#00E5FF', margin: '4px 0' }}>
                  {analytics?.incidents?.total ?? 0}
                </h3>
                <small className="muted">Laporan aktif tersimpan di database</small>
              </div>
              <div className="panel">
                <div className="label">CHECKLIST KEPATUHAN</div>
                <h3 style={{ fontSize: '1.8rem', color: '#10B981', margin: '4px 0' }}>
                  {analytics?.checklists?.completed ?? 0}
                </h3>
                <small className="muted">SOP kepatuhan resmi terdaftar</small>
              </div>
              <div className="panel">
                <div className="label">TEMPLATE DOKUMEN</div>
                <h3 style={{ fontSize: '1.8rem', color: '#F59E0B', margin: '4px 0' }}>
                  {analytics?.documents?.generated ?? 0}
                </h3>
                <small className="muted">Draf dokumen siap eksekusi</small>
              </div>
            </div>

            <div className="panel">
              <h3 style={{ color: '#FFFFFF', margin: '0 0 14px' }}>Aksi Layanan Terintegrasi</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/asisten" className="btn">
                  <Bot size={15} /> Konsultasi AI Lexo
                </Link>
                <Link href="/regulations" className="btn secondary">
                  <BookOpen size={15} /> Direktori Regulasi
                </Link>
                <Link href="/checklist" className="btn secondary">
                  <CheckSquare size={15} /> Checklist Kepatuhan
                </Link>
                <Link href="/dokumen" className="btn secondary">
                  <FileText size={15} /> Buat Dokumen Resmi
                </Link>
                <Link href="/education" className="btn secondary">
                  <GraduationCap size={15} /> Kampus Edukasi
                </Link>
                <Link href="/insiden" className="btn ghost">
                  Tanggap Insiden
                </Link>
              </div>
            </div>

            {kind === 'admin' && (
              <div className="panel">
                <div className="label" style={{ color: '#00E5FF', marginBottom: 4 }}>AUDIT TRAIL OTENTIK</div>
                <h3 style={{ color: '#FFFFFF', margin: '0 0 14px' }}>Log Aktivitas & Riwayat Transaksi Sistem (Live API)</h3>
                {activityLogs.length === 0 ? (
                  <p className="muted" style={{ margin: 0 }}>Belum ada log aktivitas tercatat dalam 30 hari terakhir.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 8,
                          fontSize: '0.88rem',
                        }}
                      >
                        <div>
                          <span className="tag" style={{ marginRight: 8, color: '#00E5FF' }}>{log.action}</span>
                          <span style={{ color: '#E2E8F0' }}>Oleh: <strong>{log.user?.name || log.user?.email || 'Sistem'}</strong></span>
                        </div>
                        <span className="muted" style={{ fontSize: '0.8rem' }}>
                          {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
