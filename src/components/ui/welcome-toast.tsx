'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2, User, Moon, Sun, Monitor, Heart, Hexagon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WelcomeStyle = 'nano' | 'glass' | 'minimal'
export type WelcomeVariant = 'original' | 'sunset' | 'ocean' | 'midnight' | 'frost' | 'dark' | 'acrylic' | 'tinted' | 'simple' | 'border' | 'accent' | 'banana'

interface WelcomeToastProps {
  isVisible: boolean
  style: WelcomeStyle
  variant?: WelcomeVariant
  title?: string
  subtitle?: string
  userName?: string
  onClose?: () => void
}

// --- ANIMATED DENTAL ICON ---
const AnimatedTooth = ({ className, color = "currentColor" }: { className?: string, color?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M7 3C4.5 3 2.5 5 2.5 7.5c0 2 1.5 3.5 1.5 6 0 2.5-2 6-1 8 .5 1 1.5 1.5 3 1.5s2.5-1.5 3.5-3c1 1.5 2 3 3.5 3s2.5-.5 3-1.5c1-2-1-5.5-1-8 0-2.5 1.5-4 1.5-6C19.5 5 17.5 3 15 3c-1.5 0-2.5 1-3 2-.5-1-1.5-2-3-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    <motion.path
      d="M8 8l2 2m4-2l-2 2" // Smile / Cross detail
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    />
  </svg>
)

// --- SPARKLE PARTICLE ---
const SparkleParticle = ({ delay = 0, x = 0, y = 0, color = "bg-white" }: { delay?: number, x?: number, y?: number, color?: string }) => (
   <motion.div
     className={cn("absolute rounded-full w-1 h-1", color)}
     style={{ left: x, top: y }}
     initial={{ scale: 0, opacity: 0 }}
     animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
     transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3, delay: delay }}
   />
)

export function WelcomeToast({ 
  isVisible, 
  style = 'nano', 
  variant = 'original',
  title = 'Bienvenido', 
  subtitle = 'Sistema DentalFlow',
  userName,
  onClose 
}: WelcomeToastProps) {

  // --- STYLES CONFIG ---
  const getNanoStyles = (v: string) => {
    switch(v) {
      case 'banana': return {
        bg: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500', 
        border: 'border-yellow-200/50',
        iconBg: 'bg-white/30',
        iconColor: '#854d0e', // amber-900
        textColor: 'text-amber-950',
        highlight: 'text-white font-black',
        particles: 'bg-yellow-100'
      }
      case 'sunset': return {
        bg: 'bg-gradient-to-r from-orange-500/90 via-rose-500/90 to-amber-500/90',
        border: 'border-orange-200/20',
        iconBg: 'bg-white/20',
        iconColor: '#fff',
        textColor: 'text-white',
        highlight: 'text-amber-200',
        particles: 'bg-yellow-200'
      }
      case 'ocean': return {
        bg: 'bg-gradient-to-r from-cyan-500/90 via-blue-600/90 to-indigo-500/90',
        border: 'border-cyan-200/20',
        iconBg: 'bg-white/20',
        iconColor: '#fff',
        textColor: 'text-white',
        highlight: 'text-cyan-200',
        particles: 'bg-cyan-200'
      }
      case 'midnight': return {
        bg: 'bg-slate-950',
        border: 'border-indigo-500',
        iconBg: 'bg-indigo-600',
        iconColor: '#fff',
        textColor: 'text-white',
        highlight: 'text-indigo-400',
        particles: 'bg-indigo-400'
      }
      default: return { // Original
        bg: 'bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-fuchsia-600/95',
        border: 'border-white/10',
        iconBg: 'bg-white/20',
        iconColor: '#fff',
        textColor: 'text-white',
        highlight: 'text-purple-200',
        particles: 'bg-purple-200'
      }
    }
  }

  const getGlassStyles = (v: string) => { 
     return { container: 'backdrop-blur-xl bg-white/70 shadow-2xl', icon: 'text-blue-600' }
  }

  const nano = getNanoStyles(variant || 'original')

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
          
          {/* NANO STYLE (High Impact) */}
          {style === 'nano' && (
            <motion.div
              layoutId="welcome-toast"
              initial={{ y: -120, scale: 0.5, rotateX: 45 }}
              animate={{ y: 0, scale: 1, rotateX: 0 }}
              exit={{ y: -80, scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
              className={cn(
                  "pointer-events-auto relative overflow-hidden rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] p-1.5 pr-8 flex items-center gap-4 min-w-[340px]",
                  nano.bg, nano.border, "border"
              )}
            >
              {/* Particles */}
              <SparkleParticle x={20} y={10} delay={0.2} color={nano.particles} />
              <SparkleParticle x={300} y={40} delay={0.5} color={nano.particles} />
              <SparkleParticle x={160} y={5} delay={1.2} color={nano.particles} />

              <motion.div 
                className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden", nano.iconBg)}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                  {/* Rotating Shine Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <AnimatedTooth className="h-6 w-6 relative z-10" color={nano.iconColor} />
              </motion.div>

              <div className="relative z-10 flex flex-col text-left">
                 <motion.span 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={cn("text-base font-bold leading-none mb-1", nano.textColor)}
                 >
                    {title} {userName && <span className={nano.highlight}>{userName}</span>}
                 </motion.span>
                 <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={cn("text-xs opacity-80 font-medium", nano.textColor)}
                 >
                    {subtitle}
                 </motion.span>
              </div>
            </motion.div>
          )}

          {/* GLASS STYLE (Modern) */}
          {style === 'glass' && (
             <motion.div
             initial={{ opacity: 0, y: 30, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
             className={cn(
                 "pointer-events-auto backdrop-blur-3xl bg-white/60 border border-white/50 shadow-2xl rounded-2xl p-4 flex items-center gap-5 min-w-[320px]",
                 variant === 'dark' ? 'bg-slate-900/60 border-slate-700 text-white' : 'text-slate-800'
             )}
           >
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 relative bg-gradient-to-br", variant === 'dark' ? 'from-slate-800 to-slate-900 border border-slate-700' : 'from-white to-blue-50 border border-white')}>
                    <Hexagon className={cn("h-6 w-6", variant === 'dark' ? 'text-blue-400' : 'text-blue-600')} strokeWidth={1.5} />
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                        className="absolute -bottom-1 -right-1 bg-green-500 h-3 w-3 rounded-full border-2 border-white" 
                    />
                </div>
             </div>
             
             <div className="flex flex-col text-left">
                <span className="text-sm font-bold tracking-tight">
                   {title}
                </span>
                <span className="text-xs opacity-60">
                   {subtitle} • {userName}
                </span>
             </div>
           </motion.div>
          )}

          {/* MINIMAL STYLE (Corporate) */}
          {style === 'minimal' && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={cn(
                  "pointer-events-auto bg-white shadow-xl border-l-4 border-l-emerald-500 rounded-r-lg px-6 py-4 flex items-center gap-4 min-w-[300px]",
                  variant === 'dark' ? 'bg-slate-900 border-l-emerald-400 text-white' : 'text-slate-900'
              )}
            >
               <AnimatedTooth className={cn("h-5 w-5", variant === 'dark' ? 'text-emerald-400' : 'text-emerald-600')} color="currentColor" />
               <div className="flex flex-col text-left">
                  <span className="text-sm font-bold">
                      {title} {userName}
                  </span>
               </div>
            </motion.div>
          )}

        </div>
      )}
    </AnimatePresence>
  )
}
