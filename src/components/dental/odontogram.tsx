'use client'

import { useState } from 'react'
import { saveOdontogram } from '@/app/dashboard/medical/patients/[id]/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save } from 'lucide-react'

// Simplified Tooth Model
// Quadrants: 1 (Top Right), 2 (Top Left), 3 (Bottom Left), 4 (Bottom Right)
// Standard ISO 3950 notation
const TEETH = [
  // Top Jaw (Right to Left) -> Quadrants 1 & 2
  [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  // Bottom Jaw (Right to Left) -> Quadrants 4 & 3
  [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
]

type Condition = 'healthy' | 'caries' | 'filled' | 'missing' | 'crown'

const CONDITION_COLORS = {
  healthy: 'fill-white stroke-gray-300',
  caries: 'fill-red-400 stroke-red-600',
  filled: 'fill-blue-400 stroke-blue-600',
  missing: 'fill-gray-100 stroke-gray-300 opacity-20',
  crown: 'fill-yellow-300 stroke-yellow-500'
}

export default function Odontogram({ patientId, initialState }: { patientId: string, initialState: any }) {
  const [teeth, setTeeth] = useState<Record<string, { condition: Condition }>>(initialState || {})
  const [selectedTool, setSelectedTool] = useState<Condition>('caries')
  const [saving, setSaving] = useState(false)

  // Toggle Function
  const handleToothClick = (id: number) => {
    const strId = id.toString()
    const current = teeth[strId]?.condition || 'healthy'
    
    // If tool matches current, remove it (set to healthy). Else apply tool.
    const newCondition = current === selectedTool ? 'healthy' : selectedTool
    
    setTeeth(prev => ({
      ...prev,
      [strId]: { condition: newCondition }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    await saveOdontogram(patientId, teeth)
    setSaving(false)
  }

  // Render a Single Tooth SVG
  const Tooth = ({ id }: { id: number }) => {
    const state = teeth[id.toString()]
    const condition = state?.condition || 'healthy'
    const styleClass = CONDITION_COLORS[condition]

    return (
      <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => handleToothClick(id)}>
        <svg width="40" height="50" viewBox="0 0 40 50" className={`transition-colors ${styleClass} hover:opacity-80`}>
           {/* Simplified Molar Shape */}
           <path 
             strokeWidth="2"
             d="M5,15 Q5,5 20,5 Q35,5 35,15 L35,35 Q35,45 20,45 Q5,45 5,35 Z" 
           />
           {/* Root lines hint */}
           <path d="M12,45 L12,50" strokeWidth="2" className="stroke-gray-300" />
           <path d="M28,45 L28,50" strokeWidth="2" className="stroke-gray-300" />
        </svg>
        <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">{id}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* TOOLBAR */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <span className="text-sm font-medium text-gray-500 uppercase">Tools:</span>
        {(Object.keys(CONDITION_COLORS) as Condition[]).map(tool => (
            <Button 
                key={tool}
                variant={selectedTool === tool ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTool(tool)}
                className="capitalize"
            >
                {tool}
            </Button>
        ))}
        
        <div className="flex-1"></div>
        
        <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
        </Button>
      </div>

      {/* ODONTOGRAM GRID */}
      <div className="bg-white p-8 rounded-xl shadow-sm border flex flex-col items-center gap-12 overflow-x-auto">
        {/* Upper Jaw */}
        <div className="flex gap-2">
            {TEETH[0].slice(0, 8).map(id => <Tooth key={id} id={id} />)} {/* Quad 1 */}
            <div className="w-8 border-l border-dashed border-gray-300 mx-2"></div> {/* Separator */}
            {TEETH[0].slice(8).map(id => <Tooth key={id} id={id} />)} {/* Quad 2 */}
        </div>

        {/* Lower Jaw */}
        <div className="flex gap-2">
            {TEETH[1].slice(0, 8).map(id => <Tooth key={id} id={id} />)} {/* Quad 4 */}
            <div className="w-8 border-l border-dashed border-gray-300 mx-2"></div> {/* Separator */}
            {TEETH[1].slice(8).map(id => <Tooth key={id} id={id} />)} {/* Quad 3 */}
        </div>
      </div>
    </div>
  )
}
