import { db } from '@/lib/db'
import type { ContentStatus } from '@prisma/client'

export const templatesRepository = {
  async findMany(opts: { skip: number; take: number; status?: ContentStatus }) {
    const where = { status: opts.status ?? ('PUBLISHED' as ContentStatus) }
    const [templates, total] = await Promise.all([
      db.docTemplate.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          status: true,
          createdAt: true,
        },
      }),
      db.docTemplate.count({ where }),
    ])
    return { templates, total }
  },

  async findById(id: string) {
    return db.docTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        formSchema: true,
        contentTemplate: true,
        status: true,
        reviewer: { select: { name: true } },
      },
    })
  },

  async findBySlug(slug: string) {
    return db.docTemplate.findUnique({ where: { slug } })
  },

  async createGeneratedDocument(data: {
    userId: string
    templateId: string
    title: string
    formData: Record<string, unknown>
    generatedContent: string
  }) {
    return db.generatedDocument.create({
      data: {
        ...data,
        // Prisma Json field memerlukan cast eksplisit
        formData: data.formData as import('@prisma/client').Prisma.InputJsonValue,
      },
    })
  },

  async findGeneratedByUser(userId: string, skip: number, take: number) {
    const [documents, total] = await Promise.all([
      db.generatedDocument.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { template: { select: { title: true, slug: true } } },
      }),
      db.generatedDocument.count({ where: { userId } }),
    ])
    return { documents, total }
  },
}
