'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { WelcomeToast, WelcomeStyle, WelcomeVariant } from '@/components/ui/welcome-toast'

const STYLES_CONFIG = [
    {
        id: 'nano',
        label: 'Nano Banana (Creative)',
        variants: [
            { id: 'original', label: 'Original' },
            { id: 'sunset', label: 'Sunset' },
            { id: 'ocean', label: 'Ocean' },
            { id: 'midnight', label: 'Midnight' }
        ]
    },
    {
        id: 'glass',
        label: 'Glassmorphism (Modern)',
        variants: [
            { id: 'frost', label: 'Frost (Default)' },
            { id: 'dark', label: 'Dark Glass' },
            { id: 'acrylic', label: 'Acrylic White' },
            { id: 'tinted', label: 'Blue Tint' }
        ]
    },
    {
        id: 'minimal',
        label: 'Minimal (Corporate)',
        variants: [
            { id: 'simple', label: 'Simple' },
            { id: 'dark', label: 'Dark Mode' },
            { id: 'border', label: 'Bordered' },
            { id: 'accent', label: 'Accent' }
        ]
    }
]

export default function WelcomeDemoPage() {
    const [style, setStyle] = useState<WelcomeStyle>('nano')
    const [variant, setVariant] = useState<WelcomeVariant>('original')
    const [userName, setUserName] = useState('Doctor Pedro')
    const [isVisible, setIsVisible] = useState(false)

    const handleSimulate = (s: string, v: string) => {
        setStyle(s as WelcomeStyle)
        setVariant(v as WelcomeVariant)
        setIsVisible(false)
        setTimeout(() => setIsVisible(true), 150)
        setTimeout(() => setIsVisible(false), 4000)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 gap-8">
            <WelcomeToast 
                isVisible={isVisible} 
                style={style}
                variant={variant} 
                userName={userName}
                onClose={() => setIsVisible(false)}
            />

            <div className="text-center space-y-2">
                 <h1 className="text-3xl font-bold text-slate-900">Welcome Experience Studio</h1>
                 <p className="text-slate-500">Preview and customize login notifications.</p>
            </div>

            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Control Panel</CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                        <Label className="whitespace-nowrap">Testing User Name:</Label>
                        <Input 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                            className="max-w-[200px]"
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {STYLES_CONFIG.map((group) => (
                            <div key={group.id} className="space-y-4">
                                <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                                    {group.id === 'nano' && '🍌'}
                                    {group.id === 'glass' && '💎'}
                                    {group.id === 'minimal' && '✅'}
                                    {group.label}
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {group.variants.map((v) => (
                                        <Button
                                            key={v.id}
                                            variant="outline"
                                            className="justify-between hover:border-indigo-300 hover:text-indigo-600 transition-all"
                                            onClick={() => handleSimulate(group.id, v.id)}
                                        >
                                            {v.label}
                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Preview</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
