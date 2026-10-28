# Panduan Setup Database Production — Lexora

> **Dokumen Panduan Teknis**  
> **Target Lingkungan:** Production (Staging & Live)  
> **Stack Database:** PostgreSQL 15+ dengan ekstensi `pgvector` & Prisma ORM 7 (`@prisma/adapter-pg`)  
> **Terakhir Diperbarui:** 28 Oktober 2026  

---

## 1. Arsitektur & Kebutuhan Database

Lexora menggunakan fitur pencarian semantik (vektor) untuk modul AI Legal Assistant & Regulasi Hukum Siber. Oleh karena itu, PostgreSQL di production **wajib mendukung ekstensi `pgvector`**.

| Komponen | Spesifikasi / Kebutuhan |
|---|---|
| **Engine** | PostgreSQL 15, 16, atau 17 |
| **Ekstensi Wajib** | `vector` (`pgvector`) |
| **Connection Pooling** | Wajib untuk lingkungan serverless (Vercel / AWS Lambda) |
| **Driver Adapter** | `@prisma/adapter-pg` via connection pool `pg.Pool` |
| **SSL Mode** | `sslmode=require` (TLS 1.2+) |

---

## 2. Pilihan Penyedia Database (DBaaS)

### Opsi 1: Neon Serverless Postgres (Sangat Direkomendasikan)
Neon ideal untuk Next.js di Vercel karena menyediakan koneksi pooled bawaan dan mendukung `pgvector` secara langsung.
1. Buat project baru di [Neon Console](https://console.neon.tech).
2. Pilih region terdekat (misal: `ap-southeast-1` Singapura).
3. Salin dua connection string dari dashboard:
   - **Pooled connection string** (gunakan untuk `DATABASE_URL`)
   - **Direct connection string** (gunakan untuk `DIRECT_URL`)

### Opsi 2: Supabase
1. Buat project baru di [Supabase Dashboard](https://supabase.com).
2. Pergi ke **Project Settings** → **Database** → **Connection String**.
3. Gunakan:
   - Mode **Transaction** (port 6543) untuk `DATABASE_URL`
   - Mode **Session** / Direct (port 5432) untuk `DIRECT_URL`

### Opsi 3: Self-Hosted Docker / VPS
Jika mengelola server sendiri (Ubuntu/Debian), gunakan image resmi `pgvector`:
```bash
docker run -d \
  --name lexora-postgres \
  -e POSTGRES_USER=lexora_admin \
  -e POSTGRES_PASSWORD=GantiDenganPasswordSuperKuat123! \
  -e POSTGRES_DB=lexora \
  -p 5432:5432 \
  -v lexora_pgdata:/var/lib/postgresql/data \
  --restart always \
  pgvector/pgvector:pg16
```

---

## 3. Langkah 1: Aktivasi Ekstensi `pgvector`

Sebelum menjalankan skema Prisma, ekstensi `vector` harus diaktifkan di database PostgreSQL Anda.

Buka SQL Editor (di dashboard Neon, Supabase, atau psql) dan jalankan:

```sql
-- Aktifkan ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verifikasi instalasi ekstensi
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

Jika output menampilkan baris `vector` beserta versinya (misal `0.7.0` atau lebih tinggi), ekstensi telah aktif.

---

## 4. Langkah 2: Konfigurasi Environment Variables

Buka file konfigurasi environment production (di Vercel Environment Variables, Coolify, atau `.env.production`):

```bash
# 1. DATABASE_URL (Koneksi pooler untuk query aplikasi)
DATABASE_URL="postgresql://user:strong_password@ep-sample-pooler.ap-southeast-1.aws.neon.tech/lexora?sslmode=require&pgbouncer=true"

# 2. DIRECT_URL (Koneksi langsung tanpa pooler untuk migrasi Prisma)
DIRECT_URL="postgresql://user:strong_password@ep-sample.ap-southeast-1.aws.neon.tech/lexora?sslmode=require"

# 3. Mode Lingkungan
NODE_ENV="production"
```

> **Penting Mengenai SSL:**
> Pada database cloud (Neon/Supabase/RDS), selalu sertakan query parameter `?sslmode=require` pada URL agar koneksi terenkripsi penuh.

---

## 5. Langkah 3: Deploy Skema Database

Untuk menerapkan seluruh tabel, enum, relasi, dan indeks ke production, pilih salah satu alur berikut:

### Jalur A: Menggunakan `prisma db push` (Paling Cepat & Bersih untuk Database Baru)
Jika membuat database baru dari nol:

```bash
# Generate Prisma Client lokal
npx prisma generate

# Sinkronkan skema langsung ke production database
npx prisma db push
```

### Jalur B: Menggunakan Migration Pipeline (`prisma migrate deploy`)
Jika tim Anda menggunakan alur deployment terkontrol berbasis file migrasi:

1. **Di lingkungan lokal (sekali saja saat awal):**
   ```bash
   npx prisma migrate dev --name init_production_schema
   ```
2. **Di pipeline CI/CD / Production:**
   ```bash
   npx prisma migrate deploy
   ```

> ⚠️ **PERINGATAN KERAS:**  
> **JANGAN PERNAH** menjalankan `npx prisma migrate dev` di database production! Perintah tersebut berpotensi mereset database dan menghapus seluruh data pengguna jika mendeteksi schema drift. Selalu gunakan `npx prisma migrate deploy` atau `npx prisma db push`.

---

## 6. Langkah 4: Seeding Data Awal (Regulasi, Insiden, Kursus & Admin)

Lexora membutuhkan data master agar fitur direktori regulasi, edukasi, checklist kepatuhan, dan jenis insiden langsung berfungsi.

Script seeding [`prisma/seed.ts`](file:///home/jodijonatan/projects/competitions/lexora/lexora/prisma/seed.ts) telah dirancang **idempotent** (menggunakan `upsert`), sehingga aman dijalankan tanpa menduplikasi data.

### Jalankan Seed:
```bash
npm run db:seed
```
*(atau langsung: `npx tsx prisma/seed.ts`)*

Data yang otomatis diinjeksi meliputi:
- **Akun Utama:**
  - `admin@lexora.id` (Role: `ADMIN`)
  - `reviewer@lexora.id` (Role: `LEGAL_REVIEWER`)
- **Regulasi & Pasal Lengkap:** UU No. 27 Tahun 2022 (UU PDP) & UU No. 1 Tahun 2024 (UU ITE).
- **Template Dokumen Hukum:** Surat Permintaan Penghapusan Data, Surat Notifikasi Kebocoran Data.
- **Katalog Insiden & SLA:** Ransomware, Kebocoran Data Pribadi, Pengambilalihan Akun, Web Defacement, Phishing.
- **Checklist Kepatuhan UMKM & Korporasi:** Inventarisasi Data, Penunjukan DPO, Analisis Dampak Privasi (DPIA).
- **Modul Edukasi:** Literasi Hukum Siber Dasar, Kuis Regulasi PDP.

---

## 7. Langkah 5: Mengamankan Kredensial Default Seed

Secara default, akun hasil seed memiliki password `Lexora123!`. **Wajib segera diubah saat go-live!**

### Cara 1: Ganti Password via Login UI
1. Buka halaman `/login`.
2. Masuk menggunakan:
   - Email: `admin@lexora.id`
   - Password: `Lexora123!`
3. Buka halaman profil/pengaturan akun dan perbarui password dengan kombinasi kuat (minimal 12 karakter, huruf besar-kecil, angka, simbol).

### Cara 2: Update Password Langsung via SQL Hash
Jika ingin langsung mengeset hash password baru sebelum membuka akses publik:

```sql
-- Contoh hash bcrypt cost 12 untuk password baru Anda
UPDATE "User"
SET "passwordHash" = '$2a$12$KODE_HASH_BCRYPT_BARU_ANDA...'
WHERE email IN ('admin@lexora.id', 'reviewer@lexora.id');
```

---

## 8. Tuning & Konfigurasi Connection Pool (`lib/db.ts`)

File [`lib/db.ts`](file:///home/jodijonatan/projects/competitions/lexora/lexora/lib/db.ts) mengelola pool koneksi menggunakan `pg.Pool` dengan konfigurasi standar:

```typescript
const pool = new Pool({
  connectionString,
  max: 10,                      // Batas maksimal koneksi per container/lambda instance
  idleTimeoutMillis: 30000,     // Putus koneksi menganggur setelah 30 detik
  connectionTimeoutMillis: 5000,// Timeout jika DB tidak merespons dalam 5 detik
})
```

### Rekomendasi Production:
- **Jika deploy di Vercel / Serverless:** Pastikan menggunakan connection string **Pooled** (PgBouncer) dari Neon/Supabase. Tanpa pooler, lonjakan request dapat menyebabkan error `sorry, too many clients already`.
- **Jika deploy di VPS / Docker:** Nilai `max: 10` hingga `max: 20` sangat ideal untuk server 2–4 Core CPU.

---

## 9. Rutinitas Backup & Pemeliharaan

1. **Automated Daily Backups:**
   - Di Neon / Supabase, pastikan fitur Point-in-Time Recovery (PITR) aktif.
2. **Manual Backup menggunakan `pg_dump`:**
   ```bash
   pg_dump "postgresql://user:password@host/lexora?sslmode=require" \
     --format=custom \
     --file="lexora_backup_$(date +%Y%m%d_%H%M%S).dump"
   ```
3. **Restore Backup:**
   ```bash
   pg_restore --clean --if-exists -d "postgresql://user:password@host/lexora?sslmode=require" "lexora_backup.dump"
   ```

---

## 10. Checklist Verifikasi Akhir Setup

Setelah semua langkah di atas selesai, verifikasi kesehatan database melalui endpoint monitoring:

- [ ] Jalankan query cek kesehatan:
  ```bash
  curl -i https://domain-anda.com/api/health
  ```
  *Pastikan respons mengembalikan HTTP 200 dengan status database:*
  ```json
  {
    "status": "ok",
    "services": {
      "database": { "status": "ok", "latencyMs": 24 },
      "api": { "status": "ok" }
    }
  }
  ```
- [ ] Login menggunakan akun admin di `/login`.
- [ ] Buka dashboard `/admin` dan pastikan data ringkasan analitik termuat tanpa error.
- [ ] Buka `/admin/regulations` dan pastikan data UU PDP & UU ITE hasil seeding tampil lengkap.
