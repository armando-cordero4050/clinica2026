'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { KanbanCard, updateCardStatus, toggleTimerAction } from '../actions'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Truck, Play, Pause, Clock } from 'lucide-react'

// Kanban Columns Configuration
const COLUMNS = {
  new: { title: 'New', color: 'bg-gray-100' },
  design: { title: 'Design', color: 'bg-blue-50' },
  milling: { title: 'Milling', color: 'bg-indigo-50' },
  ceramic: { title: 'Ceramic', color: 'bg-purple-50' },
  qc: { title: 'QC Check', color: 'bg-orange-50' },
  ready: { title: 'Ready', color: 'bg-green-50' }
}

// Timer Component
function CardTimer({ card }: { card: KanbanCard }) {
  const [elapsed, setElapsed] = useState(card.timers?.total_seconds || 0)
  const isRunning = card.timers?.is_running
  const [loading, setLoading] = useState(false)

  // Sync elapsed time logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning) {
      // Important: Calculate exact elapsed based on last_start diff, not just incrementing
      // But for simple display, incrementing is visually okay if refreshed often
      
      const startTime = new Date(card.timers.last_start!).getTime()
      
      interval = setInterval(() => {
        const now = new Date().getTime()
        const currentSessionSeconds = Math.floor((now - startTime) / 1000)
        setElapsed((card.timers.total_seconds || 0) + currentSessionSeconds)
      }, 1000)
    } else {
      setElapsed(card.timers?.total_seconds || 0)
    }

    return () => clearInterval(interval)
  }, [isRunning, card.timers])

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click/drag issues
    setLoading(true)
    try {
      await toggleTimerAction(card.id)
    } catch (err) {
      alert('Error toggling timer')
    } finally {
      setLoading(false)
    }
  }

  // Format HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div className="flex items-center gap-2 text-xs bg-white/80 p-1 rounded border border-gray-100 mt-2">
      <Button 
        size="icon" 
        variant={isRunning ? "destructive" : "outline"} 
        className="h-6 w-6" 
        onClick={handleToggle}
        disabled={loading}
      >
        {loading ? <Clock className="h-3 w-3 animate-spin"/> : (isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />)}
      </Button>
      <span className={`font-mono font-medium ${isRunning ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
        {formatTime(elapsed)}
      </span>
      {isRunning && <span className="text-[10px] text-green-600 font-bold ml-auto">ACTIVE</span>}
    </div>
  )
}

export default function KanbanBoard({ initialCards }: { initialCards: KanbanCard[] }) {
  const [cards, setCards] = useState(initialCards)

  // Sync state if server revalidates (important for timers)
  useEffect(() => {
    setCards(initialCards)
  }, [initialCards])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const newStatus = destination.droppableId
    const updatedCards = cards.map(card => 
      card.id === draggableId ? { ...card, status: newStatus } : card
    )
    setCards(updatedCards) // Optimistic

    try {
      await updateCardStatus(draggableId, newStatus)
    } catch (error) {
      console.error('Failed to update status', error)
      setCards(initialCards) // Rollback
    }
  }

  const getCardsByStatus = (status: string) => cards.filter(c => c.status === status)

  return (
    <div className="h-full overflow-x-auto pb-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 min-w-[1200px] h-full">
          {Object.entries(COLUMNS).map(([status, config]) => (
            <div key={status} className={`w-80 flex-shrink-0 flex flex-col rounded-lg p-2 ${config.color}`}>
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-semibold text-gray-700">{config.title}</h3>
                <Badge variant="secondary" className="bg-white">
                  {getCardsByStatus(status).length}
                </Badge>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 min-h-[100px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                    }`}
                  >
                    {getCardsByStatus(status).map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-l-4 ${
                                card.priority === 'urgent' ? 'border-l-red-500' : 'border-l-blue-400'
                            } ${
                                snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-400 opacity-90' : ''
                            }`}
                          >
                            <CardHeader className="p-3 pb-1">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-sm text-gray-900 truncate">
                                  {card.product_name || 'Trabajo Dental'}
                                </span>
                                {card.priority === 'urgent' && (
                                  <Badge variant="destructive" className="text-[10px] h-4 px-1 uppercase animate-pulse">Urgente</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 text-xs text-gray-600 space-y-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 font-medium text-gray-800">
                                        <Truck className="w-3 h-3 text-blue-500" />
                                        <span>{card.clinic_name || 'Clínica Asociada'}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 italic">
                                        <User className="w-3 h-3" />
                                        <span>Paciente: {card.patient_summary}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-1 border-y border-gray-50 bg-gray-50/50 px-1 rounded">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(card.due_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="font-bold text-blue-700">
                                        {card.currency} {card.total_price?.toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px]">
                                        <div className={`w-2 h-2 rounded-full ${
                                            card.odoo_status === 'synced' ? 'bg-green-500' : 
                                            card.odoo_status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`} />
                                        <span className="uppercase">{card.odoo_status === 'synced' ? 'Odoo OK' : 'Odoo Sync'}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">#{card.id.slice(0, 6)}</span>
                                </div>
                                
                                {/* TIMER */}
                                <CardTimer card={card} />
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
