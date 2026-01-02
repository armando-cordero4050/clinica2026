'use client';

import { KanbanBoard } from '@/modules/lab/components/KanbanBoard';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom'; // Wait, this is Next.js app or Vite? It's Vite but using file-system routing simulation? 
// Actually, earlier I used `react-router-dom` in `page.tsx` for `useNavigate`.
// But the folder structure `src/app/...` suggests Next.js App Router structure which I'm emulating or using?
// The bootstrap PR said "React 18 + Vite". So there is NO Next.js.
// So `src/app` is just a convention I'm using, but I need a Router.
// I haven't set up the Router (React Router) main configuration yet!
// The user said "Bootstrap project structure only... Setup routing placeholders".
// I need to verify `src/App.tsx` or `src/main.tsx` to see how routing is handled.
// If I assume `src/app` maps to routes, I need to manually map them if I'm using Vite.
// For now, I will create the component.
// I will use `Link` from `react-router-dom`.

export default function KanbanPage() {
  return (
    <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Tablero de Laboratorio</h1>
            <Link to="/dashboard/lab/orders/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Orden
                </Button>
            </Link>
        </div>
        <div className="flex-1">
            <KanbanBoard />
        </div>
    </div>
  );
}
