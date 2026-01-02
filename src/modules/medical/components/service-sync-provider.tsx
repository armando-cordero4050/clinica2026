'use client'

import { useEffect } from 'react'
import { syncServicesFromOdoo } from '@/modules/medical/actions/sync-services'

interface ServiceSyncProviderProps {
  clinicId: string
  children: React.ReactNode
}

/**
 * Provider that auto-syncs services every 5 minutes
 * Place this in the medical layout to enable auto-sync
 */
export function ServiceSyncProvider({ clinicId, children }: ServiceSyncProviderProps) {
  useEffect(() => {
    // Initial sync on mount
    const performSync = async () => {
      try {
        const result = await syncServicesFromOdoo(clinicId)
        if (result.success) {
          console.log('[ServiceSync] Sync completed:', result.data)
        } else {
          console.error('[ServiceSync] Sync failed:', result.message)
        }
      } catch (error) {
        console.error('[ServiceSync] Unexpected error:', error)
      }
    }

    // Run initial sync
    performSync()

    // Setup interval for every 5 minutes (300000ms)
    const intervalId = setInterval(performSync, 5 * 60 * 1000)

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [clinicId])

  return <>{children}</>
}
