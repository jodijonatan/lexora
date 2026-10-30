import { db } from '@/lib/db'
import type { IncidentStatus, IncidentSeverity } from '@prisma/client'

export const incidentsRepository = {
  async findTypes() {
    return db.incidentType.findMany({ orderBy: { name: 'asc' } })
  },

  async findTypeById(id: string) {
    return db.incidentType.findUnique({
      where: { id },
      include: {
        recommendedChecklists: {
          where: { status: 'PUBLISHED' },
          select: { id: true, title: true },
        },
      },
    })
  },

  async create(data: {
    userId: string
    incidentTypeId: string
    title: string
    description: string
    severity: IncidentSeverity
    deadlineAt?: Date
    evidenceJson?: unknown
  }) {
    return db.incident.create({
      data: {
        userId: data.userId,
        incidentTypeId: data.incidentTypeId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        deadlineAt: data.deadlineAt,
        ...(data.evidenceJson ? { evidenceJson: data.evidenceJson as never } : {}),
      },
      include: { incidentType: true },
    })
  },

  async findByUser(userId?: string, skip: number = 0, take: number = 20) {
    const where = userId ? { userId } : {}
    const [incidents, total] = await Promise.all([
      db.incident.findMany({
        where,
        skip,
        take,
        orderBy: { reportedAt: 'desc' },
        include: {
          incidentType: { select: { name: true, slug: true } },
          _count: { select: { events: true } },
        },
      }),
      db.incident.count({ where }),
    ])
    return { incidents, total }
  },

  async findById(id: string, userId?: string) {
    const where = userId ? { id, userId } : { id }
    return db.incident.findFirst({
      where,
      include: {
        incidentType: {
          include: {
            recommendedChecklists: {
              where: { status: 'PUBLISHED' },
              select: { id: true, title: true },
            },
          },
        },
        events: { orderBy: { occurredAt: 'asc' } },
        reminders: { orderBy: { scheduledAt: 'asc' } },
      },
    })
  },

  async addEvent(data: {
    incidentId: string
    title: string
    description?: string
    eventType: string
    occurredAt?: Date
  }) {
    return db.incidentEvent.create({ data })
  },

  async updateStatus(id: string, status: IncidentStatus) {
    return db.incident.update({ where: { id }, data: { status } })
  },

  async createReminder(data: {
    incidentId: string
    scheduledAt: Date
    reminderType: string
    message?: string
  }) {
    return db.reminder.create({ data })
  },
}
