# ⚖️ Lexora — Pendamping Hukum Siber Berbasis AI

> **Web Development Competition UINIC 8.0**  
> **Subtema**: AI & Teknologi Digital (Irisan Pendidikan & Literasi Publik)  
> **Keterkaitan SDGs**: SDG 16 (Perdamaian, Keadilan, dan Kelembagaan yang Tangguh), SDG 4 (Pendidikan Berkualitas), SDG 9 (Industri, Inovasi, dan Infrastruktur)

![Lexora Platform Banner](/mascot/gen-01-welcome.webp)

---

## 📌 1. Latar Belakang & Masalah

Di era transformasi digital Indonesia, kejahatan siber seperti **kebocoran data pribadi (data breach)**, **rekayasa sosial (phishing/social engineering)**, dan **penipuan transaksi online** meningkat secara eksponensial. Namun, masyarakat umum dan pelaku UMKM menghadapi jurang pemahaman yang signifikan:
1. **Ketidaktahuan Hak**: Korban tidak mengetahui hak hukumnya saat data pribadi bocor sesuai **UU No. 27 Tahun 2022 (UU PDP)**.
2. **Keterbatasan Pemahaman Regulasi**: UMKM kesulitan memahami kewajiban tata kelola perlindungan data dan kepatuhan sistem elektronik (**UU ITE No. 1 Tahun 2024** dan **PP No. 71 Tahun 2019**).
3. **Bahasa Regulasi Rumit**: Teks undang-undang sulit diterjemahkan menjadi aksi mitigasi nyata.
4. **Kebingungan Prosedur Lapor**: Korban penipuan digital tidak mengetahui kanal pelaporan resmi yang tepat dan sering terlambat bertindak pada *golden hour*.

---

## 💡 2. Solusi & Alur Nilai Lexora

Lexora menerjemahkan teks hukum yang kompleks menjadi instrumen praktis yang dapat langsung dieksekusi melalui paradigma:

$$\text{Masalah} \longrightarrow \text{Penjelasan} \longrightarrow \text{Checklist} \longrightarrow \text{Template} \longrightarrow \text{Tindakan}$$

---

## 🚀 3. Fitur Utama Platform

### 1. 🤖 AI Legal Assistant (`/asisten`)
- Asisten AI hukum siber berbasis **Retrieval-Augmented Generation (RAG)** dengan sitasi pasal otentik (UU PDP & UU ITE).
- Dilengkapi **Guardrail Hukum Siber** untuk mencegah halusinasi dan memastikan jawaban selalu relevan dengan hukum positif Indonesia.
- Fitur *“Terapkan ke Berkas Kasus”* untuk mentransfer saran AI ke kronologi laporan.

### 2. 📚 Direktori Regulasi Interaktif (`/regulations` & `/regulations/[id]`)
- Basis data perundang-undangan digital Indonesia terstruktur hingga tingkat bab, pasal, dan ayat.
- Dilengkapi ringkasan bahasa awam dan kategorisasi kasus (Privasi, Penipuan, Keamanan Sistem, Hak Korban).

### 3. ✅ Checklist Kepatuhan Bertahap (`/checklist` & `/checklist/[id]`)
- Panduan verifikasi kepatuhan sistematis untuk UMKM, audit perlindungan data, dan SOP penanganan insiden.
- Tersinkronisasi dengan pasal hukum terkait dan pelacakan progres interaktif.

### 4. 📄 Generator Dokumen Legal Resmi (`/dokumen` & `/dokumen/[id]`)
- Pembuat draf surat hukum otomatis:
  - **Surat Pemberitahuan Kegagalan PDP (Tenggat 3x24 Jam Pasal 46 UU PDP)**.
  - **Surat Permohonan Blokir Rekening Bank Penipu**.
  - **Draf Laporan Polisi & BSSN**.
- Menggunakan formulir dinamis berbasis skema JSON dan siap cetak/tanda tangan (format PDF-ready).

### 5. 🚨 Tanggap Insiden Siber & Countdown 72 Jam (`/insiden` & `/insiden/[id]`)
- Manajemen siklus hidup insiden siber secara *end-to-end*.
- **Timer Countdown 3x24 Jam** otomatis untuk memenuhi kewajiban Pasal 46 UU PDP.
- Lini masa audit forensik (*Audit Trail*) dan sistem pengingat otomatis (*Scheduled Reminders* pada 50% & 75% batas waktu).

### 6. 🎓 Kampus Edukasi & Kuis Interaktif (`/education` & `/education/[id]`)
- Modul literasi siber ringkas 5 menit untuk pencegahan bahaya kejahatan digital (APK palsu, phishing, doxing).
- Kuis pemahaman berbobot nilai dengan validasi jawaban langsung di backend.

### 7. 🛡️ Pelaporan Warga & Pelacakan Kasus (`/lapor` & `/lacak`)
- Wizard formulir triage laporan darurat warga dengan kalkulasi otomatis tingkat keparahan (*KRITIS, TINGGI, SEDANG, RENDAH*).
- **Arsitektur Privasi Hibrida**: Laporan otomatis tersimpan di database backend PostgreSQL, sekaligus menyediakan opsi pelacakan lokal berbasis **Case ID + PIN 6 digit** untuk menjaga privasi korban anonim.

### 8. 🛠️ Cyber Toolkit Mandiri (`/toolkit`)
- **Pemeriksa Tautan Phishing**: Analisis URL mencurigakan, homoglyph attack, dan domain tidak aman.
- **Uji Ketahanan Kata Sandi**: Kalkulator entropi sandi dan estimasi waktu retas (*brute-force*).
- **Generator Sandi Kriptografis**: Penghasil kata sandi acak berbasis `crypto.getRandomValues`.

### 9. 🏛️ Direktori Lembaga Berwenang (`/kanal`)
- Urutan prioritas penanganan dan rujukan langsung ke portal resmi: Patroli Siber Polri, Komdigi (Aduan Konten), BSSN, OJK/IASC, dan SAPA 129.

### 10. 📊 Panel Dashboard & Admin (`/dashboard`, `/admin`, `/admin/cases`, `/admin/regulations`, `/admin/templates`, `/profil`)
- Agregasi analitik kasus, pemenuhan checklist, dan dokumen terbit.
- Antrean verifikasi kasus bagi peran `ADMIN` dan `LEGAL_REVIEWER` dengan log aktivitas sistem real-time.

---

## 🛠️ 4. Arsitektur Teknologi

```mermaid
graph TD
    Client["Frontend (Next.js 16 + React 19 + Vanilla CSS)"]
    API["REST API Layer (/api/v1/*)"]
    Auth["Auth Layer (NextAuth + Session Cookie RBAC)"]
    Service["Business Logic Modules (src/modules/*)"]
    RAG["RAG & Embeddings Engine"]
    Prisma["Prisma ORM"]
    DB[("PostgreSQL 16 + pgvector")]

    Client -->|HTTP / JSON| API
    Client -->|Cookie Sesi| Auth
    API --> Service
    Service --> RAG
    Service --> Prisma
    Prisma --> DB
```

| Lapisan | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) | *Server-Side Rendering* & *Client Components* teroptimasi |
| **Bahasa** | TypeScript 5 | Tipisasi statis ketat di seluruh frontend dan backend |
| **Styling** | Vanilla Modern CSS | Dark Cyberpunk-Legal, palet HSL harmonis, Glassmorphism, tanpa dependensi Tailwind |
| **Database** | PostgreSQL 16 + pgvector | Penyimpanan relasional dan pencarian vektor embedding |
| **ORM** | Prisma ORM | Model data, migrasi skema, dan repositori terstruktur |
| **Validasi** | Zod | Skema validasi input *runtime* pada seluruh *endpoint* API |
| **Identitas Maskot** | Lexo (Aman, Lugas, Tanggap) | 20+ varian pose WebP sesuai standar *Mascot Guidelines* |

---

## ⚙️ 5. Menjalankan Proyek Secara Lokal

### Prasyarat
- **Node.js** >= 18.18.0
- **Docker** & **Docker Compose** (untuk menjalankan PostgreSQL)
- **npm** atau **pnpm**

### Langkah Instalasi

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd lexora/lexora
   ```

2. **Install Dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Salin file konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   Pastikan variabel database dan auth terkonfigurasi:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lexora?schema=public"
   AUTH_SECRET="lexora-super-secret-key-32-chars-minimum"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Jalankan Database PostgreSQL (Docker)**:
   ```bash
   docker run -d --name lexora-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=lexora \
     -p 5432:5432 \
     pgvector/pgvector:pg16
   ```

5. **Jalankan Migrasi Database & Seeding**:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

6. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```

7. Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 👥 6. Akun Bawaan untuk Pengujian

Database telah dilengkapi dengan akun bawaan untuk pengujian peran (*Role-Based Access Control*):

| Peran (*Role*) | Email | Kata Sandi | Hak Akses |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@lexora.id` | `Lexora123!` | Akses penuh ke seluruh panel admin, metrik, antrean kasus, dan manajemen regulasi |
| **LEGAL_REVIEWER** | `reviewer@lexora.id` | `Lexora123!` | Verifikasi konten dokumen hukum, penelaahan laporan, dan modul edukasi |
| **USER (Warga/UMKM)** | Buat via `/register` atau login langsung | Bebas | Pelaporan insiden, checklist kepatuhan, tanya jawab AI, dan modul kuis |

---

## 📁 7. Struktur Direktori Proyek

```text
lexora/
├── app/                      # Next.js App Router (Halaman & Rute API)
│   ├── api/v1/               # Endpoint REST API v1
│   │   ├── analytics/        # Endpoint analitik ringkasan & log aktivitas
│   │   ├── chat/             # Endpoint asisten AI RAG
│   │   ├── checklists/       # Endpoint template & item kepatuhan
│   │   ├── courses/          # Endpoint materi kursus & kuis
│   │   ├── incidents/        # Endpoint pelaporan & mitigasi insiden
│   │   ├── regulations/      # Endpoint direktori regulasi & pasal
│   │   ├── templates/        # Endpoint generator draf dokumen
│   │   └── users/            # Endpoint profil & manajemen user
│   ├── admin/                # Panel administrasi & antrean kasus
│   ├── asisten/              # Antarmuka chat AI Legal Lexo
│   ├── checklist/            # Antarmuka panduan kepatuhan bertahap
│   ├── dashboard/            # Dashboard pengguna terotentikasi
│   ├── dokumen/              # Generator draf surat resmi
│   ├── education/            # Kelas edukasi literasi & kuis
│   ├── insiden/              # Tanggap darurat insiden siber & countdown
│   ├── kanal/                # Direktori lembaga resmi pemerintah
│   ├── lacak/                # Pelacakan status berkas laporan
│   ├── lapor/                # Wizard formulir pelaporan warga
│   ├── profil/               # Informasi akun & pengaturan privasi
│   ├── regulations/          # Direktori perundang-undangan digital
│   └── toolkit/              # Alat mandiri penguji tautan & sandi
├── components/               # Komponen UI Reusable & Section Pages
├── data/                     # Konfigurasi kanal instansi resmi (channels.ts)
├── lib/                      # Utilitas aplikasi (api-client, auth, db, triage)
├── prisma/                   # Skema Prisma & berkas seeding data hukum
├── public/                   # Aset statis (maskot Lexo, logo glow, infografis)
├── src/modules/              # Domain logic terisolasi per fitur (Clean Architecture)
└── store/                    # Zustand store untuk sesi & laporan lokal
```

---

## 🏆 8. Komitmen Kualitas & Standar Kompetisi

- **Akurasi Hukum**: Seluruh rujukan hukum bersumber langsung dari naskah resmi lembaran negara Republik Indonesia.
- **Transparansi Sumber**: Setiap jawaban kecerdasan buatan menyertakan nomor pasal dan undang-undang rujukan.
- **Zero Dummy Data**: Seluruh data yang ditampilkan di halaman utama terhubung langsung ke entitas database PostgreSQL.
- **Responsif & Aksesibel**: Antarmuka dirancang ramah di seluruh ukuran layar (ponsel pintar, tablet, dan desktop).

---

## 📄 9. Lisensi & Hak Cipta

Dikembangkan oleh **Tim Lexora** untuk **Web Development Competition UINIC 8.0**. Hak cipta dilindungi undang-undang.
