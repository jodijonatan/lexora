import { type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { ok, noContent, handleError } from '@/lib/api-response'
import { chatService } from '@/src/modules/chat/chat.service'
import { UnauthorizedError } from '@/lib/errors'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { sessionId } = await params
    const chatSession = await chatService.getSessionById(sessionId, session.user.id)

    return ok(chatSession)
  } catch (err) {
    return handleError(err)
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new UnauthorizedError()

    const { sessionId } = await params
    await chatService.deleteSession(sessionId, session.user.id)

    return noContent()
  } catch (err) {
    return handleError(err)
  }
}
