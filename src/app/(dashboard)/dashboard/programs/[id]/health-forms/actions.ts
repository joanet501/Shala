'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/helpers'

export async function markHealthFormAsReviewed(healthFormId: string) {
  try {
    const { teacher } = await requireAuth()
    if (!teacher) {
      throw new Error('Unauthorized')
    }
    const teacherId = teacher.id

    // Verify the health form belongs to a booking of this teacher's program
    const healthForm = await prisma.healthForm.findFirst({
      where: {
        id: healthFormId
      },
      include: {
        booking: {
          include: {
            program: true
          }
        }
      }
    })

    if (!healthForm) {
      throw new Error('Health form not found')
    }

    if (healthForm.booking.program.teacherId !== teacherId) {
      throw new Error('Unauthorized: This health form does not belong to your program')
    }

    // Mark as reviewed
    await prisma.healthForm.update({
      where: {
        id: healthFormId
      },
      data: {
        isReviewed: true,
        reviewedAt: new Date(),
        reviewedBy: teacherId
      }
    })

    // Revalidate the page to show updated data
    revalidatePath(`/dashboard/programs/${healthForm.booking.programId}/health-forms`)

    return { success: true }
  } catch (error) {
    console.error('Error marking health form as reviewed:', error)
    throw error
  }
}

export async function markMultipleHealthFormsAsReviewed(healthFormIds: string[]) {
  try {
    const { teacher } = await requireAuth()
    if (!teacher) {
      throw new Error('Unauthorized')
    }
    const teacherId = teacher.id

    // Verify all health forms belong to this teacher's programs
    const healthForms = await prisma.healthForm.findMany({
      where: {
        id: {
          in: healthFormIds
        }
      },
      include: {
        booking: {
          include: {
            program: true
          }
        }
      }
    })

    const unauthorizedForms = healthForms.filter(hf => 
      hf.booking.program.teacherId !== teacherId
    )

    if (unauthorizedForms.length > 0) {
      throw new Error('Unauthorized: Some health forms do not belong to your programs')
    }

    // Mark all as reviewed
    await prisma.healthForm.updateMany({
      where: {
        id: {
          in: healthFormIds
        }
      },
      data: {
        isReviewed: true,
        reviewedAt: new Date(),
        reviewedBy: teacherId
      }
    })

    // Revalidate pages for all affected programs
    const programIds = [...new Set(healthForms.map(hf => hf.booking.programId))]
    programIds.forEach(programId => {
      revalidatePath(`/dashboard/programs/${programId}/health-forms`)
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking health forms as reviewed:', error)
    throw error
  }
}