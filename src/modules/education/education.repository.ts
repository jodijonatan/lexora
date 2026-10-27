import { db } from '@/lib/db'
import type { ContentStatus, TargetAudience } from '@prisma/client'

export const educationRepository = {
  async findCourses(opts: {
    skip: number
    take: number
    audience?: TargetAudience
    status?: ContentStatus
  }) {
    const where = {
      status: opts.status ?? ('PUBLISHED' as ContentStatus),
      ...(opts.audience ? { targetAudience: opts.audience } : {}),
    }
    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip: opts.skip,
        take: opts.take,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { lessons: true } } },
      }),
      db.course.count({ where }),
    ])
    return { courses, total }
  },

  async findCourseById(id: string) {
    return db.course.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { quizzes: true } } },
        },
      },
    })
  },

  async findLessonById(id: string) {
    return db.lesson.findUnique({
      where: { id },
      include: { quizzes: true, course: { select: { id: true, title: true } } },
    })
  },

  async upsertProgress(userId: string, lessonId: string, isCompleted: boolean, score?: number) {
    return db.learningProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: {
        isCompleted,
        score,
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
      create: {
        userId,
        lessonId,
        isCompleted,
        score,
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
    })
  },

  async findProgressByUser(userId: string, courseId: string) {
    const lessons = await db.lesson.findMany({ where: { courseId }, select: { id: true } })
    const lessonIds = lessons.map((l) => l.id)

    const progress = await db.learningProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
    })

    return {
      total: lessons.length,
      completed: progress.filter((p) => p.isCompleted).length,
      progress,
    }
  },
}
