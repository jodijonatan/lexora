'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  Copy,
  CheckCircle2,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  FileText,
  AlertCircle,
  X,
} from 'lucide-react';
import { incidentTypes } from '@/data/channels';
import { useCases, CaseRecord } from '@/store/cases';
import { triage, completeness } from '@/lib/triage';
import { PageHead, Meter, PrototypeNotice } from '@/components/ui';
import { api } from '@/lib/api-client';
import { createCaseId, generateSecurePin } from '@/lib/case-id';

export interface UploadedEvidence {
  id: string;
  name: string;
  sizeKB: number;
  type: string;
  dataUrl?: string;
  category: 'TRANSFER' | 'CHAT' | 'PROFILE' | 'DOCUMENT' | 'LAINNYA';
}

const steps = [
  'Keselamatan',
  'Jenis kejadian',
  'Kronologi',
  'Kerugian',
  'Tentang pelaku',
  'Bukti',
  'Kontak',
  'Tinjau & kirim',
];

export default function Lapor() {
  const router = useRouter();
  const params = useSearchParams();
  const addCase = useCases((s) => s.addCase);
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState(params.get('jenis') || '');
  const [threat, setThreat] = useState(false);
  const [minor, setMinor] = useState(false);
  const [recent, setRecent] = useState(false);
  const [occurredAt] = useState(() => new Date().toISOString());
  const [platform, setPlatform] = useState('WhatsApp');
  const [what, setWhat] = useState('');
  const [didNext, setDidNext] = useState('');
  const [after, setAfter] = useState('');
  const [extra, setExtra] = useState('');
  const [loss, setLoss] = useState('yes');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Transfer bank');
  const [bank, setBank] = useState('');
  const [suspect, setSuspect] = useState('');
  const [evidence, setEvidence] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedEvidence[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; name: string } | null>(null);
  const [contact, setContact] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState<CaseRecord | null>(null);
  const [draftNotice, setDraftNotice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const d = localStorage.getItem('lexora-draft');
        if (d) {
          const v = JSON.parse(d);
          setTypeId((curr) => v.typeId || curr);
          setWhat(v.what || '');
          setDidNext(v.didNext || '');
          setAfter(v.after || '');
          setDraftNotice(true);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lexora-draft', JSON.stringify({ typeId, what, didNext, after, occurredAt, step }));
    } catch {}
  }, [typeId, what, didNext, after, occurredAt, step]);

  // Scroll to top immediately when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);

  const narrative = [what, didNext, after, extra].filter(Boolean).join('\n');
  const score = useMemo(
    () =>
      completeness({
        typeId,
        occurredAt,
        narrative,
        platform,
        loss: loss === 'yes' ? (amount ? 'kerugian uang' : '') : 'tidak ada',
        suspect,
        evidence: evidenceFiles.length > 0 ? evidenceFiles.map((f) => f.name).join(', ') : evidence,
        contact: anonymous ? 'anonim' : contact,
      }),
    [typeId, occurredAt, narrative, platform, loss, amount, suspect, evidenceFiles, evidence, contact, anonymous]
  );
  const urgency = triage({
    typeId,
    amount: Number(amount) || undefined,
    hoursAgo: recent ? 2 : undefined,
    threat,
    minor,
    accountTaken: typeId === 'hacked',
  });
  const selected = incidentTypes.find((t) => t.id === typeId);
  const canSend = !!typeId && narrative.trim().length >= 30 && (anonymous || !!contact.trim());

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`Berkas "${file.name}" melebihi batas 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const lower = file.name.toLowerCase();
        const category: UploadedEvidence['category'] =
          lower.includes('transfer') || lower.includes('bukti') || lower.includes('struk') || lower.includes('mutasi')
            ? 'TRANSFER'
            : lower.includes('chat') || lower.includes('wa') || lower.includes('whatsapp') || lower.includes('dm') || lower.includes('telegram')
            ? 'CHAT'
            : lower.includes('profil') || lower.includes('akun') || lower.includes('nomor')
            ? 'PROFILE'
            : lower.includes('pdf') || lower.includes('dok') || lower.includes('laporan')
            ? 'DOCUMENT'
            : 'LAINNYA';

        const newFile: UploadedEvidence = {
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          sizeKB: Math.round(file.size / 1024),
          type: file.type,
          dataUrl,
          category,
        };
        setEvidenceFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidenceFile = (id: string) => {
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateEvidenceCategory = (id: string, category: UploadedEvidence['category']) => {
    setEvidenceFiles((prev) => prev.map((f) => (f.id === id ? { ...f, category } : f)));
  };

  function next() {
    if (step === 1 && !typeId) {
      alert('Pilih jenis kejadian atau pilih salah satu yang paling mendekati.');
      return;
    }
    if (step === 2 && narrative.trim().length < 30) {
      alert('Ceritakan kejadian minimal 30 karakter agar dapat dianalisis.');
      return;
    }
    if (step === 6 && !anonymous && !contact.trim()) {
      alert('Isi cara menghubungimu atau pilih opsi lapor secara anonim.');
      return;
    }
    setStep((s) => Math.min(7, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit() {
    if (!canSend) return;
    const id = createCaseId();
    const pin = generateSecurePin();

    const formattedEvidence =
      evidenceFiles.length > 0
        ? evidenceFiles.map((f) => ({
            name: f.name,
            sizeKB: f.sizeKB,
            dataUrl: f.dataUrl,
            category: f.category,
          }))
        : evidence
        ? [{ name: evidence, sizeKB: 0 }]
        : [];

    const c: CaseRecord = {
      id,
      pin,
      typeId,
      typeName: selected?.name || 'Kejadian siber',
      occurredAt: occurredAt || new Date().toISOString(),
      narrative,
      platform,
      amount: loss === 'yes' ? Number(amount) || 0 : 0,
      urgency: urgency.urgency,
      status: 'DITERIMA',
      completeness: score.score,
      contact: anonymous ? 'Anonim' : contact,
      createdAt: new Date().toISOString(),
      timeline: [{ at: new Date().toISOString(), text: 'Laporan tersimpan di Lexora. Belum dikirim ke pihak berwenang.', actor: 'LEXORA' }],
      channelReports: [],
      evidence: formattedEvidence,
      messages: [],
    };
    addCase(c);
    setSubmitted(c);

    const evidenceSummary =
      evidenceFiles.length > 0
        ? ` | Bukti Digital: ${evidenceFiles.length} berkas (${evidenceFiles.map((f) => `${f.name} [${f.category}]`).join(', ')})`
        : evidence
        ? ` | Bukti: ${evidence}`
        : '';

    // Sinkronisasi otomatis ke backend database Neon (tersedia untuk umum maupun akun terdaftar)
    api.createIncident({
      incidentTypeId: typeId === 'breach' ? 'kebocoran-data-pribadi' : 'penipuan-online',
      title: `${selected?.name || 'Laporan Kejadian Siber'} (${platform || 'Online'}) - [${id}]`,
      description:
        narrative +
        (contact && !anonymous ? ` | Pelapor: ${contact}` : '') +
        (amount ? ` | Estimasi Kerugian: Rp ${Number(amount).toLocaleString('id-ID')}` : '') +
        ` | PIN Lacak: ${pin}` +
        evidenceSummary,
      severity: (urgency.urgency as string) === 'KRITIS' ? 'CRITICAL' : (urgency.urgency as string) === 'TINGGI' ? 'HIGH' : 'MEDIUM',
      evidence: evidenceFiles.length > 0
        ? evidenceFiles.map((f) => ({
            id: f.id,
            name: f.name,
            sizeKB: f.sizeKB,
            type: f.type,
            dataUrl: f.dataUrl,
            category: f.category,
          }))
        : undefined,
    }).catch((err) => {
      console.log('Local case registered. Backend sync note:', err?.message);
    });

    try {
      localStorage.removeItem('lexora-draft');
    } catch {}
    router.replace(`/lapor?selesai=${id}`);
  }

  if (submitted || params.get('selesai')) {
    const c = submitted || useCases.getState().cases.find((x) => x.id === params.get('selesai'));
    return (
      <>
        <PageHead
          eyebrow="LAPORAN BERHASIL DISUSUN"
          title="Bukti & Kronologi Kamu Sudah Teramankan."
          desc="Simpan Case ID dan PIN pelacakan ini dengan baik. Anda memerlukannya untuk membuka berkas atau mencetak paket laporan."
        />
        <div className="container section">
          <PrototypeNotice />
          {c ? (
            <>
              <div
                className="grid2"
              style={{
                marginTop: 28,
                alignItems: 'center',
                gap: 28,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(20px, 3.5vw, 36px)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <Image src="/mascot/edu-01-celebration.webp" alt="Lexo Sukses" width={56} height={56} style={{ objectFit: 'contain' }} />
                  <div>
                    <span className="tag ok">
                      <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                      BERKAS TERDAFTAR LOKAL
                    </span>
                    <h3 style={{ margin: '4px 0 0', color: '#FFFFFF', fontSize: '1.25rem' }}>ID & PIN Kasus Kamu</h3>
                  </div>
                </div>

                <div className="panel" style={{ background: 'rgba(7, 12, 20, 0.85)', borderColor: 'rgba(0, 229, 255, 0.4)', padding: 20 }}>
                  <div className="label muted">CASE ID RESMI</div>
                  <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#FFFFFF', margin: '4px 0 16px' }}>
                    {c.id}
                  </h2>

                  <div className="label muted">PIN PELACAKAN RAHASIA (6 DIGIT)</div>
                  <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', color: '#00E5FF', margin: '4px 0 16px', letterSpacing: '0.15em' }}>
                    {c.pin}
                  </h2>

                  <button
                    className="btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(`Lexora Case ID: ${c.id}\nPIN: ${c.pin}`);
                      alert('Case ID dan PIN disalin ke clipboard.');
                    }}
                    style={{ width: '100%' }}
                  >
                    <Copy size={16} /> Salin Case ID & PIN
                  </button>
                </div>
                <p className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>
                  *PIN bersifat rahasia sebagai pengganti kata sandi untuk memeriksa dan memperbarui laporan.
                </p>
              </div>

              <div>
                <div className="panel" style={{ background: 'rgba(14, 24, 38, 0.7)' }}>
                  <div className="label">REKOMENDASI LANGKAH SELANJUTNYA</div>
                  <h3 style={{ fontSize: '1.2rem', margin: '8px 0 14px', color: '#FFFFFF' }}>Apa yang harus dilakukan sekarang?</h3>
                  <ol style={{ paddingLeft: 20, margin: '0 0 20px', lineHeight: 1.7, fontSize: '0.92rem', color: '#CBD5E1' }}>
                    <li>
                      <strong>Segera hubungi bank</strong> jika ada kerugian transfer uang untuk mengajukan pemblokiran rekening tujuan.
                    </li>
                    <li>
                      <strong>Cetak atau simpan PDF</strong> ringkasan laporan ini sebagai lampiran resmi saat melapor ke kepolisian.
                    </li>
                    <li>
                      <strong>Laporkan ke kanal digital</strong> seperti Patroli Siber Polri atau Layanan Aduan Konten Komdigi.
                    </li>
                  </ol>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link className="btn" href={`/lacak?id=${c.id}`}>
                      Lacak Status Kasus <ArrowRight size={16} />
                    </Link>
                    <button className="btn secondary" onClick={() => window.print()}>
                      Cetak Paket Laporan
                    </button>
                    <Link className="btn ghost" href="/kanal">
                      Pilih Kanal Pelaporan Resmi →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Berkas Bukti Digital Terverifikasi */}
            {c.evidence && c.evidence.length > 0 && (
              <div className="panel" style={{ marginTop: 24, background: 'var(--bg-panel)' }}>
                <div className="label muted">BERKAS BUKTI DIGITAL TERVERIFIKASI ({c.evidence.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginTop: 12 }}>
                  {c.evidence.map((ev, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      {ev.dataUrl ? (
                        <div
                          style={{
                            width: '100%',
                            height: 110,
                            borderRadius: 6,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            marginBottom: 8,
                          }}
                          onClick={() => setPreviewModalImg({ url: ev.dataUrl || '', name: ev.name })}
                          title="Klik untuk memperbesar"
                        >
                          <img src={ev.dataUrl} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 3, color: '#FFF' }}>
                            <ZoomIn size={12} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 110, borderRadius: 6, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00E5FF', marginBottom: 8 }}>
                          <FileText size={32} />
                        </div>
                      )}
                      <strong style={{ fontSize: '0.82rem', color: '#FFF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.name}
                      </strong>
                      {ev.category && (
                        <span className="tag" style={{ fontSize: '0.7rem', marginTop: 4, display: 'inline-block' }}>
                          {ev.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </>
          ) : (
            <p>Data tersimpan. Silakan buka halaman pelacakan dengan Case ID Anda.</p>
          )}
        </div>

        {/* Lightbox / Zoom Modal for Screenshots */}
        {previewModalImg && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              backdropFilter: 'blur(6px)',
            }}
            onClick={() => setPreviewModalImg(null)}
          >
            <div
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                background: '#0D1520',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ImageIcon size={16} style={{ color: '#00E5FF' }} />
                  <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{previewModalImg.name}</strong>
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => setPreviewModalImg(null)}
                >
                  <X size={15} style={{ display: 'inline', marginRight: 4 }} /> Tutup
                </button>
              </div>
              <div style={{ padding: 16, overflow: 'auto', display: 'flex', justifyContent: 'center', background: '#070D14' }}>
                <img
                  src={previewModalImg.url}
                  alt={previewModalImg.name}
                  style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="FORMULIR PENDAMPINGAN SIBER"
        title="Kita Susun Laporan Bersama, Pelan-Pelan."
        desc="Kejahatan siber bukan salahmu. Isi hal-hal yang kamu ingat dan lewati bagian yang belum pasti. Lexora siap membantumu."
      />

      <div className="container section">
        <PrototypeNotice />
        {draftNotice && (
          <div className="success" style={{ marginTop: 14 }}>
            Draf formulir sebelumnya ditemukan dan data berhasil dipulihkan secara otomatis.
          </div>
        )}

        <div className="wizard-grid">
          {/* Main Wizard Form */}
          <section className="panel" style={{ padding: 'clamp(20px, 3.5vw, 36px)' }}>
            <div className="stephead">
              <span className="label">
                LANGKAH {step + 1} DARI {steps.length}: {steps[step].toUpperCase()}
              </span>
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                Tersisa {Math.max(1, steps.length - 1 - step)} langkah
              </span>
            </div>

            <div className="meter" style={{ marginBottom: 28 }}>
              {steps.map((s, i) => (
                <span key={s} className={i <= step ? 'on' : ''} />
              ))}
            </div>

            {/* Step 0: Keselamatan */}
            {step === 0 && (
              <>
                <h2 className="section-title">§00 · Keselamatan Diri & Keadaan Darurat</h2>
                <p className="muted" style={{ marginBottom: 20 }}>
                  Utamakan keselamatan fisik dan finansial Anda terlebih dahulu sebelum mengisi laporan mendalam.
                </p>

                <label className="field">
                  <span>Apakah saat ini ada ancaman fisik langsung atau bahaya keselamatan jiwa?</span>
                  <select value={threat ? 'yes' : 'no'} onChange={(e) => setThreat(e.target.value === 'yes')}>
                    <option value="no">Tidak / Keadaan fisik saya saat ini aman</option>
                    <option value="yes">Ya, saya merasa terancam secara fisik</option>
                  </select>
                </label>
                {threat && (
                  <div className="alert" style={{ borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                    <strong>Bahaya Langsung:</strong> Segera cari tempat aman dan hubungi <strong>110 (Polisi)</strong> atau <strong>112 (Darurat)</strong>.
                  </div>
                )}

                <label className="field">
                  <span>Apakah korban adalah perempuan atau anak-anak (terkait pelecehan / kekerasan siber)?</span>
                  <select value={minor ? 'yes' : 'no'} onChange={(e) => setMinor(e.target.value === 'yes')}>
                    <option value="no">Bukan / Tidak ingin menjawab</option>
                    <option value="yes">Ya, korban perempuan atau anak</option>
                  </select>
                </label>
                {minor && (
                  <div className="alert">
                    Layanan Sahabat Perempuan dan Anak (<strong>SAPA 129</strong>) siap memberikan pendampingan psikologis dan hukum bebas pulsa.
                  </div>
                )}

                <label className="field">
                  <span>Apakah transaksi uang atau transfer baru saja terjadi dalam 24 jam terakhir?</span>
                  <select value={recent ? 'yes' : 'no'} onChange={(e) => setRecent(e.target.value === 'yes')}>
                    <option value="no">Tidak / Sudah lewat lebih dari 24 jam</option>
                    <option value="yes">Ya, transfer baru terjadi beberapa jam lalu</option>
                  </select>
                </label>
                {recent && (
                  <div className="alert" style={{ borderColor: '#00E5FF', background: 'rgba(0, 229, 255, 0.08)' }}>
                    <strong>Waktu Kritis:</strong> Segera hubungi customer care bank Anda untuk meminta penahanan dana transaksi sebelum ditarik pelaku!
                  </div>
                )}
              </>
            )}

            {/* Step 1: Jenis Kejadian */}
            {step === 1 && (
              <>
                <h2 className="section-title">§01 · Apa yang terjadi pada Anda?</h2>
                <div className="field">
                  <label htmlFor="type-search">Cari jenis insiden</label>
                  <input
                    id="type-search"
                    placeholder="Contoh: phishing, penipuan transfer, whatsapp dibajak..."
                    onChange={(e) => {
                      const t = incidentTypes.find((x) => x.name.toLowerCase().includes(e.target.value.toLowerCase()));
                      if (t && e.target.value.length > 3) setTypeId(t.id);
                    }}
                  />
                </div>

                <div className="grid2" style={{ gap: 14 }}>
                  {incidentTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="card"
                      onClick={() => setTypeId(t.id)}
                      style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderColor: typeId === t.id ? '#00E5FF' : undefined,
                        background: typeId === t.id ? 'rgba(0, 229, 255, 0.12)' : undefined,
                        boxShadow: typeId === t.id ? '0 0 20px rgba(0, 229, 255, 0.25)' : undefined,
                      }}
                    >
                      <strong style={{ color: typeId === t.id ? '#00E5FF' : '#FFFFFF', fontSize: '1rem' }}>{t.name}</strong>
                      <div className="muted" style={{ fontSize: '0.84rem', marginTop: 6, lineHeight: 1.4 }}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Kronologi */}
            {step === 2 && (
              <>
                <h2 className="section-title">§02 · Ceritakan Jalannya Kejadian</h2>
                <label className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span>Waktu & Tanggal Pembuatan Laporan (Otomatis Sistem)</span>
                    <span className="tag ok" style={{ fontSize: '0.72rem' }}>
                      <CheckCircle2 size={11} style={{ display: 'inline', marginRight: 4 }} />
                      Stempel Waktu Otomatis
                    </span>
                  </div>
                  <input
                    type="text"
                    value={new Date(occurredAt).toLocaleString('id-ID', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                    readOnly
                    disabled
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderColor: 'rgba(0, 229, 255, 0.3)',
                      color: '#00E5FF',
                      cursor: 'not-allowed',
                      fontWeight: 600,
                    }}
                  />
                  <small className="muted" style={{ fontSize: '0.8rem', marginTop: 4, display: 'block' }}>
                    *Waktu pencatatan ditetapkan otomatis secara sistem saat pelaporan disusun demi validitas & keotentikan bukti forensik siber.
                  </small>
                </label>

                <label className="field">
                  <span>Platform atau aplikasi di mana pelaku menghubungi Anda</span>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    {[
                      'WhatsApp',
                      'Telegram',
                      'Instagram',
                      'Facebook',
                      'TikTok',
                      'Email',
                      'Situs web / Browser',
                      'Marketplace (Shopee/Tokopedia dll)',
                      'Aplikasi Bank / E-Wallet',
                      'SMS',
                      'Telepon Langsung',
                      'Lainnya',
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Apa pesan atau tindakan awal yang dilakukan oleh pelaku?</span>
                  <textarea
                    value={what}
                    onChange={(e) => setWhat(e.target.value)}
                    placeholder="Contoh: Mengaku sebagai kurir pengiriman paket, mengirim file undangan APK, meminta verifikasi data, dsb."
                  />
                </label>

                <label className="field">
                  <span>Apa yang Anda lakukan setelah menerima pesan tersebut?</span>
                  <textarea
                    value={didNext}
                    onChange={(e) => setDidNext(e.target.value)}
                    placeholder="Contoh: Saya mengeklik link tersebut, memasukkan data login, atau mentransfer uang muka."
                  />
                </label>

                <label className="field">
                  <span>Apa yang kemudian terjadi setelah tindakan tersebut?</span>
                  <textarea
                    value={after}
                    onChange={(e) => setAfter(e.target.value)}
                    placeholder="Contoh: Saldo berkurang tiba-tiba, akun WhatsApp keluar sendiri dan tidak bisa diakses, dsb."
                  />
                </label>

                <div className="label muted" style={{ marginTop: 12 }}>
                  {narrative.trim().length} karakter terisi · minimal 30 karakter untuk melanjutkan
                </div>
              </>
            )}

            {/* Step 3: Kerugian */}
            {step === 3 && (
              <>
                <h2 className="section-title">§03 · Kerugian Finansial</h2>
                <label className="field">
                  <span>Apakah Anda mengalami kerugian sejumlah uang?</span>
                  <select value={loss} onChange={(e) => setLoss(e.target.value)}>
                    <option value="yes">Ya, ada kerugian uang</option>
                    <option value="no">Tidak ada kerugian uang (Hanya akun/data)</option>
                  </select>
                </label>

                {loss === 'yes' && (
                  <>
                    <label className="field">
                      <span>Perkiraan Total Kerugian (Rupiah)</span>
                      <input
                        inputMode="numeric"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 5000000"
                      />
                    </label>

                    <label className="field">
                      <span>Metode Transaksi yang Digunakan</span>
                      <select value={method} onChange={(e) => setMethod(e.target.value)}>
                        {['Transfer bank', 'E-wallet (GoPay/OVO/Dana dll)', 'QRIS', 'Kartu Debit/Kredit', 'Pulsa', 'Kripto', 'Lainnya'].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Nama Bank / E-Wallet Asal Anda</span>
                      <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Contoh: Bank BCA / Mandiri / GoPay" />
                    </label>

                    <label className="field">
                      <span>Rekening / Nomor Tujuan Pelaku (Opsional)</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={suspect}
                          onChange={(e) => setSuspect(e.target.value)}
                          placeholder="Nomor rekening & nama penerima penipu"
                          type={revealed ? 'text' : 'password'}
                        />
                        <button className="btn ghost" type="button" onClick={() => setRevealed(!revealed)}>
                          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </label>
                  </>
                )}
              </>
            )}

            {/* Step 4: Tentang Pelaku */}
            {step === 4 && (
              <>
                <h2 className="section-title">§04 · Informasi Kontak Pelaku</h2>
                <p className="muted">Salin nomor telepon, username, atau link profil pelaku jika masih tersimpan.</p>

                <label className="field">
                  <span>Nomor WhatsApp, Username Medsos, atau URL Pelaku</span>
                  <input value={suspect} onChange={(e) => setSuspect(e.target.value)} placeholder="Contoh: +62 812-xxxx-xxxx / @akun_penipu" />
                </label>

                <label className="field">
                  <span>Catatan Khusus Pelaku (Opsional)</span>
                  <textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Ciri-ciri khusus foto profil, logat bahasa, dsb." />
                </label>
                <button className="btn ghost" type="button" onClick={() => setStep(5)}>
                  Saya Tidak Memiliki Info Pelaku / Lewati
                </button>
              </>
            )}

            {/* Step 5: Bukti */}
            {step === 5 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 className="section-title">§05 · Unggah Bukti Digital (Screenshot & Dokumen)</h2>
                    <p className="muted" style={{ margin: '4px 0 16px' }}>
                      Lampirkan tangkapan layar percakapan, bukti transfer m-banking, struk ATM, atau profil pelaku. Bukti dienkripsi aman di peramban Anda.
                    </p>
                  </div>
                  <span className="tag ok">
                    <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                    {evidenceFiles.length} Berkas Siap
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  style={{
                    border: `2px dashed ${isDragging ? '#00E5FF' : 'rgba(0, 229, 255, 0.3)'}`,
                    borderRadius: 14,
                    padding: '28px 20px',
                    textAlign: 'center',
                    background: isDragging ? 'rgba(0, 229, 255, 0.08)' : 'rgba(10, 20, 32, 0.5)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={() => {
                    const input = document.getElementById('evidence-file-input') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <input
                    id="evidence-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: 'rgba(0, 229, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#00E5FF',
                      }}
                    >
                      <UploadCloud size={26} />
                    </div>
                    <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.02rem' }}>
                      Tarik & Lepas Screenshot / Bukti Transfer ke Sini
                    </div>
                    <p className="muted" style={{ fontSize: '0.86rem', margin: 0 }}>
                      Atau <span style={{ color: '#00E5FF', textDecoration: 'underline' }}>klik untuk memilih berkas</span> dari galeri / komputer
                    </p>
                    <span className="label muted" style={{ fontSize: '0.74rem', marginTop: 4 }}>
                      FORMAT: JPG, PNG, WEBP, PDF · MAKSIMAL 5 MB PER BERKAS
                    </span>
                  </div>
                </div>

                {/* Uploaded Evidence Cards */}
                {evidenceFiles.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div className="label muted" style={{ marginBottom: 10 }}>
                      BERKAS BUKTI TERUNGGAH ({evidenceFiles.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {evidenceFiles.map((file) => (
                        <div
                          key={file.id}
                          className="card"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            gap: 12,
                            background: 'rgba(14, 25, 40, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                            {file.dataUrl && file.type.startsWith('image/') ? (
                              <div
                                style={{
                                  width: 54,
                                  height: 54,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  position: 'relative',
                                  cursor: 'pointer',
                                  border: '1px solid rgba(0, 229, 255, 0.4)',
                                }}
                                onClick={() => setPreviewModalImg({ url: file.dataUrl || '', name: file.name })}
                                title="Klik untuk memperbesar"
                              >
                                <img
                                  src={file.dataUrl}
                                  alt={file.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    background: 'rgba(0,0,0,0.6)',
                                    borderRadius: 4,
                                    padding: 2,
                                    color: '#FFFFFF',
                                    display: 'flex',
                                  }}
                                >
                                  <ZoomIn size={11} />
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: 54,
                                  height: 54,
                                  borderRadius: 8,
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: '#00E5FF',
                                }}
                              >
                                <FileText size={24} />
                              </div>
                            )}

                            <div style={{ minWidth: 0 }}>
                              <strong
                                style={{
                                  color: '#FFFFFF',
                                  fontSize: '0.9rem',
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {file.name}
                              </strong>
                              <span className="muted" style={{ fontSize: '0.78rem' }}>
                                {file.sizeKB} KB
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <select
                              value={file.category}
                              onChange={(e) =>
                                updateEvidenceCategory(file.id, e.target.value as UploadedEvidence['category'])
                              }
                              style={{
                                fontSize: '0.78rem',
                                padding: '5px 8px',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: 6,
                                color: '#00E5FF',
                              }}
                            >
                              <option value="TRANSFER">Bukti Transfer Bank/E-Wallet</option>
                              <option value="CHAT">Screenshot Chat Pelaku</option>
                              <option value="PROFILE">Profil / Nomor Pelaku</option>
                              <option value="DOCUMENT">Dokumen Pendukung</option>
                              <option value="LAINNYA">Bukti Lainnya</option>
                            </select>

                            {file.dataUrl && file.type.startsWith('image/') && (
                              <button
                                type="button"
                                className="btn ghost"
                                style={{ padding: 6 }}
                                onClick={() => setPreviewModalImg({ url: file.dataUrl || '', name: file.name })}
                                title="Lihat Foto"
                              >
                                <ZoomIn size={14} />
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn ghost"
                              style={{ padding: 6, color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                              onClick={() => removeEvidenceFile(file.id)}
                              title="Hapus berkas ini"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Manual Name fallback */}
                <div style={{ marginTop: 18 }}>
                  <label className="field">
                    <span>Catatan Berkas Tambahan (Jika Berkas di Perangkat Lain)</span>
                    <input
                      value={evidence}
                      onChange={(e) => setEvidence(e.target.value)}
                      placeholder="Contoh: Bukti fisik resi ATM tersimpan di dompet, rekaman panggilan di HP kedua"
                    />
                  </label>
                </div>

                <div className="alert" style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ShieldCheck size={18} style={{ color: '#10B981', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                      <strong>Kekuatan Hukum Bukti Digital (UU ITE Pasal 5):</strong>
                      <br />
                      Tangkapan layar percakapan chat dan bukti transfer bank adalah alat bukti elektronik yang sah di mata penyidik kepolisian. Pastikan nomor rekening, tanggal percakapan, dan nomor kontak terlihat jelas tanpa terpotong.
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Kontak Pelapor */}
            {step === 6 && (
              <>
                <h2 className="section-title">§06 · Data Kontak Pelapor</h2>
                <label className="field">
                  <span>Nama atau Kontak Anda (Email / Telepon)</span>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nama / email Anda" disabled={anonymous} />
                </label>

                <label style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                  <span>Kirim secara anonim (Tanpa nama & kontak)</span>
                </label>

                {anonymous && (
                  <div className="alert">
                    Jika anonim, petugas tidak dapat menghubungi Anda. Pastikan Anda menyimpan PIN pelacakan dengan aman.
                  </div>
                )}
              </>
            )}

            {/* Step 7: Tinjau & Kirim */}
            {step === 7 && (
              <>
                <h2 className="section-title">§07 · Tinjau Berkas Sebelum Disimpan</h2>
                <div className="grid2" style={{ gap: 20 }}>
                  <div className="panel" style={{ background: 'rgba(8, 14, 24, 0.6)' }}>
                    <div className="label muted">JENIS KEJADIAN</div>
                    <p style={{ fontWeight: 700, color: '#FFFFFF' }}>{selected?.name || 'Belum dipilih'}</p>

                    <div className="label muted">WAKTU PEMBUATAN LAPORAN</div>
                    <p style={{ color: '#00E5FF', fontWeight: 600 }}>
                      {new Date(occurredAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>

                    <div className="label muted">PLATFORM</div>
                    <p>{platform}</p>

                    <div className="label muted">KERUGIAN ESTIMASI</div>
                    <p>{loss === 'yes' ? `Rp ${Number(amount || 0).toLocaleString('id-ID')} (${method})` : 'Tidak ada kerugian finansial'}</p>

                    <div className="label muted">KONTAK</div>
                    <p>{anonymous ? 'Anonim' : contact || 'Belum diisi'}</p>
                  </div>

                  <div className="panel" style={{ background: 'rgba(8, 14, 24, 0.6)' }}>
                    <div className="tag" style={{ marginBottom: 12 }}>
                      <ShieldCheck size={14} /> TINGKAT URGENSI: {urgency.urgency}
                    </div>
                    <ul style={{ paddingLeft: 18, fontSize: '0.88rem', margin: '0 0 16px', color: '#94A3B8' }}>
                      {urgency.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>

                    <div className="label muted">SKOR KELENGKAPAN LAPORAN</div>
                    <div style={{ marginTop: 8 }}>
                      <Meter value={score.score} />
                    </div>
                  </div>
                </div>

                {/* Evidence Review Gallery */}
                <div className="panel" style={{ marginTop: 20, background: 'rgba(8, 14, 24, 0.6)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div className="label muted">BUKTI DIGITAL TERLAMPIR ({evidenceFiles.length})</div>
                    <button
                      type="button"
                      className="btn ghost"
                      style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                      onClick={() => setStep(5)}
                    >
                      + Tambah / Edit Bukti
                    </button>
                  </div>

                  {evidenceFiles.length === 0 && !evidence ? (
                    <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                      Belum ada berkas screenshot atau bukti yang diunggah. Anda dapat melanjutkannya sekarang atau melengkapi nanti via PIN lacak.
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      {evidenceFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 10,
                            padding: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          {file.dataUrl && file.type.startsWith('image/') ? (
                            <div
                              style={{
                                width: '100%',
                                height: 100,
                                borderRadius: 6,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                position: 'relative',
                              }}
                              onClick={() => setPreviewModalImg({ url: file.dataUrl || '', name: file.name })}
                              title="Klik untuk melihat foto"
                            >
                              <img
                                src={file.dataUrl}
                                alt={file.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: 'rgba(0,0,0,0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#FFFFFF',
                                }}
                              >
                                <ZoomIn size={18} />
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: 100,
                                borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00E5FF',
                              }}
                            >
                              <FileText size={32} />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#FFFFFF',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {file.name}
                            </div>
                            <span className="tag" style={{ fontSize: '0.7rem', marginTop: 4, display: 'inline-block' }}>
                              {file.category}
                            </span>
                          </div>
                        </div>
                      ))}
                      {evidence && (
                        <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                          <span className="label muted">CATATAN</span>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{evidence}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 20 }}>
                  <PrototypeNotice />
                </div>
              </>
            )}

            {/* Form Nav Buttons */}
            <div className="stephead" style={{ marginTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
              <button className="btn ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={16} /> Sebelumnya
              </button>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => {
                    setSaved(true);
                    try {
                      localStorage.setItem('lexora-draft', JSON.stringify({ typeId, what, didNext, after, occurredAt, step }));
                    } catch {}
                  }}
                >
                  <Save size={16} /> Simpan Draf
                </button>

                {step < 7 ? (
                  <button className="btn" type="button" onClick={next}>
                    Lanjut <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="btn" type="button" disabled={!canSend} onClick={submit}>
                    Kirim & Amankan Berkas <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>

            {saved && (
              <p className="success" role="status" style={{ marginTop: 14 }}>
                Draf formulir berhasil disimpan pada peramban perangkat ini.
              </p>
            )}
          </section>

          {/* Sticky Side Panel featuring Lexo Mascot */}
          <aside style={{ position: 'sticky', top: 90, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Mascot Law/Analysis Card */}
            <div
              className="panel"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-panel)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <Image
                  src="/mascot/cht-03-citation.webp"
                  alt="Lexo Asisten Hukum"
                  width={60}
                  height={60}
                  style={{ objectFit: 'contain' }}
                />
                <div>
                  <div className="label">ANALISIS LEXO</div>
                  <h4 style={{ margin: '2px 0 0', color: '#FFFFFF', fontSize: '1.05rem' }}>
                    {selected?.name || 'Menunggu pilihan...'}
                  </h4>
                </div>
              </div>

              <div className="label muted">KELENGKAPAN KASUS</div>
              <div style={{ marginTop: 6, marginBottom: 16 }}>
                <Meter value={score.score} />
              </div>

              <div className="label muted">TINGKAT URGENSI</div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="tag">{urgency.urgency}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 16 }}>
                <div className="label muted">MENGAPA DATA INI PENTING?</div>
                <p className="muted" style={{ fontSize: '0.85rem', margin: '6px 0 0', lineHeight: 1.5 }}>
                  Format laporan ini disusun agar sesuai dengan kebutuhan berkas laporan kepolisian (BAP Awal) dan bank penjamin transaksi.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for Screenshots */}
      {previewModalImg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0D1520',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ImageIcon size={16} style={{ color: '#00E5FF' }} />
                <strong style={{ color: '#FFFFFF', fontSize: '0.92rem' }}>{previewModalImg.name}</strong>
              </div>
              <button
                type="button"
                className="btn ghost"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                onClick={() => setPreviewModalImg(null)}
              >
                <X size={15} style={{ display: 'inline', marginRight: 4 }} /> Tutup
              </button>
            </div>
            <div style={{ padding: 16, overflow: 'auto', display: 'flex', justifyContent: 'center', background: '#070D14' }}>
              <img
                src={previewModalImg.url}
                alt={previewModalImg.name}
                style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
