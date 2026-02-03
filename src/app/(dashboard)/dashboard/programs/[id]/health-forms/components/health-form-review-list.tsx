'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  CheckIcon, 
  AlertTriangleIcon, 
  BabyIcon, 
  ScissorsIcon, 
  EyeIcon,
  CheckCircleIcon
} from 'lucide-react'
import { markHealthFormAsReviewed } from '../actions'
import { HealthFormDetailDialog } from './health-form-detail-dialog'

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

interface HealthFormReviewListProps {
  healthForms: HealthFormData[]
  programId: string
}

export function HealthFormReviewList({ healthForms, programId }: HealthFormReviewListProps) {
  const t = useTranslations('healthForms')
  const [reviewingIds, setReviewingIds] = useState<Set<string>>(new Set())
  const [selectedHealthForm, setSelectedHealthForm] = useState<HealthFormData | null>(null)
  const [optimisticReviewed, setOptimisticReviewed] = useState<Set<string>>(new Set())

  const handleMarkAsReviewed = async (healthFormId: string) => {
    setReviewingIds(prev => new Set(prev).add(healthFormId))
    setOptimisticReviewed(prev => new Set(prev).add(healthFormId))
    
    try {
      await markHealthFormAsReviewed(healthFormId)
    } catch (error) {
      console.error('Failed to mark health form as reviewed:', error)
      setOptimisticReviewed(prev => {
        const newSet = new Set(prev)
        newSet.delete(healthFormId)
        return newSet
      })
    } finally {
      setReviewingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(healthFormId)
        return newSet
      })
    }
  }

  const getHealthFlags = (healthForm: HealthFormData['healthForm']) => {
    const flags = []
    
    if (healthForm.isPregnant) {
      flags.push({
        icon: <BabyIcon className="h-3 w-3" />,
        label: t('flags.pregnant'),
        color: 'bg-pink-100 text-pink-800'
      })
    }
    
    if (healthForm.hadRecentSurgery) {
      flags.push({
        icon: <ScissorsIcon className="h-3 w-3" />,
        label: t('flags.recentSurgery'),
        color: 'bg-red-100 text-red-800'
      })
    }
    
    if (healthForm.healthConditions.length > 0) {
      flags.push({
        icon: <AlertTriangleIcon className="h-3 w-3" />,
        label: t('flags.healthConditions', { count: healthForm.healthConditions.length }),
        color: 'bg-yellow-100 text-yellow-800'
      })
    }
    
    return flags
  }

  const sortedHealthForms = [...healthForms].sort((a, b) => {
    // Unreviewed first
    const aReviewed = a.healthForm.isReviewed || optimisticReviewed.has(a.healthForm.id)
    const bReviewed = b.healthForm.isReviewed || optimisticReviewed.has(b.healthForm.id)
    
    if (aReviewed !== bReviewed) {
      return aReviewed ? 1 : -1
    }
    
    // Then by creation date (newest first)
    return new Date(b.healthForm.createdAt).getTime() - new Date(a.healthForm.createdAt).getTime()
  })

  return (
    <>
      <div className="space-y-4">
        {sortedHealthForms.map((item) => {
          const { student, healthForm } = item
          const flags = getHealthFlags(healthForm)
          const isReviewed = healthForm.isReviewed || optimisticReviewed.has(healthForm.id)
          const isReviewing = reviewingIds.has(healthForm.id)

          return (
            <Card key={healthForm.id} className={isReviewed ? 'bg-muted/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">
                        {student.firstName} {student.lastName}
                      </h3>
                      <Badge variant={isReviewed ? 'secondary' : 'destructive'}>
                        {isReviewed ? (
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
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {student.email}
                    </p>

                    {/* Health Flags */}
                    {flags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {flags.map((flag, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className={flag.color}
                          >
                            {flag.icon}
                            <span className="ml-1">{flag.label}</span>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {t('submittedOn', { 
                        date: new Date(healthForm.createdAt).toLocaleDateString()
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHealthForm(item)}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {t('actions.view')}
                    </Button>

                    {!isReviewed && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsReviewed(healthForm.id)}
                        disabled={isReviewing}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        {isReviewing ? t('actions.marking') : t('actions.markReviewed')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Health Form Detail Dialog */}
      {selectedHealthForm && (
        <HealthFormDetailDialog
          healthFormData={selectedHealthForm}
          isOpen={!!selectedHealthForm}
          onClose={() => setSelectedHealthForm(null)}
          onMarkReviewed={handleMarkAsReviewed}
        />
      )}
    </>
  )
}