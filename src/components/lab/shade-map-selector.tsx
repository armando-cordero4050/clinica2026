'use client';

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';

interface ShadeMapSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

type Zone = 'gingival' | 'body' | 'incisal';

const SHADES = [
    'A1', 'A2', 'A3', 'A3.5', 'A4',
    'B1', 'B2', 'B3', 'B4',
    'C1', 'C2', 'C3', 'C4',
    'D2', 'D3', 'D4',
    'BL1', 'BL2', 'BL3', 'BL4'
];

export function ShadeMapSelector({ value = '', onChange, className }: ShadeMapSelectorProps) {
    const [shades, setShades] = useState({
        gingival: '',
        body: '',
        incisal: ''
    });

    const [open, setOpen] = useState(false);
    const [activeZone, setActiveZone] = useState<Zone | null>(null);

    // Parse initial value
    useEffect(() => {
        if (!value) return;

        // Try to parse structured string "G:A3 | M:A2 | I:A1"
        const parts = value.split('|').map(p => p.trim());
        const newShades = { gingival: '', body: '', incisal: '' };
        let isStructured = false;

        parts.forEach(part => {
            if (part.startsWith('G:')) { newShades.gingival = part.replace('G:', '').trim(); isStructured = true; }
            else if (part.startsWith('M:')) { newShades.body = part.replace('M:', '').trim(); isStructured = true; }
            else if (part.startsWith('I:')) { newShades.incisal = part.replace('I:', '').trim(); isStructured = true; }
        });

        if (!isStructured && value.length > 0 && value.length < 5) {
            // Assume simple value is Body
            newShades.body = value;
        }

        setShades(prev => {
            if (prev.gingival === newShades.gingival && prev.body === newShades.body && prev.incisal === newShades.incisal) return prev;
            return newShades;
        });
    }, [value]);

    const handleShadeSelect = (shade: string) => {
        if (!activeZone) return;

        const updated = { ...shades, [activeZone]: shade };
        setShades(updated);
        
        // Construct string
        const parts = [];
        if (updated.gingival) parts.push(`G:${updated.gingival}`);
        if (updated.body) parts.push(`M:${updated.body}`);
        if (updated.incisal) parts.push(`I:${updated.incisal}`);
        
        // If only body is set, use simple format? No, stick to consistent format if possible, 
        // OR fallback to simple if only body. Let's stick to simple if ONLY body to keep DB clean for simple cases.
        if (!updated.gingival && !updated.incisal && updated.body) {
            onChange(updated.body);
        } else {
            onChange(parts.join(' | '));
        }
        
        setOpen(false);
        setActiveZone(null);
    };

    const openForZone = (zone: Zone) => {
        setActiveZone(zone);
        setOpen(true);
    };

    // Color helpers for visual feedback in SVG
    const getFill = (zone: Zone) => {
        const s = shades[zone];
        if (!s) return '#f4f4f5'; // zinc-100
        // Pseudo logic for color visualization could go here
        return '#e4e4e7'; // zinc-200 (darker to show selection)
    };
    
    const getStroke = (zone: Zone) => {
        return activeZone === zone ? '#3b82f6' : '#d4d4d8'; // blue-500 : zinc-300
    };

    return (
        <div className={cn("flex items-start gap-4 p-2 border rounded-md bg-white", className)}>
            
            {/* Interactive Tooth Map */}
            <div className="relative w-12 h-16 shrink-0 cursor-pointer">
                <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-sm">
                    {/* Gingival (Cervical) - Top third */}
                    <path
                        d="M20,10 Q50,0 80,10 L85,45 Q50,55 15,45 Z"
                        fill={getFill('gingival')}
                        stroke={getStroke('gingival')}
                        strokeWidth="2"
                        onClick={() => openForZone('gingival')}
                        className="hover:fill-blue-50 transition-colors"
                    />
                    
                    {/* Body (Middle) */}
                    <path
                        d="M15,45 Q50,55 85,45 L90,100 Q50,110 10,100 Z"
                        fill={getFill('body')}
                        stroke={getStroke('body')}
                        strokeWidth="2"
                        onClick={() => openForZone('body')}
                        className="hover:fill-blue-50 transition-colors"
                    />

                    {/* Incisal (Edge) - Bottom */}
                    <path
                        d="M10,100 Q50,110 90,100 L95,130 Q50,140 5,130 Z"
                        fill={getFill('incisal')}
                        stroke={getStroke('incisal')}
                        strokeWidth="2"
                        onClick={() => openForZone('incisal')}
                        className="hover:fill-blue-50 transition-colors"
                    />
                    
                </svg>
                
                {/* Labels overlay */}
                <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none text-[8px] font-bold text-center text-zinc-500">
                   <span className="mt-2">{shades.gingival || 'G'}</span>
                   <span className="mt-3">{shades.body || 'M'}</span>
                   <span className="mb-2">{shades.incisal || 'I'}</span>
                </div>
            </div>

            {/* Quick Actions / Legend */}
            <div className="flex-1 space-y-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                           {activeZone ? `Color: ${activeZone === 'body' ? 'Medio' : activeZone === 'gingival' ? 'Gingival' : 'Incisal'}` : 'Seleccionar Zona'}
                           <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                        <div className="grid grid-cols-5 gap-1">
                            {SHADES.map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleShadeSelect(s)}
                                    className={cn(
                                        "h-8 text-xs rounded-md hover:bg-zinc-100 border border-transparent",
                                        activeZone && shades[activeZone] === s && "bg-blue-50 border-blue-200 font-bold"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="text-xs space-y-1">
                    <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Gingival:</span>
                        <span className="font-medium">{shades.gingival || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Medio:</span>
                        <span className="font-medium">{shades.body || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Incisal:</span>
                        <span className="font-medium">{shades.incisal || '-'}</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
