import { checklistsRepository } from './checklists.repository'
import { NotFoundError, ForbiddenError } from '@/lib/errors'
import { db } from '@/lib/db'
import { z } from 'zod'

export const createChecklistSchema = z.object({
  templateId: z.string().cuid(),
  title: z.string().min(2).max(200).optional(),
})

export const updateItemSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().max(1000).optional(),
})

export const checklistsService = {
  async listTemplates(skip: number, take: number) {
    return checklistsRepository.findTemplates({ skip, take })
  },

  async getTemplate(id: string) {
    const template = await checklistsRepository.findTemplateById(id)
    if (!template || template.status !== 'PUBLISHED') throw new NotFoundError('Template checklist')
    return template
  },

  async createInstance(userId: string, input: z.infer<typeof createChecklistSchema>) {
    const template = await checklistsRepository.findTemplateById(input.templateId)
    if (!template || template.status !== 'PUBLISHED') throw new NotFoundError('Template checklist')

    const title = input.title ?? template.title
    const instance = await checklistsRepository.createInstance(userId, input.templateId, title)
    if (!instance) throw new NotFoundError('Template checklist')

    await db.auditLog.create({
      data: {
        userId,
        action: 'CHECKLIST_CREATED',
        entityType: 'ChecklistInstance',
        entityId: instance.id,
      },
    })

    return instance
  },

  async listInstances(userId: string, skip: number, take: number) {
    return checklistsRepository.findInstancesByUser(userId, skip, take)
  },

  async getInstance(instanceId: string, userId: string) {
    const instance = await checklistsRepository.findInstanceById(instanceId, userId)
    if (!instance) throw new NotFoundError('Checklist')
    return instance
  },

  async updateItem(
    instanceId: string,
    itemId: string,
    userId: string,
    input: z.infer<typeof updateItemSchema>,
  ) {
    // Verifikasi kepemilikan instance (IDOR prevention)
    const instance = await checklistsRepository.findInstanceById(instanceId, userId)
    if (!instance) throw new NotFoundError('Checklist')
    if (instance.userId !== userId) throw new ForbiddenError()

    if (input.isCompleted) {
      await checklistsRepository.markItemComplete(instanceId, itemId, input.notes)
    } else {
      await checklistsRepository.markItemIncomplete(instanceId, itemId)
    }

    return checklistsRepository.refreshInstanceStatus(instanceId)
  },
}
