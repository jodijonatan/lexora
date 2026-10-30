import { incidentsRepository } from './incidents.repository'
import { NotFoundError, ForbiddenError } from '@/lib/errors'
import { db } from '@/lib/db'
import { z } from 'zod'

export const createIncidentSchema = z.object({
  incidentTypeId: z.string().min(1),
  title: z.string().min(5).max(300),
  description: z.string().min(10).max(5000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('HIGH'),
})

export const createReminderSchema = z.object({
  scheduledAt: z.string().datetime(),
  reminderType: z.string().min(2).max(50),
  message: z.string().max(1000).optional(),
})

export const incidentsService = {
  async listTypes() {
    return incidentsRepository.findTypes()
  },

  async create(userId: string, input: z.infer<typeof createIncidentSchema>) {
    let incidentType = await db.incidentType.findFirst({
      where: {
        OR: [
          { id: input.incidentTypeId },
          { slug: input.incidentTypeId },
          { slug: input.incidentTypeId === 'breach' ? 'kebocoran-data-pribadi' : 'penipuan-online' },
        ],
      },
    })
    if (!incidentType) {
      incidentType = await db.incidentType.findFirst()
    }
    if (!incidentType) throw new NotFoundError('Jenis insiden')

    // Hitung deadline berdasarkan konfigurasi jenis insiden (bukan hardcode)
    const deadlineAt = new Date(
      Date.now() + incidentType.defaultDeadlineHours * 60 * 60 * 1000,
    )

    const incident = await incidentsRepository.create({
      ...input,
      incidentTypeId: incidentType.id,
      userId,
      deadlineAt,
    })

    await incidentsRepository.addEvent({
      incidentId: incident.id,
      title: 'Insiden Dilaporkan',
      description: `Insiden dilaporkan dengan tingkat keparahan ${input.severity}`,
      eventType: 'REPORTED',
    })

    // Buat reminder otomatis (50% dan 75% dari tenggat)
    const half = new Date(Date.now() + (incidentType.defaultDeadlineHours * 0.5) * 60 * 60 * 1000)
    const threeQ = new Date(Date.now() + (incidentType.defaultDeadlineHours * 0.75) * 60 * 60 * 1000)

    await Promise.all([
      incidentsRepository.createReminder({
        incidentId: incident.id,
        scheduledAt: half,
        reminderType: 'DEADLINE_50',
        message: `Pengingat: Tenggat pelaporan insiden "${incident.title}" sudah 50% terlewati.`,
      }),
      incidentsRepository.createReminder({
        incidentId: incident.id,
        scheduledAt: threeQ,
        reminderType: 'DEADLINE_75',
        message: `Peringatan: Tenggat pelaporan insiden "${incident.title}" sudah 75% terlewati!`,
      }),
    ])

    await db.auditLog.create({
      data: {
        userId,
        action: 'INCIDENT_REPORTED',
        entityType: 'Incident',
        entityId: incident.id,
      },
    })

    return incident
  },

  async list(userId: string, skip: number, take: number, role?: string) {
    const isAdminOrReviewer = role === 'ADMIN' || role === 'LEGAL_REVIEWER'
    return incidentsRepository.findByUser(isAdminOrReviewer ? undefined : userId, skip, take)
  },

  async getById(incidentId: string, userId: string, role?: string) {
    const isAdminOrReviewer = role === 'ADMIN' || role === 'LEGAL_REVIEWER'
    const incident = await incidentsRepository.findById(incidentId, isAdminOrReviewer ? undefined : userId)
    if (!incident) throw new NotFoundError('Insiden')
    if (!isAdminOrReviewer && incident.userId !== userId) throw new ForbiddenError()
    return incident
  },

  async updateStatus(incidentId: string, userId: string, status: string, role?: string) {
    const isAdminOrReviewer = role === 'ADMIN' || role === 'LEGAL_REVIEWER'
    const incident = await incidentsRepository.findById(incidentId, isAdminOrReviewer ? undefined : userId)
    if (!incident) throw new NotFoundError('Insiden')
    if (!isAdminOrReviewer && incident.userId !== userId) throw new ForbiddenError()

    const updated = await incidentsRepository.updateStatus(
      incidentId,
      status as 'REPORTED' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'CLOSED',
    )

    await incidentsRepository.addEvent({
      incidentId,
      title: `Status diubah ke ${status}`,
      eventType: 'STATUS_CHANGE',
    })

    return updated
  },

  async addReminder(
    incidentId: string,
    userId: string,
    input: z.infer<typeof createReminderSchema>,
    role?: string,
  ) {
    const isAdminOrReviewer = role === 'ADMIN' || role === 'LEGAL_REVIEWER'
    const incident = await incidentsRepository.findById(incidentId, isAdminOrReviewer ? undefined : userId)
    if (!incident) throw new NotFoundError('Insiden')
    if (!isAdminOrReviewer && incident.userId !== userId) throw new ForbiddenError()

    return incidentsRepository.createReminder({
      incidentId,
      scheduledAt: new Date(input.scheduledAt),
      reminderType: input.reminderType,
      message: input.message,
    })
  },
}
