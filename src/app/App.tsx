import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from '@/app/AppShell';
import { AuthProvider } from '@/shared/lib/auth';
import { Toaster } from 'sonner';

// Placeholder Pages
const Dashboard = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Dashboard</h1><p className="text-muted-foreground">Bienvenido a DentalFlow.</p></div>;
const Calendar = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Calendario</h1></div>;
const Patients = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Pacientes</h1></div>;
const Lab = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Laboratorio</h1></div>;
const Settings = () => <div className="p-4"><h1 className="text-2xl font-bold mb-4">Configuración</h1></div>;

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route element={<AppShell />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/patients" element={<Patients />} />
                            <Route path="/lab" element={<Lab />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                    <Toaster />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
