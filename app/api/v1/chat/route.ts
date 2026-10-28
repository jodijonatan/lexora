import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, created, handleError, parsePagination, buildMeta } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { chatService, chatSchema } from '@/src/modules/chat/chat.service'

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

    // TODO: Replace with AI Layer (src/ai/retriever.ts + LLM streaming)
    const aiAnswer =
      `Terima kasih atas pertanyaan Anda mengenai: "${input.message}". ` +
      `Saya sedang memproses jawaban berdasarkan database regulasi hukum siber Indonesia. ` +
      `[Fitur AI RAG akan aktif setelah konfigurasi LLM provider selesai.]`

    const aiMessage = await chatService.saveAssistantMessage(chatSession.id, aiAnswer, [])

    return created({ sessionId: chatSession.id, message: aiMessage })
  } catch (err) {
    return handleError(err)
  }
}
