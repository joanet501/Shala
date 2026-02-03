import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/helpers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthFormReviewList } from './components/health-form-review-list'
import { CheckIcon, AlertTriangleIcon } from 'lucide-react'

interface HealthFormsPageProps {
  params: { id: string }
}

async function getProgram(programId: string, teacherId: string) {
  const program = await prisma.program.findFirst({
    where: {
      id: programId,
      teacherId: teacherId
    },
    include: {
      bookings: {
        include: {
          student: true,
          healthForm: true
        },
        where: {
          healthForm: {
            isNot: null
          }
        }
      }
    }
  })

  if (!program) {
    return null
  }

  return program
}

export default async function HealthFormsPage({ params }: HealthFormsPageProps) {
  const t = await getTranslations('healthForms')
  const { teacher } = await requireAuth()

  if (!teacher) {
    notFound()
  }

  const program = await getProgram(params.id, teacher.id)

  if (!program) {
    notFound()
  }

  const healthForms = program.bookings
    .filter(booking => booking.healthForm)
    .map(booking => ({
      id: booking.healthForm!.id,
      student: booking.student,
      healthForm: booking.healthForm!,
      booking: booking
    }))

  const reviewedCount = healthForms.filter(hf => hf.healthForm.isReviewed).length
  const unreviewed = healthForms.filter(hf => !hf.healthForm.isReviewed)
  const flaggedForms = healthForms.filter(hf => 
    hf.healthForm.isPregnant || 
    hf.healthForm.hadRecentSurgery || 
    hf.healthForm.healthConditions.length > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')} <span className="font-medium">{program.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.total')}</CardTitle>
            <CheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthForms.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.reviewed')}</CardTitle>
            <CheckIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.pending')}</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreviewed.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.flagged')}</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedForms.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Health Forms List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {healthForms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('noHealthForms')}
            </p>
          ) : (
            <HealthFormReviewList 
              healthForms={healthForms}
              programId={params.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}