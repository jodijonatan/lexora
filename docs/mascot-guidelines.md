# Panduan Desain & Spesifikasi Maskot Lexora

> **Platform**: Lexora (Edukasi dan Pendampingan Hukum Siber Berbasis AI)  
> **Tujuan Dokumen**: Panduan referensi pose, ekspresi, dan *use-case* visual maskot untuk antarmuka pengguna (UI/UX) web Lexora.

---

## 1. Karakteristik & Tone of Voice

Maskot Lexora berfungsi sebagai pendamping digital yang membantu masyarakat, pelaku UMKM, dan institusi pendidikan memahami hukum siber dan menghadapi insiden digital.

- **Ramah & Dapat Didekati (*Approachable*)**: Mengikis kesan bahwa hukum itu kaku, menakutkan, dan rumit.
- **Terpercaya & Bijak (*Trustworthy & Authoritative*)**: Merefleksikan validitas regulasi (UU PDP, UU ITE, dll.) dan keandalan AI.
- **Menenangkan & Penuh Empati (*Calm & Empathetic*)**: Memberi ketenangan bagi pengguna yang sedang panik karena menjadi korban kebocoran data atau penipuan daring.
- **Proaktif & Suportif (*Action-Oriented*)**: Mendorong pengguna mengambil langkah nyata (mengisi checklist, membuat laporan, mengunduh template).

---

## 2. Matriks Pose & Ekspresi per Modul

### A. Umum & Onboarding (Landing Page & Global UI)
| ID Pose | Nama Pose | Deskripsi Fisik & Aset Tambahan | Ekspresi Wajah | Rekomendasi Penempatan |
|---|---|---|---|---|
| `GEN-01` | **Waving / Welcome** | Berdiri tegap bersahabat, satu tangan melambai ke pengguna. | Senyum hangat, mata berbinar ramah. | Hero Section Landing Page, modal sambutan login pertama kali. |
| `GEN-02` | **Presenter / Guide** | Satu tangan terbuka mengarah ke samping (menunjuk UI card atau teks). | Percaya diri, tersenyum antusias. | Penjelasan fitur utama, pengantar tur onboarding aplikasi. |
| `GEN-03` | **Idle / Standby** | Pose melayang ringan atau berdiri santai dengan tangan di pinggang/depan. | Senyum ramah simetris, kontak mata langsung. | Floating widget trigger tombol AI chat di sudut kanan bawah. |

---

### B. AI Legal Assistant (`/chat`)
| ID Pose | Nama Pose | Deskripsi Fisik & Aset Tambahan | Ekspresi Wajah | Rekomendasi Penempatan |
|---|---|---|---|---|
| `CHT-01` | **Thinking / Analyzing** | Tangan di dagu atau menatap layar holografis/buku hukum kecil; ada animasi partikel berpikir. | Fokus, mata menyipit analitis, menyimak. | Status *loading/streaming* ketika AI sedang merumuskan jawaban & sitasi pasal. |
| `CHT-02` | **Eureka / Solusi Ditemukan** | Telunjuk terangkat ke atas, ada ikon lampu/dokumen bercahaya kecil di atas kepala. | Senyum cerah, mata terbuka optimis. | Jawaban hukum selesai di-*render*, rekomendasi pasal ditemukan. |
| `CHT-03` | **Rujukan Resmi (Citation)** | Memegang tablet atau buku regulasi tebal bertuliskan pasal/UU. | Berwibawa, profesional, terpercaya. | Tooltip/badge sumber hukum terpercaya dan disclaimer hukum. |

---

### C. Tanggap Insiden (`/incidents`)
| ID Pose | Nama Pose | Deskripsi Fisik & Aset Tambahan | Ekspresi Wajah | Rekomendasi Penempatan |
|---|---|---|---|---|
| `INC-01` | **Calm Down / "Jangan Panik"** | Kedua telapak tangan mengarah lembut ke depan dada (gestur relaksasi). | Teduh, sabar, penuh empati dan suportif. | Header alur panduan insiden (kebocoran data / penipuan online). |
| `INC-02` | **Perisai Siber (Protection)** | Membawa perisai digital (*cyber shield*) bercahaya biru/emas. | Tegas, siap siaga, melindungi. | Checklist mitigasi darurat, panduan pengamanan kredensial akun. |
| `INC-03` | **Aksi Nyata (Action Step)** | Memegang map dokumen laporan resmi dan menunjuk tombol unduh/kirim. | Serius tapi optimis, mengarahkan. | Tombol unduh draft laporan polisi / surat notifikasi insiden PDP. |

---

### D. Checklist Kepatuhan & Edukasi (`/checklists` & `/education`)
| ID Pose | Nama Pose | Deskripsi Fisik & Aset Tambahan | Ekspresi Wajah | Rekomendasi Penempatan |
|---|---|---|---|---|
| `EDU-01` | **Celebration / Victory** | Kedua tangan terangkat ke atas (*hore!*), melompat kecil diiringi konfeti. | Sangat gembira, tertawa riang. | Penyelesaian 100% checklist kepatuhan, lulus kuis edukasi. |
| `EDU-02` | **Cheering / Thumbs Up** | Mengacungkan satu/dua jempol ke arah pengguna. | Menginspirasi, penuh semangat. | Milestone progres (misal 50% kepatuhan), motivasi saat skor kuis belum lulus. |
| `EDU-03` | **Studious / Membaca** | Duduk fokus membaca modul atau membolak-balik lembar dokumen. | Antusias, penuh rasa ingin tahu. | Card materi belajar baru, banner edukasi mingguan. |

---

### E. Error, Empty State & System Feedback
| ID Pose | Nama Pose | Deskripsi Fisik & Aset Tambahan | Ekspresi Wajah | Rekomendasi Penempatan |
|---|---|---|---|---|
| `ERR-01` | **Searching / Empty State** | Memegang kaca pembesar menatap lantai, bahu terangkat sedikit (*shrug*). | Mengernyit heran, senyum canggung tanpa terkesan menuduh. | Hasil pencarian regulasi/template kosong (*No Results Found*). |
| `ERR-02` | **Maintenance / Apologetic** | Memegang kunci inggris/kabel dengan perlengkapan teknisi siber. | Tersipu malu, meminta maaf (*apologetic*). | Halaman Maintenance (503) atau Error Server (500). |
| `ERR-03` | **Lost / 404** | Memegang peta atau kompas digital yang berputar bingung. | Mata bulat kebingungan, sedikit terkejut. | Halaman 404 Not Found (halaman tidak ditemukan). |

---

## 3. Prioritas Produksi (Roadmap Aset)

Jika pembuatan aset visual dilakukan secara bertahap, disarankan mengikuti fase prioritas berikut:

### 🌟 Fase 1: MVP (Minimum Viable Product) — 5 Aset Kunci
1. **`GEN-01` (Waving / Welcome)**: Identitas visual utama di landing page.
2. **`CHT-01` (Thinking / Analyzing)**: Loading state pada fitur AI chat.
3. **`INC-01` (Calm Down)**: Memberi kenyamanan pada modul insiden siber.
4. **`EDU-01` (Celebration / Thumbs Up)**: Feedback positif saat menyelesaikan aksi/checklist.
5. **`ERR-01` (Searching / Empty State)**: Penanganan state kosong dan pencarian.

### 🚀 Fase 2: Peningkatan Interaktivitas
- `GEN-02` (Presenter / Guide)
- `CHT-02` (Eureka / Solusi)
- `INC-02` (Perisai Siber)
- `ERR-03` (404 Page)

### ✨ Fase 3: Polish & Gamifikasi Lengkap
- `CHT-03` (Rujukan Resmi / Buku UU)
- `INC-03` (Aksi Nyata / Dokumen Laporan)
- `EDU-03` (Studious / Membaca)
- `ERR-02` (Maintenance)

---

## 4. Panduan Teknis Ekspor File

- **Format File**:
  - `SVG`: Sangat direkomendasikan untuk ilustrasi berbasis vektor datar (*flat/clean vector*), tajam di semua resolusi layar dan ringan.
  - `WebP` / `PNG transparan` (resolusi 2x/3x, minimal 1024x1024px): Jika maskot bergaya 3D render atau memiliki efek gradien kompleks.
  - `Lottie JSON` / `.tgs` (Opsional): Untuk pose dinamis seperti `CHT-01` (Thinking) dan `EDU-01` (Celebration).
- **Kanvas & Padding**: Sisakan padding aman minimal 10% di sekeliling karakter agar bayangan (*shadow*) atau aksesoris tidak terpotong.
- **Color Consistency**: Gunakan palet warna yang selaras dengan tema Lexora (misal: aksen *cyber blue*, *teal*, atau *navy* berpadu dengan warna aksen hangat).
