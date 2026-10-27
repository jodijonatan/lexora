import { chatRepository } from './chat.repository'
import { db } from '@/lib/db'
import { NotFoundError, ForbiddenError, OutOfScopeError } from '@/lib/errors'
import { z } from 'zod'

export const chatSchema = z.object({
  sessionId: z.string().cuid().optional(),
  message: z.string().min(1).max(4000),
})

// Kata kunci topik hukum siber yang diizinkan (guardrail sederhana)
const CYBER_LAW_KEYWORDS = [
  'data', 'privasi', 'pdp', 'ite', 'siber', 'hukum', 'regulasi',
  'pelanggaran', 'kebocoran', 'penipuan', 'phishing', 'hack', 'keamanan',
  'enkripsi', 'akses', 'illegal', 'pasal', 'uu', 'undang', 'peraturan',
  'perlindungan', 'digital', 'internet', 'platform', 'aplikasi', 'medsos',
  'hoaks', 'pencemaran', 'nama baik', 'ujaran', 'konten', 'korban',
]

function isInScope(message: string): boolean {
  const lower = message.toLowerCase()
  return CYBER_LAW_KEYWORDS.some((kw) => lower.includes(kw))
}

export const chatService = {
  async getOrCreateSession(userId?: string, sessionId?: string) {
    if (sessionId) {
      const session = await chatRepository.findSessionById(sessionId, userId)
      if (!session) throw new NotFoundError('Sesi chat')
      return session
    }
    return chatRepository.createSession(userId)
  },

  async getSessions(userId: string, skip: number, take: number) {
    return chatRepository.findSessionsByUser(userId, skip, take)
  },

  async getSessionById(sessionId: string, userId: string) {
    const session = await chatRepository.findSessionById(sessionId, userId)
    if (!session) throw new NotFoundError('Sesi chat')
    // Cek kepemilikan (IDOR prevention)
    if (session.userId && session.userId !== userId) throw new ForbiddenError()
    return session
  },

  async deleteSession(sessionId: string, userId: string) {
    const session = await chatRepository.findSessionById(sessionId, userId)
    if (!session) throw new NotFoundError('Sesi chat')
    if (session.userId !== userId) throw new ForbiddenError()
    return chatRepository.deleteSession(sessionId, userId)
  },

  /**
   * Simpan pesan user ke DB dan kembalikan konteks.
   * Pemanggil (route handler) bertanggung jawab untuk streaming ke LLM.
   */
  async saveUserMessage(sessionId: string, content: string) {
    if (!isInScope(content)) {
      throw new OutOfScopeError()
    }

    return chatRepository.addMessage({ sessionId, role: 'USER', content })
  },

  async saveAssistantMessage(
    sessionId: string,
    content: string,
    citations: Array<{ articleId: string; quote?: string; citationNumber?: number }>,
  ) {
    const message = await chatRepository.addMessage({
      sessionId,
      role: 'ASSISTANT',
      content,
      citations,
    })

    db.auditLog
      .create({
        data: {
          action: 'CHAT_ANSWERED',
          entityType: 'ChatSession',
          entityId: sessionId,
          details: { citationCount: citations.length },
        },
      })
      .catch(() => {})

    return message
  },
}
