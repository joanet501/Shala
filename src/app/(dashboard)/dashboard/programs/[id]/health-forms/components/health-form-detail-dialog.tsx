'use client'

import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CheckIcon, 
  AlertTriangleIcon, 
  BabyIcon, 
  ScissorsIcon,
  CheckCircleIcon,
  XIcon
} from 'lucide-react'

interface HealthFormData {
  id: string
  student: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  healthForm: {
    id: string
    isPregnant: boolean
    hadRecentSurgery: boolean
    healthConditions: string[]
    conditionDetails: string | null
    isReviewed: boolean
    reviewedAt: Date | null
    howDidYouHear: string | null
    previousYogaPractice: string | null
    hasLearnedIshaYoga: boolean
    ishaYogaPractices: string | null
    consentGiven: boolean
    createdAt: Date
  }
  booking: {
    id: string
    status: string
  }
}

interface HealthFormDetailDialogProps {
  healthFormData: HealthFormData
  isOpen: boolean
  onClose: () => void
  onMarkReviewed: (healthFormId: string) => void
}

export function HealthFormDetailDialog({ 
  healthFormData, 
  isOpen, 
  onClose, 
  onMarkReviewed 
}: HealthFormDetailDialogProps) {
  const t = useTranslations('healthForms')
  const { student, healthForm } = healthFormData

  const healthConditionLabels: Record<string, string> = {
    'heart_disease': t('conditions.heartDisease'),
    'high_blood_pressure': t('conditions.highBloodPressure'),
    'diabetes': t('conditions.diabetes'),
    'asthma': t('conditions.asthma'),
    'back_problems': t('conditions.backProblems'),
    'neck_problems': t('conditions.neckProblems'),
    'knee_problems': t('conditions.kneeProblems'),
    'shoulder_problems': t('conditions.shoulderProblems'),
    'anxiety': t('conditions.anxiety'),
    'depression': t('conditions.depression'),
    'eating_disorder': t('conditions.eatingDisorder'),
    'other': t('conditions.other')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('detail.title')}</span>
            <Badge variant={healthForm.isReviewed ? 'secondary' : 'destructive'}>
              {healthForm.isReviewed ? (
                <>
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  {t('status.reviewed')}
                </>
              ) : (
                <>
                  <AlertTriangleIcon className="h-3 w-3 mr-1" />
                  {t('status.pendingReview')}
                </>
              )}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {student.firstName} {student.lastName} • {student.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Health Flags Section */}
          <div>
            <h3 className="font-medium mb-3">{t('detail.healthFlags')}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BabyIcon className="h-4 w-4 text-pink-600" />
                <span className="text-sm">{t('detail.pregnancy')}</span>
                <Badge variant={healthForm.isPregnant ? 'destructive' : 'secondary'}>
                  {healthForm.isPregnant ? t('common.yes') : t('common.no')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <ScissorsIcon className="h-4 w-4 text-red-600" />
                <span className="text-sm">{t('detail.recentSurgery')}</span>
                <Badge variant={healthForm.hadRecentSurgery ? 'destructive' : 'secondary'}>
                  {healthForm.hadRecentSurgery ? t('common.yes') : t('common.no')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Health Conditions */}
          <div>
            <h3 className="font-medium mb-3">{t('detail.healthConditions')}</h3>
            {healthForm.healthConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('detail.noConditions')}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {healthForm.healthConditions.map((condition) => (
                    <Badge key={condition} variant="outline" className="bg-yellow-50 text-yellow-800">
                      <AlertTriangleIcon className="h-3 w-3 mr-1" />
                      {healthConditionLabels[condition] || condition}
                    </Badge>
                  ))}
                </div>
                {healthForm.conditionDetails && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t('detail.conditionDetails')}</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {healthForm.conditionDetails}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Yoga Background */}
          <div>
            <h3 className="font-medium mb-3">{t('detail.yogaBackground')}</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">{t('detail.howDidYouHear')}</p>
                <p className="text-sm text-muted-foreground">
                  {healthForm.howDidYouHear || t('detail.notProvided')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">{t('detail.previousPractice')}</p>
                <p className="text-sm text-muted-foreground">
                  {healthForm.previousYogaPractice || t('detail.notProvided')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">{t('detail.hasLearnedIsha')}</p>
                <Badge variant={healthForm.hasLearnedIshaYoga ? 'default' : 'secondary'}>
                  {healthForm.hasLearnedIshaYoga ? t('common.yes') : t('common.no')}
                </Badge>
              </div>

              {healthForm.hasLearnedIshaYoga && healthForm.ishaYogaPractices && (
                <div>
                  <p className="text-sm font-medium mb-1">{t('detail.ishaPractices')}</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {healthForm.ishaYogaPractices}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Consent */}
          <div>
            <h3 className="font-medium mb-3">{t('detail.consent')}</h3>
            <div className="flex items-center gap-2">
              {healthForm.consentGiven ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              ) : (
                <XIcon className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {healthForm.consentGiven 
                  ? t('detail.consentGiven')
                  : t('detail.consentNotGiven')
                }
              </span>
            </div>
          </div>

          <Separator />

          {/* Submission Info */}
          <div>
            <h3 className="font-medium mb-3">{t('detail.submissionInfo')}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                {t('detail.submittedOn', { 
                  date: new Date(healthForm.createdAt).toLocaleString()
                })}
              </p>
              {healthForm.isReviewed && healthForm.reviewedAt && (
                <p>
                  {t('detail.reviewedOn', { 
                    date: new Date(healthForm.reviewedAt).toLocaleString()
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onClose}>
            {t('actions.close')}
          </Button>
          
          {!healthForm.isReviewed && (
            <Button onClick={() => {
              onMarkReviewed(healthForm.id)
              onClose()
            }}>
              <CheckIcon className="h-4 w-4 mr-1" />
              {t('actions.markReviewed')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}