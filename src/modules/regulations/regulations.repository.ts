import { db } from '@/lib/db'
import type { ContentStatus } from '@prisma/client'

export const regulationsRepository = {
  async findMany(opts: {
    skip: number
    take: number
    search?: string
    category?: string
    status?: ContentStatus
  }) {
    const where = {
      status: opts.status ?? 'PUBLISHED' as ContentStatus,
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.search
        ? {
            OR: [
              { title: { contains: opts.search, mode: 'insensitive' as const } },
              { code: { contains: opts.search, mode: 'insensitive' as const } },
              { description: { contains: opts.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [regulations, total] = await Promise.all([
      db.regulation.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          code: true,
          category: true,
          year: true,
          description: true,
          sourceUrl: true,
          status: true,
          publishedAt: true,
          _count: { select: { articles: true } },
        },
      }),
      db.regulation.count({ where }),
    ])

    return { regulations, total }
  },

  async findById(id: string) {
    const direct = await db.regulation.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { articleNumber: 'asc' },
          select: {
            id: true,
            chapter: true,
            articleNumber: true,
            title: true,
            content: true,
          },
        },
        reviewer: { select: { name: true } },
      },
    })
    if (direct) return direct

    const clean = id.toLowerCase().replace(/[^a-z0-9]/g, ' ')
    const words = clean.split(/\s+/).filter((w) => w.length > 1)
    const all = await db.regulation.findMany({
      include: {
        articles: {
          orderBy: { articleNumber: 'asc' },
          select: {
            id: true,
            chapter: true,
            articleNumber: true,
            title: true,
            content: true,
          },
        },
        reviewer: { select: { name: true } },
      },
    })

    return (
      all.find((r) => {
        const target = (r.code + ' ' + r.title + ' ' + r.id).toLowerCase()
        return words.filter((w) => target.includes(w)).length >= 2
      }) ?? null
    )
  },

  async create(data: {
    title: string
    code: string
    category: string
    year: number
    description?: string
    sourceUrl?: string
  }) {
    return db.regulation.create({ data })
  },

  async updateStatus(id: string, status: ContentStatus, reviewerId?: string) {
    return db.regulation.update({
      where: { id },
      data: {
        status,
        reviewedById: reviewerId,
        ...(status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      },
    })
  },

  async fullTextSearch(query: string, take = 20) {
    // PostgreSQL full-text search via ilike — hybrid search dengan pgvector bisa ditambah nanti
    return db.regulationArticle.findMany({
      where: {
        regulation: { status: 'PUBLISHED' },
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      take,
      select: {
        id: true,
        articleNumber: true,
        title: true,
        content: true,
        regulation: { select: { id: true, title: true, code: true } },
      },
    })
  },
}
