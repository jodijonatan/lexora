import { db } from '@/lib/db'
import type { ContentStatus } from '@prisma/client'

export const checklistsRepository = {
  async findTemplates(opts: { skip: number; take: number; status?: ContentStatus }) {
    const where = { status: opts.status ?? ('PUBLISHED' as ContentStatus) }
    const [templates, total] = await Promise.all([
      db.checklistTemplate.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { items: true } },
          incidentType: { select: { name: true } },
        },
      }),
      db.checklistTemplate.count({ where }),
    ])
    return { templates, total }
  },

  async findTemplateById(id: string) {
    return db.checklistTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            article: {
              select: {
                articleNumber: true,
                title: true,
                regulation: { select: { code: true, title: true } },
              },
            },
            docTemplate: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    })
  },

  async createInstance(userId: string, templateId: string, title: string) {
    const template = await db.checklistTemplate.findUnique({
      where: { id: templateId },
      include: { items: true },
    })
    if (!template) return null

    return db.checklistInstance.create({
      data: {
        userId,
        templateId,
        title,
        progressItems: {
          create: template.items.map((item) => ({ itemId: item.id })),
        },
      },
      include: { progressItems: true },
    })
  },

  async findInstancesByUser(userId: string, skip: number, take: number) {
    const [instances, total] = await Promise.all([
      db.checklistInstance.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          template: { select: { title: true } },
          _count: { select: { progressItems: true } },
        },
      }),
      db.checklistInstance.count({ where: { userId } }),
    ])
    return { instances, total }
  },

  async findInstanceById(id: string, userId: string) {
    return db.checklistInstance.findFirst({
      where: { id, userId },
      include: {
        template: { select: { title: true, description: true } },
        progressItems: {
          include: {
            item: {
              include: {
                article: {
                  select: {
                    articleNumber: true,
                    title: true,
                    regulation: { select: { code: true, title: true } },
                  },
                },
                docTemplate: { select: { id: true, title: true, slug: true } },
              },
            },
          },
          orderBy: { item: { order: 'asc' } },
        },
      },
    })
  },

  async markItemComplete(instanceId: string, itemId: string, notes?: string) {
    return db.checklistProgress.update({
      where: { instanceId_itemId: { instanceId, itemId } },
      data: { isCompleted: true, completedAt: new Date(), notes },
    })
  },

  async markItemIncomplete(instanceId: string, itemId: string) {
    return db.checklistProgress.update({
      where: { instanceId_itemId: { instanceId, itemId } },
      data: { isCompleted: false, completedAt: null },
    })
  },

  /** Hitung progres dan update status instance. */
  async refreshInstanceStatus(instanceId: string) {
    const progresses = await db.checklistProgress.findMany({
      where: { instanceId },
    })
    const completed = progresses.filter((p) => p.isCompleted).length
    const total = progresses.length
    const status =
      completed === 0 ? 'NOT_STARTED' : completed === total ? 'COMPLETED' : 'IN_PROGRESS'

    return db.checklistInstance.update({
      where: { id: instanceId },
      data: { status: status as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' },
    })
  },
}
