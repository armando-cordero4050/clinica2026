'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { testSupabaseConnection } from './actions'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function SupabaseSettingsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleTest = async () => {
    setStatus('loading')
    const result = await testSupabaseConnection()
    if (result.success) {
      setStatus('success')
      setMessage(result.message)
    } else {
      setStatus('error')
      setMessage(result.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Supabase Connection</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>
            Verify connectivity with your Supabase instance (configured in .env.local).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md text-sm font-mono">
            NEXT_PUBLIC_SUPABASE_URL=...<br/>
            NEXT_PUBLIC_SUPABASE_ANON_KEY=***
          </div>

          {status === 'success' && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleTest} disabled={status === 'loading'}>
            {status === 'loading' ? 'Testing Connection...' : 'Test Connection'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
