import OpenAI from 'openai'
import { db } from '@/lib/db'

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.LLM_API_KEY
    if (!apiKey) throw new Error('LLM_API_KEY tidak dikonfigurasi.')
    _client = new OpenAI({ apiKey })
  }
  return _client
}

/**
 * Cari pasal-pasal regulasi yang relevan dari database berdasarkan query pengguna.
 * Implementasi: keyword-based retrieval dari teks konten pasal (tanpa embedding).
 */
export async function retrieveRelevantArticles(query: string, topK = 5) {
  const queryLower = query.toLowerCase()

  // Ambil semua pasal yang dipublikasikan
  const articles = await db.regulationArticle.findMany({
    take: 200,
    include: {
      regulation: {
        select: { code: true, title: true, category: true, year: true },
      },
    },
    where: {
      regulation: { status: 'PUBLISHED' },
    },
  })

  // Hitung skor relevansi sederhana berdasarkan kata kunci dalam query
  const queryWords = queryLower
    .split(/\s+/)
    .filter((w) => w.length > 3)

  const scored = articles.map((article) => {
    const text = `${article.articleNumber} ${article.title} ${article.content} ${article.regulation.code}`.toLowerCase()
    let score = 0
    for (const word of queryWords) {
      if (text.includes(word)) score += 2
    }
    // Bonus untuk keyword spesifik
    const specialKeywords = [
      ['kebocoran', 'pasal 46', 'kegagalan', 'pemberitahuan', '72 jam', '3 x 24'],
      ['akses ilegal', 'pasal 30', 'tanpa hak', 'sistem elektronik'],
      ['phishing', 'penipuan', 'fraud', 'pasal 28'],
      ['privasi', 'data pribadi', 'pasal 35', 'keamanan'],
      ['pencemaran nama baik', 'ujaran kebencian', 'pasal 27'],
      ['pdp', 'uu pdp', 'pelindungan data'],
      ['ite', 'uu ite', 'informasi dan transaksi'],
    ]
    for (const group of specialKeywords) {
      if (group.some((kw) => queryLower.includes(kw))) {
        if (group.some((kw) => text.includes(kw))) score += 5
      }
    }
    return { article, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.article)
}

/**
 * Bangun system prompt untuk AI Lexo dengan konteks regulasi
 */
function buildSystemPrompt(articles: Awaited<ReturnType<typeof retrieveRelevantArticles>>): string {
  const contextBlocks = articles.map((a) =>
    `[${a.regulation.code} — ${a.articleNumber}: ${a.title}]\n${a.content}`
  ).join('\n\n---\n\n')

  return `Anda adalah Lexo, asisten hukum siber cerdas milik Lexora — platform pendampingan hukum siber berbasis AI untuk masyarakat dan UMKM Indonesia.

IDENTITAS:
- Nama: Lexo
- Spesialisasi: Hukum siber Indonesia (UU PDP, UU ITE, PP terkait keamanan data dan transaksi elektronik)
- Bahasa: Bahasa Indonesia yang jelas, mudah dipahami, tidak teknis-kaku
- Kepribadian: Profesional, empatis, dan membantu

ATURAN WAJIB:
1. Selalu sitasi pasal spesifik saat menjawab (format: "Pasal X [Nama UU/PP]")
2. Berikan jawaban konkret dan actionable — langkah yang bisa langsung diambil
3. Jika topik di luar hukum siber Indonesia, tolak dengan sopan dan arahkan ke topik yang relevan
4. Jangan memberikan nasihat hukum yang bersifat final — selalu anjurkan konsultasi pengacara untuk kasus serius
5. Jawab dalam Bahasa Indonesia kecuali user menggunakan bahasa lain

${articles.length > 0 ? `KONTEKS REGULASI RELEVAN (gunakan sebagai referensi utama):

${contextBlocks}

Gunakan konteks di atas sebagai sumber utama jawaban Anda. Sitasi harus sesuai dengan pasal yang tercantum.` : 'CATATAN: Tidak ada pasal spesifik yang relevan ditemukan. Jawab berdasarkan pengetahuan umum hukum siber Indonesia dan anjurkan pengguna untuk memeriksa regulasi terbaru.'}`
}

/**
 * Panggil OpenAI API dengan konteks regulasi (RAG)
 */
export async function generateAiAnswer(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ answer: string; citedArticleIds: string[]; citations: string[] }> {
  const client = getClient()

  // Retrieve relevant articles dari database
  const relevantArticles = await retrieveRelevantArticles(userMessage)

  // Bangun system prompt dengan konteks
  const systemPrompt = buildSystemPrompt(relevantArticles)

  // Siapkan messages untuk OpenAI
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6), // Ambil 6 pesan terakhir untuk konteks
    { role: 'user', content: userMessage },
  ]

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini', // Cost-efficient, fast
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  })

  const answer = completion.choices[0]?.message?.content ?? 'Maaf, saya tidak dapat memproses pertanyaan Anda saat ini.'

  // Kumpulkan citation data
  const citedArticleIds = relevantArticles.map((a) => a.id)
  const citations = relevantArticles.map((a) => `${a.regulation.code} ${a.articleNumber}`)

  return { answer, citedArticleIds, citations }
}
