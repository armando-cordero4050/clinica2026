'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, Circle, Loader2, Terminal, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProcessLog = {
  id: string
  message: string
  status: 'pending' | 'running' | 'success' | 'error'
  timestamp: string
}

interface ProcessMonitorProps {
  title?: string
  logs: ProcessLog[]
  isVisible: boolean
  className?: string
}

export function ProcessMonitor({ title = "Monitor de Procesos del Sistema", logs, isVisible, className }: ProcessMonitorProps) {
  if (!isVisible && logs.length === 0) return null

  return (
    <div className={cn("border rounded-xl bg-slate-950 text-slate-200 overflow-hidden shadow-2xl transition-all duration-300", className)}>
      {/* Header */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-emerald-500" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">{title}</span>
      </div>

      {/* Logs Area */}
      <ScrollArea className="h-[200px] w-full p-4 font-mono text-sm">
        <div className="space-y-3">
            {logs.length === 0 && (
                <div className="text-slate-600 italic text-xs">Esperando inicio de procesos...</div>
            )}
            
            {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="mt-0.5">
                {log.status === 'pending' && <Circle className="w-3 h-3 text-slate-700" />}
                {log.status === 'running' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                {log.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {log.status === 'error' && <XCircle className="w-3 h-3 text-rose-500" />}
                </div>
                
                <div className="flex-1">
                    <span className={cn(
                        "block leading-tight",
                        log.status === 'pending' && "text-slate-600",
                        log.status === 'running' && "text-blue-200",
                        log.status === 'success' && "text-emerald-200",
                        log.status === 'error' && "text-rose-300"
                    )}>
                        {log.message}
                    </span>
                    <span className="text-[10px] text-slate-600 block mt-0.5">{log.timestamp}</span>
                </div>
            </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  )
}
