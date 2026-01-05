'use client';

import { useState, useEffect, useRef } from 'react';
import { Minimize2, Trash2, Bug, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogEntry {
    id: string;
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    data?: any;
    timestamp: string;
}

export function DebugOverlay() {
    // Force visible always (removed setIsVisible for 'close')
    const [isMinimized, setIsMinimized] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const logsEndingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Intercept console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const addLog = (type: LogEntry['type'], args: any[]) => {
            const message = args.map(a => 
                typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
            ).join(' ');

            const newLog: LogEntry = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                message,
                timestamp: new Date().toLocaleTimeString(),
            };

            setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100
        };

        console.log = (...args) => {
            addLog('log', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            addLog('error', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            addLog('warn', args);
            originalWarn.apply(console, args);
        };

        // Catch global errors
        const handleError = (event: ErrorEvent) => {
            addLog('error', [event.message]);
        };
        window.addEventListener('error', handleError);

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
            window.removeEventListener('error', handleError);
        };
    }, []);

    useEffect(() => {
        logsEndingRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, isMinimized]);

    const handleCopy = () => {
        const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
        navigator.clipboard.writeText(text);
        toast.success('Logs copiados al portapapeles');
    }

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-[9999]">
                <Button 
                    onClick={() => setIsMinimized(false)}
                    variant="destructive"
                    className="shadow-xl rounded-full w-12 h-12 p-0 animate-pulse border-2 border-white"
                    title="Abrir Debugger"
                >
                    <Bug className="h-6 w-6" />
                    {logs.filter(l => l.type === 'error').length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white">
                            {logs.filter(l => l.type === 'error').length}
                        </span>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-[600px] h-[400px] bg-black/95 text-green-400 font-mono text-xs rounded-lg shadow-2xl z-[9999] flex flex-col border border-green-900 overflow-hidden backdrop-blur-md">
            {/* Header */}
            <div className="flex items-center justify-between p-2 bg-green-900/20 border-b border-green-900 select-none">
                <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    <span className="font-bold">SYSTEM DEBUGGER</span>
                    <span className="text-[10px] opacity-50 ml-2">v1.2</span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-900/50 text-green-400" onClick={handleCopy} title="Copiar Logs">
                        <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-900/50 text-green-400" onClick={() => setLogs([])} title="Limpiar">
                        <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-green-900/50 text-green-400" onClick={() => setIsMinimized(true)} title="Minimizar">
                        <Minimize2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-green-900 italic opacity-50">
                        <Bug className="h-8 w-8 mb-2 opacity-20" />
                        <span>Esperando eventos del sistema...</span>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className={`break-words border-l-2 pl-2 ${log.type === 'error' ? 'text-red-400 bg-red-900/10 border-red-500' : log.type === 'warn' ? 'text-yellow-400 border-yellow-500' : 'border-transparent hover:bg-white/5'}`}>
                        <span className="opacity-30 select-none">[{log.timestamp}]</span>{' '}
                        <span className={`font-bold ${log.type === 'error' ? 'text-red-500' : 'text-blue-400'}`}>[{log.type.toUpperCase()}]</span>:{' '}
                        <span className="whitespace-pre-wrap select-text">{log.message}</span>
                    </div>
                ))}
                <div ref={logsEndingRef} />
            </div>
        </div>
    );
}
