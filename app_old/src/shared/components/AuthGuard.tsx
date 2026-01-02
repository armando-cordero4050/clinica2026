import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/shared/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { session, loading, clinicId } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!session) {
                navigate('/login');
            } else if (clinicId === undefined) {
                // Should not happen if AuthProvider handles it, but safety check
            }
        }
    }, [session, loading, clinicId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
