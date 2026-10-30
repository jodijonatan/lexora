import { db } from '../lib/db'
import {
  UserRole,
  ContentStatus,
  TargetAudience,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Memulai proses seeding database Lexora...')

  const defaultPasswordHash = await bcrypt.hash('Lexora123!', 12)

  // 1. Seed Roles & Users
  await db.user.upsert({
    where: { email: 'admin@lexora.id' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: 'Administrator Lexora',
      email: 'admin@lexora.id',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
    },
  })

  const legalReviewer = await db.user.upsert({
    where: { email: 'reviewer@lexora.id' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: 'Tim Reviewer Hukum Lexora',
      email: 'reviewer@lexora.id',
      passwordHash: defaultPasswordHash,
      role: UserRole.LEGAL_REVIEWER,
    },
  })

  // Demo user — akun testing untuk evaluator / juri
  await db.user.upsert({
    where: { email: 'demo@lexora.id' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      name: 'Demo Pengguna',
      email: 'demo@lexora.id',
      passwordHash: defaultPasswordHash,
      role: UserRole.USER,
    },
  })

  console.log('✅ Pengguna awal berhasil dibuat/diverifikasi.')

  // 2. Seed Regulasi (UU PDP & UU ITE)
  const uuPdp = await db.regulation.upsert({
    where: { code: 'UU No. 27 Tahun 2022' },
    update: {},
    create: {
      title: 'Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi',
      code: 'UU No. 27 Tahun 2022',
      category: 'UU',
      year: 2022,
      description:
        'Regulasi komprehensif mengenai tata kelola pelindungan data pribadi, hak subjek data, serta kewajiban pengendali dan prosesor data pribadi di Indonesia.',
      sourceUrl: 'https://peraturan.go.id/id/uu-no-27-tahun-2022',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2022-10-17'),
      reviewedById: legalReviewer.id,
    },
  })

  // Pasal 46 UU PDP (Kewajiban 3x24 Jam)
  const pasal46 = await db.regulationArticle.upsert({
    where: {
      regulationId_articleNumber: {
        regulationId: uuPdp.id,
        articleNumber: 'Pasal 46',
      },
    },
    update: {},
    create: {
      regulationId: uuPdp.id,
      chapter: 'BAB IV Kewajiban Pengendali Data Pribadi',
      articleNumber: 'Pasal 46',
      title: 'Pemberitahuan Tertulis atas Kegagalan Pelindungan Data Pribadi',
      content:
        '(1) Dalam hal terjadi kegagalan Pelindungan Data Pribadi, Pengendali Data Pribadi wajib menyampaikan pemberitahuan secara tertulis paling lambat 3 x 24 (tiga kali dua puluh empat) jam kepada: a. Subjek Data Pribadi; dan b. lembaga.\n(2) Pemberitahuan tertulis sebagaimana dimaksud pada ayat (1) minimal memuat: a. Data Pribadi yang terungkap; b. kapan dan bagaimana Data Pribadi terungkap; dan c. upaya penanganan dan pemulihan atas terungkapnya Data Pribadi oleh Pengendali Data Pribadi.\n(3) Dalam hal tertentu, Pengendali Data Pribadi wajib memberitahukan kepada masyarakat mengenai kegagalan Pelindungan Data Pribadi.',
    },
  })

  // Pasal 47 UU PDP
  const pasal47 = await db.regulationArticle.upsert({
    where: {
      regulationId_articleNumber: {
        regulationId: uuPdp.id,
        articleNumber: 'Pasal 47',
      },
    },
    update: {},
    create: {
      regulationId: uuPdp.id,
      chapter: 'BAB IV Kewajiban Pengendali Data Pribadi',
      articleNumber: 'Pasal 47',
      title: 'Pemberitahuan Informasi Tambahan Kegagalan Perlindungan Data',
      content:
        'Ketentuan lebih lanjut mengenai tata cara penyampaian pemberitahuan tertulis atas kegagalan Pelindungan Data Pribadi diatur dalam Peraturan Pemerintah.',
    },
  })

  // Pasal 35 UU PDP (Keamanan Data)
  const pasal35 = await db.regulationArticle.upsert({
    where: {
      regulationId_articleNumber: {
        regulationId: uuPdp.id,
        articleNumber: 'Pasal 35',
      },
    },
    update: {},
    create: {
      regulationId: uuPdp.id,
      chapter: 'BAB IV Kewajiban Pengendali Data Pribadi',
      articleNumber: 'Pasal 35',
      title: 'Kewajiban Keamanan dan Pengamanan Data Pribadi',
      content:
        'Pengendali Data Pribadi wajib melindungi dan memastikan keamanan Data Pribadi yang diprosesnya dengan melakukan penyusunan dan penerapan langkah teknis operasional untuk melindungi Data Pribadi dari gangguan pemrosesan yang tidak sah.',
    },
  })

  // UU ITE No. 1 Tahun 2024 (Perubahan Kedua UU ITE)
  const uuIte = await db.regulation.upsert({
    where: { code: 'UU No. 1 Tahun 2024' },
    update: {},
    create: {
      title: 'Undang-Undang Republik Indonesia Nomor 1 Tahun 2024 tentang Perubahan Kedua atas Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik',
      code: 'UU No. 1 Tahun 2024',
      category: 'UU',
      year: 2024,
      description:
        'Perubahan kedua atas UU ITE yang memuat penyesuaian ketentuan pidana siber, perlindungan hak warga digital, dan penguatan mekanisme penyelesaian sengketa elektronik.',
      sourceUrl: 'https://peraturan.go.id/id/uu-no-1-tahun-2024',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2024-01-02'),
      reviewedById: legalReviewer.id,
    },
  })

  // Pasal 27 UU ITE (Konten Terlarang)
  await db.regulationArticle.upsert({
    where: {
      regulationId_articleNumber: {
        regulationId: uuIte.id,
        articleNumber: 'Pasal 27A',
      },
    },
    update: {},
    create: {
      regulationId: uuIte.id,
      chapter: 'BAB VII Perbuatan yang Dilarang',
      articleNumber: 'Pasal 27A',
      title: 'Larangan Distribusi Konten Bermuatan Penghinaan/Pencemaran Nama Baik',
      content:
        'Setiap Orang dengan sengaja menyerang kehormatan atau nama baik orang lain dengan cara menuduhkan suatu hal, dengan maksud yang jelas agar hal tersebut diketahui umum dalam Sistem Elektronik dan/atau melalui Sistem Elektronik dipidana dengan pidana penjara paling lama 1 (satu) tahun dan/atau denda paling banyak Rp500.000.000,00 (lima ratus juta rupiah).',
    },
  })

  // Pasal 30 UU ITE (Akses Ilegal)
  await db.regulationArticle.upsert({
    where: {
      regulationId_articleNumber: {
        regulationId: uuIte.id,
        articleNumber: 'Pasal 30',
      },
    },
    update: {},
    create: {
      regulationId: uuIte.id,
      chapter: 'BAB VII Perbuatan yang Dilarang',
      articleNumber: 'Pasal 30',
      title: 'Larangan Akses Sistem Elektronik Tanpa Izin',
      content:
        '(1) Setiap Orang dengan sengaja dan tanpa hak atau melawan hukum mengakses Komputer dan/atau Sistem Elektronik milik Orang lain dengan cara apa pun.\n(2) Setiap Orang dengan sengaja dan tanpa hak atau melawan hukum mengakses Komputer dan/atau Sistem Elektronik dengan cara apa pun dengan tujuan untuk memperoleh Informasi Elektronik dan/atau Dokumen Elektronik.\n(3) Setiap Orang dengan sengaja dan tanpa hak atau melawan hukum mengakses Komputer dan/atau Sistem Elektronik dengan cara apa pun dengan melanggar, menerobos, melampaui, atau menjebol sistem pengamanan.',
    },
  })

  // PP No. 71 Tahun 2019 (Penyelenggaraan Sistem dan Transaksi Elektronik)
  await db.regulation.upsert({
    where: { code: 'PP No. 71 Tahun 2019' },
    update: {},
    create: {
      title: 'Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik',
      code: 'PP No. 71 Tahun 2019',
      category: 'PP',
      year: 2019,
      description:
        'Mengatur kewajiban pendaftaran Penyelenggara Sistem Elektronik (PSE) lingkup publik dan privat, tata kelola data pengguna, serta mekanisme pemutusan akses konten terlarang.',
      sourceUrl: 'https://peraturan.go.id/id/pp-no-71-tahun-2019',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2019-10-10'),
      reviewedById: legalReviewer.id,
    },
  })

  // Perpres No. 28 Tahun 2021 (BSSN)
  await db.regulation.upsert({
    where: { code: 'Perpres No. 28 Tahun 2021' },
    update: {},
    create: {
      title: 'Peraturan Presiden Nomor 28 Tahun 2021 tentang Badan Siber dan Sandi Negara',
      code: 'Perpres No. 28 Tahun 2021',
      category: 'Perpres',
      year: 2021,
      description:
        'Menetapkan tugas, fungsi, dan kewenangan BSSN sebagai lembaga pemerintah nonkementerian yang menyelenggarakan keamanan siber secara efektif dan efisien.',
      sourceUrl: 'https://peraturan.go.id/id/perpres-no-28-tahun-2021',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2021-04-13'),
      reviewedById: legalReviewer.id,
    },
  })

  // SE OJK No. 29/SEOJK.03/2022 (Ketahanan Siber Perbankan)
  await db.regulation.upsert({
    where: { code: 'SE OJK No. 29/SEOJK.03/2022' },
    update: {},
    create: {
      title: 'Surat Edaran OJK Nomor 29/SEOJK.03/2022 tentang Ketahanan dan Keamanan Siber bagi Bank Umum',
      code: 'SE OJK No. 29/SEOJK.03/2022',
      category: 'SE',
      year: 2022,
      description:
        'Panduan teknis bagi bank umum dalam membangun sistem manajemen keamanan siber, mencakup tata kelola, penilaian risiko, penanganan insiden, dan pelaporan kepada OJK.',
      sourceUrl: 'https://www.ojk.go.id/id/regulasi/surat-edaran-ojk/Pages/Surat-Edaran-OJK-Nomor-29-SEOJK-03-2022.aspx',
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date('2022-12-29'),
      reviewedById: legalReviewer.id,
    },
  })

  console.log('✅ Regulasi & Pasal UU PDP, UU ITE, PP, Perpres, SE OJK berhasil disiapkan.')

  // 3. Seed Incident Types
  const kebocoranDataIncidentType = await db.incidentType.upsert({
    where: { slug: 'kebocoran-data-pribadi' },
    update: {},
    create: {
      name: 'Kebocoran Data Pribadi (Data Breach)',
      slug: 'kebocoran-data-pribadi',
      description:
        'Insiden terjadinya akses tidak sah, kebocoran, atau pencurian basis data pribadi pengguna atau pelanggan sesuai UU PDP Pasal 46.',
      defaultDeadlineHours: 72, // 3 x 24 jam sesuai UU PDP
    },
  })

  await db.incidentType.upsert({
    where: { slug: 'penipuan-online' },
    update: {},
    create: {
      name: 'Penipuan Online & Rekayasa Sosial',
      slug: 'penipuan-online',
      description:
        'Insiden penipuan transaksi digital, phishing, atau pengambilalihan akun usaha.',
      defaultDeadlineHours: 24,
    },
  })

  console.log('✅ Master jenis insiden berhasil dibuat.')

  // 4. Seed Template Dokumen (Surat Pemberitahuan Insiden PDP)
  const docTemplatePemberitahuan = await db.docTemplate.upsert({
    where: { slug: 'pemberitahuan-kegagalan-pdp' },
    update: {},
    create: {
      title: 'Surat Pemberitahuan Kegagalan Pelindungan Data Pribadi (UU PDP)',
      slug: 'pemberitahuan-kegagalan-pdp',
      description:
        'Template dokumen resmi untuk menyampaikan pemberitahuan insiden kebocoran data pribadi kepada lembaga berwenang dan subjek data sesuai Pasal 46 UU PDP.',
      formSchema: {
        fields: [
          { name: 'nama_organisasi', label: 'Nama Lembaga/Usaha', type: 'text', required: true },
          { name: 'tanggal_kejadian', label: 'Tanggal Terjadinya Insiden', type: 'date', required: true },
          { name: 'jenis_data_bocor', label: 'Jenis Data yang Terkena Dampak', type: 'text', required: true },
          { name: 'kronologi_singkat', label: 'Kronologi Singkat', type: 'textarea', required: true },
          { name: 'langkah_mitigasi', label: 'Langkah Penanganan & Pemulihan', type: 'textarea', required: true },
          { name: 'kontak_dpo', label: 'Kontak Petugas / PIC Pelindungan Data', type: 'text', required: true },
        ],
      },
      contentTemplate: `SURAT PEMBERITAHUAN KEGAGALAN PELINDUNGAN DATA PRIBADI
Berdasarkan Pasal 46 UU Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi

Kepada Yth.
Subjek Data Pribadi & Lembaga Pengawas Pelindungan Data Pribadi

Dengan hormat,
Kami dari {{nama_organisasi}} memberitahukan bahwa telah terjadi insiden kegagalan pelindungan data pribadi pada tanggal {{tanggal_kejadian}}.

1. Data Pribadi yang Terungkap:
{{jenis_data_bocor}}

2. Kronologi Kejadian:
{{kronologi_singkat}}

3. Upaya Penanganan dan Pemulihan:
{{langkah_mitigasi}}

4. Kontak Petugas Pelindungan Data (DPO / PIC):
{{kontak_dpo}}

Demikian pemberitahuan resmi ini kami sampaikan sesuai dengan kewajiban hukum yang berlaku.`,
      status: ContentStatus.PUBLISHED,
      reviewedById: legalReviewer.id,
    },
  })

  console.log('✅ Template dokumen berhasil dibuat.')

  // 5. Seed Checklist Template
  await db.checklistTemplate.create({
    data: {
      title: 'Checklist Respons Cepat Kebocoran Data Pribadi (UU PDP)',
      description:
        'Panduan kepatuhan bertahap saat terjadi kebocoran data untuk memastikan pemenuhan tenggat 3 x 24 jam sesuai regulasi.',
      incidentTypeId: kebocoranDataIncidentType.id,
      status: ContentStatus.PUBLISHED,
      reviewedById: legalReviewer.id,
      items: {
        create: [
          {
            order: 1,
            title: 'Isolasi dan Amankan Sistem Terdampak',
            description:
              'Putuskan koneksi server yang terkompromi dan cabut kredensial API/database yang diduga bocor.',
            articleId: pasal35.id,
          },
          {
            order: 2,
            title: 'Kirimkan Pemberitahuan Tertulis 3 x 24 Jam (Pasal 46)',
            description:
              'Kirim surat pemberitahuan resmi kepada Subjek Data dan Lembaga Pengawas PDP dalam waktu maksimal 72 jam.',
            articleId: pasal46.id,
            docTemplateId: docTemplatePemberitahuan.id,
          },
          {
            order: 3,
            title: 'Dokumentasikan Investigasi dan Bukti Forensik Digital',
            description:
              'Simpan log akses, bukti kebocoran, dan waktu insiden sebagai audit trail kepatuhan hukum.',
            articleId: pasal47.id,
          },
        ],
      },
    },
  })

  console.log('✅ Checklist template berhasil disiapkan.')

  // 6. Seed Edukasi Interaktif
  await db.course.upsert({
    where: { slug: 'pengantar-uu-pdp-umkm' },
    update: {},
    create: {
      title: 'Kepatuhan Pelindungan Data Pribadi (UU PDP) untuk UMKM',
      slug: 'pengantar-uu-pdp-umkm',
      description:
        'Modul pembelajaran interaktif singkat bagi pemilik usaha kecil untuk memahami hak pelanggan dan kewajiban hukum data pribadi.',
      targetAudience: TargetAudience.UMKM,
      status: ContentStatus.PUBLISHED,
      lessons: {
        create: [
          {
            order: 1,
            title: 'Mengenal Kategori Data Pribadi',
            durationMinutes: 7,
            content:
              'Data pribadi terbagi menjadi dua: Data Pribadi Umum (nama, jenis kelamin, kewarganegaraan) dan Data Pribadi Spesifik (data kesehatan, data biometrik, data keuangan pribadi, data anak). Pengendali data wajib melindungi kedua kategori ini.',
            quizzes: {
              create: [
                {
                  question: 'Manakah di bawah ini yang tergolong Data Pribadi Spesifik menurut UU PDP?',
                  options: ['Nama lengkap', 'Catatan kesehatan & data keuangan pribadi', 'Alamat email', 'Nomor telepon'],
                  correctAnswer: 'Catatan kesehatan & data keuangan pribadi',
                  explanation:
                    'Data kesehatan, data biometrik, data anak, dan data keuangan pribadi memerlukan tingkat pengamanan lebih tinggi karena berdampak besar bila bocor.',
                },
              ],
            },
          },
          {
            order: 2,
            title: 'Batas Waktu Pemberitahuan Insiden Kebocoran',
            durationMinutes: 10,
            content:
              'Pasal 46 UU PDP mewajibkan pengendali data memberitahukan kegagalan pelindungan data paling lambat 3 x 24 jam (72 jam) sejak insiden diketahui.',
            quizzes: {
              create: [
                {
                  question: 'Berapa batas waktu pemberitahuan tertulis kegagalan pelindungan data sesuai Pasal 46 UU PDP?',
                  options: ['24 jam', '3 x 24 jam (72 jam)', '7 hari kerja', '30 hari'],
                  correctAnswer: '3 x 24 jam (72 jam)',
                  explanation: 'UU No. 27 Tahun 2022 Pasal 46 ayat (1) menegaskan tenggat waktu maksimal 3 x 24 jam.',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('✅ Modul edukasi interaktif berhasil disiapkan.')
  console.log('🎉 Seeding database Lexora selesai dengan sukses!')
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
