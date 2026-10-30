import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteShell } from '@/components/site-shell';
import { AuthProvider } from '@/components/auth-provider';

export const viewport: Viewport = {
  themeColor: '#070B12',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Lexora — Pendamping Hukum Siber Berbasis AI',
    template: '%s · Lexora',
  },
  description:
    'Platform edukasi dan pendampingan hukum siber cerdas. Mengubah bahasa regulasi UU PDP & UU ITE menjadi checklist praktis, draf surat resmi, dan panduan tanggap insiden untuk masyarakat dan UMKM.',
  keywords: [
    'hukum siber', 'UU PDP', 'UU ITE', 'kebocoran data', 'penipuan online',
    'checklist kepatuhan', 'AI legal', 'pelindungan data', 'UMKM', 'regulasi Indonesia',
  ],
  authors: [{ name: 'Tim Lexora · UINIC 8.0' }],
  creator: 'Tim Lexora',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Lexora',
    title: 'Lexora — Pendamping Hukum Siber Berbasis AI',
    description: 'Platform edukasi hukum siber: AI Legal Assistant, Database Regulasi, Checklist Kepatuhan, dan Template Dokumen resmi untuk masyarakat & UMKM Indonesia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexora — Pendamping Hukum Siber Berbasis AI',
    description: 'Ubah bahasa hukum rumit menjadi langkah aksi nyata dengan Lexora.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a className="skip" href="#main">Lewati ke konten utama</a>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
      </body>
    </html>
  );
}
