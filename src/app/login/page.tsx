'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Stethoscope, Microscope, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [loginType, setLoginType] = useState<'clinic' | 'lab'>('clinic')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setLoading(true)
      setError('')
      setMessage('')

      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'patient' // Default, will be updated by trigger or manual SQL
            }
        }
      })

      if (authError) {
        setError(authError.message)
      } else {
        setMessage('Account created! Please check your email to confirm, or ask Admin to verify.')
        setIsRegistering(false) // Switch back to login
      }
      setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
        {/* LEFT SIDE: FORM */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-24 xl:px-32 relative z-10 animate-in slide-in-from-left duration-700">
            <div className="mb-10 text-center lg:text-left">
                <Link href="/" className="inline-flex items-center gap-2 mb-8 text-blue-600 font-bold text-xl hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg transform rotate-45"></div>
                    IMFOHSA
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500">Please enter your details to sign in.</p>
            </div>

            {/* Login Type Switcher */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl mb-8">
                <button 
                    onClick={() => setLoginType('clinic')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                        loginType === 'clinic' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Stethoscope className="w-4 h-4" />
                    Clínica
                </button>
                <button 
                    onClick={() => setLoginType('lab')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                        loginType === 'lab' 
                        ? 'bg-white text-orange-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Microscope className="w-4 h-4" />
                    Laboratorio
                </button>
            </div>

            <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-lg w-full max-w-sm mx-auto">
                 <button 
                     onClick={() => { setIsRegistering(false); setError(''); }}
                     className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isRegistering ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                 >
                     Login
                 </button>
                 <button 
                     onClick={() => { setIsRegistering(true); setError(''); }}
                     className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isRegistering ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                 >
                     Register
                 </button>
            </div>

            <form onSubmit={isRegistering ? handleSignUp : handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="admin@dentalflow.com" 
                        required 
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-pulse">
                        ⚠️ {error}
                    </div>
                )}
                
                {message && (
                    <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm font-medium border border-green-100 animate-pulse">
                        ✅ {message}
                    </div>
                )}

                <Button 
                    type="submit" 
                    className={`w-full h-12 text-lg font-bold shadow-lg transition-all transform hover:-translate-y-1 ${
                        loginType === 'clinic' 
                            ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-200' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-orange-200'
                    }`} 
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Create Account' : 'Log In')}
                </Button>
            </form>
        </div>

        {/* RIGHT SIDE: ILLUSTRATION (Space/Rocket) */}
        <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
            {/* Background Stars/Nebula */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
            
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-300"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center p-12 w-full max-w-lg">
                <style jsx global>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(2deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .animate-spin-slow {
                        animation: spin-slow 20s linear infinite;
                    }
                `}</style>

                <div className="mb-8 relative inline-flex justify-center items-center w-[500px] h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={loginType}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 w-full h-full flex items-center justify-center mix-blend-lighten"
                        >
                             <img 
                                src={loginType === 'clinic' 
                                    ? "/assets/clinic_3d.png" 
                                    : "/assets/lab_3d.png"
                                }
                                alt={loginType === 'clinic' ? 'Dental Modern' : 'Lab Robotics'}
                                className="w-full h-full object-contain animate-float"
                                style={{ 
                                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                                    WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                                }}
                            />
                        </motion.div>
                    </AnimatePresence>
                     
                     {/* Ambient Glow */}
                     <motion.div 
                        className={`absolute inset-0 rounded-full blur-[100px] opacity-40 -z-10`}
                        animate={{ backgroundColor: loginType === 'clinic' ? '#1e40af' : '#c2410c' }} // Darker blue/orange
                        transition={{ duration: 1.5 }}
                     />
                </div>

                <div className="relative z-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={loginType}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center"
                        >
                            <h2 className="text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                                {loginType === 'clinic' ? 'Gestión Clínica' : 'Lab Automation'}
                            </h2>
                            
                            <p className="text-blue-100/80 text-lg max-w-md font-light leading-relaxed">
                                {loginType === 'clinic' 
                                    ? 'Visualización holográfica de pacientes e historias clínicas.' 
                                    : 'Control robótico de fresado y producción inteligente.'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Decorative Planet */}
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
        </div>
    </div>
  )
}
