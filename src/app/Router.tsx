import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';

export function Router() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<div className="p-8">Dashboard Placeholder</div>} />
                <Route path="/patients" element={<div className="p-8">Patients Module</div>} />
                <Route path="/appointments" element={<div className="p-8">Appointments Module</div>} />
                <Route path="/lab-orders" element={<div className="p-8">Lab Orders Module</div>} />
                {/* Add more routes as modules are developed */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
