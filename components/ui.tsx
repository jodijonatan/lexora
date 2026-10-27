import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export function PageHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="pagehead">
      <div className="container">
        <div className="label">
          <Sparkles size={13} style={{ display: 'inline', marginRight: 4 }} />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        {desc && <p className="muted" style={{ maxWidth: 720, margin: 0, fontSize: '1.05rem' }}>{desc}</p>}
      </div>
    </div>
  );
}

export function Meter({ value = 0 }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div>
      <div
        className="meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-label={`Kelengkapan ${rounded}%`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={i < Math.round(value / 10) ? 'on' : ''} />
        ))}
      </div>
      <div className="label" style={{ marginTop: 8, fontSize: '0.75rem' }}>
        {rounded}% kelengkapan
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
  href,
  eyebrow,
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  eyebrow?: string;
}) {
  const content = (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {eyebrow && <div className="label muted" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '6px 0 10px', color: '#FFFFFF' }}>{title}</h3>
      <div className="muted" style={{ flex: 1, fontSize: '0.92rem' }}>{children}</div>
      {href && (
        <div style={{ marginTop: 18, color: '#00E5FF', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          Buka <ArrowRight size={15} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} style={{ display: 'block', height: '100%' }}>{content}</Link> : content;
}

export function PrototypeNotice() {
  return (
    <div className="alert" role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <ShieldAlert size={20} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong style={{ color: '#FFFFFF' }}>Prototipe — Laporan ini tidak benar-benar dikirim ke pihak berwenang.</strong>
        <div style={{ marginTop: 3, opacity: 0.9 }}>Data hanya tersimpan lokal pada peramban perangkat ini untuk demonstrasi.</div>
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Belum ada data',
  desc = 'Data demo akan muncul di sini.',
}: {
  title?: string;
  desc?: string;
}) {
  return (
    <div className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <Image
          src="/mascot/err-01-searching.webp"
          alt="Mascot Lexo Searching"
          width={90}
          height={90}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <h3 style={{ fontSize: '1.3rem', margin: '0 0 8px', color: '#FFFFFF' }}>{title}</h3>
      <p className="muted" style={{ margin: 0, maxWidth: 450, marginInline: 'auto' }}>{desc}</p>
    </div>
  );
}
