'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Save, Eye, EyeOff, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { incidentTypes } from '@/data/channels';
import { useCases, CaseRecord } from '@/store/cases';
import { triage, completeness } from '@/lib/triage';
import { PageHead, Meter, PrototypeNotice } from '@/components/ui';
import { api } from '@/lib/api-client';
import { createCaseId, generateSecurePin } from '@/lib/case-id';

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
  const [occurredAt, setOccurredAt] = useState('');
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
          setOccurredAt(v.occurredAt || '');
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
        evidence,
        contact: anonymous ? 'anonim' : contact,
      }),
    [typeId, occurredAt, narrative, platform, loss, amount, suspect, evidence, contact, anonymous]
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
      evidence: evidence ? [{ name: evidence, sizeKB: 0 }] : [],
      messages: [],
    };
    addCase(c);
    setSubmitted(c);

    // Sinkronisasi otomatis ke backend database jika pengguna memiliki sesi/akses
    api.createIncident({
      incidentTypeId: typeId === 'breach' ? 'cmvq5nh5j0006qqi0pid705sp' : 'cmvq5nh5p0007qqi0mvdf9s5e',
      title: `${selected?.name || 'Laporan Kejadian Siber'} (${platform || 'Online'})`,
      description: narrative + (contact && !anonymous ? ` | Pelapor: ${contact}` : '') + (amount ? ` | Estimasi Kerugian: Rp ${Number(amount).toLocaleString('id-ID')}` : ''),
      severity: (urgency.urgency as string) === 'KRITIS' ? 'CRITICAL' : (urgency.urgency as string) === 'TINGGI' ? 'HIGH' : 'MEDIUM',
    }).catch((err) => {
      // Pelaporan warga tetap aman tersimpan secara lokal via PIN pelacakan jika belum login
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
          ) : (
            <p>Data tersimpan. Silakan buka halaman pelacakan dengan Case ID Anda.</p>
          )}
        </div>
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
                  <span>Kapan insiden ini terjadi? (Boleh perkiraan waktu)</span>
                  <input type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
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
                <h2 className="section-title">§05 · Inventarisasi Bukti Digital</h2>
                <p className="muted">Di versi prototipe ini, file tidak diunggah ke internet demi privasi Anda. Anda cukup mencatat nama berkasnya.</p>

                <label className="field">
                  <span>Nama Berkas Bukti Utama</span>
                  <input value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="contoh: screenshot-chat-bukti-transfer.png" />
                </label>

                <div className="alert" style={{ marginTop: 14 }}>
                  <strong>Tips Penting:</strong> Jangan hapus pesan atau ekspor percakapan WhatsApp pelaku. Tangkapan layar dengan tanggal dan nomor telepon jelas adalah alat bukti sah menurut UU ITE.
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
    </>
  );
}
