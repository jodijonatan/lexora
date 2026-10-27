import { educationRepository } from './education.repository'
import { NotFoundError } from '@/lib/errors'
import { z } from 'zod'
import type { TargetAudience } from '@prisma/client'

export const updateProgressSchema = z.object({
  isCompleted: z.boolean(),
  score: z.number().int().min(0).max(100).optional(),
})

export const educationService = {
  async listCourses(
    skip: number,
    take: number,
    audience?: string,
  ) {
    return educationRepository.findCourses({
      skip,
      take,
      audience: audience as TargetAudience | undefined,
    })
  },

  async getCourse(id: string) {
    const course = await educationRepository.findCourseById(id)
    if (!course || course.status !== 'PUBLISHED') throw new NotFoundError('Kursus')
    return course
  },

  async getLesson(id: string) {
    const lesson = await educationRepository.findLessonById(id)
    if (!lesson) throw new NotFoundError('Pelajaran')
    return lesson
  },

  async updateProgress(
    userId: string,
    lessonId: string,
    input: z.infer<typeof updateProgressSchema>,
  ) {
    const lesson = await educationRepository.findLessonById(lessonId)
    if (!lesson) throw new NotFoundError('Pelajaran')

    return educationRepository.upsertProgress(userId, lessonId, input.isCompleted, input.score)
  },

  async getCourseProgress(userId: string, courseId: string) {
    const course = await educationRepository.findCourseById(courseId)
    if (!course) throw new NotFoundError('Kursus')

    return educationRepository.findProgressByUser(userId, courseId)
  },
}
