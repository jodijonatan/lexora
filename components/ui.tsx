import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldAlert } from 'lucide-react';

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
        <div className="label" style={{ marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h1>{title}</h1>
        {desc && (
          <p className="muted" style={{ maxWidth: 680, margin: 0, fontSize: '0.98rem', lineHeight: 1.6 }}>
            {desc}
          </p>
        )}
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
      <div className="label muted" style={{ marginTop: 6, fontSize: '0.72rem' }}>
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
      {eyebrow && <div className="label muted" style={{ marginBottom: 6, fontSize: '0.68rem' }}>{eyebrow}</div>}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 8px', color: '#F8FAFC' }}>{title}</h3>
      <div className="muted" style={{ flex: 1, fontSize: '0.88rem', lineHeight: 1.6 }}>{children}</div>
      {href && (
        <div style={{ marginTop: 16, color: '#00E5FF', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          Buka modul <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} style={{ display: 'block', height: '100%' }}>{content}</Link> : content;
}

export function PrototypeNotice() {
  return (
    <div className="alert" role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <ShieldAlert size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
        <strong style={{ color: '#F8FAFC' }}>Mode Simulasi & Edukasi</strong>
        <div style={{ marginTop: 2, color: '#CBD5E1' }}>
          Data laporan ini disimpan secara lokal di peramban perangkat Anda untuk tujuan demonstrasi dan penyusunan draf resmi.
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Belum ada data',
  desc = 'Data akan muncul di sini setelah Anda memulai.',
  action,
}: {
  title?: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel" style={{ textAlign: 'center', padding: '44px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <Image
          src="/mascot/err-01-searching.webp"
          alt="Mascot Lexo Searching"
          width={76}
          height={76}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <h3 style={{ fontSize: '1.2rem', margin: '0 0 6px', color: '#F8FAFC', fontWeight: 600 }}>{title}</h3>
      <p className="muted" style={{ margin: 0, maxWidth: 420, marginInline: 'auto', fontSize: '0.88rem', lineHeight: 1.6 }}>
        {desc}
      </p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'danger' | 'ok';
}) {
  return <span className={`tag ${variant !== 'default' ? variant : ''}`}>{children}</span>;
}
