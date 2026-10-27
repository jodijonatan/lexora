import { db } from '@/lib/db'
import type { ChatRole } from '@prisma/client'

export const chatRepository = {
  async createSession(userId?: string, title?: string) {
    return db.chatSession.create({
      data: { userId, title: title ?? 'Sesi Baru' },
    })
  },

  async findSessionsByUser(userId: string, skip: number, take: number) {
    const [sessions, total] = await Promise.all([
      db.chatSession.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { messages: true } },
        },
      }),
      db.chatSession.count({ where: { userId } }),
    ])
    return { sessions, total }
  },

  async findSessionById(sessionId: string, userId?: string) {
    return db.chatSession.findFirst({
      where: { id: sessionId, ...(userId ? { userId } : {}) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            citations: {
              include: {
                article: {
                  select: {
                    articleNumber: true,
                    title: true,
                    regulation: { select: { code: true, title: true } },
                  },
                },
              },
            },
          },
        },
      },
    })
  },

  async addMessage(data: {
    sessionId: string
    role: ChatRole
    content: string
    citations?: Array<{ articleId: string; quote?: string; citationNumber?: number }>
  }) {
    return db.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        role: data.role,
        content: data.content,
        citations: data.citations?.length
          ? { create: data.citations }
          : undefined,
      },
      include: {
        citations: {
          include: {
            article: {
              select: {
                articleNumber: true,
                title: true,
                regulation: { select: { code: true, title: true } },
              },
            },
          },
        },
      },
    })
  },

  async deleteSession(sessionId: string, userId: string) {
    return db.chatSession.deleteMany({ where: { id: sessionId, userId } })
  },

  async updateSessionTitle(sessionId: string, title: string) {
    return db.chatSession.update({ where: { id: sessionId }, data: { title } })
  },
}
