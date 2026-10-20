import { db } from '../lib/db'
import {
  UserRole,
  ContentStatus,
  IncidentSeverity,
  TargetAudience,
} from '@prisma/client'

async function main() {
  console.log('🌱 Memulai proses seeding database Lexora...')

  // 1. Seed Roles & Users
  const adminUser = await db.user.upsert({
    where: { email: 'admin@lexora.id' },
    update: {},
    create: {
      name: 'Administrator Lexora',
      email: 'admin@lexora.id',
      role: UserRole.ADMIN,
    },
  })

  const legalReviewer = await db.user.upsert({
    where: { email: 'reviewer@lexora.id' },
    update: {},
    create: {
      name: 'Dr. Hukum Siber, S.H., LL.M.',
      email: 'reviewer@lexora.id',
      role: UserRole.LEGAL_REVIEWER,
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

  console.log('✅ Regulasi & Pasal UU PDP berhasil disiapkan.')

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
  const checklistBreach = await db.checklistTemplate.create({
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
