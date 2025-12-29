import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/app/AppShell';
import { AuthProvider } from '@/shared/lib/auth';
import { Toaster } from 'sonner';
import { AuthGuard } from '@/shared/components/AuthGuard';

// Pages
import LoginPage from '@/app/login/page';
import PatientsPage from '@/app/dashboard/patients/page';
import KanbanPage from '@/app/dashboard/lab/kanban/page';
import NewOrderPage from '@/app/dashboard/lab/orders/new/page';
import AppointmentsPage from '@/app/dashboard/appointments/page';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        
                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <AuthGuard>
                                <AppShell />
                            </AuthGuard>
                        }>
                            <Route index element={<Navigate to="patients" replace />} />
                            <Route path="patients" element={<PatientsPage />} />
                            
                            {/* Lab Module */}
                            <Route path="lab/kanban" element={<KanbanPage />} />
                            <Route path="lab/orders/new" element={<NewOrderPage />} />

                            {/* Appointments Module */}
                            <Route path="appointments" element={<AppointmentsPage />} />
                        </Route>

                        {/* Root Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                    <Toaster />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
