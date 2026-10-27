import { db } from '@/lib/db'

export const analyticsRepository = {
  async getSummary() {
    const [
      totalUsers,
      activeUsers,
      totalChats,
      completedChecklists,
      generatedDocuments,
      totalIncidents,
      resolvedIncidents,
      totalCourses,
    ] = await Promise.all([
      db.user.count(),
      // Pengguna dengan minimal 1 sesi chat dalam 30 hari terakhir
      db.user.count({
        where: {
          chatSessions: {
            some: {
              createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          },
        },
      }),
      db.chatMessage.count({ where: { role: 'ASSISTANT' } }),
      db.checklistInstance.count({ where: { status: 'COMPLETED' } }),
      db.generatedDocument.count(),
      db.incident.count(),
      db.incident.count({ where: { status: 'RESOLVED' } }),
      db.course.count({ where: { status: 'PUBLISHED' } }),
    ])

    return {
      users: { total: totalUsers, active30d: activeUsers },
      chat: { answeredQuestions: totalChats },
      checklists: { completed: completedChecklists },
      documents: { generated: generatedDocuments },
      incidents: { total: totalIncidents, resolved: resolvedIncidents },
      courses: { published: totalCourses },
    }
  },

  async getRecentActivity(limit = 10) {
    return db.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
  },
}
