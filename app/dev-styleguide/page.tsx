import Image from 'next/image';

export default function Page() {
  return (
    <div className="container section">
      <div className="label">LEXORA BRAND & DESIGN SYSTEM</div>
      <h1 className="section-title">Palet Warna & Identitas Merek</h1>

      {/* Mascot & Logo Showcase */}
      <div className="panel" style={{ marginBottom: 32 }}>
        <h2 style={{ color: '#FFFFFF', margin: '0 0 16px' }}>Aset Identitas Resmi</h2>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <Image src="/logo/logo-glow.png" alt="Logo 3D" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Logo 3D Cyan Glow</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/mascot/mascot-wave.png" alt="Mascot Wave" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Lexo: Greeting</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/mascot/mascot-law.png" alt="Mascot Law" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Lexo: Legal Analysis</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/mascot/mascot-shield.png" alt="Mascot Shield" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Lexo: Shield Protection</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/mascot/mascot-book.png" alt="Mascot Book" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Lexo: Education/Book</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Image src="/mascot/mascot-peace.png" alt="Mascot Peace" width={80} height={80} />
            <div className="label" style={{ marginTop: 8 }}>Lexo: Peace / Success</div>
          </div>
        </div>
      </div>

      <div className="grid4">
        <div className="card">
          <div style={{ height: 64, background: '#070B12', borderRadius: 6, marginBottom: 8 }} />
          <strong>Cyber 950</strong>
          <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>#070B12 (Deep Space)</span>
        </div>
        <div className="card">
          <div style={{ height: 64, background: '#00E5FF', borderRadius: 6, marginBottom: 8, boxShadow: '0 0 16px rgba(0,229,255,0.6)' }} />
          <strong style={{ color: '#00E5FF' }}>Electric Cyan Glow</strong>
          <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>#00E5FF (Brand Primary)</span>
        </div>
        <div className="card">
          <div style={{ height: 64, background: '#2D6175', borderRadius: 6, marginBottom: 8 }} />
          <strong>Mascot Steel Teal</strong>
          <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>#2D6175 (Lexo Body)</span>
        </div>
        <div className="card">
          <div style={{ height: 64, background: '#EF4444', borderRadius: 6, marginBottom: 8 }} />
          <strong style={{ color: '#EF4444' }}>Danger Action</strong>
          <span className="muted" style={{ fontSize: '0.8rem', display: 'block' }}>#EF4444 (Emergency)</span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: 36 }}>Komponen UI</h2>
      <div className="grid3">
        <div className="card">
          <span className="tag">GLASSMORPHISM</span>
          <h3 style={{ margin: '8px 0', color: '#FFFFFF' }}>Cyber Panel Card</h3>
          <p className="muted">Kartu dengan efek blur modern, border cyan halus, dan elevasi bayangan.</p>
        </div>

        <div className="card">
          <span className="tag">INDIKATOR</span>
          <h3 style={{ margin: '8px 0', color: '#FFFFFF' }}>Segmented Glow Meter</h3>
          <div className="meter" style={{ marginTop: 12 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={i < 7 ? 'on' : ''} />
            ))}
          </div>
          <div className="label" style={{ marginTop: 8 }}>70% SELESAI</div>
        </div>

        <div className="card">
          <span className="tag">AKSI</span>
          <h3 style={{ margin: '8px 0', color: '#FFFFFF' }}>Tombol & Interaksi</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button className="btn">Primary</button>
            <button className="btn secondary">Secondary</button>
            <button className="btn ghost">Ghost</button>
          </div>
        </div>
      </div>
    </div>
  );
}
