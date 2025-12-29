import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, Users, TestTube2, LogOut, PlusCircle } from "lucide-react";
import { useSession } from '@/shared/lib/auth';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils'; // correctly import cn

export default function AppShell() {
    const { user, userRole } = useSession(); // Access user role for conditional rendering later

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-card hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        DentalFlow
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {/* Common Links */}
                    <DropdownSection title="Clínica">
                        <NavItem to="/dashboard/patients" icon={<Users size={20} />} label="Pacientes" />
                    </DropdownSection>

                    <DropdownSection title="Laboratorio">
                        <NavItem to="/dashboard/lab/kanban" icon={<TestTube2 size={20} />} label="Tablero (Kanban)" />
                        <NavItem to="/dashboard/lab/orders/new" icon={<PlusCircle size={20} />} label="Nueva Orden" />
                    </DropdownSection>
                    
                </nav>
                <div className="p-4 border-t space-y-4">
                     <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.email}</p>
                            <p className="text-xs text-muted-foreground truncate capitalize">{userRole || 'Usuario'}</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" />
                        Cerrar Sesión
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-2 pt-2 border-t">
                        <Activity size={14} />
                        <span>v4.0 (Beta)</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header (Hidden on desktop for now, but good to have rudimentary structure) */}
                <header className="md:hidden h-16 border-b bg-card flex items-center px-6 justify-between">
                     <span className="font-bold">DentalFlow</span>
                     <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut size={16}/></Button>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-muted/10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function DropdownSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">{title}</h3>
            {children}
        </div>
    )
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);

    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
