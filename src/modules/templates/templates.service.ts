import { templatesRepository } from './templates.repository'
import { NotFoundError } from '@/lib/errors'
import { db } from '@/lib/db'
import { z } from 'zod'

export const generateDocumentSchema = z.object({
  formData: z.record(z.string(), z.unknown()),
})

/**
 * Isi variabel `{{key}}` dalam template dengan nilai dari formData.
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const val = data[key]
    return val !== undefined && val !== null ? String(val) : `[${key}]`
  })
}

export const templatesService = {
  async list(skip: number, take: number) {
    return templatesRepository.findMany({ skip, take })
  },

  async getById(id: string) {
    const template = await templatesRepository.findById(id)
    if (!template || template.status !== 'PUBLISHED') throw new NotFoundError('Template dokumen')
    return template
  },

  async generate(
    templateId: string,
    userId: string,
    input: z.infer<typeof generateDocumentSchema>,
  ) {
    const template = await templatesRepository.findById(templateId)
    if (!template || template.status !== 'PUBLISHED') throw new NotFoundError('Template dokumen')

    const generatedContent = renderTemplate(
      template.contentTemplate,
      input.formData as Record<string, unknown>,
    )

    const doc = await templatesRepository.createGeneratedDocument({
      userId,
      templateId,
      title: `${template.title} — ${new Date().toLocaleDateString('id-ID')}`,
      formData: input.formData as Record<string, unknown>,
      generatedContent,
    })

    db.auditLog
      .create({
        data: {
          userId,
          action: 'DOCUMENT_GENERATED',
          entityType: 'GeneratedDocument',
          entityId: doc.id,
          details: { templateId },
        },
      })
      .catch(() => {})

    return doc
  },

  async listGenerated(userId: string, skip: number, take: number) {
    return templatesRepository.findGeneratedByUser(userId, skip, take)
  },
}
