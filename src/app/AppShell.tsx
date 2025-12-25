import { Outlet, Link } from 'react-router-dom';
import { Activity, Users, Calendar, TestTube2, LayoutDashboard } from "lucide-react";

export default function AppShell() {
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
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/patients" icon={<Users size={20} />} label="Pacientes" />
                    <NavItem to="/appointments" icon={<Calendar size={20} />} label="Agenda" />
                    <NavItem to="/lab-orders" icon={<TestTube2 size={20} />} label="Laboratorio" />
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity size={16} />
                        <span>v0.1.0 (Alpha)</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 border-b bg-card flex items-center px-6 justify-between">
                    <div className="font-medium text-muted-foreground">
                        Clínica Demo
                    </div>
                    <div className="flex items-center gap-4">
                        {/* CommandPalette Placeholder */}
                        <div className="h-9 w-64 bg-muted/50 rounded-md border flex items-center px-3 text-sm text-muted-foreground">
                            Buscar... (CMD+K)
                        </div>
                        {/* User Menu Placeholder */}
                        <div className="h-8 w-8 rounded-full bg-primary/10"></div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-muted/10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
