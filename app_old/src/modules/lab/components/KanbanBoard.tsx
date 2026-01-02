import { useState, useEffect } from 'react';
import { useSession } from '@/shared/lib/auth';
import { ordersApi } from '../api/orders.api';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge'; // Need Badge
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { format } from 'date-fns';

const COLUMNS = [
    { id: 'submitted', title: 'Enviado' },
    { id: 'received', title: 'Recibido' },
    { id: 'in_progress', title: 'En Proceso' },
    { id: 'completed', title: 'Completado' },
    { id: 'delivered', title: 'Entregado' }
];

export function KanbanBoard() {
    const { clinicId } = useSession();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, [clinicId]);

    const loadOrders = async () => {
        try {
            const data = await ordersApi.getOrders(clinicId || '');
            setOrders(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        try {
            await ordersApi.updateStatus(orderId, newStatus);
        } catch (error) {
            console.error(error);
            loadOrders(); // Revert on error
        }
    };

    return (
        <div className="flex h-full gap-4 overflow-x-auto p-4 pb-8 bg-gray-50 min-h-[calc(100vh-100px)]">
            {COLUMNS.map(col => {
                const colOrders = orders.filter(o => o.status === col.id);
                return (
                    <div key={col.id} className="min-w-[300px] bg-gray-100 rounded-lg p-3 flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700">{col.title}</h3>
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{colOrders.length}</span>
                        </div>
                        
                        <div className="flex flex-col gap-2 overflow-y-auto">
                            {colOrders.map(order => (
                                <Card key={order.id} className="p-3 shadow-sm hover:shadow-md transition-shadow bg-white">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant={order.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                                            {order.priority}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">#{order.order_number}</span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="font-medium text-sm">{order.patient?.first_name} {order.patient?.last_name}</div>
                                        <div className="text-xs text-gray-500">Dr. {order.doctor?.full_name}</div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-500 mb-3">
                                        Entrega: {order.delivery_due_date ? format(new Date(order.delivery_due_date), 'dd/MM/yyyy') : '-'}
                                    </div>

                                    {/* Action Move */}
                                    <Select onValueChange={(val) => handleStatusChange(order.id, val)} value={order.status}>
                                        <SelectTrigger className="h-7 text-xs">
                                            <SelectValue placeholder="Mover..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COLUMNS.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
