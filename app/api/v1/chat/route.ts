import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { chatService, chatSchema } from '@/src/modules/chat/chat.service'
import { generateAiAnswer } from '@/src/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Autentikasi diperlukan' } },
        { status: 401 },
      )
    }

    const { page, limit, skip } = parsePagination(req.nextUrl.searchParams)
    const { sessions, total } = await chatService.getSessions(session.user.id, skip, limit)

    return ok(sessions, buildMeta(total, page, limit))
  } catch (err) {
    return handleError(err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const { limited, headers } = await checkRateLimit(req, 'chat', userId)
    if (limited) {
      return Response.json(
        { error: { code: 'RATE_LIMITED', message: 'Batas pertanyaan tercapai. Coba lagi nanti.' } },
        { status: 429, headers },
      )
    }

    const body = await req.json()
    const input = chatSchema.parse(body)

    const chatSession = await chatService.getOrCreateSession(userId, input.sessionId)
    await chatService.saveUserMessage(chatSession.id, input.message)

    // Para percakapan multi-turn: ambil riwayat dari DB jika ada sessionId
    // (untuk simplifikasi, kita mulai fresh context setiap POST; multi-turn via session bisa ditambahkan nanti)
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

    let aiAnswer: string
    let citedArticleIds: string[] = []
    let citations: string[] = []

    const llmKey = process.env.LLM_API_KEY
    if (llmKey) {
      try {
        const result = await generateAiAnswer(input.message, history)
        aiAnswer = result.answer
        citedArticleIds = result.citedArticleIds
        citations = result.citations
      } catch (aiErr) {
        console.error('[AI Error]', aiErr)
        // Fallback jika LLM gagal
        aiAnswer =
          'Mohon maaf, sistem AI sedang mengalami gangguan sementara. ' +
          'Silakan coba lagi dalam beberapa saat, atau kunjungi halaman Regulasi untuk mencari informasi hukum secara manual.'
      }
    } else {
      aiAnswer =
        'Asisten AI belum dikonfigurasi. Silakan hubungi administrator untuk mengaktifkan fitur ini.'
    }

    // Simpan jawaban AI dengan citation ke artikel yang relevan
    const citationData = citedArticleIds.map((articleId, i) => ({
      articleId,
      citationNumber: i + 1,
    }))

    const aiMessage = await chatService.saveAssistantMessage(
      chatSession.id,
      aiAnswer,
      citationData,
    )

    // Tambahkan citations sebagai string ke response untuk UI
    const responseMessage = {
      ...aiMessage,
      citations,
    }

    return created({ sessionId: chatSession.id, message: responseMessage })
  } catch (err) {
    return handleError(err)
  }
}
