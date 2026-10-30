'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { PageHead, PrototypeNotice } from '@/components/ui';
import { useCases } from '@/store/cases';

export default function Lacak() {
  const params = useSearchParams();
  const cases = useCases((s) => s.cases);
  const update = useCases((s) => s.updateCase);
  const timeline = useCases((s) => s.addTimeline);
  const [id, setId] = useState(params.get('id') || '');
  const [pin, setPin] = useState('');
  const [found, setFound] = useState<typeof cases[number] | null>(null);
  const [error, setError] = useState('');
  const [tries, setTries] = useState(0);
  const [show, setShow] = useState(false);
  const [reply, setReply] = useState('');

  function search() {
    if (tries >= 5) {
      setError('Terlalu banyak percobaan. Harap tunggu beberapa saat.');
      return;
    }
    const c = cases.find((x) => x.id.toUpperCase() === id.toUpperCase() && x.pin === pin);
    if (!c) {
      setTries((t) => t + 1);
      setError(tries >= 4 ? 'Terlalu banyak percobaan salah. Tunggu 30 detik.' : 'Case ID atau PIN tidak cocok.');
      setFound(null);
      return;
    }
    setFound(c);
    setError('');
  }

  return (
    <>
      <PageHead
        eyebrow="PELACAKAN KASUS & BUKTI"
        title="Lacak Perkembangan Laporanmu."
        desc="Masukkan Case ID dan PIN 6 digit yang Anda dapatkan saat pertama kali menyelesaikan pendaftaran laporan."
      />

      <div className="container section">
        <div className="grid2" style={{ alignItems: 'start', gap: 28 }}>
          {/* Search Card */}
          <div className="panel" style={{ padding: 28 }}>
            <div className="label">§01 · OTENTIKASI AMAN</div>
            <h3 style={{ fontSize: '1.25rem', margin: '6px 0 16px', color: '#FFFFFF' }}>Verifikasi Akses Laporan</h3>

            <label className="field">
              <span>Case ID</span>
              <input
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                placeholder="Contoh: LXR-2026-000142"
                autoComplete="off"
              />
            </label>

            <label className="field">
              <span>PIN Rahasia (6 Digit)</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Contoh: 482913"
                  type={show ? 'text' : 'password'}
                  inputMode="numeric"
                />
                <button className="btn ghost" type="button" onClick={() => setShow(!show)} aria-label={show ? 'Sensor PIN' : 'Tampilkan PIN'}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button className="btn" onClick={search} style={{ marginTop: 10, width: '100%' }}>
              <Search size={16} /> Lacak Status Kasus
            </button>

            {error && (
              <p role="alert" className="alert" style={{ marginTop: 16, borderColor: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                {error}
              </p>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem' }} className="muted">
              Belum memiliki Case ID? Daftarkan laporan baru melalui formulir <Link href="/lapor" style={{ color: '#00E5FF' }}>Mulai Lapor</Link>.
            </div>
          </div>

          {/* Privacy Note with Mascot */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Image src="/mascot/inc-02-shield.webp" alt="Lexo Pelindung" width={62} height={62} style={{ objectFit: 'contain' }} />
              <div>
                <h3 style={{ margin: 0, color: '#FFFFFF', fontSize: '1.2rem' }}>Privasi Anda Dijamin Aman</h3>
                <span className="label muted">ENKRIPSI DATA LOKAL</span>
              </div>
            </div>
            <p className="muted" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.6 }}>
              Untuk melindungi korban, data sensitif disamarkan secara otomatis di perangkat. Jangan membagikan kombinasi Case ID dan PIN Anda kepada orang yang tidak dikenal.
            </p>
            <PrototypeNotice />
          </div>
        </div>

        {/* Found Case Result */}
        {found && (
          <div className="section" style={{ borderBottom: 0, paddingTop: 40 }}>
            <div className="stephead">
              <div>
                <div className="label">HASIL PELACAKAN KASUS</div>
                <h2 style={{ fontFamily: 'var(--font-mono)', color: '#00E5FF', margin: '4px 0 0' }}>{found.id}</h2>
              </div>
              <span className="tag" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                {found.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid2" style={{ gap: 24, marginTop: 18 }}>
              {/* Left Column: Timeline & Progress */}
              <div className="panel">
                <h3 style={{ color: '#FFFFFF', margin: '0 0 4px' }}>{found.typeName}</h3>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 16 }}>
                  Didaftarkan: {new Date(found.createdAt).toLocaleString('id-ID')}
                </p>

                <div className="label muted" style={{ marginBottom: 8 }}>
                  STATUS PENANGANAN
                </div>
                <div className="meter" style={{ marginBottom: 12 }}>
                  {['DITERIMA', 'DITINJAU', 'SIAP_LAPOR', 'DILAPORKAN', 'DITUTUP'].map((s) => (
                    <span
                      key={s}
                      className={['DITERIMA', 'DITINJAU', 'SIAP_LAPOR', 'DILAPORKAN', 'DITUTUP'].indexOf(found.status) >= ['DITERIMA', 'DITINJAU', 'SIAP_LAPOR', 'DILAPORKAN', 'DITUTUP'].indexOf(s) ? 'on' : ''}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(0.66rem, 1.8vw, 0.75rem)', color: '#94A3B8', gap: 2 }}>
                  {['Diterima', 'Ditinjau', 'Siap Lapor', 'Dilaporkan', 'Selesai'].map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>

                <h4 style={{ margin: '24px 0 10px', color: '#FFFFFF' }}>Linimasa Aktivitas</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {found.timeline.map((t, i) => (
                    <div key={i} className="listrow" style={{ padding: '8px 0' }}>
                      <div>
                        <strong style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>{t.text}</strong>
                        <div className="muted" style={{ fontSize: '0.78rem' }}>
                          Oleh: {t.actor} · {new Date(t.at).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Actions & Communication */}
              <div className="panel">
                <h3 style={{ margin: '0 0 12px', color: '#FFFFFF' }}>Pesan & Permintaan Bukti</h3>
                {found.messages.length ? (
                  found.messages.map((m, i) => (
                    <div key={i} className="alert" style={{ marginBottom: 10 }}>
                      <strong style={{ display: 'block', marginBottom: 2 }}>{m.from === 'PENINJAU' ? 'Dari Petugas:' : 'Dari Anda:'}</strong>
                      {m.text}
                    </div>
                  ))
                ) : (
                  <p className="muted" style={{ fontSize: '0.9rem' }}>Belum ada pesan tambahan dari peninjau berkas.</p>
                )}

                <label className="field" style={{ marginTop: 16 }}>
                  <span>Balas atau lengkapi bukti tambahan</span>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Tuliskan informasi atau bukti baru di sini..."
                  />
                </label>

                <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                  <button
                    className="btn"
                    disabled={!reply.trim()}
                    onClick={() => {
                      update(found.id, {
                        status: 'DITINJAU',
                        messages: [...found.messages, { text: reply, from: 'KORBAN', at: new Date().toISOString() }],
                      });
                      timeline(found.id, 'Korban menambahkan informasi melalui pelacakan.');
                      setFound({
                        ...found,
                        status: 'DITINJAU',
                        messages: [...found.messages, { text: reply, from: 'KORBAN', at: new Date().toISOString() }],
                      });
                      setReply('');
                    }}
                  >
                    Kirim Pembaruan <ArrowRight size={15} />
                  </button>

                  <Link className="btn ghost" href={`/insiden/${found.id}`}>
                    Buka Berkas Lengkap
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
