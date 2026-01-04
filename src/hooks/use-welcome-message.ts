'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WelcomeStyle, WelcomeVariant } from '@/components/ui/welcome-toast'

const STORAGE_KEY = 'dentalflow_welcome_shown_v2' // Bumped version

interface WelcomeConfig {
    enabled: boolean
    style: WelcomeStyle
    variant?: WelcomeVariant
    duration: number
    title: string
    subtitle: string
}

const DEFAULT_CONFIG: WelcomeConfig = {
    enabled: true,
    style: 'nano',
    variant: 'original',
    duration: 5000,
    title: 'Bienvenido',
    subtitle: 'DentalFlow V5'
}

export function useWelcomeMessage() {
    const [isVisible, setIsVisible] = useState(false)
    const [config, setConfig] = useState<WelcomeConfig>(DEFAULT_CONFIG)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        const initWelcome = async () => {
            const supabase = createClient()
            
            try {
                // 2. Fetch User & Profile
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase.rpc('get_my_profile')
                const name = profile?.name || profile?.email?.split('@')[0] || 'Doctor'
                setUserName(name)

                // 3. Fetch Configuration
                const { data: remoteConfig } = await supabase.rpc('get_config', { p_key: 'welcome_message' })
                
                const finalConfig = remoteConfig ? { ...DEFAULT_CONFIG, ...remoteConfig } : DEFAULT_CONFIG
                setConfig(finalConfig)

                // 4. Trigger if enabled
                if (finalConfig.enabled) {
                    // Small delay for animation smoothness after load
                    setTimeout(() => {
                        setIsVisible(true)
                        
                        // Mark as shown for this session
                        sessionStorage.setItem(STORAGE_KEY, 'true')

                        // Auto hide
                        setTimeout(() => {
                            setIsVisible(false)
                        }, finalConfig.duration)
                    }, 500)
                }

            } catch (err) {
                console.error('Error initiating welcome message:', err)
            }
        }

        initWelcome()
    }, [])

    return {
        isVisible,
        config,
        userName,
        onClose: () => setIsVisible(false)
    }
}
